/**
 * Utility to normalize image URLs, ensuring Google Drive links and other remote sources
 * resolve to direct high-speed streamable CDN URLs.
 */
export function getDirectImageUrl(url: string | undefined): string {
  if (!url) return '';

  // Check if it's a Google Drive link
  // e.g. https://drive.google.com/file/d/1_Vof4VuALao8BrBzNi_zPFMtUjeHGhDb/view?usp=sharing
  // or https://drive.google.com/open?id=1_Vof4VuALao8BrBzNi_zPFMtUjeHGhDb
  // or https://drive.google.com/uc?id=1_Vof4VuALao8BrBzNi_zPFMtUjeHGhDb
  const driveFileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  const driveIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1] && url.includes('drive.google.com')) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  return url;
}

export const FALLBACK_BACKUP_IMAGE = 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1000&q=80';
