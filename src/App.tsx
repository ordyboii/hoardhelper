import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DropZone } from './components/DropZone';
import { HoardTable } from './components/HoardTable';
import { SettingsModal } from './components/SettingsModal';
import { EditModal } from './components/EditModal';
import { FileMetadata, Settings, UploadProgress } from './types';
import { Settings as SettingsIcon, Trash2, UploadCloud } from 'lucide-react';

const App: React.FC = () => {
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        url: '', targetFolderTv: '', targetFolderMovie: '', username: '', password: ''
    });

    // Initial Load
    useEffect(() => {
        const loadSettings = async () => {
            const s = await window.api.getSettings();
            setSettings({
                ...s,
                targetFolderTv: s.targetFolderTv || s.targetFolder || '', // Migration fallback
                targetFolderMovie: s.targetFolderMovie || s.targetFolder || ''
            });
        };
        loadSettings();

        // Setup Progress Listener
        window.api.onUploadProgress((data: UploadProgress) => {
            setFiles(currentFiles => {
                const newFiles = [...currentFiles];
                if (newFiles[data.index]) {
                    // Update status in a way that doesn't break the object structure
                    // We might need a 'status' field in FileMetadata if we want to be clean, 
                    // but for now we can leverage the 'error' field or just add a temporary status.
                    // However, 'status' isn't in FileMetadata.
                    // The vanilla app modified the DOM directly.
                    // Let's assume we can set 'error' to the status message if it's not "Ready"
                    // Or better, let's treat 'error' as a general status display field if !valid.
                    // But if it is valid, we still want to show progress.
                    // Let's use the 'valid' flag. If status is "Done", maybe remove it?
                    // Actually, let's just piggyback on 'error' field for status display during upload
                    // since the table displays: {file.valid ? 'Ready' : (file.error || 'Invalid')}
                    // We can set valid=false temporarily to show the status message in the 'error' column slot?
                    // Or we can assume the user sees the 'Status' column.
                    
                    // A better approach without changing types:
                    // We can't easily change the type definition without breaking the main process (unless we do that too).
                    // The vanilla renderer just updated the text content.
                    // The table component displays: `file.valid ? 'Ready' : (file.error || 'Invalid')`
                    // So if we set valid=false and error=`Uploading ${data.percent}%`, it shows up.
                    newFiles[data.index] = {
                        ...newFiles[data.index],
                        valid: false, 
                        error: data.status 
                    };
                }
                return newFiles;
            });
        });
    }, []);

    const handleFilesDropped = async (droppedFiles: File[]) => {
        const paths = droppedFiles.map(f => window.api.getFilePath(f));
        try {
            const results = await window.api.parseFiles(paths);
            setFiles(prev => [...prev, ...results]);
        } catch (err) {
            console.error(err);
            alert("Failed to parse files.");
        }
    };

    const handleClear = () => setFiles([]);

    const handleExport = async () => {
        const validFiles = files.filter(f => f.valid);
        if (validFiles.length === 0) return;

        setIsExporting(true);
        try {
            const results = await window.api.exportFiles(validFiles);
            const failures = results.filter(r => !r.success);
            
            if (failures.length === 0) {
                alert("All treasures have been secured in the hoard!");
                setFiles([]); // Clear on success
            } else {
                alert(`Some items were lost to the abyss. Failed: ${failures.length}`);
            }
        } catch (error) {
            console.error(error);
            alert("Critical failure during export.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleEditSave = async (updatedFile: FileMetadata) => {
        // Regenerate path
        const newPath = await window.api.generatePath(updatedFile);
        const finalFile = {
            ...updatedFile,
            proposed: newPath,
            valid: !!newPath,
            error: newPath ? undefined : 'Path generation failed'
        };

        if (editingIndex !== null) {
            setFiles(prev => {
                const newFiles = [...prev];
                newFiles[editingIndex] = finalFile;
                return newFiles;
            });
        }
    };

    const handleSaveSettings = async (newSettings: Settings) => {
        const success = await window.api.saveSettings(newSettings);
        if (success) {
            setSettings(newSettings);
            alert("Map updated.");
        } else {
            alert("Map saved but client init failed.");
        }
    };

    return (
        <Layout>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 320px', 
                gap: '20px', 
                height: '100%', 
                overflow: 'hidden'
            }}>
                {/* Left Column: Drop & Table */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '20px', 
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    {/* Collapsible Drop Zone */}
                    <div style={{ flexShrink: 0 }}>
                        <DropZone onFilesDropped={handleFilesDropped} compact={files.length > 0} />
                    </div>
                    
                    {/* Table Area - Grows to fill remaining space */}
                    <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <HoardTable 
                            files={files} 
                            onEdit={(index) => setEditingIndex(index)} 
                        />
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '25px', background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <SettingsIcon size={20} />
                             Command Center
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
                            Manage your loot and prepare for extraction.
                        </p>
                        
                        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '5px 0' }} />

                        <button 
                            className="btn" 
                            onClick={handleExport} 
                            disabled={files.filter(f => f.valid).length === 0 || isExporting}
                            style={{ justifyContent: 'center', padding: '12px' }}
                        >
                            <UploadCloud size={18} />
                            {isExporting ? 'Securing Loot...' : 'Secure in Hoard'}
                        </button>

                        <button 
                            className="btn-secondary" 
                            onClick={handleClear}
                            style={{ justifyContent: 'center', padding: '10px' }}
                        >
                            <Trash2 size={16} style={{ marginRight: '5px' }} />
                            Jettison Cargo
                        </button>
                    </div>

                    <div className="card" style={{ background: 'rgba(20, 20, 20, 0.6)' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Navigation
                        </h3>
                        <button 
                            className="btn-secondary" 
                            onClick={() => setIsSettingsOpen(true)}
                            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent', padding: '10px 0', borderBottom: '1px solid #333' }}
                        >
                            <SettingsIcon size={16} style={{ marginRight: '10px', color: 'var(--color-gold)' }} />
                            Map Configuration
                        </button>
                    </div>
                    
                    {/* Status Log / Decorative */}
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', opacity: 0.3 }}>
                        <div style={{ border: '1px solid var(--color-gold-dim)', padding: '10px', borderRadius: '4px', width: '100%' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-gold)', fontFamily: 'monospace' }}>
                                SYSTEM_STATUS: ONLINE<br/>
                                DRAGON_SLEEP: ACTIVE<br/>
                                HOARD_INTEGRITY: 100%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                initialSettings={settings}
                onSave={handleSaveSettings}
                onTestConnection={window.api.testConnection}
            />

            <EditModal 
                isOpen={editingIndex !== null}
                file={editingIndex !== null ? files[editingIndex] : null}
                onClose={() => setEditingIndex(null)}
                onSave={handleEditSave}
            />
        </Layout>
    );
};

export default App;
