import React from 'react';
import { Package } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-primary)'
        }}>
            <header style={{
                padding: 'var(--space-6) var(--space-8)',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(12px)',
                flexShrink: 0
            }}>
                {/* Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-primary))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px var(--gold-glow)'
                    }}>
                        <Package size={24} color="var(--bg-primary)" />
                    </div>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontFamily: 'var(--font-display)',
                            fontSize: 'var(--text-2xl)',
                            color: 'var(--gold-primary)',
                            fontWeight: 'var(--weight-bold)',
                            letterSpacing: '0.5px'
                        }}>
                            HOARDHELPER
                        </h1>
                        <span style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)'
                        }}>
                            Organize your digital treasures
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="status-badge status-active">
                    <div className="status-dot"></div>
                    Status: Active
                </div>
            </header>

            <main style={{
                flexGrow: 1,
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-8)',
                overflow: 'hidden'
            }}>
                {children}
            </main>
        </div>
    );
};
