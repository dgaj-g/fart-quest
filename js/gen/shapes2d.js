// FART QUEST — GEN agent
// Topic: shapes-2d (Polygon Parlour). generate(tier, rng) -> Question.
//
// visual spec convention (ENGINE_SPEC_2 §C `shape{kind:'shape',shapeKind,labels}`):
// top-level `kind` is always the literal string 'shape' (dispatch key for renderDiagram);
// the SPECIFIC outline name lives under `shapeKind` (one of the outlines diagrams.js's
// shapeOutline() knows: 'square'|'rect'|'parallelogram'|'rhombus'|'kite'|'trapezium'|
// 'triangle-right'|'triangle-equilateral'|'triangle-scalene'|'triangle-iso'). `labels` is
// an array of per-EDGE strings (edge i = the side from point i to point i+1), used here to
// carry side-length numbers so equal/unequal sides are explicit — this matters because
// diagrams.js's 'triangle-equilateral' and 'triangle-iso' outlines are geometrically
// IDENTICAL coordinates (a rendering limitation of the shared engine we do not own/edit),
// so labelled side lengths are the ONLY reliable way to tell an equilateral triangle
// diagram apart from an isosceles one — every template below relies on labels, never on
// outline shape alone, to distinguish those two.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Count the sides, check the angles, look for equal marks — the shape names itself.';

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

// Ensure at least `min` total options (correct + distractors), padding with extra items
// from `extraPool` (a further list of {text, misconception} candidates) if dedup left us
// short. Never invents fake shape names — extraPool is always author-supplied, on-topic.
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

// ---------------------------------------------------------------------------
// Shared fact banks (correctness is sacred — every statement below is a verified
// standard KS2/GCSE-foundation geometry fact; see report for the reasoning per shape).
// ---------------------------------------------------------------------------

const QUAD_NAMES = ['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium'];
const QUAD_DISPLAY = {
  square: 'Square', rectangle: 'Rectangle', rhombus: 'Rhombus',
  parallelogram: 'Parallelogram', kite: 'Kite', trapezium: 'Trapezium',
};
const QUAD_SHAPEKIND = {
  square: 'square', rectangle: 'rect', rhombus: 'rhombus',
  parallelogram: 'parallelogram', kite: 'kite', trapezium: 'trapezium',
};
// One decisive, exam-quotable distinguishing feature per shape — used to build whyWrong
// text when a diagram-naming question's wrong shape name is picked.
const QUAD_DISTINGUISH = {
  square: '4 equal sides AND 4 right angles',
  rectangle: '4 right angles (sides don’t all have to match)',
  rhombus: '4 equal sides (angles don’t have to be 90°)',
  parallelogram: 'two pairs of parallel sides, but no right angles and no equal-sides rule',
  kite: 'two SEPARATE pairs of equal sides, next to each other',
  trapezium: 'exactly ONE pair of parallel sides',
};

const QUAD_FACTS = {
  square: {
    true: ['4 equal sides.', '4 right angles.', 'Opposite sides are parallel.', 'It is always a rectangle.'],
    false: ['Exactly one pair of parallel sides.', 'No right angles.', 'Only 2 of its sides are equal.', 'It is never a rhombus.'],
  },
  rectangle: {
    true: ['4 right angles.', 'Opposite sides are equal in length.', 'Opposite sides are parallel.', 'Two pairs of parallel sides.'],
    false: ['All 4 sides are always equal.', 'No right angles.', 'Exactly one pair of parallel sides.', 'It is always a square.'],
  },
  rhombus: {
    true: ['4 equal sides.', 'Opposite sides are parallel.', 'Opposite angles are equal.', 'Two pairs of parallel sides.'],
    false: ['Always has 4 right angles.', 'Exactly one pair of parallel sides.', 'No sides are equal.', 'It is never a parallelogram.'],
  },
  parallelogram: {
    true: ['Opposite sides are equal in length.', 'Opposite sides are parallel.', 'Opposite angles are equal.', 'Two pairs of parallel sides.'],
    false: ['All 4 sides are always equal.', 'Always has 4 right angles.', 'Exactly one pair of parallel sides.', 'Adjacent sides are always equal.'],
  },
  kite: {
    true: ['Two pairs of equal sides, next to each other (not opposite).', 'One pair of opposite angles are equal in size.'],
    false: ['Two pairs of parallel sides.', 'All 4 sides are equal.', 'Opposite sides are always equal in length.', 'Always has 4 right angles.'],
  },
  trapezium: {
    true: ['Exactly one pair of parallel sides.', 'It has 4 straight sides.'],
    false: ['Two pairs of parallel sides.', 'All sides are equal in length.', 'Always has 4 right angles.', 'Opposite sides are always equal in length.'],
  },
};

const FAMILY_TRUE = [
  'A square is always a rectangle.',
  'A square is always a rhombus.',
  'Every rhombus is a parallelogram.',
  'Every rectangle is a parallelogram.',
  'Every square is a parallelogram.',
];
const FAMILY_FALSE = [
  'A rectangle is always a square.',
  'A rhombus is always a square.',
  'A parallelogram is always a rhombus.',
  'A parallelogram is always a rectangle.',
  'A kite is always a parallelogram.',
  'A trapezium is always a parallelogram.',
];

const PROPERTY_TO_SHAPE = [
  { desc: '4 equal sides, no right angles', shape: 'rhombus' },
  { desc: '4 right angles, opposite sides equal but not all 4 sides the same', shape: 'rectangle' },
  { desc: '4 equal sides AND 4 right angles', shape: 'square' },
  { desc: 'two pairs of equal sides next to each other, and no parallel sides', shape: 'kite' },
  { desc: 'exactly one pair of parallel sides', shape: 'trapezium' },
  { desc: 'opposite sides equal and parallel, but no right angles', shape: 'parallelogram' },
];

// sides count -> canonical name(s). 4-sided has many members (used for odd-one-out's
// "majority" group); other counts have exactly one canonical name each.
const SIDES_OF = {
  triangle: 3, square: 4, rectangle: 4, rhombus: 4, parallelogram: 4, kite: 4, trapezium: 4,
  quadrilateral: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8,
};
const FOUR_SIDED_POOL = ['square', 'rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium', 'quadrilateral'];
const OTHER_SIDED_POOL = [
  { name: 'triangle', sides: 3 }, { name: 'pentagon', sides: 5 }, { name: 'hexagon', sides: 6 },
  { name: 'heptagon', sides: 7 }, { name: 'octagon', sides: 8 },
];
const POLY_NAMES = { 5: 'Pentagon', 6: 'Hexagon', 7: 'Heptagon', 8: 'Octagon' };

function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// -------- T1 templates --------

function t1TriangleFromDiagram(rng) {
  const category = pick(rng, ['equilateral', 'isosceles', 'scalene', 'right-angled']);
  let shapeKind, labels;
  if (category === 'equilateral') {
    const len = rngInt(rng, 4, 9);
    shapeKind = 'triangle-equilateral';
    labels = [`${len} cm`, `${len} cm`, `${len} cm`];
  } else if (category === 'isosceles') {
    const equalLen = rngInt(rng, 4, 9);
    let thirdLen = rngInt(rng, 4, 9);
    if (thirdLen === equalLen) thirdLen = equalLen + 2;
    shapeKind = 'triangle-iso';
    labels = shuffle(rng, [`${equalLen} cm`, `${equalLen} cm`, `${thirdLen} cm`]);
  } else if (category === 'scalene') {
    let a = rngInt(rng, 4, 12), b = rngInt(rng, 4, 12), c = rngInt(rng, 4, 12);
    // guarantee all-distinct (scalene must show NO equal sides)
    if (b === a) b += 1;
    if (c === a || c === b) c = a + b + 1;
    shapeKind = 'triangle-scalene';
    labels = [`${a} cm`, `${b} cm`, `${c} cm`];
  } else {
    // right-angled: scaled 3-4-5 Pythagorean triple so it's a genuine, always-scalene
    // right triangle (never accidentally isosceles-right, which would make "right-angled"
    // ambiguous against "isosceles" as a category in this simplified 4-way classification).
    const k = rngInt(rng, 1, 3);
    shapeKind = 'triangle-right';
    labels = [`${3 * k} cm`, `${4 * k} cm`, `${5 * k} cm`];
  }

  const stem = 'Look at the shape below (drawn roughly, not to exact scale). What type of triangle is it?';
  const visual = { kind: 'shape', shapeKind, labels };

  const CATS = ['equilateral', 'isosceles', 'scalene', 'right-angled'];
  const distractorCats = shuffle(rng, CATS.filter((c) => c !== category)).slice(0, 3);
  const distractors = distractorCats.map((c) => ({ text: capFirst(c), misconception: `not-${c}` }));
  const correct = { text: capFirst(category), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { min: 4 });

  const WHY = {
    equilateral: 'Equilateral needs ALL THREE sides marked equal — check the side labels again.',
    isosceles: 'Isosceles needs exactly TWO sides marked equal — check how many labels match.',
    scalene: 'Scalene means NO sides match at all — but this diagram has matching labels (or a right angle).',
    'right-angled': 'Right-angled needs a 90° corner — this outline doesn’t show one.',
  };
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('not-')) {
      const wrongCat = o.misconception.slice(4);
      whyWrong[o.text] = WHY[wrongCat];
    }
  }

  return {
    templateId: 'shapes2d-t1-triangle-diagram',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Count how many of the side labels are IDENTICAL — all three, exactly two, or none.',
      category === 'right-angled'
        ? 'Now check the corners — is there a 90° square corner anywhere?'
        : `${labels.filter((l, i, arr) => arr.indexOf(l) !== i).length > 0 ? 'Some labels match' : 'No labels match'} — what does that make it?`,
    ],
    explain: {
      rule: RULE,
      worked: `Side labels: ${labels.join(', ')}. That pattern makes this a ${category} triangle.`,
      whyWrong,
    },
  };
}

function t1QuadFromDiagram(rng) {
  const shapeName = pick(rng, QUAD_NAMES);
  const shapeKind = QUAD_SHAPEKIND[shapeName];
  const a = rngInt(rng, 3, 8);
  let b = rngInt(rng, 3, 8);
  if (b === a) b += 1;
  let labels;
  if (shapeName === 'square') labels = [`${a} cm`, `${a} cm`, `${a} cm`, `${a} cm`];
  else if (shapeName === 'rhombus') labels = [`${a} cm`, `${a} cm`, `${a} cm`, `${a} cm`];
  else if (shapeName === 'rectangle' || shapeName === 'parallelogram') labels = [`${a} cm`, `${b} cm`, `${a} cm`, `${b} cm`];
  else if (shapeName === 'kite') labels = [`${a} cm`, `${b} cm`, `${b} cm`, `${a} cm`];
  else {
    let c = rngInt(rng, 3, 8), d = rngInt(rng, 3, 8);
    labels = [`${a} cm`, `${b} cm`, `${c} cm`, `${d} cm`];
  }

  const stem = 'Look at the shape below (drawn roughly, not to exact scale). What is this shape called?';
  const visual = { kind: 'shape', shapeKind, labels };

  const others = shuffle(rng, QUAD_NAMES.filter((n) => n !== shapeName)).slice(0, 3);
  const distractors = others.map((n) => ({ text: QUAD_DISPLAY[n], misconception: `wrong-shape-${n}` }));
  const correct = { text: QUAD_DISPLAY[shapeName], misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('wrong-shape-')) {
      const wrongName = o.misconception.slice('wrong-shape-'.length);
      whyWrong[o.text] = `A ${wrongName} needs ${QUAD_DISTINGUISH[wrongName]} — check the picture again.`;
    }
  }

  return {
    templateId: 'shapes2d-t1-quad-diagram',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Count the equal-length labels first — all four the same, two pairs, or none matching.',
      `Now check the shape's outline — does it look "square-cornered", slanted, diamond-shaped, or something else?`,
    ],
    explain: {
      rule: RULE,
      worked: `Side labels: ${labels.join(', ')}. That pattern, plus the outline shown, makes this a ${shapeName}.`,
      whyWrong,
    },
  };
}

function t1PolygonNameFromSides(rng) {
  const sides = pick(rng, [5, 6, 7, 8]);
  const stem = `A polygon has <b>${sides}</b> straight sides. What is it called?`;
  const correct = { text: POLY_NAMES[sides], misconception: null };
  const others = Object.keys(POLY_NAMES).filter((s) => Number(s) !== sides);
  const distractors = others.map((s) => ({ text: POLY_NAMES[s], misconception: `sides-${s}` }));
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('sides-')) {
      const wrongSides = o.misconception.slice('sides-'.length);
      whyWrong[o.text] = `That name is for a polygon with ${wrongSides} sides, not ${sides}.`;
    }
  }

  return {
    templateId: 'shapes2d-t1-polygon-sides',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Count the sides given in the question, then match it to the name pattern: 5 = penta-, 6 = hexa-, 7 = hepta-, 8 = octa-.',
      `${sides} sides matches which name?`,
    ],
    explain: {
      rule: RULE,
      worked: `${sides} sides → ${POLY_NAMES[sides]}.`,
      whyWrong,
    },
  };
}

function t1CirclePart(rng) {
  const wantRadius = rng() < 0.5;
  const stem = wantRadius
    ? 'What is the name for a straight line from the CENTRE of a circle to its edge?'
    : 'What is the name for a straight line that goes right across a circle, THROUGH the centre, touching both edges?';
  const correctText = wantRadius ? 'Radius' : 'Diameter';
  const otherCircleText = wantRadius ? 'Diameter' : 'Radius';

  const options = [
    { text: correctText, misconception: null },
    { text: otherCircleText, misconception: 'swapped-radius-diameter' },
    { text: 'Side', misconception: 'circle-has-no-sides' },
    { text: 'Corner', misconception: 'circle-has-no-corners' },
  ];

  const whyWrong = {
    [otherCircleText]: wantRadius
      ? 'That’s the line all the way ACROSS through the centre — TWICE as long as the one described here.'
      : 'That’s only from the centre to ONE edge — HALF as long as the one described here.',
    Side: 'A circle is curved all the way round — it has no straight sides at all.',
    Corner: 'A circle is one smooth curve — it has no corners.',
  };

  return {
    templateId: 'shapes2d-t1-circle-part',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'A circle has a centre dot in the middle. One special line touches the centre and ONE edge. Another touches the centre and BOTH edges.',
      wantRadius ? 'Centre to ONE edge only — that’s the shorter one.' : 'All the way across, through the centre — that’s the longer one.',
    ],
    explain: {
      rule: RULE,
      worked: wantRadius
        ? 'Centre to the edge, one straight line = the radius.'
        : 'Right across the circle, through the centre = the diameter (always double the radius).',
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2PropertyToShape(rng) {
  const item = pick(rng, PROPERTY_TO_SHAPE);
  const stem = `A shape has: <b>${item.desc}</b>. What is it called?`;
  const correct = { text: QUAD_DISPLAY[item.shape], misconception: null };
  const otherNames = shuffle(rng, QUAD_NAMES.filter((n) => n !== item.shape));
  const distractors = otherNames.map((n) => ({ text: QUAD_DISPLAY[n], misconception: `wrong-shape-${n}` }));
  const options = makeMcq(correct, distractors, 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception.startsWith('wrong-shape-')) {
      const wrongName = o.misconception.slice('wrong-shape-'.length);
      whyWrong[o.text] = `A ${wrongName} needs ${QUAD_DISTINGUISH[wrongName]} — that doesn’t match the properties given.`;
    }
  }

  return {
    templateId: 'shapes2d-t2-property-to-shape',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Go through the property table in your head: sides equal? right angles? parallel sides?',
      'Only ONE shape in the family matches every property listed — which one?',
    ],
    explain: {
      rule: RULE,
      worked: `${item.desc} → ${QUAD_DISPLAY[item.shape]}.`,
      whyWrong,
    },
  };
}

function t2FalseStatementQuad(rng) {
  const shapeName = pick(rng, ['square', 'rectangle', 'rhombus', 'parallelogram']); // shapes with >=4 true facts
  const facts = QUAD_FACTS[shapeName];
  const trueStatements = facts.true; // use all 4 for a full 5-option question
  const falseStatement = pick(rng, facts.false);

  const stem = `Which of these is <b>NOT true</b> about a ${shapeName}?`;
  const correct = { text: falseStatement, misconception: null };
  const trueOptions = trueStatements.map((t) => ({ text: t, misconception: 'picked-true-fact' }));
  const options = makeMcq(correct, shuffle(rng, trueOptions), 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'picked-true-fact') whyWrong[o.text] = `That IS true for every ${shapeName} — not the odd one out.`;
  }

  return {
    templateId: 'shapes2d-t2-false-statement',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Four of these statements are true for EVERY ${shapeName}. One only applies to a special extra-fancy version.`,
      'Which statement demands something the shape doesn’t always have?',
    ],
    explain: {
      rule: RULE,
      worked: `${falseStatement.replace(/\.$/, '')} is not guaranteed for every ${shapeName} — the other four statements always hold.`,
      whyWrong,
    },
  };
}

function t2AlwaysTrueFamily(rng) {
  const trueStatement = pick(rng, FAMILY_TRUE);
  const falseChoices = shuffle(rng, FAMILY_FALSE).slice(0, 4);

  const stem = 'Which of these statements is <b>ALWAYS</b> true?';
  const correct = { text: trueStatement, misconception: null };
  const distractors = falseChoices.map((f) => ({ text: f, misconception: 'family-loyalty-reversed' }));
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'family-loyalty-reversed') whyWrong[o.text] = 'Family loyalty only flows one way — that claim reverses it, and a counter-example breaks it.';
  }

  return {
    templateId: 'shapes2d-t2-family-tree',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Remember: a square is always a rectangle AND always a rhombus — but it never works backwards.',
      'Which statement describes a shape that ALWAYS has every property of the bigger family, with no exceptions?',
    ],
    explain: {
      rule: RULE,
      worked: `${trueStatement} — true every single time, with zero exceptions.`,
      whyWrong,
    },
  };
}

function t2RegularDefinition(rng) {
  const flavourShape = pick(rng, ['pentagon', 'hexagon', 'heptagon', 'octagon', 'triangle', 'quadrilateral']);
  const stem = `What makes a ${flavourShape} truly <b>REGULAR</b>?`;
  const correct = { text: 'All sides equal AND all angles equal.', misconception: null };
  const distractors = [
    { text: 'All sides equal (the angles can be different).', misconception: 'sides-only' },
    { text: 'All angles equal (the sides can be different).', misconception: 'angles-only' },
    { text: 'It has an even number of sides.', misconception: 'even-sides-myth' },
    { text: 'It just looks neat and symmetrical.', misconception: 'looks-tidy' },
  ];
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { min: 5 });

  const whyWrong = {
    'All sides equal (the angles can be different).': 'Equal sides alone isn’t enough — a rhombus has 4 equal sides but isn’t regular unless the angles match too.',
    'All angles equal (the sides can be different).': 'Equal angles alone isn’t enough — a rectangle has 4 equal angles but isn’t regular unless the sides match too.',
    'It has an even number of sides.': 'The number of sides has nothing to do with “regular” — a regular pentagon (5 sides) exists too.',
    'It just looks neat and symmetrical.': '“Looks tidy” isn’t a maths test — you must check EVERY side and EVERY angle.',
  };

  return {
    templateId: 'shapes2d-t2-regular-definition',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Regular needs TWO things to both be true at once, not just one.',
      'Check: are ALL the sides equal, AND are ALL the angles equal?',
    ],
    explain: {
      rule: RULE,
      worked: 'Regular = every side equal AND every angle equal. Missing either one makes it irregular.',
      whyWrong,
    },
  };
}

// -------- T3 templates --------

function t3SelectTwoQuad(rng) {
  const shapeName = pick(rng, QUAD_NAMES);
  const facts = QUAD_FACTS[shapeName];
  const truePool = shuffle(rng, facts.true);
  const twoTrue = truePool.slice(0, 2);
  const falsePool = shuffle(rng, facts.false);
  const threeFalse = falsePool.slice(0, 3);

  const allOptions = shuffle(rng, [
    ...twoTrue.map((t) => ({ text: t, isTrue: true })),
    ...threeFalse.map((f) => ({ text: f, isTrue: false })),
  ]);
  const correctIndices = allOptions.reduce((acc, o, i) => { if (o.isTrue) acc.push(i); return acc; }, []);
  const options = allOptions.map((o) => ({ text: o.text }));

  const stem = `Which <b>TWO</b> statements are ALWAYS true of a ${shapeName}?`;

  // whyWrong for the 3 non-selected (false) statements, so a review screen can still teach
  // from a select-two miss even though the format itself has no per-option "distractor" slot.
  const whyWrong = {};
  allOptions.forEach((o) => {
    if (!o.isTrue) whyWrong[o.text] = `Not guaranteed for every ${shapeName} — that only holds for a special, extra-fancy version (or never at all).`;
  });

  return {
    templateId: 'shapes2d-t3-selecttwo',
    stem,
    format: 'selecttwo',
    options,
    correctIndices,
    hintSteps: [
      `Think about the ${shapeName}'s sides, angles, and parallel lines — which properties ALWAYS hold, no exceptions?`,
      'Rule out any statement that only applies to a special, extra-fancy version of the shape.',
    ],
    explain: {
      rule: RULE,
      worked: `${twoTrue.join(' ')} — both always hold for a ${shapeName}.`,
      whyWrong,
    },
  };
}

function t3OddOneOutSides(rng) {
  const four = shuffle(rng, FOUR_SIDED_POOL).slice(0, 4);
  const odd = pick(rng, OTHER_SIDED_POOL);
  const allNames = shuffle(rng, [...four, odd.name]);

  const stem = 'Which of these is the ODD ONE OUT?';
  const options = allNames.map((n) => ({
    text: capFirst(n),
    misconception: n === odd.name ? null : 'same-side-count',
  }));
  const correctIndex = options.findIndex((o) => o.misconception === null);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'same-side-count') whyWrong[o.text] = `That has 4 sides, same as the others here — not the odd one out.`;
  }

  return {
    templateId: 'shapes2d-t3-odd-one-out',
    stem,
    options,
    correctIndex,
    hintSteps: [
      'Count the sides of each shape named.',
      `Four of them share the same side count — which one has a DIFFERENT number of sides?`,
    ],
    explain: {
      rule: RULE,
      worked: `${capFirst(odd.name)} has ${odd.sides} sides — every other shape listed has 4.`,
      whyWrong,
    },
  };
}

function t3PolygonSideCountNumWriteIn(rng) {
  const name = pick(rng, ['pentagon', 'hexagon', 'heptagon', 'octagon']);
  const sides = SIDES_OF[name];
  const stem = `How many sides does a regular ${name} have?`;

  return {
    templateId: 'shapes2d-t3-polygon-sides-numwritein',
    stem,
    format: 'num',
    accept: [String(sides), fmt(sides)],
    hintSteps: [
      'Match the name to the pattern: penta- = 5, hexa- = 6, hepta- = 7, octa- = 8.',
      `A ${name} has how many sides?`,
    ],
    explain: {
      rule: RULE,
      worked: `A ${name} has ${sides} sides.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1TriangleFromDiagram, t1QuadFromDiagram, t1PolygonNameFromSides, t1CirclePart];
const T2 = [t2PropertyToShape, t2FalseStatementQuad, t2AlwaysTrueFamily, t2RegularDefinition];
const T3 = [t3SelectTwoQuad, t3OddOneOutSides, t3PolygonSideCountNumWriteIn];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `shapes2d-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'shapes-2d',
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
