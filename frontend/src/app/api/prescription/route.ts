/**
 * POST /api/prescription
 *
 * Upgraded recommendation engine:
 * - 29 moods, primary_mood_bonus, popularity_weight
 * - Diversity & recent-song penalties
 * - Per-song prescription templates (lyrics-inspired)
 * - 200+ song curated pool
 */

import { NextResponse } from "next/server";
import { songs, type SongData, getCoverUrl } from "@/lib/data/songs";
import {
  moodMap,
  MOOD_ADJACENCY,
  MOOD_CONFLICT,
  emotion_analysis_templates,
  small_note_templates,
} from "@/lib/data/mood_keywords";

/* ================================================================
   Chinese text processing
   ================================================================ */

function extractNGrams(text: string, n: number): string[] {
  const result: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    result.push(text.slice(i, i + n));
  }
  return result;
}

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
   Symptom identification (expanded)
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
      if (text.includes(kw)) {
        score += 10;
        continue;
      }
      if (allNGrams.has(kw)) {
        score += 6;
        continue;
      }
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
  const symptoms = sorted
    .filter(([, s]) => s >= threshold)
    .slice(0, 4)
    .map(([m]) => m);

  return symptoms.length > 0 ? symptoms : [sorted[0][0]];
}

/* ================================================================
   Song scoring — upgraded algorithm
   ================================================================ */

function scoreSong(
  song: SongData,
  symptoms: string[],
  ngrams: Set<string>,
  text: string,
  recentSongIds: string[],
  chosenInThisRound: Set<string>
): number {
  let score = 0;
  const songMoods = new Set(song.moods);
  const primaryMood = song.primaryMood;

  // 1. mood_score — direct mood match (dominant factor)
  let directHits = 0;
  for (const s of symptoms) {
    if (songMoods.has(s)) directHits++;
  }
  score += directHits * 15;

  // 2. primary_mood_bonus — song's main mood matches user's top symptom
  if (symptoms.length > 0 && primaryMood === symptoms[0]) {
    score += 12;
  } else if (symptoms.length > 1 && primaryMood === symptoms[1]) {
    score += 6;
  } else if (symptoms.some((s) => s === primaryMood)) {
    score += 3;
  }

  // 3. Mood adjacency bonus
  for (const symptom of symptoms) {
    if (songMoods.has(symptom)) continue;
    const adjacent = MOOD_ADJACENCY[symptom] || [];
    if (adjacent.some((a) => songMoods.has(a))) {
      score += 2.5;
      break;
    }
  }

  // 4. Mood conflict penalty (strengthened)
  const primary = symptoms[0] || "";
  const conflicts = MOOD_CONFLICT[primary] || [];
  let conflictCount = 0;
  for (const mood of conflicts) {
    if (songMoods.has(mood)) conflictCount++;
  }
  score -= conflictCount * 15;

  // Also check: if the song's primaryMood conflicts with user's primary symptom
  const primaryConflicts = MOOD_CONFLICT[symptoms[0]] || [];
  if (primaryConflicts.includes(primaryMood)) {
    score -= 20; // Heavy penalty
  }

  // 5. keyword_score — keyword match
  let keywordHits = 0;
  for (const kw of song.keywords) {
    if (text.includes(kw)) keywordHits += 1;
    else if (ngrams.has(kw)) keywordHits += 0.5;
  }
  score += keywordHits * 2;

  // 6. Fuzzy similarity
  let maxSim = 0;
  for (const kw of song.keywords) {
    const sim = fuzzyPartialRatio(kw, text);
    if (sim > maxSim) maxSim = sim;
  }
  score += maxSim * 0.5;

  // 7. popularity_weight — subjective popularity (0-10)
  score += song.popularityWeight * 0.5;

  // 8. recent_song_penalty — avoid repeating recently prescribed songs
  const recentIdx = recentSongIds.indexOf(song.id);
  if (recentIdx !== -1) {
    // Closer to index 0 = more recent = bigger penalty
    score -= Math.max(18 - recentIdx * 5, 0);
  }

  // 9. diversity_penalty — avoid repeating in the same batch
  if (chosenInThisRound.has(song.id)) {
    score -= 25;
  }

  // 10. random_jitter — add controlled randomness for variety
  score += (Math.random() - 0.5) * 3.0;

  return score;
}

/* ================================================================
   Prescription writers
   ================================================================ */

function pick<T>(arr: T[]): T {
  if (!arr || arr.length === 0) return "" as unknown as T;
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
  const templates = song.prescriptionTemplates?.songReason;
  if (templates && templates.length > 0) return pick(templates);

  // Fallback
  const moodStr = symptoms.slice(0, 2).join("、");
  return `这首歌里有${moodStr}时最需要的旋律。先听完，其他的一会儿再说。`;
}

function generateDoctorAdvice(song: SongData, _symptoms: string[]): string {
  const templates = song.prescriptionTemplates?.doctorAdvice;
  if (templates && templates.length > 0) return pick(templates);

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

    // 2. Extract n-grams
    const ngrams2 = extractNGrams(text, 2);
    const ngrams3 = extractNGrams(text, 3);
    const ngrams = new Set([...ngrams2, ...ngrams3]);

    // 3. Score all songs
    const scored = songs.map((song) => ({
      score: scoreSong(song, symptoms, ngrams, text, recentSongIds, new Set()),
      song,
    }));
    scored.sort((a, b) => b.score - a.score);

    // 4. Top 18 candidate pool → weighted random (expanded for diversity)
    const poolSize = Math.min(18, scored.length);
    const pool = scored.slice(0, poolSize);

    let chosen: SongData;
    if (pool.length === 0) {
      chosen = songs[Math.floor(Math.random() * songs.length)];
    } else if (pool.length === 1) {
      chosen = pool[0].song;
    } else {
      // Weighted random from pool, but ensure minimum score
      const minScore = Math.max(pool[pool.length - 1].score, 0.1);
      const scores = pool.map((s) => Math.max(s.score - minScore + 1, 0.5));
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

    // 5. Build prescription from per-song templates
    const clinics = [
      "情绪内科",
      "深夜情绪科",
      "音乐疗愈科",
      "心情内科",
      "都市情伤科",
    ];

    const prescription = {
      rx_id: generateRxId(),
      clinic: pick(clinics),
      symptom_summary: symptoms,
      emotion_analysis: generateEmotionAnalysis(symptoms),
      song: {
        id: chosen.id,
        title: chosen.title,
        displayTitle: chosen.displayTitle || chosen.title,
        moods: chosen.moods,
        primaryMood: chosen.primaryMood,
        themeColor: chosen.themeColor,
        cover: chosen.albumCover,
        icon: chosen.icon,
      },
      song_reason: generateSongReason(chosen, symptoms),
      dosage: pick(chosen.prescriptionTemplates.dosage),
      listening_scene: pick(chosen.prescriptionTemplates.listeningScene),
      doctor_advice: generateDoctorAdvice(chosen, symptoms),
      daily_task: pick(chosen.prescriptionTemplates.dailyTask),
      avoid: pick(chosen.prescriptionTemplates.avoid),
      follow_up: pick(chosen.prescriptionTemplates.followUp),
      small_note: pick(small_note_templates),
    };

    return NextResponse.json(prescription);
  } catch {
    return NextResponse.json(
      { detail: "陈医生暂时无法听诊，请稍后再试。" },
      { status: 500 }
    );
  }
}
