// FART QUEST topic: The Change Chute — change & coins (Money Mines)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'change-coins',
  name: 'The Change Chute',
  region: 'money-mines',
  genId: 'changecoins',
  tagline: 'Where every penny gets counted… one hop at a time.',

  creature: {
    id: 'the-changeling',
    name: 'The Changeling',
    rarity: 'rare',
    image: 'assets/monsters/the-changeling.png',
    bio: 'The Changeling pays for absolutely everything in 1p coins — Whiffbeard once watched it buy a single sausage roll with 87 separate pennies. It took four hours and the queue has never forgiven it.',
    factSneak: 'To find change, don’t subtract — COUNT UP from the price to the amount you paid.',
  },

  weapon: {
    id: 'change-counters-count-up',
    name: 'The Change-Counter’s Count-Up',
    tagline: 'Never fumble a subtraction again — just count your way there.',
    rule: 'Don’t subtract — COUNT UP from the price to what you paid.',
    example: 'Price 65p, paid £1 (100p): 65p → <b>70p</b> (+5p) → <b>£1.00</b> (+30p). Change = 5p + 30p = <b>35p</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-changecoins',
      text: 'Ahoy, brave nose-soldier! Down in the Change Chute lives a truly baffling creature — <b>The Changeling</b>. It pays for EVERYTHING in 1p coins. One sausage roll. Eighty-seven pennies. FOUR HOURS at the till. Today I shall teach you the shopkeeper’s secret trick so YOU never end up like it: working out change, fast, in your head.',
    },
    {
      type: 'show',
      title: 'Don’t subtract — COUNT UP!',
      html: `<p>Here’s the secret: when you work out change, never subtract in your head. Instead, <b>count UP</b> from the price to the amount you paid — in easy hops.</p>
<div class="estimate-demo">
  <div class="est-line">Price: <b>65p</b> — paid with a <b>£1 coin</b> (100p)</div>
  <div class="est-line">Hop 1: 65p → <b>70p</b> <span class="est-note">(+5p, up to the next 10p)</span></div>
  <div class="est-line">Hop 2: 70p → <b>£1.00</b> <span class="est-note">(+30p, up to the whole pound)</span></div>
  <div class="est-line"><b>Total change = 5p + 30p = 35p</b> 🪙</div>
</div>
<p>Two easy hops beat one horrible subtraction. That’s the whole trick.</p>`,
    },
    {
      type: 'talk',
      text: 'Why count up instead of subtracting? Because <b>100 − 65</b> in your head risks a nasty borrowing slip. But <b>65 → 70 → 100</b>? Two friendly little hops, no borrowing, no fuss. Shopkeepers have used this trick for hundreds of years. It’s yours now.',
    },
    {
      type: 'try',
      q: {
        id: 'cc-try-1', topicId: 'change-coins', tier: 1, format: 'mcq5',
        stem: 'You buy a comic for <b>40p</b> and pay with a <b>£1 coin</b>. How much change do you get?',
        options: [
          { text: '60p', misconception: null },
          { text: '40p', misconception: 'used-price-as-change' },
          { text: '70p', misconception: 'off-by-ten' },
          { text: '50p', misconception: 'off-by-ten' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count up from 40p to the next whole pound (£1 = 100p). How big is that one hop?',
          '40p → 100p is one single hop. How many pence is that hop?',
        ],
        explain: {
          rule: 'Don’t subtract — COUNT UP from the price to what you paid.',
          worked: '40p counts straight up to £1.00 (100p) in one hop of 60p. That’s the change: 60p.',
          whyWrong: {
            '40p': 'That’s the PRICE, not the change — count on from there to £1.00.',
            '70p': 'That hop is ten pence too big — recount from 40p to 100p.',
            '50p': 'That hop is ten pence too small — recount from 40p to 100p.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Fewest Coins — and a coin that does NOT exist',
      html: `<p>Every shopkeeper’s coin box has exactly these coins:</p>
<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:18px 0;">
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--swamp-deep,#1E3325);color:var(--gold,#F4C542);font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">1p</span>
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--swamp-deep,#1E3325);color:var(--gold,#F4C542);font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">2p</span>
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--swamp-deep,#1E3325);color:var(--gold,#F4C542);font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">5p</span>
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--swamp-deep,#1E3325);color:var(--gold,#F4C542);font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">10p</span>
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--swamp-deep,#1E3325);color:var(--gold,#F4C542);font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">20p</span>
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--swamp-deep,#1E3325);color:var(--gold,#F4C542);font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">50p</span>
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--gold-deep,#D9A21B);color:#fff;font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">£1</span>
  <span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:var(--gold-deep,#D9A21B);color:#fff;font-weight:700;font-family:'Fredoka',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.3);">£2</span>
</div>
<p>To use the <b>FEWEST coins</b>, always grab the <b>BIGGEST coin that still fits</b>, then the next biggest, and so on. Making <b>78p</b>: grab 50p (28p left), grab 20p (8p left), grab 5p (3p left), grab 2p (1p left), grab 1p (0p left). That’s <b>50p + 20p + 5p + 2p + 1p = 5 coins</b>.</p>
<div class="law-scroll">⚠️ <b>WATCH OUT:</b> there is <b>NO 25p coin</b> in the UK. The Changeling wishes there was — it would save its poor pennies — but there isn’t. Don’t invent one!</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'cc-try-2', topicId: 'change-coins', tier: 2, format: 'mcq5',
        stem: 'What is the FEWEST number of coins needed to make exactly <b>48p</b>?',
        options: [
          { text: '5', misconception: null },
          { text: '4', misconception: 'imagined-25p-coin' },
          { text: '6', misconception: 'extra-coin' },
          { text: '24', misconception: 'no-bigger-coins' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Grab the BIGGEST coin that still fits each time: 20p, 20p, then what’s left?',
          '20p + 20p = 40p, leaving 8p. Make 8p in the fewest coins too, then add up ALL the coins used.',
        ],
        explain: {
          rule: 'Don’t subtract — COUNT UP from the price to what you paid.',
          worked: '48p = 20p + 20p + 5p + 2p + 1p — that’s 5 coins, the fewest possible.',
          whyWrong: {
            '4': 'There’s no 25p coin in the UK — that count only works if you imagine one that doesn’t exist!',
            '6': 'That uses one more coin than necessary — check whether a bigger coin could replace two smaller ones.',
            '24': 'You don’t have to use only small coins — bigger coins make the SAME amount with far fewer coins.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Bigger money, same trick',
      html: `<p>The count-up trick works for BIG money too — even change from a £10 note.</p>
<div class="estimate-demo">
  <div class="est-line">Price: <b>£3.67</b> — paid with a <b>£10 note</b></div>
  <div class="est-line">Hop 1: £3.67 → <b>£3.70</b> <span class="est-note">(+3p, to the next 10p)</span></div>
  <div class="est-line">Hop 2: £3.70 → <b>£4.00</b> <span class="est-note">(+30p, to the next £)</span></div>
  <div class="est-line">Hop 3: £4.00 → <b>£10.00</b> <span class="est-note">(+£6.00, to the note)</span></div>
  <div class="est-line"><b>Total change = 3p + 30p + £6.00 = £6.33</b> 🪙</div>
</div>
<p>If you’d tried to SUBTRACT £3.67 from £10.00 in your head, it’s horribly easy to forget the borrow and land on £7.33 by mistake — a whole POUND wrong! Counting up in hops protects you from that slip completely.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'cc-try-3', topicId: 'change-coins', tier: 2, format: 'mcq5',
        stem: 'You buy a poster for <b>£4.85</b> and pay with a <b>£10 note</b>. How much change do you get?',
        options: [
          { text: '£5.15', misconception: null },
          { text: '£6.15', misconception: 'forgot-borrow' },
          { text: '£4.85', misconception: 'used-price-as-change' },
          { text: '£4.15', misconception: 'wrong-pound-direction' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count up from £4.85: first to the next 10p (£4.90), then to the next £ (£5.00), then all the way up to £10.00.',
          'Add the hops together: 5p + 10p + £5.00 = ?',
        ],
        explain: {
          rule: 'Don’t subtract — COUNT UP from the price to what you paid.',
          worked: '£4.85 → £4.90 (+5p) → £5.00 (+10p) → £10.00 (+£5.00). Total change = 5p + 10p + £5.00 = £5.15.',
          whyWrong: {
            '£6.15': 'That’s £1 too much — a classic subtracting slip. Counting up avoids it completely.',
            '£4.85': 'That’s the price you PAID, not the change.',
            '£4.15': 'That’s £1 too little — check your hops again.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Never subtract for change — COUNT UP from the price to the amount paid, hop by hop.',
    'First hop: up to the next 10p. Second hop: up to the next whole pound. Last hop (if needed): up to the note.',
    'There is NO 25p coin in the UK — 1p, 2p, 5p, 10p, 20p, 50p, £1, £2 is the full set.',
    'Fewest coins: always grab the BIGGEST coin that still fits, then the next biggest, and so on.',
    'Subtracting money in your head is where borrowing slips creep in — a whole POUND can vanish or appear by mistake. Counting up sidesteps the whole problem.',
    'Always check: price + change should add back up to exactly what was paid.',
    'Counting coins is not the same as counting VALUE — five 1p coins is 5p, not 5 coins’ worth of value confusion.',
  ],
};
