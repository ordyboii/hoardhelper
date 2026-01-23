import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DropZone } from './components/DropZone';
import { QueueList } from './components/QueueList';
import { EditView } from './components/EditView';
import { SecureStatusView } from './components/SecureStatusView';
import { SettingsView } from './components/SettingsView';
import { FileMetadata, HistoryItem, Settings, UploadProgress, ViewState } from './types';
import { HardDrive, Menu } from 'lucide-react';

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const App: React.FC = () => {
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.Loot);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
    const [settings, setSettings] = useState<Settings>({
        url: '', targetFolderTv: '', targetFolderMovie: '', username: '', password: '', realDebridApiKey: ''
    });
    const [nextcloudConnected, setNextcloudConnected] = useState(false);
    const [realDebridConnected, setRealDebridConnected] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadSettings = async () => {
            const s = await window.api.getSettings();
            const loadedSettings = {
                ...s,
                targetFolderTv: s.targetFolderTv || s.targetFolder || '',
                targetFolderMovie: s.targetFolderMovie || s.targetFolder || ''
            };
            setSettings(loadedSettings);

            // Check Nextcloud connection status
            if (loadedSettings.url && loadedSettings.username && loadedSettings.password) {
                try {
                    const result = await window.api.testConnection();
                    setNextcloudConnected(result.success);
                } catch {
                    setNextcloudConnected(false);
                }
            }

            // Check Real-Debrid connection status
            if (loadedSettings.realDebridApiKey) {
                try {
                    const result = await window.api.testRealDebridConnection(loadedSettings.realDebridApiKey);
                    setRealDebridConnected(result.success);
                } catch {
                    setRealDebridConnected(false);
                }
            }
        };
        loadSettings();

        // Setup Progress Listener
        window.api.onUploadProgress((data: UploadProgress) => {
            setUploadProgress(prev => ({
                ...prev,
                [data.index]: data.percent
            }));

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
            // Navigate to Extraction view after files are added
            setTimeout(() => setCurrentView(ViewState.Extraction), 300);
        } catch (err) {
            console.error(err);
            alert("Failed to parse files.");
        }
    };

    const handleClear = () => {
        setFiles([]);
        setUploadProgress({});
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
        });
    };

    const handleExport = async () => {
        const validFiles = files.filter(f => f.valid);
        if (validFiles.length === 0) return;

        setIsExporting(true);
        setUploadProgress({});

        try {
            const results = await window.api.exportFiles(validFiles);

            // Create history items from the results
            const now = new Date();
            const newHistoryItems: HistoryItem[] = validFiles.map((file, index) => {
                const result = results[index];
                const isRetry = !!file._retryId;

                return {
                    ...file,
                    id: file._retryId || generateId(), // Reuse ID if retry, else new ID
                    uploadedAt: now,
                    uploadStatus: result.success ? 'success' : 'failed',
                    errorMessage: result.error,
                    isRetry,
                    _retryId: undefined, // Clear the retry marker
                };
            });

            // Add to history (most recent first)
            setHistory(prev => [...newHistoryItems, ...prev]);

            // Clear files from queue
            setFiles([]);
            setUploadProgress({});

            // Navigate to Secure view to show results
            setTimeout(() => setCurrentView(ViewState.Secure), 300);

        } catch (error) {
            console.error(error);
            alert("Critical failure during export.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleRetry = (historyItem: HistoryItem) => {
        // Re-enable file for queue
        const retryFile: FileMetadata = {
            type: historyItem.type,
            series: historyItem.series,
            season: historyItem.season,
            episode: historyItem.episode,
            formattedSeason: historyItem.formattedSeason,
            formattedEpisode: historyItem.formattedEpisode,
            ext: historyItem.ext,
            originalName: historyItem.originalName,
            fullPath: historyItem.fullPath,
            proposed: historyItem.proposed,
            valid: true, // Re-enable for queue
            error: undefined,
            _retryId: historyItem.id, // Track this as a retry
        };

        // Add back to files queue
        setFiles(prev => [...prev, retryFile]);

        // Remove from history (will re-add on completion)
        setHistory(prev => prev.filter(h => h.id !== historyItem.id));

        // Navigate to extraction
        setCurrentView(ViewState.Extraction);
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
        setEditingIndex(null);
    };

    const handleSaveSettings = async (newSettings: Settings) => {
        const success = await window.api.saveSettings(newSettings);
        if (success) {
            setSettings(newSettings);
            setNextcloudConnected(true);
            alert("Map updated.");
        } else {
            setNextcloudConnected(false);
            alert("Map saved but client init failed.");
        }

        // Update Real-Debrid status
        if (newSettings.realDebridApiKey) {
            try {
                const rdResult = await window.api.testRealDebridConnection(newSettings.realDebridApiKey);
                setRealDebridConnected(rdResult.success);
            } catch {
                setRealDebridConnected(false);
            }
        } else {
            setRealDebridConnected(false);
        }
    };

    const handleTestRealDebrid = async (apiKey: string) => {
        const result = await window.api.testRealDebridConnection(apiKey);
        if (result.success) {
            setRealDebridConnected(true);
        }
        return result;
    };

    const validCount = files.filter(f => f.valid).length;

    // Render content based on current view or editing state
    const renderContent = () => {
        // If editing, show EditView instead of current view
        if (editingIndex !== null && files[editingIndex]) {
            return (
                <EditView
                    file={files[editingIndex]}
                    onSave={handleEditSave}
                    onCancel={() => setEditingIndex(null)}
                />
            );
        }

        switch (currentView) {
            case ViewState.Loot:
                return (
                    <DropZone
                        onFilesDropped={handleFilesDropped}
                        fileCount={files.length}
                        onClear={handleClear}
                    />
                );
            case ViewState.Extraction:
                return (
                    <QueueList
                        files={files}
                        onEdit={(index) => setEditingIndex(index)}
                        onRemove={handleRemoveFile}
                        onProcess={handleExport}
                        isProcessing={isExporting}
                        progress={uploadProgress}
                    />
                );
            case ViewState.Secure:
                return (
                    <SecureStatusView
                        history={history}
                        onRetry={handleRetry}
                    />
                );
            case ViewState.Map:
                return (
                    <SettingsView
                        initialSettings={settings}
                        onSave={handleSaveSettings}
                        onTestConnection={window.api.testConnection}
                        onTestRealDebrid={handleTestRealDebrid}
                    />
                );
            default:
                return (
                    <DropZone
                        onFilesDropped={handleFilesDropped}
                        fileCount={files.length}
                        onClear={handleClear}
                    />
                );
        }
    };

    return (
        <div className="app-container">
            {isSidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                currentView={currentView}
                onChangeView={setCurrentView}
                itemCount={validCount}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                nextcloudConnected={nextcloudConnected}
                realDebridConnected={realDebridConnected}
            />

            <div className="main-content">
                <div className="gradient-spot" />

                {/* Mobile Header */}
                <header className="mobile-header">
                    <div className="mobile-header-logo">
                        <div className="mobile-header-icon">
                            <HardDrive size={20} aria-hidden="true" />
                        </div>
                        <h1 className="mobile-header-title">HoardHelper</h1>
                    </div>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={24} aria-hidden="true" />
                    </button>
                </header>

                <main className="main-content-inner">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
