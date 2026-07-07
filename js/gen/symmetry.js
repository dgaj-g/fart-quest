// FART QUEST — GEN agent
// Topic: symmetry (The Hall of Mirrors). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Imagine folding on the line — every point must land exactly on its twin.';

// A single, simple numeric formatter kept for consistency with the other generators, even
// though every number in this topic is already a small whole number (line counts, grid
// columns) so there is never any float junk to clean up.
function fmt(n) {
  return String(Math.round(n));
}

// Proper singular/plural word, never the "throne(s)"-style broken bracket form.
function plural(n, word) {
  return `${word}${n === 1 ? '' : 's'}`;
}

// "A square" vs "An equilateral triangle" — never a bare "A" in front of a vowel sound.
function article(name) {
  return /^[aeiou]/i.test(name) ? 'An' : 'A';
}

// -------- shape ground truth (independent of diagrams.js's SVG coordinates — this is the
// curriculum FACT table; diagrams.js just draws a picture, it does not decide the maths) --------
// visual spec convention (ENGINE_SPEC_2 §C `shape{kind:'shape',shapeKind,labels}`).
const SHAPES = [
  { key: 'square', name: 'square', sides: 4, lines: 4 },
  { key: 'rect', name: 'rectangle', sides: 4, lines: 2 },
  { key: 'rhombus', name: 'rhombus', sides: 4, lines: 2 },
  { key: 'kite', name: 'kite', sides: 4, lines: 1 },
  { key: 'parallelogram', name: 'parallelogram', sides: 4, lines: 0 },
  { key: 'trapezium', name: 'trapezium', sides: 4, lines: 1 },
  { key: 'triangle-equilateral', name: 'equilateral triangle', sides: 3, lines: 3 },
  { key: 'triangle-iso', name: 'isosceles triangle', sides: 3, lines: 1 },
  { key: 'triangle-scalene', name: 'scalene triangle', sides: 3, lines: 0 },
  { key: 'triangle-right', name: 'right-angled triangle', sides: 3, lines: 0 },
];
const HAS_SYMMETRY_POOL = SHAPES.filter((s) => s.lines >= 1);
const NO_SYMMETRY_POOL = SHAPES.filter((s) => s.lines === 0);

function shapeVisual(shape) {
  return { kind: 'shape', shapeKind: shape.key, labels: Array(shape.sides).fill('') };
}

// -------- letter ground truth (standard block-capital classification; hardcoded here as the
// content fact, exactly the way primes/squares etc. are hardcoded in other GEN topics) --------
const VERT_ONLY = ['A', 'M', 'T', 'U', 'V', 'W', 'Y'];
const HORIZ_ONLY = ['B', 'C', 'D', 'E', 'K'];
const BOTH = ['H', 'I', 'O', 'X'];
const NONE_LETTERS = ['F', 'G', 'J', 'L', 'N', 'P', 'Q', 'R', 'S', 'Z'];
const VERT_ALL = [...VERT_ONLY, ...BOTH];
const HORIZ_ALL = [...HORIZ_ONLY, ...BOTH];
const NOT_VERT = [...HORIZ_ONLY, ...NONE_LETTERS];
const NOT_HORIZ = [...VERT_ONLY, ...NONE_LETTERS];

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

// -------- T1 templates --------

// (a) count lines in a simple shape (or the circle special-case: infinitely many).
function t1CountLines(rng) {
  const askCircle = rng() < 0.15;

  if (askCircle) {
    const stem = 'How many lines of symmetry does a <b>circle</b> have?';
    const correct = { text: 'Infinite', misconception: null };
    const distractorPool = [
      { text: fmt(0), misconception: 'assumes-no-symmetry' },
      { text: fmt(1), misconception: 'miscounted' },
      { text: fmt(4), misconception: 'confused-with-square' },
    ];
    const options = [correct, ...uniqueOptions(correct.text, distractorPool)];
    const whyWrong = {};
    whyWrong['0'] = 'A circle folds perfectly on ANY line through its centre — that’s not zero, that’s endless!';
    whyWrong['1'] = 'A circle has way more than one — try turning the fold-line and it still works.';
    whyWrong['4'] = 'That’s a square’s count. A circle has no corners to run out of — it can fold on ANY line through the centre.';

    return {
      templateId: 'sym-t1-count-lines',
      stem,
      options,
      correctIndex: 0,
      hintSteps: [
        'Picture a fold-line drawn straight through the very centre of the circle.',
        'Now imagine turning that line a tiny bit. Does it still fold perfectly? How many different lines can you draw like that?',
      ],
      explain: {
        rule: RULE,
        worked: 'Every single line through the centre of a circle is a line of symmetry — there is no limit, so a circle has INFINITE lines of symmetry.',
        whyWrong,
      },
    };
  }

  const shape = pick(rng, SHAPES);
  const correctVal = shape.lines;
  const stem = `How many lines of symmetry does this ${shape.name} have?`;
  const candidates = [0, 1, 2, 3, 4].filter((v) => v !== correctVal);
  const distractorPool = shuffle(rng, candidates).map((v) => ({
    text: fmt(v),
    misconception: v === 4 ? 'confused-with-square' : v === 0 ? 'assumes-no-symmetry' : 'miscounted',
  }));
  const correct = { text: fmt(correctVal), misconception: null };
  const options = [correct, ...uniqueOptions(correct.text, distractorPool).slice(0, 3)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'confused-with-square') whyWrong[o.text] = `That’s a square’s count — check whether THIS shape’s diagonals and sides really match up.`;
    else if (o.misconception === 'assumes-no-symmetry') whyWrong[o.text] = `Try folding it vertically, horizontally, even diagonally — at least one of those folds DOES land perfectly.`;
    else if (o.misconception === 'miscounted') whyWrong[o.text] = `Close, but fold it again carefully in every direction — you’ve missed one (or counted one too many).`;
  }

  return {
    templateId: 'sym-t1-count-lines',
    stem,
    visual: shapeVisual(shape),
    options,
    correctIndex: 0,
    hintSteps: [
      'Try folding this shape vertically, then horizontally, then along each diagonal. Each fold that lands perfectly, edge to edge, counts as ONE line.',
      `${article(shape.name)} ${shape.name} has ${correctVal} fold${correctVal === 1 ? '' : 's'} that work${correctVal === 1 ? 's' : ''} like that.`,
    ],
    explain: {
      rule: RULE,
      worked: `${article(shape.name)} ${shape.name} has ${correctVal} line${correctVal === 1 ? '' : 's'} of symmetry.`,
      whyWrong,
    },
  };
}

// (b) has-it-got-symmetry: pick the odd one out from a list of shape NAMES (no diagram).
function t1HasSymmetryMcq(rng) {
  const wantHas = rng() < 0.5;

  if (wantHas) {
    const correctShape = pick(rng, HAS_SYMMETRY_POOL);
    const distractors = shuffle(rng, NO_SYMMETRY_POOL);
    const stem = 'Which of these shapes has AT LEAST ONE line of symmetry?';
    const options = [
      { text: correctShape.name, misconception: null },
      ...distractors.map((d) => ({ text: d.name, misconception: 'no-symmetry-shape' })),
    ];
    const whyWrong = {};
    for (const d of distractors) whyWrong[d.name] = `${article(d.name)} ${d.name} has NO lines of symmetry at all — every fold leaves the corners mismatched.`;
    return {
      templateId: 'sym-t1-has-symmetry',
      stem,
      options,
      correctIndex: 0,
      hintSteps: [
        'Picture folding each shape in half. Do BOTH halves land exactly on top of each other, with no gaps and no overlap?',
        `Only one of these shapes can be folded so that every point matches its twin — the ${correctShape.name}.`,
      ],
      explain: {
        rule: RULE,
        worked: `${article(correctShape.name)} ${correctShape.name} has ${correctShape.lines} ${plural(correctShape.lines, 'line')} of symmetry, so it CAN be folded to match itself. The rest have none.`,
        whyWrong,
      },
    };
  }

  const correctShape = pick(rng, NO_SYMMETRY_POOL);
  const distractors = shuffle(rng, HAS_SYMMETRY_POOL).slice(0, 3);
  const stem = 'Which of these shapes has NO line of symmetry at all?';
  const options = [
    { text: correctShape.name, misconception: null },
    ...distractors.map((d) => ({ text: d.name, misconception: 'has-symmetry-shape' })),
  ];
  const whyWrong = {};
  for (const d of distractors) whyWrong[d.name] = `${article(d.name)} ${d.name} DOES have a line of symmetry (${d.lines} of them) — that’s not the odd one out.`;
  return {
    templateId: 'sym-t1-has-symmetry',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Picture folding each shape in half. For most of these, one fold DOES make the halves match.',
      `Only the ${correctShape.name} has NO fold anywhere that works.`,
    ],
    explain: {
      rule: RULE,
      worked: `${article(correctShape.name)} ${correctShape.name} has no lines of symmetry — no fold anywhere makes it match itself. The others all have at least one.`,
      whyWrong,
    },
  };
}

// (c) fold a single shaded cell across a vertical mirror line in a small grid — the simplest
// possible version of "reflected position of a marked cell" (T3 does the harder write-in form).
function t1FoldSingleCell(rng) {
  const cols = pick(rng, [4, 6, 8]);
  const rows = 2;
  const half = cols / 2;
  const targetRow = rngInt(rng, 0, rows - 1);
  const targetCol = rngInt(rng, 0, half - 1); // 0-indexed, strictly in the left half
  const col1 = targetCol + 1; // 1-indexed, for display
  const correctCol1 = cols - targetCol; // reflected column, 1-indexed
  const flippedRow1 = (targetRow === 0 ? 1 : 0) + 1;

  const stem = `This grid folds exactly in half, edge to edge, down the middle. It has ${rows} rows and ${cols} columns (numbered 1 to ${cols} from the left). One cell is shaded — Row ${targetRow + 1}, Column ${col1}. If you fold along the middle, which cell will the shading land on?`;

  const correctText = `Row ${targetRow + 1}, Column ${correctCol1}`;
  const slidCol1 = ((targetCol + half) % cols) + 1;
  const offByOneCol1 = correctCol1 - 1 >= 1 ? correctCol1 - 1 : correctCol1 + 1;

  const distractorPool = [
    { text: `Row ${targetRow + 1}, Column ${slidCol1}`, misconception: 'slid-not-flipped' },
    { text: `Row ${flippedRow1}, Column ${col1}`, misconception: 'wrong-axis' },
    { text: `Row ${targetRow + 1}, Column ${offByOneCol1}`, misconception: 'off-by-one' },
    { text: `Row ${targetRow + 1}, Column ${col1}`, misconception: 'no-reflection' },
  ];
  const correct = { text: correctText, misconception: null };
  const options = [correct, ...uniqueOptions(correct.text, distractorPool).slice(0, 3)];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'slid-not-flipped') whyWrong[o.text] = 'That’s a SLIDE, not a fold — the cell just moved sideways instead of flipping over the mirror line.';
    else if (o.misconception === 'wrong-axis') whyWrong[o.text] = 'That flips the ROW instead of the column — but the mirror line here runs top-to-bottom, so only the column changes.';
    else if (o.misconception === 'off-by-one') whyWrong[o.text] = 'So close! Count the steps from the mirror line again, carefully, on both sides.';
    else if (o.misconception === 'no-reflection') whyWrong[o.text] = 'That’s the ORIGINAL cell — folding moves it across the mirror line to a new spot.';
  }

  return {
    templateId: 'sym-t1-fold-cell',
    stem,
    visual: { kind: 'polygrid', rows, cols, shaded: [[targetRow, targetCol]] },
    options,
    correctIndex: 0,
    hintSteps: [
      `The mirror line runs between column ${half} and column ${half + 1}. Every column pairs with the one the SAME distance away on the other side.`,
      `Column ${col1} is ${half - targetCol} ${plural(half - targetCol, 'column')} from the mirror line, so count that many columns in from the OTHER edge.`,
    ],
    explain: {
      rule: RULE,
      worked: `Column ${col1} is ${half - targetCol} ${plural(half - targetCol, 'step')} from the mirror line, so its twin is ${half - targetCol} ${plural(half - targetCol, 'step')} in from the right: Column ${correctCol1}. The row never changes here — this fold is left-right only.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

// (a) THE rectangle-4-lines trap, taught bidirectionally against its cousin the square.
function t2SquareRectangleContrast(rng) {
  const wantSquare = rng() < 0.5;
  const shape = wantSquare ? SHAPES.find((s) => s.key === 'square') : SHAPES.find((s) => s.key === 'rect');
  const correctVal = shape.lines;
  const oppositeVal = wantSquare ? 2 : 4;
  const stem = `How many lines of symmetry does a ${shape.name} have?`;

  const candidates = [0, 1, 2, 3, 4].filter((v) => v !== correctVal);
  const options = [{ text: fmt(correctVal), misconception: null }];
  for (const v of shuffle(rng, candidates)) {
    options.push({ text: fmt(v), misconception: v === oppositeVal ? 'confused-square-rectangle' : 'miscounted' });
  }

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'confused-square-rectangle') {
      whyWrong[o.text] = wantSquare
        ? 'That’s a RECTANGLE’S count — a square is extra special because all 4 sides are equal, so its diagonals fold perfectly too.'
        : 'That’s a SQUARE’S count — a rectangle’s diagonals do NOT match up unless all 4 sides happen to be equal.';
    } else if (o.misconception === 'miscounted') {
      whyWrong[o.text] = 'Count again: does the vertical fold work? The horizontal fold? Each diagonal?';
    }
  }

  return {
    templateId: 'sym-t2-square-rect',
    stem,
    visual: shapeVisual(shape),
    options,
    correctIndex: 0,
    hintSteps: [
      'Fold along the vertical middle, then the horizontal middle — do both of those work on this shape?',
      `Now try folding corner-to-corner along a diagonal. Does THAT work on a ${shape.name}?`,
    ],
    explain: {
      rule: RULE,
      worked: wantSquare
        ? `A square has 4 lines of symmetry: vertical, horizontal, AND both diagonals, because all 4 sides are equal.`
        : `A rectangle has only 2 lines of symmetry: vertical and horizontal. Its diagonals do NOT fold onto themselves — only a square’s do.`,
      whyWrong,
    },
  };
}

// (b) diagonal lines of symmetry specifically — the "rectangle diagonal is NOT a mirror line" trap.
function t2DiagonalReflection(rng) {
  const DIAGONAL_SHAPES = [
    { key: 'square', name: 'square', sides: 4, lines: 2 },
    { key: 'rect', name: 'rectangle', sides: 4, lines: 0 },
    { key: 'rhombus', name: 'rhombus', sides: 4, lines: 2 },
    { key: 'parallelogram', name: 'parallelogram', sides: 4, lines: 0 },
    { key: 'kite', name: 'kite', sides: 4, lines: 1 },
  ];
  const shape = pick(rng, DIAGONAL_SHAPES);
  const correctVal = shape.lines;
  const stem = `How many DIAGONAL lines of symmetry does this ${shape.name} have? (Not counting the vertical or horizontal fold — corner-to-corner folds only.)`;

  const candidates = [0, 1, 2, 3, 4].filter((v) => v !== correctVal);
  const options = [{ text: fmt(correctVal), misconception: null }];
  for (const v of shuffle(rng, candidates)) {
    options.push({ text: fmt(v), misconception: v > correctVal ? 'diagonal-always-symmetric' : 'undercounted' });
  }

  const isRectLike = shape.key === 'rect' || shape.key === 'parallelogram';
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'diagonal-always-symmetric') {
      whyWrong[o.text] = isRectLike
        ? `Fold a ${shape.name} along its diagonal and the corners do NOT land on each other — that diagonal is NOT a mirror line here.`
        : `Check carefully — not every diagonal on this shape works as a fold-line.`;
    } else if (o.misconception === 'undercounted') {
      whyWrong[o.text] = `Try folding along BOTH diagonals in turn — at least one more than this actually works.`;
    }
  }

  return {
    templateId: 'sym-t2-diagonal',
    stem,
    visual: shapeVisual(shape),
    options,
    correctIndex: 0,
    hintSteps: [
      'Ignore the vertical and horizontal folds for a moment — just try the two corner-to-corner diagonals.',
      `Does folding this ${shape.name} along a diagonal make the corners land exactly on each other?`,
    ],
    explain: {
      rule: RULE,
      worked: `A ${shape.name} has ${correctVal} DIAGONAL ${plural(correctVal, 'line')} of symmetry.` + (isRectLike ? ' Its diagonals do NOT fold onto themselves — only shapes with all sides equal manage that.' : ''),
      whyWrong,
    },
  };
}

// (c) reverse direction: given a target count, pick the matching shape NAME.
function t2WhichShapeMatchesCount(rng) {
  const targetCount = rngInt(rng, 0, 4);
  const matches = SHAPES.filter((s) => s.lines === targetCount);
  const nonMatches = SHAPES.filter((s) => s.lines !== targetCount);
  const correctShape = pick(rng, matches);
  const distractors = shuffle(rng, nonMatches).slice(0, 4);
  const stem = `Which of these shapes has EXACTLY <b>${targetCount}</b> line${targetCount === 1 ? '' : 's'} of symmetry?`;

  const options = [
    { text: correctShape.name, misconception: null },
    ...distractors.map((d) => ({ text: d.name, misconception: 'wrong-count' })),
  ];
  const whyWrong = {};
  for (const d of distractors) whyWrong[d.name] = `${article(d.name)} ${d.name} actually has ${d.lines} line${d.lines === 1 ? '' : 's'} of symmetry, not ${targetCount}.`;

  return {
    templateId: 'sym-t2-which-shape',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Go through each shape and fold it, mentally, in every direction you can think of.',
      `Only one of these lands on EXACTLY ${targetCount}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${article(correctShape.name)} ${correctShape.name} has exactly ${targetCount} line${targetCount === 1 ? '' : 's'} of symmetry.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num-leaning) --------

// (a) complete-the-reflection: given a marked cell, write in the reflected COLUMN number.
function t3ReflectColumn(rng) {
  const cols = pick(rng, [6, 8, 10]);
  const rows = pick(rng, [1, 2, 3]);
  const half = cols / 2;
  const targetRow = rngInt(rng, 0, rows - 1);
  const targetCol = rngInt(rng, 0, half - 1);
  const col1 = targetCol + 1;
  const correctCol1 = cols - targetCol;

  const stem = `A grid has ${rows} row${rows === 1 ? '' : 's'} and ${cols} columns, numbered 1 to ${cols} from the left. The mirror line runs exactly down the middle, between column ${half} and column ${half + 1}. A cell is shaded at Row ${targetRow + 1}, Column ${col1} (shown on the grid). If the pattern is reflected across the mirror line, which COLUMN NUMBER will the reflected shading appear in?`;

  return {
    templateId: 'sym-t3-reflect-column',
    stem,
    format: 'num',
    visual: { kind: 'polygrid', rows, cols, shaded: [[targetRow, targetCol]] },
    accept: [fmt(correctCol1)],
    hintSteps: [
      `Column ${col1} is ${half - targetCol} ${plural(half - targetCol, 'step')} away from the mirror line.`,
      `Its twin sits the SAME number of steps in from the opposite edge — count ${half - targetCol} ${plural(half - targetCol, 'step')} in from column ${cols}.`,
    ],
    explain: {
      rule: RULE,
      worked: `Column ${col1} is ${half - targetCol} ${plural(half - targetCol, 'step')} from the mirror line, so its reflected twin is ${half - targetCol} ${plural(half - targetCol, 'step')} in from the other edge: Column ${correctCol1}.`,
      whyWrong: {},
    },
  };
}

// (b) letters of the alphabet — vertical or horizontal line of symmetry.
function t3LetterSymmetry(rng) {
  const orientation = pick(rng, ['vertical', 'horizontal']);
  const qualifying = orientation === 'vertical' ? VERT_ALL : HORIZ_ALL;
  const disqualifying = orientation === 'vertical' ? NOT_VERT : NOT_HORIZ;
  const correctLetter = pick(rng, qualifying);
  const distractors = shuffle(rng, disqualifying).slice(0, 4);

  const foldDesc = orientation === 'vertical' ? 'top to bottom, straight down the middle' : 'side to side, straight across the middle';
  const stem = `Which of these letters has a <b>${orientation.toUpperCase()}</b> line of symmetry (fold ${foldDesc})?`;

  const options = [
    { text: correctLetter, misconception: null },
    ...distractors.map((l) => ({ text: l, misconception: `no-${orientation}-symmetry` })),
  ];
  const whyWrong = {};
  for (const l of distractors) {
    whyWrong[l] = orientation === 'vertical'
      ? `Folding ${l} top-to-bottom (left half onto right half) does NOT make the two halves match.`
      : `Folding ${l} side-to-side (top half onto bottom half) does NOT make the two halves match.`;
  }

  return {
    templateId: 'sym-t3-letters',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Imagine drawing a ${orientation} line through the middle of each letter.`,
      'Which letter folds PERFECTLY onto itself along that line, with no bits left over?',
    ],
    explain: {
      rule: RULE,
      worked: `${correctLetter} has a ${orientation} line of symmetry — fold it that way and both halves match exactly.`,
      whyWrong,
    },
  };
}

// (c) count lines of symmetry as a write-in (num), reinforcing "0 is a valid answer".
function t3CountLinesNumEntry(rng) {
  const shape = pick(rng, SHAPES);
  const stem = `How many lines of symmetry does a ${shape.name} have? Write the number (0 is allowed!).`;

  return {
    templateId: 'sym-t3-count-numentry',
    stem,
    format: 'num',
    visual: shapeVisual(shape),
    accept: [fmt(shape.lines)],
    hintSteps: [
      'Try folding it vertically, horizontally, and along every diagonal — count every fold that lands perfectly.',
      'Some shapes have NO lines of symmetry at all — if nothing works, the answer is 0.',
    ],
    explain: {
      rule: RULE,
      worked: `${article(shape.name)} ${shape.name} has ${shape.lines} ${plural(shape.lines, 'line')} of symmetry.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1CountLines, t1HasSymmetryMcq, t1FoldSingleCell];
const T2 = [t2SquareRectangleContrast, t2DiagonalReflection, t2WhichShapeMatchesCount];
const T3 = [t3ReflectColumn, t3LetterSymmetry, t3CountLinesNumEntry];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `sym-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'symmetry',
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
