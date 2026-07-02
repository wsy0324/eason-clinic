/**
 * Image preloading utilities for prescription export.
 * Fetches assets → blob → base64 dataURL so html-to-image can render them reliably.
 */

const DEFAULT_COVER = "/assets/default_cover.svg";
const DEFAULT_ICON = "/assets/eason_icon/1-香港-1.png";

/** Fetch any image URL and return a base64 data URL. Never throws — returns fallback. */
export async function assetToDataUrl(src: string, fallback?: string): Promise<string> {
  if (!src) return fallback || DEFAULT_COVER;
  if (src.startsWith("data:")) return src;

  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(fallback || src);
      reader.readAsDataURL(blob);
    });
  } catch {
    // Try fallback
    if (fallback && fallback !== src) {
      return assetToDataUrl(fallback, undefined);
    }
    return src;
  }
}

/** Preload an image so it's cached and decodes fast. */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export interface PreparedAssets {
  coverDataUrl: string;
  iconDataUrl: string;
}

/**
 * Convert prescription.song.cover and .icon to data URLs.
 * Always resolves — failed images fall back to defaults.
 */
export async function preparePrescriptionExportAssets(
  coverUrl: string,
  iconUrl: string,
): Promise<PreparedAssets> {
  const [coverDataUrl, iconDataUrl] = await Promise.all([
    assetToDataUrl(coverUrl, DEFAULT_COVER),
    assetToDataUrl(iconUrl, DEFAULT_ICON),
  ]);

  // Preload into browser cache
  await Promise.all([
    preloadImage(coverDataUrl),
    preloadImage(iconDataUrl),
  ]);

  return { coverDataUrl, iconDataUrl };
}

/** Convert a data URL to a Blob for Web Share API. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
