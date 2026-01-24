import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import Store from "electron-store";
import { fileURLToPath } from "url";
import { parseFilename } from "./logic/parser.js";
import { generateNewPath } from "./logic/exporter.js";
import {
  initializeClient,
  testConnection,
  uploadFileToNextcloud,
} from "./logic/nextcloud.js";
import {
  initializeRealDebrid,
  testRealDebridConnection,
} from "./logic/realdebrid.js";
import {
  encryptString,
  decryptString,
  isEncryptionAvailable,
} from "./logic/secureStorage.js";
import type {
  Settings,
  StoredSettings,
  FileMetadata,
  ParseResult,
  ExportResult,
} from "./types/index.js";

// Workaround for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Store with specific types if needed, or cast later
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Store() as any;
let mainWindow: BrowserWindow | null = null;

/**
 * Converts plain Settings to StoredSettings with encrypted sensitive fields
 */
function encryptSettings(settings: Settings): StoredSettings {
  const stored: StoredSettings = {
    url: settings.url,
    targetFolderTv: settings.targetFolderTv,
    targetFolderMovie: settings.targetFolderMovie,
    username: settings.username,
    connectionCheckInterval: settings.connectionCheckInterval,
    _encrypted: true,
  };

  // Encrypt password
  if (settings.password) {
    stored.password_encrypted = encryptString(settings.password);
  }

  // Encrypt Real-Debrid API key
  if (settings.realDebridApiKey) {
    stored.realDebridApiKey_encrypted = encryptString(
      settings.realDebridApiKey,
    );
  }

  // Keep deprecated field if it exists
  if (settings.targetFolder) {
    stored.targetFolder = settings.targetFolder;
  }

  return stored;
}

/**
 * Prepends the appropriate target folder base path to a proposed file path.
 * Uses guard clauses to avoid nested conditionals.
 *
 * @param metadata - Parse result containing type (tv/movie)
 * @param proposedPath - The generated path without base folder
 * @param settings - User settings containing target folders
 * @returns The full path with base folder prepended, or the original proposedPath if no base is set
 */
function prependTargetBasePath(
  metadata: ParseResult,
  proposedPath: string | null,
  settings: Settings | undefined,
): string | null {
  // Guard: No proposed path to modify
  if (!proposedPath) {
    return proposedPath;
  }

  // Determine target base folder based on media type
  const targetBase =
    metadata.type === "tv"
      ? settings?.targetFolderTv || settings?.targetFolder || ""
      : settings?.targetFolderMovie || settings?.targetFolder || "";

  // Guard: No target base configured
  if (!targetBase) {
    return proposedPath;
  }

  // Security: Sanitize base path to prevent traversal
  const safeBase = targetBase.replace(/\.\./g, "");

  // Ensure no double slashes
  const base = safeBase.replace(/\/$/, "");
  const rel = proposedPath.replace(/^\//, "");

  return `${base}/${rel}`;
}

/**
 * Converts StoredSettings to plain Settings by decrypting sensitive fields.
 * Handles migration from old unencrypted format.
 */
function decryptSettings(stored: StoredSettings): Settings {
  const settings: Settings = {
    url: stored.url || "",
    targetFolderTv: stored.targetFolderTv || "",
    targetFolderMovie: stored.targetFolderMovie || "",
    username: stored.username || "",
    password: "",
    connectionCheckInterval: stored.connectionCheckInterval,
  };

  // Keep deprecated field if it exists
  if (stored.targetFolder) {
    settings.targetFolder = stored.targetFolder;
  }

  // Migration: If old unencrypted data exists, use it and return early
  if (!stored._encrypted) {
    console.log("[SecureStorage] Migrating from unencrypted storage format");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacy = stored as any;
    settings.password = legacy.password || "";
    settings.realDebridApiKey = legacy.realDebridApiKey;
    return settings;
  }

  // Decrypt password if present
  if (stored.password_encrypted) {
    const decrypted = decryptString(stored.password_encrypted);
    settings.password = decrypted || "";
  }

  // Decrypt Real-Debrid API key if present
  if (stored.realDebridApiKey_encrypted) {
    const decrypted = decryptString(stored.realDebridApiKey_encrypted);
    settings.realDebridApiKey = decrypted || undefined;
  }

  return settings;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // Auto-initialize Nextcloud if settings exist
  const stored = store.get("nextcloud") as StoredSettings | undefined;
  if (stored) {
    const settings = decryptSettings(stored);
    initializeClient(settings.url, settings.username, settings.password);
    // Initialize Real-Debrid if API key exists
    if (settings.realDebridApiKey) {
      initializeRealDebrid(settings.realDebridApiKey);
    }
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers

// Log handler
ipcMain.on("console-log", (event, msg) => {
  console.log(`[UI] ${msg}`);
});

// Settings Handlers
ipcMain.handle("get-settings", () => {
  const stored = store.get("nextcloud") as StoredSettings | undefined;
  if (!stored) {
    return {};
  }
  return decryptSettings(stored);
});

ipcMain.handle("save-settings", (event, settings: Settings) => {
  // Log encryption status on first save
  if (!store.has("nextcloud")) {
    console.log(
      `[SecureStorage] Encryption available: ${isEncryptionAvailable()}`,
    );
  }

  // Encrypt sensitive fields before storing
  const storedSettings = encryptSettings(settings);
  store.set("nextcloud", storedSettings);

  // Initialize clients with decrypted credentials
  const success = initializeClient(
    settings.url,
    settings.username,
    settings.password,
  );

  // Initialize Real-Debrid if API key is present
  if (settings.realDebridApiKey) {
    initializeRealDebrid(settings.realDebridApiKey);
  }

  return success;
});

ipcMain.handle("test-connection", async (event, settings?: Settings) => {
  try {
    if (settings) {
      await testConnection(settings.url, settings.username, settings.password);
    } else {
      await testConnection();
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
});

ipcMain.handle("test-realdebrid-connection", async (event, apiKey?: string) => {
  return await testRealDebridConnection(apiKey);
});

// 1. Parse Files
ipcMain.handle("parse-files", async (event, filePaths: string[]) => {
  let settings: Settings | undefined;
  try {
    const stored = store.get("nextcloud") as StoredSettings | undefined;
    if (stored) {
      settings = decryptSettings(stored);
    }
  } catch (e) {
    console.error("[Main] Failed to read settings:", e);
  }

  console.log(`[Main] Parsing files. Target folders from settings:`);
  console.log(
    `[Main] TV Target: ${settings?.targetFolderTv || settings?.targetFolder}`,
  );
  console.log(
    `[Main] Movie Target: ${settings?.targetFolderMovie || settings?.targetFolder}`,
  );

  const results: FileMetadata[] = [];
  for (const filePath of filePaths) {
    try {
      const metadata = parseFilename(filePath);
      if (metadata) {
        const basePath = generateNewPath(metadata);
        const proposedPath = prependTargetBasePath(
          metadata,
          basePath,
          settings,
        );

        results.push({
          ...metadata,
          proposed: proposedPath,
          valid: true,
        });
      } else {
        results.push({
          // Create a dummy parse result for the error case
          series: "",
          ext: path.extname(filePath),
          originalName: path.basename(filePath),
          fullPath: filePath,
          proposed: null,
          valid: false,
          error: "Could not parse metadata",
        });
      }
    } catch (error) {
      console.error(`[Main] Error parsing file ${filePath}:`, error);
      const message = error instanceof Error ? error.message : "Unknown error";
      results.push({
        series: "Error",
        ext: path.extname(filePath),
        originalName: path.basename(filePath),
        fullPath: filePath,
        proposed: null,
        valid: false,
        error: `System Error: ${message}`,
      });
    }
  }
  return results;
});

// 2. Generate Path (Helper for Edit Mode)
ipcMain.handle("generate-path", (event, metadata: FileMetadata) => {
  const stored = store.get("nextcloud") as StoredSettings | undefined;
  const settings = stored ? decryptSettings(stored) : undefined;

  const basePath = generateNewPath(metadata);
  return prependTargetBasePath(metadata, basePath, settings);
});

// 3. Export/Upload Files
ipcMain.handle("export-files", async (event, filesToExport: FileMetadata[]) => {
  const stored = store.get("nextcloud") as StoredSettings | undefined;
  const _settings = stored ? decryptSettings(stored) : undefined;
  const results: ExportResult[] = [];

  console.log(`[Main] Exporting (Upload) ${filesToExport.length} files.`);

  for (let i = 0; i < filesToExport.length; i++) {
    const file = filesToExport[i];

    // Notify start
    mainWindow?.webContents.send("upload-progress", {
      index: i,
      percent: 0,
      status: "Starting Upload...",
    });

    let result: ExportResult = { success: false };

    // RETRY LOGIC (Simple 1 retry)
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      result = await uploadFileToNextcloud(
        file.fullPath,
        file.proposed,
        (percent: number) => {
          mainWindow?.webContents.send("upload-progress", {
            index: i,
            percent: percent,
            status: `Uploading (${percent}%)`,
          });
        },
      );

      if (result.success) break;
      attempts++;
      console.log(
        `[Upload Fail] Retry ${attempts}/${maxAttempts} for ${file.originalName}`,
      );
    }

    results.push(result);

    // Notify done
    mainWindow?.webContents.send("upload-progress", {
      index: i,
      percent: 100,
      status: result.success ? "Done" : "Failed",
    });
  }
  return results;
});
