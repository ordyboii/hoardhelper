import React, { useRef, useState } from 'react';
import { DownloadCloud, Sparkles } from 'lucide-react';

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
            className={`card dragon-border ${isHovering ? 'hover' : ''}`}
            style={{ 
                borderStyle: 'dashed', 
                borderWidth: '2px', 
                textAlign: 'center', 
                padding: compact ? '20px' : '60px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: isHovering ? 'rgba(255, 215, 0, 0.08)' : 'rgba(20, 20, 20, 0.5)',
                display: 'flex',
                flexDirection: compact ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px'
            }}
        >
            <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileSelect}
            />
            
            {isHovering ? (
                <Sparkles size={compact ? 32 : 64} color="var(--color-gold)" className="animate-pulse" />
            ) : (
                <DownloadCloud size={compact ? 32 : 64} color="var(--color-gold-dim)" />
            )}
            
            <div style={{ textAlign: compact ? 'left' : 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: compact ? '1rem' : '1.5rem' }}>
                    {isHovering ? "Grant Offering!" : (compact ? "Add More Artifacts" : "Present Your Treasures")}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: compact ? '0.8rem' : '1rem' }}>
                    {compact ? "Drag & drop or click" : "Drag files here to appraise"}
                </p>
            </div>
        </div>
    );
};
