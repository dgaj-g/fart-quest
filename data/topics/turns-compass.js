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
      title: 'The Papers’ Favourite Trap: Working BACKWARDS',
      html: `<p>Here is where most heroes get caught out. Sometimes the question tells you where Wanda <b>ENDED UP</b>, and asks where she <b>STARTED</b>. The trap: you must undo the turn by going the <b>OPPOSITE way round</b>.</p>
<table style="border-collapse:collapse;width:100%;font-size:13px;margin:14px 0;">
<tr style="background:#eee;"><th style="border:1px solid #999;padding:6px;">She ended facing</th><th style="border:1px solid #999;padding:6px;">She turned</th><th style="border:1px solid #999;padding:6px;">To undo it, turn…</th><th style="border:1px solid #999;padding:6px;">So she STARTED facing</th></tr>
<tr><td style="border:1px solid #999;padding:6px;">East</td><td style="border:1px solid #999;padding:6px;">quarter turn CLOCKWISE</td><td style="border:1px solid #999;padding:6px;">quarter turn ANTI-clockwise</td><td style="border:1px solid #999;padding:6px;">North</td></tr>
</table>
<p>Never undo a turn by repeating the same direction — that just carries on turning the SAME way, spinning you even further from the true start! Always flip clockwise ↔ anticlockwise, keep the SAME size, and you’ll land exactly back on the start.</p>
<p><b>Multi-instruction chains</b> are the other papers’ favourite: two or three turns in a row. The trick is simple — do them <b>ONE AT A TIME</b>, in order. Work out the direction after the FIRST turn, then apply the SECOND turn to THAT new direction. Never skip a step, and never mix up which direction belongs to which turn.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'turnscompass-try-3', topicId: 'turns-compass', tier: 3, format: 'mcq5',
        stem: 'Wanda ends up facing <b>East</b> after making a <b>quarter turn</b> clockwise. Which direction was she facing at the START?',
        options: [
          { text: 'North', misconception: null },
          { text: 'South', misconception: 'forgot-invert' },
          { text: 'East', misconception: 'no-turn' },
          { text: 'West', misconception: 'wrong-size' },
          { text: 'North-East', misconception: 'plausible-other-point' },
        ],
        correctIndex: 0,
        hintSteps: [
          'To find the START, undo the turn: same size, but the OPPOSITE direction.',
          'Undo a quarter turn clockwise by turning a quarter turn ANTI-clockwise from East — one letter back.',
        ],
        explain: {
          rule: "N-E-S-W clockwise ('Naughty Elephants Squirt Water'). A quarter turn = one letter along.",
          worked: 'To reverse a quarter turn clockwise, turn a quarter turn ANTI-clockwise from East: one letter back is North.',
          whyWrong: {
            South: 'That turns FORWARDS again in the same clockwise direction — but to find the START you must go the OPPOSITE way to undo the turn.',
            East: 'That’s where she ENDED, not started — a real turn always begins somewhere different.',
            West: 'That undoes a HALF turn, not a quarter turn — check the size again.',
            'North-East': 'That’s not reachable by undoing a quarter turn from East at all — recount the points.',
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
    'Given the END direction and asked for the START? Undo the turn: same size, but the OPPOSITE direction round.',
    'Multi-instruction chains: do ONE turn at a time, in order — never combine them in your head in one go.',
    'A three-quarter turn moves you THREE quarter-steps (6 points) — don’t mistake it for just one big single step.',
    'A full turn (360°, 8 points) always brings you back to face exactly the direction you started in.',
  ],
};
