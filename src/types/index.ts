export enum ViewState {
  Loot = "Loot",
  Extraction = "Extraction",
  Secure = "Secure",
  Map = "Map",
}

export enum FileStatus {
  Ready = "Ready",
  Processing = "Processing",
  Secured = "Secured",
  Error = "Error",
}

export interface ParseResult {
  type?: "tv" | "movie";
  series: string;
  season?: number | null;
  episode?: number | null;
  formattedSeason?: string;
  formattedEpisode?: string;
  ext: string;
  originalName: string;
  fullPath: string;
}

export interface FileMetadata extends ParseResult {
  proposed: string | null;
  valid: boolean;
  error?: string;
  _retryId?: string; // Internal: tracks if this is a retry of a previous upload
  isTempFile?: boolean; // Flag to indicate file should be deleted after upload
}

export interface HistoryItem extends FileMetadata {
  id: string; // Unique ID for tracking retries
  uploadedAt: Date; // When the upload completed
  uploadStatus: "success" | "failed"; // Final status
  errorMessage?: string; // Error details if failed
  isRetry: boolean; // Was this a retry attempt?
}

export interface Settings {
  url: string;
  targetFolder?: string; // Deprecated, kept for migration
  targetFolderTv: string;
  targetFolderMovie: string;
  username: string;
  password: string;
  // Real-Debrid settings
  realDebridApiKey?: string;
  // Connection monitoring
  connectionCheckInterval?: number; // in seconds, default 60
}

/**
 * Settings as stored on disk with sensitive fields encrypted.
 * Sensitive fields (password, realDebridApiKey) are encrypted using Electron's safeStorage API.
 */
export interface StoredSettings {
  url: string;
  targetFolder?: string;
  targetFolderTv: string;
  targetFolderMovie: string;
  username: string;
  /** Encrypted password (base64-encoded encrypted buffer) */
  password_encrypted?: string;
  /** Encrypted Real-Debrid API key (base64-encoded encrypted buffer) */
  realDebridApiKey_encrypted?: string;
  connectionCheckInterval?: number;
  /** Flag to indicate if encryption is being used */
  _encrypted?: boolean;
}

export interface RealDebridConnectionResult {
  success: boolean;
  expiration?: string;
  username?: string;
  error?: string;
}

export interface TorrentFile {
  id: number;
  path: string; // Path to the file inside the torrent, starting with "/"
  bytes: number; // File size in bytes
  selected: number; // 0 or 1, indicates if file is selected for download
}

export interface TorrentInfo {
  id: string;
  filename: string;
  original_filename: string;
  hash: string; // SHA1 Hash of the torrent
  bytes: number; // Size of selected files only
  original_bytes: number; // Total size of the torrent
  host: string; // Host main domain
  split: number; // Split size of links
  progress: number; // Possible values: 0 to 100
  status: string; // Current status: magnet_error, magnet_conversion, waiting_files_selection, queued, downloading, downloaded, error, virus, compressing, uploading, dead
  added: string; // jsonDate
  files: TorrentFile[];
  links: string[]; // Host URLs
  ended?: string; // !! Only present when finished, jsonDate
  speed?: number; // !! Only present in "downloading", "compressing", "uploading" status
  seeders?: number; // !! Only present in "downloading", "magnet_conversion" status
}

export interface AddMagnetResult {
  success: boolean;
  torrentId?: string;
  uri?: string;
  error?: string;
}

export type MediaType = "tv" | "movie" | "ambiguous";

export interface MediaDetectionResult {
  mediaType: MediaType;
  videoFiles: TorrentFile[];
  subtitleFiles: TorrentFile[];
  junkFiles: TorrentFile[];
}

export interface FileWithSubtitleInfo extends TorrentFile {
  subtitleFileIds: number[];
}

export interface UploadProgress {
  index: number;
  percent: number;
  status: string;
}

export interface ExportResult {
  success: boolean;
  error?: string;
}

export interface ElectronAPI {
  getFilePath: (file: File) => string;
  parseFiles: (filePaths: string[]) => Promise<FileMetadata[]>;
  exportFiles: (files: FileMetadata[]) => Promise<ExportResult[]>;
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  testConnection: (settings?: Settings) => Promise<ExportResult>;
  testRealDebridConnection: (
    apiKey?: string,
  ) => Promise<RealDebridConnectionResult>;
  generatePath: (metadata: FileMetadata) => Promise<string | null>;
  onUploadProgress: (callback: (data: UploadProgress) => void) => void;
  onDownloadProgress: (callback: (percent: number) => void) => void;
  log: (msg: string) => void;
  // Real-Debrid magnet and torrent methods
  addMagnetToRealDebrid: (magnet: string) => Promise<AddMagnetResult>;
  getTorrentInfo: (torrentId: string) => Promise<TorrentInfo>;
  selectFiles: (torrentId: string, fileIds: number[]) => Promise<TorrentInfo>;
  deleteTorrent: (
    torrentId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  unrestrictLinks: (
    links: string[],
  ) => Promise<Array<{ success: boolean; url?: string; error?: string }>>;
  downloadFiles: (
    items: Array<{ downloadUrl: string; filename: string; bytes: number }>,
  ) => Promise<Array<{ success: boolean; localPath?: string; error?: string }>>;
}
