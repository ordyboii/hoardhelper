import React, { useState } from "react";
import {
  CloudOff,
  Settings,
  Link,
  AlertCircle,
  Loader2,
  CheckCircle,
  FileText,
} from "lucide-react";
import type { TorrentInfo } from "../types";

interface DebridTabProps {
  realDebridConnected: boolean;
  onNavigateToSettings: () => void;
  // Real-Debrid magnet/torrent props
  currentTorrent: TorrentInfo | null;
  debridError: string | null;
  isDebridLoading: boolean;
  onMagnetSubmit: (magnet: string) => Promise<void>;
  onClearTorrent: () => void;
}

export const DebridTab: React.FC<DebridTabProps> = ({
  realDebridConnected,
  onNavigateToSettings,
  currentTorrent,
  debridError,
  isDebridLoading,
  onMagnetSubmit,
  onClearTorrent,
}) => {
  const [magnetInput, setMagnetInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // If not connected, show configuration screen
  if (!realDebridConnected) {
    return (
      <div className="debrid-tab-content debrid-config-required">
        <div className="debrid-config-icon">
          <CloudOff size={48} />
        </div>
        <h3 className="debrid-config-title">Real-Debrid Not Connected</h3>
        <p className="debrid-config-description">
          Configure Real-Debrid in Settings to use this feature.
        </p>
        <button
          className="btn-primary debrid-config-button"
          onClick={onNavigateToSettings}
        >
          <Settings size={18} />
          Go to Settings
        </button>
      </div>
    );
  }

  // Validate magnet link
  const isValidMagnet = (magnet: string): boolean => {
    return magnet.startsWith("magnet:?xt=urn:btih:");
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setMagnetInput(value);
    setValidationError(null);
  };

  // Handle blur (when user leaves input)
  const handleBlur = () => {
    if (magnetInput.trim() && !isValidMagnet(magnetInput)) {
      setValidationError("Please enter a valid magnet link");
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!magnetInput.trim()) {
      setValidationError("Please enter a valid magnet link");
      return;
    }

    if (!isValidMagnet(magnetInput)) {
      setValidationError("Please enter a valid magnet link");
      return;
    }

    await onMagnetSubmit(magnetInput.trim());
    setMagnetInput(""); // Clear input after successful submission
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Show stub file list UI when torrent is loaded
  if (currentTorrent) {
    return (
      <div className="debrid-tab-content">
        <div className="debrid-success-header">
          <CheckCircle size={24} className="debrid-success-icon" />
          <h3 className="debrid-success-title">Torrent Added Successfully!</h3>
          <p className="debrid-success-description">
            Files are ready for selection. This is a stub UI - full file
            selection will be implemented in future stories.
          </p>
          <button
            className="btn-secondary debrid-clear-button"
            onClick={onClearTorrent}
          >
            Add Another Magnet
          </button>
        </div>

        <div className="debrid-torrent-info">
          <h4 className="debrid-torrent-title">{currentTorrent.filename}</h4>
          <div className="debrid-torrent-meta">
            <span className="debrid-torrent-size">
              Total: {formatFileSize(currentTorrent.original_bytes)}
            </span>
            <span className="debrid-torrent-files">
              {currentTorrent.files.length} files
            </span>
            <span className="debrid-torrent-status">
              Status: {currentTorrent.status}
            </span>
          </div>
        </div>

        <div className="debrid-file-list">
          <h5 className="debrid-file-list-title">Files in Torrent:</h5>
          <div className="debrid-files-container">
            {currentTorrent.files.slice(0, 10).map((file) => (
              <div key={file.id} className="debrid-file-item">
                <FileText size={16} className="debrid-file-icon" />
                <div className="debrid-file-info">
                  <div className="debrid-file-path">{file.path}</div>
                  <div className="debrid-file-size">
                    {formatFileSize(file.bytes)}
                  </div>
                </div>
              </div>
            ))}
            {currentTorrent.files.length > 10 && (
              <div className="debrid-files-more">
                ... and {currentTorrent.files.length - 10} more files
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="debrid-tab-content">
      <form onSubmit={handleSubmit} className="debrid-magnet-form">
        <div className="debrid-input-section">
          <label className="debrid-input-label">
            Summon Treasure via Magnet Link
          </label>
          <textarea
            className={`debrid-textarea ${validationError ? "error" : ""}`}
            placeholder="magnet:?xt=urn:btih:..."
            value={magnetInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleBlur}
            disabled={isDebridLoading}
            rows={4}
            style={{ resize: "none" }} // Fixed height as per design spec
          />
          {validationError && (
            <div className="debrid-validation-error">
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary debrid-submit-button"
          disabled={
            !magnetInput.trim() ||
            !isValidMagnet(magnetInput) ||
            isDebridLoading
          }
        >
          {isDebridLoading ? (
            <>
              <Loader2 size={18} className="debrid-spinner" />
              Appraising treasure quality...
            </>
          ) : (
            <>
              <Link size={18} />
              Fetch Files
            </>
          )}
        </button>
      </form>

      {debridError && (
        <div className="debrid-error-banner">
          <AlertCircle size={20} className="debrid-error-icon" />
          <span className="debrid-error-message">{debridError}</span>
        </div>
      )}
    </div>
  );
};
