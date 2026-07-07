// FART QUEST topic: Paragraph Pass (Grammar Grotto)
// Authored content — implementation agents: read, never modify.

const RULE = 'Phrase = a few words; sentence = a complete thought with a verb; paragraph = sentences about one idea; chapter = paragraphs about one part of the story.';

export default {
  id: 'sentence-parts',
  name: 'Paragraph Pass',
  region: 'grammar-grotto',
  bankTopic: true,
  tagline: 'Paragraph Pete never blurts out a jumble of words — every block of his writing is built, checked and complete.',

  creature: {
    id: 'paragraph-pete',
    name: 'Paragraph Pete',
    rarity: 'rare',
    image: 'assets/monsters/paragraph-pete.png',
    bio: 'Paragraph Pete never blurts out a jumble of words — every thought he shares comes out as a tidy, complete sentence, and the moment his topic changes, so does his paragraph. Interrupt him mid-thought and he will simply wait, patiently, until it is whole again.',
    factSneak: 'A sentence is a COMPLETE thought with a subject and a verb — a paragraph is several sentences that all share ONE idea.',
  },

  weapon: {
    id: 'building-blocks-kit',
    name: 'The Building Blocks Kit',
    tagline: 'Four blocks, one ladder — never confuse a scrap of words for the real thing.',
    rule: RULE,
    example: '"Under the old bridge" is only a phrase — but "Jarlath hid under the old bridge" is a whole sentence. Job = <b>complete</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-sentence',
      text: 'Gather round, brave hero! Writing is built out of BLOCKS, just like a castle — a few loose words, a whole sentence, a tidy paragraph, and a great big chapter. Learn the ladder, and you will never mix up a scrap of words for the real thing again!',
    },
    {
      type: 'show',
      title: 'The Four Building Blocks',
      html: `<p>Writing is built from FOUR blocks, each one bigger than the last:</p>
<ul>
<li><b>Phrase</b> — a few words, no complete thought. ("under the wobbly climbing frame")</li>
<li><b>Sentence</b> — a COMPLETE thought with a subject and a verb. ("Jarlath hid under the wobbly climbing frame.")</li>
<li><b>Paragraph</b> — several sentences, all about ONE idea.</li>
<li><b>Chapter</b> — several paragraphs, all about one PART of the story.</li>
</ul>
<div class="law-scroll">📜 THE SIZE LADDER: phrase → sentence → paragraph → chapter. Each block is built from smaller blocks below it.</div>`,
    },
    {
      type: 'show',
      title: 'Is It Really a Sentence?',
      html: `<p>A phrase LOOKS like it might be a sentence — but something is missing. Ask two questions:</p>
<ol><li>Is there a NAMING part (who or what)?</li><li>Is there a DOING part (a verb) that finishes the thought?</li></ol>
<p>"Racing across the muddy playground at lunchtime." — that is just a phrase: WHO was racing? It never tells us. Add a naming part: "Jarlath was racing across the muddy playground at lunchtime." Now it is a complete sentence.</p>
<div class="law-scroll">📜 THE SENTENCE TEST: read it alone — if it leaves you asking "who?" or "so what happened?", it is still only a phrase.</div>`,
    },
    {
      type: 'talk',
      text: 'Here is the sneaky bit, young stinker: some phrases are LONG and sound very grand, but length does not matter one bit. Only completeness counts!',
    },
    {
      type: 'show',
      title: 'Building a Paragraph',
      html: `<p>One sentence cannot carry a whole idea on its own — so we group sentences that share ONE topic into a paragraph.</p>
<p>"Jarlath packed his football boots. He checked his shin pads twice. Finally he zipped up his kit bag." Three sentences — all about ONE idea: getting ready for football. Together, that is a paragraph.</p>
<div class="law-scroll">📜 A paragraph stays on ONE idea. The moment the topic changes, a NEW paragraph should start.</div>`,
    },
    {
      type: 'show',
      title: 'Starting a New Paragraph',
      html: `<p>Paragraphs bundle into chapters the same way sentences bundle into paragraphs — each new PART of a story gets its own chapter.</p>
<p>Imagine this short story text:<br>"Jarlath tied his laces. He grabbed his water bottle. He ran to the bus stop.<br>At school, the teacher called the register. Everyone cheered — it was match day!"</p>
<p>The third line starts a NEW paragraph, because the idea switches from getting ready AT HOME to arriving AT SCHOOL.</p>
<div class="law-scroll">📜 Spot a new paragraph the same way you spot a new idea: ask "has the topic just changed?"</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'sentence-parts-try-1', topicId: 'sentence-parts', tier: 1, format: 'mcq5',
        stem: 'Which of these is a COMPLETE SENTENCE, not just a phrase?',
        options: [
          { text: 'The dog buried a smelly bone behind the shed.', misconception: null },
          { text: 'Behind the wooden shed near the broken gate.', misconception: 'phrase-no-subject-verb' },
          { text: 'Digging quickly in the muddy flower bed.', misconception: 'phrase-dangling-verb' },
          { text: 'After burying the bone this morning.', misconception: 'phrase-incomplete-clause' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Ask: is there a naming part AND a doing part that finish the thought?',
          'Which one tells us WHO did something, and what actually happened?',
        ],
        explain: {
          rule: RULE,
          worked: '"The dog buried a smelly bone behind the shed" names WHO (the dog) and finishes the thought (buried a smelly bone) — a complete sentence. The other three leave you asking "who?" or "so what?" — they are only phrases.',
          whyWrong: {
            'Behind the wooden shed near the broken gate.': 'This only tells us WHERE — there is no naming part doing anything.',
            'Digging quickly in the muddy flower bed.': 'This has no clear WHO — the digging is left dangling with nobody attached to it.',
            'After burying the bone this morning.': 'This sets up a moment in time but never finishes the thought.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'sentence-parts-try-2', topicId: 'sentence-parts', tier: 2, format: 'mcq5',
        stem: 'Put the building blocks in order from SMALLEST to LARGEST — which list is correct?',
        options: [
          { text: 'phrase, sentence, paragraph, chapter', misconception: null },
          { text: 'sentence, phrase, paragraph, chapter', misconception: 'swap-first-two' },
          { text: 'phrase, paragraph, sentence, chapter', misconception: 'swap-middle-two' },
          { text: 'phrase, sentence, chapter, paragraph', misconception: 'swap-last-two' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Start with the smallest possible block — just a few words with no complete thought.',
          'Then build up: which block is made of several of the one before it?',
        ],
        explain: {
          rule: RULE,
          worked: 'A phrase is a few words; a sentence is a phrase turned into a complete thought; a paragraph groups several sentences about one idea; a chapter groups several paragraphs about one part of the story — so: phrase, sentence, paragraph, chapter.',
          whyWrong: {
            'sentence, phrase, paragraph, chapter': 'A phrase is SMALLER than a sentence — it comes first, not second.',
            'phrase, paragraph, sentence, chapter': 'A paragraph is BIGGER than a sentence — it should come after it, not before.',
            'phrase, sentence, chapter, paragraph': 'A chapter is the BIGGEST block of all — it belongs last, after paragraph.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Ask: is there a naming part AND a doing part that finish the thought — if not, it is only a phrase.',
    'The size ladder: phrase → sentence → paragraph → chapter — each is built from several of the block below it.',
    'A paragraph sticks to ONE idea; the moment the topic changes, a new paragraph should start.',
    'A phrase can be long and still not be a sentence — length does not matter, completeness does.',
    'Read it alone: if it leaves you asking "who?" or "so what happened?", it is still just a phrase.',
    'A chapter is paragraphs about one PART of a story, not the whole book.',
  ],

  bank: [
    // ---------- TIER 1 (10) — straightforward is-it-a-sentence + size-ladder definitions ----------
    {
      id: 'sentence-parts-t1-01', tier: 1, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE, not just a phrase?',
      options: [
        { text: 'The dog buried a smelly bone behind the shed.', misconception: null },
        { text: 'Behind the wooden shed near the broken gate.', misconception: 'phrase-no-subject-verb' },
        { text: 'Digging quickly in the muddy flower bed.', misconception: 'phrase-dangling-verb' },
        { text: 'After burying the bone this morning.', misconception: 'phrase-incomplete-clause' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: is there a naming part AND a doing part that finish the thought?',
        'Which one tells us WHO did something, and what actually happened?',
      ],
      explain: {
        rule: RULE,
        worked: '"The dog buried a smelly bone behind the shed" names WHO (the dog) and finishes the thought — a complete sentence. The rest leave you asking "who?" or "so what?"',
        whyWrong: {
          'Behind the wooden shed near the broken gate.': 'This only tells us WHERE — there is no naming part doing anything.',
          'Digging quickly in the muddy flower bed.': 'This has no clear WHO — the digging is left dangling with nobody attached to it.',
          'After burying the bone this morning.': 'This sets up a moment in time but never finishes the thought.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-02', tier: 1, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE, not just a phrase?',
      options: [
        { text: 'Waiting patiently at the cold bus stop.', misconception: 'phrase-dangling-verb' },
        { text: 'Every morning before the first bell rings.', misconception: 'phrase-incomplete-clause' },
        { text: 'Jarlath ran to catch the last school bus.', misconception: null },
        { text: 'Down the long hill past the corner shop.', misconception: 'phrase-no-subject-verb' },
      ],
      correctIndex: 2,
      hintSteps: [
        'Ask: is there a naming part AND a doing part that finish the thought?',
        'Which one tells us WHO did something, and what actually happened?',
      ],
      explain: {
        rule: RULE,
        worked: '"Jarlath ran to catch the last school bus" names WHO (Jarlath) and completes the thought (ran to catch the bus). The rest are only phrases.',
        whyWrong: {
          'Waiting patiently at the cold bus stop.': 'Nobody is named as doing the waiting — the verb is left dangling.',
          'Every morning before the first bell rings.': 'This sets up a moment in time but never finishes the thought.',
          'Down the long hill past the corner shop.': 'This only tells us WHERE — there is no naming part doing anything.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-03', tier: 1, format: 'mcq5',
      stem: 'Which block is a COMPLETE thought with a subject and a verb?',
      options: [
        { text: 'phrase', misconception: 'confused-with-phrase' },
        { text: 'sentence', misconception: null },
        { text: 'paragraph', misconception: 'confused-with-paragraph' },
        { text: 'chapter', misconception: 'confused-with-chapter' },
      ],
      correctIndex: 1,
      hintSteps: [
        'Which block names WHO or WHAT, and finishes with a whole action?',
        'It is the smallest block that can stand completely alone.',
      ],
      explain: {
        rule: RULE,
        worked: 'A sentence is the smallest block that names something AND finishes a whole action — a complete thought with a subject and a verb.',
        whyWrong: {
          phrase: 'A phrase is only a FEW WORDS — it never finishes a whole thought on its own.',
          paragraph: 'A paragraph is made of SEVERAL sentences, not just one complete thought.',
          chapter: 'A chapter is made of several paragraphs — much bigger than one complete thought.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-04', tier: 1, format: 'mcq5',
      stem: 'Which block is just a FEW WORDS, without a complete thought?',
      options: [
        { text: 'sentence', misconception: 'confused-with-sentence' },
        { text: 'paragraph', misconception: 'confused-with-paragraph' },
        { text: 'chapter', misconception: 'confused-with-chapter' },
        { text: 'phrase', misconception: null },
      ],
      correctIndex: 3,
      hintSteps: [
        'Which block is the SMALLEST of all four?',
        'It never has a naming part and a finished action together.',
      ],
      explain: {
        rule: RULE,
        worked: 'A phrase is only a few words — it never has a complete thought on its own, unlike a sentence.',
        whyWrong: {
          sentence: 'A sentence DOES finish a complete thought — a phrase never does.',
          paragraph: 'A paragraph is much bigger — several whole sentences about one idea.',
          chapter: 'A chapter is bigger still — several paragraphs about one part of a story.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-05', tier: 1, format: 'mcq5',
      stem: 'Which block groups several sentences that are all about ONE idea?',
      options: [
        { text: 'chapter', misconception: 'confused-with-chapter' },
        { text: 'paragraph', misconception: null },
        { text: 'sentence', misconception: 'confused-with-sentence' },
        { text: 'phrase', misconception: 'confused-with-phrase' },
      ],
      correctIndex: 1,
      hintSteps: [
        'Which block bundles MORE THAN ONE sentence together?',
        'It stays on ONE topic the whole way through.',
      ],
      explain: {
        rule: RULE,
        worked: 'A paragraph bundles several sentences together, as long as they all share ONE idea.',
        whyWrong: {
          chapter: 'A chapter bundles several PARAGRAPHS, not just sentences.',
          sentence: 'A single sentence is only ONE complete thought, not a group of them.',
          phrase: 'A phrase is smaller than a sentence — it cannot group anything.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-06', tier: 1, format: 'mcq5',
      stem: 'Which block groups several paragraphs about ONE part of a story?',
      options: [
        { text: 'chapter', misconception: null },
        { text: 'paragraph', misconception: 'confused-with-paragraph' },
        { text: 'sentence', misconception: 'confused-with-sentence' },
        { text: 'phrase', misconception: 'confused-with-phrase' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which block is the BIGGEST of all four?',
        'It is made of several paragraphs, not just sentences.',
      ],
      explain: {
        rule: RULE,
        worked: 'A chapter bundles several paragraphs together, all about one part of the story.',
        whyWrong: {
          paragraph: 'A paragraph only bundles sentences — a chapter bundles paragraphs.',
          sentence: 'A sentence is far smaller — just one complete thought.',
          phrase: 'A phrase is the smallest block of all — just a few words.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-07', tier: 1, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE, not just a phrase?',
      options: [
        { text: 'Sprinting down the wing towards the goal.', misconception: 'phrase-dangling-verb' },
        { text: 'Just before the final whistle blew today.', misconception: 'phrase-incomplete-clause' },
        { text: 'Across the muddy pitch and past two defenders.', misconception: 'phrase-no-subject-verb' },
        { text: 'Jarlath smashed the ball into the top corner.', misconception: null },
      ],
      correctIndex: 3,
      hintSteps: [
        'Ask: is there a naming part AND a doing part that finish the thought?',
        'Which one tells us WHO did something, and what actually happened?',
      ],
      explain: {
        rule: RULE,
        worked: '"Jarlath smashed the ball into the top corner" names WHO (Jarlath) and completes the action — a full sentence. The rest are only phrases.',
        whyWrong: {
          'Sprinting down the wing towards the goal.': 'Nobody is named as doing the sprinting — the verb is left dangling.',
          'Just before the final whistle blew today.': 'This sets up a moment in time but never finishes the thought.',
          'Across the muddy pitch and past two defenders.': 'This only tells us WHERE — there is no naming part doing anything.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-08', tier: 1, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE, not just a phrase?',
      options: [
        { text: 'Near the smelly bins behind the corner shop.', misconception: 'phrase-no-subject-verb' },
        { text: 'Giggling helplessly at the enormous parp.', misconception: 'phrase-dangling-verb' },
        { text: 'Whiffbeard let out an enormous parp in the hall.', misconception: null },
        { text: 'Right after the loud, echoing parp.', misconception: 'phrase-incomplete-clause' },
      ],
      correctIndex: 2,
      hintSteps: [
        'Ask: is there a naming part AND a doing part that finish the thought?',
        'Which one tells us WHO did something, and what actually happened?',
      ],
      explain: {
        rule: RULE,
        worked: '"Whiffbeard let out an enormous parp in the hall" names WHO (Whiffbeard) and completes the action. The rest are only phrases.',
        whyWrong: {
          'Near the smelly bins behind the corner shop.': 'This only tells us WHERE — there is no naming part doing anything.',
          'Giggling helplessly at the enormous parp.': 'Nobody is named as doing the giggling — the verb is left dangling.',
          'Right after the loud, echoing parp.': 'This sets up a moment in time but never finishes the thought.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-09', tier: 1, format: 'mcq5',
      stem: 'Put the building blocks in order from SMALLEST to LARGEST — which list is correct?',
      options: [
        { text: 'phrase, sentence, paragraph, chapter', misconception: null },
        { text: 'sentence, phrase, paragraph, chapter', misconception: 'swap-first-two' },
        { text: 'phrase, paragraph, sentence, chapter', misconception: 'swap-middle-two' },
        { text: 'phrase, sentence, chapter, paragraph', misconception: 'swap-last-two' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Start with the smallest possible block — just a few words with no complete thought.',
        'Then build up: which block is made of several of the one before it?',
      ],
      explain: {
        rule: RULE,
        worked: 'A phrase is a few words; a sentence is a complete thought; a paragraph groups several sentences; a chapter groups several paragraphs — so: phrase, sentence, paragraph, chapter.',
        whyWrong: {
          'sentence, phrase, paragraph, chapter': 'A phrase is SMALLER than a sentence — it comes first, not second.',
          'phrase, paragraph, sentence, chapter': 'A paragraph is BIGGER than a sentence — it should come after it, not before.',
          'phrase, sentence, chapter, paragraph': 'A chapter is the BIGGEST block of all — it belongs last, after paragraph.',
        },
      },
    },
    {
      id: 'sentence-parts-t1-10', tier: 1, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE, not just a phrase?',
      options: [
        { text: 'Finishing every last page of the maths homework.', misconception: 'phrase-dangling-verb' },
        { text: 'Jarlath finished every last page of his maths homework.', misconception: null },
        { text: 'Long before dinner was even ready tonight.', misconception: 'phrase-incomplete-clause' },
        { text: 'Underneath the pile of scattered exercise books.', misconception: 'phrase-no-subject-verb' },
      ],
      correctIndex: 1,
      hintSteps: [
        'Ask: is there a naming part AND a doing part that finish the thought?',
        'Which one tells us WHO did something, and what actually happened?',
      ],
      explain: {
        rule: RULE,
        worked: '"Jarlath finished every last page of his maths homework" names WHO (Jarlath) and completes the action. The rest are only phrases.',
        whyWrong: {
          'Finishing every last page of the maths homework.': 'Nobody is named as doing the finishing — the verb is left dangling.',
          'Long before dinner was even ready tonight.': 'This sets up a moment in time but never finishes the thought.',
          'Underneath the pile of scattered exercise books.': 'This only tells us WHERE — there is no naming part doing anything.',
        },
      },
    },

    // ---------- TIER 2 (10) — subordinate-clause traps, mini-text paragraph starts, ordering, selecttwo ----------
    {
      id: 'sentence-parts-t2-01', tier: 2, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE?',
      options: [
        { text: 'Because the goalkeeper arrived late for training.', misconception: 'phrase-subordinate-clause' },
        { text: 'The whole team waited nervously by the changing room door.', misconception: null },
        { text: 'Even though the rain had not stopped all morning.', misconception: 'phrase-subordinate-clause' },
        { text: 'Standing quietly at the edge of the pitch.', misconception: 'phrase-dangling-verb' },
      ],
      correctIndex: 1,
      hintSteps: [
        'These all SOUND like whole sentences — but some depend on another idea to finish them.',
        'Read each one alone: does it need a "because" or "even though" companion sentence to make sense?',
      ],
      explain: {
        rule: RULE,
        worked: '"The whole team waited nervously by the changing room door" stands completely alone — a naming part and a finished action. The others all lean on a missing idea or dangle a verb with no subject.',
        whyWrong: {
          'Because the goalkeeper arrived late for training.': 'This explains a reason, but a reason for WHAT? It needs another sentence to lean on.',
          'Even though the rain had not stopped all morning.': 'This sets up a contrast, but never says what happened despite it.',
          'Standing quietly at the edge of the pitch.': 'There is no clear WHO doing the standing — the verb is left dangling.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-02', tier: 2, format: 'mcq5',
      stem: 'Read this mini story: (1) Jarlath tied his football boots tightly. (2) He checked his shin pads twice before leaving. (3) At school, the teacher marked the register first thing. (4) Everyone cheered when she announced it was match day. Which sentence should start a NEW paragraph?',
      options: [
        { text: 'Sentence 2', misconception: 'wrong-same-idea' },
        { text: 'Sentence 3', misconception: null },
        { text: 'Sentence 4', misconception: 'wrong-same-idea' },
        { text: 'No new paragraph is needed', misconception: 'missed-topic-change' },
      ],
      correctIndex: 1,
      hintSteps: [
        'Sentences 1 and 2 both happen AT HOME, getting ready — where does the idea shift?',
        'Sentence 3 suddenly moves the story to a new place: school.',
      ],
      explain: {
        rule: RULE,
        worked: 'Sentences 1-2 share ONE idea: getting ready at home. Sentence 3 shifts to a new idea — arriving at school — so a new paragraph starts there.',
        whyWrong: {
          'Sentence 2': 'Sentence 2 still shares the SAME idea as sentence 1 — getting ready at home.',
          'Sentence 4': 'Sentence 4 continues the SAME idea as sentence 3 — being at school on match day.',
          'No new paragraph is needed': 'The topic clearly shifts from home to school — that shift needs a new paragraph.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-03', tier: 2, format: 'mcq5',
      stem: 'Which list correctly orders the blocks from LARGEST to SMALLEST?',
      options: [
        { text: 'chapter, paragraph, sentence, phrase', misconception: null },
        { text: 'chapter, sentence, paragraph, phrase', misconception: 'swap-middle-two' },
        { text: 'paragraph, chapter, sentence, phrase', misconception: 'swap-first-two' },
        { text: 'chapter, paragraph, phrase, sentence', misconception: 'swap-last-two' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Start from the BIGGEST block this time — several paragraphs make up one of these.',
        'Then shrink down: which block is made of several sentences? Which is smaller still?',
      ],
      explain: {
        rule: RULE,
        worked: 'A chapter is biggest (several paragraphs), then paragraph (several sentences), then sentence (one complete thought), then phrase — the smallest block of all.',
        whyWrong: {
          'chapter, sentence, paragraph, phrase': 'A paragraph is BIGGER than a sentence — it should come before it, not after.',
          'paragraph, chapter, sentence, phrase': 'A chapter is BIGGER than a paragraph — it belongs first, not second.',
          'chapter, paragraph, phrase, sentence': 'A sentence is BIGGER than a phrase — it should come before it, not after.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-04', tier: 2, format: 'selecttwo',
      stem: 'Tap the TWO word groups that are COMPLETE SENTENCES.',
      options: [
        { text: 'The class lined up quietly outside the hall.' },
        { text: 'Waiting eagerly for the sports day results.' },
        { text: 'Miss Andrews read out every winner’s name.' },
        { text: 'Just after the very last race finished.' },
        { text: 'Cheering loudly from the muddy touchline.' },
      ],
      correctIndices: [0, 2],
      hintSteps: [
        'Two of these name WHO did something and finish the action — the rest dangle a verb or a moment in time.',
        'Read each one alone: which two make complete sense without anything extra?',
      ],
      explain: {
        rule: RULE,
        worked: '"The class lined up quietly outside the hall" and "Miss Andrews read out every winner’s name" both name a WHO and finish a whole action — complete sentences.',
        whyWrong: {
          'Waiting eagerly for the sports day results.': 'Nobody is named as doing the waiting — the verb is left dangling.',
          'Just after the very last race finished.': 'This sets up a moment in time but never finishes the thought.',
          'Cheering loudly from the muddy touchline.': 'Nobody is named as doing the cheering — the verb is left dangling.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-05', tier: 2, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE?',
      options: [
        { text: 'Whenever the dragon let out a thunderous roar.', misconception: 'phrase-subordinate-clause' },
        { text: 'Jarlath and Whiffbeard crept slowly past the sleeping dragon.', misconception: null },
        { text: 'Sneaking carefully around the enormous pile of gold.', misconception: 'phrase-dangling-verb' },
        { text: 'Right before the dragon opened one giant eye.', misconception: 'phrase-incomplete-clause' },
      ],
      correctIndex: 1,
      hintSteps: [
        'These all SOUND like whole sentences — but some depend on another idea to finish them.',
        'Which one names WHO did something and finishes the action, with nothing missing?',
      ],
      explain: {
        rule: RULE,
        worked: '"Jarlath and Whiffbeard crept slowly past the sleeping dragon" stands completely alone. The others lean on a missing idea or dangle a verb with no subject.',
        whyWrong: {
          'Whenever the dragon let out a thunderous roar.': 'This sets up a repeated moment but never says what happened when it did.',
          'Sneaking carefully around the enormous pile of gold.': 'There is no clear WHO doing the sneaking — the verb is left dangling.',
          'Right before the dragon opened one giant eye.': 'This sets up a moment in time but never finishes the thought.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-06', tier: 2, format: 'mcq5',
      stem: 'Read this mini story: (1) The coach pulled up outside the old museum gates. (2) Everyone filed off in a long, noisy line. (3) Later that evening, Jarlath told his mum all about the dinosaur bones. (4) She laughed at the parp joke he had learned from the tour guide. Which sentence should start a NEW paragraph?',
      options: [
        { text: 'Sentence 2', misconception: 'wrong-same-idea' },
        { text: 'Sentence 3', misconception: null },
        { text: 'Sentence 4', misconception: 'wrong-same-idea' },
        { text: 'No new paragraph is needed', misconception: 'missed-topic-change' },
      ],
      correctIndex: 1,
      hintSteps: [
        'Sentences 1 and 2 both happen AT THE MUSEUM — where does the idea shift?',
        'Sentence 3 suddenly moves the story to a new time and place: that evening, at home.',
      ],
      explain: {
        rule: RULE,
        worked: 'Sentences 1-2 share ONE idea: arriving at the museum. Sentence 3 shifts to a new idea — telling mum at home — so a new paragraph starts there.',
        whyWrong: {
          'Sentence 2': 'Sentence 2 still shares the SAME idea as sentence 1 — arriving at the museum.',
          'Sentence 4': 'Sentence 4 continues the SAME idea as sentence 3 — telling mum about the trip.',
          'No new paragraph is needed': 'The topic clearly shifts from the museum trip to telling mum at home — that shift needs a new paragraph.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-07', tier: 2, format: 'mcq5',
      stem: 'Which block is BIGGER than a phrase, but SMALLER than a paragraph?',
      options: [
        { text: 'sentence', misconception: null },
        { text: 'chapter', misconception: 'confused-with-chapter' },
        { text: 'paragraph', misconception: 'confused-with-paragraph' },
        { text: 'phrase', misconception: 'confused-with-phrase' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which block sits exactly between the smallest and third-biggest blocks?',
        'It is one complete thought — bigger than a scrap of words, smaller than a whole group of sentences.',
      ],
      explain: {
        rule: RULE,
        worked: 'A sentence sits exactly between the two — bigger than a few loose words (a phrase), but smaller than a whole group of sentences (a paragraph).',
        whyWrong: {
          chapter: 'A chapter is the BIGGEST block of all — much bigger than a paragraph, not smaller.',
          paragraph: 'A paragraph is already BIGGER than a phrase and sentence — it does not fit between them.',
          phrase: 'A phrase is the SMALLEST block — it cannot be bigger than itself.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-08', tier: 2, format: 'selecttwo',
      stem: 'Tap the TWO word groups that are only PHRASES, not full sentences.',
      options: [
        { text: 'Splashing about in the deep end of the pool.' },
        { text: 'The lifeguard blew her whistle twice.' },
        { text: 'During the very last swimming lesson of term.' },
        { text: 'Jarlath finally managed a whole width of front crawl.' },
        { text: 'Everyone clapped when he touched the far wall.' },
      ],
      correctIndices: [0, 2],
      hintSteps: [
        'Two of these dangle a verb or a moment in time — the rest name a WHO and finish a whole action.',
        'Read each one alone: which two leave you asking "who?" or "so what happened?"',
      ],
      explain: {
        rule: RULE,
        worked: '"Splashing about in the deep end of the pool" dangles its verb with no WHO, and "During the very last swimming lesson of term" only sets up a moment in time — both are only phrases.',
        whyWrong: {
          'The lifeguard blew her whistle twice.': 'This already names a WHO and finishes the action — it is a full sentence, not a phrase.',
          'Jarlath finally managed a whole width of front crawl.': 'This already names a WHO and finishes the action — it is a full sentence, not a phrase.',
          'Everyone clapped when he touched the far wall.': 'This already names a WHO and finishes the action — it is a full sentence, not a phrase.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-09', tier: 2, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE?',
      options: [
        { text: 'Blowing out all ten candles in one enormous puff.', misconception: 'phrase-dangling-verb' },
        { text: 'Because the cake had already started to wobble.', misconception: 'phrase-subordinate-clause' },
        { text: 'The whole party burst into applause and laughter.', misconception: null },
        { text: 'Just as the candles began to flicker out.', misconception: 'phrase-incomplete-clause' },
      ],
      correctIndex: 2,
      hintSteps: [
        'These all SOUND like whole sentences — but some depend on another idea to finish them.',
        'Which one names WHO did something and finishes the action, with nothing missing?',
      ],
      explain: {
        rule: RULE,
        worked: '"The whole party burst into applause and laughter" stands completely alone. The others lean on a missing idea or dangle a verb with no subject.',
        whyWrong: {
          'Blowing out all ten candles in one enormous puff.': 'Nobody is named as doing the blowing — the verb is left dangling.',
          'Because the cake had already started to wobble.': 'This explains a reason, but a reason for WHAT? It needs another sentence to lean on.',
          'Just as the candles began to flicker out.': 'This sets up a moment in time but never finishes the thought.',
        },
      },
    },
    {
      id: 'sentence-parts-t2-10', tier: 2, format: 'mcq5',
      stem: 'Put the building blocks in order from SMALLEST to LARGEST — which list is correct?',
      options: [
        { text: 'phrase, sentence, paragraph, chapter', misconception: null },
        { text: 'phrase, sentence, chapter, paragraph', misconception: 'swap-last-two' },
        { text: 'sentence, phrase, paragraph, chapter', misconception: 'swap-first-two' },
        { text: 'phrase, paragraph, sentence, chapter', misconception: 'swap-middle-two' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Start with the smallest possible block — just a few words with no complete thought.',
        'Then build up: which block is made of several of the one before it?',
      ],
      explain: {
        rule: RULE,
        worked: 'A phrase is a few words; a sentence is a complete thought; a paragraph groups several sentences; a chapter groups several paragraphs — so: phrase, sentence, paragraph, chapter.',
        whyWrong: {
          'phrase, sentence, chapter, paragraph': 'A paragraph is SMALLER than a chapter — it belongs third, not last.',
          'sentence, phrase, paragraph, chapter': 'A phrase is SMALLER than a sentence — it comes first, not second.',
          'phrase, paragraph, sentence, chapter': 'A paragraph is BIGGER than a sentence — it should come after it, not before.',
        },
      },
    },

    // ---------- TIER 3 (8) — subtlest traps, subtler paragraph shifts, scrambled ordering, analogy, selecttwo ----------
    {
      id: 'sentence-parts-t3-01', tier: 3, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE?',
      options: [
        { text: 'Although the goalkeeper dived full-length to save it.', misconception: 'phrase-subordinate-clause' },
        { text: 'The crowd gasped as the ball hit the crossbar.', misconception: null },
        { text: 'Bouncing once before rolling agonisingly wide of the post.', misconception: 'phrase-dangling-verb' },
        { text: 'Just as the final whistle was about to blow.', misconception: 'phrase-incomplete-clause' },
      ],
      correctIndex: 1,
      hintSteps: [
        'This time EVERY option sounds fluent — read each one asking "could this stand completely alone in a book?"',
        'Only one option does not need another sentence stitched on to make sense.',
      ],
      explain: {
        rule: RULE,
        worked: '"The crowd gasped as the ball hit the crossbar" stands alone — no missing partner needed. "Although…", "Bouncing…" and "Just as…" all lean on an idea that never arrives.',
        whyWrong: {
          'Although the goalkeeper dived full-length to save it.': 'This sets up a contrast, but never says what happened despite the dive.',
          'Bouncing once before rolling agonisingly wide of the post.': 'There is no clear WHO doing the bouncing — the verb is left dangling.',
          'Just as the final whistle was about to blow.': 'This sets up a moment in time but never finishes the thought.',
        },
      },
    },
    {
      id: 'sentence-parts-t3-02', tier: 3, format: 'mcq5',
      stem: 'Read this mini story: (1) Jarlath and his sister built the tallest sandcastle on the beach. (2) They decorated the towers with tiny shells from the shoreline. (3) Down by the rock pools, Whiffbeard was hunting for hidden crabs. (4) He lifted every stone as carefully as he could. Which sentence should start a NEW paragraph?',
      options: [
        { text: 'Sentence 2', misconception: 'wrong-same-idea' },
        { text: 'Sentence 3', misconception: null },
        { text: 'Sentence 4', misconception: 'wrong-same-idea' },
        { text: 'No new paragraph is needed', misconception: 'missed-topic-change' },
      ],
      correctIndex: 1,
      hintSteps: [
        'Sentences 1-2 both focus on the sandcastle — where does the focus change to a different character and a different task?',
        'Sentence 3 moves us to a new spot on the beach and a new character entirely.',
      ],
      explain: {
        rule: RULE,
        worked: 'Sentences 1-2 share ONE idea: building the sandcastle. Sentence 3 shifts the focus to a different character and task at the rock pools — so a new paragraph starts there.',
        whyWrong: {
          'Sentence 2': 'Sentence 2 still shares the SAME idea as sentence 1 — decorating the sandcastle.',
          'Sentence 4': 'Sentence 4 continues the SAME idea as sentence 3 — Whiffbeard hunting for crabs.',
          'No new paragraph is needed': 'The focus clearly shifts from the sandcastle to Whiffbeard at the rock pools — that shift needs a new paragraph.',
        },
      },
    },
    {
      id: 'sentence-parts-t3-03', tier: 3, format: 'mcq5',
      stem: 'Which list correctly orders the blocks from SMALLEST to LARGEST?',
      options: [
        { text: 'sentence, phrase, chapter, paragraph', misconception: 'scrambled-order' },
        { text: 'paragraph, phrase, sentence, chapter', misconception: 'scrambled-order' },
        { text: 'phrase, sentence, paragraph, chapter', misconception: null },
        { text: 'phrase, chapter, sentence, paragraph', misconception: 'scrambled-order' },
      ],
      correctIndex: 2,
      hintSteps: [
        'Check the list all the way through this time, not just the first two blocks.',
        'The smallest block (a few words) must come first, and the biggest (several paragraphs) must come last.',
      ],
      explain: {
        rule: RULE,
        worked: 'Only "phrase, sentence, paragraph, chapter" keeps every block in the right place from smallest to largest.',
        whyWrong: {
          'sentence, phrase, chapter, paragraph': 'A phrase is SMALLER than a sentence, and a paragraph is SMALLER than a chapter — both pairs are swapped here.',
          'paragraph, phrase, sentence, chapter': 'A paragraph is much BIGGER than a phrase and a sentence — it cannot come first.',
          'phrase, chapter, sentence, paragraph': 'A chapter is the BIGGEST block — it cannot come second, before sentence and paragraph.',
        },
      },
    },
    {
      id: 'sentence-parts-t3-04', tier: 3, format: 'selecttwo',
      stem: 'Tap the TWO word groups that are COMPLETE SENTENCES.',
      options: [
        { text: 'Since the tide had already come in fast.' },
        { text: 'The rock pool sparkled with tiny darting fish.' },
        { text: 'Whiffbeard scooped up a wriggling crab in triumph.' },
        { text: 'Wading carefully across the slippery, seaweed-covered rocks.' },
        { text: 'Even though the crab pinched his finger hard.' },
      ],
      correctIndices: [1, 2],
      hintSteps: [
        'Two of these dangle a verb or lean on a missing idea — the other two stand completely alone.',
        'Read each one alone: which two make complete sense with nothing else needed?',
      ],
      explain: {
        rule: RULE,
        worked: '"The rock pool sparkled with tiny darting fish" and "Whiffbeard scooped up a wriggling crab in triumph" both name a WHO or WHAT and finish a whole action — complete sentences.',
        whyWrong: {
          'Since the tide had already come in fast.': 'This sets up a reason or a starting point, but never says what happened because of it.',
          'Wading carefully across the slippery, seaweed-covered rocks.': 'There is no clear WHO doing the wading — the verb is left dangling.',
          'Even though the crab pinched his finger hard.': 'This sets up a contrast, but never says what happened despite the pinch.',
        },
      },
    },
    {
      id: 'sentence-parts-t3-05', tier: 3, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE?',
      options: [
        { text: 'While the librarian stamped every single book.', misconception: 'phrase-subordinate-clause' },
        { text: 'Jarlath finally found the last dragon book on the shelf.', misconception: null },
        { text: 'Searching frantically through every single shelf in the library.', misconception: 'phrase-dangling-verb' },
        { text: 'Right before the library closed for lunch.', misconception: 'phrase-incomplete-clause' },
      ],
      correctIndex: 1,
      hintSteps: [
        'This time EVERY option sounds fluent — read each one asking "could this stand completely alone in a book?"',
        'Only one option does not need another sentence stitched on to make sense.',
      ],
      explain: {
        rule: RULE,
        worked: '"Jarlath finally found the last dragon book on the shelf" stands alone. The others lean on a missing idea or dangle a verb with no subject.',
        whyWrong: {
          'While the librarian stamped every single book.': 'This sets up a moment happening at the same time, but never says what happened during it.',
          'Searching frantically through every single shelf in the library.': 'There is no clear WHO doing the searching — the verb is left dangling.',
          'Right before the library closed for lunch.': 'This sets up a moment in time but never finishes the thought.',
        },
      },
    },
    {
      id: 'sentence-parts-t3-06', tier: 3, format: 'mcq5',
      stem: 'Read this mini story: (1) The camping tent flapped wildly in the wind all night. (2) Nobody managed to sleep until nearly dawn. (3) By breakfast, Whiffbeard had already eaten every last sausage. (4) He blamed the smell entirely on the campfire smoke. Which sentence should start a NEW paragraph?',
      options: [
        { text: 'Sentence 2', misconception: 'wrong-same-idea' },
        { text: 'Sentence 3', misconception: null },
        { text: 'Sentence 4', misconception: 'wrong-same-idea' },
        { text: 'No new paragraph is needed', misconception: 'missed-topic-change' },
      ],
      correctIndex: 1,
      hintSteps: [
        'Sentences 1-2 both focus on the wild, sleepless night — where does the idea shift?',
        'Sentence 3 moves the story on to a new time (breakfast) and a new event entirely.',
      ],
      explain: {
        rule: RULE,
        worked: 'Sentences 1-2 share ONE idea: the sleepless, windy night. Sentence 3 shifts to a new idea — breakfast and the missing sausages — so a new paragraph starts there.',
        whyWrong: {
          'Sentence 2': 'Sentence 2 still shares the SAME idea as sentence 1 — the sleepless night.',
          'Sentence 4': 'Sentence 4 continues the SAME idea as sentence 3 — the missing sausages at breakfast.',
          'No new paragraph is needed': 'The topic clearly shifts from the windy night to breakfast — that shift needs a new paragraph.',
        },
      },
    },
    {
      id: 'sentence-parts-t3-07', tier: 3, format: 'mcq5',
      stem: 'A phrase is to a SENTENCE as a sentence is to a ___.',
      options: [
        { text: 'paragraph', misconception: null },
        { text: 'chapter', misconception: 'too-big-a-jump' },
        { text: 'phrase', misconception: 'same-size-again' },
        { text: 'word', misconception: 'smaller-not-bigger' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A phrase needs more words added to become a whole sentence — what does a sentence need more OF, to become the next block up?',
        'Several complete sentences about ONE idea make up this next block.',
      ],
      explain: {
        rule: RULE,
        worked: 'A phrase grows into a sentence by becoming a complete thought; a sentence grows into a paragraph by joining several sentences about ONE idea.',
        whyWrong: {
          chapter: 'That jumps two whole sizes — a sentence must first become a paragraph.',
          phrase: 'That is the same size again, not the next size up.',
          word: 'That is smaller, not bigger — the ladder only goes up here.',
        },
      },
    },
    {
      id: 'sentence-parts-t3-08', tier: 3, format: 'mcq5',
      stem: 'Which of these is a COMPLETE SENTENCE?',
      options: [
        { text: 'Wobbling dangerously on the balance beam.', misconception: 'phrase-dangling-verb' },
        { text: 'Unless the next competitor was ready in time.', misconception: 'phrase-subordinate-clause' },
        { text: 'The whole class held their breath at the finish line.', misconception: null },
        { text: 'Just moments before the final buzzer sounded.', misconception: 'phrase-incomplete-clause' },
      ],
      correctIndex: 2,
      hintSteps: [
        'This time EVERY option sounds fluent — read each one asking "could this stand completely alone in a book?"',
        'Only one option does not need another sentence stitched on to make sense.',
      ],
      explain: {
        rule: RULE,
        worked: '"The whole class held their breath at the finish line" stands alone. The others lean on a missing idea or dangle a verb with no subject.',
        whyWrong: {
          'Wobbling dangerously on the balance beam.': 'Nobody is named as doing the wobbling — the verb is left dangling.',
          'Unless the next competitor was ready in time.': 'This sets up a condition, but never says what happens if it is not met.',
          'Just moments before the final buzzer sounded.': 'This sets up a moment in time but never finishes the thought.',
        },
      },
    },
  ],
};
