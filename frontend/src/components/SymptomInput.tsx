"use client";

import { useState, useRef, useEffect } from "react";
import { Stethoscope, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import MoodChips from "./MoodChips";
import { cn } from "@/lib/utils";

interface SymptomInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

/**
 * Emotion registration desk — input area styled as a clinic window.
 * Contains textarea, quick mood chips, and the submit button.
 */
export default function SymptomInput({ onSubmit, isLoading }: SymptomInputProps) {
  const [text, setText] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [text]);

  const handleMoodSelect = (keyword: string) => {
    setSelectedMoods((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
    // Also append the keyword to the text if not already there
    if (!text.includes(keyword)) {
      setText((prev) => (prev ? `${prev}，${keyword}` : keyword));
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter to submit
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section id="consultation" className="px-3 sm:px-6 py-8 sm:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Clinic window card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-xl sm:rounded-2xl border border-zinc-700/50 bg-zinc-900/60 backdrop-blur-sm p-4 sm:p-6 lg:p-8"
        >
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-clinic-cream mb-1.5 sm:mb-2">
              今日科室：情绪内科
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              请描述你的症状。可以不用说得很完整，
              陈医生会从你的只言片语里找一首歌。
            </p>
          </div>

          {/* Input area */}
          <div className="relative mb-4 sm:mb-6">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="比如：我最近很累，好像一直在赶路，却不知道自己要去哪里……"
              disabled={isLoading}
              rows={3}
              className={cn(
                "w-full min-h-[72px] sm:min-h-[80px] bg-zinc-800/60 border border-zinc-600 text-zinc-200 placeholder:text-zinc-500 text-sm sm:text-base rounded-xl p-3 sm:p-4 resize-none transition-all duration-300 outline-none",
                isFocused &&
                  "border-transparent ring-2 bg-zinc-800/80",
                "focus:ring-[linear-gradient(135deg,#c0392b,#3b5998)]"
              )}
              style={
                isFocused
                  ? {
                      borderImage:
                        "linear-gradient(135deg, #c0392b, #3b5998) 1",
                    }
                  : undefined
              }
            />
            {/* Focus glow — red-blue gradient */}
            {isFocused && (
              <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-clinic-red/20 via-clinic-blue/20 to-clinic-red/20 blur-sm pointer-events-none -z-10" />
            )}
          </div>

          {/* Quick mood chips */}
          <div className="mb-4 sm:mb-6">
            <p className="text-[11px] sm:text-xs text-zinc-500 text-center mb-2 sm:mb-3">
              或选择你现在的感受：
            </p>
            <MoodChips
              onSelect={handleMoodSelect}
              selectedKeywords={selectedMoods}
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              size="lg"
              className={cn(
                "w-full sm:w-auto min-h-[48px] px-6 sm:px-10 py-3 sm:py-6 text-base sm:text-lg rounded-full font-semibold transition-all",
                "bg-clinic-gold hover:bg-clinic-gold/90 text-clinic-dark shadow-lg shadow-clinic-gold/20",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  陈医生正在听诊……
                </>
              ) : (
                <>
                  <Stethoscope className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  请陈医生开方
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hint — hidden on mobile */}
          <p className="hidden sm:block text-xs text-zinc-600 text-center mt-3">
            按 Ctrl + Enter 快速提交
          </p>
        </motion.div>
      </div>
    </section>
  );
}
