// FART QUEST topic: The Shrunken Shore — scale maps & drawings (Measure Marsh)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'scale-maps',
  name: 'The Shrunken Shore',
  region: 'measure-marsh',
  genId: 'scalemaps',
  tagline: 'Where every giant thing gets shrunk onto a scrap of paper — label included.',

  creature: {
    id: 'the-shrinkler',
    name: 'The Shrinkler',
    rarity: 'rare',
    image: 'assets/monsters/the-shrinkler.png',
    bio: 'The Shrinkler can shrink absolutely anything down onto a scrap of paper — castles, cows, entire swamps — but he always leaves the scale label stuck proudly to the corner, the show-off. Lose that label and he panics completely; without it, nobody on the Shore knows how big anything really was.',
    factSneak: 'Scale drawings: real distance = drawing length × the scale number.',
  },

  weapon: {
    id: 'shrink-ray-reverser',
    name: 'The Shrink-Ray Reverser',
    tagline: 'Blast any drawing back up to real size — or reverse it back down to a drawing.',
    rule: 'Read the scale like a recipe: 1 cm means X in real life. Measure, then multiply.',
    example: 'Scale: 1 cm = 4 m. The bridge measures 6 cm on the drawing. Read the recipe — 1 cm means 4 m. Multiply: 6 × 4 = <b>24 m</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-scalemaps',
      text: 'Behold, brave whiff-warrior, the strangest creature on the whole Shore — <b>The Shrinkler</b>! He can shrink an entire castle down to fit on a postcard. But he is very particular about one thing: he NEVER shrinks anything without leaving a little label behind that says exactly how much he shrunk it by. That label is called the <b>scale</b>, and today you are going to learn to read his mind with it.',
    },
    {
      type: 'show',
      title: 'The Shrink Scroll',
      html: `<p>Every scale drawing — a map, a floor plan, a model — comes with a little scroll that tells you the Shrinkler's secret:</p>
<div class="law-scroll">📜 <b>SCALE: 1 cm on the drawing = 5 m in real life.</b></div>
<p>That scroll is a RECIPE. It means every single centimetre you measure on the paper is secretly hiding <b>5 real metres</b>. Here's a garden path drawn on paper:</p>
<div style="border:3px solid var(--ink); background:#fff; border-radius:10px; padding:16px 22px; text-align:center; font-weight:700; margin:0 auto 6px; max-width:220px; color:var(--ink);">
  🚪╌╌╌╌╌╌╌╌╌╌🏡<br>
  <span style="font-size:13px; font-weight:400;">4 cm</span>
</div>
<p>The path is <b>4 cm</b> on the drawing. The scroll says 1 cm = 5 m. So the REAL path is 4 lots of 5 m: <b>4 × 5 = 20 m</b>. That's it — that's the whole spell. Notice you never had to measure anything with a ruler; the length is always LABELLED for you.</p>`,
    },
    {
      type: 'talk',
      text: 'That is the entire secret of the Shrink-Ray Reverser: <b>real life = drawing length × the scale number</b>. Not plus. Not minus. MULTIPLY. The scale is not an amount you add on — it is a multiplying machine sitting on every single centimetre.',
    },
    {
      type: 'try',
      q: {
        id: 'sm-try-1', topicId: 'scale-maps', tier: 1, format: 'mcq5',
        stem: 'A corridor is drawn using a scale of 1 cm = 3 m. On the drawing it measures <b>6 cm</b>. What is its real length?',
        options: [
          { text: '18 m', misconception: null },
          { text: '2 m', misconception: 'divide-not-multiply' },
          { text: '9 m', misconception: 'add-scale' },
          { text: '18 cm', misconception: 'unit-of-answer' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The scale says 1 cm means 3 m in real life. The corridor is 6 cm on the drawing.',
          '6 × 3 = ?',
        ],
        explain: {
          rule: 'Read the scale like a recipe: 1 cm means X in real life. Measure, then multiply.',
          worked: '1 cm = 3 m, so 6 cm × 3 = 18 m.',
          whyWrong: {
            '2 m': 'That DIVIDED the drawing length by the scale — the recipe says MULTIPLY to go from drawing to real life.',
            '9 m': 'That ADDED the scale number — a scale is a MULTIPLY relationship, not a plus-sum.',
            '18 cm': 'The number is right, but the UNIT is wrong — the scale converts the drawing into metres, not centimetres.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Two labels, one drawing',
      html: `<p>A real scale drawing usually shows more than one measurement — like a garden plan with a LENGTH and a WIDTH. The trick is to convert each one SEPARATELY, using the exact same recipe both times.</p>
<div class="law-scroll">📜 SCALE: 1 cm = 4 m</div>
<table style="width:100%; max-width:320px; margin:10px auto; border-collapse:collapse; text-align:center; font-size:14px;">
  <tr style="background:rgba(0,0,0,.06);"><th style="border:1.5px solid var(--ink); padding:6px;">Side</th><th style="border:1.5px solid var(--ink); padding:6px;">Drawing (cm)</th><th style="border:1.5px solid var(--ink); padding:6px;">Real (m)</th></tr>
  <tr><td style="border:1.5px solid var(--ink); padding:6px;">Length</td><td style="border:1.5px solid var(--ink); padding:6px;">5</td><td style="border:1.5px solid var(--ink); padding:6px;"><b>20</b></td></tr>
  <tr><td style="border:1.5px solid var(--ink); padding:6px;">Width</td><td style="border:1.5px solid var(--ink); padding:6px;">3</td><td style="border:1.5px solid var(--ink); padding:6px;"><b>12</b></td></tr>
</table>
<p>Length: 5 × 4 = 20 m. Width: 3 × 4 = 12 m. Two separate sums, same recipe both times. Never mix a length reading with a width reading — always keep your labels straight!</p>`,
    },
    {
      type: 'talk',
      text: 'Now, a Whiffbeard-approved warning: examiners LOVE giving you a drawing split into two sections and asking for the TOTAL real distance. Do not add the raw drawing numbers together and stop there — convert EACH section to real life FIRST, using the same scale both times, THEN add.',
    },
    {
      type: 'try',
      q: {
        id: 'sm-try-2', topicId: 'scale-maps', tier: 2, format: 'mcq5',
        stem: 'A garden path is drawn in two sections. Section A measures <b>4 cm</b> and section B measures <b>9 cm</b> on the drawing. Scale: 1 cm = 5 m. What is the TOTAL real length of both sections together?',
        options: [
          { text: '65 m', misconception: null },
          { text: '20 m', misconception: 'only-one-side' },
          { text: '13 m', misconception: 'no-convert' },
          { text: '65 cm', misconception: 'unit-of-answer' },
          { text: '2.6 m', misconception: 'divide-not-multiply' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Convert EACH section first: 4 × 5 and 9 × 5.',
          '20 m + 45 m = ?',
        ],
        explain: {
          rule: 'Read the scale like a recipe: 1 cm means X in real life. Measure, then multiply.',
          worked: 'Section A: 4 × 5 = 20 m. Section B: 9 × 5 = 45 m. Total = 20 + 45 = 65 m.',
          whyWrong: {
            '20 m': 'That converted only ONE section — the question wants BOTH sections added together.',
            '13 m': 'That is just the raw drawing lengths (4 + 9), unconverted — you have not used the scale yet!',
            '65 cm': 'The number is right, but the UNIT is wrong — the scale converts the drawing into metres, not centimetres.',
            '2.6 m': 'That DIVIDED the drawing lengths by the scale — the recipe says MULTIPLY to go from drawing to real life.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Reverse Shrink — and the km bridge',
      html: `<p>The Shrink-Ray Reverser also runs BACKWARDS. If you already know the REAL length and need the drawing length, just undo the multiply — <b>divide</b> by the scale instead.</p>
<div class="law-scroll">↩️ Real 24 m, scale 1 cm = 4 m → drawing = 24 ÷ 4 = <b>6 cm</b></div>
<p>One more trick the examiners love: sometimes your multiplied answer comes out in METRES, but the question wants KILOMETRES. Remember Centi-Peed's Kilo-Centi-Milli Ladder? <b>1000 m = 1 km</b> — so just do the scale multiply first, THEN divide by 1000.</p>
<div class="law-scroll">🪜 8 cm × 250 m = 2000 m &nbsp;→&nbsp; ÷1000 &nbsp;→&nbsp; <b>2 km</b></div>
<p>Two clean steps, never one guess: multiply for the metres, then climb the ladder for the kilometres.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'sm-try-3', topicId: 'scale-maps', tier: 3, format: 'num',
        stem: 'A wall is really <b>28 m</b> long. It is drawn using a scale of 1 cm = 7 m. How long is the wall on the drawing? Give your answer in cm.',
        unit: 'cm',
        accept: ['4'],
        hintSteps: [
          'Working BACKWARDS from real life to the drawing means DIVIDE by the scale, not multiply.',
          '28 ÷ 7 = ?',
        ],
        explain: {
          rule: 'Read the scale like a recipe: 1 cm means X in real life. Measure, then multiply.',
          worked: '28 m ÷ 7 = 4 cm.',
          whyWrong: {},
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Real = Drawing × Scale. Always MULTIPLY the drawing measurement by the scale number.',
    'Divide only when working BACKWARDS: drawing length = real length ÷ scale.',
    'Never physically measure a scale drawing in the exam — every length you need is already labelled. Just read it.',
    'Check your UNITS: if the scale says "1 cm = 5 m", your real answer is in METRES, not centimetres — don’t leave it looking like the drawing number.',
    'Drawing split into two sections? Convert EACH one to real life first, THEN add — never add the raw drawing lengths.',
    'A scale is a MULTIPLY relationship, not an ADD one. "1 cm = 5 m" does NOT mean +5, it means ×5.',
    'If the answer needs kilometres, do the scale multiply first (→ metres), THEN divide by 1000 for km — two clean steps, not one guess.',
  ],
};
