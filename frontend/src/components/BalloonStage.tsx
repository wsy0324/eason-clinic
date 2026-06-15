"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

interface BalloonStageProps {
  children: ReactNode;
}

/**
 * Full-viewport stage background with dark overlays, spotlight glow,
 * and subtle floating balloon accents — "late night concert stage" atmosphere.
 */
export default function BalloonStage({ children }: BalloonStageProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/balloons_stage.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Dark overlay — stronger on mobile for text readability */}
      <div className="fixed inset-0 z-[1] bg-black/75 lg:bg-black/70" />
      <div className="fixed inset-0 z-[2] bg-gradient-to-b from-black/50 via-transparent to-black/85 lg:from-black/40 lg:to-black/80" />

      {/* Stage spotlight — breathing glow */}
      <motion.div
        className="fixed inset-0 z-[3] stage-glow pointer-events-none"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Red balloon glow — subtle float */}
      <motion.div
        className="fixed top-[12%] left-[8%] w-64 h-64 z-[3] rounded-full bg-clinic-red/[0.04] blur-3xl pointer-events-none"
        animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blue balloon glow — slightly offset timing */}
      <motion.div
        className="fixed top-[18%] right-[12%] w-80 h-80 z-[3] rounded-full bg-clinic-blue/[0.04] blur-3xl pointer-events-none"
        animate={{ y: [0, -10, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Floating balloon silhouette 1 — left side */}
      <motion.div
        className="fixed top-[30%] left-[5%] z-[3] w-10 h-12 pointer-events-none hidden lg:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-8 h-10 rounded-full bg-clinic-red/20 blur-sm" />
        <div className="w-0.5 h-3 bg-clinic-red/15 mx-auto mt-0.5" />
      </motion.div>

      {/* Floating balloon silhouette 2 — right side */}
      <motion.div
        className="fixed top-[40%] right-[8%] z-[3] w-10 h-12 pointer-events-none hidden lg:block"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="w-8 h-10 rounded-full bg-clinic-blue/20 blur-sm" />
        <div className="w-0.5 h-3 bg-clinic-blue/15 mx-auto mt-0.5" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
