// FART QUEST topic: Freezer Geezer's Fridge — temperature (Measure Marsh)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'temperature',
  name: "Freezer Geezer's Fridge",
  region: 'measure-marsh',
  genId: 'temperature',
  tagline: 'Where the numbers go below zero and complain about the heat.',

  creature: {
    id: 'freezer-geezer',
    name: 'Freezer Geezer',
    rarity: 'rare',
    image: 'assets/monsters/freezer-geezer.png',
    bio: 'Lives happily at a spine-chilling −8°C and insists it is "roasting in here". Whiffbeard suspects his internal thermostat is broken in the most spectacular way possible.',
    factSneak: 'To find how far apart two temperatures are, bridge through zero: count up to zero, then keep counting — and never count zero twice.',
  },

  weapon: {
    id: 'zero-bridge',
    name: 'The Zero Bridge',
    tagline: 'Cross from icy negatives to cosy positives without losing count.',
    rule: 'Crossing zero? Count to zero first, then keep going. Two small jumps beat one big slip.',
    example: 'Difference between −3°C and 8°C: bridge to zero (3 steps), then on to 8 (8 steps). 3 + 8 = <b>11°C</b> apart.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-temperature',
      text: 'Gather round, brave nose-soldier, and meet the chilliest creature in the whole swamp — Freezer Geezer! He lives WAY below freezing and STILL complains it is roasting. To understand him, you need to understand the strangest numbers in maths: numbers that go <b>below zero</b>.',
    },
    {
      type: 'show',
      title: 'Below zero: the upside-down numbers',
      html: `<p>Every thermometer has a magic line: <b>0°C</b>. That is the freezing point of water. Above the line, temperatures are <b>positive</b>. Below the line, they flip into <b>negative</b> numbers — the coldest kind of cold.</p>
<div class="numline" data-min="-10" data-max="10" data-marker="-4">
  <div class="camp camp-a">−10°C</div>
  <div class="numline-track">
    <span class="tick"></span><span class="tick"></span>
    <span class="numline-marker" style="--pos:30%">−4°C</span>
    <span class="tick"></span><span class="tick"></span><span class="tick"></span>
  </div>
  <div class="camp camp-b">10°C</div>
</div>
<p>Freezer Geezer's fridge sits at <b>−4°C</b> on that line — four whole steps colder than freezing. The further LEFT a number sits (further below zero), the colder it really is. Watch out: <b>−8°C is colder than −2°C</b>, even though 8 looks like the "bigger" digit — it is further from zero, in the cold direction, so it wins the ice contest.</p>`,
    },
    {
      type: 'talk',
      text: 'Comparing two temperatures is easy once you know which way is colder. But finding the GAP between two temperatures — especially when one is stuck below zero — that takes a special trick. Behold, the Zero Bridge!',
    },
    {
      type: 'try',
      q: {
        id: 'temp-try-1', topicId: 'temperature', tier: 1, format: 'mcq5',
        stem: 'Which temperature is warmer: <b>−8°C</b> or <b>−2°C</b>?',
        options: [
          { text: '−2°C', misconception: null },
          { text: '−8°C', misconception: 'bigger-digit-trap' },
          { text: 'They are the same', misconception: 'same-trap' },
          { text: "Neither — you can't compare negative temperatures", misconception: 'cant-compare' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Picture both points on the Zero Bridge number line: which one sits CLOSER to zero, the freezing point?',
          '−2°C is only 2 steps below zero. −8°C is 8 steps below zero. The one closer to zero is the warmer one.',
        ],
        explain: {
          rule: 'Crossing zero? Count to zero first, then keep going. Two small jumps beat one big slip.',
          worked: 'On the number line, −2°C sits only 2 steps below zero, while −8°C sits 8 steps below zero. The temperature CLOSER to zero is the warmer one: −2°C.',
          whyWrong: {
            '−8°C': 'Tempting, because 8 is a bigger DIGIT than 2 — but with negative numbers, a bigger digit means FURTHER below zero, which is COLDER, not warmer.',
            'They are the same': '−8°C and −2°C are 6 degrees apart — definitely not the same temperature.',
            "Neither — you can't compare negative temperatures": 'Negative temperatures compare just like any others — remember, closer to zero is warmer.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Zero Bridge',
      html: `<p>Want to know how many degrees apart two temperatures are? Build a bridge through zero.</p>
<div class="law-scroll">🌉 <b>THE ZERO BRIDGE:</b> Count UP to zero first. Then keep counting from zero to the other temperature. Add the two small jumps together.</div>
<div class="estimate-demo">
  <div class="est-line">−3°C <span class="est-note">→ 3 steps to reach 0°C</span></div>
  <div class="est-line">0°C <span class="est-note">→ 8 steps to reach 8°C</span></div>
  <div class="est-line"><b>3 + 8 = 11°C apart</b> <span class="est-note">two small jumps beat one big slip!</span></div>
</div>
<p>Zero is the bridge's only middle post — <b>count it once, never twice</b>. Try to leap straight from −3 to 8 in one giant jump and it is horribly easy to miscount. Two small jumps are always safer.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'temp-try-2', topicId: 'temperature', tier: 2, format: 'mcq5',
        stem: 'What is the difference between <b>−3°C</b> and <b>8°C</b>?',
        options: [
          { text: '11°C', misconception: null },
          { text: '12°C', misconception: 'zero-double-count' },
          { text: '5°C', misconception: 'ignored-sign' },
          { text: '3°C', misconception: 'confused-with-start' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Use the Zero Bridge: first find how far −3°C is from zero, then how far 8°C is from zero.',
          '−3°C is 3 steps below zero. 8°C is 8 steps above zero. Add the two small jumps together.',
        ],
        explain: {
          rule: 'Crossing zero? Count to zero first, then keep going. Two small jumps beat one big slip.',
          worked: '−3°C to 0°C is 3 steps. 0°C to 8°C is 8 steps. 3 + 8 = 11°C apart.',
          whyWrong: {
            '12°C': "Zero is ONE point, not two — don't count it twice when you bridge across it. 3 steps to zero, then 8 more, makes 11, not 12.",
            '5°C': 'That treats −3°C as if it were +3°C and just does 8 − 3. Distance FROM zero still counts, even below zero.',
            '3°C': "That's just one of the starting temperatures — not the total distance apart.",
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Rise or fall? Read the words carefully',
      html: `<p>Exam questions love these words. Learn them once, forever:</p>
<div class="estimate-demo">
  <div class="est-line"><b>rose by / warmer by / increased by</b> <span class="est-note">→ ADD</span></div>
  <div class="est-line"><b>fell by / colder by / dropped by</b> <span class="est-note">→ SUBTRACT</span></div>
</div>
<p>Careful — subtracting can march you straight through the Zero Bridge into negative numbers! If the temperature is <b>4°C</b> and it <b>falls by 9°C</b>, don't just do 9 − 4 = 5 and stop there. The fall doesn't stop at zero — it keeps going. Bridge it: 4°C down to 0°C is 4 steps, leaving 9 − 4 = 5 more steps BELOW zero. Final answer: <b>−5°C</b>.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'temp-try-3', topicId: 'temperature', tier: 3, format: 'mcq5',
        stem: 'The temperature was <b>4°C</b>. Overnight it fell by <b>9°C</b>. What is the new temperature?',
        options: [
          { text: '−5°C', misconception: null },
          { text: '5°C', misconception: 'dropped-sign' },
          { text: '13°C', misconception: 'added-instead' },
          { text: '4°C', misconception: 'no-change' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Use the Zero Bridge: first bridge from 4°C DOWN to 0°C — how many steps is that?',
          "That's 4 steps to zero. The total fall is 9°C, so 9 − 4 = 5 more steps continue BELOW zero — into negative numbers.",
        ],
        explain: {
          rule: 'Crossing zero? Count to zero first, then keep going. Two small jumps beat one big slip.',
          worked: '4°C down to 0°C is 4 steps. The total fall is 9°C, so 9 − 4 = 5 steps continue BELOW zero. That lands on −5°C.',
          whyWrong: {
            '5°C': "That's the right SIZE for the extra fall below zero, but it forgets to cross into negative numbers — the temperature keeps falling past zero, it doesn't stop there.",
            '13°C': 'That adds the numbers together instead of subtracting a fall. "Fell by" means the temperature goes DOWN, not up.',
            '4°C': "That's just the starting temperature — the 9°C fall has to change it!",
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Colder = further BELOW zero. Warmer = closer to zero (or above it).',
    'Crossing zero for a difference? Bridge it: count UP to zero, then keep counting from zero to the other number. Add the two small jumps together.',
    'Zero is ONE point on the bridge, not two — never count it twice.',
    'A bigger DIGIT does not mean a bigger temperature once you cross into negatives: −8°C is COLDER than −2°C, not warmer.',
    '"Rose by" / "warmer by" means ADD. "Fell by" / "colder by" means SUBTRACT — and subtracting can push you straight past zero into negative numbers.',
    'Reading any scale? Check the sign first — is the mark above or below the 0 line?',
    'Check a tricky answer with two small jumps instead of one big risky one — that is the whole idea of the Zero Bridge.',
  ],
};
