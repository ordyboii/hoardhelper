import { z } from "zod";
import {
  RealDebridConnectionResult,
  AddMagnetResult,
  TorrentInfo,
} from "../types/index.js";

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
  email: z.string().min(1), // Real-Debrid masks emails (e.g., "u***@example.com"), so we can't use strict .email() validation
  points: z.number().int().nonnegative(),
  locale: z.string().min(2).max(5), // e.g., "en", "en-US"
  avatar: z.string().url(),
  type: z.string().min(1), // e.g., "premium", "free"
  premium: z.number().int().nonnegative(),
  expiration: z.string().datetime().optional(), // ISO 8601 datetime string
});

/**
 * Zod schema for Real-Debrid /torrents/addMagnet API response
 */
const AddMagnetResponseSchema = z.object({
  id: z.string(), // Torrent ID
  uri: z.string().url(), // URL of the created resource
});

/**
 * Zod schema for Real-Debrid /torrents/info/{id} API response
 */
const TorrentFileSchema = z.object({
  id: z.number().int().nonnegative(),
  path: z.string().startsWith("/"), // Path starting with "/"
  bytes: z.number().int().nonnegative(),
  selected: z
    .number()
    .int()
    .refine((val) => val === 0 || val === 1, "selected must be 0 or 1"),
});

const TorrentInfoResponseSchema = z.object({
  id: z.string(),
  filename: z.string().min(1),
  original_filename: z.string().min(1),
  hash: z.string().min(40), // SHA1 is 40 hex characters
  bytes: z.number().int().nonnegative(),
  original_bytes: z.number().int().nonnegative(),
  host: z.string().min(1),
  split: z.number().int().positive(),
  progress: z.number().min(0).max(100),
  status: z.string().min(1),
  added: z.string().datetime(),
  files: z.array(TorrentFileSchema),
  links: z.array(z.string().url()),
  ended: z.string().datetime().optional(),
  speed: z.number().int().nonnegative().optional(),
  seeders: z.number().int().nonnegative().optional(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
type _RealDebridUserResponse = z.infer<typeof RealDebridUserResponseSchema>;
type _AddMagnetResponse = z.infer<typeof AddMagnetResponseSchema>;
type _TorrentInfoResponse = z.infer<typeof TorrentInfoResponseSchema>;

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
  private async request(
    endpoint: string,
    options?: RequestInit,
  ): Promise<Response> {
    const url = `${REALDEBRID_API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...options?.headers,
        },
      });
    } finally {
      clearTimeout(timeout);
    }
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
          error: `API error: ${response.status} ${response.statusText}`,
        };
      }

      const rawData = await response.json();

      // Validate response structure with Zod
      const parseResult = RealDebridUserResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        console.error("[RealDebrid] Invalid API response structure:", {
          data: rawData,
          errors: parseResult.error.issues,
        });
        return {
          success: false,
          error: `Invalid API response: ${parseResult.error.issues[0]?.message || "Unknown validation error"}`,
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
              day: "numeric",
            });
          }
        } catch (_dateError) {
          console.warn(
            "[RealDebrid] Failed to parse expiration date:",
            userData.expiration,
          );
          // Continue without expiration display
        }
      }

      return {
        success: true,
        username: userData.username,
        expiration: expirationDisplay,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      console.error("[RealDebrid] Connection test failed:", error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Adds a magnet link to Real-Debrid
   */
  async addMagnet(magnet: string): Promise<AddMagnetResult> {
    try {
      const response = await this.request("/torrents/addMagnet", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `magnet=${encodeURIComponent(magnet)}`,
      });

      if (!response.ok) {
        // Handle specific error cases
        switch (response.status) {
          case 400:
            return { success: false, error: "Invalid magnet link" };
          case 401:
            return { success: false, error: "Invalid API token" };
          case 403:
            return {
              success: false,
              error:
                "Account locked or not premium - Real-Debrid premium required for torrents",
            };
          case 429:
            return {
              success: false,
              error: "Too many requests - please wait 60 seconds",
            };
          case 503:
            return {
              success: false,
              error:
                "Service unavailable - the torrent may be dead or not supported",
            };
          default:
            return {
              success: false,
              error: `API error: ${response.status} ${response.statusText}`,
            };
        }
      }

      const rawData = await response.json();

      // Validate response structure with Zod
      const parseResult = AddMagnetResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        console.error("[RealDebrid] Invalid addMagnet response structure:", {
          data: rawData,
          errors: parseResult.error.issues,
        });
        return {
          success: false,
          error: `Invalid API response: ${parseResult.error.issues[0]?.message || "Unknown validation error"}`,
        };
      }

      const magnetData = parseResult.data;

      return {
        success: true,
        torrentId: magnetData.id,
        uri: magnetData.uri,
      };
    } catch (error) {
      // Handle network errors
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          error: "Connection timeout - please try again",
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to add magnet";
      console.error("[RealDebrid] addMagnet failed:", error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Gets torrent information including file list
   */
  async getTorrentInfo(torrentId: string): Promise<TorrentInfo> {
    try {
      const response = await this.request(`/torrents/info/${torrentId}`);

      if (!response.ok) {
        // Handle specific error cases
        switch (response.status) {
          case 401:
            throw new Error("Invalid API token");
          case 403:
            throw new Error("Permission denied - account locked");
          case 404:
            throw new Error("Unknown torrent resource");
          default:
            throw new Error(
              `API error: ${response.status} ${response.statusText}`,
            );
        }
      }

      const rawData = await response.json();

      // Validate response structure with Zod
      const parseResult = TorrentInfoResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        console.error("[RealDebrid] Invalid torrent info response structure:", {
          data: rawData,
          errors: parseResult.error.issues,
        });
        throw new Error(
          `Invalid API response: ${parseResult.error.issues[0]?.message || "Unknown validation error"}`,
        );
      }

      const torrentData = parseResult.data;

      // Return the validated and typed torrent info
      return torrentData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error("[RealDebrid] getTorrentInfo failed:", error);
      throw new Error("Failed to fetch torrent information");
    }
  }

  /**
   * Selects files for download from a torrent
   */
  async selectFiles(
    torrentId: string,
    fileIds: number[],
  ): Promise<TorrentInfo> {
    try {
      const response = await this.request(
        `/torrents/selectFiles/${torrentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `files=${fileIds.join(",")}`,
        },
      );

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error("Invalid API token");
          case 403:
            throw new Error("Permission denied - account locked");
          case 404:
            throw new Error("Unknown torrent resource");
          case 503:
            throw new Error("Service unavailable - torrent may be dead");
          default:
            throw new Error(
              `API error: ${response.status} ${response.statusText}`,
            );
        }
      }

      return await this.getTorrentInfo(torrentId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error("[RealDebrid] selectFiles failed:", error);
      throw new Error("Failed to select files");
    }
  }

  /**
   * Polls torrent status until downloaded or timeout
   * Polls every 5 seconds with a 10-minute timeout
   */
  async pollTorrentUntilDownloaded(torrentId: string): Promise<TorrentInfo> {
    const MAX_POLL_ATTEMPTS = 120;
    const POLL_INTERVAL_MS = 5000;

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const info = await this.getTorrentInfo(torrentId);

      if (info.status === "downloaded") {
        return info;
      }

      if (["error", "dead", "magnet_error", "virus"].includes(info.status)) {
        throw new Error(`Torrent failed with status: ${info.status}`);
      }

      if (attempt < MAX_POLL_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    }

    throw new Error("Torrent download timeout after 10 minutes");
  }

  /**
   * Deletes a torrent from Real-Debrid
   */
  async deleteTorrent(torrentId: string): Promise<void> {
    try {
      const response = await this.request(`/torrents/delete/${torrentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error("Invalid API token");
          case 403:
            throw new Error("Permission denied - account locked");
          case 404:
            throw new Error("Unknown torrent resource");
          default:
            throw new Error(
              `API error: ${response.status} ${response.statusText}`,
            );
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error("[RealDebrid] deleteTorrent failed:", error);
      throw new Error("Failed to delete torrent");
    }
  }

  async unrestrictLink(link: string): Promise<{ download: string }> {
    try {
      const response = await this.request("/unrestrict/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `link=${encodeURIComponent(link)}`,
      });

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error("Invalid link");
          case 401:
            throw new Error("Invalid API token");
          case 403:
            throw new Error("Permission denied - account locked");
          case 503:
            throw new Error("Service unavailable");
          default:
            throw new Error(
              `API error: ${response.status} ${response.statusText}`,
            );
        }
      }

      const rawData = await response.json();
      return { download: rawData.download };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to unrestrict link");
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

export async function testRealDebridConnection(
  key?: string,
): Promise<RealDebridConnectionResult> {
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

/**
 * Adds a magnet link to Real-Debrid
 */
export async function addMagnetToRealDebrid(
  magnet: string,
): Promise<AddMagnetResult> {
  if (!client) {
    return { success: false, error: "Real-Debrid not configured" };
  }

  // Basic magnet link validation
  if (!magnet || typeof magnet !== "string") {
    return { success: false, error: "Please enter a valid magnet link" };
  }

  // Check if it's a valid magnet link format
  if (!magnet.startsWith("magnet:?xt=urn:btih:")) {
    return { success: false, error: "Please enter a valid magnet link" };
  }

  // Check for extremely long magnets (over 2000 characters)
  if (magnet.length > 2000) {
    return {
      success: false,
      error: "Magnet link is too long - please check the link",
    };
  }

  return client.addMagnet(magnet);
}

/**
 * Gets torrent information including file list
 */
export async function getTorrentInfo(torrentId: string): Promise<TorrentInfo> {
  if (!client) {
    throw new Error("Real-Debrid not configured");
  }

  if (!torrentId || typeof torrentId !== "string") {
    throw new Error("Invalid torrent ID");
  }

  return client.getTorrentInfo(torrentId);
}

/**
 * Selects files for download from a torrent
 */
export async function selectFiles(
  torrentId: string,
  fileIds: number[],
): Promise<TorrentInfo> {
  if (!client) {
    throw new Error("Real-Debrid not configured");
  }

  if (!torrentId || typeof torrentId !== "string") {
    throw new Error("Invalid torrent ID");
  }

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error("Invalid file IDs");
  }

  return client.selectFiles(torrentId, fileIds);
}

/**
 * Polls torrent status until downloaded or timeout
 */
export async function pollTorrentUntilDownloaded(
  torrentId: string,
): Promise<TorrentInfo> {
  if (!client) {
    throw new Error("Real-Debrid not configured");
  }

  if (!torrentId || typeof torrentId !== "string") {
    throw new Error("Invalid torrent ID");
  }

  return client.pollTorrentUntilDownloaded(torrentId);
}

/**
 * Deletes a torrent from Real-Debrid
 */
export async function deleteTorrent(torrentId: string): Promise<void> {
  if (!client) {
    throw new Error("Real-Debrid not configured");
  }

  if (!torrentId || typeof torrentId !== "string") {
    throw new Error("Invalid torrent ID");
  }

  return client.deleteTorrent(torrentId);
}

export async function unrestrictLink(link: string): Promise<string> {
  if (!client) {
    throw new Error("Real-Debrid not configured");
  }

  if (!link || typeof link !== "string") {
    throw new Error("Invalid link");
  }

  const result = await client.unrestrictLink(link);
  return result.download;
}
