"use client";

import Image from "next/image";
import { ChevronDown, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartConsultation: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Hero section — first screen the user sees.
 * Eason wordmark logo, main title, subtitle, supporting copy, CTA button.
 * Subtle staggered entrance animations.
 */
export default function HeroSection({ onStartConsultation }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-20">
      {/* Eason Wordmark — top left brand logo */}
      <motion.div
        className="absolute top-4 sm:top-8 left-4 sm:left-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image
          src="/assets/eason_wordmark_transparent.png"
          alt="Eason Chan"
          width={140}
          height={104}
          className="w-20 sm:w-28 lg:w-[140px] opacity-90 hover:opacity-100 transition-opacity"
          priority
        />
      </motion.div>

      {/* Main content — staggered entrance */}
      <motion.div
        className="flex flex-col items-center text-center max-w-2xl mx-auto"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: { staggerChildren: 0.15, delayChildren: 0.2 },
          },
        }}
      >
        {/* Clinic badge */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-clinic-gold/30 bg-clinic-gold/5 text-clinic-gold text-sm mb-8"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-clinic-red"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          深夜门诊 · 陈医生值班中
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide text-clinic-cream mb-3 sm:mb-4 px-2"
        >
          陈医生音乐门诊
        </motion.h1>

        {/* Subtitle — the single tagline */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-lg sm:text-2xl md:text-3xl text-clinic-gold/90 italic mb-4 sm:mb-6 font-medium px-2 tracking-wide leading-relaxed"
        >
          感谢永远有歌把心境道破。
        </motion.p>

        {/* Supporting description */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-md leading-relaxed mb-8 sm:mb-10 px-2"
        >
          这里不是医院，也不提供医学诊断。
          <br />
          这里只是一个深夜音乐门诊，用 Eason
          的歌，给今天的心情开一张处方。
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <Button
            onClick={onStartConsultation}
            size="lg"
            className="group relative px-8 py-6 text-lg rounded-full bg-clinic-gold hover:bg-clinic-gold/90 text-clinic-dark font-semibold shadow-lg shadow-clinic-gold/20 transition-all hover:scale-105"
          >
            <Stethoscope className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            请陈医生开方
          </Button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-16 flex flex-col items-center gap-2 text-zinc-500 text-sm"
        >
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            向下滚动，开始挂号
          </motion.span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right side — stage atmosphere image (desktop only) */}
      <div className="hidden lg:block absolute right-0 bottom-0 w-[400px] h-[500px] opacity-30 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/assets/eason_stage.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6) blur(2px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-clinic-dark via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-clinic-dark" />
      </div>
    </section>
  );
}
