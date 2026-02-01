import { contextBridge, ipcRenderer, webUtils } from "electron";
import type {
  Settings,
  FileMetadata,
  UploadProgress,
  AddMagnetResult,
  TorrentInfo,
} from "./types/index.js";

contextBridge.exposeInMainWorld("api", {
  // Get path from File object (handles Electron security updates)
  getFilePath: (file: File) => webUtils.getPathForFile(file),

  // Send paths to be parsed
  parseFiles: (filePaths: string[]) =>
    ipcRenderer.invoke("parse-files", filePaths),

  // Execute the copy operation
  exportFiles: (filesToExport: FileMetadata[]) =>
    ipcRenderer.invoke("export-files", filesToExport),

  // Nextcloud / Settings
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings: Settings) =>
    ipcRenderer.invoke("save-settings", settings),
  testConnection: (settings?: Settings) =>
    ipcRenderer.invoke("test-connection", settings),

  // Real-Debrid
  testRealDebridConnection: (apiKey?: string) =>
    ipcRenderer.invoke("test-realdebrid-connection", apiKey),
  addMagnetToRealDebrid: (magnet: string) =>
    ipcRenderer.invoke(
      "add-magnet-to-realdebrid",
      magnet,
    ) as Promise<AddMagnetResult>,
  getTorrentInfo: (torrentId: string) =>
    ipcRenderer.invoke("get-torrent-info", torrentId) as Promise<TorrentInfo>,
  selectFiles: (torrentId: string, fileIds: number[]) =>
    ipcRenderer.invoke(
      "select-files",
      torrentId,
      fileIds,
    ) as Promise<TorrentInfo>,
  deleteTorrent: (torrentId: string) =>
    ipcRenderer.invoke("delete-torrent", torrentId) as Promise<{
      success: boolean;
      error?: string;
    }>,
  unrestrictLinks: (links: string[]) =>
    ipcRenderer.invoke("unrestrict-links", links) as Promise<
      Array<{ success: boolean; url?: string; error?: string }>
    >,
  downloadFiles: (
    items: Array<{ downloadUrl: string; filename: string; bytes: number }>,
  ) =>
    ipcRenderer.invoke("download-files", items) as Promise<
      Array<{ success: boolean; localPath?: string; error?: string }>
    >,

  // Helper to generate path for edit mode
  generatePath: (metadata: FileMetadata) =>
    ipcRenderer.invoke("generate-path", metadata),

  // Listen for upload progress
  onUploadProgress: (callback: (data: UploadProgress) => void) =>
    ipcRenderer.on("upload-progress", (_, data) => callback(data)),

  // Listen for download progress
  onDownloadProgress: (callback: (percent: number) => void) =>
    ipcRenderer.on("download-progress", (_, percent) => callback(percent)),

  // Log to main process stdout
  log: (msg: string) => ipcRenderer.send("console-log", msg),
});
