# Hoardhelper

**Hoardhelper** is an Electron application designed to help users organize their self-hosted media collections (TV shows and movies). It automates the process of parsing filenames, renaming files according to a standard convention, and moving them to a target directory or uploading them to a Nextcloud server.

## Tech Stack

*   **Runtime:** [Electron](https://www.electronjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Frontend Framework:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** CSS Modules / Global CSS (Gold & Dragon Theme)
*   **Design System:** [design.md](./design.md) - Reference for UI/UX patterns and theming.
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Persistence:** [electron-store](https://github.com/sindresorhus/electron-store)
*   **Networking:** [webdav](https://github.com/perry-mitchell/webdav-client) (for Nextcloud integration)
*   **Testing:** Node.js native test runner (`node --test`)

## Architecture Overview

The application follows the standard Electron multi-process architecture:

### 1. Main Process (`src/main.ts`)
*   Serves as the backend of the application.
*   Handles native system interactions: file system operations, WebDAV uploads, and window management.
*   Exposes IPC (Inter-Process Communication) handlers for the renderer to trigger actions (e.g., `parse-files`, `export-files`, `save-settings`).
*   Manages application state and persistence via `electron-store`.

### 2. Renderer Process (`src/index.tsx`, `src/App.tsx`)
*   Handles the user interface and interaction logic.
*   Built with **React 19** and **TypeScript**.
*   Communicates with the Main process via a secure `preload` script (bridged by `window.api`).
*   **Key Components (`src/components/`):**
    *   **Layout:** Manages the application shell, header, and "Dragon" theme.
    *   **DropZone:** A dynamic drag-and-drop area that collapses when files are added.
    *   **HoardTable:** A responsive table displaying parsed metadata, status, and proposed destination paths.
    *   **SettingsModal:** Configures Nextcloud credentials and target directories.
    *   **EditModal:** Allows manual correction of parsed metadata (Series, Season, Episode).

### 3. Logic Modules (`src/logic/`)
*   **`parser.ts`**: Contains regex patterns and logic to extract metadata (Show Name, Season, Episode) from raw filenames.
*   **`exporter.ts`**: Handles local file operations (moving/renaming files).
*   **`nextcloud.ts`**: Wrapper around the `webdav` client to handle authentication and file uploads to Nextcloud.

## Key Features

*   **Automated Parsing:** Intelligently guesses show information from filenames.
*   **Smart Renaming:** Generates standardized paths (e.g., `Series/Season 01/Series - S01E01.ext`).
*   **Dragon-Themed UI:** A dark, immersive interface with gold accents and dragon imagery, built for a "hoarding" aesthetic.
*   **Dual Mode:**
    *   **Local:** Moves/Copies files to a local directory.
    *   **Remote:** Uploads files directly to a Nextcloud instance via WebDAV.
*   **Manual Override:** Users can edit metadata if the auto-parser fails.
*   **Persistence:** Remembers settings and credentials between sessions.

## Development & Usage

### Prerequisites
*   Node.js (v18+ recommended)
*   npm

### Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the development server (Vite + Electron). |
| `npm run build` | Type-check and build the production application. |
| `npm run preview` | Preview the production build. |
| `npm test` | Run the test suite (`test/verify.ts`). |
| `npm run dist` | Build and package the application for distribution (creates an executable). |

### Project Structure

```text
/
├── dist/               # Renderer build output
├── dist-electron/      # Main process build output
├── release/            # Packaged application installers
├── src/
│   ├── components/     # React UI Components
│   ├── logic/          # Core business logic (parsing, export, webdav)
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main React Application Component
│   ├── index.css       # Global Styles and Theme Variables
│   ├── index.tsx       # React Entry Point
│   ├── main.ts         # Electron main process entry point
│   ├── preload.cts     # Context bridge for IPC
│   └── global.d.ts     # Global type declarations
├── test/               # Test files
├── index.html          # App entry point (HTML)
├── vite.config.ts      # Vite configuration (React plugin)
└── package.json        # Project configuration and scripts
```