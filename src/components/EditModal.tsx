import React, { useState, useEffect } from 'react';
import { FileMetadata } from '../types';
import { Save, X } from 'lucide-react';

interface EditModalProps {
    isOpen: boolean;
    file: FileMetadata | null;
    onClose: () => void;
    onSave: (updatedFile: FileMetadata) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, file, onClose, onSave }) => {
    // Local state for form fields
    const [type, setType] = useState<'tv' | 'movie'>('tv');
    const [series, setSeries] = useState('');
    const [season, setSeason] = useState<number | string>(1);
    const [episode, setEpisode] = useState<number | string>(1);

    useEffect(() => {
        if (isOpen && file) {
            setType(file.type || 'tv');
            setSeries(file.series || '');
            setSeason(file.season || 1);
            setEpisode(file.episode || 1);
        }
    }, [isOpen, file]);

    if (!isOpen || !file) return null;

    const handleSave = () => {
        const numSeason = typeof season === 'string' ? parseInt(season) : season;
        const numEpisode = typeof episode === 'string' ? parseInt(episode) : episode;

        const updated: FileMetadata = {
            ...file,
            type,
            series,
            season: type === 'tv' ? numSeason : null,
            episode: type === 'tv' ? numEpisode : null,
            // Main process will regenerate formattedSeason/Episode based on numbers, 
            // but we update local display logic by clearing them or formatting them now if we wanted.
            // For now, let's just pass the raw values back to the parent to regenerate the path.
        };
        onSave(updated);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="card dragon-border" style={{ width: '400px', backgroundColor: '#1a1a1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-gold)' }}>Appraise Artifact</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Type</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="tv" 
                                    checked={type === 'tv'} 
                                    onChange={() => setType('tv')}
                                />
                                TV Show
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="movie" 
                                    checked={type === 'movie'} 
                                    onChange={() => setType('movie')}
                                />
                                Movie
                            </label>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Title / Series</label>
                        <input 
                            className="input-field" 
                            type="text" 
                            value={series} 
                            onChange={e => setSeries(e.target.value)}
                        />
                    </div>

                    {type === 'tv' && (
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Season</label>
                                <input 
                                    className="input-field" 
                                    type="number" 
                                    min="1"
                                    value={season} 
                                    onChange={e => setSeason(e.target.value)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Episode</label>
                                <input 
                                    className="input-field" 
                                    type="number" 
                                    min="1"
                                    value={episode} 
                                    onChange={e => setEpisode(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn" onClick={handleSave}>
                        <Save size={16} />
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};
