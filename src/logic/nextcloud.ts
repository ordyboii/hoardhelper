import { createClient, WebDAVClient } from "webdav";
import fs from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { ExportResult } from "../types/index.js";

let client: WebDAVClient | null = null;

export function initializeClient(
  url?: string,
  username?: string,
  password?: string,
): boolean {
  if (!url || !username || !password) return false;

  // Security Check: Enforce HTTPS unless localhost
  try {
    const parsedUrl = new URL(url);
    const isLocal =
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1" ||
      parsedUrl.hostname.startsWith("192.168.") ||
      parsedUrl.hostname.startsWith("10.");

    if (parsedUrl.protocol !== "https:" && !isLocal) {
      console.warn(
        "[Security] Connection is not HTTPS! This is unsafe for remote transfers.",
      );
      // In a stricter mode, we might return false here.
      // For now, we warn but allow, assuming user might have a VPN/Tunnel.
    }
  } catch (_e) {
    console.error("[Security] Invalid URL provided");
    return false;
  }

  client = createClient(url, {
    username: username,
    password: password,
    maxBodyLength: 10 * 1024 * 1024 * 1024, // 10GB limit
    timeout: 30000, // 30 second timeout
  });
  return true;
}

export async function testConnection(
  url?: string,
  username?: string,
  password?: string,
): Promise<boolean> {
  let clientToTest = client;

  if (url && username && password) {
    clientToTest = createClient(url, {
      username: username,
      password: password,
      maxBodyLength: 10 * 1024 * 1024 * 1024,
      timeout: 30000, // 30 second timeout
    });
  }

  if (!clientToTest)
    throw new Error("Client not initialized and no credentials provided");

  // Try to list the root directory
  await clientToTest.getDirectoryContents("/");
  return true;
}

async function ensureRemoteDir(remotePath: string): Promise<void> {
  if (!client) throw new Error("Client not initialized");

  // Normalize path to forward slashes and remove leading/trailing slashes for splitting
  const parts = remotePath
    .replace(/\\/g, "/")
    .split("/")
    .filter((p) => p);

  console.log(`[Nextcloud] Ensuring directory exists: ${remotePath}`);

  let currentPath = "";
  for (const part of parts) {
    currentPath += "/" + part;
    if ((await client.exists(currentPath)) === false) {
      console.log(`[Nextcloud] Creating directory: ${currentPath}`);
      await client.createDirectory(currentPath);
    }
  }
}

export async function uploadFileToNextcloud(
  localPath: string,
  remoteDestination: string | null,
  onProgress?: (percent: number) => void,
): Promise<ExportResult> {
  if (!client) throw new Error("Client not initialized");
  if (!remoteDestination)
    return { success: false, error: "Invalid remote path" };

  // Ensure remoteDestination starts with /
  if (!remoteDestination.startsWith("/")) {
    remoteDestination = "/" + remoteDestination;
  }

  console.log(
    `[Nextcloud] Starting upload (Stream): ${localPath} -> ${remoteDestination}`,
  );

  try {
    await ensureRemoteDir(path.dirname(remoteDestination));

    const totalSize = (await stat(localPath)).size;
    console.log(`[Nextcloud] File size: ${totalSize}`);

    return new Promise((resolve, reject) => {
      if (!client) return reject({ success: false, error: "Client lost" });

      const remoteStream = client.createWriteStream(remoteDestination, {
        overwrite: false,
        headers: {
          "Content-Length": totalSize.toString(),
        },
      });
      const localStream = fs.createReadStream(localPath);

      let uploaded = 0;
      localStream.on("data", (chunk) => {
        uploaded += chunk.length;
        if (onProgress) {
          const percent = Math.round((uploaded * 100) / totalSize);
          onProgress(percent);
        }
      });

      localStream.on("error", (err) => {
        console.error("[Nextcloud] Local stream error:", err);
        reject({
          success: false,
          error: "Local file read error: " + err.message,
        });
      });

      remoteStream.on("finish", () => {
        console.log("[Nextcloud] Stream upload finished.");
        resolve({ success: true });
      });

      remoteStream.on("error", (err) => {
        console.error("[Nextcloud] Remote stream error:", err);
        reject({ success: false, error: "Upload failed: " + err.message });
      });

      localStream.pipe(remoteStream);
    });
  } catch (error) {
    console.error(`[Nextcloud] Setup failed:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
