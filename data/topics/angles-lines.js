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
    factSneak: 'Acute is sharp (under 90°), right is exactly 90°, obtuse is wide like Obtusius (between 90° and 180°), straight is flat (exactly 180°), and reflex is wider than a straight line (over 180°).',
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
    <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(var(--stink) 0deg 90deg, #e8e0cd 90deg 360deg);border:2px solid var(--ink);margin:0 auto 6px;"></div>
    <div style="font-weight:700;font-size:13px;">Right</div>
    <div style="font-size:11px;color:#8c7a63;">exactly 90°</div>
  </div>
  <div style="text-align:center;width:82px;">
    <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(var(--gold-deep) 0deg 140deg, #e8e0cd 140deg 360deg);border:2px solid var(--ink);margin:0 auto 6px;"></div>
    <div style="font-weight:700;font-size:13px;">Obtuse</div>
    <div style="font-size:11px;color:#8c7a63;">90°–180°</div>
  </div>
  <div style="text-align:center;width:82px;">
    <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(#b06a86 0deg 180deg, #e8e0cd 180deg 360deg);border:2px solid var(--ink);margin:0 auto 6px;"></div>
    <div style="font-weight:700;font-size:13px;">Straight</div>
    <div style="font-size:11px;color:#8c7a63;">exactly 180°</div>
  </div>
  <div style="text-align:center;width:82px;">
    <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(#4f9c9c 0deg 300deg, #e8e0cd 300deg 360deg);border:2px solid var(--ink);margin:0 auto 6px;"></div>
    <div style="font-weight:700;font-size:13px;">Reflex</div>
    <div style="font-size:11px;color:#8c7a63;">over 180°</div>
  </div>
</div>
<p>See a little square 🔲 drawn in the corner of an angle? That is the official “this one is EXACTLY 90°” stamp. No square mark, no guarantee — you must work it out properly, never guess by eye. <b>Every angle diagram you meet is drawn NOT TO SCALE</b> — the picture is just a rough sketch, so trust the numbers, never a ruler.</p>`,
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
          { text: 'Right', misconception: 'wrong-cat-right' },
          { text: 'Reflex', misconception: 'wrong-cat-reflex' },
          { text: 'Straight', misconception: 'wrong-cat-straight' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Compare 130° to 90° and 180°. Is it smaller than 90°, exactly 90°, in between, exactly 180°, or bigger than 180°?',
          '130° is bigger than 90° but smaller than 180° — that makes it…?',
        ],
        explain: {
          rule: 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.',
          worked: '130° sits between 90° and 180°, so it’s obtuse.',
          whyWrong: {
            'Acute': '130° is way more than 90° — too big for acute (acute means UNDER 90°).',
            'Right': '130° isn’t exactly 90°, so it can’t be a right angle.',
            'Reflex': '130° isn’t over 180°, so it isn’t reflex.',
            'Straight': '130° isn’t exactly 180°, so it isn’t a straight angle.',
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
      title: 'The Law of Straight Lines',
      html: `<p>Take any straight line and stick a ray into the middle of it. You have just chopped it into two angles — and here is the ancient law:</p>
<div class="law-scroll">📜 <b>THE LAW OF STRAIGHT LINES:</b> the two angles on a straight line ALWAYS add up to <b>180°</b>. No exceptions.</div>
<div style="position:relative;width:240px;height:110px;margin:20px auto 34px;">
  <div style="position:absolute;left:0;right:0;top:86px;height:3px;background:var(--ink);"></div>
  <div style="position:absolute;left:50%;top:86px;width:110px;height:3px;background:var(--stink);transform-origin:0 50%;transform:rotate(-65deg);border-radius:2px;"></div>
  <div style="position:absolute;left:calc(50% - 5px);top:81px;width:10px;height:10px;border-radius:50%;background:var(--ink);"></div>
  <div style="position:absolute;left:22%;top:8px;font-weight:700;">65°</div>
  <div style="position:absolute;left:64%;top:8px;font-weight:700;">?</div>
</div>
<div class="estimate-demo">
  <div class="est-line">Total on the line: <b>180°</b></div>
  <div class="est-line">One angle is 65°, so the other is 180 − 65 = <b>115°</b></div>
</div>
<p>That’s it. Whatever one angle is, the other is “180 take away that number”. Obtusius uses this to check whether HE is being obtuse or just a very generous right angle. (He is always, always obtuse.)</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'angle-try-2', topicId: 'angles-lines', tier: 2, format: 'mcq5',
        stem: 'Two angles sit together on a straight line. One angle is <b>65°</b>. What is the other angle?',
        visual: { kind: 'angle', deg: 65 },
        options: [
          { text: '115°', misconception: null },
          { text: '65°', misconception: 'copied-given' },
          { text: '295°', misconception: 'wrong-total-360' },
          { text: '25°', misconception: 'wrong-total-90' },
          { text: '125°', misconception: 'arithmetic-slip' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Angles on a straight line always add up to 180°. Which two numbers are we working with here?',
          '180 − 65 = …?',
        ],
        explain: {
          rule: 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.',
          worked: '65° and the missing angle sit on a straight line, so together they make 180°. 180° − 65° = 115°.',
          whyWrong: {
            '65°': 'That’s just the angle you were already given — the question wants the OTHER one.',
            '295°': 'That uses 360° as the total — that’s for angles all the way round a point, not a straight line.',
            '25°': 'That treats the line like a right angle (90°) instead of a full straight line (180°).',
            '125°': 'Close — but check the subtraction again, it’s a few degrees out.',
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
<p><b>Watch out for isosceles triangles</b> — they have TWO equal angles (called the “base angles”), sitting opposite the two equal sides. If you are told a triangle is isosceles and given ONE base angle, the OTHER base angle is a free copy — the SAME number. Only the third, different angle (the “apex”) needs working out: 180 minus BOTH base angles.</p>
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
        stem: 'An isosceles triangle has a top (apex) angle of <b>40°</b>. The other two angles are equal to each other. What is the size of EACH of those two equal angles?',
        options: [
          { text: '70°', misconception: null },
          { text: '140°', misconception: 'remainder-not-halved' },
          { text: '20°', misconception: 'halved-wrong-number' },
          { text: '90°', misconception: 'assumed-right' },
          { text: '75°', misconception: 'arithmetic-slip' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The two equal angles share what’s left after the apex: 180 − 40 = ?',
          'Now split that remainder equally between the two equal angles: ÷ 2 = …?',
        ],
        explain: {
          rule: 'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. A triangle’s angles always total 180°.',
          worked: '180° − 40° = 140°. Shared equally between the two base angles: 140° ÷ 2 = 70° each.',
          whyWrong: {
            '140°': 'That’s the leftover after the apex angle — but it needs to be SHARED between the two equal base angles, not left as one.',
            '20°': 'That halves the apex angle (40°) by mistake — it’s the remainder (180° minus the apex) that gets shared.',
            '90°': 'That assumes a right angle — nothing in the question tells you that.',
            '75°': 'Close — but check the division again, it’s a few degrees out.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Sharper than a corner = acute. Past a corner = obtuse. Past a straight line = reflex. Learn the shapes, not just the words.',
    'Diagrams in this topic are NEVER to scale — always work the angle out, never guess by eye or by measuring.',
    'Angles on a straight line always add up to 180°. Angles inside ANY triangle always add up to 180° too — different picture, same total.',
    'Angles inside a quadrilateral add up to 360° — DOUBLE the triangle’s total. Don’t mix the two up.',
    'Isosceles triangle? Two angles are EQUAL (the base angles). If you’re given one, the other is a free copy — only the apex is different.',
    'Perpendicular = crosses at exactly 90° (look for the little square mark). Parallel = never meets, always the same distance apart.',
    'Two-step angle questions: work out the FIRST missing angle (often on a line), then use THAT number to find the one they actually asked for.',
  ],
};
