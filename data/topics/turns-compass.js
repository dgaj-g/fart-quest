// FART QUEST topic: The Spinning Chamber (Shape Caves)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'turns-compass',
  name: 'The Spinning Chamber',
  region: 'shape-caves',
  genId: 'turnscompass',
  tagline: 'Where every turn spins you exactly where the compass says — if you know which way is which.',

  creature: {
    id: 'wrong-way-wanda',
    name: 'Wrong-Way Wanda',
    rarity: 'rare',
    image: 'assets/monsters/wrong-way-wanda.png',
    bio: 'Wanda has been spinning in this chamber for a thousand years and still cannot tell you which way she is facing — ask her for North and she will triumphantly point South-West. She insists this is everyone else’s fault.',
    factSneak: 'Compass points run N-E-S-W clockwise — “Naughty Elephants Squirt Water” — so a quarter turn is simply one letter along.',
  },

  weapon: {
    id: 'compass-cap',
    name: 'The Compass Cap',
    tagline: 'Never lose your bearings again — turn with total confidence, forwards or backwards.',
    rule: "N-E-S-W clockwise ('Naughty Elephants Squirt Water'). A quarter turn = one letter along.",
    example: 'Facing <b>North</b>, turn a quarter turn clockwise: one letter along from N is E. Now facing <b>East</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-turnscompass',
      text: 'Welcome, welcome, my splendidly directional hero, to the Spinning Chamber! In here lives poor Wrong-Way Wanda — she spins and spins and NEVER knows which way she’s facing. Today, YOU learn the one trick that always keeps your bearings straight, so you never end up as lost as she is.',
    },
    {
      type: 'show',
      title: 'Naughty Elephants Squirt Water',
      html: `<p>A compass has four main points: <b>North, East, South, West</b>. Here’s the secret — going <b>clockwise</b>, they spell out a silly sentence:</p>
<p style="text-align:center;font-size:19px;margin:10px 0;"><b>N</b>aughty <b>E</b>lephants <b>S</b>quirt <b>W</b>ater</p>
<div style="position:relative;width:200px;height:200px;margin:16px auto;border:4px solid #33261D;border-radius:50%;background:#FFF9EC;">
  <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);font-weight:700;font-size:16px;">N</div>
  <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-weight:700;font-size:16px;">E</div>
  <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-weight:700;font-size:16px;">S</div>
  <div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-weight:700;font-size:16px;">W</div>
  <div style="position:absolute;left:50%;top:50%;font-size:48px;transform:translate(-50%,-50%);">🧭</div>
  <div style="position:absolute;top:8px;left:50%;width:2px;height:80px;background:#8577b0;transform-origin:top center;transform:translateX(-50%) rotate(0deg);"></div>
</div>
<p>Around the circle, clockwise, it always goes <b>N → E → S → W → back to N</b>. That circle NEVER changes — learn it once, and it works for every single question in this chamber.</p>`,
    },
    {
      type: 'talk',
      text: 'Here is the whole secret weapon in one sentence: <b>a quarter turn is just one letter along</b>. Facing North and told to turn a quarter turn clockwise? Don’t panic — just say the mnemonic and take one step: N, then… E! That’s it. That’s the whole trick.',
    },
    {
      type: 'try',
      q: {
        id: 'turnscompass-try-1', topicId: 'turns-compass', tier: 1, format: 'mcq5',
        stem: 'Wrong-Way Wanda is facing <b>North</b>. She turns a <b>quarter turn clockwise</b>. Which direction is she facing now?',
        options: [
          { text: 'East', misconception: null },
          { text: 'West', misconception: 'wrong-direction' },
          { text: 'South', misconception: 'too-far' },
          { text: 'North', misconception: 'no-turn' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Say the mnemonic in order: North, East, South, West, then back to North.',
          'A quarter turn is ONE letter along, clockwise. What comes straight after North?',
        ],
        explain: {
          rule: "N-E-S-W clockwise ('Naughty Elephants Squirt Water'). A quarter turn = one letter along.",
          worked: 'N-E-S-W clockwise. One letter along from North is East.',
          whyWrong: {
            West: 'West is one letter BACK — that’s the anticlockwise direction, not clockwise.',
            South: 'South is TWO letters along — that would be a half turn, not a quarter turn.',
            North: 'That’s where she started — a real turn always lands on a new direction.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Full Eight-Point Compass',
      html: `<p>Real compasses have FOUR more points hiding between the main ones: <b>North-East, South-East, South-West, North-West</b>. They slot in neatly, still going clockwise:</p>
<div style="position:relative;width:220px;height:220px;margin:16px auto;border:4px solid #33261D;border-radius:50%;background:#FFF9EC;font-size:13px;font-weight:700;">
  <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);">N</div>
  <div style="position:absolute;top:32px;right:34px;">NE</div>
  <div style="position:absolute;right:6px;top:50%;transform:translateY(-50%);">E</div>
  <div style="position:absolute;bottom:32px;right:34px;">SE</div>
  <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);">S</div>
  <div style="position:absolute;bottom:32px;left:34px;">SW</div>
  <div style="position:absolute;left:6px;top:50%;transform:translateY(-50%);">W</div>
  <div style="position:absolute;top:32px;left:34px;">NW</div>
  <div style="position:absolute;left:50%;top:50%;font-size:40px;transform:translate(-50%,-50%);">🧭</div>
</div>
<p>Clockwise, the full circle reads: <b>N → NE → E → SE → S → SW → W → NW → back to N</b>. Each little step is worth 45°. That means a <b>quarter turn is TWO points along</b> on this bigger circle (2 × 45° = 90° — still exactly the same quarter turn as before, just counted on the bigger dial). A <b>half turn is FOUR points</b>, and a <b>three-quarter turn is SIX points</b>.</p>
<p><b>Anticlockwise</b> just means going the OTHER way round the circle — backwards through the letters. Facing North and told to turn a quarter turn ANTI-clockwise? That’s still TWO points — but counted BACKWARDS from North: NW, then W. She’s now facing West, not East!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'turnscompass-try-2', topicId: 'turns-compass', tier: 2, format: 'mcq5',
        stem: 'Wanda is facing <b>East</b>. She turns a <b>three-quarter turn</b> clockwise. Which direction is she facing now?',
        options: [
          { text: 'North', misconception: null },
          { text: 'South', misconception: 'wrong-direction' },
          { text: 'West', misconception: 'wrong-size-smaller' },
          { text: 'East', misconception: 'no-turn' },
          { text: 'North-East', misconception: 'plausible-other-point' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A three-quarter turn is SIX points round the compass, going clockwise.',
          'Starting at East, count six points clockwise: SE, S, SW, W, NW, N… that’s six. Which point is that?',
        ],
        explain: {
          rule: "N-E-S-W clockwise ('Naughty Elephants Squirt Water'). A quarter turn = one letter along.",
          worked: 'East + a three-quarter turn clockwise (6 points) = North.',
          whyWrong: {
            South: 'That’s six points ANTI-clockwise, not clockwise — check the direction.',
            West: 'That’s only four points along (a half turn), not six.',
            East: 'She DID end up facing somewhere new — a three-quarter turn is a big move, not a stay-put.',
            'North-East': 'Count the six points again from East, clockwise — that’s not where you land.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Whole Turn: Right The Way Round',
      html: `<p>There’s one more size of turn: the <b>WHOLE turn</b>. It’s all <b>8 points</b> of the compass in one go — 360°, the entire circle.</p>
<table style="border-collapse:collapse;width:100%;font-size:13px;margin:14px 0;">
<tr style="background:#eee;"><th style="border:1px solid #999;padding:6px;">Size</th><th style="border:1px solid #999;padding:6px;">Points</th><th style="border:1px solid #999;padding:6px;">Degrees</th></tr>
<tr><td style="border:1px solid #999;padding:6px;">quarter turn</td><td style="border:1px solid #999;padding:6px;">2</td><td style="border:1px solid #999;padding:6px;">90°</td></tr>
<tr><td style="border:1px solid #999;padding:6px;">half turn</td><td style="border:1px solid #999;padding:6px;">4</td><td style="border:1px solid #999;padding:6px;">180°</td></tr>
<tr><td style="border:1px solid #999;padding:6px;">three-quarter turn</td><td style="border:1px solid #999;padding:6px;">6</td><td style="border:1px solid #999;padding:6px;">270°</td></tr>
<tr><td style="border:1px solid #999;padding:6px;"><b>whole turn</b></td><td style="border:1px solid #999;padding:6px;"><b>8</b></td><td style="border:1px solid #999;padding:6px;"><b>360°</b></td></tr>
</table>
<p>Because a whole turn goes ALL the way round the circle, it always lands you back facing the <b>exact same direction</b> you started in — it doesn’t matter one bit whether you count it out clockwise or anticlockwise, the answer is identical. Facing South-West and told to make a whole turn? You’re still facing South-West.</p>
<p>Watch out for the trick question: a whole turn is <b>four</b> quarter turns put together (2 + 2 + 2 + 2 = 8 points), not just one giant single step — but the destination is always the direction you began in.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'turnscompass-try-3', topicId: 'turns-compass', tier: 3, format: 'mcq5',
        stem: 'Wanda is facing <b>South-West</b>. She makes a <b>whole turn</b> anticlockwise. Which direction is she facing now?',
        options: [
          { text: 'South-West', misconception: null },
          { text: 'North-East', misconception: 'opposite' },
          { text: 'South', misconception: 'wrong-size-smaller' },
          { text: 'West', misconception: 'wrong-size-smaller' },
          { text: 'North-West', misconception: 'plausible-other-point' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A whole turn is all 8 points of the compass — right the way round.',
          'That always brings you back to face exactly where you started, whichever way you turn.',
        ],
        explain: {
          rule: "N-E-S-W clockwise ('Naughty Elephants Squirt Water'). A quarter turn = one letter along.",
          worked: 'A whole turn (360°, 8 points) always ends facing the SAME direction you started in — South-West — whichever way you turn.',
          whyWrong: {
            'North-East': 'That’s the point directly OPPOSITE — a whole turn goes all the way round, not just halfway.',
            South: 'That’s only ONE point along — a whole turn is 8 points, the entire circle.',
            West: 'That’s only ONE point back — a whole turn is 8 points, the entire circle.',
            'North-West': 'Walk the full 8 points round from South-West — that’s not where a whole turn lands.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'N-E-S-W clockwise: "Naughty Elephants Squirt Water". A quarter turn is always one letter along.',
    'Quarter turn = 90° = 2 compass points. Half turn = 180° = 4 points. Three-quarter turn = 270° = 6 points.',
    'Anticlockwise means going BACKWARDS through the letters — the opposite way round the circle from clockwise.',
    'On the 8-point compass, clockwise runs N → NE → E → SE → S → SW → W → NW → back to N. Anticlockwise runs the exact same list backwards.',
    'Quarter, half, three-quarter and whole are just fractions of ONE full turn (360°) — a whole turn is all four quarters put together, right the way round.',
    'A three-quarter turn moves you THREE quarter-steps (6 points) — don’t mistake it for just one big single step.',
    'A full turn (360°, 8 points) always brings you back to face exactly the direction you started in.',
  ],
};
