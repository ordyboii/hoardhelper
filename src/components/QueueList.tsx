import React from "react";
import { Trash2, Film, Tv, CheckCircle, Loader2, Play, Edit } from "lucide-react";
import { FileMetadata, FileStatus } from "../types";

interface QueueListProps {
    files: FileMetadata[];
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
    onProcess: () => void;
    isProcessing: boolean;
    progress: { [key: number]: number };
}

export const QueueList: React.FC<QueueListProps> = ({
    files,
    onEdit,
    onRemove,
    onProcess,
    isProcessing,
    progress
}) => {
    const hasFiles = files.length > 0;
    const validCount = files.filter((f) => f.valid).length;
    const allSecured = hasFiles && files.every((f) => !f.valid && f.error?.includes("SECURED"));

    const getFileStatus = (file: FileMetadata, index: number): FileStatus => {
        if (progress[index] !== undefined && progress[index] < 100) {
            return FileStatus.Processing;
        }
        if (!file.valid && file.error?.includes("SECURED")) {
            return FileStatus.Secured;
        }
        if (!file.valid && file.error) {
            return FileStatus.Error;
        }
        return FileStatus.Ready;
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="view-header-row">
                    <div>
                        <h2 className="view-title">Extraction Queue</h2>
                        <p className="view-description">
                            Review standardized names before securing.
                        </p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={onProcess}
                        disabled={validCount === 0 || isProcessing || allSecured}
                        style={{ width: "auto" }}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={18} className="processing" aria-hidden="true" />
                                Processing...
                            </>
                        ) : allSecured ? (
                            <>
                                <CheckCircle size={18} aria-hidden="true" />
                                All Secured
                            </>
                        ) : (
                            <>
                                <Play size={18} aria-hidden="true" />
                                Secure in Hoard
                                <span className="badge" aria-label={`${validCount} files ready`}>
                                    {validCount}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="queue-container">
                <div className="queue-header">
                    <div>Type</div>
                    <div>Original Filename</div>
                    <div>Proposed Standard</div>
                    <div>Actions</div>
                </div>

                <div className="queue-body">
                    {!hasFiles ? (
                        <div className="queue-empty">
                            <Film aria-hidden="true" />
                            <p className="queue-empty-title">No items in queue.</p>
                            <p className="queue-empty-text">Go to Loot to add files.</p>
                        </div>
                    ) : (
                        files.map((file, index) => {
                            const status = getFileStatus(file, index);
                            const isFileProcessing = status === FileStatus.Processing;

                            return (
                                <div
                                    key={`${file.originalName}-${index}`}
                                    className="queue-row"
                                    tabIndex={0}
                                >
                                    {/* Type Icon */}
                                    <div
                                        className={`queue-cell queue-type-icon ${file.type === "tv" ? "tv" : "movie"}`}
                                    >
                                        {file.type === "movie" ? (
                                            <>
                                                <Film aria-hidden="true" />
                                                <span className="sr-only">Movie</span>
                                            </>
                                        ) : (
                                            <>
                                                <Tv aria-hidden="true" />
                                                <span className="sr-only">TV Show</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Original Filename */}
                                    <div
                                        className="queue-cell queue-original"
                                        title={file.originalName}
                                    >
                                        {file.originalName}
                                    </div>

                                    {/* Proposed Standard */}
                                    <div
                                        className="queue-cell queue-proposed"
                                        title={file.proposed || ""}
                                    >
                                        {file.proposed || "Unable to generate path"}
                                    </div>

                                    {/* Actions */}
                                    <div className="queue-cell queue-actions">
                                        {isFileProcessing ? (
                                            <span className="queue-status processing">
                                                <Loader2
                                                    size={14}
                                                    className="processing"
                                                    aria-hidden="true"
                                                />
                                                <span>{Math.round(progress[index] || 0)}%</span>
                                            </span>
                                        ) : status !== FileStatus.Secured ? (
                                            <>
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => onEdit(index)}
                                                    aria-label={`Edit metadata for ${file.originalName}`}
                                                >
                                                    <Edit size={18} aria-hidden="true" />
                                                </button>
                                                <button
                                                    className="icon-btn danger"
                                                    onClick={() => onRemove(index)}
                                                    aria-label={`Remove ${file.originalName} from queue`}
                                                >
                                                    <Trash2 size={18} aria-hidden="true" />
                                                </button>
                                            </>
                                        ) : null}
                                    </div>

                                    {isFileProcessing && (
                                        <div className="queue-progress">
                                            <div
                                                className="queue-progress-fill"
                                                style={{ width: `${progress[index] || 0}%` }}
                                                role="progressbar"
                                                aria-valuenow={progress[index] || 0}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
