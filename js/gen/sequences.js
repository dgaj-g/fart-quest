// FART QUEST — GEN agent
// Topic: sequences (Pattern Path). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Find the jump between neighbours FIRST. The jump reveals everything.';

function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
}

// ---------- shared option helpers ----------

// Pick up to `count` unique (by text) distractors from a shuffled candidate pool, skipping
// anything that collides with the correct text or an already-chosen distractor.
function pickDistractors(rng, correctText, pool, count) {
  const shuffled = shuffle(rng, pool);
  const seen = new Set([correctText]);
  const out = [];
  for (const c of shuffled) {
    if (out.length >= count) break;
    if (seen.has(c.text)) continue;
    seen.add(c.text);
    out.push(c);
  }
  return out;
}

// Generic fallback padding: plausible nearby integers, used only if a template's own candidate
// pool collapsed too far after dedup. Never produces the correct value itself.
function padGeneric(rng, correctVal, seen, need, allowNegative) {
  const out = [];
  const offsets = shuffle(rng, [1, -1, 2, -2, 3, -3, 5, -5, 7, -7]);
  for (const off of offsets) {
    if (out.length >= need) break;
    const v = correctVal + off;
    if (!allowNegative && v < 0) continue;
    const text = fmt(v);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push({ text, misconception: 'padded-near-miss' });
  }
  return out;
}

function makeOptions(rng, correct, pool, targetTotal, allowNegative) {
  const seen = new Set([correct.text]);
  const chosen = pickDistractors(rng, correct.text, pool, targetTotal - 1);
  chosen.forEach((c) => seen.add(c.text));
  const options = [correct, ...chosen];
  if (options.length < targetTotal) {
    const correctVal = Number(String(correct.text).replace(/[,−]/g, (m) => (m === '−' ? '-' : '')));
    const extra = padGeneric(rng, correctVal, seen, targetTotal - options.length, allowNegative);
    options.push(...extra);
  }
  return options;
}

// ---------- T1 templates (ascending / descending / missing-middle / numline) ----------

function t1NextTermAscending(rng) {
  const d = rngInt(rng, 2, 9);
  const s = rngInt(rng, 1, 20);
  const t0 = s, t1 = s + d, t2 = s + 2 * d, t3 = s + 3 * d;
  const answer = s + 4 * d;

  const stem = `${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, <b>?</b>`;
  const pool = [
    { text: fmt(t3), misconception: 'no-jump' },
    { text: fmt(answer + d), misconception: 'double-jump' },
    { text: fmt(t2), misconception: 'wrong-position' },
    { text: fmt(d), misconception: 'jump-as-answer' },
    { text: fmt(t0), misconception: 'reset-to-start' },
    { text: fmt(answer + 2 * d), misconception: 'double-jump' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'no-jump') whyWrong[o.text] = 'That is just the last term shown — you still need to apply the jump.';
    else if (o.misconception === 'double-jump') whyWrong[o.text] = 'You jumped one time too many — count the terms again.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is a term already shown earlier in the sequence, not the next one.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the jump itself, not a term — add it to the last term to get the answer.';
    else if (o.misconception === 'reset-to-start') whyWrong[o.text] = 'That is the very first term — the sequence has moved on since then.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the jump again — recompute it from two neighbouring terms.';
  });

  return {
    templateId: 'seq-t1-next-ascending',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what do you add to ${fmt(t0)} to get ${fmt(t1)}?`,
      `The jump is +${d}. So what is ${fmt(t3)} + ${d}?`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is +${d} each time: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t1NextTermDescendingNoZero(rng) {
  const d = rngInt(rng, 2, 9);
  const s = rngInt(rng, 4 * d + 5, 4 * d + 60);
  const t0 = s, t1 = s - d, t2 = s - 2 * d, t3 = s - 3 * d;
  const answer = s - 4 * d; // always positive by construction

  const stem = `${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, <b>?</b>`;
  const pool = [
    { text: fmt(t3), misconception: 'no-jump' },
    { text: fmt(Math.max(0, answer - d)), misconception: 'double-jump' },
    { text: fmt(t2), misconception: 'wrong-position' },
    { text: fmt(d), misconception: 'jump-as-answer' },
    { text: fmt(t0), misconception: 'reset-to-start' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, false);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'no-jump') whyWrong[o.text] = 'That is just the last term shown — you still need to apply the jump.';
    else if (o.misconception === 'double-jump') whyWrong[o.text] = 'You jumped one time too many — count the terms again.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is a term already shown earlier in the sequence, not the next one.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the jump itself, not a term — subtract it from the last term to get the answer.';
    else if (o.misconception === 'reset-to-start') whyWrong[o.text] = 'That is the very first term — the sequence has moved on since then.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the jump again — recompute it from two neighbouring terms.';
  });

  return {
    templateId: 'seq-t1-next-descending',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what do you subtract from ${fmt(t0)} to get ${fmt(t1)}?`,
      `The jump is −${d}. So what is ${fmt(t3)} − ${d}?`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is −${d} each time: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t1MissingMiddleAscending(rng) {
  const d = rngInt(rng, 2, 9);
  const s = rngInt(rng, 1, 20);
  const t0 = s, t1 = s + d, t2 = s + 2 * d, t3 = s + 3 * d, t4 = s + 4 * d;
  const answer = t2;

  const stem = `${fmt(t0)}, ${fmt(t1)}, <b>?</b>, ${fmt(t3)}, ${fmt(t4)}`;
  const pool = [
    { text: fmt(t1), misconception: 'no-jump' },
    { text: fmt(t3), misconception: 'wrong-position' },
    { text: fmt(d), misconception: 'jump-as-answer' },
    { text: fmt(t0), misconception: 'reset-to-start' },
    { text: fmt(t4), misconception: 'wrong-position' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'no-jump') whyWrong[o.text] = 'That just repeats the term before the gap — you still need to add the jump.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is a different visible term in the sequence, not the missing one.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the jump itself, not a term in the sequence.';
    else if (o.misconception === 'reset-to-start') whyWrong[o.text] = 'That is the very first term — too far back for the missing gap.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the jump again — recompute it from two neighbouring terms.';
  });

  return {
    templateId: 'seq-t1-missing-middle',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what do you add to ${fmt(t0)} to get ${fmt(t1)}?`,
      `The jump is +${d}. So what is ${fmt(t1)} + ${d}?`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is +${d} each time: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(t4)}. The missing term is ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t1NumlineNextTerm(rng) {
  const d = rngInt(rng, 2, 9);
  const s = rngInt(rng, 1, 12);
  const t0 = s, t1 = s + d, t2 = s + 2 * d, t3 = s + 3 * d;
  const answer = s + 4 * d;
  const range = answer - t0;
  const posOf = (v) => Math.round(((v - t0) / range) * 100);

  const stem = `${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, <b>?</b>`;
  const visualHtml = `<div class="numline" data-min="${t0}" data-max="${answer}">
  <div class="camp camp-a">${fmt(t0)}</div>
  <div class="numline-track">
    <span class="numline-marker" style="--pos:${posOf(t0)}%">${fmt(t0)}</span>
    <span class="numline-marker" style="--pos:${posOf(t1)}%">${fmt(t1)}</span>
    <span class="numline-marker" style="--pos:${posOf(t2)}%">${fmt(t2)}</span>
    <span class="numline-marker" style="--pos:${posOf(t3)}%">${fmt(t3)}</span>
  </div>
  <div class="camp camp-b">?</div>
</div>`;

  const pool = [
    { text: fmt(t3), misconception: 'no-jump' },
    { text: fmt(answer + d), misconception: 'double-jump' },
    { text: fmt(t2), misconception: 'wrong-position' },
    { text: fmt(d), misconception: 'jump-as-answer' },
    { text: fmt(t0), misconception: 'reset-to-start' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'no-jump') whyWrong[o.text] = 'That is just the last marker on the line — you still need to apply the jump.';
    else if (o.misconception === 'double-jump') whyWrong[o.text] = 'You jumped one time too many along the line — count the markers again.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is an earlier marker on the line, not the mystery point.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the jump itself (the gap between markers), not a term.';
    else if (o.misconception === 'reset-to-start') whyWrong[o.text] = 'That is the very first marker on the line.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the jump again — recompute it from two neighbouring markers.';
  });

  return {
    templateId: 'seq-t1-numline',
    stem,
    visual: { kind: 'numline', min: t0, max: answer, marker: t3, step: d, html: visualHtml },
    options,
    correctIndex: 0,
    hintSteps: [
      `Look at the markers on the line: what is the jump between ${fmt(t0)} and ${fmt(t1)}?`,
      `The jump is +${d}. So what is ${fmt(t3)} + ${d}?`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is +${d} each time: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

// ---------- T2 templates ----------

function t2CrossZeroNext(rng) {
  const m = rngInt(rng, 2, 9);
  const lastPositive = rngInt(rng, 0, m - 1); // t3, in [0, m-1]
  const t3 = lastPositive;
  const t2 = t3 + m;
  const t1 = t3 + 2 * m;
  const t0 = t3 + 3 * m;
  const answer = t3 - m; // negative, in [-m, -1]

  const stem = `${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, <b>?</b>`;
  const pool = [
    { text: fmt(Math.abs(answer)), misconception: 'sign-slip' },
    { text: fmt(t3), misconception: 'no-jump' },
    { text: fmt(t2), misconception: 'wrong-position' },
    { text: fmt(m), misconception: 'jump-as-answer' },
    { text: fmt(answer - m), misconception: 'double-jump' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'sign-slip') whyWrong[o.text] = `You found the right SIZE jump but forgot to cross into negative numbers — ${fmt(t3)} − ${m} goes past zero to ${fmt(answer)}, not up to a positive number.`;
    else if (o.misconception === 'no-jump') whyWrong[o.text] = 'That just repeats the last term — you still need to apply the jump.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is a term already shown earlier in the sequence.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the jump itself, not a term in the sequence.';
    else if (o.misconception === 'double-jump') whyWrong[o.text] = 'You jumped one time too many — count the terms again.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the jump again — recompute it from two neighbouring terms.';
  });

  return {
    templateId: 'seq-t2-crosszero-next',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what happens each time you move along — ${fmt(t0)} to ${fmt(t1)}, then ${fmt(t1)} to ${fmt(t2)}?`,
      `The jump is −${m} each time. So what is ${fmt(t3)} − ${m}? Careful — the answer may cross zero into negative numbers.`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is −${m} each time: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(answer)}. Crossing zero does not break the pattern — just keep subtracting ${m}.`,
      whyWrong,
    },
  };
}

function t2CrossZeroMissing(rng) {
  const m = rngInt(rng, 2, 9);
  const s = rngInt(rng, 1, 4 * m - 1); // guarantees s>0 and s-4m<0
  const t0 = s, t1 = s - m, t2 = s - 2 * m, t3 = s - 3 * m, t4 = s - 4 * m;
  const answer = t2;

  const stem = `${fmt(t0)}, ${fmt(t1)}, <b>?</b>, ${fmt(t3)}, ${fmt(t4)}`;
  const signSlipVal = answer !== 0 ? -answer : t1; // 0 has no useful sign flip; fall back
  const pool = [
    { text: fmt(signSlipVal), misconception: 'sign-slip' },
    { text: fmt(t1), misconception: 'no-jump' },
    { text: fmt(t3), misconception: 'wrong-position' },
    { text: fmt(m), misconception: 'jump-as-answer' },
    { text: fmt(t0), misconception: 'reset-to-start' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'sign-slip') whyWrong[o.text] = 'Check the sign carefully — as the sequence crosses zero the terms keep falling, they do not flip back to positive.';
    else if (o.misconception === 'no-jump') whyWrong[o.text] = 'That just repeats the term before the gap — you still need to apply the jump.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is a different visible term in the sequence, not the missing one.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the jump itself, not a term in the sequence.';
    else if (o.misconception === 'reset-to-start') whyWrong[o.text] = 'That is the very first term — too far back for the missing gap.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the jump again — recompute it from two neighbouring terms.';
  });

  return {
    templateId: 'seq-t2-crosszero-missing',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what happens each time you move along — ${fmt(t0)} to ${fmt(t1)}?`,
      `The jump is −${m} each time. So what is ${fmt(t1)} − ${m}? Careful if it crosses zero.`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is −${m} each time: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(t4)}. The missing term is ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t2Doubling(rng) {
  const a = rngInt(rng, 2, 12);
  const t0 = a, t1 = 2 * a, t2 = 4 * a, t3 = 8 * a;
  const answer = 16 * a;
  const arithmeticContinuation = t3 + 4 * a; // treats the last gap (4a) as a constant add-on

  const stem = `${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, <b>?</b>`;
  const pool = [
    { text: fmt(arithmeticContinuation), misconception: 'treated-as-arithmetic' },
    { text: fmt(t3), misconception: 'no-jump' },
    { text: fmt(t3 * 3), misconception: 'tripled' },
    { text: fmt(a), misconception: 'jump-as-answer' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'treated-as-arithmetic') whyWrong[o.text] = 'This sequence DOUBLES each time, it does not add a fixed amount — the jump itself keeps getting bigger.';
    else if (o.misconception === 'no-jump') whyWrong[o.text] = 'That just repeats the last term — you still need to double it.';
    else if (o.misconception === 'tripled') whyWrong[o.text] = 'That triples the last term — the rule here is DOUBLE (× 2), not × 3.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the starting number, not the next term.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the rule again — this sequence doubles each time.';
  });

  return {
    templateId: 'seq-t2-doubling',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what do you do to ${fmt(t0)} to get ${fmt(t1)}?`,
      `Each term DOUBLES. So what is ${fmt(t3)} × 2?`,
    ],
    explain: {
      rule: RULE,
      worked: `Each term doubles: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t2Halving(rng) {
  const r = rngInt(rng, 1, 20);
  const t0 = 16 * r, t1 = 8 * r, t2 = 4 * r, t3 = 2 * r;
  const answer = r;

  const stem = `${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, <b>?</b>`;
  const pool = [
    { text: fmt(t3 * 2), misconception: 'doubled-not-halved' },
    { text: fmt(t3), misconception: 'no-jump' },
    { text: fmt(t2), misconception: 'wrong-position' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'doubled-not-halved') whyWrong[o.text] = 'This sequence HALVES each time — you doubled it instead of dividing by 2.';
    else if (o.misconception === 'no-jump') whyWrong[o.text] = 'That just repeats the last term — you still need to halve it.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is a term already shown earlier in the sequence, not the next one.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the rule again — this sequence halves each time.';
  });

  return {
    templateId: 'seq-t2-halving',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what do you do to ${fmt(t0)} to get ${fmt(t1)}?`,
      `Each term HALVES. So what is ${fmt(t3)} ÷ 2?`,
    ],
    explain: {
      rule: RULE,
      worked: `Each term halves: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function t2RuleInWords(rng) {
  const d = rngInt(rng, 2, 9);
  const s = rngInt(rng, 1, 20);
  const ascending = rng() < 0.5;
  const step = ascending ? d : -d;
  const t0 = s, t1 = s + step, t2 = s + 2 * step, t3 = s + 3 * step;
  const stem = `Which rule describes the sequence <b>${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}</b>?`;
  const verb = ascending ? 'add' : 'subtract';
  const correctRule = `Start at ${fmt(t0)}, ${verb} ${d} each time.`;

  const pool = [
    { text: `Start at ${fmt(t1)}, ${verb} ${d} each time.`, misconception: 'wrong-start' },
    { text: `Start at ${fmt(t0)}, ${verb} ${d + 1} each time.`, misconception: 'wrong-step' },
    { text: `Start at ${fmt(t0)}, ${ascending ? 'subtract' : 'add'} ${d} each time.`, misconception: 'wrong-direction' },
    { text: `Start at ${fmt(t0)}, multiply by ${d} each time.`, misconception: 'wrong-operation' },
  ];
  const correct = { text: correctRule, misconception: null };
  // These are text rules, not plain numbers — pad generically doesn't apply the same way, so we
  // just take from the pool directly (it always has 4 candidates, giving 5 total with correct).
  const seen = new Set([correct.text]);
  const chosen = pickDistractors(rng, correct.text, pool, 4);
  const options = [correct, ...chosen];

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'wrong-start') whyWrong[o.text] = `That starts at the WRONG number — the sequence actually starts at ${fmt(t0)}.`;
    else if (o.misconception === 'wrong-step') whyWrong[o.text] = `That uses the wrong jump size — check the gap between ${fmt(t0)} and ${fmt(t1)} again.`;
    else if (o.misconception === 'wrong-direction') whyWrong[o.text] = `That goes the wrong way — the sequence actually ${verb}s each time, it does not ${ascending ? 'subtract' : 'add'}.`;
    else if (o.misconception === 'wrong-operation') whyWrong[o.text] = 'That describes a doubling/multiplying pattern — this sequence has a constant jump, not a changing one.';
  });

  return {
    templateId: 'seq-t2-rule-in-words',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what is the gap between ${fmt(t0)} and ${fmt(t1)}?`,
      `A correct rule must match BOTH the starting number (${fmt(t0)}) AND that jump.`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is ${ascending ? '+' : '−'}${d} each time, starting at ${fmt(t0)}: "${correctRule}"`,
      whyWrong,
    },
  };
}

// ---------- T3 templates ----------

function t3FarTermStructure(rng) {
  const s = rngInt(rng, 1, 30);
  const d = rngInt(rng, 2, 12);
  const n = rngInt(rng, 10, 40);
  const jumps = n - 1;
  const answer = s + jumps * d;

  const stem = `A sequence starts at <b>${fmt(s)}</b> and jumps by <b>${d}</b> each time. What is the <b>${ordinal(n)} term</b>?`;

  return {
    templateId: 'seq-t3-far-term',
    stem,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Do not list every term! How many JUMPS get you from the 1st term to the ${ordinal(n)} term?`,
      `That is ${jumps} jumps (one fewer than the term number). Work out ${s} + (${jumps} × ${d}).`,
    ],
    explain: {
      rule: RULE,
      worked: `From the 1st term to the ${ordinal(n)} term is ${jumps} jumps. ${s} + (${jumps} × ${d}) = ${answer}.`,
      whyWrong: {},
    },
  };
}

function t3DoublingNum(rng) {
  const a = rngInt(rng, 2, 12);
  const t0 = a, t1 = 2 * a, t2 = 4 * a, t3 = 8 * a;
  const answer = 16 * a;
  const stem = `${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, <b>?</b> (this sequence doubles each time)`;

  return {
    templateId: 'seq-t3-doubling-writein',
    stem,
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Find the jump: what do you do to ${fmt(t0)} to get ${fmt(t1)}?`,
      `Each term doubles. So what is ${fmt(t3)} × 2?`,
    ],
    explain: {
      rule: RULE,
      worked: `Each term doubles: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(answer)}.`,
      whyWrong: {},
    },
  };
}

function t3GrowingPatternCount(rng) {
  const firstCount = rngInt(rng, 2, 6);
  const step = rngInt(rng, 1, 4);
  const n = rngInt(rng, 5, 12);
  const answer = firstCount + (n - 1) * step;
  const p2 = firstCount + step;
  const p3 = firstCount + 2 * step;

  const stem = `Pattern 1 has <b>${firstCount}</b> tiles. Pattern 2 has <b>${p2}</b> tiles. Pattern 3 has <b>${p3}</b> tiles. If it keeps growing the same way, how many tiles are in <b>Pattern ${n}</b>?`;

  const tileSpan = (count) => Array.from({ length: count }, () => '<span style="width:12px;height:12px;background:var(--swamp-deep);border-radius:2px;display:inline-block;"></span>').join('');
  const visualHtml = `<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
  <div style="text-align:center;"><div style="font-size:11px;font-weight:700;margin-bottom:4px;">Pattern 1</div><div style="display:flex;gap:2px;flex-wrap:wrap;width:60px;">${tileSpan(firstCount)}</div></div>
  <div style="text-align:center;"><div style="font-size:11px;font-weight:700;margin-bottom:4px;">Pattern 2</div><div style="display:flex;gap:2px;flex-wrap:wrap;width:60px;">${tileSpan(p2)}</div></div>
  <div style="text-align:center;"><div style="font-size:11px;font-weight:700;margin-bottom:4px;">Pattern 3</div><div style="display:flex;gap:2px;flex-wrap:wrap;width:60px;">${tileSpan(p3)}</div></div>
</div>`;

  return {
    templateId: 'seq-t3-growing-pattern',
    stem,
    visual: { kind: 'polygrid', rows: 1, cols: firstCount, shaded: Array.from({ length: firstCount }, (_, i) => i), html: visualHtml },
    format: 'num',
    accept: [String(answer), fmt(answer)],
    hintSteps: [
      `Find the jump between patterns first: what is the gap between Pattern 1 (${firstCount}) and Pattern 2 (${p2})?`,
      `The jump is +${step} each time. From Pattern 1 to Pattern ${n} is ${n - 1} jumps: ${firstCount} + (${n - 1} × ${step}).`,
    ],
    explain: {
      rule: RULE,
      worked: `The tile count jumps by +${step} each pattern. From Pattern 1 to Pattern ${n} is ${n - 1} jumps: ${firstCount} + (${n - 1} × ${step}) = ${answer}.`,
      whyWrong: {},
    },
  };
}

function t3CrossZeroMcq(rng) {
  const m = rngInt(rng, 3, 9);
  const s = rngInt(rng, 1, 4 * m - 1);
  const t0 = s, t1 = s - m, t2 = s - 2 * m, t3 = s - 3 * m, t4 = s - 4 * m;
  const answer = t2;

  const stem = `Find the missing term: ${fmt(t0)}, ${fmt(t1)}, <b>?</b>, ${fmt(t3)}, ${fmt(t4)}`;
  const signSlipVal = answer !== 0 ? -answer : t1;
  const pool = [
    { text: fmt(signSlipVal), misconception: 'sign-slip' },
    { text: fmt(t1), misconception: 'no-jump' },
    { text: fmt(t3), misconception: 'wrong-position' },
    { text: fmt(m), misconception: 'jump-as-answer' },
    { text: fmt(t0), misconception: 'reset-to-start' },
  ];
  const correct = { text: fmt(answer), misconception: null };
  const options = makeOptions(rng, correct, pool, 5, true);

  const whyWrong = {};
  options.forEach((o) => {
    if (o.misconception === 'sign-slip') whyWrong[o.text] = 'Check the sign carefully — as the sequence crosses zero the terms keep falling, they do not flip back to positive.';
    else if (o.misconception === 'no-jump') whyWrong[o.text] = 'That just repeats the term before the gap — you still need to apply the jump.';
    else if (o.misconception === 'wrong-position') whyWrong[o.text] = 'That is a different visible term in the sequence, not the missing one.';
    else if (o.misconception === 'jump-as-answer') whyWrong[o.text] = 'That is the jump itself, not a term in the sequence.';
    else if (o.misconception === 'reset-to-start') whyWrong[o.text] = 'That is the very first term — too far back for the missing gap.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Check the jump again — recompute it from two neighbouring terms.';
  });

  return {
    templateId: 'seq-t3-crosszero-mcq',
    stem,
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the jump between neighbours first: what happens each time you move along — ${fmt(t0)} to ${fmt(t1)}?`,
      `The jump is −${m} each time. So what is ${fmt(t1)} − ${m}? Careful if it crosses zero.`,
    ],
    explain: {
      rule: RULE,
      worked: `The jump is −${m} each time: ${fmt(t0)}, ${fmt(t1)}, ${fmt(t2)}, ${fmt(t3)}, ${fmt(t4)}. The missing term is ${fmt(answer)}.`,
      whyWrong,
    },
  };
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// -------- dispatch --------

const T1 = [t1NextTermAscending, t1NextTermDescendingNoZero, t1MissingMiddleAscending, t1NumlineNextTerm];
const T2 = [t2CrossZeroNext, t2CrossZeroMissing, t2Doubling, t2Halving, t2RuleInWords];
const T3 = [t3FarTermStructure, t3DoublingNum, t3GrowingPatternCount, t3CrossZeroMcq];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `seq-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'sequences',
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
