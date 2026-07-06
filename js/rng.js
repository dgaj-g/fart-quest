// FART QUEST — js/rng.js (CORE agent)
// Deterministic PRNG utilities. Pure functions, no dependencies, node-testable.

/**
 * mulberry32(seed) -> rng fn
 * rng() returns a float in [0, 1).
 * Seed should be a 32-bit unsigned integer (any number is coerced with >>> 0).
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * rngInt(rng, min, max) -> integer in [min, max] inclusive.
 */
export function rngInt(rng, min, max) {
  if (max < min) [min, max] = [max, min];
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * pick(rng, arr) -> a random element of arr.
 */
export function pick(rng, arr) {
  if (!arr || arr.length === 0) return undefined;
  return arr[rngInt(rng, 0, arr.length - 1)];
}

/**
 * shuffle(rng, arr) -> NEW array, Fisher-Yates shuffled. Does not mutate arr.
 */
export function shuffle(rng, arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rngInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
