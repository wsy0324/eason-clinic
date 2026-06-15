/**
 * API client — calls the internal Next.js API route.
 * No external backend needed.
 */

import type { PrescriptionRequest, PrescriptionResponse } from "./types";

export async function fetchPrescription(
  data: PrescriptionRequest
): Promise<PrescriptionResponse> {
  const res = await fetch("/api/prescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      (detail as { detail?: string }).detail ||
        `陈医生暂时无法接诊（${res.status}）`
    );
  }

  return res.json();
}
