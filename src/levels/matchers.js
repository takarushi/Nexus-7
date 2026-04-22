// src/levels/matchers.js
// Strategy-pattern matchers used by scenarios to decide correctness.
// A matcher is an EvaluateFn: (results) => boolean.

/**
 * Match if the set of `_id` values in results equals `expectedIds` (order-insensitive).
 */
export function matchByIds(expectedIds) {
  const expected = [...expectedIds].map(String).sort();
  return (results) => {
    const got = results.map((r) => String(r._id)).sort();
    if (got.length !== expected.length) return false;
    return got.every((v, i) => v === expected[i]);
  };
}

/**
 * Match an aggregation result where the group keys (result._id) must exactly
 * equal `expectedGroups` (order-insensitive).
 */
export function matchAggregationGroups(expectedGroups) {
  const expected = [...expectedGroups].map(String).sort();
  return (results) => {
    const got = results.map((r) => String(r._id)).sort();
    if (got.length !== expected.length) return false;
    return got.every((v, i) => v === expected[i]);
  };
}

/**
 * Compose matchers with AND.
 */
export function allOf(...matchers) {
  return (results) => matchers.every((m) => m(results));
}
