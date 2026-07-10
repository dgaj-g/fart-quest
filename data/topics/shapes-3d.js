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
      title: 'The Curved Ones',
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
<p style="margin:10px 0;"><b>The trap:</b> a curved surface still counts as a face, and a curved rim still counts as an edge. A cylinder has 2 edges (the top rim and the bottom rim) but ZERO vertices — a rim is curved all the way round, so it never comes to a sharp point. A cone has exactly ONE vertex (the pointy top).</p>`,
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
      title: 'The Face-Count Trap',
      html: `<p>Here's how Sir Facelot catches out a lazy counter. A <b>square-based pyramid</b> and a <b>triangular prism</b> both have <b>5 faces</b> — count faces alone and you can't tell them apart!</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;width:100%;font-size:13px;">
<tr style="background:#eee;"><th style="border:1px solid #999;padding:6px;">Solid</th><th style="border:1px solid #999;padding:6px;">Faces</th><th style="border:1px solid #999;padding:6px;">Edges</th><th style="border:1px solid #999;padding:6px;">Vertices</th></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Square-based pyramid</b></td><td style="border:1px solid #999;padding:6px;">5</td><td style="border:1px solid #999;padding:6px;">8</td><td style="border:1px solid #999;padding:6px;">5</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Triangular prism</b></td><td style="border:1px solid #999;padding:6px;">5</td><td style="border:1px solid #999;padding:6px;">9</td><td style="border:1px solid #999;padding:6px;">6</td></tr>
</table>
</div>
<p style="margin:10px 0;"><b>The fix:</b> the moment two solids tie on one property, count a SECOND one before you answer. Here, the edges (8 vs 9) and vertices (5 vs 6) settle it every time. Never lock in an answer off a single matching number — check faces, THEN edges, THEN vertices, until only one solid is left standing.</p>
<p>Try it: a solid has 5 faces AND 8 edges. Only one solid in the whole family matches BOTH — the square-based pyramid.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'shapes3d-try-3', topicId: 'shapes-3d', tier: 3, format: 'mcq5',
        stem: 'A solid has exactly 5 FACES and 8 EDGES. Which solid is it?',
        options: [
          { text: 'Square-based pyramid', misconception: null },
          { text: 'Triangular prism', misconception: 'face-count-only' },
          { text: 'Cuboid', misconception: 'wrong-solid-cuboid' },
          { text: 'Cone', misconception: 'wrong-solid-cone' },
          { text: 'Cylinder', misconception: 'wrong-solid-cylinder' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A triangular prism ALSO has 5 faces — the face count alone isn\'t enough here.',
          'Check the second clue: 8 edges. A square-based pyramid has 8 edges; a triangular prism has 9.',
        ],
        explain: {
          rule: 'Faces are flat, edges are where faces meet, vertices are the corners. Count in that order.',
          worked: 'Both the square-based pyramid and the triangular prism have 5 faces — but only the square-based pyramid also has 8 edges (the prism has 9), so that second clue proves it.',
          whyWrong: {
            'Triangular prism': 'A triangular prism does have 5 faces like the answer — but it has 9 edges, not 8, so the second clue rules it out.',
            'Cuboid': 'A cuboid has 6 faces and 12 edges — neither number matches.',
            'Cone': 'A cone has 2 faces and 1 edge — neither number matches.',
            'Cylinder': 'A cylinder has 3 faces and 2 edges — neither number matches.',
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
    'Add Faces + Edges + Vertices together to double-check a count — a cube gives 6 + 12 + 8 = 26. Get a different total on a recount? Something was miscounted.',
    'A square-based pyramid (5 faces, 8 edges, 5 vertices) and a triangular prism (5 faces, 9 edges, 6 vertices) share the same FACE count — check edges or vertices too before you decide which one it is.',
  ],
};
