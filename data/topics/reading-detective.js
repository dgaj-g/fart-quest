// FART QUEST topic: The Clue Shallows — reading-detective (Storybog)
// Authored content — implementation agents: read, never modify.
// Passage-skill topic: no bank here. Battles draw tagged questions from the
// shared passage pool (ENGINE_SPEC_2 §B/§D, skill:'lit'). This file only
// teaches the skill against a fresh mini-passage authored below.

const RULE = 'The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm\'s reach.';

export default {
  id: 'reading-detective',
  name: 'The Clue Shallows',
  region: 'storybog',
  passageSkill: 'lit',
  tagline: 'Every answer is already written down. Your job is just to go and find it.',

  creature: {
    id: 'inspector-sniff',
    name: 'Inspector Sniff',
    rarity: 'rare',
    image: 'assets/monsters/inspector-sniff.png',
    bio: "Inspector Sniff has the biggest nose in the Shallows and refuses to guess anything. Give him a line number and he will march straight there, sniff once, and return with the exact answer word for word.",
    factSneak: 'A literal question always has its answer sitting in the text at (or right by) the line number you\'re given — find the line, read it carefully, and the answer is within arm\'s reach.',
  },

  weapon: {
    id: 'line-number-lasso',
    name: 'The Line-Number Lasso',
    tagline: 'Never hunt the whole page when you\'ve been handed the exact spot.',
    rule: RULE,
    example: 'The question says "according to line 12" — so you lasso line 12, read ONLY that line, and the answer is sitting right there waiting.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-readdet',
      text: "Sniff, sniff, SNIFF! Gather round, my brave nose-soldier — I am training you up as my finest Clue Shallows detective. Here is the secret most children never learn: a LITERAL question — a \"find the fact\" question — is NOT a puzzle. The answer is already written down, in black and white, waiting for you. Your only job is to go and find the exact spot.",
    },
    {
      type: 'show',
      title: 'The Case File',
      html: `<p>Every detective needs a crime scene. Here is yours. Read it through once, calm and slow, like Inspector Sniff would.</p>
<ol class="mini-passage">
<li>On Tuesday morning, Priya arrived at school before anyone else.</li>
<li>She wanted to check the trophy cabinet in the main hall.</li>
<li>The silver football trophy had vanished since Friday's assembly.</li>
<li>Mr Adeyemi, the caretaker, said he had locked the hall himself.</li>
<li>Priya noticed the side door was propped open with a brick.</li>
<li>Muddy footprints led from the door towards the sports store.</li>
<li>Inside the store, she found the trophy wrapped in a spare kit bag.</li>
<li>A note beside it read: "Sorry, I just wanted to polish it!"</li>
<li>The note was signed by Callum, the team captain, in blue pen.</li>
</ol>
<p>Nine lines. Nine clues. Keep this case file in your head — every question from here on points STRAIGHT at one of these lines.</p>`,
    },
    {
      type: 'talk',
      text: "Here is my golden law, and it will win you marks for the rest of your life: <b>the line number is a GIFT.</b> The examiner is not trying to trick you — they are practically drawing an arrow at the answer! When you see \"according to line 4\" or \"look at lines 5-6\", that is Inspector Sniff telling you exactly where to point your enormous nose.",
    },
    {
      type: 'show',
      title: 'Watch Me Work the Case',
      html: `<p>Let's try one together. Question: <b>"According to line 3, what had gone missing?"</b></p>
<p>Do NOT think back to what you remember. Go BACK to line 3, put your finger on it, and read only that line:</p>
<div class="law-scroll">📜 Line 3: "The silver football trophy had vanished since Friday's assembly."</div>
<p>The answer is right there, word for word: <b>the silver football trophy</b>. No guessing, no remembering — just finger-on-the-line, read, answer. That is the whole trick.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'rd-try-1', topicId: 'reading-detective', tier: 1, format: 'mcq5',
        stem: 'According to <b>line 4</b>, who said he had locked the hall himself?',
        options: [
          { text: 'Mr Adeyemi', misconception: null },
          { text: 'Priya', misconception: 'wrong-line-swap' },
          { text: 'Callum', misconception: 'wrong-character' },
          { text: 'The head teacher', misconception: 'not-in-passage' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Don\'t guess from memory — go BACK to line 4 and put your finger right on it.',
          'Line 4 names one person and tells you exactly what he said. Read only that line.',
        ],
        explain: {
          rule: RULE,
          worked: 'Line 4 says: "Mr Adeyemi, the caretaker, said he had locked the hall himself." The answer is sitting there word for word — Mr Adeyemi.',
          whyWrong: {
            'Priya': 'Priya is the detective in this story — she asks the questions, she doesn\'t lock the hall. Check line 4 again.',
            'Callum': 'Callum only turns up later, signing the note — he isn\'t mentioned anywhere near line 4.',
            'The head teacher': 'No head teacher is mentioned anywhere in the case file — that name was never written down.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Two-Line Trap',
      html: `<p>Sometimes the exam gives you a RANGE, like "lines 5-6". That just means walk BOTH lines with your finger before you answer — the clue might be split across them.</p>
<p>And watch for this sneaky trick: decoy answers often borrow real WORDS from a completely different line, just to feel familiar. Look at line 5: "Priya noticed the side door was propped open with a brick." and line 6: "Muddy footprints led from the door towards the sports store." A trickster might offer "the side door" as an answer to a question about where the footprints LED — but that's where they started, not where they went! Always check the exact line, not just a word that rings a bell.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'rd-try-2', topicId: 'reading-detective', tier: 1, format: 'mcq5',
        stem: 'Look at <b>line 6</b>. Where did the muddy footprints lead?',
        options: [
          { text: 'Towards the sports store', misconception: null },
          { text: 'Towards the side door', misconception: 'wrong-direction' },
          { text: 'Towards the trophy cabinet', misconception: 'wrong-line-swap' },
          { text: 'Towards the main hall', misconception: 'wrong-line-swap' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Go BACK to line 6 and put your finger on it — ignore what you remember from earlier lines.',
          'Line 6 tells you where the footprints were headed, not where the story started. Read it exactly.',
        ],
        explain: {
          rule: RULE,
          worked: 'Line 6 says: "Muddy footprints led from the door towards the sports store." They led TOWARDS the sports store — that\'s the exact answer, straight off the line.',
          whyWrong: {
            'Towards the side door': 'That\'s where the footprints started FROM, in the same line — a classic near-miss for anyone skimming instead of reading carefully.',
            'Towards the trophy cabinet': 'That\'s from line 2, a completely different part of the case file.',
            'Towards the main hall': 'The main hall is mentioned right at the start, in line 2 — not in line 6.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: "You see it now, don't you? Every single time: find the line, put your finger on it, read ONLY those words, answer. Never invent, never remember, never skim past the exact spot. Inspector Sniff has never once been fooled doing it this way — and now, neither will you.",
    },
    { type: 'anim', anim: 'reading-detective' },
    { type: 'weapon' },
  ],

  tips: [
    'The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm\'s reach.',
    'Never answer from memory. Even if you\'re SURE you remember, check the exact line before you commit.',
    'A range like "lines 5-6" means the clue may be split — walk both lines with your finger.',
    'Decoy answers often borrow real words from a DIFFERENT line just to sound familiar — match the whole idea, not just one word.',
    'Read the named line slowly and word for word before choosing — the answer is usually a close copy of what\'s written, not a guess.',
    'If a question doesn\'t give a line number, it\'s asking about the WHOLE text — that\'s rare, so treat every line number you\'re given as precious.',
  ],
};
