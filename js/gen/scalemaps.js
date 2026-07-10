// FART QUEST — GEN agent
// Topic: scale-maps (The Shrunken Shore). generate(tier, rng) -> Question.
import { rngInt, pick } from '../rng.js';

const RULE = 'Read the scale like a recipe: 1 cm means X in real life. Measure, then multiply.';

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
// whenever the value is a whole number >= 1000 (commas are never used on decimals). Never a
// bare ".xx" — fmt()/toFixed always produce a leading zero for values under 1.
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

// Pads with plausible near-miss options carrying the same unit suffix as the correct option
// (never random garbage) if the crafted distractor set left us short of the tier minimum.
function padWithNearMiss(rng, options, minTotal, correctVal, unitSuffix, spread) {
  const seen = new Set(options.map((o) => o.text));
  let tries = 0;
  const step = Math.max(1, Math.round(spread) || 1);
  while (options.length < minTotal && tries < 60) {
    tries += 1;
    const delta = rngInt(rng, 1, step * 3) * (rng() < 0.5 ? 1 : -1);
    const val = clean2dp(correctVal + delta);
    if (val < 0) continue;
    const text = `${fmt(val)}${unitSuffix}`;
    if (seen.has(text)) continue;
    seen.add(text);
    options.push({ text, misconception: 'padded-near-miss' });
  }
  return options;
}

function buildWhyWrong(options) {
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'divide-not-multiply') whyWrong[o.text] = 'That DIVIDED the drawing length by the scale — the recipe says MULTIPLY to go from drawing to real life.';
    else if (o.misconception === 'add-scale') whyWrong[o.text] = 'That ADDED the scale number — a scale is a MULTIPLY relationship, not a plus-sum.';
    else if (o.misconception === 'unit-of-answer') whyWrong[o.text] = 'The number is right, but the UNIT is wrong — the scale converts the drawing into metres, not centimetres.';
    else if (o.misconception === 'no-convert') whyWrong[o.text] = 'That is just the drawing length, unconverted — you have not used the scale yet!';
    else if (o.misconception === 'wrong-dimension') whyWrong[o.text] = 'That converted the OTHER measurement — check which one the question actually asked for.';
    else if (o.misconception === 'only-one-side') whyWrong[o.text] = 'That converted only ONE section — the question wants BOTH sections added together.';
    else if (o.misconception === 'misread-scale') whyWrong[o.text] = 'That used a slightly different scale number — re-read the scale statement carefully before multiplying.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the recipe again: 1 cm means how many metres, and did you multiply?';
  }
  return whyWrong;
}

// A plausible "misread the scale by one" distractor: multiply by X+1 or X-1 instead of X.
// Deliberately sometimes LARGER than the true real value and sometimes smaller, so the correct
// answer is not always the extreme (biggest) option in a forward-multiply question.
function misreadScaleValue(rng, D, X) {
  const delta = rng() < 0.5 ? 1 : -1;
  const Xm = Math.max(1, X + delta);
  return D * Xm;
}

// ---------- scale value pools ----------
const T1_SCALES = [2, 3, 4, 5, 6, 8, 10];
const T2_SCALES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25];
const KM_SCALES = [50, 100, 150, 200, 250, 300, 400, 500, 600, 750, 800]; // multiples of 50: real-m always a multiple of 10, so ÷1000 stays <=2dp

const THEMES = ['garden path', 'model bridge', 'toy train track', 'treasure map trail', 'mini castle wall', 'football pitch model'];

// -------- T1 templates --------

function t1DrawingToRealShape(rng) {
  const X = pick(rng, T1_SCALES);
  const D = rngInt(rng, 2, 9);
  const real = D * X;

  const stem = `This scale drawing shows a garden path. The path measures <b>${D} cm</b> on the drawing. What is its real length?`;
  const visual = { kind: 'scaledrawing', shape: { kind: 'rect', labels: ['', '', `${D} cm`, ''] }, scaleText: `Scale: 1 cm = ${X} m` };

  const correct = { text: `${fmt(real)} m`, misconception: null };
  let distractors = dedupe(correct.text, [
    { text: `${fmt(D / X)} m`, misconception: 'divide-not-multiply' },
    { text: `${fmt(D + X)} m`, misconception: 'add-scale' },
    { text: `${fmt(real)} cm`, misconception: 'unit-of-answer' },
    { text: `${D} cm`, misconception: 'no-convert' },
    { text: `${fmt(misreadScaleValue(rng, D, X))} m`, misconception: 'misread-scale' },
  ]);
  let options = [correct, ...distractors];
  options = padWithNearMiss(rng, options, 4, real, ' m', Math.max(1, X));

  return {
    templateId: 'sm-t1-drawing-shape',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `The scale says 1 cm means ${X} m in real life. The path is ${D} cm on the drawing.`,
      `${D} × ${X} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `1 cm = ${X} m, so ${D} cm × ${X} = ${fmt(real)} m.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

function t1TableRead(rng) {
  const X = pick(rng, T1_SCALES);
  const D = pick(rng, [4, 5, 6, 7, 9]);
  const real = D * X;

  const stem = `This ready-reckoner table shows the scale 1 cm = ${X} m. What real distance (in m) completes the missing cell?`;
  const visual = {
    kind: 'table',
    headers: ['Drawing (cm)', 'Real (m)'],
    rows: [['1', fmt(X)], ['2', fmt(2 * X)], [String(D), '?']],
    highlight: [[2, 1]],
  };

  const correct = { text: `${fmt(real)} m`, misconception: null };
  let distractors = dedupe(correct.text, [
    { text: `${fmt(D / X)} m`, misconception: 'divide-not-multiply' },
    { text: `${fmt(D + X)} m`, misconception: 'add-scale' },
    { text: `${fmt(real)} cm`, misconception: 'unit-of-answer' },
    { text: `${D} cm`, misconception: 'no-convert' },
    { text: `${fmt(misreadScaleValue(rng, D, X))} m`, misconception: 'misread-scale' },
  ]);
  let options = [correct, ...distractors];
  options = padWithNearMiss(rng, options, 4, real, ' m', Math.max(1, X));

  return {
    templateId: 'sm-t1-table',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Every row follows the same recipe: drawing cm × ${X} = real m.`,
      `${D} × ${X} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `1 cm = ${X} m, so ${D} cm × ${X} = ${fmt(real)} m.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

function t1WordProblem(rng) {
  const X = pick(rng, T1_SCALES);
  const D = rngInt(rng, 2, 9);
  const real = D * X;
  const theme = pick(rng, THEMES);

  const stem = `A ${theme} is drawn using a scale of 1 cm = ${X} m. On the drawing it measures <b>${D} cm</b>. What is its real length?`;

  const correct = { text: `${fmt(real)} m`, misconception: null };
  let distractors = dedupe(correct.text, [
    { text: `${fmt(D / X)} m`, misconception: 'divide-not-multiply' },
    { text: `${fmt(D + X)} m`, misconception: 'add-scale' },
    { text: `${fmt(real)} cm`, misconception: 'unit-of-answer' },
    { text: `${D} cm`, misconception: 'no-convert' },
    { text: `${fmt(misreadScaleValue(rng, D, X))} m`, misconception: 'misread-scale' },
  ]);
  let options = [correct, ...distractors];
  options = padWithNearMiss(rng, options, 4, real, ' m', Math.max(1, X));

  return {
    templateId: 'sm-t1-word',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `The scale says 1 cm means ${X} m in real life. The ${theme} is ${D} cm on the drawing.`,
      `${D} × ${X} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `1 cm = ${X} m, so ${D} cm × ${X} = ${fmt(real)} m.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// -------- T2 templates --------

function t2MixedScaleDecimal(rng) {
  const X = pick(rng, T2_SCALES);
  const D = clean2dp(rngInt(rng, 15, 120) / 10); // 1.5 to 12.0 cm, 1dp
  const real = clean2dp(D * X);

  const stem = `This scale drawing shows a mountain trail. The trail measures <b>${fmt(D)} cm</b> on the drawing. Scale: 1 cm = ${X} m. What is its real length?`;
  const visual = { kind: 'scaledrawing', shape: { kind: 'rect', labels: ['', '', `${fmt(D)} cm`, ''] }, scaleText: `Scale: 1 cm = ${X} m` };

  const correct = { text: `${fmt(real)} m`, misconception: null };
  let distractors = dedupe(correct.text, [
    { text: `${fmt(D / X)} m`, misconception: 'divide-not-multiply' },
    { text: `${fmt(D + X)} m`, misconception: 'add-scale' },
    { text: `${fmt(real)} cm`, misconception: 'unit-of-answer' },
    { text: `${fmt(D)} cm`, misconception: 'no-convert' },
    { text: `${fmt(misreadScaleValue(rng, D, X))} m`, misconception: 'misread-scale' },
  ]);
  let options = [correct, ...distractors];
  options = padWithNearMiss(rng, options, 5, real, ' m', Math.max(1, X));

  return {
    templateId: 'sm-t2-decimal',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `The scale says 1 cm means ${X} m in real life. The trail is ${fmt(D)} cm on the drawing.`,
      `${fmt(D)} × ${X} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `1 cm = ${X} m, so ${fmt(D)} cm × ${X} = ${fmt(real)} m.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// Same skill as t1DrawingToRealShape (bullet M2.7, route (a)) but the drawing now carries
// TWO labelled measurements (mirrors the lesson's "Two labels, one drawing" teaching card) —
// the extra work is picking out the right one, not a new device.
function t2TwoDimensions(rng) {
  const X = pick(rng, T2_SCALES);
  const lenD = rngInt(rng, 3, 9);
  let widD = rngInt(rng, 2, 8);
  while (widD === lenD) widD = rngInt(rng, 2, 8);
  const lenReal = lenD * X;
  const widReal = widD * X;
  const askWidth = rng() < 0.5;
  const askedD = askWidth ? widD : lenD;
  const askedReal = askWidth ? widReal : lenReal;
  const otherReal = askWidth ? lenReal : widReal;
  const label = askWidth ? 'width' : 'length';

  const stem = `A garden plan uses a scale of 1 cm = ${X} m. Its length is <b>${lenD} cm</b> and its width is <b>${widD} cm</b> on the drawing. What is the real ${label}?`;
  const visual = {
    kind: 'table',
    headers: ['Side', 'Drawing (cm)'],
    rows: [['Length', String(lenD)], ['Width', String(widD)]],
    highlight: [[askWidth ? 1 : 0, 0]],
  };

  const correct = { text: `${fmt(askedReal)} m`, misconception: null };
  let distractors = dedupe(correct.text, [
    { text: `${fmt(otherReal)} m`, misconception: 'wrong-dimension' },
    { text: `${fmt(askedD / X)} m`, misconception: 'divide-not-multiply' },
    { text: `${fmt(askedD + X)} m`, misconception: 'add-scale' },
    { text: `${fmt(askedReal)} cm`, misconception: 'unit-of-answer' },
    { text: `${askedD} cm`, misconception: 'no-convert' },
  ]);
  let options = [correct, ...distractors];
  options = padWithNearMiss(rng, options, 5, askedReal, ' m', Math.max(1, X));

  return {
    templateId: 'sm-t2-two-dimensions',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the ${label} in the table first: ${askedD} cm.`,
      `${askedD} × ${X} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `The ${label} is ${askedD} cm. 1 cm = ${X} m, so ${askedD} cm × ${X} = ${fmt(askedReal)} m.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// Two sections at the SAME scale, summed — still a single-scale application of bullet M2.7
// (plus ordinary addition), not a cross-scale comparison device.
function t2SameScaleTotal(rng) {
  const X = pick(rng, T2_SCALES);
  const Da = rngInt(rng, 2, 8);
  const Db = rngInt(rng, 2, 8);
  const realA = Da * X;
  const realB = Db * X;
  const total = realA + realB;
  const theme = pick(rng, THEMES);

  const stem = `A ${theme} is drawn in two sections. Section A measures <b>${Da} cm</b> and section B measures <b>${Db} cm</b> on the drawing. Scale: 1 cm = ${X} m. What is the TOTAL real length of both sections together?`;
  const visual = {
    kind: 'table',
    headers: ['Section', 'Drawing (cm)'],
    rows: [['A', String(Da)], ['B', String(Db)]],
  };

  const correct = { text: `${fmt(total)} m`, misconception: null };
  let distractors = dedupe(correct.text, [
    { text: `${fmt(realA)} m`, misconception: 'only-one-side' },
    { text: `${Da + Db} m`, misconception: 'no-convert' },
    { text: `${fmt(total)} cm`, misconception: 'unit-of-answer' },
    { text: `${fmt((Da + Db) / X)} m`, misconception: 'divide-not-multiply' },
  ]);
  let options = [correct, ...distractors];
  options = padWithNearMiss(rng, options, 5, total, ' m', Math.max(1, X));

  return {
    templateId: 'sm-t2-same-scale-total',
    stem,
    visual,
    options,
    correctIndex: 0,
    hintSteps: [
      `Convert each section first: ${Da} × ${X} and ${Db} × ${X}.`,
      `${fmt(realA)} m + ${fmt(realB)} m = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `Section A: ${Da} × ${X} = ${fmt(realA)} m. Section B: ${Db} × ${X} = ${fmt(realB)} m. Total = ${fmt(realA)} + ${fmt(realB)} = ${fmt(total)} m.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// -------- T3 templates (num, reverse + ladder step) --------

function t3ReverseFindDrawing(rng) {
  const X = pick(rng, T2_SCALES);
  const drawnTrue = rngInt(rng, 2, 12);
  const real = X * drawnTrue;

  const stem = `A wall is really <b>${fmt(real)} m</b> long. It is drawn using a scale of 1 cm = ${X} m. How long is the wall on the drawing? Give your answer in cm.`;

  return {
    templateId: 'sm-t3-reverse-drawing',
    stem,
    format: 'num',
    unit: 'cm',
    accept: acceptVariants(drawnTrue),
    hintSteps: [
      'Working BACKWARDS from real life to the drawing means DIVIDE by the scale, not multiply.',
      `${fmt(real)} ÷ ${X} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(real)} m ÷ ${X} = ${fmt(drawnTrue)} cm.`,
      whyWrong: {},
    },
  };
}

function t3LadderStepKm(rng) {
  const X = pick(rng, KM_SCALES);
  const D = rngInt(rng, 2, 9);
  const realM = D * X;
  const realKm = clean2dp(realM / 1000);

  const stem = `A map has a scale of 1 cm = ${X} m. A road on the map is <b>${D} cm</b> long. What is the real length of the road? Give your answer in km.`;

  return {
    templateId: 'sm-t3-ladder-km',
    stem,
    format: 'num',
    unit: 'km',
    accept: acceptVariants(realKm),
    hintSteps: [
      `First multiply to reach metres: ${D} × ${X} = ${fmt(realM)} m.`,
      `Then climb the ladder — remember Centi-Peed? 1000 m = 1 km, so ÷ 1000: ${fmt(realM)} ÷ 1000 = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${D} × ${X} = ${fmt(realM)} m. ${fmt(realM)} ÷ 1000 = ${fmt(realKm)} km.`,
      whyWrong: {},
    },
  };
}

function t3ForwardDecimalReal(rng) {
  const X = rngInt(rng, 2, 15);
  const D = clean2dp(rngInt(rng, 15, 120) / 10);
  const real = clean2dp(D * X);

  const stem = `A scale drawing uses 1 cm = ${X} m. A path is drawn <b>${fmt(D)} cm</b> long. What is its real length? Give your answer in m.`;

  return {
    templateId: 'sm-t3-forward-decimal',
    stem,
    format: 'num',
    unit: 'm',
    accept: acceptVariants(real),
    hintSteps: [
      `The scale says 1 cm means ${X} m in real life. The path is ${fmt(D)} cm on the drawing.`,
      `${fmt(D)} × ${X} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `1 cm = ${X} m, so ${fmt(D)} cm × ${X} = ${fmt(real)} m.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1DrawingToRealShape, t1TableRead, t1WordProblem];
const T2 = [t2MixedScaleDecimal, t2TwoDimensions, t2SameScaleTotal];
const T3 = [t3ReverseFindDrawing, t3LadderStepKm, t3ForwardDecimalReal];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `sm-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'scale-maps',
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
