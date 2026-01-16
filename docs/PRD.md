# HoardHelper - Product Requirements Document

## Executive Summary

**Product Name:** HoardHelper  
**Tagline:** Organize your digital treasures  

HoardHelper is a media file management tool that automatically processes, organizes, and uploads video files (movies and TV shows) to Nextcloud. It strips unnecessary codecs and artefact names from torrents, standardizes naming conventions, and maintains a clean, organized media library.

---

## Product Vision

### The Problem

Managing a media library is tedious. You're juggling multiple tools:
- File renaming utilities for consistent naming
- Manual folder organization for seasons and years
- WebDAV clients for uploads
- Spreadsheets to track what you've already processed

Each tool solves one piece, but the workflow is fragmented and time-consuming.

### The Solution

HoardHelper consolidates this entire workflow into a single, automated experience. Drag files in, let the system handle the rest:

- **One tool replaces many** — No more switching between apps
- **Automation over manual work** — Processing, renaming, and uploading happen automatically
- **Consistency guaranteed** — Every file follows your naming conventions
- **Peace of mind** — Your library stays organized without constant maintenance

### Key Success Indicators

- Files processed without manual intervention
- Time saved vs. manual workflow
- Consistent naming across entire library
- Zero failed uploads to Nextcloud

---

## Core Features

### 1. Drag-and-Drop Processing

Drop files onto the interface and watch them transform:
- Automatic codec stripping (remove audio/video noise)
- Format standardization across all media
- Real-time progress tracking
- Queue management for batch operations

### 2. Intelligent Organization

Automatic naming and folder structure:
- **TV Shows:** `Series/Season 01/Series - S01E01`
- **Movies:** `Movie (2024)/Movie (2024)`
- Metadata extraction from filenames
- Duplicate detection and handling

### 3. Nextcloud Integration

Seamless cloud upload:
- WebDAV connection management
- Automatic upload after processing
- Connection status monitoring
- Sync verification

### 4. Command Center

Central control for all operations:
- **Loot** — View file inventory
- **Extraction** — Manage processing queue
- **Secure** — Upload to Nextcloud
- **Jettison** — Remove processed source files

### 5. Configuration

Customize to your workflow:
- Nextcloud connection settings
- Base paths for TV/Movies
- Codec and quality preferences
- Naming convention templates

---

## User Personas

### The Media Curator

**Who:** Tech-savvy individuals with large media libraries  
**Goal:** Maintain an organized, high-quality collection  
**Pain:** Manual organization, inconsistent naming, codec bloat  
**Need:** Automation, consistency, reliability

### The Minimalist

**Who:** Users wanting clean, space-efficient libraries  
**Goal:** Reduce file sizes without quality loss  
**Pain:** Storage limitations, complex tools  
**Need:** Simple interface, automatic optimization

---

## Design System

### Brand Identity: Dragon's Hoard

The visual language draws from a dragon meticulously organizing its treasure hoard:

| Concept | Application |
|---------|-------------|
| Files | Treasures |
| Processing | Appraisal |
| Upload | Secure in Hoard |
| Delete | Jettison Cargo |
| Queue | Treasure Trove |

### Personality

- **Protective** — Safeguards your media collection
- **Meticulous** — Precise organization and standards
- **Powerful** — Handles complex processing effortlessly
- **Mystical** — Magical automation that "just works"

### Visual Direction

- **Dark foundation** with gold accents (treasure aesthetic)
- **Cinzel** display font for headers (fantasy feel)
- **Inter** for body text (clean readability)
- **Lucide** or **Heroicons** for consistent iconography
- **Purposeful motion** — animations serve function, stay under 300ms

---

## User Flows

### Primary: Processing Media Files

```
1. User drops files onto drop zone
2. Files appear in "Present Your Treasures" area
3. System auto-detects media type (TV/Movie)
4. User reviews parsed metadata
5. User clicks "Secure in Hoard"
6. Processing: codec stripping → renaming → upload
7. Progress indicator shows status
8. Success confirmation
9. Option to "Jettison Cargo" (delete source)
```

### Secondary: Configuration

```
1. User opens "Map Configuration"
2. Configure: Nextcloud URL, credentials, paths
3. Set codec preferences and naming conventions
4. Test connection
5. Save and validate
```

---

## Technical Overview

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| Styling | Vanilla CSS (custom design tokens) |
| State | React Context |
| Storage | Nextcloud (WebDAV) |
| Build | Vite |

### Processing Pipeline

```
Input → Analyze → Process → Rename → Upload → Cleanup
```

1. **Analyze** — Extract metadata, detect codecs, identify type
2. **Process** — Strip codecs, standardize format
3. **Rename** — Apply naming convention
4. **Upload** — Transfer to Nextcloud, verify integrity
5. **Cleanup** — Remove source (optional)

---

## Accessibility

- WCAG 2.2 AA compliant contrast ratios
- Full keyboard navigation
- Screen reader support with ARIA labels
- Visible focus states

**Keyboard Shortcuts:**
- `Space` — Select/deselect
- `Enter` — Start processing
- `Delete` — Remove from queue
- `Ctrl/Cmd + ,` — Settings
- `Esc` — Close modals

---

*See [backlog.md](./backlog.md) for development roadmap and feature backlog.*