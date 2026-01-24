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
npm run lint         # Run ESLint on src and test directories
npm run lint:fix     # Fix ESLint errors automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting without writing
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
