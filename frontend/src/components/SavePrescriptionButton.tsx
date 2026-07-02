"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";

interface SavePrescriptionButtonProps {
  exportRef: React.RefObject<HTMLDivElement | null>;
  rxId: string;
}

/**
 * Converts an image src to a data URL by fetching it.
 */
async function imageToDataUrl(src: string): Promise<string> {
  // Already a data URL, return as-is
  if (src.startsWith("data:")) return src;

  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function SavePrescriptionButton({
  exportRef,
  rxId,
}: SavePrescriptionButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSave = useCallback(async () => {
    const node = exportRef.current;
    if (!node) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    // Store original src values to restore later
    const originalSrcs: { img: HTMLImageElement; src: string }[] = [];

    try {
      // 1. Convert all images to data URLs so html-to-image can render them
      const images = node.querySelectorAll("img");
      for (const img of Array.from(images)) {
        const src = img.getAttribute("src") || img.currentSrc;
        if (!src) continue;

        originalSrcs.push({ img, src });

        try {
          const dataUrl = await imageToDataUrl(src);
          img.setAttribute("src", dataUrl);
        } catch {
          // If fetch fails, leave the original src
        }
      }

      // 2. Small delay for browser to render the new data URL images
      await new Promise((r) => setTimeout(r, 300));

      // 3. Export
      const dataUrl = await toPng(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#fef9e7",
        cacheBust: false,
      });

      // 4. Trigger download
      const link = document.createElement("a");
      link.download = `eason-clinic-${rxId}.png`;
      link.href = dataUrl;
      link.click();

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      // 5. Restore original src values
      for (const { img, src } of originalSrcs) {
        img.setAttribute("src", src);
      }
    }
  }, [exportRef, rxId]);

  if (status === "error") {
    return (
      <p className="text-[11px] text-red-500/70 text-center">
        保存失败，请长按处方卡截图保存。
      </p>
    );
  }

  return (
    <Button
      onClick={handleSave}
      disabled={status === "loading"}
      variant="ghost"
      className="w-full min-h-[44px] text-sm text-clinic-muted hover:text-clinic-ink hover:bg-clinic-cream/80 border border-clinic-muted/20 rounded-lg transition-all"
    >
      {status === "loading" ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          正在生成处方图片……
        </>
      ) : status === "done" ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          已保存到本地
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          把处方带走
        </>
      )}
    </Button>
  );
}
