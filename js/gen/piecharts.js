// FART QUEST — GEN agent
// Topic: pie-charts (The Pie Bakery). generate(tier, rng) -> Question.
// visual spec convention (ENGINE_SPEC_2 §C `pie{sectors:[{label,value}]}`, plain data — never
// import diagrams.js from here; the battle/lesson engine turns this spec into SVG at render time).
import { rngInt, pick, shuffle } from '../rng.js';

// Weapon rule, used VERBATIM as explain.rule for every generated question (matches the
// "explain.rule must be used verbatim so it matches the lesson" convention established by
// placevalue.js/coordinates.js — one canonical rule constant, shared by every template/tier).
const RULE = 'The whole pie = everything. Half the pie = half of everything.';

// Single fmt() for all numeric text in this generator.
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// Themed category pools — each has >=4 items so T1 templates always have a genuine 4-sector pie.
const THEMES = [
  { noun: 'pet', items: ['Dog', 'Cat', 'Fish', 'Rabbit', 'Hamster'] },
  { noun: 'sport', items: ['Football', 'Swimming', 'Athletics', 'Rugby', 'Netball'] },
  { noun: 'snack', items: ['Crisps', 'Chocolate', 'Fruit', 'Biscuits', 'Popcorn'] },
  { noun: 'colour', items: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'] },
  { noun: 'school subject', items: ['Maths', 'English', 'Art', 'PE', 'Science'] },
  { noun: 'holiday destination', items: ['Spain', 'France', 'Italy', 'Portugal', 'Greece'] },
  { noun: 'film genre', items: ['Comedy', 'Action', 'Horror', 'Animation'] },
  { noun: 'ice-cream flavour', items: ['Vanilla', 'Chocolate', 'Strawberry', 'Mint'] },
  { noun: 'eco-activity', items: ['Recycling', 'Litter-picking', 'Composting', 'Cycling'] },
];

function pickTheme(rng) {
  const theme = pick(rng, THEMES);
  const items = shuffle(rng, theme.items).slice(0, 4);
  return { noun: theme.noun, items };
}

// Build `count` distinct positive integers in [min, max] (best-effort; falls back to nudging
// on collision so a fresh distinct value is still returned rather than looping forever).
function makeDistinctValues(rng, count, min, max) {
  let vals = [];
  let tries = 0;
  do {
    vals = [];
    const used = new Set();
    for (let i = 0; i < count; i++) {
      let v = rngInt(rng, min, max);
      let t2 = 0;
      while (used.has(v) && t2 < 40) { v = rngInt(rng, min, max); t2++; }
      if (used.has(v)) v = max + used.size + 1; // guaranteed-fresh fallback, stays positive
      used.add(v);
      vals.push(v);
    }
    tries++;
  } while (new Set(vals).size !== count && tries < 30);
  return vals;
}

// Dedupe a candidate options list against a correct option's text (and against itself),
// then pad with numeric near-misses (correct ± k) tagged 'padded-near-miss' if collisions left
// us short of `min` total options. Shared by every mcq template below so every one behaves the
// same way when the small themed number pools happen to collide.
function assembleMcqOptions(correct, distractorCandidates, min) {
  const seen = new Set([correct.text]);
  const options = [correct];
  for (const d of distractorCandidates) {
    if (seen.has(d.text)) continue;
    seen.add(d.text);
    options.push(d);
  }
  const correctNum = Number(String(correct.text).replace(/,/g, ''));
  let pad = 1;
  while (options.length < min && Number.isFinite(correctNum) && pad < 100) {
    const candUp = fmt(correctNum + pad);
    const candDown = fmt(correctNum - pad);
    if (!seen.has(candUp)) { seen.add(candUp); options.push({ text: candUp, misconception: 'padded-near-miss' }); }
    if (options.length < min && correctNum - pad >= 0 && !seen.has(candDown)) { seen.add(candDown); options.push({ text: candDown, misconception: 'padded-near-miss' }); }
    pad += 1;
  }
  return options;
}

// -------- T1 templates (read the pie — no arithmetic, just compare slice sizes) --------

function t1MostPopular(rng) {
  const { noun, items } = pickTheme(rng);
  const values = makeDistinctValues(rng, 4, 2, 20);
  const total = values.reduce((a, b) => a + b, 0);
  const sortedDesc = [...values].sort((a, b) => b - a);
  const rankOf = (v) => sortedDesc.indexOf(v);

  const options = items.map((label, i) => {
    const rank = rankOf(values[i]);
    let misconception;
    if (rank === 0) misconception = null;
    else if (rank === 1) misconception = 'second-biggest';
    else if (rank === 2) misconception = 'middle-slice';
    else misconception = 'picked-smallest';
    return { text: label, misconception };
  });
  const correctIndex = options.findIndex((o) => o.misconception === null);
  const correctLabel = options[correctIndex].text;

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'second-biggest') whyWrong[o.text] = `${o.text}’s slice is the second-biggest — bigger than some, but smaller than ${correctLabel}’s.`;
    else if (o.misconception === 'middle-slice') whyWrong[o.text] = `${o.text} has a middling slice, not the biggest — check again which slice takes up the most of the circle.`;
    else if (o.misconception === 'picked-smallest') whyWrong[o.text] = `${o.text} has the SMALLEST slice of all — that’s the LEAST popular, the opposite of what the question asks.`;
  });

  return {
    templateId: 'pie-t1-most-popular',
    stem: `${fmt(total)} pupils were asked their favourite ${noun}. Which was the <b>MOST</b> popular?`,
    visual: { kind: 'pie', sectors: items.map((label, i) => ({ label, value: values[i] })) },
    options,
    correctIndex,
    hintSteps: [
      'You don’t need to add anything up for this one — just LOOK at the pie. Which slice takes up the most room?',
      `The biggest slice belongs to ${correctLabel}. Biggest slice = most popular answer.`,
    ],
    explain: {
      rule: RULE,
      worked: `${correctLabel}’s slice is the biggest one on the pie — bigger slice always means more pupils chose it. ${correctLabel} is the most popular ${noun}.`,
      whyWrong,
    },
  };
}

function t1LeastPopular(rng) {
  const { noun, items } = pickTheme(rng);
  const values = makeDistinctValues(rng, 4, 2, 20);
  const total = values.reduce((a, b) => a + b, 0);
  const sortedAsc = [...values].sort((a, b) => a - b);
  const rankOf = (v) => sortedAsc.indexOf(v); // 0 = smallest

  const options = items.map((label, i) => {
    const rank = rankOf(values[i]);
    let misconception;
    if (rank === 0) misconception = null;
    else if (rank === 1) misconception = 'second-smallest';
    else if (rank === 2) misconception = 'middle-slice';
    else misconception = 'picked-biggest';
    return { text: label, misconception };
  });
  const correctIndex = options.findIndex((o) => o.misconception === null);
  const correctLabel = options[correctIndex].text;

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'second-smallest') whyWrong[o.text] = `${o.text}’s slice is the second-smallest — smaller than most, but bigger than ${correctLabel}’s.`;
    else if (o.misconception === 'middle-slice') whyWrong[o.text] = `${o.text} has a middling slice, not the smallest — check again which slice takes up the LEAST of the circle.`;
    else if (o.misconception === 'picked-biggest') whyWrong[o.text] = `${o.text} has the BIGGEST slice of all — that’s the MOST popular, the opposite of what the question asks.`;
  });

  return {
    templateId: 'pie-t1-least-popular',
    stem: `${fmt(total)} pupils were asked their favourite ${noun}. Which was the <b>LEAST</b> popular?`,
    visual: { kind: 'pie', sectors: items.map((label, i) => ({ label, value: values[i] })) },
    options,
    correctIndex,
    hintSteps: [
      'Just LOOK at the pie — which slice takes up the LEAST room?',
      `The smallest slice belongs to ${correctLabel}. Smallest slice = least popular answer.`,
    ],
    explain: {
      rule: RULE,
      worked: `${correctLabel}’s slice is the smallest one on the pie — smaller slice always means fewer pupils chose it. ${correctLabel} is the least popular ${noun}.`,
      whyWrong,
    },
  };
}

function t1CompareTwo(rng) {
  const { noun, items } = pickTheme(rng);
  const values = makeDistinctValues(rng, 4, 2, 20);
  const total = values.reduce((a, b) => a + b, 0);
  const idxPool = shuffle(rng, [0, 1, 2, 3]).slice(0, 2);
  const [i, j] = idxPool;
  const iBigger = values[i] > values[j];

  const options = [
    { text: items[i], misconception: iBigger ? null : 'picked-other' },
    { text: items[j], misconception: iBigger ? 'picked-other' : null },
    { text: 'They were equally popular', misconception: 'assumed-equal' },
    { text: 'Can’t tell from the pie chart', misconception: 'ignored-visual' },
  ];
  const correctIndex = options.findIndex((o) => o.misconception === null);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'picked-other') whyWrong[o.text] = `${items[i]} got ${fmt(values[i])} and ${items[j]} got ${fmt(values[j])} — check which slice is really bigger on the pie.`;
    else if (o.misconception === 'assumed-equal') whyWrong[o.text] = `Their slices aren’t the same size — ${items[i]} got ${fmt(values[i])} and ${items[j]} got ${fmt(values[j])}.`;
    else if (o.misconception === 'ignored-visual') whyWrong[o.text] = 'You CAN tell — the pie chart shows every slice’s size right there, just compare them.';
  });

  return {
    templateId: 'pie-t1-compare-two',
    stem: `${fmt(total)} pupils were asked their favourite ${noun}. Which was chosen by <b>MORE</b> pupils — ${items[i]} or ${items[j]}?`,
    visual: { kind: 'pie', sectors: items.map((label, i2) => ({ label, value: values[i2] })) },
    options,
    correctIndex,
    hintSteps: [
      `Find ${items[i]}’s slice and ${items[j]}’s slice on the pie.`,
      'Whichever slice takes up more of the circle was chosen by more pupils.',
    ],
    explain: {
      rule: RULE,
      worked: `${items[i]}’s slice is ${iBigger ? 'bigger' : 'smaller'} than ${items[j]}’s — ${fmt(values[i])} vs ${fmt(values[j])}. ${options[correctIndex].text} was chosen by more pupils.`,
      whyWrong,
    },
  };
}

// -------- T2 templates (fraction/subtraction reasoning over the whole pie) --------

const FRACTIONS = [
  { word: 'HALF', denom: 2 },
  { word: 'A QUARTER', denom: 4 },
  { word: 'A FIFTH', denom: 5 },
  { word: 'A TENTH', denom: 10 },
  { word: 'A THIRD', denom: 3 },
];
const CONFUSE_DENOM = { 2: 4, 4: 2, 5: 10, 10: 5, 3: 6 };
const FRAC_WORD_BY_DENOM = { 2: 'HALF', 4: 'A QUARTER', 5: 'A FIFTH', 10: 'A TENTH', 3: 'A THIRD', 6: 'A SIXTH' };
// Multiples of 60 — 60 is divisible by every denominator/confuse-denominator used above
// (2,3,4,5,6,10), so any fraction combination below always yields whole-number counts.
const NICE_N_POOL = [60, 120, 180, 240, 300, 360];

function t2FractionCount(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const frac = pick(rng, FRACTIONS);
  const N = pick(rng, NICE_N_POOL);
  const correctVal = N / frac.denom;
  const wrongFracVal = N / CONFUSE_DENOM[frac.denom];
  const otherFracWord = FRAC_WORD_BY_DENOM[CONFUSE_DENOM[frac.denom]];
  const rest = N - correctVal;
  const multiplied = N * frac.denom;

  const distractorRaw = [
    { text: fmt(wrongFracVal), misconception: 'wrong-fraction-value' },
    { text: fmt(frac.denom), misconception: 'fraction-as-count' },
    { text: fmt(rest), misconception: 'found-the-rest' },
    { text: fmt(multiplied), misconception: 'multiplied-not-divided' },
  ];
  const correct = { text: fmt(correctVal), misconception: null };
  const options = assembleMcqOptions(correct, distractorRaw, 5);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'wrong-fraction-value') whyWrong[o.text] = `That’s ${otherFracWord.toLowerCase()} of ${fmt(N)}, not ${frac.word.toLowerCase()} — check which fraction the question actually asked for.`;
    else if (o.misconception === 'fraction-as-count') whyWrong[o.text] = `That treats “${frac.word.toLowerCase()}” as if it were literally the number ${fmt(frac.denom)} — a fraction of the total means you must DIVIDE by that number, not just write it down.`;
    else if (o.misconception === 'found-the-rest') whyWrong[o.text] = `That’s the pupils who did NOT choose ${X} (${fmt(N)} − ${fmt(correctVal)} = ${fmt(rest)}) — the question asks how many DID choose it.`;
    else if (o.misconception === 'multiplied-not-divided') whyWrong[o.text] = `That multiplies instead of dividing — ${frac.word.toLowerCase()} of a pie is SMALLER than the whole, so the answer must be smaller than ${fmt(N)}, not bigger.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Check the arithmetic again — divide ${fmt(N)} by the right number for ${frac.word.toLowerCase()}.`;
  });

  return {
    templateId: 'pie-t2-fraction-count',
    stem: `${fmt(N)} pupils were asked their favourite ${noun}. <b>${frac.word}</b> of the pie chose ${X}. How many pupils chose ${X}?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `${frac.word} of the pie means ${frac.word.toLowerCase()} of the WHOLE ${fmt(N)} pupils. Divide ${fmt(N)} by ${fmt(frac.denom)}.`,
      `${fmt(N)} ÷ ${fmt(frac.denom)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${frac.word} of the pie = ${frac.word.toLowerCase()} of ${fmt(N)}. ${fmt(N)} ÷ ${fmt(frac.denom)} = ${fmt(correctVal)} pupils chose ${X}.`,
      whyWrong,
    },
  };
}

function t2RemainingCount(rng) {
  const { noun, items } = pickTheme(rng);
  const bigFracs = FRACTIONS.filter((f) => f.denom <= 4); // half, quarter, third
  let N, fracA, fracB, countA, countB, remaining, c3, c4;
  let tries = 0;
  do {
    N = pick(rng, NICE_N_POOL.slice(1)); // 120..360, keeps remaining roomy
    fracA = pick(rng, bigFracs);
    fracB = pick(rng, FRACTIONS.filter((f) => f.denom !== fracA.denom));
    countA = N / fracA.denom;
    countB = N / fracB.denom;
    remaining = N - countA - countB;
    tries++;
  } while (remaining < 4 && tries < 40);
  if (remaining < 4) { N = 360; fracA = { word: 'HALF', denom: 2 }; fracB = { word: 'A TENTH', denom: 10 }; countA = 180; countB = 36; remaining = 144; }
  c3 = rngInt(rng, 1, remaining - 1);
  c4 = remaining - c3;

  const distractorRaw = [
    { text: fmt(remaining), misconception: 'forgot-last-slice' },
    { text: fmt(c3), misconception: 'wrong-slice' },
    { text: fmt(N - countA), misconception: 'missed-fraction-slice' },
    { text: fmt(N - c4), misconception: 'answered-the-rest-instead' },
  ];
  const correct = { text: fmt(c4), misconception: null };
  const options = assembleMcqOptions(correct, distractorRaw, 5);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'forgot-last-slice') whyWrong[o.text] = `That’s everyone left over BEFORE taking away ${items[2]}’s ${fmt(c3)} pupils — you still need to subtract that slice too.`;
    else if (o.misconception === 'wrong-slice') whyWrong[o.text] = `That’s how many chose ${items[2]}, not ${items[3]} — check which slice the question is asking about.`;
    else if (o.misconception === 'missed-fraction-slice') whyWrong[o.text] = `That only subtracts ${fracA.word.toLowerCase()}’s slice — you also need to take away ${fracB.word.toLowerCase()}’s slice and ${items[2]}’s ${fmt(c3)} pupils.`;
    else if (o.misconception === 'answered-the-rest-instead') whyWrong[o.text] = `That’s everyone who did NOT choose ${items[3]} — the question asks how many DID.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Check the subtraction again — the whole pie is ${fmt(N)} pupils.`;
  });

  return {
    templateId: 'pie-t2-remaining-count',
    stem: `${fmt(N)} pupils were asked their favourite ${noun}. <b>${fracA.word}</b> chose ${items[0]}, <b>${fracB.word}</b> chose ${items[1]}, and <b>${fmt(c3)}</b> chose ${items[2]}. How many chose ${items[3]}?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `The WHOLE pie is all ${fmt(N)} pupils. Work out how many chose each of the other three, then subtract them all from the total.`,
      `${fmt(N)} − ${fmt(countA)} − ${fmt(countB)} − ${fmt(c3)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fracA.word} of ${fmt(N)} = ${fmt(countA)}. ${fracB.word} of ${fmt(N)} = ${fmt(countB)}. ${fmt(N)} − ${fmt(countA)} − ${fmt(countB)} − ${fmt(c3)} = ${fmt(c4)} chose ${items[3]}.`,
      whyWrong,
    },
  };
}

// Percent pool for T2 — each entry's `denom` gives the matching CONFUSE_PERCENT partner below.
const PERCENTS = [
  { pct: 50, denom: 2 },
  { pct: 25, denom: 4 },
  { pct: 20, denom: 5 },
  { pct: 10, denom: 10 },
];
const CONFUSE_PERCENT = { 50: 25, 25: 50, 20: 10, 10: 20 };

function t2PercentCount(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const p = pick(rng, PERCENTS);
  const N = pick(rng, NICE_N_POOL);
  const correctVal = (N * p.pct) / 100;
  const confusePct = CONFUSE_PERCENT[p.pct];
  const wrongPctVal = (N * confusePct) / 100;
  const rest = N - correctVal;
  const forgotDivide = N * p.pct;

  const distractorRaw = [
    { text: fmt(wrongPctVal), misconception: 'wrong-percent-value' },
    { text: fmt(p.pct), misconception: 'percent-as-count' },
    { text: fmt(rest), misconception: 'found-the-rest' },
    { text: fmt(forgotDivide), misconception: 'forgot-divide-100' },
  ];
  const correct = { text: fmt(correctVal), misconception: null };
  const options = assembleMcqOptions(correct, distractorRaw, 5);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'wrong-percent-value') whyWrong[o.text] = `That’s ${confusePct}% of ${fmt(N)}, not ${p.pct}% — check which percentage the question actually asked for.`;
    else if (o.misconception === 'percent-as-count') whyWrong[o.text] = `That treats “${p.pct}%” as if it were literally the number ${p.pct} — a percentage of the total means you must find ${p.pct}% of ${fmt(N)}, not just write down the percentage.`;
    else if (o.misconception === 'found-the-rest') whyWrong[o.text] = `That’s the pupils who did NOT choose ${X} (${fmt(N)} − ${fmt(correctVal)} = ${fmt(rest)}) — the question asks how many DID choose it.`;
    else if (o.misconception === 'forgot-divide-100') whyWrong[o.text] = `That multiplies ${fmt(N)} by ${p.pct} without dividing by 100 first — turn the percentage into a decimal (÷100) before you multiply.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Check the arithmetic again — turn ${p.pct}% into a decimal, then multiply by ${fmt(N)}.`;
  });

  return {
    templateId: 'pie-t2-percent-count',
    stem: `${fmt(N)} pupils were asked their favourite ${noun}. <b>${X}</b> is shown as <b>${p.pct}%</b> of the pie chart. How many pupils chose ${X}?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `Turn ${p.pct}% into a decimal: ${p.pct} ÷ 100 = ${p.pct / 100}.`,
      `Now multiply that decimal by the total: ${p.pct / 100} × ${fmt(N)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${p.pct} ÷ 100 = ${p.pct / 100}. ${p.pct / 100} × ${fmt(N)} = ${fmt(correctVal)} pupils chose ${X}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format — percentage <-> count <-> total, never negative) --------

// Percentages whose fraction reduces to a denominator that divides 20 exactly, paired with
// totals that are all multiples of 20 — so every percent*total/100 below is a whole number,
// no rounding ever needed anywhere in this generator's percentage arithmetic.
const PCT_LIST = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
const NICE_TOTALS_PCT = [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 380, 400];

function t3CountFromPercent(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const total = pick(rng, NICE_TOTALS_PCT);
  const pct = pick(rng, PCT_LIST);
  const count = (total * pct) / 100;

  return {
    templateId: 'pie-t3-count-from-percent',
    stem: `${fmt(total)} pupils were asked their favourite ${noun}. ${X} is shown as <b>${pct}%</b> of the pie chart. How many pupils chose ${X}?`,
    format: 'num',
    accept: [String(count)],
    hintSteps: [
      `Turn ${pct}% into a decimal: ${pct} ÷ 100 = ${pct / 100}.`,
      `Now multiply that decimal by the total: ${pct / 100} × ${fmt(total)}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${pct} ÷ 100 = ${pct / 100}. ${pct / 100} × ${fmt(total)} = ${fmt(count)}.`,
      whyWrong: {},
    },
  };
}

function t3PercentFromCount(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const total = pick(rng, NICE_TOTALS_PCT);
  const pct = pick(rng, PCT_LIST);
  const count = (total * pct) / 100;

  return {
    templateId: 'pie-t3-percent-from-count',
    stem: `${fmt(total)} pupils were asked their favourite ${noun}. <b>${fmt(count)}</b> of them chose ${X}. What percentage of the pie chart is ${X}?`,
    format: 'num',
    unit: '%',
    accept: [String(pct)],
    hintSteps: [
      `Divide the ${X} count by the total: ${fmt(count)} ÷ ${fmt(total)}.`,
      'Now multiply that answer by 100 to turn it into a percentage.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(count)} ÷ ${fmt(total)} × 100 = ${pct}%.`,
      whyWrong: {},
    },
  };
}

function t3TotalFromCountPercent(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const total = pick(rng, NICE_TOTALS_PCT);
  const pct = pick(rng, PCT_LIST);
  const count = (total * pct) / 100;

  return {
    templateId: 'pie-t3-total-from-count-percent',
    stem: `${fmt(count)} pupils chose ${X} as their favourite ${noun}, and ${X} is shown as <b>${pct}%</b> of the pie chart. How many pupils were asked in total?`,
    format: 'num',
    accept: [String(total)],
    hintSteps: [
      `${pct}% tells you what FRACTION of the whole pie this slice is: ${pct} ÷ 100.`,
      `Divide the count by that fraction — ${fmt(count)} ÷ (${pct} ÷ 100) — to find the total.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(count)} ÷ (${pct} ÷ 100) = ${fmt(total)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1MostPopular, t1LeastPopular, t1CompareTwo];
const T2 = [t2FractionCount, t2RemainingCount, t2PercentCount];
const T3 = [t3CountFromPercent, t3PercentFromCount, t3TotalFromCountPercent];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `pie-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'pie-charts',
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
