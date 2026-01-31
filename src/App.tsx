import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { LootView } from "./components/LootView";
import type { LootTab } from "./components/LootView";
import { QueueList } from "./components/QueueList";
import { EditView } from "./components/EditView";
import { SecureStatusView } from "./components/SecureStatusView";
import { SettingsView } from "./components/SettingsView";
import {
  FileMetadata,
  HistoryItem,
  Settings,
  UploadProgress,
  ViewState,
  TorrentInfo,
} from "./types";
import { HardDrive, Menu } from "lucide-react";
import { shouldRunConnectionCheck } from "./logic/connectionMonitoring";

// Helper to generate unique IDs
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const App: React.FC = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.Loot);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: number]: number;
  }>({});
  const [settings, setSettings] = useState<Settings>({
    url: "",
    targetFolderTv: "",
    targetFolderMovie: "",
    username: "",
    password: "",
    realDebridApiKey: "",
    connectionCheckInterval: 60,
  });
  const [nextcloudConnected, setNextcloudConnected] = useState(false);
  const [realDebridConnected, setRealDebridConnected] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(true);
  const [lootActiveTab, setLootActiveTab] = useState<LootTab>("files");

  // Real-Debrid magnet/torrent state
  const [currentTorrent, setCurrentTorrent] = useState<TorrentInfo | null>(
    null,
  );
  const [debridError, setDebridError] = useState<string | null>(null);
  const [isDebridLoading, setIsDebridLoading] = useState(false);

  /**
   * Checks connection status for both Nextcloud and Real-Debrid services.
   * Updates connection state based on test results.
   */
  const checkConnectionStatus = useCallback(
    async (settingsToCheck: Settings) => {
      // Check Nextcloud connection
      if (
        settingsToCheck.url &&
        settingsToCheck.username &&
        settingsToCheck.password
      ) {
        try {
          const result = await window.api.testConnection();
          setNextcloudConnected(result.success);
        } catch (error) {
          console.error("[App] Nextcloud connection check failed:", error);
          setNextcloudConnected(false);
        }
      } else {
        setNextcloudConnected(false);
      }

      // Check Real-Debrid connection
      if (settingsToCheck.realDebridApiKey) {
        try {
          const result = await window.api.testRealDebridConnection(
            settingsToCheck.realDebridApiKey,
          );
          setRealDebridConnected(result.success);
        } catch (error) {
          console.error("[App] Real-Debrid connection check failed:", error);
          setRealDebridConnected(false);
        }
      } else {
        setRealDebridConnected(false);
      }
    },
    [],
  );

  // Initial Load
  useEffect(() => {
    const loadSettings = async () => {
      const s = await window.api.getSettings();
      const loadedSettings = {
        ...s,
        targetFolderTv: s.targetFolderTv || s.targetFolder || "",
        targetFolderMovie: s.targetFolderMovie || s.targetFolder || "",
      };
      setSettings(loadedSettings);

      // Check connection status for both services
      await checkConnectionStatus(loadedSettings);
    };
    loadSettings();

    // Setup Progress Listener
    window.api.onUploadProgress((data: UploadProgress) => {
      setUploadProgress((prev) => ({
        ...prev,
        [data.index]: data.percent,
      }));

      setFiles((currentFiles) => {
        const newFiles = [...currentFiles];
        if (newFiles[data.index]) {
          newFiles[data.index] = {
            ...newFiles[data.index],
            valid: false,
            error: data.status,
          };
        }
        return newFiles;
      });
    });
  }, [checkConnectionStatus]);

  // Visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Periodic connection status checks
  useEffect(() => {
    const checkInterval = (settings.connectionCheckInterval ?? 60) * 1000;

    const checkConnections = async () => {
      // Guard: Pause checks when app is not visible
      if (!shouldRunConnectionCheck(document.visibilityState)) return;
      await checkConnectionStatus(settings);
    };

    const intervalId = setInterval(checkConnections, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [settings, isAppVisible, checkConnectionStatus]);

  const handleFilesDropped = async (droppedFiles: File[]) => {
    const paths = droppedFiles.map((f) => window.api.getFilePath(f));
    try {
      const results = await window.api.parseFiles(paths);
      setFiles((prev) => [...prev, ...results]);
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
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleExport = async () => {
    const validFiles = files.filter((f) => f.valid);
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
          uploadStatus: result.success ? "success" : "failed",
          errorMessage: result.error,
          isRetry,
          _retryId: undefined, // Clear the retry marker
        };
      });

      // Add to history (most recent first)
      setHistory((prev) => [...newHistoryItems, ...prev]);

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
    setFiles((prev) => [...prev, retryFile]);

    // Remove from history (will re-add on completion)
    setHistory((prev) => prev.filter((h) => h.id !== historyItem.id));

    // Navigate to extraction
    setCurrentView(ViewState.Extraction);
  };

  const handleEditSave = async (updatedFile: FileMetadata) => {
    const newPath = await window.api.generatePath(updatedFile);
    const finalFile = {
      ...updatedFile,
      proposed: newPath,
      valid: !!newPath,
      error: newPath ? undefined : "Path generation failed",
    };

    if (editingIndex !== null) {
      setFiles((prev) => {
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
      alert("Map updated.");
    } else {
      alert("Map saved but client init failed.");
    }

    // Check connection status for both services
    await checkConnectionStatus(newSettings);
  };

  const handleTestRealDebrid = async (apiKey: string) => {
    const result = await window.api.testRealDebridConnection(apiKey);
    if (result.success) {
      setRealDebridConnected(true);
    }
    return result;
  };

  // Real-Debrid magnet handlers
  const handleMagnetSubmit = async (magnet: string) => {
    setIsDebridLoading(true);
    setDebridError(null);
    setCurrentTorrent(null);

    try {
      // Step 1: Add magnet to Real-Debrid
      const magnetResult = await window.api.addMagnetToRealDebrid(magnet);

      if (!magnetResult.success) {
        setDebridError(magnetResult.error || "Failed to add magnet link");
        return;
      }

      if (!magnetResult.torrentId) {
        setDebridError("No torrent ID returned from Real-Debrid");
        return;
      }

      // Step 2: Get torrent info (file list)
      const torrentInfo = await window.api.getTorrentInfo(
        magnetResult.torrentId,
      );
      setCurrentTorrent(torrentInfo);

      // Clear input after successful submission
      // Note: This will be handled by the DebridTab component itself
    } catch (error) {
      console.error("[App] Magnet submission failed:", error);
      setDebridError(
        error instanceof Error
          ? error.message
          : "Failed to process magnet link",
      );
    } finally {
      setIsDebridLoading(false);
    }
  };

  const handleClearTorrent = () => {
    setCurrentTorrent(null);
    setDebridError(null);
  };

  const validCount = files.filter((f) => f.valid).length;

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
          <LootView
            onFilesDropped={handleFilesDropped}
            fileCount={files.length}
            onClear={handleClear}
            activeTab={lootActiveTab}
            onTabChange={setLootActiveTab}
            realDebridConnected={realDebridConnected}
            onNavigateToSettings={() => setCurrentView(ViewState.Map)}
            currentTorrent={currentTorrent}
            debridError={debridError}
            isDebridLoading={isDebridLoading}
            onMagnetSubmit={handleMagnetSubmit}
            onClearTorrent={handleClearTorrent}
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
        return <SecureStatusView history={history} onRetry={handleRetry} />;
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
          <LootView
            onFilesDropped={handleFilesDropped}
            fileCount={files.length}
            onClear={handleClear}
            activeTab={lootActiveTab}
            onTabChange={setLootActiveTab}
            realDebridConnected={realDebridConnected}
            onNavigateToSettings={() => setCurrentView(ViewState.Map)}
            currentTorrent={currentTorrent}
            debridError={debridError}
            isDebridLoading={isDebridLoading}
            onMagnetSubmit={handleMagnetSubmit}
            onClearTorrent={handleClearTorrent}
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

        <main className="main-content-inner">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
