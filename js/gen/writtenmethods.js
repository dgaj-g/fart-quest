// FART QUEST — GEN agent
// Topic: written-methods (The Written-Methods Wallow). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Line up the columns by throne, work right to left, and carry like a hero.';

// -------- single number formatter (whole numbers, UK commas, no float junk) --------
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
// Money formatter: always 2dp, £ prefix.
function fmtMoney(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}
// Decimal formatter for non-money ÷-whole results: always exactly 1dp (our T3 decimal
// templates only ever construct genuine-1dp values, so this never produces float junk).
function fmtDec1(tenths) {
  return (tenths / 10).toFixed(1);
}

// -------- shared digit helpers --------
function digitAt(n, place) {
  return Math.floor(n / Math.pow(10, place)) % 10;
}

// Simulates real column addition (with carry propagation) — used only to build the CORRECT
// answer's carry map for teaching text; the actual sum is always plain a+b (verified independent
// of this by the test harness), this just also reports which columns carried.
function simulateAddCarries(a, b, digitCount) {
  let carry = 0;
  const carries = [];
  for (let i = 0; i < digitCount; i++) {
    const s = digitAt(a, i) + digitAt(b, i) + carry;
    carry = s >= 10 ? 1 : 0;
    carries.push(carry);
  }
  return carries;
}

// The "dropped carry" misconception: each column computed as (da+db) mod 10, with the carry
// from the PREVIOUS column never added in — i.e. every column is done in total isolation.
function addNoCarry(a, b, digitCount) {
  let total = 0;
  for (let i = 0; i < digitCount; i++) {
    const d = (digitAt(a, i) + digitAt(b, i)) % 10;
    total += d * Math.pow(10, i);
  }
  return total;
}

// The "misaligned columns" misconception: the shorter number's digits are lined up against
// the LEFT of the longer number instead of the right (i.e. as if it had been shifted one throne
// too far left) — modelled by multiplying the shorter addend by 10 before adding.
function addMisaligned(a, b) {
  return a + b * 10;
}

function simulateSubBorrows(a, b, digitCount) {
  let borrow = 0;
  const borrows = [];
  for (let i = 0; i < digitCount; i++) {
    let da = digitAt(a, i) - borrow;
    const db = digitAt(b, i);
    let borrowOut = 0;
    if (da < db) { da += 10; borrowOut = 1; }
    borrows.push(borrowOut);
    borrow = borrowOut;
  }
  return borrows;
}

// The "no borrow" misconception: each column does abs(top-bottom) regardless of which is
// bigger — the classic "always subtract smaller from bigger" slip.
function subNoBorrow(a, b, digitCount) {
  let total = 0;
  for (let i = 0; i < digitCount; i++) {
    const d = Math.abs(digitAt(a, i) - digitAt(b, i));
    total += d * Math.pow(10, i);
  }
  return total;
}

// Swap the two rightmost digits of a whole number (a "digit-swap" transcription slip).
function swapLastTwoDigits(n) {
  const s = String(Math.round(n));
  if (s.length < 2) return n;
  const swapped = s.slice(0, -2) + s[s.length - 1] + s[s.length - 2];
  return Number(swapped);
}

// Digit-swap distractor that is GUARANTEED distinct from the correct value — swapping the last
// two digits is a no-op whenever they're equal (e.g. 22, 133) or the number is single-digit,
// which would otherwise silently reproduce the correct answer and starve the option count once
// dedup strips it. Falls back to a fixed +9 offset (never 0, so always distinct) in that case.
function distinctDigitSwap(n) {
  const swapped = swapLastTwoDigits(n);
  return swapped !== n ? swapped : n + 9;
}

// The "dropped carry" misconception for multiplication: each digit of n multiplied by m,
// taking only the units digit of that PRODUCT (mod 10), with no carry from the previous
// column ever added in.
function multNoCarry(n, m, digitCount) {
  let total = 0;
  for (let i = 0; i < digitCount; i++) {
    const d = (digitAt(n, i) * m) % 10;
    total += d * Math.pow(10, i);
  }
  return total;
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

// Generic numeric padding source (near-miss values themed to the topic: ±10, ±100, digit-swap).
function padDistractorCandidates(correctVal) {
  const candidates = [correctVal + 10, correctVal - 10, correctVal + 100, correctVal - 100, swapLastTwoDigits(correctVal)];
  return candidates
    .filter((v) => Number.isFinite(v) && Number.isInteger(v) && v >= 0)
    .map((v) => ({ text: fmt(v), misconception: 'padded-near-miss' }));
}

// Ensure at least `min` total options (correct + distractors). Pads with plausible
// column-themed near-misses if dedup left us short.
function makeMcq(correct, distractorPool, rng, n, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  const min = opts.min || n + 1;
  if (options.length < min) {
    const correctVal = opts.correctVal !== undefined ? opts.correctVal : Number(String(correct.text).replace(/[£,]/g, ''));
    const padCandidates = shuffle(rng, padDistractorCandidates(correctVal));
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

const WHY_WRONG_TEXT = {
  'dropped-carry': 'The carries got dropped — each throne was added on its own, with none of the leftover tens marched over.',
  'place-value-slip': 'That’s ten (or a hundred) out — recheck which throne the carry landed on.',
  'digit-swap': 'Two digits landed on the wrong thrones — recount which throne holds which place.',
  'misaligned-columns': 'The shorter number got lined up against the wrong end — always line up the UNITS columns on the right, whatever the length.',
  'no-borrow': 'That’s each column done the wrong way round (bigger take away smaller) — when the TOP digit is smaller, you must borrow, not flip it.',
  'padded-near-miss': 'Redo it column by column, throne by throne, and check every carry (or borrow) along the way.',
  'wrong-multiplier': 'Check the multiplier — that’s not quite the right number of times.',
};

// -------- T1 templates (column addition / subtraction) --------

function t1ColumnAdd(rng) {
  const digitCount = pick(rng, [2, 3]);
  const min = digitCount === 2 ? 11 : 101;
  const max = digitCount === 2 ? 98 : 989;
  let a, b, carries;
  let tries = 0;
  do {
    a = rngInt(rng, min, max);
    b = rngInt(rng, min, max);
    carries = simulateAddCarries(a, b, digitCount);
    tries++;
  } while (!carries.some(Boolean) && tries < 100);

  const answer = a + b;
  const stem = `Add these using the column method: <b>${fmt(a)} + ${fmt(b)}</b>`;

  const distractors = [
    { text: fmt(addNoCarry(a, b, digitCount)), misconception: 'dropped-carry' },
    { text: fmt(answer - 10), misconception: 'place-value-slip' },
    { text: fmt(distinctDigitSwap(answer)), misconception: 'digit-swap' },
  ];

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { correctVal: answer, min: 4 });

  const whyWrong = {};
  for (const o of options) if (o.misconception && WHY_WRONG_TEXT[o.misconception]) whyWrong[o.text] = WHY_WRONG_TEXT[o.misconception];

  return {
    templateId: 'wm-t1-column-add',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Start on the Units throne (the one on the right). Add those two digits — is the total 10 or more?',
      'If a column adds to 10 or more, write the units digit and carry the ten to the NEXT throne left. Work all the way to the last throne.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(a)} + ${fmt(b)} = ${fmt(answer)}, carrying a ten wherever a column reaches 10 or more.`,
      whyWrong,
    },
  };
}

function t1MixedLengthAdd(rng) {
  // Different-length addends — the misalignment trap.
  const a = rngInt(rng, 101, 989); // 3-digit
  const b = rngInt(rng, 11, 89); // 2-digit
  const answer = a + b;
  const stem = `Add these using the column method: <b>${fmt(a)} + ${fmt(b)}</b>`;

  const distractors = [
    { text: fmt(addMisaligned(a, b)), misconception: 'misaligned-columns' },
    { text: fmt(addNoCarry(a, b, 3)), misconception: 'dropped-carry' },
    { text: fmt(answer - 10), misconception: 'place-value-slip' },
  ];

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { correctVal: answer, min: 4 });

  const whyWrong = {};
  for (const o of options) if (o.misconception && WHY_WRONG_TEXT[o.misconception]) whyWrong[o.text] = WHY_WRONG_TEXT[o.misconception];

  return {
    templateId: 'wm-t1-mixed-length-add',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${fmt(b)} is shorter than ${fmt(a)} — line up its UNITS digit under the units digit of ${fmt(a)}, not the leftmost digit.`,
      'With the columns correctly lined up, add right to left, carrying any ten to the next throne.',
    ],
    explain: {
      rule: RULE,
      worked: `Lined up by the units column, ${fmt(a)} + ${fmt(b)} = ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t1ColumnSub(rng) {
  const digitCount = pick(rng, [2, 3]);
  const min = digitCount === 2 ? 21 : 201;
  const max = digitCount === 2 ? 98 : 989;
  let a, b, borrows;
  let tries = 0;
  do {
    a = rngInt(rng, min, max);
    b = rngInt(rng, digitCount === 2 ? 11 : 101, a - 1);
    borrows = simulateSubBorrows(a, b, digitCount);
    tries++;
  } while (!borrows.some(Boolean) && tries < 100);

  const answer = a - b;
  const stem = `Subtract using the column method: <b>${fmt(a)} − ${fmt(b)}</b>`;

  // Both near-miss distractors below must never collide with the correct answer itself — for
  // small answers (e.g. answer=5) a naive answer-10-or-abs / single-digit swap can silently
  // reproduce the correct value, which dedup would then strip, starving the option count.
  const pvSlipVal = answer >= 10 ? answer - 10 : answer + 10;
  const digitSwapVal = distinctDigitSwap(answer);

  const distractors = [
    { text: fmt(subNoBorrow(a, b, digitCount)), misconception: 'no-borrow' },
    { text: fmt(pvSlipVal), misconception: 'place-value-slip' },
    { text: fmt(digitSwapVal), misconception: 'digit-swap' },
  ];

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { correctVal: answer, min: 4 });

  const whyWrong = {};
  for (const o of options) if (o.misconception && WHY_WRONG_TEXT[o.misconception]) whyWrong[o.text] = WHY_WRONG_TEXT[o.misconception];

  return {
    templateId: 'wm-t1-column-sub',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Start on the Units throne. Is the top digit big enough to take away the bottom digit? If not, borrow a ten from the throne next door.',
      'Borrowing turns the top digit into (digit + 10), and the throne it borrowed from loses one. Work all the way along.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(a)} − ${fmt(b)} = ${fmt(answer)}, borrowing a ten wherever the top digit is too small.`,
      whyWrong,
    },
  };
}

// -------- T2 templates (short multiplication / short division) --------

function t2ShortMultiplyBase(rng, digitCount, templateId) {
  const min = digitCount === 2 ? 11 : 101;
  const max = digitCount === 2 ? 89 : 899;
  const m = rngInt(rng, 2, 9);
  let n, carryHappened;
  let tries = 0;
  do {
    n = rngInt(rng, min, max);
    let carry = 0;
    carryHappened = false;
    for (let i = 0; i < digitCount; i++) {
      const p = digitAt(n, i) * m + carry;
      carry = Math.floor(p / 10);
      if (carry > 0) carryHappened = true;
    }
    tries++;
  } while (!carryHappened && tries < 100);

  const answer = n * m;
  const stem = `Multiply using short multiplication: <b>${fmt(n)} × ${m}</b>`;

  const distractors = [
    { text: fmt(multNoCarry(n, m, digitCount)), misconception: 'dropped-carry' },
    { text: fmt(answer - 10), misconception: 'place-value-slip' },
    { text: fmt(distinctDigitSwap(answer)), misconception: 'digit-swap' },
    { text: fmt(n * (m - 1) >= 0 ? n * (m - 1) : n), misconception: 'wrong-multiplier' },
  ];

  const correct = { text: fmt(answer), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 4, { correctVal: answer, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-multiplier') whyWrong[o.text] = `That’s ${fmt(n)} × ${m - 1}, one multiplication too few — check the multiplier.`;
    else if (o.misconception && WHY_WRONG_TEXT[o.misconception]) whyWrong[o.text] = WHY_WRONG_TEXT[o.misconception];
  }

  return {
    templateId,
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Start with the Units digit of ${fmt(n)}: multiply it by ${m}. Is the answer 10 or more?`,
      `Write the units digit of that product, carry the tens digit to the next throne, and ADD it in before you multiply the next digit by ${m}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(n)} × ${m} = ${fmt(answer)}, carrying forward whenever a column’s product is 10 or more.`,
      whyWrong,
    },
  };
}

function t2ShortMultiply2Digit(rng) {
  return t2ShortMultiplyBase(rng, 2, 'wm-t2-short-multiply-2d');
}

function t2ShortMultiply3Digit(rng) {
  return t2ShortMultiplyBase(rng, 3, 'wm-t2-short-multiply-3d');
}

function t2ShortDivideRemainder(rng) {
  const d = rngInt(rng, 2, 9);
  const q = rngInt(rng, 12, 89);
  const r = rngInt(rng, 1, d - 1);
  const dividend = q * d + r;
  const stem = `Divide using short division: <b>${fmt(dividend)} ÷ ${d}</b>`;
  const correctText = `${q} r ${r}`;

  // (r+1) % d is guaranteed != r for any d >= 2 (r+1 == r (mod d) would need d == 1) — no
  // "|| (d-1)" fallback needed, and one would be WRONG here: when r == d-1, (r+1)%d == 0, and
  // falling back to (d-1) would silently reproduce r itself as the "wrong" remainder.
  const wrongRemainder = (r + 1) % d;
  const swappedText = `${r} r ${q}`;
  const droppedRemainderText = `${q}`;
  const offByOneQuotient = `${q + 1} r ${r}`;

  const distractors = [
    { text: `${q} r ${wrongRemainder}`, misconception: 'remainder-slip' },
    { text: offByOneQuotient, misconception: 'quotient-slip' },
    { text: swappedText, misconception: 'swapped-qr' },
    { text: droppedRemainderText, misconception: 'dropped-remainder' },
  ];

  const correct = { text: correctText, misconception: null };
  const chosen = uniqueOptions(correct.text, shuffle(rng, distractors)).slice(0, 4);
  const options = [correct, ...chosen];
  // Pad if dedup collided (rare — remainder-themed near-misses).
  if (options.length < 5) {
    const seen = new Set(options.map((o) => o.text));
    const extra = [`${q - 1} r ${r}`, `${q} r ${r === 1 ? d - 1 : r - 1}`, `${q + 1} r ${wrongRemainder}`];
    for (const text of extra) {
      if (options.length >= 5) break;
      if (seen.has(text)) continue;
      seen.add(text);
      options.push({ text, misconception: 'padded-near-miss' });
    }
  }

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'remainder-slip') whyWrong[o.text] = 'The quotient is right but the remainder is off — recheck the final subtraction.';
    else if (o.misconception === 'quotient-slip') whyWrong[o.text] = 'One multiplication too many — the quotient is a step too high.';
    else if (o.misconception === 'swapped-qr') whyWrong[o.text] = 'The quotient and remainder swapped places — the BIG number in front is how many times it divides, the small one after "r" is what’s left over.';
    else if (o.misconception === 'dropped-remainder') whyWrong[o.text] = 'The remainder went missing — this division doesn’t divide exactly, so the leftover must be shown.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Redo the short division step by step, throne by throne, and check the final remainder.';
  }

  return {
    templateId: 'wm-t2-short-divide-remainder',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Work left to right. How many times does ${d} go into the first digit (or first two digits) of ${fmt(dividend)}?`,
      `Carry any leftover to the next digit and keep dividing by ${d}. Whatever’s left at the very end is the remainder.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(dividend)} ÷ ${d} = ${q} remainder ${r} (check: ${q} × ${d} + ${r} = ${fmt(dividend)}).`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num write-ins) --------

function t3ContextRemainderUp(rng) {
  // Containers: round UP.
  const d = rngInt(rng, 4, 9);
  const k = rngInt(rng, 15, 60);
  const r = rngInt(rng, 1, d - 1);
  const n = d * k + r;
  const nouns = [
    { item: 'pupils', container: 'minibus', containerPlural: 'minibuses', verb: 'seats' },
    { item: 'chairs', container: 'stack', containerPlural: 'stacks', verb: 'holds' },
    { item: 'cakes', container: 'box', containerPlural: 'boxes', verb: 'holds' },
    { item: 'books', container: 'shelf', containerPlural: 'shelves', verb: 'holds' },
  ];
  const scene = pick(rng, nouns);
  const answer = k + 1;
  const stem = `${fmt(n)} ${scene.item} need to be shared out. Each ${scene.container} ${scene.verb} ${d}. How many ${scene.containerPlural} are needed to fit them all in?`;

  return {
    templateId: 'wm-t3-context-remainder-up',
    stem,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Divide ${fmt(n)} by ${d} using short division — what’s the quotient and remainder?`,
      `${fmt(n)} ÷ ${d} = ${k} remainder ${r}. With ${r} left over, that group still needs a ${scene.container} of its own — do they get a whole extra one, or none?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(n)} ÷ ${d} = ${k} remainder ${r}. With ${r} left over still needing somewhere to go, round UP: ${answer} ${scene.containerPlural}.`,
      whyWrong: {},
    },
  };
}

function t3ContextRemainderDown(rng) {
  // Complete items: round DOWN.
  const d = rngInt(rng, 4, 9);
  const k = rngInt(rng, 15, 60);
  const r = rngInt(rng, 1, d - 1);
  const n = d * k + r;
  const scenes = [
    { item: 'sweets', group: 'bag', groupPlural: 'bags' },
    { item: 'stickers', group: 'sheet', groupPlural: 'sheets' },
    { item: 'players', group: 'full team', groupPlural: 'full teams' },
    { item: 'eggs', group: 'box', groupPlural: 'boxes' },
  ];
  const scene = pick(rng, scenes);
  const answer = k;
  const stem = `${fmt(n)} ${scene.item} are shared out into groups of ${d}. How many ${scene.groupPlural} can be made COMPLETE?`;

  return {
    templateId: 'wm-t3-context-remainder-down',
    stem,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Divide ${fmt(n)} by ${d} using short division — what’s the quotient and remainder?`,
      `${fmt(n)} ÷ ${d} = ${k} remainder ${r}. With only ${r} left over, that’s not enough for another COMPLETE ${scene.group} — does it count?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(n)} ÷ ${d} = ${k} remainder ${r}. With only ${r} left over — not a whole extra ${scene.group} — round DOWN: ${answer} ${scene.groupPlural}.`,
      whyWrong: {},
    },
  };
}

function t3DecimalDivideWhole(rng) {
  const d = rngInt(rng, 2, 9);
  let k;
  let tries = 0;
  do {
    k = rngInt(rng, 11, 98);
    tries++;
  } while ((k % 10 === 0 || k * d > 500) && tries < 100);
  const dividendTenths = k * d;
  const dividendText = fmtDec1(dividendTenths);
  const quotientText = fmtDec1(k);
  const stem = `${dividendText} ÷ ${d} = ?`;

  return {
    templateId: 'wm-t3-decimal-divide-whole',
    stem,
    format: 'num',
    accept: [quotientText],
    hintSteps: [
      'Use the same short-division method — but this time keep going past the point instead of stopping at a remainder.',
      `Divide as if the point wasn’t there, then bring it straight down into the answer.`,
    ],
    explain: {
      rule: RULE,
      worked: `${dividendText} ÷ ${d} = ${quotientText} — the point drops straight down into the answer.`,
      whyWrong: {},
    },
  };
}

function t3MoneyDivideWhole(rng) {
  const d = rngInt(rng, 2, 5);
  let pp;
  let tries = 0;
  do {
    pp = rngInt(rng, 10, 99) * 5; // multiples of 5p, 50p-£4.95
    tries++;
  } while (pp % 100 === 0 && tries < 100);
  const totalPence = pp * d;
  const totalText = fmtMoney(totalPence);
  const eachText = (pp / 100).toFixed(2);
  const stem = `${totalText} is shared equally between ${d} people. How much does each person get?`;

  return {
    templateId: 'wm-t3-money-divide-whole',
    stem,
    format: 'num',
    accept: [eachText],
    unit: '£',
    hintSteps: [
      'Money is just decimals wearing a £ — use the same short-division method, keeping the point lined up.',
      `Divide ${totalText.replace('£', '')} by ${d}, then bring the point straight down into the answer.`,
    ],
    explain: {
      rule: RULE,
      worked: `${totalText} ÷ ${d} = £${eachText} each.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ColumnAdd, t1MixedLengthAdd, t1ColumnSub];
const T2 = [t2ShortMultiply2Digit, t2ShortMultiply3Digit, t2ShortDivideRemainder];
const T3 = [t3ContextRemainderUp, t3ContextRemainderDown, t3DecimalDivideWhole, t3MoneyDivideWhole];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `wm-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'written-methods',
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
