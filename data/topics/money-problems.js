// FART QUEST topic: The Bargain Basement — money problems (Money Mines)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'money-problems',
  name: 'The Bargain Basement',
  region: 'money-mines',
  genId: 'moneyproblems',
  tagline: 'Where every price has a point, and Skinty checks every single one.',

  creature: {
    id: 'skinty-mcgrabhands',
    name: 'Skinty McGrabhands',
    rarity: 'rare',
    image: 'assets/monsters/skinty-mcgrabhands.png',
    bio: 'Runs the Bargain Basement and insists, hand on wallet, that he has never ONCE been knowingly overcharged. (He has also never once shopped anywhere but his own basement.)',
    factSneak: 'Money is just decimals wearing a £ sign — line up the point and add, subtract or multiply exactly like any decimal.',
  },

  weapon: {
    id: 'price-cruncher',
    name: 'The Price Cruncher',
    tagline: 'Crunch any price like the decimal it secretly is.',
    rule: 'Money is just decimals wearing a £. Line up the point and crunch.',
    example: '£2.35 + £1.45 → line up the points → crunch column by column → <b>£3.80</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-moneyproblems',
      text: 'Welcome, welcome, esteemed customer-hero, to the finest — and only — shop in the entire swamp! I am Skinty McGrabhands, and every single price on my shelves is <b>completely fair</b>. Today you learn to read MY prices, add them up, and never, ever get short-changed. Ka-ching!',
    },
    {
      type: 'show',
      title: 'Money is a decimal wearing a disguise',
      html: `<p>Every price is really just a decimal number with a little <b>£</b> hat on top. <b>£3.40</b> means 3 whole pounds, plus 4 tenths of a pound (40p), plus 0 hundredths (0p).</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">£</div><div class="pv-cell">3</div></div>
  <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
  <div class="pv-col"><div class="pv-head">10p</div><div class="pv-cell">4</div></div>
  <div class="pv-col"><div class="pv-head">1p</div><div class="pv-cell">0</div></div>
</div>
<p>Now here is Skinty's FAVOURITE trick. Type <b>3.40</b> into a calculator and press =. The screen shows... <b>3.4</b>. The calculator just ATE your zero! It isn't lying — 3.4 and 3.40 are exactly the same SIZE of number — but money is always written with two places after the point. Write <b>£3.4</b> as your final answer and Skinty pockets a mark he shouldn't. Always write <b>£3.40</b>.</p>
<div style="margin:16px 0; text-align:center;">
  <div style="display:inline-block; background:#1b2b1f; color:#7CFC98; font-family:'Courier New', monospace; font-size:34px; letter-spacing:2px; padding:14px 28px; border-radius:8px; box-shadow: inset 0 0 0 3px #0d1710, 0 4px 0 rgba(0,0,0,.3);">3.4</div>
  <div style="font-size:13px; color:#8c7a63; margin-top:6px; font-style:italic;">a calculator's screen after £3.40 — read it as £3.40, never £3.4!</div>
</div>`,
    },
    {
      type: 'talk',
      text: 'So how do you ADD prices together? Exactly like adding any decimal, my stinky friend! Stack the prices in a column, line up the points like soldiers on parade, and crunch each column — pence with pence, pounds with pounds. The point never moves, and it never lets another digit sneak past it.',
    },
    {
      type: 'try',
      q: {
        id: 'money-try-1', topicId: 'money-problems', tier: 1, format: 'mcq5',
        stem: 'The Bargain Basement: a joke book costs <b>£2.35</b> and a whoopee cushion costs <b>£1.45</b>. What is the total price?',
        options: [
          { text: '£3.80', misconception: null },
          { text: '£3.70', misconception: 'dropped-carry' },
          { text: '£4.80', misconception: 'over-carried' },
          { text: '£0.90', misconception: 'wrong-operation' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Line up the points in a column: pounds under pounds, pence under pence. Crunch the hundredths (pence) column first.',
          '5 + 5 = 10 pence — that\'s a whole 10p, so carry a 1 into the tenths column before you add 3 + 4.',
        ],
        explain: {
          rule: 'Money is just decimals wearing a £. Line up the point and crunch.',
          worked: '£2.35 + £1.45: hundredths 5+5=10 → write 0, carry 1. Tenths 3+4=7, plus the carried 1 = 8. Pounds 2+1=3. Total = £3.80.',
          whyWrong: {
            '£3.70': 'The hundredths column (5+5) makes 10 pence — that carries a 1 into the tenths column. Miss that carry and you lose a whole 10p.',
            '£4.80': 'The carry from the pence only travels ONE column, into the tenths — it doesn\'t reach the pounds column too.',
            '£0.90': 'That\'s the DIFFERENCE between the prices, not the total — the question asks what they cost together, so add, don\'t subtract.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Buying more than one — find ONE first',
      html: `<p>Buying several of the SAME thing? That's multiplying, not adding over and over. If one ticket costs <b>£3.50</b>, four tickets cost <b>£3.50 × 4</b>. Crunch it in pence to keep it tidy: 350p × 4 = 1400p = <b>£14.00</b>.</p>
<div class="law-scroll">📜 <b>SKINTY'S GOLDEN RULE:</b> if you're told the price of a BUNDLE and asked about a DIFFERENT amount, find the price of <b>ONE</b> first — then multiply for however many you actually need.</div>
<p>Here's the trap the exam LOVES: "3 pens cost £2.40. How much for 5 pens?" It is tempting to just multiply £2.40 × 5 — but £2.40 is the price of THREE pens, not one! Find one pen's price first: £2.40 ÷ 3 = <b>80p each</b>. THEN multiply: 80p × 5 = <b>£4.00</b>. Skip the unit-price step and Skinty will happily take your extra pennies.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'money-try-2', topicId: 'money-problems', tier: 2, format: 'mcq5',
        stem: 'Tickets to the Bargain Basement carnival cost <b>£3.50</b> each. How much for 4 tickets?',
        options: [
          { text: '£14.00', misconception: null },
          { text: '£10.50', misconception: 'off-by-one' },
          { text: '£1.40', misconception: 'magnitude' },
          { text: '£7.00', misconception: 'undercounted' },
          { text: '£17.50', misconception: 'off-by-one' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Four tickets means the SAME price, four times over — that\'s multiplication, not addition.',
          '£3.50 × 4: crunch it in pence — 350p × 4 = 1400p. What is that in pounds?',
        ],
        explain: {
          rule: 'Money is just decimals wearing a £. Line up the point and crunch.',
          worked: '£3.50 × 4 = £14.00 (350p × 4 = 1400p = £14.00).',
          whyWrong: {
            '£10.50': 'That\'s only 3 tickets\' worth (£3.50 × 3) — check you multiplied by all FOUR tickets.',
            '£1.40': 'The point slid the wrong way there — multiplying by 4 makes the price much BIGGER, not tiny.',
            '£7.00': 'That\'s only 2 tickets\' worth — there are 4 tickets to pay for, not 2.',
            '£17.50': 'That\'s 5 tickets\' worth (£3.50 × 5) — there are only 4 tickets to pay for, not 5.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Best value, and estimating like Catapult Hill',
      html: `<p>"Best value" just means: which price is better <b>for the SAME amount</b>? You can't compare totals alone — a bigger pack usually costs more! Compare the price of ONE (the unit price) instead.</p>
<p>Shop A sells 3 pens for £2.40 → 80p each. Shop B sells 5 pens for £4.50 → 90p each. Shop A is <b>better value</b> — cheaper per pen — even though its total price is smaller too.</p>
<p>And when a question says <b>"estimate"</b>, do exactly what Sir Roundbottom taught you: round each price to the nearest whole pound FIRST, then add the easy numbers.</p>
<div class="estimate-demo">
  <div class="est-line">£3.95 + £8.10 = 😱 <span class="est-note">fiddly pence</span></div>
  <div class="est-line">↓ round each price to the nearest £ ↓</div>
  <div class="est-line"><b>£4 + £8 = £12</b> 😎 <span class="est-note">two seconds!</span></div>
</div>
<p>The exact answer (£12.05) is hiding in the options to tempt you — but "estimate" always wants the ROUNDED version.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'money-try-3', topicId: 'money-problems', tier: 3, format: 'mcq5',
        stem: 'Jarlath takes <b>£10.00</b> to the Bargain Basement. He buys a keyring for <b>£3.65</b> and a joke moustache for <b>£2.20</b>. How much money does he have left?',
        options: [
          { text: '£4.15', misconception: null },
          { text: '£5.85', misconception: 'forgot-remaining' },
          { text: '£6.35', misconception: 'missed-item' },
          { text: '£3.15', misconception: 'borrow-slip' },
          { text: '£7.80', misconception: 'missed-item' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Two steps here. First, add up everything he SPENT: £3.65 + £2.20.',
          'Then subtract that total from the £10.00 he started with. £10.00 − £5.85 = ?',
        ],
        explain: {
          rule: 'Money is just decimals wearing a £. Line up the point and crunch.',
          worked: 'Spent: £3.65 + £2.20 = £5.85. Left: £10.00 − £5.85 = £4.15.',
          whyWrong: {
            '£5.85': 'That\'s how much he SPENT — the question asks how much is LEFT, so there\'s one more step: subtract it from £10.',
            '£6.35': 'That only subtracts the keyring (£3.65) — the moustache (£2.20) needs subtracting too.',
            '£3.15': 'Check the borrowing carefully — £10.00 − £5.85 borrows across the pounds column. Try it one column at a time.',
            '£7.80': 'That only subtracts the moustache (£2.20) — the keyring (£3.65) needs subtracting too.',
          },
        },
      },
    },
    { type: 'anim', anim: 'money-problems' },
    { type: 'weapon' },
  ],

  tips: [
    'Money is a decimal wearing a £ sign — always keep exactly two digits after the point.',
    'A calculator shows £3.40 as "3.4" — read it as £3.40 and write it that way, never "£3.4".',
    'Adding or subtracting money? Line up the points in a column, exactly like decimals — pence with pence, pounds with pounds.',
    'Buying MORE or FEWER of something than you were told the price for? Find the price of ONE first, then multiply — never just multiply the total you were given.',
    'Best value compares the price of ONE item (or the same amount) — never compare two totals alone.',
    'Estimating with money: round each price to the nearest whole pound first, THEN add the easy numbers.',
    'Two-step "how much is left" problems: work out the total SPENT first, then subtract that from the starting amount — the total spent is a trap answer on its own.',
  ],
};
