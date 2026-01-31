import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileVideo,
  HardDrive,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { DebridTab } from "./DebridTab";
import type { TorrentInfo } from "../types";

export type LootTab = "files" | "debrid";

interface LootViewProps {
  onFilesDropped: (files: File[]) => void;
  fileCount?: number;
  onClear?: () => void;
  activeTab: LootTab;
  onTabChange: (tab: LootTab) => void;
  realDebridConnected: boolean;
  onNavigateToSettings: () => void;
  // Real-Debrid magnet/torrent props
  currentTorrent: TorrentInfo | null;
  debridError: string | null;
  isDebridLoading: boolean;
  onMagnetSubmit: (magnet: string) => Promise<void>;
  onClearTorrent: () => void;
}

export const LootView: React.FC<LootViewProps> = ({
  onFilesDropped,
  fileCount = 0,
  onClear,
  activeTab,
  onTabChange,
  realDebridConnected,
  onNavigateToSettings,
  currentTorrent,
  debridError,
  isDebridLoading,
  onMagnetSubmit,
  onClearTorrent,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesDropped(Array.from(e.target.files));
    }
  };

  return (
    <div className="view-container drop-zone-container">
      <header className="view-header">
        <div className="view-header-row">
          <div>
            <h2 className="view-title">Loot Inventory</h2>
            <p className="view-description">
              Add treasures to your hoard for processing.
            </p>
          </div>
          {fileCount > 0 && onClear && (
            <button
              className="btn-secondary"
              onClick={onClear}
              style={{ width: "auto" }}
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <nav
          className="loot-tab-list"
          role="tablist"
          aria-label="Loot inventory tabs"
        >
          <button
            role="tab"
            id="tab-files"
            aria-selected={activeTab === "files"}
            aria-controls="panel-files"
            className={`loot-tab-button ${activeTab === "files" ? "active" : ""}`}
            onClick={() => onTabChange("files")}
          >
            Files
          </button>
          <button
            role="tab"
            id="tab-debrid"
            aria-selected={activeTab === "debrid"}
            aria-controls="panel-debrid"
            className={`loot-tab-button ${activeTab === "debrid" ? "active" : ""}`}
            onClick={() => onTabChange("debrid")}
          >
            Debrid
          </button>
        </nav>
      </header>

      {/* Files Tab Panel */}
      <div
        role="tabpanel"
        id="panel-files"
        aria-labelledby="tab-files"
        className="loot-tab-panel"
        style={{ display: activeTab === "files" ? "block" : "none" }}
      >
        <div
          className={`drop-zone-area ${isHovering ? "active" : ""}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label="Drop files here or click to browse"
        >
          <div className="drop-zone-glow" />

          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
            accept=".mkv,.mp4,.avi,.mov"
          />

          <div className="drop-zone-icon">
            <UploadCloud />
          </div>

          <div className="drop-zone-content">
            <h3 className="drop-zone-title">
              {isHovering
                ? "Release to add files"
                : "Drag & Drop treasures here"}
            </h3>
            <p className="drop-zone-subtitle">
              Supports <code>.mkv</code>, <code>.mp4</code>, <code>.avi</code>.
              Files will be automatically analyzed.
            </p>
          </div>
        </div>

        <div className="drop-zone-stats">
          <div className="card drop-zone-stat">
            <div className="drop-zone-stat-icon">
              <FileVideo style={{ color: "var(--gold-primary)" }} />
            </div>
            <div className="drop-zone-stat-info">
              <div className="drop-zone-stat-value">{fileCount}</div>
              <div className="drop-zone-stat-label">Pending Review</div>
            </div>
          </div>

          <div className="card drop-zone-stat">
            <div className="drop-zone-stat-icon">
              <HardDrive style={{ color: "var(--info)" }} />
            </div>
            <div className="drop-zone-stat-info">
              <div className="drop-zone-stat-value">
                0 <span>GB</span>
              </div>
              <div className="drop-zone-stat-label">Total Size</div>
            </div>
          </div>

          <div className="card drop-zone-stat">
            <div className="drop-zone-stat-icon">
              <AlertCircle style={{ color: "var(--warning)" }} />
            </div>
            <div className="drop-zone-stat-info">
              <div className="drop-zone-stat-value">0</div>
              <div className="drop-zone-stat-label">Issues Found</div>
            </div>
          </div>
        </div>
      </div>

      {/* Debrid Tab Panel */}
      <div
        role="tabpanel"
        id="panel-debrid"
        aria-labelledby="tab-debrid"
        className="loot-tab-panel"
        style={{ display: activeTab === "debrid" ? "block" : "none" }}
      >
        <DebridTab
          realDebridConnected={realDebridConnected}
          onNavigateToSettings={onNavigateToSettings}
          currentTorrent={currentTorrent}
          debridError={debridError}
          isDebridLoading={isDebridLoading}
          onMagnetSubmit={onMagnetSubmit}
          onClearTorrent={onClearTorrent}
        />
      </div>
    </div>
  );
};
