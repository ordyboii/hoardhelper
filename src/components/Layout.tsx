import React from 'react';
import { Ghost as Dragon } from 'lucide-react'; // Lucide doesn't have a Dragon, Ghost is close enough or I'll use a Crown/Gem
import { Coins } from 'lucide-react';

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
            background: 'radial-gradient(circle at top right, #1a1a00, var(--bg-app))'
        }}>
            <header style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                background: 'rgba(20, 20, 20, 0.9)',
                flexShrink: 0
            }}>
                <Dragon size={32} color="var(--color-gold)" />
                <div>
                    <h1 style={{ margin: 0, color: 'var(--color-gold)', fontSize: '1.5rem', letterSpacing: '1px' }}>
                        HOARDHELPER
                    </h1>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Organize your digital treasures
                    </span>
                </div>
                <div style={{ flexGrow: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Coins size={20} color="var(--color-gold-dim)" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-gold)' }}>Status: Active</span>
                </div>
            </header>
            <main style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
                {children}
            </main>
        </div>
    );
};
