// FART QUEST — original passage: passage-poem-2
// Authored content — implementation agents: read, never modify.
// Genre: poetry (descriptive, strong simile/metaphor imagery). 4 quatrains,
// 16 lines, ABAB rhyme scheme within each verse.
// Feeds Storybog skill battles via `skill` tags (lit|inf|vocab|lang|verse|text)
// and the passage-boss "one full passage, all 13 questions" run.
//
// Weapon rules quoted verbatim (per CONTENT_SPECS_ENGLISH.md) as each
// question's explain.rule, keyed by its skill tag:
//   lit   -> reading-detective  (The Line-Number Lasso)
//   inf   -> between-lines      (The Sniff-It-Out Snout)
//   vocab -> words-in-context   (The Swap-In Tester)
//   lang  -> writers-tricks     (The Trick Detector)
//   verse -> poetry             (The Verse Decoder)
//   text  -> kinds-of-writing   (The Signpost Reader) [unused by this passage]

const RULE_LIT = "The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm's reach.";
const RULE_INF = "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'.";
const RULE_VOCAB = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';
const RULE_LANG = 'A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.';
const RULE_LANG_POS = 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.';
const RULE_VERSE = 'A verse is a paragraph of poetry; rhymes usually land at line-ends. Read a poem like a song: for story first, rhyme second.';

export default {
  id: 'passage-poem-2',
  title: 'The Saturday Market',
  genre: 'poetry',

  lines: [
    'The market wakes at break of day,',
    'its awnings stretched across the square,',
    'a hundred voices start to play',
    'a lively tune of chatter everywhere.',
    '',
    '"Three for a pound!" the fruit man roars,',
    'his apples gleam like polished brass,',
    "and the fishmonger's icy silver floors",
    'lie slippery as sheets of glass.',
    '',
    'The flower stall is a rainbow spilled,',
    'each bucket bursting pink and gold,',
    "the baker's window warm and filled,",
    'breathes out a heat that shrugs off cold.',
    '',
    "By four o'clock the crowds grow thin,",
    'the awnings sigh, the sky turns grey,',
    'the market tucks its colours in',
    'and softly dreams until another day.',
  ],

  questions: [
    // Q1-7: mcq5 (3 lit, 2 inf, 1 vocab-in-context, 1 lang/verse/text-feature)
    {
      id: 'passage-poem-2-q1', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '2',
      stem: 'According to <b>line 2</b>, what is stretched across the square?',
      options: [
        { text: 'The awnings', misconception: null },
        { text: 'A hundred voices', misconception: 'wrong-line-swap' },
        { text: 'The flower buckets', misconception: 'wrong-line-swap' },
        { text: 'The muddy footprints', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Go back to line 2 and put your finger right on it — don't guess from the picture in your head.",
        'Line 2 names the exact thing stretched across the square. Read it word for word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 2 says: "its awnings stretched across the square" — the exact answer is stated word for word: the awnings.',
        whyWrong: {
          'A hundred voices': "That's from line 3, describing the market's chatter — not what is stretched across the square in line 2.",
          'The flower buckets': "The flower buckets don't appear until line 10, a completely different verse.",
          'The muddy footprints': "Footprints are never mentioned anywhere in this poem — that answer isn't written down.",
        },
      },
    },
    {
      id: 'passage-poem-2-q2', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '6',
      stem: "According to <b>line 6</b>, what does the writer say the fruit man's apples gleam like?",
      options: [
        { text: 'Polished brass', misconception: null },
        { text: 'Sheets of glass', misconception: 'wrong-line-swap' },
        { text: 'A rainbow spilled', misconception: 'wrong-line-swap' },
        { text: 'A pile of gold coins', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Go back to line 6 and put your finger right on it — ignore the other shiny things later in the poem.',
        'Line 6 compares the apples to one particular shiny metal. Read it exactly.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 6 says: "his apples gleam like polished brass" — the exact comparison is written down word for word: polished brass.',
        whyWrong: {
          'Sheets of glass': "That comparison belongs to line 8, describing the fishmonger's icy floor — not the apples in line 6.",
          'A rainbow spilled': "That's from line 9, describing the flower stall in a completely different verse.",
          'A pile of gold coins': "Gold coins are never mentioned anywhere in this poem — that answer isn't written down at all.",
        },
      },
    },
    {
      id: 'passage-poem-2-q3', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '14',
      stem: 'According to <b>line 14</b>, what colour does the sky turn as the market closes?',
      options: [
        { text: 'Grey', misconception: null },
        { text: 'Bright blue', misconception: 'opposite-detail' },
        { text: 'Golden orange', misconception: 'not-in-passage' },
        { text: 'Pitch black', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Go back to line 14 and put your finger right on it — don't guess what colour a closing sky is USUALLY described as.",
        'Line 14 names the exact colour, right after the awnings sigh. Read it word for word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 14 says: "the awnings sigh, the sky turns grey" — the exact colour is written down word for word: grey.',
        whyWrong: {
          'Bright blue': 'The opposite of what line 14 actually says — the sky turns grey, not blue, as the day ends.',
          'Golden orange': 'A sunset colour you might expect, but this poem names grey exactly — check the line again.',
          'Pitch black': "No pitch-black sky is mentioned anywhere — the poem only describes the sky turning grey, not full night.",
        },
      },
    },
    {
      id: 'passage-poem-2-q4', tier: 2, format: 'mcq5', skill: 'inf', lineRef: '13-16',
      stem: 'What do the clues in <b>verse 4 (lines 13–16)</b> suggest about how the market feels as it closes for the day?',
      options: [
        { text: 'Tired and ready to rest, but confident it will be lively again tomorrow', misconception: null },
        { text: 'Sad because nobody wants to visit it anymore', misconception: 'plausible-misreading' },
        { text: 'Certain it will never open its stalls again', misconception: 'absolute-language' },
        { text: 'Excited because a fireworks display is starting', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Add up the clues: thinning crowds, sighing awnings, a greying sky, colours tucked away — what feeling do ALL of these point to together?',
        "Now look at the very last words: 'dreams until another day'. Does that sound like an ending, or a pause before it all happens again?",
      ],
      explain: {
        rule: RULE_INF,
        worked: "Add the clues: the crowds thin out, the awnings sigh, the sky turns grey and the colours are tucked away — signs of a day winding down, tired out. But the very last line says the market 'dreams until another day', which promises a return, not a final goodbye. Together, the clues suggest the market is weary but confident it will be just as lively again.",
        whyWrong: {
          'Sad because nobody wants to visit it anymore': "The thinning crowds could look like sadness at first glance, but line 16 promises the market will dream until another day — that's confidence in returning, not a market nobody wants.",
          'Certain it will never open its stalls again': 'Watch the trap word "never" — line 16 says the opposite: the market dreams UNTIL another day, meaning it fully expects to open again.',
          'Excited because a fireworks display is starting': 'No fireworks display is mentioned anywhere in the poem — this idea is not in the text at all.',
        },
      },
    },
    {
      id: 'passage-poem-2-q5', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '9-12',
      stem: 'What do the clues in <b>verse 3 (lines 9–12)</b> together suggest about how this part of the market feels?',
      options: [
        { text: 'Warm, colourful and inviting, like a treat for the senses', misconception: null },
        { text: 'The coldest and gloomiest corner of the whole market', misconception: 'plausible-misreading' },
        { text: 'Exactly as warm and colourful as every single stall in the market', misconception: 'absolute-language' },
        { text: 'Empty, because the baker has sold out of bread', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Add up the clues: a rainbow spilled across the stall, buckets bursting with colour, a warm and filled window, heat breathing out — what single feeling do all these clues create together?',
        "Line 12 says the heat 'shrugs off cold' — that tells you what the heat is DOING, not that this spot is actually cold. Read it again carefully.",
      ],
      explain: {
        rule: RULE_INF,
        worked: "Add the clues: the flower stall is described as a rainbow spilled, its buckets bursting with pink and gold, and the baker's window breathes out heat that shrugs off the cold outside. Several clues, all pointing the same way — this corner of the market feels warm, colourful and inviting, like a treat for the senses.",
        whyWrong: {
          'The coldest and gloomiest corner of the whole market': 'Watch the near-miss: line 12 mentions "cold", but only to say the heat SHRUGS IT OFF — the passage describes warmth winning over the cold outside, not a cold, gloomy spot.',
          'Exactly as warm and colourful as every single stall in the market': 'Watch the trap word "every" — lines 9-12 describe only the flower stall and the bakery, not a claim about every stall in the whole market.',
          'Empty, because the baker has sold out of bread': 'Nothing is said about bread running out — the window is described as "warm and filled", the opposite of empty.',
        },
      },
    },
    {
      id: 'passage-poem-2-q6', tier: 2, format: 'mcq5', skill: 'vocab', lineRef: '5',
      stem: 'In <b>line 5</b>, what does the word "roars" mean?',
      options: [
        { text: 'Shouts something very loudly', misconception: null },
        { text: 'Makes the growling sound of a wild animal', misconception: 'literal-word-part' },
        { text: 'Whispers something very quietly', misconception: 'opposite-meaning' },
        { text: 'Counts his coins carefully', misconception: 'unrelated-meaning' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Swap each option INTO line 5 in place of "roars" and read the whole line aloud.',
        'A fruit seller in a market is a person, not an animal — what does a person do with their voice to sell fruit to a noisy crowd?',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Swap "makes the growling sound of a wild animal" into line 5: "the fruit man makes the growling sound of a wild animal" — nonsense, since he is a person, not an animal. Swap in "shouts something very loudly" and it survives perfectly: a market seller calling out his price at the top of his voice.',
        whyWrong: {
          'Makes the growling sound of a wild animal': 'That is a real meaning of "roars" — just not this one! It fits a lion, not a market trader calling out his prices.',
          'Whispers something very quietly': 'The opposite of what the exclamation mark and the word "roars" suggest — this is a loud call across a busy market, not a whisper.',
          'Counts his coins carefully': 'Line 5 is about what he SAYS to the crowd, not about handling money at all.',
        },
      },
    },
    {
      id: 'passage-poem-2-q7', tier: 3, format: 'mcq5', skill: 'lang', lineRef: '9',
      stem: 'Line 9 says "The flower stall is a rainbow spilled." What poetic device is this, and what effect does it create?',
      options: [
        { text: 'It is a metaphor — it says the stall actually IS a rainbow, making the flowers feel dazzlingly colourful', misconception: null },
        { text: 'It is a simile, because it compares the stall to a rainbow using "like" or "as"', misconception: 'wrong-feature' },
        { text: 'It proves every flower stall in the world looks exactly like this one', misconception: 'absolute-language' },
        { text: 'It tells us the exact number of flowers for sale that day', misconception: 'silly-wrong' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Check for a comparing word first — do you see 'like' or 'as' anywhere in line 9? If not, it isn't a simile.",
        "The line doesn't say the stall is LIKE a rainbow — it says the stall simply IS one. What device makes a bold claim like that, and what picture does it create?",
      ],
      explain: {
        rule: RULE_LANG,
        worked: 'Line 9 has no comparing word — it goes straight for the bold claim: the stall IS a rainbow. That is a metaphor, and it works harder than a simile would: it makes the reader picture flowers so dazzlingly colourful that the whole stall looks like a rainbow has tipped over and spilled across it.',
        whyWrong: {
          'It is a simile, because it compares the stall to a rainbow using "like" or "as"': 'Look again — there is no "like" or "as" anywhere in line 9. A simile needs that comparing word; this line simply states the stall IS a rainbow, which makes it a metaphor.',
          'It proves every flower stall in the world looks exactly like this one': 'Watch the trap word "every" — this line describes only THIS one stall, in THIS poem, not a fact about flower stalls everywhere.',
          'It tells us the exact number of flowers for sale that day': 'No number of flowers is given anywhere in the poem — this line is about colour and feeling, not counting.',
        },
      },
    },

    // Q8-13: wordentry write-ins
    {
      id: 'passage-poem-2-q8', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '9',
      stem: 'Copy the exact <b>3-word</b> phrase from <b>line 9</b> that says what the flower stall is.',
      hint: 'copy the exact phrase (3 words)',
      accept: ['a rainbow spilled', 'A rainbow spilled'],
      exact: true,
      maxLen: 30,
      hintSteps: [
        'Go back to line 9 and put your finger right on it — the phrase is written there exactly.',
        'Line 9 ends with the exact three words you need. Copy them out precisely, in the same order.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 9 says: "The flower stall is a rainbow spilled." The exact 3-word phrase is: a rainbow spilled.',
      },
    },
    {
      id: 'passage-poem-2-q9', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '5-8',
      stem: "Besides \"roars\", find another word in <b>lines 5–8</b> that means shines brightly.",
      hint: 'one word',
      accept: ['gleam', 'Gleam'],
      maxLen: 20,
      hintSteps: [
        'Read lines 5 to 8 slowly — one word describes how the fruit man\'s apples catch the light.',
        'Look at line 6: "his apples ___ like polished brass,". That word is your answer.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 6 says: "his apples gleam like polished brass,". Swap "gleam" back into the sentence and it fits perfectly as another word for shining brightly.',
      },
    },
    {
      id: 'passage-poem-2-q10', tier: 2, format: 'wordentry', skill: 'lang', lineRef: '6',
      stem: 'In <b>line 6</b>, what word class (type of word) is "gleam"?',
      hint: 'one word',
      accept: ['verb', 'Verb', 'a verb', 'A verb'],
      maxLen: 20,
      hintSteps: [
        'Ask what JOB "gleam" is doing in this sentence — is it naming a thing, describing a thing, or telling you what something DOES?',
        'The apples gleam — that is the action the apples are doing. A doing word is called a…',
      ],
      explain: {
        rule: RULE_LANG_POS,
        worked: 'In line 6, "gleam" tells you what the apples are DOING — a word that does an action is a verb.',
      },
    },
    {
      id: 'passage-poem-2-q11', tier: 2, format: 'wordentry', skill: 'verse', lineRef: '9-12',
      stem: 'Write the word from <b>verse 3 (lines 9–12)</b> that rhymes with "gold".',
      hint: 'one word',
      accept: ['cold', 'Cold'],
      maxLen: 20,
      hintSteps: [
        'Rhymes land at line-ENDS — check only the very last word of each line in verse 3.',
        '"Gold" ends line 10. Which OTHER line-ending word in the verse chimes with it?',
      ],
      explain: {
        rule: RULE_VERSE,
        worked: 'Line 10 ends with "gold" and line 12 ends with "cold" — those two line-ending words chime together, the rhyme pair for this verse.',
      },
    },
    {
      id: 'passage-poem-2-q12', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '16',
      stem: 'Copy the exact <b>4-word</b> phrase from <b>line 16</b> that tells you what the market does as it closes.',
      hint: 'copy the exact phrase (4 words)',
      accept: ['dreams until another day', 'Dreams until another day'],
      exact: true,
      maxLen: 40,
      hintSteps: [
        'Go back to line 16 and put your finger right on it — the phrase you need comes right after "and softly".',
        'Copy those four words out exactly as they are written, in the same order.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 16 says: "and softly dreams until another day." The exact 4-word phrase is: dreams until another day.',
      },
    },
    {
      id: 'passage-poem-2-q13', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '13-16',
      stem: 'Besides "thin", find another word in <b>lines 13–16</b> that means letting out a long, weary breath.',
      hint: 'one word',
      accept: ['sigh', 'Sigh'],
      maxLen: 20,
      hintSteps: [
        'Read lines 13 to 16 slowly — one word describes the exact sound of breathing out slowly, like when you are tired.',
        'Look at line 14: "the awnings ___,". That word is your answer.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 14 says: "the awnings sigh, the sky turns grey,". Swap "sigh" into the sentence and it fits perfectly as a weary, tired sound.',
      },
    },
  ],
};
