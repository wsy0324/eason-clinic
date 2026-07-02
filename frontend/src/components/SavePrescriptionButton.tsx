"use client";

import { useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import PrescriptionExportCard from "./PrescriptionExportCard";
import { preparePrescriptionExportAssets, dataUrlToBlob } from "@/lib/imageExport";
import { getCoverUrl } from "@/lib/data/songs";
import type { PrescriptionResponse } from "@/lib/types";

interface SavePrescriptionButtonProps {
  prescription: PrescriptionResponse;
  rxId: string;
}

export default function SavePrescriptionButton({
  prescription,
  rxId,
}: SavePrescriptionButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSave = useCallback(async () => {
    setStatus("loading");

    // ── 1. Pre-convert images to data URLs ──
    const coverUrl = getCoverUrl(prescription.song.cover);
    const iconUrl = prescription.song.icon;

    let assets;
    try {
      assets = await preparePrescriptionExportAssets(coverUrl, iconUrl);
    } catch {
      // Fallback: use original paths
      assets = {
        coverDataUrl: coverUrl.startsWith("/") ? `${window.location.origin}${coverUrl}` : coverUrl,
        iconDataUrl: iconUrl.startsWith("/") ? `${window.location.origin}${iconUrl}` : iconUrl,
      };
    }

    // ── 2. Render hidden export card ──
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-99999px;top:0;width:1080px;z-index:-1;visibility:visible;";
    document.body.appendChild(container);

    const root = createRoot(container);

    let exportNode: HTMLDivElement | null = null;

    try {
      // Render the export card into the hidden container
      await new Promise<void>((resolve) => {
        root.render(
          <div
            ref={(el: HTMLDivElement | null) => {
              exportNode = el;
              requestAnimationFrame(() => setTimeout(resolve, 100));
            }}
          >
            <PrescriptionExportCard prescription={prescription} assets={assets} />
          </div>,
        );
      });

      if (!exportNode) throw new Error("Export node not mounted");

      // ── 3. Wait for fonts + images ──
      await document.fonts?.ready;
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 200)));

      // Wait for all images to decode
      const imgs = (exportNode as HTMLDivElement).querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              setTimeout(resolve, 3000);
            }),
        ),
      );

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 100)));

      // ── 4. Export with html-to-image ──
      const dataUrl = await toPng(exportNode as HTMLDivElement, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fff7df",
        width: 1080,
        style: { width: "1080px" },
      });

      // ── 5. Save / Share ──
      const filename = `eason-clinic-${rxId}.png`;

      // Detect mobile
      const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

      if (isMobile && navigator.share && navigator.canShare) {
        // Try Web Share API
        const blob = await dataUrlToBlob(dataUrl);
        const file = new File([blob], filename, { type: "image/png" });
        const shareData = {
          files: [file],
          title: "陈医生音乐处方",
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            setStatus("done");
            setTimeout(() => setStatus("idle"), 2500);
            return;
          } catch {
            // User cancelled or share failed — fall through to fallback
          }
        }
      }

      // Desktop or mobile fallback: try download
      if (!isMobile) {
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        // Mobile fallback: open image in new tab
        window.open(dataUrl, "_blank");
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2500);
      }
    } catch (err) {
      console.error("Export failed:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      // ── 6. Clean up hidden DOM ──
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }, [prescription, rxId]);

  if (status === "error") {
    return (
      <p className="text-[11px] text-red-500/70 text-center">
        当前浏览器不支持自动保存，请尝试截图或换用浏览器打开。
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
          处方图片已保存
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
