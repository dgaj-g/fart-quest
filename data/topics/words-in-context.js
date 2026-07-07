// FART QUEST topic: Synonym Springs — words-in-context (Storybog)
// Authored content — implementation agents: read, never modify.
// Passage-skill topic (passageSkill:'vocab'): battles draw tagged
// vocabulary-in-context questions from the shared passage pool
// (ENGINE_SPEC_2 §B/§D). No bank lives here — only the lesson's own
// mini-passage and its two 'try' questions.

const RULE = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';

export default {
  id: 'words-in-context',
  name: 'Synonym Springs',
  region: 'storybog',
  passageSkill: 'vocab',
  tagline: 'The dictionary meaning you know best is often a trap hiding in this very sentence.',

  creature: {
    id: 'synonym-sinead',
    name: 'Synonym Sinead',
    rarity: 'rare',
    image: 'assets/monsters/synonym-sinead.png',
    bio: "Sinead refuses to say any word twice — ask her the same question three times and you'll get three completely different words back. Whiffbeard adores her, even when he can't keep up.",
    factSneak: "A word can mean different things in different sentences — the only way to be sure is to swap your best guess INTO the exact sentence and check the whole thing still makes sense.",
  },

  weapon: {
    id: 'swap-in-tester',
    name: 'The Swap-In Tester',
    tagline: 'Never trust the first meaning that pops into your head — test it first.',
    rule: RULE,
    example: 'Line 6 says the pain was "sharp" — swap in "clever" and you get "a clever pain", which is nonsense; swap in "sudden and intense" and the whole sentence snaps into place.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-wordsincontext',
      text: "Ah, my brave nose-soldier, meet Synonym Sinead — she will not say the same word twice if her life depended on it! She's here to teach you the trickiest question in the whole Storybog: what does THIS word mean, right HERE, in THIS sentence? Careful — the meaning you already know best is very often a trap.",
    },
    {
      type: 'show',
      title: 'The Swap-In Tester',
      html: `<p>Here's the whole secret. The word <b>sharp</b> has more than one meaning. Look at these two sentences:</p>
<p>1. "The chef's knife was very <b>sharp</b>."<br>2. "Aoife felt a <b>sharp</b> pain in her ankle."</p>
<p>In sentence 1, sharp means <i>good at cutting</i>. Try swapping that meaning into sentence 2: "Aoife felt a <i>good-at-cutting</i> pain" — that's nonsense! Now try <i>sudden and intense</i>: "Aoife felt a <i>sudden and intense</i> pain" — that fits perfectly.</p>
<p>That's the whole trick: <b>swap each meaning INTO the sentence and read the whole thing aloud.</b> Only the meaning that survives the swap is the true one.</p>`,
    },
    {
      type: 'talk',
      text: "Right — enough knives and ankles. Time for a fresh case file of your own. Read it through once, calm and slow, and keep your Swap-In Tester ready.",
    },
    {
      type: 'show',
      title: 'The Volcano Disaster',
      html: `<ol class="mini-passage">
<li>Jarlath's little sister, Nuala, was convinced her volcano project would win first prize.</li>
<li>She had spent three whole evenings mixing vinegar, baking soda and red food colouring.</li>
<li>On the morning of the fair, she carried the model gently across the school hall.</li>
<li>Just as she set it down, her elbow clipped a table and the volcano toppled to the floor.</li>
<li>Nuala stared at the shattered pieces, her face suddenly pale and rigid.</li>
<li>"It's ruined," she whispered, and her bottom lip began to tremble.</li>
<li>Mr Doyle knelt beside her and gathered the broken pieces into a box.</li>
<li>"A real scientist never gives up after one setback," he said gently.</li>
<li>By lunchtime, Nuala had rebuilt the volcano, tougher and taller than before.</li>
<li>When it finally erupted at the judging table, the whole hall erupted in applause too.</li>
</ol>
<p>Ten lines. Keep this case file in your head — Sinead is about to test two words hiding inside it.</p>`,
    },
    {
      type: 'show',
      title: 'Swap-Testing "rigid"',
      html: `<p>Look at <b>line 5</b>: "Nuala stared at the shattered pieces, her <b>face</b> suddenly pale and <b>rigid</b>."</p>
<p>Your brain might jump straight to the meaning you know best — "rigid" as in <i>rigid rules</i>, meaning <i>strict, won't bend</i>. Swap that in: "her face suddenly pale and <i>strict</i>" — that makes no sense at all, a face can't be strict!</p>
<p>Now try <i>stiff and frozen, as if she couldn't move</i>: "her face suddenly pale and <i>stiff, unmoving with shock</i>" — that survives the swap perfectly, because it matches a face gone still with horror at watching her project smash.</p>
<div class="law-scroll">📜 <b>THE SWAP-IN LAW:</b> ${RULE}</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'wic-try-1', topicId: 'words-in-context', tier: 1, format: 'mcq5',
        lineRef: '5',
        stem: 'As used in <b>line 5</b>, what does the word <b>rigid</b> mean?',
        options: [
          { text: 'Stiff and frozen, as if she could not move', misconception: null },
          { text: 'Strict and unwilling to break any rules', misconception: 'dictionary-meaning-trap' },
          { text: 'Cheerful and full of energy', misconception: 'opposite-bait' },
          { text: 'Loudly crying and shouting', misconception: 'clearly-wrong' },
          { text: 'Sunburnt from standing in the hall', misconception: 'clearly-wrong' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Swap each option INTO line 5 in place of "rigid" and read the whole sentence aloud — most of them will sound like nonsense.',
          '"Rigid" often means strict about rules — but a FACE can\'t follow rules. What happens to a face frozen still with shock?',
        ],
        explain: {
          rule: RULE,
          worked: 'Swap "strict" into line 5 and you get "her face suddenly pale and strict" — nonsense, because faces don\'t follow rules. Swap in "stiff and frozen, as if she could not move" and the sentence survives: a pale, frozen face is exactly what shock looks like right after watching her volcano smash.',
          whyWrong: {
            'Strict and unwilling to break any rules': 'That is a real meaning of "rigid" — just not this one! It fits "rigid rules", not a shocked face. Swapped in here, it makes nonsense.',
            'Cheerful and full of energy': 'The opposite of what line 5 describes — Nuala has just watched her project smash, not something to feel cheerful about.',
            'Loudly crying and shouting': 'Line 6 shows her lip only beginning to tremble — she has not yet cried out loud, so this does not survive the swap.',
            'Sunburnt from standing in the hall': 'Nothing in the passage mentions sun or heat at all — this meaning is not in the text anywhere.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Swap-Testing "setback"',
      html: `<p>Now look at <b>line 8</b>: "'A real scientist never gives up after one <b>setback</b>,' he said gently."</p>
<p>Split the word and you might guess it's some kind of object — "a set" plus "back", like a chair pushed back? Swap that in: "never gives up after one <i>chair</i>" — nonsense.</p>
<p>The broken pieces from line 4 might tempt you towards "a piece of broken equipment" — swap that in: "never gives up after one <i>piece of broken equipment</i>" — closer, but Mr Doyle is comforting her about the WHOLE situation, not just the pieces.</p>
<p>Try <i>a problem or difficulty that gets in your way</i>: "never gives up after one <i>problem that gets in your way</i>" — that survives! It fits a scientist facing any setback at all, not only a smashed volcano.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'wic-try-2', topicId: 'words-in-context', tier: 2, format: 'mcq5',
        lineRef: '8',
        stem: 'As used in <b>line 8</b>, what does the word <b>setback</b> mean?',
        options: [
          { text: 'A problem or difficulty that gets in your way', misconception: null },
          { text: 'A piece of broken equipment', misconception: 'dictionary-meaning-trap' },
          { text: 'A brilliant new discovery', misconception: 'opposite-bait' },
          { text: 'A type of chair used in science labs', misconception: 'clearly-wrong' },
          { text: 'A prize awarded for trying hard', misconception: 'clearly-wrong' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Swap each option INTO line 8 in place of "setback" and read Mr Doyle\'s whole sentence aloud.',
          'Mr Doyle is comforting Nuala about scientists in general, not just about her broken pieces — what word fits ANY difficulty a scientist might hit?',
        ],
        explain: {
          rule: RULE,
          worked: 'Swap "a piece of broken equipment" into line 8: "never gives up after one piece of broken equipment" — too narrow, since Mr Doyle is making a general point about scientists, not only about the volcano. Swap in "a problem or difficulty that gets in your way" and it survives perfectly, because that fits any setback a real scientist might face, smashed volcano or not.',
          whyWrong: {
            'A piece of broken equipment': 'This is tempting because pieces ARE broken in line 4 — but Mr Doyle is talking about setbacks scientists face in general, not naming the broken pieces themselves.',
            'A brilliant new discovery': 'The opposite of what a setback is — Mr Doyle is comforting Nuala about something going badly, not celebrating a discovery.',
            'A type of chair used in science labs': 'Splitting the word into "set" and "back" gives a false clue — swapped into the sentence it produces total nonsense.',
            'A prize awarded for trying hard': 'Nothing in line 8 mentions any prize — Mr Doyle is talking about facing difficulty, not receiving a reward.',
          },
        },
      },
    },
    {
      type: 'talk',
      text: "You've got it! Every single time a question asks what a word means IN THIS LINE, resist the meaning you already know best — swap your best guess right into the sentence, read the whole thing aloud, and trust only the one that survives. That's the Swap-In Tester, and Sinead has never once been caught out by it.",
    },
    { type: 'weapon' },
  ],

  tips: [
    'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.',
    'The meaning you already know best for a word is often a trap — the sentence may be using a different, less common meaning.',
    'Never answer from the word alone — always check it against the WHOLE sentence it sits in.',
    'A distractor that repeats a detail from a nearby line (like broken pieces) can feel right but still not survive the swap test — check the exact line again.',
    'If an option is the OPPOSITE of the feeling or idea in the sentence, it can never be the answer, however tempting it looks.',
    'Splitting a long word into smaller chunks (like "set" + "back") can trick you into a false guess — always test the whole word\'s meaning in context, not its parts.',
  ],
};
