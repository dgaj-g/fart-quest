// FART QUEST topic: The Geese Precinct (Grammar Grotto)
// Authored content — implementation agents: read, never modify.

const WEAPON_RULE = 'Some plurals break the rules (geese, oxen, mice) and groups get one name: a herd, a flock, a swarm.';

export default {
  id: 'plurals-collectives',
  name: 'The Geese Precinct',
  region: 'grammar-grotto',
  bankTopic: true,
  tagline: 'Say "gooses" once and you will spend the rest of your life explaining yourself to this lot.',

  creature: {
    id: 'the-geese-police',
    name: 'The Geese Police',
    rarity: 'rare',
    image: 'assets/monsters/the-geese-police.png',
    bio: 'The Geese Police patrol the Precinct with one law above all others: some plurals flatly refuse to follow the rules, and saying "gooses" is a straight-up arrestable offence. They also keep a filing cabinet crammed with proper group names, one card per herd, flock and swarm.',
    factSneak: 'Some plurals break the rules completely — goose becomes geese, mouse becomes mice, child becomes children — and a GROUP of animals gets its own special name too: a herd, a flock, a swarm.',
  },

  weapon: {
    id: 'herd-word-hoard',
    name: 'The Herd Word Hoard',
    tagline: 'Never get arrested for saying "gooses" again.',
    rule: WEAPON_RULE,
    example: 'One <b>goose</b> waddles off alone — but call two of them <b>geese</b>, and call the whole waddling gang a <b>gaggle</b>.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-pluralsc',
      text: 'Oi oi, listen up, my brave nose-soldier! Down in the Precinct, the Geese Police make one arrest more than any other: <b>"gooses"</b>. Because some plurals flat-out REFUSE to follow the normal rules. And every group of critters in the swamp has its own secret name too. Let’s crack the case.',
    },
    {
      type: 'show',
      title: 'The Normal Rules (Learn These First)',
      html: `<p>Most plurals are easy — just add <b>-s</b>. One <b>dog</b>, two <b>dogs</b>. One <b>fart</b>, two <b>farts</b> (there are ALWAYS more than one, let’s be honest).</p>
<p>Some words need <b>-es</b> instead, because -s alone is too hard to say: words ending in <b>s, x, ch, sh</b> get the extra syllable. One <b>bus</b>, two <b>buses</b>. One <b>fox</b>, two <b>foxes</b>. One <b>brush</b>, two <b>brushes</b>.</p>`,
    },
    {
      type: 'show',
      title: 'The Rule-Breakers',
      html: `<p>Now the Geese Police’s actual job: some plurals throw the rulebook in the bin and change COMPLETELY.</p>
<ul>
<li>one <b>goose</b> → two <b>geese</b></li>
<li>one <b>mouse</b> → two <b>mice</b></li>
<li>one <b>ox</b> → two <b>oxen</b></li>
<li>one <b>child</b> → two <b>children</b></li>
<li>one <b>tooth</b> → two <b>teeth</b></li>
<li>one <b>foot</b> → two <b>feet</b></li>
</ul>
<p>And a sneaky few don’t change AT ALL: one <b>sheep</b>, a whole field of <b>sheep</b>. One <b>fish</b>, a tank of <b>fish</b>. Whiffbeard tried adding an -s to "sheep" once. He was arrested on the spot.</p>
<div class="law-scroll">📜 There’s no shortcut here — you just have to KNOW the rule-breakers. Learn the short list, and you’ll spot every trap.</div>`,
    },
    {
      type: 'talk',
      text: 'Right, second half of the case, young stinker. It’s not just single words that get fancy — a WHOLE GROUP of animals gets its own special name too. Muddle this up and the whole swamp will judge you.',
    },
    {
      type: 'show',
      title: 'Groups Get Their Own Name',
      html: `<p>English loves giving a group of animals ONE special word, instead of just saying "a group of…". These are called <b>collective nouns</b>.</p>
<ul>
<li>a <b>herd</b> of cows</li>
<li>a <b>flock</b> of sheep (or birds)</li>
<li>a <b>swarm</b> of bees</li>
<li>a <b>pack</b> of wolves</li>
<li>a <b>shoal</b> of fish</li>
</ul>
<p>"Twenty cows stood in the field" is fine — but "a <b>herd</b> of cows stood in the field" is the word a proper nature documentary would use. Same meaning, one smart word.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'pc-try-1', topicId: 'plurals-collectives', tier: 1, format: 'clozebox',
        stemParts: ['Down at the pond, a whole gang of hungry ', ' chased Jarlath for his sandwich.'],
        options: [
          { text: 'geese', misconception: null },
          { text: 'gooses', misconception: 'regularised-plural' },
          { text: 'goose', misconception: 'singular-not-plural' },
          { text: 'geeses', misconception: 'double-plural' },
        ],
        correctIndex: 0,
        hintSteps: [
          'A whole gang tells you this needs a PLURAL — but goose is a rule-breaker.',
          'Goose does not just add -s. More than one goose becomes…?',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: 'Goose breaks the normal -s rule completely: the plural is geese, never gooses.',
          whyWrong: {
            gooses: 'That just bolts -s onto goose — but goose refuses the normal rule.',
            goose: 'That is the singular — the sentence needs MORE than one.',
            geeses: 'Geese is already the full plural — you cannot add another ending on top.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'pc-try-2', topicId: 'plurals-collectives', tier: 1, format: 'mcq5',
        stem: 'What do you call a GROUP of wolves hunting together at night?',
        options: [
          { text: 'a pack', misconception: null },
          { text: 'a herd', misconception: 'wrong-collective-cattle' },
          { text: 'a shoal', misconception: 'wrong-collective-fish' },
          { text: 'a swarm', misconception: 'wrong-collective-insect' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Wolves hunt as a team — think predator, not farm animal.',
          'This same word describes a group of dogs too.',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: 'A group of wolves (or dogs) hunting together is called a PACK.',
          whyWrong: {
            'a herd': 'Herd is for grazing animals like cows, not hunting wolves.',
            'a shoal': 'Shoal is the special name for a group of fish.',
            'a swarm': 'Swarm belongs to insects like bees, not wolves.',
          },
        },
      },
    },
    { type: 'anim', anim: 'plurals-collectives' },
    { type: 'weapon' },
  ],

  tips: [
    'Goose→geese, mouse→mice, ox→oxen, child→children, tooth→teeth, foot→feet, man→men, woman→women, person→people — learn this short list of rule-breakers by heart.',
    'Sheep, fish and deer are sneaky — they stay EXACTLY the same in the plural. Never add an -s.',
    'Cows = a herd. Sheep or birds = a flock. Bees = a swarm. Wolves or dogs = a pack. Fish = a shoal.',
    'Words ending in -f or -fe often swap to -ves in the plural: leaf→leaves, half→halves, knife→knives.',
    'When in doubt, say the sentence with "one" and "two" out loud — your ear usually catches the rule-breakers.',
    'Some collective nouns are proper strange: a murder of crows, a parliament of owls, a skein of geese in flight. English loves showing off.',
  ],

  bank: [
    // ================= TIER 1 (12) — 7 clozebox irregular plurals + 5 mcq5 collective nouns =================
    {
      id: 'plurals-collectives-t1-01', tier: 1, format: 'clozebox',
      stemParts: ['Every autumn, a gang of noisy ', ' flies straight over the football pitch.'],
      options: [
        { text: 'geese', misconception: null },
        { text: 'gooses', misconception: 'regularised-plural' },
        { text: 'goose', misconception: 'singular-not-plural' },
        { text: 'geeses', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A gang means MORE than one — but goose is a rule-breaker.',
        'Goose does not just add -s. More than one goose becomes…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Goose breaks the normal -s rule completely: the plural is geese.',
        whyWrong: {
          gooses: 'That just bolts -s onto goose — but goose refuses the normal rule.',
          goose: 'That is the singular — the sentence needs MORE than one.',
          geeses: 'Geese is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-02', tier: 1, format: 'clozebox',
      stemParts: ['During wet playtime, two ', ' scuttled under the classroom radiator.'],
      options: [
        { text: 'mice', misconception: null },
        { text: 'mouses', misconception: 'regularised-plural' },
        { text: 'mouse', misconception: 'singular-not-plural' },
        { text: 'mices', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Two of them means you need the PLURAL — but mouse is a rule-breaker.',
        'Mouse does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Mouse changes completely to mice — never mouses.',
        whyWrong: {
          mouses: 'That just bolts -s onto mouse — but mouse changes completely instead.',
          mouse: 'That is the singular — the sentence needs MORE than one.',
          mices: 'Mice is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-03', tier: 1, format: 'clozebox',
      stemParts: ['Long ago, a team of strong ', ' pulled the heavy farm cart.'],
      options: [
        { text: 'oxen', misconception: null },
        { text: 'oxes', misconception: 'regularised-plural' },
        { text: 'ox', misconception: 'singular-not-plural' },
        { text: 'oxens', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A team means MORE than one — but ox is a rare rule-breaker.',
        'Ox does not add -s or -es. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Ox is one of the rarest rule-breakers: the plural is oxen, never oxes.',
        whyWrong: {
          oxes: 'That just bolts -es onto ox — but ox refuses the normal rule.',
          ox: 'That is the singular — the sentence needs MORE than one.',
          oxens: 'Oxen is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-04', tier: 1, format: 'clozebox',
      stemParts: ['At the school trip, thirty excited ', ' queued for the coach.'],
      options: [
        { text: 'children', misconception: null },
        { text: 'childs', misconception: 'regularised-plural' },
        { text: 'child', misconception: 'singular-not-plural' },
        { text: 'childrens', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Thirty means MORE than one — but child is a rule-breaker.',
        'Child does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Child breaks the rule completely — the plural is children, never childs.',
        whyWrong: {
          childs: 'That just bolts -s onto child — but child changes completely instead.',
          child: 'That is the singular — the sentence needs MORE than one.',
          childrens: 'Children is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-05', tier: 1, format: 'clozebox',
      stemParts: ['The dentist carefully counted every one of Jarlath’s wobbly ', '.'],
      options: [
        { text: 'teeth', misconception: null },
        { text: 'tooths', misconception: 'regularised-plural' },
        { text: 'tooth', misconception: 'singular-not-plural' },
        { text: 'teeths', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Every one of them means MORE than one — but tooth is a rule-breaker.',
        'Tooth does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Tooth changes completely to teeth — never tooths.',
        whyWrong: {
          tooths: 'That just bolts -s onto tooth — but tooth changes completely instead.',
          tooth: 'That is the singular — the sentence needs MORE than one.',
          teeths: 'Teeth is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-06', tier: 1, format: 'clozebox',
      stemParts: ['After the muddy match, both ', ' left prints across the kitchen floor.'],
      options: [
        { text: 'feet', misconception: null },
        { text: 'foots', misconception: 'regularised-plural' },
        { text: 'foot', misconception: 'singular-not-plural' },
        { text: 'feets', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Both means MORE than one — but foot is a rule-breaker.',
        'Foot does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Foot changes completely to feet, never foots.',
        whyWrong: {
          foots: 'That just bolts -s onto foot — but foot changes completely instead.',
          foot: 'That is the singular — the sentence needs MORE than one.',
          feets: 'Feet is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-07', tier: 1, format: 'clozebox',
      stemParts: ['A group of tired ', ' collapsed onto the finish-line grass.'],
      options: [
        { text: 'men', misconception: null },
        { text: 'mans', misconception: 'regularised-plural' },
        { text: 'man', misconception: 'singular-not-plural' },
        { text: 'mens', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A group means MORE than one — but man is a rule-breaker.',
        'Man does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Man breaks the rule completely — the plural is men, never mans.',
        whyWrong: {
          mans: 'That just bolts -s onto man — but man changes completely instead.',
          man: 'That is the singular — the sentence needs MORE than one.',
          mens: 'Men is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-08', tier: 1, format: 'mcq5',
      stem: 'What do you call a GROUP of cows standing together in a field?',
      options: [
        { text: 'a herd', misconception: null },
        { text: 'a flock', misconception: 'wrong-collective-birds-sheep' },
        { text: 'a pack', misconception: 'wrong-collective-predator' },
        { text: 'a shoal', misconception: 'wrong-collective-fish' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Cows are grazing farm animals, not hunters or fish.',
        'This word also describes a group of elephants.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Cows (and cattle) standing together are called a HERD.',
        whyWrong: {
          'a flock': 'Flock is the word for sheep or birds, not cows.',
          'a pack': 'Pack belongs to hunting animals like wolves.',
          'a shoal': 'Shoal is the special name for a group of fish.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-09', tier: 1, format: 'mcq5',
      stem: 'What do you call a GROUP of sheep grazing on the hillside?',
      options: [
        { text: 'a flock', misconception: null },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a swarm', misconception: 'wrong-collective-insect' },
        { text: 'a shoal', misconception: 'wrong-collective-fish' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Sheep share this word with birds.',
        'This is NOT the word used for cows.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Sheep (and birds) grazing or gathered together are called a FLOCK.',
        whyWrong: {
          'a herd': 'Herd is for cattle like cows, not sheep.',
          'a swarm': 'Swarm is for insects like bees.',
          'a shoal': 'Shoal is the special name for a group of fish.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-10', tier: 1, format: 'mcq5',
      stem: 'What do you call a GROUP of angry bees chasing you across the garden?',
      options: [
        { text: 'a swarm', misconception: null },
        { text: 'a pack', misconception: 'wrong-collective-predator' },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a flock', misconception: 'wrong-collective-birds-sheep' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Think of a big buzzing cloud of flying insects.',
        'This word is NOT used for farm animals.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'A big buzzing group of bees is called a SWARM.',
        whyWrong: {
          'a pack': 'Pack belongs to hunting animals like wolves, not insects.',
          'a herd': 'Herd is for grazing farm animals like cows.',
          'a flock': 'Flock is the word for birds or sheep, not insects.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-11', tier: 1, format: 'mcq5',
      stem: 'What do you call a GROUP of wolves hunting together in the forest?',
      options: [
        { text: 'a pack', misconception: null },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a shoal', misconception: 'wrong-collective-fish' },
        { text: 'a swarm', misconception: 'wrong-collective-insect' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Wolves hunt as a team — think predator, not farm animal.',
        'This same word describes a group of dogs too.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'A group of wolves (or dogs) hunting together is called a PACK.',
        whyWrong: {
          'a herd': 'Herd is for grazing animals like cows, not hunting wolves.',
          'a shoal': 'Shoal is the special name for a group of fish.',
          'a swarm': 'Swarm belongs to insects like bees, not wolves.',
        },
      },
    },
    {
      id: 'plurals-collectives-t1-12', tier: 1, format: 'mcq5',
      stem: 'What do you call a GROUP of fish swimming together in the pond?',
      options: [
        { text: 'a shoal', misconception: null },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a pack', misconception: 'wrong-collective-predator' },
        { text: 'a flock', misconception: 'wrong-collective-birds-sheep' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Think about creatures that live underwater.',
        'This word is NOT used for farm animals or hunters.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Fish swimming together are called a SHOAL.',
        whyWrong: {
          'a herd': 'Herd is for grazing animals like cows, not fish.',
          'a pack': 'Pack belongs to hunting animals like wolves.',
          'a flock': 'Flock is the word for birds or sheep, not fish.',
        },
      },
    },

    // ================= TIER 2 (12) — 6 clozebox trickier irregulars/no-change + 6 mcq5 harder collectives =================
    {
      id: 'plurals-collectives-t2-01', tier: 2, format: 'clozebox',
      stemParts: ['Outside the changing rooms, several ', ' waited patiently for the bus.'],
      options: [
        { text: 'women', misconception: null },
        { text: 'womans', misconception: 'regularised-plural' },
        { text: 'woman', misconception: 'singular-not-plural' },
        { text: 'womens', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Several means MORE than one — but woman is a rule-breaker.',
        'Woman does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Woman breaks the rule completely — the plural is women, never womans.',
        whyWrong: {
          womans: 'That just bolts -s onto woman — but woman changes completely instead.',
          woman: 'That is the singular — the sentence needs MORE than one.',
          womens: 'Women is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-02', tier: 2, format: 'clozebox',
      stemParts: ['A huge crowd of ', ' gathered to watch the fireworks display.'],
      options: [
        { text: 'people', misconception: null },
        { text: 'peoples', misconception: 'double-plural' },
        { text: 'person', misconception: 'singular-not-plural' },
        { text: 'persons', misconception: 'overly-formal-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A crowd means MORE than one — but person is a rule-breaker.',
        'Person does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Person changes completely to people — that is the everyday word you need here.',
        whyWrong: {
          peoples: 'People is already the full plural — you cannot add another ending.',
          person: 'That is the singular — the sentence needs MORE than one.',
          persons: 'That is a very formal, official word — everyday writing needs people instead.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-03', tier: 2, format: 'clozebox',
      stemParts: ['On the hillside, a whole field of ', ' grazed calmly in the sun.'],
      options: [
        { text: 'sheep', misconception: null },
        { text: 'sheeps', misconception: 'added-s-when-unchanged' },
        { text: "sheep's", misconception: 'apostrophe-confusion' },
        { text: 'sheepes', misconception: 'added-es-when-unchanged' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A whole field means MORE than one — but sheep is a very sneaky rule-breaker.',
        'Sheep does not change AT ALL between one and many.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Sheep is a sneaky one — it stays EXACTLY the same in the plural. No -s needed at all.',
        whyWrong: {
          sheeps: 'Sheep never takes an -s, even with a whole field of them.',
          "sheep's": 'That apostrophe would show ownership, not a plural — nothing owns anything here.',
          sheepes: 'Sheep never takes an -es either — it simply does not change.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-04', tier: 2, format: 'clozebox',
      stemParts: ['The fishermen counted every silver ', ' caught in the net.'],
      options: [
        { text: 'fish', misconception: null },
        { text: 'fishes', misconception: 'rare-alternative-plural' },
        { text: "fish's", misconception: 'apostrophe-confusion' },
        { text: 'fishies', misconception: 'childish-form' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Every one of them means MORE than one — but fish is a sneaky rule-breaker.',
        'Fish does not change AT ALL between one and many.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Fish usually stays EXACTLY the same in the plural — no -s needed. ("Fishes" only turns up when talking about several DIFFERENT species — far beyond what this net needs.)',
        whyWrong: {
          fishes: 'That only appears for several different SPECIES of fish, not a normal catch.',
          "fish's": 'That apostrophe would show ownership, not a plural — nothing owns anything here.',
          fishies: 'That is a babyish nickname, never the proper plural.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-05', tier: 2, format: 'clozebox',
      stemParts: ['A small group of nervous ', ' froze at the edge of the forest.'],
      options: [
        { text: 'deer', misconception: null },
        { text: 'deers', misconception: 'added-s-when-unchanged' },
        { text: "deer's", misconception: 'apostrophe-confusion' },
        { text: 'deerses', misconception: 'double-wrong-ending' },
      ],
      correctIndex: 0,
      hintSteps: [
        'A small group means MORE than one — but deer is a sneaky rule-breaker.',
        'Deer does not change AT ALL between one and many.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Deer stays EXACTLY the same in the plural — never deers.',
        whyWrong: {
          deers: 'Deer never takes an -s, even with a whole group of them.',
          "deer's": 'That apostrophe would show ownership, not a plural — nothing owns anything here.',
          deerses: 'That bolts on two extra endings at once — deer simply does not change.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-06', tier: 2, format: 'clozebox',
      stemParts: ["After the nurse's visit, everyone checked their hair for ", ' one more time.'],
      options: [
        { text: 'lice', misconception: null },
        { text: 'louses', misconception: 'regularised-plural' },
        { text: 'louse', misconception: 'singular-not-plural' },
        { text: 'lices', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'This is a rarer rule-breaker: the singular word is "louse".',
        'Louse does not add -s. It changes completely into…?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Louse is a rare rule-breaker: the plural is lice, never louses.',
        whyWrong: {
          louses: 'That just bolts -s onto louse — but louse changes completely instead.',
          louse: 'That is the singular — the sentence needs MORE than one.',
          lices: 'Lice is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-07', tier: 2, format: 'mcq5',
      stem: 'What do you call a GROUP of dolphins leaping alongside the boat?',
      options: [
        { text: 'a pod', misconception: null },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a shoal', misconception: 'wrong-collective-fish' },
        { text: 'a flock', misconception: 'wrong-collective-birds-sheep' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Dolphins are sea mammals, not fish — they get their own special word.',
        'Whales share this same collective noun.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Dolphins (and whales) travelling together are called a POD.',
        whyWrong: {
          'a herd': 'Herd is for grazing land animals like cows.',
          'a shoal': 'Shoal is for fish — dolphins are mammals, not fish.',
          'a flock': 'Flock is the word for birds or sheep, not dolphins.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-08', tier: 2, format: 'mcq5',
      stem: 'What do you call a GROUP of puppies born together to the same mother dog?',
      options: [
        { text: 'a litter', misconception: null },
        { text: 'a pack', misconception: 'wrong-collective-adult-dogs' },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a flock', misconception: 'wrong-collective-birds-sheep' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Think about baby animals born at the same time, not grown-up dogs hunting.',
        'This word is used for kittens too.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Baby animals born together, like puppies, are called a LITTER.',
        whyWrong: {
          'a pack': 'Pack describes grown dogs or wolves working together, not a mother’s newborns.',
          'a herd': 'Herd is for grazing animals like cows.',
          'a flock': 'Flock is the word for birds or sheep, not puppies.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-09', tier: 2, format: 'mcq5',
      stem: 'What do you call a GROUP of ants living together in one giant nest?',
      options: [
        { text: 'a colony', misconception: null },
        { text: 'a swarm', misconception: 'wrong-collective-flying-insect' },
        { text: 'a pack', misconception: 'wrong-collective-predator' },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Think about a whole settlement of insects living together, not a flying cloud of them.',
        'Bees living in a hive share this same word.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Ants (and bees living in a hive) settled together are called a COLONY.',
        whyWrong: {
          'a swarm': 'Swarm describes insects flying together, not a settled nest.',
          'a pack': 'Pack belongs to hunting animals like wolves.',
          'a herd': 'Herd is for grazing farm animals like cows.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-10', tier: 2, format: 'mcq5',
      stem: 'A farmer keeps both cows and sheep in his fields — which word describes his COWS?',
      options: [
        { text: 'a herd', misconception: null },
        { text: 'a flock', misconception: 'wrong-collective-birds-sheep' },
        { text: 'a pack', misconception: 'wrong-collective-predator' },
        { text: 'a shoal', misconception: 'wrong-collective-fish' },
      ],
      correctIndex: 0,
      hintSteps: [
        'The sheep get a different word from the cows — do not mix them up.',
        'This word also describes elephants standing together.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Cows are always a HERD — sheep get the different word, flock.',
        whyWrong: {
          'a flock': 'Flock belongs to the sheep in this sentence, not the cows.',
          'a pack': 'Pack belongs to hunting animals like wolves.',
          'a shoal': 'Shoal is the special name for a group of fish.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-11', tier: 2, format: 'mcq5',
      stem: 'Which word describes a GROUP of dogs running together in the park?',
      options: [
        { text: 'a pack', misconception: null },
        { text: 'a shoal', misconception: 'wrong-collective-fish' },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a swarm', misconception: 'wrong-collective-insect' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Dogs share this word with their wild cousins, wolves.',
        'This is NOT the word for fish or farm animals.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Dogs (like wolves) running together are called a PACK, never a shoal.',
        whyWrong: {
          'a shoal': 'Shoal is the special name for a group of fish, not dogs.',
          'a herd': 'Herd is for grazing farm animals like cows.',
          'a swarm': 'Swarm belongs to insects like bees.',
        },
      },
    },
    {
      id: 'plurals-collectives-t2-12', tier: 2, format: 'mcq5',
      stem: 'What do you call a GROUP of pigeons pecking at breadcrumbs in the yard?',
      options: [
        { text: 'a flock', misconception: null },
        { text: 'a swarm', misconception: 'wrong-collective-insect' },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a pack', misconception: 'wrong-collective-predator' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Pigeons are birds — they share their group word with sheep.',
        'This is NOT the word for insects.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Birds, like sheep, gather in a FLOCK.',
        whyWrong: {
          'a swarm': 'Swarm belongs to insects like bees, not birds.',
          'a herd': 'Herd is for grazing farm animals like cows.',
          'a pack': 'Pack belongs to hunting animals like wolves.',
        },
      },
    },

    // ================= TIER 3 (10) — 4 wordentry plural-of + 3 clozebox rarer -f/-fe irregulars + 3 mcq5 rarer collectives =================
    {
      id: 'plurals-collectives-t3-01', tier: 3, format: 'wordentry',
      stem: "Write the plural of <b>'ox'</b>.",
      hint: 'one word — a rare rule-breaker',
      maxLen: 20,
      accept: ['oxen'],
      hintSteps: [
        'Ox does not just add -s or -es.',
        'Think of the rule-breaker list: ox → …?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Ox is a rare rule-breaker: ox + en = oxen.',
      },
    },
    {
      id: 'plurals-collectives-t3-02', tier: 3, format: 'wordentry',
      stem: "Write the plural of <b>'mouse'</b>.",
      hint: 'one word — a rule-breaker',
      maxLen: 20,
      accept: ['mice'],
      hintSteps: [
        'Mouse does not just add -s.',
        'It changes completely, the same way goose changes to geese.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Mouse changes completely: the plural is mice.',
      },
    },
    {
      id: 'plurals-collectives-t3-03', tier: 3, format: 'wordentry',
      stem: "Write the plural of <b>'child'</b>.",
      hint: 'one word — a rule-breaker',
      maxLen: 20,
      accept: ['children'],
      hintSteps: [
        'Child does not just add -s.',
        'It changes completely into a longer word.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Child changes completely: the plural is children.',
      },
    },
    {
      id: 'plurals-collectives-t3-04', tier: 3, format: 'wordentry',
      stem: "Write the plural of <b>'tooth'</b>.",
      hint: 'one word — a rule-breaker',
      maxLen: 20,
      accept: ['teeth'],
      hintSteps: [
        'Tooth does not just add -s.',
        'It changes completely, the same way foot changes to feet.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Tooth changes completely: the plural is teeth.',
      },
    },
    {
      id: 'plurals-collectives-t3-05', tier: 3, format: 'clozebox',
      stemParts: ['By November, dry brown ', ' covered the entire playground.'],
      options: [
        { text: 'leaves', misconception: null },
        { text: 'leafs', misconception: 'regularised-plural' },
        { text: 'leaf', misconception: 'singular-not-plural' },
        { text: 'leaveses', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Words ending in -f often swap the f for a v before adding -es.',
        'Leaf follows this rarer pattern: leaf → …?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Leaf swaps f for v before adding -es: leaf → leaves, never leafs.',
        whyWrong: {
          leafs: 'That just bolts -s onto leaf — but leaf swaps its ending instead.',
          leaf: 'That is the singular — the sentence needs MORE than one.',
          leaveses: 'Leaves is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t3-06', tier: 3, format: 'clozebox',
      stemParts: ['Whiffbeard cut the last biscuit into two equal ', ' to share.'],
      options: [
        { text: 'halves', misconception: null },
        { text: 'halfs', misconception: 'regularised-plural' },
        { text: 'half', misconception: 'singular-not-plural' },
        { text: 'halveses', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Words ending in -f often swap the f for a v before adding -es.',
        'Half follows this rarer pattern: half → …?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Half swaps f for v before adding -es: half → halves, never halfs.',
        whyWrong: {
          halfs: 'That just bolts -s onto half — but half swaps its ending instead.',
          half: 'That is the singular — the sentence needs TWO of them.',
          halveses: 'Halves is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t3-07', tier: 3, format: 'clozebox',
      stemParts: ['The dinner lady carefully counted every one of the sharp ', ' back into the drawer.'],
      options: [
        { text: 'knives', misconception: null },
        { text: 'knifes', misconception: 'regularised-plural' },
        { text: 'knife', misconception: 'singular-not-plural' },
        { text: 'kniveses', misconception: 'double-plural' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Words ending in -fe often swap the f for a v before adding -s.',
        'Knife follows this rarer pattern: knife → …?',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Knife swaps f for v before adding -s: knife → knives, never knifes.',
        whyWrong: {
          knifes: 'That just bolts -s onto knife — but knife swaps its ending instead.',
          knife: 'That is the singular — the sentence needs MORE than one.',
          kniveses: 'Knives is already the full plural — you cannot add another ending.',
        },
      },
    },
    {
      id: 'plurals-collectives-t3-08', tier: 3, format: 'mcq5',
      stem: 'What do you call a GROUP of crows perched along the fence, cawing loudly?',
      options: [
        { text: 'a murder', misconception: null },
        { text: 'a flock', misconception: 'wrong-collective-common-bird-word' },
        { text: 'a swarm', misconception: 'wrong-collective-insect' },
        { text: 'a pack', misconception: 'wrong-collective-predator' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Most birds are a flock — but crows get a spooky word all of their own.',
        'This unusual word sounds more like a crime scene than a bird word.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Believe it or not, a group of crows has its own spooky name: a MURDER.',
        whyWrong: {
          'a flock': 'Flock is the everyday bird word — but crows get their own unusual name instead.',
          'a swarm': 'Swarm belongs to insects like bees, not crows.',
          'a pack': 'Pack belongs to hunting animals like wolves.',
        },
      },
    },
    {
      id: 'plurals-collectives-t3-09', tier: 3, format: 'mcq5',
      stem: 'What do you call a GROUP of owls all perched together in one tree at night?',
      options: [
        { text: 'a parliament', misconception: null },
        { text: 'a flock', misconception: 'wrong-collective-common-bird-word' },
        { text: 'a herd', misconception: 'wrong-collective-cattle' },
        { text: 'a colony', misconception: 'wrong-collective-insect-nest' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Most birds are a flock — but owls get a very grand, official-sounding word.',
        'It is the same word used for a group of politicians.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Owls get a very grand name for a group: a PARLIAMENT.',
        whyWrong: {
          'a flock': 'Flock is the everyday bird word — but owls get their own grand name instead.',
          'a herd': 'Herd is for grazing farm animals like cows.',
          'a colony': 'Colony describes ants or bees settled together, not owls.',
        },
      },
    },
    {
      id: 'plurals-collectives-t3-10', tier: 3, format: 'mcq5',
      stem: 'What do you call a GROUP of geese flying together in a V-shape high above?',
      options: [
        { text: 'a skein', misconception: null },
        { text: 'a gaggle', misconception: 'wrong-collective-geese-on-ground' },
        { text: 'a flock', misconception: 'wrong-collective-common-bird-word' },
        { text: 'a swarm', misconception: 'wrong-collective-insect' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Geese have TWO special words — one for standing still, one for flying.',
        'This one is only used while the geese are actually in the air.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Geese flying together in formation get their own special name: a SKEIN. (Standing on the ground, that same gang would be called a gaggle instead!)',
        whyWrong: {
          'a gaggle': 'Gaggle is for geese standing on the ground — this group is flying.',
          'a flock': 'Flock is the everyday bird word, but geese get their own special names.',
          'a swarm': 'Swarm belongs to insects, not birds.',
        },
      },
    },
  ],
};
