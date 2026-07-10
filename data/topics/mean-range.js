// FART QUEST topic: The Average Alley — mean & range (The Data Dump)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'mean-range',
  name: 'The Average Alley',
  region: 'data-dump',
  genId: 'meanrange',
  tagline: 'Where every number gets shared out fair and square.',

  creature: {
    id: 'the-meanie',
    name: 'The Meanie',
    rarity: 'rare',
    image: 'assets/monsters/the-meanie.png',
    bio: 'Despite the terrible name, The Meanie is dreadfully polite — he simply insists that EVERYTHING gets shared out perfectly evenly, sweets included. He carries one enormous spoon everywhere: The Sharing-Out Scoop.',
    factSneak: 'Mean = add everything up, then share it out equally (divide by how many). Range = the gap between the biggest and smallest.',
  },

  weapon: {
    id: 'sharing-out-scoop',
    name: 'The Sharing-Out Scoop',
    tagline: 'Share any pile of numbers out perfectly fair — and measure the gap between them.',
    rule: 'Mean = share the total out equally (add all, divide by how many). Range = biggest minus smallest.',
    example: 'Mean of 4, 6 and 8: add them (4+6+8=18), share between 3: 18÷3=<b>6</b>. Range of the same three: 8−4=<b>4</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-meanrange',
      text: 'Gather round, my brave nose-soldier, for the fairest lesson in the whole bog! Some numbers aren’t interested in being different — they want everything shared out <b>perfectly evenly</b>. Today you get a Scoop that makes that happen every single time.',
    },
    {
      type: 'show',
      title: 'Levelling the Towers',
      html: `<p>Meet Amy, Ben and Cal. They’ve been collecting sweets all week — but NOT very fairly.</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">Amy</div>
    <div style="display:flex;flex-direction:column-reverse;gap:4px;align-items:center;">
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
    </div>
    <div class="pv-val">2</div>
  </div>
  <div class="pv-col"><div class="pv-head">Ben</div>
    <div style="display:flex;flex-direction:column-reverse;gap:4px;align-items:center;">
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
    </div>
    <div class="pv-val">6</div>
  </div>
  <div class="pv-col"><div class="pv-head">Cal</div>
    <div style="display:flex;flex-direction:column-reverse;gap:4px;align-items:center;">
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
    </div>
    <div class="pv-val">4</div>
  </div>
</div>
<p>That’s just not fair on Amy! What if we tipped ALL the sweets into one big pile, then shared them out <b>equally</b> between the three of them?</p>
<div class="slide-arrow">↓ LEVEL OUT ↓</div>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">Amy</div>
    <div style="display:flex;flex-direction:column-reverse;gap:4px;align-items:center;">
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
    </div>
    <div class="pv-val">4</div>
  </div>
  <div class="pv-col"><div class="pv-head">Ben</div>
    <div style="display:flex;flex-direction:column-reverse;gap:4px;align-items:center;">
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
    </div>
    <div class="pv-val">4</div>
  </div>
  <div class="pv-col"><div class="pv-head">Cal</div>
    <div style="display:flex;flex-direction:column-reverse;gap:4px;align-items:center;">
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
      <div class="digit-tile" style="width:34px;height:34px;font-size:16px;border-radius:8px;">🍬</div>
    </div>
    <div class="pv-val">4</div>
  </div>
</div>
<p>2 + 6 + 4 = <b>12</b> sweets altogether, shared between <b>3</b> friends = <b>4</b> each. That levelled-out number is called the <b>mean</b> (grown-ups sometimes say “average”). It’s the fair-share amount — not any one friend’s real pile, just what everyone WOULD get if it were shared perfectly evenly.</p>`,
    },
    {
      type: 'talk',
      text: 'Here’s the whole trick, my stinky statistician — it is ONLY EVER two steps. Step one: <b>ADD</b> every number in the set together to get the total. Step two: <b>DIVIDE</b> that total by HOW MANY numbers you added. Miss either step and the Scoop won’t work. I have seen many a brave hero forget to divide and hand in the total by mistake. Don’t be that hero.',
    },
    {
      type: 'try',
      q: {
        id: 'mr-try-1', topicId: 'mean-range', tier: 1, format: 'mcq5',
        stem: 'Find the <b>mean</b> of 3, 5 and 7.',
        options: [
          { text: '5', misconception: null },
          { text: '15', misconception: 'forgot-divide' },
          { text: '3', misconception: 'picked-smallest' },
          { text: '7', misconception: 'picked-largest' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Add all three numbers together first: 3 + 5 + 7 = ?',
          'Now divide that total by how many numbers there are — there are 3 of them.',
        ],
        explain: {
          rule: 'Mean = share the total out equally (add all, divide by how many). Range = biggest minus smallest.',
          worked: '3 + 5 + 7 = 15. Share the 15 out between 3 numbers: 15 ÷ 3 = 5.',
          whyWrong: {
            '15': 'That’s the TOTAL — the sharing-out step got forgotten! Divide it by how many numbers there are.',
            '3': 'That’s just the smallest number on its own — the mean shares out ALL the numbers.',
            '7': 'That’s just the largest number on its own — the mean shares out ALL the numbers.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Range: how spread out?',
      html: `<p>Not every question wants the fair-share number. Sometimes it wants to know how <b>spread out</b> the numbers are — how far the smallest is from the biggest. That’s called the <b>range</b>.</p>
<div class="law-scroll">📜 <b>RANGE = BIGGEST − SMALLEST.</b> That’s it. Not the total, not how many numbers there are — just the gap between the two extremes.</div>
<p>Take the set <b>3, 8, 15, 10</b>:</p>
<div class="estimate-demo">
  <div class="est-line">Biggest: <b>15</b> <span class="est-note">(the highest jump)</span></div>
  <div class="est-line">Smallest: <b>3</b> <span class="est-note">(the lowest jump)</span></div>
  <div class="est-line">Range = 15 − 3 = <b>12</b></div>
</div>
<p>The middle two numbers (8 and 10) don’t matter at all for the range — only the biggest and smallest ever count.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mr-try-2', topicId: 'mean-range', tier: 1, format: 'mcq5',
        stem: 'Find the <b>range</b> of this set: 9, 4, 17, 11, 6.',
        options: [
          { text: '13', misconception: null },
          { text: '17', misconception: 'biggest-alone' },
          { text: '4', misconception: 'smallest-alone' },
          { text: '5', misconception: 'wrong-pair' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Find the BIGGEST number and the SMALLEST number in the set.',
          'Range = biggest − smallest. 17 − 4 = ?',
        ],
        explain: {
          rule: 'Mean = share the total out equally (add all, divide by how many). Range = biggest minus smallest.',
          worked: 'Biggest = 17, smallest = 4. Range = 17 − 4 = 13.',
          whyWrong: {
            '17': 'That’s just the biggest number by itself — the range is the GAP between biggest and smallest.',
            '4': 'That’s just the smallest number by itself — you need to subtract it from the biggest, not stop there.',
            '5': 'Check you picked the TRUE biggest and smallest — not two numbers from the middle (11 − 6).',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Two ways heroes lose easy marks',
      html: `<p>The Meanie has watched a thousand heroes trip over the exact same two puddles. Watch out for both.</p>
<div class="law-scroll">📜 <b>TRAP ONE:</b> forgetting to divide, and writing the TOTAL as your answer to a mean question.<br>📜 <b>TRAP TWO:</b> dividing by the WRONG count — always COUNT how many numbers are in the set before you divide.</div>
<p>There’s a sneaky trick worth knowing too: if <b>every</b> number in a set shifts by the same amount, the mean shifts by that <i>exact</i> same amount — no need to re-add the whole set from scratch.</p>
<div class="estimate-demo">
  <div class="est-line">The mean age of 3 friends is 7. In 3 years’ time, everyone is 3 years older.</div>
  <div class="est-line">Every number went up by the same amount: <b>+3</b></div>
  <div class="est-line">So the new mean is 7 + 3 = <b>10</b></div>
</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'mr-try-3', topicId: 'mean-range', tier: 2, format: 'mcq5',
        stem: 'Find the <b>mean</b> of 3, 5, 7 and 9.',
        options: [
          { text: '6', misconception: null },
          { text: '24', misconception: 'forgot-divide' },
          { text: '8', misconception: 'wrong-count' },
          { text: '9', misconception: 'picked-largest' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Add all four numbers together: 3 + 5 + 7 + 9 = ?',
          'Now COUNT how many numbers there are, then divide the total by that count.',
        ],
        explain: {
          rule: 'Mean = share the total out equally (add all, divide by how many). Range = biggest minus smallest.',
          worked: '3 + 5 + 7 + 9 = 24. There are 4 numbers, so 24 ÷ 4 = 6.',
          whyWrong: {
            '24': 'That’s the TOTAL — don’t forget the second step! Share it out by dividing by how many numbers there are.',
            '8': 'Check how many numbers are actually in the set — that’s the total divided by the WRONG count.',
            '9': 'That’s just the largest number by itself — the mean shares ALL four numbers out equally.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Mean = ADD every number, then DIVIDE by how many there are. Two steps, every time.',
    'The mean is a fair-share number — it might not match any number actually in the set.',
    'Range = biggest minus smallest. Not the biggest alone, not the total, not the middle numbers.',
    'The classic trap: forgetting to divide and writing the TOTAL as your answer. Always ask “did I share it out?”',
    'Before you divide, COUNT how many numbers are in the set — dividing by the wrong count is an easy slip.',
    'If every number in a set shifts by the same amount (like everyone getting 3 years older), the mean shifts by that exact same amount — no need to add everything up again.',
    'Two sets can share the same mean but have very different ranges — the mean tells you the “middle”, the range tells you the “spread”.',
  ],
};
