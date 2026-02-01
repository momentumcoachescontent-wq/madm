import * as cheerio from 'cheerio';

/**
 * Extracts R2 object keys from img tags in HTML content.
 * Assumes images are served from /media/{key}
 */
export const extractImageKeysFromHtml = (html: string): string[] => {
  if (!html) return [];
  const $ = cheerio.load(html);
  const keys: string[] = [];
  $('img').each((_, element) => {
    const src = $(element).attr('src');
    if (src && src.startsWith('/media/')) {
        const key = src.replace('/media/', '');
        if (key) keys.push(key);
    }
  });
  return keys;
};

/**
 * Deletes multiple files from the R2 bucket.
 */
export const deleteMediaFiles = async (bucket: R2Bucket, keys: string[]): Promise<void> => {
  if (keys.length === 0) return;

  try {
      // R2Bucket.delete accepts a string or an array of strings
      await bucket.delete(keys);
  } catch (e) {
      console.error('[MediaCleanup] Error deleting keys from R2:', e);
  }
};

/**
 * Helper to cleanup images from both HTML content and specific URL fields.
 */
export const cleanupContentImages = async (
    bucket: R2Bucket,
    contents: (string | null | undefined)[],
    extraUrls: (string | null | undefined)[] = []
): Promise<void> => {
    const keys = new Set<string>();

    // 1. Extract from HTML content
    for (const content of contents) {
        if (content) {
            const extracted = extractImageKeysFromHtml(content);
            extracted.forEach(k => keys.add(k));
        }
    }

    // 2. Extract from direct URLs (e.g. thumbnails)
    for (const url of extraUrls) {
        if (url && url.startsWith('/media/')) {
            const key = url.replace('/media/', '');
            if (key) keys.add(key);
        }
    }

    if (keys.size > 0) {
        console.log(`[MediaCleanup] Deleting ${keys.size} images:`, Array.from(keys));
        await deleteMediaFiles(bucket, Array.from(keys));
    }
};
