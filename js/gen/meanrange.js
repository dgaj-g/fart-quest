// FART QUEST — GEN agent
// Topic: mean-range (The Average Alley). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Mean = share the total out equally (add all, divide by how many). Range = biggest minus smallest.';

// Format a whole number with UK thousands commas (values here are small but this keeps the
// same formatting discipline as every other generator in the app).
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// UK-style list: "3, 5 and 7" (no Oxford comma before "and").
function listText(values) {
  if (values.length === 1) return fmt(values[0]);
  const strs = values.map((v) => fmt(v));
  return `${strs.slice(0, -1).join(', ')} and ${strs[strs.length - 1]}`;
}

// Build a set of `n` positive integers whose mean is EXACTLY meanVal. Starts every value at
// meanVal (sum = n*meanVal by definition) then performs a few sum-preserving "give and take"
// swaps (add `amount` to one index, subtract the same amount from another) so the set has real
// spread. Every swap keeps the sum invariant, so the mean can never drift off meanVal, and the
// `values[j] - amount >= 1` guard keeps every entry a positive whole number — no retries needed.
function buildSetWithMean(rng, n, meanVal, spread) {
  const values = new Array(n).fill(meanVal);
  const swaps = Math.max(3, n);
  for (let s = 0; s < swaps; s++) {
    const i = rngInt(rng, 0, n - 1);
    let j = rngInt(rng, 0, n - 1);
    if (j === i) j = (j + 1) % n;
    const amount = rngInt(rng, 1, spread);
    if (values[j] - amount >= 1) {
      values[i] += amount;
      values[j] -= amount;
    }
  }
  // Guard against the (rare) case every swap happened to cancel itself out into an all-equal set —
  // force one direct give-and-take so the set genuinely has spread for the lesson to bite on.
  if (values.every((v) => v === values[0]) && n >= 2 && meanVal - 1 >= 1) {
    values[0] += 1;
    values[1] -= 1;
  }
  return values;
}

// n distinct-ish positive integers in [min, max] (no forced mean — used by pure range templates).
function randomDistinctInts(rng, n, min, max) {
  const nums = new Set();
  let tries = 0;
  while (nums.size < n && tries < 500) {
    nums.add(rngInt(rng, min, max));
    tries++;
  }
  // Fallback for tiny ranges: top up with an offset so we always return exactly n values.
  let filler = min;
  while (nums.size < n) {
    if (!nums.has(filler)) nums.add(filler);
    filler++;
  }
  return shuffle(rng, Array.from(nums));
}

function uniqueOptions(correctText, candidates) {
  const seen = new Set([correctText]);
  const out = [];
  for (const c of candidates) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Generic near-miss padder: correct value nudged by small amounts, tagged 'padded-near-miss'.
// Used only if dedup leaves an options array short of its minimum — mirrors the placevalue /
// rounding generators' padding discipline (never random garbage).
function padNearMiss(correctVal, rng) {
  const deltas = [1, -1, 2, -2, 3, -3, 4, -4];
  return shuffle(rng, deltas)
    .map((d) => correctVal + d)
    .filter((v) => Number.isFinite(v) && v >= 0)
    .map((v) => ({ text: fmt(v), misconception: 'padded-near-miss' }));
}

function makeMcq(correct, distractorPool, rng, n, min) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  if (options.length < min) {
    const correctVal = Number(String(correct.text).replace(/,/g, ''));
    const seen = new Set(options.map((o) => o.text));
    for (const cand of padNearMiss(correctVal, rng)) {
      if (options.length >= min) break;
      if (seen.has(cand.text)) continue;
      seen.add(cand.text);
      options.push(cand);
    }
  }
  return options;
}

function meanWhyWrong(tag) {
  switch (tag) {
    case 'forgot-divide': return 'That’s the TOTAL — the sharing-out step got forgotten! Divide it by how many numbers there are.';
    case 'picked-smallest': return 'That’s just the smallest number on its own — the mean shares out ALL the numbers.';
    case 'picked-largest': return 'That’s just the largest number on its own — the mean shares out ALL the numbers.';
    case 'wrong-count': return 'Check how many numbers are actually in the set — that’s the total divided by the WRONG count.';
    case 'padded-near-miss': return 'Check your addition, then your division, one step at a time.';
    default: return 'Check the two-step ritual again: add everything, then divide by how many there are.';
  }
}

function rangeWhyWrong(tag) {
  switch (tag) {
    case 'biggest-alone': return 'That’s just the biggest number by itself — the range is the GAP between biggest and smallest.';
    case 'smallest-alone': return 'That’s just the smallest number by itself — subtract it from the biggest, don’t stop there.';
    case 'wrong-pair': return 'Check you picked the TRUE biggest and smallest — not two numbers from the middle.';
    case 'sum-of-extremes': return 'Range is a SUBTRACTION, not an addition — biggest minus smallest.';
    case 'padded-near-miss': return 'Check you picked the true biggest and smallest before subtracting.';
    default: return 'Range = biggest minus smallest — check both extremes again.';
  }
}

function invarianceWhyWrong(tag) {
  switch (tag) {
    case 'thinks-unchanged': return 'The mean DOES move — every number shifted by the same amount, so the mean shifts by that same amount too.';
    case 'shift-alone': return 'That’s just the shift by itself — add (or subtract) it from the OLD mean to get the new one.';
    case 'arithmetic-slip': return 'Close, but recheck the addition (or subtraction) between the old mean and the shift.';
    case 'wrong-direction': return 'Check whether the numbers went UP or DOWN — the mean moves the same way.';
    case 'padded-near-miss': return 'Check your addition — new mean = old mean with the shift applied once.';
    default: return 'If every number shifts by the same amount, the mean shifts by that same amount.';
  }
}

// -------- T1 templates --------

function t1MeanTriple(rng) {
  const meanVal = rngInt(rng, 3, 12);
  const values = shuffle(rng, buildSetWithMean(rng, 3, meanVal, 5));
  const sum = values.reduce((a, b) => a + b, 0);
  const stem = `Find the <b>mean</b> of ${listText(values)}.`;

  const distractors = [
    { text: fmt(sum), misconception: 'forgot-divide' },
    { text: fmt(Math.min(...values)), misconception: 'picked-smallest' },
    { text: fmt(Math.max(...values)), misconception: 'picked-largest' },
  ];
  const correct = { text: fmt(meanVal), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, 4);

  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = meanWhyWrong(o.misconception);

  return {
    templateId: 'mr-t1-mean-triple',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Add all three numbers together first: ${values.join(' + ')} = ?`,
      `Now divide that total by how many numbers there are — there are 3 of them.`,
    ],
    explain: {
      rule: RULE,
      worked: `${values.join(' + ')} = ${sum}. Share the ${sum} out between 3 numbers: ${sum} ÷ 3 = ${meanVal}.`,
      whyWrong,
    },
  };
}

function t1RangeTriple(rng) {
  const values = randomDistinctInts(rng, 3, 1, 20);
  const sorted = [...values].sort((a, b) => a - b);
  const [lo, mid, hi] = sorted;
  const range = hi - lo;
  const stem = `Find the <b>range</b> of these three numbers: ${listText(values)}.`;

  const distractors = [
    { text: fmt(hi), misconception: 'biggest-alone' },
    { text: fmt(lo), misconception: 'smallest-alone' },
    { text: fmt(hi - mid), misconception: 'wrong-pair' },
  ];
  const correct = { text: fmt(range), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, 4);

  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = rangeWhyWrong(o.misconception);

  return {
    templateId: 'mr-t1-range-triple',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Find the BIGGEST number and the SMALLEST number in the set.',
      `Range = biggest − smallest. ${hi} − ${lo} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Biggest = ${hi}, smallest = ${lo}. Range = ${hi} − ${lo} = ${range}.`,
      whyWrong,
    },
  };
}

function t1RangeQuad(rng) {
  const values = randomDistinctInts(rng, 4, 1, 30);
  const sorted = [...values].sort((a, b) => a - b);
  const lo = sorted[0], hi = sorted[3];
  const range = hi - lo;
  const stem = `Find the <b>range</b> of this set: ${values.join(', ')}.`;

  const distractors = [
    { text: fmt(hi), misconception: 'biggest-alone' },
    { text: fmt(lo), misconception: 'smallest-alone' },
    { text: fmt(sorted[2] - sorted[1]), misconception: 'wrong-pair' },
    { text: fmt(hi + lo), misconception: 'sum-of-extremes' },
  ];
  const correct = { text: fmt(range), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, 4);

  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = rangeWhyWrong(o.misconception);

  return {
    templateId: 'mr-t1-range-quad',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Find the BIGGEST number and the SMALLEST number in the whole set.',
      `Range = biggest − smallest. ${hi} − ${lo} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Biggest = ${hi}, smallest = ${lo}. Range = ${hi} − ${lo} = ${range}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2MeanSet(rng) {
  const n = pick(rng, [4, 5]);
  const meanVal = rngInt(rng, 4, 15);
  const values = shuffle(rng, buildSetWithMean(rng, n, meanVal, 6));
  const sum = meanVal * n;

  const stem = `Find the <b>mean</b> of ${listText(values)}.`;
  const wrongCountN = pick(rng, [n - 1, n + 1]);
  const wrongCountVal = Math.max(1, Math.round(sum / wrongCountN));

  const distractors = [
    { text: fmt(sum), misconception: 'forgot-divide' },
    { text: fmt(wrongCountVal), misconception: 'wrong-count' },
    { text: fmt(Math.min(...values)), misconception: 'picked-smallest' },
    { text: fmt(Math.max(...values)), misconception: 'picked-largest' },
  ];
  const correct = { text: fmt(meanVal), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 4, 5);

  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = meanWhyWrong(o.misconception);

  return {
    templateId: 'mr-t2-mean-set',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Add all ${n} numbers together: ${values.join(' + ')} = ?`,
      `Now COUNT how many numbers there are (${n}), then divide the total by that count.`,
    ],
    explain: {
      rule: RULE,
      worked: `${values.join(' + ')} = ${sum}. There are ${n} numbers, so ${sum} ÷ ${n} = ${meanVal}.`,
      whyWrong,
    },
  };
}

function t2RangeSet(rng) {
  const values = randomDistinctInts(rng, 5, 1, 50);
  const sorted = [...values].sort((a, b) => a - b);
  const lo = sorted[0], hi = sorted[4];
  const range = hi - lo;
  const stem = `Find the <b>range</b> of this set: ${values.join(', ')}.`;

  const distractors = [
    { text: fmt(hi), misconception: 'biggest-alone' },
    { text: fmt(lo), misconception: 'smallest-alone' },
    { text: fmt(sorted[3] - sorted[1]), misconception: 'wrong-pair' },
    { text: fmt(hi + lo), misconception: 'sum-of-extremes' },
  ];
  const correct = { text: fmt(range), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 4, 5);

  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = rangeWhyWrong(o.misconception);

  return {
    templateId: 'mr-t2-range-set',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Find the BIGGEST number and the SMALLEST number in the whole set.',
      `Range = biggest − smallest. ${hi} − ${lo} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Biggest = ${hi}, smallest = ${lo}. Range = ${hi} − ${lo} = ${range}.`,
      whyWrong,
    },
  };
}

// Mean-invariance trap (PP1 Q47: "does the mean change if everyone ages +3?"). Every number in
// the set shifts by the same amount, so the mean shifts by that exact same amount too.
function t2MeanInvariance(rng) {
  const meanVal = rngInt(rng, 6, 20);
  const n = pick(rng, [3, 4, 5]);
  // Cap the shift so every option below (correct, unchanged, wrong-direction, ±1 slip) stays a
  // non-negative whole number — no template in this app ever expects a signed/negative answer.
  const shift = rngInt(rng, 2, Math.min(8, meanVal - 2));
  const direction = pick(rng, ['up', 'down']);
  const signedShift = direction === 'up' ? shift : -shift;
  const newMean = meanVal + signedShift;
  const verb = direction === 'up' ? 'increases' : 'decreases';
  const sign = direction === 'up' ? '+' : '−';
  const stem = `The mean of ${n} numbers is <b>${meanVal}</b>. Every one of the numbers then ${verb} by ${shift}. What is the new mean?`;

  const distractors = [
    { text: fmt(meanVal), misconception: 'thinks-unchanged' },
    { text: fmt(shift), misconception: 'shift-alone' },
    { text: fmt(newMean + pick(rng, [1, -1])), misconception: 'arithmetic-slip' },
    { text: fmt(meanVal - signedShift), misconception: 'wrong-direction' },
  ];
  const correct = { text: fmt(newMean), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 4, 5);

  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = invarianceWhyWrong(o.misconception);

  return {
    templateId: 'mr-t2-mean-invariance',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `If every number in the set shifts by the same amount, the mean shifts by that exact same amount.`,
      `Old mean = ${meanVal}. New mean = ${meanVal} ${sign} ${shift} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Every number ${verb} by ${shift}, so the mean shifts by that same amount: ${meanVal} ${sign} ${shift} = ${newMean}. No need to re-add the whole set — a constant shift moves the mean by the same constant.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format) --------

function t3MeanWriteIn(rng) {
  const n = pick(rng, [4, 5]);
  const meanVal = rngInt(rng, 5, 20);
  const values = shuffle(rng, buildSetWithMean(rng, n, meanVal, 7));
  const sum = meanVal * n;
  const stem = `Find the <b>mean</b> of ${listText(values)}.`;

  return {
    templateId: 'mr-t3-mean-writein',
    stem,
    format: 'num',
    accept: [String(meanVal)],
    hintSteps: [
      `Add all ${n} numbers together: ${values.join(' + ')} = ?`,
      `Now divide that total by how many numbers there are (${n}).`,
    ],
    explain: {
      rule: RULE,
      worked: `${values.join(' + ')} = ${sum}. ${sum} ÷ ${n} = ${meanVal}.`,
      whyWrong: {},
    },
  };
}

function t3RangeWriteIn(rng) {
  const n = pick(rng, [4, 5, 6]);
  const values = randomDistinctInts(rng, n, 1, 60);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const range = hi - lo;
  const stem = `Find the <b>range</b> of this set: ${values.join(', ')}.`;

  return {
    templateId: 'mr-t3-range-writein',
    stem,
    format: 'num',
    accept: [String(range)],
    hintSteps: [
      'Find the BIGGEST number and the SMALLEST number in the set.',
      `Range = biggest − smallest. ${hi} − ${lo} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Biggest = ${hi}, smallest = ${lo}. Range = ${hi} − ${lo} = ${range}.`,
      whyWrong: {},
    },
  };
}

// Mean-invariance trap, write-in format (PP1 Q47: "does the mean change if everyone ages +3?").
function t3MeanInvarianceWriteIn(rng) {
  const n = pick(rng, [4, 5, 6]);
  const meanVal = rngInt(rng, 6, 20);
  // The write-in keypad has no minus key, so the new mean must never go negative.
  const shift = rngInt(rng, 2, Math.min(10, meanVal - 1));
  const direction = pick(rng, ['up', 'down']);
  const signedShift = direction === 'up' ? shift : -shift;
  const newMean = meanVal + signedShift;
  const verb = direction === 'up' ? 'increases' : 'decreases';
  const sign = direction === 'up' ? '+' : '−';
  const stem = `The mean of ${n} numbers is <b>${meanVal}</b>. Every one of the numbers then ${verb} by ${shift}. What is the new mean?`;

  return {
    templateId: 'mr-t3-mean-invariance-writein',
    stem,
    format: 'num',
    accept: [String(newMean)],
    hintSteps: [
      `If every number in the set shifts by the same amount, the mean shifts by that exact same amount.`,
      `Old mean = ${meanVal}. New mean = ${meanVal} ${sign} ${shift} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Every number ${verb} by ${shift}, so the mean shifts by that same amount: ${meanVal} ${sign} ${shift} = ${newMean}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1MeanTriple, t1RangeTriple, t1RangeQuad];
const T2 = [t2MeanSet, t2RangeSet, t2MeanInvariance];
const T3 = [t3MeanWriteIn, t3RangeWriteIn, t3MeanInvarianceWriteIn];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `mr-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'mean-range',
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
