export interface ParseResult {
    type?: 'tv' | 'movie';
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
}

export interface Settings {
    url: string;
    targetFolder?: string; // Deprecated, kept for migration
    targetFolderTv: string;
    targetFolderMovie: string;
    username: string;
    password: string;
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
    generatePath: (metadata: FileMetadata) => Promise<string | null>;
    onUploadProgress: (callback: (data: UploadProgress) => void) => void;
    log: (msg: string) => void;
}
