"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { prepareCloneForExport, removeClone, dataUrlToBlob } from "@/lib/imageExport";

interface SavePrescriptionButtonProps {
  exportRef: React.RefObject<HTMLDivElement | null>;
  rxId: string;
}

export default function SavePrescriptionButton({
  exportRef,
  rxId,
}: SavePrescriptionButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSave = useCallback(async () => {
    const sourceNode = exportRef.current;
    if (!sourceNode) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    let clone: HTMLElement | null = null;

    try {
      // Let the DOM settle
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));

      // 1. Clone + inline images + get real dimensions
      const prepared = await prepareCloneForExport(sourceNode);
      clone = prepared.clone;

      // 2. Export with html-to-image using REAL dimensions
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fef9e7",
        width: prepared.width,
        height: prepared.height,
      });

      // 3. Save / Share
      const filename = `eason-clinic-${rxId}.png`;
      const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

      if (isMobile && navigator.share && navigator.canShare) {
        const blob = await dataUrlToBlob(dataUrl);
        const file = new File([blob], filename, { type: "image/png" });
        const shareData = { files: [file], title: "陈医生音乐处方" };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            setStatus("done");
            setTimeout(() => setStatus("idle"), 2500);
            return;
          } catch {
            // Share cancelled — fall through
          }
        }
      }

      if (!isMobile) {
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      } else {
        window.open(dataUrl, "_blank");
      }

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("Export failed:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      if (clone) removeClone(clone);
    }
  }, [exportRef, rxId]);

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
