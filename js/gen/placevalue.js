// FART QUEST — GEN agent
// Topic: place-value (Place Value Palace). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Every digit sits on a throne. The THRONE tells you what the digit is worth.';

// Format a whole number with UK thousands commas.
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// Value of a digit at a given place index (0=units,1=tens,2=hundreds,3=thousands,4=ten-thousands)
const PLACE_NAMES = ['Units', 'Tens', 'Hundreds', 'Thousands', 'Ten Thousands'];

function digitsOf(n) {
  // returns array of digit chars, index 0 = units, ascending place value
  const s = String(Math.round(n));
  const out = [];
  for (let i = s.length - 1; i >= 0; i--) out.push(s[i]);
  return out;
}

function valueAtPlace(n, placeIdx) {
  const digs = digitsOf(n);
  const d = Number(digs[placeIdx] || '0');
  return d * Math.pow(10, placeIdx);
}

function uniqueOptions(correctText, candidates) {
  // candidates: array of {text, misconception}; dedupe against correct and each other
  const seen = new Set([correctText]);
  const out = [];
  for (const c of candidates) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Generic numeric padding source for placevalue: same digit re-seated on other thrones
// (×10 / ÷10 of correct, digit×1, digit×10000), or correct ± one throne value.
// correctVal must be the underlying number (pre-formatting) that correctText represents.
function padDistractorCandidates(correctVal, digit) {
  const candidates = [];
  if (Number.isFinite(digit)) {
    candidates.push(digit); // digit×1
    candidates.push(digit * 10000); // digit×10000
  }
  candidates.push(correctVal * 10, correctVal / 10); // other thrones (×10/÷10 slip)
  candidates.push(correctVal + Math.pow(10, 1), correctVal - Math.pow(10, 1)); // ± one throne (tens)
  candidates.push(correctVal + Math.pow(10, 2), correctVal - Math.pow(10, 2)); // ± one throne (hundreds)
  return candidates
    .filter((v) => Number.isFinite(v) && Number.isInteger(v) && v >= 0)
    .map((v) => ({ text: fmt(v), misconception: 'padded-place-shift' }));
}

// Ensure at least `min` total options (correct + distractors). Pads with plausible
// place-value-flavoured distractors (never random garbage) if dedup left us short.
function makeMcq(correct, distractorPool, rng, n = 3, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  const min = opts.min || n + 1;
  if (options.length < min) {
    const correctVal = Number(String(correct.text).replace(/,/g, ''));
    const digit = opts.digit;
    const padCandidates = shuffle(rng, padDistractorCandidates(correctVal, digit));
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

function t1ValueOfDigit(rng) {
  // 3-4 digit N, pick a non-zero digit D, ask its value.
  const digitCount = pick(rng, [3, 4]);
  let n;
  do {
    n = rngInt(rng, digitCount === 3 ? 100 : 1000, digitCount === 3 ? 999 : 9999);
  } while (String(n).length !== digitCount);
  const digs = digitsOf(n);
  // choose a place index with a non-zero digit, prefer not the leading digit sometimes but any is fine
  const nonZeroPlaces = digs.map((d, i) => ({ d, i })).filter((x) => x.d !== '0');
  const chosen = pick(rng, nonZeroPlaces);
  const placeIdx = chosen.i;
  const digit = Number(chosen.d);
  const correctVal = digit * Math.pow(10, placeIdx);
  const correctText = fmt(correctVal);

  const stem = `What is the <b>${digit}</b> worth in ${fmt(n)}?`;

  const distractors = [];
  // bare digit
  distractors.push({ text: fmt(digit), misconception: 'digit-only' });
  // wrong throne: one place too far right (÷10) if possible
  if (placeIdx > 0) {
    distractors.push({ text: fmt(digit * Math.pow(10, placeIdx - 1)), misconception: 'wrong-throne' });
  }
  // wrong throne: one place too far left (×10)
  distractors.push({ text: fmt(digit * Math.pow(10, placeIdx + 1)), misconception: 'wrong-throne' });
  // value x10 slip (extra zero tacked on beyond correct, distinct from above if placeIdx+1 clashes)
  distractors.push({ text: fmt(correctVal * 10), misconception: 'value-times-10-slip' });

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { digit });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'digit-only') whyWrong[o.text] = 'That’s the digit in its disguise — but its throne makes it bigger!';
    else if (o.misconception === 'wrong-throne') whyWrong[o.text] = 'That’s a different throne — count the seats from the right again.';
    else if (o.misconception === 'value-times-10-slip') whyWrong[o.text] = 'That’s ten times too big — the throne only counts once.';
    else if (o.misconception === 'padded-place-shift') whyWrong[o.text] = 'Check which throne the digit sits on — count the seats from the right.';
  }

  return {
    templateId: 'pv-t1-value-of-digit',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the ${digit}, then look at WHICH THRONE it’s sitting on. Count the seats from the right: Units, Tens, Hundreds…`,
      `The ${digit} is on the ${PLACE_NAMES[placeIdx]} throne. So it’s worth ${digit} × ${Math.pow(10, placeIdx)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `In ${fmt(n)} the ${digit} sits on the ${PLACE_NAMES[placeIdx]} throne. ${digit} × ${Math.pow(10, placeIdx)} = ${correctText}.`,
      whyWrong,
    },
  };
}

function t1WhichDigitInPlace(rng) {
  // which digit is in the H/T/U place of N
  const placeIdx = pick(rng, [0, 1, 2]); // units, tens, hundreds
  const placeName = PLACE_NAMES[placeIdx];
  const n = rngInt(rng, 100, 999);
  const digs = digitsOf(n);
  const correctDigit = digs[placeIdx];
  const stem = `Which digit is in the <b>${placeName}</b> place in ${fmt(n)}?`;

  const distractorDigits = [];
  const otherPlaces = [0, 1, 2].filter((i) => i !== placeIdx);
  for (const p of otherPlaces) {
    distractorDigits.push({ text: digs[p], misconception: 'wrong-throne' });
  }
  // an entirely unrelated digit not present as a decoy for guessing
  const usedDigits = new Set(digs);
  let extra = String(rngInt(rng, 0, 9));
  let tries = 0;
  while ((usedDigits.has(extra) || extra === correctDigit) && tries < 20) {
    extra = String(rngInt(rng, 0, 9));
    tries++;
  }
  distractorDigits.push({ text: extra, misconception: 'not-present' });

  const correct = { text: correctDigit, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractorDigits), rng, 3);

  // Pad with unused single-digit "not-present" decoys if dedup left us short (single-digit
  // numbers give few distinct digits to draw from, so the standard numeric padder doesn't apply here).
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
    if (o.misconception === 'wrong-throne') whyWrong[o.text] = 'That digit is sitting on a different throne — check the place name again.';
    else if (o.misconception === 'not-present') whyWrong[o.text] = 'That digit isn’t even in the number!';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check which throne the digit sits on — count the seats from the right.';
  }

  return {
    templateId: 'pv-t1-which-digit',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Write out the thrones from the right: Units, Tens, Hundreds. Find the ${placeName} seat.`,
      `Which digit is sitting there in ${fmt(n)}?`,
    ],
    explain: {
      rule: RULE,
      worked: `In ${fmt(n)}, the ${placeName} throne holds the digit ${correctDigit}.`,
      whyWrong,
    },
  };
}

function t1FiveNumbersTensDigit(rng) {
  // which of 5 numbers has D in the tens place
  const targetDigit = rngInt(rng, 1, 9);
  const correctN = rngInt(rng, 1, 9) * 100 + targetDigit * 10 + rngInt(rng, 0, 9);
  const correctText = fmt(correctN);

  const distractors = [];
  const seenNums = new Set([correctN]);
  while (distractors.length < 4) {
    // build numbers where tens digit is NOT targetDigit
    const h = rngInt(rng, 1, 9);
    let t = rngInt(rng, 0, 9);
    if (t === targetDigit) t = (t + 1) % 10;
    const u = rngInt(rng, 0, 9);
    const val = h * 100 + t * 10 + u;
    if (seenNums.has(val)) continue;
    seenNums.add(val);
    distractors.push({ text: fmt(val), misconception: 'wrong-throne' });
  }

  const stem = `Which of these numbers has <b>${targetDigit}</b> in the Tens place?`;
  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, distractors, rng, 3);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-throne') whyWrong[o.text] = 'Check the Tens throne carefully — that digit lives somewhere else in this number.';
  }

  return {
    templateId: 'pv-t1-five-numbers-tens',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Look at each number and find its Tens throne (the second digit from the right).',
      `Which number has ${targetDigit} sitting there?`,
    ],
    explain: {
      rule: RULE,
      worked: `${correctText} has ${targetDigit} on the Tens throne.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2Partition(rng) {
  // 4-5 digit N with comma formatting; partition recompose "4000+300+20+9 = ?"
  const digitCount = pick(rng, [4, 5]);
  let n;
  do {
    n = rngInt(rng, digitCount === 4 ? 1000 : 10000, digitCount === 4 ? 9999 : 99999);
  } while (String(n).length !== digitCount);
  const digs = digitsOf(n); // index0 = units ascending
  const parts = [];
  for (let i = digs.length - 1; i >= 0; i--) {
    const d = Number(digs[i]);
    if (d === 0) continue;
    parts.push(d * Math.pow(10, i));
  }
  const stem = `${parts.map((p) => fmt(p)).join(' + ')} = ?`;
  const correctText = fmt(n);

  const distractors = [];
  // off by one on a place (common slip: mis-add one part)
  distractors.push({ text: fmt(n + Math.pow(10, digitCount - 1)), misconception: 'misplaced-part' });
  distractors.push({ text: fmt(n - Math.pow(10, 1)), misconception: 'dropped-place' });
  // digits jumbled (reverse order reading)
  const reversedStr = digs.slice().reverse().join(''); // this actually reproduces original order oddly; build a genuinely different jumble
  const jumbled = digs.slice().join(''); // units..leading reversed = same as n string reversed
  let jumbledNum = Number(jumbled);
  if (jumbledNum === n || String(jumbledNum).length !== digitCount) jumbledNum = n + Math.pow(10, digitCount - 2);
  distractors.push({ text: fmt(jumbledNum), misconception: 'digits-jumbled' });

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'misplaced-part') whyWrong[o.text] = 'One part landed on the wrong throne — check each place carefully.';
    else if (o.misconception === 'dropped-place') whyWrong[o.text] = 'A throne got missed out when recombining the parts.';
    else if (o.misconception === 'digits-jumbled') whyWrong[o.text] = 'The digits ended up on the wrong thrones — rebuild it place by place.';
    else if (o.misconception === 'padded-place-shift') whyWrong[o.text] = 'Check which throne the digit sits on — count the seats from the right.';
  }

  return {
    templateId: 'pv-t2-partition',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Line up each part by its throne: thousands, hundreds, tens, units.',
      'Add the parts together, one throne at a time, and write the total.',
    ],
    explain: {
      rule: RULE,
      worked: `${parts.map((p) => fmt(p)).join(' + ')} = ${correctText}.`,
      whyWrong,
    },
  };
}

function t2LargestSmallest(rng) {
  // largest/smallest of 5 digit-swapped numbers
  const wantLargest = rng() < 0.5;
  const baseDigits = [];
  for (let i = 0; i < 4; i++) baseDigits.push(rngInt(rng, i === 0 ? 1 : 0, 9));
  // ensure not all same
  if (new Set(baseDigits).size === 1) baseDigits[1] = (baseDigits[1] + 3) % 10;

  const perms = new Set();
  const nums = [];
  let tries = 0;
  while (nums.length < 5 && tries < 200) {
    tries++;
    const shuffled = shuffle(rng, baseDigits);
    if (shuffled[0] === 0) continue; // no leading zero
    const key = shuffled.join('');
    if (perms.has(key)) continue;
    perms.add(key);
    nums.push(Number(key));
  }
  // pad with derived numbers if not enough uniques
  while (nums.length < 5) {
    const candidate = nums[0] + nums.length;
    if (!perms.has(String(candidate))) {
      perms.add(String(candidate));
      nums.push(candidate);
    } else break;
  }

  const sorted = [...nums].sort((a, b) => a - b);
  const answer = wantLargest ? sorted[sorted.length - 1] : sorted[0];
  const wrongPick = wantLargest ? sorted[0] : sorted[sorted.length - 1];
  const stem = `Which of these numbers is the <b>${wantLargest ? 'largest' : 'smallest'}</b>?`;

  const options = nums.map((num) => ({
    text: fmt(num),
    misconception: num === answer ? null : (num === wrongPick ? 'opposite-extreme' : 'middle-value'),
  }));
  const correctIndex = options.findIndex((o) => o.misconception === null);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'opposite-extreme') whyWrong[o.text] = `That’s actually the ${wantLargest ? 'smallest' : 'largest'} — compare thrones from the LEFT.`;
    else if (o.misconception === 'middle-value') whyWrong[o.text] = 'Close, but another number has a bigger digit on a throne further left.';
  }

  return {
    templateId: 'pv-t2-largest-smallest',
    stem,
    options,
    correctIndex,
    hintSteps: [
      'Compare the numbers one throne at a time, starting from the LEFT (the biggest throne).',
      `Which number wins first on the leftmost throne where they differ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Comparing from the left throne, ${fmt(answer)} is the ${wantLargest ? 'largest' : 'smallest'}.`,
      whyWrong,
    },
  };
}

function t2ValueOfDigitLarge(rng) {
  // "the 7 in 37,410 is worth ___"
  const digitCount = pick(rng, [4, 5]);
  let n;
  do {
    n = rngInt(rng, digitCount === 4 ? 1000 : 10000, digitCount === 4 ? 9999 : 99999);
  } while (String(n).length !== digitCount);
  const digs = digitsOf(n);
  const nonZeroPlaces = digs.map((d, i) => ({ d, i })).filter((x) => x.d !== '0');
  const chosen = pick(rng, nonZeroPlaces);
  const placeIdx = chosen.i;
  const digit = Number(chosen.d);
  const correctVal = digit * Math.pow(10, placeIdx);
  const correctText = fmt(correctVal);

  const stem = `The <b>${digit}</b> in ${fmt(n)} is worth ___`;

  const distractors = [];
  distractors.push({ text: fmt(digit), misconception: 'digit-only' });
  if (placeIdx > 0) distractors.push({ text: fmt(digit * Math.pow(10, placeIdx - 1)), misconception: 'wrong-throne' });
  distractors.push({ text: fmt(digit * Math.pow(10, placeIdx + 1)), misconception: 'wrong-throne' });
  distractors.push({ text: fmt(correctVal * 10), misconception: 'value-times-10-slip' });

  const correct = { text: correctText, misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { digit });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'digit-only') whyWrong[o.text] = 'That’s the digit itself — its throne makes it worth more!';
    else if (o.misconception === 'wrong-throne') whyWrong[o.text] = 'That’s a neighbouring throne — count the seats again from the right.';
    else if (o.misconception === 'value-times-10-slip') whyWrong[o.text] = 'Ten times too big — the throne only counts once.';
    else if (o.misconception === 'padded-place-shift') whyWrong[o.text] = 'Check which throne the digit sits on — count the seats from the right.';
  }

  return {
    templateId: 'pv-t2-value-large',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the ${digit} in ${fmt(n)} and count its throne from the right.`,
      `It sits on the ${PLACE_NAMES[placeIdx]} throne: ${digit} × ${Math.pow(10, placeIdx)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `The ${digit} in ${fmt(n)} sits on the ${PLACE_NAMES[placeIdx]} throne, worth ${correctText}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num format) --------

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numberToWords(n) {
  if (n === 0) return 'zero';
  function threeDigits(x) {
    let s = '';
    const h = Math.floor(x / 100);
    const rem = x % 100;
    if (h > 0) s += `${ONES[h]} hundred`;
    if (rem > 0) {
      if (h > 0) s += ' and ';
      if (rem < 20) s += ONES[rem];
      else {
        const t = Math.floor(rem / 10);
        const o = rem % 10;
        s += TENS[t] + (o > 0 ? `-${ONES[o]}` : '');
      }
    }
    return s;
  }
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  let s = '';
  if (thousands > 0) {
    s += `${threeDigits(thousands)} thousand`;
    if (rest > 0) {
      if (rest < 100) s += ' and ';
      else s += ' ';
      s += threeDigits(rest);
    }
  } else {
    s += threeDigits(rest);
  }
  return s;
}

function t3WriteInFigures(rng) {
  // Bank of templated wordings across thousands/hundreds incl. zero-tens traps.
  // Generate N with a mandatory "empty throne" (zero somewhere in the middle) to create the seat-warmer trap.
  const trapType = pick(rng, ['zero-hundreds', 'zero-tens', 'zero-both']);
  let thousands = rngInt(rng, 1, 9);
  let hundreds, tens, units;
  if (trapType === 'zero-hundreds') {
    hundreds = 0;
    tens = rngInt(rng, 1, 9);
    units = rngInt(rng, 0, 9);
  } else if (trapType === 'zero-tens') {
    hundreds = rngInt(rng, 1, 9);
    tens = 0;
    units = rngInt(rng, 1, 9);
  } else {
    hundreds = 0;
    tens = 0;
    units = rngInt(rng, 1, 9);
  }
  const n = thousands * 1000 + hundreds * 100 + tens * 10 + units;
  const words = numberToWords(n);
  const capitalised = words.charAt(0).toUpperCase() + words.slice(1);
  const stem = `Write in figures: <b>${capitalised}</b>`;
  const correctText = String(n);

  return {
    templateId: 'pv-t3-write-figures',
    stem,
    format: 'num',
    accept: [correctText, fmt(n)],
    hintSteps: [
      'Build it throne by throne: thousands, hundreds, tens, units. If a throne isn’t mentioned in the words, its digit is ZERO — the seat-warmer.',
      `Thousands: ${thousands}. Hundreds: ${hundreds}. Tens: ${tens}. Units: ${units}. Put them together.`,
    ],
    explain: {
      rule: RULE,
      worked: `${capitalised} → Thousands ${thousands}, Hundreds ${hundreds}, Tens ${tens}, Units ${units} → ${fmt(n)}.`,
      whyWrong: {},
    },
  };
}

function t3ValueOfDigitAsNumber(rng) {
  // value of digit as a number ("what is the 8 worth in 28,514" -> 8000)
  const digitCount = pick(rng, [4, 5]);
  let n;
  do {
    n = rngInt(rng, digitCount === 4 ? 1000 : 10000, digitCount === 4 ? 9999 : 99999);
  } while (String(n).length !== digitCount);
  const digs = digitsOf(n);
  const nonZeroPlaces = digs.map((d, i) => ({ d, i })).filter((x) => x.d !== '0');
  const chosen = pick(rng, nonZeroPlaces);
  const placeIdx = chosen.i;
  const digit = Number(chosen.d);
  const correctVal = digit * Math.pow(10, placeIdx);
  const stem = `What is the <b>${digit}</b> worth in ${fmt(n)}?`;

  return {
    templateId: 'pv-t3-value-of-digit',
    stem,
    format: 'num',
    accept: [String(correctVal), fmt(correctVal)],
    hintSteps: [
      `Find the ${digit} in ${fmt(n)} and count its throne from the right.`,
      `It sits on the ${PLACE_NAMES[placeIdx]} throne: ${digit} × ${Math.pow(10, placeIdx)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `The ${digit} in ${fmt(n)} sits on the ${PLACE_NAMES[placeIdx]} throne, worth ${fmt(correctVal)}.`,
      whyWrong: {},
    },
  };
}

function t3MakeLargest(rng) {
  // make the largest number from digits [list] (accept single answer)
  const digitCount = pick(rng, [3, 4]);
  const digitsList = [];
  for (let i = 0; i < digitCount; i++) digitsList.push(rngInt(rng, 0, 9));
  // ensure at least one non-zero so a valid leading digit exists
  if (digitsList.every((d) => d === 0)) digitsList[0] = rngInt(rng, 1, 9);

  const sorted = [...digitsList].sort((a, b) => b - a);
  // if the largest digit is 0 (all zero, already handled) skip; build largest number string
  const largestStr = sorted.join('');
  const largestNum = Number(largestStr);
  const stem = `Using the digits <b>${digitsList.join(', ')}</b> (each once), make the LARGEST number you can.`;

  return {
    templateId: 'pv-t3-make-largest',
    stem,
    format: 'num',
    accept: [String(largestNum), fmt(largestNum)],
    hintSteps: [
      'To make the biggest number, put the biggest digit on the leftmost (biggest) throne.',
      'Then place the rest in order, largest to smallest, throne by throne.',
    ],
    explain: {
      rule: RULE,
      worked: `Ordering the digits largest to smallest gives ${fmt(largestNum)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ValueOfDigit, t1WhichDigitInPlace, t1FiveNumbersTensDigit];
const T2 = [t2Partition, t2LargestSmallest, t2ValueOfDigitLarge];
const T3 = [t3WriteInFigures, t3ValueOfDigitAsNumber, t3MakeLargest];

export function generate(tier, rng) {
  let templateFn, pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `pv-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'place-value',
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
