// FART QUEST topic: Place Value Palace (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'place-value',
  name: 'Place Value Palace',
  region: 'number-swamp',
  genId: 'placevalue',
  tagline: 'Where every digit sits on a throne… and some thrones are ENORMOUS.',

  creature: {
    id: 'baron-bumdigit',
    name: 'Baron Bumdigit',
    rarity: 'rare',
    image: 'assets/monsters/baron-bumdigit.png',
    bio: 'The Baron believes he is worth millions, purely because of where he sits. Infuriatingly, that is exactly how place value works. Smells of old cabbage and superiority.',
    factSneak: 'A digit’s VALUE depends on its PLACE. The 4 in 4,000 is worth a thousand times more than the 4 in 4.',
  },

  weapon: {
    id: 'throne-room-map',
    name: 'The Throne Room Map',
    tagline: 'Never wonder what a digit is worth again.',
    rule: 'Read the digit, then ask: WHICH THRONE is it sitting on? Digit × throne = its value.',
    example: 'The 7 in 3,<b>7</b>42 sits on the Hundreds throne. 7 × 100 = <b>700</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-pv',
      text: 'Right then, listen up, my brave little nose-soldier! Here is a secret most grown-ups never notice: <b>a digit is not always worth what it says</b>. This 3 here — in the number 35 — is secretly worth THIRTY. It’s wearing a disguise!',
    },
    {
      type: 'show',
      title: 'Welcome to the Throne Room',
      html: `<p>Every number is a palace, and every digit sits on a <b>throne</b>. The throne decides what the digit is worth.</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">Thousands</div><div class="pv-cell">4</div><div class="pv-val">4,000</div></div>
  <div class="pv-col"><div class="pv-head">Hundreds</div><div class="pv-cell">4</div><div class="pv-val">400</div></div>
  <div class="pv-col"><div class="pv-head">Tens</div><div class="pv-cell">4</div><div class="pv-val">40</div></div>
  <div class="pv-col"><div class="pv-head">Units</div><div class="pv-cell">4</div><div class="pv-val">4</div></div>
</div>
<p>Look at <b>4,444</b>. The SAME digit, four times — but each 4 is worth something different, because each one sits on a different throne. The 4 on the left is worth <b>four thousand</b>. The 4 on the right is worth… just four. Poor lad.</p>`,
    },
    {
      type: 'talk',
      text: 'Reading a big number? Here’s my trick: <b>the comma whispers “thousand”</b>. So 6,290 reads as “six… <i>thousand</i>… two hundred and ninety.” Try whispering it. Go on. No one’s listening except me.',
    },
    {
      type: 'try',
      q: {
        id: 'pv-try-1', topicId: 'place-value', tier: 1, format: 'mcq5',
        stem: 'What is the <b>7</b> worth in 3,742?',
        options: [
          { text: '700', misconception: null },
          { text: '7', misconception: 'digit-only' },
          { text: '70', misconception: 'wrong-throne' },
          { text: '7,000', misconception: 'wrong-throne' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Find the 7, then look at WHICH THRONE it’s sitting on. Count the seats from the right: Units, Tens, Hundreds…',
          'The 7 is on the HUNDREDS throne. So it’s worth 7 × 100 = …?',
        ],
        explain: {
          rule: 'Read the digit, then ask: WHICH THRONE is it sitting on? Digit × throne = its value.',
          worked: 'In 3,742 the 7 sits on the Hundreds throne. 7 × 100 = 700.',
          whyWrong: {
            '7': 'That’s the digit in its disguise — but its throne makes it 100 times bigger!',
            '70': 'That would be the Tens throne — one seat too far right.',
            '7,000': 'That’s the Thousands throne — the 3 is sitting there.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Zero: the Royal Seat-Warmer',
      html: `<p>What about <b>4,062</b>? There’s a <b>0</b> on the Hundreds throne. Is it useless? NO! Zero has the most important bottom in the palace.</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">Th</div><div class="pv-cell">4</div></div>
  <div class="pv-col"><div class="pv-head">H</div><div class="pv-cell pv-zero">0</div></div>
  <div class="pv-col"><div class="pv-head">T</div><div class="pv-cell">6</div></div>
  <div class="pv-col"><div class="pv-head">U</div><div class="pv-cell">2</div></div>
</div>
<p>Zero <b>keeps the seat warm</b> so the other digits don’t slide into the wrong thrones. Take the zero away and 4,062 collapses into 462 — a completely different number! When you WRITE numbers from words, this is where the trap lives: “four thousand and sixty-two” has a secret zero in it.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'pv-try-2', topicId: 'place-value', tier: 1, format: 'mcq5',
        stem: 'Which number is <b>four thousand and sixty-two</b>?',
        options: [
          { text: '4,062', misconception: null },
          { text: '4,620', misconception: 'no-seatwarmer' },
          { text: '462', misconception: 'dropped-thousand' },
          { text: '4,602', misconception: 'zero-wrong-seat' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Four thousand → a 4 on the Thousands throne. Sixty-two → 6 on Tens, 2 on Units. Who sits on the Hundreds throne?',
          'Nobody said any hundreds — so the seat-warmer sits there: 4, then 0, then 62.',
        ],
        explain: {
          rule: 'When a throne isn’t mentioned, ZERO keeps its seat warm.',
          worked: 'Four thousand = 4 _ _ _. Sixty-two fills Tens and Units. Hundreds gets the seat-warmer: 4,062.',
          whyWrong: {
            '4,620': 'The 62 slid into the wrong seats because no one warmed the Hundreds throne.',
            '462': 'The thousand vanished! The 4 must sit on the Thousands throne.',
            '4,602': 'The zero sat in the Tens seat by mistake — “sixty” means 6 tens.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'A digit’s value = the digit × its throne. The 8 in 28,514 is worth 8,000.',
    'Zero is the royal seat-warmer — it keeps every other digit on the correct throne.',
    'Reading big numbers: the comma whispers “thousand”.',
    '“Which number is largest?” — compare thrones from the LEFT, one throne at a time.',
    'Writing numbers from words: listen for missing thrones — “four thousand and sixty-two” hides a zero on the Hundreds throne.',
  ],
};
