import React, { useState, useEffect } from 'react';
import { Save, Server, Folder, Link, User, Key, Zap, ExternalLink } from 'lucide-react';
import { Settings, ExportResult, RealDebridConnectionResult } from '../types';

interface SettingsViewProps {
    initialSettings: Settings;
    onSave: (settings: Settings) => void;
    onTestConnection: (settings: Settings) => Promise<ExportResult>;
    onTestRealDebrid: (apiKey: string) => Promise<RealDebridConnectionResult>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    initialSettings,
    onSave,
    onTestConnection,
    onTestRealDebrid
}) => {
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [isTesting, setIsTesting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isTestingRealDebrid, setIsTestingRealDebrid] = useState(false);
    const [realDebridStatus, setRealDebridStatus] = useState<RealDebridConnectionResult | null>(null);

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    const handleSave = () => {
        onSave(settings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleTest = async () => {
        setIsTesting(true);
        try {
            const result = await onTestConnection(settings);
            alert(result.success ? "Connection Established!" : `Connection Failed: ${result.error || 'Unknown error'}`);
        } finally {
            setIsTesting(false);
        }
    };

    const handleTestRealDebrid = async () => {
        if (!settings.realDebridApiKey) {
            alert('Please enter an API token first.');
            return;
        }
        setIsTestingRealDebrid(true);
        setRealDebridStatus(null);
        try {
            const result = await onTestRealDebrid(settings.realDebridApiKey);
            setRealDebridStatus(result);
            if (!result.success) {
                alert(`Connection Failed: ${result.error || 'Unknown error'}`);
            }
        } finally {
            setIsTestingRealDebrid(false);
        }
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <h2 className="view-title">Map Configuration</h2>
                <p className="view-description">Configure your secure Nextcloud destination.</p>
            </header>

            <div className="settings-view">
                <div className="card settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Server />
                        </div>
                        <h3 className="settings-section-title">Server Connection</h3>
                    </div>

                    <div className="settings-fields">
                        <div className="form-group">
                            <label className="form-label" htmlFor="url">
                                <Link size={14} />
                                WebDAV URL
                            </label>
                            <input
                                id="url"
                                className="input-field"
                                type="text"
                                value={settings.url}
                                onChange={(e) => setSettings({ ...settings, url: e.target.value })}
                                placeholder="https://nextcloud.example.com/remote.php/dav/files/user/"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">
                                    <User size={14} />
                                    Username
                                </label>
                                <input
                                    id="username"
                                    className="input-field"
                                    type="text"
                                    value={settings.username}
                                    onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                                    placeholder="your-username"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">
                                    <Key size={14} />
                                    Password / App Token
                                </label>
                                <input
                                    id="password"
                                    className="input-field"
                                    type="password"
                                    value={settings.password}
                                    onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Folder />
                        </div>
                        <h3 className="settings-section-title">Pathing</h3>
                    </div>

                    <div className="settings-fields">
                        <div className="form-group">
                            <label className="form-label" htmlFor="targetFolderTv">
                                TV Shows Target Path
                            </label>
                            <input
                                id="targetFolderTv"
                                className="input-field"
                                type="text"
                                value={settings.targetFolderTv}
                                onChange={(e) => setSettings({ ...settings, targetFolderTv: e.target.value })}
                                placeholder="/TV Shows"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="targetFolderMovie">
                                Movies Target Path
                            </label>
                            <input
                                id="targetFolderMovie"
                                className="input-field"
                                type="text"
                                value={settings.targetFolderMovie}
                                onChange={(e) => setSettings({ ...settings, targetFolderMovie: e.target.value })}
                                placeholder="/Movies"
                            />
                            <p className="settings-hint">
                                Files will be organized into subfolders automatically based on type.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Zap />
                        </div>
                        <h3 className="settings-section-title">Real-Debrid Configuration</h3>
                    </div>

                    <div className="settings-fields">
                        <div className="form-group">
                            <label className="form-label" htmlFor="realDebridApiKey">
                                <Key size={14} />
                                API Token
                            </label>
                            <input
                                id="realDebridApiKey"
                                className="input-field"
                                type="password"
                                value={settings.realDebridApiKey || ''}
                                onChange={(e) => setSettings({ ...settings, realDebridApiKey: e.target.value })}
                                placeholder="••••••••••••••••"
                            />
                            <a
                                href="https://real-debrid.com/apitoken"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="settings-link"
                            >
                                <ExternalLink size={12} />
                                Get your API token from Real-Debrid
                            </a>
                        </div>

                        <div className="form-group">
                            <button
                                className="btn-secondary"
                                onClick={handleTestRealDebrid}
                                disabled={isTestingRealDebrid || !settings.realDebridApiKey}
                                aria-label="Test Real-Debrid connection"
                            >
                                <Zap size={18} aria-hidden="true" />
                                {isTestingRealDebrid ? 'Testing...' : 'Test Connection'}
                            </button>
                            {realDebridStatus && realDebridStatus.success && (
                                <div className="settings-success">
                                    <span>Connected as {realDebridStatus.username}</span>
                                    {realDebridStatus.expiration && (
                                        <span className="settings-hint">
                                            Premium expires: {realDebridStatus.expiration}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        className="btn-secondary"
                        onClick={handleTest}
                        disabled={isTesting}
                    >
                        <Server size={18} />
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                        className={isSaved ? 'btn-primary' : 'btn-primary'}
                        onClick={handleSave}
                        style={isSaved ? { background: 'var(--success)', color: 'var(--bg-primary)' } : undefined}
                    >
                        <Save size={18} />
                        {isSaved ? 'Saved Successfully' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};
