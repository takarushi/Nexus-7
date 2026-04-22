// server/index.js
// Minimal Express + better-sqlite3 API for NEXUS-7 run results.
// Endpoints:
//   GET  /api/health            -> { ok: true }
//   GET  /api/ranking           -> top N runs (default 10)
//   GET  /api/ranking/best      -> single best run (highest score)
//   POST /api/ranking           -> { name, score, outcome, nodesCompleted, errors, hints, durationMs }

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const PORT = Number(process.env.PORT || 3001);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "nexus7.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS runs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    score           INTEGER NOT NULL,
    outcome         TEXT    NOT NULL CHECK(outcome IN ('victory','defeat')),
    nodes_completed INTEGER NOT NULL,
    errors          INTEGER NOT NULL DEFAULT 0,
    hints           INTEGER NOT NULL DEFAULT 0,
    duration_ms     INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_runs_score ON runs(score DESC);
`);

const insertRun = db.prepare(`
  INSERT INTO runs (name, score, outcome, nodes_completed, errors, hints, duration_ms)
  VALUES (@name, @score, @outcome, @nodes_completed, @errors, @hints, @duration_ms)
`);
const selectTop = db.prepare(`
  SELECT id, name, score, outcome, nodes_completed AS nodesCompleted,
         errors, hints, duration_ms AS durationMs, created_at AS createdAt
  FROM runs
  ORDER BY score DESC, created_at ASC
  LIMIT ?
`);
const selectBest = db.prepare(`
  SELECT id, name, score, outcome, nodes_completed AS nodesCompleted,
         errors, hints, duration_ms AS durationMs, created_at AS createdAt
  FROM runs
  ORDER BY score DESC, created_at ASC
  LIMIT 1
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: "8kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "nexus7-ranking" });
});

app.get("/api/ranking", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  res.json(selectTop.all(limit));
});

app.get("/api/ranking/best", (_req, res) => {
  const row = selectBest.get();
  res.json(row || null);
});

app.post("/api/ranking", (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "ANON").trim().slice(0, 24) || "ANON";
  const score = Math.max(0, Math.min(Number(body.score) || 0, 1_000_000));
  const outcome = body.outcome === "victory" ? "victory" : "defeat";
  const nodesCompleted = Math.max(0, Math.min(Number(body.nodesCompleted) || 0, 20));
  const errors = Math.max(0, Math.min(Number(body.errors) || 0, 10_000));
  const hints = Math.max(0, Math.min(Number(body.hints) || 0, 10_000));
  const durationMs = Math.max(0, Math.min(Number(body.durationMs) || 0, 86_400_000));

  const result = insertRun.run({
    name,
    score,
    outcome,
    nodes_completed: nodesCompleted,
    errors,
    hints,
    duration_ms: durationMs,
  });
  res.status(201).json({ id: result.lastInsertRowid });
});

app.listen(PORT, () => {
  console.log(`[nexus7-server] listening on :${PORT}, db=${DB_PATH}`);
});
