import React from "react";
import { HardDrive, ShieldCheck, XCircle, RotateCcw } from "lucide-react";
import { HistoryItem } from "../types";

interface SecureStatusViewProps {
    history: HistoryItem[];
    onRetry: (item: HistoryItem) => void;
}

export const SecureStatusView: React.FC<SecureStatusViewProps> = ({ history, onRetry }) => {
    // Calculate totals
    // Total processed = unique files (not counting retries as separate)
    const totalProcessed = history.filter((h) => !h.isRetry).length;
    // Success count = all successful uploads (including successful retries)
    const successCount = history.filter((h) => h.uploadStatus === "success").length;

    // Format date for display
    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <h2 className="view-title">Secure Status</h2>
                <p className="view-description">History of all uploads to your Nextcloud hoard.</p>
            </header>

            {/* Total Secured Card - Full Width */}
            <div className="history-stat-card">
                <p className="history-stat-label">Total Secured</p>
                <div className="history-stat-value">
                    <span className="history-stat-success">{successCount}</span>
                    <span className="history-stat-separator"> / </span>
                    <span className="history-stat-total">{totalProcessed}</span>
                </div>
                <p className="history-stat-hint">
                    {totalProcessed === 0
                        ? "No files processed yet"
                        : successCount === totalProcessed
                          ? "All files secured successfully!"
                          : `${totalProcessed - successCount} file${totalProcessed - successCount !== 1 ? "s" : ""} need attention`}
                </p>
            </div>

            {/* Recent Activity */}
            <div className="card activity-card">
                <h3 className="activity-header">
                    <HardDrive aria-hidden="true" />
                    Recent Activity
                </h3>

                <div className="activity-list">
                    {history.length === 0 ? (
                        <p className="activity-empty">
                            No files processed yet. Add files in Loot and secure them.
                        </p>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                className={`history-item ${item.uploadStatus === "failed" ? "failed" : ""}`}
                            >
                                <div className="history-item-main">
                                    {/* Status Icon */}
                                    {item.uploadStatus === "success" ? (
                                        <>
                                            <ShieldCheck
                                                className="history-icon success"
                                                aria-hidden="true"
                                            />
                                            <span className="sr-only">Upload successful</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle
                                                className="history-icon error"
                                                aria-hidden="true"
                                            />
                                            <span className="sr-only">Upload failed</span>
                                        </>
                                    )}

                                    {/* File Info */}
                                    <div className="history-item-info">
                                        <div className="history-item-name">
                                            {item.proposed || item.originalName}
                                            {item.isRetry && (
                                                <span className="history-retry-badge">Retry</span>
                                            )}
                                        </div>
                                        <div className="history-item-path">
                                            {item.type === "tv" ? "/TV Shows/" : "/Movies/"}
                                            {item.series}/
                                        </div>
                                        {item.uploadStatus === "failed" && item.errorMessage && (
                                            <div className="history-item-error">
                                                {item.errorMessage}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="history-item-actions">
                                    <div className="history-item-date">
                                        {formatDate(item.uploadedAt)}
                                    </div>

                                    {/* Retry Button for Failed Items */}
                                    {item.uploadStatus === "failed" && (
                                        <button
                                            className="retry-btn"
                                            onClick={() => onRetry(item)}
                                            aria-label={`Retry upload for ${item.originalName}`}
                                        >
                                            <RotateCcw size={14} aria-hidden="true" />
                                            <span>Retry</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
