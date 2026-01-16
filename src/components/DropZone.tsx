import React, { useRef, useState } from 'react';
import { Gem, Sparkles } from 'lucide-react';

interface DropZoneProps {
    onFilesDropped: (files: File[]) => void;
    compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, compact = false }) => {
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
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${isHovering ? 'var(--gold-primary)' : 'var(--border-default)'}`,
                borderRadius: '16px',
                padding: compact ? 'var(--space-5) var(--space-6)' : 'var(--space-16) var(--space-12)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isHovering
                    ? 'radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%)'
                    : 'radial-gradient(circle at center, rgba(26, 26, 26, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)',
                boxShadow: isHovering ? 'inset 0 0 48px var(--gold-glow)' : 'none',
                display: 'flex',
                flexDirection: compact ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: compact ? 'var(--space-4)' : 'var(--space-6)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Shimmer effect on hover */}
            {isHovering && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
                    animation: 'shimmer 1.5s ease infinite',
                    pointerEvents: 'none'
                }} />
            )}

            <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            {/* Icon wrapper with gradient */}
            <div style={{
                width: compact ? '48px' : '80px',
                height: compact ? '48px' : '80px',
                background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-light))',
                borderRadius: compact ? '12px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px var(--gold-glow)',
                transition: 'transform 0.3s ease',
                transform: isHovering ? 'translateY(-4px) scale(1.05)' : 'none',
                flexShrink: 0
            }}>
                {isHovering ? (
                    <Sparkles size={compact ? 24 : 40} color="var(--bg-primary)" />
                ) : (
                    <Gem size={compact ? 24 : 40} color="var(--bg-primary)" />
                )}
            </div>

            <div style={{ textAlign: compact ? 'left' : 'center', position: 'relative', zIndex: 1 }}>
                <h3 style={{
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--gold-primary)',
                    fontSize: compact ? 'var(--text-lg)' : 'var(--text-3xl)',
                    marginBottom: compact ? 'var(--space-1)' : 'var(--space-3)'
                }}>
                    {isHovering ? "Release Your Treasures!" : (compact ? "Add More Artifacts" : "Present Your Treasures")}
                </h3>
                <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
                    marginBottom: compact ? 0 : 'var(--space-4)'
                }}>
                    {compact ? "Drag & drop or click" : "Drag files here to appraise"}
                </p>
                {!compact && (
                    <p style={{
                        margin: 0,
                        color: 'var(--text-tertiary)',
                        fontSize: 'var(--text-sm)'
                    }}>
                        Supported formats: MP4, MKV, AVI, MOV
                    </p>
                )}
            </div>
        </div>
    );
};
