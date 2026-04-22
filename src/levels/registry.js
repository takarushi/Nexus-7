// src/levels/registry.js
// Open/Closed: add a new level by writing a file and pushing it here.
// buildGameRun walks the registry in order, threading each level's carry
// output into the next level's build().

import { level1 } from "./level1";
import { level2 } from "./level2";
import { level3 } from "./level3";
import { level4 } from "./level4";
import { level5 } from "./level5";
import { level6 } from "./level6";
import { makeRng } from "./rng";

export const LEVELS = [level1, level2, level3, level4, level5, level6];

export const MAX_LIVES = 3;
export const ERRORS_PER_TRAP = 3;

/**
 * Build a complete run: an array of scenarios (one per level) with carry
 * threaded through so later levels reference earlier answers.
 * @param {number} [seed]  Optional seed for reproducible runs.
 */
export function buildGameRun(seed) {
  const rng = makeRng(seed ?? Date.now());
  const scenarios = [];
  let carry = null;
  for (const lvl of LEVELS) {
    const { scenario, carryOut } = lvl.build(carry, rng);
    scenarios.push(scenario);
    carry = carryOut;
  }
  return { scenarios, finalCarry: carry };
}
