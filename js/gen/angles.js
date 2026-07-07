// FART QUEST — GEN agent
// Topic: angles-lines (The Acute Corner). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.';

function fmtDeg(n) {
  return `${Math.round(n)}°`;
}

// -------- shared numeric-option builder (dedupe + pad, degree-flavoured) --------
// distractorSpecs: [{val, misconception}]. Builds text as "NN°", drops non-finite/out-of-range/
// duplicate values, then pads with small random offsets (tagged 'padded-near-miss') if the
// dedup left us short of `minOptions`.
function buildDegreeOptions(rng, correctVal, distractorSpecs, minOptions) {
  const seen = new Set([fmtDeg(correctVal)]);
  const out = [{ text: fmtDeg(correctVal), misconception: null }];
  for (const d of shuffle(rng, distractorSpecs)) {
    if (d == null || d.val == null || !Number.isFinite(d.val) || d.val <= 0 || d.val >= 360) continue;
    const text = fmtDeg(d.val);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push({ text, misconception: d.misconception });
  }
  let guard = 0;
  while (out.length < minOptions && guard < 60) {
    guard++;
    const offset = rngInt(rng, 2, 15) * (rng() < 0.5 ? 1 : -1);
    const val = Math.round(correctVal) + offset;
    if (val <= 0 || val >= 360) continue;
    const text = fmtDeg(val);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push({ text, misconception: 'padded-near-miss' });
  }
  return out;
}

const NUMERIC_WHY = {
  'copied-given': 'That’s just the angle you were already given — the question wants the OTHER one.',
  'wrong-total-360': 'That uses 360° as the total — that’s for angles all the way round a point, not a straight line.',
  'wrong-total-90': 'That treats the line like a right angle (90°) instead of a full straight line (180°).',
  'arithmetic-slip': 'Close — but check the subtraction again, it’s a few degrees out.',
  'padded-near-miss': 'Check the subtraction again — that’s not quite the right number.',
  'used-360-total': 'That’s the QUADRILATERAL total (360°) — this is a triangle, which totals 180°.',
  'forgot-second-angle': 'That only takes away ONE of the two known angles — both need to come off 180°.',
  'added-instead': 'That’s the two given angles added together — you still need to take that away from 180°.',
  'remainder-not-halved': 'That’s the leftover after the apex angle — but it needs to be SHARED between the two equal base angles.',
  'halved-wrong-number': 'That halves the WRONG angle — it’s the remainder (180° minus the apex) that gets shared, not the apex itself.',
  'assumed-right': 'That assumes a right angle (90°) — nothing in the question tells you that.',
};

function whyWrongFor(options) {
  const whyWrong = {};
  for (const o of options) {
    if (o.misconception && NUMERIC_WHY[o.misconception]) whyWrong[o.text] = NUMERIC_WHY[o.misconception];
  }
  return whyWrong;
}

// -------- T1 templates --------

const CATS = [
  { key: 'acute', label: 'Acute', min: 1, max: 89 },
  { key: 'right', label: 'Right', min: 90, max: 90 },
  { key: 'obtuse', label: 'Obtuse', min: 91, max: 179 },
  { key: 'straight', label: 'Straight', min: 180, max: 180 },
  { key: 'reflex', label: 'Reflex', min: 181, max: 359 },
];

function catWorked(cat, deg) {
  if (cat.key === 'acute') return `${deg}° is less than 90°, so it’s acute.`;
  if (cat.key === 'right') return `${deg}° is exactly 90°, so it’s a right angle.`;
  if (cat.key === 'obtuse') return `${deg}° is more than 90° but less than 180°, so it’s obtuse.`;
  if (cat.key === 'straight') return `${deg}° is exactly 180°, so it’s a straight angle.`;
  return `${deg}° is more than 180°, so it’s reflex.`;
}

function catHint2(cat, deg) {
  if (cat.key === 'acute') return `${deg}° is smaller than 90° — that makes it…?`;
  if (cat.key === 'right') return `${deg}° lands exactly on 90° — that makes it…?`;
  if (cat.key === 'obtuse') return `${deg}° is bigger than 90° but smaller than 180° — that makes it…?`;
  if (cat.key === 'straight') return `${deg}° lands exactly on 180° — that makes it…?`;
  return `${deg}° is bigger than 180° — that makes it…?`;
}

function wrongCatReason(guessKey, deg) {
  if (guessKey === 'acute') return `${deg}° is 90° or more — too big for acute (acute means UNDER 90°).`;
  if (guessKey === 'right') return `${deg}° isn’t exactly 90°, so it can’t be a right angle.`;
  if (guessKey === 'obtuse') return `${deg}° doesn’t sit between 90° and 180°, so it isn’t obtuse.`;
  if (guessKey === 'straight') return `${deg}° isn’t exactly 180°, so it isn’t a straight angle.`;
  return `${deg}° isn’t over 180°, so it isn’t reflex.`;
}

function t1ClassifyAngle(rng) {
  const cat = pick(rng, CATS);
  const deg = rngInt(rng, cat.min, cat.max);
  const stem = 'What TYPE of angle is this?';
  const others = CATS.filter((c) => c.key !== cat.key);
  const options = [
    { text: cat.label, misconception: null },
    ...shuffle(rng, others).map((c) => ({ text: c.label, misconception: `wrong-cat-${c.key}` })),
  ];
  const whyWrong = {};
  for (const o of options) {
    if (!o.misconception) continue;
    const key = o.misconception.replace('wrong-cat-', '');
    whyWrong[o.text] = wrongCatReason(key, deg);
  }
  return {
    templateId: 'angle-t1-classify',
    stem,
    visual: { kind: 'angle', deg },
    options,
    correctIndex: 0,
    hintSteps: [
      `Compare ${deg}° to 90° and 180°. Is it smaller than 90°, exactly 90°, in between, exactly 180°, or bigger than 180°?`,
      catHint2(cat, deg),
    ],
    explain: { rule: RULE, worked: catWorked(cat, deg), whyWrong },
  };
}

const TERMS = [
  { key: 'parallel', label: 'Parallel', def: 'lines that never meet and always stay the same distance apart' },
  { key: 'perpendicular', label: 'Perpendicular', def: 'lines that cross at exactly a right angle (90°)' },
  { key: 'vertical', label: 'Vertical', def: 'a line pointing straight up and down' },
  { key: 'horizontal', label: 'Horizontal', def: 'a line lying flat, side to side' },
];

function t1LineLanguage(rng) {
  const target = pick(rng, TERMS);
  const others = TERMS.filter((t) => t.key !== target.key);
  const stem = `Which word describes ${target.def}?`;
  const options = [
    { text: target.label, misconception: null },
    ...shuffle(rng, others).map((t) => ({ text: t.label, misconception: t.key })),
    { text: 'Diagonal', misconception: 'diagonal' },
  ];
  const whyWrong = {};
  for (const o of options) {
    if (!o.misconception) continue;
    if (o.misconception === 'diagonal') {
      whyWrong[o.text] = 'Diagonal describes a slanting direction, not this relationship between lines.';
    } else {
      const t = TERMS.find((tt) => tt.key === o.misconception);
      whyWrong[o.text] = `${t.label} means ${t.def} — that’s not what the question describes.`;
    }
  }
  return {
    templateId: 'angle-t1-line-language',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      'Think about what happens when two lines are drawn: do they cross, run alongside each other, or just point in one direction?',
      `The answer describes ${target.def}.`,
    ],
    explain: { rule: RULE, worked: `${target.def} — that’s called ${target.label.toLowerCase()}.`, whyWrong },
  };
}

const FACTS = [
  { key: 'right', label: 'a RIGHT angle', val: 90 },
  { key: 'straight', label: 'a STRAIGHT line', val: 180 },
  { key: 'full', label: 'a FULL TURN', val: 360 },
];
const FACT_POOL = [45, 90, 180, 270, 360];

function t1FactRecall(rng) {
  const f = pick(rng, FACTS);
  const stem = `How many degrees are in ${f.label}?`;
  const distractorVals = shuffle(rng, FACT_POOL.filter((v) => v !== f.val));
  const options = [{ text: fmtDeg(f.val), misconception: null }];
  const misconceptionFor = (v) => {
    if (v === 45) return 'half-right';
    if (v === 90) return 'confused-right';
    if (v === 180) return 'confused-straight';
    if (v === 270) return 'confused-three-quarter';
    return 'confused-full';
  };
  for (const v of distractorVals) options.push({ text: fmtDeg(v), misconception: misconceptionFor(v) });
  const REASON = {
    'half-right': `45° is HALF of a right angle — not the whole thing.`,
    'confused-right': `90° is a right angle, not ${f.label}.`,
    'confused-straight': `180° is a straight line, not ${f.label}.`,
    'confused-three-quarter': `270° is three-quarters of a full turn, not ${f.label}.`,
    'confused-full': `360° is a full turn, not ${f.label}.`,
  };
  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = REASON[o.misconception];
  return {
    templateId: 'angle-t1-fact-recall',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Picture ${f.label} — is it a small corner, a flat line, or all the way round?`,
      `${f.label} measures exactly…?`,
    ],
    explain: { rule: RULE, worked: `${f.label} always measures ${fmtDeg(f.val)}.`, whyWrong },
  };
}

// -------- T2 templates --------

function t2LineMissing(rng) {
  let x;
  do { x = rngInt(rng, 5, 175); } while (x === 90);
  const y = 180 - x;
  const arithSlip = y + (rng() < 0.5 ? 10 : -10);
  const distractorSpecs = [
    { val: x, misconception: 'copied-given' },
    { val: 360 - x, misconception: 'wrong-total-360' },
    { val: Math.abs(90 - x) || 1, misconception: 'wrong-total-90' },
    { val: arithSlip, misconception: 'arithmetic-slip' },
  ];
  const options = buildDegreeOptions(rng, y, distractorSpecs, 5);
  const stem = `Two angles sit together on a straight line. One angle is <b>${x}°</b>. What is the other angle?`;
  return {
    templateId: 'angle-t2-line-missing',
    stem,
    visual: { kind: 'angle', deg: x },
    options,
    correctIndex: 0,
    hintSteps: [
      'Angles on a straight line always add up to 180°. Which two numbers are we working with here?',
      `180 − ${x} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${x}° and the missing angle sit on a straight line, so together they make 180°. 180° − ${x}° = ${y}°.`,
      whyWrong: whyWrongFor(options),
    },
  };
}

function t2TriangleMissing(rng) {
  let a, b;
  do {
    a = rngInt(rng, 20, 120);
    b = rngInt(rng, 20, 120);
  } while (a + b > 160 || a + b < 40);
  const c = 180 - a - b;
  const arithSlip = c + (rng() < 0.5 ? 10 : -10);
  const distractorSpecs = [
    { val: 360 - a - b, misconception: 'used-360-total' },
    { val: 180 - a, misconception: 'forgot-second-angle' },
    { val: a + b, misconception: 'added-instead' },
    { val: arithSlip, misconception: 'arithmetic-slip' },
  ];
  const options = buildDegreeOptions(rng, c, distractorSpecs, 5);
  const stem = `A triangle has angles of <b>${a}°</b> and <b>${b}°</b>. What is the third angle?`;
  return {
    templateId: 'angle-t2-triangle-missing',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Every triangle's three angles add up to 180°. Add the two you know: ${a} + ${b} = ?`,
      `180 − ${a + b} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${a}° + ${b}° = ${a + b}°. 180° − ${a + b}° = ${c}°.`,
      whyWrong: whyWrongFor(options),
    },
  };
}

function t2WhichPairStraight(rng) {
  const p = rngInt(rng, 10, 170);
  const q = 180 - p;
  const correctText = `${p}° and ${q}°`;
  const wrongTotals = shuffle(rng, [170, 190, 200, 360]);
  const seenTexts = new Set([correctText]);
  const options = [{ text: correctText, misconception: null }];
  const whyWrong = {};
  for (const total of wrongTotals) {
    let first, second, text;
    let guard = 0;
    do {
      first = rngInt(rng, 10, total - 10);
      second = total - first;
      text = `${first}° and ${second}°`;
      guard++;
    } while (seenTexts.has(text) && guard < 20);
    if (seenTexts.has(text)) continue;
    seenTexts.add(text);
    const misconception = total === 360 ? 'quad-total-pair' : 'wrong-sum-pair';
    options.push({ text, misconception });
    whyWrong[text] = total === 360
      ? `${text} adds up to 360° — that’s the quadrilateral total, not a straight line.`
      : `${text} adds up to ${total}°, not 180°.`;
  }
  return {
    templateId: 'angle-t2-which-pair-straight',
    stem: 'Which pair of angles could lie together on a straight line (add up to exactly 180°)?',
    options,
    correctIndex: 0,
    hintSteps: [
      'Add up each pair of angles. Only ONE pair should make exactly 180°.',
      `Check the first pair: ${p} + ${q} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `${p}° + ${q}° = 180°, so that pair could sit together on a straight line.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num) --------

function t3Isosceles(rng) {
  const apexGiven = rng() < 0.5;
  let stem, answer, hintSteps, worked;
  if (apexGiven) {
    const apex = rngInt(rng, 10, 80) * 2; // even, so remainder halves cleanly
    const base = (180 - apex) / 2;
    stem = `An isosceles triangle has a top (apex) angle of <b>${apex}°</b>. The other two angles are equal to each other. What is the size of EACH of those two equal angles?`;
    answer = base;
    hintSteps = [
      `The two equal angles share what's left after the apex: 180 − ${apex} = ?`,
      `Now split that remainder equally between the two equal angles: ÷ 2 = …?`,
    ];
    worked = `180° − ${apex}° = ${180 - apex}°. Shared equally: ${180 - apex}° ÷ 2 = ${base}° each.`;
  } else {
    const base = rngInt(rng, 10, 79);
    const apex = 180 - 2 * base;
    stem = `An isosceles triangle has two equal base angles of <b>${base}°</b> each. What is the size of the third (different) angle?`;
    answer = apex;
    hintSteps = [
      `Both base angles are ${base}°, so together they use 2 × ${base} = ?`,
      `180 − ${2 * base} = …?`,
    ];
    worked = `2 × ${base}° = ${2 * base}°. 180° − ${2 * base}° = ${apex}°.`;
  }
  return {
    templateId: 'angle-t3-isosceles',
    stem,
    format: 'num',
    accept: [String(answer)],
    unit: '°',
    hintSteps,
    explain: { rule: RULE, worked, whyWrong: {} },
  };
}

function t3QuadMissingFourth(rng) {
  let a, b, c;
  do {
    a = rngInt(rng, 40, 140);
    b = rngInt(rng, 40, 140);
    c = rngInt(rng, 40, 140);
  } while (a + b + c > 330 || a + b + c < 190);
  const answer = 360 - a - b - c;
  const stem = `A quadrilateral has angles of <b>${a}°</b>, <b>${b}°</b> and <b>${c}°</b>. What is the fourth angle?`;
  return {
    templateId: 'angle-t3-quad-missing-fourth',
    stem,
    format: 'num',
    accept: [String(answer)],
    unit: '°',
    hintSteps: [
      `All four angles in a quadrilateral add up to 360°. Add the three you know: ${a} + ${b} + ${c} = ?`,
      `360 − ${a + b + c} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${a}° + ${b}° + ${c}° = ${a + b + c}°. 360° − ${a + b + c}° = ${answer}°.`,
      whyWrong: {},
    },
  };
}

function t3TwoStep(rng) {
  let u, b, a;
  let guard = 0;
  do {
    u = rngInt(rng, 10, 140);
    b = rngInt(rng, 5, 150);
    a = b + u;
    guard++;
  } while ((a >= 175 || a <= b || u <= 0) && guard < 100);
  const intermediate = 180 - a;
  const stem = `A straight line is split into two angles. One of them is <b>${a}°</b>. The OTHER angle on the line is also one of the three angles in a triangle. A second angle in that same triangle is <b>${b}°</b>. What is the third angle of the triangle?`;
  return {
    templateId: 'angle-t3-two-step',
    stem,
    format: 'num',
    accept: [String(u)],
    unit: '°',
    hintSteps: [
      `First find the angle on the line that belongs to the triangle: 180 − ${a} = ?`,
      `Now use the triangle's 180° total: 180 − ${intermediate} − ${b} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `180° − ${a}° = ${intermediate}° (the triangle’s angle on the line). Then 180° − ${intermediate}° − ${b}° = ${u}°.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ClassifyAngle, t1LineLanguage, t1FactRecall];
const T2 = [t2LineMissing, t2TriangleMissing, t2WhichPairStraight];
const T3 = [t3Isosceles, t3QuadMissingFourth, t3TwoStep];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `angle-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'angles-lines',
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
