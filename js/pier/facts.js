// FART QUEST — js/pier/facts.js (ENGINE agent)
// WHIFF-END PIER fact engine: mixed 1-10 (+11/12 Deluxe) times-tables draws,
// weak-fact ("Gas Gremlin") tracking, plausible distractors, personal bests
// and Nana Windbreaker's benchmark tiers. Pure logic + ctx.db persistence —
// no DOM, no node-only imports, safe to `node --check` and unit-test cold.
//
// Everyone else in the Pier build codes against docs/PIER_SPEC.md §5 — the
// exported function names/signatures below are frozen to that spec. A couple
// of small ADDITIVE extras (deluxeOn/setDeluxe) exist purely so the HUB has
// somewhere to keep the Deluxe lever; see the note above their definitions.
//
// Fact family key: canonical "AxB" with A <= B (e.g. 6x7 covers 6x7, 42/7, 42/6).

import { shuffle } from '../rng.js';

/* ---------- module state (populated by load(), mutated by record()/putBest()) ---------- */
const HISTORY_CAP = 20; // per-family rolling window of {correct, ms} results — generous
// enough that "last 5" and "last 4 correct times" almost always have data to work with,
// without the array growing without bound over a long play history.

const state = {
  families: {},      // { [family]: { history:[{correct,ms}], streak, misses, isGremlin } }
  bests: {},          // { [modeId]: {...} } — meta 'pierBests'
  deluxeOn: false,    // meta 'pierDeluxe'
  flushedCount: 0,    // meta 'pierFlushed' — lifetime flush counter
  lastFamily: null,   // session-scoped: never draw the same family twice running
  drawTotals: { total: 0, gremlin: 0 }, // session-scoped gremlin-draw ratio cap tracking
};

let ctx = null; // stashed by load(); used for background persistence writes

/* ---------- Nana's benchmark tiers (§7, fixed v1 values) ---------- */
const TIERS = {
  splat: { bronze: 12, silver: 20, gold: 30 },
  gunge: { bronze: 45, silver: 90, gold: 150 },
  ghost: { bronze: 100000, silver: 75000, gold: 55000 },
};

/* ---------- tiny pure helpers ---------- */
function canonicalFamily(a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return `${lo}x${hi}`;
}

function parseFamily(family) {
  const parts = String(family).split('x');
  const a = parseInt(parts[0], 10);
  const b = parseInt(parts[1], 10);
  return [a, b];
}

// Lightweight, dependency-free display label ("6 × 7") for a family. The FUN
// gremlin character name ("Trevor the Fifty-Sixer" etc, §9) lives in
// js/pier/content.js, owned by the CONTENT agent — facts.js deliberately does
// NOT import content.js (see final report: keeps the engine import-light and
// independently self-testable in node). Modes that want the flavour name
// should look it up from content.js's family map using this same `family` key.
function displayName(family) {
  const [a, b] = parseFamily(family);
  return `${a} × ${b}`;
}

function median(nums) {
  const sorted = nums.slice().sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function digitSwap(n) {
  const s = String(n);
  if (s.length < 2) return null;
  const reversed = parseInt(s.split('').reverse().join(''), 10);
  if (!Number.isFinite(reversed) || reversed === n) return null;
  return reversed;
}

/* ---------- fact pools (built once; a<=b pairs) ---------- */
function buildPool(maxOperand) {
  const pairs = [];
  for (let a = 1; a <= maxOperand; a += 1) {
    for (let b = a; b <= maxOperand; b += 1) {
      pairs.push([a, b]);
    }
  }
  return pairs;
}
const POOL_CORE = buildPool(10);  // 55 families, a,b in 1..10
const POOL_ALL = buildPool(12);   // 78 families, a,b in 1..12 (Deluxe adds these 23 extra)

/* ---------- gremlin bookkeeping ---------- */
function ensureFamily(family) {
  if (!state.families[family]) {
    state.families[family] = { history: [], streak: 0, misses: 0, isGremlin: false };
  }
  return state.families[family];
}

function computeGremlin(fam) {
  const last5 = fam.history.slice(-5);
  const missCount = last5.filter((e) => !e.correct).length;
  if (missCount >= 2) return true;
  const correctTimes = fam.history
    .filter((e) => e.correct && typeof e.ms === 'number')
    .map((e) => e.ms);
  const last4 = correctTimes.slice(-4);
  if (last4.length === 4 && median(last4) > 6000) return true;
  return false;
}

function isGremlinPair([a, b]) {
  const family = canonicalFamily(a, b);
  const fam = state.families[family];
  return !!(fam && fam.isGremlin);
}

/* ---------- weighted draw core (shared by draw() and drawFrom()) ---------- */
function weightedPick(rng, items, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function buildFact(rng, p, q) {
  // p <= q, the family's canonical factor pair.
  const family = canonicalFamily(p, q);
  const dir = rng() < 0.6 ? 'mul' : 'div';
  if (dir === 'mul') {
    const [a, b] = rng() < 0.5 ? [p, q] : [q, p];
    return { a, b, dir, stem: `${a} × ${b} = ?`, answer: a * b, family };
  }
  // division: pick which factor is shown as the divisor, the other is the answer.
  const divisorIsP = rng() < 0.5;
  const divisor = divisorIsP ? p : q;
  const quotient = divisorIsP ? q : p;
  const dividend = p * q;
  return {
    a: divisor, b: quotient, dir, stem: `${dividend} ÷ ${divisor} = ?`, answer: quotient, family,
  };
}

function drawFromPool(rng, pairs, opts = {}) {
  // §5's <=40% gremlin-draw cap is specified under facts.draw()'s mixed-pool
  // weighting — it has no sensible meaning for drawFrom()'s Tank rounds,
  // which are BY CONSTRUCTION restricted to (near-)100% gremlin families on
  // purpose. Sharing the running ratio across both would let a single Tank
  // round inflate state.drawTotals enough to suppress gremlin-weighted picks
  // in draw() for a long stretch of subsequent splat/gunge/ghost/teacups
  // play — so only draw() reads/updates the cap counters; drawFrom() opts out.
  const trackCap = opts.trackCap !== false;

  let candidates = pairs.filter(([a, b]) => canonicalFamily(a, b) !== state.lastFamily);
  if (candidates.length === 0) candidates = pairs.slice(); // only one family available — allow repeat

  // Gremlin-draw ratio cap (<=40% of draws, §5): if drawing a gremlin family
  // NOW would push the running ratio over 0.4, exclude gremlins from this
  // particular draw — unless that would leave nothing to draw from.
  let pool = candidates;
  if (trackCap) {
    const predictedRatioIfGremlin = (state.drawTotals.gremlin + 1) / (state.drawTotals.total + 1);
    if (predictedRatioIfGremlin > 0.4) {
      const nonGremlin = candidates.filter((p) => !isGremlinPair(p));
      if (nonGremlin.length > 0) pool = nonGremlin;
    }
  }

  const weights = pool.map((p) => (isGremlinPair(p) ? 3 : 1));
  const picked = weightedPick(rng, pool, weights);
  const family = canonicalFamily(picked[0], picked[1]);

  state.lastFamily = family;
  if (trackCap) {
    state.drawTotals.total += 1;
    if (isGremlinPair(picked)) state.drawTotals.gremlin += 1;
  }

  return buildFact(rng, picked[0], picked[1]);
}

/* ---------- distractor slip generation ---------- */
function slipPool(fact) {
  const { a, b, answer } = fact;
  const raw = new Set([
    answer - a, answer + a,       // neighbouring table: shift one factor by 1 (±a)
    answer - b, answer + b,       // neighbouring table: shift the other factor by 1 (±b)
    answer - 1, answer + 1,       // off-by-one slip
    a + b,                        // classic + / x mix-up
    a, b,                         // wrote down a factor/divisor instead of the answer
  ]);
  const ds = digitSwap(answer);
  if (ds != null) raw.add(ds);
  return [...raw].filter((v) => v >= 1 && v !== answer);
}

/* =====================================================================
 * PUBLIC API — docs/PIER_SPEC.md §5 (frozen signatures)
 * ===================================================================== */

/** await facts.load(ctx) — reads meta keys; call once per pier session (hub mount). */
export async function load(appCtx) {
  ctx = appCtx;
  const [rawFacts, rawBests, rawDeluxe, rawFlushed] = await Promise.all([
    ctx.db.get('meta', 'pierFacts'),
    ctx.db.get('meta', 'pierBests'),
    ctx.db.get('meta', 'pierDeluxe'),
    ctx.db.get('meta', 'pierFlushed'),
  ]);
  state.families = (rawFacts && rawFacts.families) ? rawFacts.families : {};
  state.bests = rawBests || {};
  state.deluxeOn = !!rawDeluxe;
  state.flushedCount = typeof rawFlushed === 'number' ? rawFlushed : 0;
  state.lastFamily = null;
  state.drawTotals = { total: 0, gremlin: 0 };
}

/**
 * facts.draw(rng, {deluxe}) -> {a,b,dir,stem,answer,family}
 * Gremlin-weighted (3x), capped <=40% of draws, never the same family twice running.
 */
export function draw(rng, opts = {}) {
  const pool = opts.deluxe ? POOL_ALL : POOL_CORE;
  return drawFromPool(rng, pool, { trackCap: true });
}

/** facts.drawFrom(rng, families) — draw restricted to a given family list (Tank mode). */
export function drawFrom(rng, families) {
  const pairs = (families || []).map(parseFamily).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  if (pairs.length === 0) return null;
  // Tank's targeted rounds don't participate in draw()'s <=40% cap bookkeeping
  // (see the comment in drawFromPool) — they're a deliberately gremlin-only
  // pool, not part of the mixed-draw ratio that cap is protecting.
  return drawFromPool(rng, pairs, { trackCap: false });
}

/** facts.distractors(fact, rng, n) — n unique plausible wrong answers, never the real answer, all >=1. */
export function distractors(fact, rng, n) {
  const shuffled = shuffle(rng, slipPool(fact));
  const used = new Set([fact.answer]);
  const out = [];
  for (const v of shuffled) {
    if (out.length >= n) break;
    if (v >= 1 && !used.has(v)) { out.push(v); used.add(v); }
  }
  // Backfill (rare — only when the fact is very small, e.g. 1x1) so distractors()
  // always returns exactly n plausible-looking, unique, positive wrong answers.
  let delta = 1;
  while (out.length < n && delta < 1000) {
    for (const c of [fact.answer + delta, fact.answer - delta]) {
      if (out.length >= n) break;
      if (c >= 1 && !used.has(c)) { out.push(c); used.add(c); }
    }
    delta += 1;
  }
  return out;
}

/** facts.record(family, {correct, ms, mode}) — updates stats + gremlin/flush state + persists. */
export function record(family, opts = {}) {
  const correct = !!opts.correct;
  const ms = typeof opts.ms === 'number' ? opts.ms : null;
  const fam = ensureFamily(family);

  fam.history.push({ correct, ms });
  if (fam.history.length > HISTORY_CAP) fam.history.shift();

  if (correct) {
    fam.streak += 1;
  } else {
    fam.streak = 0;
    fam.misses += 1;
  }

  const wasGremlin = fam.isGremlin;
  let justFlushed = false;

  // Flush rule (§5): 3 consecutive correct results for a family that WAS a
  // gremlin clears it, regardless of direction/mode/session (fam.streak is
  // itself persisted across sessions, so "any session" falls out for free).
  if (wasGremlin && fam.streak >= 3) {
    fam.isGremlin = false;
    justFlushed = true;
    state.flushedCount += 1;
    persistFlushed();
  } else {
    const isNowGremlin = computeGremlin(fam);
    // Anchor fam.streak to the MOMENT a family becomes a gremlin. Without
    // this, the slow-response-time route into gremlin status (4 CORRECT but
    // slow answers) leaves fam.streak already at 3+ the instant isGremlin
    // flips true, so a single further correct answer would satisfy the
    // ">=3" check above and flush it straight back out — despite the family
    // never having demonstrated 3 fresh correct answers since it was flagged
    // weak. (The miss-count route is unaffected: missCount can only ever
    // reach its threshold on a record that is itself a miss, which already
    // resets fam.streak to 0 — see final report for the proof — so this is
    // a no-op there and only changes behaviour for the slow-response route.)
    if (!wasGremlin && isNowGremlin) fam.streak = 0;
    fam.isGremlin = isNowGremlin;
  }

  persistFacts();

  if (justFlushed) {
    return { justFlushed: true, name: displayName(family), family };
  }
  return { justFlushed: false };
}

/** facts.gremlins() -> current gremlins, worst (most lifetime misses) first. */
export function gremlins() {
  const out = [];
  Object.keys(state.families).forEach((family) => {
    const fam = state.families[family];
    if (!fam.isGremlin) return;
    const [a, b] = parseFamily(family);
    out.push({
      family, a, b, name: displayName(family), misses: fam.misses, streak: fam.streak,
    });
  });
  out.sort((x, y) => (y.misses - x.misses) || (x.streak - y.streak) || x.family.localeCompare(y.family));
  return out;
}

/** facts.isGremlin(family) -> bool */
export function isGremlin(family) {
  const fam = state.families[family];
  return !!(fam && fam.isGremlin);
}

/** facts.flushed() -> lifetime count of flushed gremlins */
export function flushed() {
  return state.flushedCount;
}

/** facts.tableFacts(n, {division}) -> ordered n x1..n x10 facts (or their division inverses) for Teacups. */
export function tableFacts(n, opts = {}) {
  const division = !!opts.division;
  const out = [];
  for (let k = 1; k <= 10; k += 1) {
    const family = canonicalFamily(n, k);
    if (!division) {
      out.push({ a: n, b: k, dir: 'mul', stem: `${n} × ${k} = ?`, answer: n * k, family });
    } else {
      const dividend = n * k;
      out.push({
        a: k, b: n, dir: 'div', stem: `${dividend} ÷ ${k} = ?`, answer: n, family,
      });
    }
  }
  return out;
}

/** await facts.getBests() -> {splat:{...}, gunge:{...}, ghost:{...}} (meta 'pierBests') */
export async function getBests() {
  return { ...state.bests };
}

/** await facts.putBest(modeId, best) — merges `best` into that mode's stored PB and persists. */
export async function putBest(modeId, best) {
  state.bests[modeId] = { ...(state.bests[modeId] || {}), ...best };
  await persistBests();
  return { ...state.bests[modeId] };
}

/** facts.nanaTiers(modeId) -> {bronze, silver, gold} (§7), or null for teacups/tank (no tiers). */
export function nanaTiers(modeId) {
  return TIERS[modeId] ? { ...TIERS[modeId] } : null;
}

/* ---------- ADDITIVE extras (not in the frozen §5 list) ----------
 * §5's persistence note lists `pierDeluxe` as a meta key facts.js owns, and §8
 * says the hub renders "the DELUXE brass lever" — but no getter/setter for it
 * is in the frozen API. Rather than have the HUB reach into ctx.db directly
 * for a key that's otherwise entirely facts.js's business, two small
 * additive functions are exposed here. They don't change any frozen
 * signature, so nothing downstream that only calls the §5 list is affected.
 */
export function deluxeOn() {
  return !!state.deluxeOn;
}

export async function setDeluxe(on) {
  state.deluxeOn = !!on;
  if (ctx) await ctx.db.put('meta', 'pierDeluxe', state.deluxeOn).catch(() => {});
  return state.deluxeOn;
}

/* ---------- background persistence (fire-and-forget; never throws) ---------- */
function persistFacts() {
  if (!ctx) return;
  ctx.db.put('meta', 'pierFacts', { families: state.families }).catch(() => {});
}
function persistFlushed() {
  if (!ctx) return;
  ctx.db.put('meta', 'pierFlushed', state.flushedCount).catch(() => {});
}
function persistBests() {
  if (!ctx) return Promise.resolve();
  return ctx.db.put('meta', 'pierBests', state.bests).catch(() => {});
}

export default {
  load, draw, drawFrom, distractors, record, gremlins, isGremlin, flushed,
  tableFacts, getBests, putBest, nanaTiers, deluxeOn, setDeluxe,
};
