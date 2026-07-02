"use client";

import { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";

interface SavePrescriptionButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  rxId: string;
}

/**
 * Exports the prescription card as a PNG image.
 * Uses html-to-image for client-side rendering.
 */
export default function SavePrescriptionButton({
  targetRef,
  rxId,
}: SavePrescriptionButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSave = async () => {
    if (!targetRef.current) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const node = targetRef.current;

      const dataUrl = await toPng(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#fef9e7",
        cacheBust: true,
      });

      // Trigger download
      const link = document.createElement("a");
      link.download = `eason-clinic-${rxId}.png`;
      link.href = dataUrl;
      link.click();

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to save prescription:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (status === "error") {
    return (
      <p className="text-[11px] text-red-500/70 text-center">
        保存失败。请尝试截图保存，或长按处方卡保存。
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
