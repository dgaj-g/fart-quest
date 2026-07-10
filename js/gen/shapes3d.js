// FART QUEST — GEN agent
// Topic: shapes-3d (The Solid Cellar). generate(tier, rng) -> Question.
//
// visual spec convention (ENGINE_SPEC_2 §C):
// - `cuboid{w,h,d}` isometric box with dimension labels — used to tell a CUBE (all three
//   dimensions equal) from a CUBOID (not all equal) apart, since the engine only ships one
//   rectangular-box renderer for both.
// - cone/cylinder/sphere/triangular-prism/square-based-pyramid have NO dedicated 3D solid
//   diagram kind in the engine at all (only `cuboid` draws a solid). Those five are taught
//   and tested via plain-English property clues and real-world object matches instead of a
//   picture — a deliberate, spec-consistent workaround for the same reason shapes2d.js
//   falls back on side-length labels where the outline renderer can't disambiguate shapes.
//
// SPEC_CANON.md audit note: cube-net folding ("does this fold into a cube?") was removed
// entirely — no Section A spec bullet names nets, and Section C has zero PP1/PP2 citation
// for a net-folding question anywhere in the canon. Do not re-add net content without a
// spec bullet or official-paper citation to back it (see docs/SPEC_CANON.md Section D).
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

// The only two genuine FEV ties among the 7 named solids (cube/cuboid tie on ALL three
// counts and are disambiguated by appearance/diagram instead — see
// t1NameSolidCuboidDiagram — not by a numeric FEV clue, so that pair is excluded here).
const TIE_PAIRS = [
  { a: 'square-pyramid', b: 'triangular-prism', tieProp: 'f' }, // both 5 faces
  { a: 'cylinder', b: 'sphere', tieProp: 'v' }, // both 0 vertices
];

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

function t2TwoClueTieBreak(rng) {
  const pair = pick(rng, TIE_PAIRS);
  const answerKey = pick(rng, [pair.a, pair.b]);
  const otherKey = answerKey === pair.a ? pair.b : pair.a;
  const tieProp = pair.tieProp;
  const distProp = shuffle(rng, ['f', 'e', 'v'].filter((p) => p !== tieProp))[0];
  const tieLabel = PROP_LABEL[tieProp];
  const distLabel = PROP_LABEL[distProp];
  const tieVal = FEV[answerKey][tieProp];
  const distVal = FEV[answerKey][distProp];
  const stem = `A solid has exactly ${tieVal} ${tieLabel.toUpperCase()} and ${distVal} ${distLabel.toUpperCase()}. Which solid is it?`;
  const correct = { text: DISPLAY[answerKey], misconception: null };
  const tieDistractor = { text: DISPLAY[otherKey], misconception: 'tie-prop-only' };
  const others = shuffle(rng, SOLIDS.filter((s) => s !== answerKey && s !== otherKey)).slice(0, 3);
  const distractors = [tieDistractor, ...others.map((k) => ({ text: DISPLAY[k], misconception: `wrong-solid-${k}` }))];
  const options = makeMcq(correct, distractors, 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'tie-prop-only') {
      whyWrong[o.text] = `A ${DISPLAY[otherKey].toLowerCase()} does have ${tieVal} ${tieLabel} too — but it has ${FEV[otherKey][distProp]} ${distLabel}, not ${distVal}, so the second clue rules it out.`;
    } else if (o.misconception && o.misconception.startsWith('wrong-solid-')) {
      const wrongKey = o.misconception.slice('wrong-solid-'.length);
      whyWrong[o.text] = `A ${DISPLAY[wrongKey].toLowerCase()} has ${FEV[wrongKey][tieProp]} ${tieLabel} and ${FEV[wrongKey][distProp]} ${distLabel} — neither number matches.`;
    }
  }

  return {
    templateId: 'shapes3d-t2-two-clue-tiebreak',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `A ${DISPLAY[answerKey].toLowerCase()} AND a ${DISPLAY[otherKey].toLowerCase()} share the same ${tieLabel} count — that clue alone can't tell them apart.`,
      `Check the second clue: ${distVal} ${distLabel}. Which of the two matches?`,
    ],
    explain: {
      rule: RULE,
      worked: `Both solids have ${tieVal} ${tieLabel}, but only the ${DISPLAY[answerKey].toLowerCase()} also has ${distVal} ${distLabel} — that second clue proves it.`,
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

function t3TwoClueThirdProperty(rng) {
  const pair = pick(rng, TIE_PAIRS);
  const answerKey = pick(rng, [pair.a, pair.b]);
  const otherKey = answerKey === pair.a ? pair.b : pair.a;
  const clue1 = pair.tieProp;
  const remaining = ['f', 'e', 'v'].filter((p) => p !== clue1);
  const clue2 = pick(rng, remaining);
  const askProp = remaining.find((p) => p !== clue2);
  const clue1Val = FEV[answerKey][clue1];
  const clue2Val = FEV[answerKey][clue2];
  const askVal = FEV[answerKey][askProp];
  const stem = `A solid has ${clue1Val} ${PROP_LABEL[clue1]} and ${clue2Val} ${PROP_LABEL[clue2]}. How many ${PROP_LABEL[askProp]} does it have?`;

  return {
    templateId: 'shapes3d-t3-two-clue-third',
    stem,
    format: 'num',
    accept: [String(askVal), fmt(askVal)],
    hintSteps: [
      `Only one solid in the Solid Family has ${clue1Val} ${PROP_LABEL[clue1]} AND ${clue2Val} ${PROP_LABEL[clue2]} — which one?`,
      `Once you know it's a ${DISPLAY[answerKey].toLowerCase()}, how many ${PROP_LABEL[askProp]} does it have?`,
    ],
    explain: {
      rule: RULE,
      worked: `${clue1Val} ${PROP_LABEL[clue1]} and ${clue2Val} ${PROP_LABEL[clue2]} together can only be a ${DISPLAY[answerKey].toLowerCase()} — a ${DISPLAY[otherKey].toLowerCase()} would have ${FEV[otherKey][askProp]} ${PROP_LABEL[askProp]} instead — so the answer is ${askVal}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1NameSolidCuboidDiagram, t1NameSolidFromDescription, t1RealWorldObjectMatch];
const T2 = [t2FEVCountForSolid, t2PrismOrNot, t2TwoClueTieBreak];
// SPEC_CANON.md audit (see docs/SPEC_CANON.md bullet 38 + PP2 Q55): two prior T3 templates
// were removed as unsupported — t3TotalFEVTwoSolids (summed FEV across two DIFFERENT
// solids, an arithmetic-combination format PP2 Q55 never evidences — it shows only a
// single solid's count) and t3NetValidity (cube-net folding, a concept absent from every
// spec bullet). t3TwoClueThirdProperty replaces them: still single-solid FEV recall, just
// reached via two given clues instead of one, matching the same PP2 Q55-evidenced style.
const T3 = [t3NumFEV, t3WhichSolidHasProperty, t3TwoClueThirdProperty];

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
