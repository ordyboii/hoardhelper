import React from 'react';
import { FileMetadata } from '../types';
import { FileCard } from './FileCard';
import { Scroll } from 'lucide-react';

interface HoardTableProps {
    files: FileMetadata[];
    onEdit: (index: number) => void;
    onRemove?: (index: number) => void;
}

export const HoardTable: React.FC<HoardTableProps> = ({ files, onEdit, onRemove }) => {
    if (files.length === 0) {
        return (
            <div style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 'var(--space-16) var(--space-8)',
                textAlign: 'center'
            }}>
                {/* Large empty icon container */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--border-default)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-8)',
                    color: 'rgba(212, 175, 55, 0.3)'
                }}>
                    <Scroll size={64} />
                </div>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--text-tertiary)',
                    margin: 0,
                    marginBottom: 'var(--space-2)'
                }}>
                    The hoard is empty
                </h3>
                <p style={{
                    color: 'var(--text-tertiary)',
                    margin: 0,
                    opacity: 0.7
                }}>
                    Drop files above to begin organizing your collection
                </p>
            </div>
        );
    }

    return (
        <div style={{
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                overflowY: 'auto',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
            }}>
                {files.map((file, index) => (
                    <FileCard
                        key={`${file.originalName}-${index}`}
                        file={file}
                        index={index}
                        onEdit={onEdit}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
};
