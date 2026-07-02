"use client";

import { useRef } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import SavePrescriptionButton from "./SavePrescriptionButton";
import type { PrescriptionResponse } from "@/lib/types";
import { getCoverUrl } from "@/lib/data/songs";

interface PrescriptionCardProps {
  prescription: PrescriptionResponse;
  onRetry: () => void;
  isLoading?: boolean;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-[11px] text-clinic-muted uppercase tracking-[0.15em] mb-2 font-medium">
      {children}
    </h3>
  );
}

export default function PrescriptionCard({
  prescription,
  onRetry,
  isLoading = false,
}: PrescriptionCardProps) {
  /** Ref that wraps ONLY the exportable content (no buttons) */
  const exportRef = useRef<HTMLDivElement>(null);
  const {
    rx_id,
    clinic,
    symptom_summary,
    emotion_analysis,
    song,
    song_reason,
    dosage,
    listening_scene,
    doctor_advice,
    daily_task,
    avoid,
    follow_up,
    small_note,
  } = prescription;

  const coverUrl = getCoverUrl(song.cover);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-3 sm:px-6 py-6 sm:py-12"
    >
      <div className="max-w-xl mx-auto">
        {/* ─── Prescription Card ─── */}
        <div className="prescription-paper rounded-lg shadow-2xl shadow-black/40 overflow-hidden">
          {/* Perforated top edge */}
          <div className="h-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,#d4c5a9_6px,#d4c5a9_7px)]" />

          {/* ===== EXPORTABLE CONTENT (no buttons inside) ===== */}
          <div ref={exportRef} className="p-5 sm:p-8">
            {/* ===== 1. Header ===== */}
            <div className="flex items-start justify-between mb-5 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-clinic-ink tracking-wide">
                  陈医生音乐处方
                </h2>
                <p className="text-[10px] sm:text-xs text-clinic-muted tracking-[0.2em] uppercase mt-1">
                  Eason Music Clinic
                </p>
              </div>
              {/* Eason icon stamp — use crossOrigin for html-to-image */}
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative stamp-icon">
                <img
                  src={song.icon}
                  alt=""
                  crossOrigin="anonymous"
                  decoding="async"
                  loading="eager"
                  className="w-full h-full object-contain rounded-full p-0.5 bg-clinic-cream/80"
                  style={{
                    filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.15))",
                  }}
                />
                <div
                  className="absolute -inset-1 rounded-full pointer-events-none opacity-20"
                  style={{
                    background: `radial-gradient(circle, ${song.themeColor} 0%, transparent 70%)`,
                  }}
                />
              </div>
            </div>

            {/* ===== 2. RX Number ===== */}
            <div className="flex items-center gap-3 mb-5 text-[11px] sm:text-xs text-clinic-muted">
              <span className="font-mono tracking-wider">{rx_id}</span>
              <span className="w-1 h-1 rounded-full bg-clinic-muted/50" />
              <span>机密 · 仅供患者本人查阅</span>
            </div>

            <hr className="dot-divider mb-5" />

            {/* ===== 3. Clinic + Symptoms ===== */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6 mb-4">
              <div className="mb-3 sm:mb-0 sm:w-auto flex-shrink-0">
                <SectionTitle>就诊科室</SectionTitle>
                <p className="text-sm text-clinic-ink/80">{clinic}</p>
              </div>
              <div className="flex-1">
                <SectionTitle>今日症状</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {symptom_summary.map((symptom) => (
                    <span
                      key={symptom}
                      className="inline-block px-2.5 py-1 rounded-full text-xs border border-clinic-muted/30 text-clinic-ink bg-clinic-cream/50"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== 4. Emotion analysis ===== */}
            <div className="mb-4 p-3 sm:p-4 rounded-lg bg-clinic-blue/5 border border-clinic-blue/10">
              <SectionTitle>📋 情绪听诊</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">
                {emotion_analysis}
              </p>
            </div>

            {/* ===== 5. Album cover + Song ===== */}
            <div className="mb-4 flex gap-4 items-center">
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden shadow-md border border-clinic-muted/20">
                <img
                  src={coverUrl}
                  alt={song.title}
                  crossOrigin="anonymous"
                  decoding="async"
                  loading="eager"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/default_cover.svg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <SectionTitle>🎵 处方歌曲</SectionTitle>
                <p
                  className="text-xl sm:text-3xl font-bold tracking-wider truncate"
                  style={{ color: song.themeColor }}
                >
                  《{song.displayTitle || song.title}》
                </p>
              </div>
            </div>

            {/* ===== 6. Song reason ===== */}
            <div className="mb-4">
              <SectionTitle>💊 推荐理由</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed italic">
                {song_reason}
              </p>
            </div>

            {/* ===== 7. Dosage ===== */}
            <div className="mb-4">
              <SectionTitle>🕐 服用方式</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">{dosage}</p>
            </div>

            {/* ===== 8. Listening scene ===== */}
            <div className="mb-4">
              <SectionTitle>🎬 推荐场景</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">
                {listening_scene}
              </p>
            </div>

            {/* ===== 9. Doctor advice ===== */}
            <div className="mb-4 p-3 sm:p-4 rounded-lg bg-clinic-gold/8 border border-clinic-gold/20">
              <SectionTitle>📝 医嘱</SectionTitle>
              <p className="text-sm sm:text-base text-clinic-ink leading-relaxed font-medium">
                {doctor_advice}
              </p>
            </div>

            {/* ===== 10. Daily task ===== */}
            <div className="mb-4">
              <SectionTitle>✅ 今日小任务</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">{daily_task}</p>
            </div>

            {/* ===== 11. Avoid ===== */}
            <div className="mb-4">
              <SectionTitle>⚠️ 服用禁忌</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">{avoid}</p>
            </div>

            {/* ===== 12. Follow-up ===== */}
            <div className="mb-5">
              <SectionTitle>🔄 复诊建议</SectionTitle>
              <p className="text-sm text-clinic-ink/70 leading-relaxed">{follow_up}</p>
            </div>

            {/* Divider */}
            <hr className="dot-divider mb-4" />

            {/* ===== 13. Small note ===== */}
            <p className="text-[10px] text-clinic-muted/60 leading-relaxed mb-4">
              {small_note}
            </p>

            {/* ===== 14. Closing line ===== */}
            <p className="text-center text-sm sm:text-base text-clinic-gold/70 italic tracking-wide mb-2 font-medium leading-relaxed">
              感谢永远有歌把心境道破
            </p>
          </div>

          {/* ===== BUTTONS (outside exportRef, marked export-ignore) ===== */}
          <div className="export-ignore px-5 sm:px-8 pb-5 sm:pb-8">
            <div className="mb-3">
              <SavePrescriptionButton exportRef={exportRef} rxId={rx_id} />
            </div>
            <div className="flex justify-center">
              <Button
                onClick={onRetry}
                disabled={isLoading}
                variant="outline"
                className="border-clinic-muted/30 text-clinic-muted hover:text-clinic-ink hover:border-clinic-gold/50 transition-all min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    陈医生正在翻找歌单处方……
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    复诊，再来一首
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Perforated bottom edge */}
          <div className="h-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,#d4c5a9_6px,#d4c5a9_7px)]" />
        </div>
      </div>
    </motion.section>
  );
}
