// FART QUEST — GEN agent
// Topic: perimeter (The Prowler's Fence). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Walk EVERY side and add as you go. Hidden sides still count — find them before you walk.';

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
function fmtUnit(n, unit) {
  return `${fmt(n)} ${unit}`;
}

// Unit range configs shared across templates — metres for bigger fields/gardens,
// centimetres for smaller pens/flags. Keeps every generated number a whole number
// (perimeter never needs decimals for this topic; stays within the ≤2dp / no-imperial rule
// trivially by only ever using whole metric units).
const UNITS = [
  { unit: 'm', min: 4, max: 22 },
  { unit: 'cm', min: 5, max: 60 },
];

// -------- shared mcq-option building helpers --------

// Builds the mcq option list from a correct value and a list of {val, misconception}
// distractor specs, all formatted with the same unit. Guarantees uniqueness (numeric nudge
// on collision) and pads with plausible near-miss values if the pool is short of `minOptions`.
// Returns { options, correctOption } — options[*] = {text, misconception}, correct not yet
// placed at any particular (pre-shuffle) index by design; caller shuffles and re-finds it.
function buildOptions(correctVal, unit, distractorSpecs, minOptions) {
  const used = new Set([Math.round(correctVal)]);
  const correctOption = { text: fmtUnit(correctVal, unit), misconception: null, _val: Math.round(correctVal) };
  const options = [correctOption];
  for (const d of distractorSpecs) {
    let v = Math.round(d.val);
    if (v < 0) v = Math.abs(v) + 1;
    let guard = 0;
    while (used.has(v) && guard < 30) { v += 1; guard++; }
    used.add(v);
    options.push({ text: fmtUnit(v, unit), misconception: d.misconception, _val: v });
  }
  let step = Math.max(1, Math.round(Math.abs(correctVal) * 0.12) || 1);
  let tries = 0;
  while (options.length < minOptions && tries < 40) {
    tries++;
    const sign = options.length % 2 === 0 ? 1 : -1;
    let v = Math.round(correctVal) + sign * step * Math.ceil(options.length / 2);
    if (v < 1) v = Math.round(correctVal) + step * options.length + 1;
    if (!used.has(v)) {
      used.add(v);
      options.push({ text: fmtUnit(v, unit), misconception: 'padded-near-miss', _val: v });
    } else {
      step += 1;
    }
  }
  return { options, correctOption };
}

// Shuffles built options and returns { options: [{text,misconception}], correctIndex }.
function finalizeMcq(rng, correctVal, unit, distractorSpecs, minOptions) {
  const { options, correctOption } = buildOptions(correctVal, unit, distractorSpecs, minOptions);
  const shuffled = shuffle(rng, options);
  const correctIndex = shuffled.findIndex((o) => o === correctOption);
  return {
    options: shuffled.map((o) => ({ text: o.text, misconception: o.misconception })),
    correctIndex,
  };
}

// -------- T1 templates (rectangle / square / equilateral triangle, all sides labelled) --------

function t1RectAllSides(rng) {
  const cfg = pick(rng, UNITS);
  const { unit } = cfg;
  let l = rngInt(rng, cfg.min, cfg.max);
  let w = rngInt(rng, cfg.min, cfg.max);
  while (w === l) w = rngInt(rng, cfg.min, cfg.max);
  if (w > l) [l, w] = [w, l];
  const total = 2 * (l + w);
  const halfOnly = l + w;
  const area = l * w;
  const miscount = l + w + l; // three sides only, dropped the last one

  const stem = 'The Perimeter Prowler is patrolling this rectangular paddock. Walk every side and add them up. What is the perimeter?';
  const visual = { kind: 'shape', shapeKind: 'rect', labels: [fmtUnit(l, unit), fmtUnit(w, unit), fmtUnit(l, unit), fmtUnit(w, unit)] };

  const { options, correctIndex } = finalizeMcq(rng, total, unit, [
    { val: halfOnly, misconception: 'half-only' },
    { val: area, misconception: 'area-confusion' },
    { val: miscount, misconception: 'miscount' },
  ], 4);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'half-only') whyWrong[o.text] = 'That\'s only two sides added together — length + width. The Prowler must walk all FOUR sides, not just two.';
    else if (o.misconception === 'area-confusion') whyWrong[o.text] = 'That\'s the AREA (the space inside), not the perimeter (the walk around the outside edge).';
    else if (o.misconception === 'miscount') whyWrong[o.text] = 'You added three sides but skipped the fourth! Count all four sides all the way round.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check every side again — walk the full way round and add each one.';
  }

  return {
    templateId: 'perim-t1-rect-all-sides',
    stem,
    visual,
    options,
    correctIndex,
    hintSteps: [
      `Walk around the shape one side at a time: ${l} + ${w} + ${l} + ${w}. Don't skip a side!`,
      `${l} + ${w} = ${l + w}. There are two of each side, so double it: ${l + w} × 2 = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${l} + ${w} + ${l} + ${w} = ${fmtUnit(total, unit)}. (Shortcut: 2 × (${l} + ${w}) = 2 × ${l + w} = ${fmtUnit(total, unit)}.)`,
      whyWrong,
    },
  };
}

function t1SquareAllSides(rng) {
  const cfg = pick(rng, UNITS);
  const { unit } = cfg;
  const s = rngInt(rng, cfg.min, cfg.max);
  const total = 4 * s;
  const halfOnly = 2 * s;
  const area = s * s;
  const miscount = 3 * s;

  const stem = `Every side of this square pen is the same length. Walk every side and add them up. What is the perimeter?`;
  const visual = { kind: 'shape', shapeKind: 'square', labels: [fmtUnit(s, unit), fmtUnit(s, unit), fmtUnit(s, unit), fmtUnit(s, unit)] };

  const { options, correctIndex } = finalizeMcq(rng, total, unit, [
    { val: halfOnly, misconception: 'half-only' },
    { val: area, misconception: 'area-confusion' },
    { val: miscount, misconception: 'miscount' },
  ], 4);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'half-only') whyWrong[o.text] = 'That\'s only two sides. A square has FOUR equal sides — walk all of them.';
    else if (o.misconception === 'area-confusion') whyWrong[o.text] = `That's the AREA (${s} × ${s}, the space inside), not the perimeter — the distance AROUND the edge.`;
    else if (o.misconception === 'miscount') whyWrong[o.text] = 'You only walked three of the four equal sides.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'A square has four EQUAL sides — check you added all four.';
  }

  return {
    templateId: 'perim-t1-square-all-sides',
    stem,
    visual,
    options,
    correctIndex,
    hintSteps: [
      `A square has FOUR equal sides. Every side here is ${fmtUnit(s, unit)}.`,
      `${s} + ${s} + ${s} + ${s}, or the shortcut: ${s} × 4 = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `A square has 4 equal sides. ${s} × 4 = ${fmtUnit(total, unit)} (or ${s}+${s}+${s}+${s} = ${fmtUnit(total, unit)}).`,
      whyWrong,
    },
  };
}

function t1EquilateralTriangle(rng) {
  const unit = 'cm';
  const s = rngInt(rng, 3, 18);
  const total = 3 * s;
  const miscountTwo = 2 * s;
  const squaredNotTripled = s * s;
  const wrongSideCount = 4 * s;

  const stem = `This triangular flag has three EQUAL sides, each ${fmtUnit(s, unit)}. What is its perimeter?`;
  const visual = { kind: 'shape', shapeKind: 'triangle-equilateral', labels: [fmtUnit(s, unit), fmtUnit(s, unit), fmtUnit(s, unit)] };

  const { options, correctIndex } = finalizeMcq(rng, total, unit, [
    { val: miscountTwo, misconception: 'miscount' },
    { val: squaredNotTripled, misconception: 'area-confusion' },
    { val: wrongSideCount, misconception: 'wrong-side-count' },
  ], 4);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'miscount') whyWrong[o.text] = 'That\'s only two sides. A triangle has THREE sides here — walk all of them.';
    else if (o.misconception === 'area-confusion') whyWrong[o.text] = `That's ${s} × ${s}, not the perimeter. Perimeter just ADDS the sides together — it doesn't multiply a side by itself.`;
    else if (o.misconception === 'wrong-side-count') whyWrong[o.text] = 'This shape has THREE sides, not four — count the corners of the flag again.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the number of sides on this shape, then add them all.';
  }

  return {
    templateId: 'perim-t1-triangle',
    stem,
    visual,
    options,
    correctIndex,
    hintSteps: [
      `This shape has THREE equal sides, each ${fmtUnit(s, unit)}.`,
      `${s} + ${s} + ${s}, or the shortcut: ${s} × 3 = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Three equal sides of ${fmtUnit(s, unit)}: ${s} × 3 = ${fmtUnit(total, unit)}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates (rectangle from l+w only, regular polygon, reverse find-a-side) --------

function t2RectFromLW(rng) {
  const cfg = pick(rng, UNITS);
  const { unit } = cfg;
  let l = rngInt(rng, cfg.min, cfg.max);
  let w = rngInt(rng, cfg.min, cfg.max);
  while (w === l) w = rngInt(rng, cfg.min, cfg.max);
  if (w > l) [l, w] = [w, l];
  const total = 2 * (l + w);
  const halfOnly = l + w;
  const area = l * w;
  const miscountThree = l + w + l;
  const doubledOneSideOnly = 2 * l;

  const stem = `A rectangular field is <b>${fmtUnit(l, unit)}</b> long and <b>${fmtUnit(w, unit)}</b> wide. Both pairs of opposite sides are equal. What is the perimeter?`;
  const visual = { kind: 'shape', shapeKind: 'rect', labels: [fmtUnit(l, unit), fmtUnit(w, unit), '', ''] };

  const { options, correctIndex } = finalizeMcq(rng, total, unit, [
    { val: halfOnly, misconception: 'half-only' },
    { val: area, misconception: 'area-confusion' },
    { val: miscountThree, misconception: 'miscount' },
    { val: doubledOneSideOnly, misconception: 'ignored-one-side' },
  ], 5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'half-only') whyWrong[o.text] = 'That\'s length + width once — but each side of a rectangle appears TWICE. Double it.';
    else if (o.misconception === 'area-confusion') whyWrong[o.text] = 'That\'s the AREA (length × width), not the perimeter (the distance all the way round).';
    else if (o.misconception === 'miscount') whyWrong[o.text] = 'You added three sides but this shape has four — the fourth side is equal to one you\'ve already used.';
    else if (o.misconception === 'ignored-one-side') whyWrong[o.text] = 'That only doubles the length and forgets the width completely. Opposite sides are equal, but length and width are still DIFFERENT.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Remember: opposite sides are equal, so you need both the length and the width, each counted twice.';
  }

  return {
    templateId: 'perim-t2-rect-from-lw',
    stem,
    visual,
    options,
    correctIndex,
    hintSteps: [
      'Opposite sides of a rectangle are always equal, so the four sides are: length, width, length, width.',
      `2 × (${l} + ${w}) = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Opposite sides are equal: ${l}, ${w}, ${l}, ${w}. 2 × (${l} + ${w}) = ${fmtUnit(total, unit)}.`,
      whyWrong,
    },
  };
}

function t2RegularPolygonWord(rng) {
  const shapeInfo = pick(rng, [
    { n: 5, name: 'REGULAR PENTAGON' },
    { n: 6, name: 'REGULAR HEXAGON' },
    { n: 7, name: 'REGULAR HEPTAGON' },
    { n: 8, name: 'REGULAR OCTAGON' },
  ]);
  const unit = 'cm';
  const s = rngInt(rng, 4, 20);
  const total = shapeInfo.n * s;
  const addedNotMultiplied = s + shapeInfo.n;
  const digitOnly = s;
  const wrongSideCountLow = s * Math.max(3, shapeInfo.n - 2);
  const wrongSideCountHigh = s * (shapeInfo.n + 1);

  const stem = `A ${shapeInfo.name} has ${shapeInfo.n} equal sides, each ${fmtUnit(s, unit)} long. What is its perimeter?`;

  const { options, correctIndex } = finalizeMcq(rng, total, unit, [
    { val: addedNotMultiplied, misconception: 'added-not-multiplied' },
    { val: digitOnly, misconception: 'digit-only' },
    { val: wrongSideCountLow, misconception: 'wrong-side-count' },
    { val: wrongSideCountHigh, misconception: 'wrong-side-count' },
  ], 5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'added-not-multiplied') whyWrong[o.text] = `You added the side length and the number of sides instead of multiplying them. It's ${s} × ${shapeInfo.n}, not ${s} + ${shapeInfo.n}.`;
    else if (o.misconception === 'digit-only') whyWrong[o.text] = 'That\'s just ONE side. The shape has several equal sides — multiply by how many there are.';
    else if (o.misconception === 'wrong-side-count') whyWrong[o.text] = `Count the sides again — this shape has exactly ${shapeInfo.n} equal sides.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Check the number of sides (${shapeInfo.n}) and multiply by the side length.`;
  }

  return {
    templateId: 'perim-t2-regular-polygon',
    stem,
    options,
    correctIndex,
    hintSteps: [
      `A regular shape's perimeter is: number of sides × one side length.`,
      `${shapeInfo.n} × ${s} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${shapeInfo.n} equal sides of ${fmtUnit(s, unit)}: ${shapeInfo.n} × ${s} = ${fmtUnit(total, unit)}.`,
      whyWrong,
    },
  };
}

function t2ReverseFindSide(rng) {
  const cfg = pick(rng, UNITS);
  const { unit } = cfg;
  let l = rngInt(rng, cfg.min, cfg.max);
  let other = rngInt(rng, cfg.min, cfg.max);
  while (other === l) other = rngInt(rng, cfg.min, cfg.max);
  const total = 2 * (l + other);

  const forgotHalf = total - l; // subtracted the given side straight from the whole perimeter
  const forgotSubtract = total / 2; // halved the perimeter but forgot to remove the given side
  const sameSide = l; // just repeated the given side
  const addedNotSubtracted = total / 2 + l; // added the given side instead of subtracting it

  const stem = `A rectangular pen has a perimeter of <b>${fmtUnit(total, unit)}</b>. One side is <b>${fmtUnit(l, unit)}</b>. What is the length of the other side?`;

  const { options, correctIndex } = finalizeMcq(rng, other, unit, [
    { val: forgotHalf, misconception: 'forgot-half' },
    { val: forgotSubtract, misconception: 'forgot-subtract' },
    { val: sameSide, misconception: 'same-side' },
    { val: addedNotSubtracted, misconception: 'added-not-subtracted' },
  ], 5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'forgot-half') whyWrong[o.text] = 'The perimeter counts EVERY side twice each — you can\'t just subtract the given side from the whole perimeter. Halve the perimeter first.';
    else if (o.misconception === 'forgot-subtract') whyWrong[o.text] = 'That\'s half the perimeter — but it still includes the given side. Subtract it to find the other one.';
    else if (o.misconception === 'same-side') whyWrong[o.text] = 'A rectangle\'s two different sides aren\'t usually equal — this repeats the side you were already given.';
    else if (o.misconception === 'added-not-subtracted') whyWrong[o.text] = 'You added the given side back on instead of subtracting it from half the perimeter.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Halve the perimeter first, THEN subtract the side you already know.';
  }

  return {
    templateId: 'perim-t2-reverse-find-side',
    stem,
    options,
    correctIndex,
    hintSteps: [
      `Half the perimeter is one length + one width: ${fmtUnit(total, unit)} ÷ 2 = ${fmt(total / 2)} ${unit}.`,
      `${fmt(total / 2)} − ${l} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Half the perimeter = ${fmtUnit(total, unit)} ÷ 2 = ${fmt(total / 2)} ${unit}. The other side = ${fmt(total / 2)} − ${l} = ${fmtUnit(other, unit)}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num, L-shape derivation + algebraic reverse-perimeter) --------

function buildLShape(rng) {
  const unit = pick(rng, ['m', 'cm']);
  const min = unit === 'm' ? 8 : 16;
  const max = unit === 'm' ? 24 : 60;
  const W = rngInt(rng, min, max);
  const H = rngInt(rng, min, max);
  const topA = rngInt(rng, 3, W - 3);
  const sideB = rngInt(rng, 2, H - 3);
  const hiddenC = W - topA;
  const hiddenD = H - sideB;
  return { unit, W, H, topA, sideB, hiddenC, hiddenD };
}

function t3LShapeTotal(rng) {
  const { unit, W, H, topA, sideB, hiddenC, hiddenD } = buildLShape(rng);
  const total = topA + sideB + hiddenC + hiddenD + W + H;

  const stem = 'This L-shaped garden has two hidden sides (marked with a <b>?</b>). Derive them, then find the TOTAL perimeter — walk every side.';
  const visual = {
    kind: 'shape',
    shapeKind: 'compound-L',
    labels: [fmtUnit(topA, unit), fmtUnit(sideB, unit), '?', '?', fmtUnit(W, unit), fmtUnit(H, unit)],
  };

  return {
    templateId: 'perim-t3-lshape-total',
    stem,
    format: 'num',
    visual,
    unit,
    accept: [String(total), fmt(total)],
    hintSteps: [
      `Find the hidden sides first: the top arm is ${topA} ${unit} out of a ${W} ${unit} base, so the missing horizontal piece = ${W} − ${topA} = ${hiddenC} ${unit}. The right arm is ${sideB} ${unit} out of a ${H} ${unit} side, so the missing vertical piece = ${H} − ${sideB} = ${hiddenD} ${unit}.`,
      `Now add ALL SIX sides: ${topA} + ${sideB} + ${hiddenC} + ${hiddenD} + ${W} + ${H} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Hidden sides: ${W} − ${topA} = ${hiddenC} ${unit} and ${H} − ${sideB} = ${hiddenD} ${unit}. Walk all six sides: ${topA} + ${sideB} + ${hiddenC} + ${hiddenD} + ${W} + ${H} = ${fmtUnit(total, unit)}.`,
      whyWrong: {},
    },
  };
}

function t3LShapeFindHiddenSide(rng) {
  const { unit, W, H, topA, sideB, hiddenC, hiddenD } = buildLShape(rng);
  const askC = rng() < 0.5;
  const answer = askC ? hiddenC : hiddenD;

  const stem = 'Look at the side marked <b>★?</b> on this L-shaped plot. Using the labelled sides, what length must it be?';
  const visual = {
    kind: 'shape',
    shapeKind: 'compound-L',
    labels: [
      fmtUnit(topA, unit),
      fmtUnit(sideB, unit),
      askC ? '★?' : '?',
      askC ? '?' : '★?',
      fmtUnit(W, unit),
      fmtUnit(H, unit),
    ],
  };

  const hint1 = askC
    ? `The bottom of the whole shape runs ${W} ${unit} altogether, and ${topA} ${unit} of that is already labelled along the top. What's left over along the bottom?`
    : `The left side of the whole shape runs ${H} ${unit} altogether, and ${sideB} ${unit} of that is already labelled near the top arm. What's left over down the side?`;
  const hint2 = askC ? `${W} − ${topA} = ?` : `${H} − ${sideB} = ?`;
  const worked = askC
    ? `The full bottom is ${W} ${unit} and the labelled top piece is ${topA} ${unit}, so the hidden piece = ${W} − ${topA} = ${hiddenC} ${unit}.`
    : `The full left side is ${H} ${unit} and the labelled arm piece is ${sideB} ${unit}, so the hidden piece = ${H} − ${sideB} = ${hiddenD} ${unit}.`;

  return {
    templateId: 'perim-t3-lshape-find-hidden',
    stem,
    format: 'num',
    visual,
    unit,
    accept: [String(answer)],
    hintSteps: [hint1, hint2],
    explain: {
      rule: RULE,
      worked,
      whyWrong: {},
    },
  };
}

function t3AlgebraicReverse(rng) {
  const cfg = pick(rng, UNITS);
  const { unit } = cfg;
  const w = rngInt(rng, cfg.min, cfg.max);
  const diff = rngInt(rng, 2, Math.max(3, Math.floor(cfg.max / 3)));
  const l = w + diff;
  const total = 2 * (l + w);
  const halfPerim = total / 2;

  const stem = `A rectangular pen has a perimeter of <b>${fmtUnit(total, unit)}</b>. Its length is <b>${fmtUnit(diff, unit)}</b> more than its width. What is the width?`;

  return {
    templateId: 'perim-t3-algebraic-reverse',
    stem,
    format: 'num',
    visual: null,
    unit,
    accept: [String(w)],
    hintSteps: [
      `Half the perimeter is one length + one width: ${fmtUnit(total, unit)} ÷ 2 = ${fmt(halfPerim)} ${unit}.`,
      `The length is width + ${diff}, so width + (width + ${diff}) = ${fmt(halfPerim)}. That means 2 × width = ${fmt(halfPerim)} − ${diff} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Half the perimeter = ${fmtUnit(total, unit)} ÷ 2 = ${fmt(halfPerim)} ${unit} — that's one length + one width. Since length = width + ${diff}, 2 × width = ${fmt(halfPerim)} − ${diff} = ${fmt(halfPerim - diff)}, so width = ${fmtUnit(w, unit)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1RectAllSides, t1SquareAllSides, t1EquilateralTriangle];
const T2 = [t2RectFromLW, t2RegularPolygonWord, t2ReverseFindSide];
const T3 = [t3LShapeTotal, t3LShapeFindHiddenSide, t3AlgebraicReverse];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `perimeter-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'perimeter',
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
