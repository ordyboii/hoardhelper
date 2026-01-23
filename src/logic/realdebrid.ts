import { RealDebridConnectionResult } from '../types/index.js';

const REALDEBRID_API_BASE = 'https://api.real-debrid.com/rest/1.0';

let apiKey: string | null = null;

export function initializeRealDebrid(key?: string): boolean {
    if (!key) {
        apiKey = null;
        return false;
    }
    apiKey = key;
    return true;
}

export function isRealDebridConfigured(): boolean {
    return apiKey !== null && apiKey.length > 0;
}

export async function testRealDebridConnection(key?: string): Promise<RealDebridConnectionResult> {
    const testKey = key || apiKey;

    if (!testKey) {
        return { success: false, error: 'No API key provided' };
    }

    try {
        const response = await fetch(`${REALDEBRID_API_BASE}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${testKey}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'Invalid API token' };
            }
            return { success: false, error: `API error: ${response.status} ${response.statusText}` };
        }

        const userData = await response.json();

        // Format expiration date
        let expirationDisplay: string | undefined;
        if (userData.expiration) {
            const expDate = new Date(userData.expiration);
            expirationDisplay = expDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        return {
            success: true,
            username: userData.username,
            expiration: expirationDisplay
        };
    } catch (error: any) {
        console.error('[RealDebrid] Connection test failed:', error);
        return { success: false, error: error.message || 'Connection failed' };
    }
}
