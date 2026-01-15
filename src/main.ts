import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { fileURLToPath } from 'url';
import { parseFilename } from './logic/parser.js';
import { generateNewPath } from './logic/exporter.js';
import { initializeClient, testConnection, uploadFileToNextcloud } from './logic/nextcloud.js';
import { Settings, FileMetadata, ExportResult } from './types/index.js';

// Workaround for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Store with specific types if needed, or cast later
const store = new Store() as any;
let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), 
            nodeIntegration: false,
            contextIsolation: true
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
    const settings = store.get('nextcloud') as Settings | undefined;
    if (settings) {
        initializeClient(settings.url, settings.username, settings.password);
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
    return store.get('nextcloud') || {};
});

ipcMain.handle('save-settings', (event, settings: Settings) => {
    store.set('nextcloud', settings);
    const success = initializeClient(settings.url, settings.username, settings.password);
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

// 1. Parse Files
ipcMain.handle('parse-files', async (event, filePaths: string[]) => {
    const settings = store.get('nextcloud') as Settings | undefined;
    
    console.log(`[Main] Parsing files. Target folders from settings:`);
    console.log(`[Main] TV Target: ${settings?.targetFolderTv || settings?.targetFolder}`);
    console.log(`[Main] Movie Target: ${settings?.targetFolderMovie || settings?.targetFolder}`);

    const results: FileMetadata[] = [];
    for (const filePath of filePaths) {
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
    }
    return results;
});

// 2. Generate Path (Helper for Edit Mode)
ipcMain.handle('generate-path', (event, metadata: FileMetadata) => {
    const settings = store.get('nextcloud') as Settings | undefined;
    
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
    const settings = store.get('nextcloud') as Settings | undefined;
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
