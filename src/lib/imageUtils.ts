/**
 * Utility to normalize image URLs, ensuring Google Drive links and other remote sources
 * resolve to direct high-speed streamable CDN URLs via wsrv.nl proxy.
 */
export function getDirectImageUrl(url: string | undefined): string {
  if (!url) return '';

  // Extract File ID from Google Drive URLs
  // Handles:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=...
  // - http://file/d/FILE_ID/view?usp=...
  // - /file/d/FILE_ID/view...
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://lh3.googleusercontent.com/d/FILE_ID
  const driveMatch =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://wsrv.nl/?url=https://drive.google.com/uc?id=${fileId}&export=download`;
  }

  return url;
}

export function getDriveThumbnailUrl(url: string | undefined): string {
  if (!url) return '';
  const driveMatch =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return url;
}

export const FALLBACK_BACKUP_IMAGE = 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1000&q=80';

