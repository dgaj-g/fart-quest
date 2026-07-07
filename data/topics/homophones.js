// FART QUEST topic: Soundalike Sluice (The Spelling Sewers)
// Authored content — implementation agents: read, never modify.

const RULE = 'Same sound, different job: there = place, their = belonging, they’re = they are. Prove it by un-squeezing.';

export default {
  id: 'homophones',
  name: 'Soundalike Sluice',
  region: 'spelling-sewers',
  bankTopic: true,
  tagline: 'Same sound. Same spelling? Never. Identical twins with very different jobs.',

  creature: {
    id: 'two-too-the-twinned',
    name: 'Two-Too the Twinned',
    rarity: 'rare',
    image: 'assets/monsters/two-too-the-twinned.png',
    bio: 'Two-Too was born as identical sound-twins squeezed into one wobbly body — one half OWNS everything, the other half just IS everything, and neither will admit they sound exactly alike.',
    factSneak: 'there = place, their = belonging, they’re = they are — three twins, one sound, three different jobs.',
  },

  weapon: {
    id: 'sound-twin-separator',
    name: 'The Sound-Twin Separator',
    tagline: 'Never let a sound-twin fool you again.',
    rule: RULE,
    example: 'Their bags are heavy. Un-squeeze “they’re”: does “they are bags are heavy” work? No — so it must be THEIR (belonging).',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-homophon',
      text: 'Gather round, my brave nose-soldier! English has played a rotten little trick on us: some words SOUND completely identical but do a completely different JOB. Listen — <i>“there,” “their,”</i> and <i>“they’re”</i> — say them out loud. Identical! And yet only ONE means “over there,” only ONE means “belongs to them,” and only ONE means “they are.” Sneaky little twins. Time to tell them apart.</p>',
    },
    {
      type: 'show',
      title: 'Twins With Different Jobs',
      html: `<p>A word that <b>sounds</b> the same as another word but is <b>spelt</b> differently and <b>means</b> something different is called a <b>homophone</b> ("homo" = same, "phone" = sound). The three worst offenders in the whole kingdom are <b>there</b>, <b>their</b> and <b>they’re</b>.</p>
<div class="law-scroll">🔊 <b>THERE</b> = a place (over <b>there</b>). <b>THEIR</b> = belonging (<b>their</b> dog). <b>THEY’RE</b> = they are (<b>they’re</b> late).</div>
<p>Two-Too’s trick only works properly on one of the three: <b>un-squeeze</b> "they’re" back into its two full words. "They’re hungry" un-squeezes to "they ARE hungry" — still makes perfect sense, so it’s correct. For <b>there</b> and <b>their</b> you can’t un-squeeze anything — you check the JOB instead: is it pointing at a PLACE, or naming something that’s OWNED?</p>
<p>Example: <b>"The twins forgot their kit, so they’re stuck watching from over there on the touchline."</b> Their = belonging (the kit belongs to the twins). They’re = they are (stuck). There = place (the touchline).</p>`,
    },
    {
      type: 'show',
      title: 'More Twins in the Sewer',
      html: `<p>The sewer is full of them. Here are two more sets of twins, and this time none of them can be un-squeezed — you have to know each one’s JOB.</p>
<div class="law-scroll">👕 <b>WEAR</b> = putting clothes on a body. <b>WHERE</b> = asks "which place?" <b>WERE</b> = the PAST of "are" (we were, they were).</div>
<p>Example: <b>"Where were you? I was wondering where you’d wear that scarf."</b></p>
<div class="law-scroll">→ <b>TO</b> = towards something, or joins a verb (to run). <b>TOO</b> = "as well" or "more than enough". <b>TWO</b> = the number 2.</div>
<p>Example: <b>"The two players ran to the goal, but the keeper dived too late."</b> Two = the number of players. To = direction (towards the goal). Too = "not soon enough" — more than was needed.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'homophones-try-1', topicId: 'homophones', tier: 1, format: 'errorspot',
        segments: [
          { text: 'The football team left' },
          { text: 'there muddy boots outside' },
          { text: 'the changing room door' },
          { text: 'before the coach arrived.' },
        ],
        faultyIndex: 1,
        explain: {
          rule: RULE,
          worked: 'The boots are OWNED by the team, so it needs "their" (belonging), not "there" (a place).',
          whyN: null,
        },
        hintSteps: [
          'Is this word pointing at a PLACE, or naming something that’s OWNED?',
          'The boots belong to the team — so the sound-twin you need is the OWNING one.',
        ],
      },
    },
    {
      type: 'show',
      title: 'Four Quick-Fire Twins',
      html: `<p>Whiffbeard demands you learn these four before you go any further into the sewer.</p>
<div class="law-scroll">👂 <b>HEAR</b> = to listen (spot the word "ear" hiding inside it!). <b>HERE</b> = this place.</div>
<div class="law-scroll">🚫 <b>NO</b> = the opposite of yes. <b>KNOW</b> = to understand something (that silent K is guarding the knowledge inside).</div>
<div class="law-scroll">🦢 <b>LOOSE</b> rhymes with "goose" — not tight. <b>LOSE</b> rhymes with "shoes" — to not win, or to misplace something.</div>
<div class="law-scroll">🎵 <b>HIM</b> = a person. <b>HYMN</b> = a song (the N is silent — it sounds exactly like "him").</div>
<p>Example: <b>"Milo the dog runs to the window because he can hear the postman — you’ll never lose that habit, even with a loose gate between them."</b></p>`,
    },
    {
      type: 'try',
      q: {
        id: 'homophones-try-2', topicId: 'homophones', tier: 1, format: 'errorspot',
        segments: [
          { text: "Sam's dog has a" },
          { text: 'lose collar that keeps' },
          { text: 'slipping off during walks' },
          { text: 'around the village green.' },
        ],
        faultyIndex: 1,
        explain: {
          rule: RULE,
          worked: 'A collar that keeps slipping off is NOT TIGHT — that’s "loose" (rhymes with goose), not "lose" (rhymes with shoes, meaning to not win or to misplace).',
          whyN: null,
        },
        hintSteps: [
          'Say both words out loud: one rhymes with "goose", one rhymes with "shoes". Which meaning fits a collar that keeps slipping off?',
          'A collar that’s NOT TIGHT is described by the one that rhymes with "goose".',
        ],
      },
    },
    {
      type: 'talk',
      text: 'One last warning, brave stinker: sometimes the sewer is a trap in the OTHER direction — every single twin sitting perfectly in its correct seat, and nothing out of place at all. Read every word before you shout an answer, or you’ll accuse an innocent sentence! And watch for the sneaky pair <b>practice</b> (the noun — a THING you do) and <b>practise</b> (the verb — the DOING word) later in the sewer.',
    },
    { type: 'weapon' },
  ],

  tips: [
    'THERE = place, THEIR = belonging, THEY’RE = they are — only "they’re" un-squeezes cleanly into "they are".',
    'WHERE asks a place question; WERE is the past of "are"; WEAR means putting clothes on a body.',
    'TO = towards something or joins a verb; TOO = "as well" or "too much"; TWO = the number 2.',
    'HEAR has "ear" hiding inside it — it’s the one you do with your ears. HERE means "this place".',
    'NO is the opposite of yes. KNOW has a silent K guarding the knowledge inside the word.',
    'LOOSE rhymes with "goose" and means not tight. LOSE rhymes with "shoes" and means to not win, or to misplace something.',
    'HYMN sounds exactly like HIM, but a hymn is a song, not a person.',
    'PRACTICE is the noun (football practice — a thing). PRACTISE is the verb (to practise — the doing word).',
  ],

  bank: [
    // ---------------- TIER 1 (12: 10 errors + 2 all-clean) ----------------
    {
      id: 'homophones-t1-01', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The team walked too' },
        { text: 'the changing rooms slowly' },
        { text: 'after the muddy match' },
        { text: 'on Saturday afternoon.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Walking is a MOVEMENT towards a place, so it needs "to" (direction). "Too" means "as well" or "excessively" — it can’t sit in front of "the changing rooms".',
        whyN: null,
      },
      hintSteps: [
        'TWO is always the number. TOO always means "as well" or "more than enough". TO points towards somewhere or joins a verb.',
        'The team is heading somewhere — which job does that need?',
      ],
    },
    {
      id: 'homophones-t1-02', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Callum bragged that he' },
        { text: 'no all the rules' },
        { text: 'of the school trip' },
        { text: 'before the coach left.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Understanding the rules is "know" (the silent K guards the knowledge). "No" is only ever the opposite of yes.',
        whyN: null,
      },
      hintSteps: [
        'Is this sentence about understanding something, or about saying no to something?',
        'Callum is claiming he UNDERSTANDS the rules — that’s the word with the silent K.',
      ],
    },
    {
      id: 'homophones-t1-03', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Milo the dog' },
        { text: 'runs to the window' },
        { text: 'because he can here' },
        { text: 'the postman arriving outside.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Listening for the postman is done with your ears — that’s "hear" (spot the "ear" hiding inside). "Here" only ever means "this place".',
        whyN: null,
      },
      hintSteps: [
        'HEAR has "ear" hiding inside it — it’s the listening word. HERE means "this place".',
        'Is Milo LISTENING for the postman, or pointing at a place?',
      ],
    },
    {
      id: 'homophones-t1-04', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The two footballers raced' },
        { text: 'across the muddy pitch' },
        { text: 'to collect the trophy' },
        { text: 'before there coach arrived.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'The coach belongs to the footballers, so this needs "their" (belonging). "There" only ever points at a place.',
        whyN: null,
      },
      hintSteps: [
        'Is this word pointing at a PLACE, or naming something that’s OWNED?',
        'The coach belongs to the footballers — that’s the OWNING twin.',
      ],
    },
    {
      id: 'homophones-t1-05', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Wear did you leave' },
        { text: 'your muddy football boots' },
        { text: 'after training on Tuesday' },
        { text: 'evening after the match?' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'This is asking "which place?" — that’s "where". "Wear" only ever means putting clothes on a body.',
        whyN: null,
      },
      hintSteps: [
        'WEAR always means putting clothes on a body. WHERE always asks "which place?"',
        'Is this sentence asking about a PLACE, or about clothing?',
      ],
    },
    {
      id: 'homophones-t1-06', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The old garden gate' },
        { text: 'has a lose hinge' },
        { text: 'that squeaks every morning' },
        { text: 'when the wind blows.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'A hinge that squeaks and wobbles is NOT TIGHT — that’s "loose" (rhymes with goose), not "lose" (to not win, or misplace).',
        whyN: null,
      },
      hintSteps: [
        'Say both words out loud: one rhymes with "goose", one rhymes with "shoes".',
        'A wobbly, not-tight hinge needs the one that rhymes with "goose".',
      ],
    },
    {
      id: 'homophones-t1-07', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Jarlath let out' },
        { text: 'an enormous fart' },
        { text: 'that lasted to whole' },
        { text: 'minutes during assembly.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'This is counting a quantity — "two whole minutes" needs the NUMBER, not "to" (direction/joining a verb).',
        whyN: null,
      },
      hintSteps: [
        'TWO is always the number. TO points towards something or joins a verb.',
        'Count how many whole minutes — that’s the number twin.',
      ],
    },
    {
      id: 'homophones-t1-08', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Nobody in the class' },
        { text: 'could work out why' },
        { text: 'the hamster kept escaping' },
        { text: 'because nobody would no.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Nobody could UNDERSTAND why the hamster escaped — that needs "know" (silent K), not "no" (opposite of yes).',
        whyN: null,
      },
      hintSteps: [
        'KNOW has a silent K guarding the knowledge inside the word. NO is only ever the opposite of yes.',
        'Is this about UNDERSTANDING something, or refusing something?',
      ],
    },
    {
      id: 'homophones-t1-09', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Hear is where we' },
        { text: 'pitched our tent last' },
        { text: 'summer beside the river' },
        { text: 'before the storm arrived.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'This is pointing at "this place" — that’s "here". "Hear" is only ever the listening word.',
        whyN: null,
      },
      hintSteps: [
        'HERE means "this place". HEAR has "ear" hiding inside it — it’s the listening word.',
        'Is the sentence pointing at a place, or talking about listening?',
      ],
    },
    {
      id: 'homophones-t1-10', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'My cousins always insist' },
        { text: 'there bringing party bags' },
        { text: 'to every single birthday' },
        { text: 'even when uninvited.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Un-squeeze it: "they are bringing party bags" still makes perfect sense — so it must be "they’re", not "there" (a place).',
        whyN: null,
      },
      hintSteps: [
        'Try un-squeezing the word into "they are" — does the sentence still make sense?',
        '"They are bringing party bags" works perfectly — so the sound-twin needed here is "they’re".',
      ],
    },
    {
      id: 'homophones-t1-11', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'We travelled to two' },
        { text: 'seaside towns on Friday' },
        { text: 'but the coach ride' },
        { text: 'felt too long overall.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"To" shows direction (travelled to), "two" is the number of towns, and "too" means excessively (felt too long) — every single twin is sitting in its correct seat.',
        whyN: 'All three twins are doing their real job here — nothing to accuse.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },
    {
      id: 'homophones-t1-12', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: "They're always the first" },
        { text: 'team to arrive there' },
        { text: 'even though their coach' },
        { text: 'always arrives running late.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"They’re" un-squeezes cleanly to "they are", "there" correctly points at the arrival place, and "their coach" correctly shows belonging — all three jobs are correct.',
        whyN: 'Three sound-twins in one sentence, and all three are wearing the right outfit.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },

    // ---------------- TIER 2 (12: 11 errors + 1 all-clean) ----------------
    {
      id: 'homophones-t2-01', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Our kit bags are' },
        { text: 'stacked in a pile' },
        { text: 'over their near the' },
        { text: 'gates before assembly starts.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'This is pointing at a PLACE (near the gates) — that needs "there", not "their" (belonging).',
        whyN: null,
      },
      hintSteps: [
        'Is this word pointing at a PLACE, or naming something that’s OWNED?',
        'The bags are stacked near a spot — that’s the place twin.',
      ],
    },
    {
      id: 'homophones-t2-02', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Every pupil in Year' },
        { text: 'Six must always remember' },
        { text: 'to bring a jumper' },
        { text: 'and where sensible trainers.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Putting trainers ON a body needs "wear", not "where" (which only ever asks "which place?").',
        whyN: null,
      },
      hintSteps: [
        'WEAR always means putting clothes on a body. WHERE always asks "which place?"',
        'Trainers go ON your feet — which job does that need?',
      ],
    },
    {
      id: 'homophones-t2-03', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'It was to noisy' },
        { text: 'in the changing rooms' },
        { text: 'for anyone to hear' },
        { text: "the referee's final whistle." },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: '"Too noisy" means "excessively noisy" — that’s "too", not "to" (which only points towards something or joins a verb, as it correctly does later in "to hear").',
        whyN: null,
      },
      hintSteps: [
        'TOO always means "as well" or "more than enough". TO points towards something or joins a verb.',
        'Notice "to hear" later in the sentence is correct — the imposter twin is hiding earlier.',
      ],
    },
    {
      id: 'homophones-t2-04', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Come and sit down' },
        { text: 'hear quietly on the' },
        { text: 'carpet until the teacher' },
        { text: 'finishes calling the register.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'This is pointing at "this place" (on the carpet) — that’s "here", not "hear" (the listening word).',
        whyN: null,
      },
      hintSteps: [
        'HERE means "this place". HEAR has "ear" hiding inside it — the listening word.',
        'Is the class being asked to sit in a PLACE, or to listen?',
      ],
    },
    {
      id: 'homophones-t2-05', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'None of the swimmers' },
        { text: 'arrived early enough to' },
        { text: 'no the pool timetable' },
        { text: 'had changed that week.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Understanding that the timetable had changed needs "know" (silent K), not "no" (opposite of yes).',
        whyN: null,
      },
      hintSteps: [
        'KNOW has a silent K guarding the knowledge inside the word. NO is only ever the opposite of yes.',
        'Is this about UNDERSTANDING a change, or refusing something?',
      ],
    },
    {
      id: 'homophones-t2-06', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Careless goalkeepers often struggle' },
        { text: 'to keep their focus' },
        { text: 'during extra time and' },
        { text: 'sometimes loose the match.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Not winning the match is "lose" (rhymes with shoes), not "loose" (rhymes with goose, meaning not tight).',
        whyN: null,
      },
      hintSteps: [
        'Say both words out loud: one rhymes with "goose", one rhymes with "shoes".',
        'NOT winning a match is the one that rhymes with "shoes".',
      ],
    },
    {
      id: 'homophones-t2-07', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Him number seven was' },
        { text: "everyone's favourite one to" },
        { text: 'sing loudly during Friday' },
        { text: 'assembly before break time.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'A song with a number sung at assembly is a "hymn" (silent N), not "him" (a person).',
        whyN: null,
      },
      hintSteps: [
        'A HYMN is a song — it just happens to sound exactly like HIM.',
        'Is the sentence naming a SONG being sung, or a person?',
      ],
    },
    {
      id: 'homophones-t2-08', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The identical twins insisted' },
        { text: 'their definitely the fastest' },
        { text: 'swimmers in the whole' },
        { text: 'school, which was true.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Un-squeeze it: "they are definitely the fastest" still makes sense — so it must be "they’re", not "their" (belonging).',
        whyN: null,
      },
      hintSteps: [
        'Try un-squeezing the word into "they are" — does it still make sense?',
        '"They are definitely the fastest" works perfectly — that’s the "they’re" twin.',
      ],
    },
    {
      id: 'homophones-t2-09', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Nobody in the tent' },
        { text: 'could quite remember exactly' },
        { text: 'were they had left' },
        { text: 'the spare tent pegs.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'This is asking "which place?" — that’s "where", not "were" (the past of "are").',
        whyN: null,
      },
      hintSteps: [
        'WHERE always asks "which place?" WERE is simply the past of "are".',
        'Is this sentence asking a PLACE question?',
      ],
    },
    {
      id: 'homophones-t2-10', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The farmer taught everyone' },
        { text: 'the right way' },
        { text: 'to hold buckets' },
        { text: 'and how two milk cows.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: '"How to milk cows" needs "to" (joining the verb "milk"), not "two" (the number).',
        whyN: null,
      },
      hintSteps: [
        'TO joins a verb (to milk, to hold). TWO is always the number.',
        'Is a quantity of cows being counted, or is a verb being joined?',
      ],
    },
    {
      id: 'homophones-t2-11', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Nobody seems to no' },
        { text: 'why the class hamster' },
        { text: 'keeps escaping its cage' },
        { text: 'every single night now.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Understanding WHY the hamster escapes needs "know" (silent K), not "no" (opposite of yes).',
        whyN: null,
      },
      hintSteps: [
        'KNOW has a silent K guarding the knowledge inside the word. NO is only ever the opposite of yes.',
        'Is this about UNDERSTANDING a reason, or refusing something?',
      ],
    },
    {
      id: 'homophones-t2-12', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Their dog escaped again' },
        { text: 'because the loose gate' },
        { text: 'was left open where' },
        { text: 'they always leave it.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Their dog" correctly shows belonging, "loose gate" correctly means not tight, and "where" correctly asks a place question — every twin is in its right seat.',
        whyN: 'Three sound-twins hiding in one sentence, and every single one is doing its real job.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },

    // ---------------- TIER 3 (10: 6 errors + 4 all-clean, subtler) ----------------
    {
      id: 'homophones-t3-01', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Every Tuesday the choir' },
        { text: 'gathers to practice their' },
        { text: 'assembly hymn in the' },
        { text: 'school hall before lunch.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: '"To practise" is a verb (the doing word), so it needs the S spelling — "practice" (with a C) is only ever the noun, a thing you do.',
        whyN: null,
      },
      hintSteps: [
        'PRACTICE is the noun (a thing — football practice). PRACTISE is the verb (the doing word — to practise).',
        'Could you put "the" in front of the word instead? If not, it’s the doing word — practise.',
      ],
    },
    {
      id: 'homophones-t3-02', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Jarlath always feels exhausted' },
        { text: 'after every single rugby' },
        { text: 'practise session on Thursdays' },
        { text: 'even during the holidays.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: '"Rugby practice session" is naming a THING (a noun), so it needs the C spelling — "practise" (with an S) is only ever the verb, the doing word.',
        whyN: null,
      },
      hintSteps: [
        'PRACTICE is the noun (a thing — rugby practice). PRACTISE is the verb (the doing word — to practise).',
        'Could you say "the rugby practice"? If so, it needs the noun spelling — practice.',
      ],
    },
    {
      id: 'homophones-t3-03', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The scouts who camped' },
        { text: 'beside the winding river' },
        { text: 'said the tent' },
        { text: 'had been there own idea.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'The idea belongs to the scouts, so it needs "their" (belonging), not "there" (a place) — even buried mid-sentence, the OWNING job doesn’t change.',
        whyN: null,
      },
      hintSteps: [
        'Is this word pointing at a PLACE, or naming something that’s OWNED?',
        'The idea belongs to the scouts — that’s the OWNING twin, however far into the sentence it hides.',
      ],
    },
    {
      id: 'homophones-t3-04', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Lose change always jingles' },
        { text: "annoyingly in Jarlath's tracksuit" },
        { text: 'pockets during every single' },
        { text: 'PE lesson this term.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: '"Loose change" means coins that rattle around loosely (not tight) — that’s "loose" (rhymes with goose), not "lose" (rhymes with shoes, to not win or misplace).',
        whyN: null,
      },
      hintSteps: [
        'Say both words out loud: one rhymes with "goose", one rhymes with "shoes".',
        'Coins rattling around loosely in a pocket need the one that rhymes with "goose".',
      ],
    },
    {
      id: 'homophones-t3-05', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'During assembly the choir' },
        { text: 'practised him number twelve' },
        { text: 'ready for the carol' },
        { text: 'service next Friday morning.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'A numbered song sung at assembly is a "hymn" (silent N), not "him" (a person) — tricky here because "him" can almost pass as an object pronoun.',
        whyN: null,
      },
      hintSteps: [
        'A HYMN is a song — it just happens to sound exactly like HIM.',
        'Is the choir naming a numbered SONG, or referring to a person?',
      ],
    },
    {
      id: 'homophones-t3-06', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: "The twins couldn't quite" },
        { text: 'decide amongst themselves exactly' },
        { text: 'were the football matches' },
        { text: 'would be played Saturday.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'This is asking "which place?" — that’s "where", not "were" (the past of "are") — easy to skim past in a longer, wordier sentence.',
        whyN: null,
      },
      hintSteps: [
        'WHERE always asks "which place?" WERE is simply the past of "are".',
        'Read it slowly — is a PLACE question buried in that clause?',
      ],
    },
    {
      id: 'homophones-t3-07', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Good practice always means' },
        { text: 'you should practise your' },
        { text: 'times tables every single' },
        { text: 'evening before bedtime routine.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Good practice" is the noun (a habit, a thing) and "should practise" is the verb (the doing word) — both spellings are doing their correct job.',
        whyN: 'Noun and verb, both spelt correctly for their own job — nothing to accuse here.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },
    {
      id: 'homophones-t3-08', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: "They're utterly convinced their" },
        { text: 'tent is pitched over' },
        { text: 'there beside the gently' },
        { text: 'flowing stream this weekend.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"They’re" un-squeezes cleanly to "they are", "their tent" correctly shows belonging, and "there" correctly points at the stream’s location — three twins, three correct jobs.',
        whyN: 'All three sound-twins packed into one sentence, and every single one is honest.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },
    {
      id: 'homophones-t3-09', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Two players ran to' },
        { text: 'the penalty box, but' },
        { text: 'the looping cross was' },
        { text: 'too high to reach.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Two" is the number of players, "to" shows direction (ran to, to reach), and "too" means excessively (too high) — every twin is correct, even used twice.',
        whyN: 'Four homophone-risk words in one sentence, all wearing the correct outfit.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },
    {
      id: 'homophones-t3-10', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'A loose bootlace made' },
        { text: 'Jarlath completely lose his' },
        { text: 'balance halfway through' },
        { text: 'the final lap today.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Loose bootlace" correctly means not tight, and "lose his balance" correctly means to no longer have it — both twins are in their right seat.',
        whyN: 'One sentence, both twins, both correct — no imposter to catch.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },
  ],
};
