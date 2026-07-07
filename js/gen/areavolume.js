// FART QUEST — GEN agent
// Topic: area-volume (The Filling Fields). generate(tier, rng) -> Question.
//
// visual spec conventions used in this file (ENGINE_SPEC_2 §C, plain data — never import
// diagrams.js from a generator; the UI/battle layer owns turning these into SVG):
//   polygrid{rows,cols,shaded:[cellIndex,...]}  — cellIndex = row*cols + col, 0-indexed.
//   cuboid{w,h,d}                                — isometric box, auto-labelled "w = / h = / d = ".
//   shape{kind:'shape', shapeKind:'rect'|'square', labels:[edge0,edge1,edge2,edge3]} — edge i is
//     the side from outline-vertex i to vertex i+1; for 'rect'/'square' edge0 = top, edge1 = right.
//     Only the sides actually given in the question are labelled; the rest are ''.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Area = tiles that cover it (length × width). Volume = stacked layers (× height too).';

// Single number formatter: rounds to 2dp (kills float dust) then renders with UK thousands
// commas and no trailing zeros (10.50 -> "10.5", 10.00 -> "10"). Every number in this file
// passes through here before it becomes option/stem/accept text.
function fmt(n) {
  const r = Math.round(n * 100) / 100;
  return r.toLocaleString('en-GB', { maximumFractionDigits: 2 });
}

// Dedupe candidate distractors against the correct text and each other, keep first `n`.
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

// Ensure at least `min` total options. `padFn(rng)` lazily invents extra plausible
// near-miss numeric distractors (never random garbage) if dedup left us short.
function makeMcq(correct, distractorPool, rng, n, min, padFn) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  if (padFn) {
    const seen = new Set(options.map((o) => o.text));
    let guard = 0;
    while (options.length < min && guard < 60) {
      guard++;
      const cand = padFn(rng, guard);
      if (!cand || seen.has(cand.text)) continue;
      seen.add(cand.text);
      options.push(cand);
    }
  }
  return options;
}

// -------- T1 templates: count squares / count cubes --------

// (a) solid rectangle of unit squares, fully shaded, on a polygrid — "how many squares cover it".
function t1CountSquaresGrid(rng) {
  const rows = rngInt(rng, 2, 5);
  const cols = rngInt(rng, 2, 6);
  const total = rows * cols;
  const shaded = [];
  for (let i = 0; i < rows * cols; i++) shaded.push(i);
  const visual = { kind: 'polygrid', rows, cols, shaded };

  const stem = 'Each little square is <b>1 cm × 1 cm</b>. How many squares cover this whole rectangle?';

  const distractorPool = [
    { text: fmt(rows + cols), misconception: 'added-not-multiplied' },
    { text: fmt(Math.max(1, (rows - 1) * cols)), misconception: 'miscount-row' },
    { text: fmt(Math.max(1, rows * (cols - 1))), misconception: 'miscount-col' },
    { text: fmt(total + 1), misconception: 'off-by-one' },
  ];
  const correct = { text: fmt(total), misconception: null };
  const padFn = (r) => {
    const delta = pick(r, [2, -2, 3, -3]);
    const v = total + delta;
    if (v <= 0) return null;
    return { text: fmt(v), misconception: 'near-miss-count' };
  };
  const options = makeMcq(correct, shuffle(rng, distractorPool), rng, 3, 4, padFn);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'added-not-multiplied') whyWrong[o.text] = 'That’s rows + columns added together — count every square by MULTIPLYING rows × columns instead.';
    else if (o.misconception === 'miscount-row' || o.misconception === 'miscount-col') whyWrong[o.text] = 'A whole row (or column) got left out — count them all again, carefully.';
    else if (o.misconception === 'off-by-one' || o.misconception === 'near-miss-count') whyWrong[o.text] = 'Very close — recount every square one more time.';
  }

  return {
    templateId: 'av-t1-count-squares',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Count the rows (${rows}) and the columns (${cols}).`,
      `${rows} × ${cols} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${rows} rows × ${cols} columns = ${fmt(total)} squares. Each square is 1 cm × 1 cm, so the area is ${fmt(total)} cm².`,
      whyWrong,
    },
  };
}

// (b) small cuboid built from unit cubes, isometric cuboid diagram — "how many cubes fill it".
function t1CountCubesCuboid(rng) {
  const w = rngInt(rng, 2, 4);
  const h = rngInt(rng, 2, 4);
  const d = rngInt(rng, 2, 4);
  const total = w * h * d;
  const visual = { kind: 'cuboid', w, h, d };

  const stem = 'Each little cube is <b>1 cm³</b>. How many cubes fill this box?';

  const distractorPool = [
    { text: fmt(w + h + d), misconception: 'added-not-multiplied' },
    { text: fmt(Math.max(1, (w - 1) * h * d)), misconception: 'forgot-one-layer' },
    { text: fmt(w * h), misconception: 'forgot-height' },
    { text: fmt(total + 1), misconception: 'off-by-one' },
  ];
  const correct = { text: fmt(total), misconception: null };
  const padFn = (r) => {
    const delta = pick(r, [2, -2, 3, -3]);
    const v = total + delta;
    if (v <= 0) return null;
    return { text: fmt(v), misconception: 'near-miss-count' };
  };
  const options = makeMcq(correct, shuffle(rng, distractorPool), rng, 3, 4, padFn);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'added-not-multiplied') whyWrong[o.text] = 'That’s the three side lengths added together — count every cube by MULTIPLYING them instead.';
    else if (o.misconception === 'forgot-one-layer') whyWrong[o.text] = 'A whole layer of cubes got left out — count every layer, then add them.';
    else if (o.misconception === 'forgot-height') whyWrong[o.text] = 'That’s only ONE flat layer (the base) — you still need to stack it up to the full height.';
    else if (o.misconception === 'off-by-one' || o.misconception === 'near-miss-count') whyWrong[o.text] = 'Very close — recount the cubes, layer by layer.';
  }

  return {
    templateId: 'av-t1-count-cubes',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Each flat layer has ${w} × ${h} = ${w * h} cubes. How many layers are stacked (${d})?`,
      `${w} × ${h} × ${d} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${w} × ${h} × ${d} = ${fmt(total)} cubes. Each cube is 1 cm³, so the volume is ${fmt(total)} cm³.`,
      whyWrong,
    },
  };
}

// (c) an irregular (L-shaped) shaded region on a polygrid — count ONLY the whole shaded
// squares (KS2 rule); tests the "assumed it was a solid rectangle" trap.
function t1IrregularShadedGrid(rng) {
  const fullCols = rngInt(rng, 3, 5);
  const topRows = rngInt(rng, 1, 2);
  const bottomRows = rngInt(rng, 1, 2);
  const bottomCols = rngInt(rng, 1, fullCols - 1);
  const totalRows = topRows + bottomRows;

  const shaded = [];
  for (let r = 0; r < topRows; r++) {
    for (let c = 0; c < fullCols; c++) shaded.push(r * fullCols + c);
  }
  for (let r = topRows; r < topRows + bottomRows; r++) {
    for (let c = 0; c < bottomCols; c++) shaded.push(r * fullCols + c);
  }
  const area = topRows * fullCols + bottomRows * bottomCols;
  const boundingBoxArea = totalRows * fullCols;

  const visual = { kind: 'polygrid', rows: totalRows, cols: fullCols, shaded };
  const stem = 'This shape is built from 1 cm squares. How many squares (the shaded ones) make up its area?';

  const distractorPool = [];
  if (boundingBoxArea !== area) distractorPool.push({ text: fmt(boundingBoxArea), misconception: 'assumed-solid-rectangle' });
  distractorPool.push({ text: fmt(Math.max(1, area - 1)), misconception: 'miscount' });
  distractorPool.push({ text: fmt(area + 1), misconception: 'miscount' });
  distractorPool.push({ text: fmt(Math.max(1, area - 2)), misconception: 'miscount' });

  const correct = { text: fmt(area), misconception: null };
  const padFn = (r) => {
    const delta = pick(r, [2, -2, 3, -3, 4]);
    const v = area + delta;
    if (v <= 0 || v === boundingBoxArea) return null;
    return { text: fmt(v), misconception: 'near-miss-count' };
  };
  const options = makeMcq(correct, shuffle(rng, distractorPool), rng, 3, 4, padFn);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'assumed-solid-rectangle') whyWrong[o.text] = 'That counts the empty corner too, as if the whole rectangle were shaded — only count the squares that are ACTUALLY shaded.';
    else if (o.misconception === 'miscount' || o.misconception === 'near-miss-count') whyWrong[o.text] = 'Recount the shaded squares one whole square at a time — none are missed, none are double-counted.';
  }

  return {
    templateId: 'av-t1-irregular-grid',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Split the shaded shape into simple blocks and count each block of whole squares.',
      `${topRows} × ${fullCols} = ${topRows * fullCols}, and ${bottomRows} × ${bottomCols} = ${bottomRows * bottomCols}. Add the blocks together.`,
    ],
    explain: {
      rule: RULE,
      worked: `Top block: ${topRows} × ${fullCols} = ${topRows * fullCols} squares. Bottom block: ${bottomRows} × ${bottomCols} = ${bottomRows * bottomCols} squares. Total = ${fmt(area)} cm².`,
      whyWrong,
    },
  };
}

// -------- T2 templates: calculate area/volume from labelled diagrams, units correct --------

// (a) rectangle area from a labelled shape diagram (whole-number sides).
function t2RectangleAreaFormula(rng) {
  const l = rngInt(rng, 3, 12);
  const w = rngInt(rng, 3, 12);
  const area = l * w;
  const perimeter = 2 * (l + w);
  const visual = { kind: 'shape', shapeKind: 'rect', labels: [`${l} cm`, `${w} cm`, '', ''] };
  const stem = 'Calculate the AREA of this rectangle.';

  // A pool of SIX candidate distractors (some reliably smaller than the correct area, some
  // reliably bigger, one tied in value, one direction-variable) — shuffled and only the first
  // FOUR kept. Randomising WHICH four appear (rather than always all four of a fixed set)
  // stops the correct answer's sorted rank from collapsing onto a single predictable position.
  const distractorPool = [
    { text: `${fmt(perimeter)} cm`, misconception: 'perimeter-instead' }, // direction varies with l,w
    { text: `${fmt(l + w)} cm²`, misconception: 'added-not-multiplied' }, // reliably smaller
    { text: `${fmt(area)} cm`, misconception: 'dropped-squared-unit' }, // tied value
    { text: `${fmt(l * (w + 1))} cm²`, misconception: 'arithmetic-slip' }, // reliably bigger
    { text: `${fmt(Math.max(1, l * (w - 1)))} cm²`, misconception: 'arithmetic-slip' }, // reliably smaller
    { text: `${fmt(w * w)} cm²`, misconception: 'wrong-side-squared' }, // direction varies with l vs w
  ];
  const correct = { text: `${fmt(area)} cm²`, misconception: null };
  const padFn = (r) => {
    const delta = pick(r, [1, -1, 2, -2]);
    const v = area + delta;
    if (v <= 0) return null;
    return { text: `${fmt(v)} cm²`, misconception: 'near-miss-count' };
  };
  const options = makeMcq(correct, shuffle(rng, distractorPool), rng, 4, 5, padFn);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'perimeter-instead') whyWrong[o.text] = 'That’s the PERIMETER (walking round the outside edge) — area covers the INSIDE. Multiply length × width instead.';
    else if (o.misconception === 'added-not-multiplied') whyWrong[o.text] = `That’s ${l} + ${w} added together — area means MULTIPLY the two sides, not add them.`;
    else if (o.misconception === 'dropped-squared-unit') whyWrong[o.text] = 'The number is right, but area is always measured in SQUARE units — don’t drop the little ².';
    else if (o.misconception === 'wrong-side-squared') whyWrong[o.text] = 'That squares just ONE side — a rectangle needs its TWO DIFFERENT sides multiplied together, length × width.';
    else if (o.misconception === 'arithmetic-slip' || o.misconception === 'near-miss-count') whyWrong[o.text] = `Check the multiplication again: ${l} × ${w}, step by step.`;
  }

  return {
    templateId: 'av-t2-rect-area',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Area = length × width. Read the two labelled sides off the diagram.',
      `${l} × ${w} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${l} cm × ${w} cm = ${fmt(area)} cm².`,
      whyWrong,
    },
  };
}

// (b) cuboid volume from a labelled isometric diagram (whole-number dimensions).
function t2CuboidVolumeFormula(rng) {
  const w = rngInt(rng, 2, 8);
  const h = rngInt(rng, 2, 8);
  const d = rngInt(rng, 2, 8);
  const vol = w * h * d;
  const visual = { kind: 'cuboid', w, h, d };
  const stem = 'Calculate the VOLUME of this box.';

  // Six candidates (mix of reliably-smaller, tied, and reliably-bigger), random 4-of-6 kept —
  // see the rectangle-area template above for why this matters (breaks a fixed-rank tell).
  const distractorPool = [
    { text: `${fmt(w + h + d)} cm³`, misconception: 'added-not-multiplied' }, // reliably smaller
    { text: `${fmt(w * h)} cm³`, misconception: 'forgot-one-dimension' }, // reliably smaller (forgot height)
    { text: `${fmt(h * d)} cm³`, misconception: 'forgot-one-dimension' }, // reliably smaller (forgot length)
    { text: `${fmt(vol)} cm²`, misconception: 'wrong-power-unit' }, // tied value
    { text: `${fmt(vol + d)} cm³`, misconception: 'arithmetic-slip' }, // reliably bigger
    { text: `${fmt(vol * 2)} cm³`, misconception: 'doubled-not-stacked' }, // reliably bigger
  ];
  const correct = { text: `${fmt(vol)} cm³`, misconception: null };
  const padFn = (r) => {
    const delta = pick(r, [1, -1, 2, -2]);
    const v = vol + delta;
    if (v <= 0) return null;
    return { text: `${fmt(v)} cm³`, misconception: 'near-miss-count' };
  };
  const options = makeMcq(correct, shuffle(rng, distractorPool), rng, 4, 5, padFn);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'added-not-multiplied') whyWrong[o.text] = 'That’s the three sides added together — volume means MULTIPLY all three dimensions.';
    else if (o.misconception === 'forgot-one-dimension') whyWrong[o.text] = 'That’s only ONE flat face multiplied — you still need to bring in the third dimension and stack it up.';
    else if (o.misconception === 'wrong-power-unit') whyWrong[o.text] = 'Volume is SPACE FILLED, so the unit needs a ³, not a ² — a ² is for flat area only.';
    else if (o.misconception === 'doubled-not-stacked') whyWrong[o.text] = 'Doubling isn’t the same as stacking a real third dimension — multiply by the actual height, don’t just double.';
    else if (o.misconception === 'arithmetic-slip' || o.misconception === 'near-miss-count') whyWrong[o.text] = `Check the multiplication again: ${w} × ${h} × ${d}, step by step.`;
  }

  return {
    templateId: 'av-t2-cuboid-volume',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Volume = length × width × height. Read the three labelled sides off the diagram.',
      `${w} × ${h} × ${d} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${w} × ${h} × ${d} = ${fmt(vol)} cm³.`,
      whyWrong,
    },
  };
}

// (c) square area from a single labelled side.
function t2SquareAreaFromSide(rng) {
  const s = rngInt(rng, 3, 14);
  const area = s * s;
  const perimeter = 4 * s;
  const visual = { kind: 'shape', shapeKind: 'square', labels: [`${s} cm`, '', '', ''] };
  const stem = 'Calculate the AREA of this square.';

  // Six candidates (mix of reliably-smaller, tied, reliably-bigger, and direction-variable),
  // random 4-of-6 kept — see the rectangle-area template above for why this matters.
  const distractorPool = [
    { text: `${fmt(perimeter)} cm`, misconception: 'perimeter-instead' }, // direction varies with s
    { text: `${fmt(s * 2)} cm²`, misconception: 'doubled-not-squared' }, // reliably smaller
    { text: `${fmt(area)} cm`, misconception: 'dropped-squared-unit' }, // tied value
    { text: `${fmt(area + s)} cm²`, misconception: 'arithmetic-slip' }, // reliably bigger
    { text: `${fmt(Math.max(1, area - s))} cm²`, misconception: 'arithmetic-slip' }, // reliably smaller
    { text: `${fmt((s + 1) * (s + 1))} cm²`, misconception: 'near-miss-side' }, // reliably bigger
  ];
  const correct = { text: `${fmt(area)} cm²`, misconception: null };
  const padFn = (r) => {
    const delta = pick(r, [1, -1, 2, -2]);
    const v = area + delta;
    if (v <= 0) return null;
    return { text: `${fmt(v)} cm²`, misconception: 'near-miss-count' };
  };
  const options = makeMcq(correct, shuffle(rng, distractorPool), rng, 4, 5, padFn);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'perimeter-instead') whyWrong[o.text] = 'That’s the PERIMETER (4 × the side) — area covers the inside. Multiply the side by ITSELF instead.';
    else if (o.misconception === 'doubled-not-squared') whyWrong[o.text] = `That’s ${s} × 2 — a square’s area means the side times ITSELF (${s} × ${s}), not doubled.`;
    else if (o.misconception === 'dropped-squared-unit') whyWrong[o.text] = 'The number is right, but area is always measured in SQUARE units — don’t drop the little ².';
    else if (o.misconception === 'near-miss-side') whyWrong[o.text] = `That uses a side one too big — the side is ${s}, not ${s + 1}.`;
    else if (o.misconception === 'arithmetic-slip' || o.misconception === 'near-miss-count') whyWrong[o.text] = `Check the multiplication again: ${s} × ${s}, step by step.`;
  }

  return {
    templateId: 'av-t2-square-area',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'A square has 4 equal sides. Area = side × side (the SAME number, twice).',
      `${s} × ${s} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${s} cm × ${s} cm = ${fmt(area)} cm².`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format): reverse, decimal dimensions, compound splitting --------

// (a) reverse: given the area and one side, write in the missing side.
function t3ReverseMissingSide(rng) {
  const s1 = rngInt(rng, 2, 12);
  const s2 = rngInt(rng, 2, 12);
  const area = s1 * s2;
  const stem = `A rectangle has area <b>${fmt(area)} cm²</b> and one side is <b>${fmt(s1)} cm</b>. What is the length of the other side?`;

  return {
    templateId: 'av-t3-reverse-side',
    stem,
    format: 'num',
    unit: 'cm',
    accept: [String(s2), fmt(s2)],
    hintSteps: [
      'The Tile-and-Stack Kit runs BACKWARDS too: DIVIDE the area by the side you already know.',
      `${fmt(area)} ÷ ${fmt(s1)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(area)} ÷ ${fmt(s1)} = ${fmt(s2)} cm.`,
      whyWrong: {},
    },
  };
}

// (b) decimal dimension area (one side has 1dp, the other whole — result stays <=1dp).
function t3DecimalDimensionArea(rng) {
  const aWhole = rngInt(rng, 2, 9);
  const a = aWhole + 0.5;
  const b = rngInt(rng, 2, 9);
  const area = Math.round(a * b * 100) / 100;
  const stem = `A tabletop is <b>${fmt(a)} m</b> long and <b>${fmt(b)} m</b> wide. What is its area?`;

  return {
    templateId: 'av-t3-decimal-area',
    stem,
    format: 'num',
    unit: 'm²',
    accept: [String(area), fmt(area)],
    hintSteps: [
      'Area = length × width, even when one side has a decimal point.',
      `${fmt(a)} × ${fmt(b)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(a)} m × ${fmt(b)} m = ${fmt(area)} m².`,
      whyWrong: {},
    },
  };
}

// (c) compound area by splitting into two given rectangles, then summing.
function t3CompoundSplitAreas(rng) {
  const a1 = rngInt(rng, 2, 9);
  const b1 = rngInt(rng, 2, 9);
  const a2 = rngInt(rng, 2, 9);
  const b2 = rngInt(rng, 2, 9);
  const areaA = a1 * b1;
  const areaB = a2 * b2;
  const total = areaA + areaB;
  const stem = `A patio is made of two rectangular sections: <b>${a1} m × ${b1} m</b> and <b>${a2} m × ${b2} m</b>. What is the TOTAL area?`;

  return {
    templateId: 'av-t3-compound-split',
    stem,
    format: 'num',
    unit: 'm²',
    accept: [String(total), fmt(total)],
    hintSteps: [
      'Find the area of each rectangle separately first.',
      `${a1} × ${b1} = ${areaA}, and ${a2} × ${b2} = ${areaB}. Now ADD the two areas together.`,
    ],
    explain: {
      rule: RULE,
      worked: `${a1} × ${b1} = ${fmt(areaA)} m². ${a2} × ${b2} = ${fmt(areaB)} m². Total = ${fmt(total)} m².`,
      whyWrong: {},
    },
  };
}

// (d) reverse volume: given the volume and two of the three dimensions, find the third.
function t3ReverseVolume(rng) {
  const w = rngInt(rng, 2, 8);
  const h = rngInt(rng, 2, 8);
  const d = rngInt(rng, 2, 6);
  const vol = w * h * d;
  const stem = `A box has volume <b>${fmt(vol)} cm³</b>. Its length is <b>${fmt(w)} cm</b> and its width is <b>${fmt(h)} cm</b>. What is its height?`;

  return {
    templateId: 'av-t3-reverse-volume',
    stem,
    format: 'num',
    unit: 'cm',
    accept: [String(d), fmt(d)],
    hintSteps: [
      'Divide the volume by the two dimensions you already know.',
      `${fmt(vol)} ÷ (${w} × ${h}) = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(vol)} ÷ ${w} ÷ ${h} = ${fmt(d)} cm.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1CountSquaresGrid, t1CountCubesCuboid, t1IrregularShadedGrid];
const T2 = [t2RectangleAreaFormula, t2CuboidVolumeFormula, t2SquareAreaFromSide];
const T3 = [t3ReverseMissingSide, t3DecimalDimensionArea, t3CompoundSplitAreas, t3ReverseVolume];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `av-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'area-volume',
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
