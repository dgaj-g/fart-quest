// FART QUEST — GEN agent
// Topic: coordinates (The Grid Grotto). generate(tier, rng) -> Question.
//
// visual spec convention (ENGINE_SPEC_2 §C `coordgrid{size,points:[{x,y,label}],shape?}`,
// first quadrant only): emitted here as PLAIN DATA (no `.html`), rendered by
// js/screens/battle.js's dynamic `renderDiagram` import — never imported directly here.
// `shape:true` draws the connecting outline through `points` in perimeter order (used for
// the rectangle/parallelogram "read every corner" templates); omitted/false leaves the
// points as bare dots (used for "read one point" / "which point is at…" / "find the
// missing corner" templates, where a connecting line would either be meaningless or would
// mislead by drawing a triangle through 3 of a 4-cornered shape).
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'ALONG the hall first, THEN up the stairs. (x, y) — always in that order.';

// Single number formatter (BUILD_SPEC §8): all values here are non-negative whole numbers
// (grid coordinates 0..~12), so this is a plain integer stringifier — no float junk is ever
// possible by construction (every generator below only ever adds/subtracts/divides-by-2
// integers, and the halving template only accepts inputs that divide exactly).
function fmt(n) {
  return String(Math.round(n));
}
function fmtCoord(x, y) {
  return `(${fmt(x)}, ${fmt(y)})`;
}
// T3 write-in accept forms: the spec explicitly calls for accepting both "(4,7)" and "4,7"
// styles; cover the four punctuation/spacing combinations authors might reasonably expect.
function acceptForms(x, y) {
  const a = fmt(x), b = fmt(y);
  return [`${a},${b}`, `(${a},${b})`, `${a}, ${b}`, `(${a}, ${b})`];
}

// Nudge a coordinate by one square without leaving the [0, size] grid (used to build
// "off-by-one" distractors that can never wander off the drawn grid).
function nudge(v, size) {
  return v + 1 <= size ? v + 1 : Math.max(0, v - 1);
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

// Ensure at least `min` total options (correct + distractors). Pads with plausible
// coordinate-flavoured distractors (never random garbage) drawn from `opts.extraPool` if
// dedup left us short.
function makeMcq(correct, distractorPool, n, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  const min = opts.min || n + 1;
  if (options.length < min && opts.extraPool) {
    const seen = new Set(options.map((o) => o.text));
    for (const cand of opts.extraPool) {
      if (options.length >= min) break;
      if (seen.has(cand.text)) continue;
      seen.add(cand.text);
      options.push(cand);
    }
  }
  return options;
}

const WHY = {
  'xy-swap': 'ALONG comes first, then UP — you’ve swapped this point’s coordinates round.',
  'off-by-one-both': 'You started counting from 1 instead of 0 — the corner itself is 0.',
  'off-by-one-x': 'The ALONG count is one square out — count again from the corner, which is 0.',
  'off-by-one-y': 'The UP count is one square out — count again from the corner, which is 0.',
  'off-by-one': 'Count the squares again from the corner (0) to the point.',
  'zero-ignored': 'That point really does sit exactly on a line — the coordinate there is 0, not 1.',
  'zero-duplicated': 'One of these coordinates really is 0 — the point sits exactly on that line.',
  'wrong-corner': 'That’s a different corner of the shape — check you’re reading the right one.',
  'reused-point': 'That’s actually one of the corners you were already given — the missing corner needs its own spot.',
  'wrong-point': 'Check that point’s coordinates on the grid again — they don’t match the target.',
};

function whyWrongFor(options) {
  const out = {};
  for (const o of options) {
    if (!o.misconception) continue;
    if (WHY[o.misconception]) out[o.text] = WHY[o.misconception];
  }
  return out;
}

// -------- T1 templates --------

// Read a single labelled point off a bare coordinate grid.
function t1ReadPoint(rng) {
  const size = pick(rng, [6, 8, 10]);
  let x, y;
  do {
    x = rngInt(rng, 0, size);
    y = rngInt(rng, 0, size);
  } while (x === y);

  const correctText = fmtCoord(x, y);
  const stem = 'Look at the grid. What are the coordinates of point <b>A</b>?';

  const distractors = [
    { text: fmtCoord(y, x), misconception: 'xy-swap' },
    { text: fmtCoord(nudge(x, size), nudge(y, size)), misconception: 'off-by-one-both' },
    { text: fmtCoord(nudge(x, size), y), misconception: 'off-by-one-x' },
    { text: fmtCoord(x, nudge(y, size)), misconception: 'off-by-one-y' },
  ];
  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3);

  return {
    templateId: 'coord-t1-read-point',
    stem,
    visual: { kind: 'coordgrid', size, points: [{ x, y, label: 'A' }] },
    options,
    correctIndex: 0,
    hintSteps: [
      'Start at the corner where the hall meets the staircase — that’s (0, 0). Count ALONG the hall to point A first.',
      `Now count UP the staircase. ALONG = ${x}, UP = ${y} — write them in that order.`,
    ],
    explain: {
      rule: RULE,
      worked: `Point A is ${x} along and ${y} up: (${x}, ${y}).`,
      whyWrong: whyWrongFor(options),
    },
  };
}

// Read a point sitting on an axis (the zero-coordinate trap).
function t1ReadPointOnAxis(rng) {
  const size = pick(rng, [6, 8, 10]);
  const onXAxis = rng() < 0.5;
  const nonzero = rngInt(rng, 1, size);
  const x = onXAxis ? nonzero : 0;
  const y = onXAxis ? 0 : nonzero;
  const correctText = fmtCoord(x, y);
  const stem = 'Point <b>A</b> sits right on a line. What are its coordinates?';

  const offByOne = onXAxis ? fmtCoord(nudge(x, size), y) : fmtCoord(x, nudge(y, size));
  const zeroIgnored = onXAxis ? fmtCoord(x, 1) : fmtCoord(1, y);
  const distractors = [
    { text: fmtCoord(y, x), misconception: 'xy-swap' },
    { text: offByOne, misconception: 'off-by-one' },
    { text: zeroIgnored, misconception: 'zero-ignored' },
    { text: fmtCoord(nonzero, nonzero), misconception: 'zero-duplicated' },
  ];
  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3);

  return {
    templateId: 'coord-t1-axis-point',
    stem,
    visual: { kind: 'coordgrid', size, points: [{ x, y, label: 'A' }] },
    options,
    correctIndex: 0,
    hintSteps: [
      'Point A is sitting exactly on one of the lines — that means one of its coordinates is 0.',
      `Count ALONG first, then UP: (${x}, ${y}).`,
    ],
    explain: {
      rule: RULE,
      worked: `A is ${x} along and ${y} up (it sits exactly on a line): (${x}, ${y}).`,
      whyWrong: whyWrongFor(options),
    },
  };
}

// Read one labelled vertex of a plotted rectangle (shapes live on the grid too).
function t1ShapeVertex(rng) {
  const size = pick(rng, [8, 10]);
  let w, h, x0, y0, verts, candidates;
  let tries = 0;
  do {
    w = rngInt(rng, 2, 4);
    h = rngInt(rng, 2, 4);
    x0 = rngInt(rng, 0, size - w);
    y0 = rngInt(rng, 0, size - h);
    verts = [
      { x: x0, y: y0 },
      { x: x0 + w, y: y0 },
      { x: x0 + w, y: y0 + h },
      { x: x0, y: y0 + h },
    ];
    candidates = [0, 1, 2, 3].filter((i) => verts[i].x !== verts[i].y);
    tries++;
  } while (candidates.length === 0 && tries < 30);
  if (candidates.length === 0) candidates = [0, 1, 2, 3];

  const idx = pick(rng, candidates);
  const target = verts[idx];
  const points = verts.map((v, i) => ({ x: v.x, y: v.y, label: i === idx ? 'A' : '' }));
  const correctText = fmtCoord(target.x, target.y);
  const stem = 'The rectangle has one corner marked <b>A</b>. What are its coordinates?';

  const distractors = [
    { text: fmtCoord(target.y, target.x), misconception: 'xy-swap' },
    { text: fmtCoord(nudge(target.x, size), target.y), misconception: 'off-by-one-x' },
    { text: fmtCoord(target.x, nudge(target.y, size)), misconception: 'off-by-one-y' },
  ];
  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3);

  return {
    templateId: 'coord-t1-shape-vertex',
    stem,
    visual: { kind: 'coordgrid', size, points, shape: true },
    options,
    correctIndex: 0,
    hintSteps: [
      'Find corner A on the grid. Count ALONG the hall from the corner (0, 0) first.',
      `Now count UP the staircase. ALONG = ${target.x}, UP = ${target.y}.`,
    ],
    explain: {
      rule: RULE,
      worked: `Corner A is ${target.x} along and ${target.y} up: (${target.x}, ${target.y}).`,
      whyWrong: whyWrongFor(options),
    },
  };
}

// -------- T2 templates --------

// Which labelled point is at the given coordinates? (a real decoy point sits at the
// swapped coordinates, so misreading the order picks a genuinely plotted — but wrong — point.)
function t2WhichPointAt(rng) {
  const size = pick(rng, [8, 10, 12]);
  let tx, ty;
  do {
    tx = rngInt(rng, 0, size);
    ty = rngInt(rng, 0, size);
  } while (tx === ty);

  const used = new Set([`${tx},${ty}`, `${ty},${tx}`]);
  const others = [];
  let tries = 0;
  while (others.length < 3 && tries < 200) {
    tries++;
    const px = rngInt(rng, 0, size);
    const py = rngInt(rng, 0, size);
    const key = `${px},${py}`;
    if (used.has(key)) continue;
    used.add(key);
    others.push({ x: px, y: py });
  }
  while (others.length < 3) {
    // Extremely unlikely fallback for a saturated small grid: derive a guaranteed-fresh point.
    const px = Math.min(size, others.length);
    const py = Math.min(size, size - others.length);
    const key = `${px},${py}`;
    if (!used.has(key)) { used.add(key); others.push({ x: px, y: py }); }
    else break;
  }

  const slots = [
    { x: tx, y: ty, role: 'target' },
    { x: ty, y: tx, role: 'swap' },
    ...others.map((p) => ({ ...p, role: 'other' })),
  ];
  const shuffledSlots = shuffle(rng, slots);
  const labels = ['A', 'B', 'C', 'D', 'E'];
  const points = shuffledSlots.map((s, i) => ({ x: s.x, y: s.y, label: labels[i] }));
  const targetLabel = labels[shuffledSlots.findIndex((s) => s.role === 'target')];
  const swapLabel = labels[shuffledSlots.findIndex((s) => s.role === 'swap')];

  const stem = `Which point is at <b>${fmtCoord(tx, ty)}</b>?`;
  const correct = { text: targetLabel, misconception: null };
  const distractorOptions = labels
    .filter((l) => l !== targetLabel)
    .map((l) => ({ text: l, misconception: l === swapLabel ? 'xy-swap' : 'wrong-point' }));
  const options = [correct, ...distractorOptions];

  return {
    templateId: 'coord-t2-which-point',
    stem,
    visual: { kind: 'coordgrid', size, points },
    options,
    correctIndex: 0,
    hintSteps: [
      `Find ${fmtCoord(tx, ty)} on the grid: count ${tx} squares ALONG, then ${ty} squares UP.`,
      'Which labelled point is sitting exactly there? Watch out for a point at the SWAPPED coordinates nearby!',
    ],
    explain: {
      rule: RULE,
      worked: `${fmtCoord(tx, ty)} is point ${targetLabel}.`,
      whyWrong: whyWrongFor(options),
    },
  };
}

// Read a specific labelled corner of a fully-labelled rectangle or parallelogram.
function t2ShapeVertexRead(rng) {
  const size = pick(rng, [8, 10, 12]);
  const kind = pick(rng, ['rectangle', 'parallelogram']);
  const labels = ['A', 'B', 'C', 'D'];

  let verts, idx, target, otherIdx;
  let tries = 0;
  do {
    let w, h, s = 0, x0, y0;
    if (kind === 'rectangle') {
      w = rngInt(rng, 2, 5);
      h = rngInt(rng, 2, 5);
      x0 = rngInt(rng, 0, size - w);
      y0 = rngInt(rng, 0, size - h);
      verts = [{ x: x0, y: y0 }, { x: x0 + w, y: y0 }, { x: x0 + w, y: y0 + h }, { x: x0, y: y0 + h }];
    } else {
      w = rngInt(rng, 2, 5);
      h = rngInt(rng, 2, 4);
      s = pick(rng, [-2, -1, 1, 2]);
      x0 = rngInt(rng, Math.max(0, -s), size - w - Math.max(0, s));
      y0 = rngInt(rng, 0, size - h);
      verts = [{ x: x0, y: y0 }, { x: x0 + w, y: y0 }, { x: x0 + w + s, y: y0 + h }, { x: x0 + s, y: y0 + h }];
    }
    const candidates = [0, 1, 2, 3].filter((i) => verts[i].x !== verts[i].y);
    idx = candidates.length ? pick(rng, candidates) : pick(rng, [0, 1, 2, 3]);
    target = verts[idx];
    const otherCandidates = [0, 1, 2, 3].filter((i) => i !== idx);
    otherIdx = pick(rng, otherCandidates);
    tries++;
  } while (
    // Every coordinate must stay in [0, size] (guards the parallelogram's skewed corners).
    verts.some((v) => v.x < 0 || v.x > size || v.y < 0 || v.y > size) && tries < 40
  );

  const points = verts.map((v, i) => ({ x: v.x, y: v.y, label: labels[i] }));
  const shapeName = kind === 'rectangle' ? 'rectangle' : 'parallelogram';
  const stem = `The ${shapeName} has all 4 corners marked. What are the coordinates of corner <b>${labels[idx]}</b>?`;
  const correctText = fmtCoord(target.x, target.y);
  const wrongCorner = verts[otherIdx];

  const distractors = [
    { text: fmtCoord(target.y, target.x), misconception: 'xy-swap' },
    { text: fmtCoord(nudge(target.x, size), target.y), misconception: 'off-by-one-x' },
    { text: fmtCoord(target.x, nudge(target.y, size)), misconception: 'off-by-one-y' },
    { text: fmtCoord(wrongCorner.x, wrongCorner.y), misconception: 'wrong-corner' },
  ];
  const correct = { text: correctText, misconception: null };
  const extraPool = [
    { text: fmtCoord(nudge(target.x, size), nudge(target.y, size)), misconception: 'off-by-one-both' },
  ];
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { min: 5, extraPool });

  return {
    templateId: 'coord-t2-shape-vertex',
    stem,
    visual: { kind: 'coordgrid', size, points, shape: true },
    options,
    correctIndex: 0,
    hintSteps: [
      `Find corner ${labels[idx]} on the ${shapeName}. Count ALONG the hall from (0, 0) first.`,
      `Now count UP the staircase. Write ALONG then UP: (${target.x}, ${target.y}).`,
    ],
    explain: {
      rule: RULE,
      worked: `Corner ${labels[idx]} is ${target.x} along and ${target.y} up: (${target.x}, ${target.y}).`,
      whyWrong: whyWrongFor(options),
    },
  };
}

// mcq preview of the "missing 4th corner of a rectangle" exam favourite (num write-in
// version lives at T3).
function t2MissingVertexMcq(rng) {
  const size = pick(rng, [8, 10, 12]);
  let w, h, x0, y0, A, B, C, D;
  let tries = 0;
  do {
    w = rngInt(rng, 2, 5);
    h = rngInt(rng, 2, 5);
    x0 = rngInt(rng, 0, size - w);
    y0 = rngInt(rng, 0, size - h);
    A = { x: x0, y: y0 };
    B = { x: x0 + w, y: y0 };
    C = { x: x0 + w, y: y0 + h };
    D = { x: x0, y: y0 + h };
    tries++;
  } while (D.x === D.y && tries < 30);

  const points = [{ x: A.x, y: A.y, label: 'A' }, { x: B.x, y: B.y, label: 'B' }, { x: C.x, y: C.y, label: 'C' }];
  const stem = 'A rectangle has corners <b>A</b>, <b>B</b> and <b>C</b> marked (see grid). What are the coordinates of the missing corner <b>D</b>?';
  const correctText = fmtCoord(D.x, D.y);

  const distractors = [
    { text: fmtCoord(D.y, D.x), misconception: 'xy-swap' },
    { text: fmtCoord(B.x, B.y), misconception: 'reused-point' },
    { text: fmtCoord(A.x, A.y), misconception: 'reused-point' },
    { text: fmtCoord(nudge(D.x, size), D.y), misconception: 'off-by-one' },
  ];
  const correct = { text: correctText, misconception: null };
  const extraPool = [{ text: fmtCoord(D.x, nudge(D.y, size)), misconception: 'off-by-one' }];
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { min: 5, extraPool });

  return {
    templateId: 'coord-t2-missing-vertex',
    stem,
    visual: { kind: 'coordgrid', size, points },
    options,
    correctIndex: 0,
    hintSteps: [
      'A rectangle’s corners share values in pairs: A and D share their ALONG (x) value; C and D share their UP (y) value.',
      `Borrow the ALONG value from A (${A.x}) and the UP value from C (${C.y}): (${D.x}, ${D.y}).`,
    ],
    explain: {
      rule: RULE,
      worked: `D borrows its ALONG value from A (${A.x}) and its UP value from C (${C.y}): (${D.x}, ${D.y}).`,
      whyWrong: whyWrongFor(options),
    },
  };
}

// Read a corner described by POSITION language (top-right etc.) rather than a letter —
// tests genuine spatial reading, not just letter-matching.
function t2DescribedCorner(rng) {
  const size = pick(rng, [8, 10, 12]);
  const names = ['bottom-left', 'bottom-right', 'top-right', 'top-left'];

  let w, h, x0, y0, corners, targetName, target;
  let tries = 0;
  do {
    w = rngInt(rng, 2, 5);
    h = rngInt(rng, 2, 5);
    x0 = rngInt(rng, 0, size - w);
    y0 = rngInt(rng, 0, size - h);
    corners = {
      'bottom-left': { x: x0, y: y0 },
      'bottom-right': { x: x0 + w, y: y0 },
      'top-right': { x: x0 + w, y: y0 + h },
      'top-left': { x: x0, y: y0 + h },
    };
    const candidateNames = names.filter((nm) => corners[nm].x !== corners[nm].y);
    targetName = candidateNames.length ? pick(rng, candidateNames) : pick(rng, names);
    target = corners[targetName];
    tries++;
  } while (target.x === target.y && tries < 30);

  const toggleVert = (nm) => (nm.startsWith('top') ? nm.replace('top', 'bottom') : nm.replace('bottom', 'top'));
  const wrongCornerName = toggleVert(targetName);
  const wrongCorner = corners[wrongCornerName];

  const points = names.map((nm) => ({ x: corners[nm].x, y: corners[nm].y, label: '' }));
  const stem = `What are the coordinates of the <b>${targetName.replace('-', ' ')}</b> corner of the rectangle?`;
  const correctText = fmtCoord(target.x, target.y);

  const distractors = [
    { text: fmtCoord(target.y, target.x), misconception: 'xy-swap' },
    { text: fmtCoord(wrongCorner.x, wrongCorner.y), misconception: 'wrong-corner' },
    { text: fmtCoord(nudge(target.x, size), target.y), misconception: 'off-by-one-x' },
    { text: fmtCoord(target.x, nudge(target.y, size)), misconception: 'off-by-one-y' },
  ];
  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { min: 5 });

  const whyWrong = whyWrongFor(options);
  if (whyWrong[fmtCoord(wrongCorner.x, wrongCorner.y)]) {
    whyWrong[fmtCoord(wrongCorner.x, wrongCorner.y)] = `That’s actually the ${wrongCornerName.replace('-', ' ')} corner — check top and bottom again.`;
  }

  return {
    templateId: 'coord-t2-described-corner',
    stem,
    visual: { kind: 'coordgrid', size, points, shape: true },
    options,
    correctIndex: 0,
    hintSteps: [
      `Picture the rectangle: find the ${targetName.replace('-', ' ')} corner.`,
      `Count ALONG then UP to that corner: (${target.x}, ${target.y}).`,
    ],
    explain: {
      rule: RULE,
      worked: `The ${targetName.replace('-', ' ')} corner is ${target.x} along and ${target.y} up: (${target.x}, ${target.y}).`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format) --------

function t3MissingVertexRectangle(rng) {
  const size = pick(rng, [8, 10, 12]);
  let w, h, x0, y0, A, B, C, D;
  let tries = 0;
  do {
    w = rngInt(rng, 2, 6);
    h = rngInt(rng, 2, 6);
    x0 = rngInt(rng, 0, size - w);
    y0 = rngInt(rng, 0, size - h);
    A = { x: x0, y: y0 };
    B = { x: x0 + w, y: y0 };
    C = { x: x0 + w, y: y0 + h };
    D = { x: x0, y: y0 + h };
    tries++;
  } while (D.x === D.y && tries < 30);

  const points = [{ x: A.x, y: A.y, label: 'A' }, { x: B.x, y: B.y, label: 'B' }, { x: C.x, y: C.y, label: 'C' }];
  const stem = `A rectangle has corners at <b>A${fmtCoord(A.x, A.y)}</b>, <b>B${fmtCoord(B.x, B.y)}</b> and <b>C${fmtCoord(C.x, C.y)}</b>. Write the coordinates of the missing corner <b>D</b>.`;

  return {
    templateId: 'coord-t3-missing-vertex-rect',
    stem,
    format: 'num',
    visual: { kind: 'coordgrid', size, points },
    accept: acceptForms(D.x, D.y),
    hintSteps: [
      'A rectangle’s corners share values in pairs: D shares its ALONG (x) value with A, and its UP (y) value with C.',
      `ALONG from A: ${A.x}. UP from C: ${C.y}. Write them as a pair.`,
    ],
    explain: {
      rule: RULE,
      worked: `D borrows its ALONG value from A (${A.x}) and its UP value from C (${C.y}): (${D.x}, ${D.y}).`,
      whyWrong: {},
    },
  };
}

function t3MissingVertexParallelogram(rng) {
  const size = pick(rng, [8, 10, 12]);
  let w, h, s, x0, y0, A, B, C, D, ok;
  let tries = 0;
  do {
    w = rngInt(rng, 2, 5);
    h = rngInt(rng, 2, 4);
    s = pick(rng, [-2, -1, 1, 2]);
    x0 = rngInt(rng, Math.max(0, -s), size - w - Math.max(0, s));
    y0 = rngInt(rng, 0, size - h);
    A = { x: x0, y: y0 };
    B = { x: x0 + w, y: y0 };
    C = { x: x0 + w + s, y: y0 + h };
    D = { x: x0 + s, y: y0 + h };
    ok = D.x >= 0 && D.x <= size && D.y >= 0 && D.y <= size && A.x <= size && D.x !== D.y;
    tries++;
  } while (!ok && tries < 60);

  const points = [{ x: A.x, y: A.y, label: 'A' }, { x: B.x, y: B.y, label: 'B' }, { x: C.x, y: C.y, label: 'C' }];
  const stem = `A parallelogram has corners at <b>A${fmtCoord(A.x, A.y)}</b>, <b>B${fmtCoord(B.x, B.y)}</b> and <b>C${fmtCoord(C.x, C.y)}</b>. Opposite corners of a parallelogram always share the same middle point. Write the coordinates of the missing corner <b>D</b>.`;

  return {
    templateId: 'coord-t3-missing-vertex-parallelogram',
    stem,
    format: 'num',
    visual: { kind: 'coordgrid', size, points },
    accept: acceptForms(D.x, D.y),
    hintSteps: [
      'The middle of diagonal A–C is the SAME point as the middle of diagonal B–D.',
      `Work it one direction at a time: ALONG = ${A.x} + ${C.x} − ${B.x} = ${D.x}; UP = ${A.y} + ${C.y} − ${B.y} = ${D.y}.`,
    ],
    explain: {
      rule: RULE,
      worked: `D = A + C − B, direction by direction: ALONG ${A.x} + ${C.x} − ${B.x} = ${D.x}, UP ${A.y} + ${C.y} − ${B.y} = ${D.y}. So D = (${D.x}, ${D.y}).`,
      whyWrong: {},
    },
  };
}

function t3PointAfterMove(rng) {
  const size = pick(rng, [8, 10, 12]);
  let sx, sy, dx, dy, ex, ey;
  let tries = 0;
  do {
    sx = rngInt(rng, 0, size);
    sy = rngInt(rng, 0, size);
    dx = rngInt(rng, -4, 4);
    dy = rngInt(rng, -4, 4);
    ex = sx + dx;
    ey = sy + dy;
    tries++;
  } while ((ex < 0 || ex > size || ey < 0 || ey > size || (dx === 0 && dy === 0)) && tries < 60);
  if (ex < 0 || ex > size || ey < 0 || ey > size || (dx === 0 && dy === 0)) {
    // Deterministic fallback: a small guaranteed-valid move.
    dx = sx + 2 <= size ? 2 : -2;
    dy = sy + 1 <= size ? 1 : -1;
    ex = sx + dx;
    ey = sy + dy;
  }

  const alongWord = dx >= 0 ? 'ALONG (right)' : 'BACK (left)';
  const upWord = dy >= 0 ? 'UP' : 'DOWN';
  const alongCount = Math.abs(dx);
  const upCount = Math.abs(dy);
  const alongText = `${alongCount} square${alongCount === 1 ? '' : 's'} ${alongWord}`;
  const upText = `${upCount} square${upCount === 1 ? '' : 's'} ${upWord}`;
  const stem = `Gridlock starts at <b>${fmtCoord(sx, sy)}</b>. He moves ${alongText} and ${upText}. What are his new coordinates?`;

  return {
    templateId: 'coord-t3-point-after-move',
    stem,
    format: 'num',
    visual: { kind: 'coordgrid', size, points: [{ x: sx, y: sy, label: 'Start' }, { x: ex, y: ey, label: 'End' }] },
    accept: acceptForms(ex, ey),
    hintSteps: [
      `Start at (${sx}, ${sy}). Apply the ALONG move first: ${sx} ${dx >= 0 ? '+' : '−'} ${Math.abs(dx)} = ${ex}.`,
      `Now apply the UP move: ${sy} ${dy >= 0 ? '+' : '−'} ${Math.abs(dy)} = ${ey}. New point: (${ex}, ${ey}).`,
    ],
    explain: {
      rule: RULE,
      worked: `ALONG: ${sx} ${dx >= 0 ? '+' : '−'} ${Math.abs(dx)} = ${ex}. UP: ${sy} ${dy >= 0 ? '+' : '−'} ${Math.abs(dy)} = ${ey}. New point: (${ex}, ${ey}).`,
      whyWrong: {},
    },
  };
}

function t3Midpoint(rng) {
  const size = pick(rng, [8, 10, 12]);
  let x1, y1, x2, y2, mx, my;
  let tries = 0;
  do {
    x1 = rngInt(rng, 0, size);
    y1 = rngInt(rng, 0, size);
    x2 = rngInt(rng, 0, size);
    y2 = rngInt(rng, 0, size);
    tries++;
  } while (((x1 + x2) % 2 !== 0 || (y1 + y2) % 2 !== 0 || (x1 === x2 && y1 === y2)) && tries < 100);
  if ((x1 + x2) % 2 !== 0 || (y1 + y2) % 2 !== 0 || (x1 === x2 && y1 === y2)) {
    // Deterministic fallback: force matching parity a fixed +2 step away.
    x2 = x1 + 2 <= size ? x1 + 2 : x1 - 2;
    y2 = y1 + 2 <= size ? y1 + 2 : y1 - 2;
  }
  mx = (x1 + x2) / 2;
  my = (y1 + y2) / 2;

  const stem = `Point <b>P</b> is at ${fmtCoord(x1, y1)} and point <b>Q</b> is at ${fmtCoord(x2, y2)}. What are the coordinates of the point exactly HALFWAY between them?`;

  return {
    templateId: 'coord-t3-midpoint',
    stem,
    format: 'num',
    visual: { kind: 'coordgrid', size, points: [{ x: x1, y: y1, label: 'P' }, { x: x2, y: y2, label: 'Q' }] },
    accept: acceptForms(mx, my),
    hintSteps: [
      'Halfway ALONG: add the two x-values and share equally between them (divide by 2).',
      `ALONG: (${x1} + ${x2}) ÷ 2 = ${mx}. UP: (${y1} + ${y2}) ÷ 2 = ${my}.`,
    ],
    explain: {
      rule: RULE,
      worked: `Halfway point: ALONG (${x1}+${x2})÷2=${mx}, UP (${y1}+${y2})÷2=${my} → (${mx}, ${my}).`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ReadPoint, t1ReadPointOnAxis, t1ShapeVertex];
const T2 = [t2WhichPointAt, t2ShapeVertexRead, t2MissingVertexMcq, t2DescribedCorner];
const T3 = [t3MissingVertexRectangle, t3MissingVertexParallelogram, t3PointAfterMove, t3Midpoint];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `coord-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'coordinates',
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
