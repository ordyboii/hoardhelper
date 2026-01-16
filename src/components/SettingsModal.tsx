import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { Save, X, Server, Folder, Link, User, Key } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Settings) => void;
    initialSettings: Settings;
    onTestConnection: (settings: Settings) => Promise<boolean>;
}

type TabType = 'connection' | 'paths';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, onSave, initialSettings, onTestConnection
}) => {
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [isTesting, setIsTesting] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('connection');

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSettings(initialSettings);
            setActiveTab('connection');
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

    const tabs: { id: TabType; label: string }[] = [
        { id: 'connection', label: 'Connection' },
        { id: 'paths', label: 'Paths' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '16px',
                    width: '560px',
                    maxWidth: '90vw',
                    animation: 'scaleIn 0.2s ease'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-6)',
                    borderBottom: '1px solid var(--border-default)'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-2xl)',
                        color: 'var(--gold-primary)'
                    }}>
                        Treasure Map Settings
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            padding: 'var(--space-2)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    padding: '0 var(--space-6)',
                    borderBottom: '1px solid var(--border-default)'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: 'var(--space-3) var(--space-6)',
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === tab.id ? 'var(--gold-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--gold-primary)' : 'transparent'}`,
                                transition: 'all 0.2s ease',
                                marginBottom: '-1px',
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 'var(--weight-medium)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: 'var(--space-6)' }}>
                    {activeTab === 'connection' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    marginBottom: 'var(--space-2)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-medium)'
                                }}>
                                    <Link size={14} style={{ color: 'var(--gold-primary)' }} />
                                    WebDAV URL
                                </label>
                                <input
                                    className="input-field"
                                    type="text"
                                    value={settings.url}
                                    onChange={e => setSettings({ ...settings, url: e.target.value })}
                                    placeholder="https://nextcloud.example.com/remote.php/dav/files/user/"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    marginBottom: 'var(--space-2)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-medium)'
                                }}>
                                    <User size={14} style={{ color: 'var(--gold-primary)' }} />
                                    Username
                                </label>
                                <input
                                    className="input-field"
                                    type="text"
                                    value={settings.username}
                                    onChange={e => setSettings({ ...settings, username: e.target.value })}
                                    placeholder="your-username"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    marginBottom: 'var(--space-2)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-medium)'
                                }}>
                                    <Key size={14} style={{ color: 'var(--gold-primary)' }} />
                                    Password / App Token
                                </label>
                                <input
                                    className="input-field"
                                    type="password"
                                    value={settings.password}
                                    onChange={e => setSettings({ ...settings, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'paths' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    marginBottom: 'var(--space-2)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-medium)'
                                }}>
                                    <Folder size={14} style={{ color: 'var(--gold-primary)' }} />
                                    TV Shows Target Path
                                </label>
                                <input
                                    className="input-field"
                                    type="text"
                                    value={settings.targetFolderTv}
                                    onChange={e => setSettings({ ...settings, targetFolderTv: e.target.value })}
                                    placeholder="/TV Shows"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    marginBottom: 'var(--space-2)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--weight-medium)'
                                }}>
                                    <Folder size={14} style={{ color: 'var(--gold-primary)' }} />
                                    Movies Target Path
                                </label>
                                <input
                                    className="input-field"
                                    type="text"
                                    value={settings.targetFolderMovie}
                                    onChange={e => setSettings({ ...settings, targetFolderMovie: e.target.value })}
                                    placeholder="/Movies"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-6)',
                    borderTop: '1px solid var(--border-default)'
                }}>
                    <button
                        className="btn-secondary"
                        onClick={handleTest}
                        disabled={isTesting}
                        style={{ flex: 1 }}
                    >
                        <Server size={18} />
                        {isTesting ? "Testing..." : "Test Connection"}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        style={{ flex: 1 }}
                    >
                        <Save size={18} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
