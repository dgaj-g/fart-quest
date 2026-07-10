// FART QUEST topic: Full Stop Quarry — capitals & end marks (Punctuation Pits)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'capitals-endmarks',
  name: 'Full Stop Quarry',
  region: 'punctuation-pits',
  bankTopic: true,
  tagline: 'Where every sentence learns to wear its cap — and stop when it should.',

  creature: {
    id: 'full-stop-phil',
    name: 'Full-Stop Phil',
    rarity: 'rare',
    image: 'assets/monsters/full-stop-phil.png',
    bio: 'Full-Stop Phil ends every conversation the instant he decides it is over — mid. Nobody has ever out-argued a full stop, and Phil intends to keep it that way forever.',
    factSneak: 'Names, places, days, months and “I” always wear the cap — and every sentence needs an ending mark, chosen by the job the sentence is doing.',
  },

  weapon: {
    id: 'capital-cap',
    name: 'The Capital Cap',
    tagline: 'Spot the missing cap, the rogue cap, or the mismatched ending — before Phil spots it first.',
    rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
    example: 'Names, places and days all wear it: <b>J</b>arlath went to <b>B</b>elfast on <b>T</b>uesday.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-capitals',
      text: 'Gather round, my sharp-nosed hero! Full-Stop Phil here is famously rude — he ends conversations <b>mid</b>. But he taught me his greatest secret: certain words are so important they get to wear a little hat. A CAPITAL LETTER. Today you learn exactly who earns one.',
    },
    {
      type: 'show',
      title: 'Two words wear the cap by right',
      html: `<p>Rule one is easy: <b>every sentence starts wearing the cap</b>, no matter what the first word is. "the dog barked" breaks the law — it must be "<b>T</b>he dog barked."</p>
<p>Rule two: <b>proper nouns</b> — the special NAME of one particular person, place or thing — always wear the cap too, wherever they sit in the sentence. "jarlath kicked a ball" breaks the law too. It must be "<b>J</b>arlath kicked a ball," because Jarlath is a name, not just any old boy.</p>
<div class="law-scroll">📜 <b>Compare:</b> "my dog ran to the shop" (no proper nouns, all lowercase) vs "<b>C</b>hloe's dog ran to <b>T</b>esco" (a name and a place — both wear the cap).</div>`,
    },
    {
      type: 'talk',
      text: 'Some proper nouns are sneaky. <b>Days</b> (Monday, Tuesday) and <b>months</b> (April, December) always wear the cap. <b>Titles</b> in front of a name do too — Mr Doyle, Mrs Kelly, Dr Patel. And the word <b>"I"</b> — meaning YOU, talking about yourself — always gets a cap, even squeezed inside a word like "I’ve". Even Full-Stop Phil admits that one is a bit odd.',
    },
    {
      type: 'show',
      title: 'The trickiest one: earth vs Earth',
      html: `<p>Here’s the one that catches EVERYONE out. When you mean the actual dirt under your wellies, it’s lowercase: "the worm dug into the <b>earth</b>." But when you mean our whole PLANET — the third rock from the sun, home to sprouts and farts and everything else — it’s a proper noun, so it wears the cap: "Astronauts can see the whole of <b>Earth</b> from space."</p>
<div class="law-scroll">📜 <b>THE CAPITAL LAW:</b> Names, places, days, months, “I” — and every sentence start — wear the cap. Everything else stays lowercase.</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'ce-try-1', topicId: 'capitals-endmarks', tier: 1, format: 'errorspot',
        stem: 'Full-Stop Phil’s cap fell off somewhere in this sentence. Find the segment — or shout ALL CLEAN!',
        segments: [
          { text: 'Freddie scored a goal' },
          { text: 'against his friend chloe' },
          { text: 'during morning break' },
          { text: 'yesterday afternoon.' },
        ],
        faultyIndex: 1,
        hintSteps: [
          'Read each segment — is there a person’s NAME hiding in there without its cap?',
          '"chloe" is a name. Names are proper nouns, and proper nouns ALWAYS wear the cap, wherever they sit.',
        ],
        explain: {
          rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
          worked: 'Chloe is a proper noun — a person’s name — so segment B needed a capital C: "against his friend Chloe".',
          whyN: null,
        },
      },
    },
    {
      type: 'show',
      title: 'The sentence\'s ending: . ? !',
      html: `<p>Every sentence needs exactly one ending mark, and the mark it needs depends on its JOB.</p>
<div class="law-scroll">📜 A <b>telling</b> sentence ends with a full stop <b>.</b> — "Jarlath ate the sprouts."<br>📜 An <b>asking</b> sentence ends with a question mark <b>?</b> — "Did Jarlath eat the sprouts?"<br>📜 A <b>shouting or surprised</b> sentence ends with an exclamation mark <b>!</b> — "Jarlath ate ALL the sprouts!"</p>
<p>Watch out: some sentences try to sneak past with <b>no ending mark at all</b>. Always read all the way to the very last word before deciding which one it needs.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'ce-try-2', topicId: 'capitals-endmarks', tier: 1, format: 'errorspot',
        stem: 'One segment is wearing a mismatched ending — or is it? Find it, or shout ALL CLEAN!',
        segments: [
          { text: 'Did Full-Stop Phil' },
          { text: 'really end that' },
          { text: 'chat mid-sentence' },
          { text: 'again.' },
        ],
        faultyIndex: 3,
        hintSteps: [
          'Read the whole sentence — is it TELLING you something, or ASKING you something?',
          '"Did Full-Stop Phil…" is a direct question, so it needs a question mark, not a full stop.',
        ],
        explain: {
          rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
          worked: 'This sentence starts with "Did…", which always signals a direct question — segment D needed a question mark: "again?"',
          whyN: null,
        },
      },
    },
    { type: 'anim', anim: 'capitals-endmarks' },
    { type: 'weapon' },
  ],

  tips: [
    'Every sentence start wears the cap — no matter what the first word is.',
    'Proper nouns (names, places, days, months) wear the cap wherever they sit in the sentence, not just at the start.',
    'The word "I" always wears the cap, even squeezed inside a contraction like "I\'ve".',
    'earth (the dirt) stays lowercase; Earth (our planet) is a proper noun and wears the cap.',
    'Titles in front of a name — Mr, Mrs, Dr — wear the cap too, wherever they sit in the sentence.',
    'Telling sentences end in a full stop, asking sentences end in a question mark, shouting sentences end in an exclamation mark — check the sentence\'s JOB before you pick.',
    'Seasons (summer, winter, spring, autumn) stay lowercase — unlike the months, they are not proper nouns.',
    'A sentence with no ending mark at all still needs one — read all the way to the last word before you decide.',
  ],

  bank: [
    // ---------------------------------------------------------------- TIER 1 (12: 9 error + 3 N)
    {
      id: 'capitals-endmarks-t1-01', tier: 1, format: 'errorspot',
      segments: [
        { text: 'jarlath kicked the ball' },
        { text: 'so hard during break' },
        { text: 'that it bounced twice' },
        { text: 'off the school wall.' },
      ],
      faultyIndex: 0,
      hintSteps: [
        'Look at segment A — whose name starts the sentence?',
        'Names always wear the cap, even right at the very start.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Jarlath is a name and this is also a sentence start — a double reason to wear the cap. Segment A needed "Jarlath".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-02', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The whole class cheered' },
        { text: 'when chloe scored' },
        { text: 'the winning goal' },
        { text: 'just before lunch.' },
      ],
      faultyIndex: 1,
      hintSteps: [
        'A name is hiding in segment B without its cap.',
        'Chloe is a proper noun — it wears the cap wherever it sits in the sentence, not just at the start.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Chloe is a name, so segment B needed a capital C: "when Chloe scored".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-03', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Jarlath and Freddie' },
        { text: 'played football together' },
        { text: 'after school on' },
        { text: 'Tuesday afternoon.' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Check every name and every day — are they all capped correctly?',
        'Jarlath, Freddie and Tuesday all wear the cap already — is there anything left uncapped that shouldn\'t be?',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Jarlath, Freddie and Tuesday are proper nouns and correctly wear the cap; "football" and "school" are common nouns and correctly stay lowercase. The full stop suits this telling sentence. ALL CLEAN!',
        whyN: 'Jarlath, Freddie and Tuesday are proper nouns and correctly wear the cap; everything else is an ordinary lowercase word, and the full stop matches a telling sentence.',
      },
    },
    {
      id: 'capitals-endmarks-t1-04', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Freddie forgot his' },
        { text: 'Football boots again' },
        { text: 'before the big match' },
        { text: 'on Saturday morning.' },
      ],
      faultyIndex: 1,
      hintSteps: [
        'Is "football" the special NAME of one particular thing, or just an ordinary sport?',
        'Football boots are common, everyday things — only proper nouns wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"Football" is an ordinary common noun, not a proper noun, so it should stay lowercase: "his football boots".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-05', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Our class trip went' },
        { text: 'to belfast zoo' },
        { text: 'last Tuesday afternoon' },
        { text: 'to see the lions.' },
      ],
      faultyIndex: 1,
      hintSteps: [
        'Is there the special NAME of one particular place hiding in segment B?',
        'Belfast is the name of a real city — places always wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Belfast is a proper noun (a place), so segment B needed a capital B: "to Belfast zoo".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-06', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Did Freddie really' },
        { text: 'score three goals' },
        { text: 'against Chloe\'s team' },
        { text: 'on Tuesday?' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Is this sentence ASKING something, or just TELLING you what happened?',
        '"Did Freddie…" is a genuine direct question, so it\'s right to end with a question mark — now check the names and day.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This really is a direct question ("Did Freddie…"), so the question mark is correct, and Freddie, Chloe and Tuesday are all properly capped. ALL CLEAN!',
        whyN: 'This is a genuine question ("Did Freddie…") so it correctly wears a question mark, and Freddie, Chloe and Tuesday are all proper nouns wearing the cap correctly.',
      },
    },
    {
      id: 'capitals-endmarks-t1-07', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The dog chased' },
        { text: 'the ball across' },
        { text: 'the muddy Garden' },
        { text: 'twice before lunch.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'Is "Garden" the special NAME of one particular place, or just any ordinary garden?',
        'It\'s just a common noun here — only proper nouns wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"Garden" is an ordinary common noun here, not the name of a specific place, so it should stay lowercase: "the muddy garden".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-08', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Zara has swimming' },
        { text: 'lessons every single' },
        { text: 'monday after school' },
        { text: 'finishes for today.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'There\'s a day of the week hiding in segment C — has it got its cap?',
        'Days always wear the cap: "Monday".',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Monday is a day, so segment C needed a capital M: "single Monday after school".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-09', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Kyle raced his' },
        { text: 'little sister down' },
        { text: 'the long school' },
        { text: 'corridor before break' },
      ],
      faultyIndex: 3,
      hintSteps: [
        'Read the whole sentence out loud — does it come to a proper stop at the end?',
        'It\'s a telling sentence with no ending mark at all — it needs a full stop.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This is a telling sentence, so segment D needed a full stop at the end: "corridor before break."',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-10', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The whole class' },
        { text: 'finished their spelling' },
        { text: 'test really early' },
        { text: 'this morning?' },
      ],
      faultyIndex: 3,
      hintSteps: [
        'Is this sentence ASKING something, or just TELLING you what happened?',
        'There\'s no question here — it\'s a plain telling sentence, so it needs a full stop, not a question mark.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This sentence only tells you what happened — it never asks anything — so segment D needed a full stop: "this morning."',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-11', tier: 1, format: 'errorspot',
      segments: [
        { text: 'i scored two' },
        { text: 'goals during today\'s' },
        { text: 'exciting football match' },
        { text: 'outside near the goal.' },
      ],
      faultyIndex: 0,
      hintSteps: [
        'When you\'re talking about yourself, which little word always wears the cap?',
        '"I" always wears the cap, no matter where it sits in a sentence.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"I" always wears the cap, so segment A needed "I scored two".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t1-12', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Nana took Jarlath' },
        { text: 'to Portrush for' },
        { text: 'a windy walk' },
        { text: 'yesterday afternoon.' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Check every name and place — are they all capped correctly?',
        'Nana, Jarlath and Portrush all wear the cap already — is anything left that shouldn\'t?',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Nana, Jarlath and Portrush are all proper nouns wearing the cap correctly, and the full stop suits this telling sentence. ALL CLEAN!',
        whyN: 'Nana, Jarlath and Portrush are all proper nouns wearing the cap correctly, and the full stop suits this telling sentence.',
      },
    },

    // ---------------------------------------------------------------- TIER 2 (12: 9 error + 3 N)
    {
      id: 'capitals-endmarks-t2-01', tier: 2, format: 'errorspot',
      segments: [
        { text: 'mrs doyle gave' },
        { text: 'us extra homework' },
        { text: 'about the solar' },
        { text: 'system this week.' },
      ],
      faultyIndex: 0,
      hintSteps: [
        'A title in front of a name is hiding in segment A — has it got its cap?',
        'Titles like Mrs, Mr and Dr always wear the cap, even without a full stop after them in UK style.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Mrs is a title in front of a name — titles always wear the cap. Segment A needed "Mrs Doyle gave".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-02', tier: 2, format: 'errorspot',
      segments: [
        { text: 'december is the' },
        { text: 'coldest month for' },
        { text: 'our school sports' },
        { text: 'day this year.' },
      ],
      faultyIndex: 0,
      hintSteps: [
        'There\'s a month of the year hiding in segment A — has it got its cap?',
        'Months always wear the cap: "December".',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'December is a month, and this is also a sentence start, so segment A needed "December is the".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-03', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Everyone in class' },
        { text: 'groaned when tuesday\'s' },
        { text: 'spelling test got' },
        { text: 'announced by Mr Doyle.' },
      ],
      faultyIndex: 1,
      hintSteps: [
        'A day of the week is squeezed into a word in segment B — has it kept its cap?',
        'Days wear the cap even when they get an \'s stuck on the end: "Tuesday\'s".',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Tuesday is a day, so segment B needed a capital T even with the \'s attached: "when Tuesday\'s spelling test".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-04', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Jarlath ran straight' },
        { text: 'to the School Office' },
        { text: 'to report the' },
        { text: 'funny smell inside.' },
      ],
      faultyIndex: 1,
      hintSteps: [
        'Is "School Office" the one special NAME of a particular office, or just any ordinary school office?',
        'It\'s a common noun phrase here — only proper nouns wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"School Office" is a common noun phrase here, not the specific name of a place, so it should stay lowercase: "to the school office".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-05', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Our teacher explained' },
        { text: 'that the sun' },
        { text: 'and earth spin' },
        { text: 'through endless space.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'Does "earth" mean the soil under your wellies here, or the whole PLANET?',
        'It means our planet — one of the planets, just like Mars and Venus — so it\'s a proper noun and wears the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Earth is the NAME of our planet here — a proper noun — so it wears the cap, just like the other planets. Segment C needed "and Earth spin".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-06', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The children packed' },
        { text: 'their lunches quickly' },
        { text: 'before boarding the Bus' },
        { text: 'for the trip.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'Is "Bus" the one special NAME of a particular bus, or just any ordinary bus?',
        'It\'s a common noun here — only proper nouns wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"Bus" is an ordinary common noun, not a proper noun, so it should stay lowercase: "boarding the bus".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-07', tier: 2, format: 'errorspot',
      segments: [
        { text: 'After the assembly' },
        { text: 'we all thanked' },
        { text: 'dr Patel for' },
        { text: 'the interesting visit.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'A title in front of a name is hiding in segment C — has it got its cap?',
        'Titles like Dr always wear the cap, wherever they sit in the sentence.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Dr is a title in front of a name, so segment C needed a capital D: "thanked Dr Patel".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-08', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The whole team' },
        { text: 'celebrated wildly after' },
        { text: 'winning the regional' },
        { text: 'trophy on Friday' },
      ],
      faultyIndex: 3,
      hintSteps: [
        'Read the whole sentence out loud — does it come to a proper stop at the end?',
        'It\'s a telling sentence with no ending mark at all — it needs a full stop.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This is a telling sentence, so segment D needed a full stop: "trophy on Friday."',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-09', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Why did Jarlath' },
        { text: 'bring three packets' },
        { text: 'of crisps to' },
        { text: 'school today.' },
      ],
      faultyIndex: 3,
      hintSteps: [
        'Does this sentence start with a question word like "Why"?',
        '"Why did…" is always a direct question, so it needs a question mark, not a full stop.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This sentence starts with "Why did…", a direct question, so segment D needed a question mark: "school today?"',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t2-10', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Dr Kelly and' },
        { text: 'Mrs Doyle judged' },
        { text: 'the science fair' },
        { text: 'on Wednesday morning.' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Check every title and every day — are they all capped correctly?',
        'Dr, Mrs and Wednesday all wear the cap already — is anything left uncapped that shouldn\'t be?',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Dr, Mrs and Wednesday are all proper-noun-style words wearing the cap correctly, and the full stop suits this telling sentence. ALL CLEAN!',
        whyN: 'Dr, Mrs and Wednesday are all proper-noun-style words correctly capped, and this telling sentence correctly ends with a full stop.',
      },
    },
    {
      id: 'capitals-endmarks-t2-11', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Did Chloe really' },
        { text: 'see a shooting' },
        { text: 'star above Earth' },
        { text: 'last night?' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Does this sentence start with a question word, and does "Earth" mean the planet or the soil?',
        '"Did Chloe…" is a genuine question, and Earth here means the planet — both are correct as they are.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This really is a genuine question ("Did Chloe…") so it correctly wears a question mark, and Earth is correctly capped as the planet’s name. ALL CLEAN!',
        whyN: 'This is a genuine question (“Did Chloe…”) so it correctly wears a question mark, Earth is correctly capped as the planet’s name, and Chloe is a name.',
      },
    },
    {
      id: 'capitals-endmarks-t2-12', tier: 2, format: 'errorspot',
      segments: [
        { text: 'I told Freddie' },
        { text: 'that our trip' },
        { text: 'to London is' },
        { text: 'in April.' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Check "I", the name, the place and the month — are they all capped correctly?',
        'I, Freddie, London and April all wear the cap already — is anything left that shouldn\'t?',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'I, Freddie, London and April are all proper-noun-style words wearing the cap correctly, and the full stop suits this telling sentence. ALL CLEAN!',
        whyN: 'I, Freddie, London and April are all proper-noun-style words wearing the cap correctly, and the full stop suits this telling sentence.',
      },
    },

    // ---------------------------------------------------------------- TIER 3 (10: 8 error + 2 N)
    {
      id: 'capitals-endmarks-t3-01', tier: 3, format: 'errorspot',
      segments: [
        { text: 'i\'ve never seen' },
        { text: 'so much mud' },
        { text: 'on a football' },
        { text: 'pitch before today.' },
      ],
      faultyIndex: 0,
      hintSteps: [
        'A squeezed-together word is hiding "I" in segment A — has it kept its cap?',
        '"I" always wears the cap, even squeezed into a contraction like "I\'ve".',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"I" always wears the cap, even squeezed into a contraction, so segment A needed "I\'ve never seen".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-02', tier: 3, format: 'errorspot',
      segments: [
        { text: 'mr Doyle\'s class' },
        { text: 'trip to the' },
        { text: 'museum got cancelled' },
        { text: 'again this morning.' },
      ],
      faultyIndex: 0,
      hintSteps: [
        'A title in front of a name is hiding in segment A — has it got its cap, even though the name after it does?',
        'Titles like Mr always wear the cap too, not just the name that follows.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Mr is a title in front of a name, and this is also a sentence start, so segment A needed "Mr Doyle\'s class".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-03', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Our whole family' },
        { text: 'drove to newcastle' },
        { text: 'for a relaxing' },
        { text: 'weekend by the sea.' },
      ],
      faultyIndex: 1,
      hintSteps: [
        'A place name is hiding in segment B without its cap.',
        'Newcastle is the name of a real town — places always wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Newcastle is a proper noun (a place), so segment B needed a capital N: "drove to Newcastle".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-04', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Our teacher praised' },
        { text: 'his excellent Handwriting' },
        { text: 'in front of' },
        { text: 'everyone in class.' },
      ],
      faultyIndex: 1,
      hintSteps: [
        'Is "Handwriting" the one special NAME of a particular thing, or just an ordinary skill?',
        'It\'s a common noun here — only proper nouns wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"Handwriting" is an ordinary common noun, not a proper noun, so it should stay lowercase: "his excellent handwriting".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-05', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Grandad always insists' },
        { text: 'the weather changes' },
        { text: 'constantly here in ireland' },
        { text: 'every single day.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'A country name is hiding in segment C without its cap.',
        'Ireland is the name of a real country — places always wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Ireland is a proper noun (a place), so segment C needed a capital I: "here in Ireland".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-06', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Everyone lined up' },
        { text: 'quietly for the' },
        { text: 'school Assembly this' },
        { text: 'morning without exception.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'Is "Assembly" the one special NAME of a particular event, or just the ordinary daily assembly?',
        'It\'s a common noun here — only proper nouns wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"Assembly" is an ordinary common noun here, not a proper noun, so it should stay lowercase: "school assembly this".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-07', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Every family always' },
        { text: 'enjoys a relaxing' },
        { text: 'break during Summer' },
        { text: 'near the beach.' },
      ],
      faultyIndex: 2,
      hintSteps: [
        'Is "Summer" the special NAME of one particular thing, like a month is, or just an ordinary season?',
        'Seasons aren\'t proper nouns like the months are — only proper nouns wear the cap.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: '"Summer" is a season, not a proper noun like the months, so it should stay lowercase: "during summer near".',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-08', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Could you please' },
        { text: 'pass the salt' },
        { text: 'across the dinner' },
        { text: 'table right now!' },
      ],
      faultyIndex: 3,
      hintSteps: [
        'Is this sentence ASKING for something, or SHOUTING?',
        '"Could you…" is a direct question, so it needs a question mark, not an exclamation mark.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This sentence is asking something ("Could you…?"), so segment D needed a question mark: "table right now?"',
        whyN: null,
      },
    },
    {
      id: 'capitals-endmarks-t3-09', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Dr Kelly said' },
        { text: 'the shiny trophy' },
        { text: 'would arrive sometime' },
        { text: 'before Christmas Day.' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Check the title, and the special date — are they all capped correctly?',
        'Dr, Christmas and Day all wear the cap already — is anything left that shouldn\'t?',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'Dr, Christmas and Day are proper-noun-style words correctly capped, and this telling sentence rightly ends with a full stop. ALL CLEAN!',
        whyN: 'Dr, Christmas and Day are proper-noun-style words correctly capped, and this telling sentence rightly ends with a full stop.',
      },
    },
    {
      id: 'capitals-endmarks-t3-10', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Look out, everyone —' },
        { text: 'Freddie\'s dodgeball is' },
        { text: 'flying straight for' },
        { text: 'the trophy shelf!' },
      ],
      faultyIndex: null,
      hintSteps: [
        'Is this sentence telling, asking, or shouting a warning — and is the name capped correctly?',
        'It genuinely is a shout of warning, and Freddie is correctly capped — check the ending mark matches.',
      ],
      explain: {
        rule: 'Names, places, days, months, I — and every sentence start — wear the cap.',
        worked: 'This really is a shout of warning, so the exclamation mark is correct, and Freddie is a properly capped name. ALL CLEAN!',
        whyN: 'This really is a genuine shout of warning, so the exclamation mark is correct, and Freddie is a properly capped name.',
      },
    },
  ],
};
