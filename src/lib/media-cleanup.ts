import * as cheerio from 'cheerio';

/**
 * Helper to extract media key from a URL (relative or absolute).
 * Only accepts absolute URLs if they match one of the allowed origins.
 */
const getMediaKey = (url: string, allowedOrigins: string[] = []): string | null => {
    if (!url) return null;

    // Handle relative paths starting with /media/
    if (url.startsWith('/media/')) {
        return url.replace('/media/', '') || null;
    }

    // Handle absolute URLs
    try {
        const urlObj = new URL(url);
        // Check origin against allowed list
        if (allowedOrigins.length === 0 || !allowedOrigins.includes(urlObj.origin)) {
            return null;
        }

        // Check if pathname starts with /media/
        if (urlObj.pathname.startsWith('/media/')) {
            return urlObj.pathname.replace('/media/', '') || null;
        }
    } catch (e) {
        // Not a valid URL, ignore
    }

    return null;
};

/**
 * Extracts R2 object keys from img tags in HTML content.
 * Assumes images are served from /media/{key}
 */
export const extractImageKeysFromHtml = (html: string, allowedOrigins: string[] = []): string[] => {
  if (!html) return [];
  const $ = cheerio.load(html);
  const keys: string[] = [];
  $('img').each((_, element) => {
    const src = $(element).attr('src');
    if (src) {
        const key = getMediaKey(src, allowedOrigins);
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
    extraUrls: (string | null | undefined)[] = [],
    allowedOrigins: string[] = []
): Promise<void> => {
    const keys = new Set<string>();

    // 1. Extract from HTML content
    for (const content of contents) {
        if (content) {
            const extracted = extractImageKeysFromHtml(content, allowedOrigins);
            for (const k of extracted) {
                keys.add(k);
            }
        }
    }

    // 2. Extract from direct URLs (e.g. thumbnails)
    for (const url of extraUrls) {
        if (url) {
            const key = getMediaKey(url, allowedOrigins);
            if (key) keys.add(key);
        }
    }

    if (keys.size > 0) {
        console.log(`[MediaCleanup] Deleting ${keys.size} images:`, Array.from(keys));
        await deleteMediaFiles(bucket, Array.from(keys));
    }
};
