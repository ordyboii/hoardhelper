import { FileMetadata, Settings, ExportResult, UploadProgress, ElectronAPI } from './types';

// Declare global API
declare global {
    interface Window {
        api: ElectronAPI;
    }
}

// Global Variables (to be initialized on DOMContentLoaded)
let dropZone: HTMLDivElement;
let fileInput: HTMLInputElement;
let fileTableBody: HTMLTableSectionElement;
let btnExport: HTMLButtonElement;
let btnClear: HTMLButtonElement;

// Settings Elements
let modal: HTMLDivElement;
let btnSettings: HTMLButtonElement;
let btnSaveSettings: HTMLButtonElement;
let btnCancelSettings: HTMLButtonElement;
let btnTestConn: HTMLButtonElement;
let inputUrl: HTMLInputElement;
let inputFolderTv: HTMLInputElement;
let inputFolderMovie: HTMLInputElement;
let inputUser: HTMLInputElement;
let inputPass: HTMLInputElement;

// Edit Modal Elements
let editModal: HTMLDivElement;
let editTypeTv: HTMLInputElement;
let editTypeMovie: HTMLInputElement;
let editSeries: HTMLInputElement;
let editSeason: HTMLInputElement;
let editEpisode: HTMLInputElement;
let editTvFields: HTMLDivElement;
let btnSaveEdit: HTMLButtonElement;
let btnCancelEdit: HTMLButtonElement;

let editingIndex: number = -1;

let currentFiles: FileMetadata[] = [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Elements
    dropZone = document.getElementById('drop-zone') as HTMLDivElement;
    fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileTableBody = document.querySelector('#file-table tbody') as HTMLTableSectionElement;
    btnExport = document.getElementById('btn-export') as HTMLButtonElement;
    btnClear = document.getElementById('btn-clear') as HTMLButtonElement;

    // Settings Modal Elements
    modal = document.getElementById('settings-modal') as HTMLDivElement;
    btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;
    btnSaveSettings = document.getElementById('btn-save-settings') as HTMLButtonElement;
    btnCancelSettings = document.getElementById('btn-cancel-settings') as HTMLButtonElement;
    btnTestConn = document.getElementById('btn-test-conn') as HTMLButtonElement;

    inputUrl = document.getElementById('set-url') as HTMLInputElement;
    inputFolderTv = document.getElementById('set-folder-tv') as HTMLInputElement;
    inputFolderMovie = document.getElementById('set-folder-movie') as HTMLInputElement;
    inputUser = document.getElementById('set-user') as HTMLInputElement;
    inputPass = document.getElementById('set-pass') as HTMLInputElement;

    // Edit Modal Init
    editModal = document.getElementById('edit-modal') as HTMLDivElement;
    editTypeTv = document.getElementById('edit-type-tv') as HTMLInputElement;
    editTypeMovie = document.getElementById('edit-type-movie') as HTMLInputElement;
    editSeries = document.getElementById('edit-series') as HTMLInputElement;
    editSeason = document.getElementById('edit-season') as HTMLInputElement;
    editEpisode = document.getElementById('edit-episode') as HTMLInputElement;
    editTvFields = document.getElementById('edit-tv-fields') as HTMLDivElement;
    btnSaveEdit = document.getElementById('btn-save-edit') as HTMLButtonElement;
    btnCancelEdit = document.getElementById('btn-cancel-edit') as HTMLButtonElement;

    initListeners();
});

function initListeners() {
    // Drag & Drop Handling
    dropZone.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
        dropZone.classList.add('hover');
    });

    dropZone.addEventListener('dragleave', (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('hover');
    });

    dropZone.addEventListener('drop', async (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('hover');
        
        window.api.log('Drop event detected.');

        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            window.api.log(`Dropped ${files.length} files.`);
            
            const filePaths = files.map(f => window.api.getFilePath(f));

            if (filePaths.length > 0) {
                await processDroppedFiles(filePaths);
            } else {
                window.api.log('No file paths found in drop event.');
            }
        }
    });

    // Click to Select Handling
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const files = Array.from(target.files);
            const filePaths = files.map(f => window.api.getFilePath(f));
            
            await processDroppedFiles(filePaths);
            // Reset value
            target.value = '';
        }
    });

    // Button Handlers
    btnClear.addEventListener('click', () => {
        currentFiles = [];
        renderTable();
        updateButtons();
    });

    btnSettings.addEventListener('click', async () => {
        // Load settings
        const settings = await window.api.getSettings();
        inputUrl.value = settings.url || '';
        
        // Migration Logic: Use old targetFolder if new ones are empty
        inputFolderTv.value = settings.targetFolderTv || settings.targetFolder || '';
        inputFolderMovie.value = settings.targetFolderMovie || settings.targetFolder || '';
        
        inputUser.value = settings.username || '';
        inputPass.value = settings.password || ''; 
        
        modal.classList.remove('hidden');
    });

    btnCancelSettings.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    btnSaveSettings.addEventListener('click', async () => {
        const settings: Settings = {
            url: inputUrl.value.trim(),
            targetFolderTv: inputFolderTv.value.trim(),
            targetFolderMovie: inputFolderMovie.value.trim(),
            username: inputUser.value.trim(),
            password: inputPass.value
        };

        const success = await window.api.saveSettings(settings);
        if (success) {
            modal.classList.add('hidden');
            alert('Settings saved!');
        } else {
            alert('Saved settings but failed to initialize client. Check logs.');
        }
    });

    btnTestConn.addEventListener('click', async () => {
        btnTestConn.innerText = "Testing...";
        
        // Grab current values from inputs
        const tempSettings: Settings = {
            url: inputUrl.value.trim(),
            targetFolderTv: inputFolderTv.value.trim(),
            targetFolderMovie: inputFolderMovie.value.trim(),
            username: inputUser.value.trim(),
            password: inputPass.value
        };

        const result = await window.api.testConnection(tempSettings);
        if (result.success) {
            alert("Connection Successful!");
        } else {
            alert("Connection Failed: " + result.error);
        }
        btnTestConn.innerText = "Test Connection";
    });

    btnExport.addEventListener('click', async () => {
        const validFiles = currentFiles.filter(f => f.valid);
        if (validFiles.length === 0) return;

        btnExport.disabled = true;
        btnExport.innerText = 'Uploading...';

        // Execute Export
        const results = await window.api.exportFiles(validFiles);

        // Show results (simple alert for now)
        const successCount = results.filter(r => r.success).length;
        const errors = results.filter(r => !r.success);

        alert(`Operation Complete!\nSuccessful: ${successCount}\nFailed: ${errors.length}`);

        if (errors.length > 0) {
            console.error('Export Errors:', errors);
        }

        // Reset UI
        currentFiles = [];
        renderTable();
        btnExport.innerText = 'Export Files';
        updateButtons();
    });

    // --- Edit Modal Listeners ---
    
    // Toggle fields based on type
    const toggleEditFields = () => {
        if (editTypeTv.checked) {
            editTvFields.style.display = 'flex';
        } else {
            editTvFields.style.display = 'none';
        }
    };
    editTypeTv.addEventListener('change', toggleEditFields);
    editTypeMovie.addEventListener('change', toggleEditFields);

    btnCancelEdit.addEventListener('click', () => {
        editModal.classList.add('hidden');
        editingIndex = -1;
    });

    btnSaveEdit.addEventListener('click', async () => {
        if (editingIndex === -1) return;

        const file = currentFiles[editingIndex];
        const isTv = editTypeTv.checked;
        const newSeries = editSeries.value.trim();
        const newSeason = isTv ? parseInt(editSeason.value) || 1 : null;
        const newEpisode = isTv ? parseInt(editEpisode.value) || 1 : null;

        // Construct updated metadata
        const updatedMetadata: FileMetadata = {
            ...file,
            type: isTv ? 'tv' : 'movie',
            series: newSeries,
            season: newSeason,
            episode: newEpisode,
            // Re-format strings for display/logic if needed
            formattedSeason: newSeason ? newSeason.toString().padStart(2, '0') : undefined,
            formattedEpisode: newEpisode ? newEpisode.toString().padStart(2, '0') : undefined
        };

        // Ask Main process to regenerate the path
        const newPath = await window.api.generatePath(updatedMetadata);
        
        updatedMetadata.proposed = newPath;
        updatedMetadata.valid = !!newPath; // If path generation failed, mark invalid

        // Update state
        currentFiles[editingIndex] = updatedMetadata;
        
        editModal.classList.add('hidden');
        editingIndex = -1;
        renderTable();
        updateButtons();
    });
}

// --- Upload Progress ---
window.api.onUploadProgress((data: UploadProgress) => {
    // data = { index, percent, status }
    if (currentFiles[data.index]) {
        // Update DOM directly for performance
        const rows = fileTableBody.querySelectorAll('tr');
        if (rows[data.index]) {
            const statusCell = rows[data.index].children[1] as HTMLElement;
            statusCell.innerText = data.status;
        }
    }
});

async function processDroppedFiles(paths: string[]) {
    // Send paths to main process for parsing
    const results = await window.api.parseFiles(paths);
    
    // Merge new results with current list
    currentFiles = [...currentFiles, ...results];
    renderTable();
    updateButtons();
}

function renderTable() {
    fileTableBody.innerHTML = '';
    
    currentFiles.forEach((file, index) => {
        const tr = document.createElement('tr');
        
        const validClass = file.valid ? 'row-valid' : 'row-error';
        const status = file.valid ? 'Ready' : (file.error || 'Invalid');
        
        // Shorten the proposed path for display
        let displayPath = file.proposed || '-';
        if (displayPath.length > 50) {
            displayPath = '...' + displayPath.slice(-50);
        }

        tr.innerHTML = `
            <td class="${validClass}">${file.originalName}</td>
            <td>${status}</td>
            <td class="dest-path" title="${file.proposed || ''}">${displayPath}</td>
            <td><button class="btn-edit" data-index="${index}">Edit</button></td>
        `;
        fileTableBody.appendChild(tr);
    });

    // Attach listeners to new buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '-1');
            if (index >= 0) {
                openEditModal(index);
            }
        });
    });
}

function openEditModal(index: number) {
    editingIndex = index;
    const file = currentFiles[index];

    // Populate fields
    if (file.type === 'movie') {
        editTypeMovie.checked = true;
        editTvFields.style.display = 'none';
    } else {
        editTypeTv.checked = true;
        editTvFields.style.display = 'flex';
    }

    editSeries.value = file.series || '';
    editSeason.value = file.season?.toString() || '1';
    editEpisode.value = file.episode?.toString() || '1';

    editModal.classList.remove('hidden');
}

function updateButtons() {
    const validFiles = currentFiles.filter(f => f.valid);
    btnExport.disabled = validFiles.length === 0;
}