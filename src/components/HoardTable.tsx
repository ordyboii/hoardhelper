import React from 'react';
import { FileMetadata } from '../types';
import { Edit2, CheckCircle, AlertTriangle, Scroll } from 'lucide-react';

interface HoardTableProps {
    files: FileMetadata[];
    onEdit: (index: number) => void;
}

export const HoardTable: React.FC<HoardTableProps> = ({ files, onEdit }) => {
    if (files.length === 0) {
        return (
            <div style={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                opacity: 0.3,
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '40px'
            }}>
                <Scroll size={64} />
                <p>The hoard is empty.</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 1 }}>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '15px', color: 'var(--color-gold-dim)', width: '25%' }}>Original Artifact</th>
                            <th style={{ padding: '15px', color: 'var(--color-gold-dim)', width: '15%' }}>Status</th>
                            <th style={{ padding: '15px', color: 'var(--color-gold-dim)', width: '48%' }}>New Designation</th>
                            <th style={{ padding: '15px', color: 'var(--color-gold-dim)', textAlign: 'right', width: '12%' }}>Appraise</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => (
                            <tr key={`${file.originalName}-${index}`} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ 
                                    padding: '12px 15px', 
                                    color: file.valid ? 'var(--color-emerald)' : 'var(--color-dragon-red)',
                                    overflowWrap: 'anywhere',
                                    fontSize: '0.85rem'
                                }}>
                                    {file.originalName}
                                </td>
                                <td style={{ padding: '12px 15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {file.valid ? (
                                            <CheckCircle size={16} color="var(--color-emerald)" />
                                        ) : (
                                            <AlertTriangle size={16} color="var(--color-dragon-red)" />
                                        )}
                                        <span style={{ fontSize: '0.8em' }}>{file.valid ? 'Ready' : (file.error || 'Invalid')}</span>
                                    </div>
                                </td>
                                <td style={{ 
                                    padding: '12px 15px', 
                                    fontFamily: 'monospace', 
                                    color: '#a0a0a0', 
                                    fontSize: '0.75rem',
                                    overflowWrap: 'anywhere',
                                    lineHeight: '1.4'
                                }}>
                                    {file.proposed || '-'}
                                </td>
                                <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => onEdit(index)}
                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                    >
                                        <Edit2 size={14} style={{ marginRight: '4px' }} />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
