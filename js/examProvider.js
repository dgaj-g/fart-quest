// FART QUEST — js/examProvider.js (INTEGRATOR, docs/INTEGRATION_NOTES.md item 3)
//
// Real ctx.examProvider: maps a Castle Clench slotSpec -> a real Question, drawing
// from the same content the rest of the game uses (maths generators, English drill
// banks, storybog passages) rather than a placeholder (this file falls back to its
// own inline stub defensively — never crash, never leave a slot blank).
//
// Contract (js/screens/exam.js): { getQuestion(slotSpec) -> Question }
//   slotSpec = { subject: 'english'|'maths', format, topicPool }
//   topicPool is either a region id (english drill blocks: 'punctuation-pits',
//   'grammar-grotto', 'spelling-sewers'), 'storybog' (the reading block, drawn from
//   data/passages), or 'maths-mixed' (drawn from every maths-track generator topic).
//
// Difficulty mix (INTEGRATION_NOTES.md item 3): t2-heavy with a t3 tail. The Q51-56
// write-in maths block is explicitly called out as tier 3 — everything else is mostly
// tier 2 with a genuine (not purely cosmetic) slice of tier 3 mixed through, via a
// weighted rng roll. Passage-derived reading questions keep their own authored tier
// (passages aren't stratified by tier — ENGINE_SPEC_2 §B/§D) so this mix only applies
// to generator/bank draws.
//
// Fix (IMPORTANT, boot coupling): this file used to statically import
// createStubProvider from js/screens/exam.js. js/main.js loads screens/exam.js
// defensively via a dynamic loadOptionalScreen() specifically so a broken/missing
// exam.js degrades to a friendly redirect instead of a fatal boot error — but
// main.js's own top-level import of THIS file (createExamProvider) is static, so a
// static import chain down to screens/exam.js here would crash the whole app boot
// on any fatal error in that file, bypassing main.js's defensive loading entirely.
// The fallback below is a small inline stub so this module has zero static coupling
// to screens/exam.js.

import { REGIONS } from '../data/map.js';
import { TOPICS } from '../data/topics/index.js';
import { generate } from './gen/index.js';
import PASSAGES from '../data/passages/index.js';
import { mulberry32, pick } from './rng.js';

// Minimal inline fallback — deliberately NOT imported from screens/exam.js (see note
// above). Only ever reached if a real content draw fails after retries; well-formed
// per format so exam.js's renderer never trips on a missing field, but obviously
// placeholder so it's never mistaken for real content in QA/playtest.
function createInlineFallbackProvider() {
  let counter = 0;
  return {
    getQuestion(slotSpec) {
      counter += 1;
      const { subject, format, topicPool } = slotSpec || {};
      const base = {
        id: `fallback-${topicPool || 'unknown'}-${format || 'unknown'}-${counter}`,
        topicId: topicPool || 'unknown',
        tier: 2,
        format,
        explain: { rule: 'Placeholder rule text.', worked: 'Placeholder worked example.', whyWrong: {} },
        hintSteps: ['Placeholder hint one.', 'Placeholder hint two.'],
      };
      if (format === 'num') {
        return { ...base, stem: `Placeholder ${subject || ''} write-in question ${counter}.`, accept: ['42'] };
      }
      if (format === 'wordentry') {
        return { ...base, stem: `Placeholder ${subject || ''} word-entry question ${counter}.`, accept: ['answer'] };
      }
      if (format === 'errorspot') {
        return {
          ...base,
          stem: 'Placeholder errorspot question.',
          text: 'This are a placeholder sentence with a error in it.',
          errorIndex: 0,
          correction: 'This is',
        };
      }
      // default: mcq5
      return {
        ...base,
        stem: `Placeholder ${subject || ''} question ${counter}. What is 2 + 2?`,
        options: [{ text: '3' }, { text: '4' }, { text: '5' }, { text: '22' }],
        correctIndex: 1,
      };
    },
  };
}

const MATHS_REGION_IDS = new Set(REGIONS.filter((r) => r.track === 'maths').map((r) => r.id));

function mathsGenTopics() {
  return Object.values(TOPICS).filter((t) => t.genId && MATHS_REGION_IDS.has(t.region));
}

function englishBankTopicsInRegion(regionId) {
  return Object.values(TOPICS).filter((t) => t.region === regionId && Array.isArray(t.bank));
}

// t2-heavy, t3-tail mix. Maths write-in (num) is always t3 per INTEGRATION_NOTES item 3;
// everything else generator/bank-drawn rolls mostly-t2 with a genuine t3 slice.
function pickTier(subject, format, rng) {
  if (subject === 'maths' && format === 'num') return 3;
  return rng() < 0.72 ? 2 : 3;
}

function bankItemsFor(topics, format, tier) {
  const exactTier = [];
  const anyTier = [];
  for (const t of topics) {
    for (const item of t.bank) {
      if (item.format !== format) continue;
      const entry = { item, topicId: item.topicId || t.id };
      anyTier.push(entry);
      if (item.tier === tier) exactTier.push(entry);
    }
  }
  return exactTier.length > 0 ? exactTier : anyTier;
}

/**
 * createExamProvider() -> { getQuestion(slotSpec) }
 * Fresh instance per call so repeated app sessions (or tests) don't share draw state;
 * js/main.js constructs exactly one and hangs it off ctx for the app's lifetime.
 */
export function createExamProvider(seed) {
  const rng = mulberry32((seed >>> 0) || (Date.now() >>> 0));
  const fallback = createInlineFallbackProvider();
  const mathsTopics = mathsGenTopics();

  // Storybog reading-block state: mcq5 and wordentry are tracked as two INDEPENDENT
  // per-format queues (each with its own "current passage"), not one shared passage.
  // Fix (CRITICAL, cross-attempt desync): a single shared passageState that only rotates
  // once BOTH queues are empty breaks the moment a caller's draw pattern doesn't consume
  // a whole passage's mcq5 and wordentry items in lockstep (e.g. Training Skirmish draws
  // 4 mcq5 + 3 wordentry per attempt from a passage that has 7 mcq5 + 6 wordentry) — the
  // exhausted format's queue starves while the other format's leftovers block the rotate,
  // so nextStorybogQuestion() returns null and a real exam slot falls back to the stub
  // placeholder question. Independent per-format queues can never starve like that: each
  // format simply draws a fresh passage's items for itself whenever its own queue is dry.
  let mcqState = null; // { passage, queue }
  let wordState = null;

  function ensureQueue(format) {
    const isWord = format === 'wordentry';
    let state = isWord ? wordState : mcqState;
    if (state && state.queue.length > 0) return state;
    // Bounded retry: skip any passage that happens to have zero items of this format
    // (none do today, but don't infinite-loop if that ever changes).
    for (let attempt = 0; attempt < 12; attempt++) {
      const p = pick(rng, PASSAGES);
      if (!p) return null;
      const queue = (p.questions || []).filter((q) => q.format === format);
      if (queue.length === 0) continue;
      state = { passage: p, queue };
      if (isWord) wordState = state; else mcqState = state;
      return state;
    }
    return null;
  }

  function nextStorybogQuestion(format) {
    const state = ensureQueue(format);
    if (!state) return null;
    const item = state.queue.shift();
    if (!item) return null;
    return {
      ...item,
      topicId: item.topicId || 'storybog',
      passage: { id: state.passage.id, title: state.passage.title, lines: state.passage.lines },
    };
  }

  function nextMathsQuestion(format) {
    if (mathsTopics.length === 0) return null;
    for (let attempt = 0; attempt < 24; attempt++) {
      const topic = pick(rng, mathsTopics);
      const tier = pickTier('maths', format, rng);
      const q = generate(topic.genId, tier, rng);
      if (q && q.format === format) return q;
    }
    return null; // no generator produced the needed format after 24 tries — fall back
  }

  function nextEnglishBankQuestion(regionId, format) {
    const topics = englishBankTopicsInRegion(regionId);
    if (topics.length === 0) return null;
    const tier = pickTier('english', format, rng);
    const pool = bankItemsFor(topics, format, tier);
    if (pool.length === 0) return null;
    const chosen = pick(rng, pool);
    return { ...chosen.item, topicId: chosen.topicId };
  }

  function getQuestion(slotSpec) {
    const { subject, format, topicPool } = slotSpec || {};
    let q = null;
    try {
      if (topicPool === 'storybog') {
        q = nextStorybogQuestion(format);
      } else if (subject === 'maths' && topicPool === 'maths-mixed') {
        q = nextMathsQuestion(format);
      } else if (subject === 'english') {
        q = nextEnglishBankQuestion(topicPool, format);
      }
    } catch (e) {
      q = null; // never let a content-shape surprise crash Castle Clench — fall back
    }
    return q || fallback.getQuestion(slotSpec);
  }

  return { getQuestion };
}

export default { createExamProvider };
