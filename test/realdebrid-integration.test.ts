import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";

/**
 * Integration tests for Real-Debrid API client.
 * Uses Node.js native mocking to simulate API responses without network calls.
 */

// We need to mock fetch before importing the module
const mockFetch = mock.fn();
global.fetch = mockFetch as any;

// Import after mocking fetch
import {
  initializeRealDebrid,
  isRealDebridConfigured,
  testRealDebridConnection,
} from "../src/logic/realdebrid.js";

describe("Real-Debrid Integration Tests", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mock.resetCalls();
    mockFetch.mock.restore();
  });

  describe("Module initialization", () => {
    it("should initialize client with valid API key", () => {
      const result = initializeRealDebrid("valid-api-key-123");
      assert.strictEqual(result, true);
      assert.strictEqual(isRealDebridConfigured(), true);
    });

    it("should reject empty API key", () => {
      const result = initializeRealDebrid("");
      assert.strictEqual(result, false);
      assert.strictEqual(isRealDebridConfigured(), false);
    });

    it("should reject whitespace-only API key", () => {
      const result = initializeRealDebrid("   ");
      assert.strictEqual(result, false);
      assert.strictEqual(isRealDebridConfigured(), false);
    });

    it("should reject undefined API key", () => {
      const result = initializeRealDebrid(undefined);
      assert.strictEqual(result, false);
      assert.strictEqual(isRealDebridConfigured(), false);
    });

    it("should clear client when initialized with empty key", () => {
      initializeRealDebrid("valid-key");
      assert.strictEqual(isRealDebridConfigured(), true);

      initializeRealDebrid("");
      assert.strictEqual(isRealDebridConfigured(), false);
    });
  });

  describe("testRealDebridConnection - Success cases", () => {
    it("should return success for valid API key with complete user data", async () => {
      const validUserData = {
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

      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(validUserData),
        }),
      );

      const result = await testRealDebridConnection("valid-api-key");

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.username, "testuser");
      assert.ok(result.expiration?.includes("2025"));
      assert.ok(result.expiration?.includes("December"));
    });

    it("should return success without expiration for free account", async () => {
      const freeUserData = {
        id: 12345,
        username: "freeuser",
        email: "free@example.com",
        points: 0,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "free",
        premium: 0,
      };

      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(freeUserData),
        }),
      );

      const result = await testRealDebridConnection("valid-api-key");

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.username, "freeuser");
      assert.strictEqual(result.expiration, undefined);
    });

    it("should use initialized client if no key provided", async () => {
      const validUserData = {
        id: 999,
        username: "initialized-user",
        email: "init@example.com",
        points: 500,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 999999,
      };

      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(validUserData),
        }),
      );

      initializeRealDebrid("initialized-key");
      const result = await testRealDebridConnection();

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.username, "initialized-user");
    });
  });

  describe("testRealDebridConnection - API error responses", () => {
    it("should handle 401 Unauthorized (invalid token)", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        }),
      );

      const result = await testRealDebridConnection("invalid-key");

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, "Invalid API token");
    });

    it("should handle 500 Internal Server Error", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("500"));
      assert.ok(result.error?.includes("Internal Server Error"));
    });

    it("should handle 503 Service Unavailable", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 503,
          statusText: "Service Unavailable",
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("503"));
    });

    it("should handle 429 Rate Limit", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("429"));
    });
  });

  describe("testRealDebridConnection - Network failures", () => {
    it("should handle network timeout", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.reject(new Error("Network timeout")),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, "Network timeout");
    });

    it("should handle DNS resolution failure", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.reject(new Error("getaddrinfo ENOTFOUND")),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("ENOTFOUND"));
    });

    it("should handle connection refused", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.reject(new Error("connect ECONNREFUSED")),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("ECONNREFUSED"));
    });

    it("should handle non-Error exceptions", async () => {
      mockFetch.mock.mockImplementation(() => Promise.reject("String error"));

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, "Connection failed");
    });
  });

  describe("testRealDebridConnection - Invalid API responses", () => {
    it("should reject response with missing required fields", async () => {
      const incompleteData = {
        id: 12345,
        username: "incomplete",
        // Missing required fields
      };

      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(incompleteData),
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("Invalid API response"));
    });

    it("should reject response with invalid email format", async () => {
      const invalidEmailData = {
        id: 12345,
        username: "testuser",
        email: "not-an-email",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(invalidEmailData),
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("Invalid API response"));
    });

    it("should reject response with invalid avatar URL", async () => {
      const invalidAvatarData = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "not-a-url",
        type: "premium",
        premium: 1234567890,
      };

      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(invalidAvatarData),
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("Invalid API response"));
    });

    it("should reject null response", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(null),
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("Invalid API response"));
    });

    it("should reject non-object response", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve("string response"),
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes("Invalid API response"));
    });
  });

  describe("testRealDebridConnection - Edge cases", () => {
    it("should handle malformed JSON response", async () => {
      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error("Unexpected token")),
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      assert.strictEqual(result.success, false);
      assert.ok(result.error);
    });

    it("should return error when no API key provided and client not initialized", async () => {
      // Clear any initialized client
      initializeRealDebrid("");

      const result = await testRealDebridConnection();

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, "No API key provided");
    });

    it("should handle invalid expiration date format gracefully", async () => {
      const invalidExpirationData = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
        expiration: "invalid-date", // Will fail Zod datetime validation
      };

      mockFetch.mock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(invalidExpirationData),
        }),
      );

      const result = await testRealDebridConnection("valid-key");

      // Should fail Zod validation
      assert.strictEqual(result.success, false);
    });
  });

  describe("Request headers and URL", () => {
    it("should send Authorization header with Bearer token", async () => {
      const validUserData = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      mockFetch.mock.mockImplementation((url, options) => {
        // Verify Authorization header
        assert.ok(options?.headers?.["Authorization"]);
        assert.ok(options.headers["Authorization"].startsWith("Bearer "));

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(validUserData),
        });
      });

      await testRealDebridConnection("test-api-key-123");

      // Verify fetch was called
      assert.strictEqual(mockFetch.mock.callCount(), 1);
    });

    it("should call correct API endpoint", async () => {
      const validUserData = {
        id: 12345,
        username: "testuser",
        email: "test@example.com",
        points: 1000,
        locale: "en",
        avatar: "https://example.com/avatar.png",
        type: "premium",
        premium: 1234567890,
      };

      mockFetch.mock.mockImplementation((url) => {
        // Verify URL
        assert.strictEqual(url, "https://api.real-debrid.com/rest/1.0/user");

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(validUserData),
        });
      });

      await testRealDebridConnection("test-key");

      assert.strictEqual(mockFetch.mock.callCount(), 1);
    });
  });
});
