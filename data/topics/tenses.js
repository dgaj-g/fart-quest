// FART QUEST topic: Yesterday's Cave (Grammar Grotto)
// Authored content — implementation agents: read, never modify.
// Bank-driven English topic (clozebox + mcq5 + wordentry). No generator.

const WEAPON_RULE = 'Say it out loud with ‘yesterday’ or ‘tomorrow’ — your ear knows: seek becomes sought, find becomes found.';

export default {
  id: 'tenses',
  name: 'Yesterday’s Cave',
  region: 'grammar-grotto',
  bankTopic: true,
  tagline: 'Every verb has a time zone — and some verbs refuse to travel the easy way.',

  creature: {
    id: 'yesterdays-gary',
    name: 'Yesterday’s Gary',
    rarity: 'rare',
    image: 'assets/monsters/yesterdays-gary.png',
    bio: 'Yesterday’s Gary has been stuck in the past tense since the Tuesday before last — he “seeked” help and “finded” absolutely none. He now insists “seeked” is a real word, and nobody down here has the heart to correct him.',
    factSneak: 'Some past tenses break the rule completely — seek becomes SOUGHT, not “seeked”, and find becomes FOUND, not “finded”.',
  },

  weapon: {
    id: 'time-machine-test',
    name: 'The Time-Machine Test',
    tagline: 'Never get caught out by a shape-shifting verb again.',
    rule: WEAPON_RULE,
    example: 'Does Jarlath <b>seek</b> the ball or <b>sought</b> it? Say “yesterday, Jarlath…” out loud — your ear picks <b>sought</b> every time.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-tenses',
      text: 'Oi oi, my brave nose-soldier! Down here in Yesterday’s Cave, I got so stuck in the past that I still say “I seeked the treasure” and “I finded nothing”. Sounds ridiculous, doesn’t it? That’s because English verbs love to break their OWN rules — and today you’re learning exactly how to catch them at it.',
    },
    {
      type: 'show',
      title: 'Present, Past… and Future!',
      html: `<p>Every verb tells you WHEN something happens. There are three big time zones to know:</p>
<ul>
<li><b>Present</b> — happening now, or always true. <i>Jarlath kicks the ball.</i></li>
<li><b>Past</b> — already happened. <i>Jarlath kicked the ball.</i></li>
<li><b>Future</b> — hasn’t happened yet, usually spotted by the word <b>will</b>. <i>Jarlath will kick the ball.</i></li>
</ul>
<p>Most verbs move to the past the easy way: just bolt on <b>-ed</b>. Kick becomes kicked, jump becomes jumped, sniff becomes sniffed. Simple!</p>`,
    },
    {
      type: 'talk',
      text: 'But watch out, young stinker — some verbs REFUSE to just add -ed. They’re rebels. They change their WHOLE shape instead, and if you try to bolt -ed onto them, you’ll sound completely daft. Let me show you the worst offenders.',
    },
    {
      type: 'show',
      title: 'The Irregular Rebels',
      html: `<p>These verbs do NOT add -ed. Learn their disguises:</p>
<ul>
<li><b>seek</b> → <b>sought</b> (never “seeked”)</li>
<li><b>find</b> → <b>found</b> (never “finded”)</li>
<li><b>catch</b> → <b>caught</b> (never “catched”)</li>
<li><b>teach</b> → <b>taught</b> (never “teached”)</li>
<li><b>go</b> → <b>went</b> (never “goed”)</li>
<li><b>write</b> → <b>wrote</b> (never “writed”)</li>
</ul>
<div class="law-scroll">📜 ${WEAPON_RULE}</div>`,
    },
    {
      type: 'show',
      title: 'The Ear Test (and a peek at Will/Would)',
      html: `<p>Not sure which past form is correct? Say the sentence out loud with <b>yesterday</b> stuck on the front. Your ear will reject the fake one instantly: “Yesterday, Whiffbeard finded a sock” sounds silly — but “Yesterday, Whiffbeard found a sock” sounds right.</p>
<p>One more time zone to notice: <b>will</b> points to the future (“Jarlath will score”), while <b>would</b> often points BACK to something that used to happen, or to what someone said would happen (“He said he would score”). Just be aware of the difference for now — you’ll meet it properly later.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tenses-try-1', topicId: 'tenses', tier: 1, format: 'clozebox',
        stemParts: ['At football practice, the goalkeeper ', ' every single shot without trying.'],
        options: [
          { text: 'caught', misconception: null },
          { text: 'catched', misconception: 'overregularised' },
          { text: 'catches', misconception: 'present-tense-not-past' },
          { text: 'caughted', misconception: 'double-marked' },
          { text: 'cot', misconception: 'sound-alike' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Say it with “yesterday” out loud: which word actually exists?',
          'Catch is a rebel verb — it changes shape completely, into caught.',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: '“Yesterday, the goalkeeper CAUGHT every shot” is the only real word — catch rebels into caught instead of adding -ed.',
          whyWrong: {
            catches: 'That is the present tense — it describes what happens today, not that one practice.',
            caughted: 'That adds -ed AND changes the shape — only one change is allowed, and it isn’t this one.',
            cot: 'That is a different word entirely (a small bed) — it just sounds a little similar.',
            catched: 'That tries to bolt -ed onto catch, but catch refuses that treatment.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'tenses-try-2', topicId: 'tenses', tier: 2, format: 'mcq5',
        stem: 'In “Whiffbeard <b>went</b> straight to the smelliest corner of the swamp,” what tense is the bolded verb?',
        options: [
          { text: 'past', misconception: null },
          { text: 'present', misconception: 'confused-with-present' },
          { text: 'future', misconception: 'confused-with-future' },
          { text: 'present continuous', misconception: 'confused-with-continuous' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Try the Ear Test: does “Whiffbeard goes” or “Whiffbeard went” match the sentence?',
          'Went is the rebel past form of go — it already happened.',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: 'Went is the irregular past-tense form of go — the sneaking already happened, so the tense is past.',
          whyWrong: {
            present: 'The present form would be “goes” — today, not already-happened.',
            future: 'The future would need “will go” — there is no “will” here.',
            'present continuous': 'That would need “is going” — a different shape entirely.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Regular verbs just bolt on -ed for the past: jump becomes jumped, sniff becomes sniffed.',
    'Rebel verbs change their whole shape instead: seek→sought, find→found, catch→caught, teach→taught, go→went, write→wrote.',
    'The Ear Test: say the sentence with ‘yesterday’ stuck on the front — your ear rejects the fake word instantly.',
    'Overregularising traps: ‘seeked’, ‘finded’, ‘catched’, ‘teached’, ‘goed’ and ‘writed’ are never correct, however tempting they sound.',
    '‘Will’ points to the future — something that has not happened yet.',
    'Watch two classic mix-ups: bought (from buy) is not brought (from bring); wore (from wear) is not were (from be).',
  ],

  bank: [
    // ================= TIER 1 (12): 8 clozebox (core irregular past forms) + 4 mcq5 (spot-the-tense, regular verbs) =================
    {
      id: 'tenses-t1-01', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['Last weekend, the scout troop ', ' the hidden treasure all across the campsite.'],
      options: [
        { text: 'sought', misconception: null },
        { text: 'seeked', misconception: 'overregularised' },
        { text: 'seeks', misconception: 'present-tense-not-past' },
        { text: 'sort', misconception: 'sound-alike' },
        { text: 'was seeking', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Say it with “yesterday” — does “seeked” sound like a real word?',
        'Seek is a rebel verb: it changes shape completely, into sought.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Seek rebels into SOUGHT instead of adding -ed — “the troop sought the treasure” is the only real past form.',
        whyWrong: {
          seeked: 'That tries to bolt -ed onto seek, but seek refuses that treatment.',
          seeks: 'That is the present tense — happening today, not last weekend.',
          sort: 'That is a completely different word that just sounds similar.',
          'was seeking': 'That describes an ongoing action, not the simple one-off past tense needed here.',
        },
      },
    },
    {
      id: 'tenses-t1-02', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['Yesterday, Jarlath ', ' a fifty pence coin under the sofa cushions.'],
      options: [
        { text: 'found', misconception: null },
        { text: 'finded', misconception: 'overregularised' },
        { text: 'finds', misconception: 'present-tense-not-past' },
        { text: 'fined', misconception: 'sound-alike' },
        { text: 'was found', misconception: 'wrong-voice-passive' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test with “yesterday” — which word actually exists?',
        'Find is a rebel verb: it changes shape completely, into found.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Find rebels into FOUND instead of adding -ed — “Jarlath found a coin” is the correct past form.',
        whyWrong: {
          finded: 'That tries to bolt -ed onto find, but find refuses that treatment.',
          finds: 'That is the present tense — today, not yesterday.',
          fined: 'That means to be given a penalty — a totally different word that sounds alike.',
          'was found': 'That flips the sentence around (the coin was found BY Jarlath) — a different kind of sentence altogether.',
        },
      },
    },
    {
      id: 'tenses-t1-03', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['During the match, the goalkeeper ', ' three shots in a row without dropping one.'],
      options: [
        { text: 'caught', misconception: null },
        { text: 'catches', misconception: 'present-tense-not-past' },
        { text: 'cot', misconception: 'sound-alike' },
        { text: 'was catching', misconception: 'wrong-form-continuous' },
        { text: 'catched', misconception: 'overregularised' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “catched” sound like a real word?',
        'Catch is a rebel verb: it changes shape completely, into caught.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Catch rebels into CAUGHT instead of adding -ed — “the goalkeeper caught three shots” is correct.',
        whyWrong: {
          catches: 'That is the present tense — happening today, not during that match.',
          cot: 'That is a different word (a small bed) that just sounds similar.',
          'was catching': 'That describes an ongoing action, not the finished one-off action described here.',
          catched: 'That tries to bolt -ed onto catch, but catch refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t1-04', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['Two years ago, Mr Whiffbeard ', ' the whole class how to hold their noses properly.'],
      options: [
        { text: 'taught', misconception: null },
        { text: 'teached', misconception: 'overregularised' },
        { text: 'teaches', misconception: 'present-tense-not-past' },
        { text: 'tot', misconception: 'sound-alike' },
        { text: 'was teaching', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “teached” sound like a real word?',
        'Teach is a rebel verb: it changes shape completely, into taught.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Teach rebels into TAUGHT instead of adding -ed — “Mr Whiffbeard taught the class” is correct.',
        whyWrong: {
          teaches: 'That is the present tense — happening today, not two years ago.',
          tot: 'That is a completely different word that just sounds similar.',
          'was teaching': 'That describes an ongoing action rather than the completed one-off event described here.',
          teached: 'That tries to bolt -ed onto teach, but teach refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t1-05', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['Last summer, the whole family ', ' to the seaside for a soggy picnic.'],
      options: [
        { text: 'went', misconception: null },
        { text: 'goed', misconception: 'overregularised' },
        { text: 'goes', misconception: 'present-tense-not-past' },
        { text: 'gone', misconception: 'participle-not-simple-past' },
        { text: 'was going', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “goed” sound like a real word?',
        'Go is a rebel verb: it changes shape completely, into went.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Go rebels into WENT instead of adding -ed — “the family went to the seaside” is correct.',
        whyWrong: {
          goes: 'That is the present tense — happening today, not last summer.',
          gone: 'That needs a helper word first (“had gone”) — on its own it cannot finish this sentence.',
          'was going': 'That describes an ongoing action, not the simple one-off trip described here.',
          goed: 'That tries to bolt -ed onto go, but go refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t1-06', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['On Tuesday, Jarlath ', ' a whole page about his favourite football team.'],
      options: [
        { text: 'wrote', misconception: null },
        { text: 'writed', misconception: 'overregularised' },
        { text: 'writes', misconception: 'present-tense-not-past' },
        { text: 'rote', misconception: 'sound-alike' },
        { text: 'was writing', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “writed” sound like a real word?',
        'Write is a rebel verb: it changes shape completely, into wrote.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Write rebels into WROTE instead of adding -ed — “Jarlath wrote a whole page” is correct.',
        whyWrong: {
          writes: 'That is the present tense — happening today, not on Tuesday.',
          rote: 'That is a different word about repeating something from memory — it just sounds similar.',
          'was writing': 'That describes an ongoing action, not the finished one-off page described here.',
          writed: 'That tries to bolt -ed onto write, but write refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t1-07', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['During the storm, a huge branch ', ' clean off the old oak tree.'],
      options: [
        { text: 'broke', misconception: null },
        { text: 'breaked', misconception: 'overregularised' },
        { text: 'breaks', misconception: 'present-tense-not-past' },
        { text: 'broked', misconception: 'double-marked' },
        { text: 'braik', misconception: 'sound-alike' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “breaked” sound like a real word?',
        'Break is a rebel verb: it changes shape completely, into broke.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Break rebels into BROKE instead of adding -ed — “a branch broke off the tree” is correct.',
        whyWrong: {
          breaks: 'That is the present tense — happening today, not during that storm.',
          broked: 'That adds -ed AND changes the shape — only the shape-change is needed, not both.',
          braik: 'That is not a real spelling of any English word at all.',
          breaked: 'That tries to bolt -ed onto break, but break refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t1-08', topicId: 'tenses', tier: 1, format: 'clozebox',
      stemParts: ['At sports day, Jarlath ', ' the whole race without stopping once.'],
      options: [
        { text: 'ran', misconception: null },
        { text: 'runned', misconception: 'overregularised' },
        { text: 'runs', misconception: 'present-tense-not-past' },
        { text: 'run', misconception: 'present-tense-not-past' },
        { text: 'was running', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “runned” sound like a real word?',
        'Run is a rebel verb: it changes shape completely, into ran.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Run rebels into RAN instead of adding -ed — “Jarlath ran the whole race” is correct.',
        whyWrong: {
          runs: 'That is the present tense — happening today, not on sports day.',
          run: 'That is the same word left in its present/base shape — it needs to change to show the past.',
          'was running': 'That describes an ongoing action, not the finished one-off race described here.',
          runned: 'That tries to bolt -ed onto run, but run refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t1-09', topicId: 'tenses', tier: 1, format: 'mcq5',
      stem: 'In “Every morning, Jarlath <b>brushes</b> his teeth before breakfast,” what tense is the bolded verb?',
      options: [
        { text: 'present', misconception: null },
        { text: 'past', misconception: 'confused-with-past' },
        { text: 'future', misconception: 'confused-with-future' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Is this something happening regularly, right now, or already finished?',
        '“Brushes” ends in -es, the present-tense form — it happens every morning, not just once in the past.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Brushes” is the present-tense form — it describes something that happens regularly, right now.',
        whyWrong: {
          past: 'The past form would be “brushed” — something already finished.',
          future: 'The future would need “will brush” — there is no “will” here.',
          'present continuous': 'That would need “is brushing” — a different shape entirely.',
        },
      },
    },
    {
      id: 'tenses-t1-10', topicId: 'tenses', tier: 1, format: 'mcq5',
      stem: 'In “Last night, the dog <b>chewed</b> a hole straight through Jarlath’s slipper,” what tense is the bolded verb?',
      options: [
        { text: 'past', misconception: null },
        { text: 'present', misconception: 'confused-with-present' },
        { text: 'future', misconception: 'confused-with-future' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Did this already happen, or is it happening regularly?',
        '“Chewed” ends in -ed and follows “last night” — that is a finished, past event.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Chewed” is the regular past-tense form (chew + ed), describing something that already happened last night.',
        whyWrong: {
          present: 'The present form would be “chews” — happening regularly, not a one-off last night.',
          future: 'The future would need “will chew” — there is no “will” here.',
          'present continuous': 'That would need “was chewing” — a different, ongoing shape.',
        },
      },
    },
    {
      id: 'tenses-t1-11', topicId: 'tenses', tier: 1, format: 'mcq5',
      stem: 'In “Tomorrow, the whole team <b>will train</b> extra hard before the big match,” what tense is the bolded phrase?',
      options: [
        { text: 'future', misconception: null },
        { text: 'present', misconception: 'confused-with-present' },
        { text: 'past', misconception: 'confused-with-past' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Has this happened yet, or is it still to come?',
        '“Will” is the big clue word for something that has not happened yet.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Will train” points to the future — something that has not happened yet, signalled by the word “will”.',
        whyWrong: {
          present: 'The present form would just be “trains” — no “will” needed.',
          past: 'The past form would be “trained” — something already finished.',
          'present continuous': 'That would need “is training” — happening right now, not tomorrow.',
        },
      },
    },
    {
      id: 'tenses-t1-12', topicId: 'tenses', tier: 1, format: 'mcq5',
      stem: 'In “Right now, Whiffbeard <b>is sniffing</b> the air for the source of the pong,” what tense is the bolded phrase?',
      options: [
        { text: 'present continuous', misconception: null },
        { text: 'present', misconception: 'confused-with-present' },
        { text: 'past', misconception: 'confused-with-past' },
        { text: 'future', misconception: 'confused-with-future' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Is this happening in one moment, right this second?',
        '“Is sniffing” describes an action happening RIGHT NOW, not a regular habit.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Is sniffing” describes an action happening at this very moment — the present continuous.',
        whyWrong: {
          present: 'The simple present would be “sniffs” — a regular habit, not this exact moment.',
          past: 'The past form would be “sniffed” — something already finished.',
          future: 'The future would need “will sniff” — there is no “will” here.',
        },
      },
    },

    // ================= TIER 2 (12): 7 clozebox (more irregulars, tougher misconceptions) + 5 mcq5 (spot-the-tense w/o time-clue words, + will/would) =================
    {
      id: 'tenses-t2-01', topicId: 'tenses', tier: 2, format: 'clozebox',
      stemParts: ['At the party, Jarlath ', ' four whole slices of chocolate cake.'],
      options: [
        { text: 'ate', misconception: null },
        { text: 'eated', misconception: 'overregularised' },
        { text: 'eats', misconception: 'present-tense-not-past' },
        { text: 'eaten', misconception: 'participle-not-simple-past' },
        { text: 'et', misconception: 'sound-alike' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “eated” sound like a real word?',
        'Eat is a rebel verb: it changes shape completely, into ate.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Eat rebels into ATE instead of adding -ed — “Jarlath ate four slices” is correct.',
        whyWrong: {
          eats: 'That is the present tense — happening today, not at that party.',
          eaten: 'That needs a helper word first (“had eaten”) — alone it cannot finish this sentence.',
          et: 'That is not a standard spelling of any English past tense.',
          eated: 'That tries to bolt -ed onto eat, but eat refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t2-02', topicId: 'tenses', tier: 2, format: 'clozebox',
      stemParts: ['With his pocket money, Jarlath ', ' a brand new football from the shop.'],
      options: [
        { text: 'bought', misconception: null },
        { text: 'buyed', misconception: 'overregularised' },
        { text: 'buys', misconception: 'present-tense-not-past' },
        { text: 'brought', misconception: 'wrong-irregular-verb' },
        { text: 'bort', misconception: 'sound-alike' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “buyed” sound like a real word?',
        'Buy is a rebel verb: it changes shape completely, into bought — do not mix it up with bring.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Buy rebels into BOUGHT instead of adding -ed — “Jarlath bought a football” is correct.',
        whyWrong: {
          buys: 'That is the present tense — happening today, not at the shop that time.',
          brought: 'That is the past tense of a DIFFERENT verb, bring, not buy.',
          bort: 'That is not a real spelling of any English word.',
          buyed: 'That tries to bolt -ed onto buy, but buy refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t2-03', topicId: 'tenses', tier: 2, format: 'clozebox',
      stemParts: ['At first, Jarlath ', ' the strange noise was just the wind outside.'],
      options: [
        { text: 'thought', misconception: null },
        { text: 'thinked', misconception: 'overregularised' },
        { text: 'thinks', misconception: 'present-tense-not-past' },
        { text: 'thunk', misconception: 'informal-nonstandard' },
        { text: 'taught', misconception: 'wrong-irregular-verb' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “thinked” sound like a real word?',
        'Think is a rebel verb: it changes shape completely, into thought.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Think rebels into THOUGHT instead of adding -ed — “Jarlath thought it was the wind” is correct.',
        whyWrong: {
          thinks: 'That is the present tense — happening today, not “at first” that time.',
          thunk: 'That is an informal joke word, not standard written English.',
          taught: 'That is the past tense of a DIFFERENT verb, teach, not think.',
          thinked: 'That tries to bolt -ed onto think, but think refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t2-04', topicId: 'tenses', tier: 2, format: 'clozebox',
      stemParts: ['All through assembly, the whole class ', ' perfectly still on the hard floor.'],
      options: [
        { text: 'sat', misconception: null },
        { text: 'sitted', misconception: 'overregularised' },
        { text: 'sits', misconception: 'present-tense-not-past' },
        { text: 'set', misconception: 'sound-alike' },
        { text: 'was sitting', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “sitted” sound like a real word?',
        'Sit is a rebel verb: it changes shape completely, into sat.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Sit rebels into SAT instead of adding -ed — “the class sat perfectly still” is correct.',
        whyWrong: {
          sits: 'That is the present tense — happening today, not that particular assembly.',
          set: 'That is a different verb altogether that just sounds similar — to place something down.',
          'was sitting': 'That describes an ongoing action rather than the plain fact stated here.',
          sitted: 'That tries to bolt -ed onto sit, but sit refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t2-05', topicId: 'tenses', tier: 2, format: 'clozebox',
      stemParts: ['During the storm, an icy wind ', ' every single leaf off the trees.'],
      options: [
        { text: 'blew', misconception: null },
        { text: 'blowed', misconception: 'overregularised' },
        { text: 'blows', misconception: 'present-tense-not-past' },
        { text: 'blue', misconception: 'homophone-confusion' },
        { text: 'was blowing', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “blowed” sound like a real word?',
        'Blow is a rebel verb: it changes shape completely, into blew.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Blow rebels into BLEW instead of adding -ed — “the wind blew every leaf off” is correct.',
        whyWrong: {
          blows: 'That is the present tense — happening today, not during that storm.',
          blue: 'That is a colour word that only sounds identical — spelt completely differently.',
          'was blowing': 'That describes an ongoing action, not the finished one-off gust described here.',
          blowed: 'That tries to bolt -ed onto blow, but blow refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t2-06', topicId: 'tenses', tier: 2, format: 'clozebox',
      stemParts: ['In the final second, the striker ', ' himself at the ball and scored.'],
      options: [
        { text: 'threw', misconception: null },
        { text: 'throwed', misconception: 'overregularised' },
        { text: 'throws', misconception: 'present-tense-not-past' },
        { text: 'through', misconception: 'homophone-confusion' },
        { text: 'thrown', misconception: 'participle-not-simple-past' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “throwed” sound like a real word?',
        'Throw is a rebel verb: it changes shape completely, into threw.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Throw rebels into THREW instead of adding -ed — “the striker threw himself at the ball” is correct.',
        whyWrong: {
          throws: 'That is the present tense — happening today, not that one dramatic moment.',
          through: 'That is a completely different word about passing inside something — it just sounds identical.',
          thrown: 'That needs a helper word first (“had thrown”) — alone it cannot finish this sentence.',
          throwed: 'That tries to bolt -ed onto throw, but throw refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t2-07', topicId: 'tenses', tier: 2, format: 'clozebox',
      stemParts: ['At the end of the trip, the teacher ', ' every pupil a shiny gold sticker.'],
      options: [
        { text: 'gave', misconception: null },
        { text: 'gived', misconception: 'overregularised' },
        { text: 'gives', misconception: 'present-tense-not-past' },
        { text: 'given', misconception: 'participle-not-simple-past' },
        { text: 'gaved', misconception: 'double-marked' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Try the Ear Test — does “gived” sound like a real word?',
        'Give is a rebel verb: it changes shape completely, into gave.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Give rebels into GAVE instead of adding -ed — “the teacher gave every pupil a sticker” is correct.',
        whyWrong: {
          gives: 'That is the present tense — happening today, not at the end of that trip.',
          given: 'That needs a helper word first (“had given”) — alone it cannot finish this sentence.',
          gaved: 'That adds -ed AND changes the shape — only the shape-change is needed, not both.',
          gived: 'That tries to bolt -ed onto give, but give refuses that treatment.',
        },
      },
    },
    {
      id: 'tenses-t2-08', topicId: 'tenses', tier: 2, format: 'mcq5',
      stem: 'In “Whiffbeard <b>caught</b> the frisbee behind his back without even looking,” what tense is the bolded verb?',
      options: [
        { text: 'past', misconception: null },
        { text: 'present', misconception: 'confused-with-present' },
        { text: 'future', misconception: 'confused-with-future' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'There is no time-clue word here — you have to judge the VERB shape itself.',
        '“Caught” is the rebel past form of catch — it has already happened.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Caught” is the irregular past-tense form of catch — the action already happened, even with no word like “yesterday” to signal it.',
        whyWrong: {
          present: 'The present form would be “catches” — not this rebel past shape.',
          future: 'The future would need “will catch” — there is no “will” here.',
          'present continuous': 'That would need “is catching” — a different, ongoing shape.',
        },
      },
    },
    {
      id: 'tenses-t2-09', topicId: 'tenses', tier: 2, format: 'mcq5',
      stem: 'In “The dragon <b>flew</b> low over the rooftops, hunting for smelly socks,” what tense is the bolded verb?',
      options: [
        { text: 'past', misconception: null },
        { text: 'present', misconception: 'confused-with-present' },
        { text: 'future', misconception: 'confused-with-future' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'There is no obvious time word here — judge the verb shape.',
        '“Flew” is the rebel past form of fly — it has already happened.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Flew” is the irregular past-tense form of fly — the flying already happened.',
        whyWrong: {
          present: 'The present form would be “flies” — not this rebel past shape.',
          future: 'The future would need “will fly” — there is no “will” here.',
          'present continuous': 'That would need “is flying” — a different, ongoing shape.',
        },
      },
    },
    {
      id: 'tenses-t2-10', topicId: 'tenses', tier: 2, format: 'mcq5',
      stem: 'In “The whole class <b>sings</b> the same silly song every single Friday,” what tense is the bolded verb?',
      options: [
        { text: 'present', misconception: null },
        { text: 'past', misconception: 'confused-with-past' },
        { text: 'future', misconception: 'confused-with-future' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Is this a regular habit, or a one-off finished event?',
        '“Sings” ends in -s and the word “every” signals a regular habit — that is present tense.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Sings” is the present-tense form describing a regular habit that happens every Friday.',
        whyWrong: {
          past: 'The past form would be “sang” — something already finished, not a regular habit.',
          future: 'The future would need “will sing” — there is no “will” here.',
          'present continuous': 'That would need “is singing” — happening this exact moment, not every week.',
        },
      },
    },
    {
      id: 'tenses-t2-11', topicId: 'tenses', tier: 2, format: 'mcq5',
      stem: 'Which sentence talks about something in the FUTURE, that has not happened yet?',
      options: [
        { text: '“Jarlath will score in the next match.”', misconception: null },
        { text: '“Jarlath scored in the last match.”', misconception: 'confused-with-past' },
        { text: '“Jarlath scores in every match.”', misconception: 'confused-with-present' },
        { text: '“Jarlath is scoring right now.”', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Look for the word that signals something has not happened yet.',
        '“Will” is the clue word for the future.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Will score” points to the future — a match that has not been played yet.',
        whyWrong: {
          '“Jarlath scored in the last match.”': 'That uses the past tense — it already happened.',
          '“Jarlath scores in every match.”': 'That is the present tense, describing a regular habit.',
          '“Jarlath is scoring right now.”': 'That is present continuous — happening at this exact moment.',
        },
      },
    },
    {
      id: 'tenses-t2-12', topicId: 'tenses', tier: 2, format: 'mcq5',
      stem: 'In “Every evening, Jarlath <b>brushes</b> Whiffbeard’s beard until it gleams,” what tense is the bolded verb?',
      options: [
        { text: 'present', misconception: null },
        { text: 'past', misconception: 'confused-with-past' },
        { text: 'future', misconception: 'confused-with-future' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Is this a regular habit, or a finished one-off event?',
        '“Brushes” plus “every evening” signals a regular habit — present tense.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Brushes” is present tense, describing Jarlath’s regular evening habit.',
        whyWrong: {
          past: 'The past form would be “brushed” — a finished one-off event, not a habit.',
          future: 'The future would need “will brush” — there is no “will” here.',
          'present continuous': 'That would need “is brushing” — happening this exact moment, not every evening.',
        },
      },
    },

    // ================= TIER 3 (10): 4 wordentry (write the past tense) + 4 clozebox (subtle sound-alike traps) + 2 mcq5 (subtle tense + will/would) =================
    {
      id: 'tenses-t3-01', topicId: 'tenses', tier: 3, format: 'wordentry',
      stem: 'Write the past tense of the verb ‘teach’.',
      hint: 'one word',
      maxLen: 20,
      accept: ['taught'],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Teach” is a rebel verb — say it with “yesterday”: “yesterday, she taught” — teach becomes TAUGHT, never “teached”.',
      },
      hintSteps: [
        'Say it with “yesterday” out loud — does “teached” sound like a real word?',
        'Teach rebels into a whole new shape: t-a-u-g-h-t.',
      ],
    },
    {
      id: 'tenses-t3-02', topicId: 'tenses', tier: 3, format: 'wordentry',
      stem: 'Write the past tense of the verb ‘seek’.',
      hint: 'one word',
      maxLen: 20,
      accept: ['sought'],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Seek” is a rebel verb — say it with “yesterday”: “yesterday, he sought” — seek becomes SOUGHT, never “seeked”.',
      },
      hintSteps: [
        'Say it with “yesterday” out loud — does “seeked” sound like a real word?',
        'Seek rebels into a whole new shape: s-o-u-g-h-t.',
      ],
    },
    {
      id: 'tenses-t3-03', topicId: 'tenses', tier: 3, format: 'wordentry',
      stem: 'Write the past tense of the verb ‘catch’.',
      hint: 'one word',
      maxLen: 20,
      accept: ['caught'],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Catch” is a rebel verb — say it with “yesterday”: “yesterday, she caught” — catch becomes CAUGHT, never “catched”.',
      },
      hintSteps: [
        'Say it with “yesterday” out loud — does “catched” sound like a real word?',
        'Catch rebels into a whole new shape: c-a-u-g-h-t.',
      ],
    },
    {
      id: 'tenses-t3-04', topicId: 'tenses', tier: 3, format: 'wordentry',
      stem: 'Write the past tense of the verb ‘buy’.',
      hint: 'one word',
      maxLen: 20,
      accept: ['bought'],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Buy” is a rebel verb — say it with “yesterday”: “yesterday, he bought” — buy becomes BOUGHT, never “buyed”. (Careful not to write “brought” — that belongs to a different verb, bring!)',
      },
      hintSteps: [
        'Say it with “yesterday” out loud — does “buyed” sound like a real word?',
        'Buy rebels into a whole new shape: b-o-u-g-h-t — not to be confused with “brought”.',
      ],
    },
    {
      id: 'tenses-t3-05', topicId: 'tenses', tier: 3, format: 'clozebox',
      stemParts: ['Every single day, without exception, Jarlath ', ' a soggy cheese sandwich to school.'],
      options: [
        { text: 'brought', misconception: null },
        { text: 'bought', misconception: 'wrong-irregular-verb' },
        { text: 'brang', misconception: 'overregularised' },
        { text: 'bringed', misconception: 'overregularised' },
        { text: 'brung', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'This is about carrying something WITH him, not purchasing it — which rebel verb fits?',
        'Bring rebels into brought, not “brang” or “bringed”.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Bring rebels into BROUGHT — “Jarlath brought a sandwich” means he carried it with him, which is different from buying it there.',
        whyWrong: {
          bought: 'That is the past tense of a DIFFERENT verb, buy, meaning to purchase — not to carry along.',
          brang: 'That sounds tempting but is not a standard English word.',
          bringed: 'That tries to bolt -ed onto bring, but bring refuses that treatment.',
          brung: 'That is an informal, nonstandard word — not accepted in written English.',
        },
      },
    },
    {
      id: 'tenses-t3-06', topicId: 'tenses', tier: 3, format: 'clozebox',
      stemParts: ['For the whole tournament, the goalkeeper ', ' odd socks for good luck.'],
      options: [
        { text: 'wore', misconception: null },
        { text: 'were', misconception: 'homophone-confusion' },
        { text: 'weared', misconception: 'overregularised' },
        { text: 'worn', misconception: 'participle-not-simple-past' },
        { text: 'wearing', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Wear and “were” sound almost identical — which one actually means “had on his feet”?',
        'Wear rebels into wore, not “weared”.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Wear rebels into WORE — “the goalkeeper wore odd socks” describes what was on his feet.',
        whyWrong: {
          were: 'That sounds almost identical but is a form of the verb “to be”, not “to wear” at all.',
          weared: 'That tries to bolt -ed onto wear, but wear refuses that treatment.',
          worn: 'That needs a helper word first (“had worn”) — alone it cannot finish this sentence.',
          wearing: 'That describes an ongoing action rather than the simple fact stated here.',
        },
      },
    },
    {
      id: 'tenses-t3-07', topicId: 'tenses', tier: 3, format: 'clozebox',
      stemParts: ['With one mighty kick, the striker ', ' the ball straight into the top corner.'],
      options: [
        { text: 'threw', misconception: null },
        { text: 'through', misconception: 'homophone-confusion' },
        { text: 'throwed', misconception: 'overregularised' },
        { text: 'thrown', misconception: 'participle-not-simple-past' },
        { text: 'throws', misconception: 'present-tense-not-past' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Throw and “through” sound identical but mean very different things — which one is the ACTION?',
        'Throw rebels into threw, not “throwed”.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Throw rebels into THREW — “the striker threw the ball” describes the kicking action.',
        whyWrong: {
          through: 'That sounds identical but means passing inside or across something — not the action of throwing at all.',
          throwed: 'That tries to bolt -ed onto throw, but throw refuses that treatment.',
          thrown: 'That needs a helper word first (“had thrown”) — alone it cannot finish this sentence.',
          throws: 'That is the present tense — happening today, not that one dramatic kick.',
        },
      },
    },
    {
      id: 'tenses-t3-08', topicId: 'tenses', tier: 3, format: 'clozebox',
      stemParts: ['At exactly three o’clock, the old school bell ', ' loudly across the whole playground.'],
      options: [
        { text: 'rang', misconception: null },
        { text: 'rung', misconception: 'participle-not-simple-past' },
        { text: 'ringed', misconception: 'overregularised' },
        { text: 'rings', misconception: 'present-tense-not-past' },
        { text: 'was ringing', misconception: 'wrong-form-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ring rebels into rang for the plain past — “rung” needs a helper word first.',
        'Say it with “yesterday” — “yesterday, the bell rang” sounds right; “yesterday, the bell rung” does not.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Ring rebels into RANG for the simple past — “rung” only works with a helper word, like “had rung”.',
        whyWrong: {
          rung: 'That needs a helper word first (“had rung”) — alone it cannot finish this sentence.',
          ringed: 'That tries to bolt -ed onto ring, but ring refuses that treatment.',
          rings: 'That is the present tense — happening today, not at exactly three o’clock that day.',
          'was ringing': 'That describes an ongoing sound, not the single sharp ring described here.',
        },
      },
    },
    {
      id: 'tenses-t3-09', topicId: 'tenses', tier: 3, format: 'mcq5',
      stem: 'In “Whiffbeard <b>forgave</b> the smelly stinkling eventually, after a good long sulk,” what tense is the bolded verb?',
      options: [
        { text: 'past', misconception: null },
        { text: 'future', misconception: 'time-word-not-tense-marker' },
        { text: 'present', misconception: 'confused-with-present' },
        { text: 'present continuous', misconception: 'confused-with-continuous' },
      ],
      correctIndex: 0,
      hintSteps: [
        '“Eventually” describes WHEN within the story, but it is not the tense-marker word “will”.',
        '“Forgave” is the rebel past form of forgive — it has already happened.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '“Forgave” is the irregular past-tense form of forgive — the forgiving already happened, even though “eventually” makes it sound drawn-out.',
        whyWrong: {
          future: '“Eventually” is not the same as “will” — it just describes how long something took, not that it is still to come.',
          present: 'The present form would be “forgives” — not this rebel past shape.',
          'present continuous': 'That would need “is forgiving” — a different, ongoing shape.',
        },
      },
    },
    {
      id: 'tenses-t3-10', topicId: 'tenses', tier: 3, format: 'mcq5',
      stem: 'Which sentence uses ‘will’ to point to something that has NOT happened yet?',
      options: [
        { text: '“Jarlath will score in the next match, just you wait.”', misconception: null },
        { text: '“Jarlath said he would score in the next match.”', misconception: 'would-not-will' },
        { text: '“Jarlath would always score in every match, back then.”', misconception: 'would-not-will' },
        { text: '“Jarlath scored in the very next match.”', misconception: 'confused-with-past' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Look for the exact word “will”, not “would”.',
        '“Would” often points BACK to something reported or a past habit, even though it sounds future-ish.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: 'Only “Jarlath will score” uses “will” directly — a plain statement about something still to come.',
        whyWrong: {
          '“Jarlath said he would score in the next match.”': 'That reports what Jarlath SAID he would do — the saying already happened, in the past.',
          '“Jarlath would always score in every match, back then.”': 'That uses “would” for a PAST habit (“back then”) — not the future at all.',
          '“Jarlath scored in the very next match.”': 'That is simple past tense — it already happened.',
        },
      },
    },
  ],
};
