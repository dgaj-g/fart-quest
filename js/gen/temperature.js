// FART QUEST — GEN agent
// Topic: temperature (Freezer Geezer's Fridge). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Crossing zero? Count to zero first, then keep going. Two small jumps beat one big slip.';

// -------- shared helpers --------

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
function fmtC(n) {
  return `${fmt(n)}°C`;
}

function dedupe(correctText, list) {
  const seen = new Set([correctText]);
  const out = [];
  for (const c of list) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Fallback padding: plausible nearby signed temperatures, used only if a template's own
// hand-crafted distractor set collapses too far after de-duplication. Never produces the
// correct value itself. Negative results are fine here — these are just mcq option strings.
function padGeneric(rng, correctVal, seen, need) {
  const out = [];
  const offsets = shuffle(rng, [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]);
  for (const off of offsets) {
    if (out.length >= need) break;
    const v = correctVal + off;
    const text = fmtC(v);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push({ text, misconception: 'padded-near-miss' });
  }
  return out;
}

// Builds the final options array: correct + deduped hand-crafted distractors, topped up with
// padGeneric() if dedup left the set short of minTotal.
function buildOptions(rng, correct, distractors, minTotal, correctVal) {
  const chosen = dedupe(correct.text, distractors);
  const options = [correct, ...chosen];
  if (options.length < minTotal) {
    const seen = new Set(options.map((o) => o.text));
    options.push(...padGeneric(rng, correctVal, seen, minTotal - options.length));
  }
  return options;
}

// ================== T1 templates ==================
// Teach: negative numbers on a vertical numline/thermometer; warmer/colder compare.

function t1DistanceFromZero(rng) {
  // Always below zero — "how far below freezing is this reading?" (distance from zero).
  const value = -rngInt(rng, 1, 14);
  const correct = Math.abs(value);
  const min = -15, max = 15, step = 5;

  const stem = `Freezer Geezer's fridge reads <b>${fmtC(value)}</b>. How many degrees is that BELOW the freezing point (0°C)?`;
  const visual = { kind: 'numline', min, max, marker: value, step };

  // Two independently-randomised miscount distractors (variable size and direction) so the
  // correct answer's rank among the sorted options isn't a fixed, guessable pattern.
  const miscount1 = correct + rngInt(rng, 1, 4) * (rng() < 0.5 ? 1 : -1);
  const miscount2 = correct + rngInt(rng, 1, 4) * (rng() < 0.5 ? 1 : -1);
  const distractors = [
    { text: fmtC(value), misconception: 'kept-sign' },
    { text: fmtC(miscount1), misconception: 'miscount' },
    { text: fmtC(miscount2), misconception: 'miscount' },
  ];

  const correctOpt = { text: fmtC(correct), misconception: null };
  const options = buildOptions(rng, correctOpt, shuffle(rng, distractors), 4, correct);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'kept-sign') whyWrong[o.text] = "That's the READING itself — the question asks for the DISTANCE from zero, which is always a positive count of degrees.";
    else if (o.misconception === 'miscount') whyWrong[o.text] = 'Count the steps from zero to the marker again, one at a time.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Count the steps between zero and the marker carefully.';
  }

  return {
    templateId: 'temp-t1-distance-from-zero',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Look at the number line: the marker sits at ${fmtC(value)}, below the 0°C line.`,
      `Count the steps from 0°C down to ${fmtC(value)} — that count is the distance.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtC(value)} is ${correct} steps below 0°C, so it is ${fmtC(correct)} away from freezing.`,
      whyWrong,
    },
  };
}

function t1WarmerColder(rng) {
  let a, b;
  do {
    a = rngInt(rng, -15, 15);
    b = a + rngInt(rng, 1, 10) * (rng() < 0.5 ? 1 : -1);
  } while (b < -15 || b > 15 || b === a);

  const mode = pick(rng, ['warmer', 'colder']);
  const correctVal = mode === 'warmer' ? Math.max(a, b) : Math.min(a, b);
  const wrongVal = mode === 'warmer' ? Math.min(a, b) : Math.max(a, b);
  const bothNegative = a < 0 && b < 0;

  const stem = `Which temperature is ${mode}: <b>${fmtC(a)}</b> or <b>${fmtC(b)}</b>?`;

  const distractors = [
    { text: fmtC(wrongVal), misconception: bothNegative ? 'bigger-digit-trap' : 'wrong-direction' },
    { text: 'They are the same temperature', misconception: 'same-trap' },
  ];

  const correctOpt = { text: fmtC(correctVal), misconception: null };
  const options = buildOptions(rng, correctOpt, shuffle(rng, distractors), 4, correctVal);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'bigger-digit-trap') whyWrong[o.text] = `Careful — below zero, a BIGGER digit means the number is FURTHER from zero (more negative), which is COLDER. That changes which one is really ${mode}.`;
    else if (o.misconception === 'wrong-direction') whyWrong[o.text] = `Check which one is closer to zero (or higher up the thermometer) — that is the ${mode} one.`;
    else if (o.misconception === 'same-trap') whyWrong[o.text] = `${fmtC(a)} and ${fmtC(b)} are ${Math.abs(a - b)} degrees apart — not the same temperature.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'That number was not even one of the two given temperatures — check the two you were given.';
  }

  return {
    templateId: 'temp-t1-warmer-colder',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Picture both temperatures on the Zero Bridge number line.',
      mode === 'warmer' ? 'The WARMER one sits closer to zero (or higher up).' : 'The COLDER one sits further below zero (or lower down).',
    ],
    explain: {
      rule: RULE,
      worked: `${fmtC(a)} and ${fmtC(b)}: the ${mode} one is ${fmtC(correctVal)}.`,
      whyWrong,
    },
  };
}

const TOWNS = ['Bogtown', 'Swampsville', 'Mudchester', 'Frostvale', 'Puddleton', 'Reedham'];

function t1TableColdest(rng) {
  const towns = shuffle(rng, TOWNS).slice(0, 3);
  let values;
  do {
    values = towns.map(() => rngInt(rng, -12, 12));
  } while (new Set(values).size < 3);

  const mode = pick(rng, ['coldest', 'warmest']);
  const extremeVal = mode === 'coldest' ? Math.min(...values) : Math.max(...values);
  const correctIdx = values.indexOf(extremeVal);

  const rows = towns.map((t, i) => [t, fmtC(values[i])]);
  const visual = { kind: 'table', headers: ['Town', 'Temperature'], rows };

  const stem = `Which town was ${mode}?`;

  const rowOptions = towns.map((t, i) => ({ text: t, misconception: i === correctIdx ? null : 'wrong-row' }));
  const options = [
    rowOptions[correctIdx],
    ...rowOptions.filter((_, i) => i !== correctIdx),
    { text: 'Cannot tell from the table', misconception: 'cant-tell' },
  ];

  const whyWrong = {};
  towns.forEach((t, i) => {
    if (i === correctIdx) return;
    whyWrong[t] = `${t} was ${fmtC(values[i])} — check the table again for the ${mode === 'coldest' ? 'LOWEST' : 'HIGHEST'} number, remembering negative numbers below zero still count as colder.`;
  });
  whyWrong['Cannot tell from the table'] = 'The table gives every temperature — no need to guess, just compare the numbers directly.';

  return {
    templateId: 'temp-t1-table-extreme',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      'Read every temperature in the table first.',
      mode === 'coldest' ? 'The coldest is the LOWEST number (most negative wins).' : 'The warmest is the HIGHEST number.',
    ],
    explain: {
      rule: RULE,
      worked: `${towns[correctIdx]} was ${fmtC(extremeVal)}, the ${mode === 'coldest' ? 'lowest' : 'highest'} value in the table.`,
      whyWrong,
    },
  };
}

// ================== T2 templates ==================
// Teach: difference between temperatures incl. both negative; rise/fall wording.

function t2DiffAcrossZero(rng) {
  const negVal = -rngInt(rng, 1, 12);
  const posVal = rngInt(rng, 1, 12);
  const correct = posVal + Math.abs(negVal);

  const stem = `What is the difference between <b>${fmtC(negVal)}</b> and <b>${fmtC(posVal)}</b>?`;

  const ignoredSign = Math.abs(posVal - Math.abs(negVal));
  const distractors = [
    { text: fmtC(correct + 1), misconception: 'zero-double-count' },
    { text: fmtC(ignoredSign), misconception: 'ignored-sign' },
    { text: fmtC(posVal), misconception: 'confused-with-start' },
  ];

  const correctOpt = { text: fmtC(correct), misconception: null };
  const options = buildOptions(rng, correctOpt, shuffle(rng, distractors), 5, correct);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'zero-double-count') whyWrong[o.text] = "Zero is ONE point, not two — don't count it twice when you bridge across it.";
    else if (o.misconception === 'ignored-sign') whyWrong[o.text] = `That treats ${fmtC(negVal)} as if it were positive. Bridge through zero instead: count up to zero, then keep going.`;
    else if (o.misconception === 'confused-with-start') whyWrong[o.text] = "That's just one of the two given temperatures, not the gap between them.";
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Bridge through zero and add the two small jumps again, carefully.';
  }

  return {
    templateId: 'temp-t2-diff-across-zero',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Use the Zero Bridge: how far is ${fmtC(negVal)} from 0°C? How far is ${fmtC(posVal)} from 0°C?`,
      'Add those two small jumps together.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmtC(negVal)} to 0°C is ${Math.abs(negVal)} steps. 0°C to ${fmtC(posVal)} is ${posVal} steps. ${Math.abs(negVal)} + ${posVal} = ${correct}°C.`,
      whyWrong,
    },
  };
}

function t2RiseFall(rng) {
  const start = rngInt(rng, -10, 10);
  const amount = rngInt(rng, 2, 12);
  const direction = pick(rng, ['rose', 'fell']);
  const newVal = direction === 'rose' ? start + amount : start - amount;
  const wrongDirVal = direction === 'rose' ? start - amount : start + amount;
  const crossesZero = direction === 'fell' && start >= 0 && newVal < 0;

  const stem = `The temperature was <b>${fmtC(start)}</b>. It ${direction} by <b>${amount}°C</b>. What is the new temperature?`;

  const distractors = [
    { text: fmtC(wrongDirVal), misconception: 'wrong-direction' },
    { text: fmtC(start), misconception: 'no-change' },
  ];
  if (newVal < 0) distractors.push({ text: fmtC(-newVal), misconception: 'dropped-sign' });

  const correctOpt = { text: fmtC(newVal), misconception: null };
  const options = buildOptions(rng, correctOpt, shuffle(rng, distractors), 5, newVal);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-direction') whyWrong[o.text] = `That goes the WRONG way — "${direction}" means ${direction === 'rose' ? 'ADD' : 'SUBTRACT'}, not the opposite.`;
    else if (o.misconception === 'no-change') whyWrong[o.text] = `That ignores the ${amount}°C change completely.`;
    else if (o.misconception === 'dropped-sign') whyWrong[o.text] = "That's the right SIZE but forgets the temperature crossed below zero — it doesn't stop at zero, it keeps going.";
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the Zero Bridge working again, one small jump at a time.';
  }

  return {
    templateId: 'temp-t2-rise-fall',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `"${direction}" means ${direction === 'rose' ? 'ADD' : 'SUBTRACT'} ${amount} ${direction === 'rose' ? 'to' : 'from'} ${fmtC(start)}.`,
      crossesZero
        ? `Bridge it: ${fmtC(start)} down to 0°C is ${start} steps, leaving ${amount - start} more steps below zero.`
        : `Work it out: ${fmtC(start)} ${direction === 'rose' ? '+' : '−'} ${amount}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtC(start)} ${direction === 'rose' ? '+' : '−'} ${amount} = ${fmtC(newVal)}.`,
      whyWrong,
    },
  };
}

function t2ThermometerWarms(rng) {
  const start = rngInt(rng, -15, 15);
  const amount = rngInt(rng, 3, 15);
  const direction = pick(rng, ['warms up', 'cools down further']);
  const newVal = direction === 'warms up' ? start + amount : start - amount;
  const wrongDirVal = direction === 'warms up' ? start - amount : start + amount;

  const visual = { kind: 'thermometer', min: -20, max: 20, value: start };
  const stem = `The thermometer shows Freezer Geezer's fridge. If it ${direction} by <b>${amount}°C</b>, what will it read?`;

  const distractors = [
    { text: fmtC(wrongDirVal), misconception: 'wrong-direction' },
    { text: fmtC(start), misconception: 'no-change' },
  ];
  if (newVal < 0) distractors.push({ text: fmtC(-newVal), misconception: 'dropped-sign' });

  const correctOpt = { text: fmtC(newVal), misconception: null };
  const options = buildOptions(rng, correctOpt, shuffle(rng, distractors), 5, newVal);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-direction') whyWrong[o.text] = `That goes the WRONG way — "${direction}" means ${direction === 'warms up' ? 'ADD' : 'SUBTRACT'}, not the opposite.`;
    else if (o.misconception === 'no-change') whyWrong[o.text] = `That ignores the ${amount}°C change completely.`;
    else if (o.misconception === 'dropped-sign') whyWrong[o.text] = "That's the right SIZE but forgets the reading crossed below zero.";
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the Zero Bridge working again, one small jump at a time.';
  }

  return {
    templateId: 'temp-t2-thermometer-change',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `The thermometer currently reads ${fmtC(start)}.`,
      `"${direction}" means ${direction === 'warms up' ? 'ADD' : 'SUBTRACT'} ${amount}. ${fmtC(start)} ${direction === 'warms up' ? '+' : '−'} ${amount} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtC(start)} ${direction === 'warms up' ? '+' : '−'} ${amount} = ${fmtC(newVal)}.`,
      whyWrong,
    },
  };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function t2TableDifference(rng) {
  const days = shuffle(rng, DAYS).slice(0, 4);
  let values;
  do {
    values = days.map(() => rngInt(rng, -10, 15));
  } while (new Set(values).size < 4);

  let i, j;
  do {
    i = rngInt(rng, 0, 3);
    j = rngInt(rng, 0, 3);
  } while (i === j);

  const colderIdx = values[i] < values[j] ? i : j;
  const warmerIdx = colderIdx === i ? j : i;
  const correct = values[warmerIdx] - values[colderIdx];

  const rows = days.map((d, idx) => [d, fmtC(values[idx])]);
  const visual = { kind: 'table', headers: ['Day', 'Temperature'], rows };

  const stem = `How many degrees colder was <b>${days[colderIdx]}</b> than <b>${days[warmerIdx]}</b>?`;

  const distractors = [
    { text: fmtC(correct + 1), misconception: 'zero-double-count' },
    { text: fmtC(values[warmerIdx]), misconception: 'confused-with-row' },
    { text: fmtC(Math.abs(values[warmerIdx] + values[colderIdx])), misconception: 'added-instead' },
  ];

  const correctOpt = { text: fmtC(correct), misconception: null };
  const options = buildOptions(rng, correctOpt, shuffle(rng, distractors), 5, correct);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'zero-double-count') whyWrong[o.text] = "Zero is ONE point, not two — don't count it twice if the two days sit on opposite sides of it.";
    else if (o.misconception === 'confused-with-row') whyWrong[o.text] = `That's just ${days[warmerIdx]}'s temperature from the table, not the GAP between the two days.`;
    else if (o.misconception === 'added-instead') whyWrong[o.text] = 'That adds the two temperatures together instead of finding the gap between them.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Read both temperatures from the table again and bridge through zero if you need to.';
  }

  return {
    templateId: 'temp-t2-table-difference',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find both temperatures in the table: ${days[colderIdx]} and ${days[warmerIdx]}.`,
      'Use the Zero Bridge if they sit on opposite sides of zero — otherwise just subtract.',
    ],
    explain: {
      rule: RULE,
      worked: `${days[colderIdx]} was ${fmtC(values[colderIdx])} and ${days[warmerIdx]} was ${fmtC(values[warmerIdx])}. The gap is ${correct}°C.`,
      whyWrong,
    },
  };
}

// ================== T3 templates ==================
// Leans num write-ins. Magnitude-style answers (differences, rise/fall SIZE) are always
// non-negative by construction — the numeric keypad has no minus key, so any template whose
// natural answer is a signed negative number (e.g. "fall of 9 from 4") stays mcq5 instead.

function t3DiffBothNegative(rng) {
  let a, b;
  do {
    a = -rngInt(rng, 1, 18);
    b = -rngInt(rng, 1, 18);
  } while (a === b);
  const correct = Math.abs(a - b);

  const stem = `What is the difference between <b>${fmtC(a)}</b> and <b>${fmtC(b)}</b>?`;

  return {
    templateId: 'temp-t3-diff-both-negative',
    stem,
    format: 'num',
    accept: [String(correct), fmt(correct)],
    unit: '°C',
    hintSteps: [
      'Both temperatures are below zero. Imagine them both on the number line — which is further from zero?',
      'Count the steps directly from the colder one up to the warmer one.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmtC(a)} and ${fmtC(b)} are both below zero. Counting from the colder one up to the warmer one gives ${correct}°C.`,
      whyWrong: {},
    },
  };
}

function t3FallMagnitude(rng) {
  const start = rngInt(rng, 1, 15);
  const endNeg = -rngInt(rng, 1, 15);
  const correct = start - endNeg; // start + |endNeg|, always positive

  const stem = `Freezer Geezer's fridge was <b>${fmtC(start)}</b>. Overnight it fell to <b>${fmtC(endNeg)}</b>. By how many degrees did it fall?`;

  return {
    templateId: 'temp-t3-fall-magnitude',
    stem,
    format: 'num',
    accept: [String(correct), fmt(correct)],
    unit: '°C',
    hintSteps: [
      `Use the Zero Bridge: ${fmtC(start)} down to 0°C is ${start} steps.`,
      `0°C down to ${fmtC(endNeg)} is ${Math.abs(endNeg)} more steps. Add the two small jumps together.`,
    ],
    explain: {
      rule: RULE,
      worked: `${start} steps to zero, then ${Math.abs(endNeg)} more steps below zero. ${start} + ${Math.abs(endNeg)} = ${correct}°C.`,
      whyWrong: {},
    },
  };
}

function t3DiffMixedContext(rng) {
  const lowNeg = -rngInt(rng, 1, 15);
  const highPos = rngInt(rng, 1, 15);
  const correct = highPos - lowNeg; // always positive

  const stem = `The overnight low was <b>${fmtC(lowNeg)}</b>. By midday it had risen to <b>${fmtC(highPos)}</b>. By how many degrees did it rise?`;

  return {
    templateId: 'temp-t3-diff-mixed-context',
    stem,
    format: 'num',
    accept: [String(correct), fmt(correct)],
    unit: '°C',
    hintSteps: [
      `Use the Zero Bridge: ${fmtC(lowNeg)} up to 0°C is ${Math.abs(lowNeg)} steps.`,
      `0°C up to ${fmtC(highPos)} is ${highPos} more steps. Add the two small jumps together.`,
    ],
    explain: {
      rule: RULE,
      worked: `${Math.abs(lowNeg)} steps to zero, then ${highPos} more steps above zero. ${Math.abs(lowNeg)} + ${highPos} = ${correct}°C.`,
      whyWrong: {},
    },
  };
}

function t3RiseFallSigned(rng) {
  const start = rngInt(rng, -10, 10);
  const amount = rngInt(rng, 4, 15);
  const direction = pick(rng, ['fell', 'rose']);
  const newVal = direction === 'fell' ? start - amount : start + amount;
  const wrongDirVal = direction === 'fell' ? start + amount : start - amount;
  const crossesZero = (start >= 0 && newVal < 0) || (start <= 0 && newVal > 0);

  const stem = `Freezer Geezer's reading was <b>${fmtC(start)}</b>. It ${direction} by <b>${amount}°C</b>. What is the new reading?`;

  const distractors = [
    { text: fmtC(wrongDirVal), misconception: 'wrong-direction' },
    { text: fmtC(start), misconception: 'no-change' },
  ];
  if (newVal < 0) distractors.push({ text: fmtC(-newVal), misconception: 'dropped-sign' });
  if (crossesZero) distractors.push({ text: fmtC(newVal + (newVal < 0 ? -1 : 1)), misconception: 'zero-double-count' });

  const correctOpt = { text: fmtC(newVal), misconception: null };
  const options = buildOptions(rng, correctOpt, shuffle(rng, distractors), 5, newVal);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-direction') whyWrong[o.text] = `That goes the WRONG way — "${direction}" means ${direction === 'rose' ? 'ADD' : 'SUBTRACT'}, not the opposite.`;
    else if (o.misconception === 'no-change') whyWrong[o.text] = `That ignores the ${amount}°C change completely.`;
    else if (o.misconception === 'dropped-sign') whyWrong[o.text] = "That's the right SIZE but forgets the reading crossed below zero — it keeps going past zero, it doesn't stop there.";
    else if (o.misconception === 'zero-double-count') whyWrong[o.text] = "Zero is ONE point, not two — don't count it twice when you bridge across it.";
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the Zero Bridge working again, one small jump at a time.';
  }

  return {
    templateId: 'temp-t3-rise-fall-signed',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `"${direction}" means ${direction === 'rose' ? 'ADD' : 'SUBTRACT'} ${amount} ${direction === 'rose' ? 'to' : 'from'} ${fmtC(start)}.`,
      crossesZero
        ? 'Bridge it: count to zero first, then keep going the same direction.'
        : `Work it out directly: ${fmtC(start)} ${direction === 'rose' ? '+' : '−'} ${amount}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtC(start)} ${direction === 'rose' ? '+' : '−'} ${amount} = ${fmtC(newVal)}.`,
      whyWrong,
    },
  };
}

// -------- dispatch --------

const T1 = [t1DistanceFromZero, t1WarmerColder, t1TableColdest];
const T2 = [t2DiffAcrossZero, t2RiseFall, t2ThermometerWarms, t2TableDifference];
const T3 = [t3DiffBothNegative, t3FallMagnitude, t3DiffMixedContext, t3RiseFallSigned];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `temp-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'temperature',
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
