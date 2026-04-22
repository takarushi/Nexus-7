// src/levels/types.js
// JSDoc contracts for the level system. No runtime code — pure documentation
// so editors/linters can help enforce the shape of levels, scenarios and carries.

/**
 * @typedef {Object} Carry
 * Data produced by solving a level, consumable by the next one.
 * Free-form but convention: flat fields like { employee, labId, projectCode }.
 */

/**
 * @typedef {Object} Hints
 * @property {string} hint1  Conceptual nudge.
 * @property {string} hint2  Near-spoiler with the shape of the query.
 */

/**
 * @typedef {Object} Trap
 * @property {string} name   Human-readable trap name.
 * @property {string} msg    Overlay message shown when triggered.
 * @property {string} type   Trap type id: electric | virus | emp | firewall | selfdestruct
 */

/**
 * @typedef {Object} EvaluationResult
 * @property {boolean} ok
 * @property {string}  message
 * @property {Array}   results
 */

/**
 * @callback EvaluateFn
 * @param {Array} results  Results the player's query produced.
 * @returns {boolean}      True if results match the expected answer for this scenario.
 */

/**
 * @typedef {Object} Scenario
 * A concrete, playable instance of a level. Holds the data the player sees
 * plus an evaluator that decides if a given result set is correct.
 * @property {number} id
 * @property {string} codename
 * @property {string} subtitle
 * @property {string} narrative
 * @property {string} objective
 * @property {string} collection
 * @property {Array<Object>} data
 * @property {string} [extraCollection]
 * @property {Array<Object>} [extraData]
 * @property {Hints} hints
 * @property {Trap}  trap
 * @property {string} accessCode
 * @property {EvaluateFn} evaluate
 */

/**
 * @callback BuildFn
 * @param {Carry|null} carryIn  Data carried from the previous level (or null for level 1).
 * @param {() => number} rng    Deterministic-friendly RNG (0..1).
 * @returns {{ scenario: Scenario, carryOut: Carry }}
 */

/**
 * @typedef {Object} LevelDefinition
 * Registry entry for a level. `build` picks a variant and wires carry through.
 * @property {number} id
 * @property {string} codename
 * @property {BuildFn} build
 */

/**
 * @typedef {Object} BuiltLevel
 * @property {Scenario} scenario
 * @property {Carry}    carryOut
 */

export {};
