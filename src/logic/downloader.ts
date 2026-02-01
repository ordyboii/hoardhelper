import os from "os";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";

export function getTempDir(): string {
  return path.join(os.tmpdir(), "hoardhelper");
}

export function sanitizeFilename(filename: string): string {
  const clean = filename
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/^\.+/, "_");

  const tempDir = getTempDir();
  let finalName = clean;
  let counter = 1;

  while (fsSync.existsSync(path.join(tempDir, finalName))) {
    const ext = path.extname(clean);
    const baseName = path.basename(clean, ext);
    finalName = `${baseName}_${counter}${ext}`;
    counter++;
  }

  return finalName;
}

export async function downloadFileFromUrl(
  url: string,
  localPath: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const contentLength = response.headers.get("content-length");
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
  let downloadedBytes = 0;

  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    downloadedBytes += value.length;

    if (totalBytes > 0) {
      onProgress((downloadedBytes / totalBytes) * 100);
    }
  }

  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, Buffer.concat(chunks));
}

export async function downloadFilesInParallel(
  items: Array<{ url: string; localPath: string; bytes: number }>,
  concurrency: number = 3,
  onOverallProgress: (percent: number) => void,
): Promise<Array<{ success: boolean; error?: string }>> {
  const results = new Array(items.length).fill({ success: false });
  const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0);
  const downloadedBytes = new Array(items.length).fill(0);

  const processItem = async (index: number): Promise<void> => {
    try {
      await downloadFileFromUrl(
        items[index].url,
        items[index].localPath,
        (percent) => {
          downloadedBytes[index] = (percent / 100) * items[index].bytes;
          const totalDownloaded = downloadedBytes.reduce((a, b) => a + b, 0);
          onOverallProgress((totalDownloaded / totalBytes) * 100);
        },
      );
      results[index] = { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      results[index] = { success: false, error: message };
    }
  };

  const queue: Promise<void>[] = [];
  let currentIndex = 0;

  while (currentIndex < items.length || queue.length > 0) {
    while (queue.length < concurrency && currentIndex < items.length) {
      const index = currentIndex;
      const promise = processItem(index);
      queue.push(promise);
      promise.then(() => {
        const queueIndex = queue.indexOf(promise);
        if (queueIndex !== -1) {
          queue.splice(queueIndex, 1);
        }
      });
      currentIndex++;
    }

    if (queue.length > 0) {
      await Promise.race(queue);
    }
  }

  return results;
}

export async function cleanupTempFiles(): Promise<void> {
  const tempDir = getTempDir();
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
  await fs.mkdir(tempDir, { recursive: true });
}
