// FART QUEST passage: The Lantern on Gull Island (prose fiction — adventure w/ light mystery, closed ending)
// Authored content — implementation agents: read, never modify.
// Weapon rules below are copied VERBATIM from data/topics/{reading-detective,
// between-lines,words-in-context,writers-tricks,parts-of-speech}.js so that
// explain.rule matches the exact wording taught in each skill's lesson.

const RULE_LIT = "The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm's reach.";
const RULE_INF = "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'.";
const RULE_VOCAB = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';
const RULE_LANG_SIMILE = "A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.";
const RULE_LANG_POS = 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.';

export default {
  id: 'passage-fiction-1',
  title: 'The Lantern on Gull Island',
  genre: 'fiction',
  lines: [
    'Mia pressed her nose against the ferry window.',
    'Salthaven appeared slowly: grey roofs, a harbour, gulls wheeling.',
    'Her cousin Ben waved from the little wooden jetty.',
    'Nana Colette wrapped them both in a huge hug.',
    '“Two weeks of summer,” she said, “starting with chips.”',
    "That night, Mia couldn't sleep because of a strange light.",
    'Far past the harbour sat Gull Island, dark and jagged.',
    'Every few minutes, a small yellow lantern blinked on and off.',
    '“Nobody lives there,” Ben whispered, pressed to the glass.',
    '“That island\'s been empty for thirty years,” said Nana.',
    '“Empty since the lighthouse closed,” she added, buttering toast.',
    "Mia frowned. Empty islands don't usually blink lanterns at midnight.",
    'She nudged Ben under the table. “Let\'s go look.”',
    'Ben grinned, reaching for the last piece of toast.',
    'Nana agreed, so long as Fergus rowed them across.',
    'Fergus ran the harbour boats and knew every rock.',
    "The rowing boat bumped against Gull Island's stone jetty.",
    'Waves slapped the rocks like impatient hands knocking on a door.',
    'Fergus tied the rope and promised to return by four.',
    'Gull Island smelled of salt, seaweed, and something faintly fishy.',
    'They found a small stone hut, its door padlocked.',
    'Muddy boot prints led from the jetty to the door.',
    'Beside the hut lay a single soft grey feather.',
    'Ben spotted a leather notebook wedged beneath a stone on the windowsill.',
    'Inside were rows of numbers, dates, and strange bird names.',
    '“Kittiwakes,” Mia read aloud. “Forty-two pairs. Nest six: three eggs.”',
    'Someone was counting birds here, carefully, over many quiet nights.',
    'But who would row to a lonely island in darkness?',
    'Mia decided they would find out, that very evening.',
    "Fergus rowed them back across, and they hid behind the island's sea wall.",
    'They crouched as the sky faded from pink to black.',
    "Around nine o'clock, a rowing boat cut through the waves.",
    'A figure climbed out, hung a lantern, and unlocked the hut.',
    'Mia gasped. It was Mr Pemberton, the retired lighthouse keeper!',
    "Ben's torch clicked on by accident, and the man jumped.",
    '“Steady on!” he chuckled. “You nearly startled this sailor.”',
    'He counted nesting kittiwakes for the wildlife trust every year.',
    'He only visited at night, once the parent birds had settled.',
    'Daytime visits, he explained, could scare nervous birds off their nests.',
    'The lantern helped him read his notebook in the dark.',
    'Mia felt silly for imagining smugglers, ghosts, or buried treasure.',
    'The real answer was kinder, and somehow even more wonderful.',
    'Mr Pemberton offered them a job as junior kittiwake counters.',
    'Ben punched the air and nearly toppled off the wall.',
    'The next night, all three counted nests by lantern light.',
    'Forty-four pairs now, Mia wrote carefully, plus six fluffy chicks.',
    "Gull Island wasn't empty at all: it was full of secrets.",
    'And happily, Mia and Ben now knew every single secret.',
  ],

  questions: [
    // ---- Q1-Q3: literal (lit) ----
    {
      id: 'passage-fiction-1-q1', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '4',
      stem: 'According to <b>line 4</b>, who wrapped Mia and Ben in a huge hug?',
      options: [
        { text: 'Nana Colette', misconception: null },
        { text: 'Ben', misconception: 'wrong-character' },
        { text: 'Old Fergus', misconception: 'wrong-character' },
        { text: 'Mr Pemberton', misconception: 'wrong-character' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Don't guess from memory — go BACK to line 4 and put your finger right on it.",
        'One person greets the children with a hug — who is named in that exact line?',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 4 says: "Nana Colette wrapped them both in a huge hug." The answer is right there, word for word: Nana Colette.',
        whyWrong: {
          Ben: 'Ben is one of the children being hugged, not the person doing the hugging.',
          'Old Fergus': "Fergus doesn't appear until much later, when he rows the boat.",
          'Mr Pemberton': "Mr Pemberton isn't mentioned until line 34, far later in the story.",
        },
      },
    },
    {
      id: 'passage-fiction-1-q2', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '20',
      stem: 'According to <b>line 20</b>, apart from salt and seaweed, what did Gull Island smell of?',
      options: [
        { text: 'Something faintly fishy', misconception: null },
        { text: 'Fresh paint', misconception: 'not-in-text' },
        { text: 'Woodsmoke', misconception: 'not-in-text' },
        { text: 'Nothing at all', misconception: 'contradicts-text' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Find line 20 and read it word for word.',
        'The line lists three smells — salt, seaweed, and one more.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 20 says: "Gull Island smelled of salt, seaweed, and something faintly fishy." The third smell is right there: something faintly fishy.',
        whyWrong: {
          'Fresh paint': 'Paint is never mentioned anywhere in the passage.',
          Woodsmoke: "Woodsmoke isn't mentioned in line 20 or anywhere else.",
          'Nothing at all': "Line 20 clearly lists three smells, so the island wasn't smell-free.",
        },
      },
    },
    {
      id: 'passage-fiction-1-q3', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '34',
      stem: 'According to <b>line 34</b>, who turned out to be rowing out to Gull Island each night?',
      options: [
        { text: 'Mr Pemberton, the retired lighthouse keeper', misconception: null },
        { text: 'Old Fergus', misconception: 'wrong-character' },
        { text: 'A smuggler from the mainland', misconception: 'not-in-text' },
        { text: 'Nana Colette', misconception: 'wrong-character' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Go back to line 34 and read exactly who is named.',
        'The children finally see a face they recognise from the village.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 34 says: "Mia gasped. It was Mr Pemberton, the retired lighthouse keeper!" The mystery visitor is named exactly there.',
        whyWrong: {
          'Old Fergus': "Fergus rowed the children TO the island earlier — he isn't the mystery visitor.",
          'A smuggler from the mainland': "No smuggler ever appears in the story; that was only Mia's guess.",
          'Nana Colette': 'Nana stays at home — she never visits Gull Island in the story.',
        },
      },
    },
    // ---- Q4-Q5: inference (inf) ----
    {
      id: 'passage-fiction-1-q4', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '38-39',
      stem: 'Reading <b>lines 38-39</b>, why did Mr Pemberton choose to visit the island only at night?',
      options: [
        { text: 'Visiting in daytime could scare the nesting birds off their nests', misconception: null },
        { text: 'He was simply too busy with other jobs during the day', misconception: 'plausible-misreading' },
        { text: 'Birds are never awake or active at night', misconception: 'absolute-language' },
        { text: 'His lantern only worked properly after dark', misconception: 'not-in-text' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Read both lines together, not just one — the reason is split across them.",
        'Line 38 says he waited until the birds had settled; line 39 explains what daytime visits could do.',
      ],
      explain: {
        rule: RULE_INF,
        worked: 'Line 38 says he only visited once the parent birds had settled, and line 39 explains that daytime visits could scare nervous birds off their nests. Adding those clues up: he visits at night so he will not frighten the birds away from their nests.',
        whyWrong: {
          'He was simply too busy with other jobs during the day': "Nothing in the passage mentions Mr Pemberton having other daytime jobs — this is never stated.",
          'Birds are never awake or active at night': "That's too extreme, and it isn't what the text says — the birds are described as \"settled\", not permanently asleep.",
          'His lantern only worked properly after dark': 'The lantern is only ever described as a way to read his notebook, never as broken in daylight.',
        },
      },
    },
    {
      id: 'passage-fiction-1-q5', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '12',
      stem: 'What does <b>line 12</b>, "Mia frowned. Empty islands don\'t usually blink lanterns at midnight," suggest about Mia?',
      options: [
        { text: "She notices things that don't make sense and wants to find out why", misconception: null },
        { text: 'She is frightened of the empty island and wants to leave Salthaven', misconception: 'plausible-misreading' },
        { text: 'She always solves every mystery in the village', misconception: 'absolute-language' },
        { text: "She doesn't believe her Nana is telling her the truth", misconception: 'not-in-text' },
      ],
      correctIndex: 0,
      hintSteps: [
        "A frown here isn't about fear — think about what usually makes someone frown when something is odd.",
        'She spots that a detail (a blinking lantern) does not fit with what she has been told (the island is empty).',
      ],
      explain: {
        rule: RULE_INF,
        worked: 'Mia frowns and points out that empty islands do not usually have blinking lanterns — she is noticing a detail that does not add up, which shows she is curious and observant, not scared or disbelieving.',
        whyWrong: {
          'She is frightened of the empty island and wants to leave Salthaven': 'Nothing in the passage shows fear — moments later she is the one who insists on investigating.',
          'She always solves every mystery in the village': 'This is only the first mystery we see her solve — the passage never says "always" or "every".',
          "She doesn't believe her Nana is telling her the truth": 'Mia is puzzled by a detail, but she never accuses Nana of lying.',
        },
      },
    },
    // ---- Q6: vocab-in-context ----
    {
      id: 'passage-fiction-1-q6', tier: 2, format: 'mcq5', skill: 'vocab', lineRef: '38',
      stem: 'In <b>line 38</b>, "once the parent birds had settled", what does <b>settled</b> mean here?',
      options: [
        { text: 'Became calm and still for the night', misconception: null },
        { text: 'Sat down on a chair', misconception: 'wrong-sense' },
        { text: 'Agreed on a price', misconception: 'wrong-sense' },
        { text: 'Moved to a new home permanently', misconception: 'wrong-sense' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Swap each option INTO the sentence and read it aloud — only one makes sense for birds on a cliff at night.',
        'Think about what parent birds do on their nests once evening comes.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: '"Once the parent birds had become calm and still for the night" makes sense for birds settling on their nests at dusk — the other meanings of "settled" (sitting, agreeing a price, moving house) do not fit birds at all.',
        whyWrong: {
          'Sat down on a chair': "Birds don't use chairs — that meaning of \"settled\" belongs to people, not nesting birds.",
          'Agreed on a price': 'This is the meaning of "settled a bill", not what happens to nesting birds.',
          'Moved to a new home permanently': 'This would mean the birds left for good — but they nest on the island every year.',
        },
      },
    },
    // ---- Q7: language feature ----
    {
      id: 'passage-fiction-1-q7', tier: 2, format: 'mcq5', skill: 'lang', lineRef: '18',
      stem: 'Which language technique is used in <b>line 18</b>, "Waves slapped the rocks like impatient hands knocking on a door"?',
      options: [
        { text: 'Simile', misconception: null },
        { text: 'Metaphor', misconception: 'confused-technique' },
        { text: 'List', misconception: 'confused-technique' },
        { text: 'It tells us exactly how many times the waves hit the rocks', misconception: 'clearly-wrong' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Look for the small joining word that compares two things.',
        'A simile compares using "like" or "as" — spot it in the line.',
      ],
      explain: {
        rule: RULE_LANG_SIMILE,
        worked: 'The waves are compared to "impatient hands knocking on a door" using the word "like" — that comparison word makes it a simile, not a metaphor (which would say the waves WERE hands).',
        whyWrong: {
          Metaphor: 'A metaphor would say the waves WERE hands, with no "like" — but the line uses "like" to compare them.',
          List: 'A list piles up three or more things in a row to overwhelm you — this line makes just one single comparison, not a pile of items.',
          'It tells us exactly how many times the waves hit the rocks': 'No count of wave-strikes is given anywhere in this line — it\'s about how the waves sound and feel, not a number.',
        },
      },
    },
    // ---- Q8-Q13: wordentry ----
    {
      id: 'passage-fiction-1-q8', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '23',
      stem: 'Copy the exact four-word phrase from <b>line 23</b> that describes the feather Ben found beside the hut.',
      hint: 'copy the exact phrase (4 words)', maxLen: 40, exact: true,
      accept: ['single soft grey feather', 'Single soft grey feather'],
      hintSteps: [
        'Go back to line 23 and read it word for word.',
        'The phrase describes the feather using three describing words before the word "feather".',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 23 says: "Beside the hut lay a single soft grey feather." The exact four-word phrase describing it is: single soft grey feather.',
      },
    },
    {
      id: 'passage-fiction-1-q9', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '4-10',
      stem: 'Line 3 describes the jetty as "little". Find one other word in <b>lines 4-10</b> that means the same thing.',
      hint: 'one word', maxLen: 20,
      accept: ['small'],
      hintSteps: [
        'Read lines 4 to 10 slowly, looking for a word describing size.',
        'One line describes a lantern using a word that means the same as "little".',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 8 describes "a small yellow lantern" — small means the same size idea as little, used in line 3 to describe the jetty.',
      },
    },
    {
      id: 'passage-fiction-1-q10', tier: 2, format: 'wordentry', skill: 'lang', lineRef: '8',
      stem: 'In <b>line 8</b>, what word class (noun, verb, adjective, or adverb) is the word <b>blinked</b>?',
      hint: 'one word', maxLen: 20,
      accept: ['verb'],
      hintSteps: [
        'Ask: is this word naming a thing, doing an action, describing a thing, or describing HOW something is done?',
        'The lantern is doing something in this sentence — blinking on and off.',
      ],
      explain: {
        rule: RULE_LANG_POS,
        worked: '"Blinked" tells us what the lantern DID — it names an action being done, so it is a verb.',
      },
    },
    {
      id: 'passage-fiction-1-q11', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '33',
      stem: 'Copy the exact three-word phrase from <b>line 33</b> that tells you what happened to the hut\'s door.',
      hint: 'copy the exact phrase (3 words)', maxLen: 30, exact: true,
      accept: ['unlocked the hut', 'Unlocked the hut'],
      hintSteps: [
        'Go back to line 33 and read it word for word.',
        'The mystery figure does one thing to the hut right at the end of the line.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 33 says: "A figure climbed out, hung a lantern, and unlocked the hut." The exact three-word phrase is: unlocked the hut.',
      },
    },
    {
      id: 'passage-fiction-1-q12', tier: 2, format: 'wordentry', skill: 'lang', lineRef: '27',
      stem: 'In <b>line 27</b>, what word class (noun, verb, adjective, or adverb) is the word <b>carefully</b>?',
      hint: 'one word', maxLen: 20,
      accept: ['adverb'],
      hintSteps: [
        'Ask: does this word tell you HOW something is being done?',
        '"Carefully" describes the way the counting is happening — that is the adverb job.',
      ],
      explain: {
        rule: RULE_LANG_POS,
        worked: '"Carefully" tells us HOW someone was counting the birds — a word that answers "how" is an adverb.',
      },
    },
    {
      id: 'passage-fiction-1-q13', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '43-48',
      stem: 'The word "counted" is used in <b>line 37</b>. Find the exact same word again in <b>lines 43-48</b> and copy it.',
      hint: 'one word', maxLen: 20,
      accept: ['counted'],
      hintSteps: [
        'Read lines 43 to 48 slowly, looking for a word you have already seen earlier in the story.',
        'One line describes what all three friends did to the nests together, using the very same word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 45 says: "The next night, all three counted nests by lantern light." The word "counted" appears again, exactly as it did in line 37.',
      },
    },
  ],
};
