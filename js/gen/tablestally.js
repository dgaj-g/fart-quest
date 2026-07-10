// FART QUEST — GEN agent
// Topic: tables-tally (The Tally Tip). generate(tier, rng) -> Question.
import { rngInt, pick, shuffle } from '../rng.js';

const RULE = 'Tally gates come in fives: four sticks and a gate. Count gates, then strays.';

// Single number formatter used everywhere in this generator (no float junk, no imperial —
// these are all whole-number counts, so this is just UK thousands-comma formatting).
function fmt(n) {
  return Math.round(n).toLocaleString('en-GB');
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

// Pads with plausible near-miss numeric distractors (never random garbage, never negative —
// the numpad has no minus key) if the crafted set left us short of the tier minimum after dedup.
function padWithNearMiss(rng, options, minTotal, correctVal, spread) {
  const seen = new Set(options.map((o) => o.text));
  let tries = 0;
  const step = Math.max(1, Math.round(spread));
  while (options.length < minTotal && tries < 80) {
    tries += 1;
    const delta = rngInt(rng, 1, step * 3) * (rng() < 0.5 ? 1 : -1);
    const val = Math.round(correctVal + delta);
    if (val < 0) continue;
    const text = fmt(val);
    if (seen.has(text)) continue;
    seen.add(text);
    options.push({ text, misconception: 'padded-near-miss' });
  }
  return options;
}

function buildWhyWrong(options) {
  const whyWrong = {};
  for (const o of options) {
    if (whyWrong[o.text]) continue;
    if (o.misconception === 'stray-miscount') whyWrong[o.text] = 'The lonely stray sticks after the gates were miscounted — count them again, one at a time.';
    else if (o.misconception === 'missed-gate') whyWrong[o.text] = 'A whole gate (worth 5) got left out of the count — check every closed gate, not just some of them.';
    else if (o.misconception === 'gate-is-six') whyWrong[o.text] = 'That treats a gate as worth SIX — a gate is always four sticks plus one closing slash, which makes exactly five.';
    else if (o.misconception === 'wrong-row') whyWrong[o.text] = 'One finger slipped onto the wrong ROW — that’s a different category entirely.';
    else if (o.misconception === 'wrong-column') whyWrong[o.text] = 'One finger slipped onto the wrong COLUMN — check the header again.';
    else if (o.misconception === 'near-miss-count') whyWrong[o.text] = 'Close, but recount the gates and strays for that row carefully.';
    else if (o.misconception === 'used-row-total') whyWrong[o.text] = 'That’s just the ROW TOTAL repeated back — you still need to subtract the other known group from it.';
    else if (o.misconception === 'added-not-subtracted') whyWrong[o.text] = 'That ADDS the known group onto the row total instead of subtracting it — the row total already includes that group.';
    else if (o.misconception === 'used-grand-total') whyWrong[o.text] = 'That uses the GRAND TOTAL for the whole table, not the total for just this one row.';
    else if (o.misconception === 'bare-value') whyWrong[o.text] = 'That’s just one category’s own total on its own — read the question again to see what it’s actually asking for.';
    else if (o.misconception === 'missed-one-category') whyWrong[o.text] = 'One whole category got left out when adding up the grand total — check every row was included.';
    else if (o.misconception === 'double-counted-row') whyWrong[o.text] = 'One category got added in TWICE — each row should only be counted once in the grand total.';
    else if (o.misconception === 'padded-near-miss') whyWrong[o.text] = 'Recount carefully, gate by gate, then add the strays.';
  }
  return whyWrong;
}

// ---------- survey theme bank ----------
// Different themed category lists so questions vary in flavour, not just numbers.
const THEMES = [
  { noun: 'pupils', categories: ['Football', 'Swimming', 'Netball', 'Athletics', 'Hockey'] },
  { noun: 'pupils', categories: ['Dogs', 'Cats', 'Rabbits', 'Fish', 'Hamsters'] },
  { noun: 'pupils', categories: ['Pizza', 'Pasta', 'Curry', 'Roast Dinner', 'Fish and Chips'] },
  { noun: 'pupils', categories: ['Red', 'Blue', 'Green', 'Purple', 'Yellow'] },
  { noun: 'pupils', categories: ['Walking', 'Bus', 'Car', 'Bicycle', 'Train'] },
  { noun: 'pupils', categories: ['Reading', 'Art', 'Coding', 'Drama', 'Chess Club'] },
];

const GROUP_PAIRS = [
  ['Boys', 'Girls'],
  ['Year 5', 'Year 6'],
  ['Morning', 'Afternoon'],
];

// ---------- tally-count building ----------
// Builds a set of category->count pairs for one theme. Counts are drawn WITHOUT replacement from
// the [minCount, 34] range (via shuffle) so they are always guaranteed distinct — this keeps
// "which category has count N" and "how many MORE chose X than Y" always unambiguous, with no
// best-effort retry-loop that could theoretically still collide. minCount defaults to 3 (enough
// for a single stray-and-gate read); callers that need to split a count several ways (e.g. across
// 4 subgroups) pass a higher minCount so every part stays >= 1.
function buildTallySurvey(rng, size, minCount = 3) {
  const theme = pick(rng, THEMES);
  const chosenCats = shuffle(rng, theme.categories).slice(0, size);
  const pool = [];
  for (let v = minCount; v <= 34; v++) pool.push(v);
  const counts = shuffle(rng, pool).slice(0, chosenCats.length);
  return { theme, rows: chosenCats.map((cat, i) => [cat, counts[i]]) };
}

function tallyVisual(rows) {
  return { kind: 'tally', rows: rows.map(([label, count]) => [label, count]) };
}

// ---------- T1 templates ----------

function t1ReadTallyRow(rng) {
  const survey = buildTallySurvey(rng, pick(rng, [4, 5]));
  const rows = survey.rows;
  const idx = rngInt(rng, 0, rows.length - 1);
  const [cat, count] = rows[idx];
  const full = Math.floor(count / 5);
  const rem = count % 5;
  const stem = `Using the tally chart, how many ${survey.theme.noun} chose <b>${cat}</b>?`;

  const distractors = [];
  if (rem > 0 || full > 0) distractors.push({ text: fmt(count + (rem === 4 ? -1 : 1)), misconception: 'stray-miscount' });
  if (full > 0) distractors.push({ text: fmt(count - 5), misconception: 'missed-gate' });
  // "gate-is-six" only makes sense (and only differs from correct) when there's at least one
  // full gate — with zero gates, full*6+rem collapses to the same value as full*5+rem.
  if (full > 0) distractors.push({ text: fmt(full * 6 + rem), misconception: 'gate-is-six' });
  const otherIdxs = shuffle(rng, rows.map((_, i) => i).filter((i) => i !== idx));
  for (const oi of otherIdxs) {
    distractors.push({ text: fmt(rows[oi][1]), misconception: 'wrong-row' });
  }

  const correct = { text: fmt(count), misconception: null };
  let options = [correct, ...dedupe(correct.text, distractors)].slice(0, 5);
  options = padWithNearMiss(rng, options, 4, count, 3);

  return {
    templateId: 'tt2-t1-read-tally-row',
    stem,
    visual: tallyVisual(rows),
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the ${cat} row. Count the GATES first — each closed gate is worth 5.`,
      full > 0
        ? `${cat} has ${full} gate${full === 1 ? '' : 's'} (${full} × 5 = ${full * 5}) and ${rem} stray${rem === 1 ? '' : 's'} left over. ${full * 5} + ${rem} = …?`
        : `${cat} has no full gates, just ${rem} stray stick${rem === 1 ? '' : 's'}.`,
    ],
    explain: {
      rule: RULE,
      worked: full > 0
        ? `${cat} has ${full} full gate${full === 1 ? '' : 's'} (${full} × 5 = ${full * 5}) plus ${rem} stray${rem === 1 ? '' : 's'}. ${full * 5} + ${rem} = ${count}.`
        : `${cat} has ${rem} stray stick${rem === 1 ? '' : 's'} and no full gates, so the count is ${count}.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

function t1WhichCategoryHasCount(rng) {
  const survey = buildTallySurvey(rng, pick(rng, [4, 5]));
  const rows = survey.rows;
  const idx = rngInt(rng, 0, rows.length - 1);
  const [targetCat, targetCount] = rows[idx];
  const stem = `Using the tally chart, which of these did exactly <b>${targetCount}</b> ${survey.theme.noun} choose?`;

  const otherIdxs = shuffle(rng, rows.map((_, i) => i).filter((i) => i !== idx));
  const distractors = otherIdxs.map((oi) => ({ text: rows[oi][0], misconception: 'wrong-row' }));

  const correct = { text: targetCat, misconception: null };
  const options = [correct, ...dedupe(targetCat, distractors)];

  return {
    templateId: 'tt2-t1-which-category',
    stem,
    visual: tallyVisual(rows),
    options,
    correctIndex: 0,
    hintSteps: [
      'Read each row’s gates and strays, and work out its total count.',
      `Which one comes to exactly ${targetCount}?`,
    ],
    explain: {
      rule: RULE,
      worked: `${targetCat} has ${Math.floor(targetCount / 5)} gate(s) and ${targetCount % 5} stray(s), giving ${targetCount}.`,
      whyWrong: (() => {
        const whyWrong = {};
        for (const o of options) {
          if (o.misconception === 'wrong-row') {
            const rowCount = rows.find((r) => r[0] === o.text)[1];
            whyWrong[o.text] = `${o.text} was chosen by ${rowCount}, not ${targetCount} — count that row’s gates and strays again.`;
          }
        }
        return whyWrong;
      })(),
    },
  };
}

function t1SingleCellLookup(rng) {
  const survey = buildTallySurvey(rng, pick(rng, [3, 4]));
  const rows = survey.rows;
  const [groupA, groupB] = pick(rng, GROUP_PAIRS);
  // Split each category's total between the two groups, keeping both parts positive.
  const split = rows.map(([cat, total]) => {
    const a = rngInt(rng, 1, total - 1);
    const b = total - a;
    return { cat, a, b, total };
  });
  const idx = rngInt(rng, 0, split.length - 1);
  const wantA = rng() < 0.5;
  const row = split[idx];
  const correctVal = wantA ? row.a : row.b;
  const wantedGroup = wantA ? groupA : groupB;
  const headers = ['Activity', groupA, groupB];
  const tableRows = split.map((r) => [r.cat, fmt(r.a), fmt(r.b)]);
  const stem = `Using the table, how many <b>${wantedGroup}</b> chose <b>${row.cat}</b>?`;

  const distractors = [
    { text: fmt(wantA ? row.b : row.a), misconception: 'wrong-column' },
  ];
  const otherIdxs = shuffle(rng, split.map((_, i) => i).filter((i) => i !== idx));
  for (const oi of otherIdxs) {
    distractors.push({ text: fmt(wantA ? split[oi].a : split[oi].b), misconception: 'wrong-row' });
  }

  const correct = { text: fmt(correctVal), misconception: null };
  let options = [correct, ...dedupe(correct.text, distractors)].slice(0, 5);
  options = padWithNearMiss(rng, options, 4, correctVal, 3);

  return {
    templateId: 'tt2-t1-single-cell',
    stem,
    visual: { kind: 'table', headers, rows: tableRows },
    options,
    correctIndex: 0,
    hintSteps: [
      `Find the ${row.cat} ROW first.`,
      `Now slide across to the ${wantedGroup} COLUMN. Read the cell where they meet.`,
    ],
    explain: {
      rule: RULE,
      worked: `The ${row.cat} row meets the ${wantedGroup} column at ${fmt(correctVal)}.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// ---------- T2 templates ----------

function t2GrandTotal(rng) {
  const survey = buildTallySurvey(rng, pick(rng, [4, 5]));
  const rows = survey.rows;
  const total = rows.reduce((sum, r) => sum + r[1], 0);
  const stem = `Using the tally chart, how many ${survey.theme.noun} were asked altogether?`;

  // Build a mixed pool of BELOW-total and ABOVE-total distractors and shuffle which 4 survive,
  // so the correct total's rank among the options varies across generations instead of always
  // landing in the same spot (a fixed "3 below, 1 above" shape would be a systematic tell).
  const missIdx = rngInt(rng, 0, rows.length - 1);
  const dblIdx = rngInt(rng, 0, rows.length - 1);
  const pool = [
    { text: fmt(total - rows[missIdx][1]), misconception: 'missed-one-category' }, // below
    { text: fmt(rows[rngInt(rng, 0, rows.length - 1)][1]), misconception: 'bare-value' }, // below
    { text: fmt(total + rows[dblIdx][1]), misconception: 'double-counted-row' }, // above
    { text: fmt(total + 5), misconception: 'near-miss-count' }, // above
    { text: fmt(total - 5), misconception: 'near-miss-count' }, // below
  ];
  const distractors = shuffle(rng, pool).slice(0, 4);

  const correct = { text: fmt(total), misconception: null };
  let options = [correct, ...dedupe(correct.text, distractors)].slice(0, 5);
  options = padWithNearMiss(rng, options, 5, total, 4);

  return {
    templateId: 'tt2-t2-grand-total',
    stem,
    visual: tallyVisual(rows),
    options,
    correctIndex: 0,
    hintSteps: [
      'Read every row’s count first — gates then strays.',
      'Add every row together for the GRAND TOTAL.',
    ],
    explain: {
      rule: RULE,
      worked: `${rows.map((r) => fmt(r[1])).join(' + ')} = ${fmt(total)}.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// Ranking / cross-reference across every category — bullet 47 ("frequency tables, tallying"),
// operationalised via the catch-all route with citation PP1 Q50 / PP2 Q35 (ranking by points
// across categories in a table). Distinct from t1WhichCategoryHasCount (single exact-count
// lookup): this needs every row sorted and cross-referenced to find a relative position.
const RANK_LABELS = ['MOST popular', '2nd MOST popular', '3rd MOST popular', '4th MOST popular', '5th MOST popular'];

function t2Ranking(rng) {
  const survey = buildTallySurvey(rng, pick(rng, [4, 5]));
  const rows = survey.rows;
  // buildTallySurvey draws counts without replacement, so every row's count is guaranteed
  // distinct — the sort below always gives an unambiguous rank order.
  const sorted = [...rows].sort((a, b) => b[1] - a[1]);
  const rankIdx = rngInt(rng, 0, sorted.length - 1);
  const [targetCat] = sorted[rankIdx];
  const rankLabel = rankIdx === sorted.length - 1 ? 'LEAST popular' : RANK_LABELS[rankIdx];
  const stem = `Using the tally chart, which of these was <b>${rankLabel}</b> with ${survey.theme.noun}?`;

  const distractors = sorted
    .filter((_, i) => i !== rankIdx)
    .map(([cat]) => ({ text: cat, misconception: 'wrong-rank' }));

  const correct = { text: targetCat, misconception: null };
  const options = [correct, ...dedupe(targetCat, distractors)];

  return {
    templateId: 'tt2-t2-ranking',
    stem,
    visual: tallyVisual(rows),
    options,
    correctIndex: 0,
    hintSteps: [
      'Read every row’s count first — gates then strays.',
      `Now put all the counts in order from highest to lowest, and find which one is ${rankLabel.toLowerCase()}.`,
    ],
    explain: {
      rule: RULE,
      worked: `In order, highest to lowest: ${sorted.map(([c, n]) => `${c} (${fmt(n)})`).join(' > ')}. So ${targetCat} is ${rankLabel.toLowerCase()}.`,
      whyWrong: (() => {
        const whyWrong = {};
        for (const o of options) {
          if (o.misconception === 'wrong-rank') {
            const oCount = rows.find((r) => r[0] === o.text)[1];
            whyWrong[o.text] = `${o.text} was chosen by ${fmt(oCount)} — sort every row’s count from highest to lowest and recount the positions.`;
          }
        }
        return whyWrong;
      })(),
    },
  };
}

// Shared builder for the missing-cell-from-row-total templates (used by both T2 mcq and T3 num).
function buildMissingCellScenario(rng) {
  const survey = buildTallySurvey(rng, pick(rng, [3, 4]));
  const rows = survey.rows; // [cat, total]
  const [groupA, groupB] = pick(rng, GROUP_PAIRS);
  const split = rows.map(([cat, total]) => {
    const a = rngInt(rng, 1, total - 1);
    const b = total - a;
    return { cat, a, b, total };
  });
  const idx = rngInt(rng, 0, split.length - 1);
  const wantA = rng() < 0.5; // which group cell is the MISSING (asked-for) one
  const row = split[idx];
  const missingVal = wantA ? row.a : row.b;
  const knownVal = wantA ? row.b : row.a;
  const knownGroup = wantA ? groupB : groupA;
  const wantedGroup = wantA ? groupA : groupB;
  const headers = ['Activity', groupA, groupB, 'Row Total'];
  const tableRows = split.map((r, i) => {
    if (i === idx) {
      return [r.cat, wantA ? '?' : fmt(r.a), wantA ? fmt(r.b) : '?', fmt(r.total)];
    }
    return [r.cat, fmt(r.a), fmt(r.b), fmt(r.total)];
  });
  return { row, split, idx, missingVal, knownVal, knownGroup, wantedGroup, headers, tableRows };
}

function t2MissingCellFromRowTotal(rng) {
  const s = buildMissingCellScenario(rng);
  const stem = `The <b>${s.row.cat}</b> row total is ${fmt(s.row.total)}, and ${fmt(s.knownVal)} chose ${s.knownGroup}. How many chose <b>${s.wantedGroup}</b>?`;

  const distractors = [
    { text: fmt(s.row.total), misconception: 'used-row-total' },
    { text: fmt(s.knownVal + s.row.total), misconception: 'added-not-subtracted' },
    { text: fmt(s.knownVal), misconception: 'bare-value' },
  ];
  const otherIdx = s.split.map((_, i) => i).filter((i) => i !== s.idx);
  if (otherIdx.length) {
    const oi = pick(rng, otherIdx);
    distractors.push({ text: fmt(s.wantedGroup === s.headers[1] ? s.split[oi].a : s.split[oi].b), misconception: 'wrong-row' });
  }

  const correct = { text: fmt(s.missingVal), misconception: null };
  let options = [correct, ...dedupe(correct.text, distractors)].slice(0, 5);
  options = padWithNearMiss(rng, options, 5, s.missingVal, 3);

  return {
    templateId: 'tt2-t2-missing-cell',
    stem,
    visual: { kind: 'table', headers: s.headers, rows: s.tableRows },
    options,
    correctIndex: 0,
    hintSteps: [
      `The ROW TOTAL is every group in that row added together: ${s.knownGroup} + ${s.wantedGroup} = ${fmt(s.row.total)}.`,
      `You already know ${s.knownGroup} is ${fmt(s.knownVal)}. So ${s.wantedGroup} must be ${fmt(s.row.total)} − ${fmt(s.knownVal)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `Row total (${fmt(s.row.total)}) minus the known group (${fmt(s.knownVal)}) leaves ${fmt(s.missingVal)}.`,
      whyWrong: buildWhyWrong(options),
    },
  };
}

// ---------- T3 templates (num format, lean num) ----------

function t3MultiConditionLookup(rng) {
  // minCount 4: each row is split across 4 subgroups (Y5/Y6 x Boys/Girls), so every category's
  // total must be at least 4 for every subgroup to end up with at least 1.
  const survey = buildTallySurvey(rng, pick(rng, [3, 4]), 4);
  const rows = survey.rows;
  const yearGroups = ['Y5 Boys', 'Y5 Girls', 'Y6 Boys', 'Y6 Girls'];
  // Split each category's total across all four subgroups (each part stays >= 1).
  const table = rows.map(([cat, total]) => {
    const parts = [1, 1, 1, 1];
    let remaining = total - 4;
    let guard = 0;
    while (remaining > 0 && guard < 500) {
      parts[rngInt(rng, 0, 3)] += 1;
      remaining -= 1;
      guard += 1;
    }
    return { cat, total, parts };
  });
  const rIdx = rngInt(rng, 0, table.length - 1);
  const cIdx = rngInt(rng, 0, 3);
  const row = table[rIdx];
  const correctVal = row.parts[cIdx];
  const colName = yearGroups[cIdx];
  const [year, gender] = colName.split(' ');
  const stem = `Using the table, how many <b>${year === 'Y5' ? 'Year 5' : 'Year 6'} ${gender.toLowerCase()}</b> chose <b>${row.cat}</b>?`;

  const tableRows = table.map((r) => [r.cat, ...r.parts.map((p) => fmt(p))]);

  return {
    templateId: 'tt2-t3-multi-condition',
    stem,
    format: 'num',
    visual: { kind: 'table', headers: ['Activity', ...yearGroups], rows: tableRows },
    accept: [String(correctVal)],
    hintSteps: [
      `First narrow to the right ROW: ${row.cat}.`,
      `Now narrow to the right COLUMN inside that row: ${colName}. Read the cell where both meet.`,
    ],
    explain: {
      rule: RULE,
      worked: `The ${row.cat} row meets the ${colName} column at ${correctVal}.`,
      whyWrong: {},
    },
  };
}

function t3GrandTotalNum(rng) {
  const survey = buildTallySurvey(rng, pick(rng, [4, 5]));
  const rows = survey.rows;
  const total = rows.reduce((sum, r) => sum + r[1], 0);
  const stem = `Using the tally chart, how many ${survey.theme.noun} were asked altogether?`;

  return {
    templateId: 'tt2-t3-grand-total',
    stem,
    format: 'num',
    visual: tallyVisual(rows),
    accept: [String(total)],
    hintSteps: [
      'Read every row’s count first — gates then strays.',
      'Add every row together for the GRAND TOTAL.',
    ],
    explain: {
      rule: RULE,
      worked: `${rows.map((r) => fmt(r[1])).join(' + ')} = ${fmt(total)}.`,
      whyWrong: {},
    },
  };
}

function t3MissingCellFromRowTotalNum(rng) {
  const s = buildMissingCellScenario(rng);
  const stem = `The <b>${s.row.cat}</b> row total is ${fmt(s.row.total)}, and ${fmt(s.knownVal)} chose ${s.knownGroup}. How many chose <b>${s.wantedGroup}</b>?`;

  return {
    templateId: 'tt2-t3-missing-cell',
    stem,
    format: 'num',
    visual: { kind: 'table', headers: s.headers, rows: s.tableRows },
    accept: [String(s.missingVal)],
    hintSteps: [
      `The ROW TOTAL is every group in that row added together: ${s.knownGroup} + ${s.wantedGroup} = ${fmt(s.row.total)}.`,
      `You already know ${s.knownGroup} is ${fmt(s.knownVal)}. So ${s.wantedGroup} must be ${fmt(s.row.total)} − ${fmt(s.knownVal)} = …?`,
    ],
    explain: {
      rule: RULE,
      worked: `Row total (${fmt(s.row.total)}) minus the known group (${fmt(s.knownVal)}) leaves ${fmt(s.missingVal)}.`,
      whyWrong: {},
    },
  };
}

// -------- dispatch --------

const T1 = [t1ReadTallyRow, t1WhichCategoryHasCount, t1SingleCellLookup];
const T2 = [t2GrandTotal, t2Ranking, t2MissingCellFromRowTotal];
const T3 = [t3MultiConditionLookup, t3GrandTotalNum, t3MissingCellFromRowTotalNum];

export function generate(tier, rng) {
  let pool;
  if (tier <= 1) pool = T1;
  else if (tier === 2) pool = T2;
  else pool = T3;
  const templateFn = pick(rng, pool);
  const built = templateFn(rng);

  const format = built.format || 'mcq5';
  const id = `tt2-${built.templateId}-${rngInt(rng, 100000, 999999)}`;

  const question = {
    id,
    topicId: 'tables-tally',
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
