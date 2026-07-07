// FART QUEST — GEN agent
// Topic: graphs-charts (Bar Chart Alley). generate(tier, rng) -> Question.
// Weapon rule (verbatim, must match data/topics/graphs-charts.js exactly):
//   "Read the SCALE before the bars — one square is not always one."
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Read the SCALE before the bars — one square is not always one.';

// Single number formatter used everywhere in this file (BUILD_SPEC §8: "fmt() helper for
// all numbers"). All values here are small non-negative whole numbers (chart counts), so this
// only needs UK thousands-comma formatting for consistency with the rest of the app.
function fmt(v) {
  return Math.round(v).toLocaleString('en-GB');
}

// -------- category / context label banks (variety across generations) --------
// Each bank gives a plausible y-axis label + a pool of >=5 category names, so bar/line
// charts read like real mini real-world contexts, never the same chart twice in a row.
const CHART_BANKS = [
  { yLabel: 'Number of pupils', items: ['Dogs', 'Cats', 'Fish', 'Rabbits', 'Hamsters', 'Guinea pigs'] },
  { yLabel: 'Ice creams sold', items: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { yLabel: 'Books read', items: ['Aisling', 'Conor', 'Maya', 'Tom', 'Priya', 'Ben'] },
  { yLabel: 'Votes', items: ['Football', 'Swimming', 'Tennis', 'Rugby', 'Hockey', 'Netball'] },
  { yLabel: 'Cars parked', items: ['Red', 'Blue', 'Silver', 'Black', 'Green', 'White'] },
  { yLabel: 'Minutes of rain', items: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
];

const PICTOGRAM_BANKS = [
  { symbol: '🍕', items: ['Sam', 'Priya', 'Tom', 'Aoife', 'Ben', 'Maya'] },
  { symbol: '📚', items: ['Class 6A', 'Class 6B', 'Class 6C', 'Class 6D', 'Class 6E'] },
  { symbol: '⚽', items: ['Team Red', 'Team Blue', 'Team Green', 'Team Gold', 'Team Silver'] },
  { symbol: '🍪', items: ['Conor', 'Roisin', 'Jack', 'Emer', 'Cara'] },
];

const VENN_BANKS = [
  { aLabel: 'Maths', bLabel: 'Art' },
  { aLabel: 'Football', bLabel: 'Swimming' },
  { aLabel: 'Dogs', bLabel: 'Cats' },
  { aLabel: 'Reading', bLabel: 'Gaming' },
  { aLabel: 'Pizza', bLabel: 'Chips' },
];

const Y_STEPS = [2, 5, 10];

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

// Pads a numeric mcq option list up to `min` total options with plausible ±step-flavoured
// decoys (never garbage, never duplicates) — same "safety net" pattern as placevalue.js.
function padNumericOptions(options, correctVal, step, min) {
  const seen = new Set(options.map((o) => o.text));
  let k = 1;
  while (options.length < min && k < 50) {
    const candidates = [correctVal + step * k, correctVal - step * k];
    for (const v of candidates) {
      if (options.length >= min) break;
      if (!Number.isFinite(v) || v < 0) continue;
      const text = fmt(v);
      if (seen.has(text)) continue;
      seen.add(text);
      options.push({ text, misconception: 'padded-decoy' });
    }
    k += 1;
  }
  return options;
}

// -------- shared chart builders --------

// Builds a bar-chart dataset: n categories, distinct labels from one bank, values that are
// exact multiples of yStep (so every bar lands cleanly on a gridline, matching the lesson's
// "read the scale" exemplars) with distinct gridline counts (so tallest/shortest is unambiguous).
function buildBarSet(rng, n) {
  const bank = pick(rng, CHART_BANKS);
  const labels = shuffle(rng, bank.items).slice(0, n);
  const yStep = pick(rng, Y_STEPS);
  const ks = [];
  while (ks.length < n) {
    const k = rngInt(rng, 1, 8);
    if (!ks.includes(k)) ks.push(k);
  }
  const values = ks.map((k) => k * yStep);
  return { labels, values, ks, yStep, yLabel: bank.yLabel };
}

function buildLineSet(rng, n) {
  const bank = pick(rng, CHART_BANKS.filter((b) => b.items.length >= n));
  const xLabels = shuffle(rng, bank.items).slice(0, n);
  const yStep = pick(rng, Y_STEPS);
  const ks = [];
  while (ks.length < n) {
    const k = rngInt(rng, 1, 8);
    if (!ks.includes(k)) ks.push(k);
  }
  const points = ks.map((k) => k * yStep);
  return { xLabels, points, ks, yStep, yLabel: bank.yLabel };
}

// Pictogram rows: `withHalf` forces exactly one row to land on a half-symbol remainder
// (count = full*per + per/2); otherwise every row is a clean whole-symbol multiple of `per`.
function buildPictogramSet(rng, n, { withHalf }) {
  const bank = pick(rng, PICTOGRAM_BANKS);
  const labels = shuffle(rng, bank.items).slice(0, n);
  const per = withHalf ? pick(rng, [2, 4]) : pick(rng, [2, 3, 5]);
  const halfRowIdx = withHalf ? rngInt(rng, 0, n - 1) : -1;
  const rows = labels.map((label, i) => {
    const full = rngInt(rng, 1, 4);
    const count = i === halfRowIdx ? full * per + per / 2 : full * per;
    return [label, count];
  });
  return { rows, symbol: bank.symbol, per, halfRowIdx };
}

function buildVennSet(rng) {
  const bank = pick(rng, VENN_BANKS);
  const vals = new Set();
  while (vals.size < 4) vals.add(rngInt(rng, 2, 14));
  const [aOnly, both, bOnly, neither] = shuffle(rng, [...vals]);
  return { aLabel: bank.aLabel, bLabel: bank.bLabel, aOnly, both, bOnly, neither };
}

// -------- T1 templates --------

function t1ReadBar(rng) {
  const n = pick(rng, [4, 5]);
  const { labels, values, ks, yStep, yLabel } = buildBarSet(rng, n);
  const targetIdx = rngInt(rng, 0, n - 1);
  const targetLabel = labels[targetIdx];
  const correctVal = values[targetIdx];
  const stem = `Using the bar chart below, what value does <b>${targetLabel}</b> reach?`;

  const distractors = [];
  if (yStep > 1) distractors.push({ text: fmt(ks[targetIdx]), misconception: 'scale-misread' });
  values.forEach((v, i) => { if (i !== targetIdx) distractors.push({ text: fmt(v), misconception: 'wrong-bar' }); });
  distractors.push({ text: fmt(correctVal + yStep), misconception: 'off-by-one-step' });

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 3)];
  options = padNumericOptions(options, correctVal, yStep, 4);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'scale-misread') whyWrong[o.text] = `That's just the number of gridlines — you forgot to multiply by the scale (each one is worth ${yStep}).`;
    else if (o.misconception === 'wrong-bar') whyWrong[o.text] = `That's a different bar — check the label underneath again.`;
    else if (o.misconception === 'off-by-one-step' || o.misconception === 'padded-decoy') whyWrong[o.text] = `Check the scale again — each gridline is worth ${yStep}, so counting one gridline out puts you off by ${yStep}.`;
  }

  return {
    templateId: 'gc-t1-read-bar',
    stem,
    visual: { kind: 'barchart', labels, values, yStep, yLabel },
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the ${targetLabel} bar, then count how many GRIDLINES up it reaches.`,
      `Each gridline is worth ${yStep} (check the scale). Multiply the gridline count by ${yStep}.`,
    ],
    explain: {
      rule: RULE,
      worked: `The ${targetLabel} bar reaches ${ks[targetIdx]} gridlines up. Each gridline is worth ${yStep}, so ${ks[targetIdx]} × ${yStep} = ${fmt(correctVal)}.`,
      whyWrong,
    },
  };
}

function t1TallestShortest(rng) {
  const n = pick(rng, [4, 5]);
  const { labels, values, yStep, yLabel } = buildBarSet(rng, n);
  const wantMax = rng() < 0.5;
  const targetVal = wantMax ? Math.max(...values) : Math.min(...values);
  const correctIndexRaw = values.indexOf(targetVal);
  const stem = `Which of these has the <b>${wantMax ? 'MOST' : 'FEWEST'}</b> <b>${yLabel}</b>?`;

  const rawOptions = labels.map((label, i) => ({ text: label, misconception: i === correctIndexRaw ? null : 'wrong-bar' }));
  const shuffled = shuffle(rng, rawOptions.map((o, i) => ({ ...o, _i: i })));
  const correctIndex = shuffled.findIndex((o) => o.misconception === null);

  const whyWrong = {};
  shuffled.forEach((o) => {
    if (o.misconception === 'wrong-bar') whyWrong[o.text] = `${o.text} has ${values[o._i]} — check the bars again, that isn't the ${wantMax ? 'tallest' : 'shortest'} one.`;
  });

  return {
    templateId: 'gc-t1-tallest-shortest',
    stem,
    visual: { kind: 'barchart', labels, values, yStep, yLabel },
    options: shuffled.map((o) => ({ text: o.text, misconception: o.misconception })),
    correctIndex,
    hintSteps: [
      'Read every bar off the scale first — don’t just eyeball the heights.',
      `Now compare the real values: which one is ${wantMax ? 'the biggest' : 'the smallest'}?`,
    ],
    explain: {
      rule: RULE,
      worked: `Reading every bar off the scale: ${labels.map((l, i) => `${l}=${values[i]}`).join(', ')}. ${labels[correctIndexRaw]} is the ${wantMax ? 'most' : 'fewest'}.`,
      whyWrong,
    },
  };
}

function t1ReadLinePoint(rng) {
  const n = pick(rng, [4, 5]);
  const { xLabels, points, ks, yStep } = buildLineSet(rng, n);
  const targetIdx = rngInt(rng, 0, n - 1);
  const targetLabel = xLabels[targetIdx];
  const correctVal = points[targetIdx];
  const stem = `Using the line graph below, what was the value at <b>${targetLabel}</b>?`;

  const distractors = [];
  if (yStep > 1) distractors.push({ text: fmt(ks[targetIdx]), misconception: 'scale-misread' });
  points.forEach((v, i) => { if (i !== targetIdx) distractors.push({ text: fmt(v), misconception: 'wrong-bar' }); });
  distractors.push({ text: fmt(correctVal + yStep), misconception: 'off-by-one-step' });

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 3)];
  options = padNumericOptions(options, correctVal, yStep, 4);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'scale-misread') whyWrong[o.text] = `That's just the gridline count — multiply by ${yStep} (the scale) first.`;
    else if (o.misconception === 'wrong-bar') whyWrong[o.text] = `That's the value at a different point on the line — check the label underneath again.`;
    else if (o.misconception === 'off-by-one-step' || o.misconception === 'padded-decoy') whyWrong[o.text] = `That's one gridline out — each gridline is worth ${yStep}.`;
  }

  return {
    templateId: 'gc-t1-read-line',
    stem,
    visual: { kind: 'linegraph', points, xLabels, yStep },
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the dot above ${targetLabel}, then trace it back to the scale.`,
      `Count the gridlines to that dot and multiply by ${yStep} (the scale).`,
    ],
    explain: {
      rule: RULE,
      worked: `The dot at ${targetLabel} is ${ks[targetIdx]} gridlines up. ${ks[targetIdx]} × ${yStep} = ${fmt(correctVal)}.`,
      whyWrong,
    },
  };
}

function t1PictogramWhole(rng) {
  const n = pick(rng, [3, 4]);
  const { rows, symbol, per } = buildPictogramSet(rng, n, { withHalf: false });
  const targetIdx = rngInt(rng, 0, n - 1);
  const [targetLabel, correctVal] = rows[targetIdx];
  const stem = `Each ${symbol} = ${per}. How many did <b>${targetLabel}</b> have?`;

  const distractors = [];
  distractors.push({ text: fmt(correctVal / per), misconception: 'scale-misread' });
  rows.forEach(([, v], i) => { if (i !== targetIdx) distractors.push({ text: fmt(v), misconception: 'wrong-row' }); });
  distractors.push({ text: fmt(correctVal + per), misconception: 'off-by-one-symbol' });

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 3)];
  options = padNumericOptions(options, correctVal, per, 4);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'scale-misread') whyWrong[o.text] = `That's just the number of PICTURES, not what they're worth — each one is worth ${per}.`;
    else if (o.misconception === 'wrong-row') whyWrong[o.text] = `That's a different row — check the label on the left again.`;
    else if (o.misconception === 'off-by-one-symbol' || o.misconception === 'padded-decoy') whyWrong[o.text] = `That's one whole symbol out — each ${symbol} is worth ${per}.`;
  }

  return {
    templateId: 'gc-t1-pictogram-whole',
    stem,
    visual: { kind: 'pictogram', rows, symbol, per },
    options,
    correctIndex: 0,
    hintSteps: [
      `Count ${targetLabel}'s ${symbol} symbols.`,
      `Each ${symbol} is worth ${per}. Multiply the number of symbols by ${per}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${targetLabel} has ${correctVal / per} symbols, each worth ${per}. ${correctVal / per} × ${per} = ${fmt(correctVal)}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2DifferenceBars(rng) {
  const n = pick(rng, [4, 5]);
  const { labels, values, yStep, yLabel } = buildBarSet(rng, n);
  let iA = rngInt(rng, 0, n - 1);
  let iB = rngInt(rng, 0, n - 1);
  while (iB === iA) iB = rngInt(rng, 0, n - 1);
  if (values[iA] < values[iB]) [iA, iB] = [iB, iA];
  const labelA = labels[iA], labelB = labels[iB];
  const valA = values[iA], valB = values[iB];
  const correctVal = valA - valB;
  const stem = `Using the chart below, how many <b>MORE</b> were there for <b>${labelA}</b> than for <b>${labelB}</b>?`;

  const distractors = [
    { text: fmt(valA + valB), misconception: 'added-not-subtracted' },
    { text: fmt(valA), misconception: 'bare-value' },
    { text: fmt(valB), misconception: 'bare-value' },
  ];
  if (yStep > 1) distractors.push({ text: fmt(correctVal / yStep), misconception: 'scale-misread' });

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 4)];
  options = padNumericOptions(options, correctVal, yStep, 5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'added-not-subtracted') whyWrong[o.text] = `That's ${labelA} + ${labelB} added together — "how many MORE" means subtract, not add.`;
    else if (o.misconception === 'bare-value') whyWrong[o.text] = `That's just one bar's total on its own — the question wants the DIFFERENCE between the two.`;
    else if (o.misconception === 'scale-misread' || o.misconception === 'padded-decoy') whyWrong[o.text] = `That's the difference in GRIDLINES, not in the real values — convert to the real values first (each gridline is worth ${yStep}).`;
  }

  return {
    templateId: 'gc-t2-difference-bars',
    stem,
    visual: { kind: 'barchart', labels, values, yStep, yLabel },
    options,
    correctIndex: 0,
    hintSteps: [
      `Read both bars off the real scale first: ${labelA} = ?, ${labelB} = ?`,
      `${labelA} is ${valA} and ${labelB} is ${valB}. Now subtract: ${valA} − ${valB} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${labelA} = ${valA}, ${labelB} = ${valB}. ${valA} − ${valB} = ${fmt(correctVal)}.`,
      whyWrong,
    },
  };
}

function t2PictogramHalf(rng) {
  const n = pick(rng, [3, 4]);
  const { rows, symbol, per, halfRowIdx } = buildPictogramSet(rng, n, { withHalf: true });
  const targetIdx = halfRowIdx;
  const [targetLabel, correctVal] = rows[targetIdx];
  const full = Math.floor(correctVal / per);
  const half = per / 2;
  const stem = `Each ${symbol} = ${per}. How many did <b>${targetLabel}</b> have?`;

  const distractors = [
    { text: fmt(full * per), misconception: 'ignored-half' },
    { text: fmt((full + 1) * per), misconception: 'half-as-full' },
    { text: fmt(full + 1), misconception: 'counted-symbols-not-value' },
  ];
  rows.forEach(([, v], i) => { if (i !== targetIdx) distractors.push({ text: fmt(v), misconception: 'wrong-row' }); });

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 4)];
  options = padNumericOptions(options, correctVal, half, 5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'ignored-half') whyWrong[o.text] = `That's just the WHOLE symbols — you forgot the half symbol is still worth something (half of ${per} is ${half}).`;
    else if (o.misconception === 'half-as-full') whyWrong[o.text] = `That treats the half symbol as if it were a WHOLE one — a half symbol is only worth half the value.`;
    else if (o.misconception === 'counted-symbols-not-value') whyWrong[o.text] = `That's the number of PICTURES, not the number of things — each picture is worth ${per}, not 1.`;
    else if (o.misconception === 'wrong-row') whyWrong[o.text] = `That's a different row — check the label on the left.`;
    else if (o.misconception === 'padded-decoy') whyWrong[o.text] = `Check the half symbol again — it's worth half of ${per}, which is ${half}.`;
  }

  return {
    templateId: 'gc-t2-pictogram-half',
    stem,
    visual: { kind: 'pictogram', rows, symbol, per },
    options,
    correctIndex: 0,
    hintSteps: [
      `Count ${targetLabel}'s WHOLE ${symbol} symbols first: ${full} whole symbols, each worth ${per}.`,
      `Now add the half symbol: half of ${per} is ${half}. ${full * per} + ${half} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${targetLabel} has ${full} whole ${symbol} (${full} × ${per} = ${full * per}) plus a half ${symbol} (half of ${per} = ${half}). ${full * per} + ${half} = ${fmt(correctVal)}.`,
      whyWrong,
    },
  };
}

function t2VennRegionCount(rng) {
  const { aLabel, bLabel, aOnly, both, bOnly, neither } = buildVennSet(rng);
  const askType = pick(rng, ['onlyA', 'onlyB', 'both', 'neither']);
  const regionDesc = askType === 'onlyA' ? `only ${aLabel}`
    : askType === 'onlyB' ? `only ${bLabel}`
    : askType === 'both' ? `in BOTH ${aLabel} and ${bLabel}`
    : 'in NEITHER';
  const correctVal = { onlyA: aOnly, onlyB: bOnly, both, neither }[askType];
  const stem = `Looking at the Venn diagram, how many are <b>${regionDesc}</b>?`;

  const total = aOnly + both + bOnly + neither;
  const otherVals = { onlyA: [both, bOnly, neither], onlyB: [aOnly, both, neither], both: [aOnly, bOnly, neither], neither: [aOnly, both, bOnly] }[askType];
  const distractors = otherVals.map((v) => ({ text: fmt(v), misconception: 'wrong-region' }));
  distractors.push({ text: fmt(total), misconception: 'whole-group' });

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 4)];
  options = padNumericOptions(options, correctVal, 1, 5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-region') whyWrong[o.text] = `That's a different region of the diagram — check which circle(s) the question means.`;
    else if (o.misconception === 'whole-group') whyWrong[o.text] = `That's the WHOLE group added together, not just one region.`;
    else if (o.misconception === 'padded-decoy') whyWrong[o.text] = `Check the diagram again — that's not the region the question asked about.`;
  }

  return {
    templateId: 'gc-t2-venn-region',
    stem,
    visual: { kind: 'venn', aLabel, bLabel, aOnly, both, bOnly, neither },
    options,
    correctIndex: 0,
    hintSteps: [
      'Find the right region in the diagram: only one circle, both circles overlapping, or outside both circles entirely.',
      `The region "${regionDesc}" holds a single number — read it straight off the diagram.`,
    ],
    explain: {
      rule: RULE,
      worked: `The region "${regionDesc}" shows ${fmt(correctVal)}.`,
      whyWrong,
    },
  };
}

function t2LineRiseOrFall(rng) {
  const n = pick(rng, [4, 5]);
  const { xLabels, points, yStep } = buildLineSet(rng, n);
  let iA = rngInt(rng, 0, n - 2);
  let iB = iA + 1;
  // ensure a genuine rise or fall (not a tie) — resample the whole set once if tied
  let tries = 0;
  let set = { xLabels, points };
  while (set.points[iA] === set.points[iB] && tries < 20) {
    set = buildLineSet(rng, n);
    tries += 1;
  }
  const xA = set.xLabels[iA], xB = set.xLabels[iB];
  const vA = set.points[iA], vB = set.points[iB];
  const isRise = vB > vA;
  const correctVal = Math.abs(vB - vA);
  const stem = `Using the line graph below, how much did it <b>${isRise ? 'RISE' : 'FALL'}</b> from <b>${xA}</b> to <b>${xB}</b>?`;

  const distractors = [
    { text: fmt(vA + vB), misconception: 'added-not-subtracted' },
    { text: fmt(vA), misconception: 'bare-value' },
    { text: fmt(vB), misconception: 'bare-value' },
  ];
  if (yStep > 1) distractors.push({ text: fmt(correctVal / yStep), misconception: 'scale-misread' });

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 4)];
  options = padNumericOptions(options, correctVal, yStep, 5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'added-not-subtracted') whyWrong[o.text] = `That's the two values ADDED together — a rise or fall is a DIFFERENCE, so subtract instead.`;
    else if (o.misconception === 'bare-value') whyWrong[o.text] = `That's just one point's value on its own — the question wants the CHANGE between the two points.`;
    else if (o.misconception === 'scale-misread' || o.misconception === 'padded-decoy') whyWrong[o.text] = `That's the difference in GRIDLINES, not the real values — multiply by the scale (${yStep}) first.`;
  }

  return {
    templateId: 'gc-t2-line-rise-fall',
    stem,
    visual: { kind: 'linegraph', points: set.points, xLabels: set.xLabels, yStep },
    options,
    correctIndex: 0,
    hintSteps: [
      `Read both points off the real scale first: ${xA} = ?, ${xB} = ?`,
      `${xA} is ${vA} and ${xB} is ${vB}. Find the difference between them.`,
    ],
    explain: {
      rule: RULE,
      worked: `${xA} = ${vA}, ${xB} = ${vB}. The ${isRise ? 'rise' : 'fall'} is ${fmt(correctVal)}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format, never a negative answer) --------

function t3TotalAllBars(rng) {
  const n = pick(rng, [4, 5]);
  const { labels, values, yStep, yLabel } = buildBarSet(rng, n);
  const total = values.reduce((a, b) => a + b, 0);
  const stem = 'Using the bar chart below, what is the <b>TOTAL</b> across all the bars?';

  return {
    templateId: 'gc-t3-total-bars',
    stem,
    format: 'num',
    visual: { kind: 'barchart', labels, values, yStep, yLabel },
    accept: [String(total), fmt(total)],
    hintSteps: [
      'Read every bar off the scale first, one at a time.',
      `Then add them all together: ${values.join(' + ')} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${values.join(' + ')} = ${fmt(total)}.`,
      whyWrong: {},
    },
  };
}

function t3TwoStepMoreThanSum(rng) {
  const bank = pick(rng, CHART_BANKS);
  const yStep = pick(rng, Y_STEPS);
  const shuffledItems = shuffle(rng, bank.items);
  const [labelA, labelB, labelC, ...restLabels] = shuffledItems.slice(0, 4);
  const kB = rngInt(rng, 1, 4);
  const kC = rngInt(rng, 1, 4);
  const kA = kB + kC + rngInt(rng, 1, 4); // guarantees A > B + C, so the answer is never negative
  const valA = kA * yStep, valB = kB * yStep, valC = kC * yStep;
  const extraLabel = restLabels[0];
  const extraVal = rngInt(rng, 1, 8) * yStep;
  const labels = [labelA, labelB, labelC, extraLabel];
  const values = [valA, valB, valC, extraVal];
  const correctVal = valA - (valB + valC);
  const stem = `Using the chart below, how many <b>MORE</b> were there for <b>${labelA}</b> than <b>${labelB}</b> and <b>${labelC}</b> together?`;

  return {
    templateId: 'gc-t3-two-step-more-than-sum',
    stem,
    format: 'num',
    visual: { kind: 'barchart', labels, values, yStep, yLabel: bank.yLabel },
    accept: [String(correctVal), fmt(correctVal)],
    hintSteps: [
      `Read all three bars off the scale first: ${labelA} = ?, ${labelB} = ?, ${labelC} = ?`,
      `Add ${labelB} and ${labelC} together, THEN subtract that from ${labelA}: ${valA} − (${valB} + ${valC}) = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${labelA} = ${valA}. ${labelB} + ${labelC} = ${valB} + ${valC} = ${valB + valC}. ${valA} − ${valB + valC} = ${fmt(correctVal)}.`,
      whyWrong: {},
    },
  };
}

function t3VennANotB(rng) {
  const { aLabel, bLabel, aOnly, both, bOnly, neither } = buildVennSet(rng);
  const stem = `How many are in <b>${aLabel}</b> but <b>NOT</b> in <b>${bLabel}</b>?`;

  return {
    templateId: 'gc-t3-venn-a-not-b',
    stem,
    format: 'num',
    visual: { kind: 'venn', aLabel, bLabel, aOnly, both, bOnly, neither },
    accept: [String(aOnly), fmt(aOnly)],
    hintSteps: [
      `"In ${aLabel} but NOT ${bLabel}" means the ${aLabel} circle WITHOUT the overlapping middle.`,
      `That's the "only ${aLabel}" region — read it straight off the diagram.`,
    ],
    explain: {
      rule: RULE,
      worked: `"${aLabel} but not ${bLabel}" is the only-${aLabel} region, which shows ${fmt(aOnly)}. The overlap (${both}) belongs to BOTH, so it's never counted here.`,
      whyWrong: {},
    },
  };
}

function t3PictogramTotal(rng) {
  const n = pick(rng, [3, 4]);
  const withHalf = rng() < 0.5;
  const { rows, symbol, per } = buildPictogramSet(rng, n, { withHalf });
  const total = rows.reduce((a, [, v]) => a + v, 0);
  const stem = `Each ${symbol} = ${per}. What is the <b>TOTAL</b> across ALL the rows?`;

  return {
    templateId: 'gc-t3-pictogram-total',
    stem,
    format: 'num',
    visual: { kind: 'pictogram', rows, symbol, per },
    accept: [String(total), fmt(total)],
    hintSteps: [
      `Work out each row's real value first — remember each ${symbol} is worth ${per} (and a half symbol is worth half that).`,
      `Add every row's value together: ${rows.map(([, v]) => v).join(' + ')} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${rows.map(([label, v]) => `${label}=${v}`).join(', ')}. Total: ${rows.map(([, v]) => v).join(' + ')} = ${fmt(total)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ReadBar, t1TallestShortest, t1ReadLinePoint, t1PictogramWhole];
const T2 = [t2DifferenceBars, t2PictogramHalf, t2VennRegionCount, t2LineRiseOrFall];
const T3 = [t3TotalAllBars, t3TwoStepMoreThanSum, t3VennANotB, t3PictogramTotal];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `gc-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'graphs-charts',
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
