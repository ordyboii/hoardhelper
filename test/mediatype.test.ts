import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isVideoFile,
  isSubtitleFile,
  isJunkFile,
  getFilteredVideoFiles,
  countEpisodeMatches,
  findMatchingSubtitle,
  groupSubtitlesWithVideos,
  getFilesWithSubtitleInfo,
  detectMediaType,
} from "../src/logic/mediatype";
import type { TorrentFile } from "../src/types";

describe("Media Type Detection", () => {
  describe("isVideoFile", () => {
    it("identifies video files by extension", () => {
      const videoFile: TorrentFile = {
        id: 1,
        path: "/Show.S01E01.mkv",
        bytes: 1000000000,
        selected: 0,
      };

      assert.strictEqual(isVideoFile(videoFile), true);
    });

    it("returns false for non-video files", () => {
      const textFile: TorrentFile = {
        id: 2,
        path: "/readme.txt",
        bytes: 1024,
        selected: 0,
      };

      assert.strictEqual(isVideoFile(textFile), false);
    });

    it("handles lowercase extensions", () => {
      const lowercaseFile: TorrentFile = {
        id: 3,
        path: "/video.mp4",
        bytes: 500000000,
        selected: 0,
      };

      assert.strictEqual(isVideoFile(lowercaseFile), true);
    });
  });

  describe("isSubtitleFile", () => {
    it("identifies subtitle files by extension", () => {
      const srtFile: TorrentFile = {
        id: 1,
        path: "/Show.S01E01.srt",
        bytes: 100000,
        selected: 0,
      };

      assert.strictEqual(isSubtitleFile(srtFile), true);
    });

    it("identifies .sub files", () => {
      const subFile: TorrentFile = {
        id: 2,
        path: "/video.sub",
        bytes: 50000,
        selected: 0,
      };

      assert.strictEqual(isSubtitleFile(subFile), true);
    });

    it("identifies .idx files", () => {
      const idxFile: TorrentFile = {
        id: 3,
        path: "/video.idx",
        bytes: 200000,
        selected: 0,
      };

      assert.strictEqual(isSubtitleFile(idxFile), true);
    });

    it("returns false for non-subtitle files", () => {
      const videoFile: TorrentFile = {
        id: 4,
        path: "/video.mkv",
        bytes: 1000000000,
        selected: 0,
      };

      assert.strictEqual(isSubtitleFile(videoFile), false);
    });
  });

  describe("isJunkFile", () => {
    it("identifies .txt files", () => {
      const txtFile: TorrentFile = {
        id: 2,
        path: "/readme.txt",
        bytes: 1024,
        selected: 0,
      };

      assert.strictEqual(isJunkFile(txtFile), true);
    });

    it("identifies .nfo files", () => {
      const nfoFile: TorrentFile = {
        id: 3,
        path: "/movie.nfo",
        bytes: 2048,
        selected: 0,
      };

      assert.strictEqual(isJunkFile(nfoFile), true);
    });

    it("identifies archive files", () => {
      const rarFile: TorrentFile = {
        id: 4,
        path: "/archive.rar",
        bytes: 100000000,
        selected: 0,
      };

      assert.strictEqual(isJunkFile(rarFile), true);
    });

    it("identifies small files (< 50MB)", () => {
      const smallFile: TorrentFile = {
        id: 5,
        path: "/small.mkv",
        bytes: 40000000,
        selected: 0,
      };

      assert.strictEqual(isJunkFile(smallFile), true);
    });

    it("does not mark large video files as junk", () => {
      const largeVideo: TorrentFile = {
        id: 6,
        path: "/movie.mkv",
        bytes: 2000000000,
        selected: 0,
      };

      assert.strictEqual(isJunkFile(largeVideo), false);
    });

    it("does not mark subtitle files as junk", () => {
      const subtitle: TorrentFile = {
        id: 7,
        path: "/video.srt",
        bytes: 50000,
        selected: 0,
      };

      assert.strictEqual(isSubtitleFile(subtitle), true);
      assert.strictEqual(isJunkFile(subtitle), false);
    });
  });

  describe("getFilteredVideoFiles", () => {
    it("filters out non-video files", () => {
      const files: TorrentFile[] = [
        { id: 1, path: "/video.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/readme.txt", bytes: 1024, selected: 0 },
        { id: 3, path: "/video.mp4", bytes: 500000000, selected: 0 },
      ];

      const result = getFilteredVideoFiles(files);

      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].path, "/video.mkv");
      assert.strictEqual(result[1].path, "/video.mp4");
    });
  });

  describe("countEpisodeMatches", () => {
    it("counts SxxExx patterns", () => {
      const files: TorrentFile[] = [
        { id: 1, path: "/Show.S01E01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/Show.S01E02.mkv", bytes: 1000000000, selected: 0 },
        { id: 3, path: "/Show.S02E01.mkv", bytes: 1000000000, selected: 0 },
      ];

      const count = countEpisodeMatches(files);

      assert.strictEqual(count, 3);
    });

    it("counts x patterns", () => {
      const files: TorrentFile[] = [
        { id: 1, path: "/Show.1x01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/Show.1x02.mkv", bytes: 1000000000, selected: 0 },
      ];

      const count = countEpisodeMatches(files);

      assert.strictEqual(count, 2);
    });

    it("returns 0 for movie files", () => {
      const files: TorrentFile[] = [
        {
          id: 1,
          path: "/Movie.2023.1080p.mkv",
          bytes: 2000000000,
          selected: 0,
        },
        { id: 2, path: "/Movie.2023.720p.mkv", bytes: 1000000000, selected: 0 },
      ];

      const count = countEpisodeMatches(files);

      assert.strictEqual(count, 0);
    });

    it("is case-insensitive", () => {
      const files: TorrentFile[] = [
        { id: 1, path: "/show.s01e01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/SHOW.S02E01.MKV", bytes: 1000000000, selected: 0 },
      ];

      const count = countEpisodeMatches(files);

      assert.strictEqual(count, 2);
    });
  });

  describe("findMatchingSubtitle", () => {
    it("finds subtitle with matching base filename", () => {
      const videoFile: TorrentFile = {
        id: 1,
        path: "/Show.S01E01.mkv",
        bytes: 1000000000,
        selected: 0,
      };

      const subtitleFiles: TorrentFile[] = [
        { id: 2, path: "/Show.S01E01.srt", bytes: 100000, selected: 0 },
        { id: 3, path: "/Show.S01E02.srt", bytes: 100000, selected: 0 },
      ];

      const match = findMatchingSubtitle(videoFile, subtitleFiles);

      assert.ok(match);
      assert.strictEqual(match!.path, "/Show.S01E01.srt");
    });

    it("returns null when no match found", () => {
      const videoFile: TorrentFile = {
        id: 1,
        path: "/Movie.2023.mkv",
        bytes: 2000000000,
        selected: 0,
      };

      const subtitleFiles: TorrentFile[] = [
        { id: 2, path: "/Other.Show.srt", bytes: 100000, selected: 0 },
      ];

      const match = findMatchingSubtitle(videoFile, subtitleFiles);

      assert.strictEqual(match, null);
    });

    it("is case-insensitive", () => {
      const videoFile: TorrentFile = {
        id: 1,
        path: "/show.s01e01.mkv",
        bytes: 1000000000,
        selected: 0,
      };

      const subtitleFiles: TorrentFile[] = [
        { id: 2, path: "/SHOW.S01E01.srt", bytes: 100000, selected: 0 },
      ];

      const match = findMatchingSubtitle(videoFile, subtitleFiles);

      assert.ok(match);
      assert.strictEqual(match!.path, "/SHOW.S01E01.srt");
    });
  });

  describe("groupSubtitlesWithVideos", () => {
    it("groups matching subtitles with videos", () => {
      const videoFiles: TorrentFile[] = [
        { id: 1, path: "/Show.S01E01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/Show.S01E02.mkv", bytes: 1000000000, selected: 0 },
      ];

      const subtitleFiles: TorrentFile[] = [
        { id: 3, path: "/Show.S01E01.srt", bytes: 100000, selected: 0 },
        { id: 4, path: "/Show.S01E02.srt", bytes: 100000, selected: 0 },
        { id: 5, path: "/Show.S01E02.en.srt", bytes: 100000, selected: 0 },
      ];

      const result = groupSubtitlesWithVideos(videoFiles, subtitleFiles);

      assert.strictEqual(result.size, 2);
      assert.deepStrictEqual(result.get(1), [3]);
      assert.deepStrictEqual(result.get(2), [4, 5]);
    });

    it("returns empty map when no subtitles", () => {
      const videoFiles: TorrentFile[] = [
        { id: 1, path: "/Show.S01E01.mkv", bytes: 1000000000, selected: 0 },
      ];

      const subtitleFiles: TorrentFile[] = [];

      const result = groupSubtitlesWithVideos(videoFiles, subtitleFiles);

      assert.strictEqual(result.size, 1);
      assert.deepStrictEqual(result.get(1), []);
    });
  });

  describe("getFilesWithSubtitleInfo", () => {
    it("adds subtitle file IDs to video files", () => {
      const videoFiles: TorrentFile[] = [
        { id: 1, path: "/Show.S01E01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/Show.S01E02.mkv", bytes: 1000000000, selected: 0 },
      ];

      const subtitleFiles: TorrentFile[] = [
        { id: 3, path: "/Show.S01E01.srt", bytes: 100000, selected: 0 },
        { id: 4, path: "/Show.S01E02.srt", bytes: 100000, selected: 0 },
      ];

      const result = getFilesWithSubtitleInfo(videoFiles, subtitleFiles);

      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, 1);
      assert.deepStrictEqual(result[0].subtitleFileIds, [3]);
      assert.strictEqual(result[1].id, 2);
      assert.deepStrictEqual(result[1].subtitleFileIds, [4]);
    });
  });

  describe("detectMediaType", () => {
    it("detects TV show when 3+ files match episode patterns", () => {
      const files: TorrentFile[] = [
        { id: 1, path: "/Show.S01E01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/Show.S01E02.mkv", bytes: 1000000000, selected: 0 },
        { id: 3, path: "/Show.S01E03.mkv", bytes: 1000000000, selected: 0 },
        { id: 4, path: "/readme.txt", bytes: 1024, selected: 0 },
      ];

      const result = detectMediaType(files);

      assert.strictEqual(result.mediaType, "tv");
      assert.strictEqual(result.videoFiles.length, 3);
    });

    it("detects movie when 0 files match episode patterns", () => {
      const files: TorrentFile[] = [
        {
          id: 1,
          path: "/Movie.2023.1080p.mkv",
          bytes: 2000000000,
          selected: 0,
        },
        { id: 2, path: "/Movie.2023.720p.mkv", bytes: 1000000000, selected: 0 },
        { id: 3, path: "/readme.txt", bytes: 1024, selected: 0 },
      ];

      const result = detectMediaType(files);

      assert.strictEqual(result.mediaType, "movie");
      assert.strictEqual(result.videoFiles.length, 2);
    });

    it("detects ambiguous when 1-2 files match episode patterns", () => {
      const files: TorrentFile[] = [
        { id: 1, path: "/Show.S01E01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/Show.S01E02.mkv", bytes: 1000000000, selected: 0 },
      ];

      const result = detectMediaType(files);

      assert.strictEqual(result.mediaType, "ambiguous");
    });

    it("filters out junk files from video files", () => {
      const files: TorrentFile[] = [
        { id: 1, path: "/Show.S01E01.mkv", bytes: 1000000000, selected: 0 },
        { id: 2, path: "/small-video.mkv", bytes: 30000000, selected: 0 },
        { id: 3, path: "/readme.txt", bytes: 1024, selected: 0 },
        { id: 4, path: "/Show.S01E01.srt", bytes: 100000, selected: 0 },
      ];

      const result = detectMediaType(files);

      assert.strictEqual(result.videoFiles.length, 1);
      assert.strictEqual(result.junkFiles.length, 2);
      assert.strictEqual(result.subtitleFiles.length, 1);
    });
  });
});
