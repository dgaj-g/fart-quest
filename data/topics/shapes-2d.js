// FART QUEST topic: Polygon Parlour (Shape Caves)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'shapes-2d',
  name: 'Polygon Parlour',
  region: 'shape-caves',
  genId: 'shapes2d',
  tagline: 'Where every shape gets sorted, counted, and occasionally loses an argument about its sides.',

  creature: {
    id: 'polly-gone',
    name: 'Polly Gone',
    rarity: 'rare',
    image: 'assets/monsters/polly-gone.png',
    bio: 'Polly Gone was a proud heptagon last Tuesday. She is somehow a hexagon this morning, and she will fight anyone — ANYONE — who mentions the missing side.',
    factSneak: 'A shape’s name comes from counting its sides and checking its angles — lose a side and you become an entirely different shape.',
  },

  weapon: {
    id: 'shape-sorter',
    name: 'The Shape Sorter',
    tagline: 'Never mis-name a shape again — sort it in three quick checks.',
    rule: 'Count the sides, check the angles, look for equal marks — the shape names itself.',
    example: '4 sides, no right angles, but all 4 sides equal → count (4), angles (none square), marks (all equal) → a <b>rhombus</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-shapes2d',
      text: 'Gather round, my splendidly angular hero! Every shape that has EVER existed — from the tiniest triangle to the wonkiest octagon — can be sorted using just <b>three checks</b>: how many SIDES, what the ANGLES are doing, and whether any sides are EXACTLY equal. Today, young stinker, YOU become the Sorter.',
    },
    {
      type: 'show',
      title: 'The Triangle Family',
      html: `<p>Every triangle has 3 sides — but not all triangles are alike. Look at the <b>sides</b> and the <b>angles</b> to sort them:</p>
<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin:16px 0;">
  <div style="text-align:center;width:110px;">
    <div style="width:80px;height:70px;background:#8577b0;clip-path:polygon(50% 0%,95% 100%,5% 100%);margin:0 auto 8px;"></div>
    <b>Equilateral</b><br><span style="font-size:13px;">3 equal sides<br>3 equal angles</span>
  </div>
  <div style="text-align:center;width:110px;">
    <div style="width:70px;height:80px;background:#8577b0;clip-path:polygon(50% 0%,85% 100%,15% 100%);margin:0 auto 8px;"></div>
    <b>Isosceles</b><br><span style="font-size:13px;">2 equal sides<br>2 equal angles</span>
  </div>
  <div style="text-align:center;width:110px;">
    <div style="width:80px;height:78px;background:#8577b0;clip-path:polygon(15% 0%,100% 55%,35% 100%);margin:0 auto 8px;"></div>
    <b>Scalene</b><br><span style="font-size:13px;">No equal sides<br>No equal angles</span>
  </div>
  <div style="text-align:center;width:110px;">
    <div style="width:70px;height:80px;background:#8577b0;clip-path:polygon(0% 0%,0% 100%,100% 100%);margin:0 auto 8px;"></div>
    <b>Right-angled</b><br><span style="font-size:13px;">Has ONE 90° corner<br>(marked with a little square)</span>
  </div>
</div>
<p>The Shape Sorter never guesses — it <b>counts equal marks</b>. Two identical tick marks on two sides? Isosceles. Three? Equilateral. None at all? Scalene.</p>`,
    },
    {
      type: 'talk',
      text: 'Here’s the trick examiners love to test: <b>equal marks mean EXACTLY equal</b> — not “looks a bit similar”. If a diagram shows two sides with the same little tick mark, those sides are IDENTICAL in length, guaranteed, even if the picture looks wonky (shape diagrams are often “not to scale”, cheeky things).',
    },
    {
      type: 'try',
      q: {
        id: 'shapes2d-try-1', topicId: 'shapes-2d', tier: 1, format: 'mcq5',
        stem: 'A triangle has <b>2 equal sides</b> and <b>2 equal angles</b>. What type of triangle is it?',
        options: [
          { text: 'Isosceles', misconception: null },
          { text: 'Equilateral', misconception: 'over-equal' },
          { text: 'Scalene', misconception: 'no-equal-recognised' },
          { text: 'Right-angled', misconception: 'confused-category' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count how many sides are equal — not all three, just some of them.',
          'Exactly TWO matching sides (not three) means the triangle is…?',
        ],
        explain: {
          rule: 'Count the sides, check the angles, look for equal marks — the shape names itself.',
          worked: '2 equal sides (not 3) with 2 equal angles = isosceles. The Shape Sorter never confuses 2 equal marks with 3.',
          whyWrong: {
            Equilateral: 'Equilateral needs ALL THREE sides equal — this triangle only has two.',
            Scalene: 'Scalene means NO sides match — but this one has a matching pair.',
            'Right-angled': 'Nothing here mentions a 90° corner — the clue was about equal sides, not a square corner.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Meet the Four-Sided Family',
      html: `<p>Quadrilaterals (4-sided shapes) are one big family — but each member has its own rules. One new word first: <b>parallel</b> sides run side-by-side, always the same distance apart, like train tracks — they never lean towards each other. Now check the table:</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;width:100%;font-size:13px;">
<tr style="background:#eee;"><th style="border:1px solid #999;padding:6px;">Shape</th><th style="border:1px solid #999;padding:6px;">Sides equal?</th><th style="border:1px solid #999;padding:6px;">Right angles?</th><th style="border:1px solid #999;padding:6px;">Parallel sides?</th></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Square</b></td><td style="border:1px solid #999;padding:6px;">All 4</td><td style="border:1px solid #999;padding:6px;">All 4</td><td style="border:1px solid #999;padding:6px;">2 pairs</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Rectangle</b></td><td style="border:1px solid #999;padding:6px;">Opposite pairs only</td><td style="border:1px solid #999;padding:6px;">All 4</td><td style="border:1px solid #999;padding:6px;">2 pairs</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Rhombus</b></td><td style="border:1px solid #999;padding:6px;">All 4</td><td style="border:1px solid #999;padding:6px;">None (usually)</td><td style="border:1px solid #999;padding:6px;">2 pairs</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Parallelogram</b></td><td style="border:1px solid #999;padding:6px;">Opposite pairs only</td><td style="border:1px solid #999;padding:6px;">None (usually)</td><td style="border:1px solid #999;padding:6px;">2 pairs</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Kite</b></td><td style="border:1px solid #999;padding:6px;">2 pairs, side-by-side</td><td style="border:1px solid #999;padding:6px;">None (usually)</td><td style="border:1px solid #999;padding:6px;">None</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>Trapezium</b></td><td style="border:1px solid #999;padding:6px;">Not usually</td><td style="border:1px solid #999;padding:6px;">None (usually)</td><td style="border:1px solid #999;padding:6px;">1 pair only</td></tr>
</table>
</div>
<p style="margin-top:14px;padding:10px;background:#f4f1fb;border-left:4px solid #8577b0;"><b>Family secret:</b> a <b>square is ALWAYS a rectangle</b> (it has 4 right angles and opposite sides equal — that’s all a rectangle needs!). A square is ALSO always a rhombus (4 equal sides). But it doesn’t work backwards — a rectangle is NOT always a square, and a rhombus is NOT always a square. Family loyalty only flows one way!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'shapes2d-try-2', topicId: 'shapes-2d', tier: 1, format: 'mcq5',
        stem: 'A shape has <b>4 equal sides</b> and <b>no right angles</b>. What is it called?',
        options: [
          { text: 'Rhombus', misconception: null },
          { text: 'Square', misconception: 'ignored-angle-clue' },
          { text: 'Parallelogram', misconception: 'ignored-equal-sides' },
          { text: 'Kite', misconception: 'wrong-family' },
        ],
        correctIndex: 0,
        hintSteps: [
          '“4 equal sides” only fits two shapes in the family — a square, or one other shape.',
          'The clue “no right angles” rules the square OUT. What’s left?',
        ],
        explain: {
          rule: 'Count the sides, check the angles, look for equal marks — the shape names itself.',
          worked: '4 equal sides rules out everything except square and rhombus. No right angles rules out the square. That leaves rhombus.',
          whyWrong: {
            Square: 'A square DOES have 4 equal sides — but it also always has 4 right angles, which this shape does not.',
            Parallelogram: 'A parallelogram only needs OPPOSITE sides equal — this shape has ALL FOUR sides equal, which is a stronger clue.',
            Kite: 'A kite has two SEPARATE pairs of equal sides, not all four the same.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Bigger Families — and a Round One',
      html: `<p>Shapes can have more than 4 sides too. Count the sides, and the name follows a pattern:</p>
<div style="overflow-x:auto;">
<table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:14px;">
<tr style="background:#eee;"><th style="border:1px solid #999;padding:6px;">Sides</th><th style="border:1px solid #999;padding:6px;">Name</th></tr>
<tr><td style="border:1px solid #999;padding:6px;">3</td><td style="border:1px solid #999;padding:6px;">Triangle</td></tr>
<tr><td style="border:1px solid #999;padding:6px;">4</td><td style="border:1px solid #999;padding:6px;">Quadrilateral</td></tr>
<tr><td style="border:1px solid #999;padding:6px;">5</td><td style="border:1px solid #999;padding:6px;">Pentagon</td></tr>
<tr><td style="border:1px solid #999;padding:6px;">6</td><td style="border:1px solid #999;padding:6px;">Hexagon</td></tr>
<tr><td style="border:1px solid #999;padding:6px;">7</td><td style="border:1px solid #999;padding:6px;">Heptagon</td></tr>
<tr><td style="border:1px solid #999;padding:6px;">8</td><td style="border:1px solid #999;padding:6px;">Octagon</td></tr>
</table>
</div>
<p><b>Regular or irregular?</b> A shape is only <b>regular</b> if ALL its sides AND ALL its angles are equal — like Polly Gone on a good day. A shape that just “looks fairly tidy” is NOT automatically regular; check every side and every angle before you decide.</p>
<div style="display:flex;gap:20px;justify-content:center;align-items:flex-end;margin:14px 0;">
  <div style="text-align:center;"><div style="width:74px;height:70px;background:#8577b0;clip-path:polygon(50% 0%,95% 38%,78% 100%,22% 100%,5% 38%);margin:0 auto 6px;"></div><b>Regular</b> pentagon<br><span style="font-size:12px;">all sides + angles equal</span></div>
  <div style="text-align:center;"><div style="width:74px;height:70px;background:#8577b0;clip-path:polygon(28% 0%,95% 32%,78% 100%,22% 88%,0% 28%);margin:0 auto 6px;"></div><b>Irregular</b> pentagon<br><span style="font-size:12px;">sides + angles differ</span></div>
</div>
<p><b>Circles</b> get a mention too. A circle has one edge (the circumference) and one special dot in the middle (the centre):</p>
<div style="position:relative;width:120px;height:120px;margin:10px auto;border-radius:50%;border:3px solid #333;">
  <div style="position:absolute;left:50%;top:50%;width:56px;height:2px;background:#8577b0;transform-origin:left center;transform:rotate(-25deg);"></div>
  <div style="position:absolute;left:8px;top:50%;width:104px;height:2px;background:#333;transform:translateY(-50%);"></div>
  <div style="position:absolute;left:50%;top:50%;width:6px;height:6px;background:#333;border-radius:50%;transform:translate(-50%,-50%);"></div>
</div>
<p style="text-align:center;font-size:13px;">The short line = <b>radius</b> (centre to edge). The long line = <b>diameter</b> (all the way across, through the centre). The diameter is always <b>double</b> the radius.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'shapes2d-try-3', topicId: 'shapes-2d', tier: 2, format: 'mcq5',
        stem: 'Which of these is <b>NOT true</b> about a rectangle?',
        options: [
          { text: 'It has 4 right angles.', misconception: 'picked-true-fact' },
          { text: 'Opposite sides are equal in length.', misconception: 'picked-true-fact' },
          { text: 'All 4 sides are always the same length.', misconception: null },
          { text: 'It is a quadrilateral.', misconception: 'picked-true-fact' },
        ],
        correctIndex: 2,
        hintSteps: [
          'Three of these four statements are true for EVERY rectangle. One is only true for a special, extra-fancy rectangle.',
          'Which statement needs ALL FOUR sides equal? That only happens when the rectangle is also a square.',
        ],
        explain: {
          rule: 'Count the sides, check the angles, look for equal marks — the shape names itself.',
          worked: 'A rectangle is a quadrilateral with 4 right angles and equal opposite sides. It does NOT always have all 4 sides the same length — that extra rule only applies when the rectangle happens to be a square.',
          whyWrong: {
            'It has 4 right angles.': 'That IS true for every rectangle — not the odd one out.',
            'Opposite sides are equal in length.': 'That IS true for every rectangle — not the odd one out.',
            'It is a quadrilateral.': 'That IS true — every rectangle is a 4-sided shape, so it is a quadrilateral. Not the odd one out.',
          },
        },
      },
    },
    { type: 'anim', anim: 'shapes-2d' },
    { type: 'weapon' },
  ],

  tips: [
    'Count the SIDES first — that alone often narrows the family (3 = triangle, 4 = quadrilateral, 5 = pentagon…).',
    'A square is ALWAYS a rectangle AND ALWAYS a rhombus. Family loyalty only flows one way — a rectangle isn’t always a square.',
    'Equal-side tick marks mean EXACTLY equal — count how many sides carry the same mark before you name the shape.',
    'Regular means ALL sides AND ALL angles equal — a shape that just “looks tidy” isn’t automatically regular.',
    'Rhombus vs kite: a rhombus has all 4 sides the same; a kite has two SEPARATE pairs of equal sides, next to each other.',
    'The diameter is exactly double the radius — work outwards from the centre for the radius, all the way across for the diameter.',
    'Right-angled doesn’t rule out isosceles or scalene — always check the SIDES too, not just the corner.',
  ],
};
