// FART QUEST — GEN agent
// Topic: mental-maths (Mental Maths Mudflats). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Jump to the nearest TEN first, then jump the rest.';

// Format a whole number with UK thousands commas (values in this topic never exceed 4 digits,
// but kept consistent with the other GEN modules' single fmt() helper).
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// Build a set of `count` distinct non-negative distractor values, given a list of semantically
// meaningful candidate {value, misconception} pairs (in priority order) plus a fallback random
// perturbation generator so a template never comes up short on rare collisions. Never includes
// `correctVal`.
//
// Fix (no answer-pattern tell): many semantic candidates skew one-directional (e.g. an
// "added-instead-of-complemented" slip is always bigger than the correct complement), which
// would otherwise mean the correct answer is NEVER the largest option — itself an exploitable
// "never pick the biggest number" tell. So each call randomly biases toward using ONLY
// below-correct candidates (correct ends up the max), ONLY above-correct candidates (correct
// ends up the min), or a natural mixed set — with a small-`correctVal` safety fallback to mixed
// when there simply aren't enough distinct non-negative values below it to fill the quota.
function pickDistractors(rng, correctVal, semanticCandidates, count, fallbackRange) {
  let mode = 'mixed';
  const r = rng();
  if (r < 0.2) mode = 'below';
  else if (r < 0.4) mode = 'above';
  if (mode === 'below' && correctVal < count) mode = 'mixed';

  const seen = new Set([correctVal]);
  const out = [];
  for (const cand of shuffle(rng, semanticCandidates)) {
    if (out.length >= count) break;
    if (!Number.isFinite(cand.value) || cand.value < 0) continue;
    if (mode === 'below' && cand.value >= correctVal) continue;
    if (mode === 'above' && cand.value <= correctVal) continue;
    if (seen.has(cand.value)) continue;
    seen.add(cand.value);
    out.push(cand);
  }
  // Widen phase: try to keep honouring the mode's direction first (a small domain, e.g. bonds
  // to 10, can exhaust its semantic below/above candidates quickly), then — critically — fall
  // back to EITHER direction so the option-count contract is always met even when the domain is
  // too small to keep the bias strict. Missing a `count` here would silently ship under-count
  // questions; keeping the direction merely "preferred, not required" never does.
  let guard = 0;
  while (out.length < count && guard < 400) {
    guard++;
    const biased = guard < 150 && mode !== 'mixed';
    let delta = rngInt(rng, 1, fallbackRange);
    if (biased) delta = mode === 'below' ? -delta : delta;
    else delta = rng() < 0.5 ? -delta : delta;
    const cand = correctVal + delta;
    if (cand < 0 || seen.has(cand)) continue;
    seen.add(cand);
    out.push({ value: cand, misconception: 'padded-near-miss' });
  }
  return out;
}

function toOptions(distractors) {
  return distractors.map((d) => ({ text: fmt(d.value), misconception: d.misconception }));
}

// -------- T1 templates --------

function t1BondTen(rng) {
  // "What number pairs with D to make 10?" — the Friends of Ten.
  const d = rngInt(rng, 1, 9);
  const correctVal = 10 - d;
  const stem = `What number pairs with <b>${d}</b> to make 10?`;

  const semantic = [
    { value: d, misconception: 'identity' }, // wrote the same number back
    { value: 10 + d, misconception: 'added-instead' }, // added instead of finding the partner
    { value: correctVal + 1, misconception: 'off-by-one' },
    { value: correctVal - 1, misconception: 'off-by-one' },
  ];
  const distractors = pickDistractors(rng, correctVal, semantic, 3, 4);
  const options = [{ text: fmt(correctVal), misconception: null }, ...toOptions(distractors)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'identity') whyWrong[o.text] = 'That’s the number you started with — you need its PARTNER, not itself.';
    else if (o.misconception === 'added-instead') whyWrong[o.text] = `That’s ${d} added onto 10 — you need what’s MISSING to reach 10, not extra.`;
    else if (o.misconception === 'off-by-one') whyWrong[o.text] = 'One out — recount up (or down) to 10.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the Friends of Ten pairing again.';
  }

  return {
    templateId: 'mm-t1-bond-ten',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Think of the Friends of Ten: what does ${d} need to make a full ten?`,
      `Count up from ${d} to 10 — how many steps is that?`,
    ],
    explain: {
      rule: RULE,
      worked: `${d} + ${correctVal} = 10.`,
      whyWrong,
    },
  };
}

function t1BondTwenty(rng) {
  // "What number pairs with D to make 20?" — the Friends of Twenty.
  const d = rngInt(rng, 1, 19);
  const correctVal = 20 - d;
  const stem = `What number pairs with <b>${d}</b> to make 20?`;

  const semantic = [
    { value: d, misconception: 'identity' },
    { value: 20 + d, misconception: 'added-instead' },
    { value: correctVal + 1, misconception: 'off-by-one' },
    { value: correctVal - 1, misconception: 'off-by-one' },
  ];
  const distractors = pickDistractors(rng, correctVal, semantic, 3, 4);
  const options = [{ text: fmt(correctVal), misconception: null }, ...toOptions(distractors)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'identity') whyWrong[o.text] = 'That’s the number you started with — you need its PARTNER, not itself.';
    else if (o.misconception === 'added-instead') whyWrong[o.text] = `That’s ${d} added onto 20 — you need what’s MISSING to reach 20, not extra.`;
    else if (o.misconception === 'off-by-one') whyWrong[o.text] = 'One out — recount up (or down) to 20.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the Friends of Twenty pairing again.';
  }

  return {
    templateId: 'mm-t1-bond-twenty',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Think of the Friends of Twenty: what does ${d} need to make a full twenty?`,
      `Count up from ${d} to 20 — how many steps is that?`,
    ],
    explain: {
      rule: RULE,
      worked: `${d} + ${correctVal} = 20.`,
      whyWrong,
    },
  };
}

function t1TablesFact(rng) {
  // A x B to 10x10, using skip-counting as the anchor. The 7x8 pairing gets its own famous,
  // deliberately-fixed confusion cluster (54 / 63 / 48) — the swamp's most muddled fact.
  const a = rngInt(rng, 2, 10);
  const b = rngInt(rng, 2, 10);
  const correctVal = a * b;
  const stem = `What is <b>${a} × ${b}</b>?`;

  let semantic;
  if ((a === 7 && b === 8) || (a === 8 && b === 7)) {
    semantic = [
      { value: 54, misconception: 'adjacent-fact' },
      { value: 63, misconception: 'adjacent-fact' },
      { value: 48, misconception: 'adjacent-fact' },
    ];
  } else {
    semantic = [
      { value: (a - 1) * b, misconception: 'adjacent-fact' },
      { value: (a + 1) * b, misconception: 'adjacent-fact' },
      { value: a * (b - 1), misconception: 'adjacent-fact' },
      { value: a * (b + 1), misconception: 'adjacent-fact' },
      { value: (a - 1) * (b + 1), misconception: 'adjacent-fact' },
      { value: (a + 1) * (b - 1), misconception: 'adjacent-fact' },
    ];
  }
  const distractors = pickDistractors(rng, correctVal, semantic, 3, Math.max(a, b) * 2);
  const options = [{ text: fmt(correctVal), misconception: null }, ...toOptions(distractors)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'adjacent-fact') whyWrong[o.text] = `That’s a neighbouring table fact, not ${a} × ${b} — skip-count carefully to check.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Skip-count in ${a}s (or ${b}s) again to check.`;
  }

  return {
    templateId: 'mm-t1-tables-fact',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Skip-count in ${a}s, ${b} times.`,
      `Or skip-count in ${b}s, ${a} times — both land on the same fact.`,
    ],
    explain: {
      rule: RULE,
      worked: `${a} × ${b} = ${correctVal}.`,
      whyWrong,
    },
  };
}

function t1TablesReverse(rng) {
  // Division as a reverse table fact: N ÷ A = ? (num write-in).
  const a = rngInt(rng, 2, 10);
  const b = rngInt(rng, 2, 10);
  const n = a * b;
  const stem = `What is <b>${n} ÷ ${a}</b>?`;

  return {
    templateId: 'mm-t1-tables-reverse',
    stem,
    format: 'num',
    accept: [String(b), fmt(b)],
    hintSteps: [
      `Think of the times table running backwards: ${a} × ? = ${n}.`,
      `${a} × ${b} = ${n}, so ${n} ÷ ${a} = ${b}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${a} × ${b} = ${n}, so ${n} ÷ ${a} = ${b}.`,
      whyWrong: {},
    },
  };
}

// -------- T2 templates --------

function t2AddTwoDigit(rng) {
  // Two-digit + two-digit mental addition. Method (matches the lesson, generalised): jump the
  // WHOLE TENS of the second number first (a big, easy jump), THEN bridge the last single ones
  // digit through the running total's ten-friend — the exact same single-digit technique taught
  // in the lesson, just applied to the leftover ones instead of the whole second number. ALWAYS
  // crossing a ten at the bridge step so the "forgot the carried ten" trap is genuine.
  let a, b;
  let tries = 0;
  do {
    a = rngInt(rng, 10, 88);
    b = rngInt(rng, 10, 88);
    tries++;
  } while ((a % 10) + (b % 10) < 10 && tries < 200);

  const correctVal = a + b;
  const stem = `What is <b>${a} + ${b}</b>?`;

  const tensB = Math.floor(b / 10);
  const onesB = b % 10;
  const afterTens = a + tensB * 10; // big jump: add the whole tens of b first
  const tenFriend = afterTens - (afterTens % 10) + 10; // afterTens keeps a's units digit, so this always exists
  const jump1 = tenFriend - afterTens;
  const jump2 = onesB - jump1;

  const semantic = [
    { value: correctVal - 10, misconception: 'forgot-carry' },
    { value: correctVal + 10, misconception: 'extra-ten' },
    { value: correctVal + 1, misconception: 'off-by-one' },
    { value: correctVal - 1, misconception: 'off-by-one' },
    { value: correctVal + 9, misconception: 'near-miss' },
    { value: correctVal - 9, misconception: 'near-miss' },
    { value: correctVal + 11, misconception: 'near-miss' },
    { value: correctVal - 11, misconception: 'near-miss' },
  ];
  const distractors = pickDistractors(rng, correctVal, semantic, 4, 6);
  const options = [{ text: fmt(correctVal), misconception: null }, ...toOptions(distractors)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'forgot-carry') whyWrong[o.text] = 'That forgets the carried ten from the units jump — check it again.';
    else if (o.misconception === 'extra-ten') whyWrong[o.text] = 'Ten too many — check how far you actually jumped to the ten-friend.';
    else if (o.misconception === 'off-by-one') whyWrong[o.text] = 'One out — recount the second little jump.';
    else if (o.misconception === 'near-miss' || o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Close, but re-check both jumps carefully.';
  }

  return {
    templateId: 'mm-t2-add-two-digit',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `First jump the whole tens of ${b}: ${a} + ${tensB * 10} = ${afterTens}.`,
      jump2 > 0
        ? `Now bridge the last ${onesB}: jump ${jump1} to reach the ten-friend ${tenFriend}, then the final ${jump2}. ${tenFriend} + ${jump2} = …?`
        : `Now bridge the last ${onesB}: jump ${jump1} to reach the ten-friend ${tenFriend} — that uses up the whole ${onesB} exactly, so that IS your answer!`,
    ],
    explain: {
      rule: RULE,
      worked: jump2 > 0
        ? `${a} + ${tensB * 10} = ${afterTens} (the whole tens first). Then ${afterTens} + ${jump1} = ${tenFriend} (ten-friend!), and ${tenFriend} + ${jump2} = ${correctVal}. So ${a} + ${b} = ${correctVal}.`
        : `${a} + ${tensB * 10} = ${afterTens} (the whole tens first). Then ${afterTens} + ${jump1} = ${tenFriend} (ten-friend!) — that used up the whole ${onesB} exactly. So ${a} + ${b} = ${correctVal}.`,
      whyWrong,
    },
  };
}

function t2SubTwoDigit(rng) {
  // Two-digit - two-digit mental subtraction. Method (mirrors the addition template): jump DOWN
  // the whole tens of the second number first, THEN bridge the last single ones digit down
  // through the running total's ten-friend below. ALWAYS needing a borrow at the bridge step
  // (units of A < units of B, and A's units digit non-zero so the first bridge jump is genuine)
  // so the direction trap and the "forgot to borrow" trap are both real.
  let a, b;
  let tries = 0;
  do {
    a = rngInt(rng, 30, 96);
    b = rngInt(rng, 10, a - 1);
    tries++;
  } while (!((a % 10) > 0 && (a % 10) < (b % 10)) && tries < 300);

  const correctVal = a - b;
  const stem = `What is <b>${a} − ${b}</b>?`;

  const tensB = Math.floor(b / 10);
  const onesB = b % 10;
  const afterTens = a - tensB * 10; // big jump: subtract the whole tens of b first
  const tenFriend = Math.floor(afterTens / 10) * 10; // afterTens keeps a's units digit, so this always exists
  const jump1 = afterTens - tenFriend;
  const jump2 = onesB - jump1;

  const tensNaive = Math.floor(a / 10) - Math.floor(b / 10);
  const unitsNaiveAbs = Math.abs((a % 10) - (b % 10));
  const noBorrowReversed = tensNaive * 10 + unitsNaiveAbs;

  const semantic = [
    { value: correctVal - 10, misconception: 'over-borrow' },
    { value: correctVal + 10, misconception: 'missed-borrow' },
    { value: correctVal + 1, misconception: 'off-by-one' },
    { value: correctVal - 1, misconception: 'off-by-one' },
    { value: noBorrowReversed, misconception: 'no-borrow-reversed' },
    { value: correctVal + 9, misconception: 'near-miss' },
    { value: correctVal - 9, misconception: 'near-miss' },
  ];
  const distractors = pickDistractors(rng, correctVal, semantic, 4, 6);
  const options = [{ text: fmt(correctVal), misconception: null }, ...toOptions(distractors)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'over-borrow') whyWrong[o.text] = 'Ten too few — check how far you jumped to the ten-friend.';
    else if (o.misconception === 'missed-borrow') whyWrong[o.text] = 'That forgets the borrow — the ten-friend jump gives away a whole ten.';
    else if (o.misconception === 'off-by-one') whyWrong[o.text] = 'One out — recount the second little jump.';
    else if (o.misconception === 'no-borrow-reversed') whyWrong[o.text] = 'That subtracts the smaller digit from the bigger one in each column instead of borrowing — check the units again.';
    else if (o.misconception === 'near-miss' || o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Close, but re-check both jumps carefully.';
  }

  return {
    templateId: 'mm-t2-sub-two-digit',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `First jump down the whole tens of ${b}: ${a} − ${tensB * 10} = ${afterTens}.`,
      `Now bridge the last ${onesB} down: jump ${jump1} down to the ten-friend ${tenFriend}, then the final ${jump2}. ${tenFriend} − ${jump2} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${a} − ${tensB * 10} = ${afterTens} (the whole tens first). Then ${afterTens} − ${jump1} = ${tenFriend} (ten-friend!), and ${tenFriend} − ${jump2} = ${correctVal}. So ${a} − ${b} = ${correctVal}.`,
      whyWrong,
    },
  };
}

function t2MissingFactor(rng) {
  // Missing-number fact: A x [ ] = target.
  const a = rngInt(rng, 2, 10);
  const bTrue = rngInt(rng, 2, 10);
  const target = a * bTrue;
  const stem = `${a} × ☐ = ${target}. What is ☐?`;
  const correctVal = bTrue;

  const semantic = [
    { value: bTrue + 1, misconception: 'off-by-one' },
    { value: bTrue - 1, misconception: 'off-by-one' },
    { value: bTrue + 2, misconception: 'off-by-two' },
    { value: bTrue - 2, misconception: 'off-by-two' },
    { value: a, misconception: 'divisor-echo' },
    { value: target, misconception: 'no-divide' },
  ];
  const distractors = pickDistractors(rng, correctVal, semantic, 4, 5);
  const options = [{ text: fmt(correctVal), misconception: null }, ...toOptions(distractors)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'off-by-one') whyWrong[o.text] = 'One skip out — recount the jumps in that table.';
    else if (o.misconception === 'off-by-two') whyWrong[o.text] = 'Two skips out — recount the jumps in that table.';
    else if (o.misconception === 'divisor-echo') whyWrong[o.text] = `That’s the number already given (${a}) — the missing box needs the OTHER factor.`;
    else if (o.misconception === 'no-divide') whyWrong[o.text] = 'That’s the total itself — you still need to work out how many times it splits.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Skip-count in ${a}s to check.`;
  }

  return {
    templateId: 'mm-t2-missing-factor',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Think: ${a} times what number lands on ${target}?`,
      `Skip-count in ${a}s until you reach ${target}. How many jumps was that?`,
    ],
    explain: {
      rule: RULE,
      worked: `${a} × ${bTrue} = ${target}, so ☐ = ${bTrue}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format) --------

function t3Chain(rng) {
  // Chains: 23 + 38 - 9 style, worked left to right, always non-negative throughout.
  // `a` has a floor of 25 so that a subtracting first step (b up to a-15) always leaves
  // r1 >= 15 — enough headroom that a subtracting second step (c up to r1, floor 5) can
  // NEVER be forced above r1 and go negative.
  const a = rngInt(rng, 25, 89);
  const op1 = pick(rng, ['+', '-']);
  const b = op1 === '-' ? rngInt(rng, 5, a - 15) : rngInt(rng, 5, 60);
  const r1 = op1 === '+' ? a + b : a - b;
  const op2 = pick(rng, ['+', '-']);
  const c = op2 === '-' ? rngInt(rng, 5, Math.min(40, r1)) : rngInt(rng, 5, 40);
  const final = op2 === '+' ? r1 + c : r1 - c;
  const opSym1 = op1 === '-' ? '−' : '+';
  const opSym2 = op2 === '-' ? '−' : '+';

  const stem = `${a} ${opSym1} ${b} ${opSym2} ${c} = ?`;

  return {
    templateId: 'mm-t3-chain',
    stem,
    format: 'num',
    accept: [String(final), fmt(final)],
    hintSteps: [
      `Work left to right: first ${a} ${opSym1} ${b} = ${r1}.`,
      `Then ${r1} ${opSym2} ${c} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${a} ${opSym1} ${b} = ${r1}. ${r1} ${opSym2} ${c} = ${final}.`,
      whyWrong: {},
    },
  };
}

function t3HowManyOfX(rng) {
  // "How many 8s are in 72?" — division fact reversed phrasing.
  const d = rngInt(rng, 2, 10);
  const q = rngInt(rng, 2, 10);
  const n = d * q;
  const stem = `How many <b>${d}s</b> are in <b>${n}</b>?`;

  return {
    templateId: 'mm-t3-how-many-of',
    stem,
    format: 'num',
    accept: [String(q), fmt(q)],
    hintSteps: [
      `Think of the times table: ${d} × ? = ${n}.`,
      `${d} × ${q} = ${n}, so there are ${q} lots of ${d} in ${n}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${d} × ${q} = ${n}, so there are ${q} ${d}s in ${n}.`,
      whyWrong: {},
    },
  };
}

function t3ComplementTo100(rng) {
  // Bonds to 100 — the big cousin of Friends of Ten/Twenty.
  const n = rngInt(rng, 1, 99);
  const correctVal = 100 - n;
  const stem = `☐ + ${n} = 100. What is ☐?`;

  return {
    templateId: 'mm-t3-complement-100',
    stem,
    format: 'num',
    accept: [String(correctVal), fmt(correctVal)],
    hintSteps: [
      `Jump ${n} up to its own nearest ten first, then keep track of the rest to 100.`,
      `Or flip it round: 100 − ${n} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `100 − ${n} = ${correctVal}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1BondTen, t1BondTwenty, t1TablesFact, t1TablesReverse];
const T2 = [t2AddTwoDigit, t2SubTwoDigit, t2MissingFactor];
const T3 = [t3Chain, t3HowManyOfX, t3ComplementTo100];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `mm-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'mental-maths',
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
