"use client";

import { useState, useCallback } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { exportNodeToPng } from "@/lib/exportImage";
import { Button } from "@/components/ui/button";

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
    const node = exportRef.current;
    if (!node) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      // Let the DOM settle (button re-render shouldn't affect exportRef)
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));

      await exportNodeToPng(node, `eason-clinic-${rxId}.png`);

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
