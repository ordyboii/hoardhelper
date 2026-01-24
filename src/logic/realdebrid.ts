import { RealDebridConnectionResult } from '../types/index.js';

const REALDEBRID_API_BASE = 'https://api.real-debrid.com/rest/1.0';

/**
 * RealDebridClient encapsulates the API key and provides methods for Real-Debrid API interactions.
 * This prevents direct exposure of the API key at module scope.
 */
class RealDebridClient {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Makes an authenticated request to the Real-Debrid API
     */
    private async request(endpoint: string, options?: RequestInit): Promise<Response> {
        const url = `${REALDEBRID_API_BASE}${endpoint}`;
        return fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                ...options?.headers
            }
        });
    }

    /**
     * Tests the connection by fetching user information
     */
    async testConnection(): Promise<RealDebridConnectionResult> {
        try {
            const response = await this.request('/user');

            if (!response.ok) {
                if (response.status === 401) {
                    return { success: false, error: 'Invalid API token' };
                }
                return { success: false, error: `API error: ${response.status} ${response.statusText}` };
            }

            const userData = await response.json();

            // Validate response structure
            if (!userData || typeof userData !== 'object') {
                return { success: false, error: 'Invalid API response' };
            }

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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            console.error('[RealDebrid] Connection test failed:', error);
            return { success: false, error: errorMessage };
        }
    }
}

let client: RealDebridClient | null = null;

export function initializeRealDebrid(key?: string): boolean {
    if (!key || key.trim().length === 0) {
        client = null;
        return false;
    }
    client = new RealDebridClient(key);
    return true;
}

export function isRealDebridConfigured(): boolean {
    return client !== null;
}

export async function testRealDebridConnection(key?: string): Promise<RealDebridConnectionResult> {
    let clientToTest = client;

    // If a key is provided, create a temporary client for testing
    if (key && key.trim().length > 0) {
        clientToTest = new RealDebridClient(key);
    }

    if (!clientToTest) {
        return { success: false, error: 'No API key provided' };
    }

    return clientToTest.testConnection();
}
