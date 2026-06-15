/**
 * POST /api/prescription
 *
 * Full recommendation engine ported from Python backend.
 * No external NLP library — uses n-gram extraction + substring matching
 * for Chinese text, plus Levenshtein for fuzzy matching.
 */

import { NextResponse } from "next/server";
import { songs, type SongData } from "@/lib/data/songs";
import {
  moodMap,
  dosage_templates,
  follow_up_templates,
  emotion_analysis_templates,
  listening_scene_templates,
  daily_task_templates,
  avoid_templates,
  small_note_templates,
} from "@/lib/data/mood_keywords";

/* ================================================================
   Mood adjacency & conflict — same as Python recommender
   ================================================================ */

const MOOD_ADJACENCY: Record<string, string[]> = {
  "开心": ["轻松", "活力", "温暖"],
  "轻松": ["开心", "释然", "温暖"],
  "活力": ["开心", "期待", "轻松"],
  "感恩": ["温暖", "期待", "开心"],
  "期待": ["感恩", "温暖", "活力", "想重新开始"],
  "释然": ["轻松", "释怀不了", "放不下", "成长"],
  "温暖": ["感恩", "轻松", "期待"],
  "失恋": ["放不下", "怀念", "释怀不了", "孤独"],
  "放不下": ["失恋", "怀念", "释怀不了", "孤独"],
  "怀念": ["放不下", "孤独", "温暖", "释然"],
  "孤独": ["怀念", "放不下", "没人懂我", "想逃离"],
  "释怀不了": ["放不下", "释然", "怀念", "不甘心"],
  "没人懂我": ["孤独", "压抑", "想逃离"],
  "想重新开始": ["期待", "释然", "活力"],
  "疲惫": ["焦虑", "压抑", "想逃离", "迷茫"],
  "焦虑": ["疲惫", "压抑", "迷茫"],
  "压抑": ["焦虑", "疲惫", "没人懂我", "想逃离"],
  "迷茫": ["疲惫", "想逃离", "焦虑"],
  "想逃离": ["迷茫", "孤独", "疲惫", "压抑"],
  "不甘心": ["疲惫", "释怀不了", "焦虑"],
  "成长": ["释然", "期待", "想重新开始"],
};

const MOOD_CONFLICT: Record<string, string[]> = {
  "开心": ["失恋", "压抑", "焦虑", "疲惫", "放不下", "释怀不了", "没人懂我"],
  "轻松": ["失恋", "压抑", "焦虑", "不甘心", "释怀不了"],
  "活力": ["失恋", "压抑", "疲惫", "放不下"],
  "感恩": ["失恋", "压抑", "不甘心"],
  "期待": ["失恋", "压抑", "放不下", "释怀不了"],
  "释然": ["不甘心", "焦虑"],
  "温暖": ["失恋", "压抑"],
  "失恋": ["开心", "活力"],
  "疲惫": ["活力"],
  "压抑": ["开心", "活力"],
};

/* ================================================================
   Chinese text processing
   ================================================================ */

/** Extract all n-grams from Chinese text (no spaces between words). */
function extractNGrams(text: string, n: number): string[] {
  const result: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    result.push(text.slice(i, i + n));
  }
  return result;
}

/** Levenshtein distance for fuzzy matching. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyRatio(a: string, b: string): number {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

/** Best partial ratio — slide shorter string across longer string. */
function fuzzyPartialRatio(short: string, long: string): number {
  if (short.length > long.length) [short, long] = [long, short];
  if (short.length === 0) return 0;
  let best = 0;
  for (let i = 0; i <= long.length - short.length; i++) {
    const slice = long.slice(i, i + short.length);
    const sim = fuzzyRatio(short, slice);
    if (sim > best) best = sim;
  }
  return best;
}

/* ================================================================
   Symptom identification
   ================================================================ */

function identifySymptoms(text: string): string[] {
  const ngrams2 = extractNGrams(text, 2);
  const ngrams3 = extractNGrams(text, 3);
  const ngrams4 = extractNGrams(text, 4);
  const allNGrams = new Set([...ngrams2, ...ngrams3, ...ngrams4]);

  const moodScores: Record<string, number> = {};

  for (const [moodName, moodInfo] of Object.entries(moodMap)) {
    let score = 0;
    for (const kw of moodInfo.keywords) {
      // Exact substring match in full text — strongest
      if (text.includes(kw)) {
        score += 10;
        continue;
      }
      // N-gram match
      if (allNGrams.has(kw)) {
        score += 6;
        continue;
      }
      // Fuzzy match (only for longer keywords, higher threshold)
      for (const ng of allNGrams) {
        if (ng.length >= 2 && kw.length >= 2) {
          const sim = fuzzyRatio(ng, kw);
          if (sim > 0.85) {
            score += sim * 1.5;
          }
        }
      }
    }
    if (score > 0) moodScores[moodName] = score;
  }

  const sorted = Object.entries(moodScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return ["迷茫"];

  const threshold = sorted[0][1] * 0.25;
  const symptoms = sorted.filter(([, s]) => s >= threshold).slice(0, 4).map(([m]) => m);

  return symptoms.length > 0 ? symptoms : [sorted[0][0]];
}

/* ================================================================
   Song scoring (mood-first)
   ================================================================ */

function scoreSong(
  song: SongData,
  symptoms: string[],
  ngrams: Set<string>,
  text: string,
  recentSongIds: string[]
): number {
  let score = 0;
  const songMoods = new Set(song.moods);

  // 1. Direct mood match — DOMINANT
  let directHits = 0;
  for (const s of symptoms) {
    if (songMoods.has(s)) directHits++;
  }
  score += directHits * 15;

  // 2. Mood adjacency bonus
  for (const symptom of symptoms) {
    if (songMoods.has(symptom)) continue;
    const adjacent = MOOD_ADJACENCY[symptom] || [];
    if (adjacent.some((a) => songMoods.has(a))) {
      score += 2.5;
      break;
    }
  }

  // 3. Mood conflict penalty
  const primary = symptoms[0] || "";
  const conflicts = MOOD_CONFLICT[primary] || [];
  let conflictCount = 0;
  for (const mood of conflicts) {
    if (songMoods.has(mood)) conflictCount++;
  }
  score -= conflictCount * 12;

  // 4. Keyword match (supportive)
  let keywordHits = 0;
  for (const kw of song.keywords) {
    if (text.includes(kw)) keywordHits += 1;
    else if (ngrams.has(kw)) keywordHits += 0.5;
  }
  score += keywordHits * 2;

  // 5. Fuzzy similarity (negligible)
  let maxSim = 0;
  for (const kw of song.keywords) {
    const sim = fuzzyPartialRatio(kw, text);
    if (sim > maxSim) maxSim = sim;
  }
  score += maxSim * 0.5;

  // 6. Base weight
  score += song.weight * 0.3;

  // 7. Recent song penalty
  const recentIdx = recentSongIds.indexOf(song.id);
  if (recentIdx !== -1) {
    score -= Math.max(12 - recentIdx * 3, 0);
  }

  // 8. Tiny jitter
  score += (Math.random() - 0.5) * 1.6;

  return score;
}

/* ================================================================
   Prescription writer
   ================================================================ */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRxId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const n = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `RX-${y}-${m}${d}-${n}`;
}

function generateSongReason(song: SongData, symptoms: string[]): string {
  const seeds = song.advice_seeds;
  const moodStr = symptoms.slice(0, 3).join("、");
  const seed = pick(seeds);
  const reasons = [
    `适合在你感到${moodStr}的时候服用。${seed}。`,
    `这首歌里有一种${moodStr}时最需要的东西。${seed}。`,
    `为今天的${moodStr}开的。${seed}。`,
    `陈医生觉得你现在需要这个旋律。${seed}。`,
  ];
  return pick(reasons);
}

function generateDoctorAdvice(song: SongData, symptoms: string[]): string {
  const seeds = song.advice_seeds;
  if (seeds.length > 0) return pick(seeds);

  const fallback: Record<string, string> = {
    "疲惫": "累的时候就先停下来吧，没有人规定你必须一直跑。先休息，再出发。",
    "失恋": "允许自己难过，但不准一直难过。先把这首歌听完，听完之后好好洗个脸。",
    "迷茫": "不知道方向很正常，很多人都是边走边找。你现在只是暂时看不清，不是没有路。",
    "孤独": "一个人不是孤独，是独处。独处的时候你可以把所有伪装卸下来。",
    "想逃离": "偶尔离开一下不是逃避，是重新整理自己。走一段路，看一些风景，然后再决定。",
    "不甘心": "不甘心说明你还在乎，这是生命力。但别让不甘心消耗你太久。",
    "怀念": "怀念是因为那段日子值得。但最好的怀念方式，是带着它继续往前走。",
    "放不下": "放不下说明你真正拥有过。不急着放下，先让它安静地待在你心里。",
    "释怀不了": "释怀不是删除记忆，是把它放到一个不会再疼的位置。",
    "没人懂我": "懂你的人不用多，你懂自己就够了。不过今晚，陈医生试着懂你。",
    "想重新开始": "每一个重新开始的日子，都是从上一首歌结束的时候开始的。",
    "压抑": "盖子压太久了，掀开一条缝，让今晚的夜风进来一点。",
    "成长": "成长不是变完美，是学会和自己的不完美好好相处。",
    "温暖": "今晚世界欠你的温度，让这首歌还给你一点点。",
    "焦虑": "你不是落后了，你只是在自己的时区里。深呼吸，没人催你。",
    "开心": "开心的时候更应该好好听一首歌，让这个瞬间被音乐记住。",
    "轻松": "轻松的状态很珍贵，选一首歌配这个心情，就当给今天的自己一个奖励。",
    "感恩": "能感到感恩说明你心里有光。把这份感谢收进一首歌里，它会存得很久。",
    "期待": "对未来有期待是一件很好的事。在等它来的时候，先听首歌暖个场。",
    "释然": "想通了的感觉真好啊，像卸下一件背了很久的行李。",
    "活力": "有能量的时候就该让它尽情释放。这首歌就是你的充电背景音。",
  };
  for (const s of symptoms) {
    if (fallback[s]) return fallback[s];
  }
  return "你不一定是需要答案，你可能只是需要一首歌的时间。先听完这首，再看。";
}

function generateEmotionAnalysis(symptoms: string[]): string {
  const moodStr = symptoms.join("、");
  const count = symptoms.length;
  let moodDesc: string;
  if (count === 1) moodDesc = "一种很清晰的感受";
  else if (count === 2) moodDesc = "两种情绪交织在一起";
  else moodDesc = "好几种情绪混在一起";

  if (emotion_analysis_templates.length > 0) {
    return pick(emotion_analysis_templates)
      .replace("{moods}", moodStr)
      .replace("{mood_desc}", moodDesc)
      .replace("{count}", String(count));
  }
  return `陈医生听到的，是${moodStr}。今晚先把其他的放一放，我们先处理这个。`;
}

/* ================================================================
   POST handler
   ================================================================ */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text: string = (body.text || "").trim();
    const recentSongIds: string[] = body.recent_song_ids || [];

    if (!text || text.length > 500) {
      return NextResponse.json(
        { detail: "请描述你的症状（1-500字）。" },
        { status: 400 }
      );
    }

    // 1. Identify symptoms
    const symptoms = identifySymptoms(text);

    // 2. Extract n-grams for keyword matching
    const ngrams2 = extractNGrams(text, 2);
    const ngrams3 = extractNGrams(text, 3);
    const ngrams = new Set([...ngrams2, ...ngrams3]);

    // 3. Score & rank
    const scored = songs.map((song) => ({
      score: scoreSong(song, symptoms, ngrams, text, recentSongIds),
      song,
    }));
    scored.sort((a, b) => b.score - a.score);

    // 4. Top 8 candidate pool → weighted random
    const pool = scored.slice(0, 8);
    let chosen: SongData;

    if (pool.length === 0) {
      chosen = songs[Math.floor(Math.random() * songs.length)];
    } else if (pool.length === 1) {
      chosen = pool[0].song;
    } else {
      const scores = pool.map((s) => Math.max(s.score, 0.1));
      const total = scores.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      chosen = pool[pool.length - 1].song;
      for (let i = 0; i < pool.length; i++) {
        r -= scores[i];
        if (r <= 0) {
          chosen = pool[i].song;
          break;
        }
      }
    }

    // 5. Generate prescription
    const clinics = ["情绪内科", "深夜情绪科", "音乐疗愈科", "心情内科"];
    const prescription = {
      rx_id: generateRxId(),
      clinic: pick(clinics),
      symptom_summary: symptoms,
      emotion_analysis: generateEmotionAnalysis(symptoms),
      song: {
        id: chosen.id,
        title: chosen.title,
        moods: chosen.moods,
        theme_color: chosen.theme_color,
      },
      song_reason: generateSongReason(chosen, symptoms),
      dosage: pick(dosage_templates.length > 0 ? dosage_templates : ["今晚散步时服用一次。"]),
      listening_scene: pick(listening_scene_templates.length > 0 ? listening_scene_templates : ["推荐场景：夜晚路上、公交靠窗。"]),
      doctor_advice: generateDoctorAdvice(chosen, symptoms),
      daily_task: pick(daily_task_templates.length > 0 ? daily_task_templates : ["今日小任务：出门走十分钟。"]),
      avoid: pick(avoid_templates.length > 0 ? avoid_templates : ["服用禁忌：不要一边刷短视频一边听。"]),
      follow_up: pick(follow_up_templates.length > 0 ? follow_up_templates : ["明天再来复诊。"]),
      small_note: pick(small_note_templates.length > 0 ? small_note_templates : ["本处方不负责解决所有问题，只负责陪你把今晚过完。"]),
    };

    return NextResponse.json(prescription);
  } catch {
    return NextResponse.json(
      { detail: "陈医生暂时无法听诊，请稍后再试。" },
      { status: 500 }
    );
  }
}
