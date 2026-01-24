# Testing Documentation

## Test Suite Overview

HoardHelper uses Node.js native test runner with comprehensive integration tests.

**Total Coverage:** 104 tests across 5 test files

### Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `verify.test.ts` | 16 | Parser logic & security validation |
| `realdebrid.test.ts` | 16 | Zod schema validation for API responses |
| `realdebrid-integration.test.ts` | 26 | API client integration with mocked fetch |
| `secureStorage.test.ts` | 7 | Credential encryption/decryption |
| `connectionMonitoring.test.ts` | 39 | Interval logic & visibility checks |

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run specific test file
node --import tsx --test test/verify.test.ts
node --import tsx --test test/realdebrid-integration.test.ts
node --import tsx --test test/connectionMonitoring.test.ts
```

## Test Coverage

```
File                      | Line % | Branch % | Funcs %
--------------------------|--------|----------|--------
connectionMonitoring.ts   | 100.00 |   100.00 | 100.00
exporter.ts               | 100.00 |    57.14 | 100.00
parser.ts                 | 100.00 |   100.00 | 100.00
realdebrid.ts             |  99.32 |    90.63 | 100.00
--------------------------|--------|----------|--------
All files                 |  99.75 |    90.16 | 100.00
```

## Real-Debrid Integration Tests

Tests the Real-Debrid API client with mocked `fetch` responses:

### Module Initialization (5 tests)
- ✅ Valid API key acceptance
- ✅ Empty/whitespace/undefined key rejection
- ✅ Client state management

### Success Cases (3 tests)
- ✅ Valid user data with expiration
- ✅ Free account without expiration
- ✅ Using initialized client

### API Error Responses (4 tests)
- ✅ 401 Unauthorized (invalid token)
- ✅ 500 Internal Server Error
- ✅ 503 Service Unavailable
- ✅ 429 Rate Limit

### Network Failures (4 tests)
- ✅ Network timeout
- ✅ DNS resolution failure (ENOTFOUND)
- ✅ Connection refused (ECONNREFUSED)
- ✅ Non-Error exceptions

### Invalid API Responses (5 tests)
- ✅ Missing required fields
- ✅ Invalid email format
- ✅ Invalid avatar URL
- ✅ Null response
- ✅ Non-object response

### Edge Cases (3 tests)
- ✅ Malformed JSON
- ✅ No API key provided
- ✅ Invalid expiration date format

### Request Validation (2 tests)
- ✅ Authorization header with Bearer token
- ✅ Correct API endpoint URL

## Connection Monitoring Integration Tests

Tests the periodic connection check logic with timer and visibility mocks:

### Interval Clamping (17 tests)
- ✅ Valid ranges (30-300 seconds)
- ✅ Below minimum (clamps to 30)
- ✅ Above maximum (clamps to 300)
- ✅ Invalid inputs (NaN, Infinity) default to 60

### Time Conversion (5 tests)
- ✅ Milliseconds to seconds
- ✅ Seconds to milliseconds
- ✅ Round-trip conversion
- ✅ Fractional seconds

### Visibility-Based Control (3 tests)
- ✅ Runs when visible
- ✅ Pauses when hidden
- ✅ Pauses when prerendering

### Interval Timer Behavior (5 tests)
- ✅ Creates interval with correct delay
- ✅ Respects min/max constraints
- ✅ Clears old interval on settings change
- ✅ Updates delay when settings change

### Visibility Integration (2 tests)
- ✅ Pauses checks when app becomes hidden
- ✅ Multiple visibility state changes

### Real-World Scenarios (4 tests)
- ✅ User changing interval values
- ✅ Out-of-bounds value handling
- ✅ Boundary value edge cases
- ✅ Rapid visibility changes

### Constants Validation (3 tests)
- ✅ MIN_CHECK_INTERVAL = 30 seconds
- ✅ MAX_CHECK_INTERVAL = 300 seconds
- ✅ DEFAULT_CHECK_INTERVAL = 60 seconds

## Integration with Components

### Utilities Extracted

Created `src/logic/connectionMonitoring.ts` with testable utilities:

```typescript
// Interval clamping (respects 30-300 second bounds)
clampCheckInterval(value: number): number

// Time conversion
msToSeconds(ms: number): number
secondsToMs(seconds: number): number

// Visibility-based check control
shouldRunConnectionCheck(visibilityState: DocumentVisibilityState): boolean
```

### Component Integration

**SettingsView.tsx:**
- Uses `clampCheckInterval()` in `handleIntervalChange`
- Imports constants (MIN, MAX, DEFAULT)

**App.tsx:**
- Uses `shouldRunConnectionCheck(document.visibilityState)` in periodic check effect
- Pauses checks when app is minimized

## Mocking Strategy

### Real-Debrid Tests
- Mock `global.fetch` before importing module
- Reset mocks in `beforeEach` hooks
- Simulate all API response scenarios

### Connection Monitoring Tests
- Mock `setInterval` and `clearInterval`
- Track interval IDs and delays
- Simulate visibility state changes

## Best Practices

1. **Guard Clauses:** All test utilities use early returns and guard clauses
2. **Type Safety:** Explicit null checks for proper TypeScript type narrowing
3. **DRY Principle:** Extracted duplicated logic to reusable test utilities
4. **Isolation:** Each test resets mocks and state
5. **Edge Cases:** Comprehensive coverage of boundary conditions and invalid inputs
6. **Real-World Scenarios:** Tests simulate actual user interactions

## Adding New Tests

When adding features that interact with:

1. **External APIs:** Add integration tests with mocked fetch
2. **Timers/Intervals:** Use mock timers to control execution
3. **Browser APIs:** Mock document/window APIs as needed
4. **User Input:** Test validation and clamping logic
5. **State Changes:** Verify state transitions and cleanup

Always run `npm test` before committing to ensure all tests pass.
