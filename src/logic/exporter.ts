import { ParseResult } from '../types/index.js';

/**
 * Generates the proposed new path for a file.
 * Returns a relative path structure suitable for Nextcloud (using forward slashes).
 */
export function generateNewPath(metadata: ParseResult | null): string | null {
    if (!metadata) return null;

    const { type, series, formattedSeason, formattedEpisode, ext } = metadata;
    let relativePath = "";

    if (type === 'movie') {
        // Structure: [Movie Name].[extension]
        relativePath = `${series}${ext}`;
    } else {
        // Structure: [Series Name]/Season [XX]/[Series Name] - S[XX]E[XX].[extension]
        // formattedSeason and formattedEpisode are guaranteed for TV type by the parser logic,
        // but Typescript might complain if they are optional in interface.
        const s = formattedSeason || '00';
        const e = formattedEpisode || '00';

        const seasonFolder = `Season ${s}`;
        const newFileName = `${series} - S${s}E${e}${ext}`;
        relativePath = `${series}/${seasonFolder}/${newFileName}`;
    }

    // Ensure forward slashes for consistency (Nextcloud/WebDAV)
    return relativePath.replace(/\\/g, '/');
}