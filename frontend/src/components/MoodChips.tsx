"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { MoodChip } from "@/lib/types";

const MOOD_CHIPS: MoodChip[] = [
  { label: "开心", emoji: "😊", keyword: "开心" },
  { label: "轻松", emoji: "🍃", keyword: "轻松" },
  { label: "感恩", emoji: "🙏", keyword: "感恩" },
  { label: "期待", emoji: "🌟", keyword: "期待" },
  { label: "释然", emoji: "🕊️", keyword: "释然" },
  { label: "活力", emoji: "⚡", keyword: "活力" },
  { label: "失恋", emoji: "💔", keyword: "失恋" },
  { label: "焦虑", emoji: "😰", keyword: "焦虑" },
  { label: "疲惫", emoji: "😮‍💨", keyword: "疲惫" },
  { label: "孤独", emoji: "🌙", keyword: "孤独" },
  { label: "想逃离", emoji: "🏃", keyword: "想逃离" },
  { label: "不甘心", emoji: "💢", keyword: "不甘心" },
  { label: "怀念", emoji: "🍂", keyword: "怀念" },
  { label: "放不下", emoji: "💭", keyword: "放不下" },
  { label: "迷茫", emoji: "🌫️", keyword: "迷茫" },
  { label: "释怀不了", emoji: "🪢", keyword: "释怀不了" },
  { label: "没人懂我", emoji: "🎭", keyword: "没人懂我" },
  { label: "想重新开始", emoji: "🌱", keyword: "想重新开始" },
];

interface MoodChipsProps {
  onSelect: (keyword: string) => void;
  selectedKeywords: string[];
}

/**
 * Quick emotion tag buttons with subtle motion feedback.
 */
export default function MoodChips({ onSelect, selectedKeywords }: MoodChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
      {MOOD_CHIPS.map((chip) => {
        const isSelected = selectedKeywords.includes(chip.keyword);
        return (
          <motion.button
            key={chip.keyword}
            type="button"
            onClick={() => onSelect(chip.keyword)}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            animate={{
              scale: isSelected ? 1.05 : 1,
              backgroundColor: isSelected
                ? "rgba(196, 163, 90, 0.2)"
                : "rgba(39, 39, 42, 0.5)",
              borderColor: isSelected
                ? "rgba(196, 163, 90, 0.5)"
                : "rgb(63, 63, 70)",
              color: isSelected ? "rgb(196, 163, 90)" : "rgb(161, 161, 170)",
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm border min-h-[32px] sm:min-h-[36px]",
              isSelected
                ? "bg-clinic-gold/20 border-clinic-gold/50 text-clinic-gold"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 bg-zinc-800/50 active:bg-zinc-700/50"
            )}
          >
            <span className="text-[10px] sm:text-xs">{chip.emoji}</span>
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export { MOOD_CHIPS };
