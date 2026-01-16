import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DropZone } from './components/DropZone';
import { HoardTable } from './components/HoardTable';
import { SettingsModal } from './components/SettingsModal';
import { EditModal } from './components/EditModal';
import { FileMetadata, Settings, UploadProgress } from './types';
import { Shield, Map, Package, Trash2 } from 'lucide-react';

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
                targetFolderTv: s.targetFolderTv || s.targetFolder || '',
                targetFolderMovie: s.targetFolderMovie || s.targetFolder || ''
            });
        };
        loadSettings();

        // Setup Progress Listener
        window.api.onUploadProgress((data: UploadProgress) => {
            setFiles(currentFiles => {
                const newFiles = [...currentFiles];
                if (newFiles[data.index]) {
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

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleExport = async () => {
        const validFiles = files.filter(f => f.valid);
        if (validFiles.length === 0) return;

        setIsExporting(true);
        try {
            const results = await window.api.exportFiles(validFiles);
            const failures = results.filter(r => !r.success);

            if (failures.length === 0) {
                alert("All treasures have been secured in the hoard!");
                setFiles([]);
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

    const validCount = files.filter(f => f.valid).length;

    return (
        <Layout>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                gap: 'var(--space-8)',
                height: '100%',
                overflow: 'hidden'
            }}>
                {/* Left Column: Drop & Cards */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-8)',
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    {/* Collapsible Drop Zone */}
                    <div style={{ flexShrink: 0 }}>
                        <DropZone onFilesDropped={handleFilesDropped} compact={files.length > 0} />
                    </div>

                    {/* File Cards Area */}
                    <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <HoardTable
                            files={files}
                            onEdit={(index) => setEditingIndex(index)}
                            onRemove={handleRemoveFile}
                        />
                    </div>
                </div>

                {/* Right Column: Command Center Sidebar */}
                <aside style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-6)',
                    overflowY: 'auto',
                    height: 'fit-content',
                    position: 'sticky',
                    top: 0
                }}>
                    {/* Command Center Card */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '16px',
                        padding: 'var(--space-6)'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            paddingBottom: 'var(--space-4)',
                            borderBottom: '1px solid var(--border-default)',
                            marginBottom: 'var(--space-4)'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--gold-glow)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--gold-primary)'
                            }}>
                                <Shield size={20} />
                            </div>
                            <h2 style={{
                                margin: 0,
                                fontFamily: 'var(--font-display)',
                                fontSize: 'var(--text-xl)',
                                color: 'var(--gold-primary)'
                            }}>
                                Command Center
                            </h2>
                        </div>

                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-sm)',
                            margin: 0,
                            marginBottom: 'var(--space-6)'
                        }}>
                            Manage your loot and prepare for extraction.
                        </p>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-3)',
                            marginBottom: 'var(--space-6)'
                        }}>
                            <button
                                className="btn-primary"
                                onClick={handleExport}
                                disabled={validCount === 0 || isExporting}
                            >
                                <Shield size={18} />
                                <span>{isExporting ? 'Securing Loot...' : 'Secure in Hoard'}</span>
                                <span className="badge">{validCount}</span>
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={handleClear}
                                disabled={files.length === 0}
                            >
                                <Trash2 size={18} />
                                <span>Jettison Cargo</span>
                            </button>
                        </div>

                        {/* Navigation */}
                        <div style={{
                            paddingTop: 'var(--space-6)',
                            borderTop: '1px solid var(--border-default)'
                        }}>
                            <div style={{
                                color: 'var(--text-tertiary)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--weight-semibold)',
                                letterSpacing: '0.5px',
                                marginBottom: 'var(--space-3)',
                                textTransform: 'uppercase'
                            }}>
                                Navigation
                            </div>
                            <button
                                className="nav-link"
                                onClick={() => setIsSettingsOpen(true)}
                            >
                                <Map size={18} style={{ color: 'var(--gold-primary)' }} />
                                <span>Map Configuration</span>
                            </button>
                        </div>
                    </div>

                    {/* System Status */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '16px',
                        padding: 'var(--space-6)'
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            lineHeight: 1.8,
                            color: 'var(--text-tertiary)'
                        }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <span>SYSTEM_STATUS:</span>
                                <span style={{ color: 'var(--success)' }}>ONLINE</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <span>DRAGON_SLEEP:</span>
                                <span style={{ color: 'var(--success)' }}>ACTIVE</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <span>HOARD_INTEGRITY:</span>
                                <span style={{ color: 'var(--success)' }}>100%</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <span>FILES_PENDING:</span>
                                <span style={{ color: files.length > 0 ? 'var(--warning)' : 'var(--success)' }}>{files.length}</span>
                            </div>
                        </div>
                    </div>
                </aside>
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
