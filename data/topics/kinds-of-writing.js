// FART QUEST topic: The Signpost Shelf — kinds-of-writing (Storybog)
// Authored content — implementation agents: read, never modify.
// Bank-driven topic (bankTopic:true): per CONTENT_SPECS_ENGLISH this Storybog topic
// carries its OWN small mcq5 bank (book-parts questions don't need a passage), unlike
// the other Storybog skill-topics which draw from the shared passage pool.

const RULE = 'Contents = where chapters start; index = where topics hide (back, A-Z); glossary = word meanings; bibliography = books used. Fiction is invented; non-fiction is fact.';

export default {
  id: 'kinds-of-writing',
  name: 'The Signpost Shelf',
  region: 'storybog',
  bankTopic: true,
  tagline: 'Every book is covered in signposts — read them right and you will never be lost between two covers again.',

  creature: {
    id: 'contents-mcindex',
    name: 'Contents McIndex',
    rarity: 'rare',
    image: 'assets/monsters/contents-mcindex.png',
    bio: 'Contents McIndex has read every page of every book on the Shelf, but only remembers WHERE things are written, never what they say. Ask him anything and he\'ll point — never explain.',
    factSneak: 'Contents lists chapters in the order they appear (front, by page number); the index lists topics A-Z (back) — same shelf, two completely different jobs.',
  },

  weapon: {
    id: 'signpost-reader',
    name: 'The Signpost Reader',
    tagline: 'Never get lost inside a book again — just follow the signposts.',
    rule: RULE,
    example: 'Need a page number for Chapter 4? Check the <b>contents</b>. Need every page that mentions sharks? Check the <b>index</b> — it\'s alphabetical, at the back.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-kindsofw',
      text: 'Gather round, my brave little nose-soldier! Every book — EVERY single one — is covered in tiny signposts, and almost nobody bothers to read them. Learn these four little words and you will never again waste ten minutes hunting for a page that was one flick away the whole time.',
    },
    {
      type: 'show',
      title: 'Fiction or Non-Fiction? Ask ONE Question',
      html: `<p>Before you even open a book, ask yourself ONE big question: <b>is this INVENTED, or is this TRUE?</b></p>
<div class="law-scroll">📜 <b>THE FICTION LAW:</b> Fiction is invented — made up entirely inside someone's imagination. Non-fiction is fact — real events, real people, real information.</div>
<p><b>"The Dragon Who Lost His Roar"</b> is fiction — no dragon has genuinely mislaid a roar (probably). <b>"How Volcanoes Erupt"</b> is non-fiction — real melted rock, real explosions, nothing invented.</p>
<p>Watch for the sneaky ones: a book about a REAL footballer's REAL life can read excitingly, full of dramatic moments — but if every event actually happened, it is still non-fiction. A true story can still feel like a story.</p>`,
    },
    {
      type: 'show',
      title: 'The Front of the Book: Title Page and Contents',
      html: `<p>Open the front cover and the first signpost you meet is the <b>title page</b> — it announces the book's title, the author who wrote it, and the publisher who printed it. Nothing more.</p>
<p>A page or two further sits the <b>contents page</b> — a list of every chapter, IN THE ORDER it appears in the book, each one lined up with the page number it starts on.</p>
<div class="law-scroll">📜 <b>THE CONTENTS LAW:</b> Contents lists chapters in STORY ORDER (Chapter 1, then 2, then 3…) — never alphabetical order.</div>
<p>Want to know what page Chapter 5 begins on? Don't hunt through the whole book — flick straight to the contents page. That is exactly its job.</p>`,
    },
    {
      type: 'show',
      title: 'The Back of the Book: Index, Glossary and Bibliography',
      html: `<p>Flip all the way to the BACK of a non-fiction book and three more signposts are waiting, every one arranged in <b>A-Z alphabetical order</b>.</p>
<ul>
<li><b>Index</b> — every TOPIC or keyword in the book, alphabetically, with EVERY page it appears on (not just where it starts).</li>
<li><b>Glossary</b> — the tricky WORDS used in this particular book, alphabetically, with their MEANINGS explained simply.</li>
<li><b>Bibliography</b> — a list of every other book, website or source the author read while researching — proof their facts are real.</li>
</ul>
<div class="law-scroll">📜 <b>THE SIGNPOST LAW:</b> Index = where topics hide (back, A-Z). Glossary = word meanings. Bibliography = books used.</div>
<p>Don't forget the <b>blurb</b> on the back cover, either — a short, exciting taste of the story written to tempt you in, without giving the ending away.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'kow-try-1', topicId: 'kinds-of-writing', tier: 1, format: 'mcq5',
        stem: 'You want to know what PAGE Chapter 3 starts on. Which signpost do you check?',
        options: [
          { text: 'Contents page', misconception: null },
          { text: 'Index', misconception: 'confused-index' },
          { text: 'Glossary', misconception: 'confused-glossary' },
          { text: 'Bibliography', misconception: 'confused-bibliography' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Which signpost lists chapters IN ORDER, with their starting page numbers?',
          'The index lists topics A-Z, not chapters in story order — which signpost matches "chapter" and "starts"?',
        ],
        explain: {
          rule: RULE,
          worked: 'The contents page lists every chapter in the order it appears, each lined up with its starting page number — exactly what you need.',
          whyWrong: {
            Index: 'The index lists topics A-Z, not chapters in story order.',
            Glossary: 'The glossary explains tricky words — it has nothing to do with chapter numbers.',
            Bibliography: "The bibliography lists the author's sources, not chapter page numbers.",
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'kow-try-2', topicId: 'kinds-of-writing', tier: 2, format: 'mcq5',
        stem: 'A book tells the REAL life story of a famous swimmer, in her own words. Is this fiction or non-fiction?',
        options: [
          { text: 'Non-fiction', misconception: null },
          { text: 'Fiction', misconception: 'story-feel-trap' },
          { text: 'Poetry', misconception: 'wrong-category' },
          { text: 'A glossary', misconception: 'wrong-category-bookpart' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Ask the ONE big question: is this invented, or did it truly happen?',
          "A real swimmer's real memories, even written excitingly, are still true events — what does that make it?",
        ],
        explain: {
          rule: RULE,
          worked: 'Every event in her life truly happened — nothing is invented — so this is non-fiction, even though it reads like an exciting story.',
          whyWrong: {
            Fiction: 'Fiction means invented — but nothing here was made up.',
            Poetry: 'Poetry is a FORM of writing, not a fact-or-invented category, and this is written as prose.',
            'A glossary': 'A glossary is a book PART, not a kind of writing — this question is about fiction vs non-fiction.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Contents = where chapters start (front, story order). Index = where topics hide (back, A-Z).',
    'A glossary explains the tricky WORDS used in THIS book; a dictionary explains every word in the whole language — different jobs.',
    "A bibliography lists the books and websites an author read — it's proof their facts are real.",
    'Ask ONE question: invented = fiction, true = non-fiction. A true story can still be written excitingly!',
    "The blurb on the back cover is written to tempt you to read — it's a taster, not a full list of chapters.",
    'In an index, alphabetical order looks at the SECOND letter when the first letters match: Shark comes before Shell.',
  ],

  bank: [
    // ---------- TIER 1 (12) — straightforward book-part & fiction/non-fiction identification ----------
    {
      id: 'kinds-of-writing-t1-01', tier: 1, format: 'mcq5',
      stem: 'Which part of a book tells you WHERE each chapter starts?',
      options: [
        { text: 'Contents page', misconception: null },
        { text: 'Index', misconception: 'confused-index' },
        { text: 'Glossary', misconception: 'confused-glossary' },
        { text: 'Blurb', misconception: 'confused-blurb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost lists chapters in the order they appear, at the FRONT of the book?',
        'It matches each chapter with the page number it begins on.',
      ],
      explain: {
        rule: RULE,
        worked: 'The contents page lists every chapter in story order along with its starting page number.',
        whyWrong: {
          Index: 'The index lists topics A-Z at the back, not chapters in order.',
          Glossary: 'The glossary explains tricky words, not chapter locations.',
          Blurb: 'The blurb is a short taster on the back cover, not a list of chapters.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-02', tier: 1, format: 'mcq5',
      stem: 'Which part of a book lists topics in A-Z order, right at the very back?',
      options: [
        { text: 'Index', misconception: null },
        { text: 'Contents page', misconception: 'confused-contents' },
        { text: 'Title page', misconception: 'confused-titlepage' },
        { text: 'Blurb', misconception: 'confused-blurb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost is alphabetical, and sits at the very back of the book?',
        'It lists every topic and every page number it appears on.',
      ],
      explain: {
        rule: RULE,
        worked: 'The index sits at the back and lists topics alphabetically, with every page each one is mentioned on.',
        whyWrong: {
          'Contents page': 'The contents page lists chapters in story order at the front, not topics A-Z at the back.',
          'Title page': 'The title page just shows the title, author and publisher, right at the front.',
          Blurb: 'The blurb is a short taster on the back cover, not an alphabetical list.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-03', tier: 1, format: 'mcq5',
      stem: 'Which part of a book explains what tricky WORDS mean?',
      options: [
        { text: 'Glossary', misconception: null },
        { text: 'Bibliography', misconception: 'confused-bibliography' },
        { text: 'Index', misconception: 'confused-index' },
        { text: 'Contents page', misconception: 'confused-contents' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost gives MEANINGS for hard words, alphabetically?',
        'It is not a list of pages — it explains what the words actually mean.',
      ],
      explain: {
        rule: RULE,
        worked: 'The glossary lists the tricky words used in the book, alphabetically, with their meanings explained.',
        whyWrong: {
          Bibliography: 'The bibliography lists the sources an author used, not word meanings.',
          Index: 'The index gives page numbers for topics, not word meanings.',
          'Contents page': 'The contents page lists chapters, not word meanings.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-04', tier: 1, format: 'mcq5',
      stem: 'Which part of a book lists the other books an author used for research?',
      options: [
        { text: 'Bibliography', misconception: null },
        { text: 'Glossary', misconception: 'confused-glossary' },
        { text: 'Blurb', misconception: 'confused-blurb' },
        { text: 'Title page', misconception: 'confused-titlepage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost proves where the author got their facts from?',
        'It is a list of other books, websites and sources, usually right at the back.',
      ],
      explain: {
        rule: RULE,
        worked: 'The bibliography lists every other book, website or source the author read while researching.',
        whyWrong: {
          Glossary: 'The glossary explains word meanings, not research sources.',
          Blurb: 'The blurb tempts you to read the book — it lists no sources at all.',
          'Title page': 'The title page just shows the title, author and publisher.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-05', tier: 1, format: 'mcq5',
      stem: "Which part of the book is on the very BACK COVER, written to tempt you into reading it?",
      options: [
        { text: 'Blurb', misconception: null },
        { text: 'Contents page', misconception: 'confused-contents' },
        { text: 'Index', misconception: 'confused-index' },
        { text: 'Glossary', misconception: 'confused-glossary' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost is short, exciting, and sits on the back cover?',
        'It gives you a taste of the story WITHOUT giving away the ending.',
      ],
      explain: {
        rule: RULE,
        worked: "The blurb sits on the back cover and gives an exciting taste of the story to tempt a reader in.",
        whyWrong: {
          'Contents page': 'The contents page is a factual list of chapters at the front, not a tempting taster.',
          Index: 'The index is an alphabetical list of topics, not a taster of the story.',
          Glossary: 'The glossary explains hard words — it does not tempt a reader in.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-06', tier: 1, format: 'mcq5',
      stem: 'Which page, right at the FRONT of a book, shows the title, the author and the publisher?',
      options: [
        { text: 'Title page', misconception: null },
        { text: 'Index', misconception: 'confused-index' },
        { text: 'Bibliography', misconception: 'confused-bibliography' },
        { text: 'Blurb', misconception: 'confused-blurb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost sits right at the very front, before the contents page?',
        'It only shows the title, author and publisher — nothing else.',
      ],
      explain: {
        rule: RULE,
        worked: 'The title page is the very first signpost in a book, showing only the title, author and publisher.',
        whyWrong: {
          Index: 'The index is an alphabetical list at the BACK of the book.',
          Bibliography: 'The bibliography lists research sources, not the title and author.',
          Blurb: 'The blurb is on the back cover, not the front title page.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-07', tier: 1, format: 'mcq5',
      stem: 'A story about a dragon who can talk and grants wishes is an example of…',
      options: [
        { text: 'Fiction', misconception: null },
        { text: 'Non-fiction', misconception: 'ignored-invented-facts' },
        { text: 'A bibliography', misconception: 'wrong-category-bookpart' },
        { text: 'An index', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: is a talking, wish-granting dragon invented, or true?',
        'No dragon has ever really talked — so what kind of writing is this?',
      ],
      explain: {
        rule: RULE,
        worked: 'A talking, wish-granting dragon is entirely made up — that makes this fiction.',
        whyWrong: {
          'Non-fiction': 'Non-fiction means true, real facts — nothing about this dragon is real.',
          'A bibliography': 'A bibliography is a book part, not a kind of writing.',
          'An index': 'An index is a book part, not a kind of writing.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-08', tier: 1, format: 'mcq5',
      stem: 'A book explaining how volcanoes erupt, using real scientific facts, is an example of…',
      options: [
        { text: 'Non-fiction', misconception: null },
        { text: 'Fiction', misconception: 'ignored-real-facts' },
        { text: 'A blurb', misconception: 'wrong-category-bookpart' },
        { text: 'A title page', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: is this invented, or true?',
        'Real melted rock and real explosions — nothing here is made up.',
      ],
      explain: {
        rule: RULE,
        worked: 'Volcanoes really do erupt this way — nothing is invented — so this is non-fiction.',
        whyWrong: {
          Fiction: 'Fiction means invented — but real science facts are not made up.',
          'A blurb': 'A blurb is a book part, not a kind of writing.',
          'A title page': 'A title page is a book part, not a kind of writing.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-09', tier: 1, format: 'mcq5',
      stem: 'You want to find which page Chapter 4 starts on. Which part of the book do you check?',
      options: [
        { text: 'Contents page', misconception: null },
        { text: 'Index', misconception: 'confused-index' },
        { text: 'Bibliography', misconception: 'confused-bibliography' },
        { text: 'Blurb', misconception: 'confused-blurb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost lists chapters in order, with page numbers, near the front?',
        'It is not alphabetical — it follows the story order of the book.',
      ],
      explain: {
        rule: RULE,
        worked: 'The contents page lists every chapter with its starting page number, in the order the chapters appear.',
        whyWrong: {
          Index: 'The index is alphabetical and lists topics, not chapter numbers.',
          Bibliography: 'The bibliography lists sources, not chapters.',
          Blurb: 'The blurb is a taster on the back cover — it has no page numbers.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-10', tier: 1, format: 'mcq5',
      stem: "You've just read the word 'crustacean' and don't know what it means. Which part of the book helps?",
      options: [
        { text: 'Glossary', misconception: null },
        { text: 'Contents page', misconception: 'confused-contents' },
        { text: 'Index', misconception: 'confused-index' },
        { text: 'Title page', misconception: 'confused-titlepage' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost explains what tricky WORDS mean?',
        'It is alphabetical, so you can look up "crustacean" quickly.',
      ],
      explain: {
        rule: RULE,
        worked: 'The glossary lists tricky words from the book, alphabetically, with their meanings explained.',
        whyWrong: {
          'Contents page': 'The contents page lists chapters, not word meanings.',
          Index: 'The index gives page numbers for topics, not meanings for words.',
          'Title page': 'The title page only shows the title, author and publisher.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-11', tier: 1, format: 'mcq5',
      stem: 'Which of these titles sounds like a FICTION book?',
      options: [
        { text: 'The Goblin Who Ate the Moon', misconception: null },
        { text: 'The Complete Guide to Sharks', misconception: 'confused-nonfiction' },
        { text: 'How Bridges Are Built', misconception: 'confused-nonfiction' },
        { text: 'A History of the Titanic', misconception: 'confused-nonfiction' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question of each title: is it invented, or true?',
        'A goblin eating the moon could never really happen — what kind of writing is that?',
      ],
      explain: {
        rule: RULE,
        worked: 'A goblin eating the moon is entirely invented — the other three titles are all about real, true subjects.',
        whyWrong: {
          'The Complete Guide to Sharks': 'Real sharks and real facts — that is a non-fiction title.',
          'How Bridges Are Built': 'Real engineering facts — that is a non-fiction title.',
          'A History of the Titanic': 'A real ship and real events — that is a non-fiction title.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t1-12', tier: 1, format: 'mcq5',
      stem: 'Which of these titles sounds like a NON-FICTION book?',
      options: [
        { text: 'The Life Cycle of a Frog', misconception: null },
        { text: 'The Wizard Who Lost His Wand', misconception: 'confused-fiction' },
        { text: 'The Dragon of Swampy Hollow', misconception: 'confused-fiction' },
        { text: 'The Sock That Could Fly', misconception: 'confused-fiction' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question of each title: is it invented, or true?',
        'A frog\'s real life cycle is a fact anyone can look up — what kind of writing is that?',
      ],
      explain: {
        rule: RULE,
        worked: "A frog's life cycle is a real, true process — the other three titles all describe invented magic.",
        whyWrong: {
          'The Wizard Who Lost His Wand': 'Wizards and magic wands are invented — that is a fiction title.',
          'The Dragon of Swampy Hollow': 'Dragons are invented — that is a fiction title.',
          'The Sock That Could Fly': 'A flying sock is invented — that is a fiction title.',
        },
      },
    },

    // ---------- TIER 2 (12) — purpose reasoning, alphabetical order, trickier fiction/non-fiction ----------
    {
      id: 'kinds-of-writing-t2-01', tier: 2, format: 'mcq5',
      stem: "You want to check every page in a book that mentions 'sharks'. Which signpost is fastest?",
      options: [
        { text: 'Index', misconception: null },
        { text: 'Contents page', misconception: 'contents-only-chapters' },
        { text: 'Title page', misconception: 'confused-titlepage' },
        { text: 'Blurb', misconception: 'confused-blurb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'You need EVERY page a topic is mentioned on, not just where a chapter starts.',
        'Which signpost lists topics alphabetically with every page number attached?',
      ],
      explain: {
        rule: RULE,
        worked: 'The contents page only shows where chapters START, but the index lists every single page "sharks" is mentioned on.',
        whyWrong: {
          'Contents page': 'The contents page only shows chapter starting points, not every mention of a topic.',
          'Title page': 'The title page only shows the title, author and publisher.',
          Blurb: 'The blurb is a taster on the back cover, not a page-finder.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-02', tier: 2, format: 'mcq5',
      stem: 'Both the contents page and the index list things — but only ONE puts them in A-Z order. Which one?',
      options: [
        { text: 'Index', misconception: null },
        { text: 'Contents page', misconception: 'reversed-order-rule' },
        { text: 'Both do', misconception: 'ignored-order-rule' },
        { text: 'Neither does', misconception: 'ignored-order-rule' },
      ],
      correctIndex: 0,
      hintSteps: [
        'One lists chapters in the order they happen; the other lists topics alphabetically.',
        'Which one would you check to find "Z" for zebra near the end of its list?',
      ],
      explain: {
        rule: RULE,
        worked: 'The index arranges topics A-Z; the contents page keeps chapters in story order, never alphabetical.',
        whyWrong: {
          'Contents page': 'The contents page follows story order (Chapter 1, 2, 3…), not the alphabet.',
          'Both do': 'Only the index is alphabetical — the contents page follows story order.',
          'Neither does': 'The index is alphabetical, even though the contents page is not.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-03', tier: 2, format: 'mcq5',
      stem: 'A history book ends with a list of the other books and websites the author read while researching. What is this list called?',
      options: [
        { text: 'Bibliography', misconception: null },
        { text: 'Glossary', misconception: 'confused-glossary' },
        { text: 'Index', misconception: 'confused-index' },
        { text: 'Blurb', misconception: 'confused-blurb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost is about WHERE the author got their facts from, not what words mean?',
        'It proves the author\'s research is real.',
      ],
      explain: {
        rule: RULE,
        worked: 'A list of the other sources an author used while researching is the bibliography.',
        whyWrong: {
          Glossary: 'The glossary explains tricky words — it lists no sources.',
          Index: 'The index lists topics and page numbers, not research sources.',
          Blurb: 'The blurb tempts you to read — it lists no sources.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-04', tier: 2, format: 'mcq5',
      stem: 'A biography of a real footballer\'s life, told excitingly like a story, is best described as…',
      options: [
        { text: 'Non-fiction', misconception: null },
        { text: 'Fiction', misconception: 'story-feel-trap' },
        { text: 'A glossary', misconception: 'wrong-category-bookpart' },
        { text: 'A title page', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: did every event in the footballer\'s life truly happen?',
        'Exciting writing does not automatically mean invented writing.',
      ],
      explain: {
        rule: RULE,
        worked: 'Even though it reads excitingly, every event truly happened to a real person — that makes it non-fiction.',
        whyWrong: {
          Fiction: 'Fiction means invented — but real events about a real person are not made up.',
          'A glossary': 'A glossary is a book part, not a kind of writing.',
          'A title page': 'A title page is a book part, not a kind of writing.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-05', tier: 2, format: 'mcq5',
      stem: 'A recipe card listing real ingredients and real steps for baking a cake is an example of…',
      options: [
        { text: 'Non-fiction', misconception: null },
        { text: 'Fiction', misconception: 'ignored-real-facts' },
        { text: 'An index', misconception: 'wrong-category-bookpart' },
        { text: 'A bibliography', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: are these real ingredients and real steps, or invented ones?',
        'Instructions that genuinely work in a real kitchen are true, not invented.',
      ],
      explain: {
        rule: RULE,
        worked: 'Real ingredients and steps that genuinely bake a real cake are facts, not inventions — so this is non-fiction.',
        whyWrong: {
          Fiction: 'Fiction means invented — but these ingredients and steps are real.',
          'An index': 'An index is a book part, not a kind of writing.',
          'A bibliography': 'A bibliography is a book part, not a kind of writing.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-06', tier: 2, format: 'mcq5',
      stem: "In an index, would 'Zebra' or 'Ant' come first?",
      options: [
        { text: 'Ant', misconception: null },
        { text: 'Zebra', misconception: 'reversed-alphabet' },
        { text: 'They come together', misconception: 'ignored-alphabet-rule' },
        { text: 'Neither — the index is not alphabetical', misconception: 'wrong-index-purpose' },
      ],
      correctIndex: 0,
      hintSteps: [
        'An index is arranged A-Z, so which word\'s first letter comes earlier in the alphabet?',
        '"A" for Ant comes before "Z" for Zebra.',
      ],
      explain: {
        rule: RULE,
        worked: 'Indexes are alphabetical, and "A" comes before "Z", so Ant would be listed first.',
        whyWrong: {
          Zebra: '"Z" is one of the LAST letters of the alphabet, so Zebra comes after Ant.',
          'They come together': 'Different starting letters mean they cannot share the same spot.',
          'Neither — the index is not alphabetical': 'An index is always arranged A-Z — that is its whole point.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-07', tier: 2, format: 'mcq5',
      stem: "In an index, would 'Dog' or 'Cat' come first?",
      options: [
        { text: 'Cat', misconception: null },
        { text: 'Dog', misconception: 'reversed-alphabet' },
        { text: 'They come together', misconception: 'ignored-alphabet-rule' },
        { text: 'Whichever has more pages listed', misconception: 'wrong-alphabet-rule' },
      ],
      correctIndex: 0,
      hintSteps: [
        'An index is arranged A-Z, so which word\'s first letter comes earlier?',
        '"C" for Cat comes before "D" for Dog.',
      ],
      explain: {
        rule: RULE,
        worked: 'Indexes are alphabetical, and "C" comes before "D", so Cat would be listed first.',
        whyWrong: {
          Dog: '"D" comes after "C" in the alphabet, so Dog comes after Cat.',
          'They come together': 'Different starting letters mean they cannot share the same spot.',
          'Whichever has more pages listed': 'An index orders by the ALPHABET, never by how many pages a topic has.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-08', tier: 2, format: 'mcq5',
      stem: 'Which of these would you find CLOSEST TO THE FRONT of a non-fiction book?',
      options: [
        { text: 'Title page', misconception: null },
        { text: 'Index', misconception: 'confused-position' },
        { text: 'Bibliography', misconception: 'confused-position' },
        { text: 'Glossary', misconception: 'confused-position' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost is the very FIRST thing you meet after the front cover?',
        'The other three all sit at the BACK of the book.',
      ],
      explain: {
        rule: RULE,
        worked: 'The title page is the very first signpost, right at the front, before even the contents page.',
        whyWrong: {
          Index: 'The index sits at the very back of the book.',
          Bibliography: 'The bibliography sits at the back of the book.',
          Glossary: 'The glossary sits towards the back of the book.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-09', tier: 2, format: 'mcq5',
      stem: 'Which of these would you find CLOSEST TO THE BACK of a non-fiction book?',
      options: [
        { text: 'Index', misconception: null },
        { text: 'Title page', misconception: 'confused-position' },
        { text: 'Contents page', misconception: 'confused-position' },
        { text: 'Blurb-free front cover', misconception: 'confused-position' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost is alphabetical and always sits at the very end of the book?',
        'The other options all sit right at the FRONT.',
      ],
      explain: {
        rule: RULE,
        worked: 'The index is the very last signpost in a non-fiction book, right at the back.',
        whyWrong: {
          'Title page': 'The title page sits right at the front of the book.',
          'Contents page': 'The contents page sits near the front of the book.',
          'Blurb-free front cover': 'The front cover is, unsurprisingly, at the front of the book.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-10', tier: 2, format: 'mcq5',
      stem: 'Which of these is written to make you WANT to read the book, without giving the ending away?',
      options: [
        { text: 'Blurb', misconception: null },
        { text: 'Index', misconception: 'confused-purpose' },
        { text: 'Bibliography', misconception: 'confused-purpose' },
        { text: 'Glossary', misconception: 'confused-purpose' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which signpost is exciting and persuasive, rather than a plain list?',
        'It sits on the back cover, giving just a taste of the story.',
      ],
      explain: {
        rule: RULE,
        worked: 'The blurb is written to hook a reader with a taste of the story, never revealing the ending.',
        whyWrong: {
          Index: 'The index is a plain alphabetical list of topics, not a persuasive taster.',
          Bibliography: 'The bibliography is a plain list of sources, not a persuasive taster.',
          Glossary: 'The glossary explains words — it is not written to persuade anyone.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-11', tier: 2, format: 'mcq5',
      stem: "Which of these lines sounds like it belongs on a BLURB, not a contents page?",
      options: [
        { text: 'Get ready for the smelliest adventure of the summer!', misconception: null },
        { text: 'Chapter 1: The Swamp Awakens ................. page 4', misconception: 'confused-contents-style' },
        { text: 'Chapter 2: Into the Bog ....................... page 19', misconception: 'confused-contents-style' },
        { text: 'Chapter 3: The Final Stink .................... page 33', misconception: 'confused-contents-style' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which line is exciting and persuasive, rather than a plain fact with a page number?',
        'A blurb HOOKS you — a contents page just lists facts.',
      ],
      explain: {
        rule: RULE,
        worked: 'That exciting, persuasive line is exactly the job of a blurb — the others are all plain contents-page entries with page numbers.',
        whyWrong: {
          'Chapter 1: The Swamp Awakens ................. page 4': 'That is a plain chapter listing with a page number — a contents-page style entry.',
          'Chapter 2: Into the Bog ....................... page 19': 'That is a plain chapter listing with a page number — a contents-page style entry.',
          'Chapter 3: The Final Stink .................... page 33': 'That is a plain chapter listing with a page number — a contents-page style entry.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t2-12', tier: 2, format: 'mcq5',
      stem: 'A newspaper report about a real storm that hit the coast yesterday is an example of…',
      options: [
        { text: 'Non-fiction', misconception: null },
        { text: 'Fiction', misconception: 'ignored-real-facts' },
        { text: 'A title page', misconception: 'wrong-category-bookpart' },
        { text: 'A glossary', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: did the storm really happen?',
        'A report describing real weather events is a fact, not an invention.',
      ],
      explain: {
        rule: RULE,
        worked: 'A real storm reported by a real newspaper is a true event — that makes it non-fiction.',
        whyWrong: {
          Fiction: 'Fiction means invented — but a real storm that truly happened is not made up.',
          'A title page': 'A title page is a book part, not a kind of writing.',
          'A glossary': 'A glossary is a book part, not a kind of writing.',
        },
      },
    },

    // ---------- TIER 3 (10) — subtlest traps: diary-fiction, glossary-vs-dictionary, tight alphabetising ----------
    {
      id: 'kinds-of-writing-t3-01', tier: 3, format: 'mcq5',
      stem: 'A diary written by a girl who is a completely made-up character invented by an author is best described as…',
      options: [
        { text: 'Fiction', misconception: null },
        { text: 'Non-fiction', misconception: 'diary-feels-true-trap' },
        { text: 'A bibliography', misconception: 'wrong-category-bookpart' },
        { text: 'A blurb', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A diary FEELS true and personal — but ask the ONE big question about the girl herself.',
        'If the girl never really existed, the whole diary was invented by the author.',
      ],
      explain: {
        rule: RULE,
        worked: 'Even though a diary feels personal and real, this girl was invented by the author — so it is fiction, despite its true-feeling form.',
        whyWrong: {
          'Non-fiction': 'The diary-style FEELS true, but the girl herself and her entries were invented — that makes it fiction.',
          'A bibliography': 'A bibliography is a book part, not a kind of writing.',
          'A blurb': 'A blurb is a book part, not a kind of writing.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-02', tier: 3, format: 'mcq5',
      stem: "In an index, would 'Shark' or 'Shell' come first?",
      options: [
        { text: 'Shark', misconception: null },
        { text: 'Shell', misconception: 'stopped-at-first-letter' },
        { text: 'They come together', misconception: 'ignored-alphabet-rule' },
        { text: 'Whichever is longer', misconception: 'wrong-alphabet-rule' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Both start with "Sh" — so alphabetise by the NEXT letter instead.',
        '"Shark" has an "a" after "Sh"; "Shell" has an "e" — which letter comes first in the alphabet?',
      ],
      explain: {
        rule: RULE,
        worked: 'Both words start "Sh", so the third letter decides it: "a" (Shark) comes before "e" (Shell) in the alphabet.',
        whyWrong: {
          Shell: 'Once the first two letters match, you must compare the NEXT letter — "e" comes after "a".',
          'They come together': 'Alphabetical order always finds a difference eventually — here it is the third letter.',
          'Whichever is longer': 'Length never decides alphabetical order — only letter-by-letter comparison does.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-03', tier: 3, format: 'mcq5',
      stem: "In an index, would 'Whale' or 'Wasp' come first?",
      options: [
        { text: 'Wasp', misconception: null },
        { text: 'Whale', misconception: 'stopped-at-first-letter' },
        { text: 'They come together', misconception: 'ignored-alphabet-rule' },
        { text: 'Whichever has more pages listed', misconception: 'wrong-alphabet-rule' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Both start with "W" — so alphabetise by the SECOND letter instead.',
        '"Wasp" has an "a" after "W"; "Whale" has an "h" — which comes first in the alphabet?',
      ],
      explain: {
        rule: RULE,
        worked: 'Both words start with "W", so the second letter decides it: "a" (Wasp) comes before "h" (Whale) in the alphabet.',
        whyWrong: {
          Whale: 'Once the first letters match, you must compare the NEXT letter — "h" comes after "a".',
          'They come together': 'Alphabetical order always finds a difference eventually — here it is the second letter.',
          'Whichever has more pages listed': 'An index orders by the ALPHABET, never by how many pages a topic has.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-04', tier: 3, format: 'mcq5',
      stem: 'Which signpost lists chapters in the ORDER they appear in the book, rather than A-Z?',
      options: [
        { text: 'Contents page', misconception: null },
        { text: 'Index', misconception: 'reversed-order-rule' },
        { text: 'Glossary', misconception: 'confused-glossary' },
        { text: 'Bibliography', misconception: 'confused-bibliography' },
      ],
      correctIndex: 0,
      hintSteps: [
        'One signpost follows the STORY, and one follows the ALPHABET — which is which?',
        'Chapter 1 always comes before Chapter 2 on this page, never based on spelling.',
      ],
      explain: {
        rule: RULE,
        worked: 'The contents page always follows the story order the chapters actually appear in, never alphabetical order.',
        whyWrong: {
          Index: 'The index is the one arranged alphabetically, not in story order.',
          Glossary: 'The glossary is arranged alphabetically by tricky word, not by chapter.',
          Bibliography: 'The bibliography lists sources, not chapters, and is often alphabetical by author surname.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-05', tier: 3, format: 'mcq5',
      stem: 'Which of these would you expect to find in an information book about sharks, but NEVER in a fiction adventure story?',
      options: [
        { text: 'Bibliography', misconception: null },
        { text: 'A talking character', misconception: 'wrong-category' },
        { text: 'An exciting ending', misconception: 'wrong-category' },
        { text: 'A made-up villain', misconception: 'wrong-category' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which of these proves an author's research, and would make no sense inside a made-up adventure story?',
        'Fiction never needs to prove where its facts came from, because nothing in it is a fact.',
      ],
      explain: {
        rule: RULE,
        worked: 'A bibliography proves an author\'s research — fiction has no real facts to research, so it never needs one.',
        whyWrong: {
          'A talking character': 'Fiction adventure stories often have talking characters.',
          'An exciting ending': 'Fiction adventure stories are usually built around an exciting ending.',
          'A made-up villain': 'Fiction adventure stories often have a made-up villain.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-06', tier: 3, format: 'mcq5',
      stem: 'A comic strip about a talking hamster who fights crime every night is an example of…',
      options: [
        { text: 'Fiction', misconception: null },
        { text: 'Non-fiction', misconception: 'ignored-invented-facts' },
        { text: 'A glossary', misconception: 'wrong-category-bookpart' },
        { text: 'An index', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: does a crime-fighting talking hamster truly exist?',
        'The comic strip FORM does not change the answer — ask about the CONTENT.',
      ],
      explain: {
        rule: RULE,
        worked: 'A talking, crime-fighting hamster is entirely invented, whatever form the writing takes — that makes it fiction.',
        whyWrong: {
          'Non-fiction': 'Non-fiction means true facts — a crime-fighting talking hamster is not real.',
          'A glossary': 'A glossary is a book part, not a kind of writing.',
          'An index': 'An index is a book part, not a kind of writing.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-07', tier: 3, format: 'mcq5',
      stem: "An autobiography written by a footballer about her OWN real life is an example of…",
      options: [
        { text: 'Non-fiction', misconception: null },
        { text: 'Fiction', misconception: 'story-feel-trap' },
        { text: 'A contents page', misconception: 'wrong-category-bookpart' },
        { text: 'A blurb', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'An autobiography is written by the REAL person about their OWN real life.',
        'Ask the ONE big question: did she really live these events?',
      ],
      explain: {
        rule: RULE,
        worked: "An autobiography describes a real person's real life, in her own words — nothing invented, so it is non-fiction.",
        whyWrong: {
          Fiction: 'Fiction means invented — but this is her OWN true life story.',
          'A contents page': 'A contents page is a book part, not a kind of writing.',
          'A blurb': 'A blurb is a book part, not a kind of writing.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-08', tier: 3, format: 'mcq5',
      stem: 'Which explains hard words used INSIDE one particular book, rather than every word in the whole language?',
      options: [
        { text: 'Glossary', misconception: null },
        { text: 'Dictionary', misconception: 'confused-with-dictionary' },
        { text: 'Bibliography', misconception: 'confused-bibliography' },
        { text: 'Index', misconception: 'confused-index' },
      ],
      correctIndex: 0,
      hintSteps: [
        'One book covers EVERY word in the language; the other only covers words used in THIS book.',
        'Which one is tucked inside the book it is explaining words for?',
      ],
      explain: {
        rule: RULE,
        worked: 'A glossary only explains the tricky words used inside its own book — a dictionary covers every word in the whole language.',
        whyWrong: {
          Dictionary: 'A dictionary explains EVERY word in the whole language, not just the words in one book.',
          Bibliography: 'A bibliography lists research sources, not word meanings.',
          Index: 'An index gives page numbers for topics, not word meanings.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-09', tier: 3, format: 'mcq5',
      stem: 'Which usually comes LAST of all in a non-fiction book: the glossary or the index?',
      options: [
        { text: 'Index', misconception: null },
        { text: 'Glossary', misconception: 'reversed-back-matter-order' },
        { text: 'They always share the last page', misconception: 'ignored-order-rule' },
        { text: 'Neither — both come before the chapters', misconception: 'wrong-position' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Both live at the back of the book — but one is the very LAST signpost of all.',
        'Which one do you use to jump to any page from anywhere in the book?',
      ],
      explain: {
        rule: RULE,
        worked: 'The index is the final signpost in a non-fiction book, coming after the glossary.',
        whyWrong: {
          Glossary: 'The glossary usually comes before the index, not after it.',
          'They always share the last page': 'The glossary and index are separate sections, one after the other.',
          'Neither — both come before the chapters': 'Both the glossary and the index sit at the BACK, after the chapters.',
        },
      },
    },
    {
      id: 'kinds-of-writing-t3-10', tier: 3, format: 'mcq5',
      stem: "A book of instructions for building a real model bridge, with real measurements, is an example of…",
      options: [
        { text: 'Non-fiction', misconception: null },
        { text: 'Fiction', misconception: 'ignored-real-facts' },
        { text: 'A glossary', misconception: 'wrong-category-bookpart' },
        { text: 'A bibliography', misconception: 'wrong-category-bookpart' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask the ONE big question: do these real measurements genuinely build a real bridge?',
        'Instructions that truly work are facts, not inventions.',
      ],
      explain: {
        rule: RULE,
        worked: 'Real measurements that genuinely build a real model bridge are facts, not inventions — so this is non-fiction.',
        whyWrong: {
          Fiction: 'Fiction means invented — but these instructions and measurements are real.',
          'A glossary': 'A glossary is a book part, not a kind of writing.',
          'A bibliography': 'A bibliography is a book part, not a kind of writing.',
        },
      },
    },
  ],
};
