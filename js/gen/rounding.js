// FART QUEST — GEN agent
// Topic: rounding (Catapult Hill). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Find the two camps. Look at the DECIDER digit only: 5 or more, fling UP. 4 or less, roll BACK.';

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
function fmtMoney(hundredths) {
  const v = hundredths / 100;
  return `£${v.toFixed(2)}`;
}

function roundToNearest(n, base) {
  return Math.round(n / base) * base;
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
// Generic padding source for rounding: correct ±10/±100 (other camps), the unrounded
// original, and the truncated (rounded-down) result.
function padDistractorCandidates(correctVal, opts) {
  const candidates = [];
  const base = opts.base || 10;
  candidates.push(correctVal + base, correctVal - base); // other camps at the same place
  candidates.push(correctVal + base * 10, correctVal - base * 10); // camps one place further out
  if (opts.original !== undefined) {
    candidates.push(opts.original); // the unrounded original
    candidates.push(Math.floor(opts.original / base) * base); // truncation (always rounds down)
  }
  return candidates
    .filter((v) => Number.isFinite(v) && v >= 0)
    .map((v) => ({ text: fmt(v), misconception: 'padded-near-miss' }));
}

// Ensure at least `min` total options (correct + distractors). Pads with plausible
// rounding-themed distractors (never random garbage) if dedup left us short.
function makeMcq(correct, distractorPool, n = 3, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  const min = opts.min || n + 1;
  if (options.length < min && opts.rng) {
    const correctVal = opts.correctVal !== undefined ? opts.correctVal : Number(String(correct.text).replace(/,/g, ''));
    const padCandidates = shuffle(opts.rng, padDistractorCandidates(correctVal, opts));
    const seen = new Set(options.map((o) => o.text));
    for (const cand of padCandidates) {
      if (options.length >= min) break;
      if (seen.has(cand.text)) continue;
      seen.add(cand.text);
      options.push(cand);
    }
  }
  return options;
}

// -------- T1 templates --------

function t1RoundNearest10(rng) {
  // 2-digit to nearest 10, never ending in 5 (T1 excludes the 5-boundary)
  let n;
  do {
    n = rngInt(rng, 11, 98);
  } while (n % 10 === 5 || n % 10 === 0);
  const decider = n % 10;
  const lower = Math.floor(n / 10) * 10;
  const upper = lower + 10;
  const answer = decider >= 5 ? upper : lower;
  const rolledBack = decider >= 5 ? lower : upper; // the "wrong direction" option

  const stem = `Round <b>${n}</b> to the nearest 10.`;
  const distractors = [];
  distractors.push({ text: fmt(rolledBack), misconception: decider >= 5 ? 'rolled-back' : 'flung-up' });
  distractors.push({ text: fmt(n), misconception: 'no-round' });
  distractors.push({ text: fmt(roundToNearest(n, 100)), misconception: 'wrong-place' });

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctVal: answer, base: 10, original: n });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'rolled-back') whyWrong[o.text] = `The decider was ${decider} — that’s 5 or more, so the catapult fires UP, not back.`;
    else if (o.misconception === 'flung-up') whyWrong[o.text] = `The decider was ${decider} — that’s 4 or less, so it rolls back, not up.`;
    else if (o.misconception === 'no-round') whyWrong[o.text] = 'Rounding always lands ON a camp — a number ending in 0.';
    else if (o.misconception === 'wrong-place') whyWrong[o.text] = 'That’s rounding to the nearest hundred — wrong catapult!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which camp is really closest — count the seats to each one.';
  }

  return {
    templateId: 'round-t1-nearest-10',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Camps: ${lower} and ${upper}. Now check the decider — the UNITS digit of ${n}.`,
      `The decider is ${decider}. Is ${decider} “5 or more”? Then the catapult flings ${decider >= 5 ? 'UP' : 'back'} to…?`,
    ],
    explain: {
      rule: RULE,
      worked: `${n} sits between ${lower} and ${upper}. Decider (units) = ${decider} → ${decider >= 5 ? 'fling UP' : 'roll BACK'} → ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t1RoundNearest100(rng) {
  // 3-digit to nearest 100
  let n;
  do {
    n = rngInt(rng, 101, 989);
  } while (Math.floor((n % 100) / 10) === 5 || n % 100 === 0);
  const tensDigit = Math.floor((n % 100) / 10);
  const lower = Math.floor(n / 100) * 100;
  const upper = lower + 100;
  const answer = tensDigit >= 5 ? upper : lower;
  const rolledBack = tensDigit >= 5 ? lower : upper;

  const stem = `Round <b>${fmt(n)}</b> to the nearest 100.`;
  const distractors = [];
  distractors.push({ text: fmt(rolledBack), misconception: tensDigit >= 5 ? 'rolled-back' : 'flung-up' });
  distractors.push({ text: fmt(n), misconception: 'no-round' });
  distractors.push({ text: fmt(roundToNearest(n, 10)), misconception: 'wrong-place' });

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctVal: answer, base: 100, original: n });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'rolled-back') whyWrong[o.text] = `The decider was ${tensDigit} — that’s 5 or more, so the catapult fires UP, not back.`;
    else if (o.misconception === 'flung-up') whyWrong[o.text] = `The decider was ${tensDigit} — that’s 4 or less, so it rolls back, not up.`;
    else if (o.misconception === 'no-round') whyWrong[o.text] = 'Rounding always lands ON a camp — a number ending in 00.';
    else if (o.misconception === 'wrong-place') whyWrong[o.text] = 'That’s rounding to the nearest ten — wrong catapult!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which camp is really closest — count the seats to each one.';
  }

  return {
    templateId: 'round-t1-nearest-100',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Camps: ${fmt(lower)} and ${fmt(upper)}. Nearest HUNDRED means the decider is the TENS digit.`,
      `The decider is ${tensDigit}. Is it “5 or more”? Then the catapult flings ${tensDigit >= 5 ? 'UP' : 'back'} to…?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(n)} sits between ${fmt(lower)} and ${fmt(upper)}. Decider (tens) = ${tensDigit} → ${tensDigit >= 5 ? 'fling UP' : 'roll BACK'} → ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t1NumlineVisual(rng) {
  // numline visual variant (visual.kind='numline'), marker on N, camps at the two multiples, nearest 10, no 5-endings
  let n;
  do {
    n = rngInt(rng, 11, 98);
  } while (n % 10 === 5 || n % 10 === 0);
  const decider = n % 10;
  const lower = Math.floor(n / 10) * 10;
  const upper = lower + 10;
  const answer = decider >= 5 ? upper : lower;
  const posPercent = Math.round(((n - lower) / 10) * 100);

  const stem = `Round <b>${n}</b> to the nearest 10.`;
  const visualHtml = `<div class="numline" data-min="${lower}" data-max="${upper}" data-marker="${n}">
  <div class="camp camp-a">${lower}</div>
  <div class="numline-track">
    <span class="numline-marker" style="--pos:${posPercent}%">${n}</span>
  </div>
  <div class="camp camp-b">${upper}</div>
</div>`;

  const distractors = [];
  const rolledBack = decider >= 5 ? lower : upper;
  distractors.push({ text: fmt(rolledBack), misconception: decider >= 5 ? 'rolled-back' : 'flung-up' });
  distractors.push({ text: fmt(n), misconception: 'no-round' });
  distractors.push({ text: fmt(roundToNearest(n, 100)), misconception: 'wrong-place' });

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctVal: answer, base: 10, original: n });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'rolled-back') whyWrong[o.text] = `The decider was ${decider} — that’s 5 or more, so the catapult fires UP, not back.`;
    else if (o.misconception === 'flung-up') whyWrong[o.text] = `The decider was ${decider} — that’s 4 or less, so it rolls back, not up.`;
    else if (o.misconception === 'no-round') whyWrong[o.text] = 'Rounding always lands ON a camp — a number ending in 0.';
    else if (o.misconception === 'wrong-place') whyWrong[o.text] = 'That’s rounding to the nearest hundred — wrong catapult!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which camp is really closest — count the seats to each one.';
  }

  return {
    templateId: 'round-t1-numline',
    stem,
    visual: { kind: 'numline', html: visualHtml },
    options,
    correctIndex: 0,
    hintSteps: [
      `Look at the number line: ${n} sits between camps ${lower} and ${upper}. Which camp is it closer to?`,
      `The decider (units) digit is ${decider}. 5 or more flings UP, 4 or less rolls BACK.`,
    ],
    explain: {
      rule: RULE,
      worked: `${n} sits between ${lower} and ${upper}. Decider = ${decider} → ${decider >= 5 ? 'fling UP' : 'roll BACK'} → ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2Nearest10With5Endings(rng) {
  // nearest 10 incl. 5-endings (75 -> 80)
  const tens = rngInt(rng, 1, 9);
  const n = tens * 10 + 5;
  const lower = tens * 10;
  const upper = lower + 10;
  const answer = upper; // Law of Five always up

  const stem = `Round <b>${n}</b> to the nearest 10.`;
  const distractors = [];
  distractors.push({ text: fmt(lower), misconception: 'rolled-back-on-5' });
  distractors.push({ text: fmt(n), misconception: 'no-round' });
  distractors.push({ text: fmt(roundToNearest(n, 100)), misconception: 'wrong-place' });

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctVal: answer, base: 10, original: n, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'rolled-back-on-5') whyWrong[o.text] = 'Exactly halfway ALWAYS flings up — the Law of Five has no mercy.';
    else if (o.misconception === 'no-round') whyWrong[o.text] = 'Rounding always lands ON a camp — a number ending in 0.';
    else if (o.misconception === 'wrong-place') whyWrong[o.text] = 'That’s rounding to the nearest hundred — wrong catapult!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which camp is really closest — count the seats to each one.';
  }

  return {
    templateId: 'round-t2-nearest-10-five',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Camps: ${lower} and ${upper}. ${n} is exactly halfway.`,
      'What does the Law of Five say about exactly halfway? Fling…?',
    ],
    explain: {
      rule: RULE,
      worked: `${n} sits exactly halfway between ${lower} and ${upper}. Decider = 5 → the Law of Five → fling UP → ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t2Nearest100Boundary(rng) {
  // nearest 100 incl. 49/51 boundaries
  const hundreds = rngInt(rng, 1, 8);
  const nearBoundary = pick(rng, [49, 50, 51]);
  const n = hundreds * 100 + nearBoundary;
  const lower = hundreds * 100;
  const upper = lower + 100;
  const tensDigit = Math.floor((n % 100) / 10);
  const answer = tensDigit >= 5 ? upper : lower;
  const rolledBack = tensDigit >= 5 ? lower : upper;

  const stem = `Round <b>${fmt(n)}</b> to the nearest 100.`;
  const distractors = [];
  distractors.push({ text: fmt(rolledBack), misconception: tensDigit >= 5 ? 'rolled-back' : 'flung-up' });
  distractors.push({ text: fmt(n), misconception: 'no-round' });
  distractors.push({ text: fmt(roundToNearest(n, 10)), misconception: 'wrong-place' });

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctVal: answer, base: 100, original: n, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'rolled-back') whyWrong[o.text] = `The decider was ${tensDigit} — that’s 5 or more, so the catapult fires UP, not back.`;
    else if (o.misconception === 'flung-up') whyWrong[o.text] = `The decider was ${tensDigit} — that’s 4 or less, so it rolls back, not up.`;
    else if (o.misconception === 'no-round') whyWrong[o.text] = 'Rounding always lands ON a camp — a number ending in 00.';
    else if (o.misconception === 'wrong-place') whyWrong[o.text] = 'That’s rounding to the nearest ten — wrong catapult!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which camp is really closest — count the seats to each one.';
  }

  return {
    templateId: 'round-t2-nearest-100-boundary',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Camps: ${fmt(lower)} and ${fmt(upper)}. Nearest HUNDRED means the decider is the TENS digit.`,
      `The decider is ${tensDigit}. Fling ${tensDigit >= 5 ? 'UP' : 'back'}?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(n)} sits between ${fmt(lower)} and ${fmt(upper)}. Decider (tens) = ${tensDigit} → ${tensDigit >= 5 ? 'fling UP' : 'roll BACK'} → ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t2ReverseWhichRounds(rng) {
  // reverse: which of these rounds to 400 (nearest 100)?
  const hundreds = rngInt(rng, 1, 8);
  const target = hundreds * 100;
  const stem = `Which of these numbers rounds to <b>${fmt(target)}</b> (nearest 100)?`;

  // Correct answer must land within [target-49, target+49] so it truly rounds to target.
  const offsetCorrect = rngInt(rng, 0, 49) * (rng() < 0.5 ? 1 : -1);
  let correctVal = target + offsetCorrect;
  if (correctVal < 0) correctVal = target + 10;

  const belowTarget = target - 100;
  const aboveTarget = target + 100;
  // Fix (CRITICAL): these must land BEYOND the ±50 boundary around target, never inside it —
  // otherwise the distractor also rounds to target, creating a second correct answer.
  // distractorBelow = belowTarget + [1,49]  -> lands in [belowTarget+1, belowTarget+49] = [target-99, target-51]
  // distractorAbove = aboveTarget - [1,49]  -> lands in [aboveTarget-49, aboveTarget-1] = [target+51, target+99]
  const distractorBelowRaw = belowTarget + rngInt(rng, 1, 49);
  const distractorBelow = distractorBelowRaw >= 0 ? distractorBelowRaw : target + 51 + rngInt(rng, 0, 48); // clamp: keep >= target+51 zone if below-zero
  const distractorAbove = aboveTarget - rngInt(rng, 1, 49);
  const distractorExactOther = target + 50; // rounds up to the NEXT hundred, common trap (exactly on the boundary, not inside it)

  const distractors = [
    { text: fmt(distractorBelow), misconception: 'wrong-camp' },
    { text: fmt(distractorAbove), misconception: 'wrong-camp' },
    { text: fmt(distractorExactOther), misconception: 'wrong-camp' },
  ];

  const correct = { text: fmt(correctVal), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { min: 5 });

  // Pad with extra numbers that round to a DIFFERENT hundred if dedup (or the raised 5-option
  // minimum) left us short — never a number that would also round to target (that would create
  // a second correct answer).
  if (options.length < 5) {
    const seen = new Set(options.map((o) => o.text));
    const extraCandidates = [target + 150, target - 150, target + 250, target - 250, target + 350, target - 350]
      .filter((v) => v >= 0 && Math.round(v / 100) * 100 !== target);
    for (const v of extraCandidates) {
      if (options.length >= 5) break;
      const text = fmt(v);
      if (seen.has(text)) continue;
      seen.add(text);
      options.push({ text, misconception: 'wrong-camp' });
    }
  }

  // Dev/test guard: assert no non-correct option actually rounds to target (would silently create
  // a second correct answer). Throws so the bug surfaces immediately rather than shipping silently.
  options.forEach((o, i) => {
    if (i === 0) return; // correct is always index 0 pre-shuffle (options array, not yet shuffled by the format renderer)
    const val = Number(String(o.text).replace(/,/g, ''));
    if (Math.round(val / 100) * 100 === target) {
      throw new Error(`t2ReverseWhichRounds: distractor "${o.text}" also rounds to target ${target}`);
    }
  });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-camp') whyWrong[o.text] = `Check that one on the catapult — it actually rounds to a different hundred, not ${fmt(target)}.`;
  }

  return {
    templateId: 'round-t2-reverse-which',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `The two camps around ${fmt(target)} are ${fmt(target - 100)} and ${fmt(target + 100)} on either side — but we want numbers that land ON ${fmt(target)}.`,
      'Round each option to the nearest hundred and see which one matches.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(correctVal)} rounds to ${fmt(target)} (nearest 100) because its tens digit is on the right side of the Law of Five.`,
      whyWrong,
    },
  };
}

function t2Nearest10ThreeDigit(rng) {
  // nearest 10 of 3-digit numbers
  let n;
  do {
    n = rngInt(rng, 101, 989);
  } while (n % 10 === 0);
  const decider = n % 10;
  const lower = Math.floor(n / 10) * 10;
  const upper = lower + 10;
  const answer = decider >= 5 ? upper : lower;
  const rolledBack = decider >= 5 ? lower : upper;

  const stem = `Round <b>${fmt(n)}</b> to the nearest 10.`;
  const distractors = [];
  distractors.push({ text: fmt(rolledBack), misconception: decider >= 5 ? 'rolled-back' : 'flung-up' });
  distractors.push({ text: fmt(n), misconception: 'no-round' });
  distractors.push({ text: fmt(roundToNearest(n, 100)), misconception: 'wrong-place' });

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctVal: answer, base: 10, original: n, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'rolled-back') whyWrong[o.text] = `The decider was ${decider} — that’s 5 or more, so the catapult fires UP, not back.`;
    else if (o.misconception === 'flung-up') whyWrong[o.text] = `The decider was ${decider} — that’s 4 or less, so it rolls back, not up.`;
    else if (o.misconception === 'no-round') whyWrong[o.text] = 'Rounding always lands ON a camp — a number ending in 0.';
    else if (o.misconception === 'wrong-place') whyWrong[o.text] = 'That’s rounding to the nearest hundred — wrong catapult!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which camp is really closest — count the seats to each one.';
  }

  return {
    templateId: 'round-t2-nearest-10-3digit',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Camps: ${fmt(lower)} and ${fmt(upper)}. Check the decider — the UNITS digit of ${fmt(n)}.`,
      `The decider is ${decider}. Fling ${decider >= 5 ? 'UP' : 'back'}?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(n)} sits between ${fmt(lower)} and ${fmt(upper)}. Decider (units) = ${decider} → ${decider >= 5 ? 'fling UP' : 'roll BACK'} → ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates --------

function t3RoundWriteIn(rng) {
  const base = pick(rng, [10, 100]);
  let n;
  if (base === 10) {
    do { n = rngInt(rng, 11, 998); } while (n % 10 === 0);
  } else {
    do { n = rngInt(rng, 101, 9989); } while (Math.floor((n % 100) / 10) === 0 && n % 100 === 0);
  }
  const answer = roundToNearest(n, base);
  const stem = `Round <b>${fmt(n)}</b> to the nearest ${base}.`;

  return {
    templateId: 'round-t3-writein',
    stem,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Find the two camps around ${fmt(n)} that are multiples of ${base}.`,
      `Check the decider digit and fling up or roll back.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(n)} rounds to ${fmt(answer)} (nearest ${base}).`,
      whyWrong: {},
    },
  };
}

function t3EstimateMultiply(rng) {
  // estimate 41x19 by rounding (mcq5 of magnitudes: 800 correct vs 80/8000/779/exact)
  let a, b;
  do {
    a = rngInt(rng, 11, 89);
    b = rngInt(rng, 11, 89);
  } while (a % 10 === 5 || b % 10 === 5); // avoid ambiguous halfway for cleanliness
  const aRound = roundToNearest(a, 10);
  const bRound = roundToNearest(b, 10);
  const estimate = aRound * bRound;
  const exact = a * b;

  const stem = `ESTIMATE: ${a} × ${b} is roughly…`;
  const distractors = [
    { text: fmt(exact), misconception: 'exact-bait' },
    { text: fmt(estimate / 10), misconception: 'magnitude' },
    { text: fmt(estimate * 10), misconception: 'magnitude' },
  ];

  const correct = { text: fmt(estimate), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctVal: estimate, base: aRound || 10, original: exact, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'exact-bait') whyWrong[o.text] = 'That’s the EXACT answer — the classic bait! “Estimate” means they want the rounded version.';
    else if (o.misconception === 'magnitude') whyWrong[o.text] = 'Wrong size — check how many zeros your rounded numbers should give.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check your rounding of each number before multiplying — a small slip changes the estimate a lot.';
  }

  return {
    templateId: 'round-t3-estimate-multiply',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Round each number to its nearest 10 first: ${a} → ? and ${b} → ?`,
      `${aRound} × ${bRound} = …?`,
    ],
    explain: {
      rule: 'Estimate = round FIRST, then calculate with the easy numbers.',
      worked: `${a} → ${aRound}, ${b} → ${bRound}. ${aRound} × ${bRound} = ${estimate}.`,
      whyWrong,
    },
  };
}

function t3EstimateMoney(rng) {
  // "estimate the total: £3.95 + £8.10" (mcq5)
  const aPence = rngInt(rng, 100, 999);
  const bPence = rngInt(rng, 100, 999);
  const aText = fmtMoney(aPence);
  const bText = fmtMoney(bPence);
  const aRoundPounds = roundToNearest(aPence / 100, 1);
  const bRoundPounds = roundToNearest(bPence / 100, 1);
  const estimate = aRoundPounds + bRoundPounds;
  const exact = Math.round((aPence + bPence)) / 100;

  const stem = `ESTIMATE the total: ${aText} + ${bText}`;
  const distractors = [
    { text: `£${exact.toFixed(2)}`, misconception: 'exact-bait' },
    { text: `£${(estimate / 10).toFixed(2)}`, misconception: 'magnitude' },
    { text: `£${(estimate * 10).toFixed(2)}`, misconception: 'magnitude' },
  ];

  const correct = { text: `£${estimate.toFixed(2)}`, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3);

  // Money format (£X.XX) isn't a plain integer, so the generic ±10/±100 padder doesn't apply —
  // pad with other plausible rounded-pound totals (± £1/£2 camps, the other rounding direction).
  // Fix 7: T3 mcq5 needs >=5 total options.
  if (options.length < 5) {
    const seen = new Set(options.map((o) => o.text));
    const extraCandidates = [estimate + 1, estimate - 1, estimate + 2, Math.max(0, estimate - 2), estimate + 3, Math.max(0, estimate - 3)]
      .filter((v) => v >= 0);
    for (const v of extraCandidates) {
      if (options.length >= 5) break;
      const text = `£${v.toFixed(2)}`;
      if (seen.has(text)) continue;
      seen.add(text);
      options.push({ text, misconception: 'padded-near-miss' });
    }
  }

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'exact-bait') whyWrong[o.text] = 'That’s the EXACT total — the classic bait! “Estimate” means they want the rounded version.';
    else if (o.misconception === 'magnitude') whyWrong[o.text] = 'Wrong size — check your rounding again.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check your rounding of each price before adding them together.';
  }

  return {
    templateId: 'round-t3-estimate-money',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Round each price to the nearest whole pound: ${aText} → ? and ${bText} → ?`,
      `Add the rounded pounds together.`,
    ],
    explain: {
      rule: 'Estimate = round FIRST, then calculate with the easy numbers.',
      worked: `${aText} → £${aRoundPounds}, ${bText} → £${bRoundPounds}. £${aRoundPounds} + £${bRoundPounds} = £${estimate.toFixed(2)}.`,
      whyWrong,
    },
  };
}

// -------- dispatch --------

const T1 = [t1RoundNearest10, t1RoundNearest100, t1NumlineVisual];
const T2 = [t2Nearest10With5Endings, t2Nearest100Boundary, t2ReverseWhichRounds, t2Nearest10ThreeDigit];
const T3 = [t3RoundWriteIn, t3EstimateMultiply, t3EstimateMoney];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `round-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'rounding',
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
