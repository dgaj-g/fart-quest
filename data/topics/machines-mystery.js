// FART QUEST topic: The Mystery Machine Bog (Number Swamp)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'machines-mystery',
  name: 'The Mystery Machine Bog',
  region: 'number-swamp',
  genId: 'machines',
  tagline: 'Where every machine has been wired in backwards… on purpose, Bertha insists.',

  creature: {
    id: 'backwards-bertha',
    name: 'Backwards Bertha',
    rarity: 'rare',
    image: 'assets/monsters/backwards-bertha.png',
    bio: 'Bertha built the finest number machine in the whole bog — then wired it in backwards by accident, and refuses to admit it. Feed her a number OUT and she’ll always hand you back the IN, undoing every step with its opposite, last step first.',
    factSneak: 'To find what went IN, run the machine BACKWARDS: undo each step with its opposite — and undo the LAST step first.',
  },

  weapon: {
    id: 'reverse-lever',
    name: 'The Reverse Lever',
    tagline: 'Pull it, and any machine spits out its secrets.',
    rule: 'To find what went IN, run the machine BACKWARDS: undo each step with its opposite.',
    example: 'A machine does +3 then ×2. It spat out 16. Reverse: undo ×2 first (16 ÷ 2 = 8), then undo +3 (8 − 3 = 5). IN was <b>5</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-machines',
      text: 'Ahoy, my brilliant bog-brained hero! Somewhere in these murky waters lurks Backwards Bertha — she built the finest number machine in the whole Swamp, wired it completely back-to-front, and now insists that’s how it was ALWAYS meant to work. Today you learn how her machines work forwards… and, far more usefully, how to run them BACKWARDS.',
    },
    {
      type: 'show',
      title: 'What is a number machine?',
      html: `<p>A number machine takes a number <b>IN</b>, does something to it, and spits a number <b>OUT</b>. Simple as that.</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">IN</div><div class="pv-cell">6</div></div>
  <div class="pv-col"><div class="pv-head">RULE</div><div class="pv-cell">× 4</div></div>
  <div class="pv-col"><div class="pv-head">OUT</div><div class="pv-cell">24</div></div>
</div>
<p>Some machines have <b>TWO jobs</b>, and they always do them <b>in order</b> — first one, then the other. Feed in 5, and this machine adds 3 FIRST, then multiplies by 2 SECOND:</p>
<div class="pv-grid">
  <div class="pv-col"><div class="pv-head">IN</div><div class="pv-cell">5</div></div>
  <div class="pv-col"><div class="pv-head">STEP 1<br>+ 3</div><div class="pv-cell">8</div></div>
  <div class="pv-col"><div class="pv-head">STEP 2<br>× 2</div><div class="pv-cell">16</div></div>
  <div class="pv-col"><div class="pv-head">OUT</div><div class="pv-cell">16</div></div>
</div>
<p>Notice the ORDER matters enormously — “+3 then ×2” is a completely different machine to “×2 then +3”!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mach-try-1', topicId: 'machines-mystery', tier: 1, format: 'mcq5',
        stem: 'A machine <b>adds 8</b> to any number. IN = <b>15</b>. What is OUT?',
        options: [
          { text: '23', misconception: null },
          { text: '7', misconception: 'wrong-op' },
          { text: '15', misconception: 'no-op' },
          { text: '24', misconception: 'off-by-one' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The rule is + 8. Apply it to the IN number.',
          '15 + 8 = …?',
        ],
        explain: {
          rule: 'To find what went IN, run the machine BACKWARDS: undo each step with its opposite.',
          worked: 'IN = 15. The machine adds 8: 15 + 8 = 23. OUT = 23.',
          whyWrong: {
            '7': 'That’s 15 − 8 — the OPPOSITE operation. This machine is running forwards, so it ADDS.',
            '15': 'The machine DID do something to the number — it never just passes it through unchanged.',
            '24': 'So close! Recount carefully — that answer is only one out.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: 'Here’s Bertha’s dark secret: she runs EVERY machine backwards. Feed her an OUT and she’ll hand you back the IN — if you know her one golden trick. To undo a step you must do the <b>OPPOSITE</b>: undo + with −, undo × with ÷. And if the machine has TWO steps, you must undo the <b>LAST one FIRST</b>. Order flips completely when you reverse!',
    },
    {
      type: 'show',
      title: 'Running the machine backwards',
      html: `<div class="law-scroll">📜 <b>THE REVERSE LEVER:</b> To find what went IN, run the machine BACKWARDS — undo each step with its opposite.</div>
<p>Take that two-step machine from before: <b>+3 then ×2</b>. It ate a number and spat out <b>16</b>. To find what went IN, pull the Reverse Lever and undo the steps in <b>REVERSE ORDER</b>:</p>
<div class="estimate-demo">
  <div class="est-line">OUT = 16 <span class="est-note">undo STEP 2 first (÷ 2)</span></div>
  <div class="est-line">↓</div>
  <div class="est-line">16 ÷ 2 = 8 <span class="est-note">undo STEP 1 next (− 3)</span></div>
  <div class="est-line">↓</div>
  <div class="est-line"><b>8 − 3 = 5</b> <span class="est-note">that’s the IN!</span></div>
</div>
<p>Check it: 5 + 3 = 8, then 8 × 2 = 16. It works! Forget to flip the order — undo the +3 first instead — and you’ll land on completely the wrong number.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mach-try-2', topicId: 'machines-mystery', tier: 2, format: 'mcq5',
        stem: 'A machine <b>multiplies by 5</b>. It spat out <b>35</b>. What went IN?',
        options: [
          { text: '7', misconception: null },
          { text: '175', misconception: 'not-inverted' },
          { text: '30', misconception: 'wrong-op' },
          { text: '8', misconception: 'off-by-one' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The machine’s rule is × 5 — to undo it, use the OPPOSITE: ÷ 5.',
          '35 ÷ 5 = …?',
        ],
        explain: {
          rule: 'To find what went IN, run the machine BACKWARDS: undo each step with its opposite.',
          worked: '35 ÷ 5 = 7. Check: 7 × 5 = 35. ✓',
          whyWrong: {
            '175': 'That applies the SAME operation again (35 × 5) — to reverse a machine you must use the OPPOSITE operation.',
            '30': 'That’s 35 − 5 — the wrong operation entirely. This machine multiplies, so undo it with ÷.',
            '8': 'So close! Recount carefully — that answer is only one out.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Letters are just numbers wearing disguises',
      html: `<p>Sometimes the mystery IN number gets dressed up as a <b>letter</b> instead of a blank space. It’s still just a machine wearing a mask — the exact same rules apply!</p>
<p><b>a + 6 = 24</b> is a one-step machine in disguise: some number (<b>a</b>) had 6 added, and out popped 24. Pull the Reverse Lever: undo + 6 with − 6. So <b>a</b> = 24 − 6 = <b>18</b>.</p>
<p>It works no matter which operation the machine used. <b>b × 4 = 32</b> is still just a one-step machine wearing a mask — pull the Reverse Lever and undo × 4 with ÷ 4: <b>b</b> = 32 ÷ 4 = <b>8</b>.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'mach-try-3', topicId: 'machines-mystery', tier: 2, format: 'mcq5',
        stem: 'The letter <b>a</b> is a machine wearing a disguise: <b>a + 12 = 27</b>. What is <b>a</b>?',
        options: [
          { text: '15', misconception: null },
          { text: '27', misconception: 'copied-total' },
          { text: '39', misconception: 'wrong-direction' },
          { text: '12', misconception: 'used-constant' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Undo the step using its OPPOSITE. “+ 12” undoes with “− 12”.',
          '27 − 12 = …?',
        ],
        explain: {
          rule: 'To find what went IN, run the machine BACKWARDS: undo each step with its opposite.',
          worked: '27 − 12 = 15. Check: 15 + 12 = 27. ✓',
          whyWrong: {
            '27': 'That’s just the total copied straight across — you still need to undo the step to find a.',
            '39': 'That adds 12 again instead of undoing it — the opposite of + 12 is − 12.',
            '12': 'That’s the machine’s own number from the rule, not the letter’s value — solve the equation to find a.',
          },
        },
      },
    },
    { type: 'anim', anim: 'machines-mystery' },
    { type: 'weapon' },
  ],

  tips: [
    'To undo a machine, always use the OPPOSITE operation: + undoes with −, × undoes with ÷ — never the same operation twice.',
    'A two-step machine reverses in the OPPOSITE ORDER too — undo the LAST step first, then the first step.',
    'Letters are just numbers in disguise. “a + 12 = 27” is a one-step machine — solve it exactly like any other reverse machine: a = 27 − 12.',
    'Never mistake the machine’s own number for the letter’s value — in “a + 12 = 27”, the answer is 15, NOT 12.',
    'A three-step machine reverses in the OPPOSITE ORDER too — undo the LAST step first, then the middle step, then the first step.',
    'Always check your answer by running it back through the ORIGINAL forward machine — if it doesn’t produce the OUT you were given, undo it again.',
    'Watch the wording: “multiplies by” and “divides by” undo each other; “adds” and “takes away” undo each other.',
  ],
};
