// FART QUEST topic: The Slide-o-Matic Swamp — decimals & ×÷ by 10/100/1000 (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'decimals-x10',
  name: 'The Slide-o-Matic Swamp',
  region: 'number-swamp',
  genId: 'decimals',
  tagline: 'Where numbers grow ten times bigger in one glorious slide.',

  creature: {
    id: 'pointy-mcpoopants',
    name: 'Pointy McPoopants',
    rarity: 'rare',
    image: 'assets/monsters/pointy-mcpoopants.png',
    bio: 'Keeper of the Decimal Point. His hat marks the spot where whole numbers end and the tiny bits begin, and he NEVER moves it — not for anyone. Digits must slide past him and say “excuse me”.',
    factSneak: 'When you × or ÷ by 10, 100 or 1000, the decimal point NEVER moves. The digits slide past it.',
  },

  weapon: {
    id: 'slide-o-matic',
    name: 'The Slide-o-Matic 1000',
    tagline: 'Multiply or divide by 10, 100 or 1000 in two seconds flat.',
    rule: 'The point NEVER moves. The DIGITS slide — LEFT when you multiply (bigger), RIGHT when you divide (smaller). One slide per zero.',
    example: '3.5 × 10 → digits slide one throne LEFT → <b>35</b>. &nbsp; 62 ÷ 100 → two thrones RIGHT → <b>0.62</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-dec',
      text: 'Gather round, you magnificent little stink-berry! Today I shall show you a machine that makes numbers <b>ten times bigger</b> in one move. Villains would pay MILLIONS for this. You’re getting it free, because I like your face.',
    },
    {
      type: 'show',
      title: 'The point is a fence',
      html: `<p>First — meet the <b>decimal point</b>. It’s a fence in the middle of the palace. Whole numbers live on the LEFT of the fence. The tiny bits — <b>tenths</b> and <b>hundredths</b> — live on the RIGHT.</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">Tens</div><div class="pv-cell">2</div></div>
  <div class="pv-col"><div class="pv-head">Units</div><div class="pv-cell">3</div></div>
  <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
  <div class="pv-col"><div class="pv-head">tenths</div><div class="pv-cell">7</div></div>
  <div class="pv-col"><div class="pv-head">hundredths</div><div class="pv-cell">5</div></div>
</div>
<p>That’s <b>23.75</b> — twenty-three whole ones, then 7 tenths and 5 hundredths of the next one. A tenth is what you get when something is chopped into ten fair pieces. Like sharing one sausage between ten dogs. Small pieces. Angry dogs.</p>`,
    },
    {
      type: 'show',
      title: 'The Slide-o-Matic — multiplying',
      html: `<p>Now, the machine. When you <b>× 10</b>, every digit slides <b>one throne to the LEFT</b> — every digit becomes ten times more important. The point? <b>It never moves.</b> It’s a fence, not a passenger.</p>
<div class="slide-demo" data-from="3.5" data-to="35" data-dir="left" data-steps="1">
  <div class="pv-grid pv-before">
    <div class="pv-col"><div class="pv-head">T</div><div class="pv-cell pv-ghost">&nbsp;</div></div>
    <div class="pv-col"><div class="pv-head">U</div><div class="pv-cell">3</div></div>
    <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
    <div class="pv-col"><div class="pv-head">t</div><div class="pv-cell">5</div></div>
  </div>
  <div class="slide-arrow">× 10 — slide LEFT! 🌬️</div>
  <div class="pv-grid pv-after">
    <div class="pv-col"><div class="pv-head">T</div><div class="pv-cell">3</div></div>
    <div class="pv-col"><div class="pv-head">U</div><div class="pv-cell">5</div></div>
    <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
    <div class="pv-col"><div class="pv-head">t</div><div class="pv-cell pv-ghost">&nbsp;</div></div>
  </div>
  <button class="slide-replay">▶ SLIDE IT AGAIN</button>
</div>
<p>So <b>3.5 × 10 = 35</b>. And <b>× 100</b>? TWO slides left. <b>× 1000</b>? Three! Count the zeros — that’s your number of slides.</p>`,
    },
    {
      type: 'talk',
      text: 'Now a WARNING, hero. ⚠️ Some fool will tell you “just add a zero”. That works for 45 × 10 = 450… but try it on 3.5 and you get 3.50 — <b>which is exactly the same size!</b> The Baron’s cousins fail this question every single year. “Add a zero” is a LIE when there’s a point in the number. SLIDE, don’t stick.',
    },
    {
      type: 'try',
      q: {
        id: 'dec-try-1', topicId: 'decimals-x10', tier: 1, format: 'mcq5',
        stem: 'What is 2.7 × 10?',
        options: [
          { text: '27', misconception: null },
          { text: '2.70', misconception: 'add-a-zero' },
          { text: '20.7', misconception: 'zero-stuffed' },
          { text: '270', misconception: 'two-slides' },
        ],
        correctIndex: 0,
        hintSteps: [
          '× 10 means every digit slides ONE throne to the left. The point stays put.',
          'The 2 slides into the Tens throne, the 7 slides into the Units throne. What number is that?',
        ],
        explain: {
          rule: 'The point NEVER moves. The DIGITS slide — LEFT when you multiply (bigger), RIGHT when you divide (smaller). One slide per zero.',
          worked: '2.7 × 10 → the 2 and the 7 each slide one throne left → 27.',
          whyWrong: {
            '2.70': 'The “add a zero” trap! 2.70 is the SAME size as 2.7 — nothing got bigger.',
            '20.7': 'A zero got stuffed in the middle — digits slide together, side by side.',
            '270': 'That’s TWO slides — that would be × 100.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Dividing — slide the other way',
      html: `<p>Dividing is the same machine in reverse. <b>÷ 10</b> slides every digit <b>one throne RIGHT</b> — everything gets ten times smaller and shyer.</p>
<div class="slide-demo" data-from="62" data-to="0.62" data-dir="right" data-steps="2">
  <div class="pv-grid pv-before">
    <div class="pv-col"><div class="pv-head">T</div><div class="pv-cell">6</div></div>
    <div class="pv-col"><div class="pv-head">U</div><div class="pv-cell">2</div></div>
    <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
    <div class="pv-col"><div class="pv-head">t</div><div class="pv-cell pv-ghost">&nbsp;</div></div>
    <div class="pv-col"><div class="pv-head">h</div><div class="pv-cell pv-ghost">&nbsp;</div></div>
  </div>
  <div class="slide-arrow">÷ 100 — slide RIGHT twice! 💨</div>
  <div class="pv-grid pv-after">
    <div class="pv-col"><div class="pv-head">T</div><div class="pv-cell pv-ghost">&nbsp;</div></div>
    <div class="pv-col"><div class="pv-head">U</div><div class="pv-cell pv-zero">0</div></div>
    <div class="pv-col pv-point"><div class="pv-head">&nbsp;</div><div class="pv-cell">•</div></div>
    <div class="pv-col"><div class="pv-head">t</div><div class="pv-cell">6</div></div>
    <div class="pv-col"><div class="pv-head">h</div><div class="pv-cell">2</div></div>
  </div>
  <button class="slide-replay">▶ SLIDE IT AGAIN</button>
</div>
<p><b>62 ÷ 100 = 0.62</b>. See that 0 at the front? The seat-warmer strikes again — a decimal never starts with a bare point, so zero guards the Units throne. In the SEAG test they check that zero. Always write it.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'dec-try-2', topicId: 'decimals-x10', tier: 1, format: 'mcq5',
        stem: 'What is 4 ÷ 10?',
        options: [
          { text: '0.4', misconception: null },
          { text: '40', misconception: 'slid-wrong-way' },
          { text: '0.04', misconception: 'two-slides' },
          { text: '4.10', misconception: 'stuck-on' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Dividing makes numbers SMALLER — so the 4 slides one throne to the RIGHT, past the fence.',
          'The 4 lands on the tenths throne, and the seat-warmer zero guards the Units. So it’s zero point…?',
        ],
        explain: {
          rule: 'The point NEVER moves. The DIGITS slide — LEFT when you multiply (bigger), RIGHT when you divide (smaller). One slide per zero.',
          worked: '4 ÷ 10 → the 4 slides one throne right, onto the tenths throne → 0.4.',
          whyWrong: {
            '40': 'That slid LEFT — that’s multiplying! Dividing makes numbers smaller.',
            '0.04': 'Two slides right is ÷ 100. We only divided by 10 — one slide.',
            '4.10': 'The digits got glued together — nobody slid anywhere.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'The decimal point NEVER moves. The digits slide past it.',
    '× 10 = one slide LEFT. × 100 = two. × 1000 = three. Count the zeros!',
    '÷ slides RIGHT — numbers get smaller. If your answer got bigger after dividing, slide back!',
    '“Just add a zero” is a TRAP whenever there’s a decimal point: 3.5 × 10 is 35, never 3.50.',
    'A decimal never starts with a bare point: write 0.62, not .62 — the seat-warmer zero guards the front door.',
    'Quick check: multiplying → answer must be BIGGER. Dividing → smaller. Two seconds, saves a mark.',
  ],
};
