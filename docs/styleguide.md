# HoardHelper - Style Guide

Reference for the HoardHelper design system. Use these tokens and patterns consistently across all components.

---

## Color Tokens

### Foundation

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0a` | Main background |
| `--bg-secondary` | `#1a1a1a` | Cards, elevated surfaces |
| `--bg-tertiary` | `#2a2a2a` | Input fields, hover states |

### Gold Accent (Brand)

| Token | Value | Usage |
|-------|-------|-------|
| `--gold-primary` | `#d4af37` | Primary accent, headings |
| `--gold-light` | `#f4cf57` | Highlights, gradients |
| `--gold-dark` | `#b8941f` | Borders, deep accents |
| `--gold-glow` | `rgba(212, 175, 55, 0.2)` | Shadows, glows |

### Text (WCAG 2.2 AA Compliant)

| Token | Value | Contrast Ratio | Usage |
|-------|-------|----------------|-------|
| `--text-primary` | `#e8e8e8` | 13.5:1 | Primary content |
| `--text-secondary` | `#b0b0b0` | 5.1:1 | Supporting text |
| `--text-tertiary` | `#8a8a8a` | 4.5:1 | Labels, hints |

### Status

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#4ade80` | Complete, valid |
| `--warning` | `#fbbf24` | Processing, attention |
| `--error` | `#ef4444` | Errors, removal |
| `--info` | `#60a5fa` | Information |

---

## Typography

### Font Families

```css
--font-display: 'Cinzel', serif;      /* Headers, titles */
--font-body: 'Inter', sans-serif;     /* Body text, UI */
--font-mono: 'JetBrains Mono';         /* File names, code */
```

### Scale

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 0.75rem (12px) | Badges, captions |
| `--text-sm` | 0.875rem (14px) | Secondary labels |
| `--text-base` | 1rem (16px) | Body text |
| `--text-lg` | 1.125rem (18px) | Emphasized |
| `--text-xl` | 1.25rem (20px) | Subheadings |
| `--text-2xl` | 1.5rem (24px) | Section headers |
| `--text-3xl` | 1.875rem (30px) | Drop zone titles |

### Weights

| Token | Value |
|-------|-------|
| `--weight-normal` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |
| `--weight-bold` | 700 |

---

## Spacing

Based on 4px unit. Use these consistently for padding, margins, and gaps.

| Token | Value |
|-------|-------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |

---

## Components

### Buttons

**Primary** (`.btn-primary`)
- Gold gradient background
- Dark text
- Hover: lift effect + glow

**Secondary** (`.btn-secondary`)
- Transparent with gold border
- Gold text
- Hover: subtle gold background

### Cards

**Base** (`.card`)
- `--bg-secondary` background
- `--border-default` border
- 12px border-radius
- Hover: gold border + glow

**Elevated** (`.card-elevated`)
- Gold border
- 16px border-radius
- Always shows glow shadow

### Form Inputs

**Input Field** (`.input-field`)
- `--bg-tertiary` background
- Focus: gold border + outer glow ring

### Status Badges

- `.status-active` → Green (success)
- `.status-processing` → Yellow (warning)
- `.status-error` → Red (error)

---

## Animations

### Timings

| Token | Value |
|-------|-------|
| `--duration-fast` | 150ms |
| `--duration-base` | 250ms |
| `--duration-slow` | 350ms |

### Easing

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Available Keyframes

- `fadeIn` → Opacity fade
- `slideUp` → Slide up with fade
- `scaleIn` → Scale in with fade
- `glowPulse` → Pulsing gold glow (for `.processing`)
- `shimmer` → Progress bar shimmer
- `pulse` → Status dot pulse

---

## Iconography

**Library:** Lucide React

**Standard Size:** 24px (UI), 18px (buttons), 14px (labels)

**Color:** `var(--gold-primary)` for interactive, `currentColor` for text context

---

## Patterns

### Hover States
- Buttons: `translateY(-2px)` lift
- Cards: Gold border + `box-shadow: 0 8px 32px var(--shadow-glow)`
- Interactive: Color transitions 0.2s

### Focus States
- Gold border
- `box-shadow: 0 0 0 3px var(--gold-glow)`

### Processing State
- Apply `.processing` class
- Uses `glowPulse` animation
- Gold border on container

---

## Accessibility (WCAG 2.2 AA)

### Contrast Requirements
All text must meet WCAG 2.2 AA contrast ratios:
- **Normal text (< 18px):** Minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or 14px bold):** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

### Icon Accessibility
Icons must be accessible to screen readers using this pattern:

```tsx
// Decorative icon with visible text
<Settings size={18} aria-hidden="true" />
<span>Settings</span>

// Icon-only button
<button aria-label="Remove file">
    <Trash2 size={16} aria-hidden="true" />
</button>

// Status icon with screen reader text
<ShieldCheck aria-hidden="true" />
<span className="sr-only">Upload successful</span>
```

### Screen Reader Utility
Use `.sr-only` class to provide text for screen readers that is visually hidden:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Additional Components

### Settings Link (Sidebar Footer)

**Class:** `.sidebar-settings-link`

- Positioned in sidebar footer
- Ghost style with gold hover
- Accessible with aria-label

### History Stat Card

**Class:** `.history-stat-card`

- Full width, centered content
- Gold gradient border with glow
- Used for Total Secured counter

### History Item

**Class:** `.history-item`

- Flex layout, responsive
- `.failed` modifier adds red left border
- Contains status icon, file info, actions

### Retry Button

**Class:** `.retry-btn`

- Gold ghost button style
- Icon + text combination
- Used for failed uploads in history

---


## Coding

### Documentation
- **Product Requirements Document (PRD):** Maintain as a high-level living document. Focus on solution value and core features. No implementation code-blocks or detailed technical data models should reside here.
- **Backlog:** Use `backlog.md` for tracking all development tasks and future ideas.
    - **IDs:** Format items as `### US-XXX: Title`.
    - **Status:** Status must only be `Status: not started` or `Status: done`.
    - **Story Format:** Include "As a... I want to... so that I can..." followed by bulleted Acceptance Criteria.
- **Style Guide:** All UI implementations must strictly use the CSS variables and component patterns defined in `styleguide.md`. When creating a new component think carefully if you can reuse an existing component instead or leverage existing styles. Make sure to update the styleguide when a componennt is created.

### Workflow
- **User Stories:** Before starting work, ensure a corresponding User Story exists in the backlog.
- **Updates:** When a story is implemented and verified, update its status to `Status: done` in `backlog.md`.
- **Tests:** Create unit tests to ensure the work is working as designed. Run `npm run test` before pushing changes. Ensure all tests pass.
- **Linting:** Run `npm run lint` before pushing changes. Ensure no linting errors.
- **Formatting:** Run `npm run format` before pushing changes. Ensure no formatting errors.
- **Commit Messages:** Use conventional commits format. `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- **PRs:** Reference User Story IDs in PR descriptions to maintain traceability. The following format for a PR title `US-XXX: Title` and a brief description from the acceptance criteria of the story. Use the Github CLI to open the PR.
- **Branch Naming:** Use short, descriptive names without prefixes. Example: `ui-refactor`, `toast-notifications`. Keep names concise and lowercase with hyphens.

### Control Flow Patterns

**Goal:** Maintain shallow nesting (maximum 1-2 levels) for better readability and maintainability.

#### Guard Clauses (Preferred)

Use guard clauses to handle edge cases early and reduce nesting. The "happy path" should be at the end of the function with minimal indentation.

**❌ Avoid: Deep Nesting**
```typescript
function processFile(file: FileMetadata, settings: Settings) {
    if (file.valid) {                                    // Level 1
        if (settings.url) {                               // Level 2
            if (settings.username && settings.password) { // Level 3 ❌
                // Happy path buried 3 levels deep
                return uploadFile(file, settings);
            }
        }
    }
    return null;
}
```

**✅ Prefer: Guard Clauses**
```typescript
function processFile(file: FileMetadata, settings: Settings) {
    // Guard: Handle invalid file
    if (!file.valid) {
        return null;
    }

    // Guard: Handle missing URL
    if (!settings.url) {
        return null;
    }

    // Guard: Handle missing credentials
    if (!settings.username || !settings.password) {
        return null;
    }

    // Happy path at top level - easy to find and read
    return uploadFile(file, settings);
}
```

#### Extract Helper Functions

When nesting is unavoidable, extract nested logic into well-named helper functions.

**❌ Avoid: Duplicated Nested Logic**
```typescript
// Handler 1
ipcMain.handle('parse-files', () => {
    if (proposedPath) {
        if (metadata.type === 'tv') {
            targetBase = settings?.targetFolderTv || '';
        } else {
            targetBase = settings?.targetFolderMovie || '';
        }
        if (targetBase) {
            // ... 10 more lines of logic
        }
    }
});

// Handler 2 - IDENTICAL NESTED LOGIC
ipcMain.handle('generate-path', () => {
    if (proposedPath) {
        if (metadata.type === 'tv') {
            // ... same 15 lines duplicated
        }
    }
});
```

**✅ Prefer: Helper Function with Guard Clauses**
```typescript
function prependTargetBasePath(
    metadata: ParseResult,
    proposedPath: string | null,
    settings: Settings | undefined
): string | null {
    // Guard: No path to modify
    if (!proposedPath) return proposedPath;

    // Determine target based on type
    const targetBase = metadata.type === 'tv'
        ? settings?.targetFolderTv || settings?.targetFolder || ''
        : settings?.targetFolderMovie || settings?.targetFolder || '';

    // Guard: No target configured
    if (!targetBase) return proposedPath;

    // Process path (single level of logic)
    const safeBase = targetBase.replace(/\.\./g, '');
    const base = safeBase.replace(/\/$/, '');
    const rel = proposedPath.replace(/^\//, '');
    return `${base}/${rel}`;
}

// Both handlers now use the helper (DRY principle)
ipcMain.handle('parse-files', () => {
    const proposedPath = prependTargetBasePath(metadata, basePath, settings);
});

ipcMain.handle('generate-path', () => {
    const proposedPath = prependTargetBasePath(metadata, basePath, settings);
});
```

#### Early Returns in Conditionals

Use early returns instead of else blocks to reduce indentation.

**❌ Avoid: Else Blocks**
```typescript
function decryptSettings(stored: StoredSettings): Settings {
    if (!stored._encrypted) {
        // Migration logic
        settings.password = legacy.password;
        return settings;
    } else {                                    // Unnecessary else
        if (stored.password_encrypted) {         // Nested in else
            settings.password = decrypt(...);
        }
        if (stored.apiKey_encrypted) {
            settings.apiKey = decrypt(...);
        }
        return settings;
    }
}
```

**✅ Prefer: Early Return**
```typescript
function decryptSettings(stored: StoredSettings): Settings {
    // Migration: Handle legacy format and exit early
    if (!stored._encrypted) {
        settings.password = legacy.password;
        return settings;  // Early exit eliminates else block
    }

    // Modern encrypted format (now at top level)
    if (stored.password_encrypted) {
        settings.password = decrypt(stored.password_encrypted);
    }

    if (stored.apiKey_encrypted) {
        settings.apiKey = decrypt(stored.apiKey_encrypted);
    }

    return settings;
}
```

#### Avoid Deeply Nested Ternaries

Complex nested ternaries in JSX reduce readability. Extract to helper functions.

**❌ Avoid: Nested Ternaries**
```tsx
<div>
    {totalProcessed === 0
        ? 'No files processed yet'
        : successCount === totalProcessed
            ? 'All files secured successfully!'
            : `${totalProcessed - successCount} file${totalProcessed - successCount !== 1 ? 's' : ''} need attention`
    }
</div>
```

**✅ Prefer: Helper Function**
```tsx
function getProcessingMessage(totalProcessed: number, successCount: number): string {
    if (totalProcessed === 0) {
        return 'No files processed yet';
    }

    if (successCount === totalProcessed) {
        return 'All files secured successfully!';
    }

    const failedCount = totalProcessed - successCount;
    const plural = failedCount !== 1 ? 's' : '';
    return `${failedCount} file${plural} need attention`;
}

// Usage in JSX
<div>{getProcessingMessage(totalProcessed, successCount)}</div>
```

#### Type Narrowing with Guard Clauses

Use explicit null checks instead of optional chaining for proper TypeScript type narrowing.

**❌ Avoid: Optional Chaining Without Narrowing**
```typescript
if (realDebridResult?.success) {
    // TypeScript still thinks realDebridResult could be null
    const username = realDebridResult.username;  // Type error!
}
```

**✅ Prefer: Explicit Null Check**
```typescript
// Guard: Check for null and success
if (!realDebridResult || !realDebridResult.success) {
    return handleError(realDebridResult?.error);
}

// TypeScript knows realDebridResult is non-null here
const username = realDebridResult.username;  // Type-safe!
```

#### Validation Logic Extraction

Move complex inline validation to named handler functions.

**❌ Avoid: Inline Validation in JSX**
```tsx
<input
    onChange={(e) => setSettings({
        ...settings,
        interval: Math.max(30, Math.min(300, parseInt(e.target.value) || 60))
    })}
/>
```

**✅ Prefer: Named Handler**
```tsx
const MIN_INTERVAL = 30;
const MAX_INTERVAL = 300;
const DEFAULT_INTERVAL = 60;

const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const clampedValue = isNaN(value)
        ? DEFAULT_INTERVAL
        : Math.max(MIN_INTERVAL, Math.min(MAX_INTERVAL, value));

    setSettings({ ...settings, interval: clampedValue });
};

<input onChange={handleIntervalChange} />
```

#### Benefits Summary

- ✅ **Readability:** Less mental overhead tracking nested conditions
- ✅ **Maintainability:** Changes require fewer indentation adjustments
- ✅ **Testability:** Helper functions can be unit tested independently
- ✅ **Type Safety:** Proper type narrowing with explicit checks
- ✅ **DRY Principle:** Extract duplicated logic into reusable functions
- ✅ **Debugging:** Easier to add breakpoints and logging at top level
