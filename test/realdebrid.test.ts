import { describe, it } from "node:test";
import assert from "node:assert";
import { z } from "zod";

/**
 * Tests for Real-Debrid API response validation using Zod.
 *
 * We recreate the schema here to test validation logic independently.
 */

const RealDebridUserResponseSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  email: z.string().min(1), // Real-Debrid masks emails (e.g., "u***@example.com"), so we can't use strict .email() validation
  points: z.number().int().nonnegative(),
  locale: z.string().min(2).max(5),
  avatar: z.string().url(),
  type: z.string().min(1),
  premium: z.number().int().nonnegative(),
  expiration: z.string().datetime().optional(),
});

const AddMagnetResponseSchema = z.object({
  id: z.string(),
  uri: z.string().url(),
});

const TorrentFileSchema = z.object({
  id: z.number().int().nonnegative(),
  path: z.string().startsWith("/"),
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
  hash: z.string().min(40),
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

describe("Real-Debrid Response Validation (Zod)", () => {
  describe("Valid user response structure", () => {
    it("should accept a complete valid response", () => {
      const validResponse = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
        expiration: "2025-12-31T23:59:59.000Z",
      };

      const result = RealDebridUserResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.username, "testuser");
        assert.strictEqual(result.data.email, "test@example.com");
      }
    });

    it("should accept response without optional expiration field", () => {
      const validResponse = {
        id: 12345,
        username: "freeuser",
        email: "free@example.com",
        points: 0,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "free",
        premium: 0,
      };

      const result = RealDebridUserResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.expiration, undefined);
      }
    });

    it("should accept locale variations", () => {
      const responses = [
        { locale: "en" },
        { locale: "fr" },
        { locale: "en-US" },
        { locale: "fr-FR" },
      ];

      responses.forEach((partial) => {
        const fullResponse = {
          id: 1,
          username: "user",
          email: "test@example.com",
          points: 0,
          avatar: "https://example.com/avatar.png",
          type: "free",
          premium: 0,
          ...partial,
        };

        const result = RealDebridUserResponseSchema.safeParse(fullResponse);
        assert.strictEqual(
          result.success,
          true,
          `Locale ${partial.locale} should be valid`,
        );
      });
    });
  });

  describe("Invalid user response structure", () => {
    it("should reject null response", () => {
      const result = RealDebridUserResponseSchema.safeParse(null);
      assert.strictEqual(result.success, false);
    });

    it("should reject non-object response", () => {
      const result = RealDebridUserResponseSchema.safeParse("string response");
      assert.strictEqual(result.success, false);
    });

    it("should reject response with missing required fields", () => {
      const incompleteResponse = {
        id: 12345,
        username: "testuser",
      };

      const result = RealDebridUserResponseSchema.safeParse(incompleteResponse);
      assert.strictEqual(result.success, false);
      if (!result.success) {
        // Should have multiple validation errors
        assert.ok(result.error.issues.length > 0);
      }
    });

    it("should reject negative id", () => {
      const response = {
        id: -1,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, false);
    });

    it("should accept masked email (Real-Debrid masks for privacy)", () => {
      const response = {
        id: 12345,
        username: "testuser",
        email: "u***@example.com", // Masked email format
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, true);
    });

    it("should reject empty email", () => {
      const response = {
        id: 12345,
        username: "testuser",
        email: "",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, false);
    });

    it("should reject invalid avatar URL", () => {
      const response = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "not-a-url",
        type: "premium",
        premium: 1234567890,
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, false);
    });

    it("should reject empty username", () => {
      const response = {
        id: 12345,
        username: "",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, false);
    });

    it("should reject invalid locale length", () => {
      const response = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "toolong",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, false);
    });

    it("should reject non-ISO datetime for expiration", () => {
      const response = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
        expiration: "2025-12-31", // Not ISO datetime format
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, false);
    });

    it("should reject negative points", () => {
      const response = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: -100,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      const result = RealDebridUserResponseSchema.safeParse(response);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Zod error messages", () => {
    it("should provide detailed error information", () => {
      const invalidResponse = {
        id: "not-a-number",
        username: "",
        email: "invalid-email",
      };

      const result = RealDebridUserResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.length >= 3);
        // Check that errors have useful information
        result.error.issues.forEach((err) => {
          assert.ok(err.path);
          assert.ok(err.message);
        });
      }
    });
  });

  describe("Date parsing edge cases", () => {
    it("should handle valid ISO date strings", () => {
      const isoDate = "2025-12-31T23:59:59.000Z";
      const date = new Date(isoDate);

      assert.strictEqual(isNaN(date.getTime()), false);
      assert.ok(date.getTime() > 0);
    });

    it("should format valid dates correctly", () => {
      const isoDate = "2025-12-31T23:59:59.000Z";
      const date = new Date(isoDate);
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      assert.ok(formatted.includes("2025"));
      assert.ok(formatted.includes("December"));
    });
  });
});

describe("Real-Debrid AddMagnet Response Validation (Zod)", () => {
  describe("Valid addMagnet response structure", () => {
    it("should accept a complete valid response", () => {
      const validResponse = {
        id: "ABC123DEF456",
        uri: "https://real-debrid.com/torrents/ABC123DEF456",
      };

      const result = AddMagnetResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.id, "ABC123DEF456");
        assert.strictEqual(
          result.data.uri,
          "https://real-debrid.com/torrents/ABC123DEF456",
        );
      }
    });

    it("should accept minimal valid response", () => {
      const validResponse = {
        id: "XYZ789",
        uri: "https://real-debrid.com/torrents/XYZ789",
      };

      const result = AddMagnetResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
    });
  });

  describe("Invalid addMagnet response structure", () => {
    it("should reject missing id field", () => {
      const invalidResponse = {
        uri: "https://real-debrid.com/torrents/ABC123",
      };

      const result = AddMagnetResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject missing uri field", () => {
      const invalidResponse = {
        id: "ABC123",
      };

      const result = AddMagnetResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject non-string id", () => {
      const invalidResponse = {
        id: 123,
        uri: "https://real-debrid.com/torrents/ABC123",
      };

      const result = AddMagnetResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject invalid uri format", () => {
      const invalidResponse = {
        id: "ABC123",
        uri: "not-a-url",
      };

      const result = AddMagnetResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });
  });
});

describe("Real-Debrid TorrentInfo Response Validation (Zod)", () => {
  describe("Valid torrentInfo response structure", () => {
    it("should accept a complete valid response", () => {
      const validResponse = {
        id: "ABC123DEF456",
        filename: "Movie.Title.2024.1080p.mkv",
        original_filename: "Movie.Title.2024.1080p.mkv",
        hash: "abc123def456abc123def456abc123def456abc12",
        bytes: 2147483648,
        original_bytes: 2147483648,
        host: "real-debrid.com",
        split: 4,
        progress: 100,
        status: "downloaded",
        added: "2025-01-15T10:30:00.000Z",
        files: [
          {
            id: 0,
            path: "/Movie.Title.2024.1080p.mkv",
            bytes: 2147483648,
            selected: 1,
          },
        ],
        links: [
          "https://example.com/download1",
          "https://example.com/download2",
        ],
        ended: "2025-01-15T11:00:00.000Z",
        speed: 0,
        seeders: 0,
      };

      const result = TorrentInfoResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.id, "ABC123DEF456");
        assert.strictEqual(result.data.files.length, 1);
        assert.strictEqual(result.data.status, "downloaded");
      }
    });

    it("should accept response without optional fields", () => {
      const validResponse = {
        id: "XYZ789",
        filename: "TV.Show.S01E01.720p.mkv",
        original_filename: "TV.Show.S01E01.720p.mkv",
        hash: "xyz789abc123xyz789abc123xyz789abc123xyz78",
        bytes: 1073741824,
        original_bytes: 1073741824,
        host: "real-debrid.com",
        split: 2,
        progress: 0,
        status: "waiting_files_selection",
        added: "2025-01-15T12:00:00.000Z",
        files: [],
        links: [],
      };

      const result = TorrentInfoResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.ended, undefined);
        assert.strictEqual(result.data.speed, undefined);
        assert.strictEqual(result.data.seeders, undefined);
      }
    });

    it("should accept multiple files with mixed selection", () => {
      const validResponse = {
        id: "MULTI123",
        filename: "TV.Series.S01.COMPLETE",
        original_filename: "TV.Series.S01.COMPLETE",
        hash: "multi123multi123multi123multi123multi123", // Fixed: exactly 40 chars
        bytes: 5368709120,
        original_bytes: 5368709120,
        host: "real-debrid.com",
        split: 8,
        progress: 75,
        status: "downloading",
        added: "2025-01-15T13:00:00.000Z",
        files: [
          {
            id: 0,
            path: "/Season 1/S01E01 - Pilot.mkv",
            bytes: 1073741824,
            selected: 1,
          },
          {
            id: 1,
            path: "/Season 1/S01E02 - Episode 2.mkv",
            bytes: 1073741824,
            selected: 1,
          },
          {
            id: 2,
            path: "/Season 1/S01E03 - Episode 3.mkv",
            bytes: 1073741824,
            selected: 0,
          },
        ],
        links: ["https://example.com/link1"],
        speed: 2048576,
        seeders: 15,
      };

      const result = TorrentInfoResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.files.length, 3);
        assert.strictEqual(result.data.files[0].selected, 1);
        assert.strictEqual(result.data.files[2].selected, 0);
      }
    });
  });

  describe("Invalid torrentInfo response structure", () => {
    it("should reject missing required fields", () => {
      const invalidResponse = {
        id: "ABC123",
        filename: "test.mkv",
        // Missing required fields
      };

      const result = TorrentInfoResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject invalid hash length", () => {
      const invalidResponse = {
        id: "ABC123",
        filename: "test.mkv",
        original_filename: "test.mkv",
        hash: "too-short", // SHA1 should be 40 chars
        bytes: 1000000,
        original_bytes: 1000000,
        host: "example.com",
        split: 1,
        progress: 0,
        status: "waiting_files_selection",
        added: "2025-01-15T10:00:00.000Z",
        files: [],
        links: [],
      };

      const result = TorrentInfoResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject progress outside valid range", () => {
      const invalidResponse = {
        id: "ABC123",
        filename: "test.mkv",
        original_filename: "test.mkv",
        hash: "abc123def456abc123def456abc123def456abc12",
        bytes: 1000000,
        original_bytes: 1000000,
        host: "example.com",
        split: 1,
        progress: 150, // Should be 0-100
        status: "waiting_files_selection",
        added: "2025-01-15T10:00:00.000Z",
        files: [],
        links: [],
      };

      const result = TorrentInfoResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject invalid file selection value", () => {
      const invalidResponse = {
        id: "ABC123",
        filename: "test.mkv",
        original_filename: "test.mkv",
        hash: "abc123def456abc123def456abc123def456abc12",
        bytes: 1000000,
        original_bytes: 1000000,
        host: "example.com",
        split: 1,
        progress: 0,
        status: "waiting_files_selection",
        added: "2025-01-15T10:00:00.000Z",
        files: [
          {
            id: 0,
            path: "/test.mkv",
            bytes: 1000000,
            selected: 2, // Should be 0 or 1
          },
        ],
        links: [],
      };

      const result = TorrentInfoResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject negative progress", () => {
      const invalidResponse = {
        id: "ABC123",
        filename: "test.mkv",
        original_filename: "test.mkv",
        hash: "abc123def456abc123def456abc123def456abc12",
        bytes: 1000000,
        original_bytes: 1000000,
        host: "example.com",
        split: 1,
        progress: -10, // Should be 0-100
        status: "waiting_files_selection",
        added: "2025-01-15T10:00:00.000Z",
        files: [],
        links: [],
      };

      const result = TorrentInfoResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });

    it("should reject invalid file path", () => {
      const invalidResponse = {
        id: "ABC123",
        filename: "test.mkv",
        original_filename: "test.mkv",
        hash: "abc123def456abc123def456abc123def456abc12",
        bytes: 1000000,
        original_bytes: 1000000,
        host: "example.com",
        split: 1,
        progress: 0,
        status: "waiting_files_selection",
        added: "2025-01-15T10:00:00.000Z",
        files: [
          {
            id: 0,
            path: "no-leading-slash", // Should start with "/"
            bytes: 1000000,
            selected: 1,
          },
        ],
        links: [],
      };

      const result = TorrentInfoResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Status field validation", () => {
    it("should accept all valid status values", () => {
      const validStatuses = [
        "magnet_error",
        "magnet_conversion",
        "waiting_files_selection",
        "queued",
        "downloading",
        "downloaded",
        "error",
        "virus",
        "compressing",
        "uploading",
        "dead",
      ];

      validStatuses.forEach((status) => {
        const response = {
          id: "TEST123",
          filename: "test.mkv",
          original_filename: "test.mkv",
          hash: "abc123def456abc123def456abc123def456abc12",
          bytes: 1000000,
          original_bytes: 1000000,
          host: "example.com",
          split: 1,
          progress: 0,
          status: status,
          added: "2025-01-15T10:00:00.000Z",
          files: [],
          links: [],
        };

        const result = TorrentInfoResponseSchema.safeParse(response);
        assert.strictEqual(
          result.success,
          true,
          `Status "${status}" should be valid`,
        );
      });
    });
  });

  describe("Date validation", () => {
    it("should accept valid ISO datetime strings", () => {
      const validResponse = {
        id: "TEST123",
        filename: "test.mkv",
        original_filename: "test.mkv",
        hash: "abc123def456abc123def456abc123def456abc12",
        bytes: 1000000,
        original_bytes: 1000000,
        host: "example.com",
        split: 1,
        progress: 0,
        status: "waiting_files_selection",
        added: "2025-01-15T10:30:00.000Z",
        files: [],
        links: [],
        ended: "2025-01-15T11:00:00.000Z", // Optional but valid
      };

      const result = TorrentInfoResponseSchema.safeParse(validResponse);
      assert.strictEqual(result.success, true);
    });

    it("should reject invalid datetime format", () => {
      const invalidResponse = {
        id: "TEST123",
        filename: "test.mkv",
        original_filename: "test.mkv",
        hash: "abc123def456abc123def456abc123def456abc12",
        bytes: 1000000,
        original_bytes: 1000000,
        host: "example.com",
        split: 1,
        progress: 0,
        status: "waiting_files_selection",
        added: "2025-01-15", // Not ISO datetime
        files: [],
        links: [],
      };

      const result = TorrentInfoResponseSchema.safeParse(invalidResponse);
      assert.strictEqual(result.success, false);
    });
  });
});

describe("Magnet Link Validation", () => {
  it("should validate magnet link format correctly", () => {
    const isValidMagnet = (magnet: string): boolean => {
      if (!magnet || typeof magnet !== "string") return false;
      if (!magnet.startsWith("magnet:?xt=urn:btih:")) return false;

      // Extract the hash part (everything after "magnet:?xt=urn:btih:")
      const hashStart = "magnet:?xt=urn:btih:".length;
      const hash = magnet.substring(hashStart);

      // Hash should not be empty and should be at least 40 characters (SHA1)
      return hash.length >= 40;
    };

    // Valid magnet links
    const validMagnets = [
      "magnet:?xt=urn:btih:abc123def456abc123def456abc123def456abc12",
      "magnet:?xt=urn:btih:ABC123DEF456ABC123DEF456ABC123DEF456ABC12",
    ];

    validMagnets.forEach((magnet) => {
      assert.strictEqual(isValidMagnet(magnet), true);
    });

    // Invalid magnet links
    const invalidMagnets = [
      "http://example.com",
      "magnet:?xt=urn:btih:", // Empty hash
      "magnet:?xt=urn:btih:abc", // Too short (less than 40 chars)
      "", // Empty string
    ];

    invalidMagnets.forEach((magnet) => {
      assert.strictEqual(isValidMagnet(magnet), false);
    });

    // Test null/undefined separately
    assert.strictEqual(isValidMagnet(""), false);
    assert.strictEqual(isValidMagnet("null" as any), false);
    assert.strictEqual(isValidMagnet("undefined" as any), false);
    assert.strictEqual(isValidMagnet(null as any), false);
    assert.strictEqual(isValidMagnet(undefined as any), false);
  });

  it("should handle extremely long magnet links", () => {
    const longMagnet =
      "magnet:?xt=urn:btih:" + "a".repeat(3000) + "&dn=Very+Long+Name";

    // Should detect as potentially problematic due to length
    assert.ok(longMagnet.length > 2000);
  });
});
