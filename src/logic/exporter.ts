import fs from 'fs-extra';
import path from 'path';
import { ParseResult, ExportResult } from '../types';

// Base export directory
export const EXPORT_DIR = path.resolve('export');

/**
 * Generates the proposed new path for a file.
 */
export function generateNewPath(metadata: ParseResult | null, isRemote: boolean = false): string | null {
    if (!metadata) return null;

    const { type, series, formattedSeason, formattedEpisode, ext } = metadata;
    let relativePath = "";

    if (type === 'movie') {
        // Structure: [Movie Name]/[Movie Name].[extension]
        relativePath = path.join(series, `${series}${ext}`);
    } else {
        // Structure: [Series Name]/Season [XX]/[Series Name] - S[XX]E[XX].[extension]
        // formattedSeason and formattedEpisode are guaranteed for TV type by the parser logic,
        // but Typescript might complain if they are optional in interface.
        const s = formattedSeason || '00';
        const e = formattedEpisode || '00';
        
        const seasonFolder = `Season ${s}`;
        const newFileName = `${series} - S${s}E${e}${ext}`;
        relativePath = path.join(series, seasonFolder, newFileName);
    }

    if (isRemote) {
        // For Nextcloud, we want forward slashes and no absolute prefix
        return relativePath.replace(/\\/g, '/');
    }

    return path.join(EXPORT_DIR, relativePath);
}

interface FileExportData {
    fullPath: string;
    destinationPath: string | null;
}

/**
 * Copies a file to its new destination.
 */
export async function exportFile(fileData: FileExportData): Promise<ExportResult> {
    const { fullPath, destinationPath } = fileData;

    if (!destinationPath) {
        return { success: false, error: 'Invalid destination path' };
    }

    try {
        // Ensure the directory exists
        await fs.ensureDir(path.dirname(destinationPath));

        // Check if destination exists to avoid overwrite (simple safety)
        if (await fs.pathExists(destinationPath)) {
            return { success: false, error: 'File already exists' };
        }

        // Copy the file
        await fs.copy(fullPath, destinationPath);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
