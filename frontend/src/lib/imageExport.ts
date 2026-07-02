/**
 * Image preloading + clone utilities for exporting a DOM node to PNG.
 *
 * Strategy:
 * 1. Clone the real DOM node (never mutate the page).
 * 2. Place clone off-screen.
 * 3. For every <img> in the clone: fetch → blob → base64 data URL → replace src.
 * 4. Wait for all data URL images to fully decode.
 * 5. Return the prepared clone + its dimensions.
 */

const FALLBACK_COVER = "/assets/default_cover.svg";

/** Fetch an image and return a base64 data URL. Null if failed. */
async function imageToDataUrl(src: string): Promise<string | null> {
  if (src.startsWith("data:")) return src;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Resolve a potentially-relative image src to an absolute URL. */
function toAbsoluteUrl(src: string): string {
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  try {
    return new URL(src, window.location.origin).toString();
  } catch {
    return src;
  }
}

/** Wait for a single image element to fully decode. */
function waitForImg(img: HTMLImageElement, timeout = 10000): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) return resolve();
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    setTimeout(done, timeout);
  });
}

/**
 * Clone a node, inline all its images as data URLs, and wait for them to decode.
 * Places the clone off-screen temporarily for rendering.
 * Returns { clone, width, height }.
 */
export async function prepareCloneForExport(
  sourceNode: HTMLElement,
): Promise<{ clone: HTMLElement; width: number; height: number }> {
  // 1. Get real dimensions from the visible node
  const rect = sourceNode.getBoundingClientRect();
  const width = sourceNode.scrollWidth || rect.width || 600;
  const height = sourceNode.scrollHeight || rect.height || 800;

  // 2. Deep clone
  const clone = sourceNode.cloneNode(true) as HTMLElement;

  // 3. Place clone off-screen at the same width for proper layout
  Object.assign(clone.style, {
    position: "fixed",
    left: "-99999px",
    top: "0",
    width: `${width}px`,
    zIndex: "-1",
    visibility: "visible",
    opacity: "1",
  });
  document.body.appendChild(clone);

  // 4. Remove export-ignore elements from the clone
  clone.querySelectorAll(".export-ignore").forEach((el) => el.remove());

  // 5. Convert every <img> to inline data URL
  const imgs = Array.from(clone.querySelectorAll("img"));
  const conversions = imgs.map(async (img) => {
    const src = img.getAttribute("src") || img.currentSrc;
    if (!src) return;

    const absSrc = toAbsoluteUrl(src);
    const dataUrl = await imageToDataUrl(absSrc);

    if (dataUrl) {
      img.setAttribute("src", dataUrl);
    } else {
      // Fallback: try default cover for cover images
      console.warn(`[export] Failed to convert image: ${absSrc}`);
      if (absSrc.includes("cd_cover") || absSrc.includes("default_cover")) {
        const fallback = await imageToDataUrl(toAbsoluteUrl(FALLBACK_COVER));
        if (fallback) img.setAttribute("src", fallback);
      }
    }
  });
  await Promise.all(conversions);

  // 6. Wait for all images to decode
  await Promise.all(imgs.map((img) => waitForImg(img)));

  // 7. Brief settle
  await new Promise((r) => setTimeout(r, 150));

  return { clone, width, height };
}

/** Clean up the clone from the DOM. */
export function removeClone(clone: HTMLElement): void {
  if (clone.parentNode) {
    clone.parentNode.removeChild(clone);
  }
}

/** Convert a data URL to a Blob (for Web Share API). */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
