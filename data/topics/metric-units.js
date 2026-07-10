// FART QUEST topic: The Converting Pools — metric units (Measure Marsh)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'metric-units',
  name: 'The Converting Pools',
  region: 'measure-marsh',
  genId: 'metricunits',
  tagline: 'Where numbers climb the ladder between wellies of every size.',

  creature: {
    id: 'centi-peed',
    name: 'Centi-Peed',
    rarity: 'rare',
    image: 'assets/monsters/centi-peed.png',
    bio: 'A centipede with exactly 100 tiny wellies — because that is precisely how many centimetres make a single metre, and he insists on wearing all of them at once. Ask him to convert anything and he is already three rungs up the ladder before you have finished the question.',
    factSneak: 'kilo = ×1000, centi = ÷100, milli = ÷1000 — always measured to the base unit (metres, kilograms, litres).',
  },

  weapon: {
    id: 'kilo-centi-milli-ladder',
    name: 'The Kilo-Centi-Milli Ladder',
    tagline: 'Climb up or down between any metric units — never lose your footing.',
    rule: 'kilo = ×1000, centi = ÷100, milli = ÷1000. Slide the digits, never the point.',
    example: '4 kg down to the base → ×1000 → <b>4000 g</b>. 250 cm up to the base → ÷100 → <b>2.5 m</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-metricunits',
      text: 'Squelch, squelch, squelch! Behold, brave whiff-warrior — I am <b>Centi-Peed</b>, and I own exactly ONE HUNDRED wellies. Not ninety-nine. Not one hundred and one. Exactly one hundred, because that is how many centimetres it takes to make one metre, and I refuse to be caught out of size. Today you shall learn to climb my ladder between ANY units — big ones, small ones, wet ones. Onward!',
    },
    {
      type: 'show',
      title: 'Every measurement has a ladder',
      html: `<p>Length, mass and capacity each come from ONE everyday unit — the <b>base</b>. Everything else in the family is just that base, chopped up bigger or smaller, and arranged on a ladder.</p>
<div class="law-scroll">📏 <b>Length:</b> km — <b>m</b> — cm — mm</div>
<div class="law-scroll">⚖️ <b>Mass:</b> <b>kg</b> — g</div>
<div class="law-scroll">🧴 <b>Capacity:</b> <b>l</b> — ml</div>
<p>Three magic prefixes sit on that ladder, and each one tells you EXACTLY what to do to get back to the bold base unit:</p>
<div class="law-scroll">🪜 <b>KILO</b> = ×1000 to reach the base. (1 kg = 1000 g)</div>
<div class="law-scroll">🪜 <b>CENTI</b> = ÷100 to reach the base. (100 cm = 1 m)</div>
<div class="law-scroll">🪜 <b>MILLI</b> = ÷1000 to reach the base. (1000 mm = 1 m)</div>
<p>See the pattern? <b>Kilo</b> is a BIGGER unit than the base, so climbing DOWN to the base means MULTIPLY. <b>Centi</b> and <b>milli</b> are SMALLER units, so climbing UP to the base means DIVIDE. Going the other way instead? Just flip it — × becomes ÷, and ÷ becomes ×.</p>`,
    },
    {
      type: 'talk',
      text: 'Hold on a moment, hero — multiplying and dividing by 100 or 1000? You have SEEN this trick before! Pointy McPoopants taught you the Slide-o-Matic back in the Swamp: the decimal point never moves, the digits slide past it. Converting units is the EXACT same slide — you are just sliding between two different-sized wellies instead of two decimal places. Same magnificent machine. New job.',
    },
    {
      type: 'show',
      title: 'Slide it: metres into centimetres',
      html: `<p>Let’s slide <b>3.5 m</b> into centimetres. There are 100 cm in a metre, so that’s <b>× 100</b> — which is <b>2 slides LEFT</b>, exactly like Pointy taught you.</p>
<div class="slide-demo" data-from="3.5" data-to="350" data-dir="left" data-steps="2">
  <div class="pv-grid pv-before">
    <div class="pv-col"><div class="pv-head">U</div><div class="pv-cell">3</div></div>
    <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
    <div class="pv-col"><div class="pv-head">t</div><div class="pv-cell">5</div></div>
  </div>
  <div class="slide-arrow">× 100 — slide LEFT twice! 🌊</div>
  <div class="pv-grid pv-after">
    <div class="pv-col"><div class="pv-head">H</div><div class="pv-cell">3</div></div>
    <div class="pv-col"><div class="pv-head">T</div><div class="pv-cell">5</div></div>
    <div class="pv-col"><div class="pv-head">U</div><div class="pv-cell pv-zero">0</div></div>
    <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
  </div>
  <button class="slide-replay">▶ SLIDE IT AGAIN</button>
</div>
<p><b>3.5 m = 350 cm.</b> Same slide, new job. Pointy would be proud of you — and just a little bit jealous he never thought of wellies first.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mu-try-1', topicId: 'metric-units', tier: 1, format: 'mcq5',
        stem: 'Convert <b>2 kg</b> to g.',
        options: [
          { text: '2000', misconception: null },
          { text: '200', misconception: 'wrong-place' },
          { text: '2', misconception: 'no-convert' },
          { text: '0.002', misconception: 'wrong-direction' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Kilograms are the BIGGER unit — climbing DOWN the ladder to grams means MULTIPLY.',
          '2 × 1000 = ?',
        ],
        explain: {
          rule: 'kilo = ×1000, centi = ÷100, milli = ÷1000. Slide the digits, never the point.',
          worked: '2 kg × 1000 = 2000 g.',
          whyWrong: {
            '200': 'That is only ×100 — wrong rung! Kilo means ×1000, not ×100.',
            '2': 'That is just the original number — you have not climbed the ladder yet.',
            '0.002': 'That climbs the wrong way — kg to g means MULTIPLY, not divide.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'cm and mm: next-door neighbours',
      html: `<p>Now, a trap. Centimetres and millimetres LOOK like they should be a big ×100 jump apart — after all, “centi” means ÷100! But check the ladder again: <b>cm and mm are NEXT-DOOR rungs</b>, both sitting below the metre. The jump between next-door rungs is only <b>×10</b> (or ÷10 back).</p>
<div class="law-scroll">📏 1 cm = 10 mm. So 3 cm = <b>30</b> mm — NOT 300 mm!</div>
<p>Why only 10? Because 1 m = 100 cm AND 1 m = 1000 mm. Since 1000 ÷ 100 = 10, there are only 10 mm hiding inside every cm. Many a brave hero has lost a mark right here — do not be one of them!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mu-try-2', topicId: 'metric-units', tier: 2, format: 'mcq5',
        stem: '45 mm = ___ cm',
        options: [
          { text: '4.5', misconception: null },
          { text: '0.45', misconception: 'confused-with-centi' },
          { text: '450', misconception: 'wrong-direction' },
          { text: '45', misconception: 'no-convert' },
          { text: '35', misconception: 'padded-near-miss' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Millimetres and centimetres are NEXT-DOOR rungs — the jump is only ÷10, not ÷100.',
          '45 ÷ 10 = ?',
        ],
        explain: {
          rule: 'kilo = ×1000, centi = ÷100, milli = ÷1000. Slide the digits, never the point.',
          worked: '45 mm ÷ 10 = 4.5 cm. (Next-door rungs jump by 10, not 100.)',
          whyWrong: {
            '0.45': 'That divided by 100 — but cm and mm are only 10 apart, not 100.',
            '450': 'That climbs the wrong way — mm to cm means DIVIDE, not multiply.',
            '45': 'That is just the original number — you have not climbed the ladder yet.',
            '35': 'Check the division again — 45 ÷ 10, carefully.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'mu-try-3', topicId: 'metric-units', tier: 2, format: 'mcq5',
        stem: 'A sack holds <b>2.5 kg</b> of rice. How many <b>250 g</b> bags can be filled from it?',
        options: [
          { text: '10', misconception: null },
          { text: '1', misconception: 'wrong-place' },
          { text: '25', misconception: 'no-convert' },
          { text: '2500', misconception: 'wrong-direction' },
          { text: '9', misconception: 'padded-near-miss' },
        ],
        correctIndex: 0,
        hintSteps: [
          'First convert the sack to grams: 2.5 kg × 1000 = 2500 g.',
          'Then divide by the bag size: 2500 ÷ 250 = ?',
        ],
        explain: {
          rule: 'kilo = ×1000, centi = ÷100, milli = ÷1000. Slide the digits, never the point.',
          worked: '2.5 kg = 2500 g. 2500 ÷ 250 = 10 bags.',
          whyWrong: {
            '1': 'That used the wrong ladder jump — kg to g is ×1000, not ×100 (2.5 kg × 100 = 250 g, ÷ 250 = 1).',
            '25': 'That mixed up the decimal place when converting 250 g — check 2.5 kg = 2500 g first.',
            '2500': 'That is the TOTAL amount in grams, not how many bags it makes — you still need to divide by 250.',
            '9': 'Check the division again — 2500 ÷ 250, carefully.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'The ladder rule: kilo = ×1000, centi = ÷100, milli = ÷1000 — always measured to the BASE unit (metres, kilograms, litres).',
    'Climbing DOWN the ladder (bigger unit → smaller unit) means MULTIPLY. Climbing UP (smaller → bigger) means DIVIDE.',
    'Going the other way? Just flip the operation: × becomes ÷, and ÷ becomes ×.',
    'cm and mm are NEXT-DOOR rungs — that jump is only ×10 or ÷10, never ×100.',
    'For a "how many portions fit" problem, convert the container amount into the SAME small unit as the portion FIRST, then divide — dividing before converting gives a meaningless number.',
    'After converting, check the answer makes sense. A pencil that is suddenly "1500 m" long means a digit slid too far!',
  ],
};
