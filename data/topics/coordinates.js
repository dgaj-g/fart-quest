// FART QUEST topic: The Grid Grotto — coordinates (Shape Caves)
// Authored content — implementation agents: read, never modify.

// -------- lesson-only visual helper --------
// Builds a small first-quadrant grid as plain inline-styled HTML (NOT the diagrams.js §C
// spec — that data-only form is for GENERATOR questions, rendered via renderDiagram at
// battle-mount time; lesson 'show'/'try' cards are pre-built HTML per BUILD_SPEC §5, since
// js/screens/lesson.js does not (yet) wire up the dynamic diagrams.js import that battle.js
// has). Uses only inline styles + the app's global CSS custom properties (--ink/--gold/
// --card/--shadow-card, defined in main.css :root) — no new lesson.css classes required.
function miniGrid(width, height, points) {
  const cell = 34;
  const labelCol = 26;
  let rows = '';
  for (let y = height; y >= 0; y--) {
    let cells = `<div style="width:${labelCol}px;height:${cell}px;display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--ink);font-size:13px;">${y}</div>`;
    for (let x = 0; x <= width; x++) {
      const pt = points.find((p) => p.x === x && p.y === y);
      if (pt) {
        cells += `<div style="width:${cell}px;height:${cell}px;border:1px solid rgba(51,38,29,.25);display:flex;align-items:center;justify-content:center;font-weight:700;background:var(--gold);color:var(--ink);border-radius:6px;box-sizing:border-box;">${pt.label}</div>`;
      } else {
        cells += `<div style="width:${cell}px;height:${cell}px;border:1px solid rgba(51,38,29,.18);box-sizing:border-box;"></div>`;
      }
    }
    rows += `<div style="display:flex;">${cells}</div>`;
  }
  let axisRow = `<div style="width:${labelCol}px;height:${cell}px;"></div>`;
  for (let x = 0; x <= width; x++) {
    axisRow += `<div style="width:${cell}px;height:${cell}px;display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--ink);font-size:13px;">${x}</div>`;
  }
  rows += `<div style="display:flex;">${axisRow}</div>`;
  return `<div style="overflow-x:auto;"><div style="display:inline-flex;flex-direction:column;background:var(--card);padding:10px;border-radius:14px;box-shadow:var(--shadow-card);">${rows}</div></div>`;
}

export default {
  id: 'coordinates',
  name: 'The Grid Grotto',
  region: 'shape-caves',
  genId: 'coordinates',
  tagline: 'Where every spot has an address — but only if you knock in the right order.',

  creature: {
    id: 'gridlock',
    name: 'Gridlock',
    rarity: 'rare',
    image: 'assets/monsters/gridlock.png',
    bio: 'Gridlock has never once been lost, because he refuses to move any way except ALONG the hall first, then UP the stairs. He has been known to stand at a doorway for eleven days rather than climb before walking.',
    factSneak: 'Coordinates always go ALONG first, then UP: (x, y) — never the other way round.',
  },

  weapon: {
    id: 'along-then-up-ladder',
    name: 'The Along-Then-Up Ladder',
    tagline: 'Reach any point in the Grotto — in the right order, every single time.',
    rule: 'ALONG the hall first, THEN up the stairs. (x, y) — always in that order.',
    example: 'Point A is 4 along and 3 up: <b>(4, 3)</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-coordinates',
      text: 'Oh, splendid, my little map-reader! May I introduce <b>Gridlock</b> — guardian of the Grid Grotto, and the fussiest creature in the whole kingdom about directions. He will only ever tell you where something is in ONE order: <b>ALONG the hall first, THEN up the stairs.</b> Get that order wrong and he simply will not budge.',
    },
    {
      type: 'show',
      title: 'The Grid Grotto has two directions',
      html: `<p>Every point in the Grotto lives where two paths cross: the <b>Hall</b>, which runs ALONG the bottom, and the <b>Staircase</b>, which climbs UP the side. Look at point <b>A</b> below.</p>
${miniGrid(6, 4, [{ x: 4, y: 2, label: 'A' }])}
<p>To find A: count <b>4</b> steps ALONG the hall, then <b>2</b> steps UP the staircase. We write that as <b>(4, 2)</b> — ALONG always comes first, UP always comes second.</p>`,
    },
    {
      type: 'talk',
      text: 'Here is the ONE rule Gridlock will never forgive you for breaking: the ALONG number always comes first, and the UP number always comes second — <b>(x, y)</b>, never the other way round. Swap them and you will end up in completely the wrong room of the Grotto!',
    },
    {
      type: 'try',
      q: {
        id: 'coord-try-1', topicId: 'coordinates', tier: 1, format: 'mcq5',
        stem: 'What are the coordinates of point <b>A</b>?',
        visual: { kind: 'grid', html: miniGrid(6, 4, [{ x: 3, y: 4, label: 'A' }]) },
        options: [
          { text: '(3, 4)', misconception: null },
          { text: '(4, 3)', misconception: 'xy-swap' },
          { text: '(4, 5)', misconception: 'off-by-one-both' },
          { text: '(4, 4)', misconception: 'off-by-one-x' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Start at the corner (0, 0) — where the hall meets the staircase. Count ALONG the hall to A first.',
          'Point A is 3 along and 4 up. Write ALONG then UP.',
        ],
        explain: {
          rule: 'ALONG the hall first, THEN up the stairs. (x, y) — always in that order.',
          worked: 'Point A is 3 along and 4 up: (3, 4).',
          whyWrong: {
            '(4, 3)': 'ALONG comes first, then UP — you have swapped the order round.',
            '(4, 5)': 'You started counting from 1 instead of 0 — the corner itself is 0.',
            '(4, 4)': 'The ALONG count is one square out — start counting from the corner, which is 0.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Zero still counts!',
      html: `<p>What if a point sits right ON the hall, or right ON the staircase? Look at point <b>B</b> — it hasn’t moved along the hall AT ALL.</p>
${miniGrid(6, 4, [{ x: 0, y: 3, label: 'B' }])}
<p>B is <b>0</b> steps ALONG (still at the very start of the hall) and <b>3</b> steps UP. Its coordinates are <b>(0, 3)</b> — that zero MUST be written. Leave it out and Gridlock has no idea where you mean!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'coord-try-2', topicId: 'coordinates', tier: 1, format: 'mcq5',
        stem: 'Point <b>C</b> sits right on the hall. What are its coordinates?',
        visual: { kind: 'grid', html: miniGrid(6, 4, [{ x: 5, y: 0, label: 'C' }]) },
        options: [
          { text: '(5, 0)', misconception: null },
          { text: '(0, 5)', misconception: 'xy-swap' },
          { text: '(4, 0)', misconception: 'off-by-one' },
          { text: '(5, 1)', misconception: 'zero-ignored' },
        ],
        correctIndex: 0,
        hintSteps: [
          'C hasn’t climbed the staircase at all — so one of its coordinates is 0.',
          'Count ALONG the hall to C, then remember UP is 0: (5, 0).',
        ],
        explain: {
          rule: 'ALONG the hall first, THEN up the stairs. (x, y) — always in that order.',
          worked: 'C is 5 along and 0 up (it sits exactly on the hall): (5, 0).',
          whyWrong: {
            '(0, 5)': 'ALONG comes first, then UP — even when one of them is 0.',
            '(4, 0)': 'Count the squares again from the corner (0) to point C.',
            '(5, 1)': 'C really does sit exactly on the hall — that coordinate is 0, not 1.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Gridlock’s hall of mirrors — reflecting a point',
      html: `<p>The Grotto has a mirror line, too — a perfectly straight, perfectly flat line running ALONG the grid. Flip a point over it and you get its <b>reflection</b>. Look at point <b>A</b> below, sitting 1 square above the mirror line at <b>y = 3</b>.</p>
${miniGrid(6, 6, [{ x: 2, y: 4, label: 'A' }, { x: 2, y: 2, label: 'A′' }])}
<p>Reflecting keeps the ALONG number exactly the same — only the UP number flips. A is <b>1</b> square above the line, so its reflection <b>A′</b> lands <b>1</b> square below it: A is (2, 4), A′ is <b>(2, 2)</b>. Same distance, opposite side!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'coord-try-3', topicId: 'coordinates', tier: 2, format: 'mcq5',
        stem: 'Point <b>A</b> is at <b>(2, 1)</b>. It is reflected in the horizontal line <b>y = 4</b>. What are the coordinates of its reflection, A′?',
        visual: { kind: 'grid', html: miniGrid(6, 8, [{ x: 2, y: 1, label: 'A' }]) },
        options: [
          { text: '(2, 7)', misconception: null },
          { text: '(7, 2)', misconception: 'xy-swap' },
          { text: '(2, 1)', misconception: 'no-reflect' },
          { text: '(2, 4)', misconception: 'reflected-onto-line' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Work out how far A is from the mirror line: (2, 1) is 3 away from y = 4.',
          'The reflection lands the SAME distance on the OTHER side of the line: (2, 7).',
        ],
        explain: {
          rule: 'ALONG the hall first, THEN up the stairs. (x, y) — always in that order.',
          worked: 'A is 3 below the line, so its reflection is 3 above the line: (2, 7).',
          whyWrong: {
            '(7, 2)': 'ALONG comes first, then UP — you have swapped this point’s coordinates round.',
            '(2, 1)': 'That’s the ORIGINAL point — you still need to reflect it to the other side of the line.',
            '(2, 4)': 'That point lands exactly ON the mirror line — the reflection needs to go the SAME distance past it, not stop there.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Coordinates always go ALONG first, then UP: (x, y) — never the other way round.',
    'The eternal trap is swapping x and y. Say “along… up…” out loud as you write each number.',
    'Count from the ORIGIN (0, 0) — the corner where the hall and staircase meet — never from 1.',
    'A point sitting exactly on the hall (or the staircase) still has a coordinate there: it’s 0, not missing.',
    'Reflecting in a horizontal mirror line? The ALONG number never changes — only the UP number flips to the same distance on the other side.',
    'Work out the distance from the point to the mirror line FIRST — the reflection lands that same distance past it, not on it.',
    'Always count grid LINES (the crossing points), not the squares between them.',
  ],
};
