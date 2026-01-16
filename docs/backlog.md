# HoardHelper - Development Backlog

> **Note:** Status fields must only be `Status: not started` or `Status: done`. This helps AI agents and automation tools track progress accurately.

---

## Epic: Design System Implementation

Core visual foundation and component library.

### US-001: CSS Design Tokens
**Status:** done

As a developer, I want a centralized set of CSS variables for colors, spacing, and typography, so that I can ensure visual consistency across the entire application.

**Acceptance Criteria:**
- [x] Root CSS variables defined for color palette (Dark Foundation, Gold Accents, Semantic Colors).
- [x] Typography tokens set for 'Cinzel' (Display), 'Inter' (Body), and 'JetBrains Mono' (Code).
- [x] Spacing scale defined (space-1 to space-20) based on 4px grid.
- [x] Animation timing and easing variables defined.

### US-002: Reusable Button Components
**Status:** done

As a developer, I want standard button classes, so that user actions have a consistent look and feel.

**Acceptance Criteria:**
- [x] `.btn-primary` implemented with gold gradient and hover lift effect.
- [x] `.btn-secondary` implemented with ghost style and gold border.
- [x] Disabled states handled visually (reduced opacity, no pointer events).
- [x] Buttons support icon integration (flex gap).

### US-003: Card Components
**Status:** done

As a developer, I want reuseable card containers, so that content is grouped clearly on the dark background.

**Acceptance Criteria:**
- [x] `.card` class created with secondary background color and subtle border.
- [x] `.card-elevated` class created for high-priority content.
- [x] Hover effects implemented (gold border highlight and glow shadow).

### US-004: Dark Theme Implementation
**Status:** done

As a user, I want a dark-themed interface, so that the application is comfortable to use in low-light environments and matches the "dragon's hoard" aesthetic.

**Acceptance Criteria:**
- [x] Global body background set to deep black (`#0a0a0a`).
- [x] Text colors optimized for contrast on dark backgrounds (`#e8e8e8`).
- [x] Gold accents used for high-visibility elements against the dark theme.

### US-005: Loading States
**Status:** not started

As a user, I want to see skeletons or loading spinners, so that I know the application is working when data is loading.

**Acceptance Criteria:**
- [ ] Skeleton loader component created for file cards.
- [ ] Loading states added to command center panels.
- [ ] Smooth transition between loading and data states.

---

## Epic: Core UI Refresh

Modernize the interface with the dragon's hoard theme.

### US-006: Drop Zone Redesign
**Status:** done

As a user, I want an engaging and obvious drop zone, so that I know exactly where to drag my files for processing.

**Acceptance Criteria:**
- [x] Large "Present Your Treasures" area implemented.
- [x] Interactive hover state with gold glow and "Release Your Treasures!" text.
- [x] Animated icon (Gem/Sparkles) responding to drag events.
- [x] Supports both drag-and-drop and click-to-browse interactions.

### US-007: File Card Interface
**Status:** done

As a user, I want to see clear details about the files I've added, so I can review them before processing.

**Acceptance Criteria:**
- [x] Cards display file name, type (Movie/TV), and parsed metadata.
- [x] Status icons (Ready, Processing, Error) are clearly visible.
- [x] Cards include action buttons (Edit, Remove).
- [x] Metadata grid layout implemented for organized data display.

### US-008: Command Center Layout
**Status:** done

As a user, I want a persistent sidebar or header, so that I can access global actions and see my hoard's status.

**Acceptance Criteria:**
- [x] Layout component created with fixed header and scrollable main content.
- [x] Header includes logo, app title, and global status badge.
- [x] Main content area handles overflow correctly.

### US-009: Micro-animations
**Status:** done

As a user, I want subtle animations, so that the interface feels responsive and alive.

**Acceptance Criteria:**
- [x] keyframes defined for `fadeIn`, `slideUp`, `scaleIn`, and `glowPulse`.
- [x] Hover transitions added to all interactive elements (buttons, inputs, cards).
- [x] Shimmer effect added to processing bars.

### US-010: Toast Notifications
**Status:** not started

As a user, I want to receive temporary popup notifications, so that I know when background operations (like uploads) complete or fail without staring at the screen.

**Acceptance Criteria:**
- [ ] Toast container implemented fixed to a screen corner.
- [ ] Success, Error, and Info toast variants designed.
- [ ] Auto-dismiss functionality after N seconds.

---

## Epic: Enhanced Functionality

Improve status feedback and error handling.

### US-011: Progress Indicators
**Status:** done

As a user, I want to see a progress bar during processing, so that I know how long a task will take.

**Acceptance Criteria:**
- [x] File cards show a progress bar when in 'processing' state.
- [x] Percentage text displayed alongside the bar.
- [x] Animated shimmer effect on the progress fill to indicate activity.

### US-012: Error Handling UI
**Status:** not started

As a user, I want clear error messages when something goes wrong, so I can fix the issue.

**Acceptance Criteria:**
- [ ] Error states in File Cards show specific failure reasons.
- [ ] "Retry" action available for failed items.
- [ ] Visual distinction (Red borders/text) for error states is prominent.

### US-013: Settings Panel
**Status:** done

As a user, I want a comprehensive settings modal, so that I can configure my Nextcloud connection and paths.

**Acceptance Criteria:**
- [x] Modal component created with backdrop blur.
- [x] Tabbed interface implemented (Connection, Paths).
- [x] Input fields for WebDAV URL, Username, Password, and Target Folders.
- [x] "Save" functionality persists data (to local state/storage).

### US-014: Connection Testing
**Status:** done

As a user, I want to test my Nextcloud credentials, so that I don't waste time trying to upload with bad settings.

**Acceptance Criteria:**
- [x] "Test Connection" button added to Settings modal.
- [x] Mock or real async connection test implemented.
- [x] Button shows loading state during test.
- [x] Success/Failure alert provides immediate feedback.

### US-015: Path Validation
**Status:** not started

As a user, I want the system to check if my target paths exist, so that uploads don't fail due to missing directories.

**Acceptance Criteria:**
- [ ] Async validation of "TV Shows" and "Movies" paths on settings save.
- [ ] Visual feedback if the path is not found on the server.

---

## Epic: Polish & Testing

Accessibility, performance, and cross-browser compatibility.

### US-016: Accessibility Audit
**Status:** not started

As a user with diverse needs, I want the app to be accessible, so that I can use it with screen readers or keyboard navigation.

**Acceptance Criteria:**
- [ ] Color contrast ratios verified (WCAG 2.2 AA).
- [ ] All inputs have associated labels.
- [ ] Focus indicators are visible and high-contrast.

### US-017: Keyboard Shortcuts
**Status:** not started

As a power user, I want keyboard shortcuts, so that I can process files faster.

**Acceptance Criteria:**
- [ ] `Space`: Toggle selection of highlighted file.
- [ ] `Delete`: Remove selected file.
- [ ] `Cmd/Ctrl + Enter`: Start processing queue.
- [ ] `Esc`: Close open modals.

### US-018: ARIA Labels
**Status:** not started

As a screen reader user, I want meaningful ARIA labels, so I understand icon-only buttons.

**Acceptance Criteria:**
- [ ] `aria-label` added to all icon buttons (Close, Edit, Remove).
- [ ] Status messages announced to live regions.

### US-019: Performance Optimization
**Status:** not started

As a user, I want smooth animations, so the app feels premium.

**Acceptance Criteria:**
- [ ] Animations run at 60fps.
- [ ] React re-renders minimized during file drag events.

### US-020: Cross-browser Testing
**Status:** not started

As a user, I want the app to work on my preferred browser, so I am not forced to switch.

**Acceptance Criteria:**
- [ ] Verified functionality on Chrome, Firefox, Safari, and Edge.
- [ ] Layout grid/flex consistency checked across engines.

---

## Epic: Batch Operations

Efficiency features for power users.

### US-021: Bulk Metadata Editing
**Status:** not started

As a user, I want to edit multiple files at once, so I can quickly fix a season of episodes.

**Acceptance Criteria:**
- [ ] Multi-select capability in the file list.
- [ ] "Edit Selected" action opens a bulk editor.
- [ ] Applying changes updates all selected files.

### US-022: Configuration Templates
**Status:** not started

As a user, I want to save different processing profiles, so I can switch between "4K Movie" and "1080p TV" settings easily.

**Acceptance Criteria:**
- [ ] UI to save current settings as a named profile.
- [ ] Dropdown to load a saved profile.

### US-023: Scheduled Uploads
**Status:** not started

As a user with limited bandwidth, I want to schedule uploads for night, so I don't slow down my network during the day.

**Acceptance Criteria:**
- [ ] "Schedule" option added to the processing flow.
- [ ] Time picker to select start time.
- [ ] Job queue waits until start time to begin upload.

### US-024: Quality Presets
**Status:** not started

As a user, I want one-click quality settings, so I don't have to remember bitrate numbers.

**Acceptance Criteria:**
- [ ] Presets defined for Low (720p), Medium (1080p), High (4K).
- [ ] Selecting a preset updates the underlying FFmpeg arguments.

---

## Epic: Metadata Integration

Automatic enrichment from external sources.

### US-025: TMDB Integration
**Status:** not started

As a user, I want movie details auto-filled from TMDB, so I don't have to type them manually.

**Acceptance Criteria:**
- [ ] Integration with TMDB API.
- [ ] Search by filename/year.
- [ ] Auto-populate Title, Year, and Poster art.

### US-026: TVDB Integration
**Status:** not started

As a user, I want TV episode titles auto-fetched, so my files are named with official episode names.

**Acceptance Criteria:**
- [ ] Integration with TVDB API.
- [ ] Lookup by Series + Season + Episode number.
- [ ] Auto-populate Episode Title.

### US-027: Subtitle Management
**Status:** not started

As a user, I want subtitles managed automatically, so I don't lose them during conversion.

**Acceptance Criteria:**
- [ ] Extract embedded subtitles from MKV.
- [ ] Convert VobSub to SRT if necessary.
- [ ] Embed SRT into output container.

### US-028: Preview Playback
**Status:** not started

As a user, I want to watch a few seconds of the video, so I can verify I'm processing the correct file.

**Acceptance Criteria:**
- [ ] Video player modal added.
- [ ] Support for direct playback of browser-supported formats.
- [ ] Transcoding on-the-fly for unsupported formats (optional).

### US-029: Statistics Dashboard
**Status:** not started

As a user, I want to see how much I've hoarded, so I can feel good about my collection.

**Acceptance Criteria:**
- [ ] Dashboard view with charts.
- [ ] Metrics: Total files processed, Data stored, Time saved.

---

## Epic: Platform Expansion

Multi-user and ecosystem features.

### US-030: Multi-user Support
**Status:** not started

As an admin, I want to share the tool with my family, so they can manage their own hoards.

**Acceptance Criteria:**
- [ ] User authentication system.
- [ ] Per-user settings and history.

### US-031: Mobile Companion App
**Status:** not started

As a user, I want to check progress from my phone, so I don't have to sit at my computer.

**Acceptance Criteria:**
- [ ] Responsive mobile layout or native app.
- [ ] Read-only view of current queue status.

### US-032: Plugin System
**Status:** not started

As a developer, I want to write plugins, so I can extend functionality without forking.

**Acceptance Criteria:**
- [ ] Plugin architecture defined.
- [ ] API hooks for processing steps.

### US-033: Public API
**Status:** not started

As a developer, I want to trigger hoards via API, so I can automate downloads from other tools (like Sonarr).

**Acceptance Criteria:**
- [ ] REST API endpoints documented.
- [ ] API Key authentication.

---

## Epic: Media Library Tracking

Backup and inventory management for exported media.

### US-034: Local Media Database
**Status:** not started

As a user, I want the system to remember what I've uploaded, so I have a local backup record of my library.

**Acceptance Criteria:**
- [ ] SQLite or JSON database implemented to store processing history.
- [ ] Records include: Filename, Final Path, Date Uploaded, File Size, Hash (optional).

### US-035: Inventory View
**Status:** not started

As a user, I want to browse a list of everything I've uploaded, so I can see my collection at a glance.

**Acceptance Criteria:**
- [ ] New "Library" tab/page added.
- [ ] Sortable table showing all historic uploads.
- [ ] Search bar to filter by series or movie title.

### US-036: Inventory Export
**Status:** not started

As a user, I want to export my library list, so I can use it in Excel or share it.

**Acceptance Criteria:**
- [ ] "Export CSV" and "Export JSON" buttons added to Inventory view.
- [ ] Export file includes all metadata columns.

### US-037: Advanced Filtering
**Status:** not started

As a user, I want to filter my exported items, so I can find "all movies from 1999".

**Acceptance Criteria:**
- [ ] Filter controls for: Type (TV/Movie), Year, Date Added.
- [ ] Status filter (Uploaded/Failed).

### US-038: Sync Verification
**Status:** not started

As a user, I want to know if a file I uploaded is still on Nextcloud, so I can detect data loss.

**Acceptance Criteria:**
- [ ] Background job to crawl Nextcloud remote folder.
- [ ] Comparison against local database.
- [ ] Alert user to "Missing" files that were previously uploaded.
