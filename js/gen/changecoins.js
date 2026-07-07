// FART QUEST — GEN agent
// Topic: change-coins (The Change Chute). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Don’t subtract — COUNT UP from the price to what you paid.';

// The full real UK coin/note set used throughout this topic, descending order.
// CRITICAL trap (per spec): there is NO 25p coin — never invent one as a real option.
const COIN_VALUES = [200, 100, 50, 20, 10, 5, 2, 1];
const COIN_LABELS = { 200: '£2', 100: '£1', 50: '50p', 20: '20p', 10: '10p', 5: '5p', 2: '2p', 1: '1p' };
const FAKE_COIN_LABELS = ['25p', '3p', '15p', '40p', '£3', '£25'];

// -------- single canonical number formatter --------
// pence (integer, >=0) -> display string. <100p shows as "Np", >=100p shows as "£X.XX"
// (never "£3.4" — always two decimal places once we cross the pound, per money-notation rule).
function fmtMoney(pence) {
  const p = Math.round(pence);
  if (p < 100) return `${p}p`;
  return `£${(p / 100).toFixed(2)}`;
}
// plain integer formatter (coin counts, no currency)
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}
// coin/note NAME formatter (always a whole number of pounds here) -> "£10", "£2" — never
// "£10.00"; real coins/notes are never named with a decimal. Only ever called on amounts
// that are exact multiples of 100p (£1/£2/£5/£10), so no fallback branch is needed.
function fmtCoinName(pence) {
  return `£${pence / 100}`;
}

function greedyCount(pence, denoms = COIN_VALUES) {
  let rem = pence;
  let count = 0;
  for (const c of denoms) {
    const n = Math.floor(rem / c);
    count += n;
    rem -= n * c;
  }
  return count;
}

function noteOrCoin(pence) {
  return pence >= 500 ? 'note' : 'coin';
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

// Ensure at least `min` total options. Pads with plausible near-miss money values
// (never random garbage) if dedup left the pool short.
function makeMcq(correct, distractorPool, rng, n, opts = {}) {
  const chosen = uniqueOptions(correct.text, distractorPool).slice(0, n);
  const options = [correct, ...chosen];
  const min = opts.min || n + 1;
  if (options.length < min) {
    const correctVal = opts.correctVal !== undefined ? opts.correctVal : Number(String(correct.text).replace(/[£,]/g, ''));
    const isMoneyText = /^£/.test(correct.text);
    const padVals = [correctVal + 1, correctVal - 1, correctVal + 2, correctVal - 2, correctVal + 5, correctVal - 5]
      .filter((v) => Number.isFinite(v) && v >= 0);
    const seen = new Set(options.map((o) => o.text));
    for (const v of shuffle(rng, padVals)) {
      if (options.length >= min) break;
      const text = isMoneyText ? fmtMoney(v) : fmt(v);
      if (seen.has(text)) continue;
      seen.add(text);
      options.push({ text, misconception: 'padded-near-miss' });
    }
  }
  return options;
}

// -------- T1 templates (mcq5, >=4 options) --------

// t1ChangeFromPound: change from a round price paid with a £1 coin.
function t1ChangeFromPound(rng) {
  const price = rngInt(rng, 1, 19) * 5; // multiples of 5p, 5..95
  const paid = 100;
  const change = paid - price;

  const stem = `You buy something for <b>${fmtMoney(price)}</b> and pay with a <b>£1 coin</b>. How much change do you get?`;

  const reversedDigits = (() => {
    const tens = Math.floor(change / 10);
    const units = change % 10;
    const rev = units * 10 + tens;
    return rev;
  })();

  const distractors = [
    { text: fmtMoney(price), misconception: 'used-price-as-change' },
    { text: fmtMoney(change + 10), misconception: 'off-by-ten' },
    { text: fmtMoney(change - 10 > 0 ? change - 10 : change + 20), misconception: 'off-by-ten' },
    { text: fmtMoney(reversedDigits), misconception: 'digit-swap' },
  ];

  const correct = { text: fmtMoney(change), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { correctVal: change, min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'used-price-as-change') whyWrong[o.text] = 'That’s the PRICE, not the change — count up from there to £1.00.';
    else if (o.misconception === 'off-by-ten') whyWrong[o.text] = 'That hop is ten pence out — recount from the price up to £1.00.';
    else if (o.misconception === 'digit-swap') whyWrong[o.text] = 'The digits swapped places — recount the hop carefully.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the hop again — count up from the price to £1.00.';
  }

  return {
    templateId: 'cc-t1-change-from-pound',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Count up from ${fmtMoney(price)} to £1.00 (100p). How big is that hop?`,
      `${fmtMoney(price)} → 100p in one hop of…?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtMoney(price)} counts straight up to £1.00 in one hop of ${fmtMoney(change)}. That’s the change.`,
      whyWrong,
    },
  };
}

// t1ChangeFromFiver: change from a round whole-pound price paid with a £5 coin.
function t1ChangeFromFiver(rng) {
  const priceOptions = [100, 200, 300, 400];
  const price = pick(rng, priceOptions);
  const paid = 500;
  const change = paid - price;

  const stem = `You buy something for <b>${fmtMoney(price)}</b> and pay with a <b>£5 coin</b>. How much change do you get?`;

  const distractors = [
    { text: fmtMoney(paid), misconception: 'no-subtraction' },
    { text: fmtMoney(price), misconception: 'used-price-as-change' },
    { text: fmtMoney(change + 100 <= 400 ? change + 100 : change - 100), misconception: 'wrong-pound-direction' },
    { text: fmtMoney(change - 100 > 0 ? change - 100 : change + 100), misconception: 'wrong-pound-direction' },
  ];

  const correct = { text: fmtMoney(change), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { correctVal: change, min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'no-subtraction') whyWrong[o.text] = 'That’s the amount PAID — you still need to count up the gap to find the change.';
    else if (o.misconception === 'used-price-as-change') whyWrong[o.text] = 'That’s the PRICE, not the change — count up from there to £5.00.';
    else if (o.misconception === 'wrong-pound-direction') whyWrong[o.text] = 'That’s a whole pound out — recount the hops up to £5.00.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the hops again — count up from the price to £5.00.';
  }

  return {
    templateId: 'cc-t1-change-from-fiver',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Count up from ${fmtMoney(price)} to £5.00. How many whole pounds is that hop?`,
      `${fmtMoney(price)} → £5.00 in one hop of…?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtMoney(price)} counts straight up to £5.00 in one hop of ${fmtMoney(change)}. That’s the change.`,
      whyWrong,
    },
  };
}

// t1FirstHopSize: the FIRST hop of the count-up (to the next 10p), not the total change —
// reinforces the METHOD itself rather than just the final answer.
function t1FirstHopSize(rng) {
  let price;
  do {
    price = rngInt(rng, 1, 98);
  } while (price % 10 === 0);
  const lastDigit = price % 10;
  const firstHop = 10 - lastDigit;
  const totalChange = 100 - price;

  const stem = `Counting up from <b>${fmtMoney(price)}</b> to £1.00, what is the size of the FIRST hop — up to the next 10p?`;

  let offByOne = firstHop + 1;
  if (offByOne > 9) offByOne = firstHop - 1;
  if (offByOne < 1) offByOne = firstHop + 2;

  const distractors = [
    { text: fmtMoney(lastDigit), misconception: 'used-digit-not-complement' },
    { text: fmtMoney(totalChange), misconception: 'confused-total-change' },
    { text: fmtMoney(offByOne), misconception: 'off-by-one' },
  ];

  const correct = { text: fmtMoney(firstHop), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 3, { correctVal: firstHop, min: 4 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'used-digit-not-complement') whyWrong[o.text] = 'That’s just the last digit of the price — you need the DISTANCE up to the next 10p, not the digit itself.';
    else if (o.misconception === 'confused-total-change') whyWrong[o.text] = 'That’s the FINAL change for the whole amount — this question only asks about the first little hop.';
    else if (o.misconception === 'off-by-one') whyWrong[o.text] = 'Close, but recount that hop carefully — check which 10p camp comes next.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Recount the hop up to the next 10p.';
  }

  return {
    templateId: 'cc-t1-first-hop',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${fmtMoney(price)} — what is the very next multiple of 10p above it?`,
      `Find the gap between ${fmtMoney(price)} and that next 10p camp.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtMoney(price)} → the next 10p camp is a hop of ${fmtMoney(firstHop)}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates (mcq5, >=5 options) --------

// t2ChangeFromTenOdd: change from a £10 note for an "odd" price (has a pence part).
function t2ChangeFromTenOdd(rng) {
  const pounds = rngInt(rng, 1, 9);
  let pence;
  do {
    pence = rngInt(rng, 1, 99);
  } while (pence === 0);
  const price = pounds * 100 + pence;
  const paid = 1000;
  const change = paid - price;

  const stem = `You buy something for <b>${fmtMoney(price)}</b> and pay with a <b>£10 note</b>. How much change do you get?`;

  const roundedPriceFirst = Math.round(price / 100) * 100;
  const roundedChange = paid - roundedPriceFirst;

  const distractors = [
    { text: fmtMoney(change + 100), misconception: 'forgot-borrow' },
    { text: fmtMoney(change - 100 > 0 ? change - 100 : change + 200), misconception: 'wrong-pound-direction' },
    { text: fmtMoney(price), misconception: 'used-price-as-change' },
    { text: fmtMoney(roundedChange), misconception: 'rounded-price-first' },
  ];

  const correct = { text: fmtMoney(change), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 4, { correctVal: change, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'forgot-borrow') whyWrong[o.text] = 'That’s £1 too much — when you carry the pence hop, remember it uses up part of a whole pound too.';
    else if (o.misconception === 'wrong-pound-direction') whyWrong[o.text] = 'That’s a whole pound out — recount the hops all the way up to £10.00.';
    else if (o.misconception === 'used-price-as-change') whyWrong[o.text] = 'That’s the PRICE you paid, not the change.';
    else if (o.misconception === 'rounded-price-first') whyWrong[o.text] = 'Don’t round the price first — count up from the EXACT price.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Recount the hops from the exact price up to £10.00.';
  }

  return {
    templateId: 'cc-t2-change-from-ten-odd',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Count up from ${fmtMoney(price)}: first to the next 10p, then to the next £, then up to £10.00.`,
      'Add every hop together to get the total change.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmtMoney(price)} counts up to £10.00 in hops totalling ${fmtMoney(change)}.`,
      whyWrong,
    },
  };
}

// t2FewestCoinsUpToPound: fewest coins to make an amount up to £1 (no 25p trap).
function t2FewestCoinsUpToPound(rng) {
  const amount = rngInt(rng, 3, 99);
  const correctCount = greedyCount(amount, COIN_VALUES.filter((c) => c <= 100));

  const stem = `What is the FEWEST number of coins needed to make exactly <b>${fmtMoney(amount)}</b>?`;

  const fakeDenoms = [50, 25, 20, 10, 5, 2, 1];
  const imaginedCount = greedyCount(amount, fakeDenoms);
  const onlySmallDenoms = [2, 1];
  const noBiggerCoinsCount = greedyCount(amount, onlySmallDenoms);
  const undercount = Math.max(1, correctCount - 1);
  const extraCount = correctCount + 1;

  const distractors = [
    { text: fmt(extraCount), misconception: 'extra-coin' },
    { text: fmt(imaginedCount), misconception: 'imagined-25p-coin' },
    { text: fmt(undercount), misconception: 'undercount' },
    { text: fmt(noBiggerCoinsCount), misconception: 'no-bigger-coins' },
  ];

  const correct = { text: fmt(correctCount), misconception: null };
  const options = makeMcq(correct, shuffle(rng, distractors), rng, 4, { correctVal: correctCount, min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'extra-coin') whyWrong[o.text] = 'That uses one more coin than necessary — check whether a bigger coin could replace two smaller ones.';
    else if (o.misconception === 'imagined-25p-coin') whyWrong[o.text] = 'There’s no 25p coin in the UK — that count only works if you imagine one that doesn’t exist!';
    else if (o.misconception === 'undercount') whyWrong[o.text] = 'That’s too few — check you can really make the exact amount with that few coins.';
    else if (o.misconception === 'no-bigger-coins') whyWrong[o.text] = 'You don’t have to use only small coins — bigger coins make the SAME amount with far fewer coins.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Grab the biggest coin that fits each time, then count how many coins that takes in total.';
  }

  return {
    templateId: 'cc-t2-fewest-coins',
    stem,
    visual: { kind: 'coins', values: [1, 2, 5, 10, 20, 50, 100, 200] },
    options,
    correctIndex: 0,
    hintSteps: [
      'Grab the BIGGEST coin that still fits, then the next biggest, and so on.',
      'Count up how many coins that takes in total.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmtMoney(amount)} needs ${fmt(correctCount)} coins when you always grab the biggest coin that fits.`,
      whyWrong,
    },
  };
}

// t2WhichCoinNotReal: categorical — spot the coin that does NOT exist in the UK (no 25p!).
function t2WhichCoinNotReal(rng) {
  const realLabels = Object.values(COIN_LABELS);
  const fakeLabel = pick(rng, FAKE_COIN_LABELS);
  const chosenReals = shuffle(rng, realLabels).slice(0, 4);

  const stem = 'Which of these is <b>NOT</b> a real UK coin?';

  const distractors = chosenReals.map((label) => ({ text: label, misconception: 'real-coin-mistaken-for-fake' }));
  const correct = { text: fakeLabel, misconception: null };
  const options = makeMcq(correct, distractors, rng, 4, { min: 5 });

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'real-coin-mistaken-for-fake') whyWrong[o.text] = `${o.text} IS a real UK coin.`;
  }

  return {
    templateId: 'cc-t2-which-coin-not-real',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'The real UK coins are: 1p, 2p, 5p, 10p, 20p, 50p, £1, £2.',
      'Which option is missing from that list?',
    ],
    explain: {
      rule: RULE,
      worked: `${fakeLabel} is not a real UK coin. There is no 25p coin — remember the full real set: 1p, 2p, 5p, 10p, 20p, 50p, £1, £2.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num, >=1 accept, leans num per spec) --------

// t3FewestCoinsCount: fewest-coins count across bigger amounts (up to a few pounds).
function t3FewestCoinsCount(rng) {
  const pounds = rngInt(rng, 1, 9);
  const pence = rngInt(rng, 0, 99);
  const total = pounds * 100 + pence;
  const correctCount = greedyCount(total, COIN_VALUES);

  const stem = `What is the FEWEST number of coins needed to make exactly <b>${fmtMoney(total)}</b>?`;

  return {
    templateId: 'cc-t3-fewest-coins-count',
    stem,
    format: 'num',
    visual: { kind: 'coins', values: [1, 2, 5, 10, 20, 50, 100, 200] },
    accept: [String(correctCount), fmt(correctCount)],
    hintSteps: [
      'Start with the BIGGEST coin that fits, then the next biggest, working all the way down: £2, £1, 50p, 20p, 10p, 5p, 2p, 1p.',
      'Count how many coins you used in total.',
    ],
    explain: {
      rule: RULE,
      worked: `${fmtMoney(total)} needs ${fmt(correctCount)} coins when you always grab the biggest coin that fits.`,
      whyWrong: {},
    },
  };
}

// t3ChangeSplitTwoItems: buy two items, pay with a note, find the total change.
function t3ChangeSplitTwoItems(rng) {
  const itemA = rngInt(rng, 20, 300);
  const itemB = rngInt(rng, 20, 300);
  const total = itemA + itemB;
  const paid = total < 500 ? pick(rng, [500, 1000]) : 1000;
  const change = paid - total;

  const stem = `Whiffbeard buys two items: one costs <b>${fmtMoney(itemA)}</b> and the other costs <b>${fmtMoney(itemB)}</b>. He pays with a <b>${fmtCoinName(paid)} ${noteOrCoin(paid)}</b>. How much change does he get?`;

  return {
    templateId: 'cc-t3-change-split-two-items',
    stem,
    format: 'num',
    unit: 'p',
    accept: [String(change), fmt(change)],
    hintSteps: [
      `First add the two prices together: ${fmtMoney(itemA)} + ${fmtMoney(itemB)} = ?`,
      `Then count up from that total to ${fmtCoinName(paid)}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtMoney(itemA)} + ${fmtMoney(itemB)} = ${fmtMoney(total)}. Counting up from ${fmtMoney(total)} to ${fmtCoinName(paid)} gives change of ${fmtMoney(change)} (${change}p).`,
      whyWrong: {},
    },
  };
}

// t3ReverseFindPrice: reverse direction — given amount paid and change received, find the price.
function t3ReverseFindPrice(rng) {
  const paid = pick(rng, [100, 200, 500, 1000]);
  const change = rngInt(rng, 1, paid - 1);
  const price = paid - change;

  const stem = `Whiffbeard pays for something with a <b>${fmtCoinName(paid)} ${noteOrCoin(paid)}</b> and gets <b>${fmtMoney(change)}</b> change. How much did the item cost?`;

  return {
    templateId: 'cc-t3-reverse-find-price',
    stem,
    format: 'num',
    unit: 'p',
    accept: [String(price), fmt(price)],
    hintSteps: [
      'The item’s price PLUS the change adds back up to the amount paid.',
      `So price = ${fmtCoinName(paid)} − ${fmtMoney(change)}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmtCoinName(paid)} − ${fmtMoney(change)} = ${fmtMoney(price)} (${price}p).`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ChangeFromPound, t1ChangeFromFiver, t1FirstHopSize];
const T2 = [t2ChangeFromTenOdd, t2FewestCoinsUpToPound, t2WhichCoinNotReal];
const T3 = [t3FewestCoinsCount, t3ChangeSplitTwoItems, t3ReverseFindPrice];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `cc-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'change-coins',
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
