import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { fileURLToPath } from 'url';
import { parseFilename } from './logic/parser.js';
import { generateNewPath } from './logic/exporter.js';
import { initializeClient, testConnection, uploadFileToNextcloud } from './logic/nextcloud.js';
import { initializeRealDebrid, testRealDebridConnection } from './logic/realdebrid.js';
import { encryptString, decryptString, isEncryptionAvailable } from './logic/secureStorage.js';
import type { Settings, StoredSettings, FileMetadata, ExportResult } from './types/index.js';

// Workaround for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Store with specific types if needed, or cast later
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
        _encrypted: true
    };

    // Encrypt password
    if (settings.password) {
        stored.password_encrypted = encryptString(settings.password);
    }

    // Encrypt Real-Debrid API key
    if (settings.realDebridApiKey) {
        stored.realDebridApiKey_encrypted = encryptString(settings.realDebridApiKey);
    }

    // Keep deprecated field if it exists
    if (settings.targetFolder) {
        stored.targetFolder = settings.targetFolder;
    }

    return stored;
}

/**
 * Converts StoredSettings to plain Settings by decrypting sensitive fields.
 * Handles migration from old unencrypted format.
 */
function decryptSettings(stored: StoredSettings): Settings {
    const settings: Settings = {
        url: stored.url || '',
        targetFolderTv: stored.targetFolderTv || '',
        targetFolderMovie: stored.targetFolderMovie || '',
        username: stored.username || '',
        password: '',
        connectionCheckInterval: stored.connectionCheckInterval
    };

    // Migration: If old unencrypted data exists, use it and re-encrypt on next save
    if (!stored._encrypted) {
        console.log('[SecureStorage] Migrating from unencrypted storage format');
        // Cast to any to access old plain-text fields
        const legacy = stored as any;
        settings.password = legacy.password || '';
        settings.realDebridApiKey = legacy.realDebridApiKey;
    } else {
        // Decrypt password
        if (stored.password_encrypted) {
            const decrypted = decryptString(stored.password_encrypted);
            settings.password = decrypted || '';
        }

        // Decrypt Real-Debrid API key
        if (stored.realDebridApiKey_encrypted) {
            const decrypted = decryptString(stored.realDebridApiKey_encrypted);
            settings.realDebridApiKey = decrypted || undefined;
        }
    }

    // Keep deprecated field if it exists
    if (stored.targetFolder) {
        settings.targetFolder = stored.targetFolder;
    }

    return settings;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            devTools: false
        }
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    // Auto-initialize Nextcloud if settings exist
    const stored = store.get('nextcloud') as StoredSettings | undefined;
    if (stored) {
        const settings = decryptSettings(stored);
        initializeClient(settings.url, settings.username, settings.password);
        // Initialize Real-Debrid if API key exists
        if (settings.realDebridApiKey) {
            initializeRealDebrid(settings.realDebridApiKey);
        }
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers

// Log handler
ipcMain.on('console-log', (event, msg) => {
    console.log(`[UI] ${msg}`);
});

// Settings Handlers
ipcMain.handle('get-settings', () => {
    const stored = store.get('nextcloud') as StoredSettings | undefined;
    if (!stored) {
        return {};
    }
    return decryptSettings(stored);
});

ipcMain.handle('save-settings', (event, settings: Settings) => {
    // Log encryption status on first save
    if (!store.has('nextcloud')) {
        console.log(`[SecureStorage] Encryption available: ${isEncryptionAvailable()}`);
    }

    // Encrypt sensitive fields before storing
    const storedSettings = encryptSettings(settings);
    store.set('nextcloud', storedSettings);

    // Initialize clients with decrypted credentials
    const success = initializeClient(settings.url, settings.username, settings.password);

    // Initialize Real-Debrid if API key is present
    if (settings.realDebridApiKey) {
        initializeRealDebrid(settings.realDebridApiKey);
    }

    return success;
});

ipcMain.handle('test-connection', async (event, settings?: Settings) => {
    try {
        if (settings) {
            await testConnection(settings.url, settings.username, settings.password);
        } else {
            await testConnection();
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('test-realdebrid-connection', async (event, apiKey?: string) => {
    return await testRealDebridConnection(apiKey);
});

// 1. Parse Files
ipcMain.handle('parse-files', async (event, filePaths: string[]) => {
    let settings: Settings | undefined;
    try {
        const stored = store.get('nextcloud') as StoredSettings | undefined;
        if (stored) {
            settings = decryptSettings(stored);
        }
    } catch (e) {
        console.error('[Main] Failed to read settings:', e);
    }

    console.log(`[Main] Parsing files. Target folders from settings:`);
    console.log(`[Main] TV Target: ${settings?.targetFolderTv || settings?.targetFolder}`);
    console.log(`[Main] Movie Target: ${settings?.targetFolderMovie || settings?.targetFolder}`);

    const results: FileMetadata[] = [];
    for (const filePath of filePaths) {
        try {
            const metadata = parseFilename(filePath);
            if (metadata) {
                let proposedPath = generateNewPath(metadata);

                // Prepend the remote base folder if set
                if (proposedPath) {
                    let targetBase = '';
                    if (metadata.type === 'tv') {
                        targetBase = settings?.targetFolderTv || settings?.targetFolder || '';
                    } else {
                        targetBase = settings?.targetFolderMovie || settings?.targetFolder || '';
                    }

                    if (targetBase) {
                        // Security: Sanitize base path to prevent traversal
                        const safeBase = targetBase.replace(/\.\./g, '');

                        // Ensure no double slashes
                        const base = safeBase.replace(/\/$/, '');
                        const rel = proposedPath.replace(/^\//, '');
                        proposedPath = `${base}/${rel}`;
                    }
                }

                results.push({
                    ...metadata,
                    proposed: proposedPath,
                    valid: true
                });
            } else {
                results.push({
                    // Create a dummy parse result for the error case
                    series: '',
                    ext: path.extname(filePath),
                    originalName: path.basename(filePath),
                    fullPath: filePath,
                    proposed: null,
                    valid: false,
                    error: "Could not parse metadata"
                });
            }
        } catch (error: any) {
            console.error(`[Main] Error parsing file ${filePath}:`, error);
            results.push({
                series: 'Error',
                ext: path.extname(filePath),
                originalName: path.basename(filePath),
                fullPath: filePath,
                proposed: null,
                valid: false,
                error: `System Error: ${error.message}`
            });
        }
    }
    return results;
});

// 2. Generate Path (Helper for Edit Mode)
ipcMain.handle('generate-path', (event, metadata: FileMetadata) => {
    const stored = store.get('nextcloud') as StoredSettings | undefined;
    const settings = stored ? decryptSettings(stored) : undefined;

    let proposedPath = generateNewPath(metadata);

    // Prepend the remote base folder if set
    if (proposedPath) {
        let targetBase = '';
        if (metadata.type === 'tv') {
            targetBase = settings?.targetFolderTv || settings?.targetFolder || '';
        } else {
            targetBase = settings?.targetFolderMovie || settings?.targetFolder || '';
        }

        if (targetBase) {
            // Security: Sanitize base path to prevent traversal
            const safeBase = targetBase.replace(/\.\./g, '');

            const base = safeBase.replace(/\/$/, '');
            const rel = proposedPath.replace(/^\//, '');
            proposedPath = `${base}/${rel}`;
        }
    }
    return proposedPath;
});

// 3. Export/Upload Files
ipcMain.handle('export-files', async (event, filesToExport: FileMetadata[]) => {
    const stored = store.get('nextcloud') as StoredSettings | undefined;
    const settings = stored ? decryptSettings(stored) : undefined;
    const results: ExportResult[] = [];

    console.log(`[Main] Exporting (Upload) ${filesToExport.length} files.`);

    for (let i = 0; i < filesToExport.length; i++) {
        const file = filesToExport[i];

        // Notify start
        mainWindow?.webContents.send('upload-progress', {
            index: i,
            percent: 0,
            status: 'Starting Upload...'
        });

        let result: ExportResult = { success: false };

        // RETRY LOGIC (Simple 1 retry)
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            result = await uploadFileToNextcloud(file.fullPath, file.proposed, (percent: number) => {
                mainWindow?.webContents.send('upload-progress', {
                    index: i,
                    percent: percent,
                    status: `Uploading (${percent}%)`
                });
            });

            if (result.success) break;
            attempts++;
            console.log(`[Upload Fail] Retry ${attempts}/${maxAttempts} for ${file.originalName}`);
        }

        results.push(result);

        // Notify done
        mainWindow?.webContents.send('upload-progress', {
            index: i,
            percent: 100,
            status: result.success ? 'Done' : 'Failed'
        });
    }
    return results;
});
