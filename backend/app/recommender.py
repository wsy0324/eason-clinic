"""
Recommendation engine for Eason Music Clinic.

Algorithm (mood-first):
1. Tokenize user input with jieba
2. Match tokens against mood_keywords to identify symptom labels
3. Score each song: mood_hits×15 + adjacency×5 + keyword×2 - mismatch_penalty
   + fuzzy×0.5 + weight×0.3 - recent_penalty + tiny_jitter
4. Take top 8 candidates, weighted random selection

Key principle: mood match is the DOMINANT factor. Keyword and fuzzy matching
are supportive only — they should never override the user's emotional state.
"""

import json
import random
import os
from typing import Optional

import jieba
from rapidfuzz import fuzz


# Mood adjacency: which moods are "close enough" to get partial credit
MOOD_ADJACENCY: dict[str, list[str]] = {
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
}

# Mood conflict: if user's primary symptom is in group A,
# songs dominated by group B should be heavily penalized
MOOD_CONFLICT: dict[str, list[str]] = {
    "开心": ["失恋", "压抑", "焦虑", "疲惫", "放不下", "释怀不了", "没人懂我"],
    "轻松": ["失恋", "压抑", "焦虑", "不甘心", "释怀不了"],
    "活力": ["失恋", "压抑", "疲惫", "放不下"],
    "感恩": ["失恋", "压抑", "不甘心"],
    "期待": ["失恋", "压抑", "放不下", "释怀不了"],
    "释然": ["不甘心", "焦虑"],  # mild conflict — 释然 is close to acceptance
    "温暖": ["失恋", "压抑"],
    "失恋": ["开心", "活力"],  # sad person shouldn't get forced-happy songs
    "疲惫": ["活力"],  # tired person doesn't need forced energy
    "压抑": ["开心", "活力"],
}


class Recommender:
    def __init__(self):
        self.songs: list[dict] = []
        self.mood_map: dict = {}
        self.dosage_templates: list[str] = []
        self.follow_up_templates: list[str] = []
        self.disclaimers: list[str] = []
        self._load_data()

    def _load_data(self):
        data_dir = os.path.join(os.path.dirname(__file__), "data")

        with open(os.path.join(data_dir, "songs.json"), "r", encoding="utf-8") as f:
            self.songs = json.load(f)

        with open(os.path.join(data_dir, "mood_keywords.json"), "r", encoding="utf-8") as f:
            mood_data = json.load(f)
            self.mood_map = mood_data["moods"]
            self.dosage_templates = mood_data["dosage_templates"]
            self.follow_up_templates = mood_data["follow_up_templates"]
            self.disclaimers = mood_data["disclaimers"]

    def identify_symptoms(self, text: str) -> list[str]:
        """
        Identify emotion symptoms from user input text.
        Exact matches are heavily favored over fuzzy matches.
        """
        tokens = set(jieba.lcut(text))
        bigrams = set()
        word_list = list(jieba.lcut(text))
        for i in range(len(word_list) - 1):
            bigrams.add(word_list[i] + word_list[i + 1])

        all_tokens = tokens | bigrams

        mood_scores: dict[str, float] = {}

        for mood_name, mood_info in self.mood_map.items():
            score = 0.0
            for keyword in mood_info["keywords"]:
                # Exact substring match in full text — strongest signal
                if keyword in text:
                    score += 10
                    continue
                # Token-level exact match
                if keyword in all_tokens:
                    score += 6
                    continue
                # Fuzzy — only for longer keywords, higher threshold
                for token in all_tokens:
                    if len(token) >= 2 and len(keyword) >= 2:
                        sim = fuzz.ratio(token, keyword) / 100.0
                        if sim > 0.85:  # Was 0.75 — stricter
                            score += sim * 1.5  # Was 3 — lower

            if score > 0:
                mood_scores[mood_name] = score

        # Sort by score descending, take top 2-4
        sorted_moods = sorted(mood_scores.items(), key=lambda x: x[1], reverse=True)
        if not sorted_moods:
            return ["迷茫"]

        threshold = sorted_moods[0][1] * 0.25 if sorted_moods else 0
        symptoms = [m for m, s in sorted_moods if s >= threshold][:4]

        return symptoms if symptoms else [sorted_moods[0][0]]

    def score_song(
        self,
        song: dict,
        symptoms: list[str],
        tokens: set[str],
        text: str,
        recent_song_ids: list[str],
    ) -> float:
        """
        Mood-first scoring.

        score = mood_hits × 15       (direct mood match — DOMINANT)
              + adjacency × 5        (related mood bonus)
              - conflict × 12        (mood mismatch penalty — STRONG)
              + keyword × 2          (supportive only)
              + fuzzy × 0.5          (negligible)
              + weight × 0.3         (song popularity)
              - recent_penalty
              + tiny_jitter
        """
        score = 0.0
        song_moods = set(song.get("moods", []))
        user_symptoms = set(symptoms)

        # ---- 1. DIRECT MOOD MATCH (dominant) ----
        direct_hits = sum(1 for s in symptoms if s in song_moods)
        score += direct_hits * 15.0

        # ---- 2. MOOD ADJACENCY BONUS ----
        adjacency_score = 0.0
        for symptom in symptoms:
            if symptom in song_moods:
                continue  # Already counted as direct hit
            adjacent_moods = MOOD_ADJACENCY.get(symptom, [])
            for adj in adjacent_moods:
                if adj in song_moods:
                    adjacency_score += 2.5  # Half of a direct hit
                    break  # One adjacency per symptom
        score += adjacency_score

        # ---- 3. MOOD CONFLICT PENALTY ----
        # If the user's primary (first) symptom conflicts with the song's moods
        conflict_count = 0
        primary_symptom = symptoms[0] if symptoms else ""
        conflict_moods = MOOD_CONFLICT.get(primary_symptom, [])
        for mood in conflict_moods:
            if mood in song_moods:
                conflict_count += 1
        score -= conflict_count * 12.0

        # ---- 4. KEYWORD MATCH (supportive) ----
        keyword_hits = 0
        for kw in song.get("keywords", []):
            if kw in text:
                keyword_hits += 1
            elif kw in tokens:
                keyword_hits += 0.5
        score += keyword_hits * 2.0

        # ---- 5. FUZZY SIMILARITY (negligible weight) ----
        max_sim = 0.0
        for kw in song.get("keywords", []):
            sim = fuzz.partial_ratio(kw, text) / 100.0
            if sim > max_sim:
                max_sim = sim
        score += max_sim * 0.5

        # ---- 6. BASE WEIGHT ----
        score += song.get("weight", 5) * 0.3

        # ---- 7. RECENT SONG PENALTY ----
        if song["id"] in recent_song_ids:
            idx = recent_song_ids.index(song["id"])
            penalty = 12.0 - (idx * 3.0)
            score -= max(penalty, 0)

        # ---- 8. TINY JITTER ----
        score += random.uniform(-0.8, 0.8)

        return score

    def recommend(
        self, text: str, recent_song_ids: Optional[list[str]] = None
    ) -> dict:
        """
        Main recommendation method.
        """
        if recent_song_ids is None:
            recent_song_ids = []

        # Step 1: Identify symptoms
        symptoms = self.identify_symptoms(text)

        # Step 2: Tokenize for keyword matching
        tokens = set(jieba.lcut(text))

        # Step 3: Score all songs
        scored = []
        for song in self.songs:
            s = self.score_song(song, symptoms, tokens, text, recent_song_ids)
            scored.append((s, song))

        # Step 4: Sort by score, take top 8 as candidate pool
        scored.sort(key=lambda x: x[0], reverse=True)
        candidate_pool = scored[:8]

        # Step 5: Weighted random selection
        if not candidate_pool:
            chosen = random.choice(self.songs)
        elif len(candidate_pool) == 1:
            chosen = candidate_pool[0][1]
        else:
            scores = [max(s, 0.1) for s, _ in candidate_pool]
            total = sum(scores)
            r = random.uniform(0, total)
            cumulative = 0
            chosen = candidate_pool[-1][1]
            for (score, song), w in zip(candidate_pool, scores):
                cumulative += w
                if r <= cumulative:
                    chosen = song
                    break

        return {
            "symptoms": symptoms,
            "song": chosen,
        }

    def get_recommendation(self, text: str, recent_song_ids: Optional[list[str]] = None) -> dict:
        """Convenience wrapper."""
        return self.recommend(text, recent_song_ids)


# Singleton
recommender = Recommender()
