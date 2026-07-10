// FART QUEST — GEN agent
// Topic: special-numbers (Special Number Springs / Prime Slime). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'A prime has exactly TWO factors: 1 and itself. 1 is not prime. 2 is the only even one.';
const RULE_INDICES = 'Indices notation: the small number tells you how many times to multiply by ITSELF. 3² means 3 × 3, NOT 3 × 2.';
const RULE_FACTORS = 'Factors divide INTO a number exactly, with nothing left over. Multiples come FROM the times table.';
const RULE_TRIANGULAR = 'Triangular numbers stack up one more each time — the gap between terms grows by one every time.';

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

function isPrime(n) {
  if (!Number.isFinite(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function factorsOf(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) out.push(i);
  }
  return out;
}

const PRIMES_30 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
const COMPOSITES_30 = [1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30];
const LOOKS_PRIME = new Set([9, 15, 21, 25, 27]);

function primeDistractorMisconception(v) {
  if (v === 1) return 'one-is-prime';
  if (LOOKS_PRIME.has(v)) return 'looks-prime';
  return 'composite';
}

function primeWhyWrong(v) {
  if (v === 1) return '1 only has ONE factor (itself) — a prime needs exactly two, so 1 is never prime.';
  const f = factorsOf(v);
  return `${fmt(v)} has factors ${f.join(', ')} — that’s ${f.length} factors, not two, so it isn’t prime.`;
}

// dedupe helper: takes ordered candidate list of {text, misconception}, returns up to `n` with unique text (never equal to excludeText)
function takeUnique(candidates, n, excludeText) {
  const seen = new Set([excludeText]);
  const out = [];
  for (const c of candidates) {
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
    if (out.length >= n) break;
  }
  return out;
}

// -------- T1 templates --------

function t1WhichIsPrime(rng) {
  const target = pick(rng, PRIMES_30);
  const pool = shuffle(rng, COMPOSITES_30.filter((v) => v !== target)).map((v) => ({
    text: fmt(v),
    misconception: primeDistractorMisconception(v),
    _v: v,
  }));
  const distractors = takeUnique(pool, 3, fmt(target));

  const correct = { text: fmt(target), misconception: null };
  const options = [correct, ...distractors.map((d) => ({ text: d.text, misconception: d.misconception }))];

  const whyWrong = {};
  for (const d of distractors) whyWrong[d.text] = primeWhyWrong(d._v);

  return {
    templateId: 'sn-t1-which-prime',
    stem: 'Which of these numbers is <b>prime</b>?',
    options,
    correctIndex: 0,
    hintSteps: [
      'A prime number has EXACTLY two factors: 1 and itself. Try dividing each option by small numbers like 2, 3 and 5.',
      `Test ${fmt(target)}: can you divide it evenly by anything except 1 and ${fmt(target)}? If not, it’s prime.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(target)}’s only factors are 1 and ${fmt(target)} — exactly two — so it is prime. The others all have extra factors.`,
      whyWrong,
    },
  };
}

function t1NextSquare(rng) {
  const n = rngInt(rng, 2, 11); // next term is (n+1)^2, up to 12^2
  const seqStart = Math.max(1, n - 2);
  const seqTerms = [];
  for (let k = seqStart; k <= n; k++) seqTerms.push(k * k);
  const answer = (n + 1) * (n + 1);
  const answerText = fmt(answer);

  const candidatePool = [
    { v: (n + 1) * 2, m: 'indices-times2' },
    { v: n * n, m: 'stuck-same-term' },
    { v: n * n + n, m: 'wrong-increment' },
    { v: (n + 2) * (n + 2), m: 'padded-near-miss' },
    { v: Math.max(0, (n - 1) * (n - 1)), m: 'padded-near-miss' },
    { v: (n + 1) * n, m: 'padded-near-miss' },
  ].map((d) => ({ text: fmt(d.v), misconception: d.m }));

  const distractors = takeUnique(shuffle(rng, candidatePool), 3, answerText);

  const correct = { text: answerText, misconception: null };
  const options = [correct, ...distractors];

  const whyWrong = {};
  for (const d of distractors) {
    if (d.misconception === 'indices-times2') whyWrong[d.text] = `That comes from ${n + 1} × 2 — but a square number is ${n + 1} × ${n + 1}, not × 2.`;
    else if (d.misconception === 'stuck-same-term') whyWrong[d.text] = `That’s the PREVIOUS square number (${n}²) — the question asks for the NEXT one.`;
    else if (d.misconception === 'wrong-increment') whyWrong[d.text] = `The jump between square numbers grows each time — it isn’t just +${n}.`;
    else whyWrong[d.text] = 'Check: does multiplying that number by itself really give the next term in this sequence?';
  }

  return {
    templateId: 'sn-t1-next-square',
    stem: `The square numbers go ${seqTerms.map(fmt).join(', ')}, … What is the <b>next</b> square number?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `Square numbers come from n × n. What is ${n + 1} × ${n + 1}?`,
      `The gap between square numbers grows each time (+3, +5, +7…). The last gap was ${n * n - (n - 1) * (n - 1)}, so the next gap is ${2 * n + 1}.`,
    ],
    explain: {
      rule: RULE_INDICES,
      worked: `${n + 1}² = ${n + 1} × ${n + 1} = ${answerText}.`,
      whyWrong,
    },
  };
}

function t1SquareValue(rng) {
  const n = rngInt(rng, 2, 12);
  const answer = n * n;
  const answerText = fmt(answer);

  const candidatePool = [
    { v: n * 2, m: 'times2' },
    { v: n * 3, m: 'times3' },
    { v: (n - 1) * (n - 1), m: 'wrong-neighbour' },
    { v: (n + 1) * (n + 1), m: 'wrong-neighbour' },
    { v: n * n + n, m: 'wrong-increment' },
  ]
    .filter((d) => d.v >= 0)
    .map((d) => ({ text: fmt(d.v), misconception: d.m }));

  const distractors = takeUnique(shuffle(rng, candidatePool), 3, answerText);

  const correct = { text: answerText, misconception: null };
  const options = [correct, ...distractors];

  const whyWrong = {};
  for (const d of distractors) {
    if (d.misconception === 'times2') whyWrong[d.text] = `That’s ${n} × 2 — but ${n}² means ${n} × ${n}, NOT ${n} × 2. Classic indices trap!`;
    else if (d.misconception === 'times3') whyWrong[d.text] = `That’s ${n} × 3 — the small 2 means multiply by ITSELF, not by any other number.`;
    else if (d.misconception === 'wrong-neighbour') whyWrong[d.text] = `That’s a neighbouring number squared, not ${n}² itself.`;
    else whyWrong[d.text] = `Check your multiplication — ${n}² is ${n} × ${n}.`;
  }

  return {
    templateId: 'sn-t1-square-value',
    stem: `What is <b>${n}²</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      `The small “2” means “times itself”: ${n}² = ${n} × ${n}.`,
      `${n} × ${n} = …?`,
    ],
    explain: {
      rule: RULE_INDICES,
      worked: `${n}² = ${n} × ${n} = ${answerText}.`,
      whyWrong,
    },
  };
}

const FACTOR_BASES_T1 = [12, 16, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50];

function t1NotFactor(rng) {
  const N = pick(rng, FACTOR_BASES_T1);
  const allFactors = factorsOf(N);
  const candidateFactors = allFactors.filter((f) => f !== N);
  const chosenFactors = shuffle(rng, candidateFactors).slice(0, 3);

  const nonFactorPool = [
    { v: N * 2, m: 'is-multiple-not-factor' },
    { v: N + 1, m: 'off-by-one' },
    { v: N - 1, m: 'off-by-one' },
  ].filter((d) => d.v > 0 && !allFactors.includes(d.v));
  const correctChoice = pick(rng, nonFactorPool.length ? nonFactorPool : [{ v: N * 2, m: 'is-multiple-not-factor' }]);

  const stem = `Which of these numbers is <b>NOT</b> a factor of ${N}?`;
  const correct = { text: fmt(correctChoice.v), misconception: null };
  const options = [correct, ...chosenFactors.map((f) => ({ text: fmt(f), misconception: 'is-actually-factor', _v: f }))];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'is-actually-factor') whyWrong[o.text] = `${N} ÷ ${o._v} = ${N / o._v} exactly — that IS a factor, not the odd one out.`;
  }

  return {
    templateId: 'sn-t1-not-factor',
    stem,
    options: options.map((o) => ({ text: o.text, misconception: o.misconception })),
    correctIndex: 0,
    hintSteps: [
      `A factor divides INTO ${N} exactly, with nothing left over. Try dividing ${N} by each option.`,
      `${chosenFactors.map((f) => `${N} ÷ ${f} = ${N / f}`).join(', ')} — all whole numbers. Which option leaves a remainder?`,
    ],
    explain: {
      rule: RULE_FACTORS,
      worked: `${N} ÷ ${correctChoice.v} is not a whole number, so ${correctChoice.v} is NOT a factor of ${N}. Every other option divides in exactly.`,
      whyWrong,
    },
  };
}

// -------- T2 templates --------

const FACTOR_BASES_T2 = [12, 16, 18, 20, 24, 30, 36, 40, 42, 48, 60, 72];

function t2NotFactor(rng) {
  const N = pick(rng, FACTOR_BASES_T2);
  const allFactors = factorsOf(N);
  const candidateFactors = allFactors.filter((f) => f !== N);
  const chosenFactors = shuffle(rng, candidateFactors).slice(0, 4);

  const nonFactorPool = [
    { v: N * 2, m: 'is-multiple-not-factor' },
    { v: N + 1, m: 'off-by-one' },
    { v: N - 1, m: 'off-by-one' },
  ].filter((d) => d.v > 0 && !allFactors.includes(d.v));
  const correctChoice = pick(rng, nonFactorPool.length ? nonFactorPool : [{ v: N * 2, m: 'is-multiple-not-factor' }]);

  const stem = `Which of these numbers is <b>NOT</b> a factor of ${N}?`;
  const correct = { text: fmt(correctChoice.v), misconception: null };
  const options = [correct, ...chosenFactors.map((f) => ({ text: fmt(f), misconception: 'is-actually-factor', _v: f }))];

  const whyWrong = {};
  for (const o of options) {
    if (o.misconception === 'is-actually-factor') whyWrong[o.text] = `${N} ÷ ${o._v} = ${N / o._v} exactly — that IS a factor, not the odd one out.`;
  }

  return {
    templateId: 'sn-t2-not-factor',
    stem,
    options: options.map((o) => ({ text: o.text, misconception: o.misconception })),
    correctIndex: 0,
    hintSteps: [
      `A factor divides INTO ${N} exactly. Try dividing ${N} by each option.`,
      `${chosenFactors.map((f) => `${N} ÷ ${f} = ${N / f}`).join(', ')} — all whole numbers. Which option leaves a remainder or isn’t even close?`,
    ],
    explain: {
      rule: RULE_FACTORS,
      worked: `${N} ÷ ${correctChoice.v} is not a whole number, so ${correctChoice.v} is NOT a factor of ${N}. Every other option divides in exactly.`,
      whyWrong,
    },
  };
}

const SQCUBE_BASES = [2, 3, 4, 5, 10];

function t2SquareVsCube(rng) {
  const n = pick(rng, SQCUBE_BASES);
  const askCube = rng() < 0.5;
  const answer = askCube ? n ** 3 : n ** 2;
  const other = askCube ? n ** 2 : n ** 3;
  const answerText = fmt(answer);

  const candidatePool = [
    { v: other, m: askCube ? 'square-not-cube' : 'cube-not-square' },
    { v: n * 3, m: 'times-index' },
    { v: n * 2, m: 'times-index' },
    { v: askCube ? (n + 1) ** 3 : (n + 1) ** 2, m: 'wrong-neighbour' },
    { v: askCube ? Math.max(0, (n - 1) ** 3) : Math.max(0, (n - 1) ** 2), m: 'wrong-neighbour' },
  ].map((d) => ({ text: fmt(d.v), misconception: d.m }));

  const distractors = takeUnique(shuffle(rng, candidatePool), 4, answerText);

  const correct = { text: answerText, misconception: null };
  const options = [correct, ...distractors];

  const indexWord = askCube ? '3' : '2';
  const whyWrong = {};
  for (const d of distractors) {
    if (d.misconception === 'square-not-cube') whyWrong[d.text] = `That’s ${n}² (squared = × itself twice) — the question asks for ${n} CUBED (× itself three times).`;
    else if (d.misconception === 'cube-not-square') whyWrong[d.text] = `That’s ${n}³ (cubed = × itself three times) — the question asks for ${n} SQUARED (× itself twice).`;
    else if (d.misconception === 'times-index') whyWrong[d.text] = `The small ${indexWord} means “multiply by itself”, not “multiply by ${indexWord}”.`;
    else whyWrong[d.text] = `That’s a neighbouring number’s ${askCube ? 'cube' : 'square'}, not ${n}’s.`;
  }

  return {
    templateId: 'sn-t2-square-vs-cube',
    stem: askCube ? `Which of these is <b>${n}³</b> (${n} cubed)?` : `Which of these is <b>${n}²</b> (${n} squared)?`,
    options,
    correctIndex: 0,
    hintSteps: [
      askCube ? `${n}³ means ${n} × ${n} × ${n}.` : `${n}² means ${n} × ${n}.`,
      askCube ? `${n} × ${n} = ${n * n}, then × ${n} = …?` : `${n} × ${n} = …?`,
    ],
    explain: {
      rule: RULE_INDICES,
      worked: askCube ? `${n}³ = ${n} × ${n} × ${n} = ${answerText}.` : `${n}² = ${n} × ${n} = ${answerText}.`,
      whyWrong,
    },
  };
}

function t2PrimeInRange(rng) {
  const start = pick(rng, [1, 11, 21]);
  const end = start + 9;
  const nums = [];
  for (let v = start; v <= end; v++) nums.push(v);
  const primesInRange = nums.filter(isPrime);
  const compositesInRange = nums.filter((v) => !isPrime(v));

  const target = pick(rng, primesInRange);
  const pool = shuffle(rng, compositesInRange.filter((v) => v !== target)).map((v) => ({
    text: fmt(v),
    misconception: primeDistractorMisconception(v),
    _v: v,
  }));
  const distractors = takeUnique(pool, 4, fmt(target));

  const correct = { text: fmt(target), misconception: null };
  const options = [correct, ...distractors.map((d) => ({ text: d.text, misconception: d.misconception }))];

  const whyWrong = {};
  for (const d of distractors) whyWrong[d.text] = primeWhyWrong(d._v);

  return {
    templateId: 'sn-t2-prime-in-range',
    stem: `Which of these numbers between ${start} and ${end} is <b>prime</b>?`,
    options,
    correctIndex: 0,
    hintSteps: [
      'Cross out anything you know is NOT prime first: even numbers (except 2) and anything ending in 5 or 0 (except 5 itself).',
      `Test-divide what’s left by 3 and 7. ${fmt(target)} should have only two factors.`,
    ],
    explain: {
      rule: RULE,
      worked: `${fmt(target)}’s only factors are 1 and ${fmt(target)} — exactly two — so it is prime. The rest all have extra factors.`,
      whyWrong,
    },
  };
}

// -------- T3 templates (num, write-in) --------

function t3SquareMinus(rng) {
  const n = rngInt(rng, 3, 12);
  const sq = n * n;
  const m = rngInt(rng, 1, sq - 1);
  const answer = sq - m;
  const stem = `Work out: <b>${n}²</b> − ${m} = ?`;

  return {
    templateId: 'sn-t3-square-minus',
    stem,
    format: 'num',
    accept: [String(answer)],
    hintSteps: [
      `First work out ${n}² = ${n} × ${n} = ${sq}.`,
      `Now subtract: ${sq} − ${m} = ?`,
    ],
    explain: {
      rule: RULE_INDICES,
      worked: `${n}² = ${sq}. ${sq} − ${m} = ${answer}.`,
      whyWrong: {},
    },
  };
}

function t3SumPrimesRange(rng) {
  let start = 10;
  let end = 20;
  let primesIn = [11, 13, 17, 19];
  for (let tries = 0; tries < 30; tries++) {
    const s = rngInt(rng, 0, 20);
    const e = s + 10;
    const list = [];
    for (let v = s + 1; v < e; v++) if (isPrime(v)) list.push(v);
    if (list.length >= 2) {
      start = s;
      end = e;
      primesIn = list;
      break;
    }
  }
  const answer = primesIn.reduce((a, b) => a + b, 0);
  const stem = `Find the sum of all the prime numbers between ${start} and ${end}.`;

  return {
    templateId: 'sn-t3-sum-primes-range',
    stem,
    format: 'num',
    accept: [String(answer)],
    hintSteps: [
      `List the primes between ${start} and ${end}: they are ${primesIn.join(', ')}.`,
      `Add them together: ${primesIn.join(' + ')} = ?`,
    ],
    explain: {
      rule: RULE,
      worked: `The primes between ${start} and ${end} are ${primesIn.join(', ')}. ${primesIn.join(' + ')} = ${answer}.`,
      whyWrong: {},
    },
  };
}

function t3TriangularNext(rng) {
  const k = rngInt(rng, 3, 8);
  const terms = [];
  for (let i = 1; i <= k; i++) terms.push((i * (i + 1)) / 2);
  const answer = ((k + 1) * (k + 2)) / 2;
  // shaded cells as [r,c] pairs — matches js/engine/diagrams.js buildPolygrid's isShaded check
  const shaded = [];
  for (let r = 0; r < k; r++) {
    for (let c = 0; c <= r; c++) shaded.push([r, c]);
  }
  const stem = `The triangular numbers go ${terms.map(fmt).join(', ')}, … What is the <b>next</b> one?`;

  return {
    templateId: 'sn-t3-triangular-next',
    stem,
    format: 'num',
    visual: { kind: 'polygrid', rows: k, cols: k, shaded },
    accept: [String(answer)],
    hintSteps: [
      `Triangular numbers grow by one more each time: the jump goes up by one every time (+2, +3, +4…).`,
      `The last jump you can see was +${k}. What is the next jump?`,
    ],
    explain: {
      rule: RULE_TRIANGULAR,
      worked: `Triangular numbers add one more each time. ${fmt(terms[k - 1])} + ${k + 1} = ${fmt(answer)}.`,
      whyWrong: {},
    },
  };
}

function t3CubeValue(rng) {
  const n = pick(rng, SQCUBE_BASES);
  const answer = n ** 3;
  const stem = `What is <b>${n}³</b> (${n} cubed)?`;
  const accept = answer >= 1000 ? [String(answer), fmt(answer)] : [String(answer)];

  return {
    templateId: 'sn-t3-cube-value',
    stem,
    format: 'num',
    accept,
    hintSteps: [
      `${n}³ means ${n} × ${n} × ${n}.`,
      `${n} × ${n} = ${n * n}, then × ${n} = ?`,
    ],
    explain: {
      rule: RULE_INDICES,
      worked: `${n}³ = ${n} × ${n} × ${n} = ${fmt(answer)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1WhichIsPrime, t1NextSquare, t1SquareValue, t1NotFactor];
const T2 = [t2NotFactor, t2SquareVsCube, t2PrimeInRange];
const T3 = [t3SquareMinus, t3SumPrimesRange, t3TriangularNext, t3CubeValue];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `sn-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'special-numbers',
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
