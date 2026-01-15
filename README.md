# Hoardhelper

**Hoardhelper** is an Electron application designed to help users organize their self-hosted media collections (TV shows and movies). It automates the process of parsing filenames, renaming files according to a standard convention, and moving them to a target directory or uploading them to a Nextcloud server.

## Features

*   **Automated Parsing:** Intelligently guesses show information from filenames.
*   **Smart Renaming:** Generates standardized paths (e.g., `Series/Season 01/Series - S01E01.ext`).
*   **Dual Mode Export:**
    *   **Local:** Moves or copies files to a local directory.
    *   **Remote:** Uploads files directly to a Nextcloud instance via WebDAV.
*   **Manual Override:** Edit metadata (Series, Season, Episode) manually if the auto-parser fails.
*   **Persistence:** Remembers your settings and credentials between sessions.
*   **Dragon-Themed UI:** A modern, React-based interface with a dark "Dragon & Gold" aesthetic, featuring responsive drag-and-drop and intuitive file management.

## Tech Stack

*   **Runtime:** [Electron](https://www.electronjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Persistence:** [electron-store](https://github.com/sindresorhus/electron-store)
*   **Networking:** [webdav](https://github.com/perry-mitchell/webdav-client) (for Nextcloud integration)
*   **Testing:** Node.js native test runner

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ordyboii/hoardhelper.git
    cd hoardhelper
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Building

To build the production application:
```bash
npm run build
```

To package the application for distribution:
```bash
npm run dist
```
The installers will be available in the `release/` directory.

### Testing

Run the automated test suite:
```bash
npm test
```

## Project Structure

```text
/
├── src/
│   ├── components/     # React UI Components
│   ├── logic/          # Core business logic (parsing, export, webdav)
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main React Application Component
│   ├── main.ts         # Electron main process entry point
│   ├── preload.cts     # Context bridge for IPC
│   └── index.tsx       # React Entry Point
├── test/               # Test files
├── index.html          # App entry point
└── package.json        # Project configuration
```