// FART QUEST — GEN agent
// Topic: metric-units (The Converting Pools). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'kilo = ×1000, centi = ÷100, milli = ÷1000. Slide the digits, never the point.';

// ---------- number formatting ----------
// Clean float dust and cap at 2dp (SEAG rule: nothing beyond 2dp). Single fmt() used everywhere.
function clean2dp(n) {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}
function fmt(n) {
  const r = clean2dp(n);
  if (Number.isInteger(r)) return r.toLocaleString('en-GB'); // adds commas only when >=1000
  let s = r.toFixed(2);
  if (s.endsWith('0')) s = s.slice(0, -1); // 3.50 -> 3.5
  return s;
}
// accept[] for num format: canonical (possibly comma'd) form, plus a plain no-comma form
// whenever the value is a whole number >= 1000 (commas are never used on decimals).
function acceptVariants(n) {
  const r = clean2dp(n);
  const out = new Set([fmt(r)]);
  if (Number.isInteger(r)) out.add(String(r));
  return Array.from(out);
}

function dedupe(correctText, list) {
  const seen = new Set([correctText]);
  const out = [];
  for (const c of list) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Pads with plausible near-miss numeric distractors (never random garbage) if the crafted set
// left us short of the tier minimum after de-duplication.
function padWithNearMiss(rng, options, minTotal, correctVal, spread) {
  const seen = new Set(options.map((o) => o.text));
  let tries = 0;
  const step = Math.max(1, Math.round(spread));
  while (options.length < minTotal && tries < 60) {
    tries += 1;
    const delta = rngInt(rng, 1, step * 3) * (rng() < 0.5 ? 1 : -1);
    const val = clean2dp(correctVal + delta);
    if (val < 0) continue;
    const text = fmt(val);
    if (seen.has(text)) continue;
    seen.add(text);
    options.push({ text, misconception: 'padded-near-miss' });
  }
  return options;
}

function buildWhyWrong(options, direction) {
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-direction') {
      whyWrong[o.text] = direction === 'toSmall'
        ? 'That climbs the ladder the WRONG way — bigger unit to smaller unit means MULTIPLY, not divide.'
        : 'That climbs the ladder the WRONG way — smaller unit to bigger unit means DIVIDE, not multiply.';
    } else if (o.misconception === 'wrong-place') {
      whyWrong[o.text] = 'Wrong rung of the ladder — check whether this jump is ×10/÷10, ×100/÷100 or ×1000/÷1000.';
    } else if (o.misconception === 'no-convert') {
      whyWrong[o.text] = 'That is just the original number — you have not climbed the ladder yet!';
    } else if (o.misconception === 'confused-with-centi') {
      whyWrong[o.text] = 'Centimetres and millimetres are NEXT-DOOR rungs — that jump is only ×10 or ÷10, not ×100 or ÷100.';
    } else if (o.misconception === 'raw-number-trick') {
      whyWrong[o.text] = 'That has the biggest-LOOKING number, but you must convert everything to the same unit before comparing.';
    } else if (o.misconception === 'padded-near-miss') {
      whyWrong[o.text] = 'Check the ladder again — which rung, and which direction?';
    }
  }
  return whyWrong;
}

// ---------- unit families ----------
const PAIR = {
  M_CM: { key: 'm_cm', factor: 100, bigUnit: 'm', smallUnit: 'cm' },
  CM_MM: { key: 'cm_mm', factor: 10, bigUnit: 'cm', smallUnit: 'mm' },
  KG_G: { key: 'kg_g', factor: 1000, bigUnit: 'kg', smallUnit: 'g' },
  L_ML: { key: 'l_ml', factor: 1000, bigUnit: 'l', smallUnit: 'ml' },
};

const COMPARE_WORD = {
  m_cm: { big: 'longest', small: 'shortest' },
  kg_g: { big: 'heaviest', small: 'lightest' },
  l_ml: { big: 'largest amount', small: 'smallest amount' },
};

function confusionFactor(factor) {
  if (factor === 10) return 100;
  if (factor === 100) return 1000;
  return 100;
}

// A "nice" big-unit value: whole, 1dp or 2dp, never zero.
function randomBigValue(rng, min, max) {
  const dp = pick(rng, [0, 1, 2]);
  const scale = 10 ** dp;
  const lo = Math.max(1, Math.round(min * scale));
  const hi = Math.round(max * scale);
  return clean2dp(rngInt(rng, lo, hi) / scale);
}

// Shared core for a single conversion in one direction.
// direction: 'toSmall' (big->small, MULTIPLY) or 'toBig' (small->big, DIVIDE).
function convertCore(rng, pair, direction, opts = {}) {
  const isMultiply = direction === 'toSmall';
  let fromValue;
  if (isMultiply) {
    fromValue = randomBigValue(rng, opts.min || 1, opts.max || 9);
  } else if (pair.factor === 1000) {
    // must be a multiple of 10 so ÷1000 never exceeds 2dp
    fromValue = rngInt(rng, opts.minSmall || 1, opts.maxSmall || 99) * 10;
  } else {
    fromValue = rngInt(rng, opts.minSmall || 11, opts.maxSmall || 999);
  }
  const toValue = clean2dp(isMultiply ? fromValue * pair.factor : fromValue / pair.factor);
  const fromUnit = isMultiply ? pair.bigUnit : pair.smallUnit;
  const toUnit = isMultiply ? pair.smallUnit : pair.bigUnit;
  const fromText = fmt(fromValue);
  const toText = fmt(toValue);
  const wrongDirectionVal = clean2dp(isMultiply ? fromValue / pair.factor : fromValue * pair.factor);
  const otherFactor = confusionFactor(pair.factor);
  const wrongFactorVal = clean2dp(isMultiply ? fromValue * otherFactor : fromValue / otherFactor);
  return {
    direction, isMultiply, fromValue, toValue, fromUnit, toUnit, fromText, toText,
    wrongDirectionVal, wrongFactorVal, factor: pair.factor,
  };
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// -------- T1 templates --------

function t1BigToSmall(rng) {
  const pair = pick(rng, [PAIR.M_CM, PAIR.KG_G]);
  const c = convertCore(rng, pair, 'toSmall');
  const stem = `Convert <b>${c.fromText} ${c.fromUnit}</b> to ${c.toUnit}.`;

  const distractors = dedupe(c.toText, [
    { text: fmt(c.wrongDirectionVal), misconception: 'wrong-direction' },
    { text: fmt(c.wrongFactorVal), misconception: 'wrong-place' },
    { text: fmt(c.fromValue), misconception: 'no-convert' },
  ]);
  let options = [{ text: c.toText, misconception: null }, ...distractors];
  options = padWithNearMiss(rng, options, 4, c.toValue, c.toValue * 0.1);

  const whyWrong = buildWhyWrong(options, 'toSmall');
  return {
    templateId: 'mu-t1-big-to-small',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${cap(c.fromUnit)} is the BIGGER unit — climbing DOWN the ladder to ${c.toUnit} means MULTIPLY.`,
      `${c.fromText} × ${pair.factor} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${c.fromText} ${c.fromUnit} × ${pair.factor} = ${c.toText} ${c.toUnit}.`,
      whyWrong,
    },
  };
}

function t1SmallToBig(rng) {
  const pair = pick(rng, [PAIR.M_CM, PAIR.KG_G]);
  const c = convertCore(rng, pair, 'toBig');
  const stem = `<b>${c.fromText} ${c.fromUnit}</b> = ___ ${c.toUnit}`;

  const distractors = dedupe(c.toText, [
    { text: fmt(c.wrongDirectionVal), misconception: 'wrong-direction' },
    { text: fmt(c.wrongFactorVal), misconception: 'wrong-place' },
    { text: fmt(c.fromValue), misconception: 'no-convert' },
  ]);
  let options = [{ text: c.toText, misconception: null }, ...distractors];
  options = padWithNearMiss(rng, options, 4, c.toValue, Math.max(1, c.toValue * 0.2));

  const whyWrong = buildWhyWrong(options, 'toBig');
  return {
    templateId: 'mu-t1-small-to-big',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${cap(c.fromUnit)} is the SMALLER unit — climbing UP the ladder to ${c.toUnit} means DIVIDE.`,
      `${c.fromText} ÷ ${pair.factor} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${c.fromText} ${c.fromUnit} ÷ ${pair.factor} = ${c.toText} ${c.toUnit}.`,
      whyWrong,
    },
  };
}

function t1LadderVisual(rng) {
  const pair = pick(rng, [PAIR.M_CM, PAIR.KG_G]);
  const direction = rng() < 0.5 ? 'toSmall' : 'toBig';
  const c = convertCore(rng, pair, direction);
  const arrow = direction === 'toSmall' ? '⬇' : '⬆';
  const opText = direction === 'toSmall' ? `×${pair.factor}` : `÷${pair.factor}`;
  const visualHtml = `<div class="law-scroll">🪜 <b>${c.fromText} ${c.fromUnit}</b> &nbsp;${arrow}&nbsp; ${opText} &nbsp;${arrow}&nbsp; <b>?</b> ${c.toUnit}</div>`;
  const stem = `Follow the ladder. What number completes it? <b>${c.fromText} ${c.fromUnit}</b> = ___ ${c.toUnit}`;

  const distractors = dedupe(c.toText, [
    { text: fmt(c.wrongDirectionVal), misconception: 'wrong-direction' },
    { text: fmt(c.wrongFactorVal), misconception: 'wrong-place' },
    { text: fmt(c.fromValue), misconception: 'no-convert' },
  ]);
  let options = [{ text: c.toText, misconception: null }, ...distractors];
  options = padWithNearMiss(rng, options, 4, c.toValue, Math.max(1, c.toValue * 0.15));

  const whyWrong = buildWhyWrong(options, direction);
  return {
    templateId: 'mu-t1-ladder-visual',
    stem,
    visual: { kind: 'ladder', html: visualHtml },
    options,
    correctIndex: 0,
    hintSteps: [
      direction === 'toSmall' ? `Climbing DOWN the ladder means MULTIPLY by ${pair.factor}.` : `Climbing UP the ladder means DIVIDE by ${pair.factor}.`,
      `${c.fromText} ${direction === 'toSmall' ? '×' : '÷'} ${pair.factor} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${c.fromText} ${c.fromUnit} ${direction === 'toSmall' ? '×' : '÷'} ${pair.factor} = ${c.toText} ${c.toUnit}.`,
      whyWrong,
    },
  };
}

function t1UnitsPerOne(rng) {
  const pair = pick(rng, [PAIR.M_CM, PAIR.KG_G]);
  const stem = `How many ${pair.smallUnit} are there in <b>1 ${pair.bigUnit}</b>?`;

  const pool = [10, 100, 1000, 10000].filter((v) => v !== pair.factor);
  const distractors = shuffle(rng, pool).slice(0, 3).map((v) => ({ text: fmt(v), misconception: 'wrong-place' }));
  const correct = { text: fmt(pair.factor), misconception: null };
  let options = [correct, ...dedupe(correct.text, distractors)];
  options = padWithNearMiss(rng, options, 4, pair.factor, pair.factor * 0.5);

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'wrong-place') whyWrong[o.text] = 'That is not the correct ladder jump for this unit pair — check kilo (1000), centi (100) or milli (1000) again.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'That is not one of the ladder jumps — check kilo/centi/milli again.';
  }

  return {
    templateId: 'mu-t1-units-per-one',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'This is a straight ladder FACT to remember, not a calculation.',
      `1 ${pair.bigUnit} = ${pair.factor} ${pair.smallUnit}. That is the answer straight from the ladder.`,
    ],
    explain: {
      rule: RULE,
      worked: `1 ${pair.bigUnit} = ${pair.factor} ${pair.smallUnit}.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

function t2CmMm(rng) {
  const direction = rng() < 0.5 ? 'toSmall' : 'toBig';
  const c = convertCore(rng, PAIR.CM_MM, direction, { min: 2, max: 30, minSmall: 15, maxSmall: 300 });
  const stem = `<b>${c.fromText} ${c.fromUnit}</b> = ___ ${c.toUnit}`;

  const confusedMilli = clean2dp(direction === 'toSmall' ? c.fromValue * 1000 : c.fromValue / 1000);
  const distractors = dedupe(c.toText, [
    { text: fmt(c.wrongDirectionVal), misconception: 'wrong-direction' },
    { text: fmt(c.wrongFactorVal), misconception: 'confused-with-centi' },
    { text: fmt(confusedMilli), misconception: 'wrong-place' },
    { text: fmt(c.fromValue), misconception: 'no-convert' },
  ]);
  let options = [{ text: c.toText, misconception: null }, ...distractors];
  options = padWithNearMiss(rng, options, 5, c.toValue, Math.max(1, c.toValue * 0.1));

  const whyWrong = buildWhyWrong(options, direction);
  return {
    templateId: 'mu-t2-cm-mm',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Centimetres and millimetres are NEXT-DOOR rungs on the ladder — the jump between them is only ×10 or ÷10.',
      `${c.fromText} ${direction === 'toSmall' ? '×' : '÷'} 10 = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${c.fromText} ${c.fromUnit} ${direction === 'toSmall' ? '×' : '÷'} 10 = ${c.toText} ${c.toUnit}. (Next-door rungs jump by 10, not 100.)`,
      whyWrong,
    },
  };
}

function t2LMl(rng) {
  const direction = rng() < 0.5 ? 'toSmall' : 'toBig';
  const c = convertCore(rng, PAIR.L_ML, direction, { min: 1, max: 9, minSmall: 1, maxSmall: 95 });
  const stem = `<b>${c.fromText} ${c.fromUnit}</b> = ___ ${c.toUnit}`;

  const distractors = dedupe(c.toText, [
    { text: fmt(c.wrongDirectionVal), misconception: 'wrong-direction' },
    { text: fmt(c.wrongFactorVal), misconception: 'wrong-place' },
    { text: fmt(c.fromValue), misconception: 'no-convert' },
  ]);
  let options = [{ text: c.toText, misconception: null }, ...distractors];
  options = padWithNearMiss(rng, options, 5, c.toValue, Math.max(1, c.toValue * 0.15));

  const whyWrong = buildWhyWrong(options, direction);
  return {
    templateId: 'mu-t2-l-ml',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Millilitres are the milli rung — ${direction === 'toSmall' ? 'climbing down means ×1000' : 'climbing up means ÷1000'}.`,
      `${c.fromText} ${direction === 'toSmall' ? '×' : '÷'} 1000 = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${c.fromText} ${c.fromUnit} ${direction === 'toSmall' ? '×' : '÷'} 1000 = ${c.toText} ${c.toUnit}.`,
      whyWrong,
    },
  };
}

function t2CompareDifferentUnits(rng) {
  const pair = pick(rng, [PAIR.M_CM, PAIR.KG_G, PAIR.L_ML]);
  const askLargest = rng() < 0.5;

  // Ground truth in SMALL-unit terms, all multiples of 10 (safe for a clean <=2dp big-unit form).
  const trueSet = new Set();
  while (trueSet.size < 5) trueSet.add(rngInt(rng, 5, 95) * 10);
  const vals = shuffle(rng, Array.from(trueSet));
  const sorted = [...vals].sort((a, b) => a - b);
  const targetVal = askLargest ? sorted[sorted.length - 1] : sorted[0];

  // Force a genuine mix of display units (at least 2 shown each way).
  const bigFlags = shuffle(rng, [true, true, false, false, rng() < 0.5]);
  const seenText = new Set();
  const displayVals = vals.map((v, i) => {
    let text = bigFlags[i]
      ? `${fmt(clean2dp(v / pair.factor))} ${pair.bigUnit}`
      : `${fmt(v)} ${pair.smallUnit}`;
    while (seenText.has(text)) text += ' ';
    seenText.add(text);
    return { v, text };
  });

  const words = COMPARE_WORD[pair.key];
  const wordFinal = askLargest ? words.big : words.small;
  const stem = `Which of these is the <b>${wordFinal}</b>?`;

  const options = displayVals.map((d) => ({ text: d.text, misconception: d.v === targetVal ? null : 'raw-number-trick' }));
  const correctIdx = options.findIndex((o) => o.misconception === null);
  const [correctOpt] = options.splice(correctIdx, 1);
  options.unshift(correctOpt);

  const whyWrong = buildWhyWrong(options, 'toSmall');

  return {
    templateId: 'mu-t2-compare-units',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'You cannot compare different units directly — convert them ALL to the same unit first.',
      `Turn every option into ${pair.smallUnit} (or ${pair.bigUnit}) and then compare.`,
    ],
    explain: {
      rule: RULE,
      worked: `Converted to the same unit, the ${wordFinal} amount is ${correctOpt.text}.`,
      whyWrong,
    },
  };
}

function t2ReverseWhichEquals(rng) {
  const pair = pick(rng, [PAIR.M_CM, PAIR.CM_MM, PAIR.KG_G, PAIR.L_ML]);
  const bigValue = randomBigValue(rng, 1, 9);
  const correctSmall = clean2dp(bigValue * pair.factor);
  const stem = `Which of these equals <b>${fmt(bigValue)} ${pair.bigUnit}</b>?`;

  const wrongDiv = clean2dp(bigValue / pair.factor);
  const otherFactor = confusionFactor(pair.factor);
  const wrongOtherFactor = clean2dp(bigValue * otherFactor);
  const spread = Math.max(1, correctSmall * 0.1);

  let distractors = dedupe(fmt(correctSmall), [
    { text: fmt(wrongDiv), misconception: 'wrong-direction' },
    { text: fmt(wrongOtherFactor), misconception: 'wrong-place' },
    { text: fmt(clean2dp(correctSmall + spread)), misconception: 'padded-near-miss' },
    { text: fmt(clean2dp(correctSmall - spread)), misconception: 'padded-near-miss' },
  ]);
  let options = [{ text: fmt(correctSmall), misconception: null }, ...distractors];
  options = padWithNearMiss(rng, options, 5, correctSmall, spread);

  const whyWrong = buildWhyWrong(options, 'toSmall');
  return {
    templateId: 'mu-t2-which-equals',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `${fmt(bigValue)} ${pair.bigUnit} means climbing down to ${pair.smallUnit}: multiply by ${pair.factor}.`,
      `${fmt(bigValue)} × ${pair.factor} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(bigValue)} ${pair.bigUnit} × ${pair.factor} = ${fmt(correctSmall)} ${pair.smallUnit}.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num, word-problems, unit chip) --------

function t3RibbonSubtract(rng) {
  const ribbonCm = rngInt(rng, 150, 950);
  const cutCm = rngInt(rng, 20, ribbonCm - 30);
  const remainderCm = ribbonCm - cutCm;
  const askCm = rng() < 0.5;
  const ribbonM = fmt(clean2dp(ribbonCm / 100));
  const unit = askCm ? 'cm' : 'm';
  const answerVal = askCm ? remainderCm : clean2dp(remainderCm / 100);

  const stem = `A ribbon is <b>${ribbonM} m</b> long. <b>${cutCm} cm</b> is cut off. How much ribbon is left? Give your answer in ${unit}.`;

  return {
    templateId: 'mu-t3-ribbon-subtract',
    stem,
    format: 'num',
    unit,
    accept: acceptVariants(answerVal),
    hintSteps: [
      `Change everything to the SAME unit first — the ribbon is ${ribbonCm} cm long.`,
      `${ribbonCm} − ${cutCm} = ${remainderCm} cm${unit === 'm' ? ', then ÷100 to reach metres' : ''}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${ribbonM} m = ${ribbonCm} cm. ${ribbonCm} − ${cutCm} = ${remainderCm} cm${unit === 'm' ? ` = ${fmt(answerVal)} m` : ''}.`,
      whyWrong: {},
    },
  };
}

function t3CombineWeights(rng) {
  const trueGrams = [rngInt(rng, 5, 95) * 10, rngInt(rng, 5, 95) * 10, rngInt(rng, 5, 95) * 10];
  const totalG = trueGrams.reduce((a, b) => a + b, 0);
  const displays = trueGrams.map((g) => (rng() < 0.5 ? `${fmt(g)} g` : `${fmt(clean2dp(g / 1000))} kg`));
  const askKg = rng() < 0.5;
  const unit = askKg ? 'kg' : 'g';
  const answerVal = askKg ? clean2dp(totalG / 1000) : totalG;

  const stem = `Three parcels weigh <b>${displays[0]}</b>, <b>${displays[1]}</b> and <b>${displays[2]}</b>. What is the total weight? Give your answer in ${unit}.`;

  return {
    templateId: 'mu-t3-combine-weights',
    stem,
    format: 'num',
    unit,
    accept: acceptVariants(answerVal),
    hintSteps: [
      'Change every mass to the SAME unit first, then add them up.',
      `${trueGrams.join(' + ')} = ${totalG} g${askKg ? ', then ÷1000 to reach kg' : ''}.`,
    ],
    explain: {
      rule: RULE,
      worked: `${trueGrams.map((g) => `${g} g`).join(' + ')} = ${totalG} g${askKg ? ` = ${fmt(answerVal)} kg` : ''}.`,
      whyWrong: {},
    },
  };
}

function t3CapacityMultiply(rng) {
  const per = pick(rng, [100, 150, 200, 250, 300, 400, 500, 750]);
  const n = rngInt(rng, 2, 8);
  const totalMl = per * n;
  const askL = rng() < 0.5;
  const unit = askL ? 'l' : 'ml';
  const answerVal = askL ? clean2dp(totalMl / 1000) : totalMl;

  const stem = `Each bottle holds <b>${per} ml</b>. How much liquid is in <b>${n}</b> bottles? Give your answer in ${unit}.`;

  return {
    templateId: 'mu-t3-capacity-multiply',
    stem,
    format: 'num',
    unit,
    accept: acceptVariants(answerVal),
    hintSteps: [
      `Multiply first: ${per} × ${n} = ${totalMl} ml.`,
      askL ? 'Then climb up the ladder: ÷1000 to change ml to litres.' : 'That is already in ml — no further conversion needed.',
    ],
    explain: {
      rule: RULE,
      worked: `${per} ml × ${n} = ${totalMl} ml${askL ? ` = ${fmt(answerVal)} l` : ''}.`,
      whyWrong: {},
    },
  };
}

function t3DirectConversion(rng) {
  const pair = pick(rng, [PAIR.M_CM, PAIR.CM_MM, PAIR.KG_G, PAIR.L_ML]);
  const direction = rng() < 0.5 ? 'toSmall' : 'toBig';
  const c = convertCore(rng, pair, direction, { min: 1, max: 30, minSmall: 5, maxSmall: 300 });
  const stem = `Write <b>${c.fromText} ${c.fromUnit}</b> in ${c.toUnit}.`;

  return {
    templateId: 'mu-t3-direct-conversion',
    stem,
    format: 'num',
    unit: c.toUnit,
    accept: acceptVariants(c.toValue),
    hintSteps: [
      direction === 'toSmall' ? `${cap(c.fromUnit)} is the bigger unit — climbing down means × ${pair.factor}.` : `${cap(c.fromUnit)} is the smaller unit — climbing up means ÷ ${pair.factor}.`,
      `${c.fromText} ${direction === 'toSmall' ? '×' : '÷'} ${pair.factor} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${c.fromText} ${c.fromUnit} ${direction === 'toSmall' ? '×' : '÷'} ${pair.factor} = ${c.toText} ${c.toUnit}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1BigToSmall, t1SmallToBig, t1LadderVisual, t1UnitsPerOne];
const T2 = [t2CmMm, t2LMl, t2CompareDifferentUnits, t2ReverseWhichEquals];
const T3 = [t3RibbonSubtract, t3CombineWeights, t3CapacityMultiply, t3DirectConversion];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `mu-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'metric-units',
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
