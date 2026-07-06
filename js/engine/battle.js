// FART QUEST — js/engine/battle.js (UI agent)
// Drives a battle stage: minion | elite | boss.
// stageConfig per spec §5:
//   minion { n:6, tiers:[1], drainPerHit: 1/6 }
//   elite  { n:8, tiers:[2,2,3], drainPerHit: 1/8 }
//   boss   { hits:8, pool mixed t2/t3, wrong = gauge refills +1 step (cap 12 questions total), flawless flag }

import { generate } from '../gen/index.js';
import { mulberry32, rngInt, pick } from '../rng.js';

export const STAGE_CONFIG = {
  minion: { n: 6, tiers: [1], drainPerHit: 1 / 6 },
  elite: { n: 8, tiers: [2, 2, 3], drainPerHit: 1 / 8 },
  boss: { hits: 8, tiers: [2, 3], drainPerHit: 1 / 8, maxQuestions: 12 },
};

function tierForIndex(stage, cfg, hitIndex) {
  if (stage === 'boss') {
    // mixed pool of t2/t3, weighted evenly
    return hitIndex % 2 === 0 ? 2 : 3;
  }
  return cfg.tiers[hitIndex % cfg.tiers.length];
}

export function createBattleEngine({ topic, stage, seed }) {
  const cfg = STAGE_CONFIG[stage];
  if (!cfg) throw new Error(`Unknown battle stage: ${stage}`);

  const rng = mulberry32((seed >>> 0) || Date.now() >>> 0);

  let gauge = 1; // 1 = full, 0 = empty (creature captured / scrap won)
  let hitsLanded = 0;
  let questionsAsked = 0;
  let streak = 0;
  let wrongOnCurrentQuestion = false;
  let flawless = true;
  let finished = false;
  let won = false;

  const totalHitsNeeded = stage === 'boss' ? cfg.hits : cfg.n;
  const drain = cfg.drainPerHit;

  function nextTier() {
    return tierForIndex(stage, cfg, hitsLanded);
  }

  function nextQuestion() {
    questionsAsked += 1;
    const tier = nextTier();
    return generate(topic.genId, tier, rng);
  }

  // Regenerate a different question at the SAME tier (never repeat same item),
  // used by the reteach "Got it — again!" flow. Counts toward the boss's
  // total-questions cap just like a fresh question would.
  function variantQuestion(tier) {
    questionsAsked += 1;
    return generate(topic.genId, tier, rng);
  }

  function recordAnswer(correct) {
    if (correct) {
      hitsLanded += 1;
      streak += 1;
      gauge = Math.max(0, gauge - drain);
      if (gauge <= 0.0001) gauge = 0;
    } else {
      wrongOnCurrentQuestion = true;
      flawless = false;
      streak = 0;
      if (stage === 'boss') {
        // wrong refills gauge by +1 step (never below current progress floor of 0)
        gauge = Math.min(1, gauge + drain);
      }
    }

    const isMegaParp = correct && streak > 0 && streak % 3 === 0;

    let outOfQuestions = false;
    if (stage === 'boss' && questionsAsked >= cfg.maxQuestions && gauge > 0) {
      outOfQuestions = true;
    }

    if (gauge <= 0 || (stage !== 'boss' && hitsLanded >= totalHitsNeeded)) {
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
      hitsLanded,
      totalHitsNeeded,
      streak,
      questionsAsked,
      finished,
      won,
      flawless: won && flawless,
    };
  }

  return {
    nextQuestion,
    variantQuestion,
    recordAnswer,
    getState,
    get stage() { return stage; },
  };
}

export default { createBattleEngine, STAGE_CONFIG };
