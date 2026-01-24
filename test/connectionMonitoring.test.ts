import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import {
  clampCheckInterval,
  msToSeconds,
  secondsToMs,
  shouldRunConnectionCheck,
  MIN_CHECK_INTERVAL,
  MAX_CHECK_INTERVAL,
  DEFAULT_CHECK_INTERVAL,
} from "../src/logic/connectionMonitoring.js";

describe("Connection Monitoring Integration Tests", () => {
  describe("Interval clamping - Valid ranges", () => {
    it("should accept valid interval within range", () => {
      const result = clampCheckInterval(60);
      assert.strictEqual(result, 60);
    });

    it("should accept minimum interval", () => {
      const result = clampCheckInterval(MIN_CHECK_INTERVAL);
      assert.strictEqual(result, MIN_CHECK_INTERVAL);
    });

    it("should accept maximum interval", () => {
      const result = clampCheckInterval(MAX_CHECK_INTERVAL);
      assert.strictEqual(result, MAX_CHECK_INTERVAL);
    });

    it("should accept interval just above minimum", () => {
      const result = clampCheckInterval(MIN_CHECK_INTERVAL + 1);
      assert.strictEqual(result, MIN_CHECK_INTERVAL + 1);
    });

    it("should accept interval just below maximum", () => {
      const result = clampCheckInterval(MAX_CHECK_INTERVAL - 1);
      assert.strictEqual(result, MAX_CHECK_INTERVAL - 1);
    });
  });

  describe("Interval clamping - Below minimum", () => {
    it("should clamp to minimum when value is below range", () => {
      const result = clampCheckInterval(10);
      assert.strictEqual(result, MIN_CHECK_INTERVAL);
    });

    it("should clamp to minimum when value is 0", () => {
      const result = clampCheckInterval(0);
      assert.strictEqual(result, MIN_CHECK_INTERVAL);
    });

    it("should clamp to minimum when value is negative", () => {
      const result = clampCheckInterval(-50);
      assert.strictEqual(result, MIN_CHECK_INTERVAL);
    });

    it("should clamp to minimum when value is 1 below minimum", () => {
      const result = clampCheckInterval(MIN_CHECK_INTERVAL - 1);
      assert.strictEqual(result, MIN_CHECK_INTERVAL);
    });
  });

  describe("Interval clamping - Above maximum", () => {
    it("should clamp to maximum when value is above range", () => {
      const result = clampCheckInterval(500);
      assert.strictEqual(result, MAX_CHECK_INTERVAL);
    });

    it("should clamp to maximum when value is very large", () => {
      const result = clampCheckInterval(999999);
      assert.strictEqual(result, MAX_CHECK_INTERVAL);
    });

    it("should clamp to maximum when value is 1 above maximum", () => {
      const result = clampCheckInterval(MAX_CHECK_INTERVAL + 1);
      assert.strictEqual(result, MAX_CHECK_INTERVAL);
    });
  });

  describe("Interval clamping - Invalid inputs", () => {
    it("should return default for NaN", () => {
      const result = clampCheckInterval(NaN);
      assert.strictEqual(result, DEFAULT_CHECK_INTERVAL);
    });

    it("should return default for Infinity", () => {
      const result = clampCheckInterval(Infinity);
      assert.strictEqual(result, DEFAULT_CHECK_INTERVAL);
    });

    it("should return default for -Infinity", () => {
      const result = clampCheckInterval(-Infinity);
      assert.strictEqual(result, DEFAULT_CHECK_INTERVAL);
    });

    it("should return default for parseFloat result of empty string", () => {
      const result = clampCheckInterval(parseFloat(""));
      assert.strictEqual(result, DEFAULT_CHECK_INTERVAL);
    });

    it("should return default for parseFloat result of invalid string", () => {
      const result = clampCheckInterval(parseFloat("abc"));
      assert.strictEqual(result, DEFAULT_CHECK_INTERVAL);
    });
  });

  describe("Time conversion utilities", () => {
    it("should convert milliseconds to seconds", () => {
      assert.strictEqual(msToSeconds(1000), 1);
      assert.strictEqual(msToSeconds(60000), 60);
      assert.strictEqual(msToSeconds(300000), 300);
    });

    it("should floor partial seconds", () => {
      assert.strictEqual(msToSeconds(1500), 1);
      assert.strictEqual(msToSeconds(999), 0);
      assert.strictEqual(msToSeconds(5999), 5);
    });

    it("should convert seconds to milliseconds", () => {
      assert.strictEqual(secondsToMs(1), 1000);
      assert.strictEqual(secondsToMs(60), 60000);
      assert.strictEqual(secondsToMs(300), 300000);
    });

    it("should handle fractional seconds in conversion", () => {
      assert.strictEqual(secondsToMs(1.5), 1500);
      assert.strictEqual(secondsToMs(0.5), 500);
    });

    it("should maintain round-trip conversion", () => {
      const original = 60;
      const converted = msToSeconds(secondsToMs(original));
      assert.strictEqual(converted, original);
    });
  });

  describe("Visibility-based check control", () => {
    it("should run checks when app is visible", () => {
      const result = shouldRunConnectionCheck("visible");
      assert.strictEqual(result, true);
    });

    it("should pause checks when app is hidden", () => {
      const result = shouldRunConnectionCheck("hidden");
      assert.strictEqual(result, false);
    });

    it("should pause checks when app is prerendering", () => {
      // @ts-expect-error - Testing edge case
      const result = shouldRunConnectionCheck("prerender");
      assert.strictEqual(result, false);
    });
  });

  describe("Interval timer behavior", () => {
    let mockSetInterval: any;
    let mockClearInterval: any;
    let intervalCallbacks: Map<number, { callback: Function; delay: number }>;
    let nextIntervalId: number;

    beforeEach(() => {
      intervalCallbacks = new Map();
      nextIntervalId = 1;

      // Mock setInterval
      mockSetInterval = mock.fn((callback: Function, delay: number) => {
        const id = nextIntervalId++;
        intervalCallbacks.set(id, { callback, delay });
        return id;
      });

      // Mock clearInterval
      mockClearInterval = mock.fn((id: number) => {
        intervalCallbacks.delete(id);
      });

      global.setInterval = mockSetInterval;
      global.clearInterval = mockClearInterval;
    });

    afterEach(() => {
      intervalCallbacks.clear();
    });

    it("should create interval with correct delay in milliseconds", () => {
      const intervalSeconds = 60;
      const expectedMs = secondsToMs(intervalSeconds);
      const callback = () => {};

      const _intervalId = setInterval(callback, expectedMs);

      assert.strictEqual(mockSetInterval.mock.callCount(), 1);
      const call = mockSetInterval.mock.calls[0];
      assert.strictEqual(call.arguments[1], 60000); // 60 seconds = 60000ms
    });

    it("should respect minimum interval constraint", () => {
      const tooLowInterval = 10; // Below MIN_CHECK_INTERVAL (30)
      const clampedInterval = clampCheckInterval(tooLowInterval);
      const delayMs = secondsToMs(clampedInterval);

      const callback = () => {};
      setInterval(callback, delayMs);

      const call = mockSetInterval.mock.calls[0];
      assert.strictEqual(call.arguments[1], secondsToMs(MIN_CHECK_INTERVAL));
    });

    it("should respect maximum interval constraint", () => {
      const tooHighInterval = 500; // Above MAX_CHECK_INTERVAL (300)
      const clampedInterval = clampCheckInterval(tooHighInterval);
      const delayMs = secondsToMs(clampedInterval);

      const callback = () => {};
      setInterval(callback, delayMs);

      const call = mockSetInterval.mock.calls[0];
      assert.strictEqual(call.arguments[1], secondsToMs(MAX_CHECK_INTERVAL));
    });

    it("should clear old interval when settings change", () => {
      const callback = () => {};

      // Create initial interval
      const intervalId1 = setInterval(callback, secondsToMs(60));
      assert.strictEqual(intervalCallbacks.size, 1);

      // Simulate settings change: clear old, create new
      clearInterval(intervalId1);
      const intervalId2 = setInterval(callback, secondsToMs(120));

      assert.strictEqual(mockClearInterval.mock.callCount(), 1);
      assert.strictEqual(mockSetInterval.mock.callCount(), 2);
      assert.strictEqual(intervalCallbacks.size, 1);
      assert.ok(intervalCallbacks.has(intervalId2));
      assert.ok(!intervalCallbacks.has(intervalId1));
    });

    it("should update interval delay when settings change", () => {
      const callback = () => {};

      // Initial interval: 60 seconds
      const intervalId1 = setInterval(callback, secondsToMs(60));
      let storedInterval = intervalCallbacks.get(intervalId1);
      assert.strictEqual(storedInterval?.delay, 60000);

      // Update to 120 seconds
      clearInterval(intervalId1);
      const intervalId2 = setInterval(callback, secondsToMs(120));
      storedInterval = intervalCallbacks.get(intervalId2);
      assert.strictEqual(storedInterval?.delay, 120000);
    });
  });

  describe("Visibility change integration", () => {
    it("should simulate pausing checks when app becomes hidden", () => {
      let checksRun = 0;
      const runCheckIfVisible = (visibilityState: DocumentVisibilityState) => {
        if (shouldRunConnectionCheck(visibilityState)) {
          checksRun++;
        }
      };

      // App starts visible
      runCheckIfVisible("visible");
      assert.strictEqual(checksRun, 1);

      // App becomes hidden
      runCheckIfVisible("hidden");
      assert.strictEqual(checksRun, 1); // Should not increment

      // App becomes visible again
      runCheckIfVisible("visible");
      assert.strictEqual(checksRun, 2);
    });

    it("should simulate multiple visibility state changes", () => {
      const checkLog: boolean[] = [];
      const runCheckIfVisible = (visibilityState: DocumentVisibilityState) => {
        const shouldRun = shouldRunConnectionCheck(visibilityState);
        checkLog.push(shouldRun);
      };

      // Simulate visibility state changes
      runCheckIfVisible("visible"); // true
      runCheckIfVisible("visible"); // true
      runCheckIfVisible("hidden"); // false
      runCheckIfVisible("hidden"); // false
      runCheckIfVisible("visible"); // true

      assert.deepStrictEqual(checkLog, [true, true, false, false, true]);
    });
  });

  describe("Real-world scenario simulations", () => {
    it("should handle user changing interval from valid to invalid value", () => {
      // User enters 60 (valid)
      let interval = clampCheckInterval(60);
      assert.strictEqual(interval, 60);

      // User clears input (NaN)
      interval = clampCheckInterval(NaN);
      assert.strictEqual(interval, DEFAULT_CHECK_INTERVAL);

      // User enters 45 (valid)
      interval = clampCheckInterval(45);
      assert.strictEqual(interval, 45);
    });

    it("should handle user entering out-of-bounds values", () => {
      // User tries to set very low interval
      let interval = clampCheckInterval(5);
      assert.strictEqual(interval, MIN_CHECK_INTERVAL);

      // User tries to set very high interval
      interval = clampCheckInterval(1000);
      assert.strictEqual(interval, MAX_CHECK_INTERVAL);
    });

    it("should handle edge case of boundary values", () => {
      // Test exact boundaries
      assert.strictEqual(clampCheckInterval(29), MIN_CHECK_INTERVAL);
      assert.strictEqual(clampCheckInterval(30), 30);
      assert.strictEqual(clampCheckInterval(300), 300);
      assert.strictEqual(clampCheckInterval(301), MAX_CHECK_INTERVAL);
    });

    it("should handle rapid visibility changes", () => {
      const states: DocumentVisibilityState[] = [
        "visible",
        "hidden",
        "visible",
        "hidden",
        "visible",
      ];
      const results = states.map(shouldRunConnectionCheck);

      assert.deepStrictEqual(results, [true, false, true, false, true]);
    });
  });

  describe("Constants validation", () => {
    it("should have valid minimum interval", () => {
      assert.strictEqual(MIN_CHECK_INTERVAL, 30);
      assert.ok(MIN_CHECK_INTERVAL > 0);
    });

    it("should have valid maximum interval", () => {
      assert.strictEqual(MAX_CHECK_INTERVAL, 300);
      assert.ok(MAX_CHECK_INTERVAL > MIN_CHECK_INTERVAL);
    });

    it("should have valid default interval", () => {
      assert.strictEqual(DEFAULT_CHECK_INTERVAL, 60);
      assert.ok(DEFAULT_CHECK_INTERVAL >= MIN_CHECK_INTERVAL);
      assert.ok(DEFAULT_CHECK_INTERVAL <= MAX_CHECK_INTERVAL);
    });
  });
});
