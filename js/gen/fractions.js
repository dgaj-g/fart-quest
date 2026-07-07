// FART QUEST — GEN agent
// Topic: fractions (Fraction Falls). generate(tier, rng) -> Question.
//
// visual spec convention (ENGINE_SPEC_2 §C `polygrid{rows,cols,shaded:[cells]}`):
// `shaded` is an array of 0-indexed, row-major cell indices into a rows*cols grid
// (index = row*cols + col). No other convention is used anywhere in this file.
import { rngInt, pick, shuffle } from '../rng.js';

// Verbatim rule strings — each matches a bolded/law-scroll sentence taught in
// data/topics/fractions.js so explain.rule always echoes exactly what the lesson taught.
const RULE = 'The bottom number says how many equal pieces. The top says how many you take.';
const EQUIV_RULE = 'To make an equivalent fraction, multiply (or divide) the TOP and the BOTTOM by the SAME number.';
const OFAMOUNT_RULE = 'Fraction of an amount: divide by the BOTTOM, then multiply by the TOP.';
const EQUALPIECES_RULE = 'Every piece MUST be equal size — a grid with wonky pieces is never a real fraction grid.';
const COMPARE_RULE = 'When two fractions share the same bottom number, just compare the tops — the bigger top wins.';

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function simplify(num, den) {
  const g = gcd(num, den);
  return [num / g, den / g];
}

// Curated "nice" unit/simple fractions used across templates. Small denominators for T1,
// wider spread for T2/T3.
const EQUIV_BASE_SMALL = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6],
];
const EQUIV_BASE_WIDE = [
  ...EQUIV_BASE_SMALL, [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10],
];

// Generic dedupe-then-pad option builder. `correct` = {text, misconception:null}.
// `pool` = array of candidate {text, misconception} (already the "natural" distractors).
// `minTotal` = minimum total options (correct + distractors). `padFn(rng, usedTexts)` is
// called (if provided) to lazily generate extra plausible candidates if dedup left us short.
function makeOptions(correct, pool, minTotal, padFn, rng) {
  const seen = new Set([correct.text]);
  const options = [correct];
  for (const c of pool) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    options.push(c);
  }
  if (options.length < minTotal && padFn) {
    let guard = 0;
    while (options.length < minTotal && guard < 50) {
      guard++;
      const cand = padFn(rng, seen);
      if (!cand) continue;
      if (seen.has(cand.text)) continue;
      seen.add(cand.text);
      options.push(cand);
    }
  }
  return options;
}

// -------- T1 templates --------

// (a) shaded-grid naming via polygrid visual, irregular (non-adjacent) shaded cells.
function t1ShadedGridPolygrid(rng) {
  const shapes = [
    { rows: 2, cols: 4 }, // total 8
    { rows: 2, cols: 5 }, // total 10
    { rows: 2, cols: 3 }, // total 6
    { rows: 3, cols: 4 }, // total 12
  ];
  const { rows, cols } = pick(rng, shapes);
  const total = rows * cols;
  const shadedCount = rngInt(rng, 1, total - 1);

  // Pick `shadedCount` non-adjacent cells (no shared edge) from the grid.
  const allCells = Array.from({ length: total }, (_, i) => i);
  const order = shuffle(rng, allCells);
  const shaded = [];
  const isAdjacent = (a, b) => {
    const ra = Math.floor(a / cols), ca = a % cols;
    const rb = Math.floor(b / cols), cb = b % cols;
    return (ra === rb && Math.abs(ca - cb) === 1) || (ca === cb && Math.abs(ra - rb) === 1);
  };
  for (const cell of order) {
    if (shaded.length >= shadedCount) break;
    if (shaded.some((s) => isAdjacent(s, cell))) continue;
    shaded.push(cell);
  }
  const actualShaded = shaded.length; // may be < shadedCount if the grid is too small/dense
  const unshaded = total - actualShaded;

  const stem = 'What fraction of this grid is shaded?';
  const visual = { kind: 'polygrid', rows, cols, shaded };

  const correct = { text: `${actualShaded}/${total}`, misconception: null };
  const distractors = [];
  distractors.push({ text: `${unshaded}/${total}`, misconception: 'shaded-unshaded-swap' });
  if (unshaded !== actualShaded && unshaded > 0) {
    distractors.push({ text: `${actualShaded}/${unshaded}`, misconception: 'wrong-denominator' });
  }
  if (actualShaded > 0) {
    distractors.push({ text: `${total}/${actualShaded}`, misconception: 'top-bottom-swap' });
  }

  const padFn = (r) => {
    const delta = pick(r, [1, -1, 2, -2]);
    const t = actualShaded + delta;
    if (t <= 0 || t >= total) return null;
    return { text: `${t}/${total}`, misconception: 'near-miss-count' };
  };
  const options = makeOptions(correct, shuffle(rng, distractors), 4, padFn, rng);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'shaded-unshaded-swap') whyWrong[o.text] = 'That’s the pieces left UNshaded, not the ones shaded — count the shaded pieces for your top number.';
    else if (o.misconception === 'wrong-denominator') whyWrong[o.text] = `That uses the unshaded count as the bottom — the bottom must be the TOTAL number of equal pieces, which is ${total}.`;
    else if (o.misconception === 'top-bottom-swap') whyWrong[o.text] = 'That’s the fraction upside down! The bottom is always the total pieces, the top is always how many you take.';
    else if (o.misconception === 'near-miss-count') whyWrong[o.text] = 'Recount carefully — check every shaded cell against the total number of equal pieces.';
  }

  return {
    templateId: 'frac-t1-shaded-grid',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Count the TOTAL number of equal pieces first — that is your BOTTOM number.',
      'Now count only the SHADED pieces — that is your TOP number.',
    ],
    explain: {
      rule: RULE,
      worked: `There are ${total} equal pieces altogether, so the bottom is ${total}. ${actualShaded} of them are shaded, so the top is ${actualShaded}. That gives ${actualShaded}/${total}.`,
      whyWrong,
    },
  };
}

// (b) equivalence recognition: "which fraction equals X" (mcq of fraction strings)
function t1EquivalentMatch(rng) {
  const [num, den] = pick(rng, EQUIV_BASE_SMALL);
  const k = rngInt(rng, 2, 4);
  const correctNum = num * k, correctDen = den * k;
  const correct = { text: `${correctNum}/${correctDen}`, misconception: null };

  const distractors = [
    { text: `${num}/${den * k}`, misconception: 'only-bottom-scaled' },
    { text: `${num * k}/${den}`, misconception: 'only-top-scaled' },
    { text: `${num + (k - 1)}/${den + (k - 1)}`, misconception: 'added-not-multiplied' },
  ];

  const padFn = (r) => {
    const altK = rngInt(r, 2, 5);
    return { text: `${num * altK}/${den * altK + 1}`, misconception: 'near-miss-pad' };
  };
  const options = makeOptions(correct, shuffle(rng, distractors), 4, padFn, rng);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'only-bottom-scaled') whyWrong[o.text] = `Only the bottom got multiplied by ${k} — the top must be scaled by the SAME number too.`;
    else if (o.misconception === 'only-top-scaled') whyWrong[o.text] = `Only the top got multiplied by ${k} — the bottom needs the SAME treatment.`;
    else if (o.misconception === 'added-not-multiplied') whyWrong[o.text] = `That looks like ${k - 1} was ADDED to the top and bottom instead of multiplying — equivalent fractions come from multiplying (or dividing), never adding.`;
    else if (o.misconception === 'near-miss-pad') whyWrong[o.text] = 'Check the times-table link between the top and the bottom again.';
  }

  return {
    templateId: 'frac-t1-equivalent-match',
    stem: `Which fraction is the same size as <b>${num}/${den}</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'To make an equivalent fraction, multiply the TOP and BOTTOM by the SAME number.',
      `Try multiplying both ${num} and ${den} by ${k}. What do you get?`,
    ],
    explain: {
      rule: EQUIV_RULE,
      worked: `${num}/${den} ×${k} on the top and ×${k} on the bottom gives ${correctNum}/${correctDen} — exactly the same size, just a different disguise.`,
      whyWrong,
    },
  };
}

// (c) equivalence missing-number (small, mcq of plain numbers — not fractions)
function t1EquivalentMissingSmall(rng) {
  const [num, den] = pick(rng, EQUIV_BASE_SMALL.filter(([, d]) => d <= 6));
  const k = rngInt(rng, 2, 4);
  const targetDen = den * k;
  const answer = num * k;

  const correct = { text: `${answer}`, misconception: null };
  const distractors = [
    { text: `${targetDen}`, misconception: 'copied-denominator' },
    { text: `${num + (k - 1)}`, misconception: 'added-not-multiplied' },
    { text: `${num}`, misconception: 'no-scale' },
  ];
  const padFn = (r) => ({ text: `${answer + pick(r, [1, -1, 2, -2])}`, misconception: 'near-miss-pad' });
  const options = makeOptions(correct, shuffle(rng, distractors), 4, padFn, rng);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'copied-denominator') whyWrong[o.text] = 'That’s the new BOTTOM number copied across — you need the new TOP number instead.';
    else if (o.misconception === 'added-not-multiplied') whyWrong[o.text] = `That looks like ${k - 1} was added instead of multiplying — the top must be MULTIPLIED by the same number as the bottom.`;
    else if (o.misconception === 'no-scale') whyWrong[o.text] = 'That’s the original top number, unscaled — the bottom changed, so the top must change too.';
    else if (o.misconception === 'near-miss-pad') whyWrong[o.text] = 'Check the multiplier between the two bottom numbers again.';
  }

  return {
    templateId: 'frac-t1-equivalent-missing-small',
    stem: `<b>${num}/${den} = ?/${targetDen}</b>. What number goes in the gap?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `The bottom went from ${den} to ${targetDen} — what was it multiplied by?`,
      `Multiply the top (${num}) by that same number.`,
    ],
    explain: {
      rule: EQUIV_RULE,
      worked: `The bottom was multiplied by ${k} (${den} × ${k} = ${targetDen}), so the top must be multiplied by ${k} too: ${num} × ${k} = ${answer}.`,
      whyWrong,
    },
  };
}

// (d) "equal pieces" concept check — the non-equal-parts trick, tested directly (never as correct).
function t1ValidFractionGridConcept(rng) {
  const den = rngInt(rng, 3, 6);
  const num = rngInt(rng, 1, den - 1);

  const correct = { text: `${den} equal pieces, ${num} shaded`, misconception: null };
  const numAlt = (num + 1 <= den - 1) ? num + 1 : num - 1;
  const distractors = [
    { text: `${den} unequal pieces, ${num} shaded (the shaded ones are the biggest)`, misconception: 'unequal-pieces' },
    { text: `${den + 1} equal pieces, ${num} shaded`, misconception: 'wrong-piece-count' },
    { text: `${den} equal pieces, ${numAlt} shaded`, misconception: 'wrong-shaded-count' },
  ];
  const padFn = () => ({ text: `${Math.max(2, den - 1)} equal pieces, ${num} shaded`, misconception: 'wrong-piece-count' });
  const options = makeOptions(correct, distractors, 4, padFn, rng);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'unequal-pieces') whyWrong[o.text] = 'The pieces are NOT equal — a fraction grid must always be cut into equal-sized pieces, even if one looks tempting because it’s shaded.';
    else if (o.misconception === 'wrong-piece-count') whyWrong[o.text] = `That’s the wrong number of equal pieces — you need exactly ${den} to match the bottom number.`;
    else if (o.misconception === 'wrong-shaded-count') whyWrong[o.text] = `That shades the wrong number of pieces — you need exactly ${num} shaded to match the top number.`;
  }

  return {
    templateId: 'frac-t1-valid-grid-concept',
    stem: `Which of these is a correctly drawn grid for the fraction <b>${num}/${den}</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'Check TWO things: are all the pieces the same size, and is the total piece count right?',
      `You need exactly ${den} EQUAL pieces with ${num} of them shaded.`,
    ],
    explain: {
      rule: EQUALPIECES_RULE,
      worked: `A correct grid for ${num}/${den} has ${den} EQUAL pieces with ${num} of them shaded — nothing more, nothing less, and every piece the same size.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2FractionOfAmount(rng) {
  const [num, den] = pick(rng, EQUIV_BASE_WIDE);
  const kMax = Math.max(2, Math.floor(120 / den));
  const k = rngInt(rng, 2, kMax);
  const amount = den * k;
  const correct = { text: `${num * k}`, misconception: null };

  const dividedByTop = Math.round(amount / num);
  const forgotMultiply = k;
  const subtractedTop = amount - num;
  const topBottomSwap = Math.round(amount / num) * den;

  const distractors = [
    { text: `${dividedByTop}`, misconception: 'divided-by-top' },
    { text: `${forgotMultiply}`, misconception: 'forgot-multiply' },
    { text: `${subtractedTop}`, misconception: 'subtracted-top' },
    { text: `${topBottomSwap}`, misconception: 'top-bottom-swap' },
  ];
  const padFn = (r) => ({ text: `${num * k + pick(r, [1, -1, 2, -2])}`, misconception: 'near-miss-pad' });
  const options = makeOptions(correct, shuffle(rng, distractors), 5, padFn, rng);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'divided-by-top') whyWrong[o.text] = `That’s ${amount} divided by the TOP number, ${num} — always divide by the BOTTOM first.`;
    else if (o.misconception === 'forgot-multiply') whyWrong[o.text] = `That’s only the first step (${amount} ÷ ${den}) — don’t forget to multiply by the top number too!`;
    else if (o.misconception === 'subtracted-top') whyWrong[o.text] = 'Fractions of an amount are never found by subtracting — divide by the bottom, then multiply by the top.';
    else if (o.misconception === 'top-bottom-swap') whyWrong[o.text] = `That’s the bottom and top swapped around in the working — divide by ${den} (the bottom), not by ${num}.`;
    else if (o.misconception === 'near-miss-pad') whyWrong[o.text] = 'Check each step: divide by the bottom, then multiply by the top.';
  }

  return {
    templateId: 'frac-t2-fraction-of-amount',
    stem: `What is <b>${num}/${den} of ${fmt(amount)}</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `First divide ${fmt(amount)} by the BOTTOM number (${den}). What do you get?`,
      `Now multiply that answer by the TOP number (${num}).`,
    ],
    explain: {
      rule: OFAMOUNT_RULE,
      worked: `${fmt(amount)} ÷ ${den} (the bottom) = ${k}. Then ${k} × ${num} (the top) = ${num * k}.`,
      whyWrong,
    },
  };
}

function t2ComparePair(rng) {
  const den = rngInt(rng, 3, 9);
  let num1 = rngInt(rng, 1, den - 1), num2;
  do { num2 = rngInt(rng, 1, den - 1); } while (num2 === num1);
  const bigger = Math.max(num1, num2), smaller = Math.min(num1, num2);

  const correct = { text: `${bigger}/${den}`, misconception: null };
  const distractors = [
    { text: `${smaller}/${den}`, misconception: 'picked-smaller' },
    { text: 'They are equal', misconception: 'equal-guess' },
    { text: `${den}/${bigger}`, misconception: 'top-bottom-swap' },
  ];
  const biggerVal = bigger / den;
  const padFn = (r) => {
    const altDen = den + rngInt(r, 1, 4);
    const altNum = rngInt(r, 1, altDen - 1);
    if (Math.abs(altNum / altDen - biggerVal) < 1e-9) return null; // avoid a second "correct" value
    return { text: `${altNum}/${altDen}`, misconception: 'near-miss-pad' };
  };
  const options = makeOptions(correct, shuffle(rng, distractors), 5, padFn, rng);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'picked-smaller') whyWrong[o.text] = `That top number (${smaller}) is smaller than ${bigger} — same bottom number, so the bigger top wins.`;
    else if (o.misconception === 'equal-guess') whyWrong[o.text] = `The tops are different (${num1} and ${num2}), so the fractions can’t be equal — compare the tops.`;
    else if (o.misconception === 'top-bottom-swap') whyWrong[o.text] = 'That’s one of the fractions turned upside down — not a fair comparison.';
    else if (o.misconception === 'near-miss-pad') whyWrong[o.text] = `Check that fraction’s actual size against ${bigger}/${den} — it isn’t the bigger one.`;
  }

  return {
    templateId: 'frac-t2-compare-pair',
    stem: `Which is bigger: <b>${num1}/${den}</b> or <b>${num2}/${den}</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'These fractions have the SAME bottom number, so just compare the TOPS.',
      `Which top number is bigger, ${num1} or ${num2}?`,
    ],
    explain: {
      rule: COMPARE_RULE,
      worked: `${num1}/${den} and ${num2}/${den} share the same bottom (${den}), so compare the tops: ${bigger} is bigger than ${smaller}, so ${bigger}/${den} is the bigger fraction.`,
      whyWrong,
    },
  };
}

function t2LargestOfFour(rng) {
  const den = rngInt(rng, 6, 10);
  const pool = shuffle(rng, Array.from({ length: den - 1 }, (_, i) => i + 1));
  const numerators = pool.slice(0, 5);
  const correctNum = Math.max(...numerators);

  const options = numerators.map((n) => ({
    text: `${n}/${den}`,
    misconception: n === correctNum ? null : 'not-largest',
  }));
  const correctIndex = options.findIndex((o) => o.misconception === null);
  // move correct to front for the standard pre-shuffle convention
  const [correctOpt] = options.splice(correctIndex, 1);
  options.unshift(correctOpt);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'not-largest') whyWrong[o.text] = `That top number is smaller than ${correctNum} — same bottom number, so it isn’t the largest.`;
  }

  return {
    templateId: 'frac-t2-largest-of-four',
    stem: 'Which of these fractions is the LARGEST?',
    options,
    correctIndex: 0,
    hintSteps: [
      'All these fractions share the same bottom number.',
      'So just compare the TOP numbers — the biggest top wins.',
    ],
    explain: {
      rule: COMPARE_RULE,
      worked: `All the fractions share the bottom number ${den}, so the one with the biggest top number wins: ${correctNum}/${den}.`,
      whyWrong,
    },
  };
}

function t2NotEquivalent(rng) {
  const [num, den] = pick(rng, EQUIV_BASE_SMALL);
  const ks = shuffle(rng, [2, 3, 4, 5, 6]).slice(0, 4);

  const [origNum, origDen] = simplify(num, den);
  let oddNum, oddDen, oddK;
  let guard = 0;
  do {
    oddK = pick(rng, ks);
    oddNum = num * oddK + (rng() < 0.5 ? 1 : -1);
    oddDen = den * oddK;
    guard++;
  } while ((oddNum <= 0 || (() => { const [a, b] = simplify(oddNum, oddDen); return a === origNum && b === origDen; })()) && guard < 20);

  const equivOptions = ks.map((k) => ({ text: `${num * k}/${den * k}`, misconception: 'is-equivalent' }));
  const oddText = `${oddNum}/${oddDen}`;
  const correct = { text: oddText, misconception: null };

  const options = makeOptions(correct, equivOptions, 5, null, rng);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'is-equivalent') whyWrong[o.text] = `That one really is the same size as ${num}/${den} — it’s not the odd one out.`;
  }

  return {
    templateId: 'frac-t2-not-equivalent',
    stem: `Three of these are the SAME size as <b>${num}/${den}</b>. Which ONE is the ODD one out?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'Check if multiplying the top and bottom of each option by the same number gets you back to the original fraction.',
      `Most of them come from multiplying ${num}/${den} by a whole number, top and bottom. Which one does NOT?`,
    ],
    explain: {
      rule: EQUIV_RULE,
      worked: `${num}/${den} scaled up (×2, ×3, ×4 …) gives true equivalent fractions. ${oddText} breaks the pattern — its top and bottom were not scaled by the same number.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format, leaning num) --------

function t3FractionOfAmountHarder(rng) {
  const den = rngInt(rng, 5, 12);
  const num = rngInt(rng, 2, den - 1);
  const kMax = Math.max(3, Math.floor(150 / den));
  const k = rngInt(rng, 3, kMax);
  const amount = den * k;
  const answer = num * k;

  return {
    templateId: 'frac-t3-fraction-of-amount-harder',
    stem: `What is <b>${num}/${den} of ${fmt(amount)}</b>?`,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Divide ${fmt(amount)} by the BOTTOM number (${den}) first.`,
      `Now multiply that answer by the TOP number (${num}).`,
    ],
    explain: {
      rule: OFAMOUNT_RULE,
      worked: `${fmt(amount)} ÷ ${den} = ${k}. ${k} × ${num} = ${answer}.`,
      whyWrong: {},
    },
  };
}

function t3EquivalentMissingNumber(rng) {
  const [num, den] = pick(rng, EQUIV_BASE_WIDE.filter(([, d]) => d <= 8));
  const k = rngInt(rng, 2, 7);
  const targetDen = den * k;
  const answer = num * k;

  return {
    templateId: 'frac-t3-equivalent-missing-number',
    stem: `<b>${num}/${den} = ?/${targetDen}</b>. What number goes in the gap?`,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `The bottom went from ${den} to ${targetDen} — what was it multiplied by?`,
      'Multiply the top by that same number.',
    ],
    explain: {
      rule: EQUIV_RULE,
      worked: `${den} × ${k} = ${targetDen}, so the top must also be multiplied by ${k}: ${num} × ${k} = ${answer}.`,
      whyWrong: {},
    },
  };
}

function t3ReverseFractionOfAmount(rng) {
  const den = rngInt(rng, 3, 10);
  const num = rngInt(rng, 1, den - 1);
  const kMax = Math.max(2, Math.floor(150 / den));
  const k = rngInt(rng, 2, kMax);
  const value = num * k;
  const whole = den * k;

  return {
    templateId: 'frac-t3-reverse-fraction-of-amount',
    stem: `<b>${num}/${den}</b> of a number is <b>${fmt(value)}</b>. What is the number?`,
    format: 'num',
    accept: [String(whole), fmt(whole)],
    hintSteps: [
      `${fmt(value)} is ${num} equal parts (out of ${den}). Find the value of ONE part first: ${fmt(value)} ÷ ${num}.`,
      `Now multiply that ONE-part value by the total number of parts, ${den}.`,
    ],
    explain: {
      rule: OFAMOUNT_RULE,
      worked: `One part = ${fmt(value)} ÷ ${num} = ${k}. The whole number = ${k} × ${den} = ${fmt(whole)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ShadedGridPolygrid, t1EquivalentMatch, t1EquivalentMissingSmall, t1ValidFractionGridConcept];
const T2 = [t2FractionOfAmount, t2ComparePair, t2LargestOfFour, t2NotEquivalent];
const T3 = [t3FractionOfAmountHarder, t3EquivalentMissingNumber, t3ReverseFractionOfAmount];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `frac-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'fractions',
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
