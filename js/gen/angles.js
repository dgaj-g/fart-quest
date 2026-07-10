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
  'arithmetic-slip': 'Close — but check the subtraction again, it’s a few degrees out.',
  'padded-near-miss': 'Check the subtraction again — that’s not quite the right number.',
  'used-360-total': 'That’s the QUADRILATERAL total (360°) — this is a triangle, which totals 180°.',
  'forgot-second-angle': 'That only takes away ONE of the two known angles — both need to come off 180°.',
  'added-instead': 'That’s the two given angles added together — you still need to take that away from 180°.',
  'forgot-one-angle': 'That only takes away TWO of the three known angles — all three need to come off 360°.',
  'added-given-only': 'That’s just the three given angles added together — you still need to take that away from 360°.',
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
  { key: 'obtuse', label: 'Obtuse', min: 91, max: 179 },
  { key: 'reflex', label: 'Reflex', min: 181, max: 359 },
];

function catWorked(cat, deg) {
  if (cat.key === 'acute') return `${deg}° is less than 90°, so it’s acute.`;
  if (cat.key === 'obtuse') return `${deg}° is more than 90° but less than 180°, so it’s obtuse.`;
  return `${deg}° is more than 180°, so it’s reflex.`;
}

function catHint2(cat, deg) {
  if (cat.key === 'acute') return `${deg}° is smaller than 90° — that makes it…?`;
  if (cat.key === 'obtuse') return `${deg}° is bigger than 90° but smaller than 180° — that makes it…?`;
  return `${deg}° is bigger than 180° — that makes it…?`;
}

function wrongCatReason(guessKey, deg) {
  if (guessKey === 'acute') return `${deg}° is 90° or more — too big for acute (acute means UNDER 90°).`;
  if (guessKey === 'obtuse') return `${deg}° doesn’t sit between 90° and 180°, so it isn’t obtuse.`;
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
      `Compare ${deg}° to 90° and 180°. Is it smaller than 90°, in between the two, or bigger than 180°?`,
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
  { key: 'triangle', label: 'the angles inside a TRIANGLE', shape: 'a triangle', val: 180 },
  { key: 'quadrilateral', label: 'the angles inside a QUADRILATERAL', shape: 'a quadrilateral', val: 360 },
];
const FACT_POOL = [90, 180, 270, 360];

function t1FactRecall(rng) {
  const f = pick(rng, FACTS);
  const stem = `How many degrees do ${f.label} add up to?`;
  const distractorVals = shuffle(rng, FACT_POOL.filter((v) => v !== f.val));
  const options = [{ text: fmtDeg(f.val), misconception: null }];
  const misconceptionFor = (v) => {
    if (v === 90) return 'confused-right';
    if (v === 180) return 'confused-triangle';
    if (v === 270) return 'confused-three-quarter';
    return 'confused-quadrilateral';
  };
  for (const v of distractorVals) options.push({ text: fmtDeg(v), misconception: misconceptionFor(v) });
  const REASON = {
    'confused-right': `90° is a single right angle, not the total for ${f.shape}.`,
    'confused-triangle': `180° is the total for a TRIANGLE’s angles, not a quadrilateral’s.`,
    'confused-three-quarter': `270° is three-quarters of a full turn — not the angle total for ${f.shape}.`,
    'confused-quadrilateral': `360° is the total for a QUADRILATERAL’s angles, not a triangle’s.`,
  };
  const whyWrong = {};
  for (const o of options) if (o.misconception) whyWrong[o.text] = REASON[o.misconception];
  return {
    templateId: 'angle-t1-fact-recall',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Picture ${f.shape} — how many corners does it have, and what do all its inside angles add up to?`,
      `${f.label} always add up to…?`,
    ],
    explain: { rule: RULE, worked: `${f.label} always add up to ${fmtDeg(f.val)}.`, whyWrong },
  };
}

// -------- T2 templates --------

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

function t2QuadMissingAngle(rng) {
  let a, b, c;
  do {
    a = rngInt(rng, 40, 140);
    b = rngInt(rng, 40, 140);
    c = rngInt(rng, 40, 140);
  } while (a + b + c > 330 || a + b + c < 190);
  const given = a + b + c;
  const answer = 360 - given;
  const arithSlip = answer + (rng() < 0.5 ? 10 : -10);
  const distractorSpecs = [
    { val: given, misconception: 'added-given-only' },
    { val: 360 - a - b, misconception: 'forgot-one-angle' },
    { val: 360 - a - c, misconception: 'forgot-one-angle' },
    { val: arithSlip, misconception: 'arithmetic-slip' },
  ];
  const options = buildDegreeOptions(rng, answer, distractorSpecs, 4);
  const stem = `A quadrilateral has angles of <b>${a}°</b>, <b>${b}°</b> and <b>${c}°</b>. What is the fourth angle?`;
  return {
    templateId: 'angle-t2-quad-missing-angle',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `All four angles in a quadrilateral add up to 360°. Add the three you know: ${a} + ${b} + ${c} = ?`,
      `360 − ${given} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${a}° + ${b}° + ${c}° = ${given}°. 360° − ${given}° = ${answer}°.`,
      whyWrong: whyWrongFor(options),
    },
  };
}

const LINE_RELATIONS = [
  { key: 'perpendicular', label: 'Perpendicular', reason: 'Perpendicular lines cross at exactly a right angle (90°) — that matches the picture here.' },
  { key: 'parallel', label: 'Parallel', reason: 'Parallel lines never cross at all — but these two do, at 90°.' },
  { key: 'vertical', label: 'Vertical', reason: 'Vertical just means pointing straight up and down — it doesn’t describe how two lines cross.' },
  { key: 'horizontal', label: 'Horizontal', reason: 'Horizontal just means lying flat, side to side — it doesn’t describe how two lines cross.' },
];

function t2LineRelationship(rng) {
  const others = shuffle(rng, LINE_RELATIONS.filter((r) => r.key !== 'perpendicular'));
  const options = [
    { text: 'Perpendicular', misconception: null },
    ...others.map((r) => ({ text: r.label, misconception: r.key })),
  ];
  const whyWrong = {};
  for (const o of options) {
    if (!o.misconception) continue;
    const r = LINE_RELATIONS.find((rr) => rr.key === o.misconception);
    whyWrong[o.text] = r.reason;
  }
  return {
    templateId: 'angle-t2-line-relationship',
    stem: 'Two lines cross, and the angle where they meet is exactly <b>90°</b>. What word best describes these two lines?',
    options,
    correctIndex: 0,
    hintSteps: [
      'Think about the special word for two lines that cross at a perfect right angle.',
      'Not lines that never meet, and not a direction word — the crossing word for exactly 90°…?',
    ],
    explain: {
      rule: RULE,
      worked: 'Lines that cross at exactly a right angle (90°) are called perpendicular.',
      whyWrong,
    },
  };
}

// -------- T3 templates (num) --------

function t3TriangleMissingNum(rng) {
  let a, b;
  do {
    a = rngInt(rng, 15, 150);
    b = rngInt(rng, 15, 150);
  } while (a + b > 165 || a + b < 30);
  const c = 180 - a - b;
  const stem = `A triangle has angles of <b>${a}°</b> and <b>${b}°</b>. What is the third angle?`;
  return {
    templateId: 'angle-t3-triangle-missing-num',
    stem,
    format: 'num',
    accept: [String(c)],
    unit: '°',
    hintSteps: [
      `Every triangle's three angles add up to 180°. Add the two you know: ${a} + ${b} = ?`,
      `180 − ${a + b} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `${a}° + ${b}° = ${a + b}°. 180° − ${a + b}° = ${c}°.`,
      whyWrong: {},
    },
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

function t3TwoTriangleShare(rng) {
  let p, q, s;
  let guard = 0;
  do {
    p = rngInt(rng, 20, 120);
    q = rngInt(rng, 20, 120);
    s = 180 - p - q;
    guard++;
  } while ((s < 10 || s > 150) && guard < 100);
  let r, answer;
  let guard2 = 0;
  do {
    r = rngInt(rng, 10, 150);
    answer = 180 - s - r;
    guard2++;
  } while ((answer <= 0 || answer >= 175) && guard2 < 100);
  const stem = `Triangle A has angles of <b>${p}°</b> and <b>${q}°</b>. Its third angle is also one of the angles in Triangle B. Triangle B's other known angle is <b>${r}°</b>. What is the third angle of Triangle B?`;
  return {
    templateId: 'angle-t3-two-triangle-share',
    stem,
    format: 'num',
    accept: [String(answer)],
    unit: '°',
    hintSteps: [
      `First find Triangle A's third angle — the one it shares with Triangle B: 180 − ${p} − ${q} = ?`,
      `Now use Triangle B's own 180° total: 180 − ${s} − ${r} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `Triangle A: 180° − ${p}° − ${q}° = ${s}° (the shared angle). Triangle B: 180° − ${s}° − ${r}° = ${answer}°.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ClassifyAngle, t1LineLanguage, t1FactRecall];
const T2 = [t2TriangleMissing, t2QuadMissingAngle, t2LineRelationship];
const T3 = [t3TriangleMissingNum, t3QuadMissingFourth, t3TwoTriangleShare];

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
