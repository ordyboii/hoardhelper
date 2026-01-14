# Hoardhelper

**Hoardhelper** is an Electron application designed to help users organize their self-hosted media collections (TV shows and movies). It automates the process of parsing filenames, renaming files according to a standard convention, and moving them to a target directory or uploading them to a Nextcloud server.

## Tech Stack

*   **Runtime:** [Electron](https://www.electronjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
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

### 2. Renderer Process (`src/renderer.ts`, `index.html`)
*   Handles the user interface and interaction logic.
*   Built with vanilla TypeScript (manipulating the DOM directly) and CSS.
*   Communicates with the Main process via a secure `preload` script (bridged by `window.api`).
*   **Key UI Components:**
    *   **Drop Zone:** For dragging and dropping media files.
    *   **File Table:** Displays parsed metadata, status, and proposed destination paths.
    *   **Settings Modal:** Configures Nextcloud credentials and target directories.
    *   **Edit Modal:** Allows manual correction of parsed metadata (Series, Season, Episode).

### 3. Logic Modules (`src/logic/`)
*   **`parser.ts`**: Contains regex patterns and logic to extract metadata (Show Name, Season, Episode) from raw filenames.
*   **`exporter.ts`**: Handles local file operations (moving/renaming files).
*   **`nextcloud.ts`**: Wrapper around the `webdav` client to handle authentication and file uploads to Nextcloud.

## Key Features

*   **Automated Parsing:** Intelligently guesses show information from filenames.
*   **Smart Renaming:** Generates standardized paths (e.g., `Series/Season 01/Series - S01E01.ext`).
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
│   ├── logic/          # Core business logic (parsing, export, webdav)
│   ├── types/          # TypeScript type definitions
│   ├── main.ts         # Electron main process entry point
│   ├── preload.ts      # Context bridge for IPC
│   ├── renderer.ts     # Frontend logic
│   └── style.css       # Global styles
├── test/               # Test files
├── index.html          # App entry point (HTML)
└── package.json        # Project configuration and scripts
```
