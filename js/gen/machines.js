// FART QUEST — GEN agent
// Topic: machines-mystery (The Mystery Machine Bog). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'To find what went IN, run the machine BACKWARDS: undo each step with its opposite.';

const LETTERS = ['a', 'b', 'c', 'p', 'q', 't'];
const OPPOSITE = { add: 'sub', sub: 'add', mul: 'div', div: 'mul' };

// Format a whole number with UK thousands commas (numbers in this topic stay small, but this
// keeps the same convention as the other gen modules).
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// Every one-step operation the machine can perform: forward apply, its inverse, and the plain
// text used to describe both directions in stems/hints/explanations.
const OPS = {
  add: {
    apply: (x, b) => x + b,
    inverse: (y, b) => y - b,
    symbol: (b) => `+ ${b}`,
    invSymbol: (b) => `− ${b}`,
    verbFwd: (b) => `adds ${b}`,
  },
  sub: {
    apply: (x, b) => x - b,
    inverse: (y, b) => y + b,
    symbol: (b) => `− ${b}`,
    invSymbol: (b) => `+ ${b}`,
    verbFwd: (b) => `takes away ${b}`,
  },
  mul: {
    apply: (x, b) => x * b,
    inverse: (y, b) => y / b,
    symbol: (b) => `× ${b}`,
    invSymbol: (b) => `÷ ${b}`,
    verbFwd: (b) => `multiplies by ${b}`,
  },
  div: {
    apply: (x, b) => x / b,
    inverse: (y, b) => y * b,
    symbol: (b) => `÷ ${b}`,
    invSymbol: (b) => `× ${b}`,
    verbFwd: (b) => `divides by ${b}`,
  },
};
const OP_KEYS = Object.keys(OPS);

// Shared whyWrong text keyed by misconception tag. Every distractor in this file is tagged with
// one of these, so buildWhyWrong() can compose the explain.whyWrong map generically.
const WHY_WRONG = {
  'wrong-op': 'That used the OPPOSITE operation — check the machine’s real rule again.',
  'off-by-one': 'So close! Recount carefully — that answer is only one out.',
  'no-op': 'The machine DOES do something to the number — it never just passes it through unchanged.',
  'wrong-constant': 'Check the number in the machine’s rule again — that’s not quite the right one.',
  'inverse-direction': 'That’s the OPPOSITE direction — this machine is running FORWARDS, not backwards.',
  'additive-confusion': 'The gap between the numbers isn’t always what the machine adds — check whether it’s really adding or multiplying.',
  'not-inverted': 'That applies the SAME operation again — to reverse a machine you must use the OPPOSITE operation.',
  'copied-out': 'That’s just the OUT number copied straight across — you still need to undo the rule to find IN.',
  'copied-total': 'That’s the total on the right of the equals sign — you still need to undo the step to find the letter.',
  'wrong-direction': 'That undoes the step the wrong way — check whether you should add, subtract, multiply or divide.',
  'used-constant': 'That’s the machine’s own number from the rule, not the letter’s value — solve the equation to find the letter.',
  'padded-near-miss': 'Close, but not quite — work through the machine’s rule step by step to check.',
};

function buildWhyWrong(options) {
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && WHY_WRONG[o.misconception]) whyWrong[o.text] = WHY_WRONG[o.misconception];
  }
  return whyWrong;
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

// Pads a numeric mcq option list up to `want` entries using correct±k jitter, tagged
// 'padded-near-miss'. Only ever invoked as a last resort if template-specific distractors
// collapsed together after dedup.
function padNumeric(existingTexts, correctVal, want) {
  // NOTE: existingTexts already accumulates every text we add here, so checking its size alone
  // (not size + out.length, which would double-count) is the correct "are we done yet" test.
  const out = [];
  let offset = 1;
  while (existingTexts.size < want && offset < 1000) {
    for (const delta of [offset, -offset]) {
      if (existingTexts.size >= want) break;
      const v = correctVal + delta;
      if (!Number.isFinite(v) || v < 0) continue;
      const text = fmt(v);
      if (existingTexts.has(text)) continue;
      existingTexts.add(text);
      out.push({ text, misconception: 'padded-near-miss' });
    }
    offset++;
  }
  return out;
}

function buildOptions(correct, distractorCandidates, want, rng) {
  const valid = distractorCandidates.filter((c) => c && c.text !== undefined && c.text !== null);
  const deduped = uniqueOptions(correct.text, shuffle(rng, valid));
  const chosen = deduped.slice(0, want - 1);
  const options = [correct, ...chosen];
  if (options.length < want) {
    const seenTexts = new Set(options.map((o) => o.text));
    const correctVal = Number(String(correct.text).replace(/,/g, ''));
    if (Number.isFinite(correctVal)) {
      const padded = padNumeric(seenTexts, correctVal, want);
      options.push(...padded.slice(0, want - options.length));
    }
  }
  return options;
}

function safeNum(v) {
  return Number.isFinite(v) && Number.isInteger(v) && v >= 0 ? v : null;
}

// -------- one-step / two-step number generation helpers --------

// Picks a valid one-step machine: an operation, a constant b, an input x, and the resulting
// output y — all positive integers, sub never goes negative, div always divides exactly.
function genOneStep(rng, opts = {}) {
  const xMin = opts.xMin ?? 2, xMax = opts.xMax ?? 40;
  const bMin = opts.bMin ?? 2, bMax = opts.bMax ?? 9;
  const allowedOps = opts.allowedOps || OP_KEYS;
  let tries = 0;
  while (tries < 300) {
    tries++;
    const op = pick(rng, allowedOps);
    const b = rngInt(rng, bMin, bMax);
    let x;
    if (op === 'sub') {
      if (xMax <= b + 1) continue;
      x = rngInt(rng, b + 1, xMax);
    } else if (op === 'div') {
      const kMin = Math.max(1, Math.ceil(xMin / b));
      const kMax = Math.floor(xMax / b);
      if (kMax < kMin) continue;
      x = rngInt(rng, kMin, kMax) * b;
    } else {
      x = rngInt(rng, xMin, xMax);
    }
    const y = OPS[op].apply(x, b);
    if (!Number.isInteger(y) || y < 0) continue;
    return { op, b, x, y };
  }
  return { op: 'add', b: 5, x: 10, y: 15 };
}

// Chains two genOneStep-style steps: x -> (op1,b1) -> mid -> (op2,b2) -> y. Bounds y so the
// final OUT stays kid-friendly.
function genTwoStep(rng, opts = {}) {
  const allowedOps = opts.allowedOps || OP_KEYS;
  const yCap = opts.yCap ?? 400;
  let tries = 0;
  while (tries < 300) {
    tries++;
    const step1 = genOneStep(rng, {
      xMin: opts.xMin ?? 2, xMax: opts.xMax ?? 20, bMin: 2, bMax: 9, allowedOps,
    });
    const { x, op: op1, b: b1, y: mid } = step1;
    const op2 = pick(rng, allowedOps);
    const b2 = rngInt(rng, 2, 9);
    if (op2 === 'sub' && mid <= b2) continue;
    if (op2 === 'div' && mid % b2 !== 0) continue;
    const y = OPS[op2].apply(mid, b2);
    if (!Number.isInteger(y) || y < 0 || y > yCap) continue;
    return { x, op1, b1, mid, op2, b2, y };
  }
  return { x: 5, op1: 'mul', b1: 3, mid: 15, op2: 'add', b2: 4, y: 19 };
}

// Returns `count` distinct valid IN values for a given op/b (used to build a machine table with
// several rows sharing one rule).
function distinctInputsForOp(rng, op, b, count, xMin = 2, xMax = 30) {
  const seen = new Set();
  const out = [];
  let tries = 0;
  while (out.length < count && tries < 500) {
    tries++;
    let cand;
    if (op === 'sub') {
      if (xMax <= b + 1) break;
      cand = rngInt(rng, b + 1, xMax);
    } else if (op === 'div') {
      const kMin = Math.max(1, Math.ceil(xMin / b));
      const kMax = Math.floor(xMax / b);
      if (kMax < kMin) break;
      cand = rngInt(rng, kMin, kMax) * b;
    } else {
      cand = rngInt(rng, xMin, xMax);
    }
    if (seen.has(cand)) continue;
    seen.add(cand);
    out.push(cand);
  }
  // Fallback pad (extremely unlikely to trigger given the ranges used): derive more values by
  // stepping away from the last accepted one.
  let bump = 1;
  while (out.length < count) {
    const cand = (out[out.length - 1] ?? xMin) + bump;
    bump++;
    if (seen.has(cand)) continue;
    seen.add(cand);
    out.push(cand);
  }
  return out;
}

// -------- T1 templates (forward, one-step) --------

function t1ApplyRule(rng) {
  const { op, b, x, y } = genOneStep(rng, { xMin: 2, xMax: 40, bMin: 2, bMax: 9 });
  const stem = `A machine <b>${OPS[op].verbFwd(b)}</b> to any number. IN = <b>${fmt(x)}</b>. What is OUT?`;

  const candidates = [];
  const wrongOp = safeNum(OPS[op].inverse(x, b));
  if (wrongOp !== null) candidates.push({ text: fmt(wrongOp), misconception: 'wrong-op' });
  candidates.push({ text: fmt(x), misconception: 'no-op' });
  const offSign = rng() < 0.5 ? 1 : -1;
  const offVal = safeNum(y + offSign);
  if (offVal !== null) candidates.push({ text: fmt(offVal), misconception: 'off-by-one' });
  const bAlt = b > 2 ? b - 1 : b + 1;
  const wrongConst = safeNum(OPS[op].apply(x, bAlt));
  if (wrongConst !== null) candidates.push({ text: fmt(wrongConst), misconception: 'wrong-constant' });

  const correct = { text: fmt(y), misconception: null };
  const options = buildOptions(correct, candidates, 4, rng);

  return {
    templateId: 'mach-t1-apply-rule',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `The machine’s rule is ${OPS[op].symbol(b)}. Apply it to the IN number.`,
      `${fmt(x)} ${OPS[op].symbol(b)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `IN = ${fmt(x)}. The machine ${OPS[op].verbFwd(b)}: ${fmt(x)} ${OPS[op].symbol(b)} = ${fmt(y)}. OUT = ${fmt(y)}.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

function t1FindRule(rng) {
  // Uses TWO worked example pairs (not one) so the rule is uniquely determined — with a single
  // pair, "+ (y−x)" always also reproduces that one pair (x + (y−x) = y is true for ANY x,y),
  // which would make an "additive confusion" distractor secretly also correct. Two pairs from a
  // distinct-input pool rule that out (see matchesBoth below).
  const { op, b } = genOneStep(rng, { xMin: 2, xMax: 20, bMin: 2, bMax: 9 });
  const [x1, x2] = distinctInputsForOp(rng, op, b, 2, 2, 20);
  const y1 = OPS[op].apply(x1, b);
  const y2 = OPS[op].apply(x2, b);
  const stem = `A machine turns <b>${fmt(x1)}</b> into <b>${fmt(y1)}</b>, and <b>${fmt(x2)}</b> into <b>${fmt(y2)}</b>. What does the machine DO?`;
  const correctText = OPS[op].symbol(b);

  function matchesBoth(testOp, testB) {
    if (!OPS[testOp] || !Number.isFinite(testB)) return false;
    return OPS[testOp].apply(x1, testB) === y1 && OPS[testOp].apply(x2, testB) === y2;
  }

  const rawCandidates = [
    { op: OPPOSITE[op], b, misconception: 'inverse-direction' },
    { op, b: b + 1, misconception: 'wrong-constant' },
    { op, b: b + 2, misconception: 'wrong-constant' },
    { op: OPPOSITE[op], b: b + 1, misconception: 'inverse-direction' },
  ];
  const diff1 = y1 - x1;
  if (diff1 > 0 && !(op === 'add' && diff1 === b)) {
    rawCandidates.push({ op: 'add', b: diff1, misconception: 'additive-confusion' });
  }

  // Reject any candidate that (by fluke) ALSO fits both pairs — it would tie with the correct
  // answer rather than being a genuine distractor.
  const safeCandidates = rawCandidates.filter((c) => !matchesBoth(c.op, c.b));
  let candidateOptions = safeCandidates.map((c) => ({ text: OPS[c.op].symbol(c.b), misconception: c.misconception }));

  const correct = { text: correctText, misconception: null };
  const deduped = uniqueOptions(correct.text, shuffle(rng, candidateOptions));
  const chosen = deduped.slice(0, 3);
  // Fallback pad (rare): more same-op constant tweaks, still checked against matchesBoth.
  if (chosen.length < 3) {
    const seenTexts = new Set([correct.text, ...chosen.map((o) => o.text)]);
    let extra = 3;
    while (chosen.length < 3 && extra < 20) {
      const candB = b + extra;
      extra++;
      if (matchesBoth(op, candB)) continue;
      const text = OPS[op].symbol(candB);
      if (seenTexts.has(text)) continue;
      seenTexts.add(text);
      chosen.push({ text, misconception: 'wrong-constant' });
    }
  }
  const options = [correct, ...chosen];

  const whyWrong = buildWhyWrong(options);

  return {
    templateId: 'mach-t1-find-rule',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Compare each IN with its OUT. Did it change by the same AMOUNT both times (adding/taking away) or the same TIMES (multiplying/dividing)?',
      `${fmt(x1)} → ${fmt(y1)} and ${fmt(x2)} → ${fmt(y2)}. What single rule fits BOTH?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(x1)} ${correctText} = ${fmt(y1)} and ${fmt(x2)} ${correctText} = ${fmt(y2)} — the same rule fits both, so the machine’s rule is ${correctText}.`,
      whyWrong,
    },
  };
}

function t1TableMissingOut(rng) {
  const { op, b } = genOneStep(rng, { xMin: 2, xMax: 20, bMin: 2, bMax: 9 });
  const xs = distinctInputsForOp(rng, op, b, 3);
  const targetIdx = rngInt(rng, 0, xs.length - 1);
  const targetX = xs[targetIdx];
  const targetY = OPS[op].apply(targetX, b);

  const rows = xs.map((x, i) => [fmt(x), i === targetIdx ? '?' : fmt(OPS[op].apply(x, b))]);
  const visual = { kind: 'table', headers: ['IN', 'OUT'], rows, highlight: [[targetIdx, 1]] };

  const stem = `This machine <b>${OPS[op].verbFwd(b)}</b> to every number that goes in. Use the table to find the missing OUT.`;

  const candidates = [];
  const wrongOp = safeNum(OPS[op].inverse(targetX, b));
  if (wrongOp !== null) candidates.push({ text: fmt(wrongOp), misconception: 'wrong-op' });
  candidates.push({ text: fmt(targetX), misconception: 'no-op' });
  const offVal = safeNum(targetY + (rng() < 0.5 ? 1 : -1));
  if (offVal !== null) candidates.push({ text: fmt(offVal), misconception: 'off-by-one' });
  const bAlt = b > 2 ? b - 1 : b + 1;
  const wrongConst = safeNum(OPS[op].apply(targetX, bAlt));
  if (wrongConst !== null) candidates.push({ text: fmt(wrongConst), misconception: 'wrong-constant' });

  const correct = { text: fmt(targetY), misconception: null };
  const options = buildOptions(correct, candidates, 4, rng);

  return {
    templateId: 'mach-t1-table-missing-out',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Every row uses the SAME rule: ${OPS[op].symbol(b)}. Find the row with the missing OUT.`,
      `IN = ${fmt(targetX)}. ${fmt(targetX)} ${OPS[op].symbol(b)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `Every row follows the rule ${OPS[op].symbol(b)}. For IN = ${fmt(targetX)}: ${fmt(targetX)} ${OPS[op].symbol(b)} = ${fmt(targetY)}.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// -------- T2 templates (reverse one-step, simple letter values) --------

function t2ReverseOneStep(rng) {
  const { op, b, x, y } = genOneStep(rng, { xMin: 2, xMax: 60, bMin: 2, bMax: 9 });
  const stem = `A machine <b>${OPS[op].verbFwd(b)}</b>. It spat out <b>${fmt(y)}</b>. What went IN?`;

  const candidates = [];
  const notInverted = safeNum(OPS[op].apply(y, b));
  if (notInverted !== null) candidates.push({ text: fmt(notInverted), misconception: 'not-inverted' });
  candidates.push({ text: fmt(y), misconception: 'copied-out' });
  const offVal = safeNum(x + (rng() < 0.5 ? 1 : -1));
  if (offVal !== null) candidates.push({ text: fmt(offVal), misconception: 'off-by-one' });
  const bAlt = b > 2 ? b - 1 : b + 1;
  const wrongConst = safeNum(OPS[op].inverse(y, bAlt));
  if (wrongConst !== null) candidates.push({ text: fmt(wrongConst), misconception: 'wrong-constant' });

  const correct = { text: fmt(x), misconception: null };
  const options = buildOptions(correct, candidates, 5, rng);

  return {
    templateId: 'mach-t2-reverse-one-step',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `The machine’s rule is ${OPS[op].symbol(b)} — to undo it, use the OPPOSITE: ${OPS[op].invSymbol(b)}.`,
      `${fmt(y)} ${OPS[op].invSymbol(b)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(y)} ${OPS[op].invSymbol(b)} = ${fmt(x)}. Check: ${fmt(x)} ${OPS[op].symbol(b)} = ${fmt(y)}. ✓`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

function t2LetterEquationSolve(rng) {
  const { op, b, x, y } = genOneStep(rng, { xMin: 2, xMax: 40, bMin: 2, bMax: 9 });
  const letter = pick(rng, LETTERS);
  const stem = `The letter <b>${letter}</b> is a machine wearing a disguise: <b>${letter} ${OPS[op].symbol(b)} = ${fmt(y)}</b>. What is <b>${letter}</b>?`;

  const candidates = [];
  candidates.push({ text: fmt(y), misconception: 'copied-total' });
  const wrongDir = safeNum(OPS[op].apply(y, b));
  if (wrongDir !== null) candidates.push({ text: fmt(wrongDir), misconception: 'wrong-direction' });
  candidates.push({ text: fmt(b), misconception: 'used-constant' });
  const offVal = safeNum(x + (rng() < 0.5 ? 1 : -1));
  if (offVal !== null) candidates.push({ text: fmt(offVal), misconception: 'off-by-one' });

  const correct = { text: fmt(x), misconception: null };
  const options = buildOptions(correct, candidates, 5, rng);

  return {
    templateId: 'mach-t2-letter-equation',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Undo the step using its OPPOSITE: “${OPS[op].symbol(b)}” undoes with “${OPS[op].invSymbol(b)}”.`,
      `${fmt(y)} ${OPS[op].invSymbol(b)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(y)} ${OPS[op].invSymbol(b)} = ${fmt(x)}. Check: ${fmt(x)} ${OPS[op].symbol(b)} = ${fmt(y)}. ✓`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

function t2ReverseTable(rng) {
  const { op, b } = genOneStep(rng, { xMin: 2, xMax: 20, bMin: 2, bMax: 9 });
  const xs = distinctInputsForOp(rng, op, b, 3);
  const targetIdx = rngInt(rng, 0, xs.length - 1);
  const targetX = xs[targetIdx];
  const targetY = OPS[op].apply(targetX, b);

  const rows = xs.map((x, i) => [i === targetIdx ? '?' : fmt(x), fmt(OPS[op].apply(x, b))]);
  const visual = { kind: 'table', headers: ['IN', 'OUT'], rows, highlight: [[targetIdx, 0]] };

  const stem = `This machine <b>${OPS[op].verbFwd(b)}</b>. One IN number is a mystery — use the Reverse Lever to find it.`;

  const candidates = [];
  const notInverted = safeNum(OPS[op].apply(targetY, b));
  if (notInverted !== null) candidates.push({ text: fmt(notInverted), misconception: 'not-inverted' });
  candidates.push({ text: fmt(targetY), misconception: 'copied-out' });
  const offVal = safeNum(targetX + (rng() < 0.5 ? 1 : -1));
  if (offVal !== null) candidates.push({ text: fmt(offVal), misconception: 'off-by-one' });
  const bAlt = b > 2 ? b - 1 : b + 1;
  const wrongConst = safeNum(OPS[op].inverse(targetY, bAlt));
  if (wrongConst !== null) candidates.push({ text: fmt(wrongConst), misconception: 'wrong-constant' });

  const correct = { text: fmt(targetX), misconception: null };
  const options = buildOptions(correct, candidates, 5, rng);

  return {
    templateId: 'mach-t2-reverse-table',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Every row uses the SAME rule: ${OPS[op].symbol(b)}. Find the row with the missing IN.`,
      `OUT = ${fmt(targetY)}. Undo the rule: ${fmt(targetY)} ${OPS[op].invSymbol(b)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `OUT = ${fmt(targetY)}. Undo ${OPS[op].symbol(b)} with ${OPS[op].invSymbol(b)}: ${fmt(targetY)} ${OPS[op].invSymbol(b)} = ${fmt(targetX)}.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// -------- T3 templates (num; reverse two-step, combined two-letter problems) --------

function t3ReverseTwoStep(rng) {
  const { x, op1, b1, mid, op2, b2, y } = genTwoStep(rng, { xMin: 2, xMax: 20, yCap: 400 });
  const stem = `A machine does this to every number: first it <b>${OPS[op1].verbFwd(b1)}</b>, then it <b>${OPS[op2].verbFwd(b2)}</b>. It spat out OUT = <b>${fmt(y)}</b>. What went IN?`;

  return {
    templateId: 'mach-t3-reverse-two-step',
    stem,
    format: 'num',
    accept: Array.from(new Set([String(x), fmt(x)])),
    hintSteps: [
      `Undo the LAST step first, using its OPPOSITE: ${OPS[op2].invSymbol(b2)}.`,
      `${fmt(y)} ${OPS[op2].invSymbol(b2)} = ${fmt(mid)}. Then undo the first step: ${fmt(mid)} ${OPS[op1].invSymbol(b1)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `Reverse order! Undo step 2 first: ${fmt(y)} ${OPS[op2].invSymbol(b2)} = ${fmt(mid)}. Then undo step 1: ${fmt(mid)} ${OPS[op1].invSymbol(b1)} = ${fmt(x)}. IN was ${fmt(x)}.`,
      whyWrong: {},
    },
  };
}

function t3LetterTwoStepEquation(rng) {
  const { x, op1, b1, mid, op2, b2, y } = genTwoStep(rng, { xMin: 2, xMax: 15, yCap: 300 });
  const letter = pick(rng, LETTERS);
  const stem = `The letter <b>${letter}</b> is a number wearing a disguise. It goes through a two-step machine: first it <b>${OPS[op1].verbFwd(b1)}</b>, then it <b>${OPS[op2].verbFwd(b2)}</b>. Out comes <b>${fmt(y)}</b>. What is <b>${letter}</b>?`;

  return {
    templateId: 'mach-t3-letter-two-step',
    stem,
    format: 'num',
    accept: Array.from(new Set([String(x), fmt(x)])),
    hintSteps: [
      `Undo the LAST step first, using its OPPOSITE: ${OPS[op2].invSymbol(b2)}.`,
      `${fmt(y)} ${OPS[op2].invSymbol(b2)} = ${fmt(mid)}. Then undo the first step: ${fmt(mid)} ${OPS[op1].invSymbol(b1)} = …? That’s ${letter}.`,
    ],
    explain: {
      rule: RULE,
      worked: `Reverse order! Undo step 2 first: ${fmt(y)} ${OPS[op2].invSymbol(b2)} = ${fmt(mid)}. Then undo step 1: ${fmt(mid)} ${OPS[op1].invSymbol(b1)} = ${fmt(x)}. So ${letter} = ${fmt(x)}.`,
      whyWrong: {},
    },
  };
}

// Chains three genOneStep-style steps: x -> (op1,b1) -> mid1 -> (op2,b2) -> mid2 -> (op3,b3) -> y.
// Same generation strategy as genTwoStep, one step longer, bounded so OUT stays kid-friendly.
function genThreeStep(rng, opts = {}) {
  const allowedOps = opts.allowedOps || OP_KEYS;
  const yCap = opts.yCap ?? 500;
  let tries = 0;
  while (tries < 300) {
    tries++;
    const step1 = genOneStep(rng, {
      xMin: opts.xMin ?? 2, xMax: opts.xMax ?? 12, bMin: 2, bMax: 9, allowedOps,
    });
    const { x, op: op1, b: b1, y: mid1 } = step1;
    const op2 = pick(rng, allowedOps);
    const b2 = rngInt(rng, 2, 9);
    if (op2 === 'sub' && mid1 <= b2) continue;
    if (op2 === 'div' && mid1 % b2 !== 0) continue;
    const mid2 = OPS[op2].apply(mid1, b2);
    if (!Number.isInteger(mid2) || mid2 < 0) continue;
    const op3 = pick(rng, allowedOps);
    const b3 = rngInt(rng, 2, 9);
    if (op3 === 'sub' && mid2 <= b3) continue;
    if (op3 === 'div' && mid2 % b3 !== 0) continue;
    const y = OPS[op3].apply(mid2, b3);
    if (!Number.isInteger(y) || y < 0 || y > yCap) continue;
    return {
      x, op1, b1, mid1, op2, b2, mid2, op3, b3, y,
    };
  }
  return {
    x: 3, op1: 'add', b1: 2, mid1: 5, op2: 'mul', b2: 2, mid2: 10, op3: 'sub', b3: 1, y: 9,
  };
}

function t3ReverseThreeStep(rng) {
  const {
    x, op1, b1, mid1, op2, b2, mid2, op3, b3, y,
  } = genThreeStep(rng, { xMin: 2, xMax: 12, yCap: 400 });
  const stem = `A machine does THREE things to every number, in order: it <b>${OPS[op1].verbFwd(b1)}</b>, then it <b>${OPS[op2].verbFwd(b2)}</b>, then it <b>${OPS[op3].verbFwd(b3)}</b>. It spat out OUT = <b>${fmt(y)}</b>. What went IN?`;

  return {
    templateId: 'mach-t3-reverse-three-step',
    stem,
    format: 'num',
    accept: Array.from(new Set([String(x), fmt(x)])),
    hintSteps: [
      `Undo the LAST step first, using its OPPOSITE: ${OPS[op3].invSymbol(b3)}.`,
      `${fmt(y)} ${OPS[op3].invSymbol(b3)} = ${fmt(mid2)}. Then undo the middle step: ${fmt(mid2)} ${OPS[op2].invSymbol(b2)} = ${fmt(mid1)}. Then undo the first step: ${fmt(mid1)} ${OPS[op1].invSymbol(b1)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `Reverse order! Undo step 3 first: ${fmt(y)} ${OPS[op3].invSymbol(b3)} = ${fmt(mid2)}. Then undo step 2: ${fmt(mid2)} ${OPS[op2].invSymbol(b2)} = ${fmt(mid1)}. Then undo step 1: ${fmt(mid1)} ${OPS[op1].invSymbol(b1)} = ${fmt(x)}. IN was ${fmt(x)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ApplyRule, t1FindRule, t1TableMissingOut];
const T2 = [t2ReverseOneStep, t2LetterEquationSolve, t2ReverseTable];
const T3 = [t3ReverseTwoStep, t3LetterTwoStepEquation, t3ReverseThreeStep];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `mach-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'machines-mystery',
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
