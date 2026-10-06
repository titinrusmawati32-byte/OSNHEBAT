/**
 * Extracts YouTube Video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  
  return (match && match[1]) ? match[1] : null;
}

/**
 * Validates if a string is a valid YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  if (!url) return false;
  return extractYoutubeVideoId(url) !== null;
}

/**
 * Creates a standard YouTube embed URL
 */
export function createYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
