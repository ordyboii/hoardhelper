import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { Settings, FileMetadata, UploadProgress } from './types/index.js';

contextBridge.exposeInMainWorld('api', {
    // Get path from File object (handles Electron security updates)
    getFilePath: (file: File) => webUtils.getPathForFile(file),

    // Send paths to be parsed
    parseFiles: (filePaths: string[]) => ipcRenderer.invoke('parse-files', filePaths),

    // Execute the copy operation
    exportFiles: (filesToExport: FileMetadata[]) => ipcRenderer.invoke('export-files', filesToExport),

    // Nextcloud / Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings: Settings) => ipcRenderer.invoke('save-settings', settings),
    testConnection: (settings?: Settings) => ipcRenderer.invoke('test-connection', settings),

    // Real-Debrid
    testRealDebridConnection: (apiKey?: string) => ipcRenderer.invoke('test-realdebrid-connection', apiKey),

    // Helper to generate path for edit mode
    generatePath: (metadata: FileMetadata) => ipcRenderer.invoke('generate-path', metadata),

    // Listen for upload progress
    onUploadProgress: (callback: (data: UploadProgress) => void) =>
        ipcRenderer.on('upload-progress', (_, data) => callback(data)),

    // Log to main process stdout
    log: (msg: string) => ipcRenderer.send('console-log', msg)
});
