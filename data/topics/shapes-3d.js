// FART QUEST topic: The Solid Cellar — 3D shapes (Shape Caves)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'shapes-3d',
  name: 'The Solid Cellar',
  region: 'shape-caves',
  genId: 'shapes3d',
  tagline: 'Deep underground, where every solid gets its faces, edges and corners counted — whether it likes it or not.',

  creature: {
    id: 'sir-facelot',
    name: 'Sir Facelot',
    rarity: 'rare',
    image: 'assets/monsters/sir-facelot.png',
    bio: 'Sir Facelot cannot meet a single soul without counting their faces, edges and vertices out loud, in that exact order. He has been asked to stop. He has not stopped.',
    factSneak: 'Faces are flat, edges are where faces meet, vertices are the corners — always count in that order.',
  },

  weapon: {
    id: 'face-edge-corner-counter',
    name: 'The Face-Edge-Corner Counter',
    tagline: 'Never miscount a solid again — read it off in the one true order.',
    rule: 'Faces are flat, edges are where faces meet, vertices are the corners. Count in that order.',
    example: 'A cube: 6 flat faces, 12 edges (where two faces meet), 8 vertices (where edges meet at a point) → <b>6, 12, 8</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-shapes3d',
      text: 'Down the steps, down, DOWN into the Solid Cellar, brave nose-soldier! Everything down here is solid, chunky, and three-dimensional — no flat paper shapes allowed. Sir Facelot lives here, and he has ONE hobby: counting. Faces. Edges. Vertices. Always in that order. Today, young stinker, that hobby becomes YOUR weapon.',
    },
    {
      type: 'show',
      title: 'Meet the Solid Family',
      html: `<p>A <b>3D solid</b> takes up space — it has length, width AND height, unlike a flat 2D shape. Here is the whole family you need to know:</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;width:100%;font-size:13px;">
<tr style="background:#eee;"><th style="border:1px solid #999;padding:6px;">Solid</th><th style="border:1px solid #999;padding:6px;">What it looks like</th></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Cube</b></td><td style="border:1px solid #999;padding:6px;">A dice — every one of its 6 faces is an identical square.</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Cuboid</b></td><td style="border:1px solid #999;padding:6px;">A cereal box — 6 rectangular faces, but not all of them are squares.</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Cylinder</b></td><td style="border:1px solid #999;padding:6px;">A tin of beans — two flat circle faces, joined by one curved surface.</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Cone</b></td><td style="border:1px solid #999;padding:6px;">A traffic cone — one flat circle face, one curved surface, one sharp point.</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Sphere</b></td><td style="border:1px solid #999;padding:6px;">A football — one curved surface all over. No flat faces, no edges, no corners.</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Triangular prism</b></td><td style="border:1px solid #999;padding:6px;">A Toblerone box — two identical triangle ends, joined by three rectangles.</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Square-based pyramid</b></td><td style="border:1px solid #999;padding:6px;">The Great Pyramid of Giza — one square base, four triangles meeting at a point.</td></tr>
</table>
</div>
<p style="margin-top:14px;padding:10px;background:#f4f1fb;border-left:4px solid #8577b0;"><b>Prisms are special:</b> a prism has the SAME slice (cross-section) running all the way through it, like a loaf of bread. A cuboid and a triangular prism are both prisms. A cone, a pyramid, a cylinder and a sphere are NOT prisms — they either curve, or they narrow to a single point.</p>`,
    },
    {
      type: 'talk',
      text: 'Now for the Face-Edge-Corner Counter itself. Pick up any solid, my young stinker, and count in THIS order, every time: <b>FACES</b> first (the flat bits you could rest your elbow on), then <b>EDGES</b> (the straight lines where two faces crash into each other), then <b>VERTICES</b> (the sharp corners, where edges meet at a point). A cube: 6 faces, 12 edges, 8 vertices. Learn 6-12-8 like your own name — every paper wants it.',
    },
    {
      type: 'try',
      q: {
        id: 'shapes3d-try-1', topicId: 'shapes-3d', tier: 1, format: 'mcq5',
        stem: 'A solid has one square face on the bottom, and FOUR triangular faces that all meet at a single point at the top. What is it called?',
        options: [
          { text: 'Square-based pyramid', misconception: null },
          { text: 'Triangular prism', misconception: 'wrong-family' },
          { text: 'Cuboid', misconception: 'ignored-triangles' },
          { text: 'Cone', misconception: 'ignored-square-base' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A square base rules out anything with a circular or triangular base.',
          'Four triangles meeting at ONE point at the top — that shape narrows to a single vertex, just like a pyramid.',
        ],
        explain: {
          rule: 'Faces are flat, edges are where faces meet, vertices are the corners. Count in that order.',
          worked: 'One square face (the base) plus four triangular faces meeting at a single top point = a square-based pyramid.',
          whyWrong: {
            'Triangular prism': 'A triangular prism has TWO triangle ends and three rectangles — it does not narrow to a single point at the top.',
            'Cuboid': 'A cuboid is made entirely of rectangles — there are no triangular faces at all.',
            'Cone': 'A cone has a CIRCLE base and a curved surface, not a square base made of flat triangles.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Curved Ones — and the 11 Nets',
      html: `<p>Cones and cylinders are trickier because part of them is <b>curved</b>, not flat. Here is how the Counter still handles them:</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;width:100%;font-size:13px;">
<tr style="background:#eee;"><th style="border:1px solid #999;padding:6px;">Solid</th><th style="border:1px solid #999;padding:6px;">Faces</th><th style="border:1px solid #999;padding:6px;">Edges</th><th style="border:1px solid #999;padding:6px;">Vertices</th></tr>
<tr style="background:#fff3c9;"><td style="border:1px solid #999;padding:6px;"><b>Cube</b></td><td style="border:1px solid #999;padding:6px;">6</td><td style="border:1px solid #999;padding:6px;">12</td><td style="border:1px solid #999;padding:6px;">8</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Cuboid</b></td><td style="border:1px solid #999;padding:6px;">6</td><td style="border:1px solid #999;padding:6px;">12</td><td style="border:1px solid #999;padding:6px;">8</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Triangular prism</b></td><td style="border:1px solid #999;padding:6px;">5</td><td style="border:1px solid #999;padding:6px;">9</td><td style="border:1px solid #999;padding:6px;">6</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Square-based pyramid</b></td><td style="border:1px solid #999;padding:6px;">5</td><td style="border:1px solid #999;padding:6px;">8</td><td style="border:1px solid #999;padding:6px;">5</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Cylinder</b></td><td style="border:1px solid #999;padding:6px;">3 (2 flat + 1 curved)</td><td style="border:1px solid #999;padding:6px;">2</td><td style="border:1px solid #999;padding:6px;">0</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Cone</b></td><td style="border:1px solid #999;padding:6px;">2 (1 flat + 1 curved)</td><td style="border:1px solid #999;padding:6px;">1</td><td style="border:1px solid #999;padding:6px;">1</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Sphere</b></td><td style="border:1px solid #999;padding:6px;">1 (curved)</td><td style="border:1px solid #999;padding:6px;">0</td><td style="border:1px solid #999;padding:6px;">0</td></tr>
</table>
</div>
<p style="margin:10px 0;"><b>The trap:</b> a curved surface still counts as a face, and a curved rim still counts as an edge. A cylinder has 2 edges (the top rim and the bottom rim) but ZERO vertices — a rim is curved all the way round, so it never comes to a sharp point. A cone has exactly ONE vertex (the pointy top).</p>
<p><b>Cube nets:</b> if you cut a cube along some edges and flatten it out, you get a <b>net</b> — 6 squares joined edge-to-edge. There are exactly <b>11 different nets</b> that fold up into a closed cube with no gaps and no overlaps. Look at these two — both use 6 squares, but only ONE of them actually works:</p>
<div style="display:flex;gap:28px;justify-content:center;align-items:flex-start;margin:14px 0;flex-wrap:wrap;">
  <div style="text-align:center;">
    <div style="display:inline-grid;grid-template-columns:repeat(3,26px);grid-template-rows:repeat(4,26px);gap:2px;">
      <div style="background:#8577b0;border:1px solid #4a4368;"></div><div style="background:#8577b0;border:1px solid #4a4368;"></div><div style="background:#8577b0;border:1px solid #4a4368;"></div>
      <div></div><div style="background:#8577b0;border:1px solid #4a4368;"></div><div></div>
      <div></div><div style="background:#8577b0;border:1px solid #4a4368;"></div><div></div>
      <div></div><div style="background:#8577b0;border:1px solid #4a4368;"></div><div></div>
    </div>
    <p style="font-size:13px;margin-top:6px;"><b>✅ Folds into a cube</b><br>every square becomes its own face</p>
  </div>
  <div style="text-align:center;">
    <div style="display:inline-grid;grid-template-columns:repeat(6,26px);grid-template-rows:26px;gap:2px;">
      <div style="background:#c0625b;border:1px solid #6b3230;"></div><div style="background:#c0625b;border:1px solid #6b3230;"></div><div style="background:#c0625b;border:1px solid #6b3230;"></div><div style="background:#c0625b;border:1px solid #6b3230;"></div><div style="background:#c0625b;border:1px solid #6b3230;"></div><div style="background:#c0625b;border:1px solid #6b3230;"></div>
    </div>
    <p style="font-size:13px;margin-top:6px;"><b>❌ Does NOT fold into a cube</b><br>a straight line of 6 overlaps itself</p>
  </div>
</div>
<p>Same number of squares (6). Same edge-to-edge joining. Completely different result. The ONLY way to be sure is to check the exact arrangement — never assume "6 squares = it works".</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'shapes3d-try-2', topicId: 'shapes-3d', tier: 2, format: 'mcq5',
        stem: 'How many EDGES does a triangular prism have?',
        options: [
          { text: '9', misconception: null },
          { text: '6', misconception: 'used-vertices-count' },
          { text: '5', misconception: 'used-faces-count' },
          { text: '12', misconception: 'used-cube-count' },
          { text: '8', misconception: 'used-pyramid-count' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Faces first, then edges, then vertices — a triangular prism has 5 faces (2 triangles + 3 rectangles).',
          'Now count the straight lines where those faces meet: the 3 edges around one triangle, the 3 around the other, and the 3 running lengthways between them.',
        ],
        explain: {
          rule: 'Faces are flat, edges are where faces meet, vertices are the corners. Count in that order.',
          worked: 'A triangular prism has 9 edges: 3 round each triangular end (6 total) plus 3 running along its length.',
          whyWrong: {
            '6': 'That is the VERTICES count for a triangular prism, not the edges count.',
            '5': 'That is the FACES count for a triangular prism, not the edges count.',
            '12': '12 edges belongs to a cube or cuboid, not a triangular prism.',
            '8': '8 edges belongs to a square-based pyramid, not a triangular prism.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Does It Fold? — the exam favourite',
      html: `<p>Exam papers LOVE showing a net and asking "will this fold into a cube?" Here is the Counter's check, step by step:</p>
<ol style="line-height:1.7;">
  <li><b>Count the squares.</b> A cube net always needs exactly 6 — one for every face.</li>
  <li><b>Trace the fold in your head.</b> Pick one square as the base, then fold every other square up like a lid. Does each one land on its OWN face, or does it crash into a square that's already there?</li>
  <li><b>Watch for overlaps.</b> If two squares would land on top of each other, one face of the cube is left bare — that net is broken, no matter how tidy it looks.</li>
</ol>
<p>Don't be fooled by shape: a "T" shape and a "+" (plus) shape can BOTH fold into a perfect cube — they just look different flattened out. Meanwhile, a solid block of 6 squares (2 rows of 3) never works, and a straight line of 6 never works either. There is no shortcut for "looks about right" — trace the fold, every time.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'shapes3d-try-3', topicId: 'shapes-3d', tier: 3, format: 'mcq5',
        stem: 'Here is a net made of 6 squares joined edge-to-edge, arranged as a solid block: two rows of three. If you cut it out and folded along every line, would it make a closed cube?',
        visual: { kind: 'polygrid', rows: 2, cols: 3, shaded: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]] },
        options: [
          { text: 'No — two of the squares overlap when folded, leaving a face bare.', misconception: null },
          { text: 'Yes — any shape made of exactly 6 squares will fold into a cube.', misconception: 'any-six-squares-myth' },
          { text: 'No — it only has 5 squares, not 6.', misconception: 'miscounted-squares-low' },
          { text: 'Yes — as long as the squares all touch edge-to-edge, it will fold into a cube.', misconception: 'edge-touch-myth' },
          { text: 'No — this shape has more than 6 squares.', misconception: 'miscounted-squares-high' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count the squares first — there are exactly 6 here, so the count alone can\'t be the problem.',
          'Now trace the fold: a solid 2×3 block wraps two squares onto the SAME face when folded — it is NOT one of the 11 nets that work.',
        ],
        explain: {
          rule: 'Faces are flat, edges are where faces meet, vertices are the corners. Count in that order.',
          worked: 'This solid 2×3 block of squares is not one of the 11 valid cube nets — folding it makes two squares land on the same face, leaving another face bare.',
          whyWrong: {
            'Yes — any shape made of exactly 6 squares will fold into a cube.': 'Not true — this exact arrangement proves it: 6 squares, edge-to-edge, and it still fails to fold into a cube.',
            'No — it only has 5 squares, not 6.': 'Count again — there are 6 squares shown (two full rows of three).',
            'Yes — as long as the squares all touch edge-to-edge, it will fold into a cube.': 'Edge-to-edge joining isn\'t enough on its own — the exact arrangement matters, and this one fails.',
            'No — this shape has more than 6 squares.': 'Count again — there are exactly 6 squares shown, not more.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Always count in the SAME order: Faces (flat), Edges (where faces meet), Vertices (the corners).',
    'Memorise the cube: 6 faces, 12 edges, 8 vertices. A cuboid has the exact same counts — the difference is a cube\'s faces are ALL identical squares.',
    'A curved surface still counts as a face, and a curved rim still counts as an edge — but a curve never makes a vertex (a vertex must be a sharp point).',
    'Cylinder: 3 faces, 2 edges, 0 vertices. Cone: 2 faces, 1 edge, 1 vertex. Sphere: 1 face, 0 edges, 0 vertices — learn these three separately, they don\'t follow the flat-shape pattern.',
    'A prism has the SAME slice running all the way through (like a cuboid or a triangular prism). A cone, pyramid, cylinder and sphere are NOT prisms — they curve or narrow to a point.',
    'There are exactly 11 nets that fold into a cube. Same number of squares does NOT mean it works — always trace the fold, don\'t just count.',
    'A square-based pyramid (5 faces, 8 edges, 5 vertices) and a triangular prism (5 faces, 9 edges, 6 vertices) share the same FACE count — check edges or vertices too before you decide which one it is.',
  ],
};
