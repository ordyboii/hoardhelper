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

### UI Layout (Sidebar + Views)
The application uses a sidebar navigation pattern with four main views:
- **Loot Inventory** (`ViewState.Loot`): Drag-and-drop file input via DropZone
- **Extraction Queue** (`ViewState.Extraction`): File processing queue with edit/remove actions
- **Secure Status** (`ViewState.Secure`): Upload history with retry functionality
- **Map Configuration** (`ViewState.Map`): Nextcloud settings and connection testing

The sidebar includes:
- Navigation menu with badge indicators for queue count
- System Status card showing Nextcloud connection state
- Settings link in footer
- Mobile responsive with hamburger menu and backdrop overlay

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
| Types | `src/types/index.ts` | All TypeScript interfaces (ViewState enum, FileMetadata, Settings, etc.) |
| Parser | `src/logic/parser.ts` | Filename parsing, sanitization, pattern detection (SxxExx, NxNN, anime) |
| Exporter | `src/logic/exporter.ts` | Path generation for TV series and movies |
| Nextcloud | `src/logic/nextcloud.ts` | WebDAV client, upload with progress, directory creation |
| State | `src/App.tsx` | Central state management with React hooks |

### Component Structure
- `Sidebar.tsx` - Navigation menu, view switching, and system status display
- `DropZone.tsx` - Drag-and-drop file input with visual feedback
- `QueueList.tsx` - Processing queue with edit/remove actions and progress tracking
- `EditView.tsx` - Metadata editing overlay for correcting parsed data
- `SecureStatusView.tsx` - Upload history with success/failure status and retry capability
- `SettingsView.tsx` - Nextcloud WebDAV configuration and connection testing

## Testing

Tests are in `test/verify.ts` using Node.js native test runner:
- Parser tests: TV show patterns, movie detection, edge cases
- Security tests: Path traversal prevention, null bytes, illegal characters

Run single test file: `node --import tsx --test test/verify.ts`

## Development Workflow

- **User Stories:** Tracked in GitHub Issues with `US-XXX` format in titles
- **Commits:** Use conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`)
- **Branch Naming:** Lowercase with hyphens (e.g., `ui-refactor`, `toast-notifications`)
- **Pull Requests:** Reference User Story IDs in PR titles using format: `US-XXX: Brief description`
- **GitHub CLI:** Use `gh` commands for creating issues and PRs to maintain consistency

### Feature Implementation Checklist

**IMPORTANT:** After implementing any feature, ALWAYS complete this checklist before committing:

1. **Update Documentation**
   - [ ] Update `CLAUDE.md` if:
     - New components were added or removed
     - Architecture or file structure changed
     - New modules or key workflows were introduced
     - Component responsibilities changed
   - [ ] Update `docs/styleguide.md` if:
     - New UI components were created
     - New CSS classes or design patterns were added
     - Color tokens, typography, or spacing changed
     - New animations or interactions were added

2. **Testing**
   - [ ] Run existing tests: `npm run test`
   - [ ] Create new unit tests for:
     - New logic functions (parser, exporter, validators)
     - New API endpoints or IPC handlers
     - Edge cases and error conditions
     - Security-critical code (input sanitization, path traversal)
   - [ ] Verify all tests pass before committing

3. **Code Quality**
   - [ ] Run linting: `npm run lint` (if configured)
   - [ ] Run formatting: `npm run format` (if configured)
   - [ ] Review code for security issues (XSS, injection, path traversal)

4. **User Story**
   - [ ] Verify acceptance criteria are met
   - [ ] Update GitHub issue status or add completion comment

**Remember:** Documentation and tests are not optional - they ensure the codebase remains maintainable and reliable.

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
