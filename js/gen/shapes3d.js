// FART QUEST — GEN agent
// Topic: shapes-3d (The Solid Cellar). generate(tier, rng) -> Question.
//
// visual spec convention (ENGINE_SPEC_2 §C):
// - `cuboid{w,h,d}` isometric box with dimension labels — used to tell a CUBE (all three
//   dimensions equal) from a CUBOID (not all equal) apart, since the engine only ships one
//   rectangular-box renderer for both.
// - `polygrid{rows,cols,shaded:[[r,c],...]}` fraction/area grid — repurposed here to draw a
//   cube NET as a grid of shaded unit squares (any hexomino layout is renderable, valid net
//   or not), because the engine's dedicated `net{cubeNetId:1-11}` kind can ONLY render the
//   11 nets that already fold into a cube (no way to render an invalid one through it) — a
//   DEVIATION from using `net{...}` directly, needed so "does this fold into a cube?"
//   questions can show a genuinely invalid layout, not just a guaranteed-valid one.
// - cone/cylinder/sphere/triangular-prism/square-based-pyramid have NO dedicated 3D solid
//   diagram kind in the engine at all (only `cuboid` draws a solid). Those five are taught
//   and tested via plain-English property clues and real-world object matches instead of a
//   picture — a deliberate, spec-consistent workaround for the same reason shapes2d.js
//   falls back on side-length labels where the outline renderer can't disambiguate shapes.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Faces are flat, edges are where faces meet, vertices are the corners. Count in that order.';

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
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

function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Shared fact banks (correctness is sacred — standard UK KS2 "properties of 3D shapes"
// conventions: a curved surface counts as a face, a curved rim counts as an edge, but a
// curve never forms a vertex — a vertex must be a genuine sharp point).
// ---------------------------------------------------------------------------

const SOLIDS = ['cube', 'cuboid', 'cone', 'cylinder', 'sphere', 'triangular-prism', 'square-pyramid'];

const DISPLAY = {
  cube: 'Cube',
  cuboid: 'Cuboid',
  cone: 'Cone',
  cylinder: 'Cylinder',
  sphere: 'Sphere',
  'triangular-prism': 'Triangular prism',
  'square-pyramid': 'Square-based pyramid',
};

const FEV = {
  cube: { f: 6, e: 12, v: 8 },
  cuboid: { f: 6, e: 12, v: 8 },
  cone: { f: 2, e: 1, v: 1 },
  cylinder: { f: 3, e: 2, v: 0 },
  sphere: { f: 1, e: 0, v: 0 },
  'triangular-prism': { f: 5, e: 9, v: 6 },
  'square-pyramid': { f: 5, e: 8, v: 5 },
};

const DESCRIPTION = {
  cube: 'This solid has 6 flat faces, and EVERY single face is an identical square.',
  cuboid: 'This solid has 6 flat rectangular faces (opposite ones match), but at least one face is a rectangle that is NOT a square.',
  sphere: 'This solid is perfectly round — it has ONE curved surface, and no flat faces, edges or corners at all.',
  cylinder: 'This solid has two identical flat circular faces, joined by one curved surface running between them.',
  cone: 'This solid has ONE flat circular face, one curved surface, and comes to a single sharp point (an apex) at the top.',
  'triangular-prism': 'This solid has two identical triangular faces at either end, joined by three rectangular faces — the same triangle "slice" runs all the way through.',
  'square-pyramid': 'This solid has ONE square face as its base, and FOUR triangular faces that all meet at a single point (an apex) at the top.',
};

const SOLID_DISTINGUISH = {
  cube: 'every single face to be an identical square',
  cuboid: 'rectangular faces where at least one is not a square',
  sphere: 'one curved surface only, with no flat faces, edges or corners at all',
  cylinder: 'two flat circular faces plus one curved surface joining them',
  cone: 'one flat circular face, one curved surface, and one sharp point at the top',
  'triangular-prism': 'two identical triangular end faces plus three rectangular faces',
  'square-pyramid': 'one square base plus four triangular faces meeting at a single point',
};

const REALWORLD = {
  cube: 'a dice from a board game',
  cuboid: 'a cereal box',
  sphere: 'a football',
  cylinder: 'a tin of beans',
  cone: 'a traffic cone',
  'triangular-prism': 'a Toblerone chocolate box',
  'square-pyramid': 'the Great Pyramid of Giza',
};

const PRISM_YES = ['cuboid', 'triangular-prism'];
const PRISM_NO = ['cone', 'cylinder', 'sphere', 'square-pyramid'];

const PRISM_WHY = {
  cone: 'A cone narrows to a single point — the "slice" gets smaller all the way up, so it is NOT the same all the way through.',
  cylinder: 'A cylinder\'s ends are circles joined by ONE curved surface, not flat polygon faces joined by rectangles — it is not counted as a prism.',
  sphere: 'A sphere is just one curved surface all over — there is no flat "slice" running through it anywhere.',
  'square-pyramid': 'A square-based pyramid narrows to a single point at the top — the "slice" shrinks all the way up, so it is NOT the same throughout.',
};

const PROP_LABEL = { f: 'faces', e: 'edges', v: 'vertices' };

// -------- T1 templates --------

function t1NameSolidCuboidDiagram(rng) {
  const isCube = rng() < 0.5;
  let w, h, d;
  if (isCube) {
    const k = rngInt(rng, 2, 6);
    w = h = d = k;
  } else {
    w = rngInt(rng, 2, 6);
    h = rngInt(rng, 2, 6);
    d = rngInt(rng, 2, 6);
    if (w === h && h === d) h += 1; // guarantee genuinely NOT all equal
  }
  const solidKey = isCube ? 'cube' : 'cuboid';
  const stem = 'Look at the 3D solid below. What is it called?';
  const visual = { kind: 'cuboid', w, h, d };

  const nearMiss = isCube ? 'cuboid' : 'cube';
  const others = shuffle(rng, SOLIDS.filter((s) => s !== solidKey && s !== nearMiss)).slice(0, 2);
  const distractorKeys = shuffle(rng, [nearMiss, ...others]);
  const distractors = distractorKeys.map((k) => ({ text: DISPLAY[k], misconception: `wrong-solid-${k}` }));
  const correct = { text: DISPLAY[solidKey], misconception: null };
  const options = makeMcq(correct, distractors, 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (!o.misconception || !o.misconception.startsWith('wrong-solid-')) continue;
    const wrongKey = o.misconception.slice('wrong-solid-'.length);
    if (wrongKey === 'cube') {
      // Only reachable when isCube is false (nearMiss is only 'cube' in that branch).
      whyWrong[o.text] = 'A cube needs ALL three dimensions exactly equal — this box\'s dimensions are not all the same, so it\'s a cuboid, not a cube.';
    } else if (wrongKey === 'cuboid') {
      // Only reachable when isCube is true (nearMiss is only 'cuboid' in that branch).
      whyWrong[o.text] = 'A cuboid just needs 6 rectangular faces — but here all three dimensions are exactly equal, which makes this the special case: a cube.';
    } else {
      whyWrong[o.text] = `This diagram shows straight edges and flat rectangular faces only — a ${DISPLAY[wrongKey].toLowerCase()} needs ${SOLID_DISTINGUISH[wrongKey]}, which isn't shown here.`;
    }
  }

  return {
    templateId: 'shapes3d-t1-cuboid-diagram',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Read the w, h and d labels on the diagram — are all three dimensions exactly the same number, or not?',
      isCube ? 'All three match — that\'s the special, extra-fancy case.' : 'At least one dimension is different from the others — that rules out the special case.',
    ],
    explain: {
      rule: RULE,
      worked: `w=${w}, h=${h}, d=${d}. ${isCube ? 'All three dimensions match' : 'The dimensions are not all equal'} → ${DISPLAY[solidKey]}.`,
      whyWrong,
    },
  };
}

function t1NameSolidFromDescription(rng) {
  const solidKey = pick(rng, SOLIDS);
  const stem = `${DESCRIPTION[solidKey]} What is this solid called?`;
  const others = shuffle(rng, SOLIDS.filter((s) => s !== solidKey)).slice(0, 3);
  const distractors = others.map((k) => ({ text: DISPLAY[k], misconception: `wrong-solid-${k}` }));
  const correct = { text: DISPLAY[solidKey], misconception: null };
  const options = makeMcq(correct, distractors, 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('wrong-solid-')) {
      const wrongKey = o.misconception.slice('wrong-solid-'.length);
      whyWrong[o.text] = `A ${DISPLAY[wrongKey].toLowerCase()} needs ${SOLID_DISTINGUISH[wrongKey]} — that doesn't match the clue given.`;
    }
  }

  return {
    templateId: 'shapes3d-t1-description',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Check the clue for curved surfaces, flat faces, and any single point (apex) mentioned.',
      `Which solid in your Solid Family matches every part of that clue?`,
    ],
    explain: {
      rule: RULE,
      worked: `${DESCRIPTION[solidKey]} → ${DISPLAY[solidKey]}.`,
      whyWrong,
    },
  };
}

function t1RealWorldObjectMatch(rng) {
  const solidKey = pick(rng, SOLIDS);
  const object = REALWORLD[solidKey];
  const stem = `Which 3D solid has the <b>same shape</b> as ${object}?`;
  const others = shuffle(rng, SOLIDS.filter((s) => s !== solidKey)).slice(0, 3);
  const distractors = others.map((k) => ({ text: DISPLAY[k], misconception: `wrong-solid-${k}` }));
  const correct = { text: DISPLAY[solidKey], misconception: null };
  const options = makeMcq(correct, distractors, 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('wrong-solid-')) {
      const wrongKey = o.misconception.slice('wrong-solid-'.length);
      whyWrong[o.text] = `That doesn't match — a ${DISPLAY[wrongKey].toLowerCase()} needs ${SOLID_DISTINGUISH[wrongKey]}, which isn't what ${object} looks like.`;
    }
  }

  return {
    templateId: 'shapes3d-t1-realworld',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Picture the real object in your head — is it curved, pointy, boxy, or flat-ended?',
      `Now match that picture to one solid in the Solid Family.`,
    ],
    explain: {
      rule: RULE,
      worked: `${capFirst(object)} is the same shape as a ${DISPLAY[solidKey].toLowerCase()}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2FEVCountForSolid(rng) {
  const solidKey = pick(rng, SOLIDS);
  const prop = pick(rng, ['f', 'e', 'v']);
  const correctVal = FEV[solidKey][prop];
  const propLabel = PROP_LABEL[prop];
  const stem = `How many <b>${propLabel.toUpperCase()}</b> does a ${DISPLAY[solidKey].toLowerCase()} have?`;

  // Candidate wrong numbers, tagged with why they're tempting.
  const candidates = [];
  for (const otherProp of ['f', 'e', 'v']) {
    if (otherProp === prop) continue;
    const val = FEV[solidKey][otherProp];
    if (val !== correctVal) candidates.push({ value: val, kind: 'other-property', detail: PROP_LABEL[otherProp] });
  }
  for (const otherKey of SOLIDS) {
    if (otherKey === solidKey) continue;
    const val = FEV[otherKey][prop];
    if (val !== correctVal) candidates.push({ value: val, kind: 'other-solid', detail: otherKey });
  }
  // filler offsets in case the pool is short after dedup
  for (const off of [1, 2, -1, -2]) {
    const val = correctVal + off;
    if (val >= 0) candidates.push({ value: val, kind: 'offset', detail: null });
  }

  const seenVals = new Set([correctVal]);
  const distractors = [];
  for (const c of shuffle(rng, candidates)) {
    if (seenVals.has(c.value)) continue;
    seenVals.add(c.value);
    distractors.push({ text: fmt(c.value), misconception: `count-${c.kind}`, _meta: c });
    if (distractors.length >= 4) break;
  }

  const correct = { text: fmt(correctVal), misconception: null };
  const options = [correct, ...distractors];

  const whyWrong = {};
  for (const o of distractors) {
    if (o._meta.kind === 'other-property') {
      whyWrong[o.text] = `That's the ${o._meta.detail.toUpperCase()} count for a ${DISPLAY[solidKey].toLowerCase()}, not the ${propLabel} count — check which property the question asked about.`;
    } else if (o._meta.kind === 'other-solid') {
      whyWrong[o.text] = `${o.text} ${propLabel} belongs to a ${DISPLAY[o._meta.detail].toLowerCase()}, not a ${DISPLAY[solidKey].toLowerCase()} — check the FEV table again.`;
    } else {
      whyWrong[o.text] = `Recount carefully using the Counter: faces flat, edges where they meet, vertices the corners.`;
    }
  }

  return {
    templateId: 'shapes3d-t2-fev-count',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Faces, then edges, then vertices — work out which of the three the question is actually asking for.',
      `A ${DISPLAY[solidKey].toLowerCase()} has ${FEV[solidKey].f} faces, ${FEV[solidKey].e} edges and ${FEV[solidKey].v} vertices. Pick out the ${propLabel} number.`,
    ],
    explain: {
      rule: RULE,
      worked: `A ${DISPLAY[solidKey].toLowerCase()} has ${correctVal} ${propLabel}.`,
      whyWrong,
    },
  };
}

function t2PrismOrNot(rng) {
  const yesKey = pick(rng, PRISM_YES);
  const stem = 'Which of these solids <b>IS</b> a prism (the same flat cross-section slice all the way through)?';
  const correct = { text: DISPLAY[yesKey], misconception: null };
  const distractors = shuffle(rng, PRISM_NO).map((k) => ({ text: DISPLAY[k], misconception: `not-a-prism-${k}` }));
  const options = makeMcq(correct, distractors, 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('not-a-prism-')) {
      const wrongKey = o.misconception.slice('not-a-prism-'.length);
      whyWrong[o.text] = PRISM_WHY[wrongKey];
    }
  }

  return {
    templateId: 'shapes3d-t2-prism-or-not',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'A prism has flat faces and the SAME slice running all the way through it, like a loaf of bread.',
      'Rule out anything that curves, or narrows to a single point — what\'s left?',
    ],
    explain: {
      rule: RULE,
      worked: `A ${DISPLAY[yesKey].toLowerCase()} has the same flat cross-section all the way through — it IS a prism. Everything curved or pointed is not.`,
      whyWrong,
    },
  };
}

const FACE_SHAPE_ITEMS = [
  { stem: 'What shape are ALL 6 faces of a cube?', correct: 'Square' },
  { stem: 'What shape are the two identical end faces of a triangular prism?', correct: 'Triangle' },
  { stem: 'What shape is the base of a square-based pyramid?', correct: 'Square' },
  { stem: 'What shape are the four sloping (slanted) faces of a square-based pyramid?', correct: 'Triangle' },
  { stem: 'What shape are the flat faces of a cuboid that is NOT a cube?', correct: 'Rectangle' },
];
const SHAPE_NAME_POOL = ['Square', 'Triangle', 'Rectangle', 'Pentagon', 'Circle', 'Hexagon'];

function t2FaceShapeIdentify(rng) {
  const item = pick(rng, FACE_SHAPE_ITEMS);
  const others = shuffle(rng, SHAPE_NAME_POOL.filter((s) => s !== item.correct)).slice(0, 4);
  const distractors = others.map((s) => ({ text: s, misconception: 'wrong-face-shape' }));
  const correct = { text: item.correct, misconception: null };
  const options = makeMcq(correct, distractors, 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-face-shape') whyWrong[o.text] = `That's not right — re-check the faces described; they are ${item.correct.toLowerCase()}s, not ${o.text.toLowerCase()}s.`;
  }

  return {
    templateId: 'shapes3d-t2-face-shape',
    stem: item.stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Picture the solid named in the question, and focus only on the faces described.',
      `Is that face flat with 3 straight sides, 4 straight sides, or something else?`,
    ],
    explain: {
      rule: RULE,
      worked: `${item.stem.replace(/\?$/, '')} → ${item.correct}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates --------

// (property, value, solidKey) tuples where the count uniquely identifies ONE solid out of
// the full 7-solid set (cube and cuboid share identical F/E/V counts, so those tied values
// — faces 6, edges 12, vertices 8 — are deliberately excluded from this pool).
const UNIQUE_FEV_TUPLES = [
  { prop: 'e', value: 9, solid: 'triangular-prism' },
  { prop: 'e', value: 8, solid: 'square-pyramid' },
  { prop: 'e', value: 2, solid: 'cylinder' },
  { prop: 'e', value: 1, solid: 'cone' },
  { prop: 'e', value: 0, solid: 'sphere' },
  { prop: 'v', value: 6, solid: 'triangular-prism' },
  { prop: 'v', value: 5, solid: 'square-pyramid' },
  { prop: 'v', value: 1, solid: 'cone' },
  { prop: 'f', value: 3, solid: 'cylinder' },
  { prop: 'f', value: 2, solid: 'cone' },
  { prop: 'f', value: 1, solid: 'sphere' },
];

function t3WhichSolidHasProperty(rng) {
  const item = pick(rng, UNIQUE_FEV_TUPLES);
  const propLabel = PROP_LABEL[item.prop];
  const stem = `Which solid has exactly <b>${item.value}</b> ${propLabel}?`;
  const correct = { text: DISPLAY[item.solid], misconception: null };
  const otherKeys = shuffle(rng, SOLIDS.filter((s) => s !== item.solid));
  const distractors = otherKeys.map((k) => ({ text: DISPLAY[k], misconception: `wrong-solid-${k}` }));
  const options = makeMcq(correct, distractors, 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('wrong-solid-')) {
      const wrongKey = o.misconception.slice('wrong-solid-'.length);
      whyWrong[o.text] = `A ${DISPLAY[wrongKey].toLowerCase()} has ${FEV[wrongKey][item.prop]} ${propLabel}, not ${item.value}.`;
    }
  }

  return {
    templateId: 'shapes3d-t3-which-solid',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Go through the Solid Family and check their ${propLabel} counts one by one.`,
      `Only ONE solid has exactly ${item.value} ${propLabel} — which one?`,
    ],
    explain: {
      rule: RULE,
      worked: `${DISPLAY[item.solid]} has ${item.value} ${propLabel}.`,
      whyWrong,
    },
  };
}

function t3NumFEV(rng) {
  const solidKey = pick(rng, SOLIDS);
  const prop = pick(rng, ['f', 'e', 'v']);
  const value = FEV[solidKey][prop];
  const propLabel = PROP_LABEL[prop];
  const stem = `How many ${propLabel} does a ${DISPLAY[solidKey].toLowerCase()} have?`;

  return {
    templateId: 'shapes3d-t3-num-fev',
    stem,
    format: 'num',
    accept: [String(value), fmt(value)],
    hintSteps: [
      'Faces, then edges, then vertices — count in that order, for this exact solid.',
      `A ${DISPLAY[solidKey].toLowerCase()} has how many ${propLabel}?`,
    ],
    explain: {
      rule: RULE,
      worked: `A ${DISPLAY[solidKey].toLowerCase()} has ${value} ${propLabel}.`,
      whyWrong: {},
    },
  };
}

function t3TotalFEVTwoSolids(rng) {
  const keyA = pick(rng, SOLIDS);
  let keyB = pick(rng, SOLIDS);
  if (keyB === keyA) keyB = SOLIDS[(SOLIDS.indexOf(keyA) + 1) % SOLIDS.length];
  const prop = pick(rng, ['f', 'e', 'v']);
  const propLabel = PROP_LABEL[prop];
  const valA = FEV[keyA][prop];
  const valB = FEV[keyB][prop];
  const total = valA + valB;
  const stem = `A ${DISPLAY[keyA].toLowerCase()} has ${valA} ${propLabel}. A ${DISPLAY[keyB].toLowerCase()} has ${valB} ${propLabel}. What is the TOTAL number of ${propLabel} if you had one of each?`;

  return {
    templateId: 'shapes3d-t3-total-fev',
    stem,
    format: 'num',
    accept: [String(total), fmt(total)],
    hintSteps: [
      `You already have both counts — ${valA} and ${valB}. This is just one add-up step.`,
      `${valA} + ${valB} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${valA} + ${valB} = ${total}.`,
      whyWrong: {},
    },
  };
}

// Trusted valid cube-net layouts (a "T" shape, an "L"-ish shape, and the classic "+" cross
// shape — all genuinely fold into a closed cube) plus two well-established INVALID hexomino
// layouts (a straight line of 6, and a solid 2×3 block) that provably do NOT fold into a
// cube (both are long-standing, uncontested facts about the 11 cube nets — a straight strip
// wraps around and two squares land on the same face; a solid block isn't one of the 11 at
// all). Coordinates are [row, col] pairs, rendered via the documented `polygrid` kind.
const VALID_NETS = [
  { rows: 4, cols: 3, shaded: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1], [3, 1]] }, // "T"
  { rows: 4, cols: 3, shaded: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1], [3, 1]] }, // "L"-ish
  { rows: 4, cols: 3, shaded: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [3, 1]] }, // "+" cross
];
const INVALID_NETS = [
  { rows: 1, cols: 6, shaded: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]] }, // straight line
  { rows: 2, cols: 3, shaded: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]] }, // solid block
];
const BOTH_SAFE_NET_WRONG = [
  { text: 'No — it only has 5 squares, not 6.', misconception: 'miscounted-squares-low' },
  { text: 'No — this shape has more than 6 squares.', misconception: 'miscounted-squares-high' },
];
const VALID_ONLY_NET_WRONG = [
  { text: 'No — squares must be joined in a single straight line to fold into a cube.', misconception: 'over-rigid-line-myth' },
  { text: 'No — every valid cube net has to be shaped exactly like a plus sign (+).', misconception: 'over-rigid-plus-myth' },
];
const INVALID_ONLY_NET_WRONG = [
  { text: 'Yes — any shape made of exactly 6 squares will fold into a cube.', misconception: 'any-six-squares-myth' },
  { text: 'Yes — as long as the squares all touch edge-to-edge, it will fold into a cube.', misconception: 'edge-touch-myth' },
];

function t3NetValidity(rng) {
  const isValid = rng() < 0.5;
  const net = isValid ? pick(rng, VALID_NETS) : pick(rng, INVALID_NETS);
  const stem = 'Here is a net made of 6 squares joined edge-to-edge. If you cut it out and folded along every line, would it make a closed cube?';
  const visual = { kind: 'polygrid', rows: net.rows, cols: net.cols, shaded: net.shaded };

  const correctText = isValid
    ? 'Yes — it folds into a closed cube with no gaps or overlaps.'
    : 'No — two of the squares overlap when folded, leaving a face bare.';
  const correct = { text: correctText, misconception: null };
  const branchWrong = isValid ? VALID_ONLY_NET_WRONG : INVALID_ONLY_NET_WRONG;
  const options = [correct, ...BOTH_SAFE_NET_WRONG, ...branchWrong];

  const whyWrong = {
    'No — it only has 5 squares, not 6.': 'Count again — there are exactly 6 squares shown here.',
    'No — this shape has more than 6 squares.': 'Count again — there are exactly 6 squares shown, not more.',
  };
  if (isValid) {
    whyWrong['No — squares must be joined in a single straight line to fold into a cube.'] = 'Not true — this exact arrangement isn\'t a straight line, and it still folds into a perfect cube.';
    whyWrong['No — every valid cube net has to be shaped exactly like a plus sign (+).'] = 'Not true — there are 11 different net shapes that fold into a cube, not just one.';
  } else {
    whyWrong['Yes — any shape made of exactly 6 squares will fold into a cube.'] = 'Not true — this exact arrangement proves it: 6 squares, edge-to-edge, and it still fails to fold into a cube.';
    whyWrong['Yes — as long as the squares all touch edge-to-edge, it will fold into a cube.'] = 'Edge-to-edge joining isn\'t enough on its own — the exact arrangement matters, and this one fails.';
  }

  return {
    templateId: 'shapes3d-t3-net-validity',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Count the squares — a cube net always uses exactly 6, one for each face.',
      'Now trace the fold in your head: does every square land on its own face, or do two of them crash into each other?',
    ],
    explain: {
      rule: RULE,
      worked: isValid
        ? 'This exact arrangement is one of the 11 nets that always fold into a closed cube — every square becomes one face, with no overlaps and no gaps.'
        : 'This exact arrangement is NOT one of the 11 nets that fold into a cube — when folded, two of the squares land on the same face, leaving another face bare.',
      whyWrong,
    },
  };
}

// -------- dispatch --------

const T1 = [t1NameSolidCuboidDiagram, t1NameSolidFromDescription, t1RealWorldObjectMatch];
const T2 = [t2FEVCountForSolid, t2PrismOrNot, t2FaceShapeIdentify];
// Fix (IMPORTANT, duplicate template): t3NumFEV was listed twice, doubling its selection
// probability and cutting T3 variety from 5 intended templates down to 4 real ones. Rather than
// weight it 2x, draw uniformly from the 4 genuinely distinct templates that exist today.
const T3 = [t3NumFEV, t3TotalFEVTwoSolids, t3WhichSolidHasProperty, t3NetValidity];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `shapes3d-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'shapes-3d',
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
  } else if (format === 'selecttwo') {
    question.options = built.options;
    question.correctIndices = built.correctIndices;
  } else {
    question.accept = built.accept;
    if (built.unit) question.unit = built.unit;
  }

  return question;
}

export default { generate };
