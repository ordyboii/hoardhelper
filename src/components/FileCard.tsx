import React from 'react';
import { FileMetadata } from '../types';
import { Tv, Film, CheckCircle, X, Edit2 } from 'lucide-react';

interface FileCardProps {
    file: FileMetadata;
    index: number;
    onEdit: (index: number) => void;
    onRemove?: (index: number) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, index, onEdit, onRemove }) => {
    // Determine if this is a TV show or movie based on parsed data
    const isTv = file.series && (file.season !== undefined || file.episode !== undefined);

    // Check if currently processing (status message contains percentage or uploading)
    const isProcessing = file.error?.includes('%') || file.error?.toLowerCase().includes('uploading');

    // Parse progress percentage from error message if processing
    const progressMatch = file.error?.match(/(\d+)%/);
    const progress = progressMatch ? parseInt(progressMatch[1], 10) : 0;

    // Determine status
    const getStatusInfo = () => {
        if (file.valid) {
            return { text: 'Ready', color: 'var(--success)' };
        }
        if (isProcessing) {
            return { text: file.error || 'Processing...', color: 'var(--warning)' };
        }
        return { text: file.error || 'Invalid', color: 'var(--error)' };
    };

    const status = getStatusInfo();
    const isComplete = file.valid && !isProcessing;

    return (
        <div
            className={isProcessing ? 'processing' : ''}
            style={{
                background: 'var(--bg-secondary)',
                border: `1px solid ${isComplete ? 'var(--success)' : isProcessing ? 'var(--gold-primary)' : 'var(--border-default)'}`,
                borderRadius: '12px',
                padding: 'var(--space-6)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)'
            }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1 }}>
                    {/* File type icon */}
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold-primary)',
                        flexShrink: 0
                    }}>
                        {isTv ? <Tv size={24} /> : <Film size={24} />}
                    </div>

                    {/* File details */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{
                            color: 'var(--text-primary)',
                            fontWeight: 'var(--weight-semibold)',
                            margin: 0,
                            marginBottom: 'var(--space-1)',
                            wordBreak: 'break-word'
                        }}>
                            {file.originalName}
                        </h4>
                        <p style={{
                            color: 'var(--text-tertiary)',
                            fontSize: 'var(--text-sm)',
                            margin: 0
                        }}>
                            {file.extension?.toUpperCase() || 'Unknown format'}
                        </p>
                    </div>
                </div>

                {/* Status indicator or remove button */}
                {isComplete ? (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(74, 222, 128, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--success)',
                        flexShrink: 0
                    }}>
                        <CheckCircle size={20} />
                    </div>
                ) : onRemove ? (
                    <button
                        onClick={() => onRemove(index)}
                        style={{
                            width: '32px',
                            height: '32px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--error)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <X size={18} />
                    </button>
                ) : null}
            </div>

            {/* Progress bar (when processing) */}
            {isProcessing && (
                <div className="progress-bar-container">
                    <div className="progress-info">
                        <span className="status">{file.error}</span>
                        <span className="percentage">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Metadata grid */}
            <div style={{
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-default)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)',
                fontSize: 'var(--text-sm)'
            }}>
                {isTv ? (
                    <>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Series:</span>
                            <span style={{ color: 'var(--text-primary)' }}>{file.series || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Season:</span>
                            <span style={{ color: 'var(--text-primary)' }}>{file.season ?? '-'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Episode:</span>
                            <span style={{ color: 'var(--text-primary)' }}>{file.episode ?? '-'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Status:</span>
                            <span style={{ color: status.color }}>{file.valid ? 'Ready' : (isProcessing ? 'Processing' : 'Pending')}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Title:</span>
                            <span style={{ color: 'var(--text-primary)' }}>{file.series || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Year:</span>
                            <span style={{ color: 'var(--text-primary)' }}>{file.year ?? '-'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', gridColumn: 'span 2' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Status:</span>
                            <span style={{ color: status.color }}>{file.valid ? 'Ready' : (isProcessing ? 'Processing' : 'Pending')}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Edit button */}
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => onEdit(index)}
                    style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'transparent',
                        color: 'var(--gold-primary)',
                        border: '1px solid var(--gold-primary)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--gold-glow)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Edit2 size={14} />
                    Edit
                </button>
            </div>
        </div>
    );
};
