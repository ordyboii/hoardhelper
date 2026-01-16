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

### Text

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#e8e8e8` | Primary content |
| `--text-secondary` | `#a0a0a0` | Supporting text |
| `--text-tertiary` | `#606060` | Disabled, hints |

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
- **Tests:** Create unit tests to ensure the work is working as designed.Run `npm run test` before pushing changes. Ensure all tests pass.
- **Linting:** Run `npm run lint` before pushing changes. Ensure no linting errors.
- **Formatting:** Run `npm run format` before pushing changes. Ensure no formatting errors.
- **Commit Messages:** Use conventional commits format. `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- **PRs:** Reference User Story IDs in PR descriptions to maintain traceability. The following format for a PR title `US-XXX: Title` and a brief description from the acceptance criteria of the story. Use the Github CLI to open the PR.
