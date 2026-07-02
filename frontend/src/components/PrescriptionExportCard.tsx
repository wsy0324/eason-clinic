/**
 * PrescriptionExportCard — hidden export-only component.
 *
 * Fixed 1080px width, compact layout. Rendered off-screen,
 * captured via html-to-image, then removed.
 *
 * Uses pre-converted data URLs for images (never /assets paths).
 * Never rendered directly to the user.
 */

import type { PrescriptionResponse } from "@/lib/types";
import type { PreparedAssets } from "@/lib/imageExport";

interface PrescriptionExportCardProps {
  prescription: PrescriptionResponse;
  assets: PreparedAssets;
}

export default function PrescriptionExportCard({
  prescription,
  assets,
}: PrescriptionExportCardProps) {
  const {
    rx_id,
    clinic,
    symptom_summary,
    emotion_analysis,
    song,
    song_reason,
    dosage,
    listening_scene,
    doctor_advice,
    daily_task,
    avoid,
    follow_up,
  } = prescription;

  return (
    <div
      style={{
        width: 1080,
        background: "#fef9e7",
        padding: "60px 70px 50px",
        fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        color: "#2c2416",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Top perforated edge ── */}
      <div
        style={{
          height: 12,
          marginBottom: 40,
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 6px, #d4c5a9 6px, #d4c5a9 7px)",
        }}
      />

      {/* ── Header: Title + Icon stamp ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: 4, color: "#2c2416" }}>
            陈医生音乐处方
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#8b7355",
              letterSpacing: 6,
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            Eason Music Clinic
          </div>
        </div>

        {/* Eason icon stamp */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            border: "2px dashed rgba(192,57,43,0.3)",
            padding: 4,
            background: "rgba(254,249,231,0.9)",
          }}
        >
          <img
            src={assets.iconDataUrl}
            alt=""
            width={92}
            height={92}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* ── RX number ── */}
      <div
        style={{
          fontSize: 18,
          color: "#8b7355",
          letterSpacing: 2,
          marginBottom: 24,
          fontFamily: "monospace",
        }}
      >
        {rx_id}
        <span style={{ margin: "0 12px", color: "#d4c5a9" }}>|</span>
        机密 · 仅供患者本人查阅
      </div>

      <div style={{ borderTop: "2px dotted #d4c5a9", marginBottom: 28 }} />

      {/* ── Clinic + Symptoms ── */}
      <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
        <div style={{ flexShrink: 0 }}>
          <Label>就诊科室</Label>
          <Value>{clinic}</Value>
        </div>
        <div style={{ flex: 1 }}>
          <Label>今日症状</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {symptom_summary.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </div>
      </div>

      {/* ── Emotion analysis ── */}
      <Box style={{ marginBottom: 24 }}>
        <Label>📋 情绪听诊</Label>
        <Value style={{ lineHeight: 1.8 }}>{emotion_analysis}</Value>
      </Box>

      {/* ── Album cover + Song ── */}
      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={assets.coverDataUrl}
            alt={song.title}
            width={120}
            height={120}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <Label>🎵 处方歌曲</Label>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: 4, color: song.themeColor }}>
            《{song.displayTitle || song.title}》
          </div>
        </div>
      </div>

      {/* ── Song reason ── */}
      <div style={{ marginBottom: 24 }}>
        <Label>💊 推荐理由</Label>
        <Value style={{ fontStyle: "italic", lineHeight: 1.8 }}>{song_reason}</Value>
      </div>

      {/* ── Dosage ── */}
      <div style={{ marginBottom: 20 }}>
        <Label>🕐 服用方式</Label>
        <Value>{dosage}</Value>
      </div>

      {/* ── Listening scene ── */}
      <div style={{ marginBottom: 20 }}>
        <Label>🎬 推荐场景</Label>
        <Value>{listening_scene}</Value>
      </div>

      {/* ── Doctor advice ── */}
      <Box style={{ marginBottom: 24 }}>
        <Label>📝 医嘱</Label>
        <Value style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.8 }}>{doctor_advice}</Value>
      </Box>

      {/* ── Daily task ── */}
      <div style={{ marginBottom: 20 }}>
        <Label>✅ 今日小任务</Label>
        <Value>{daily_task}</Value>
      </div>

      {/* ── Avoid ── */}
      <div style={{ marginBottom: 20 }}>
        <Label>⚠️ 服用禁忌</Label>
        <Value>{avoid}</Value>
      </div>

      {/* ── Follow-up ── */}
      <div style={{ marginBottom: 32 }}>
        <Label>🔄 复诊建议</Label>
        <Value>{follow_up}</Value>
      </div>

      <div style={{ borderTop: "2px dotted #d4c5a9", marginBottom: 28 }} />

      {/* ── Small note ── */}
      <div
        style={{
          fontSize: 16,
          color: "rgba(139,115,85,0.6)",
          textAlign: "center",
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        本处方不提供医学诊断，只负责把此刻的心情交给一首歌照看。
      </div>

      {/* ── Closing line ── */}
      <div
        style={{
          textAlign: "center",
          fontSize: 28,
          fontStyle: "italic",
          color: "rgba(196,163,90,0.8)",
          letterSpacing: 4,
          marginBottom: 8,
        }}
      >
        感谢永远有歌把心境道破
      </div>

      {/* ── Domain ── */}
      <div
        style={{
          textAlign: "center",
          fontSize: 18,
          color: "rgba(139,115,85,0.5)",
          letterSpacing: 2,
        }}
      >
        easonchan-clinic.xyz
      </div>

      {/* ── Bottom perforated edge ── */}
      <div
        style={{
          height: 12,
          marginTop: 36,
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 6px, #d4c5a9 6px, #d4c5a9 7px)",
        }}
      />
    </div>
  );
}

/* ── Tiny helper components (inline styles, no Tailwind dependency for export) ── */

function Label({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 18,
        color: "#8b7355",
        textTransform: "uppercase",
        letterSpacing: 3,
        marginBottom: 6,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function Value({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ fontSize: 22, color: "rgba(44,36,22,0.85)", lineHeight: 1.7, ...style }}>
      {children}
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 14px",
        borderRadius: 20,
        fontSize: 18,
        border: "1px solid rgba(139,115,85,0.3)",
        color: "#2c2416",
        background: "rgba(254,249,231,0.5)",
      }}
    >
      {children}
    </span>
  );
}

function Box({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        padding: "20px 24px",
        borderRadius: 8,
        background: "rgba(196,163,90,0.08)",
        border: "1px solid rgba(196,163,90,0.15)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
