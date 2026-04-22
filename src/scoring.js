// src/scoring.js
// Scoring is independent of lives. It rewards speed + accuracy and penalizes
// errors, hints and trap hits. A single function applies the rules; state
// stays in App.jsx.

export const SCORING = {
  base: 1000,            // awarded per level solved
  speedBonusMax: 500,    // added for solving quickly
  speedIdealMs: 20_000,  // solve under this per level → full bonus
  speedDeadlineMs: 120_000, // beyond this → no bonus
  errorPenalty: 75,      // per wrong query
  hintPenalty: 50,       // per hint revealed
  trapPenalty: 300,      // per trap triggered (life lost)
};

/**
 * Bonus for solving quickly. Linear from full bonus (under speedIdealMs)
 * down to 0 (at or beyond speedDeadlineMs).
 */
export function speedBonus(elapsedMs) {
  const { speedBonusMax, speedIdealMs, speedDeadlineMs } = SCORING;
  if (elapsedMs <= speedIdealMs) return speedBonusMax;
  if (elapsedMs >= speedDeadlineMs) return 0;
  const fraction = 1 - (elapsedMs - speedIdealMs) / (speedDeadlineMs - speedIdealMs);
  return Math.round(speedBonusMax * fraction);
}

/**
 * Award for solving a level.
 * @param {number} elapsedMs time spent on this level
 */
export function levelAward(elapsedMs) {
  return SCORING.base + speedBonus(elapsedMs);
}

export function errorPenalty() {
  return SCORING.errorPenalty;
}

export function hintPenalty() {
  return SCORING.hintPenalty;
}

export function trapPenalty() {
  return SCORING.trapPenalty;
}

/**
 * Clamp score to a sensible floor so losing with many errors doesn't
 * produce nonsensical large negatives.
 */
export function clampScore(score) {
  return Math.max(0, Math.round(score));
}
