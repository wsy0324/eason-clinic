"use client";

import { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import BalloonStage from "@/components/BalloonStage";
import HeroSection from "@/components/HeroSection";
import SymptomInput from "@/components/SymptomInput";
import PrescriptionCard from "@/components/PrescriptionCard";
import ClinicFooter from "@/components/ClinicFooter";
import { fetchPrescription } from "@/lib/api";
import { getRecentSongIds, addRecentSongId } from "@/lib/utils";
import type { PrescriptionResponse } from "@/lib/types";

export default function Home() {
  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const lastSubmittedTextRef = useRef<string>("");
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const scrollToInput = useCallback(() => {
    if (window.innerWidth < 1024) {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const submitPrescription = useCallback(async (text: string) => {
    const recentSongIds = getRecentSongIds();
    const result = await fetchPrescription({
      text,
      recent_song_ids: recentSongIds,
    });

    setPrescription(result);
    addRecentSongId(result.song.id);
    lastSubmittedTextRef.current = text;

    toast.success("处方已生成", {
      description: `陈医生为你开了《${result.song.title}》`,
    });

    // Scroll to prescription on mobile
    setTimeout(() => {
      if (window.innerWidth < 1024) {
        prescriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);
  }, []);

  const handleSubmit = useCallback(
    async (text: string) => {
      setIsLoading(true);
      try {
        await submitPrescription(text);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "陈医生暂时无法接诊，请稍后再试";
        toast.error("开方失败", { description: message });
      } finally {
        setIsLoading(false);
      }
    },
    [submitPrescription]
  );

  const handleRetry = useCallback(async () => {
    const text = lastSubmittedTextRef.current;
    if (!text) return;

    setIsRetrying(true);
    try {
      await submitPrescription(text);
      toast.success("新处方已生成", {
        description: "陈医生给你换了一首更适合现在的歌。",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "陈医生暂时无法接诊，请稍后再试";
      toast.error("复诊失败", { description: message });
    } finally {
      setIsRetrying(false);
    }
  }, [submitPrescription]);

  return (
    <BalloonStage>
      {/* ============ Unified layout: single render tree, responsive CSS ============ */}

      {/* Mobile-only Hero (hidden on desktop) */}
      <div className="lg:hidden">
        <HeroSection onStartConsultation={scrollToInput} />
      </div>

      {/* Main content area — stacks on mobile, side-by-side on desktop */}
      <div className="lg:flex lg:min-h-screen">
        {/* Left Column: clinic content */}
        <div className="lg:w-1/2 xl:w-5/12 lg:flex lg:flex-col lg:justify-center lg:px-8 xl:px-16 lg:py-12 lg:bg-black/40 lg:backdrop-blur-sm">
          {/* Desktop-only wordmark + title (mobile Hero handles this) */}
          <div className="hidden lg:block mb-6">
            <img
              src="/assets/eason_wordmark_transparent.png"
              alt="Eason Chan"
              className="w-28 xl:w-36 opacity-95"
            />
            <h1 className="text-4xl xl:text-5xl font-bold tracking-wide text-clinic-cream mt-4 mb-3">
              陈医生音乐门诊
            </h1>
            <p className="text-lg xl:text-2xl text-clinic-gold/90 italic mb-4 font-medium tracking-wide leading-relaxed">
              感谢永远有歌把心境道破。
            </p>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-8">
              这里不是医院，也不提供医学诊断。
              这里只是一个深夜音乐门诊，用 Eason 的歌，给今天的心情开一张处方。
            </p>
          </div>

          {/* Shared SymptomInput — one instance for all breakpoints */}
          <div className="lg:max-w-md" ref={inputRef}>
            <SymptomInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Desktop-only footer in left column */}
          <div className="hidden lg:block mt-8 text-xs text-zinc-600 max-w-md">
            <p>
              本门诊不治病，只负责陪你把今晚过完。
              <br />
              Fan-made project, not affiliated with Eason Chan or official teams.
            </p>
            <p className="text-sm text-clinic-gold/60 italic mt-2 tracking-wide">
              感谢永远有歌把心境道破。
            </p>
          </div>
        </div>

        {/* Right Column: atmosphere + prescription (desktop) or stacked (mobile) */}
        <div className="lg:w-1/2 xl:w-7/12 lg:relative lg:flex lg:items-center lg:justify-center lg:p-8 xl:p-16">
          {/* Desktop stage atmosphere bg */}
          <div
            className="hidden lg:block absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/assets/eason_stage.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.7) blur(1px)",
            }}
          />
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

          {/* Prescription card or empty state */}
          <div className="relative z-10 w-full lg:max-w-lg" ref={prescriptionRef}>
            <AnimatePresence mode="wait">
              {prescription ? (
                <PrescriptionCard
                  key={prescription.rx_id}
                  prescription={prescription}
                  onRetry={handleRetry}
                  isLoading={isRetrying}
                />
              ) : (
              /* Desktop empty state */
              <div className="hidden lg:block text-center text-zinc-500 py-20">
                <div className="text-6xl mb-4">🩺</div>
                <p className="text-lg text-clinic-gold/60 italic">
                  请在左侧描述你的症状
                </p>
                <p className="text-sm mt-2 text-zinc-600">
                  陈医生准备好为你听诊
                </p>
              </div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile footer (hidden on desktop) */}
      <div className="lg:hidden">
        <ClinicFooter />
      </div>
    </BalloonStage>
  );
}
