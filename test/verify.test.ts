import { describe, it } from "node:test";
import assert from "node:assert";
import { parseFilename } from "../src/logic/parser";
import { generateNewPath } from "../src/logic/exporter";

describe("Renamer Logic", () => {
    describe("Parser Logic", () => {
        const testCases = [
            // TV Shows
            {
                input: "Game.of.Thrones.S01E01.Winter.Is.Coming.mkv",
                expectedSeries: "Game of Thrones",
                expectedS: 1,
                expectedE: 1,
                type: "tv"
            },
            {
                input: "Breaking Bad - S05E14 - Ozymandias.mp4",
                expectedSeries: "Breaking Bad",
                expectedS: 5,
                expectedE: 14,
                type: "tv"
            },
            {
                input: "[HorribleSubs] One Piece - 123 [1080p].mkv",
                expectedSeries: "One Piece",
                expectedS: 1,
                expectedE: 123,
                type: "tv"
            },
            {
                input: "My Hero Academia 3x12.mkv",
                expectedSeries: "My Hero Academia",
                expectedS: 3,
                expectedE: 12,
                type: "tv"
            },
            {
                input: "The.Mandalorian.S02E05.Chapter.13.The.Jedi.1080p.DSNP.WEBRip.DDP5.1.Atmos.x264-SCREENER.mkv",
                expectedSeries: "The Mandalorian",
                expectedS: 2,
                expectedE: 5,
                type: "tv"
            },
            // Movies
            {
                input: "Avatar.The.Way.of.Water.2022.1080p.WEB-DL.x264.AAC-Group.mkv",
                expectedSeries: "Avatar The Way of Water 2022",
                type: "movie"
            },
            {
                input: "[ReleaseGroup] The.Matrix.1999.[4K].HDR.mkv",
                expectedSeries: "The Matrix 1999",
                type: "movie"
            },
            {
                input: "Inception (2010) [1080p] [BluRay].mp4",
                expectedSeries: "Inception (2010)",
                type: "movie"
            },
            {
                input: "Avatar.2009.EXTENDED.REPACK.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
                expectedSeries: "Avatar 2009",
                type: "movie"
            },
            {
                input: "The.Mandalorian.S02E05.Chapter.13.The.Jedi.1080p.DSNP.WEBRip.DDP5.1.Atmos.x264.mkv",
                expectedSeries: "The Mandalorian",
                expectedS: 2,
                expectedE: 5,
                type: "tv"
            }
        ];

        testCases.forEach((t) => {
            it(`should parse ${t.input}`, () => {
                const result = parseFilename(t.input);
                assert.ok(result, "Result should not be null");
                assert.strictEqual(result.type, t.type, `Type should be ${t.type}`);
                assert.strictEqual(
                    result.series,
                    t.expectedSeries,
                    `Series should be ${t.expectedSeries}`
                );

                if (t.type === "tv") {
                    assert.strictEqual(
                        result.season,
                        t.expectedS,
                        `Season should be ${t.expectedS}`
                    );
                    assert.strictEqual(
                        result.episode,
                        t.expectedE,
                        `Episode should be ${t.expectedE}`
                    );
                }
            });
        });
    });

    describe("Security & Sanitization", () => {
        const maliciousCases = [
            {
                name: "Path Traversal (Internal Double Dot)",
                input: "My..Show.S01E01.mkv",
                shouldNotContain: "..",
                expectedSeries: "My Show"
            },
            {
                name: "Mixed Traversal (Windows style)",
                input: "..\\..\\Windows\\System32.mkv",
                shouldNotContain: "..",
                // Backslashes now replaced by spaces
                expectedSeries: "Windows System32"
            },
            {
                name: "Null Byte Injection",
                input: "SafeName\0.mkv",
                shouldNotContain: "\0",
                expectedSeries: "SafeName"
            },
            {
                name: "Control Characters",
                input: "ShowName\nNewline.S01E01.mkv",
                shouldNotContain: "\n",
                expectedSeries: "ShowName Newline S01E01"
            },
            {
                name: "Illegal Characters",
                input: "Show:Name*With?Illegal<Chars>.S01E01.mkv",
                // Illegal chars now replaced by spaces
                expectedSeries: "Show Name With Illegal Chars"
            }
        ];

        maliciousCases.forEach((t) => {
            it(`should sanitize: ${t.name}`, () => {
                const result = parseFilename(t.input);
                assert.ok(result);

                // Verify the series name is clean
                if (t.shouldNotContain) {
                    assert.strictEqual(
                        result.series.includes(t.shouldNotContain),
                        false,
                        `Series name contained malicious sequence: ${t.shouldNotContain}`
                    );
                }

                // Verify strict equality if expectedSeries is provided
                // Note: The sanitizer logic might collapse spaces, so we trim/simplify comparison if needed.
                // Our current logic replaces dots with spaces, then sanitizes.
                assert.strictEqual(result.series, t.expectedSeries);

                // Verify generated path is safe
                const path = generateNewPath(result);
                assert.ok(path);
                assert.strictEqual(
                    path.startsWith("/"),
                    false,
                    "Path should be relative (no leading slash)"
                );
                assert.strictEqual(
                    path.includes(".."),
                    false,
                    "Path should not contain double dots"
                );
            });
        });

        it("should generate safe relative paths", () => {
            const metadata = {
                type: "tv" as const,
                series: "Safe Show",
                season: 1,
                episode: 1,
                formattedSeason: "01",
                formattedEpisode: "01",
                ext: ".mkv",
                originalName: "foo",
                fullPath: "foo"
            };

            const path = generateNewPath(metadata);
            // Expected: Safe Show/Season 01/Safe Show - S01E01.mkv
            assert.strictEqual(path, "Safe Show/Season 01/Safe Show - S01E01.mkv");
        });
    });
});
