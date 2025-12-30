/**
 * Generate a stable hash from a string (for Result IDs)
 * Simple djb2 hash algorithm
 */
export function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16);
}

/**
 * Generate a stable ID from a normalized URL
 */
export function hashUrl(url: string): string {
  return hashString(url);
}

