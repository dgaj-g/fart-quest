// FART QUEST — GEN agent
// Topic: decimals-x10 (The Slide-o-Matic Swamp). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'The point NEVER moves. The DIGITS slide — LEFT when you multiply (bigger), RIGHT when you divide (smaller). One slide per zero.';

// Format a number to at most 2dp, trimming trailing zeros artefacts safely (no float noise).
function fmt(n) {
  const rounded = Math.round(n * 100) / 100;
  let s = rounded.toFixed(2);
  if (s.endsWith('00')) s = s.slice(0, -3); // drop .00
  else if (s.endsWith('0')) s = s.slice(0, -1); // drop trailing 0 of .x0
  return s;
}

// Integer-cents-style helper: represent a decimal with up to 2dp as an integer of hundredths to avoid float error.
function toHundredths(n) {
  return Math.round(n * 100);
}
function fromHundredths(h) {
  return fmt(h / 100);
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
// Generic padding source for decimals: correct ×10, ÷10, ÷100, and the "add a zero" string
// slip (e.g. 3.50 for 3.5), all routed through fromHundredths so formatting stays clean (no float junk).
function padDistractorCandidates(correctHundredths, correctText) {
  const candidates = [];
  candidates.push(fromHundredths(correctHundredths * 10));
  candidates.push(fromHundredths(correctHundredths / 10));
  candidates.push(fromHundredths(correctHundredths / 100));
  // add-a-zero slip: only safe when correctText has 0 or 1dp already, otherwise tacking on a
  // zero would push it past the ≤2dp limit (e.g. "0.15" -> "0.150" is not allowed).
  const dpMatch = correctText.match(/\.(\d+)$/);
  if (!dpMatch || dpMatch[1].length < 2) {
    candidates.push(`${correctText}0`);
  }
  return candidates
    .filter((t) => t !== undefined && t !== null && !/nan|undefined/i.test(t))
    .map((text) => ({ text, misconception: 'padded-near-miss' }));
}

// Ensure at least `min` total options (correct + distractors). Pads with plausible
// slide-themed distractors (never random garbage) if dedup left us short.
function makeMcq(correct, distractorPool, n = 3, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  const min = opts.min || n + 1;
  if (options.length < min && opts.rng) {
    const correctHundredths = opts.correctHundredths !== undefined
      ? opts.correctHundredths
      : toHundredths(parseFloat(correct.text));
    const padCandidates = shuffle(opts.rng, padDistractorCandidates(correctHundredths, correct.text));
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

function t1TimesOrDivideBy10(rng) {
  const isMul = rng() < 0.5;
  // N whole or 1dp
  const oneDp = rng() < 0.5;
  let nHundredths;
  if (oneDp) {
    nHundredths = rngInt(rng, 10, 999) * 10; // e.g. 2.7 -> 270 hundredths, ensures 1dp
    if (nHundredths % 100 === 0) nHundredths += 10; // force genuine 1dp (avoid whole numbers)
  } else {
    nHundredths = rngInt(rng, 1, 999) * 100; // whole number in hundredths
  }
  const nText = fromHundredths(nHundredths);

  const resultHundredths = isMul ? nHundredths * 10 : nHundredths / 10;
  // Guard against >2dp results when dividing 1dp numbers (would produce 3dp) — regenerate as whole number divide instead
  let safeNHundredths = nHundredths;
  let safeResultHundredths = resultHundredths;
  if (!Number.isInteger(safeResultHundredths)) {
    // force whole-number base to keep ÷10 clean
    safeNHundredths = rngInt(rng, 1, 999) * 100;
    safeResultHundredths = isMul ? safeNHundredths * 10 : safeNHundredths / 10;
  }
  const nTextSafe = fromHundredths(safeNHundredths);
  const resultText = fromHundredths(safeResultHundredths);

  const stem = `What is ${nTextSafe} ${isMul ? '×' : '÷'} 10?`;

  const distractors = [];
  // add-a-zero trap (only meaningful visually for decimals)
  if (nTextSafe.includes('.')) {
    distractors.push({ text: `${nTextSafe}0`, misconception: 'add-a-zero' });
  } else {
    distractors.push({ text: `${nTextSafe}0`, misconception: 'add-a-zero' });
  }
  // slid wrong direction
  const wrongDirHundredths = isMul ? safeNHundredths / 10 : safeNHundredths * 10;
  distractors.push({ text: fromHundredths(wrongDirHundredths), misconception: 'slid-wrong-way' });
  // slid wrong number of places (2 slides instead of 1)
  const twoSlidesHundredths = isMul ? safeNHundredths * 100 : safeNHundredths / 100;
  distractors.push({ text: fromHundredths(twoSlidesHundredths), misconception: 'two-slides' });

  const correct = { text: resultText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctHundredths: safeResultHundredths });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'add-a-zero') whyWrong[o.text] = 'The “add a zero” trap! That doesn’t make the number the right size bigger — the digits must slide.';
    else if (o.misconception === 'slid-wrong-way') whyWrong[o.text] = `That slid the wrong way — ${isMul ? 'multiplying' : 'dividing'} makes the number ${isMul ? 'bigger' : 'smaller'}.`;
    else if (o.misconception === 'two-slides') whyWrong[o.text] = 'That’s two slides — that would be ×100 or ÷100, not 10.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check how many thrones the digits actually slid, and which way.';
  }

  return {
    templateId: 'dec-t1-times-divide-10',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${isMul ? '×' : '÷'} 10 means every digit slides ONE throne to the ${isMul ? 'left' : 'right'}. The point stays put.`,
      `Slide each digit one throne. What number do you get?`,
    ],
    explain: {
      rule: RULE,
      worked: `${nTextSafe} ${isMul ? '×' : '÷'} 10 → every digit slides one throne ${isMul ? 'left' : 'right'} → ${resultText}.`,
      whyWrong,
    },
  };
}

function t1WhichDigitTenths(rng) {
  const wholePart = rngInt(rng, 1, 99);
  const tenths = rngInt(rng, 1, 9);
  const nHundredths = wholePart * 100 + tenths * 10;
  const nText = fromHundredths(nHundredths);
  const stem = `In ${nText}, which digit is in the <b>tenths</b> place?`;

  const wholeDigits = String(wholePart).split('');
  const distractors = [];
  distractors.push({ text: wholeDigits[wholeDigits.length - 1], misconception: 'wrong-side-fence' });
  if (wholeDigits.length > 1) distractors.push({ text: wholeDigits[wholeDigits.length - 2], misconception: 'wrong-side-fence' });
  let extra = String(rngInt(rng, 0, 9));
  let tries = 0;
  while ((extra === String(tenths) || wholeDigits.includes(extra)) && tries < 20) {
    extra = String(rngInt(rng, 0, 9));
    tries++;
  }
  distractors.push({ text: extra, misconception: 'not-present' });

  const correct = { text: String(tenths), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3);

  // Pad with unused single-digit decoys if dedup left us short (this template's answer is a
  // single digit, so the numeric ×10/÷10 padder doesn't apply — same near-miss approach as placevalue).
  if (options.length < 4) {
    const seen = new Set(options.map((o) => o.text));
    for (let d = 0; d < 10 && options.length < 4; d++) {
      const text = String(d);
      if (seen.has(text)) continue;
      seen.add(text);
      options.push({ text, misconception: 'padded-near-miss' });
    }
  }

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-side-fence') whyWrong[o.text] = 'That digit is on the whole-number side of the fence, not the tenths seat.';
    else if (o.misconception === 'not-present') whyWrong[o.text] = 'That digit isn’t even in the number!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which side of the point the tenths seat is on, and count carefully.';
  }

  return {
    templateId: 'dec-t1-which-digit-tenths',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'The decimal point is the fence. The first digit to the RIGHT of the fence is the tenths seat.',
      `Which digit sits there in ${nText}?`,
    ],
    explain: {
      rule: RULE,
      worked: `In ${nText}, the tenths seat (just right of the point) holds ${tenths}.`,
      whyWrong,
    },
  };
}

function t1TenTimesWords(rng) {
  // "10x bigger/smaller in words"
  const bigger = rng() < 0.5;
  const wholePart = rngInt(rng, 1, 99);
  const tenths = rngInt(rng, 1, 9);
  const nHundredths = wholePart * 100 + tenths * 10;
  const nText = fromHundredths(nHundredths);
  const resultHundredths = bigger ? nHundredths * 10 : nHundredths / 10;
  const resultText = fromHundredths(resultHundredths);
  const stem = `What number is 10 times ${bigger ? 'BIGGER' : 'SMALLER'} than ${nText}?`;

  const distractors = [];
  distractors.push({ text: fromHundredths(bigger ? nHundredths / 10 : nHundredths * 10), misconception: 'slid-wrong-way' });
  distractors.push({ text: fromHundredths(bigger ? nHundredths * 100 : nHundredths / 100), misconception: 'two-slides' });
  distractors.push({ text: `${nText}0`, misconception: 'add-a-zero' });

  const correct = { text: resultText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 3, { rng, correctHundredths: resultHundredths });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'slid-wrong-way') whyWrong[o.text] = `That’s the wrong direction — ${bigger ? 'bigger' : 'smaller'} means sliding ${bigger ? 'left' : 'right'}.`;
    else if (o.misconception === 'two-slides') whyWrong[o.text] = 'That’s two slides — that’s ×100 or ÷100, not ×10 or ÷10.';
    else if (o.misconception === 'add-a-zero') whyWrong[o.text] = 'Sticking a zero on the end doesn’t change a decimal’s size at all!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check how many thrones the digits actually slid, and which way.';
  }

  return {
    templateId: 'dec-t1-ten-times-words',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `10 times ${bigger ? 'bigger' : 'smaller'} means every digit slides one throne ${bigger ? 'left' : 'right'}.`,
      'Slide the digits and read off the new number.',
    ],
    explain: {
      rule: RULE,
      worked: `${nText} → 10 times ${bigger ? 'bigger' : 'smaller'} → ${resultText}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2Times100Or1000(rng) {
  const factor = pick(rng, [100, 1000]);
  const isMul = rng() < 0.5;
  // choose base so result stays <=2dp
  // if multiplying: base can have up to 2dp already since result grows -> fine
  // if dividing: base must have enough trailing zeros in hundredths so result <=2dp
  let baseHundredths;
  if (isMul) {
    // any 0,1,2dp base works for multiply
    const dpChoice = pick(rng, [0, 1, 2]);
    if (dpChoice === 0) baseHundredths = rngInt(rng, 1, 99) * 100;
    else if (dpChoice === 1) baseHundredths = rngInt(rng, 10, 999) * 10;
    else baseHundredths = rngInt(rng, 100, 9999);
  } else {
    // dividing: need base hundredths divisible by (factor/100)*100 ... simplify:
    // dividing hundredths by factor must give integer hundredths result (<=2dp).
    // baseHundredths must be a multiple of factor.
    const multiple = rngInt(rng, 1, 50);
    baseHundredths = multiple * factor; // guarantees exact division with 0 remainder in hundredths terms is not quite right; recompute directly
  }

  let baseText, resultHundredths;
  if (isMul) {
    resultHundredths = baseHundredths * factor;
    // multiply by 100 or 1000 could push result to >2dp? No: multiplying only ever removes decimal places or keeps same, never adds. Safe.
    baseText = fromHundredths(baseHundredths);
  } else {
    // baseHundredths = multiple*factor represents hundredths units of an integer number (multiple*factor/100)
    const baseValue = baseHundredths / 100; // this is a whole number since factor is 100 or 1000
    resultHundredths = Math.round((baseValue / factor) * 100);
    baseText = fromHundredths(baseHundredths);
  }
  const resultText = fromHundredths(resultHundredths);
  // Enforce no 3dp: fromHundredths already rounds to 2dp cleanly since we work in hundredths ints.

  const stem = `What is ${baseText} ${isMul ? '×' : '÷'} ${factor}?`;
  const slides = factor === 100 ? 2 : 3;

  const distractors = [];
  // add-a-zero trap: only a plausible-looking slip when baseText is a whole number (tacking
  // zeros onto a decimal, e.g. "36.74" -> "36.7400", would push it past 2dp and read as nonsense).
  if (!baseText.includes('.')) {
    distractors.push({ text: `${baseText}${'0'.repeat(String(factor).length - 1)}`, misconception: 'add-a-zero' });
  }
  const oneSlideHundredths = isMul ? baseHundredths * 10 : baseHundredths / 10;
  distractors.push({ text: fromHundredths(oneSlideHundredths), misconception: 'wrong-number-of-slides' });
  const wrongDirHundredths = isMul ? baseHundredths / factor : baseHundredths * factor;
  distractors.push({ text: fromHundredths(wrongDirHundredths), misconception: 'slid-wrong-way' });
  // "seat-warmer" trap: dropping the leading "0." and misreading the result as a bare whole
  // number (e.g. reading "0.04" as "4"). Derived from the result's own digits, so — unlike a
  // further ÷10/÷100 of a tiny base — it can never vanish to 0, keeping this template
  // self-sufficient for the 5-option minimum (fix 7) without relying on the generic pad
  // degenerating gracefully for small bases. Only meaningful (and only added) when the result is
  // actually < 1, i.e. has a real seat-warmer zero to drop.
  if (resultText.startsWith('0.')) {
    const droppedZeroText = resultText.replace(/^0\./, '');
    distractors.push({ text: droppedZeroText, misconception: 'dropped-seat-warmer' });
  } else {
    // result >= 1 (typically the multiply case): fall back to a fixed 4-slide distractor (always
    // distinct from the 2-slide or 3-slide correct answer, since factor is only ever 100 or 1000).
    const fourSlideHundredths = isMul ? baseHundredths * 10000 : baseHundredths / 10000;
    distractors.push({ text: fromHundredths(fourSlideHundredths), misconception: 'wrong-number-of-slides' });
  }

  const correct = { text: resultText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { rng, correctHundredths: resultHundredths, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'add-a-zero') whyWrong[o.text] = 'Sticking zeros on the end isn’t sliding — the digits must move past the point.';
    else if (o.misconception === 'wrong-number-of-slides') whyWrong[o.text] = `That’s only 1 slide — ${factor} needs ${slides} slides.`;
    else if (o.misconception === 'slid-wrong-way') whyWrong[o.text] = `Wrong direction — ${isMul ? 'multiplying' : 'dividing'} makes the number ${isMul ? 'bigger' : 'smaller'}.`;
    else if (o.misconception === 'dropped-seat-warmer') whyWrong[o.text] = 'Missing the seat-warmer zero! A number less than 1 must start "0." — don’t drop the front zero.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check how many thrones the digits actually slid, and which way.';
  }

  return {
    templateId: 'dec-t2-times-100-1000',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${isMul ? '×' : '÷'} ${factor} means ${slides} slides ${isMul ? 'left' : 'right'} — count the zeros in ${factor}.`,
      'Slide every digit that many thrones and read off the answer.',
    ],
    explain: {
      rule: RULE,
      worked: `${baseText} ${isMul ? '×' : '÷'} ${factor} → ${slides} slides ${isMul ? 'left' : 'right'} → ${resultText}.`,
      whyWrong,
    },
  };
}

function t2ChainTwoOps(rng) {
  // Chain of two ×10/÷10 slides, e.g. "4.6 × 10 ÷ 10 = ?" — still squarely "×÷ by 10/100/1000"
  // (bullet 23), just two operations back-to-back instead of one. Each op individually is a
  // single throne-slide; when the two ops are opposite directions the slides cancel back to the
  // start, which is a genuine test of the "digits slide, point never moves" rule rather than a
  // new skill.
  const op1Mul = rng() < 0.5;
  const op2Mul = rng() < 0.5;

  let baseHundredths;
  if (!op1Mul && !op2Mul) {
    // both slides divide: base must be a whole number so both divisions stay ≤2dp
    baseHundredths = rngInt(rng, 2, 99) * 100;
  } else if (!op1Mul) {
    // first slide divides: base needs 0 or 1dp so the first division stays clean
    const whole = rngInt(rng, 1, 99);
    const tenths = rngInt(rng, 0, 9);
    baseHundredths = whole * 100 + tenths * 10;
  } else {
    // first slide multiplies: any 0/1/2dp base is safe, multiplying never adds precision
    const dp = pick(rng, [0, 1, 2]);
    if (dp === 0) baseHundredths = rngInt(rng, 1, 99) * 100;
    else if (dp === 1) baseHundredths = rngInt(rng, 10, 999) * 10;
    else baseHundredths = rngInt(rng, 100, 9999);
  }
  const baseText = fromHundredths(baseHundredths);

  const afterOp1Hundredths = op1Mul ? baseHundredths * 10 : baseHundredths / 10;
  const finalHundredths = op2Mul ? afterOp1Hundredths * 10 : afterOp1Hundredths / 10;
  const afterOp1Text = fromHundredths(afterOp1Hundredths);
  const resultText = fromHundredths(finalHundredths);

  const stem = `${baseText} ${op1Mul ? '×' : '÷'} 10 ${op2Mul ? '×' : '÷'} 10 = ?`;

  const distractors = [];
  // stopped after the first slide
  distractors.push({ text: afterOp1Text, misconception: 'forgot-second-slide' });
  // treated both slides as going the same way as the first operation
  const sameDirHundredths = op1Mul ? baseHundredths * 100 : baseHundredths / 100;
  distractors.push({ text: fromHundredths(sameDirHundredths), misconception: 'both-as-first-direction' });
  // both slides went the wrong way (× swapped for ÷ and vice versa, throughout) — NOTE: when the
  // two real ops are opposite directions (they cancel), this mirror also cancels and lands back
  // on the correct answer, so it gets deduped away by makeMcq; the fourth candidate below covers
  // that case so the option count never comes up short.
  const wrongOp1Hundredths = op1Mul ? baseHundredths / 10 : baseHundredths * 10;
  const wrongFinalHundredths = op2Mul ? wrongOp1Hundredths / 10 : wrongOp1Hundredths * 10;
  distractors.push({ text: fromHundredths(wrongFinalHundredths), misconception: 'both-wrong-way' });
  // got only the FIRST operation's direction wrong, then applied the second correctly
  const secondSlideFromWrongFirst = op2Mul ? wrongOp1Hundredths * 10 : wrongOp1Hundredths / 10;
  distractors.push({ text: fromHundredths(secondSlideFromWrongFirst), misconception: 'first-op-wrong-way' });

  const correct = { text: resultText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { rng, correctHundredths: finalHundredths, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'forgot-second-slide') whyWrong[o.text] = 'You stopped after the first slide! There are TWO operations here — keep going.';
    else if (o.misconception === 'both-as-first-direction') whyWrong[o.text] = 'That treats both slides as going the same way — check each operation’s own direction.';
    else if (o.misconception === 'both-wrong-way' || o.misconception === 'first-op-wrong-way') whyWrong[o.text] = 'One of those slides went the wrong way — × slides LEFT, ÷ slides RIGHT. Check each operation on its own.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Count how many thrones the digits actually slid, and which way, for EACH operation.';
  }

  return {
    templateId: 'dec-t2-chain-two-slides',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Do the operations one at a time, left to right — slide for the first one, then slide again for the second.',
      '× 10 slides LEFT. ÷ 10 slides RIGHT. Two operations means two slides.',
    ],
    explain: {
      rule: RULE,
      worked: `${baseText} ${op1Mul ? '×' : '÷'} 10 → ${afterOp1Text} (slide ${op1Mul ? 'left' : 'right'}). Then ${afterOp1Text} ${op2Mul ? '×' : '÷'} 10 → ${resultText} (slide ${op2Mul ? 'left' : 'right'}).`,
      whyWrong,
    },
  };
}

// Fix (CRITICAL, bracket tell): the old distractor set always left the correct factor sandwiched
// in the middle after padding (proven 1338/1338 — never min, never max). Build 3 alternative
// distractor pools per factor and pick one via rng, so which position (min/mid/max) the correct
// answer lands in varies across generations and carries no signal.
function missingOpDistractorPool(rng, factor) {
  // Each shape returns exactly 4 distractors (so the 5-option minimum is met WITHOUT falling
  // through to makeMcq's generic pad — that generic pad would add an extra value from a fixed
  // list and could silently displace the correct answer from the min/max position the shape
  // intends, undoing the whole point of varying position).
  const shape = rngInt(rng, 0, 2);
  if (factor === 10) {
    // Shape 0: {1, 10(correct), 100, 1000} — correct sits in the middle.
    // Shape 1: {10(correct), 100, 1000, 10000} — correct is the MIN.
    // Shape 2: {1, 2, 5, 10(correct)} — a smaller-only set where correct is the MAX.
    if (shape === 0) return [1, 100, 1000, 10000].map((f) => ({ text: String(f), misconception: 'wrong-number-of-slides' }));
    if (shape === 1) return [100, 1000, 10000, 100000].map((f) => ({ text: String(f), misconception: 'wrong-number-of-slides' }));
    return [1, 2, 5, 3].map((f) => ({ text: String(f), misconception: 'wrong-number-of-slides' }));
  }
  // factor === 100
  // Shape 0: {10, 100(correct), 1000, 10000} — correct sits in the middle.
  // Shape 1: {1, 5, 10, 100(correct)} — correct is the MAX.
  // Shape 2: {100(correct), 1000, 10000, 100000} — a heavier set where correct is the MIN.
  if (shape === 0) return [10, 1000, 10000, 100000].map((f) => ({ text: String(f), misconception: 'wrong-number-of-slides' }));
  if (shape === 1) return [1, 5, 10, 20].map((f) => ({ text: String(f), misconception: 'wrong-number-of-slides' }));
  return [1000, 10000, 100000, 1000000].map((f) => ({ text: String(f), misconception: 'wrong-number-of-slides' }));
}

function t2MissingOp(rng) {
  // "3.7 x ___ = 370"
  const factor = pick(rng, [10, 100]);
  const baseTenths = rngInt(rng, 11, 99); // e.g. 3.7 -> tenths repr
  const baseHundredths = baseTenths * 10;
  const baseText = fromHundredths(baseHundredths);
  const resultHundredths = baseHundredths * factor;
  const resultText = fromHundredths(resultHundredths);
  const stem = `${baseText} × ___ = ${resultText}`;

  const distractors = missingOpDistractorPool(rng, factor);

  const correct = { text: String(factor), misconception: null };
  // n=4: the pool always ships exactly 4 distinct-from-correct distractors already engineered to
  // land the correct answer in the intended min/mid/max position — taking fewer via slice(0,3)
  // would silently reintroduce the generic pad (see comment on missingOpDistractorPool).
  const options = makeMcq(correct, shuffle(rng, distractors), 4, { min: 5 });

  // This template's answer is a bare multiplier (power of 10), not a decimal amount, so the
  // generic decimal padder doesn't fit — pad with other plausible slide-count multipliers instead.
  if (options.length < 5) {
    const seen = new Set(options.map((o) => o.text));
    for (const f of [1, 2, 5, 10, 100, 1000, 10000, 100000]) {
      if (options.length >= 5) break;
      const text = String(f);
      if (seen.has(text)) continue;
      seen.add(text);
      options.push({ text, misconception: 'padded-near-miss' });
    }
  }

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-number-of-slides' || o.misconception === 'off-by-one-slide') {
      whyWrong[o.text] = 'Count how many thrones the digits actually slid — that tells you the true multiplier.';
    } else if (o.misconception === 'padded-near-miss') {
      whyWrong[o.text] = 'Count how many thrones the digits actually slid — that tells you the true multiplier.';
    }
  }

  return {
    templateId: 'dec-t2-missing-op',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Compare ${baseText} and ${resultText} — how many thrones did the digits slide to the left?`,
      'Each slide is one ×10. Count the slides to find the missing number.',
    ],
    explain: {
      rule: RULE,
      worked: `${baseText} needs its digits to slide ${factor === 10 ? 'one throne' : 'two thrones'} left to reach ${resultText}, so the missing number is ${factor}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num) --------

function t3Times100(rng) {
  // 3.45 x 100 style
  const wholePart = rngInt(rng, 1, 99);
  const hundredths = rngInt(rng, 1, 99);
  const baseHundredths = wholePart * 100 + hundredths;
  const baseText = fromHundredths(baseHundredths);
  const resultHundredths = baseHundredths * 100;
  const resultText = fromHundredths(resultHundredths);
  const stem = `${baseText} × 100 = ?`;

  return {
    templateId: 'dec-t3-times-100',
    stem,
    format: 'num',
    accept: [resultText],
    hintSteps: [
      '× 100 means 2 slides to the left. The point never moves.',
      `Slide every digit in ${baseText} two thrones left.`,
    ],
    explain: {
      rule: RULE,
      worked: `${baseText} × 100 → 2 slides left → ${resultText}.`,
      whyWrong: {},
    },
  };
}

function t3DivideWriteIn(rng) {
  // ÷10 or ÷100 only for T3 write-ins, e.g. 62÷100=0.62
  const factor = pick(rng, [10, 100]);
  let base;
  if (factor === 10) base = rngInt(rng, 2, 99);
  else base = rngInt(rng, 2, 99); // e.g. 62 ÷ 100 = 0.62 (2dp), always fine since base is whole 2-digit-ish
  const baseHundredths = base * 100;
  const resultHundredths = baseHundredths / factor;
  const resultText = fromHundredths(resultHundredths);
  const stem = `${base} ÷ ${factor} = ?`;

  return {
    templateId: 'dec-t3-divide-writein',
    stem,
    format: 'num',
    accept: [resultText],
    hintSteps: [
      `÷ ${factor} means ${factor === 10 ? '1 slide' : '2 slides'} to the RIGHT.`,
      'Remember the seat-warmer zero: a decimal less than 1 must start "0." — never just ".62".',
    ],
    explain: {
      rule: RULE,
      worked: `${base} ÷ ${factor} → digits slide right → ${resultText}. The seat-warmer zero guards the front: write ${resultText}, not ${resultText.replace(/^0/, '')}.`,
      whyWrong: {},
    },
  };
}

function t3RealLifeMetres(rng) {
  // "1.75 m = ___ cm" style ONLY with x100
  const wholeM = rngInt(rng, 1, 9);
  const cmPart = rngInt(rng, 1, 99);
  const baseHundredths = wholeM * 100 + cmPart;
  const baseText = fromHundredths(baseHundredths);
  const resultHundredths = baseHundredths * 100;
  const resultCm = Math.round(resultHundredths / 100); // whole cm, since x100 clears the /100 metres->cm
  const stem = `${baseText} m = ___ cm`;

  return {
    templateId: 'dec-t3-metres-cm',
    stem,
    format: 'num',
    accept: [String(resultCm)],
    unit: 'cm',
    hintSteps: [
      'There are 100 cm in a metre, so metres → centimetres means × 100 — 2 slides left.',
      `Slide every digit in ${baseText} two thrones left to get the number of centimetres.`,
    ],
    explain: {
      rule: RULE,
      worked: `${baseText} m × 100 = ${resultCm} cm.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1TimesOrDivideBy10, t1WhichDigitTenths, t1TenTimesWords];
const T2 = [t2Times100Or1000, t2ChainTwoOps, t2MissingOp];
const T3 = [t3Times100, t3DivideWriteIn, t3RealLifeMetres];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `dec-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'decimals-x10',
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
