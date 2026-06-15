/**
 * TypeScript type definitions for Eason Music Clinic.
 */

/** Request body for POST /api/prescription */
export interface PrescriptionRequest {
  text: string;
  recent_song_ids: string[];
}

/** Song info returned in the prescription (no icon) */
export interface SongInfo {
  id: string;
  title: string;
  moods: string[];
  theme_color: string;
}

/** Full prescription response from the API — expanded version */
export interface PrescriptionResponse {
  rx_id: string;
  clinic: string;
  symptom_summary: string[];
  emotion_analysis: string;
  song: SongInfo;
  song_reason: string;
  dosage: string;
  listening_scene: string;
  doctor_advice: string;
  daily_task: string;
  avoid: string;
  follow_up: string;
  small_note: string;
}

/** Application state for the prescription flow */
export type AppState = "idle" | "loading" | "success" | "error";

/** Quick mood chip */
export interface MoodChip {
  label: string;
  emoji: string;
  keyword: string;
}
