import React from "react";
import { Archive, Shield, Box, X, HardDrive, Settings } from "lucide-react";
import { ViewState } from "../types";

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  itemCount: number;
  isOpen: boolean;
  onClose: () => void;
  nextcloudConnected?: boolean;
  realDebridConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  itemCount,
  isOpen,
  onClose,
  nextcloudConnected = false,
  realDebridConnected = false,
}) => {
  const navItems = [
    { id: ViewState.Loot, label: "Loot", icon: Box, description: "Inventory" },
    {
      id: ViewState.Extraction,
      label: "Extraction",
      icon: Archive,
      description: "Queue",
      badge: itemCount > 0 ? itemCount : undefined,
    },
    {
      id: ViewState.Secure,
      label: "Secure",
      icon: Shield,
      description: "Status",
    },
  ];

  const handleNavClick = (view: ViewState) => {
    onChangeView(view);
    onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <HardDrive size={20} aria-hidden="true" />
          </div>
          <div>
            <h1 className="sidebar-title">HoardHelper</h1>
            <p className="sidebar-subtitle">v1.0</p>
          </div>
        </div>
        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`nav-item ${currentView === item.id ? "active" : ""}`}
            aria-current={currentView === item.id ? "page" : undefined}
          >
            <item.icon className="nav-item-icon" aria-hidden="true" />
            <div className="nav-item-content">
              <span className="nav-item-label">{item.label}</span>
              <span className="nav-item-description">{item.description}</span>
            </div>
            {item.badge !== undefined && (
              <span className="nav-badge" aria-label={`${item.badge} items`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Settings Link */}
        <button
          className={`sidebar-settings-link ${currentView === ViewState.Map ? "active" : ""}`}
          onClick={() => handleNavClick(ViewState.Map)}
          aria-label="Open settings"
        >
          <Settings size={18} aria-hidden="true" />
          <span>Settings</span>
        </button>

        {/* System Status Card */}
        <div className="system-status-card">
          <p className="system-status-title">System Status</p>
          <div className="system-status-row">
            <span className="system-status-label">Nextcloud</span>
            <span
              className={`system-status-value ${nextcloudConnected ? "success" : "warning"}`}
              aria-label={
                nextcloudConnected
                  ? "Nextcloud connected"
                  : "Nextcloud not configured"
              }
            >
              {nextcloudConnected ? "Connected" : "Not Configured"}
            </span>
          </div>
          <div className="system-status-row">
            <span className="system-status-label">Real-Debrid</span>
            <span
              className={`system-status-value ${realDebridConnected ? "success" : "warning"}`}
              aria-label={
                realDebridConnected
                  ? "Real-Debrid connected"
                  : "Real-Debrid not configured"
              }
            >
              {realDebridConnected ? "Connected" : "Not Configured"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
