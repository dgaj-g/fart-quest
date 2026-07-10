// FART QUEST topic: Catapult Hill — rounding & estimating (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'rounding',
  name: 'Catapult Hill',
  region: 'number-swamp',
  genId: 'rounding',
  tagline: 'Where numbers get flung to the nearest friendly camp.',

  creature: {
    id: 'sir-roundbottom',
    name: 'Sir Roundbottom',
    rarity: 'rare',
    image: 'assets/monsters/sir-roundbottom.png',
    bio: 'So perfectly spherical he cannot stop halfway up a hill. Rolls to the nearest ten whether he likes it or not — and if he’s exactly in the middle, the ancient law of the kingdom flings him UP. He has complained about this law for 400 years.',
    factSneak: 'Rounding: look at the DECIDER digit. 5 or more flings UP, 4 or less rolls BACK.',
  },

  weapon: {
    id: 'rounding-catapult',
    name: 'The Rounding Catapult',
    tagline: 'Fling any number to its nearest camp — and estimate like a wizard.',
    rule: 'Find the two camps. Look at the DECIDER digit only: 5 or more → fling UP. 4 or less → roll BACK.',
    example: 'Round 74 to the nearest 10: camps are 70 and 80. Decider digit is 4 → roll back → <b>70</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-round',
      text: 'Ah, my favourite lesson, you splendid whiff-warrior! Sometimes maths doesn’t need the EXACT answer — it needs a <b>quick, roughly-right</b> one. Like when I ask “how many sprouts did you eat?” and you say “about twenty”. That’s rounding. Today you get a CATAPULT.',
    },
    {
      type: 'show',
      title: 'Every number lives between two camps',
      html: `<p>Take the number <b>74</b>. It lives on the road between two camps: <b>Camp 70</b> and <b>Camp 80</b>.</p>
<div class="numline" data-min="70" data-max="80" data-marker="74">
  <div class="camp camp-a">70</div>
  <div class="numline-track">
    <span class="tick"></span><span class="tick"></span><span class="tick"></span><span class="tick"></span>
    <span class="numline-marker" style="--pos:40%">74</span>
    <span class="tick"></span><span class="tick"></span><span class="tick"></span><span class="tick"></span><span class="tick"></span>
  </div>
  <div class="camp camp-b">80</div>
</div>
<p>“Round 74 to the nearest ten” just means: <b>which camp is closer?</b> 74 is only 4 steps from Camp 70, but 6 steps from Camp 80. So 74 rounds to <b>70</b>. That’s it. That’s the whole idea.</p>`,
    },
    {
      type: 'talk',
      text: 'But heroes don’t count steps — too slow! Here’s the fast way: look at ONE digit only. Rounding to the nearest <b>ten</b>? The decider is the <b>UNITS</b> digit. Nearest <b>hundred</b>? The decider is the <b>TENS</b> digit. The decider digit tells the catapult what to do — everything after it is just noise.',
    },
    {
      type: 'try',
      q: {
        id: 'round-try-1', topicId: 'rounding', tier: 1, format: 'mcq5',
        stem: 'Round <b>68</b> to the nearest 10.',
        options: [
          { text: '70', misconception: null },
          { text: '60', misconception: 'rolled-back' },
          { text: '68', misconception: 'no-round' },
          { text: '100', misconception: 'wrong-place' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Camps: 60 and 70. Now check the decider — the UNITS digit of 68.',
          'The decider is 8. Is 8 “5 or more”? Then the catapult flings UP to…?',
        ],
        explain: {
          rule: 'Find the two camps. Look at the DECIDER digit only: 5 or more → fling UP. 4 or less → roll BACK.',
          worked: '68 sits between 60 and 70. Decider (units) = 8 → 5 or more → fling UP → 70.',
          whyWrong: {
            '60': 'The decider was 8 — that’s 5 or more, so the catapult fires UP, not back.',
            '68': 'Rounding always lands ON a camp — a number ending in 0.',
            '100': 'That’s rounding to the nearest hundred — wrong catapult!',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Law of Five',
      html: `<p>What about <b>75</b>? It’s EXACTLY halfway between the camps. Neither is closer! For a thousand years the camps argued about it. So the kingdom passed a law:</p>
<div class="law-scroll">📜 <b>THE LAW OF FIVE:</b> if the decider digit is <b>5 or more, the catapult ALWAYS flings UP.</b></div>
<p>So 75 → <b>80</b>. 350 to the nearest hundred → <b>400</b>. No arguments, no exceptions, no take-backsies. Sir Roundbottom finds this deeply unfair. The law does not care.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'round-try-2', topicId: 'rounding', tier: 1, format: 'mcq5',
        stem: 'Round <b>350</b> to the nearest 100.',
        options: [
          { text: '400', misconception: null },
          { text: '300', misconception: 'rolled-back-on-5' },
          { text: '350', misconception: 'no-round' },
          { text: '360', misconception: 'wrong-place' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Camps: 300 and 400. Nearest HUNDRED means the decider is the TENS digit.',
          'The decider is 5. What does the Law of Five say? Fling…?',
        ],
        explain: {
          rule: 'Find the two camps. Look at the DECIDER digit only: 5 or more → fling UP. 4 or less → roll BACK.',
          worked: '350 sits between 300 and 400. Decider (tens) = 5 → the Law of Five → fling UP → 400.',
          whyWrong: {
            '300': 'Exactly halfway ALWAYS flings up — the Law of Five has no mercy.',
            '350': 'Rounding to the nearest hundred must land on a hundred camp.',
            '360': 'That’s rounding to the nearest ten — wrong catapult!',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Estimating: the examiner’s favourite',
      html: `<p>Here’s where the catapult wins you actual SEAG marks. When a question says <b>“estimate”</b> or <b>“roughly”</b>, it does NOT want the exact answer. It wants you to <b>round first, THEN calculate</b> with the easy numbers.</p>
<div class="estimate-demo">
  <div class="est-line">£9.90 + £3.20 = 😱 <span class="est-note">fiddly pence</span></div>
  <div class="est-line">↓ round both to the nearest £1 ↓</div>
  <div class="est-line"><b>£10 + £3 = £13</b> 😎 <span class="est-note">two seconds!</span></div>
</div>
<p>The catapult flings prices to the nearest whole pound — the decider is the first digit after the point: £9.90 → <b>£10</b>, £3.20 → <b>£3</b>. The exact total is £13.10, and £13 is beautifully close. On the test, wrong answers to money-estimate questions are usually the EXACT total (like £13.10) hiding in the options to tempt you. Don’t take the bait: if it says estimate, they want the rounded one!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'round-try-3', topicId: 'rounding', tier: 2, format: 'mcq5',
        stem: 'ESTIMATE: £18.90 + £42.60 is roughly…',
        options: [
          { text: '£62', misconception: null },
          { text: '£61.50', misconception: 'exact-bait' },
          { text: '£60', misconception: 'rounded-down-both' },
          { text: '£620', misconception: 'magnitude' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Round each price to the nearest whole pound first: £18.90 → ? and £42.60 → ?',
          '£19 + £43 = …?',
        ],
        explain: {
          rule: 'Estimate = round FIRST, then calculate with the easy numbers.',
          worked: '£18.90 → £19, £42.60 → £43. £19 + £43 = £62.',
          whyWrong: {
            '£61.50': 'That’s the EXACT total — the classic bait! “Estimate” means they want the rounded version.',
            '£60': '18.90 and 42.60 both have deciders of 5 or more (9 and 6) — they round UP, not down.',
            '£620': 'Ten times too big — check the size of your rounded pounds.',
          },
        },
      },
    },
    { type: 'anim', anim: 'rounding' },
    { type: 'weapon' },
  ],

  tips: [
    'The decider digit is the ONLY digit that matters. Everything after it is noise.',
    'Nearest 10 → decider is the UNITS digit. Nearest 100 → decider is the TENS digit.',
    'The Law of Five: 5 or more ALWAYS flings up. 75 → 80. 350 → 400. No exceptions.',
    'See “estimate”, “roughly” or “approximately” in a question? Round FIRST, then calculate.',
    'Money rounds too: the decider is the first digit after the point. £9.90 → £10, £3.20 → £3.',
    'In money-estimate questions, the EXACT total is usually sitting in the options as bait. Don’t take it.',
    'Use the catapult to CHECK totals too: if your prices round to about £13 but your exact answer is £131, a digit slid too far!',
  ],
};
