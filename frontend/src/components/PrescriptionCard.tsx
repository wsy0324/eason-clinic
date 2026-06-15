"use client";

import { RefreshCw, Loader2, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { PrescriptionResponse } from "@/lib/types";

interface PrescriptionCardProps {
  prescription: PrescriptionResponse;
  onRetry: () => void;
  isLoading?: boolean;
}

/**
 * Vintage-style prescription card — expanded edition.
 * 14 content sections in a warm paper aesthetic.
 */
export default function PrescriptionCard({
  prescription,
  onRetry,
  isLoading = false,
}: PrescriptionCardProps) {
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

  const SectionTitle = ({ children }: { children: string }) => (
    <h3 className="text-[11px] text-clinic-muted uppercase tracking-[0.15em] mb-2 font-medium">
      {children}
    </h3>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-4 sm:px-6 py-8 sm:py-16"
    >
      <div className="max-w-xl mx-auto">
        {/* Prescription Card */}
        <div className="prescription-paper rounded-lg shadow-2xl shadow-black/40 overflow-hidden">
          {/* Perforated top edge */}
          <div className="h-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,#d4c5a9_6px,#d4c5a9_7px)]" />

          <div className="p-5 sm:p-8">
            {/* ===== 1. Header — title + clinic stamp ===== */}
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-clinic-ink tracking-wide">
                  陈医生音乐处方
                </h2>
                <p className="text-[10px] sm:text-xs text-clinic-muted tracking-[0.2em] uppercase mt-1">
                  Eason Music Clinic
                </p>
              </div>
              {/* Clinic stamp */}
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-clinic-red/40 flex items-center justify-center rotate-12 bg-clinic-red/5">
                <div className="text-center -rotate-12">
                  <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-clinic-red/60 mx-auto mb-0.5" />
                  <span className="text-[8px] sm:text-[9px] text-clinic-red/70 font-medium tracking-wider">
                    值班中
                  </span>
                </div>
              </div>
            </div>

            {/* ===== 2. RX Number ===== */}
            <div className="flex items-center gap-3 mb-5 text-[11px] sm:text-xs text-clinic-muted">
              <span className="font-mono tracking-wider">{rx_id}</span>
              <span className="w-1 h-1 rounded-full bg-clinic-muted/50" />
              <span>机密 · 仅供患者本人查阅</span>
            </div>

            {/* Divider */}
            <hr className="dot-divider mb-5" />

            {/* ===== 3. Clinic department ===== */}
            <div className="mb-4">
              <SectionTitle>就诊科室</SectionTitle>
              <p className="text-sm text-clinic-ink/80">{clinic}</p>
            </div>

            {/* ===== 4. Symptom tags ===== */}
            <div className="mb-4">
              <SectionTitle>今日症状</SectionTitle>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {symptom_summary.map((symptom) => (
                  <span
                    key={symptom}
                    className="inline-block px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm border border-clinic-muted/30 text-clinic-ink bg-clinic-cream/50"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* ===== 5. Emotion analysis (auscultation) ===== */}
            <div className="mb-4 p-3 sm:p-4 rounded-lg bg-clinic-blue/5 border border-clinic-blue/10">
              <SectionTitle>📋 情绪听诊</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">
                {emotion_analysis}
              </p>
            </div>

            {/* ===== 6. Song prescription ===== */}
            <div className="mb-4">
              <SectionTitle>🎵 处方歌曲</SectionTitle>
              <p
                className="text-2xl sm:text-4xl font-bold tracking-wider"
                style={{ color: song.theme_color }}
              >
                《{song.title}》
              </p>
            </div>

            {/* ===== 7. Song reason ===== */}
            <div className="mb-4">
              <SectionTitle>💊 适用说明</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed italic">
                {song_reason}
              </p>
            </div>

            {/* ===== 8. Dosage ===== */}
            <div className="mb-4">
              <SectionTitle>🕐 服用方式</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">
                {dosage}
              </p>
            </div>

            {/* ===== 9. Listening scene ===== */}
            <div className="mb-4">
              <SectionTitle>🎬 推荐场景</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">
                {listening_scene}
              </p>
            </div>

            {/* ===== 10. Doctor advice — heart of the prescription ===== */}
            <div className="mb-4 p-3 sm:p-4 rounded-lg bg-clinic-gold/8 border border-clinic-gold/20">
              <SectionTitle>📝 医嘱</SectionTitle>
              <p className="text-sm sm:text-base text-clinic-ink leading-relaxed font-medium">
                {doctor_advice}
              </p>
            </div>

            {/* ===== 11. Daily task ===== */}
            <div className="mb-4">
              <SectionTitle>✅ 今日小任务</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">
                {daily_task}
              </p>
            </div>

            {/* ===== 12. Avoid ===== */}
            <div className="mb-4">
              <SectionTitle>⚠️ 服用禁忌</SectionTitle>
              <p className="text-sm text-clinic-ink/80 leading-relaxed">
                {avoid}
              </p>
            </div>

            {/* ===== 13. Follow-up ===== */}
            <div className="mb-5">
              <SectionTitle>🔄 复诊建议</SectionTitle>
              <p className="text-sm text-clinic-ink/70 leading-relaxed">
                {follow_up}
              </p>
            </div>

            {/* Divider */}
            <hr className="dot-divider mb-4" />

            {/* ===== 14. Small note ===== */}
            <p className="text-[10px] text-clinic-muted/60 leading-relaxed mb-5">
              {small_note}
            </p>

            {/* Retry button */}
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
