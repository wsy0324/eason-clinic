/**
 * exportImage — reliable HTML-to-PNG export using a cloned off-screen node.
 *
 * Strategy:
 * 1. Clone the source node (never mutate the real DOM).
 * 2. Place the clone off-screen so it renders fully.
 * 3. Convert every <img> to an inline data URL so html2canvas can paint it.
 * 4. Wait for all data URL images to decode.
 * 5. html2canvas the clone.
 * 6. Remove the clone.
 * 7. Return the canvas.
 */

import html2canvas from "html2canvas";

/* ------------------------------------------------------------------ */
/*  Image helpers                                                      */
/* ------------------------------------------------------------------ */

async function fetchAsDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Fetch ${src} → ${res.status}`);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function waitForImg(img: HTMLImageElement, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) return resolve();
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    setTimeout(done, timeoutMs);
  });
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export interface ExportOptions {
  /** html2canvas background color */
  backgroundColor?: string;
  /** device-pixel-ratio scale (default: Math.min(3, dpr || 2)) */
  scale?: number;
  /** extra delay in ms before capturing (default: 100) */
  settleMs?: number;
}

export async function exportNodeToCanvas(
  sourceNode: HTMLElement,
  options: ExportOptions = {},
): Promise<HTMLCanvasElement> {
  const {
    backgroundColor = "#fef9e7",
    scale = Math.min(3, window.devicePixelRatio || 2),
    settleMs = 100,
  } = options;

  // 1. Deep-clone the node
  const clone = sourceNode.cloneNode(true) as HTMLElement;

  // 2. Place clone off-screen
  Object.assign(clone.style, {
    position: "fixed",
    left: "-99999px",
    top: "0",
    width: `${sourceNode.offsetWidth}px`,
    zIndex: "-1",
    visibility: "visible",
    opacity: "1",
  });
  document.body.appendChild(clone);

  try {
    // 3. Convert all images in the clone to data URLs
    const imgs = Array.from(clone.querySelectorAll("img"));
    const conversions = imgs.map(async (img) => {
      const src = img.getAttribute("src") || img.currentSrc;
      if (!src) return;
      try {
        const dataUrl = await fetchAsDataUrl(src);
        img.setAttribute("src", dataUrl);
      } catch {
        // Keep original src on failure — the image might still render
      }
    });
    await Promise.all(conversions);

    // 4. Wait for all images to decode
    await Promise.all(imgs.map((img) => waitForImg(img)));

    // 5. Let the clone settle
    await new Promise((r) => setTimeout(r, settleMs));

    // 6. html2canvas the clone
    const canvas = await html2canvas(clone, {
      backgroundColor,
      scale,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 30000,
      logging: false,
      foreignObjectRendering: false,
      ignoreElements: (el) => el.classList?.contains("export-ignore"),
    });

    return canvas;
  } finally {
    // 7. Always clean up the clone
    document.body.removeChild(clone);
  }
}

/**
 * One-shot: export a node to PNG and trigger a download.
 */
export async function exportNodeToPng(
  sourceNode: HTMLElement,
  filename: string,
  options?: ExportOptions,
): Promise<void> {
  const canvas = await exportNodeToCanvas(sourceNode, options);
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
