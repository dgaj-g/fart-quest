// FART QUEST topic: The FDP Triangle — fractions, decimals & percentages (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'fdp',
  name: 'The FDP Triangle',
  region: 'number-swamp',
  genId: 'fdp',
  tagline: 'Where a half wears three different disguises and dares you to notice.',

  creature: {
    id: 'percy-percent',
    name: 'Percy Percent',
    rarity: 'rare',
    image: 'assets/monsters/percy-percent.png',
    bio: 'Percy owns exactly one wardrobe but insists he is three entirely different creatures, depending on which monocle he’s wearing that day. Tell him ½ and 50% are “the same” and watch him gasp in outrage — before admitting, very quietly, that you’re completely right.',
    factSneak: '½, 0.5 and 50% (and ¼/0.25/25%, ¾/0.75/75%) are all the SAME amount — just wearing different disguises.',
  },

  weapon: {
    id: 'disguise-detector',
    name: 'The Disguise Detector',
    tagline: 'Spot any fraction, decimal or percentage on sight — and unmask exactly what it’s worth.',
    rule: '½, 0.5 and 50% are the SAME creature in three disguises. To find a fraction OF an amount: divide by the bottom, times by the top.',
    example: '¼ = 0.25 = 25% — three disguises, one amount. To find 25% of £60: 25% is ¼, so £60 ÷ 4 = <b>£15</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-fdp',
      text: 'Ahhh, Percy Percent — my dapper little disguise artist! He wears a monocle and swears, absolutely SWEARS, that he is three completely different creatures. He is lying, of course. Watch closely, my brave nose-soldier: <b>½</b>, the decimal <b>0.5</b>, and <b>50%</b> are the EXACT same amount, just wearing different costumes. Today you learn to see straight through every single one.',
    },
    {
      type: 'show',
      title: 'Percy’s Wardrobe of Disguises',
      html: `<p>Percy owns exactly <b>one</b> wardrobe, but he refuses to admit it. He struts about wearing THREE completely different disguises for the very same amount:</p>
<div style="display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;margin:18px 0;">
  <div style="background:var(--swamp-deep);color:var(--gold);border-radius:14px;padding:14px 18px;text-align:center;min-width:90px;box-shadow:0 4px 0 rgba(0,0,0,.3);">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;opacity:.75;">Fraction</div>
    <div style="font-family:'Fredoka',sans-serif;font-weight:700;font-size:28px;margin-top:4px;">½</div>
  </div>
  <div style="font-family:'Fredoka',sans-serif;font-weight:700;font-size:22px;color:var(--gold-deep);">=</div>
  <div style="background:var(--swamp-deep);color:var(--gold);border-radius:14px;padding:14px 18px;text-align:center;min-width:90px;box-shadow:0 4px 0 rgba(0,0,0,.3);">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;opacity:.75;">Decimal</div>
    <div style="font-family:'Fredoka',sans-serif;font-weight:700;font-size:28px;margin-top:4px;">0.5</div>
  </div>
  <div style="font-family:'Fredoka',sans-serif;font-weight:700;font-size:22px;color:var(--gold-deep);">=</div>
  <div style="background:var(--swamp-deep);color:var(--gold);border-radius:14px;padding:14px 18px;text-align:center;min-width:90px;box-shadow:0 4px 0 rgba(0,0,0,.3);">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;opacity:.75;">Percentage</div>
    <div style="font-family:'Fredoka',sans-serif;font-weight:700;font-size:28px;margin-top:4px;">50%</div>
  </div>
</div>
<p>Same amount. Three disguises. Here’s the rest of his wardrobe — memorise this set, it turns up in EVERY exam:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:19px;text-align:center;">
  <thead>
    <tr style="background:var(--swamp-deep);color:var(--gold);">
      <th style="padding:10px;border-radius:10px 0 0 0;">Fraction</th><th style="padding:10px;">Decimal</th><th style="padding:10px;border-radius:0 10px 0 0;">Percentage</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:rgba(0,0,0,.04);"><td style="padding:8px;font-weight:700;">¼</td><td style="padding:8px;">0.25</td><td style="padding:8px;">25%</td></tr>
    <tr><td style="padding:8px;font-weight:700;">¾</td><td style="padding:8px;">0.75</td><td style="padding:8px;">75%</td></tr>
    <tr style="background:rgba(0,0,0,.04);"><td style="padding:8px;font-weight:700;">⅒</td><td style="padding:8px;">0.1</td><td style="padding:8px;">10%</td></tr>
    <tr><td style="padding:8px;font-weight:700;">⅕</td><td style="padding:8px;">0.2</td><td style="padding:8px;">20%</td></tr>
  </tbody>
</table>`,
    },
    {
      type: 'talk',
      text: 'Here is the fastest disguise-detector trick I know, o loyal fart-flinger: <b>TENTHS are the bridge.</b> Any fraction with a 10 on the bottom slides straight into a decimal — 7/10 becomes 0.7 — and that decimal’s own digit tells you the TENS digit of the percentage: 0.7 = 70%. Hundredths work exactly the same way: 23/100 = 0.23 = 23%. Same digits, three costumes, every single time.',
    },
    {
      type: 'try',
      q: {
        id: 'fdp-try-1', topicId: 'fdp', tier: 1, format: 'mcq5',
        stem: 'Which of these is the SAME amount as <b>½</b>?',
        options: [
          { text: '50%', misconception: null },
          { text: '5%', misconception: 'decimal-percent-slip' },
          { text: '25%', misconception: 'wrong-family' },
          { text: '0.5%', misconception: 'triple-slip' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Start with the decimal: ½ = 0.5. Now slide the point TWO places to turn it into a percentage.',
          '0.5 × 100 = …?',
        ],
        explain: {
          rule: '½, 0.5 and 50% are the SAME creature in three disguises. To find a fraction OF an amount: divide by the bottom, times by the top.',
          worked: '½ = 0.5 = 50% — three disguises for the same half.',
          whyWrong: {
            '5%': 'That’s only ONE slide of the point — 0.5 needs TWO slides to become a percentage: 0.5 × 100 = 50%.',
            '25%': 'That’s Percy’s disguise for ¼, a quarter — not a half.',
            '0.5%': 'That’s a hundred times too small!',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The 10% Anchor',
      html: `<p>Percentages LOVE the number 10. However big the total is, finding <b>10%</b> is always dead easy — no fancy fractions required.</p>
<div class="law-scroll">📜 <b>THE 10% ANCHOR:</b> 10% of ANY amount = the amount ÷ 10. That’s it.</div>
<div class="estimate-demo">
  <div class="est-line">10% of £80 = £80 ÷ 10 = <b>£8</b></div>
  <div class="est-line">↓ now build any percentage from the anchor ↓</div>
  <div class="est-line">5% = HALF of 10% = <b>£4</b></div>
  <div class="est-line">20% = DOUBLE 10% = <b>£16</b></div>
  <div class="est-line">15% = 10% + 5% = £8 + £4 = <b>£12</b></div>
</div>
<p>Notice something? 10% is really the fraction <b>1/10</b> — and the Disguise Detector rule already tells you exactly how to find a fraction of an amount: <b>divide by the bottom, times by the top.</b> Divide by 10 (the bottom), times by 1 (the top). Same rule. New disguise.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'fdp-try-2', topicId: 'fdp', tier: 2, format: 'mcq5',
        stem: 'What is <b>25%</b> of 60?',
        options: [
          { text: '15', misconception: null },
          { text: '6', misconception: 'ten-percent-only' },
          { text: '20', misconception: 'wrong-fraction' },
          { text: '25', misconception: 'percent-as-value' },
          { text: '45', misconception: 'percent-off' },
        ],
        correctIndex: 0,
        hintSteps: [
          '25% is one of Percy’s disguises — which fraction is it? (Check the equivalence triangle.)',
          '25% = ¼. Divide by the bottom (4), then times by the top (1): 60 ÷ 4 = …?',
        ],
        explain: {
          rule: '½, 0.5 and 50% are the SAME creature in three disguises. To find a fraction OF an amount: divide by the bottom, times by the top.',
          worked: '25% = ¼. 60 ÷ 4 = 15 (× 1) = 15.',
          whyWrong: {
            '6': 'That’s 10% of 60 (60 ÷ 10) — but we need 25%, a BIGGER slice.',
            '20': 'That’s using ⅓ instead of ¼ — double check which fraction 25% really is.',
            '25': 'That’s just the percentage NUMBER itself, not 25% OF 60.',
            '45': 'That’s 60 MINUS 25% — the “percent OFF” trap! The question asks for 25% OF 60, not what’s left after taking it away.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Beware: “What’s LEFT” Is a Brand-New Total',
      html: `<p>Here is the trap that catches even careful heroes. Watch closely what happens when a question asks about a fraction of what’s <b>left over</b>, rather than the original amount.</p>
<p>Say Jarlath has <b>30 sweets</b>. He eats <b>⅓</b> of them. ⅓ of 30 = 30 ÷ 3 = <b>10 eaten</b>. That leaves <b>20 sweets</b> — a brand NEW total.</p>
<p>Now the trap: he eats <b>HALF of the REST</b>. The word “rest” means the NEW total — <b>20</b>, not the original 30! Half of 20 = <b>10</b> more gone. NOT half of 30 (which would wrongly give 15).</p>
<div class="law-scroll">📜 <b>THE REMAINDER RULE:</b> The words “of the rest” or “of what’s left” mean: the amount REMAINING becomes the new total — never the original amount.</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'fdp-try-3', topicId: 'fdp', tier: 2, format: 'mcq5',
        stem: 'Robin has 24 marbles. She gives away <b>¼</b> of them to her sister. Then she gives away <b>HALF</b> of what is LEFT to her brother. How many marbles does Robin have LEFT at the end?',
        options: [
          { text: '9', misconception: null },
          { text: '6', misconception: 'remainder-of-original' },
          { text: '18', misconception: 'stopped-early' },
          { text: '15', misconception: 'given-away-not-left' },
        ],
        correctIndex: 0,
        hintSteps: [
          'First find how many go to her sister: ¼ of 24. Then work out how many are LEFT after that gift — that becomes the NEW total for the next step.',
          '¼ of 24 = 6, so 18 are left. Half of THAT 18 goes to her brother. How many are left after both gifts?',
        ],
        explain: {
          rule: 'The words “of the rest” or “of what’s left” mean: the amount REMAINING becomes the new total — never the original amount.',
          worked: '¼ of 24 = 6 (sister). 24 − 6 = 18 left — a NEW total. Half of 18 = 9 (brother). 18 − 9 = 9 marbles left.',
          whyWrong: {
            '6': 'That treats “half of what’s left” as half of the ORIGINAL 24 — but “what’s left” means the 18 marbles remaining AFTER the first gift, not the starting amount.',
            '18': 'That’s only after the FIRST gift — don’t forget Robin gives more away to her brother afterwards!',
            '15': 'That’s the TOTAL number of marbles given away (6 + 9) — but the question asks how many she has LEFT.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    '½, 0.5 and 50% (and ¼/0.25/25%, ¾/0.75/75%, ⅒/0.1/10%, ⅕/0.2/20%) are the SAME amounts in different disguises — learn this set cold.',
    'Any fraction over 10 or 100 slides straight into a decimal, and that decimal’s digits ARE the percentage: 7/10 = 0.7 = 70%; 23/100 = 0.23 = 23%.',
    'To find a fraction OF an amount: divide by the bottom, times by the top. 25% of 60 → 25% = ¼ → 60 ÷ 4 × 1 = 15.',
    '10% of anything = amount ÷ 10. Build any percentage from that anchor: 5% = half of 10%, 20% = double 10%, 15% = 10% + 5%.',
    'Watch for the “0.5 = 5%” slip — that’s only ONE slide of the point. A decimal needs TWO slides to become a percentage.',
    '“Of the rest” or “of what’s left” means use the amount REMAINING as the new total — never the original amount.',
    'Percent OF an amount is not the same as percent OFF an amount. “25% of 60” = 15. “Take 25% off 60” = 45. Read the question carefully!',
  ],
};
