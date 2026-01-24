# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HoardHelper is an Electron + React + TypeScript desktop application for managing media files.

## Commands

```bash
npm run dev          # Start development with hot reload (Vite + Electron)
npm run build        # Full production build (main + renderer)
npm run test         # Run tests with coverage (Node.js native test runner)
npm run dist         # Build distributable package (.deb for Linux)
npm run clean        # Remove dist/ and dist-electron/
```

## Architecture

### IPC Communication (Electron Security Model)
- **Context Isolation:** Enabled - renderer cannot access Node.js directly
- **Preload Script:** `src/preload.cts` exposes safe API via `contextBridge`
- **Main Process:** `src/main.ts` handles IPC requests via `ipcMain.handle()`
- **Pattern:** Renderer calls `window.electronAPI.method()` → IPC → Main process handler

### Module Structure

| Module | Location | Purpose |
|--------|----------|---------|
| Types | `src/types/index.ts` | All TypeScript interfaces |
| Logic | `src/logic/*.ts` | Business logic (parser, exporter, API clients, storage, validation) |
| Components | `src/components/*.tsx` | React UI components |
| State | `src/App.tsx` | Central state management |

## Testing

**Full documentation:** See `docs/testing.md`

- **104 tests** with **99.75% line coverage** using Node.js native test runner
- Integration tests with mocked fetch and timers
- Run: `npm test`

## Development Workflow

- **User Stories:** Tracked in `docs/backlog.md` with `US-XXX` format
- **Commits:** Use conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`)
- **Branch Naming:** Lowercase with hyphens (e.g., `ui-refactor`, `toast-notifications`)

## Design System

**Full documentation:** See `docs/styleguide.md`

- Design tokens in `src/index.css` (gold accent, dark theme, typography)
- Component patterns and accessibility guidelines
- Icon library: Lucide React

## Coding Patterns

**Full documentation:** See `docs/styleguide.md`

### Control Flow
- **Maximum nesting:** 1-2 levels (avoid deep nesting)
- **Prefer guard clauses:** Handle edge cases early with early returns
- **Happy path last:** Main logic should be at the end with minimal indentation
- **Extract helpers:** Move duplicated or complex nested logic to well-named functions
- **Type narrowing:** Use explicit null checks (`if (!obj)`) instead of optional chaining (`obj?.prop`)
- **Validation extraction:** Move complex inline validation to named handler functions

### Examples
```typescript
// ❌ Avoid: Deep nesting
if (condition1) {
    if (condition2) {
        if (condition3) {
            // happy path buried
        }
    }
}

// ✅ Prefer: Guard clauses
if (!condition1) return;
if (!condition2) return;
if (!condition3) return;
// happy path at top level
```

## Security Considerations

The parser and exporter modules are security-critical:
- Filename sanitization uses a whitelist approach (alphanumeric, spaces, dots, hyphens, underscores, parentheses)
- Path traversal prevention removes `..` sequences
- WebDAV uploads enforce HTTPS (except localhost)
- Test suite includes malicious input cases
- Credentials encrypted using Electron's `safeStorage` API (OS-level storage)
