/**
 * Helper utility for parsing and normalizing PDF URLs,
 * with special support for Google Drive documents, Google Cloud Storage,
 * and standard direct PDF links.
 */

export interface ParsedPdfSource {
  originalUrl: string;
  embedUrl: string;
  downloadUrl: string;
  isGoogleDrive: boolean;
  driveFileId?: string;
  isValid: boolean;
}

/**
 * Parses any PDF URL and transforms Google Drive links into
 * standard embed preview links (which work in iframes without X-Frame-Options blocking).
 */
export function parsePdfUrl(url: string): ParsedPdfSource {
  if (!url || typeof url !== 'string') {
    return {
      originalUrl: '',
      embedUrl: '',
      downloadUrl: '',
      isGoogleDrive: false,
      isValid: false,
    };
  }

  const trimmed = url.trim();

  // Pattern 1: https://drive.google.com/file/d/{FILE_ID}/view...
  const fileDRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const matchFileD = trimmed.match(fileDRegex);
  if (matchFileD && matchFileD[1]) {
    const fileId = matchFileD[1];
    return {
      originalUrl: trimmed,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isGoogleDrive: true,
      driveFileId: fileId,
      isValid: true,
    };
  }

  // Pattern 2: https://drive.google.com/open?id={FILE_ID}
  const openIdRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i;
  const matchOpenId = trimmed.match(openIdRegex);
  if (matchOpenId && matchOpenId[1]) {
    const fileId = matchOpenId[1];
    return {
      originalUrl: trimmed,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isGoogleDrive: true,
      driveFileId: fileId,
      isValid: true,
    };
  }

  // Pattern 3: https://drive.google.com/uc?id={FILE_ID} or export=download
  const ucIdRegex = /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/i;
  const matchUcId = trimmed.match(ucIdRegex);
  if (matchUcId && matchUcId[1]) {
    const fileId = matchUcId[1];
    return {
      originalUrl: trimmed,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isGoogleDrive: true,
      driveFileId: fileId,
      isValid: true,
    };
  }

  // Standard web URL (e.g. Firebase / Google Cloud Storage, direct .pdf link)
  const isValidUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');

  return {
    originalUrl: trimmed,
    embedUrl: trimmed,
    downloadUrl: trimmed,
    isGoogleDrive: false,
    isValid: isValidUrl,
  };
}
