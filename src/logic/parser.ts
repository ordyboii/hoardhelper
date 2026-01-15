import path from 'path';
import { ParseResult } from '../types/index.js';

/**
 * Normalizes a number to a 2-digit string (e.g., 1 -> "01").
 */
function pad(num: number): string {
    return num.toString().padStart(2, '0');
}

/**
 * Cleans up the series name by removing dots, underscores, brackets, and common metadata tags.
 */
function cleanSeriesName(name: string): string {
    let clean = name;

    // 1. Remove content in square brackets [Text] (often release groups or info)
    clean = clean.replace(/\[.*?\]/g, ' ');

    // 2. Remove common metadata keywords (case insensitive)
    // We do this BEFORE replacing dots with spaces to catch tags like "AAC5.1"
    const noisePatterns = [
        /\b(?:1080[pi]|720[pi]|480[pi]|2160[pi]|4k|8k)\b/gi,
        /\b(?:WEB-?DL|BluRay|HDTV|BD|DVD(?:Rip)?|CAM(?:Rip)?|TS|TC|WEBRip|DSNP|Netflix)\b/gi,
        /\b(?:x264|x265|HEVC|H\.?264|H\.?265|AVC|VC-?1)\b/gi,
        /\b(?:AAC[0-9\.]*|DTS-?HD?|AC3|EAC3|DDP[0-9\.]*|TrueHD|Atmos|FLAC|MP3|Opus|Vorbis)\b/gi,
        /\b(?:[257]\.[01]|Stereo|Dual-Audio)\b/gi,
        /\b(?:HDR(?:10)?|10bit|REMUX|PROPER|REPACK|EXTENDED|UNRATED|DIRECTORS\s+CUT|MULTI)\b/gi,
        /\b(?:[a-f0-9]{8})\b/gi // Hex hashes at end of string
    ];

    noisePatterns.forEach(pattern => {
        clean = clean.replace(pattern, ' ');
    });

    // 3. Replace dots, underscores, and illegal chars with spaces (keep parens)
    // Added: \ : * ? " < > |
    clean = clean.replace(/[\._\\:\*\?"<>\|]/g, ' ');

    // 4. Remove specific "release group" patterns that might remain (e.g. "-Group" at end)
    clean = clean.replace(/\s+-[a-zA-Z0-9]+$/, '');
    clean = clean.replace(/\s+-[a-zA-Z0-9]+$/, ''); 
    
    // 5. Cleanup whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    
    // 6. Remove trailing hyphens
    clean = clean.replace(/[-]+$/, '');

    return sanitizeSafe(clean.trim());
}

/**
 * Strictly sanitizes a string to be safe for use as a filename component.
 * Removes paths, control characters, and reserved filesystem characters.
 */
function sanitizeSafe(input: string): string {
    // 1. Remove any character that is NOT alphanumeric, space, dot, hyphen, underscore, or parentheses.
    // This whitelist approach automatically strips slashes (/, \), colons, wildcards, etc.
    let safe = input.replace(/[^a-zA-Z0-9 \.\-_()]/g, '');

    // 2. Prevent path traversal ".."
    // We treat ".." as a dangerous sequence if it's not part of a normal name.
    // Simplest approach: collapse multiple dots to a single dot, 
    // OR just remove the sequence ".." entirely.
    // Let's replace any sequence of 2+ dots with a single dot.
    safe = safe.replace(/\.{2,}/g, '.');

    // 3. Trim again just in case
    return safe.trim();
}

/**
 * Parses a filename to extract Series, Season, and Episode.
 */
export function parseFilename(filepath: string): ParseResult | null {
    const filename = path.basename(filepath);
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);

    const patterns = [
        // Pattern 1: SxxExx
        /^(.*?)[\.\s_]+S(\d+)E(\d+)/i,
        // Pattern 2: Anime " - 01"
        /^(?:\[.*?\]\s*)?(.*?)[\s_]+-\s+(\d+)(?:[\s_]+.*)?$/,
        // Pattern 3: 1x02
        /^(.*?)[\.\s_]+(\d+)x(\d+)/i
    ];

    let match: RegExpMatchArray | null = null;
    let series = '';
    let season = 1;
    let episode = 0;

    // Try Pattern 1: SxxExx
    match = nameWithoutExt.match(patterns[0]);
    if (match) {
        series = cleanSeriesName(match[1]);
        season = parseInt(match[2], 10);
        episode = parseInt(match[3], 10);
        return {
            type: 'tv',
            series,
            season,
            episode,
            formattedSeason: pad(season),
            formattedEpisode: pad(episode),
            ext,
            originalName: filename,
            fullPath: filepath
        };
    }

    // Try Pattern 3: 1x02
    match = nameWithoutExt.match(patterns[2]);
    if (match) {
        series = cleanSeriesName(match[1]);
        season = parseInt(match[2], 10);
        episode = parseInt(match[3], 10);
        return {
            type: 'tv',
            series,
            season,
            episode,
            formattedSeason: pad(season),
            formattedEpisode: pad(episode),
            ext,
            originalName: filename,
            fullPath: filepath
        };
    }

    // Try Pattern 2: Anime
    match = nameWithoutExt.match(patterns[1]);
    if (match) {
        series = cleanSeriesName(match[1]);
        season = 1;
        episode = parseInt(match[2], 10);
        return {
            type: 'tv',
            series,
            season,
            episode,
            formattedSeason: pad(season),
            formattedEpisode: pad(episode),
            ext,
            originalName: filename,
            fullPath: filepath
        };
    }

    // Movie
    return {
        type: 'movie',
        series: cleanSeriesName(nameWithoutExt),
        season: null,
        episode: null,
        formattedSeason: undefined,
        formattedEpisode: undefined,
        ext,
        originalName: filename,
        fullPath: filepath
    };
}
