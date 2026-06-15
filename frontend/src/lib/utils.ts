import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * LocalStorage helpers for tracking recent song IDs.
 * Keeps at most 3 recent song IDs to avoid repeats.
 */

const RECENT_SONGS_KEY = "eason_clinic_recent_songs";
const MAX_RECENT = 3;

export function getRecentSongIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SONGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, MAX_RECENT);
    return [];
  } catch {
    return [];
  }
}

export function addRecentSongId(songId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentSongIds();
    // Remove if already exists, then prepend
    const updated = [songId, ...current.filter((id) => id !== songId)];
    localStorage.setItem(
      RECENT_SONGS_KEY,
      JSON.stringify(updated.slice(0, MAX_RECENT))
    );
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Shuffle an array (Fisher-Yates).
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
