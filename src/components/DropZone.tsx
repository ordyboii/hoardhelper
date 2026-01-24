import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileVideo,
  HardDrive,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  fileCount?: number;
  onClear?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesDropped,
  fileCount = 0,
  onClear,
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
      </header>

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
            {isHovering ? "Release to add files" : "Drag & Drop treasures here"}
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
  );
};
