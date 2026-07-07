// FART QUEST topic: Special Number Springs (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'special-numbers',
  name: 'Special Number Springs',
  region: 'number-swamp',
  genId: 'specialnumbers',
  tagline: 'Where every number gets probed for hidden factors — some pass, some are imposters.',

  creature: {
    id: 'prime-slime',
    name: 'Prime Slime',
    rarity: 'rare',
    image: 'assets/monsters/prime-slime.png',
    bio: 'Prime Slime is the loneliest blob in the springs — he only accepts visits from 1 and himself, and oozes away from everyone else. He once turned 27 away at the door, muttering “three threes, NINE times over — get lost” under his breath.',
    factSneak: 'A prime number has exactly two factors: 1 and itself — and 2 is the only even one.',
  },

  weapon: {
    id: 'prime-probe',
    name: 'The Prime Probe',
    tagline: 'Test any number for hidden factors in seconds — never fall for an imposter again.',
    rule: 'A prime has exactly TWO factors: 1 and itself. 1 is not prime. 2 is the only even one.',
    example: 'Probe 13: factors are only 1 and 13 — exactly two. <b>13 is prime.</b> Probe 27: factors are 1, 3, 9, 27 — four factors. <b>27 is NOT prime</b>, even though it looks it.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-specialnumbers',
      text: 'Ooooh, my favourite springs, brave nose-soldier! Down here live the numbers with a bit of PERSONALITY. Some are stackable, some are squared-up, and one — just one — is the loneliest number in the whole kingdom. Let’s go and meet them.',
    },
    {
      type: 'show',
      title: 'Factors and Multiples: The Family Business',
      html: `<p>Prime Slime’s favourite number is <b>12</b> — because 12 has LOADS of family. Every pair of numbers that multiplies together to make 12 is a <b>factor pair</b>.</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">1 × 12</div><div class="pv-cell">12</div></div>
  <div class="pv-col"><div class="pv-head">2 × 6</div><div class="pv-cell">12</div></div>
  <div class="pv-col"><div class="pv-head">3 × 4</div><div class="pv-cell">12</div></div>
</div>
<p>So the <b>factors</b> of 12 are 1, 2, 3, 4, 6 and 12 — every number that divides in EXACTLY, with nothing left over.</p>
<p><b>Multiples</b> go the other way — they come FROM the times table by multiplying 12 UP: 12, 24, 36, 48…</p>
<div class="law-scroll">📜 Don’t swap the words! <b>Factors</b> divide INTO a number. <b>Multiples</b> come FROM multiplying it UP. Papers love to ask “which of these is <b>NOT</b> a factor/multiple” — read the question twice before you answer!</div>`,
    },
    {
      type: 'talk',
      text: 'Now, most numbers have a big rowdy family of factors like that. But somewhere down in these springs lives a creature who refuses almost all company: <b>Prime Slime</b>. He will only work with two numbers — himself, and 1. Numbers like him are called <b>prime</b>.',
    },
    {
      type: 'try',
      q: {
        id: 'sn-try-1', topicId: 'special-numbers', tier: 1, format: 'mcq5',
        stem: 'Which of these numbers is <b>prime</b>?',
        options: [
          { text: '17', misconception: null },
          { text: '9', misconception: 'looks-prime' },
          { text: '21', misconception: 'looks-prime' },
          { text: '1', misconception: 'one-is-prime' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A prime number has EXACTLY two factors: 1 and itself. Try dividing each option by small numbers like 2, 3 and 5.',
          '17 can’t be divided evenly by anything except 1 and 17. The others all hide an extra factor somewhere — which one is truly stuck with just two?',
        ],
        explain: {
          rule: 'A prime has exactly TWO factors: 1 and itself. 1 is not prime. 2 is the only even one.',
          worked: '17’s only factors are 1 and 17 — exactly two — so it is prime. 9 = 3×3, 21 = 3×7, and 1 only has one factor.',
          whyWrong: {
            '9': '9 = 3 × 3 — that’s three factors (1, 3, 9), not two, so it isn’t prime.',
            '21': '21 = 3 × 7 — it has four factors (1, 3, 7, 21), not two, so it isn’t prime. A sneaky odd imposter!',
            '1': '1 only has ONE factor (itself) — a prime needs exactly two, so 1 is never prime.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Law of Two',
      html: `<p>Here’s the exact rule, carved into the rocks around the springs: a <b>prime number has EXACTLY two factors — 1 and itself.</b> No more, no fewer.</p>
<div class="law-scroll">📜 <b>THE LAW OF TWO:</b> A prime has exactly TWO factors: 1 and itself. 1 is not prime. 2 is the only even one.</div>
<p>Watch these two ancient traps. <b>1</b> only has ONE factor (itself) — so it is <b>NEVER</b> prime, no matter how lonely it looks. And <b>2</b> is the ONLY even prime there will ever be — every other even number secretly has 2 hiding inside it as an extra factor, so it can never be prime again.</p>
<p>Some numbers are sneaky imposters: <b>9</b> (3×3), <b>21</b> (3×7) and <b>27</b> (3×9) all LOOK prime because they’re odd — but test-divide them first. They all have secret extra factors.</p>`,
    },
    {
      type: 'show',
      title: 'Squares: Numbers on Steroids',
      html: `<p>A <b>square number</b> is what you get when a number multiplies by ITSELF. Mathematicians write this with a tiny floating 2, like <b>5²</b>. That little 2 is called an <b>index</b> (plural: indices), and it means “multiply by itself this many times.”</p>
<div class="law-scroll">📜 <b>5² means 5 × 5 = 25.</b> It does NOT mean 5 × 2! This is the single most common slip in the whole kingdom — watch for it.</div>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">3²</div><div class="pv-cell">9</div></div>
  <div class="pv-col"><div class="pv-head">6²</div><div class="pv-cell">36</div></div>
  <div class="pv-col"><div class="pv-head">9²</div><div class="pv-cell">81</div></div>
  <div class="pv-col"><div class="pv-head">12²</div><div class="pv-cell">144</div></div>
</div>
<p>Square numbers march all the way up to <b>12² = 144</b> in your times tables: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'sn-try-2', topicId: 'special-numbers', tier: 1, format: 'mcq5',
        stem: 'What is <b>6²</b>?',
        options: [
          { text: '36', misconception: null },
          { text: '12', misconception: 'times2' },
          { text: '18', misconception: 'times3' },
          { text: '30', misconception: 'wrong-neighbour' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The small 2 means “multiply by itself”: 6² = 6 × 6.',
          '6 × 6 = …?',
        ],
        explain: {
          rule: 'Indices notation: the small number tells you how many times to multiply by ITSELF. 3² means 3 × 3, NOT 3 × 2.',
          worked: '6² = 6 × 6 = 36.',
          whyWrong: {
            '12': 'That’s 6 × 2 — but the small 2 in 6² means multiply 6 by ITSELF, not by 2. Classic indices trap!',
            '18': 'That’s 6 × 3 — the index tells you to multiply by ITSELF, not by any other number.',
            '30': 'That’s 5 × 6, a neighbouring number’s answer — check you squared the right number.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Cubes and Stacking Triangles',
      html: `<p>A <b>cube number</b> multiplies a number by itself THREE times: <b>4³ = 4 × 4 × 4 = 64</b>. You only need to know the cubes of <b>2, 3, 4, 5</b> and <b>10</b>:</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">2³</div><div class="pv-cell">8</div></div>
  <div class="pv-col"><div class="pv-head">3³</div><div class="pv-cell">27</div></div>
  <div class="pv-col"><div class="pv-head">4³</div><div class="pv-cell">64</div></div>
  <div class="pv-col"><div class="pv-head">5³</div><div class="pv-cell">125</div></div>
  <div class="pv-col"><div class="pv-head">10³</div><div class="pv-cell">1,000</div></div>
</div>
<p>Now stack some slime in a triangle. Row 1 has 1 blob, row 2 has 2 more, row 3 has 3 more… Count ALL the blobs so far and you get the <b>triangular numbers</b>.</p>
<div class="estimate-demo">
  <div class="est-line">Row 1: 🟢 <span class="est-note">total 1</span></div>
  <div class="est-line">Row 2: 🟢 🟢 <span class="est-note">total 1+2 = 3</span></div>
  <div class="est-line">Row 3: 🟢 🟢 🟢 <span class="est-note">total 3+3 = 6</span></div>
  <div class="est-line">Row 4: 🟢 🟢 🟢 🟢 <span class="est-note">total 6+4 = 10</span></div>
</div>
<p>See the pattern? Each new row adds ONE more blob than the last, so the jump between triangular numbers grows every time: +2, +3, +4, +5…</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'sn-try-3', topicId: 'special-numbers', tier: 2, format: 'mcq5',
        stem: 'Which of these numbers is <b>NOT</b> a factor of 20?',
        options: [
          { text: '8', misconception: null },
          { text: '4', misconception: 'is-actually-factor' },
          { text: '5', misconception: 'is-actually-factor' },
          { text: '10', misconception: 'is-actually-factor' },
          { text: '20', misconception: 'is-actually-factor' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A factor divides INTO 20 exactly, with nothing left over. Try dividing 20 by each option.',
          '20 ÷ 4 = 5, 20 ÷ 5 = 4, 20 ÷ 10 = 2, 20 ÷ 20 = 1 — all whole numbers. Which option leaves a remainder?',
        ],
        explain: {
          rule: 'Factors divide INTO a number exactly, with nothing left over. Multiples come FROM the times table.',
          worked: '20 ÷ 8 = 2.5 — not a whole number, so 8 is NOT a factor of 20. Every other option divides in exactly.',
          whyWrong: {
            '4': '20 ÷ 4 = 5 exactly — that IS a factor, not the odd one out.',
            '5': '20 ÷ 5 = 4 exactly — that IS a factor, not the odd one out.',
            '10': '20 ÷ 10 = 2 exactly — that IS a factor, not the odd one out.',
            '20': 'Every number is a factor of itself — 20 ÷ 20 = 1 exactly.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    '1 is NEVER prime — it only has one factor (itself), not the two a prime needs.',
    '2 is the only EVEN prime. Every other even number has 2 hiding inside it as an extra factor.',
    'Indices trap: 6² means 6 × 6 = 36, NOT 6 × 2. Read the tiny number as “times itself”.',
    'Odd doesn’t mean prime! 9, 15, 21, 25 and 27 all LOOK prime but have hidden factors — always test-divide before you decide.',
    'Factors divide INTO a number; multiples come FROM multiplying it up. Don’t swap the words — papers love a NOT-question to catch you out.',
    'Learn the cubes of 2, 3, 4, 5 and 10 by heart: 8, 27, 64, 125, 1,000.',
    'Triangular numbers stack up one more each time — the gap between terms grows by one every time (+2, +3, +4…).',
  ],
};
