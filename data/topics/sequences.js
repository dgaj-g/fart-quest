// FART QUEST topic: Pattern Path — sequences (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'sequences',
  name: 'Pattern Path',
  region: 'number-swamp',
  genId: 'sequences',
  tagline: 'Where every number already knows what comes next.',

  creature: {
    id: 'the-sequel',
    name: 'The Sequel',
    rarity: 'rare',
    image: 'assets/monsters/the-sequel.png',
    bio: 'He has never once been surprised in his life — he always knows what comes next, and he WILL tell you before you asked. Deeply, insufferably smug about it.',
    factSneak: 'Find the jump between neighbours FIRST. The jump reveals everything.',
  },

  weapon: {
    id: 'gap-o-meter',
    name: 'The Gap-o-Meter',
    tagline: 'Never be surprised by a sequence again.',
    rule: 'Find the jump between neighbours FIRST. The jump reveals everything.',
    example: '3, 7, 11, <b>?</b>, 19 — neighbours 3 and 7 are 4 apart, so the jump is +4. 11 + 4 = <b>15</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-sequences',
      text: 'Ahh, welcome to Pattern Path, my clever little stinker! I am The Sequel — because I <b>always</b> know what comes next. Give me any string of numbers and I will tell you the next one before you have even finished sniffing. Today you learn my secret. It is not magic. It is the GAP.',
    },
    {
      type: 'show',
      title: 'Find the Gap',
      html: `<p>Look at this sequence: <b>3, 7, 11, 15, 19</b>. It looks mysterious — until you check the gap between each pair of neighbours.</p>
<div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin:18px 0;">
  <span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">3</span><span class="slide-arrow">+4</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">7</span><span class="slide-arrow">+4</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">11</span><span class="slide-arrow">+4</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">15</span><span class="slide-arrow">+4</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">19</span>
</div>
<p>Every single jump is <b>+4</b>. That is the whole sequence, explained with one number. Once you know the jump, you know EVERYTHING about it — what comes next, what came before, even numbers far off in the distance.</p>`,
    },
    {
      type: 'talk',
      text: 'Here is my golden rule, and it works whichever way you are travelling — forwards, backwards, even into the murky negative swamp. <b>Find the jump between neighbours FIRST. The jump reveals everything.</b> Spot two neighbours, work out the jump, and the rest of the sequence practically writes itself.',
    },
    {
      type: 'try',
      q: {
        id: 'seq-try-1', topicId: 'sequences', tier: 1, format: 'mcq5',
        stem: 'Find the missing term: 3, 7, 11, <b>?</b>, 19',
        options: [
          { text: '15', misconception: null },
          { text: '11', misconception: 'no-jump' },
          { text: '19', misconception: 'wrong-position' },
          { text: '4', misconception: 'jump-as-answer' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Find the jump between neighbours first: what do you add to 3 to get 7?',
          'The jump is +4. So what is 11 + 4?',
        ],
        explain: {
          rule: 'Find the jump between neighbours FIRST. The jump reveals everything.',
          worked: 'The jump is +4 each time: 3, 7, 11, 15, 19. The missing term is 15.',
          whyWrong: {
            '11': 'That is just the term BEFORE the gap — you have to add the jump, not repeat it.',
            '19': 'That is the term AFTER the gap — you jumped one step too far.',
            '4': 'That is the jump itself, not a term in the sequence — add it to 11 to find the missing term.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Crossing the Zero Border',
      html: `<p>Sequences do not stop politely at zero — they just carry straight on jumping through it.</p>
<div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin:18px 0;">
  <span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">8</span><span class="slide-arrow">−3</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">5</span><span class="slide-arrow">−3</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--swamp-deep);color:var(--gold);font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">2</span><span class="slide-arrow">−3</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--stink);color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">−1</span><span class="slide-arrow">−3</span><span style="display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);background:var(--stink);color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;box-shadow:0 4px 0 rgba(0,0,0,.3);">−4</span>
</div>
<p>Same jump every time: <b>−3</b>. Notice the sequence does not skip zero, and it does not panic once the numbers turn negative. 2 − 3 = −1. −1 − 3 = −4. The jump does not care about the zero border — so neither should you.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'seq-try-2', topicId: 'sequences', tier: 2, format: 'mcq5',
        stem: 'Find the missing term: 8, 5, 2, <b>?</b>, −4',
        options: [
          { text: '−1', misconception: null },
          { text: '1', misconception: 'sign-slip' },
          { text: '2', misconception: 'no-jump' },
          { text: '−4', misconception: 'wrong-position' },
          { text: '3', misconception: 'jump-as-answer' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Find the jump between neighbours first: what happens each time you move along — 8 to 5, then 5 to 2?',
          'The jump is −3 each time. So what is 2 − 3? Careful — the answer crosses zero into negative numbers.',
        ],
        explain: {
          rule: 'Find the jump between neighbours FIRST. The jump reveals everything.',
          worked: 'The jump is −3 each time: 8, 5, 2, −1, −4. Crossing zero does not break the pattern — just keep subtracting 3. 2 − 3 = −1.',
          whyWrong: {
            '1': 'You found the right SIZE jump but forgot to cross into negative numbers — 2 − 3 goes past zero to −1, not up to 1.',
            '2': 'That just repeats the term before the gap — you still need to apply the jump.',
            '−4': 'That is the term AFTER the missing one — you jumped one step too far.',
            '3': 'That is the jump itself, not a term in the sequence.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Doubling, Halving, and Rules in Words',
      html: `<p>Not every jump is a plain add or subtract. Some sequences <b>double</b> each time (× 2): <b>3, 6, 12, 24…</b> — the jump keeps getting bigger! Others <b>halve</b> each time (÷ 2): <b>32, 16, 8, 4…</b> — always starting from an even number, so it stays a whole number all the way down.</p>
<p>Sometimes I will not even give you numbers — I will give you the rule in <b>words</b>: <i>"Start at 5, add 3 each time"</i>. That rule has TWO parts you must check: the <b>starting number</b> AND the <b>jump</b>. Get either one wrong and you have described a different sequence entirely.</p>
<p>Growing patterns work the exact same way. Look at these tile patterns:</p>
<div style="display:flex;gap:22px;justify-content:center;flex-wrap:wrap;margin:18px 0;">
  <div style="text-align:center;">
    <div style="font-weight:700;margin-bottom:6px;font-family:'Fredoka',sans-serif;">Pattern 1 (3)</div>
    <div style="display:flex;gap:3px;justify-content:center;flex-wrap:wrap;width:70px;">
      <span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span>
    </div>
  </div>
  <div style="text-align:center;">
    <div style="font-weight:700;margin-bottom:6px;font-family:'Fredoka',sans-serif;">Pattern 2 (5)</div>
    <div style="display:flex;gap:3px;justify-content:center;flex-wrap:wrap;width:70px;">
      <span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span>
    </div>
  </div>
  <div style="text-align:center;">
    <div style="font-weight:700;margin-bottom:6px;font-family:'Fredoka',sans-serif;">Pattern 3 (7)</div>
    <div style="display:flex;gap:3px;justify-content:center;flex-wrap:wrap;width:70px;">
      <span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span><span style="width:16px;height:16px;background:var(--swamp-deep);border-radius:3px;"></span>
    </div>
  </div>
</div>
<p>3, then 5, then 7 — the tile COUNT is a sequence too, jumping by +2 every time. Same Gap-o-Meter, brand new costume.</p>`,
    },
    {
      type: 'talk',
      text: 'Now here is where you become a true Sequel yourself. If I ask for the 30th term, please do not count all the way there on your fingers — far too slow, and slow heroes get farted on. Instead: work out how many JUMPS it takes to get from the 1st term to the 30th. That is <b>29 jumps, not 30</b> — the 1st term itself needs no jump at all. Start, then jump 29 times, and you will land exactly right.',
    },
    {
      type: 'try',
      q: {
        id: 'seq-try-3', topicId: 'sequences', tier: 3, format: 'num',
        stem: 'A sequence starts at <b>4</b> and jumps by <b>5</b> each time. What is the 8th term?',
        accept: ['39'],
        hintSteps: [
          'Do not list all 8 terms! Use the jump: how many JUMPS get you from the 1st term to the 8th term?',
          'That is 7 jumps (not 8 — the 1st term itself needs zero jumps). So work out 4 + (7 × 5).',
        ],
        explain: {
          rule: 'Find the jump between neighbours FIRST. The jump reveals everything.',
          worked: 'From the 1st term to the 8th term is 7 jumps (always one fewer than the term number). 4 + (7 × 5) = 4 + 35 = 39.',
          whyWrong: {},
        },
      },
    },
    { type: 'anim', anim: 'sequences' },
    { type: 'weapon' },
  ],

  tips: [
    'Find the jump between neighbours FIRST — the jump reveals everything, forwards or backwards.',
    'Sequences do not stop at zero. Keep applying the same jump straight through it — the pattern never panics.',
    'Finding the Nth term? Count the JUMPS, not the terms — the jump from the 1st term to the Nth term is always (N − 1) jumps.',
    'Doubling means × 2 each time. Halving means ÷ 2 each time — only ever done starting from an EVEN number, so the answer stays a whole number.',
    'A rule in words ("start at 5, add 3 each time") must match BOTH the starting number AND the jump — check both before you pick.',
    'If a question shows a gap in the middle, find two neighbouring terms you CAN see, work out the jump, then use it to fill the gap.',
    'Never just repeat a neighbour or copy another visible number as your answer — a sequence answer is always the result of applying the jump.',
  ],
};
