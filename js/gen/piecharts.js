// FART QUEST — GEN agent
// Topic: pie-charts (The Pie Bakery). generate(tier, rng) -> Question.
// visual spec convention (ENGINE_SPEC_2 §C `pie{sectors:[{label,value}]}`, plain data — never
// import diagrams.js from here; the battle/lesson engine turns this spec into SVG at render time).
import { rngInt, pick, shuffle } from '../rng.js';

// Weapon rule, used VERBATIM as explain.rule for every generated question (matches the
// "explain.rule must be used verbatim so it matches the lesson" convention established by
// placevalue.js/coordinates.js — one canonical rule constant, shared by every template/tier).
const RULE = 'The whole pie = everything = 360°. Half the pie = half of everything.';

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

function t2ComparePies(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const BIG_TOTALS = [40, 60, 80, 100, 120, 140, 160, 180, 200];
  const BIG_DENOMS = [5, 10];
  const SMALL_TOTALS = [8, 12, 16, 20, 24];
  const SMALL_DENOMS = [2, 4];

  let bigTotal, bigDenom, smallTotal, smallDenom, countBig, countSmall;
  let tries = 0;
  do {
    bigTotal = pick(rng, BIG_TOTALS);
    bigDenom = pick(rng, BIG_DENOMS);
    smallTotal = pick(rng, SMALL_TOTALS);
    smallDenom = pick(rng, SMALL_DENOMS);
    countBig = bigTotal / bigDenom;
    countSmall = smallTotal / smallDenom;
    tries++;
  } while (countBig <= countSmall && tries < 50);
  if (countBig <= countSmall) { bigTotal = 200; bigDenom = 10; countBig = 20; smallTotal = 8; smallDenom = 2; countSmall = 4; }

  const bigIsA = rng() < 0.5;
  const totalA = bigIsA ? bigTotal : smallTotal;
  const denomA = bigIsA ? bigDenom : smallDenom;
  const countA = bigIsA ? countBig : countSmall;
  const totalB = bigIsA ? smallTotal : bigTotal;
  const denomB = bigIsA ? smallDenom : bigDenom;
  const countB = bigIsA ? countSmall : countBig;
  const fracLabelA = FRAC_WORD_BY_DENOM[denomA];
  const fracLabelB = FRAC_WORD_BY_DENOM[denomB];

  const correctSurvey = countA > countB ? 'A' : 'B'; // strict by construction (countBig>countSmall)
  const biggerFractionSurvey = bigIsA ? 'B' : 'A'; // the "small total, big fraction" role always holds the bigger FRACTION

  const options = [
    { text: 'More pupils chose it in Survey A than in Survey B', misconception: correctSurvey === 'A' ? null : 'wrong-comparison' },
    { text: 'More pupils chose it in Survey B than in Survey A', misconception: correctSurvey === 'B' ? null : 'wrong-comparison' },
    { text: 'The same number of pupils chose it in both surveys', misconception: 'assumed-equal' },
    { text: 'You can’t compare them because the slices are different sizes', misconception: 'assumed-incomparable' },
    { text: `Survey ${biggerFractionSurvey} has the bigger fraction, so it must have more pupils`, misconception: 'fraction-not-count' },
  ];
  const correctIndex = options.findIndex((o) => o.misconception === null);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'wrong-comparison') whyWrong[o.text] = `Survey ${correctSurvey} actually has MORE — ${fmt(correctSurvey === 'A' ? countA : countB)} vs ${fmt(correctSurvey === 'A' ? countB : countA)}, not the other way round.`;
    else if (o.misconception === 'assumed-equal') whyWrong[o.text] = `The counts aren’t equal — Survey A had ${fmt(countA)} and Survey B had ${fmt(countB)}.`;
    else if (o.misconception === 'assumed-incomparable') whyWrong[o.text] = 'You CAN compare them — you just need each survey’s TOTAL first, and we’re given both here.';
    else if (o.misconception === 'fraction-not-count') whyWrong[o.text] = `A bigger FRACTION doesn’t mean a bigger NUMBER — Survey ${biggerFractionSurvey}’s total was much smaller, so its actual count is lower. Always check the real totals, not just the fraction size.`;
  });

  return {
    templateId: 'pie-t2-compare-pies',
    stem: `Survey A asked <b>${fmt(totalA)}</b> pupils their favourite ${noun}; <b>${fracLabelA}</b> of them chose ${X}. Survey B asked <b>${fmt(totalB)}</b> pupils; <b>${fracLabelB}</b> of them also chose ${X}. Which statement is TRUE?`,
    options,
    correctIndex,
    hintSteps: [
      'Don’t just compare the FRACTIONS — work out the actual NUMBER of pupils in each survey first.',
      `Survey A: ${fracLabelA} of ${fmt(totalA)}. Survey B: ${fracLabelB} of ${fmt(totalB)}. Which actual number is bigger?`,
    ],
    explain: {
      rule: RULE,
      worked: `Survey A: ${fracLabelA} of ${fmt(totalA)} = ${fmt(countA)}. Survey B: ${fracLabelB} of ${fmt(totalB)} = ${fmt(countB)}. ${fmt(countA)} vs ${fmt(countB)} — Survey ${correctSurvey} has more, even though the fractions might look different.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format — angle <-> count <-> total, never negative) --------

// Totals that divide 360 exactly, so count*step and count*360/angle are always whole numbers —
// no rounding is ever needed anywhere in this generator's angle arithmetic.
const NICE_TOTALS_360 = [8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120];

function t3AngleFromCount(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const total = pick(rng, NICE_TOTALS_360);
  const step = 360 / total;
  const count = rngInt(rng, 1, total - 1);
  const angle = count * step;

  return {
    templateId: 'pie-t3-angle-from-count',
    stem: `${fmt(total)} pupils were asked their favourite ${noun}. <b>${fmt(count)}</b> of them chose ${X}. What is the angle for ${X} on the pie chart?`,
    format: 'num',
    unit: '°',
    accept: [String(angle)],
    hintSteps: [
      `Divide the ${X} count by the total number of pupils: ${fmt(count)} ÷ ${fmt(total)}.`,
      'Now multiply that answer by 360.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(count)} ÷ ${fmt(total)} × 360 = ${angle}°.`,
      whyWrong: {},
    },
  };
}

function t3CountFromAngle(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const total = pick(rng, NICE_TOTALS_360);
  const step = 360 / total;
  const count = rngInt(rng, 1, total - 1);
  const angle = count * step;

  return {
    templateId: 'pie-t3-count-from-angle',
    stem: `${fmt(total)} pupils were asked their favourite ${noun}. The angle for ${X} on the pie chart is <b>${angle}°</b>. How many pupils chose ${X}?`,
    format: 'num',
    accept: [String(count)],
    hintSteps: [
      'Divide the angle by 360 first — that tells you what FRACTION of the whole pie this slice is.',
      `Now multiply that fraction by the total number of pupils: ${angle} ÷ 360 × ${fmt(total)}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${angle} ÷ 360 × ${fmt(total)} = ${fmt(count)}.`,
      whyWrong: {},
    },
  };
}

function t3TotalFromCountAngle(rng) {
  const { noun, items } = pickTheme(rng);
  const X = pick(rng, items);
  const total = pick(rng, NICE_TOTALS_360);
  const step = 360 / total;
  const count = rngInt(rng, 1, total - 1);
  const angle = count * step;

  return {
    templateId: 'pie-t3-total-from-count-angle',
    stem: `${fmt(count)} pupils chose ${X} as their favourite ${noun}, and ${X}’s slice has an angle of <b>${angle}°</b>. How many pupils were asked in total?`,
    format: 'num',
    accept: [String(total)],
    hintSteps: [
      'The angle tells you what FRACTION of the whole pie this slice is: angle ÷ 360.',
      `Divide the count by that fraction — ${fmt(count)} × 360 ÷ ${angle} — to find the total.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(count)} × 360 ÷ ${angle} = ${fmt(total)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1MostPopular, t1LeastPopular, t1CompareTwo];
const T2 = [t2FractionCount, t2RemainingCount, t2ComparePies];
const T3 = [t3AngleFromCount, t3CountFromAngle, t3TotalFromCountAngle];

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
