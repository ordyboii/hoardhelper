import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { Save, X, Server, Folder } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Settings) => void;
    initialSettings: Settings;
    onTestConnection: (settings: Settings) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, onSave, initialSettings, onTestConnection 
}) => {
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [isTesting, setIsTesting] = useState(false);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSettings(initialSettings);
        }
    }, [isOpen, initialSettings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const handleTest = async () => {
        setIsTesting(true);
        try {
            const success = await onTestConnection(settings);
            alert(success ? "Connection Established!" : "Connection Failed. Check logs.");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="card dragon-border" style={{ width: '500px', backgroundColor: '#1a1a1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-gold)' }}>Treasure Map Settings</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>
                            <Server size={14} style={{ display: 'inline', marginRight: '5px' }} />
                            WebDAV URL
                        </label>
                        <input 
                            className="input-field" 
                            type="text" 
                            value={settings.url} 
                            onChange={e => setSettings({...settings, url: e.target.value})}
                            placeholder="https://nextcloud.example.com/remote.php/dav/files/user/"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>
                                <Folder size={14} style={{ display: 'inline', marginRight: '5px' }} />
                                TV Target Path
                            </label>
                            <input 
                                className="input-field" 
                                type="text" 
                                value={settings.targetFolderTv} 
                                onChange={e => setSettings({...settings, targetFolderTv: e.target.value})}
                                placeholder="/TV Shows"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>
                                <Folder size={14} style={{ display: 'inline', marginRight: '5px' }} />
                                Movie Target Path
                            </label>
                            <input 
                                className="input-field" 
                                type="text" 
                                value={settings.targetFolderMovie} 
                                onChange={e => setSettings({...settings, targetFolderMovie: e.target.value})}
                                placeholder="/Movies"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Username</label>
                        <input 
                            className="input-field" 
                            type="text" 
                            value={settings.username} 
                            onChange={e => setSettings({...settings, username: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Password / App Token</label>
                        <input 
                            className="input-field" 
                            type="password" 
                            value={settings.password} 
                            onChange={e => setSettings({...settings, password: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn-secondary" onClick={handleTest} disabled={isTesting}>
                        {isTesting ? "Testing..." : "Test Map"}
                    </button>
                    <div style={{ flexGrow: 1 }}></div>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn" onClick={handleSave}>
                        <Save size={16} />
                        Save Map
                    </button>
                </div>
            </div>
        </div>
    );
};
