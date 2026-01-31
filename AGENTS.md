# HoardHelper - Agent Guidelines

Quick reference guide for agentic coding assistants working in this Electron + React + TypeScript codebase.

## Quick Commands

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build main + renderer
npm run test             # Run all tests with coverage
npm test -- test/file.test.ts  # Run single test file
npm run lint             # Check ESLint violations
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting
```

## Project Structure

```
src/
  components/            # React UI components (*.tsx)
  logic/                # Business logic modules (*.ts)
  types/index.ts        # All TypeScript interfaces & enums
  App.tsx              # Central state management
  main.ts              # Electron main process
  preload.cts          # IPC bridge (security)
  index.tsx            # React entry point
  index.css            # Design tokens & global styles
test/                  # Unit & integration tests (*.test.ts)
```

## Code Style

### Imports

- Use ES modules: `import { foo } from './bar'`
- Group imports: external libs, then local files
- Remove unused imports (ESLint enforces `@typescript-eslint/no-unused-vars`)

```typescript
import React from "react";
import { parseFiles } from "../logic/parser";
import type { FileMetadata } from "../types";
```

### Formatting

- **Prettier** handles all formatting automatically
- Line length: no hard limit enforced
- Use 2-space indentation (Prettier default)
- Run `npm run format` before committing

### Types

- All types centralized in `src/types/index.ts`
- Use interfaces for object shapes, enums for finite sets
- No `any` type allowed in src/ (ESLint rule)
- TypeScript `strict` mode enabled globally
- Use explicit null checks: `if (!obj)` not `obj?.prop`

```typescript
// ✅ Good
if (!settings || !settings.url) return null;
const username = settings.username;

// ❌ Avoid
if (settings?.url) {
  const username = settings?.username; // Still unsafe
}
```

### Naming

- **Components**: PascalCase (e.g., `DropZone`, `QueueList`)
- **Functions/variables**: camelCase (e.g., `parseFiles`, `fileQueue`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY`, `DEFAULT_TIMEOUT`)
- **Types/Interfaces**: PascalCase (e.g., `FileMetadata`, `Settings`)
- **Enums**: PascalCase, values PascalCase (e.g., `ViewState.Loot`)

### Control Flow

- **Max nesting: 1-2 levels** - extract helpers if deeper
- **Guard clauses** for early returns (reduce else blocks)
- **Extract validation** from JSX into named handlers
- **Happy path last** - edge cases handled first

```typescript
// ✅ Preferred
function processFile(file: FileMetadata, settings: Settings): string | null {
  if (!file.valid) return null;
  if (!settings.url) return null;

  // Happy path here
  return uploadFile(file, settings);
}

// ❌ Avoid nested ternaries in JSX
<div>{a ? (b ? c : d) : e}</div>

// ✅ Extract to helper
function getMessage(a: boolean, b: boolean): string {
  if (!a) return 'd';
  if (!b) return 'c';
  return 'e';
}
<div>{getMessage(a, b)}</div>
```

### Error Handling

- **Main process**: Use `ipcMain.handle()` with try/catch
- **Renderer**: Catch promise rejections, show user feedback
- **Security-critical code**: Log and sanitize (parser, exporter, storage)
- **Error interfaces**: Include `error?: string` on result types

```typescript
// Main process
ipcMain.handle("parse-files", async (_, filePaths: string[]) => {
  try {
    return parseFiles(filePaths);
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// React component
const [error, setError] = useState<string | null>(null);
try {
  await window.electronAPI.parseFiles(paths);
} catch (err) {
  setError(String(err));
}
```

## Testing

- **Framework**: Node.js native `test` module with coverage
- **Coverage**: 99.75% line coverage required
- **Test file**: `test/filename.test.ts`

```typescript
import { describe, it } from "node:test";
import assert from "node:assert";
import { parseFilename } from "../src/logic/parser";

describe("Parser Logic", () => {
  it("handles valid TV show", () => {
    const result = parseFilename("Show.S01E02.mkv");
    assert.equal(result.season, 1);
    assert.equal(result.episode, 2);
  });
});
```

Run single test: `npm test -- test/parser.test.ts`

## IPC Communication

**Pattern**: Renderer → Preload → Main Process → Result

- **Preload** (`src/preload.cts`): Exposes `window.electronAPI` via contextBridge
- **Main** (`src/main.ts`): Handles requests via `ipcMain.handle()`
- **Security**: Context isolation enabled - no direct Node.js access from renderer

```typescript
// preload.cts
contextBridge.exposeInMainWorld("electronAPI", {
  parseFiles: (paths: string[]) => ipcRenderer.invoke("parse-files", paths),
});

// src/App.tsx (renderer)
const files = await window.electronAPI.parseFiles(["file1.mkv"]);

// main.ts
ipcMain.handle("parse-files", async (_, filePaths: string[]) => {
  return parseFiles(filePaths);
});
```

## Security

**Critical Areas**: Parser, Exporter, Storage, IPC

- **Filename Sanitization**: Whitelist alphanumeric, spaces, dots, hyphens, underscores, parentheses
- **Path Traversal**: Remove `..` sequences
- **Credentials**: Encrypt using Electron's `safeStorage` API (OS-level encryption)
- **HTTPS Enforcement**: WebDAV uploads require HTTPS (except localhost)
- **Input Validation**: Use Zod schemas for external data

```typescript
import { z } from "zod";

const SettingsSchema = z.object({
  url: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
});

const settings = SettingsSchema.parse(untrustedData);
```

## Design System

- **Design tokens** in `src/index.css` (colors, typography, spacing)
- **Components** documented in `docs/styleguide.md`
- **Icons**: Lucide React (24px default)
- **Color scheme**: Dark theme with gold accent (`--gold-primary: #d4af37`)
- **Accessibility**: WCAG 2.2 AA compliant (4.5:1 contrast ratio minimum)

## Git Workflow

- **Branch**: `ordyboii/feature-name` (lowercase with hyphens)
- **Commits**: Conventional format (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`)
- **PRs**: Title format `US-XXX: Brief description` (reference User Story ID)
- **Prepare**: Run tests, linting, formatting before committing

```bash
npm run test && npm run lint:fix && npm run format
```

## Before Committing

1. ✅ Tests pass: `npm test`
2. ✅ No lint errors: `npm run lint`
3. ✅ Code formatted: `npm run format`
4. ✅ Update `CLAUDE.md` if architecture changed
5. ✅ Update `docs/styleguide.md` if new UI components added
6. ✅ Security review for sensitive code (parser, exporter, storage)
