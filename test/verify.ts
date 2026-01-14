import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs-extra';
import { parseFilename } from '../src/logic/parser';
import { generateNewPath, exportFile } from '../src/logic/exporter';

describe('Renamer Logic', () => {

    describe('Parser Logic', () => {
        const testCases = [
            // TV Shows
            {
                input: 'Game.of.Thrones.S01E01.Winter.Is.Coming.mkv',
                expectedSeries: 'Game of Thrones', expectedS: 1, expectedE: 1, type: 'tv'
            },
            {
                input: 'Breaking Bad - S05E14 - Ozymandias.mp4',
                expectedSeries: 'Breaking Bad', expectedS: 5, expectedE: 14, type: 'tv'
            },
            {
                input: '[HorribleSubs] One Piece - 123 [1080p].mkv',
                expectedSeries: 'One Piece', expectedS: 1, expectedE: 123, type: 'tv'
            },
            {
                input: 'My Hero Academia 3x12.mkv',
                expectedSeries: 'My Hero Academia', expectedS: 3, expectedE: 12, type: 'tv'
            },
            {
                input: 'The.Mandalorian.S02E05.Chapter.13.The.Jedi.1080p.DSNP.WEBRip.DDP5.1.Atmos.x264-SCREENER.mkv',
                expectedSeries: 'The Mandalorian', expectedS: 2, expectedE: 5, type: 'tv'
            },
            // Movies
            {
                input: 'Avatar.The.Way.of.Water.2022.1080p.WEB-DL.x264.AAC-Group.mkv',
                expectedSeries: 'Avatar The Way of Water 2022', type: 'movie'
            },
            {
                input: '[ReleaseGroup] The.Matrix.1999.[4K].HDR.mkv',
                expectedSeries: 'The Matrix 1999', type: 'movie'
            },
            {
                input: 'Inception (2010) [1080p] [BluRay].mp4',
                expectedSeries: 'Inception (2010)', type: 'movie'
            },
            {
                input: 'Avatar.2009.EXTENDED.REPACK.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4',
                expectedSeries: 'Avatar 2009', type: 'movie'
            },
            {
                input: 'The.Mandalorian.S02E05.Chapter.13.The.Jedi.1080p.DSNP.WEBRip.DDP5.1.Atmos.x264.mkv',
                expectedSeries: 'The Mandalorian', expectedS: 2, expectedE: 5, type: 'tv'
            }
        ];

        testCases.forEach((t) => {
            it(`should parse ${t.input}`, () => {
                const result = parseFilename(t.input);
                assert.ok(result, 'Result should not be null');
                assert.strictEqual(result.type, t.type, `Type should be ${t.type}`);
                assert.strictEqual(result.series, t.expectedSeries, `Series should be ${t.expectedSeries}`);

                if (t.type === 'tv') {
                    assert.strictEqual(result.season, t.expectedS, `Season should be ${t.expectedS}`);
                    assert.strictEqual(result.episode, t.expectedE, `Episode should be ${t.expectedE}`);
                }
            });
        });
    });

    describe('File Export Logic', () => {
        const dummyDir = path.resolve('test_temp');
        const dummyFile = path.join(dummyDir, 'Test.Show.S02E05.txt');
        // The parser logic determines "Test Show" as the series name from "Test.Show..."
        const expectedSeriesDir = path.resolve('export', 'Test Show');

        before(async () => {
            await fs.ensureDir(dummyDir);
            await fs.writeFile(dummyFile, 'dummy content');
            // Clean up previous test artifacts
            if (await fs.pathExists(expectedSeriesDir)) {
                await fs.remove(expectedSeriesDir);
            }
        });

        after(async () => {
            if (await fs.pathExists(dummyDir)) {
                await fs.remove(dummyDir);
            }
            // Cleanup the export artifact as well
            if (await fs.pathExists(expectedSeriesDir)) {
                await fs.remove(expectedSeriesDir);
            }
        });

        it('should generate a valid path and export the file', async () => {
            const metadata = parseFilename(dummyFile);
            assert.ok(metadata, 'Metadata parsing failed');

            const newPath = generateNewPath(metadata);
            assert.ok(newPath, 'Path generation failed');
            
            // Perform export (local copy check)
            const result = await exportFile({
                fullPath: dummyFile,
                destinationPath: newPath
            });

            assert.strictEqual(result.success, true, `Export failed: ${result.error}`);
            
            // Verify file exists at destination
            if (newPath) {
               const exists = await fs.pathExists(newPath);
               assert.strictEqual(exists, true, 'Destination file should exist');
               
               // Cleanup output file for this test
               await fs.remove(newPath);
               // Clean up the parent directory if possible (Export/Test Show/Season 02)
               // This is tricky without knowing exact structure, but we can leave it or try to clean up the 'export' folder if it's test specific.
               // For now, leaving the export artifact is acceptable or we can clean it.
            }
        });
    });
});