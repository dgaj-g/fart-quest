// FART QUEST — GEN agent
// Topic: turns-compass (The Spinning Chamber). generate(tier, rng) -> Question.
//
// Diagram note (ENGINE_SPEC_2 §C): the documented renderDiagram() BUILDERS list has no
// "compass" kind (clock/barchart/table/…/coins/scaledrawing — no compass rose primitive),
// and this generator must never invent an undocumented kind or import diagrams.js directly.
// Every template below therefore ships `visual: null` — the stem text alone is sufficient
// (compass points are named in words, not read off a picture); the lesson file carries a
// hand-built HTML/CSS compass rose (svg-free, per the lesson-card contract) instead.
//
// Compass model: 8 points, clockwise from North, index 0-7:
//   0 North, 1 North-East, 2 East, 3 South-East, 4 South, 5 South-West, 6 West, 7 North-West.
// The 4 cardinals sit at even indices (0,2,4,6) and read N-E-S-W clockwise — "Naughty
// Elephants Squirt Water" — so a quarter turn clockwise is exactly "one letter along" on
// that 4-point cycle, which is the same as moving 2 steps on the 8-point list (45° each).
// Taught turn sizes are always multiples of 90°: quarter (2 steps), half (4 steps),
// three-quarter (6 steps), full (8 steps / back to start).
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = "N-E-S-W clockwise ('Naughty Elephants Squirt Water'). A quarter turn = one letter along.";

const POINTS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
const CARDINAL_IDX = [0, 2, 4, 6];
const TURN_SIZES = [
  { name: 'quarter turn', steps: 2, deg: 90 },
  { name: 'half turn', steps: 4, deg: 180 },
  { name: 'three-quarter turn', steps: 6, deg: 270 },
];

function mod8(n) {
  return ((n % 8) + 8) % 8;
}
function pointAt(idx) {
  return POINTS[mod8(idx)];
}
function signedSteps(turn) {
  return turn.direction === 'clockwise' ? turn.size.steps : -turn.size.steps;
}
function randomTurn(rng) {
  return { size: pick(rng, TURN_SIZES), direction: pick(rng, ['clockwise', 'anticlockwise']) };
}

// Dedupe candidate {text, misconception} distractors against the correct text and each
// other, then pad with still-unused compass points (shuffled, tagged 'plausible-other-point')
// until at least `min` TOTAL options (correct + distractors) exist. Never invents fake
// direction names — the padding pool is always the same 8 real compass points.
function fillToMin(correct, candidates, min, rng) {
  const seen = new Set([correct.text]);
  const options = [correct];
  for (const c of shuffle(rng, candidates)) {
    if (options.length >= min) break;
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    options.push(c);
  }
  if (options.length < min) {
    const unused = shuffle(rng, POINTS.filter((p) => !seen.has(p)));
    for (const p of unused) {
      if (options.length >= min) break;
      if (seen.has(p)) continue;
      seen.add(p);
      options.push({ text: p, misconception: 'plausible-other-point' });
    }
  }
  return options;
}

const WHY_POINT = {
  'wrong-direction': 'That’s the right SIZE of turn but the wrong DIRECTION — check clockwise against anticlockwise carefully.',
  'no-turn': 'That’s where she started — a real turn always lands on a NEW direction.',
  'too-far': 'That’s further round the compass than this turn actually takes her — check the size again.',
  'wrong-size-smaller': 'That turn is too SMALL — quarter, half and three-quarter turns are 2, 4 and 6 points apart on the compass.',
  'wrong-size-larger': 'That turn is too BIG — check how many points round the compass this size of turn really moves.',
  'plausible-other-point': 'Walk round the compass one point at a time from the start — that’s not where this turn lands.',
  'skipped-one': 'That’s TWO points along, not one — check you moved by only a single point.',
  opposite: 'That’s the point directly OPPOSITE — not simply the next one round.',
};

function attachWhyWrong(options) {
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && o.misconception !== null && WHY_POINT[o.misconception]) {
      whyWrong[o.text] = WHY_POINT[o.misconception];
    }
  }
  return whyWrong;
}

// -------- T1 templates (quarter-turns and cardinal-point order, N/E/S/W only, clockwise only) --------

function t1QuarterForward(rng) {
  const startIdx = pick(rng, CARDINAL_IDX);
  const startName = pointAt(startIdx);
  const endIdx = mod8(startIdx + 2);
  const endName = pointAt(endIdx);

  const candidates = [
    { text: pointAt(startIdx - 2), misconception: 'wrong-direction' }, // anticlockwise result
    { text: pointAt(startIdx + 4), misconception: 'too-far' }, // opposite point (double turn)
    { text: startName, misconception: 'no-turn' },
  ];
  const correct = { text: endName, misconception: null };
  const options = fillToMin(correct, candidates, 4, rng);

  return {
    templateId: 'turnscompass-t1-quarter-forward',
    stem: `Wrong-Way Wanda is facing <b>${startName}</b>. She turns a <b>quarter turn clockwise</b>. Which direction is she facing now?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `Remember the mnemonic: N-E-S-W clockwise ("Naughty Elephants Squirt Water").`,
      `A quarter turn is one letter along from ${startName}. Which letter comes next, going clockwise?`,
    ],
    explain: {
      rule: RULE,
      worked: `N-E-S-W clockwise. One letter along from ${startName} is ${endName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

function t1CardinalOrderRecall(rng) {
  const correct = { text: 'North, East, South, West', misconception: null };
  const candidates = [
    { text: 'North, West, South, East', misconception: 'wrong-direction' },
    { text: 'North, South, East, West', misconception: 'plausible-other-point' },
    { text: 'East, South, West, North', misconception: 'plausible-other-point' },
  ];
  const options = shuffle(rng, [...candidates]);
  options.unshift(correct);

  const whyWrong = {
    'North, West, South, East': 'That’s the ANTICLOCKWISE order — clockwise goes the other way round.',
    'North, South, East, West': 'That jumps out of order — clockwise from North goes to East next, not South.',
    'East, South, West, North': 'That starts from the wrong point — the clockwise cycle is always said starting from North: N-E-S-W.',
  };

  return {
    templateId: 'turnscompass-t1-cardinal-order-recall',
    stem: 'Which of these lists the four main compass points in the correct CLOCKWISE order, starting from North?',
    options,
    correctIndex: 0,
    hintSteps: [
      'Remember the mnemonic: "Naughty Elephants Squirt Water".',
      'N-E-S-W, in that order, going clockwise.',
    ],
    explain: {
      rule: RULE,
      worked: 'Clockwise from North: North, East, South, West — "Naughty Elephants Squirt Water".',
      whyWrong,
    },
  };
}

function t1NextClockwiseCardinal(rng) {
  const startIdx = pick(rng, CARDINAL_IDX);
  const startName = pointAt(startIdx);
  const nextName = pointAt(startIdx + 2);

  const correct = { text: nextName, misconception: null };
  const candidates = [
    { text: pointAt(startIdx - 2), misconception: 'wrong-direction' },
    { text: pointAt(startIdx + 4), misconception: 'skipped-one' },
    { text: startName, misconception: 'no-turn' },
  ];
  const options = fillToMin(correct, candidates, 4, rng);

  return {
    templateId: 'turnscompass-t1-next-clockwise-cardinal',
    stem: `Going clockwise (N-E-S-W), which direction comes straight after <b>${startName}</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'Say the mnemonic in order: North, East, South, West, then back to North.',
      `What comes straight after ${startName}?`,
    ],
    explain: {
      rule: RULE,
      worked: `N-E-S-W clockwise, so straight after ${startName} comes ${nextName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

// -------- T2 templates (8-point compass, ¾ turns, anticlockwise) --------

function t2EightPointForward(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const turn = randomTurn(rng);
  const endIdx = mod8(startIdx + signedSteps(turn));
  const endName = pointAt(endIdx);

  const wrongDirIdx = mod8(startIdx - signedSteps(turn));
  const sizeIdx = TURN_SIZES.indexOf(turn.size);
  const smallerSize = TURN_SIZES[sizeIdx - 1];
  const largerSize = TURN_SIZES[sizeIdx + 1];
  const candidates = [{ text: pointAt(wrongDirIdx), misconception: 'wrong-direction' }];
  if (smallerSize) {
    const steps = turn.direction === 'clockwise' ? smallerSize.steps : -smallerSize.steps;
    candidates.push({ text: pointAt(startIdx + steps), misconception: 'wrong-size-smaller' });
  }
  if (largerSize) {
    const steps = turn.direction === 'clockwise' ? largerSize.steps : -largerSize.steps;
    candidates.push({ text: pointAt(startIdx + steps), misconception: 'wrong-size-larger' });
  }
  candidates.push({ text: startName, misconception: 'no-turn' });

  const correct = { text: endName, misconception: null };
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t2-eight-point-forward',
    stem: `Wanda is facing <b>${startName}</b>. She turns a <b>${turn.size.name}</b> ${turn.direction}. Which direction is she facing now?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `A quarter turn = 2 points, a half turn = 4 points, a three-quarter turn = 6 points, always ${turn.direction}.`,
      `From ${startName}, count ${turn.size.steps} points ${turn.direction} round the compass.`,
    ],
    explain: {
      rule: RULE,
      worked: `${startName} + a ${turn.size.name} ${turn.direction} (${turn.size.steps} points) = ${endName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

function t2DegreesForward(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const turn = randomTurn(rng);
  const endIdx = mod8(startIdx + signedSteps(turn));
  const endName = pointAt(endIdx);

  const wrongDirIdx = mod8(startIdx - signedSteps(turn));
  const sizeIdx = TURN_SIZES.indexOf(turn.size);
  const smallerSize = TURN_SIZES[sizeIdx - 1];
  const largerSize = TURN_SIZES[sizeIdx + 1];
  const candidates = [{ text: pointAt(wrongDirIdx), misconception: 'wrong-direction' }];
  if (smallerSize) {
    const steps = turn.direction === 'clockwise' ? smallerSize.steps : -smallerSize.steps;
    candidates.push({ text: pointAt(startIdx + steps), misconception: 'wrong-size-smaller' });
  }
  if (largerSize) {
    const steps = turn.direction === 'clockwise' ? largerSize.steps : -largerSize.steps;
    candidates.push({ text: pointAt(startIdx + steps), misconception: 'wrong-size-larger' });
  }
  candidates.push({ text: startName, misconception: 'no-turn' });

  const correct = { text: endName, misconception: null };
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t2-degrees-forward',
    stem: `Wanda is facing <b>${startName}</b>. She turns <b>${turn.size.deg}°</b> ${turn.direction}. Which direction is she facing now?`,
    options,
    correctIndex: 0,
    hintSteps: [
      '90° = a quarter turn (2 points), 180° = a half turn (4 points), 270° = a three-quarter turn (6 points).',
      `${turn.size.deg}° ${turn.direction} from ${startName} is ${turn.size.steps} points that way round the compass.`,
    ],
    explain: {
      rule: RULE,
      worked: `${turn.size.deg}° is a ${turn.size.name} (${turn.size.steps} points). ${startName} + a ${turn.size.name} ${turn.direction} = ${endName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

function t2NextPointEitherDirection(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const direction = pick(rng, ['clockwise', 'anticlockwise']);
  const step = direction === 'clockwise' ? 1 : -1;
  const correctName = pointAt(startIdx + step);

  const candidates = [
    { text: pointAt(startIdx + 2 * step), misconception: 'skipped-one' },
    { text: pointAt(startIdx - step), misconception: 'wrong-direction' },
    { text: pointAt(startIdx + 4), misconception: 'opposite' },
    { text: startName, misconception: 'no-turn' },
  ];
  const correct = { text: correctName, misconception: null };
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t2-next-point-either-direction',
    stem: `Going <b>${direction}</b> around the compass, which direction comes straight after <b>${startName}</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'The 8-point compass, clockwise, is: N, NE, E, SE, S, SW, W, NW, then back to N.',
      `Going ${direction}, move just ONE point from ${startName}.`,
    ],
    explain: {
      rule: RULE,
      worked: `One point ${direction} from ${startName} is ${correctName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

// -------- T3 templates (8-point compass, all four turn sizes incl. whole turn) --------

// Bullet 40 names "whole turns" alongside quarter/half/three-quarter, but no template above
// ever uses one as the CORRECT size — T3 is where the full ¼/½/¾/whole set (and its 90/180/
// 270/360° equivalents) finally gets exercised together, on the harder 8-point/either-direction
// board.
const TURN_SIZES_ALL = [...TURN_SIZES, { name: 'whole turn', steps: 8, deg: 360 }];

function t3EightPointForwardAllSizes(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const size = pick(rng, TURN_SIZES_ALL);
  const direction = pick(rng, ['clockwise', 'anticlockwise']);
  const steps = direction === 'clockwise' ? size.steps : -size.steps;
  const endIdx = mod8(startIdx + steps);
  const endName = pointAt(endIdx);

  const wrongDirIdx = mod8(startIdx - steps);
  const sizeIdx = TURN_SIZES_ALL.indexOf(size);
  const smallerSize = TURN_SIZES_ALL[sizeIdx - 1];
  const largerSize = TURN_SIZES_ALL[sizeIdx + 1];
  const candidates = [{ text: pointAt(wrongDirIdx), misconception: 'wrong-direction' }];
  if (smallerSize) {
    const s = direction === 'clockwise' ? smallerSize.steps : -smallerSize.steps;
    candidates.push({ text: pointAt(startIdx + s), misconception: 'wrong-size-smaller' });
  }
  if (largerSize) {
    const s = direction === 'clockwise' ? largerSize.steps : -largerSize.steps;
    candidates.push({ text: pointAt(startIdx + s), misconception: 'wrong-size-larger' });
  }
  candidates.push({ text: startName, misconception: 'no-turn' });
  const correct = { text: endName, misconception: null };
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t3-eight-point-forward-all-sizes',
    stem: `Wanda is facing <b>${startName}</b>. She turns a <b>${size.name}</b> ${direction}. Which direction is she facing now?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `A quarter turn = 2 points, a half turn = 4 points, a three-quarter turn = 6 points, a whole turn = 8 points (back to start), always ${direction}.`,
      `From ${startName}, count ${size.steps} points ${direction} round the compass.`,
    ],
    explain: {
      rule: RULE,
      worked:
        size.steps === 8
          ? `A whole turn is 8 points — right the way round the compass — so she ends up facing exactly where she started: ${startName}.`
          : `${startName} + a ${size.name} ${direction} (${size.steps} points) = ${endName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

function t3DegreesForward(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const size = pick(rng, TURN_SIZES_ALL);
  const direction = pick(rng, ['clockwise', 'anticlockwise']);
  const steps = direction === 'clockwise' ? size.steps : -size.steps;
  const endIdx = mod8(startIdx + steps);
  const endName = pointAt(endIdx);

  const wrongDirIdx = mod8(startIdx - steps);
  const sizeIdx = TURN_SIZES_ALL.indexOf(size);
  const smallerSize = TURN_SIZES_ALL[sizeIdx - 1];
  const largerSize = TURN_SIZES_ALL[sizeIdx + 1];
  const candidates = [{ text: pointAt(wrongDirIdx), misconception: 'wrong-direction' }];
  if (smallerSize) {
    const s = direction === 'clockwise' ? smallerSize.steps : -smallerSize.steps;
    candidates.push({ text: pointAt(startIdx + s), misconception: 'wrong-size-smaller' });
  }
  if (largerSize) {
    const s = direction === 'clockwise' ? largerSize.steps : -largerSize.steps;
    candidates.push({ text: pointAt(startIdx + s), misconception: 'wrong-size-larger' });
  }
  candidates.push({ text: startName, misconception: 'no-turn' });
  const correct = { text: endName, misconception: null };
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t3-degrees-forward',
    stem: `Wanda is facing <b>${startName}</b>. She turns <b>${size.deg}°</b> ${direction}. Which direction is she facing now?`,
    options,
    correctIndex: 0,
    hintSteps: [
      '90° = a quarter turn (2 points), 180° = a half turn (4 points), 270° = a three-quarter turn (6 points), 360° = a whole turn (8 points).',
      `${size.deg}° ${direction} from ${startName} is ${size.steps} points that way round the compass.`,
    ],
    explain: {
      rule: RULE,
      worked: `${size.deg}° is a ${size.name} (${size.steps} points). ${startName} + a ${size.name} ${direction} = ${endName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

function t3WholeTurnEitherDirection(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const direction = pick(rng, ['clockwise', 'anticlockwise']);

  const correct = { text: startName, misconception: null };
  const candidates = [
    { text: pointAt(startIdx + 4), misconception: 'opposite' },
    { text: pointAt(startIdx + 2), misconception: 'wrong-size-smaller' },
    { text: pointAt(startIdx - 2), misconception: 'wrong-size-smaller' },
  ];
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t3-whole-turn-either-direction',
    stem: `Wanda is facing <b>${startName}</b>. She makes a <b>whole turn</b> ${direction}. Which direction is she facing now?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'A whole turn is all 8 points of the compass — right the way round.',
      `That always brings you back to face exactly where you started: ${startName}.`,
    ],
    explain: {
      rule: RULE,
      worked: `A whole turn (360°, 8 points) always ends facing the SAME direction you started in — ${startName} — whichever way you turn.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

// -------- dispatch --------

const T1 = [t1QuarterForward, t1CardinalOrderRecall, t1NextClockwiseCardinal];
const T2 = [t2EightPointForward, t2DegreesForward, t2NextPointEitherDirection];
const T3 = [t3EightPointForwardAllSizes, t3DegreesForward, t3WholeTurnEitherDirection];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `turnscompass-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'turns-compass',
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
