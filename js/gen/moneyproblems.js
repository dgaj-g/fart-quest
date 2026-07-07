// FART QUEST — GEN agent
// Topic: money-problems (The Bargain Basement). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Money is just decimals wearing a £. Line up the point and crunch.';

// Single canonical money formatter — everything renders through this (no float junk, always 2dp).
function fmt(pence) {
  return `£${(Math.round(pence) / 100).toFixed(2)}`;
}
// Accept-array builder for `num` questions: the plain decimal string, plus the bare integer
// form too when the amount is a whole number of pounds (£4.00 -> also accept "4").
function acceptVariants(pence) {
  const dec = (Math.round(pence) / 100).toFixed(2);
  const out = [dec];
  if (Math.round(pence) % 100 === 0) out.push(String(Math.round(pence) / 100));
  return out;
}

const ITEMS = [
  { s: 'a comic', p: 'comics' },
  { s: 'a keyring', p: 'keyrings' },
  { s: 'a sticker pack', p: 'sticker packs' },
  { s: 'a notebook', p: 'notebooks' },
  { s: 'a pencil case', p: 'pencil cases' },
  { s: 'a drink', p: 'drinks' },
  { s: 'a sandwich', p: 'sandwiches' },
  { s: 'an apple', p: 'apples' },
  { s: 'a balloon', p: 'balloons' },
  { s: 'a badge', p: 'badges' },
  { s: 'a magazine', p: 'magazines' },
  { s: 'a chocolate bar', p: 'chocolate bars' },
  { s: 'a bag of sweets', p: 'bags of sweets' },
  { s: 'a poster', p: 'posters' },
  { s: 'a bookmark', p: 'bookmarks' },
  { s: 'a water bottle', p: 'water bottles' },
  { s: 'a cap', p: 'caps' },
  { s: 'a postcard', p: 'postcards' },
  { s: 'a pencil', p: 'pencils' },
  { s: 'an eraser', p: 'erasers' },
];

// Returns `n` distinct item SINGULAR-NAME strings (e.g. 'a comic') — the plain string form
// used everywhere a template needs "X costs..." phrasing.
function pickDistinctItems(rng, n) {
  return shuffle(rng, ITEMS).slice(0, n).map((it) => it.s);
}

function dedupeOptions(correctText, list) {
  const seen = new Set([correctText]);
  const out = [];
  for (const c of list) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Pads with plausible near-miss MONEY distractors (never random garbage) if a template's
// crafted set left it short of the tier minimum after dedup (ties broken, shared totals, etc.).
function padMoneyDistractors(rng, options, minTotal, correctPence) {
  const seen = new Set(options.map((o) => o.text));
  const deltas = [1, 2, 5, 10, 20, 50, 100];
  let tries = 0;
  while (options.length < minTotal && tries < 80) {
    tries += 1;
    const delta = pick(rng, deltas) * (rng() < 0.5 ? 1 : -1);
    const val = correctPence + delta;
    if (val < 0) continue;
    const text = fmt(val);
    if (seen.has(text)) continue;
    seen.add(text);
    options.push({ text, misconception: 'padded-near-miss' });
  }
  return options;
}

// -------- T1 templates --------

function t1AddTwoItems(rng) {
  const [a, b] = pickDistinctItems(rng, 2);
  const priceA = rngInt(rng, 20, 495);
  const priceB = rngInt(rng, 20, 495);
  const total = priceA + priceB;

  const stem = `${a[0].toUpperCase()}${a.slice(1)} costs <b>${fmt(priceA)}</b> and ${b} costs <b>${fmt(priceB)}</b>. What is the total price?`;

  const distractors = [];
  if (total - 10 >= 0) distractors.push({ text: fmt(total - 10), misconception: 'dropped-carry' });
  distractors.push({ text: fmt(total + 10), misconception: 'over-carried' });
  distractors.push({ text: fmt(Math.abs(priceA - priceB)), misconception: 'wrong-operation' });

  const correct = { text: fmt(total), misconception: null };
  let options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];
  options = padMoneyDistractors(rng, options, 4, total);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'dropped-carry') whyWrong[o.text] = 'Check the pence column — if it makes 10p or more, that carries a whole 10p into the next column. Missing that carry loses 10p.';
    else if (o.misconception === 'over-carried') whyWrong[o.text] = 'That carries an extra 10p that was never there — check the pence column addition again.';
    else if (o.misconception === 'wrong-operation') whyWrong[o.text] = 'That SUBTRACTS the two prices — but the question asks for the total, so add them together.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Line up the points and crunch each column again, pence with pence, pounds with pounds.';
  }

  return {
    templateId: 'money-t1-add-two',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Line up the points in a column: pounds under pounds, pence under pence.',
      `Crunch the pence column first, then the pounds. ${fmt(priceA)} + ${fmt(priceB)} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(priceA)} + ${fmt(priceB)} = ${fmt(total)}.`,
      whyWrong,
    },
  };
}

function t1SubtractTwoItems(rng) {
  const [a, b] = pickDistinctItems(rng, 2);
  let priceA = rngInt(rng, 50, 495);
  let priceB = rngInt(rng, 20, 480);
  if (priceA === priceB) priceB = Math.max(20, priceB - 15);
  if (priceB > priceA) [priceA, priceB] = [priceB, priceA];
  const diff = priceA - priceB;

  const stem = `${a[0].toUpperCase()}${a.slice(1)} costs <b>${fmt(priceA)}</b>. ${b[0].toUpperCase()}${b.slice(1)} costs <b>${fmt(priceB)}</b>. How much MORE does ${a} cost than ${b}?`;

  const distractors = [];
  distractors.push({ text: fmt(priceA + priceB), misconception: 'wrong-operation' });
  if (diff - 10 >= 0) distractors.push({ text: fmt(diff - 10), misconception: 'borrow-slip' });
  distractors.push({ text: fmt(diff + 10), misconception: 'borrow-slip' });
  distractors.push({ text: fmt(priceA), misconception: 'wrong-price' });

  const correct = { text: fmt(diff), misconception: null };
  let options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];
  options = padMoneyDistractors(rng, options, 4, diff);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-operation') whyWrong[o.text] = 'That ADDS the two prices — but "how much more" means find the DIFFERENCE, so subtract.';
    else if (o.misconception === 'borrow-slip') whyWrong[o.text] = 'Check the borrowing across the pence column carefully — one column slipped by 10p.';
    else if (o.misconception === 'wrong-price') whyWrong[o.text] = `That's just ${a}'s own price — the question wants the DIFFERENCE between the two prices.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Line up the points and subtract column by column again.';
  }

  return {
    templateId: 'money-t1-subtract-two',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Line up the points in a column, then subtract — pence first, then pounds.',
      `${fmt(priceA)} − ${fmt(priceB)} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(priceA)} − ${fmt(priceB)} = ${fmt(diff)}.`,
      whyWrong,
    },
  };
}

function t1CalcDisplayRead(rng) {
  // The calculator-display trap: a price ending in a zero (hundredths digit = 0) shows on a
  // calculator with the trailing zero dropped, e.g. £4.50 -> screen shows "4.5".
  const pounds = rngInt(rng, 1, 9);
  const tenths = rngInt(rng, 1, 9);
  const pricePence = pounds * 100 + tenths * 10;
  const displayText = String(pricePence / 100); // JS naturally drops the trailing zero here

  const stem = `A calculator's screen shows <b>${displayText}</b> after working out a price. Which amount does this actually mean?`;

  const digitShiftPence = pounds * 100 + tenths; // the digit slipped into the hundredths (pence) place instead of tenths
  const magnitudeBigPence = pricePence * 10;
  const magnitudeSmallPence = pounds * 10 + tenths; // as if the whole thing were ten times too big

  const distractors = [
    { text: fmt(digitShiftPence), misconception: 'digit-shift' },
    { text: fmt(magnitudeBigPence), misconception: 'magnitude' },
    { text: fmt(magnitudeSmallPence), misconception: 'magnitude' },
  ];

  const correct = { text: fmt(pricePence), misconception: null };
  let options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];
  options = padMoneyDistractors(rng, options, 4, pricePence);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'digit-shift') whyWrong[o.text] = 'That puts the digit in the PENCE (hundredths) place — but the calculator display shows it in the TENTHS place, worth ten times more.';
    else if (o.misconception === 'magnitude') whyWrong[o.text] = 'Wrong size — a calculator dropping a trailing zero never changes how big the number actually is.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Remember: the calculator only DELETED a trailing zero — the amount is still the same size.';
  }

  return {
    templateId: 'money-t1-calc-display',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `A calculator drops a trailing zero after the point. "${displayText}" is missing a zero at the end.`,
      `Put the zero back on: ${displayText}0. Now read that as pounds and pence.`,
    ],
    explain: {
      rule: RULE,
      worked: `The screen shows "${displayText}" — that means ${fmt(pricePence)} (the calculator just dropped the trailing zero).`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2AddThreeItems(rng) {
  const [a, b, c] = pickDistinctItems(rng, 3);
  const priceA = rngInt(rng, 20, 395);
  const priceB = rngInt(rng, 20, 395);
  const priceC = rngInt(rng, 20, 395);
  const total = priceA + priceB + priceC;

  const stem = `A shopping basket has ${a} for <b>${fmt(priceA)}</b>, ${b} for <b>${fmt(priceB)}</b>, and ${c} for <b>${fmt(priceC)}</b>. What is the total price of the basket?`;

  const distractors = [];
  if (total - 10 >= 0) distractors.push({ text: fmt(total - 10), misconception: 'dropped-carry' });
  distractors.push({ text: fmt(total + 10), misconception: 'over-carried' });
  distractors.push({ text: fmt(priceA + priceB), misconception: 'missed-item' });
  distractors.push({ text: fmt(priceB + priceC), misconception: 'missed-item' });

  const correct = { text: fmt(total), misconception: null };
  let options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];
  options = padMoneyDistractors(rng, options, 5, total);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'dropped-carry') whyWrong[o.text] = 'Check the pence column — a carry of 10p got lost somewhere along the way.';
    else if (o.misconception === 'over-carried') whyWrong[o.text] = "That's an extra 10p that shouldn't be there — check the pence column addition again.";
    else if (o.misconception === 'missed-item') whyWrong[o.text] = "That's only TWO of the three items — check every price in the basket got added.";
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Line up the points and add all three prices again, column by column.';
  }

  return {
    templateId: 'money-t2-add-three',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Stack all three prices in a column, points lined up, and crunch the pence column first.',
      `${fmt(priceA)} + ${fmt(priceB)} + ${fmt(priceC)} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(priceA)} + ${fmt(priceB)} + ${fmt(priceC)} = ${fmt(total)}.`,
      whyWrong,
    },
  };
}

function t2CompareBaskets(rng) {
  const [a, b, c] = pickDistinctItems(rng, 3);
  let priceA, priceB, priceC, totalA, totalB;
  let tries = 0;
  do {
    priceA = rngInt(rng, 50, 350);
    priceB = rngInt(rng, 50, 350);
    priceC = rngInt(rng, 100, 650);
    totalA = priceA + priceB;
    totalB = priceC;
    tries += 1;
  } while (totalA === totalB && tries < 30);

  const winnerIsA = totalA > totalB;
  const diff = Math.abs(totalA - totalB);
  const winnerLabel = winnerIsA ? 'Basket A' : 'Basket B';
  const loserLabel = winnerIsA ? 'Basket B' : 'Basket A';
  const winnerTotal = winnerIsA ? totalA : totalB;

  const stem = `Basket A: ${a} (<b>${fmt(priceA)}</b>) + ${b} (<b>${fmt(priceB)}</b>). Basket B: ${c} (<b>${fmt(priceC)}</b>). Which basket costs more, and by how much?`;

  const distractors = [
    { text: `${loserLabel}, by ${fmt(diff)}`, misconception: 'wrong-basket' },
    { text: `${winnerLabel}, by ${fmt(diff + 10)}`, misconception: 'diff-slip' },
    { text: `${loserLabel}, by ${fmt(diff + 10)}`, misconception: 'compound-slip' },
    { text: `${winnerLabel}, by ${fmt(winnerTotal)}`, misconception: 'compared-totals' },
  ];

  const correctText = `${winnerLabel}, by ${fmt(diff)}`;
  const correct = { text: correctText, misconception: null };
  const options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-basket') whyWrong[o.text] = 'Check both basket totals again — that names the CHEAPER basket, not the more expensive one.';
    else if (o.misconception === 'diff-slip') whyWrong[o.text] = 'Right basket, wrong gap — subtract the two totals again, column by column.';
    else if (o.misconception === 'compound-slip') whyWrong[o.text] = 'That names the wrong basket AND the wrong gap — work out both totals fresh, then subtract.';
    else if (o.misconception === 'compared-totals') whyWrong[o.text] = "That's the WHOLE total of one basket, not the difference between the two baskets — subtract the smaller total from the bigger one.";
  }

  return {
    templateId: 'money-t2-compare-baskets',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Work out each basket's total first: Basket A = ${fmt(priceA)} + ${fmt(priceB)}. Basket B = ${fmt(priceC)}.`,
      'Subtract the smaller total from the bigger total to find the gap.',
    ],
    explain: {
      rule: RULE,
      worked: `Basket A = ${fmt(totalA)}. Basket B = ${fmt(totalB)}. ${winnerLabel} costs more, by ${fmt(diff)}.`,
      whyWrong,
    },
  };
}

const VENUES = ['the funfair', 'the school disco', 'the swimming pool', 'the cinema', 'the bowling alley', 'the trampoline park', 'the ice rink', 'the museum'];

function t2MultiplyTickets(rng) {
  const venue = pick(rng, VENUES);
  const n = rngInt(rng, 2, 6);
  const unitP = rngInt(rng, 50, 495);
  const total = unitP * n;

  const stem = `Tickets to ${venue} cost <b>${fmt(unitP)}</b> each. What is the total cost for <b>${n}</b> tickets?`;

  const distractors = [
    { text: fmt(unitP * (n - 1)), misconception: 'off-by-one' },
    { text: fmt(unitP * (n + 1)), misconception: 'off-by-one' },
    { text: fmt(Math.round(total / 10)), misconception: 'magnitude' },
    { text: fmt(unitP * 2), misconception: 'undercounted' },
  ];

  const correct = { text: fmt(total), misconception: null };
  let options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];
  options = padMoneyDistractors(rng, options, 5, total);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'off-by-one') whyWrong[o.text] = `That's not quite ${n} tickets' worth — count how many tickets you actually multiplied by.`;
    else if (o.misconception === 'magnitude') whyWrong[o.text] = 'The point slid the wrong way — multiplying by more than one always makes the total BIGGER, not tiny.';
    else if (o.misconception === 'undercounted') whyWrong[o.text] = `That's only 2 tickets' worth — there are ${n} tickets to pay for.`;
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = `Crunch it in pence: ${unitP}p × ${n}, then turn it back into pounds.`;
  }

  return {
    templateId: 'money-t2-multiply-tickets',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${n} tickets means the SAME price, ${n} times over — that's multiplication.`,
      `${fmt(unitP)} × ${n} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(unitP)} × ${n} = ${fmt(total)}.`,
      whyWrong,
    },
  };
}

function t2ChangeFromRoundAmount(rng) {
  const item = pick(rng, ITEMS);
  const priceP = rngInt(rng, 60, 430);
  const round = priceP < 500 ? 500 : 1000;
  const change = round - priceP;

  const stem = `${item.s[0].toUpperCase()}${item.s.slice(1)} costs <b>${fmt(priceP)}</b>. You pay with a <b>${fmt(round)} note</b>. How much change do you get?`;

  const distractors = [];
  if (change - 10 >= 0) distractors.push({ text: fmt(change - 10), misconception: 'borrow-slip' });
  distractors.push({ text: fmt(change + 10), misconception: 'borrow-slip' });
  distractors.push({ text: fmt(priceP), misconception: 'returned-price' });
  distractors.push({ text: fmt(round), misconception: 'no-subtraction' });

  const correct = { text: fmt(change), misconception: null };
  let options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];
  options = padMoneyDistractors(rng, options, 5, change);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'borrow-slip') whyWrong[o.text] = 'Check the borrowing across the pence column — it slipped by 10p.';
    else if (o.misconception === 'returned-price') whyWrong[o.text] = "That's the PRICE you paid, not the change you get back.";
    else if (o.misconception === 'no-subtraction') whyWrong[o.text] = "That's the whole note — the shop keeps the price and gives back only what's left over.";
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Line up the points and subtract the price from the note again, column by column.';
  }

  return {
    templateId: 'money-t2-change-round',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Count up (or subtract): how far is it from ${fmt(priceP)} up to ${fmt(round)}?`,
      `${fmt(round)} − ${fmt(priceP)} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(round)} − ${fmt(priceP)} = ${fmt(change)}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates --------

function t3UnitPriceDeriveApply(rng) {
  const item = pick(rng, ITEMS);
  const unitP = rngInt(rng, 20, 195);
  const n1 = rngInt(rng, 2, 5);
  const total1 = unitP * n1;
  let n2 = rngInt(rng, 2, 8);
  if (n2 === n1) n2 += 1;
  const answer = unitP * n2;

  const stem = `<b>${n1}</b> ${item.p} cost <b>${fmt(total1)}</b> in total. How much would <b>${n2}</b> ${item.p} cost, at the same price each?`;

  return {
    templateId: 'money-t3-unit-price-apply',
    stem,
    format: 'num',
    accept: acceptVariants(answer),
    unit: '£',
    hintSteps: [
      `Find the price of ONE first: ${fmt(total1)} ÷ ${n1} = ?`,
      `Then multiply that unit price by ${n2}.`,
    ],
    explain: {
      rule: RULE,
      worked: `Unit price: ${fmt(total1)} ÷ ${n1} = ${fmt(unitP)}. Then ${fmt(unitP)} × ${n2} = ${fmt(answer)}.`,
      whyWrong: {},
    },
  };
}

function t3SpendAndRemaining(rng) {
  const start = pick(rng, [500, 1000, 1500, 2000]);
  const [a, b] = pickDistinctItems(rng, 2);
  const cap = Math.floor((start - 100) / 2);
  const priceA = rngInt(rng, 50, Math.max(50, cap));
  const priceB = rngInt(rng, 50, Math.max(50, cap));
  const spent = priceA + priceB;
  const remaining = start - spent;

  const stem = `Jarlath takes <b>${fmt(start)}</b> to the shop. He buys ${a} for <b>${fmt(priceA)}</b> and ${b} for <b>${fmt(priceB)}</b>. How much money does he have left?`;

  return {
    templateId: 'money-t3-spend-remaining',
    stem,
    format: 'num',
    accept: acceptVariants(remaining),
    unit: '£',
    hintSteps: [
      `First add up everything spent: ${fmt(priceA)} + ${fmt(priceB)} = ?`,
      `Then subtract that total from the ${fmt(start)} he started with.`,
    ],
    explain: {
      rule: RULE,
      worked: `Spent: ${fmt(priceA)} + ${fmt(priceB)} = ${fmt(spent)}. Left: ${fmt(start)} − ${fmt(spent)} = ${fmt(remaining)}.`,
      whyWrong: {},
    },
  };
}

function t3MultiBuyChange(rng) {
  const item = pick(rng, ITEMS);
  let n, unitP, total, payWith;
  let tries = 0;
  do {
    n = rngInt(rng, 2, 6);
    unitP = rngInt(rng, 20, 195);
    total = n * unitP;
    payWith = [500, 1000, 2000].find((c) => c > total);
    tries += 1;
  } while (!payWith && tries < 30);
  if (!payWith) payWith = total + 500; // safety net, should not trigger given the ranges above

  const change = payWith - total;
  const stem = `<b>${n}</b> ${item.p} cost <b>${fmt(unitP)}</b> each. You pay with a <b>${fmt(payWith)} note</b>. How much change do you get?`;

  return {
    templateId: 'money-t3-multibuy-change',
    stem,
    format: 'num',
    accept: acceptVariants(change),
    unit: '£',
    hintSteps: [
      `First find the total cost: ${fmt(unitP)} × ${n} = ?`,
      `Then subtract that total from the ${fmt(payWith)} note.`,
    ],
    explain: {
      rule: RULE,
      worked: `Total: ${fmt(unitP)} × ${n} = ${fmt(total)}. Change: ${fmt(payWith)} − ${fmt(total)} = ${fmt(change)}.`,
      whyWrong: {},
    },
  };
}

function t3BestValueCompare(rng) {
  const item = pick(rng, ITEMS);
  let qtyA, qtyB, unitA, unitB, totalA, totalB;
  let tries = 0;
  do {
    qtyA = rngInt(rng, 2, 5);
    qtyB = rngInt(rng, 2, 6);
    if (qtyB === qtyA) qtyB += 1;
    unitA = rngInt(rng, 20, 150);
    unitB = rngInt(rng, 20, 150);
    totalA = unitA * qtyA;
    totalB = unitB * qtyB;
    tries += 1;
  } while (unitA === unitB && tries < 30);

  const aIsBetter = unitA < unitB;
  const correctLabel = aIsBetter ? 'Shop A' : 'Shop B';
  const wrongLabel = aIsBetter ? 'Shop B' : 'Shop A';
  const biggerTotalLabel = totalA >= totalB ? 'Shop A' : 'Shop B';
  const smallerTotalLabel = biggerTotalLabel === 'Shop A' ? 'Shop B' : 'Shop A';

  const stem = `Shop A sells <b>${qtyA}</b> ${item.p} for <b>${fmt(totalA)}</b>. Shop B sells <b>${qtyB}</b> ${item.p} for <b>${fmt(totalB)}</b>. Which is better value?`;

  const distractors = [
    { text: `${wrongLabel} — cheaper per item`, misconception: 'unit-price-error' },
    { text: `${biggerTotalLabel} — bigger total pack`, misconception: 'compared-totals' },
    { text: `${smallerTotalLabel} — bigger total pack`, misconception: 'compared-totals' },
    { text: 'They are the same value', misconception: 'assumed-equal' },
  ];

  const correctText = `${correctLabel} — cheaper per item`;
  const correct = { text: correctText, misconception: null };
  const options = [correct, ...dedupeOptions(correct.text, shuffle(rng, distractors))];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'unit-price-error') whyWrong[o.text] = 'Check the unit price again — that shop is actually MORE expensive per item, not less.';
    else if (o.misconception === 'compared-totals') whyWrong[o.text] = "A bigger total price doesn't mean worse value — compare the price of ONE item, not the whole pack.";
    else if (o.misconception === 'assumed-equal') whyWrong[o.text] = "The two shops don't charge the same per item — work out each unit price and compare them.";
  }

  return {
    templateId: 'money-t3-best-value',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the price of ONE item at each shop: Shop A = ${fmt(totalA)} ÷ ${qtyA}. Shop B = ${fmt(totalB)} ÷ ${qtyB}.`,
      'Compare the two unit prices — the smaller one is better value.',
    ],
    explain: {
      rule: RULE,
      worked: `Shop A: ${fmt(totalA)} ÷ ${qtyA} = ${fmt(unitA)} each. Shop B: ${fmt(totalB)} ÷ ${qtyB} = ${fmt(unitB)} each. ${correctLabel} is better value.`,
      whyWrong,
    },
  };
}

// -------- dispatch --------

const T1 = [t1AddTwoItems, t1SubtractTwoItems, t1CalcDisplayRead];
const T2 = [t2AddThreeItems, t2CompareBaskets, t2MultiplyTickets, t2ChangeFromRoundAmount];
const T3 = [t3UnitPriceDeriveApply, t3SpendAndRemaining, t3MultiBuyChange, t3BestValueCompare];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `money-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'money-problems',
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
