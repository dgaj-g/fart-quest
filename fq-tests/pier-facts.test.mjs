// FART QUEST — fq-tests/pier-facts.test.mjs (ENGINE agent)
// Node self-test for js/pier/facts.js against docs/PIER_SPEC.md §5.
// Run with: node fq-tests/pier-facts.test.mjs
//
// Mocks the ctx.db surface ({get(store,key), put(store,key,val)}) with a
// plain in-memory object — facts.js never touches indexedDB directly, so a
// fake promise-returning store is all it needs. Each test SECTION below gets
// its own fresh fake db/ctx so gremlin/bests state from one section can never
// leak into another's assertions — the module itself is a singleton (module
// state), so isolation comes from calling facts.load(ctx) with a brand new
// empty store at the top of each section.

import { mulberry32 } from '../js/rng.js';
import facts from '../js/pier/facts.js';

let pass = 0;
let fail = 0;

function ok(cond, label) {
  if (cond) { pass += 1; console.log(`PASS  ${label}`); }
  else { fail += 1; console.log(`FAIL  ${label}`); }
}
function eq(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { pass += 1; console.log(`PASS  ${label}`); }
  else { fail += 1; console.log(`FAIL  ${label}\n      expected ${e}\n      actual   ${a}`); }
}

function makeFakeDb() {
  const store = { meta: {} };
  return {
    async get(name, key) { return store[name] ? store[name][key] : undefined; },
    async put(name, key, val) {
      if (!store[name]) store[name] = {};
      store[name][key] = val;
    },
    _store: store,
  };
}

function parseStem(stem) {
  let m = /^(\d+) × (\d+) = \?$/.exec(stem);
  if (m) return { kind: 'mul', x: Number(m[1]), y: Number(m[2]) };
  m = /^(\d+) ÷ (\d+) = \?$/.exec(stem);
  if (m) return { kind: 'div', dividend: Number(m[1]), divisor: Number(m[2]) };
  return null;
}

async function run() {
  /* =====================================================================
   * SECTION A — 2000-draw correctness sweep (deluxe off), direction mix,
   * no-consecutive-repeat, deluxe-on operand check, distractors.
   * ===================================================================== */
  {
    const ctx = { db: makeFakeDb() };
    await facts.load(ctx);

    const rng = mulberry32(12345);
    const draws = [];
    for (let i = 0; i < 2000; i += 1) draws.push(facts.draw(rng, { deluxe: false }));

    let allAnswersCorrect = true;
    let allWithinCore = true;
    draws.forEach((f) => {
      const [famA, famB] = f.family.split('x').map(Number);
      const parsed = parseStem(f.stem);
      if (!parsed) { allAnswersCorrect = false; return; }
      if (f.dir === 'mul') {
        const isPermutation = (parsed.x === famA && parsed.y === famB) || (parsed.x === famB && parsed.y === famA);
        if (!isPermutation) allAnswersCorrect = false;
        if (f.answer !== parsed.x * parsed.y || f.answer !== f.a * f.b) allAnswersCorrect = false;
      } else {
        const product = famA * famB;
        if (parsed.dividend !== product) allAnswersCorrect = false;
        if (parsed.dividend / parsed.divisor !== f.answer) allAnswersCorrect = false;
        if (f.answer !== f.b || f.a !== parsed.divisor) allAnswersCorrect = false;
        if (!Number.isInteger(f.answer)) allAnswersCorrect = false;
      }
      if (f.a > 10 || f.b > 10 || famA > 10 || famB > 10) allWithinCore = false;
    });
    ok(allAnswersCorrect, '2000 draws: every answer independently recomputed and correct');
    ok(allWithinCore, 'deluxe-off draws never yield 11/12');

    const mulFrac = draws.filter((f) => f.dir === 'mul').length / draws.length;
    ok(mulFrac >= 0.5 && mulFrac <= 0.7, `direction mix within 50-70% mul (got ${(mulFrac * 100).toFixed(1)}%)`);

    let anyConsecutiveRepeat = false;
    for (let i = 1; i < draws.length; i += 1) {
      if (draws[i].family === draws[i - 1].family) anyConsecutiveRepeat = true;
    }
    ok(!anyConsecutiveRepeat, 'no consecutive same-family draws across 2000 draws');

    // Deluxe on: 11/12 operands do appear.
    await facts.load(ctx);
    const rngD = mulberry32(999);
    let sawDeluxeOperand = false;
    for (let i = 0; i < 500; i += 1) {
      const f = facts.draw(rngD, { deluxe: true });
      if (f.a > 10 || f.b > 10) sawDeluxeOperand = true;
    }
    ok(sawDeluxeOperand, 'deluxe-on draws do include 11/12 operands');

    // Distractors, sampled across many facts incl. small ones like 1x1.
    await facts.load(ctx);
    const rngDist = mulberry32(42);
    let distractorsOk = true;
    for (let i = 0; i < 500; i += 1) {
      const f = facts.draw(rngDist, { deluxe: false });
      const ds = facts.distractors(f, rngDist, 3);
      if (ds.length !== 3 || new Set(ds).size !== 3) distractorsOk = false;
      if (ds.some((v) => v === f.answer || v < 1)) distractorsOk = false;
    }
    ok(distractorsOk, '500 facts: distractors(n=3) always unique, never the answer, always >=1');
  }

  /* =====================================================================
   * SECTION B — gremlin / flush state machine (scripted sequence).
   * ===================================================================== */
  {
    const ctx = { db: makeFakeDb() };
    await facts.load(ctx);
    const FAM = '6x7';

    ok(!facts.isGremlin(FAM), 'fresh family starts as not-a-gremlin');

    facts.record(FAM, { correct: true, ms: 2000, mode: 'splat' });
    facts.record(FAM, { correct: false, ms: 3000, mode: 'splat' });
    let r = facts.record(FAM, { correct: false, ms: 3000, mode: 'splat' });
    ok(facts.isGremlin(FAM), 'family becomes a gremlin after 2 misses in last 5');
    eq(r, { justFlushed: false }, 'record() returns justFlushed:false while not yet flushed');

    const gremlinList = facts.gremlins();
    const entry = gremlinList.find((g) => g.family === FAM);
    ok(!!entry, 'gremlins() lists the newly-flagged family');
    eq(entry.a, 6, 'gremlin entry a=6');
    eq(entry.b, 7, 'gremlin entry b=7');
    eq(entry.misses, 2, 'gremlin entry misses tally = 2 lifetime misses so far');
    eq(entry.streak, 0, 'gremlin entry streak = 0 right after a miss');

    // 3 consecutive correct -> flush.
    facts.record(FAM, { correct: true, ms: 1500, mode: 'tank' });
    facts.record(FAM, { correct: true, ms: 1500, mode: 'tank' });
    r = facts.record(FAM, { correct: true, ms: 1500, mode: 'tank' });
    ok(r.justFlushed === true, 'record() reports justFlushed after the 3rd consecutive correct');
    ok(typeof r.name === 'string' && r.name.length > 0, 'flush result carries a display name');
    ok(!facts.isGremlin(FAM), 'family is no longer a gremlin after flush');
    eq(facts.flushed(), 1, 'lifetime flushed counter incremented to 1');
    ok(!facts.gremlins().some((g) => g.family === FAM), 'flushed family no longer appears in gremlins()');

    // Slow-but-correct answers (median > 6000ms over last 4 correct) also triggers gremlin.
    const FAM2 = '3x4';
    facts.record(FAM2, { correct: true, ms: 7000, mode: 'ghost' });
    facts.record(FAM2, { correct: true, ms: 7200, mode: 'ghost' });
    facts.record(FAM2, { correct: true, ms: 6800, mode: 'ghost' });
    const beforeSlow = facts.isGremlin(FAM2);
    facts.record(FAM2, { correct: true, ms: 7100, mode: 'ghost' });
    ok(!beforeSlow && facts.isGremlin(FAM2), 'family becomes a gremlin once median of last 4 correct times exceeds 6000ms');

    // Persistence: everything above should already be reflected in the fake db
    // (facts.js persists fire-and-forget, but the mock's put() body runs
    // synchronously, so no extra tick is needed).
    ok(!!ctx.db._store.meta.pierFacts && !!ctx.db._store.meta.pierFacts.families[FAM], 'record() persists into ctx.db meta pierFacts');
    eq(ctx.db._store.meta.pierFlushed, 1, 'pierFlushed persisted after the flush');
  }

  /* =====================================================================
   * SECTION C — gremlin-weighted draws + the <=40% cap.
   * ===================================================================== */
  {
    const ctx = { db: makeFakeDb() };
    await facts.load(ctx);
    const gremlinFamilies = ['1x2', '2x3', '3x5', '4x9', '5x8'];
    gremlinFamilies.forEach((fam) => {
      facts.record(fam, { correct: false, ms: 4000 });
      facts.record(fam, { correct: false, ms: 4000 });
    });
    ok(gremlinFamilies.every((f) => facts.isGremlin(f)), 'scripted families are all gremlins going into the cap test');

    const rngCap = mulberry32(7);
    let gremlinDraws = 0;
    const capTotal = 3000;
    for (let i = 0; i < capTotal; i += 1) {
      const f = facts.draw(rngCap, { deluxe: false });
      if (facts.isGremlin(f.family)) gremlinDraws += 1;
    }
    const gremlinFrac = gremlinDraws / capTotal;
    const baselineShare = (gremlinFamilies.length / 55) * 100;
    ok(gremlinFrac <= 0.42, `gremlin-family draws stay capped near <=40% of draws (got ${(gremlinFrac * 100).toFixed(1)}%)`);
    ok(gremlinFrac * 100 > baselineShare, `gremlin families ARE over-weighted vs their ${baselineShare.toFixed(1)}% share of the pool (got ${(gremlinFrac * 100).toFixed(1)}%)`);
  }

  /* =====================================================================
   * SECTION D — drawFrom (Tank targeted rounds).
   * ===================================================================== */
  {
    const ctx = { db: makeFakeDb() };
    await facts.load(ctx);
    const rngTank = mulberry32(55);
    const targetFamilies = ['2x9', '4x6'];
    let drawFromOk = true;
    const seen = new Set();
    for (let i = 0; i < 40; i += 1) {
      const f = facts.drawFrom(rngTank, targetFamilies);
      seen.add(f.family);
      if (!targetFamilies.includes(f.family)) drawFromOk = false;
    }
    ok(drawFromOk, 'drawFrom() only ever returns facts from the given family list');
    ok(seen.size === 2, 'drawFrom() draws from every family in a small target list over enough draws');
    eq(facts.drawFrom(rngTank, []), null, 'drawFrom() with an empty family list returns null rather than throwing');
  }

  /* =====================================================================
   * SECTION E — tableFacts.
   * ===================================================================== */
  {
    const ctx = { db: makeFakeDb() };
    await facts.load(ctx);

    const mulTable = facts.tableFacts(6, { division: false });
    eq(mulTable.length, 10, 'tableFacts(6) returns 10 facts');
    eq(mulTable[0], { a: 6, b: 1, dir: 'mul', stem: '6 × 1 = ?', answer: 6, family: '1x6' }, 'tableFacts(6) k=1 fact shape');
    eq(mulTable[9], { a: 6, b: 10, dir: 'mul', stem: '6 × 10 = ?', answer: 60, family: '6x10' }, 'tableFacts(6) k=10 fact shape');

    const divTable = facts.tableFacts(6, { division: true });
    eq(divTable[6], { a: 7, b: 6, dir: 'div', stem: '42 ÷ 7 = ?', answer: 6, family: '6x7' }, 'tableFacts(6, division) k=7 inverse fact shape');

    const deluxeTable = facts.tableFacts(11, { division: false });
    eq(deluxeTable.length, 10, 'tableFacts(11) (deluxe table) still returns exactly 10 facts (k=1..10)');
    eq(deluxeTable[0].family, '1x11', 'tableFacts(11) k=1 family is 1x11');
  }

  /* =====================================================================
   * SECTION F — bests + nanaTiers.
   * ===================================================================== */
  {
    const ctx = { db: makeFakeDb() };
    await facts.load(ctx);

    eq(await facts.getBests(), {}, 'getBests() starts empty on a fresh profile');
    await facts.putBest('splat', { score: 18, when: 111 });
    let bests = await facts.getBests();
    eq(bests.splat, { score: 18, when: 111 }, 'putBest() then getBests() round-trips');

    await facts.putBest('splat', { score: 25, when: 222, goldSeen: true });
    bests = await facts.getBests();
    eq(bests.splat, { score: 25, when: 222, goldSeen: true }, 'putBest() merges onto the existing entry (goldSeen preserved/added)');

    await facts.putBest('splat', { score: 27, when: 333 });
    bests = await facts.getBests();
    eq(bests.splat, { score: 27, when: 333, goldSeen: true }, 'putBest() merge keeps a previously-set goldSeen flag even when the new call omits it');

    ok(!!ctx.db._store.meta.pierBests && !!ctx.db._store.meta.pierBests.splat, 'putBest() persists into ctx.db meta pierBests');

    eq(facts.nanaTiers('splat'), { bronze: 12, silver: 20, gold: 30 }, 'nanaTiers(splat) matches §7');
    eq(facts.nanaTiers('gunge'), { bronze: 45, silver: 90, gold: 150 }, 'nanaTiers(gunge) matches §7');
    eq(facts.nanaTiers('ghost'), { bronze: 100000, silver: 75000, gold: 55000 }, 'nanaTiers(ghost) matches §7');
    eq(facts.nanaTiers('teacups'), null, 'nanaTiers(teacups) is null (no tiers)');
    eq(facts.nanaTiers('tank'), null, 'nanaTiers(tank) is null (no tiers)');
  }

  /* =====================================================================
   * SECTION G — the Deluxe lever additive extras + reload persistence.
   * ===================================================================== */
  {
    const ctx = { db: makeFakeDb() };
    await facts.load(ctx);

    eq(facts.deluxeOn(), false, 'deluxeOn() defaults to false');
    await facts.setDeluxe(true);
    eq(facts.deluxeOn(), true, 'setDeluxe(true) flips deluxeOn()');
    eq(ctx.db._store.meta.pierDeluxe, true, 'setDeluxe(true) persists pierDeluxe');

    // A completely fresh load() (simulating an app restart) should pick the
    // persisted deluxe flag back up from the same underlying store.
    await facts.load(ctx);
    eq(facts.deluxeOn(), true, 'load() reloads a previously-persisted deluxe flag');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

run().catch((err) => {
  console.error('TEST HARNESS THREW:', err);
  process.exit(1);
});
