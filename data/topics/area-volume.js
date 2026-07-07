// FART QUEST topic: The Filling Fields — area & volume (Measure Marsh)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'area-volume',
  name: 'The Filling Fields',
  region: 'measure-marsh',
  genId: 'areavolume',
  tagline: 'Where every space gets tiled, stacked, and bragged about.',

  creature: {
    id: 'cubby-mcsquareface',
    name: 'Cubby McSquareface',
    rarity: 'rare',
    image: 'assets/monsters/cubby-mcsquareface.png',
    bio: 'Cubby can squeeze his enormous self into absolutely any box, then immediately tell you how many cubic centimetres he took up. He once refused to leave a shoebox for three days purely to brag about the number.',
    factSneak: 'Area = length × width, measured in SQUARE units (cm²). Volume = length × width × height, measured in CUBED units (cm³).',
  },

  weapon: {
    id: 'tile-and-stack-kit',
    name: 'The Tile-and-Stack Kit',
    tagline: 'Tile any flat space, stack any box — and work backwards when you need to.',
    rule: 'Area = tiles that cover it (length × width). Volume = stacked layers (× height too).',
    example: 'A crate is 4 cm long, 3 cm wide, 2 cm high. Tile the base: 4 × 3 = 12. Stack it up: 12 × 2 = <b>24 cm³</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-areavolume',
      text: 'Brace yourself, my tile-and-stack apprentice! Meet <b>Cubby McSquareface</b> — he can squeeze his enormous self into ANY box, and afterwards he WILL tell you exactly how many cubic centimetres he took up. Today you learn his two great powers: <b>AREA</b>, how much flat space something covers, and <b>VOLUME</b>, how much space something fills right up. Same trick both times. Watch closely!',
    },
    {
      type: 'show',
      title: 'Area: tiles that cover it',
      html: `<p>Look at this tiled patio. Each little tile is a <b>1 cm × 1 cm</b> square. <b>Area</b> just means: how many of these squares does it take to EXACTLY cover the shape, with no gaps and no overlaps?</p>
<div style="display:grid;grid-template-columns:repeat(4,44px);grid-auto-rows:44px;gap:3px;justify-content:center;margin:18px 0;">
  <div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div>
  <div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div>
  <div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div><div style="background:#2E4A33;border-radius:6px;"></div>
</div>
<p>Count them: 1, 2, 3… all the way to <b>12</b>. This patio is <b>12 cm²</b> — twelve “little square centimetres” of space. That little <b>²</b> is the flag that tells everyone you counted SQUARES, not just a length.</p>`,
    },
    {
      type: 'talk',
      text: 'Counting one-by-one is fine for a small patio — but Cubby once had to tile an entire ballroom, and he was NOT counting to four thousand by hand. Here’s the shortcut: if the tiles sit in neat rows and columns, just multiply how many ALONG by how many DOWN. <b>Length × width.</b> Same answer, MUCH faster.',
    },
    {
      type: 'try',
      q: {
        id: 'av-try-1', topicId: 'area-volume', tier: 1, format: 'mcq5',
        stem: 'A rectangle is <b>5 cm</b> long and <b>3 cm</b> wide. What is its AREA?',
        options: [
          { text: '15 cm²', misconception: null },
          { text: '8 cm²', misconception: 'added-not-multiplied' },
          { text: '15 cm', misconception: 'dropped-squared-unit' },
          { text: '16 cm²', misconception: 'miscount' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Area = length × width. What are the length and width here?',
          '5 × 3 = …?',
        ],
        explain: {
          rule: 'Area = tiles that cover it (length × width). Volume = stacked layers (× height too).',
          worked: '5 cm × 3 cm = 15 cm². Don’t forget the little ² — it shows you counted SQUARES.',
          whyWrong: {
            '8 cm²': 'That’s 5 + 3 — adding gives the wrong total. Area means MULTIPLY the sides, not add them.',
            '15 cm': 'The number is right, but the unit is missing its ² — area is always measured in SQUARE units.',
            '16 cm²': 'Recheck the multiplication: 5 × 3, not 5 × 3 + 1.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Trap alert: Perimeter is NOT Area',
      html: `<p>Here is Cubby’s least favourite trick question. Take that same 5 cm × 3 cm rectangle again.</p>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:18px 0;">
  <div style="background:rgba(0,0,0,.05);border-radius:14px;padding:14px 18px;text-align:center;max-width:220px;">
    <div style="font-weight:700;margin-bottom:6px;">🚶 PERIMETER</div>
    <div>Walk all the way round the OUTSIDE edge.</div>
    <div style="margin-top:8px;font-size:22px;font-weight:700;">5+3+5+3 = <b>16 cm</b></div>
  </div>
  <div style="background:rgba(0,0,0,.05);border-radius:14px;padding:14px 18px;text-align:center;max-width:220px;">
    <div style="font-weight:700;margin-bottom:6px;">🧱 AREA</div>
    <div>Cover the WHOLE INSIDE with tiles.</div>
    <div style="margin-top:8px;font-size:22px;font-weight:700;">5 × 3 = <b>15 cm²</b></div>
  </div>
</div>
<p>Two totally different questions, two totally different answers — and on the test, one of them is ALWAYS sitting in the options to tempt you. See a “cm” with no little <b>²</b>? That’s the perimeter walking round in disguise. Check the unit before you trust the number!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'av-try-2', topicId: 'area-volume', tier: 2, format: 'mcq5',
        stem: 'A banner is <b>2.5 m</b> long and <b>4 m</b> wide. What is its area?',
        options: [
          { text: '10 m²', misconception: null },
          { text: '6.5 m²', misconception: 'added-not-multiplied' },
          { text: '10 m', misconception: 'dropped-squared-unit' },
          { text: '13 m', misconception: 'perimeter-instead' },
          { text: '9 m²', misconception: 'arithmetic-slip' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Area = length × width — multiply the two measurements together, even with a decimal.',
          '2.5 × 4 = …?',
        ],
        explain: {
          rule: 'Area = tiles that cover it (length × width). Volume = stacked layers (× height too).',
          worked: '2.5 m × 4 m = 10 m².',
          whyWrong: {
            '6.5 m²': 'That’s 2.5 + 4 — area means MULTIPLY the sides, not add them.',
            '10 m': 'The number is right, but area needs the little ² unit — you dropped it.',
            '13 m': 'That’s the PERIMETER (2 × (2.5 + 4)) — a totally different question from area.',
            '9 m²': 'Check the multiplication again: 2.5 × 4, step by step.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Volume: stacked layers',
      html: `<p>Now Cubby’s real speciality: filling a box. Take a box that’s <b>3 cm</b> long, <b>2 cm</b> wide, and <b>2 layers</b> high. Each FLAT layer covers 3 × 2 = 6 cubes — that’s the AREA of the base.</p>
<div style="display:flex;gap:14px;justify-content:center;align-items:flex-end;margin:18px 0;flex-wrap:wrap;">
  <div style="text-align:center;">
    <div style="font-size:12px;font-weight:700;color:#8c7a63;margin-bottom:4px;">LAYER 1</div>
    <div style="display:grid;grid-template-columns:repeat(3,34px);grid-auto-rows:34px;gap:3px;">
      <div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div>
      <div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div>
    </div>
  </div>
  <div style="font-family:'Fredoka',sans-serif;font-weight:700;font-size:24px;color:var(--stink,#9B59D0);">+</div>
  <div style="text-align:center;">
    <div style="font-size:12px;font-weight:700;color:#8c7a63;margin-bottom:4px;">LAYER 2</div>
    <div style="display:grid;grid-template-columns:repeat(3,34px);grid-auto-rows:34px;gap:3px;">
      <div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div>
      <div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div><div style="background:#2E4A33;border-radius:5px;"></div>
    </div>
  </div>
</div>
<p>6 cubes + 6 cubes = <b>12 cubes</b> altogether. That’s the VOLUME — how much space the whole box fills. Because we counted little CUBES this time, the unit gets a <b>³</b>: <b>12 cm³</b>. The shortcut: <b>length × width × height</b>. 3 × 2 × 2 = 12. Same trick as area, just one extra stack!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'av-try-3', topicId: 'area-volume', tier: 2, format: 'mcq5',
        stem: 'A box is <b>4 cm</b> long, <b>3 cm</b> wide and <b>2 cm</b> high. What is its volume?',
        options: [
          { text: '24 cm³', misconception: null },
          { text: '9 cm³', misconception: 'added-not-multiplied' },
          { text: '24 cm²', misconception: 'wrong-power-unit' },
          { text: '12 cm³', misconception: 'forgot-height' },
          { text: '20 cm³', misconception: 'arithmetic-slip' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Volume = length × width × height — multiply all three measurements together.',
          '4 × 3 × 2 = …?',
        ],
        explain: {
          rule: 'Area = tiles that cover it (length × width). Volume = stacked layers (× height too).',
          worked: '4 cm × 3 cm × 2 cm = 24 cm³.',
          whyWrong: {
            '9 cm³': 'That’s 4 + 3 + 2 — volume means MULTIPLY all three sides, not add them.',
            '24 cm²': 'Volume fills SPACE, so it needs a ³, not a ² — a ² is only for flat area.',
            '12 cm³': 'That’s only the base layer (4 × 3) — you still need to stack it up by the height (× 2).',
            '20 cm³': 'Check the multiplication again: 4 × 3 × 2, step by step.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: 'One last trick, and it’s a good one: the Tile-and-Stack Kit runs BACKWARDS too! Already know the AREA and one side? Just DIVIDE instead of multiply to find the missing side. Area 36 cm², one side is 9 cm? Then <b>36 ÷ 9 = 4 cm</b> is the missing side. Same kit, opposite direction — examiners LOVE asking it this way round.',
    },
    { type: 'weapon' },
  ],

  tips: [
    'Area = tiles that cover it (length × width), always in SQUARE units (cm², m²…). Volume = stacked layers (length × width × height), always in CUBED units (cm³, m³…).',
    'Never drop the little ² or ³ — it’s the #1 mark-loser. cm and cm² are NOT swappable.',
    'Perimeter (walk the edge) and Area (cover the inside) are different questions with different answers — the perimeter value is always lurking as a distractor.',
    'Multiply, don’t add! 5 cm × 3 cm is NOT 5 + 3.',
    'Decimal dimensions work exactly the same way: 2.5 × 4 = 10, just like whole numbers.',
    'Reverse questions: if you know the area (or volume) and all-but-one side, DIVIDE to find the missing side. 36 ÷ 9 = 4.',
    'Compound (L-shaped) areas: split the shape into simple rectangles, find each area, then ADD them together.',
  ],
};
