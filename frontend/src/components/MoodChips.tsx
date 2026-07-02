"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { MoodChip } from "@/lib/types";

const MOOD_CHIPS: MoodChip[] = [
  { label: "开心", emoji: "😊", keyword: "开心" },
  { label: "轻松", emoji: "🍃", keyword: "轻松" },
  { label: "治愈", emoji: "🕯️", keyword: "治愈" },
  { label: "温暖", emoji: "🤗", keyword: "温暖" },
  { label: "浪漫", emoji: "💕", keyword: "浪漫" },
  { label: "暧昧", emoji: "💫", keyword: "暧昧" },
  { label: "暗恋", emoji: "💌", keyword: "暗恋" },
  { label: "失恋", emoji: "💔", keyword: "失恋" },
  { label: "放不下", emoji: "💭", keyword: "放不下" },
  { label: "遗憾", emoji: "🍂", keyword: "遗憾" },
  { label: "怀念", emoji: "📷", keyword: "怀念" },
  { label: "孤独", emoji: "🌙", keyword: "孤独" },
  { label: "麻木", emoji: "🫥", keyword: "麻木" },
  { label: "崩溃", emoji: "💥", keyword: "崩溃" },
  { label: "疲惫", emoji: "😮‍💨", keyword: "疲惫" },
  { label: "焦虑", emoji: "😰", keyword: "焦虑" },
  { label: "迷茫", emoji: "🌫️", keyword: "迷茫" },
  { label: "想逃离", emoji: "🏃", keyword: "想逃离" },
  { label: "压抑", emoji: "🌧️", keyword: "压抑" },
  { label: "自卑", emoji: "🥀", keyword: "自卑" },
  { label: "委屈", emoji: "🥺", keyword: "委屈" },
  { label: "愤怒", emoji: "🤬", keyword: "愤怒" },
  { label: "生气", emoji: "😤", keyword: "生气" },
  { label: "不甘心", emoji: "💢", keyword: "不甘心" },
  { label: "嫉妒", emoji: "🐍", keyword: "嫉妒" },
  { label: "释怀", emoji: "🕊️", keyword: "释怀" },
  { label: "成长", emoji: "🌳", keyword: "成长" },
  { label: "自由", emoji: "🕊️", keyword: "自由" },
  { label: "勇气", emoji: "⚔️", keyword: "勇气" },
  { label: "清醒", emoji: "💡", keyword: "清醒" },
];

interface MoodChipsProps {
  onSelect: (keyword: string) => void;
  selectedKeywords: string[];
}

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
