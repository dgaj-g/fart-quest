// FART QUEST — GEN agent
// Topic: probability (The Maybe Ledge). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Impossible–unlikely–evens–likely–certain. For dice: wanted outcomes out of six.';

const LEVEL_WORDS = ['Impossible', 'Unlikely', 'Evens', 'Likely', 'Certain'];

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// Curated bank of events tagged with their TRUE likelihood level (0=Impossible .. 4=Certain).
// Kept deliberately concrete (dice/coins/counters) or standard curriculum real-world facts so
// the classification is objective, not a matter of taste.
const EVENTS = [
  // 0 — Impossible
  { text: 'Rolling a 7 on a normal 6-sided dice', level: 0 },
  { text: 'Picking a green counter from a bag that only has red counters', level: 0 },
  { text: 'The day after Sunday being a Wednesday', level: 0 },
  { text: 'A calendar month having 45 days', level: 0 },
  // 1 — Unlikely
  { text: 'Rolling a 6 on one roll of a fair dice', level: 1 },
  { text: 'Picking the only red counter from a bag of 1 red and 9 blue counters', level: 1 },
  { text: 'It snowing in Belfast in the middle of July', level: 1 },
  { text: 'Winning first prize in a raffle with 1 ticket out of 100', level: 1 },
  // 2 — Evens
  { text: 'A fair coin landing on heads', level: 2 },
  { text: 'Rolling an even number on a fair dice numbered 1 to 6', level: 2 },
  { text: 'Picking a red counter from a bag with 5 red and 5 blue counters', level: 2 },
  { text: 'Guessing correctly which of two doors hides the prize', level: 2 },
  // 3 — Likely
  { text: 'Picking a red counter from a bag with 8 red and 2 blue counters', level: 3 },
  { text: 'Rolling a number less than 6 on a fair dice numbered 1 to 6', level: 3 },
  { text: 'It raining at some point during a whole week in Northern Ireland in November', level: 3 },
  { text: 'Picking a blue counter from a bag with 7 blue and 3 red counters', level: 3 },
  // 4 — Certain
  { text: 'The sun rising tomorrow morning', level: 4 },
  { text: 'Picking a red counter from a bag that only has red counters', level: 4 },
  { text: 'Rolling a number between 1 and 6 on a fair dice numbered 1 to 6', level: 4 },
  { text: 'Every week having 7 days', level: 4 },
];

const DICE_PROPS = [
  { desc: 'an EVEN number', match: [2, 4, 6] },
  { desc: 'an ODD number', match: [1, 3, 5] },
  { desc: 'a number greater than 4', match: [5, 6] },
  { desc: 'a number less than 3', match: [1, 2] },
  { desc: 'a multiple of 3', match: [3, 6] },
  { desc: 'a number greater than 2', match: [3, 4, 5, 6] },
  { desc: 'a number less than 5', match: [1, 2, 3, 4] },
];

const COLOR_POOL = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

function rankFromFraction(frac) {
  if (frac <= 0) return 0;
  if (frac >= 1) return 4;
  if (frac === 0.5) return 2;
  return frac < 0.5 ? 1 : 3;
}

// Shuffle a set of {text, misconception} options (exactly one with misconception:null) and
// return {options, correctIndex} — the shared shuffle-then-locate pattern used across templates.
function shuffleFindCorrect(rng, all) {
  const options = shuffle(rng, all);
  const correctIndex = options.findIndex((o) => o.misconception === null);
  return { options, correctIndex };
}

// -------- T1 templates --------

function t1LikelihoodScenario(rng) {
  const event = pick(rng, EVENTS);
  const raw = LEVEL_WORDS.map((w, level) => ({ text: w, misconception: level === event.level ? null : 'wrong-point' }));
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-point') {
      whyWrong[o.text] = `${event.text} actually sits at ${LEVEL_WORDS[event.level]} on the Likelihood Line, not ${o.text}.`;
    }
  }

  return {
    templateId: 'prob-t1-likelihood-scenario',
    stem: `Where does this sit on the Likelihood Line: <b>${event.text}</b>?`,
    options,
    correctIndex,
    hintSteps: [
      'Think about how often this could really happen — never, sometimes, or always?',
      'Match that feeling to one of the five words on the Likelihood Line.',
    ],
    explain: {
      rule: RULE,
      worked: `${event.text} is ${LEVEL_WORDS[event.level]} — it sits at the ${LEVEL_WORDS[event.level].toLowerCase()} point on the Likelihood Line.`,
      whyWrong,
    },
  };
}

function t1WhichEventMatchesWord(rng) {
  const level = rngInt(rng, 0, 4);
  const targetWord = LEVEL_WORDS[level];
  const correctEvent = pick(rng, EVENTS.filter((e) => e.level === level));
  const distractorEvents = shuffle(rng, EVENTS.filter((e) => e.level !== level)).slice(0, 3);

  const raw = [correctEvent, ...distractorEvents].map((e) => ({
    text: e.text,
    misconception: e.level === level ? null : 'wrong-level',
    _level: e.level,
  }));
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-level') {
      whyWrong[o.text] = `${o.text} is actually ${LEVEL_WORDS[o._level]}, not ${targetWord}.`;
    }
  }

  return {
    templateId: 'prob-t1-which-event',
    stem: `Which of these is <b>${targetWord}</b>?`,
    options: options.map((o) => ({ text: o.text, misconception: o.misconception })),
    correctIndex,
    hintSteps: [
      'Think about each option: how often would it really happen?',
      `Only one of these truly matches "${targetWord}" on the Likelihood Line.`,
    ],
    explain: {
      rule: RULE,
      worked: `${correctEvent.text} is ${targetWord} — that’s the one that matches.`,
      whyWrong,
    },
  };
}

function t1FairSpinnerCheck(rng) {
  const fair = rng() < 0.5;
  let sectors;
  let biasedColor = null;
  let n;

  if (fair) {
    n = rngInt(rng, 3, 5);
    sectors = shuffle(rng, shuffle(rng, COLOR_POOL).slice(0, n));
  } else {
    n = rngInt(rng, 4, 6);
    biasedColor = pick(rng, COLOR_POOL);
    const biasedCount = rngInt(rng, 2, 3);
    const remaining = n - biasedCount;
    const otherColors = shuffle(rng, COLOR_POOL.filter((c) => c !== biasedColor)).slice(0, remaining);
    sectors = shuffle(rng, [...Array(biasedCount).fill(biasedColor), ...otherColors]);
    n = sectors.length;
  }

  const stem = `This spinner has ${n} equal-sized sectors. Is it a <b>fair</b> way to choose a colour?`;
  // Multiple phrasings per branch, picked at random, deliberately mixed short/long so the
  // correct answer's text length isn't a reliable "tell" across many generations.
  let raw;
  if (fair) {
    const correctText = pick(rng, [
      'Yes — equal slices, so equal chances.',
      'Yes — every colour has the same number of slices.',
      'Yes, it’s fair.',
    ]);
    raw = [
      { text: correctText, misconception: null },
      { text: pick(rng, ['No — not equal.', 'No — one colour has more slices than the rest, so it isn’t balanced.']), misconception: 'false-bias-claim' },
      { text: pick(rng, ['No — fair means nice colours.', 'No — fair only means the colours look nice, which has nothing to do with slice size.']), misconception: 'fair-is-nice' },
      { text: pick(rng, [`Yes — there are ${n} sectors.`, `Yes — but only because there happen to be ${n} sectors on this particular spinner.`]), misconception: 'total-count-reasoning' },
    ];
  } else {
    const correctText = pick(rng, [
      `No — ${biasedColor} has more slices, so it’s more likely.`,
      `No — it isn’t fair, because ${biasedColor} takes up more of the spinner than any other colour here.`,
      `Not fair — ${biasedColor} wins more often.`,
    ]);
    raw = [
      { text: correctText, misconception: null },
      { text: pick(rng, ['Yes — equal.', 'Yes — every colour has the same number of slices, so it’s perfectly fair.']), misconception: 'ignored-bias' },
      { text: pick(rng, ['No — fair means nice colours.', 'No — fair only means the colours look nice, which has nothing to do with slice size.']), misconception: 'fair-is-nice' },
      { text: pick(rng, ['No — too many colours.', 'No — there are simply too many different colours on this spinner to ever be fair.']), misconception: 'irrelevant-count' },
    ];
  }
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'false-bias-claim') whyWrong[o.text] = 'Check again — every colour here really does have the same number of slices.';
    else if (o.misconception === 'fair-is-nice') whyWrong[o.text] = 'Fair has nothing to do with looking nice — it means every slice is the SAME SIZE.';
    else if (o.misconception === 'total-count-reasoning') whyWrong[o.text] = 'That reasoning is wrong — the total number of sectors doesn’t decide fairness, only whether they’re EQUAL sizes.';
    else if (o.misconception === 'ignored-bias') whyWrong[o.text] = `Look again — ${biasedColor} has MORE slices than the other colours, so it isn’t equal.`;
    else if (o.misconception === 'irrelevant-count') whyWrong[o.text] = 'The number of colours doesn’t matter — only whether the slices are EQUAL sizes.';
  }

  return {
    templateId: 'prob-t1-fair-spinner',
    stem,
    visual: { kind: 'spinner', sectors },
    options,
    correctIndex,
    hintSteps: fair
      ? ['Count how many slices each colour has — are they all the same?', 'If every colour has an equal number of slices, the spinner is fair.']
      : ['Count how many slices each colour has — are they all the same?', 'Which colour has more slices than the rest? That colour is more likely to be picked.'],
    explain: {
      rule: RULE,
      worked: fair
        ? 'Every colour here has exactly the same number of slices, so each colour has an equal chance — that’s fair.'
        : `${biasedColor} has more slices than the other colours, so it’s more likely to be picked — that’s not fair.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2DiceChanceOutOfSix(rng) {
  const prop = pick(rng, DICE_PROPS);
  const count = prop.match.length;
  const correctText = `${count} out of 6`;

  const seen = new Set([correctText]);
  const distractors = [];
  function addD(val, misconception) {
    if (val < 0 || val > 6) return;
    const t = `${val} out of 6`;
    if (seen.has(t)) return;
    seen.add(t);
    distractors.push({ text: t, misconception });
  }
  addD(6 - count, 'complement-swap');
  addD(count - 1, 'miscount-under');
  addD(count + 1, 'miscount-over');
  if (!seen.has(`${count} out of 12`)) {
    seen.add(`${count} out of 12`);
    distractors.push({ text: `${count} out of 12`, misconception: 'wrong-total' });
  }
  let padVal = 0;
  while (distractors.length < 4 && padVal <= 6) {
    const t = `${padVal} out of 6`;
    if (!seen.has(t)) {
      seen.add(t);
      distractors.push({ text: t, misconception: 'padded-near-miss' });
    }
    padVal += 1;
  }

  const raw = [{ text: correctText, misconception: null }, ...distractors.slice(0, 4)];
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'complement-swap') whyWrong[o.text] = `That’s the numbers that DON’T match "${prop.desc}" — you’ve swapped wanted and not-wanted.`;
    else if (o.misconception === 'miscount-under') whyWrong[o.text] = `Check again — you’re one short. Recount which numbers 1–6 are ${prop.desc}.`;
    else if (o.misconception === 'miscount-over') whyWrong[o.text] = `Check again — you’ve got one too many. Recount which numbers 1–6 are ${prop.desc}.`;
    else if (o.misconception === 'wrong-total') whyWrong[o.text] = 'A dice numbered 1–6 only has 6 outcomes in total, not 12.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Recount the numbers 1 to 6 that are ${prop.desc} — that count is off.`;
  }

  return {
    templateId: 'prob-t2-dice-out-of-6',
    stem: `A fair dice numbered 1–6 is rolled once. What is the chance of rolling <b>${prop.desc}</b>?`,
    options,
    correctIndex,
    hintSteps: [
      `List the numbers 1 to 6 and mark which ones are ${prop.desc}.`,
      'Count how many numbers matched — that’s your "wanted", out of the 6 total.',
    ],
    explain: {
      rule: RULE,
      worked: `Numbers 1–6 that are ${prop.desc}: ${prop.match.join(', ')} — that’s ${count} out of 6.`,
      whyWrong,
    },
  };
}

function buildSpinnerDistribution(rng) {
  const k = rngInt(rng, 2, 4);
  const colors = shuffle(rng, COLOR_POOL).slice(0, k);
  // Keep total sectors comfortably >= 6 so the "X out of N" distractor pool (0..N minus the
  // correct value) always has >= 4 distinct wrong values available, even after complement/
  // miscount collisions are deduped.
  const n = k + rngInt(rng, 4, 6);
  const counts = {};
  colors.forEach((c) => { counts[c] = 1; });
  let remaining = n - k;
  while (remaining > 0) {
    const c = pick(rng, colors);
    counts[c] += 1;
    remaining -= 1;
  }
  let sectors = [];
  colors.forEach((c) => { sectors = sectors.concat(Array(counts[c]).fill(c)); });
  sectors = shuffle(rng, sectors);
  return { sectors, counts, colors, n };
}

function spinnerChanceOptions(rng, correctVal, n, wrongColourCount) {
  const seen = new Set([`${correctVal} out of ${n}`]);
  const distractors = [];
  function addD(val, misconception) {
    if (val < 0 || val > n) return;
    const t = `${val} out of ${n}`;
    if (seen.has(t)) return;
    seen.add(t);
    distractors.push({ text: t, misconception });
  }
  addD(n - correctVal, 'complement-swap');
  if (wrongColourCount !== undefined) addD(wrongColourCount, 'wrong-colour-count');
  addD(correctVal - 1, 'miscount');
  addD(correctVal + 1, 'miscount');
  let padVal = 0;
  while (distractors.length < 4 && padVal <= n) {
    addD(padVal, 'padded-near-miss');
    padVal += 1;
  }
  return distractors.slice(0, 4);
}

function t2SpinnerColourChance(rng) {
  const dist = buildSpinnerDistribution(rng);
  const target = pick(rng, dist.colors);
  const r = dist.counts[target];
  const { n } = dist;
  const otherColor = dist.colors.find((c) => c !== target && dist.counts[c] !== r);
  const distractors = spinnerChanceOptions(rng, r, n, otherColor ? dist.counts[otherColor] : undefined);
  const raw = [{ text: `${r} out of ${n}`, misconception: null }, ...distractors];
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'complement-swap') whyWrong[o.text] = `That’s the chance of NOT landing on ${target} — you’ve swapped wanted and not-wanted.`;
    else if (o.misconception === 'wrong-colour-count') whyWrong[o.text] = `That’s the count for a DIFFERENT colour — recount just the ${target} sectors.`;
    else if (o.misconception === 'miscount') whyWrong[o.text] = `Recount the ${target} sectors on the spinner — that number is off.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Recount the ${target} sectors out of the ${n} total — that count is off.`;
  }

  return {
    templateId: 'prob-t2-spinner-colour',
    stem: `This spinner has ${n} equal sectors. What is the chance of landing on <b>${target}</b>?`,
    visual: { kind: 'spinner', sectors: dist.sectors },
    options,
    correctIndex,
    hintSteps: [
      `Count how many of the ${n} sectors are ${target}.`,
      `Write it as "wanted out of total" — that many out of ${n}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${r} of the ${n} sectors are ${target} — that’s ${r} out of ${n}.`,
      whyWrong,
    },
  };
}

function t2SpinnerNotColourChance(rng) {
  const dist = buildSpinnerDistribution(rng);
  const target = pick(rng, dist.colors);
  const r = dist.counts[target];
  const { n } = dist;
  const notR = n - r;
  const distractors = spinnerChanceOptions(rng, notR, n, r);
  const raw = [{ text: `${notR} out of ${n}`, misconception: null }, ...distractors];
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'complement-swap') whyWrong[o.text] = `That’s the chance OF landing on ${target}, not the chance of missing it — swap it round.`;
    else if (o.misconception === 'wrong-colour-count') whyWrong[o.text] = `That’s just the count of ${target} sectors — take it AWAY from the total instead.`;
    else if (o.misconception === 'miscount') whyWrong[o.text] = `Recount the sectors that are NOT ${target} — that number is off.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Recount the sectors that are NOT ${target}, out of ${n} total — that count is off.`;
  }

  return {
    templateId: 'prob-t2-spinner-not-colour',
    stem: `This spinner has ${n} equal sectors. What is the chance of <b>NOT</b> landing on <b>${target}</b>?`,
    visual: { kind: 'spinner', sectors: dist.sectors },
    options,
    correctIndex,
    hintSteps: [
      `${r} of the ${n} sectors are ${target}. How many sectors are there that AREN'T ${target}?`,
      `Take the ${target} count away from the total: ${n} − ${r} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${r} of the ${n} sectors are ${target}, so ${n} − ${r} = ${notR} sectors are NOT ${target} — that’s ${notR} out of ${n}.`,
      whyWrong,
    },
  };
}

function t2RecencyFallacyTrueFalse(rng) {
  const streakLen = rngInt(rng, 3, 6);
  const streakVal = rngInt(rng, 1, 6);
  const list = Array(streakLen).fill(streakVal).join(', ');

  const raw = [
    { text: '1 out of 6 — still the same, a dice has no memory.', misconception: null },
    { text: `More than 1 out of 6 — a ${streakVal} is "due" after all that`, misconception: 'recency-fallacy-more' },
    { text: `Less than 1 out of 6 — ${streakVal}s can’t keep coming forever`, misconception: 'recency-fallacy-less' },
    { text: 'Impossible — it can’t possibly be the same number again', misconception: 'impossible-confusion' },
    { text: 'Certain — it must be the same number again', misconception: 'certain-confusion' },
  ];
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'recency-fallacy-more') whyWrong[o.text] = 'A dice has no memory — every roll is a fresh 1 out of 6, no matter what came before.';
    else if (o.misconception === 'recency-fallacy-less') whyWrong[o.text] = 'A dice has no memory — past rolls never make a number less likely either.';
    else if (o.misconception === 'impossible-confusion') whyWrong[o.text] = `It’s definitely still possible — ${streakVal} is still one of the 6 numbers on the dice.`;
    else if (o.misconception === 'certain-confusion') whyWrong[o.text] = 'It’s not guaranteed either — there are 6 possible numbers, so it can’t be certain.';
  }

  return {
    templateId: 'prob-t2-recency-fallacy',
    stem: `Marvin rolls a fair dice and gets ${list} in a row! What is the chance the NEXT roll is a ${streakVal}?`,
    options,
    correctIndex,
    hintSteps: [
      'Does a dice remember what it rolled before? Every roll starts completely fresh.',
      'How many sides does a fair dice have, and how many of them show the number that already came up?',
    ],
    explain: {
      rule: RULE,
      worked: 'Every roll of a fair dice is independent — the chance of any single number is always 1 out of 6, no matter what happened before.',
      whyWrong,
    },
  };
}

// -------- T3 templates --------

function t3BridgeEquivalenceNumWriteIn(rng) {
  const t2 = pick(rng, [2, 3, 4, 5]);
  const w2 = rngInt(rng, 1, t2 - 1);
  const k = rngInt(rng, 2, 4);
  const t = t2 * k;
  const w = w2 * k;

  return {
    templateId: 'prob-t3-bridge-equivalence',
    stem: `A spinner has <b>${t}</b> equal sectors and <b>${w}</b> of them are blue. If the spinner only had <b>${t2}</b> sectors, how many would need to be blue for the SAME chance?`,
    format: 'num',
    accept: [String(w2), fmt(w2)],
    hintSteps: [
      `Simplify ${w} out of ${t} by dividing both numbers by the same amount until the total is ${t2}.`,
      `${w} ÷ ${k} = ? (and ${t} ÷ ${k} = ${t2})`,
    ],
    explain: {
      rule: RULE,
      worked: `${w} out of ${t} simplifies to ${w2} out of ${t2} (divide both by ${k}) — the exact same chance.`,
      whyWrong: {},
    },
  };
}

function t3CountFavourableNumWriteIn(rng) {
  const n = pick(rng, [8, 10, 12, 15, 20]);
  const propType = pick(rng, ['multiples', 'odd', 'even', 'greaterThan']);
  let count;
  let desc;
  if (propType === 'multiples') {
    const k = pick(rng, [2, 3, 4, 5].filter((x) => x < n));
    count = Math.floor(n / k);
    desc = `multiples of ${k}`;
  } else if (propType === 'odd') {
    count = Math.ceil(n / 2);
    desc = 'odd numbers';
  } else if (propType === 'even') {
    count = Math.floor(n / 2);
    desc = 'even numbers';
  } else {
    const x = rngInt(rng, Math.floor(n / 2), n - 1);
    count = n - x;
    desc = `numbers greater than ${x}`;
  }

  const sectors = Array.from({ length: n }, (_, i) => String(i + 1));

  return {
    templateId: 'prob-t3-count-favourable',
    stem: `A fair spinner is numbered 1 to <b>${n}</b>. How many of the numbers are <b>${desc}</b>?`,
    format: 'num',
    visual: { kind: 'spinner', sectors },
    accept: [String(count), fmt(count)],
    hintSteps: [
      `List the numbers from 1 to ${n} and mark the ones that are ${desc}.`,
      'Count how many numbers you marked.',
    ],
    explain: {
      rule: RULE,
      worked: `Out of the numbers 1 to ${n}, exactly ${count} are ${desc}.`,
      whyWrong: {},
    },
  };
}

function t3ComplementCountNumWriteIn(rng) {
  const n = rngInt(rng, 6, 20);
  const r = rngInt(rng, 1, n - 1);
  const answer = n - r;

  return {
    templateId: 'prob-t3-complement-count',
    stem: `A bag has <b>${n}</b> counters in total. <b>${r}</b> of them are red. How many are <b>NOT</b> red?`,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `If ${r} out of ${n} are red, the rest must be some other colour.`,
      `${n} − ${r} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${n} counters total, ${r} are red, so ${n - r} are NOT red.`,
      whyWrong: {},
    },
  };
}

function t3WhichStatementTrueMcq(rng) {
  const propA = pick(rng, DICE_PROPS);
  const fracA = propA.match.length / 6;
  const actualRankA = rankFromFraction(fracA);
  const claimedIndexA = rng() < 0.5 ? actualRankA : pick(rng, [0, 1, 2, 3, 4].filter((i) => i !== actualRankA));
  const truthA = claimedIndexA === actualRankA;
  const textA = `Statement A: rolling ${propA.desc} on a fair dice numbered 1–6 is ${LEVEL_WORDS[claimedIndexA]}.`;

  const total = rngInt(rng, 4, 10);
  const red = rngInt(rng, 1, total - 1);
  const blue = total - red;
  const fracB = red / total;
  const actualRankB = rankFromFraction(fracB);
  const claimedIndexB = rng() < 0.5 ? actualRankB : pick(rng, [0, 1, 2, 3, 4].filter((i) => i !== actualRankB));
  const truthB = claimedIndexB === actualRankB;
  const textB = `Statement B: picking a red counter from a bag with ${red} red and ${blue} blue counters is ${LEVEL_WORDS[claimedIndexB]}.`;

  const stem = `${textA}<br>${textB}<br>Which is correct?`;

  const comboTexts = ['Both statements are true.', 'Only Statement A is true.', 'Only Statement B is true.', 'Neither statement is true.'];
  let correctComboText;
  if (truthA && truthB) correctComboText = comboTexts[0];
  else if (truthA && !truthB) correctComboText = comboTexts[1];
  else if (!truthA && truthB) correctComboText = comboTexts[2];
  else correctComboText = comboTexts[3];

  const raw = [
    ...comboTexts.map((t) => ({ text: t, misconception: t === correctComboText ? null : 'wrong-combo' })),
    { text: 'Not enough information to tell.', misconception: 'false-uncertainty' },
  ];
  const { options, correctIndex } = shuffleFindCorrect(rng, raw);

  const truthSummary = `Statement A is actually ${truthA ? 'TRUE' : 'FALSE'} and Statement B is actually ${truthB ? 'TRUE' : 'FALSE'} — re-check both before picking a combination.`;
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-combo') whyWrong[o.text] = truthSummary;
    else if (o.misconception === 'false-uncertainty') whyWrong[o.text] = 'Both statements CAN be worked out exactly — there’s no missing information here.';
  }

  return {
    templateId: 'prob-t3-which-statement-true',
    stem,
    options,
    correctIndex,
    hintSteps: [
      'Work out Statement A on its own first — is it actually true or false?',
      'Now work out Statement B on its own, then match the TRUE/FALSE combination to the right option.',
    ],
    explain: {
      rule: RULE,
      worked: `Statement A is ${truthA ? 'TRUE' : 'FALSE'} (${propA.desc} on a dice numbered 1–6 is really ${LEVEL_WORDS[actualRankA]}). Statement B is ${truthB ? 'TRUE' : 'FALSE'} (picking red from ${red} red / ${blue} blue is really ${LEVEL_WORDS[actualRankB]}).`,
      whyWrong,
    },
  };
}

function t3SelectTwoLeastMost(rng) {
  const direction = rng() < 0.5 ? 'least' : 'most';
  const eventsPerLevel = [0, 1, 2, 3, 4].map((level) => pick(rng, EVENTS.filter((e) => e.level === level)));
  const optionsRaw = shuffle(rng, eventsPerLevel.map((e) => ({ text: e.text, level: e.level })));
  const targetLevels = direction === 'least' ? [0, 1] : [3, 4];
  const correctIndices = optionsRaw.reduce((acc, o, i) => {
    if (targetLevels.includes(o.level)) acc.push(i);
    return acc;
  }, []);

  const whyWrong = {};
  optionsRaw.forEach((o, i) => {
    if (correctIndices.includes(i)) return;
    whyWrong[o.text] = `${o.text} is ${LEVEL_WORDS[o.level]} on the Likelihood Line — not one of the two ${direction} likely here.`;
  });

  return {
    templateId: 'prob-t3-select-two-extreme',
    stem: `Which <b>TWO</b> of these are ${direction === 'least' ? 'LEAST' : 'MOST'} likely to happen?`,
    format: 'selecttwo',
    options: optionsRaw.map((o) => ({ text: o.text })),
    correctIndices,
    hintSteps: [
      'Think about where each event sits on the Likelihood Line.',
      `Pick the TWO that sit furthest towards the ${direction === 'least' ? 'IMPOSSIBLE' : 'CERTAIN'} end.`,
    ],
    explain: {
      rule: RULE,
      worked: `${correctIndices.map((i) => optionsRaw[i].text).join(' and ')} are the two ${direction} likely — they sit closest to ${direction === 'least' ? 'Impossible' : 'Certain'} on the line.`,
      whyWrong,
    },
  };
}

// -------- dispatch --------

const T1 = [t1LikelihoodScenario, t1WhichEventMatchesWord, t1FairSpinnerCheck];
const T2 = [t2DiceChanceOutOfSix, t2SpinnerColourChance, t2SpinnerNotColourChance, t2RecencyFallacyTrueFalse];
const T3 = [t3BridgeEquivalenceNumWriteIn, t3CountFavourableNumWriteIn, t3ComplementCountNumWriteIn, t3WhichStatementTrueMcq, t3SelectTwoLeastMost];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `probability-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'probability',
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
