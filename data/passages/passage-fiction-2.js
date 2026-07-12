// FART QUEST passage: Gerald the Guard Goose (prose fiction — funny animal tale)
// Authored content — implementation agents: read, never modify.
// Skill weapon rules below are copied VERBATIM from docs/CONTENT_SPECS_ENGLISH.md /
// data/topics/{reading-detective,between-lines,words-in-context,writers-tricks}.js
// so that explain.rule matches the exact wording taught in each skill's lesson.

const RULE_LIT = "The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm's reach.";
const RULE_INF = "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'.";
const RULE_VOCAB = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';
const RULE_LANG = 'A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.';
const RULE_LANG_POS = 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.';

export default {
  id: 'passage-fiction-2',
  title: 'Gerald the Guard Goose',
  genre: 'fiction',
  lines: [
    'On Hollowbrook Farm, a goose named Gerald had one dream.',
    'Gerald did not want to swim, nap or honk lazily.',
    'He wanted, more than anything, to be a guard dog.',
    'For eleven whole days, he had watched Duke the sheepdog.',
    'Duke barked at strangers, herded sheep and guarded the gate.',
    'Nobody had explained to Gerald that geese were not dogs.',
    'The next morning, he marched proudly to the farmyard gate.',
    'Gerald puffed out his chest and practised his fiercest honk.',
    'When the postman wobbled past, Gerald charged at his wheels.',
    'The postman shrieked and pedalled away faster than ever before.',
    'Mrs Byrne, the farmer, hurried out to see the fuss.',
    '"Gerald!" she cried. "You cannot chase poor Mr Owusu like that!"',
    'Gerald simply bowed, certain he had done excellent guard work.',
    'Next, Gerald decided the sheep needed proper, strict herding too.',
    'He charged into the field, wings flapping, honking his orders.',
    'The sheep scattered in seven different directions, utterly bewildered.',
    'Duke sighed from his spot beside the gate, watching sadly.',
    '"Herding," Duke muttered, "takes patience. You just made everything worse."',
    'By lunchtime, Gerald was guarding an old, empty metal bucket.',
    'He stood beside it fiercely, daring anyone to come near.',
    'The hens giggled behind the coop, whispering about the silly goose.',
    '"He thinks a bucket is treasure," clucked Henrietta, shaking her head.',
    'Even the pigs snorted with laughter, rolling in their muddy pen.',
    "Gerald's feelings, if geese have feelings, were rather bruised.",
    'That evening, he sat alone beside the quiet, dark barn wall.',
    'Duke padded over slowly and settled down next to him.',
    '"Guarding," Duke said kindly, "means watching for real danger, not buckets."',
    '"You have to notice what everyone else misses," he added.',
    'Gerald thought hard about that, his head tilted to one side.',
    'That night, while the farm slept, Gerald stayed wide awake.',
    "He remembered Duke's words and watched the shadows around the barn.",
    'Near midnight, something slunk along the hedge, low and silent.',
    'Two amber eyes gleamed briefly beside the crumbling stone wall.',
    'It was a fox, sneaking towards the henhouse door, unnoticed.',
    "Gerald's heart hammered, but he remembered exactly what Duke had said.",
    'He filled his lungs and honked louder than he ever had.',
    'Lights flicked on, and Mrs Byrne burst from the farmhouse door.',
    'Duke came racing from the barn, barking at the startled fox.',
    'The fox bolted over the hedge and vanished into the night.',
    'Mrs Byrne scooped Gerald up and hugged him with relief.',
    '"You saved my hens," she whispered, holding him close.',
    '"You truly are a guard now," she added, smiling proudly.',
    'From that day, Duke and Gerald patrolled the farm together.',
    'And nobody, not even Henrietta, laughed at him again.',
  ],

  questions: [
    // ---- Q1-Q3: literal (lit) ----
    {
      id: 'passage-fiction-2-q1', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '1',
      stem: 'According to <b>line 1</b>, on which farm does Gerald the goose live?',
      options: [
        { text: 'Hollowbrook Farm', misconception: null },
        { text: 'Oakfield Farm', misconception: 'not-in-passage' },
        { text: 'Bramblewood Farm', misconception: 'not-in-passage' },
        { text: 'Willowbrook Farm', misconception: 'sound-alike' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Don't guess from memory — go BACK to line 1 and put your finger right on it.",
        'The very first sentence names the farm before anything else happens. Read it word for word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 1 says: "On Hollowbrook Farm, a goose named Gerald had one dream." The farm\'s name is given word for word — Hollowbrook Farm.',
        whyWrong: {
          'Oakfield Farm': 'That name never appears anywhere in the passage — only Hollowbrook Farm is named.',
          'Bramblewood Farm': 'That name never appears anywhere in the passage — only Hollowbrook Farm is named.',
          'Willowbrook Farm': 'That sounds similar, but line 1 clearly says "Hollowbrook", not "Willowbrook".',
        },
      },
    },
    {
      id: 'passage-fiction-2-q2', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '4',
      stem: 'According to <b>line 4</b>, for how many days had Gerald been watching Duke?',
      options: [
        { text: 'Eleven', misconception: null },
        { text: 'Seven', misconception: 'number-slip' },
        { text: 'Three', misconception: 'number-slip' },
        { text: 'Twenty', misconception: 'exaggeration' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Don't guess from memory — go BACK to line 4 and put your finger right on it.",
        'Line 4 gives one exact number of days. Read it word for word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 4 says: "For eleven whole days, he had watched Duke the sheepdog." The answer is sitting there word for word — eleven.',
        whyWrong: {
          Seven: 'That is a smaller number than the one actually written on line 4.',
          Three: 'That is a much smaller number than the one actually written on line 4.',
          Twenty: 'That is a bigger number than the one actually written on line 4.',
        },
      },
    },
    {
      id: 'passage-fiction-2-q3', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '37',
      stem: 'According to <b>line 37</b>, who burst from the farmhouse door when the lights flicked on?',
      options: [
        { text: 'Mrs Byrne', misconception: null },
        { text: 'Duke', misconception: 'wrong-line-swap' },
        { text: 'Mr Owusu the postman', misconception: 'not-in-passage' },
        { text: 'Henrietta the hen', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Don't guess from memory — go BACK to line 37 and put your finger right on it.",
        'Line 37 names exactly one person coming through the door. Read only that line.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 37 says: "Lights flicked on, and Mrs Byrne burst from the farmhouse door." That name is the answer, word for word.',
        whyWrong: {
          Duke: 'Duke comes racing from the barn one line later, on line 38 — a near-miss for anyone reading too fast.',
          'Mr Owusu the postman': 'The postman appears earlier in the story, chased at the farmyard gate — he is never at the farmhouse door here.',
          'Henrietta the hen': 'Henrietta is never described bursting from any door anywhere in the passage.',
        },
      },
    },
    // ---- Q4-Q5: inference (inf) ----
    {
      id: 'passage-fiction-2-q4', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '21-23',
      stem: 'What do <b>lines 21-23</b> suggest about how the other farm animals feel about Gerald guarding the bucket?',
      options: [
        { text: 'They think it is ridiculous and cannot stop laughing at him', misconception: null },
        { text: 'They are jealous that Gerald has found hidden treasure', misconception: 'plausible-misreading' },
        { text: 'They will never take anything Gerald does seriously ever again', misconception: 'absolute-language' },
        { text: 'They are frightened of what might be hiding inside the bucket', misconception: 'not-supported' },
      ],
      correctIndex: 0,
      hintSteps: [
        "These lines don't come out and say it directly — ask what the clues ADD UP to.",
        'Giggling hens, a joking remark about "treasure", and snorting pigs — what one feeling do all three clues point to?',
      ],
      explain: {
        rule: RULE_INF,
        worked: 'Lines 21-23 show the hens giggling and whispering, Henrietta joking that a bucket is "treasure", and the pigs snorting with laughter. Adding those clues up: the animals find Gerald\'s bucket-guarding ridiculous and funny.',
        whyWrong: {
          'They are jealous that Gerald has found hidden treasure': "Henrietta's \"treasure\" comment is a joke about how silly Gerald looks, not a real belief that the bucket holds treasure.",
          'They will never take anything Gerald does seriously ever again': 'Watch that absolute language — "never" and "ever again" go far further than these three lines actually show.',
          'They are frightened of what might be hiding inside the bucket': 'Giggling, joking and snorting with laughter are not signs of fear — nothing here suggests the animals are scared.',
        },
      },
    },
    {
      id: 'passage-fiction-2-q5', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '35-36',
      stem: 'What do <b>lines 35-36</b> suggest about how Gerald is feeling as he faces the fox?',
      options: [
        { text: 'Frightened, but determined to act despite his fear', misconception: null },
        { text: 'Excited and thrilled at the chance for an adventure', misconception: 'plausible-misreading' },
        { text: 'Completely calm, with no trace of fear at all', misconception: 'absolute-language' },
        { text: 'Confused about what kind of animal the fox is', misconception: 'not-supported' },
      ],
      correctIndex: 0,
      hintSteps: [
        "These lines don't come out and say it directly — ask what the clues ADD UP to.",
        'A hammering heart is one clue; honking louder than ever is another. What one feeling explains both a racing heart AND brave action?',
      ],
      explain: {
        rule: RULE_INF,
        worked: "Line 35 shows Gerald's heart hammering — a clear sign of fear — yet line 36 shows him filling his lungs and honking louder than ever. Adding those clues up: he is frightened, but chooses to act bravely anyway.",
        whyWrong: {
          'Excited and thrilled at the chance for an adventure': 'A hammering heart paired with remembering Duke\'s warning points to fear, not excited thrills.',
          'Completely calm, with no trace of fear at all': 'Watch that absolute language — "completely" and "no trace" ignore the hammering heart described in line 35.',
          'Confused about what kind of animal the fox is': 'Line 34 already told the reader it is a fox — nothing in lines 35-36 shows Gerald being confused about that.',
        },
      },
    },
    // ---- Q6: vocab-in-context ----
    {
      id: 'passage-fiction-2-q6', tier: 2, format: 'mcq5', skill: 'vocab', lineRef: '9',
      stem: 'In <b>line 9</b>, "the postman wobbled past" — what does <b>wobbled</b> suggest about how he was riding?',
      options: [
        { text: 'Unsteadily, as if he might topple off his bicycle', misconception: null },
        { text: 'Extremely fast and full of confidence', misconception: 'wrong-tone' },
        { text: 'Slowly and very carefully', misconception: 'unrelated-meaning' },
        { text: 'Backwards, away from the farm gate', misconception: 'unrelated-meaning' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.',
        '"The postman rode unsteadily past" still makes sense. Does "the postman rode confidently past" mean the same thing?',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Swapping "unsteadily" into the sentence keeps the same meaning — and it fits perfectly with line 10, where he then "shrieked and pedalled away". Wobbled means riding unsteadily, as if about to topple over.',
        whyWrong: {
          'Extremely fast and full of confidence': 'A confident rider would not shriek in panic straight afterwards, as line 10 describes.',
          'Slowly and very carefully': "Wobbling isn't about speed — it's about being unsteady, which is why Gerald's charge frightens him so easily.",
          'Backwards, away from the farm gate': 'The postman is arriving, riding towards the farm, not away from it.',
        },
      },
    },
    // ---- Q7: language/effect ----
    {
      id: 'passage-fiction-2-q7', tier: 2, format: 'mcq5', skill: 'lang', lineRef: '4-5',
      stem: 'In <b>lines 4-5</b>, the writer lists three things Duke does: "barked at strangers, herded sheep and guarded the gate." What effect does listing these three actions create?',
      options: [
        { text: 'It piles up examples to show just how much a real guard dog actually does', misconception: null },
        { text: 'It compares Duke directly to something else using "like" or "as"', misconception: 'wrong-device' },
        { text: 'It says Duke IS something else entirely, without using "like" or "as"', misconception: 'wrong-device' },
        { text: 'It repeats the same word twice for comic effect', misconception: 'wrong-device' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A simile compares with like or as; a metaphor says it IS; a list piles things up — always ask what EFFECT it has.',
        'Barked, herded, guarded — three separate jobs stacked up one after another. What does piling up that many actions make Duke seem like?',
      ],
      explain: {
        rule: RULE_LANG,
        worked: 'The writer piles up three separate actions — barked, herded, guarded — one after another. Listing that many jobs in a row builds up a picture of just how much real guard-dog work actually involves, which is exactly why Gerald is so impressed by Duke.',
        whyWrong: {
          'It compares Duke directly to something else using "like" or "as"': 'There is no "like" or "as" comparison here — Duke is not being compared to another thing, his actions are simply listed.',
          'It says Duke IS something else entirely, without using "like" or "as"': 'Nothing in these lines says Duke IS another thing — this is a list of his actions, not a metaphor.',
          'It repeats the same word twice for comic effect': 'No word is repeated for a joke here — three different actions are listed, not one word repeated.',
        },
      },
    },
    // ---- Q8-Q13: wordentry ----
    {
      id: 'passage-fiction-2-q8', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '41',
      stem: 'Copy the exact phrase (four words) Mrs Byrne says to Gerald in <b>line 41</b>, straight after he saves the hens.',
      hint: 'copy the exact phrase (4 words)', maxLen: 30, exact: true,
      accept: ['You saved my hens', 'you saved my hens'],
      hintSteps: [
        "Don't guess from memory — go BACK to line 41 and put your finger right on it.",
        'The phrase sits inside speech marks at the very start of the line — copy it exactly, without the speech marks.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 41 says: "\'You saved my hens,\' she whispered, holding him close." Copying exactly gives: You saved my hens.',
      },
    },
    {
      id: 'passage-fiction-2-q9', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '21-23',
      stem: 'Line 21 says the hens "giggled". Find one other word or short phrase in <b>lines 22-23</b> that also shows an animal laughing at Gerald.',
      hint: 'one word or short phrase', maxLen: 40,
      accept: ['laughter', 'snorted with laughter'],
      hintSteps: [
        'Swap words into the sentence and read it aloud — only a true laughing meaning survives the swap.',
        'Look at line 23 — the pigs are described doing something very similar to giggling.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 23 says: "Even the pigs snorted with laughter, rolling in their muddy pen." Laughter means the same kind of amusement as "giggled".',
      },
    },
    {
      id: 'passage-fiction-2-q10', tier: 2, format: 'wordentry', skill: 'lang', lineRef: '32',
      stem: 'In <b>line 32</b>, "low and silent", what word class (part of speech) is the word <b>silent</b>?',
      hint: 'one word', maxLen: 20,
      accept: ['adjective'],
      hintSteps: [
        'Ask what JOB the word "silent" is doing in this sentence.',
        'It describes what the creeping shape was like — a word that describes is that word class.',
      ],
      explain: {
        rule: RULE_LANG_POS,
        worked: '"Silent" describes what the creeping shape was like, telling us how it moved — that describing job makes it an adjective.',
      },
    },
    {
      id: 'passage-fiction-2-q11', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '27',
      stem: 'Copy the exact phrase (five words, starting with "means") from <b>line 27</b> that shows what Duke says guarding really means.',
      hint: 'copy the exact phrase (5 words)', maxLen: 40, exact: true,
      accept: ['means watching for real danger', 'Means watching for real danger'],
      hintSteps: [
        "Don't guess from memory — go BACK to line 27 and put your finger right on it.",
        'Read line 27 word for word and copy the five words straight after "Guarding,... Duke said kindly,".',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 27 says: "\'Guarding,\' Duke said kindly, \'means watching for real danger, not buckets.\'" Copying exactly the five words gives: means watching for real danger.',
      },
    },
    {
      id: 'passage-fiction-2-q12', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '7-8',
      stem: 'Find one phrase in <b>lines 7-8</b> (other than "proudly") that shows Gerald felt confident about his new job.',
      hint: 'a short phrase', maxLen: 40,
      accept: ['puffed out his chest', 'puffed out his chest and practised his fiercest honk'],
      hintSteps: [
        'Swap phrases into the sentence and read it aloud — only a true confident meaning survives the swap.',
        'Look at line 8 — Gerald does something with his chest that shows he feels important and confident.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 8 says: "Gerald puffed out his chest and practised his fiercest honk." Puffing out his chest is a classic sign of feeling proud and confident, matching "proudly" in line 7.',
      },
    },
    {
      id: 'passage-fiction-2-q13', tier: 2, format: 'wordentry', skill: 'lang', lineRef: '8',
      stem: 'In <b>line 8</b>, "practised his fiercest honk" — is the word <b>honk</b> being used as a noun or a verb here?',
      hint: 'one word: noun or verb', maxLen: 20,
      accept: ['noun'],
      hintSteps: [
        'Ask what JOB the word "honk" is doing in THIS sentence — geese can honk (an action), but a honk can also be a thing.',
        '"His fiercest honk" is a thing Gerald practises, described by the adjective "fiercest" — a naming word like that is a noun.',
      ],
      explain: {
        rule: RULE_LANG_POS,
        worked: 'Here "honk" is the thing being practised — described by the adjective "fiercest" and following the possessive "his" — so it is being used as a noun, not as the verb "to honk".',
      },
    },
  ],
};
