"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";

interface SavePrescriptionButtonProps {
  /** Ref to the content area to export (must not include buttons) */
  exportRef: React.RefObject<HTMLDivElement | null>;
  rxId: string;
}

/**
 * Exports the prescription card as PNG.
 * First waits for all images inside to finish loading, then captures.
 */
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

    try {
      // 1. Wait for all images inside to be fully loaded
      const images = node.querySelectorAll("img");
      const loadPromises = Array.from(images).map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // tolerate broken images
          // Timeout after 3s
          setTimeout(() => resolve(), 3000);
        });
      });
      await Promise.all(loadPromises);

      // Small extra delay for rendering
      await new Promise((r) => setTimeout(r, 200));

      const dataUrl = await toPng(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#fef9e7",
        cacheBust: false,
      });

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
