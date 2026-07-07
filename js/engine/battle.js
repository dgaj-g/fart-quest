// FART QUEST — js/engine/battle.js (UI agent)
// Drives a battle stage: minion | elite | boss | regionboss.
// stageConfig per BUILD_SPEC §5 / ENGINE_SPEC_2 §D:
//   minion     { n:6, tiers:[1], drainPerHit: 1/6 }
//   elite      { n:8, tiers:[2,2,3], drainPerHit: 1/8 }
//   boss       { hits:8, pool mixed t2/t3, wrong = gauge refills +1 step (cap 12 questions total), flawless flag }
//   regionboss { hits:10, pool mixed t2/t3 across ALL the region's topics, wrong heals +1 step (cap 16 questions) }
//
// Two question SOURCES are supported per topic (ENGINE_SPEC_2 §D):
//   - generator-driven (`topic.genId` set, maths topics): generate() is called fresh every
//     time — infinite variety, no repeat-tracking needed.
//   - bank-driven (`topic.bank` set, English topics — drills AND storybog passage pools,
//     the latter pre-flattened into a bank shape by screens/battle.js before the engine is
//     constructed, keeping this module DOM/import-free and node-testable): sampling prefers
//     unseen-this-cycle items, never repeats the immediately-previous item, and resets the
//     cycle once the bank is exhausted (see drawBankItem below).
// A third, distinct mode covers the storybog "topic boss" (one full passage, all 13 marks,
// no retry loop, no heal, win by score threshold): the caller pre-resolves the passage's
// question array and passes it in as `fixedQuestions` — see the isFixedSequence branch.

import { generate } from '../gen/index.js';
import { mulberry32, pick } from '../rng.js';
import { markSeen, unseenFrom } from '../state.js';

export const STAGE_CONFIG = {
  minion: { n: 6, tiers: [1], drainPerHit: 1 / 6 },
  elite: { n: 8, tiers: [2, 2, 3], drainPerHit: 1 / 8 },
  boss: { hits: 8, tiers: [2, 3], drainPerHit: 1 / 8, maxQuestions: 12, healOnMiss: true },
  // ENGINE_SPEC_2 §D: 12-question gauntlet, HP 10, miss heals 1 step, cap 16 questions total.
  regionboss: { hits: 10, tiers: [2, 3], drainPerHit: 1 / 10, maxQuestions: 16, healOnMiss: true },
};

function tierForIndex(stage, cfg, hitIndex) {
  if (stage === 'boss' || stage === 'regionboss') {
    // mixed pool of t2/t3, weighted evenly (unchanged from Phase 1's boss behaviour,
    // now shared with regionboss).
    return cfg.tiers[hitIndex % 2] !== undefined ? cfg.tiers[hitIndex % 2] : cfg.tiers[0];
  }
  return cfg.tiers[hitIndex % cfg.tiers.length];
}

/**
 * topicSourceKind(topic) -> 'generator' | 'bank'
 * Generator topics carry `genId` (maths, Phase 1). Everything else is expected to carry
 * a `bank` object keyed by tier (`{1:[...], 2:[...], 3:[...]}`, string or numeric keys both
 * accepted) — English drill topics author this directly; storybog skill-topics don't have
 * one authored, so screens/battle.js builds an equivalent `{1:pool,2:pool,3:pool}` shape
 * from the tagged passage-question pool before handing the topic to this engine. This
 * keeps the engine itself ignorant of passages entirely — one uniform "bank" contract.
 */
export function topicSourceKind(topic) {
  return topic && topic.genId ? 'generator' : 'bank';
}

function bankForTier(topic, tier) {
  if (!topic || !topic.bank) return [];
  return topic.bank[tier] || topic.bank[String(tier)] || [];
}

// A bank/passage item may not carry its own `tier`/`topicId` (passage questions in
// particular are only tagged with `skill`+`lineRef` per CONTENT_SPECS_ENGLISH) — stamp in
// whatever tier slot the engine drew it for and the topic it was drawn from, so downstream
// state.recordAnswer(topicId, {tier}) mastery tracking always has what it needs.
function normalizeBankItem(item, tier, topicId) {
  return {
    ...item,
    tier: item.tier != null ? item.tier : tier,
    topicId: item.topicId || topicId,
  };
}

/**
 * drawBankItem({ bank, tier, seenItems, lastItemId, rng }) -> { item, seenItems } | null
 * Pure sampling per ENGINE_SPEC_2 §D:
 *   - prefer items NOT in `seenItems` (this cycle);
 *   - if the whole bank has been seen, start a fresh cycle (draw from the full bank again);
 *   - NEVER draw the same item id as `lastItemId` twice in a row, unless that's the only
 *     item available (bank of 1 — never happens in practice, banks are sized generously,
 *     but must not throw if it ever does).
 * Returns the chosen item (tier/topicId NOT yet stamped — caller does that) plus the
 * UPDATED seenItems array (the chosen item is marked seen). Returns null for an empty bank
 * so callers can fail loudly rather than silently rendering `undefined`.
 */
export function drawBankItem({ bank, tier, seenItems = [], lastItemId = null, rng }) {
  if (!bank || bank.length === 0) return null;
  let pool = unseenFrom(bank, seenItems);
  let nextSeen = seenItems;
  if (pool.length === 0) {
    nextSeen = []; // cycle exhausted — reset and resample from the full bank
    pool = bank.slice();
  }
  let candidates = pool.filter((it) => it.id !== lastItemId);
  if (candidates.length === 0) candidates = pool; // bank of 1 — repeat is unavoidable
  const chosen = pick(rng, candidates);
  nextSeen = markSeen(nextSeen, chosen.id);
  return { item: chosen, seenItems: nextSeen };
}

export function createBattleEngine(opts) {
  const {
    topic, // single-topic mode: minion | elite | boss
    topics, // regionboss mode: ALL of the region's topics (already tier-eligible per caller)
    stage,
    seed,
    seenItemsByTopic = {}, // { topicId: [ids] } — bank-sampling memory seeded from state.js
    fixedQuestions, // storybog topic-boss "one full passage" mode: pre-resolved 13 Questions
    winThreshold, // fixedQuestions mode: score needed to win (defaults to the paper's 10/13)
  } = opts;

  const cfg = STAGE_CONFIG[stage];
  if (!cfg) throw new Error(`Unknown battle stage: ${stage}`);

  const rng = mulberry32((seed >>> 0) || Date.now() >>> 0);

  // Working copy of bank-sampling memory — never mutate the caller's object. Exposed back
  // out via getState().seenItemsByTopic so the screen can persist it (per topic) as the
  // battle progresses.
  const seenMap = {};
  Object.keys(seenItemsByTopic).forEach((k) => {
    seenMap[k] = (seenItemsByTopic[k] || []).slice();
  });

  const isFixedSequence = Array.isArray(fixedQuestions) && fixedQuestions.length > 0;
  const isRegionGauntlet = stage === 'regionboss';
  if (isRegionGauntlet && (!Array.isArray(topics) || topics.length === 0)) {
    throw new Error('battle.js: regionboss stage requires a non-empty `topics` array.');
  }

  let gauge = 1; // 1 = full, 0 = empty (creature captured / scrap won)
  let hitsLanded = 0;
  let correctCount = 0; // fixedQuestions mode: running score out of fixedQuestions.length
  let questionsAsked = 0;
  let streak = 0;
  let flawless = true;
  let finished = false;
  let won = false;
  let lastItemId = null;
  let lastTopicId = topic ? topic.id : null;
  let fixedIndex = 0;

  const fixedTotal = isFixedSequence ? fixedQuestions.length : null;
  // Papers mirror ~10/13 — default proportionally so a differently-sized fixed set still
  // has a sane pass mark if a caller doesn't specify one explicitly.
  const fixedWinThreshold = isFixedSequence
    ? (winThreshold != null ? winThreshold : Math.ceil((fixedTotal * 10) / 13))
    : null;
  const fixedDrain = isFixedSequence ? 1 / fixedTotal : null;

  const totalHitsNeeded = isFixedSequence
    ? fixedTotal
    : stage === 'boss' || stage === 'regionboss'
      ? cfg.hits
      : cfg.n;
  const drain = isFixedSequence ? fixedDrain : cfg.drainPerHit;
  // Storybog's topic boss mirrors "one passage, every mark counts": misses never heal, and
  // the meter drains once PER QUESTION (not per hit) so it always finishes empty exactly
  // when the passage is exhausted, regardless of score.
  const healOnMiss = isFixedSequence ? false : !!cfg.healOnMiss;
  const maxQuestions = isFixedSequence ? fixedTotal : cfg.maxQuestions;

  function pickRegionTopic() {
    if (topics.length === 1) return topics[0];
    let choice = pick(rng, topics);
    let guard = 0;
    // Light anti-repeat so the same topic doesn't dominate a 12-question gauntlet —
    // best-effort only (bails out after a few tries rather than looping forever).
    while (choice.id === lastTopicId && guard < 8) {
      choice = pick(rng, topics);
      guard += 1;
    }
    return choice;
  }

  function drawFromTopic(t, tier) {
    if (topicSourceKind(t) === 'generator') {
      return generate(t.genId, tier, rng);
    }
    const bank = bankForTier(t, tier);
    const seen = seenMap[t.id] || [];
    const draw = drawBankItem({ bank, tier, seenItems: seen, lastItemId, rng });
    if (!draw) {
      // An empty/misconfigured bank must never hard-crash deep inside a render call —
      // fail loudly and immediately at the draw site instead, where it's diagnosable.
      throw new Error(`battle.js: topic "${t.id}" has no bank items for tier ${tier}`);
    }
    seenMap[t.id] = draw.seenItems;
    lastItemId = draw.item.id;
    return normalizeBankItem(draw.item, tier, t.id);
  }

  function nextTier() {
    return tierForIndex(stage, cfg, hitsLanded);
  }

  function nextQuestion() {
    questionsAsked += 1;
    if (isFixedSequence) {
      const q = fixedQuestions[fixedIndex];
      fixedIndex += 1;
      lastTopicId = q.topicId || lastTopicId;
      return q;
    }
    const tier = nextTier();
    if (isRegionGauntlet) {
      const t = pickRegionTopic();
      lastTopicId = t.id;
      return drawFromTopic(t, tier);
    }
    lastTopicId = topic.id;
    return drawFromTopic(topic, tier);
  }

  // Regenerate a DIFFERENT question at the SAME tier (never repeat the same item), used by
  // the reteach "Got it — again!" flow. Counts toward the maxQuestions cap just like a
  // fresh question would. In fixedQuestions mode there is no retry loop at all (a passage
  // has exactly 13 marks) — it simply advances to the next scripted question, still with
  // "no fail-out": the child always keeps moving forward.
  function variantQuestion(tier) {
    if (isFixedSequence) {
      return nextQuestion();
    }
    questionsAsked += 1;
    if (isRegionGauntlet) {
      const t = topics.find((x) => x.id === lastTopicId) || pickRegionTopic();
      return drawFromTopic(t, tier);
    }
    return drawFromTopic(topic, tier);
  }

  function recordAnswer(correct) {
    if (isFixedSequence) {
      if (correct) {
        correctCount += 1;
        streak += 1;
      } else {
        streak = 0;
        flawless = false;
      }
      gauge = Math.max(0, 1 - fixedIndex / fixedTotal);
      if (gauge <= 0.0001) gauge = 0;
      const isMegaParp = correct && streak > 0 && streak % 3 === 0;
      if (fixedIndex >= fixedTotal) {
        finished = true;
        won = correctCount >= fixedWinThreshold;
      }
      return {
        correct,
        gauge,
        streak,
        isMegaParp,
        finished,
        won,
        hitsLanded: correctCount,
        totalHitsNeeded: fixedWinThreshold,
      };
    }

    if (correct) {
      hitsLanded += 1;
      streak += 1;
      gauge = Math.max(0, gauge - drain);
      if (gauge <= 0.0001) gauge = 0;
    } else {
      flawless = false;
      streak = 0;
      if (healOnMiss) {
        // wrong refills gauge by +1 step (never above full)
        gauge = Math.min(1, gauge + drain);
      }
    }

    const isMegaParp = correct && streak > 0 && streak % 3 === 0;

    let outOfQuestions = false;
    if (maxQuestions && questionsAsked >= maxQuestions && gauge > 0) {
      outOfQuestions = true;
    }

    // Stages that heal on a miss (boss/regionboss) can have hitsLanded exceed
    // totalHitsNeeded while gauge is still > 0 (heals undo progress) — gauge is the sole
    // win signal there, exactly as Phase 1's boss stage already behaved.
    if (gauge <= 0 || (!healOnMiss && hitsLanded >= totalHitsNeeded)) {
      finished = true;
      won = true;
    } else if (outOfQuestions) {
      finished = true;
      won = false;
    }

    return {
      correct,
      gauge,
      streak,
      isMegaParp,
      finished,
      won,
      hitsLanded,
      totalHitsNeeded,
    };
  }

  function getState() {
    return {
      gauge,
      hitsLanded: isFixedSequence ? correctCount : hitsLanded,
      totalHitsNeeded: isFixedSequence ? fixedWinThreshold : totalHitsNeeded,
      streak,
      questionsAsked,
      finished,
      won,
      flawless: won && flawless,
      // Per-topic bank-sampling memory as it stands right now — the battle screen persists
      // this (via state.setSeenItems) as items are drawn, so progress survives an early exit.
      seenItemsByTopic: seenMap,
    };
  }

  return {
    nextQuestion,
    variantQuestion,
    recordAnswer,
    getState,
    get stage() {
      return stage;
    },
  };
}

export default { createBattleEngine, STAGE_CONFIG, drawBankItem, topicSourceKind };
