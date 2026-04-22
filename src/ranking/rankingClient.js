// src/ranking/rankingClient.js
// Fetch wrapper for the ranking API. Same-origin in production (nginx proxies
// /api/ to the backend); in dev you can set REACT_APP_RANKING_BASE.

const BASE = (process.env.REACT_APP_RANKING_BASE || "").replace(/\/+$/, "");
const url = (p) => `${BASE}/api${p}`;

export async function fetchTop(limit = 10) {
  try {
    const r = await fetch(url(`/ranking?limit=${limit}`));
    if (!r.ok) return [];
    return await r.json();
  } catch (_) {
    return [];
  }
}

export async function fetchBest() {
  try {
    const r = await fetch(url("/ranking/best"));
    if (!r.ok) return null;
    return await r.json();
  } catch (_) {
    return null;
  }
}

export async function submitRun(run) {
  try {
    const r = await fetch(url("/ranking"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(run),
    });
    if (!r.ok) {
      console.error("[nexus7] submitRun failed:", r.status, await r.text().catch(() => ""));
      return null;
    }
    return await r.json();
  } catch (err) {
    console.error("[nexus7] submitRun network error:", err);
    return null;
  }
}
