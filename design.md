# Hoardhelper Design System

This document outlines the visual language, user experience principles, and component standards for the **Hoardhelper** application.

## 1. Core Philosophy: "The Dragon's Hoard"

The UI is built around the concept of a dragon guarding its treasure. The aesthetic is dark, cinematic, and valuable, using gold accents to signify "treasure" (files) against a deep, cave-like background. The user is the Dragon, organizing and protecting their digital loot.

*   **Tone:** Cinematic, Protective, Wealthy, Powerful.
*   **Voice:** The interface speaks in character (e.g., "Secure in Hoard", "Jettison Cargo", "Appraise Artifact").

## 2. Color Palette

The color scheme relies on high contrast between deep backgrounds and bright, metallic accents.

### Primary Colors (The Hoard)
*   **Gold (Primary):** `#FFD700` - Used for primary actions, key text, and active states.
*   **Dim Gold (Border/Secondary):** `#B8860B` - Used for borders, secondary icons, and gradients.
*   **Gold Gradient:** Linear gradient from `#B8860B` to `#FFD700` (135deg) - Used for primary buttons.

### Backgrounds (The Cave)
*   **App Background:** `#0a0a0a` - Deepest black/grey.
*   **Panel Background:** `#141414` - Slightly lighter for cards/sections.
*   **Hover State:** `rgba(255, 215, 0, 0.08)` - Subtle gold wash.
*   **Gradient Overlay:** `radial-gradient(circle at top right, #1a1a00, var(--bg-app))` - Suggests light filtering into the cave.

### Status Colors
*   **Success (Emerald):** `#50c878` - Valid files, successful operations.
*   **Error (Dragon Fire):** `#8b0000` - Invalid files, errors.
*   **Muted Text:** `#a0a0a0` - Secondary information.

## 3. Typography

*   **Font Family:** System standard (`Segoe UI`, `Roboto`, etc.) for performance and native feel.
*   **Headers:** Uppercase, letter-spaced (`1px`), Gold color.
*   **Monospace:** Used for file paths to ensure readability of directory structures.

## 4. Layout & Structure

The application uses a **Fixed-Height Dashboard** layout to mimic native desktop tools.

*   **Root Container:** `100vh` height, `overflow: hidden`.
*   **Header:** Fixed top bar, `60-80px` height.
*   **Main Grid:** Two-column layout.
    *   **Left (Content):** `1fr` width. Contains the Drop Zone and File Table.
    *   **Right (Sidebar):** Fixed `320px` width. Contains Actions and Navigation.
*   **Scrolling:** Panels scroll independently (`overflow-y: auto`) while the main window remains static.

## 5. Component Library

### DropZone (`src/components/DropZone.tsx`)
*   **States:** Default vs. Compact.
*   **Behavior:** Large "Hero" state when empty. Collapses to a compact horizontal bar when files are present to maximize table space.
*   **Visuals:** Dashed gold border. Animated `Sparkles` icon on hover.

### HoardTable (`src/components/HoardTable.tsx`)
*   **Structure:** Fixed layout table (`table-layout: fixed`).
*   **Columns:**
    *   *Original Artifact* (25%): Wraps text.
    *   *Status* (15%): Icons + Text.
    *   *New Designation* (48%): Monospace, smaller font, `overflow-wrap: anywhere`.
    *   *Appraise* (12%): Action button.
*   **Empty State:** Centered icon + message.

### Buttons (`index.css`)
*   **Primary (`.btn`):** Gold gradient background, black text, slight shadow glow on hover.
*   **Secondary (`.btn-secondary`):** Transparent background, gold border, gold text.

### Modals (`src/components/SettingsModal.tsx`, `EditModal.tsx`)
*   **Overlay:** Dark, blurred backdrop (`backdrop-filter: blur(2px)`).
*   **Container:** "Dragon Border" card (inset gold glow).

## 6. Iconography

*   **Library:** [Lucide React](https://lucide.dev/).
*   **Key Icons:**
    *   `Crown` (Logo)
    *   `Coins` (Status)
    *   `Scroll` (Empty List)
    *   `Ghost` (Dragon Placeholder)
    *   `Sparkles` (Hover/Magic)
    *   `UploadCloud` (Export)
    *   `Trash2` (Clear)

## 7. CSS Variables Reference

Defined in `src/index.css`:

```css
:root {
  --bg-app: #0a0a0a;
  --bg-panel: #141414;
  --text-main: #e0e0e0;
  --text-gold: #ffd700;
  --border-gold: #b8860b;
  --color-gold: #ffd700;
  --color-gold-dim: #b8860b;
  --color-dragon-red: #8b0000;
  --color-emerald: #50c878;
}
```
