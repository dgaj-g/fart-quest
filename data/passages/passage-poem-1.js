// FART QUEST — original passage: passage-poem-1
// Authored content — implementation agents: read, never modify.
// Genre: poetry (narrative, funny). 4 quatrains, 16 lines, ABAB rhyme scheme.
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

const RULE_LIT = 'The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm\'s reach.';
const RULE_INF = "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'.";
const RULE_VOCAB = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';
const RULE_LANG = 'A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.';
const RULE_VERSE = 'A verse is a paragraph of poetry; rhymes usually land at line-ends. Read a poem like a song: for story first, rhyme second.';

export default {
  id: 'passage-poem-1',
  title: "The Dragon Who Couldn't Roar",
  genre: 'poetry',

  lines: [
    'Nigel the dragon lived high on a peak,',
    'guarding his pile of gold with a thunderous ROAR.',
    'Sadly, each time that he tried, he would squeak—',
    'a hiccup slipped out and embarrassed him more.',
    '',
    'He gargled hot pepper and swallowed strong tea,',
    'and practised his ROAR in the cave every day.',
    'But nothing could shift the hiccup, you see—',
    'it hopped down his throat and refused to obey.',
    '',
    'One misty morning, six knights climbed the peak,',
    'clanking their armour to steal every last coin.',
    'Nigel stood tall and opened for a shriek,',
    'but only a hiccup came — HIC! — to join.',
    '',
    'Then Nigel let rip his loudest hiccup yet,',
    'a BOOM that sent boulders bouncing like drums.',
    "The knights' knees went wobbly, drenched now in sweat,",
    'and they fled down the mountain, chased by his hums.',
  ],

  questions: [
    // Q1-7: mcq5 (3 lit, 2 inf, 1 vocab-in-context, 1 lang/verse/text-feature)
    {
      id: 'passage-poem-1-q1', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '1',
      stem: 'According to <b>line 1</b>, where does Nigel the dragon live?',
      options: [
        { text: 'High on a peak', misconception: null },
        { text: 'Down in a valley', misconception: 'wrong-location' },
        { text: 'Inside a castle', misconception: 'not-in-passage' },
        { text: 'Beside a river', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Go back to line 1 and put your finger right on it — don\'t guess from the picture in your head.',
        'Line 1 names the exact spot Nigel lives. Read it word for word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 1 says: "Nigel the dragon lived high on a peak" — the exact place is stated word for word: high on a peak.',
        whyWrong: {
          'Down in a valley': 'The opposite of what line 1 says — Nigel lives HIGH UP, not down low.',
          'Inside a castle': 'No castle is mentioned anywhere in the poem — that answer isn\'t written down.',
          'Beside a river': 'A river is never mentioned — this answer is invented, not found in the text.',
        },
      },
    },
    {
      id: 'passage-poem-1-q2', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '9-10',
      stem: 'According to <b>lines 9–10</b>, who climbs the peak one misty morning?',
      options: [
        { text: 'Six knights', misconception: null },
        { text: 'One brave knight', misconception: 'wrong-number' },
        { text: 'A band of thieves', misconception: 'not-in-passage' },
        { text: 'Nigel\'s family', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Go back to line 9 and put your finger on it — count exactly who is named.',
        'Line 9 gives an exact number of visitors. Read it carefully, not "a few" or "one".',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 9 says: "One misty morning, six knights climbed the peak" — the exact number is given: six knights.',
        whyWrong: {
          'One brave knight': 'A near-miss for anyone who skims — the line says "six knights", not one.',
          'A band of thieves': 'The poem calls them knights, in armour, not thieves — that word is never used.',
          'Nigel\'s family': 'Nigel has no family mentioned anywhere in this poem — that answer is invented.',
        },
      },
    },
    {
      id: 'passage-poem-1-q3', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '4',
      stem: 'According to <b>line 4</b>, what slips out instead of a roar?',
      options: [
        { text: 'A hiccup', misconception: null },
        { text: 'A squeak', misconception: 'wrong-line-swap' },
        { text: 'A sneeze', misconception: 'not-in-passage' },
        { text: 'A puff of smoke', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Go back to line 4 and put your finger on it — ignore what line 3 said just before it.',
        'Line 4 names the exact thing that slips out and embarrasses him. Read it word for word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 4 says: "a hiccup slipped out and embarrassed him more" — the exact word is given: a hiccup.',
        whyWrong: {
          'A squeak': 'That word is in line 3, one line too early — line 4 itself names a hiccup.',
          'A sneeze': 'Sneezing is never mentioned anywhere in the poem — this is invented.',
          'A puff of smoke': 'A classic dragon idea, but this poem never says Nigel puffs smoke — check the exact line.',
        },
      },
    },
    {
      id: 'passage-poem-1-q4', tier: 2, format: 'mcq5', skill: 'inf', lineRef: '5-8',
      stem: 'What do the clues in <b>stanza 2 (lines 5–8)</b> suggest about how hard Nigel tries to cure his hiccup?',
      options: [
        { text: 'He tries several different remedies, showing he really wants to fix it', misconception: null },
        { text: 'He only tries once, then gives up completely', misconception: 'plausible-misreading' },
        { text: 'Nothing will ever cure a hiccup, no matter what anyone tries', misconception: 'absolute-language' },
        { text: 'He asks a wizard to remove the hiccup with magic', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'The text doesn\'t say the word "determined" anywhere — add up what he actually DOES across all four lines.',
        'Count his attempts: gargling pepper, swallowing tea, AND practising his ROAR every day. That\'s more than one try.',
      ],
      explain: {
        rule: RULE_INF,
        worked: 'Stanza 2 shows THREE separate attempts — gargling hot pepper, swallowing tea, and daily practice — even though none of them work. Adding those clues up shows real persistence, though the poem never uses that word directly.',
        whyWrong: {
          'He only tries once, then gives up completely': 'A near-miss for a quick skim — but the stanza actually lists several different attempts, not just one.',
          'Nothing will ever cure a hiccup, no matter what anyone tries': 'Watch for "ever" and "anyone" — this poem only tells us about Nigel\'s hiccup, not hiccups in general, forever.',
          'He asks a wizard to remove the hiccup with magic': 'No wizard or magic is mentioned anywhere in the poem — this is invented.',
        },
      },
    },
    {
      id: 'passage-poem-1-q5', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '13-16',
      stem: 'What does <b>stanza 4 (lines 13–16)</b> suggest really frightens the knights away?',
      options: [
        { text: 'The huge, booming hiccup that shakes the ground', misconception: null },
        { text: 'Nigel finally manages a mighty roar', misconception: 'plausible-misreading' },
        { text: 'Knights are always too scared to fight any dragon', misconception: 'absolute-language' },
        { text: 'The knights recognise Nigel as an old friend', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'The word "roar" isn\'t used anywhere in this stanza — check exactly what sound is described instead.',
        'Add up the clues: a BOOM, boulders bouncing, wobbly knees, drenched in sweat. What caused all that?',
      ],
      explain: {
        rule: RULE_INF,
        worked: 'Lines 13-16 describe Nigel\'s "loudest hiccup yet" causing a BOOM that bounces boulders — the knights\' fear (wobbly knees, sweat) is a reaction to that huge hiccup, never to an actual roar.',
        whyWrong: {
          'Nigel finally manages a mighty roar': 'A tempting near-miss since the poem is all about roaring — but the poem never says he roars; it stays a hiccup right to the end.',
          'Knights are always too scared to fight any dragon': 'Watch for "always" and "any" — this poem only tells us about these six knights, on this one morning.',
          'The knights recognise Nigel as an old friend': 'The opposite happens — they flee in fear, not friendship. Nothing suggests they know him.',
        },
      },
    },
    {
      id: 'passage-poem-1-q6', tier: 2, format: 'mcq5', skill: 'vocab', lineRef: '2',
      stem: 'In <b>line 2</b>, what does the word "thunderous" mean?',
      options: [
        { text: 'Extremely loud', misconception: null },
        { text: 'Very quiet', misconception: 'opposite-meaning' },
        { text: 'Made out of storm clouds', misconception: 'literal-word-part' },
        { text: 'Slow and heavy', misconception: 'unrelated-meaning' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Swap each option INTO the sentence in place of "thunderous" and read it aloud — only one keeps the sentence\'s true meaning.',
        'A ROAR that is "thunderous" — think of the sound thunder makes. Loud, or quiet?',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Swap "extremely loud" into the line: "guarding his pile of gold with an extremely loud ROAR" — that fits perfectly, because a thunderous sound is a hugely loud one, like thunder.',
        whyWrong: {
          'Very quiet': 'The opposite meaning — swap it in and "a very quiet ROAR" makes no sense at all.',
          'Made out of storm clouds': 'That takes "thunder" too literally — the word describes the SOUND, not what something is made of.',
          'Slow and heavy': 'Swap it in: "a slow and heavy ROAR" doesn\'t capture the loudness the word "thunderous" is really about.',
        },
      },
    },
    {
      id: 'passage-poem-1-q7', tier: 3, format: 'mcq5', skill: 'lang', lineRef: null,
      stem: 'Why are the words <b>ROAR, HIC!</b> and <b>BOOM</b> written in capital letters across this poem?',
      options: [
        { text: 'To show the reader these are sudden, loud sounds', misconception: null },
        { text: 'Because they are the names of characters in the poem', misconception: 'wrong-feature' },
        { text: 'Because every sentence in the poem must start that way', misconception: 'wrong-grammar-rule' },
        { text: 'It is a printing mistake that slipped into the poem', misconception: 'silly-wrong' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Always ask what EFFECT a writer\'s choice has on the reader — why make just these three words stand out?',
        'Each capitalised word is a noise Nigel makes or hears. What job does shouting a word in capitals do?',
      ],
      explain: {
        rule: RULE_LANG,
        worked: 'ROAR, HIC! and BOOM are the poem\'s loudest, most sudden noises. Writing them in capitals makes them LEAP off the page — the EFFECT is that the reader almost hears how loud and abrupt each sound is.',
        whyWrong: {
          'Because they are the names of characters in the poem': 'Nigel is the only character named in the poem — these are sound words, not names.',
          'Because every sentence in the poem must start that way': 'Capitals here appear mid-line and mid-sentence, not just at sentence starts — that rule doesn\'t fit what\'s actually happening.',
          'It is a printing mistake that slipped into the poem': 'It happens three separate times, always on a sound word — that\'s a deliberate choice, not an accident.',
        },
      },
    },

    // Q8-13: wordentry write-ins
    {
      id: 'passage-poem-1-q8', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '10',
      stem: 'Copy the exact <b>3-word</b> phrase from <b>line 10</b> that tells you what the knights wanted to steal.',
      hint: 'copy the exact phrase (3 words)',
      accept: ['every last coin', 'Every last coin'],
      exact: true,
      maxLen: 30,
      hintSteps: [
        'Go back to line 10 and put your finger right on it — the phrase is written there exactly.',
        'Line 10 ends by naming exactly what they came to steal. Copy those three words precisely.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 10 says: "clanking their armour to steal every last coin." The exact 3-word phrase is: every last coin.',
      },
    },
    {
      id: 'passage-poem-1-q9', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '1-8',
      stem: 'Besides "hiccup", find another word in <b>lines 1–8</b> that describes the odd little sound Nigel makes instead of a roar.',
      hint: 'one word',
      accept: ['squeak', 'Squeak'],
      maxLen: 20,
      hintSteps: [
        'Read lines 1 to 8 slowly — one word describes the tiny, embarrassing sound that comes out instead of a roar.',
        'Look at line 3: "he would ___—". That word is your answer.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 3 says: "Sadly, each time that he tried, he would squeak—". Swap "squeak" back into the sentence and it fits perfectly as another word for the odd little noise.',
      },
    },
    {
      id: 'passage-poem-1-q10', tier: 2, format: 'wordentry', skill: 'lang', lineRef: '14',
      stem: 'In <b>line 14</b>, what word class (type of word) is "boulders"?',
      hint: 'one word',
      accept: ['noun', 'Noun', 'a noun', 'A noun'],
      maxLen: 20,
      hintSteps: [
        'Ask what JOB "boulders" is doing in this sentence — is it naming a thing, doing an action, or describing something?',
        '"Boulders" names a THING that gets sent bouncing — naming words are one of the Big Seven word classes.',
      ],
      explain: {
        rule: RULE_LANG,
        worked: 'In line 14, "boulders" names the big rocks that bounce — a word that names a person, place or thing is a noun.',
      },
    },
    {
      id: 'passage-poem-1-q11', tier: 2, format: 'wordentry', skill: 'verse', lineRef: '13-16',
      stem: 'Write the word from <b>stanza 4 (lines 13–16)</b> that rhymes with "drums".',
      hint: 'one word',
      accept: ['hums', 'Hums'],
      maxLen: 20,
      hintSteps: [
        'Rhymes land at line-ENDS — check only the very last word of each line in stanza 4.',
        '"Drums" ends line 14. Which OTHER line-ending word in the stanza chimes with it?',
      ],
      explain: {
        rule: RULE_VERSE,
        worked: 'Line 14 ends with "drums" and line 16 ends with "hums" — those two line-ending words chime together, the rhyme pair for this stanza.',
      },
    },
    {
      id: 'passage-poem-1-q12', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '1',
      stem: 'Copy the exact <b>4-word</b> phrase from <b>line 1</b> that tells you exactly where Nigel lived.',
      hint: 'copy the exact phrase (4 words)',
      accept: ['high on a peak', 'High on a peak'],
      exact: true,
      maxLen: 30,
      hintSteps: [
        'Go back to line 1 and put your finger right on it — the exact place is written there.',
        'Line 1 says "lived ___ ___ ___ ___,". Copy those four words precisely.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 1 says: "Nigel the dragon lived high on a peak,". The exact 4-word phrase is: high on a peak.',
      },
    },
    {
      id: 'passage-poem-1-q13', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '9-12',
      stem: 'Besides "HIC!", find another word in <b>lines 9–12</b> that means the same as "a loud, sudden cry".',
      hint: 'one word',
      accept: ['shriek', 'Shriek'],
      maxLen: 20,
      hintSteps: [
        'Read lines 9 to 12 slowly — one word names the loud cry Nigel opens his mouth to make.',
        'Look at line 11: "Nigel stood tall and opened for a ___,". That word is your answer.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 11 says: "Nigel stood tall and opened for a shriek,". Swap "shriek" into the sentence and it fits perfectly as a loud, sudden cry.',
      },
    },
  ],
};
