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

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
function mod8(n) {
  return ((n % 8) + 8) % 8;
}
function pointAt(idx) {
  return POINTS[mod8(idx)];
}
function capSize(sizeName) {
  return `A ${sizeName}`;
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
  'forgot-invert': 'That applies the SAME direction again — but to find the START you must undo the turn by going the OPPOSITE way.',
  'stopped-early': 'That’s only after the FIRST turn — the second turn still has to happen.',
  'ignored-direction-change': 'That uses the wrong direction for the second turn — each turn keeps its OWN clockwise or anticlockwise direction.',
  'near-miss': 'Check each turn’s size carefully — that’s one compass point out from the real answer.',
  'both-flipped': 'That reverses BOTH turns’ directions — only reverse a turn when working backwards from the end.',
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

// -------- T1 templates (quarter-turns from N/E/S/W only, clockwise only) --------

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

function t1TurnSizeFromCardinalPair(rng) {
  const startIdx = pick(rng, CARDINAL_IDX);
  const startName = pointAt(startIdx);
  const endName = pointAt(startIdx + 2);

  const correct = { text: 'A quarter turn clockwise', misconception: null };
  const candidates = [
    { text: 'A half turn clockwise', misconception: 'wrong-size-larger' },
    { text: 'A three-quarter turn clockwise', misconception: 'wrong-size-larger' },
    { text: 'A quarter turn anticlockwise', misconception: 'wrong-direction' },
  ];
  const options = fillToMin(correct, candidates, 4, rng);

  return {
    templateId: 'turnscompass-t1-turn-size-from-pair',
    stem: `Wanda turns from facing <b>${startName}</b> to facing <b>${endName}</b> (the short way round, clockwise). What size of turn did she make?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `${startName} and ${endName} are next to each other on the N-E-S-W clockwise cycle.`,
      'One letter along the cycle is always a quarter turn.',
    ],
    explain: {
      rule: RULE,
      worked: `${startName} to ${endName} is one letter along, clockwise — that’s always a quarter turn.`,
      whyWrong: attachWhyWrong(options),
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

const SIZE_PHRASES = ['A quarter turn', 'A half turn', 'A three-quarter turn'];
const WHY_SIZE = {
  'A quarter turn': 'A quarter turn is only 2 points round the compass — count the points between the two directions again.',
  'A half turn': 'A half turn is 4 points round the compass — check the count again.',
  'A three-quarter turn': 'A three-quarter turn is 6 points round the compass — check the count again.',
  'A full turn': 'A full turn brings her back to face the SAME direction she started in — but she ended up facing somewhere new.',
  'No turn at all': 'She DID end up facing a different direction, so a turn must have happened — count how many points apart the two directions are.',
};

function t2TurnSizeEightPoint(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const turn = randomTurn(rng);
  const endIdx = mod8(startIdx + signedSteps(turn));
  const endName = pointAt(endIdx);

  const correctPhrase = capSize(turn.size.name);
  const otherSizes = SIZE_PHRASES.filter((p) => p !== correctPhrase);
  const options = [
    { text: correctPhrase, misconception: null },
    ...otherSizes.map((p) => ({ text: p, misconception: 'wrong-size' })),
    { text: 'A full turn', misconception: 'wrong-size' },
    { text: 'No turn at all', misconception: 'no-turn-recognised' },
  ];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception) whyWrong[o.text] = WHY_SIZE[o.text];
  }

  return {
    templateId: 'turnscompass-t2-turn-size-eight-point',
    stem: `Facing <b>${startName}</b>, Wanda turns <b>${turn.direction}</b> until she is facing <b>${endName}</b>. What size of turn was that?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `Count how many compass points there are between ${startName} and ${endName}, going ${turn.direction}.`,
      '2 points = quarter turn, 4 points = half turn, 6 points = three-quarter turn.',
    ],
    explain: {
      rule: RULE,
      worked: `${startName} to ${endName} going ${turn.direction} is ${turn.size.steps} points — a ${turn.size.name}.`,
      whyWrong,
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

// -------- T3 templates (reverse turns, multi-instruction chains) --------

function t3ReverseTurn(rng) {
  const endIdx = rngInt(rng, 0, 7);
  const endName = pointAt(endIdx);
  const turn = randomTurn(rng);
  // Inverse: undo the stated turn by going the OPPOSITE way from the end.
  const inverseSteps = turn.direction === 'clockwise' ? -turn.size.steps : turn.size.steps;
  const startIdx = mod8(endIdx + inverseSteps);
  const startName = pointAt(startIdx);

  const forgotInvertIdx = mod8(endIdx - inverseSteps); // applied the SAME direction again
  const sizeIdx = TURN_SIZES.indexOf(turn.size);
  const altSize = TURN_SIZES[sizeIdx === 0 ? 1 : sizeIdx - 1];
  const altSteps = turn.direction === 'clockwise' ? -altSize.steps : altSize.steps;
  const candidates = [
    { text: pointAt(forgotInvertIdx), misconception: 'forgot-invert' },
    { text: endName, misconception: 'no-turn' },
    { text: pointAt(endIdx + altSteps), misconception: 'wrong-size-smaller' },
  ];
  const correct = { text: startName, misconception: null };
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t3-reverse-turn',
    stem: `Wanda ends up facing <b>${endName}</b> after making a <b>${turn.size.name}</b> ${turn.direction}. Which direction was she facing at the START?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'To find the START, undo the turn: same size, but the OPPOSITE direction.',
      `Undo a ${turn.size.name} ${turn.direction} by turning ${turn.direction === 'clockwise' ? 'anticlockwise' : 'clockwise'} from ${endName}.`,
    ],
    explain: {
      rule: RULE,
      worked: `To reverse a ${turn.size.name} ${turn.direction}, turn the SAME size the OPPOSITE way from ${endName}: that gives ${startName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

function t3ChainTwoTurns(rng) {
  const startIdx = rngInt(rng, 0, 7);
  const startName = pointAt(startIdx);
  const turn1 = randomTurn(rng);
  const turn2 = randomTurn(rng);
  const idxAfter1 = mod8(startIdx + signedSteps(turn1));
  const idxAfter2 = mod8(idxAfter1 + signedSteps(turn2));
  const endName = pointAt(idxAfter2);

  const ignoredDirIdx = mod8(idxAfter1 + (turn1.direction === 'clockwise' ? turn2.size.steps : -turn2.size.steps));
  const totalSigned = signedSteps(turn1) + signedSteps(turn2);
  const mirrorIdx = mod8(startIdx - totalSigned);

  const candidates = [
    { text: pointAt(idxAfter1), misconception: 'stopped-early' },
    { text: pointAt(ignoredDirIdx), misconception: 'ignored-direction-change' },
    { text: pointAt(mirrorIdx), misconception: 'both-flipped' },
    { text: pointAt(idxAfter2 + 1), misconception: 'near-miss' },
  ];
  const correct = { text: endName, misconception: null };
  const options = fillToMin(correct, candidates, 5, rng);

  return {
    templateId: 'turnscompass-t3-chain-two-turns',
    stem: `Wanda starts facing <b>${startName}</b>. She turns a <b>${turn1.size.name}</b> ${turn1.direction}, then a <b>${turn2.size.name}</b> ${turn2.direction}. Which direction is she facing now?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `Do ONE turn at a time. First: ${startName} + a ${turn1.size.name} ${turn1.direction} = ?`,
      `Now take THAT direction and apply the second turn: + a ${turn2.size.name} ${turn2.direction} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${startName} → (${turn1.size.name} ${turn1.direction}) → ${pointAt(idxAfter1)} → (${turn2.size.name} ${turn2.direction}) → ${endName}.`,
      whyWrong: attachWhyWrong(options),
    },
  };
}

function t3TotalDegreesNumWriteIn(rng) {
  const turn1 = randomTurn(rng);
  const turn2 = randomTurn(rng);
  const total = turn1.size.deg + turn2.size.deg;

  return {
    templateId: 'turnscompass-t3-total-degrees-numwritein',
    stem: `Wanda makes a <b>${turn1.size.name}</b> ${turn1.direction}, then a <b>${turn2.size.name}</b> ${turn2.direction}. What is the TOTAL number of degrees in her two turns, added together?`,
    format: 'num',
    accept: [String(total), fmt(total)],
    unit: '°',
    hintSteps: [
      'Every turn has a fixed number of degrees: quarter = 90°, half = 180°, three-quarter = 270°.',
      `${turn1.size.name} = ${turn1.size.deg}°. ${turn2.size.name} = ${turn2.size.deg}°. Add them.`,
    ],
    explain: {
      rule: RULE,
      worked: `${turn1.size.name} = ${turn1.size.deg}°. ${turn2.size.name} = ${turn2.size.deg}°. ${turn1.size.deg} + ${turn2.size.deg} = ${total}°.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1QuarterForward, t1TurnSizeFromCardinalPair, t1NextClockwiseCardinal];
const T2 = [t2EightPointForward, t2TurnSizeEightPoint, t2NextPointEitherDirection];
const T3 = [t3ReverseTurn, t3ChainTwoTurns, t3TotalDegreesNumWriteIn];

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
