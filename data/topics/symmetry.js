// FART QUEST topic: The Hall of Mirrors (Shape Caves)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'symmetry',
  name: 'The Hall of Mirrors',
  region: 'shape-caves',
  genId: 'symmetry',
  tagline: 'Where every shape is judged on whether it can fold and land on itself, twin to twin.',

  creature: {
    id: 'reflecto',
    name: 'Reflecto',
    rarity: 'rare',
    image: 'assets/monsters/reflecto.png',
    bio: 'Reflecto studies his own reflection for eleven hours a day and insists he is PERFECTLY symmetrical — except for one rogue eyebrow that flatly refuses to match its twin. He weeps about this nightly, into a mirror, symmetrically.',
    factSneak: 'A line of symmetry means every point on one side has an exact twin the SAME distance away on the other side — that rogue eyebrow is proof the line has moved.',
  },

  weapon: {
    id: 'fold-test',
    name: 'The Fold Test',
    tagline: 'Never guess a line of symmetry again — fold it, and check.',
    rule: 'Imagine folding on the line — every point must land exactly on its twin.',
    example: 'Fold a <b>rectangle</b> down the middle (vertical) — the two halves match. Fold it corner to corner (diagonal) — they DON’T. That’s <b>2</b> lines of symmetry, not 4.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-symmetry',
      text: 'Ahhh, my perfectly balanced young stinker! Allow me to introduce myself properly: I am Reflecto — flawless, symmetrical, devastatingly handsome on BOTH sides… apart from this one eyebrow, which I am reliably informed does not count. Today you learn the ONE test that finds a line of symmetry, every single time, with zero guessing.',
    },
    {
      type: 'show',
      title: 'The Fold Test',
      html: `<p>Look very closely at this letter <b>M</b>. See the dashed line running straight down the middle?</p>
<div style="display:flex;justify-content:center;padding:18px 0;">
  <div style="position:relative;font-size:100px;font-weight:800;line-height:1;font-family:'Fredoka',system-ui,sans-serif;color:#33261D;">
    M
    <div style="position:absolute;top:-12px;bottom:-12px;left:50%;width:0;border-left:3px dashed #8577b0;"></div>
  </div>
</div>
<p>Now imagine you could actually <b>fold</b> the letter right along that dashed line. The left half of the M swings over the top of the right half and lands… <b>exactly</b> on top of it. Not close. Not nearly. EXACTLY — every point meets its twin, edge to edge.</p>
<p>That dashed line is called a <b>line of symmetry</b> (or a mirror line). It’s the only test that matters. Forget guessing — if you can fold it and it matches perfectly, that line counts. If even one corner sticks out, it doesn’t.</p>`,
    },
    {
      type: 'talk',
      text: 'Now here’s the fun part. Some shapes only have ONE line like that. Some — a square, for instance — have FOUR. Some poor, wonky shapes have NONE at all, and that is a perfectly good answer too. Let’s go hunting for them.',
    },
    {
      type: 'try',
      q: {
        id: 'sym-try-1', topicId: 'symmetry', tier: 1, format: 'mcq5',
        stem: 'How many lines of symmetry does a <b>square</b> have?',
        options: [
          { text: '4', misconception: null },
          { text: '2', misconception: 'confused-with-rectangle' },
          { text: '1', misconception: 'undercounted' },
          { text: '8', misconception: 'overcounted' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Try folding a square vertically, then horizontally, then along EACH diagonal. Count every fold that lands perfectly.',
          'All four sides of a square are exactly equal — that’s what lets every single one of those folds work.',
        ],
        explain: {
          rule: 'Imagine folding on the line — every point must land exactly on its twin.',
          worked: 'A square folds perfectly vertically, horizontally, AND along both diagonals — that’s 4 lines of symmetry.',
          whyWrong: {
            '2': 'That’s a rectangle’s count. A square is extra special — because all 4 sides are equal, its diagonals fold perfectly too, giving it 2 more.',
            '1': 'A square can do far better than one fold — try the horizontal and both diagonals too.',
            '8': 'There are only 4 directions that actually work: vertical, horizontal, and the two diagonals. Any other line leaves a corner sticking out.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Rectangle Trap',
      html: `<p>Squares and rectangles look like close cousins. They are NOT identical, and mixing them up is one of the examiner’s absolute favourite traps.</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;width:100%;font-size:14px;text-align:center;">
<tr style="background:#eee;">
  <th style="border:1px solid #999;padding:8px;">Fold line</th>
  <th style="border:1px solid #999;padding:8px;">Square</th>
  <th style="border:1px solid #999;padding:8px;">Rectangle</th>
</tr>
<tr><td style="border:1px solid #999;padding:8px;">Vertical (down the middle)</td><td style="border:1px solid #999;padding:8px;">✅ matches</td><td style="border:1px solid #999;padding:8px;">✅ matches</td></tr>
<tr><td style="border:1px solid #999;padding:8px;">Horizontal (across the middle)</td><td style="border:1px solid #999;padding:8px;">✅ matches</td><td style="border:1px solid #999;padding:8px;">✅ matches</td></tr>
<tr><td style="border:1px solid #999;padding:8px;">Diagonal (corner to corner)</td><td style="border:1px solid #999;padding:8px;">✅ matches</td><td style="border:1px solid #999;padding:8px;background:#fdecea;">❌ corners DON’T meet</td></tr>
<tr><td style="border:1px solid #999;padding:8px;">Other diagonal</td><td style="border:1px solid #999;padding:8px;">✅ matches</td><td style="border:1px solid #999;padding:8px;background:#fdecea;">❌ corners DON’T meet</td></tr>
<tr style="background:#f4f1fb;font-weight:700;"><td style="border:1px solid #999;padding:8px;">TOTAL</td><td style="border:1px solid #999;padding:8px;">4</td><td style="border:1px solid #999;padding:8px;">2</td></tr>
</table>
</div>
<p>A <b>square</b> has 4 lines of symmetry because ALL FOUR sides are exactly equal — even the diagonal folds land perfectly. A <b>rectangle</b> only has 2, because its sides come in two DIFFERENT lengths — fold it corner to corner and the longer sides simply refuse to match up. Try it with a real piece of paper if Reflecto’s word isn’t enough for you.</p>`,
    },
    {
      type: 'talk',
      text: 'Notice something? The RULE never changed. You still fold, and you still check. It’s the shape’s OWN properties that decide how many folds actually work. Never assume a number — test each line.',
    },
    {
      type: 'try',
      q: {
        id: 'sym-try-2', topicId: 'symmetry', tier: 2, format: 'mcq5',
        stem: 'How many lines of symmetry does a <b>rectangle</b> have?',
        options: [
          { text: '2', misconception: null },
          { text: '4', misconception: 'confused-with-square' },
          { text: '0', misconception: 'assumes-no-symmetry' },
          { text: '1', misconception: 'undercounted' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The vertical and horizontal folds both work on a rectangle. What about the diagonals?',
          'A rectangle’s sides come in TWO different lengths — fold corner to corner and they don’t line up. So diagonals don’t count.',
        ],
        explain: {
          rule: 'Imagine folding on the line — every point must land exactly on its twin.',
          worked: 'A rectangle folds perfectly vertically and horizontally — but NOT along either diagonal, because its sides aren’t all equal. That’s 2 lines of symmetry.',
          whyWrong: {
            '4': 'That’s a SQUARE’S count. A rectangle’s diagonals do NOT match up unless all 4 sides happen to be equal (which would just make it a square).',
            '0': 'A rectangle definitely folds perfectly at least twice — try the vertical fold first.',
            '1': 'Check again — BOTH the vertical AND the horizontal fold work on a rectangle, not just one.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Completing a Reflection',
      html: `<p>Symmetry isn’t just about whole shapes — it works on PATTERNS in a grid too. Look at this grid. The thick line down the middle is the mirror line.</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;margin:14px auto;font-size:13px;">
<tr>
<td style="width:32px;height:32px;border:1px solid #999;"></td>
<td style="width:32px;height:32px;border:1px solid #999;background:#7BC950;"></td>
<td style="width:32px;height:32px;border:1px solid #999;border-right:4px solid #33261D;"></td>
<td style="width:32px;height:32px;border:1px solid #999;border-left:4px solid #33261D;"></td>
<td style="width:32px;height:32px;border:1px solid #999;background:#7BC950;"></td>
<td style="width:32px;height:32px;border:1px solid #999;"></td>
</tr>
<tr>
<td style="width:32px;height:32px;border:1px solid #999;"></td>
<td style="width:32px;height:32px;border:1px solid #999;"></td>
<td style="width:32px;height:32px;border:1px solid #999;border-right:4px solid #33261D;"></td>
<td style="width:32px;height:32px;border:1px solid #999;border-left:4px solid #33261D;"></td>
<td style="width:32px;height:32px;border:1px solid #999;"></td>
<td style="width:32px;height:32px;border:1px solid #999;"></td>
</tr>
</table>
</div>
<p style="text-align:center;font-size:13px;">Columns 1–6, mirror line between column 3 and column 4.</p>
<p>See the green cell in <b>column 2</b>? It sits exactly <b>1 step</b> from the mirror line. Its twin must sit exactly <b>1 step</b> from the mirror line too — but on the OTHER side. Count it: 1 step in from column 4 lands you on column 5. That’s why the second green cell is in column 5.</p>
<p>The rule never changes: <b>same distance, opposite side</b>. Count the steps to the mirror line, then count that many steps out the other side. Never slide it sideways — always FOLD it.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'sym-try-3', topicId: 'symmetry', tier: 3, format: 'mcq5',
        stem: 'A grid has 2 rows and 6 columns, numbered 1 to 6. The mirror line runs between column 3 and column 4. One cell is shaded at Row 1, Column 2. If you fold along the mirror line, which cell will the shading land on?',
        options: [
          { text: 'Row 1, Column 5', misconception: null },
          { text: 'Row 1, Column 4', misconception: 'off-by-one' },
          { text: 'Row 2, Column 5', misconception: 'wrong-axis' },
          { text: 'Row 1, Column 2', misconception: 'no-reflection' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Column 2 is how many steps from the mirror line (which sits between column 3 and column 4)?',
          'Count that same number of steps in from the OTHER side, starting at column 4.',
        ],
        explain: {
          rule: 'Imagine folding on the line — every point must land exactly on its twin.',
          worked: 'Column 2 is 1 step from the mirror line, so its twin is 1 step in from column 4: that’s Column 5. The row never changes — this fold is left-right only.',
          whyWrong: {
            'Row 1, Column 4': 'So close! Column 4 is right AT the mirror line, not one full step past it — count again.',
            'Row 2, Column 5': 'That flips the ROW as well — but this mirror line runs top-to-bottom, so only the column changes, never the row.',
            'Row 1, Column 2': 'That’s the ORIGINAL cell. Folding moves the shading across the mirror line to a brand new spot.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'A rectangle has only 2 lines of symmetry — vertical and horizontal. NOT 4! Its diagonals do not match (that’s a square’s trick, not a rectangle’s).',
    'A square has 4: vertical, horizontal AND both diagonals, because all 4 of its sides are exactly equal.',
    'The Fold Test never changes: fold on the line, and EVERY point must land exactly on its twin — no gaps, no overlap.',
    'On a grid, a reflected cell sits the SAME distance from the mirror line, but on the OPPOSITE side. Always measure from the MIRROR LINE, not the edge of the grid.',
    'Watch for TRAP lines: a line can look like it runs straight through the middle and still not be a genuine line of symmetry (a rectangle’s diagonal is the classic trap). Always use the Fold Test to check — never just eyeball it.',
    'A circle has infinite lines of symmetry — any straight line through its centre works.',
    '0 is a perfectly good answer! Shapes like a scalene triangle or a parallelogram have NO lines of symmetry at all.',
  ],
};
