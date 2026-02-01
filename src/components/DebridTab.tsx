import React, { useState } from "react";
import {
  CloudOff,
  Settings,
  Link,
  AlertCircle,
  Loader2,
  CheckCircle,
  FileText,
  Film,
  Tv,
  Subtitles,
  Download,
  Check,
} from "lucide-react";
import type { TorrentInfo, MediaType, FileWithSubtitleInfo } from "../types";

interface DebridTabProps {
  realDebridConnected: boolean;
  onNavigateToSettings: () => void;
  // Real-Debrid magnet/torrent props
  currentTorrent: TorrentInfo | null;
  debridError: string | null;
  isDebridLoading: boolean;
  onMagnetSubmit: (magnet: string) => Promise<void>;
  // Media type detection props
  mediaType: MediaType | null;
  selectedFileIds: number[];
  filesWithSubtitles: FileWithSubtitleInfo[];
  isProcessingDownload: boolean;
  onFileSelection: (fileId: number, subtitleFileIds: number[]) => void;
  onSelectAllFiles: () => void;
  onDeselectAllFiles: () => void;
  onConfirmSelection: () => void;
  onDeleteTorrent: () => void;
  downloadProgress: number;
}

export const DebridTab: React.FC<DebridTabProps> = ({
  realDebridConnected,
  onNavigateToSettings,
  currentTorrent,
  debridError,
  isDebridLoading,
  onMagnetSubmit,
  mediaType,
  selectedFileIds,
  filesWithSubtitles,
  isProcessingDownload,
  onFileSelection,
  onSelectAllFiles,
  onDeselectAllFiles,
  onConfirmSelection,
  onDeleteTorrent,
  downloadProgress,
}) => {
  const [magnetInput, setMagnetInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const isValidMagnet = (magnet: string): boolean => {
    return magnet.startsWith("magnet:?xt=urn:btih:");
  };

  const handleInputChange = (value: string) => {
    setMagnetInput(value);
    setValidationError(null);
  };

  const handleBlur = () => {
    if (magnetInput.trim() && !isValidMagnet(magnetInput)) {
      setValidationError("Please enter a valid magnet link");
    }
  };

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
    setMagnetInput("");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFilenameFromPath = (path: string): string => {
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  const getEpisodeMetadata = (filename: string) => {
    const s01e01Match = filename.match(/s(\d{1,2})e(\d{1,2})/i);
    if (s01e01Match) {
      return {
        season: parseInt(s01e01Match[1], 10),
        episode: parseInt(s01e01Match[2], 10),
        pattern: `S${s01e01Match[1].padStart(2, "0")}E${s01e01Match[2].padStart(2, "0")}`,
      };
    }

    const x01Match = filename.match(/(\d{1,2})x(\d{1,2})/i);
    if (x01Match) {
      return {
        season: parseInt(x01Match[1], 10),
        episode: parseInt(x01Match[2], 10),
        pattern: `${x01Match[1]}x${x01Match[2].padStart(2, "0")}`,
      };
    }

    return null;
  };

  if (currentTorrent && mediaType) {
    const videoFiles = filesWithSubtitles;
    const totalSize = videoFiles.reduce((sum, f) => sum + f.bytes, 0);

    return (
      <div className="debrid-tab-content">
        {/* Movie View */}
        {mediaType === "movie" && (
          <div className="debrid-movie-view">
            <div className="debrid-movie-header">
              <div className="debrid-movie-icon">
                <Film size={48} />
              </div>
              <div className="debrid-movie-info">
                <h3 className="debrid-movie-title">
                  {currentTorrent.filename}
                </h3>
                <div className="debrid-movie-meta">
                  <span>{videoFiles.length} video file(s)</span>
                  <span>•</span>
                  <span>{formatFileSize(totalSize)}</span>
                  {videoFiles.length > 0 &&
                    videoFiles[0].subtitleFileIds.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="debrid-subtitle-badge">
                          <Subtitles size={14} />
                          Subtitles included
                        </span>
                      </>
                    )}
                </div>
              </div>
            </div>

            {videoFiles.length > 0 && (
              <div className="debrid-movie-files">
                <h4 className="debrid-movie-files-title">Video Files:</h4>
                <div className="debrid-movie-file-list">
                  {videoFiles.map((file) => (
                    <div key={file.id} className="debrid-movie-file">
                      <CheckCircle
                        size={16}
                        className="debrid-movie-file-check"
                      />
                      <FileText size={16} className="debrid-movie-file-icon" />
                      <div className="debrid-movie-file-info">
                        <div className="debrid-movie-file-name">
                          {getFilenameFromPath(file.path)}
                        </div>
                        <div className="debrid-movie-file-size">
                          {formatFileSize(file.bytes)}
                        </div>
                      </div>
                      {file.subtitleFileIds.length > 0 && (
                        <div className="debrid-subtitle-badge small">
                          <Subtitles size={12} />
                          {file.subtitleFileIds.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="debrid-movie-footer">
              <button
                className="btn-secondary debrid-cancel-button"
                onClick={onDeleteTorrent}
                disabled={isProcessingDownload}
              >
                Cancel Torrent
              </button>
              <button
                className="btn-primary debrid-confirm-button"
                onClick={onConfirmSelection}
                disabled={isProcessingDownload}
              >
                {isProcessingDownload ? (
                  <>
                    <Loader2 size={18} className="debrid-spinner" />
                    {downloadProgress > 0
                      ? `Downloading ${Math.round(downloadProgress)}%`
                      : "Downloading..."}
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Claim Treasure
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TV Show View */}
        {(mediaType === "tv" || mediaType === "ambiguous") && (
          <div className="debrid-tv-view">
            <div className="debrid-tv-header">
              <div className="debrid-tv-icon">
                <Tv size={32} />
              </div>
              <div className="debrid-tv-info">
                <h3 className="debrid-tv-title">{currentTorrent.filename}</h3>
                <div className="debrid-tv-meta">
                  <span>{videoFiles.length} episodes</span>
                  <span>•</span>
                  <span>{formatFileSize(totalSize)}</span>
                </div>
              </div>
            </div>

            <div className="debrid-tv-actions">
              <button
                className="btn-secondary debrid-tv-action"
                onClick={onSelectAllFiles}
                disabled={isProcessingDownload}
              >
                Select All
              </button>
              <button
                className="btn-secondary debrid-tv-action"
                onClick={onDeselectAllFiles}
                disabled={isProcessingDownload}
              >
                Deselect All
              </button>
            </div>

            <div className="debrid-tv-files">
              <div className="debrid-tv-file-list">
                {videoFiles.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);
                  const filename = getFilenameFromPath(file.path);
                  const episodeMeta = getEpisodeMetadata(filename);

                  return (
                    <div
                      key={file.id}
                      className={`debrid-tv-file ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        onFileSelection(file.id, file.subtitleFileIds)
                      }
                    >
                      <div className="debrid-tv-file-checkbox">
                        {isSelected && <Check size={16} />}
                      </div>
                      <FileText size={16} className="debrid-tv-file-icon" />
                      <div className="debrid-tv-file-info">
                        <div className="debrid-tv-file-name">{filename}</div>
                        <div className="debrid-tv-file-meta">
                          {episodeMeta && (
                            <span className="debrid-episode-badge">
                              {episodeMeta.pattern}
                            </span>
                          )}
                          <span className="debrid-tv-file-size">
                            {formatFileSize(file.bytes)}
                          </span>
                        </div>
                      </div>
                      {file.subtitleFileIds.length > 0 && (
                        <div className="debrid-subtitle-badge small">
                          <Subtitles size={12} />
                          {file.subtitleFileIds.length}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="debrid-tv-footer">
              <div className="debrid-tv-selection-info">
                {
                  selectedFileIds.filter((id) =>
                    videoFiles.some((f) => f.id === id),
                  ).length
                }{" "}
                / {videoFiles.length} episodes selected
              </div>
              <div className="debrid-tv-buttons">
                <button
                  className="btn-secondary debrid-cancel-button"
                  onClick={onDeleteTorrent}
                  disabled={isProcessingDownload}
                >
                  Cancel Torrent
                </button>
                <button
                  className="btn-primary debrid-confirm-button"
                  onClick={onConfirmSelection}
                  disabled={isProcessingDownload}
                >
                  {isProcessingDownload ? (
                    <>
                      <Loader2 size={18} className="debrid-spinner" />
                      {downloadProgress > 0
                        ? `Downloading ${Math.round(downloadProgress)}%`
                        : "Downloading..."}
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Claim Treasure
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
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
            style={{ resize: "none" }}
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
