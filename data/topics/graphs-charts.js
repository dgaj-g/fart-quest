// FART QUEST topic: Bar Chart Alley — graphs & charts (The Data Dump)
// Authored content — implementation agents: read, never modify.

// -------- lesson-only visual helpers --------
// Build small game-styled charts as plain inline-styled HTML (NOT the diagrams.js §C spec —
// that data-only form is for GENERATOR questions, rendered via renderDiagram at battle-mount
// time; lesson 'show'/'try' cards are pre-built HTML per BUILD_SPEC §5, since js/screens/
// lesson.js does not (yet) wire up the dynamic diagrams.js import that battle.js has — see
// data/topics/coordinates.js's miniGrid for the same pattern). Uses only inline styles + the
// app's global CSS custom properties (--ink/--card/--shadow-card) — no new lesson.css classes.

function miniBarChart(labels, values, yStep, opts = {}) {
  const barColor = opts.barColor || '#E08A3D';
  const niceMax = Math.ceil(Math.max(...values) / yStep) * yStep;
  const steps = niceMax / yStep;
  const chartH = 150;
  const stepH = chartH / steps;
  let gridLines = '';
  let axisLabels = '';
  for (let i = 0; i <= steps; i++) {
    const y = chartH - i * stepH;
    gridLines += `<div style="position:absolute;left:0;right:0;top:${y}px;border-top:1px dashed rgba(51,38,29,.3);"></div>`;
    axisLabels += `<div style="position:absolute;left:-34px;top:${y - 8}px;width:28px;text-align:right;font-size:11px;color:var(--ink);opacity:.7;">${i * yStep}</div>`;
  }
  let bars = '';
  labels.forEach((label, i) => {
    const v = values[i];
    const h = Math.round((v / niceMax) * chartH);
    bars += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;width:52px;position:relative;z-index:1;">
      <div style="width:40px;height:${h}px;background:${barColor};border:2px solid var(--ink);border-radius:6px 6px 0 0;"></div>
    </div>`;
  });
  let axisText = '';
  labels.forEach((label) => {
    axisText += `<div style="width:52px;text-align:center;font-size:12px;font-weight:700;color:var(--ink);">${label}</div>`;
  });
  return `<div style="overflow-x:auto;">
    <div style="display:inline-block;background:var(--card);padding:18px 22px 12px 48px;border-radius:14px;box-shadow:var(--shadow-card);">
      ${opts.yLabel ? `<div style="font-size:11px;font-style:italic;color:var(--ink);opacity:.75;margin-bottom:6px;">${opts.yLabel}</div>` : ''}
      <div style="position:relative;height:${chartH}px;display:flex;align-items:flex-end;gap:14px;">
        ${gridLines}${axisLabels}${bars}
      </div>
      <div style="display:flex;gap:14px;margin-top:8px;border-top:3px solid var(--ink);padding-top:8px;">${axisText}</div>
    </div>
  </div>`;
}

function miniPictogram(rows, symbol, per) {
  let rowsHtml = '';
  rows.forEach(([label, count]) => {
    const full = Math.floor(count / per);
    const remainder = count - full * per;
    const fracPct = Math.round((remainder / per) * 100);
    let symbols = '';
    for (let i = 0; i < full; i++) symbols += `<span style="font-size:24px;">${symbol}</span>`;
    if (fracPct > 0) {
      symbols += `<span style="font-size:24px;display:inline-block;clip-path:inset(0 ${100 - fracPct}% 0 0);">${symbol}</span>`;
    }
    rowsHtml += `<div style="display:flex;align-items:center;gap:10px;margin:8px 0;">
      <div style="width:90px;font-weight:700;font-size:14px;color:var(--ink);text-align:right;">${label}</div>
      <div style="display:flex;gap:2px;">${symbols}</div>
    </div>`;
  });
  return `<div style="overflow-x:auto;">
    <div style="display:inline-block;background:var(--card);padding:16px 22px;border-radius:14px;box-shadow:var(--shadow-card);">
      ${rowsHtml}
      <div style="margin-top:10px;font-size:12px;font-style:italic;color:var(--ink);opacity:.8;">${symbol} = ${per}</div>
    </div>
  </div>`;
}

function miniVenn(aLabel, bLabel, aOnly, both, bOnly, neither) {
  return `<div style="overflow-x:auto;">
    <div style="position:relative;width:360px;height:230px;background:var(--card);border-radius:14px;box-shadow:var(--shadow-card);margin:0 auto;">
      <div style="position:absolute;left:30px;top:30px;width:170px;height:170px;border:3px solid #5b7fa6;border-radius:50%;"></div>
      <div style="position:absolute;left:140px;top:30px;width:170px;height:170px;border:3px solid #E08A3D;border-radius:50%;"></div>
      <div style="position:absolute;left:56px;top:6px;font-weight:700;font-size:14px;color:#5b7fa6;">${aLabel}</div>
      <div style="position:absolute;right:56px;top:6px;font-weight:700;font-size:14px;color:#E08A3D;">${bLabel}</div>
      <div style="position:absolute;left:80px;top:108px;font-size:22px;font-weight:700;color:var(--ink);">${aOnly}</div>
      <div style="position:absolute;left:170px;top:108px;font-size:22px;font-weight:700;color:var(--ink);">${both}</div>
      <div style="position:absolute;left:262px;top:108px;font-size:22px;font-weight:700;color:var(--ink);">${bOnly}</div>
      <div style="position:absolute;left:14px;bottom:8px;font-size:13px;color:var(--ink);">Neither: <b>${neither}</b></div>
    </div>
  </div>`;
}

export default {
  id: 'graphs-charts',
  name: 'Bar Chart Alley',
  region: 'data-dump',
  genId: 'graphs',
  tagline: 'Where every bar, dot and slice tells a story — but only if you read the scale first.',

  creature: {
    id: 'barry-chart',
    name: 'Barry Chart',
    rarity: 'rare',
    image: 'assets/monsters/barry-chart.png',
    bio: 'Barry’s whole body IS a bar chart — you can read his mood off his own chest at a glance. Sadly, his chest chart uses a scale of 10 per square, and everyone keeps reading it as 1, which makes him look FAR angrier than he actually is.',
    factSneak: 'Always check the SCALE on the side of a chart before you read a single bar — one square is not always worth one.',
  },

  weapon: {
    id: 'scale-first-spyglass',
    name: 'The Scale-First Spyglass',
    tagline: 'See the true value of every bar, dot and symbol — never be fooled by the gridlines again.',
    rule: 'Read the SCALE before the bars — one square is not always one.',
    example: 'The gridlines go 0, 5, 10, 15, 20. A bar standing on the 3rd line isn’t worth 3 — it’s worth 3 × 5 = <b>15</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-graphs',
      text: 'Ahoy there, my data-hunting hero! I am <b>Barry Chart</b>, and my whole body is made of bars — look, that one’s my temper, and it’s currently LOW, thank you for asking. Charts look friendly, but they hide a nasty little trap: <b>the scale down the side isn’t always counting in ones</b>. Miss that, and every answer you give will be wrong by the same sneaky amount. Let’s fix that right now.',
    },
    {
      type: 'show',
      title: 'Read the scale BEFORE you read a single bar',
      html: `<p>Here’s a bar chart showing how many pupils own each pet. Before you touch a single bar, look at the numbers climbing up the side: <b>0, 5, 10, 15, 20</b>. Each gap between the lines is worth <b>5</b>, not 1!</p>
${miniBarChart(['Dogs', 'Cats', 'Fish', 'Rabbits'], [15, 10, 5, 20], 5, { yLabel: 'Number of pupils' })}
<p>To read the <b>Cats</b> bar: it stops exactly on the <b>2nd</b> gridline up. Two gridlines, each worth 5, gives 2 × 5 = <b>10</b> pupils. If you’d counted "2 gridlines = 2 pupils" you’d be miles out — that’s the trap the exam sets EVERY single time.</p>
<p>Line graphs use the exact same trick, just with a dot instead of a bar: find the dot, trace it back to the scale, and multiply the gridline count by the step. Same spyglass, different picture.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'gc-try-1', topicId: 'graphs-charts', tier: 1, format: 'mcq5',
        stem: 'Using the pet chart above, how many pupils own a <b>Cat</b>?',
        visual: { kind: 'barchart', html: miniBarChart(['Dogs', 'Cats', 'Fish', 'Rabbits'], [15, 10, 5, 20], 5, { yLabel: 'Number of pupils' }) },
        options: [
          { text: '10', misconception: null },
          { text: '2', misconception: 'scale-misread' },
          { text: '15', misconception: 'wrong-bar' },
          { text: '5', misconception: 'wrong-bar' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Find the Cats bar, then count how many GRIDLINES up it reaches.',
          'It reaches the 2nd gridline. Each gridline is worth 5 (check the scale: 0, 5, 10, 15, 20). 2 × 5 = …?',
        ],
        explain: {
          rule: 'Read the SCALE before the bars — one square is not always one.',
          worked: 'The Cats bar reaches the 2nd gridline. Each gridline is worth 5, so 2 × 5 = 10.',
          whyWrong: {
            '2': 'That’s just the number of gridlines — you forgot to multiply by the scale (each one is worth 5)!',
            '15': 'That’s the Dogs bar, one bar too far left.',
            '5': 'That’s the Fish bar, not the Cats bar — check the label underneath.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: 'Reading ONE bar is only half the battle, though. The exam LOVES asking you to combine bars — totals, and "how many more" questions. Good news: once you can read the scale, the rest is just simple adding and subtracting.',
    },
    {
      type: 'show',
      title: 'Totals and "how many more" — just add up what you’ve read',
      html: `<p>Here’s how many ice creams were sold each day this week:</p>
${miniBarChart(['Mon', 'Tue', 'Wed', 'Thu'], [20, 15, 25, 10], 5, { yLabel: 'Ice creams sold', barColor: '#5b7fa6' })}
<p><b>Total for the week?</b> Read each bar off the scale first (20, 15, 25, 10), THEN add: 20 + 15 + 25 + 10 = <b>70</b>.</p>
<p><b>How many MORE were sold on Wednesday than Thursday?</b> Read both bars first — Wed = 25, Thu = 10 — then subtract: 25 − 10 = <b>15</b>. Never subtract the gridline counts directly; always convert to the real value first, THEN do the sum.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'gc-try-2', topicId: 'graphs-charts', tier: 2, format: 'mcq5',
        stem: 'Using the ice cream chart above, how many MORE ice creams were sold on <b>Wednesday</b> than on <b>Thursday</b>?',
        visual: { kind: 'barchart', html: miniBarChart(['Mon', 'Tue', 'Wed', 'Thu'], [20, 15, 25, 10], 5, { yLabel: 'Ice creams sold', barColor: '#5b7fa6' }) },
        options: [
          { text: '15', misconception: null },
          { text: '35', misconception: 'added-not-subtracted' },
          { text: '3', misconception: 'scale-misread' },
          { text: '25', misconception: 'bare-value' },
          { text: '10', misconception: 'bare-value' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Read each bar off the real scale first: Wednesday = ?, Thursday = ?',
          'Wednesday is 25 and Thursday is 10. Now subtract: 25 − 10 = …?',
        ],
        explain: {
          rule: 'Read the SCALE before the bars — one square is not always one.',
          worked: 'Wednesday = 25, Thursday = 10. 25 − 10 = 15 more ice creams.',
          whyWrong: {
            '35': 'That’s 25 + 10 — the question asked "how many MORE", which means subtract, not add.',
            '3': 'That’s the difference in GRIDLINES (5 − 2), not the difference in ice creams. Convert to the real values first.',
            '25': 'That’s just Wednesday’s total on its own — the question wants the DIFFERENCE between the two days.',
            '10': 'That’s just Thursday’s total on its own — the question wants the DIFFERENCE between the two days.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Pictograms: the symbol isn’t always worth ONE either',
      html: `<p>Barry’s cousins in the Data Dump draw their data differently. A <b>pictogram</b> uses a picture instead of a bar — but the same trap is hiding: <b>check what ONE symbol is worth</b> before you count them.</p>
${miniPictogram([['Sam', 10], ['Priya', 4], ['Tom', 6]], '🍕', 2)}
<p>Here, <b>🍕 = 2 slices</b>. Sam has 5 whole pizzas, so 5 × 2 = <b>10</b> slices. Don’t just count the pictures — always multiply by what each one is worth.</p>
<p>The exam also loves a "how many MORE" question across two rows. <b>How many MORE slices did Sam eat than Priya?</b> Convert both rows to their real values first — Sam = 10, Priya = 4 — THEN subtract: 10 − 4 = <b>6</b>. Never subtract the number of PICTURES directly; always convert to the real value first, just like with bar charts.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'gc-try-3', topicId: 'graphs-charts', tier: 2, format: 'mcq5',
        stem: 'On the pizza pictogram above (🍕 = 2 slices), how many MORE slices did <b>Sam</b> eat than <b>Priya</b>?',
        visual: { kind: 'pictogram', html: miniPictogram([['Sam', 10], ['Priya', 4], ['Tom', 6]], '🍕', 2) },
        options: [
          { text: '6', misconception: null },
          { text: '14', misconception: 'added-not-subtracted' },
          { text: '3', misconception: 'scale-misread' },
          { text: '10', misconception: 'bare-value' },
          { text: '4', misconception: 'bare-value' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Read both rows off the real values first: Sam = ?, Priya = ?',
          'Sam is 10 and Priya is 4. Now subtract: 10 − 4 = …?',
        ],
        explain: {
          rule: 'Read the SCALE before the bars — one square is not always one.',
          worked: 'Sam = 10, Priya = 4. 10 − 4 = 6 more slices.',
          whyWrong: {
            '14': 'That’s 10 + 4 added together — "how many MORE" means subtract, not add.',
            '3': 'That’s the difference in PICTURES (5 − 2), not the difference in slices. Convert to the real values first (each picture is worth 2).',
            '10': 'That’s just Sam’s total on its own — the question wants the DIFFERENCE between the two.',
            '4': 'That’s just Priya’s total on its own — the question wants the DIFFERENCE between the two.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Venn diagrams: read the RIGHT bubble',
      html: `<p>A Venn diagram sorts everyone into circles. The tricky bit: the middle overlap belongs to BOTH circles at once, and there’s always a space OUTSIDE both circles for "neither".</p>
${miniVenn('Maths', 'Art', 8, 5, 6, 3)}
<p>"How many like Maths <b>only</b>?" means the left circle WITHOUT the overlap: <b>8</b>. Don’t add the middle number in — that group already likes BOTH, so they’re counted separately. "How many like <b>neither</b>?" is the number sitting completely outside both circles: <b>3</b>. Add every region together (8 + 5 + 6 + 3 = 22) and you get the whole class — a great way to check you’ve read it right.</p>`,
    },
    { type: 'weapon' },
  ],

  tips: [
    'ALWAYS check the scale down the side before you read a single bar or dot — the gap between gridlines is not always worth 1.',
    'To read any bar or point: count the gridlines to it, then MULTIPLY by what each gridline is worth.',
    '"How many more/fewer" questions need TWO reads and a subtraction — read both bars off the real scale first, then subtract.',
    'Totals from a chart: read every bar off the scale, THEN add them all together.',
    'Pictograms: check what ONE symbol is worth first, then multiply symbols × value. For "how many more", convert BOTH rows to real values before you subtract.',
    'Venn diagrams: the overlap in the middle belongs to BOTH groups — never add it into an "only" answer. "Neither" sits outside every circle.',
    'Add up every region of a Venn diagram (both circles + neither) — it should equal the whole group. Handy way to check your answer.',
  ],
};
