// FART QUEST topic: The Acute Corner (Shape Caves)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'angles-lines',
  name: 'The Acute Corner',
  region: 'shape-caves',
  genId: 'angles',
  tagline: 'Where every corner has an attitude, and every triangle keeps its promise.',

  creature: {
    id: 'obtusius',
    name: 'Obtusius',
    rarity: 'rare',
    image: 'assets/monsters/obtusius.png',
    bio: 'Obtusius takes up FAR more room than is strictly polite — a proper 90°-plus of pure wobbling drama, and not a right angle in sight. He has never once fitted through a doorway without loudly blaming the doorway.',
    factSneak: 'Acute is sharp (under 90°), obtuse is wide like Obtusius (between 90° and 180°), and reflex is wider than a straight line (over 180°).',
  },

  weapon: {
    id: 'angle-gauge',
    name: 'The Angle Gauge',
    tagline: 'Sizes up any angle without a protractor in sight.',
    rule: 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.',
    example: 'This angle leans way past a corner but isn’t flat yet — that’s <b>obtuse</b>. And a triangle with angles 50°, 60° and 70°? 50 + 60 + 70 = <b>180°</b>, every single time.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-angles',
      text: 'BEHOLD, young nose-soldier — the magnificent Obtusius! Look at the SPREAD of him. The absolute SWAGGER. He is, and I say this with deep respect, a very wide angle indeed. Today you learn to size up ANY angle just by looking — no protractor required.',
    },
    {
      type: 'show',
      title: 'The Angle Family',
      html: `<p>Every angle has a personality. Some are sharp and snappy. Some are wide and dramatic — ahem, Obtusius. Here is the whole family, smallest to biggest:</p>
<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:18px 0;">
  <div style="text-align:center;width:82px;">
    <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(var(--swamp-glow) 0deg 50deg, #e8e0cd 50deg 360deg);border:2px solid var(--ink);margin:0 auto 6px;"></div>
    <div style="font-weight:700;font-size:13px;">Acute</div>
    <div style="font-size:11px;color:#8c7a63;">under 90°</div>
  </div>
  <div style="text-align:center;width:82px;">
    <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(var(--gold-deep) 0deg 140deg, #e8e0cd 140deg 360deg);border:2px solid var(--ink);margin:0 auto 6px;"></div>
    <div style="font-weight:700;font-size:13px;">Obtuse</div>
    <div style="font-size:11px;color:#8c7a63;">90°–180°</div>
  </div>
  <div style="text-align:center;width:82px;">
    <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(#4f9c9c 0deg 300deg, #e8e0cd 300deg 360deg);border:2px solid var(--ink);margin:0 auto 6px;"></div>
    <div style="font-weight:700;font-size:13px;">Reflex</div>
    <div style="font-size:11px;color:#8c7a63;">over 180°</div>
  </div>
</div>
<p><b>Every angle diagram you meet is drawn NOT TO SCALE</b> — the picture is just a rough sketch, so trust the numbers, never a ruler.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'angle-try-1', topicId: 'angles-lines', tier: 1, format: 'mcq5',
        stem: 'What TYPE of angle is this?',
        visual: { kind: 'angle', deg: 130 },
        options: [
          { text: 'Obtuse', misconception: null },
          { text: 'Acute', misconception: 'wrong-cat-acute' },
          { text: 'Reflex', misconception: 'wrong-cat-reflex' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Compare 130° to 90° and 180°. Is it smaller than 90°, in between the two, or bigger than 180°?',
          '130° is bigger than 90° but smaller than 180° — that makes it…?',
        ],
        explain: {
          rule: 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.',
          worked: '130° sits between 90° and 180°, so it’s obtuse.',
          whyWrong: {
            'Acute': '130° is way more than 90° — too big for acute (acute means UNDER 90°).',
            'Reflex': '130° isn’t over 180°, so it isn’t reflex.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: 'Angles aren’t just about size, though. Lines have MANNERS. Some lines run alongside each other forever, like polite queuers. Some lines barge straight across each other at a perfect right angle. Let me teach you the words the examiners love.',
    },
    {
      type: 'show',
      title: 'How Lines Behave',
      html: `<div style="display:flex;gap:22px;flex-wrap:wrap;justify-content:center;margin:18px 0;">
  <div style="text-align:center;">
    <div style="width:90px;height:60px;position:relative;margin:0 auto 8px;">
      <div style="position:absolute;top:14px;left:0;width:90px;height:4px;background:var(--ink);border-radius:2px;"></div>
      <div style="position:absolute;top:40px;left:0;width:90px;height:4px;background:var(--ink);border-radius:2px;"></div>
    </div>
    <div style="font-weight:700;font-size:13px;">Parallel</div>
    <div style="font-size:11px;color:#8c7a63;">never meet</div>
  </div>
  <div style="text-align:center;">
    <div style="width:90px;height:60px;position:relative;margin:0 auto 8px;">
      <div style="position:absolute;top:28px;left:0;width:90px;height:4px;background:var(--ink);border-radius:2px;"></div>
      <div style="position:absolute;top:0;left:43px;width:4px;height:60px;background:var(--ink);border-radius:2px;"></div>
    </div>
    <div style="font-weight:700;font-size:13px;">Perpendicular</div>
    <div style="font-size:11px;color:#8c7a63;">cross at 90°</div>
  </div>
  <div style="text-align:center;">
    <div style="width:8px;height:60px;background:var(--ink);border-radius:4px;margin:0 auto 8px;"></div>
    <div style="font-weight:700;font-size:13px;">Vertical</div>
    <div style="font-size:11px;color:#8c7a63;">straight up-down</div>
  </div>
  <div style="text-align:center;">
    <div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;">
      <div style="width:60px;height:8px;background:var(--ink);border-radius:4px;"></div>
    </div>
    <div style="font-weight:700;font-size:13px;">Horizontal</div>
    <div style="font-size:11px;color:#8c7a63;">flat, side to side</div>
  </div>
</div>
<p><b>Parallel</b> lines never meet, however far you draw them — same distance apart, forever. <b>Perpendicular</b> lines are secretly just two right angles having an argument: they cross at exactly 90°. If you spot that little square mark where two lines cross, that’s the “we are perpendicular” badge.</p>`,
    },
    {
      type: 'show',
      title: 'Perpendicular in Action',
      html: `<p>You’ve just met <b>perpendicular</b> — lines that cross at exactly 90°. Here’s the giveaway to look for in a question:</p>
<div style="position:relative;width:200px;height:120px;margin:20px auto;">
  <div style="position:absolute;left:0;right:0;top:60px;height:4px;background:var(--ink);border-radius:2px;"></div>
  <div style="position:absolute;left:calc(50% - 2px);top:0;width:4px;height:120px;background:var(--stink);border-radius:2px;"></div>
  <div style="position:absolute;left:calc(50% + 8px);top:40px;font-weight:700;">90°</div>
</div>
<p>Two lines cross and make a perfect right angle where they meet — that’s the whole test. Whenever a crossing measures exactly 90°, the word the examiners want is <b>perpendicular</b>. No 90° crossing? Then it isn’t.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'angle-try-2', topicId: 'angles-lines', tier: 2, format: 'mcq5',
        stem: 'Two lines cross, and the angle where they meet is exactly <b>90°</b>. What word best describes these two lines?',
        options: [
          { text: 'Perpendicular', misconception: null },
          { text: 'Parallel', misconception: 'parallel' },
          { text: 'Vertical', misconception: 'vertical' },
          { text: 'Horizontal', misconception: 'horizontal' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Think about the special word for two lines that cross at a perfect right angle.',
          'Not lines that never meet, and not a direction word — the crossing word for exactly 90°…?',
        ],
        explain: {
          rule: 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.',
          worked: 'Lines that cross at exactly a right angle (90°) are called perpendicular.',
          whyWrong: {
            'Parallel': 'Parallel lines never cross at all — but these two do, at 90°.',
            'Vertical': 'Vertical just means pointing straight up and down — it doesn’t describe how two lines cross.',
            'Horizontal': 'Horizontal just means lying flat, side to side — it doesn’t describe how two lines cross.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Triangles Keep a Promise',
      html: `<p>Every triangle ever drawn — tall, squat, lopsided, doesn’t matter — makes the exact same promise:</p>
<div class="law-scroll">📜 <b>THE TRIANGLE PROMISE:</b> the three angles inside ANY triangle always add up to <b>180°</b>.</div>
<div style="position:relative;width:180px;height:140px;margin:20px auto;">
  <div style="width:0;height:0;border-left:90px solid transparent;border-right:90px solid transparent;border-bottom:140px solid var(--swamp-glow);"></div>
  <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);font-weight:700;color:#fff;">50°</div>
  <div style="position:absolute;bottom:6px;left:8px;font-weight:700;color:#fff;">60°</div>
  <div style="position:absolute;bottom:6px;right:8px;font-weight:700;color:#fff;">70°</div>
</div>
<p>50 + 60 + 70 = 180. Every single time. So if a triangle question gives you TWO angles, the third is no mystery: <b>180 minus the two you already know</b>.</p>
<p>Quadrilaterals — any 4-sided shape — make an even BIGGER promise:</p>
<div class="law-scroll">📜 <b>THE QUADRILATERAL PROMISE:</b> the four angles inside ANY quadrilateral always add up to <b>360°</b> — double the triangle’s promise.</div>
<div style="position:relative;width:160px;height:110px;margin:20px auto;border:4px solid var(--ink);background:rgba(155,89,208,.15);border-radius:6px;">
  <div style="position:absolute;top:6px;left:8px;font-weight:700;">90°</div>
  <div style="position:absolute;top:6px;right:8px;font-weight:700;">90°</div>
  <div style="position:absolute;bottom:6px;left:8px;font-weight:700;">90°</div>
  <div style="position:absolute;bottom:6px;right:8px;font-weight:700;">90°</div>
</div>
<p>90 + 90 + 90 + 90 = 360. Mix up 180 and 360 and the Angle Gauge will judge you SEVERELY.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'angle-try-3', topicId: 'angles-lines', tier: 2, format: 'mcq5',
        stem: 'A triangle has angles of <b>55°</b> and <b>65°</b>. What is the third angle?',
        options: [
          { text: '60°', misconception: null },
          { text: '120°', misconception: 'added-instead' },
          { text: '125°', misconception: 'forgot-second-angle' },
          { text: '240°', misconception: 'used-360-total' },
          { text: '70°', misconception: 'arithmetic-slip' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Every triangle’s three angles add up to 180°. Add the two you know: 55 + 65 = ?',
          '180 − 120 = …?',
        ],
        explain: {
          rule: 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.',
          worked: '55° + 65° = 120°. 180° − 120° = 60°.',
          whyWrong: {
            '120°': 'That’s the two given angles added together — you still need to take that away from 180°.',
            '125°': 'That only takes away ONE of the two known angles — both need to come off 180°.',
            '240°': 'That’s the QUADRILATERAL total (360°) — this is a triangle, which totals 180°.',
            '70°': 'Close — but check the subtraction again, it’s a few degrees out.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. Learn the shapes, not just the words.',
    'Diagrams in this topic are NEVER to scale — always work the angle out, never guess by eye or by measuring.',
    'Angles inside ANY triangle always add up to 180° — tall, squat or lopsided, doesn’t matter.',
    'Angles inside a quadrilateral add up to 360° — DOUBLE the triangle’s total. Don’t mix the two up.',
    'Careful at the edges: acute is strictly UNDER 90°, obtuse is strictly BETWEEN 90° and 180°, reflex is OVER 180°. Work from the number, never a guess by eye.',
    'Perpendicular = crosses at exactly 90° (look for the little square mark). Parallel = never meets, always the same distance apart.',
    'Two-step angle questions: work out one triangle’s (or shape’s) missing angle first, then use THAT number for the step they actually asked about.',
  ],
};
