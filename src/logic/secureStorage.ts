import { safeStorage } from "electron";

/**
 * Secure storage utilities using Electron's safeStorage API.
 *
 * safeStorage provides OS-level encryption:
 * - macOS: Keychain
 * - Windows: DPAPI
 * - Linux: libsecret (falls back to basic encryption if unavailable)
 */

/**
 * Encrypts a string value using OS-level encryption
 */
export function encryptString(plaintext: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn(
      "[SecureStorage] Encryption not available on this system. Storing as base64.",
    );
    // Fallback to base64 encoding (NOT secure, but better than nothing)
    return Buffer.from(plaintext).toString("base64");
  }

  const encrypted = safeStorage.encryptString(plaintext);
  // Convert to base64 for storage
  return encrypted.toString("base64");
}

/**
 * Decrypts a string value encrypted by encryptString
 */
export function decryptString(encrypted: string): string | null {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      // Fallback decoding
      return Buffer.from(encrypted, "base64").toString("utf-8");
    }

    const buffer = Buffer.from(encrypted, "base64");
    return safeStorage.decryptString(buffer);
  } catch (error) {
    console.error("[SecureStorage] Decryption failed:", error);
    return null;
  }
}

/**
 * Checks if encryption is available on the current system
 */
export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable();
}
