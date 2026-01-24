import { z } from "zod";
import { RealDebridConnectionResult } from "../types/index.js";

const REALDEBRID_API_BASE = "https://api.real-debrid.com/rest/1.0";

/**
 * Zod schema for Real-Debrid /user API response
 *
 * Validates all required fields and optional expiration date.
 * Based on Real-Debrid API documentation.
 */
const RealDebridUserResponseSchema = z.object({
    id: z.number().int().positive(),
    username: z.string().min(1),
    email: z.string().email(),
    points: z.number().int().nonnegative(),
    locale: z.string().min(2).max(5), // e.g., "en", "en-US"
    avatar: z.string().url(),
    type: z.string().min(1), // e.g., "premium", "free"
    premium: z.number().int().nonnegative(),
    expiration: z.string().datetime().optional() // ISO 8601 datetime string
});

/**
 * TypeScript type inferred from Zod schema
 */
type _RealDebridUserResponse = z.infer<typeof RealDebridUserResponseSchema>;

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
                Authorization: `Bearer ${this.apiKey}`,
                ...options?.headers
            }
        });
    }

    /**
     * Tests the connection by fetching user information
     */
    async testConnection(): Promise<RealDebridConnectionResult> {
        try {
            const response = await this.request("/user");

            if (!response.ok) {
                if (response.status === 401) {
                    return { success: false, error: "Invalid API token" };
                }
                return {
                    success: false,
                    error: `API error: ${response.status} ${response.statusText}`
                };
            }

            const rawData = await response.json();

            // Validate response structure with Zod
            const parseResult = RealDebridUserResponseSchema.safeParse(rawData);

            if (!parseResult.success) {
                console.error("[RealDebrid] Invalid API response structure:", {
                    data: rawData,
                    errors: parseResult.error.issues
                });
                return {
                    success: false,
                    error: `Invalid API response: ${parseResult.error.issues[0]?.message || "Unknown validation error"}`
                };
            }

            const userData = parseResult.data;

            // Format expiration date if present
            let expirationDisplay: string | undefined;
            if (userData.expiration) {
                try {
                    const expDate = new Date(userData.expiration);
                    // Validate that the date is valid (Zod validates ISO format, but we still check)
                    if (!isNaN(expDate.getTime())) {
                        expirationDisplay = expDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        });
                    }
                } catch (_dateError) {
                    console.warn(
                        "[RealDebrid] Failed to parse expiration date:",
                        userData.expiration
                    );
                    // Continue without expiration display
                }
            }

            return {
                success: true,
                username: userData.username,
                expiration: expirationDisplay
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Connection failed";
            console.error("[RealDebrid] Connection test failed:", error);
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
        return { success: false, error: "No API key provided" };
    }

    return clientToTest.testConnection();
}
