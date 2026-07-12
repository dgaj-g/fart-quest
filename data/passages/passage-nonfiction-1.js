// FART QUEST passage: The Smelliest Flower on Earth (non-fiction report)
// Authored content — implementation agents: read, never modify.
// Subheadings are marked as standalone lines wrapped in <b>…</b> (6 topic
// subheadings + a final "Conclusion" heading = 7 headings total).
// Skill weapon rules below are copied VERBATIM from docs/ROSTER.md /
// data/topics/{reading-detective,between-lines,kinds-of-writing}.js so that
// explain.rule matches the exact wording taught in each skill's lesson.

const RULE_LIT = "The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm's reach.";
const RULE_INF = "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'.";
const RULE_VOCAB = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';
const RULE_LANG = 'A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.';
const RULE_LANG_POS = 'Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb.';
const RULE_TEXT = 'Contents = where chapters start; index = where topics hide (back, A-Z); glossary = word meanings; bibliography = books used. Fiction is invented; non-fiction is fact.';

export default {
  id: 'passage-nonfiction-1',
  title: 'The Smelliest Flower on Earth',
  genre: 'nonfiction',
  lines: [
    'Some flowers smell like roses, sweet and gentle.',
    'One flower on Earth smells like something rotting.',
    'It is called Rafflesia, and it is enormous.',
    "This report explains what makes the world's smelliest flower so disgusting.",
    '<b>What Is Rafflesia?</b>',
    'Rafflesia arnoldii is the largest single flower on Earth.',
    'A fully open bloom can measure one whole metre wide.',
    'It can weigh up to ten kilograms, heavier than a child.',
    'The flower has five thick, rubbery petals coloured deep red.',
    'White blotches cover the petals like some strange disease.',
    'Strangely, the plant has no leaves, stem or roots at all.',
    'Only the giant flower ever pokes up above the ground.',
    '<b>Why Does It Smell So Terrible?</b>',
    'Rafflesia is nicknamed the “corpse lily” for a very good reason.',
    'Its petals give off an odour of rotting meat.',
    'The smell is not an accident; it is a clever trick.',
    'Flies that usually lay their eggs on dead animals arrive instead.',
    "They land on the flower, searching for flesh that isn't there.",
    'While crawling around, the flies pick up sticky pollen grains.',
    'The flies then carry that pollen to another Rafflesia flower.',
    '<b>Where Does It Grow?</b>',
    'Rafflesia grows only in the rainforests of Sumatra and Borneo.',
    'These huge islands belong to Indonesia and Malaysia today.',
    'The plant needs hot, damp, shady rainforest to survive at all.',
    'It was first recorded by explorers back in 1818.',
    'They named the flower after Sir Stamford Raffles, an explorer.',
    '<b>How the Flower Feeds Itself</b>',
    'Rafflesia cannot make its own food like ordinary green plants.',
    'It has no green leaves and no chlorophyll whatsoever.',
    'Instead, it lives as a parasite inside a jungle vine.',
    'Thread-like strands creep through the vine, stealing water and sugar.',
    "<b>The World's Tallest Stinker: Titan Arum</b>",
    'Rafflesia has a stinking rival called the titan arum.',
    'This towering plant can grow over three metres tall.',
    'It produces the tallest unbranched flower structure in the world.',
    'The titan arum also mimics rotting flesh to attract flies.',
    'Remarkably, it can even warm itself up like an animal.',
    '<b>A Very Short Life</b>',
    'A Rafflesia bud takes up to nine months to develop.',
    'Yet the bloom itself lasts for only about a week.',
    'After that, the huge flower collapses into a blackened, slimy heap.',
    'Male and female flowers must open near each other at once.',
    'Sadly, that rarely happens, so seeds are hard to produce.',
    'This makes Rafflesia one of the rarest flowers on the planet.',
    '<b>Conclusion</b>',
    'Rafflesia and the titan arum prove disgusting can mean genius.',
    'Their terrible smell is really a brilliant survival strategy in disguise.',
    'Sadly, shrinking rainforests now threaten both incredible stinking flowers.',
    "Protecting the rainforest means protecting the world's smelliest wonders too.",
  ],

  questions: [
    // ---- Q1-Q3: literal (lit) ----
    {
      id: 'passage-nonfiction-1-q1', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '8',
      stem: 'According to <b>line 8</b>, about how much can a Rafflesia flower weigh?',
      options: [
        { text: 'Up to ten kilograms', misconception: null },
        { text: 'Up to ten grams', misconception: 'unit-confusion' },
        { text: 'Up to one kilogram', misconception: 'number-slip' },
        { text: 'Up to a hundred kilograms', misconception: 'exaggeration' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Don't guess from memory — go BACK to line 8 and put your finger right on it.",
        'Line 8 gives one exact figure and one exact unit. Read it word for word.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 8 says: "It can weigh up to ten kilograms, heavier than a child." The answer is sitting there word for word — up to ten kilograms.',
        whyWrong: {
          'Up to ten grams': 'That swaps the unit — grams are far too light for a flower heavier than a child.',
          'Up to one kilogram': 'That is a much smaller number than the one written on line 8.',
          'Up to a hundred kilograms': 'That is ten times bigger than the figure actually given on line 8.',
        },
      },
    },
    {
      id: 'passage-nonfiction-1-q2', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '22',
      stem: 'According to <b>line 22</b>, in which two places does Rafflesia grow?',
      options: [
        { text: 'Sumatra and Borneo', misconception: null },
        { text: 'Sumatra and Java', misconception: 'wrong-place-swap' },
        { text: 'Borneo and Australia', misconception: 'wrong-place-swap' },
        { text: 'Indonesia and Malaysia', misconception: 'wrong-line-swap' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Go BACK to line 22 and put your finger on it — ignore any other place names in the report.',
        'Line 22 names two rainforest islands, not the countries they belong to.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 22 says: "Rafflesia grows only in the rainforests of Sumatra and Borneo." The two islands are Sumatra and Borneo.',
        whyWrong: {
          'Sumatra and Java': 'Java is never mentioned anywhere in the report — only Sumatra and Borneo are named.',
          'Borneo and Australia': 'Australia is never mentioned in the report at all.',
          'Indonesia and Malaysia': 'Those are the countries named one line later, on line 23 — a near-miss for anyone reading too fast.',
        },
      },
    },
    {
      id: 'passage-nonfiction-1-q3', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '26',
      stem: 'According to <b>line 26</b>, who was the flower named after?',
      options: [
        { text: 'Sir Stamford Raffles', misconception: null },
        { text: 'Charles Darwin', misconception: 'not-in-passage' },
        { text: 'Captain Cook', misconception: 'not-in-passage' },
        { text: 'Joseph Arnold', misconception: 'not-in-passage' },
      ],
      correctIndex: 0,
      hintSteps: [
        "Don't guess from memory — go BACK to line 26 and put your finger right on it.",
        'Line 26 names exactly one explorer. Read only that line.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 26 says: "They named the flower after Sir Stamford Raffles, an explorer." That name is the answer, word for word.',
        whyWrong: {
          'Charles Darwin': 'Charles Darwin is never mentioned anywhere in this report.',
          'Captain Cook': 'Captain Cook is never mentioned anywhere in this report.',
          'Joseph Arnold': 'That name never appears anywhere in the report — only Sir Stamford Raffles is named.',
        },
      },
    },
    // ---- Q4-Q5: inference (inf) ----
    {
      id: 'passage-nonfiction-1-q4', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '17-19',
      stem: 'Based on <b>lines 17-19</b>, what can you work out about why Rafflesia\'s smell is so effective?',
      options: [
        { text: 'It fools flies into helping it spread pollen, even though no dead flesh is really there', misconception: null },
        { text: 'It actually kills every fly that lands on it', misconception: 'plausible-misreading' },
        { text: 'Every single fly in the rainforest is always drawn to it', misconception: 'absolute-language' },
        { text: 'The flower grows real meat for the flies to eat', misconception: 'not-supported' },
      ],
      correctIndex: 0,
      hintSteps: [
        "These lines don't come out and say it directly — ask what the clues ADD UP to.",
        'Flies expect dead flesh, land searching for it, and pick up pollen instead. What does that trick achieve for the flower?',
      ],
      explain: {
        rule: RULE_INF,
        worked: "Lines 17-19 show flies arriving expecting flesh, finding none, and picking up pollen while they search. Adding those clues up: the smell is a trick that fools flies into carrying pollen for a flower that has no meat at all.",
        whyWrong: {
          'It actually kills every fly that lands on it': 'A close-sounding idea, but nothing in lines 17-19 says the flies are harmed — they simply search and leave with pollen.',
          'Every single fly in the rainforest is always drawn to it': 'Watch that absolute language — "every single" and "always" go far further than the text ever claims.',
          'The flower grows real meat for the flies to eat': 'The text says the smell tricks the flies — it never says any real flesh or meat is actually produced.',
        },
      },
    },
    {
      id: 'passage-nonfiction-1-q5', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '39-44',
      stem: 'Based on <b>lines 39-44</b>, what can you work out about why Rafflesia is so rare?',
      options: [
        { text: 'Its pollination depends on very precise timing that does not often happen', misconception: null },
        { text: 'The flower refuses to open unless it rains', misconception: 'plausible-misreading' },
        { text: 'Rafflesia never successfully reproduces at all', misconception: 'absolute-language' },
        { text: 'Rafflesia is rare because people pick every flower they find', misconception: 'not-supported' },
      ],
      correctIndex: 0,
      hintSteps: [
        'These lines never explain WHY in one single sentence — ask what the clues ADD UP to.',
        'Notice the timing clues: a bud takes months, the bloom lasts a week, and male and female flowers must open together. What does that combination make difficult?',
      ],
      explain: {
        rule: RULE_INF,
        worked: 'Lines 39-44 show a nine-month bud, a bloom lasting only a week, and a need for male and female flowers to open near each other at the same time — which "rarely happens". Adding those clues up: successful pollination depends on timing that is hard to get right, making the flower rare.',
        whyWrong: {
          'The flower refuses to open unless it rains': 'Rain is never mentioned anywhere in lines 39-44 — this is a guess dressed up as a fact.',
          'Rafflesia never successfully reproduces at all': 'Watch that absolute language — the text says pollination "rarely happens", not that it never happens.',
          'Rafflesia is rare because people pick every flower they find': 'People picking flowers is never mentioned in this section — the rarity here is about timing, not people.',
        },
      },
    },
    // ---- Q6: vocab-in-context ----
    {
      id: 'passage-nonfiction-1-q6', tier: 2, format: 'mcq5', skill: 'vocab', lineRef: '37',
      stem: 'In <b>line 37</b>, "Remarkably, it can even warm itself up like an animal" — what does <b>remarkably</b> mean here?',
      options: [
        { text: 'Surprisingly', misconception: null },
        { text: 'Sadly', misconception: 'wrong-tone' },
        { text: 'Slowly', misconception: 'unrelated-meaning' },
        { text: 'Rarely', misconception: 'sound-alike' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.',
        '"Surprisingly, it can even warm itself up" still makes sense. Does "rarely, it can even warm itself up" mean the same thing?',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Swapping "surprisingly" into the sentence keeps the same meaning — a plant heating itself up like an animal is an amazing, surprising fact. "Remarkably" means surprisingly / amazingly.',
        whyWrong: {
          Sadly: 'The sentence is celebrating an amazing ability, not expressing sadness — the swap changes the whole tone.',
          Slowly: '"Remarkably" describes how impressive the fact is, not the speed of anything.',
          Rarely: 'This word sounds a little like "remarkably" but means something completely different — swap it in and the sentence stops making sense.',
        },
      },
    },
    // ---- Q7: fiction vs non-fiction ----
    {
      id: 'passage-nonfiction-1-q7', tier: 2, format: 'mcq5', skill: 'text', lineRef: '4',
      stem: '<b>Line 4</b> calls this piece of writing a "report" that explains real facts about the flower. Is this report fiction or non-fiction?',
      options: [
        { text: 'Non-fiction — it is built from real facts about a real flower', misconception: null },
        { text: 'Fiction — it is an invented story about a made-up flower', misconception: 'fiction-confusion' },
        { text: 'Poetry — it is written in rhyming verse', misconception: 'poetry-confusion' },
        { text: 'A glossary — it lists word meanings alphabetically', misconception: 'wrong-book-part' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: is this INVENTED, or is it TRUE?',
        'Rafflesia is a real plant — check line 4 again: does the writer call this a "report" that explains real facts, or a made-up tale?',
      ],
      explain: {
        rule: RULE_TEXT,
        worked: 'Line 4 calls this a "report" that "explains" real facts about a real flower — nothing here is invented, so this is non-fiction.',
        whyWrong: {
          'Fiction — it is an invented story about a made-up flower': 'Rafflesia is a real plant studied by real scientists — nothing in this report is invented.',
          'Poetry — it is written in rhyming verse': 'This report is written in ordinary sentences and paragraphs (prose), with no rhyme at all.',
          'A glossary — it lists word meanings alphabetically': 'A glossary is a book PART that explains tricky words — this question is about fiction vs non-fiction, not book parts.',
        },
      },
    },
    // ---- Q8-Q13: wordentry ----
    {
      id: 'passage-nonfiction-1-q8', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '14',
      stem: 'According to <b>line 14</b>, copy the exact nickname (two words) given to Rafflesia.',
      hint: 'copy the exact phrase (2 words)', maxLen: 30, exact: true,
      accept: ['corpse lily', 'Corpse lily', 'Corpse Lily'],
      hintSteps: [
        "Don't guess from memory — go BACK to line 14 and put your finger right on it.",
        'The nickname sits inside quotation marks in that line — copy it exactly, without the quotation marks.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 14 says Rafflesia "is nicknamed the “corpse lily”" — copying exactly gives: corpse lily.',
      },
    },
    {
      id: 'passage-nonfiction-1-q9', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '6-12',
      stem: 'Line 12 describes the flower as "giant". Find one other word in <b>lines 6-12</b> that also means very big.',
      hint: 'one word', maxLen: 20,
      accept: ['largest'],
      hintSteps: [
        'Swap words into the sentence and read it aloud — only a true big-size meaning survives the swap.',
        'Look at line 6 — one word there also describes the flower\'s huge size.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 6 says Rafflesia arnoldii "is the largest single flower on Earth" — largest means the same kind of very-big idea as "giant".',
      },
    },
    {
      id: 'passage-nonfiction-1-q10', tier: 2, format: 'wordentry', skill: 'lang', lineRef: '33',
      stem: 'In <b>line 33</b>, "a stinking rival", what word class (part of speech) is the word <b>stinking</b>?',
      hint: 'one word', maxLen: 20,
      accept: ['adjective'],
      hintSteps: [
        'Ask what JOB the word "stinking" is doing in this sentence.',
        'It describes the noun "rival" — a word that describes a noun is that word class.',
      ],
      explain: {
        rule: RULE_LANG_POS,
        worked: '"Stinking" describes the noun "rival", telling us what kind of rival it is — that describing job makes it an adjective.',
      },
    },
    {
      id: 'passage-nonfiction-1-q11', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '33-37',
      stem: 'Line 35 calls the titan arum the "tallest" flower structure. Find one other word in <b>lines 33-37</b> that also describes something as very big or tall.',
      hint: 'one word', maxLen: 20,
      accept: ['towering'],
      hintSteps: [
        'Swap words into the sentence and read it aloud — only a true big-or-tall meaning survives the swap.',
        'Look at line 34 — one word there describes the plant\'s huge height.',
      ],
      explain: {
        rule: RULE_VOCAB,
        worked: 'Line 34 says "This towering plant can grow over three metres tall" — towering describes something very tall, the same idea as "tallest".',
      },
    },
    {
      id: 'passage-nonfiction-1-q12', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '44',
      stem: 'Copy the exact phrase (five words) from <b>line 44</b> that shows how rare Rafflesia is.',
      hint: 'copy the exact phrase (5 words)', maxLen: 40, exact: true,
      accept: ['one of the rarest flowers', 'One of the rarest flowers'],
      hintSteps: [
        "Don't guess from memory — go BACK to line 44 and put your finger right on it.",
        'Read line 44 word for word and copy the five words that describe how rare the flower is.',
      ],
      explain: {
        rule: RULE_LIT,
        worked: 'Line 44 says: "This makes Rafflesia one of the rarest flowers on the planet." Copying exactly the five words about rarity gives: one of the rarest flowers.',
      },
    },
    {
      id: 'passage-nonfiction-1-q13', tier: 2, format: 'wordentry', skill: 'text', lineRef: null,
      stem: 'This report is written in full sentences and paragraphs, with no rhyming lines. Is that form called prose or poetry?',
      hint: 'one word', maxLen: 20, exact: true,
      accept: ['prose', 'Prose'],
      hintSteps: [
        'Ask: is the writing arranged in ordinary sentences and paragraphs, or in short rhyming lines?',
        'Nothing in this report rhymes and nothing is split into short verse lines — what form does that make it?',
      ],
      explain: {
        rule: RULE_TEXT,
        worked: 'The report is set out in ordinary sentences and paragraphs, with no rhyme or verse lines — that form is called prose.',
      },
    },
  ],
};
