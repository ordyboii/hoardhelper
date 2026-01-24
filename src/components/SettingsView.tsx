import React, { useState, useEffect } from "react";
import {
  Save,
  Server,
  Folder,
  Link,
  User,
  Key,
  Zap,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Settings, ExportResult, RealDebridConnectionResult } from "../types";
import {
  clampCheckInterval,
  MIN_CHECK_INTERVAL,
  MAX_CHECK_INTERVAL,
  DEFAULT_CHECK_INTERVAL,
} from "../logic/connectionMonitoring";

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
  onTestRealDebrid,
}) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
      // Run both tests in parallel for faster results
      const [nextcloudResult, realDebridResult] = await Promise.all([
        onTestConnection(settings),
        settings.realDebridApiKey
          ? onTestRealDebrid(settings.realDebridApiKey)
          : Promise.resolve(null),
      ]);

      // Build alert message with both results
      const messages: string[] = [];

      // Nextcloud status
      if (nextcloudResult.success) {
        messages.push("✓ Nextcloud: Connected");
      } else {
        messages.push(
          `✗ Nextcloud: Failed\n  ${nextcloudResult.error || "Unknown error"}`,
        );
      }

      // Real-Debrid status - using guard clauses to reduce nesting
      if (!settings.realDebridApiKey) {
        messages.push("○ Real-Debrid: Not configured");
      } else if (!realDebridResult || !realDebridResult.success) {
        // Handle null or failed connection
        const errorMsg = realDebridResult?.error || "Unknown error";
        messages.push(`✗ Real-Debrid: Failed\n  ${errorMsg}`);
      } else {
        // realDebridResult is guaranteed non-null and successful here
        let rdMessage = `✓ Real-Debrid: Connected as ${realDebridResult.username}`;
        if (realDebridResult.expiration) {
          rdMessage += `\n  Expires: ${realDebridResult.expiration}`;
        }
        messages.push(rdMessage);
      }

      alert(messages.join("\n\n"));
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Handles changes to the connection check interval input.
   * Validates and clamps the value using the utility function.
   */
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const clampedValue = clampCheckInterval(value);

    setSettings({ ...settings, connectionCheckInterval: clampedValue });
  };

  return (
    <div className="view-container">
      <header className="view-header">
        <h2 className="view-title">Map Configuration</h2>
        <p className="view-description">
          Configure your secure Nextcloud destination.
        </p>
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
                onChange={(e) =>
                  setSettings({ ...settings, url: e.target.value })
                }
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
                  onChange={(e) =>
                    setSettings({ ...settings, username: e.target.value })
                  }
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
                  onChange={(e) =>
                    setSettings({ ...settings, password: e.target.value })
                  }
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
                onChange={(e) =>
                  setSettings({ ...settings, targetFolderTv: e.target.value })
                }
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
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    targetFolderMovie: e.target.value,
                  })
                }
                placeholder="/Movies"
              />
              <p className="settings-hint">
                Files will be organized into subfolders automatically based on
                type.
              </p>
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <Zap />
            </div>
            <h3 className="settings-section-title">
              Real-Debrid Configuration
            </h3>
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
                value={settings.realDebridApiKey || ""}
                onChange={(e) =>
                  setSettings({ ...settings, realDebridApiKey: e.target.value })
                }
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
          </div>
        </div>

        <div className="card settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <Clock />
            </div>
            <h3 className="settings-section-title">Connection Monitoring</h3>
          </div>

          <div className="settings-fields">
            <div className="form-group">
              <label className="form-label" htmlFor="connectionCheckInterval">
                <Clock size={14} />
                Connection Check Interval (seconds)
              </label>
              <input
                id="connectionCheckInterval"
                className="input-field"
                type="number"
                min={MIN_CHECK_INTERVAL}
                max={MAX_CHECK_INTERVAL}
                value={
                  settings.connectionCheckInterval ?? DEFAULT_CHECK_INTERVAL
                }
                onChange={handleIntervalChange}
              />
              <p className="settings-hint">
                How often to check connection status ({MIN_CHECK_INTERVAL}-
                {MAX_CHECK_INTERVAL} seconds). Checks pause when app is
                minimized.
              </p>
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
            {isTesting ? "Testing..." : "Test Connection"}
          </button>
          <button
            className={isSaved ? "btn-primary" : "btn-primary"}
            onClick={handleSave}
            style={
              isSaved
                ? { background: "var(--success)", color: "var(--bg-primary)" }
                : undefined
            }
          >
            <Save size={18} />
            {isSaved ? "Saved Successfully" : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};
