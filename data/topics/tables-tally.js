// FART QUEST topic: The Tally Tip — tables & tally charts (The Data Dump)
// Authored content — implementation agents: read, never modify.

// -------- lesson-only visual helpers --------
// Pre-built inline-styled HTML (NOT the diagrams.js §C spec — that data-only form is for
// GENERATOR questions, rendered via renderDiagram at battle-mount time; lesson 'show'/'try'
// cards are pre-built HTML per BUILD_SPEC §5, since js/screens/lesson.js does not wire up the
// dynamic diagrams.js import that battle.js has — same pattern as graphs-charts.js's
// miniBarChart/miniPictogram/miniVenn and coordinates.js's miniGrid). Uses only inline styles +
// the app's global CSS custom properties (--ink/--card/--shadow-card) — no new lesson.css classes.

function miniTally(rows) {
  const rowsHtml = rows.map(([label, count]) => {
    const full = Math.floor(count / 5);
    const rem = count % 5;
    let marks = '';
    for (let g = 0; g < full; g++) {
      let sticks = '';
      for (let s = 0; s < 4; s++) {
        sticks += `<span style="display:inline-block;width:3px;height:24px;background:var(--ink);margin:0 2px;"></span>`;
      }
      marks += `<span style="position:relative;display:inline-flex;align-items:flex-end;margin-right:12px;">
        ${sticks}
        <span style="position:absolute;left:-3px;top:9px;width:28px;height:3px;background:var(--ink);transform:rotate(-38deg);transform-origin:left center;"></span>
      </span>`;
    }
    for (let s = 0; s < rem; s++) {
      marks += `<span style="display:inline-block;width:3px;height:24px;background:var(--ink);margin:0 3px 0 0;"></span>`;
    }
    if (full === 0 && rem === 0) marks = '<span style="opacity:.5;">—</span>';
    return `<div style="display:flex;align-items:center;gap:14px;margin:9px 0;">
      <div style="width:112px;font-weight:700;font-size:14px;color:var(--ink);text-align:right;">${label}</div>
      <div style="display:flex;align-items:center;min-height:26px;">${marks}</div>
      <div style="margin-left:auto;padding-left:10px;font-weight:700;color:var(--ink);opacity:.65;font-size:13px;">= ${count}</div>
    </div>`;
  }).join('');
  return `<div style="overflow-x:auto;">
    <div style="display:inline-block;min-width:280px;background:var(--card);padding:16px 20px;border-radius:14px;box-shadow:var(--shadow-card);">
      ${rowsHtml}
    </div>
  </div>`;
}

function miniTable(headers, rows, highlight = []) {
  const isHi = (r, c) => highlight.some((h) => h[0] === r && h[1] === c);
  const head = headers.map((h) => `<th style="border:1px solid #595959;padding:8px;background:#eef1f4;font-size:14px;">${h}</th>`).join('');
  const body = rows.map((row, r) => {
    const cells = row.map((cell, c) => `<td style="border:1px solid #595959;padding:8px;font-size:14px;${isHi(r, c) ? 'background:#fff3c9;font-weight:700;' : ''}">${cell}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<div style="overflow-x:auto;">
    <table style="border-collapse:collapse;width:100%;font-size:14px;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  </div>`;
}

const TALLY_1 = [['Football', 22], ['Skipping', 19], ['Tig', 11], ['Hopscotch', 8]];
const TABLE_2 = ['Activity', 'Year 5', 'Year 6', 'Row Total'];
const TABLE_2_ROWS = [
  ['Football', '8', '14', '22'],
  ['Swimming', '11', '9', '20'],
  ['Dance', '6', '10', '16'],
  ['<b>Total</b>', '<b>25</b>', '<b>33</b>', '<b>58</b>'],
];
// Same table with the Dance/Year 6 cell masked — used only for the missing-cell try card so the
// answer isn't sitting there in plain sight (the point of that question is to DERIVE it from the
// row total, not read it off directly).
const TABLE_2_ROWS_MASKED = [
  ['Football', '8', '14', '22'],
  ['Swimming', '11', '9', '20'],
  ['Dance', '6', '?', '16'],
  ['<b>Total</b>', '<b>25</b>', '<b>33</b>', '<b>58</b>'],
];
const TABLE_3 = ['Activity', 'Y5 Boys', 'Y5 Girls', 'Y6 Boys', 'Y6 Girls'];
const TABLE_3_ROWS = [
  ['Football', '5', '3', '8', '6'],
  ['Swimming', '4', '7', '3', '6'],
  ['Dance', '2', '4', '3', '7'],
];

export default {
  id: 'tables-tally',
  name: 'The Tally Tip',
  region: 'data-dump',
  genId: 'tablestally',
  tagline: 'Where every count hides behind a gate of five… and Wally is watching you count them.',

  creature: {
    id: 'tally-wally',
    name: 'Tally Wally',
    rarity: 'rare',
    image: 'assets/monsters/tally-wally.png',
    bio: 'Tally Wally counts absolutely everything in neat gates of five — four straight sticks, then a fifth stroke slashed diagonally to shut the gate. Say the word “six” anywhere near him and he will sulk in a bin for the rest of the day.',
    factSneak: 'A tally gate is FOUR sticks plus ONE closing stroke — that’s five, never six. Count the gates first, then add any leftover strays.',
  },

  weapon: {
    id: 'gate-counter',
    name: 'The Gate Counter',
    tagline: 'Never miscount a tally chart or lose your place in a towering table again.',
    rule: 'Tally gates come in fives: four sticks and a gate. Count gates, then strays.',
    example: 'Skipping has <b>3 gates</b> and <b>4 strays</b>: 3 × 5 = 15, plus 4 = <b>19</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-tablestally',
      text: 'Oi oi, young stinker — <b>Tally Wally</b> here, keeper of the Tally Tip! I count EVERYTHING, and I mean everything, in neat little gates of five. Four sticks stand up straight, then a fifth one comes SLASHING across to shut the gate. Miss a gate, or count one wrong, and my whole rubbish tip collapses into chaos. Let’s make sure that never happens to you.',
    },
    {
      type: 'show',
      title: 'Gates come in fives — always',
      html: `<p>A tally mark is built one stick at a time: |, ||, |||, ||||. But the FIFTH mark never stands up straight — it slashes diagonally across the other four to <b>close the gate</b>. That gate is worth exactly <b>5</b>, no more, no less.</p>
<p>Here’s Tally Wally’s survey of the playground’s favourite game. To read any row: count the GATES first (each one worth 5), multiply by 5, then add on any lonely STRAYS left over.</p>
${miniTally(TALLY_1)}
<p><b>Football</b> has 4 full gates (4 × 5 = 20) plus 2 stray sticks = <b>22</b>. <b>Hopscotch</b> has just 1 gate (5) plus 3 strays = <b>8</b>. Gates first, strays second — every single time.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tt2-try-1', topicId: 'tables-tally', tier: 1, format: 'mcq5',
        stem: 'Using the playground survey above, how many pupils chose <b>Tig</b>?',
        visual: { kind: 'tally', html: miniTally(TALLY_1) },
        options: [
          { text: '11', misconception: null },
          { text: '12', misconception: 'stray-miscount' },
          { text: '6', misconception: 'missed-gate' },
          { text: '8', misconception: 'wrong-row' },
          { text: '13', misconception: 'gate-is-six' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Find the Tig row. Count the GATES first — each closed gate is worth 5.',
          'Tig has 2 gates (2 × 5 = 10) and 1 lonely stray left over. 10 + 1 = …?',
        ],
        explain: {
          rule: 'Tally gates come in fives: four sticks and a gate. Count gates, then strays.',
          worked: 'Tig has 2 full gates (2 × 5 = 10) plus 1 stray stick. 10 + 1 = 11.',
          whyWrong: {
            '12': 'The stray sticks were miscounted — Tig only has ONE lonely stick after its gates, not two.',
            '6': 'That’s one gate short — Tig has TWO closed gates (10), not one (5), before you add the stray.',
            '8': 'That’s Hopscotch’s count, not Tig’s — check you slid your finger onto the right row.',
            '13': 'That treats a gate as worth SIX — a gate is always four sticks plus one closing slash, which makes exactly five.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: 'Once every gate’s counted, Wally writes the totals into a proper <b>frequency table</b>. But some tables get BIG — lots of rows, lots of columns — and that’s exactly where Bus-Conductor Bogface’s trick from the Timetable Terminus comes in handy: <b>one finger on the row, one finger on the column</b>, and slide until they meet.',
    },
    {
      type: 'show',
      title: 'Row totals are NOT the grand total',
      html: `<p>Here’s the playground survey turned into a full table, split by year group, with a Row Total column added on the right — and a Total row along the bottom.</p>
${miniTable(TABLE_2, TABLE_2_ROWS, [[3, 3]])}
<p>A <b>row total</b> only adds along ITS OWN row: Football’s row total is 8 + 14 = <b>22</b>. The <b>grand total</b> in the bottom-right corner adds absolutely everyone — every row AND every column — giving <b>58</b>. Mixing these two up is the easiest slip in the whole Tally Tip: a row total is never the same number as the grand total, unless the table only has one row!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tt2-try-2', topicId: 'tables-tally', tier: 2, format: 'mcq5',
        stem: 'Look at the table above. The <b>Dance</b> row total is 16, and 6 Year 5 pupils chose Dance. How many <b>Year 6</b> pupils chose Dance?',
        visual: { kind: 'table', html: miniTable(TABLE_2, TABLE_2_ROWS_MASKED, [[2, 2]]) },
        options: [
          { text: '10', misconception: null },
          { text: '16', misconception: 'used-row-total' },
          { text: '22', misconception: 'added-not-subtracted' },
          { text: '14', misconception: 'wrong-row' },
          { text: '9', misconception: 'near-miss' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The ROW TOTAL is every group in that row added together: Year 5 + Year 6 = 16.',
          'You already know Year 5 is 6. So Year 6 must be 16 − 6 = …?',
        ],
        explain: {
          rule: 'Tally gates come in fives: four sticks and a gate. Count gates, then strays.',
          worked: 'The row total (16) is Year 5 + Year 6. 16 − 6 = 10, so 10 Year 6 pupils chose Dance.',
          whyWrong: {
            '16': 'That’s just the ROW TOTAL repeated back — you still need to subtract the Year 5 group to find Year 6 alone.',
            '22': 'That adds the Year 5 count ONTO the row total (6 + 16) instead of subtracting it from the total.',
            '14': 'That’s Football’s Year 6 count, not Dance’s — check you slid onto the right row.',
            '9': 'Close, but re-check the subtraction: the row total is 16, and Year 5 is 6.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Multi-condition lookups — narrow it down TWICE',
      html: `<p>The trickiest question in the Tally Tip asks about TWO things at once, like <b>“How many Year 6 girls chose Swimming?”</b> Don’t panic — just narrow it down in two steps instead of one.</p>
${miniTable(TABLE_3, TABLE_3_ROWS, [[1, 3]])}
<p><b>Step 1:</b> find the right ROW — Swimming. <b>Step 2:</b> find the right COLUMN — Y6 Girls. Only when BOTH fingers have landed do you read the single cell where they cross: <b>6</b>. Skip either step and you’ll land on the wrong number, even if you read the table perfectly otherwise.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tt2-try-3', topicId: 'tables-tally', tier: 3, format: 'num',
        stem: 'Using the sports table above, how many <b>Year 6 girls</b> chose <b>Dance</b>?',
        visual: { kind: 'table', html: miniTable(TABLE_3, TABLE_3_ROWS, [[2, 3]]) },
        accept: ['7'],
        hintSteps: [
          'First narrow to the right ROW: Dance.',
          'Now narrow to the right COLUMN inside that row: Y6 Girls. Read the cell where both meet.',
        ],
        explain: {
          rule: 'Tally gates come in fives: four sticks and a gate. Count gates, then strays.',
          worked: 'The Dance row meets the Y6 Girls column at 7.',
          whyWrong: {},
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'A tally gate is FOUR sticks plus ONE diagonal closing stroke — that’s five, never six.',
    'To read any tally row: count the GATES first (each worth 5), multiply by 5, then add on the leftover STRAYS.',
    'Reading any table: one finger on the ROW, one finger on the COLUMN — slide until they meet (Bogface’s Finger-Track works here too).',
    'A ROW TOTAL only adds along its own row. The GRAND TOTAL adds every row and every column together — they are almost never the same number.',
    'Missing a cell in a row? Row total MINUS every other known cell in that row leaves the missing one.',
    '"Year 6 girls who chose Swimming" needs TWO narrows, not one — find the right ROW, then the right COLUMN, then read where they cross.',
    'Read tables calmly, one row and one column at a time. Rushing is exactly how fingers slip onto the wrong cell.',
  ],
};
