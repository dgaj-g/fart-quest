// FART QUEST — GEN agent
// Topic: fdp (The FDP Triangle). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = '½, 0.5 and 50% are the SAME creature in three disguises. To find a fraction OF an amount: divide by the bottom, times by the top.';
const ALT_RULE = 'The words “of the rest” or “of what’s left” mean: the amount REMAINING becomes the new total — never the original amount.';

// Whole-number formatter with UK thousands commas.
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// Decimal formatter: takes an integer "hundredths" value (e.g. 23 -> 0.23, 70 -> 0.7) and returns
// a clean string with AT MOST 2dp, always with the leading "0." seat-warmer, trailing zero trimmed.
function fmtDec(hundredths) {
  let s = (hundredths / 100).toFixed(2);
  if (s.endsWith('0')) s = s.slice(0, -1);
  return s;
}

function uniqueOptions(correctText, candidates) {
  const seen = new Set([correctText]);
  const out = [];
  for (const c of candidates) {
    if (c === undefined || c === null) continue;
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Ensure at least `min` total options (correct + distractors). Pads with plausible generic
// numeric near-misses (never random garbage) if dedup left the pool short.
function makeMcq(correct, distractorPool, n, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  const min = opts.min || n + 1;
  if (options.length < min) {
    const seen = new Set(options.map((o) => o.text));
    const fallback = (opts.fallback || []).map((v) => ({ text: fmt(v), misconception: 'padded-near-miss' }));
    for (const cand of fallback) {
      if (options.length >= min) break;
      if (seen.has(cand.text)) continue;
      seen.add(cand.text);
      options.push(cand);
    }
  }
  return options;
}

// -------- shared data --------

// Canonical taught equivalence set (the exact set from the lesson's wardrobe table).
const FAMILIES = [
  { frac: '½', dec: '0.5', pct: '50%' },
  { frac: '¼', dec: '0.25', pct: '25%' },
  { frac: '¾', dec: '0.75', pct: '75%' },
  { frac: '⅒', dec: '0.1', pct: '10%' },
  { frac: '⅕', dec: '0.2', pct: '20%' },
];
const FORM_NAME = { frac: 'fraction', dec: 'decimal', pct: 'percentage' };
// Numerator/denominator for each FAMILIES entry, same order, used to build scaled-up
// equivalent fractions (e.g. ¼ -> 2/8, 3/12) for the NOT-equivalent template below.
const FAMILY_FRAC_ND = [[1, 2], [1, 4], [3, 4], [1, 10], [1, 5]];

// -------- T1 templates --------

function t1MatchDisguise(rng) {
  const idx = rngInt(rng, 0, FAMILIES.length - 1);
  const family = FAMILIES[idx];
  const forms = ['frac', 'dec', 'pct'];
  const givenForm = pick(rng, forms);
  const targetForm = pick(rng, forms.filter((f) => f !== givenForm));
  const given = family[givenForm];
  const correctText = family[targetForm];

  const others = shuffle(rng, FAMILIES.filter((_, i) => i !== idx)).slice(0, 3);
  const distractors = others.map((f) => ({ text: f[targetForm], misconception: 'wrong-disguise' }));

  const stem = `Which of these is the SAME amount as <b>${given}</b>?`;
  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, distractors, 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-disguise') whyWrong[o.text] = `That’s Percy in a DIFFERENT disguise — it’s worth a different amount, not ${given}.`;
  }

  return {
    templateId: 'fdp-t1-match-disguise',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find ${given} on the equivalence triangle — which family does it belong to?`,
      `That same family also wears a ${FORM_NAME[targetForm]} disguise. What is it?`,
    ],
    explain: {
      rule: RULE,
      worked: `${family.frac} = ${family.dec} = ${family.pct} — three disguises, one amount.`,
      whyWrong,
    },
  };
}

function t1TenthsToPercent(rng) {
  const n = rngInt(rng, 1, 9);
  const correctPct = n * 10;
  const correctText = `${correctPct}%`;
  const stem = `What is <b>${n}/10</b> as a percentage?`;

  const distractors = [];
  distractors.push({ text: `${n}%`, misconception: 'one-slide-slip' });
  distractors.push({ text: `${n * 100}%`, misconception: 'too-many-slides' });
  const complement = 100 - correctPct;
  if (complement !== correctPct) {
    distractors.push({ text: `${complement}%`, misconception: 'complement-trap' });
  } else {
    distractors.push({ text: `${correctPct + 10}%`, misconception: 'off-by-ten' });
  }

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'one-slide-slip') whyWrong[o.text] = `That’s only ONE slide of the point — a fraction over 10 needs its decimal (0.${n}) slid TWO places to become a percentage.`;
    else if (o.misconception === 'too-many-slides') whyWrong[o.text] = `That’s too many slides — 0.${n} × 100 stops at ${correctPct}%, not ${n * 100}%.`;
    else if (o.misconception === 'complement-trap') whyWrong[o.text] = `That’s 100% MINUS the answer — the amount left over, not what ${n}/10 itself is worth.`;
    else if (o.misconception === 'off-by-ten') whyWrong[o.text] = 'Check the tens digit again — that’s ten too many.';
  }

  return {
    templateId: 'fdp-t1-tenths-to-percent',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${n}/10 slides straight into a decimal: 0.${n}. Now slide it TWO places to become a percentage.`,
      `0.${n} × 100 = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${n}/10 = 0.${n} = ${correctPct}%.`,
      whyWrong,
    },
  };
}

function t1TenthsToDecimal(rng) {
  const n = rngInt(rng, 1, 9);
  const correctText = `0.${n}`;
  const stem = `What is <b>${n}/10</b> as a decimal?`;

  const distractors = [
    { text: `${n}.0`, misconception: 'numerator-as-whole' },
    { text: `0.0${n}`, misconception: 'wrong-place' },
    { text: `${n}`, misconception: 'bare-numerator' },
  ];

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'numerator-as-whole') whyWrong[o.text] = `${n}/10 isn’t whole ${n}s — it’s ${n} TENTHS, a piece smaller than one.`;
    else if (o.misconception === 'wrong-place') whyWrong[o.text] = `That puts the ${n} on the HUNDREDTHS seat — tenths sit right after the point, one seat closer.`;
    else if (o.misconception === 'bare-numerator') whyWrong[o.text] = `That’s just the numerator on its own — it needs the decimal point to show it’s TENTHS.`;
  }

  return {
    templateId: 'fdp-t1-tenths-to-decimal',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${n}/10 means ${n} tenths. Tenths sit on the very first seat right after the decimal point.`,
      `Put ${n} straight after the point: 0.${'_'} → …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${n}/10 means ${n} tenths → 0.${n}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

const PERCENT_DEFS = [
  { p: 10, num: 1, den: 10 },
  { p: 20, num: 1, den: 5 },
  { p: 25, num: 1, den: 4 },
  { p: 50, num: 1, den: 2 },
  { p: 75, num: 3, den: 4 },
  { p: 5, num: 1, den: 20 },
  { p: 90, num: 9, den: 10 },
  { p: 60, num: 3, den: 5 },
  { p: 40, num: 2, den: 5 },
  { p: 80, num: 4, den: 5 },
];

// Fix (bracket tell): distractors must not ALWAYS straddle the correct answer (some larger, some
// smaller) — that pattern lets a kid learn "the answer is always in the middle" without doing any
// maths. Bucket every candidate distractor into a "definitely bigger than the answer" pool or a
// "definitely smaller than the answer" pool, then let the caller pick a SHAPE: bigger-only (correct
// becomes the MIN of the options), smaller-only (correct becomes the MAX), or a mixed shuffle of
// both (the old sandwich behaviour) — varied per generation via rng so no fixed rule holds.
function pctOfAmountPools(def, N, answer) {
  const bigger = [];
  const smaller = [];

  const percentOff = N - answer;
  if (percentOff !== answer) {
    (percentOff > answer ? bigger : smaller).push({ text: fmt(percentOff), misconception: 'percent-off' });
  }
  if (def.p !== 10) {
    const tenPct = Math.round(N / 10);
    if (tenPct !== answer) (tenPct > answer ? bigger : smaller).push({ text: fmt(tenPct), misconception: 'ten-percent-only' });
  }
  if (def.p !== answer) {
    (def.p > answer ? bigger : smaller).push({ text: String(def.p), misconception: 'percent-as-value' });
  }
  if (def.num > 1) {
    const swapped = Math.round((N / def.num) * def.den);
    if (swapped !== answer && Number.isFinite(swapped)) {
      (swapped > answer ? bigger : smaller).push({ text: fmt(swapped), misconception: 'num-den-swap' });
    }
  }
  // unconditional candidates, guaranteed on the correct side of the answer
  bigger.push({ text: fmt(answer * 2), misconception: 'scale-error' });
  bigger.push({ text: fmt(answer + def.den), misconception: 'scale-error' });
  bigger.push({ text: fmt(Math.round(answer * 1.5) || 1), misconception: 'scale-error' });
  bigger.push({ text: fmt(N), misconception: 'whole-amount' });
  smaller.push({ text: fmt(Math.max(0, Math.round(answer / 2))), misconception: 'scale-error' });
  smaller.push({ text: fmt(Math.max(0, answer - def.den)), misconception: 'scale-error' });
  smaller.push({ text: fmt(Math.max(0, Math.round(answer / 3))), misconception: 'scale-error' });
  smaller.push({ text: fmt(Math.max(0, Math.round(answer * 0.75))), misconception: 'scale-error' });

  return { bigger, smaller };
}

function t2PercentOfAmount(rng) {
  const def = pick(rng, PERCENT_DEFS);
  const mult = rngInt(rng, 2, 20);
  const N = def.den * mult;
  const answer = (N / def.den) * def.num;
  const answerText = fmt(answer);

  const { bigger, smaller } = pctOfAmountPools(def, N, answer);
  const shape = rngInt(rng, 0, 2);
  let pool;
  if (shape === 1) pool = bigger; // correct becomes the MIN of the options
  else if (shape === 2) pool = smaller; // correct becomes the MAX of the options
  else pool = shuffle(rng, [...bigger, ...smaller]); // mixed sandwich shape

  const correct = { text: answerText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, pool), 4, {
    min: 5,
    fallback: [answer + N, Math.max(0, answer - N), answer * 3, N],
  });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'percent-off') whyWrong[o.text] = `That’s ${fmt(N)} MINUS the ${def.p}% — the “percent OFF” trap. The question asks for ${def.p}% OF ${fmt(N)}, not what’s left after taking it away.`;
    else if (o.misconception === 'ten-percent-only') whyWrong[o.text] = `That’s just 10% of ${fmt(N)} — right method, wrong percentage! ${def.p}% needs scaling from the 10% anchor.`;
    else if (o.misconception === 'percent-as-value') whyWrong[o.text] = `That’s just the percentage NUMBER itself, not ${def.p}% OF ${fmt(N)}.`;
    else if (o.misconception === 'num-den-swap') whyWrong[o.text] = 'The fraction got flipped — check which number is the bottom and which is the top.';
    else if (o.misconception === 'whole-amount') whyWrong[o.text] = `That’s the WHOLE amount (100%) — not just ${def.p}% of it.`;
    else if (o.misconception === 'scale-error' || o.misconception === 'padded-near-miss') whyWrong[o.text] = `Check your working again — that’s the wrong size for ${def.p}% of ${fmt(N)}.`;
  }

  return {
    templateId: 'fdp-t2-percent-of-amount',
    stem: `What is <b>${def.p}%</b> of ${fmt(N)}?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `${def.p}% is one of Percy’s disguises — which fraction is it (bottom = ${def.den})?`,
      `Divide ${fmt(N)} by the bottom (${def.den}), then times by the top (${def.num}).`,
    ],
    explain: {
      rule: RULE,
      worked: `${def.p}% = ${def.num}/${def.den}. ${fmt(N)} ÷ ${def.den} × ${def.num} = ${answerText}.`,
      whyWrong,
    },
  };
}

function t2DecimalToPercent(rng) {
  const h = rngInt(rng, 1, 99);
  const decText = fmtDec(h);
  const correctText = `${h}%`;
  const stem = `<b>${decText}</b> = ?%`;

  const distractors = [];
  const oneSlideVal = h / 10;
  distractors.push({ text: `${oneSlideVal % 1 === 0 ? oneSlideVal : oneSlideVal.toFixed(1)}%`, misconception: 'one-slide-slip' });
  distractors.push({ text: `${h * 10}%`, misconception: 'too-many-slides' });
  distractors.push({ text: `${decText}%`, misconception: 'no-shift' });
  const complement = 100 - h;
  if (complement !== h) {
    distractors.push({ text: `${complement}%`, misconception: 'complement-trap' });
  } else {
    distractors.push({ text: `${h + 10}%`, misconception: 'off-by-ten' });
  }

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 4, {
    min: 5,
    fallback: [h + 5, Math.max(0, h - 5), h * 3],
  });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'one-slide-slip') whyWrong[o.text] = 'Only one slide — a decimal needs TWO slides of the point to become a percentage.';
    else if (o.misconception === 'too-many-slides') whyWrong[o.text] = 'That’s three slides — a decimal only needs TWO slides to become a percentage.';
    else if (o.misconception === 'no-shift') whyWrong[o.text] = 'The digits didn’t move at all! Slide the point two places right, then add the % sign.';
    else if (o.misconception === 'complement-trap') whyWrong[o.text] = `That’s 100% MINUS the answer — the amount left over, not what ${decText} itself is worth.`;
    else if (o.misconception === 'off-by-ten') whyWrong[o.text] = 'Check the tens digit again — that’s ten too many.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Slide the point exactly two places right and check your digits.';
  }

  return {
    templateId: 'fdp-t2-decimal-to-percent',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Slide the point TWO places to the right to turn a decimal into a percentage.',
      `${decText} × 100 = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${decText} × 100 = ${h}%.`,
      whyWrong,
    },
  };
}

// NOT-format disguise question: four options are the SAME amount as the named family
// (its decimal, its percentage, and two scaled-up equivalent fractions), one option is a
// DIFFERENT family's disguise. Find the stranger.
function t2NotEquivalentDisguise(rng) {
  const idx = rngInt(rng, 0, FAMILIES.length - 1);
  const family = FAMILIES[idx];
  const [num, den] = FAMILY_FRAC_ND[idx];
  const mults = shuffle(rng, [2, 3, 4, 5]).slice(0, 2);
  const scaled1 = `${num * mults[0]}/${den * mults[0]}`;
  const scaled2 = `${num * mults[1]}/${den * mults[1]}`;

  const equivDistractors = [
    { text: family.dec, misconception: 'is-equivalent' },
    { text: family.pct, misconception: 'is-equivalent' },
    { text: scaled1, misconception: 'is-equivalent' },
    { text: scaled2, misconception: 'is-equivalent' },
  ];

  const otherIdx = pick(rng, FAMILIES.map((_, i) => i).filter((i) => i !== idx));
  const other = FAMILIES[otherIdx];
  const wrongForm = pick(rng, ['frac', 'dec', 'pct']);
  const correctText = other[wrongForm];

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, equivDistractors), 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'is-equivalent') whyWrong[o.text] = `That one IS the same amount as ${family.frac} — just another disguise. Look again for the one that belongs to a DIFFERENT family.`;
  }

  return {
    templateId: 'fdp-t2-not-equivalent',
    stem: `Four of these are the SAME amount as <b>${family.frac}</b>. Which ONE is NOT?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `Convert every option into the SAME form as ${family.frac} — decimals are usually easiest — before comparing.`,
      `Four of them belong to Percy’s ${family.frac} = ${family.dec} = ${family.pct} family. Which one is a stranger?`,
    ],
    explain: {
      rule: RULE,
      worked: `${family.frac} = ${family.dec} = ${family.pct} = ${scaled1} = ${scaled2} — all the SAME amount. ${correctText} belongs to a different family, so it is NOT equivalent.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format) --------

const PERCENTS_T3 = [5, 15, 35, 45, 55, 65, 85, 95];

function t3PercentOfAmountAnchor(rng) {
  const p = pick(rng, PERCENTS_T3);
  const tens = Math.floor(p / 10);
  const hasFive = p % 10 === 5;
  const mult = rngInt(rng, 1, 15);
  const N = 20 * mult;
  const anchor10 = N / 10;
  const half10 = anchor10 / 2;
  const answer = tens * anchor10 + (hasFive ? half10 : 0);

  const parts = [];
  if (tens > 0) parts.push(`${tens} × 10% (${fmt(tens * anchor10)})`);
  if (hasFive) parts.push(`5% (half of 10% = ${fmt(half10)})`);
  const breakdown = parts.join(' + ');

  const hintParts = [];
  if (tens > 0) hintParts.push(`${tens} × 10%`);
  if (hasFive) hintParts.push('5% (half of 10%)');

  return {
    templateId: 'fdp-t3-percent-anchor',
    stem: `What is <b>${p}%</b> of ${fmt(N)}?`,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Find the 10% anchor first: 10% of ${fmt(N)} = ${fmt(anchor10)}.`,
      `${p}% = ${hintParts.join(' + ')}. Add the pieces together.`,
    ],
    explain: {
      rule: RULE,
      worked: `10% of ${fmt(N)} = ${fmt(anchor10)}. ${p}% = ${breakdown} = ${fmt(answer)}.`,
      whyWrong: {},
    },
  };
}

const REMAINDER_FRACS = [{ d: 2, label: 'half' }, { d: 3, label: '⅓' }, { d: 4, label: '¼' }, { d: 5, label: '⅕' }];
const REMAINDER_NOUNS = ['sweets', 'marbles', 'stickers', 'biscuits', 'conkers', 'football cards'];
const REMAINDER_NAMES = ['Jarlath', 'Robin', 'Percy', 'Nia', 'Sam'];
const REMAINDER_ACTIONS = ['eats', 'gives away'];

function t3RemainderProblem(rng) {
  const fracA = pick(rng, REMAINDER_FRACS);
  const fracB = pick(rng, REMAINDER_FRACS);
  const t = rngInt(rng, 2, 8);
  const N = fracA.d * fracB.d * t;
  const firstEaten = N / fracA.d;
  const remaining1 = N - firstEaten;
  const secondEaten = remaining1 / fracB.d;
  const finalLeft = remaining1 - secondEaten;

  const name = pick(rng, REMAINDER_NAMES);
  const noun = pick(rng, REMAINDER_NOUNS);
  const action = pick(rng, REMAINDER_ACTIONS);

  const stem = `${name} has ${fmt(N)} ${noun}. ${name} ${action} <b>${fracA.label}</b> of them. Then ${name} ${action} <b>${fracB.label}</b> of what is LEFT. How many ${noun} does ${name} have LEFT at the end?`;

  return {
    templateId: 'fdp-t3-remainder',
    stem,
    format: 'num',
    accept: [String(finalLeft), fmt(finalLeft)],
    hintSteps: [
      `First find how many ${noun} are used in the first step: ${fracA.label} of ${fmt(N)}.`,
      `That leaves a NEW total — ${fracB.label} of THAT remaining amount is used next, not ${fracB.label} of the original ${fmt(N)}.`,
    ],
    explain: {
      rule: ALT_RULE,
      worked: `${fracA.label} of ${fmt(N)} = ${fmt(firstEaten)}. ${fmt(N)} − ${fmt(firstEaten)} = ${fmt(remaining1)} left. ${fracB.label} of ${fmt(remaining1)} = ${fmt(secondEaten)}. ${fmt(remaining1)} − ${fmt(secondEaten)} = ${fmt(finalLeft)} left.`,
      whyWrong: {},
    },
  };
}

function t3DecimalPercentConvert(rng) {
  const decToPct = rng() < 0.5;
  if (decToPct) {
    const h = rngInt(rng, 1, 99);
    const decText = fmtDec(h);
    return {
      templateId: 'fdp-t3-convert-writein',
      stem: `Write <b>${decText}</b> as a percentage.`,
      format: 'num',
      accept: [String(h)],
      unit: '%',
      hintSteps: [
        'Slide the decimal point TWO places to the right to make a percentage.',
        `${decText} × 100 = …?`,
      ],
      explain: {
        rule: RULE,
        worked: `${decText} × 100 = ${h}%.`,
        whyWrong: {},
      },
    };
  }
  const p = rngInt(rng, 1, 99);
  const correctDec = fmtDec(p);
  return {
    templateId: 'fdp-t3-convert-writein',
    stem: `Write <b>${p}%</b> as a decimal.`,
    format: 'num',
    accept: [correctDec],
    hintSteps: [
      'A percentage means "out of 100" — write it as hundredths.',
      `${p}% = ${p}/100. Slide the point so there are two digits after it.`,
    ],
    explain: {
      rule: RULE,
      worked: `${p}% = ${p}/100 = ${correctDec}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1MatchDisguise, t1TenthsToPercent, t1TenthsToDecimal];
const T2 = [t2PercentOfAmount, t2DecimalToPercent, t2NotEquivalentDisguise];
const T3 = [t3PercentOfAmountAnchor, t3RemainderProblem, t3DecimalPercentConvert];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `fdp-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'fdp',
    tier,
    format,
    stem: built.stem,
    visual: built.visual || null,
    hintSteps: built.hintSteps,
    explain: built.explain,
    _templateId: built.templateId,
  };

  if (format === 'mcq5') {
    question.options = built.options;
    question.correctIndex = built.correctIndex;
  } else {
    question.accept = built.accept;
    if (built.unit) question.unit = built.unit;
  }

  return question;
}

export default { generate };
