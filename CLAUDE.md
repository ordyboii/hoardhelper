# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HoardHelper is an Electron + React + TypeScript desktop application for managing media files. It automates processing, organizing, and uploading video files (movies and TV shows) to Nextcloud with intelligent renaming and codec management.

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

### File Processing Pipeline
```
Drop files → Parse filenames (parser.ts) → Generate paths (exporter.ts)
→ Edit metadata (user review) → Upload to Nextcloud (nextcloud.ts) → Track history
```

### Key Modules
| Module | Location | Purpose |
|--------|----------|---------|
| Types | `src/types/index.ts` | All TypeScript interfaces (ViewState, FileMetadata, Settings, etc.) |
| Parser | `src/logic/parser.ts` | Filename parsing, sanitization, pattern detection (SxxExx, NxNN, anime) |
| Exporter | `src/logic/exporter.ts` | Path generation for TV series and movies |
| Nextcloud | `src/logic/nextcloud.ts` | WebDAV client, upload with progress, directory creation |
| State | `src/App.tsx` | Central state management via React Context |

### Component Structure
- `DropZone.tsx` - Drag-and-drop file input
- `QueueList.tsx` - Processing queue with edit/remove actions
- `EditView.tsx` - Metadata editing modal
- `SecureStatusView.tsx` - Upload history with retry
- `SettingsView.tsx` - Nextcloud configuration
- `Sidebar.tsx` - Navigation and system status

## Testing

Tests are in `test/verify.ts` using Node.js native test runner:
- Parser tests: TV show patterns, movie detection, edge cases
- Security tests: Path traversal prevention, null bytes, illegal characters

Run single test file: `node --import tsx --test test/verify.ts`

## Development Workflow

- **User Stories:** Tracked in `docs/backlog.md` with `US-XXX` format
- **Commits:** Use conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`)
- **Branch Naming:** Lowercase with hyphens (e.g., `ui-refactor`, `toast-notifications`)

## Design System

Design tokens are in `src/index.css` and documented in `docs/styleguide.md`:
- Gold accent (`--gold-primary: #d4af37`)
- Dark theme with high contrast text
- Font families: Cinzel (display), Inter (body), JetBrains Mono (code)

## Security Considerations

The parser and exporter modules are security-critical:
- Filename sanitization uses a whitelist approach (alphanumeric, spaces, dots, hyphens, underscores, parentheses)
- Path traversal prevention removes `..` sequences
- WebDAV uploads enforce HTTPS (except localhost)
- Test suite includes malicious input cases
