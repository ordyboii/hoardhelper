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
