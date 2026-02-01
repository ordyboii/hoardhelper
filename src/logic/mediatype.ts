import type { TorrentFile } from "../types/index.js";

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

const VIDEO_EXTENSIONS = [
  ".mkv",
  ".mp4",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".m4v",
  ".ts",
  ".m2ts",
] as const;

const SUBTITLE_EXTENSIONS = [".srt", ".sub", ".idx"] as const;

const JUNK_EXTENSIONS = [
  ".txt",
  ".nfo",
  ".rar",
  ".zip",
  ".7z",
  ".r00",
] as const;

const JUNK_SIZE_THRESHOLD = 50 * 1024 * 1024;

function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return filename.slice(lastDotIndex).toLowerCase();
}

function getBaseFilename(filename: string): string {
  const lastSlashIndex = filename.lastIndexOf("/");
  const lastDotIndex = filename.lastIndexOf(".");
  const base =
    lastSlashIndex === -1 ? filename : filename.slice(lastSlashIndex + 1);
  const noExt =
    lastDotIndex === -1 ? base : base.slice(0, base.lastIndexOf("."));
  return noExt.toLowerCase();
}

export function isVideoFile(file: TorrentFile): boolean {
  const ext = getFileExtension(file.path);
  return VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number]);
}

export function isSubtitleFile(file: TorrentFile): boolean {
  const ext = getFileExtension(file.path);
  return SUBTITLE_EXTENSIONS.includes(
    ext as (typeof SUBTITLE_EXTENSIONS)[number],
  );
}

export function isJunkFile(file: TorrentFile): boolean {
  const filename = file.path.toLowerCase();
  const ext = getFileExtension(filename);

  if (JUNK_EXTENSIONS.includes(ext as (typeof JUNK_EXTENSIONS)[number])) {
    return true;
  }

  const isSubtitle = SUBTITLE_EXTENSIONS.includes(
    ext as (typeof SUBTITLE_EXTENSIONS)[number],
  );
  if (!isSubtitle && file.bytes < JUNK_SIZE_THRESHOLD) {
    return true;
  }

  return false;
}

export function getFilteredVideoFiles(files: TorrentFile[]): TorrentFile[] {
  return files.filter(isVideoFile);
}

export function countEpisodeMatches(files: TorrentFile[]): number {
  const episodePatterns = [/s(\d{1,2})e(\d{1,2})/i, /(\d{1,2})x(\d{1,2})/i];

  let count = 0;
  for (const file of files) {
    const filename = file.path.toLowerCase();
    for (const pattern of episodePatterns) {
      if (pattern.test(filename)) {
        count++;
        break;
      }
    }
  }

  return count;
}

export function findMatchingSubtitle(
  videoFile: TorrentFile,
  subtitleFiles: TorrentFile[],
): TorrentFile | null {
  const videoBase = getBaseFilename(videoFile.path);

  for (const subFile of subtitleFiles) {
    const subBase = getBaseFilename(subFile.path);
    if (subBase === videoBase || subBase.startsWith(videoBase)) {
      return subFile;
    }
  }

  return null;
}

export function groupSubtitlesWithVideos(
  videoFiles: TorrentFile[],
  subtitleFiles: TorrentFile[],
): Map<number, number[]> {
  const subtitleMap = new Map<number, number[]>();

  for (const videoFile of videoFiles) {
    const matchingSubs: number[] = [];
    const videoBase = getBaseFilename(videoFile.path);

    for (const subFile of subtitleFiles) {
      const subBase = getBaseFilename(subFile.path);
      if (subBase === videoBase || subBase.startsWith(videoBase)) {
        matchingSubs.push(subFile.id);
      }
    }

    subtitleMap.set(videoFile.id, matchingSubs);
  }

  return subtitleMap;
}

export function getFilesWithSubtitleInfo(
  videoFiles: TorrentFile[],
  subtitleFiles: TorrentFile[],
): FileWithSubtitleInfo[] {
  const result: FileWithSubtitleInfo[] = [];
  const subtitleMap = groupSubtitlesWithVideos(videoFiles, subtitleFiles);

  for (const videoFile of videoFiles) {
    const subtitleFileIds = subtitleMap.get(videoFile.id) || [];
    result.push({
      ...videoFile,
      subtitleFileIds,
    });
  }

  return result;
}

export function detectMediaType(files: TorrentFile[]): MediaDetectionResult {
  const videoFiles = files.filter(isVideoFile);
  const subtitleFiles = files.filter(isSubtitleFile);
  const junkFiles = files.filter(isJunkFile);

  const filteredVideoFiles = videoFiles.filter((f) => !isJunkFile(f));

  const episodeCount = countEpisodeMatches(filteredVideoFiles);

  let mediaType: MediaType;
  if (episodeCount >= 3) {
    mediaType = "tv";
  } else if (episodeCount === 0) {
    mediaType = "movie";
  } else {
    mediaType = "ambiguous";
  }

  return {
    mediaType,
    videoFiles: filteredVideoFiles,
    subtitleFiles,
    junkFiles,
  };
}
