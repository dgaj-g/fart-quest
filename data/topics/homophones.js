// FART QUEST topic: Soundalike Sluice (The Spelling Sewers)
// Authored content — implementation agents: read, never modify.

const RULE = 'Same sound, different job: there = place, their = belonging, they\'re = they are. Prove it by un-squeezing.';

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
      html: `<p>The sewer is full of them. Here’s one more set of twins, and this time none of them can be un-squeezed — you have to know each one’s JOB.</p>
<div class="law-scroll">👕 <b>WEAR</b> = putting clothes on a body. <b>WHERE</b> = asks "which place?" <b>WERE</b> = the PAST of "are" (we were, they were).</div>
<p>Example: <b>"Where were you? I was wondering where you’d wear that scarf."</b></p>
<div class="law-scroll">🎵 <b>HIM</b> = a person. <b>HYMN</b> = a song (the N is silent — it sounds exactly like "him").</div>
<p>Example: <b>"Everyone stood to sing hymn number three, then sat back down beside him."</b> Hymn = the song being sung. Him = the person sitting down.</p>`,
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
      type: 'try',
      q: {
        id: 'homophones-try-2', topicId: 'homophones', tier: 1, format: 'errorspot',
        segments: [
          { text: 'Everyone in assembly stood' },
          { text: 'to sing him number' },
          { text: 'seven before the notices' },
          { text: 'began after break time.' },
        ],
        faultyIndex: 1,
        explain: {
          rule: RULE,
          worked: 'A numbered song sung by everyone standing is a "hymn" (silent N), not "him" (a person).',
          whyN: null,
        },
        hintSteps: [
          'A HYMN is a song — it just happens to sound exactly like HIM.',
          'Is the sentence naming a SONG being sung, or a person?',
        ],
      },
    },
    {
      type: 'talk',
      text: 'One last warning, brave stinker: sometimes the sewer is a trap in the OTHER direction — every single twin sitting perfectly in its correct seat, and nothing out of place at all. Read every word before you shout an answer, or you’ll accuse an innocent sentence!',
    },
    { type: 'anim', anim: 'homophones' },
    { type: 'weapon' },
  ],

  tips: [
    'THERE = place, THEIR = belonging, THEY’RE = they are — only "they’re" un-squeezes cleanly into "they are".',
    'WHERE asks a place question; WERE is the past of "are"; WEAR means putting clothes on a body.',
    'HYMN sounds exactly like HIM, but a hymn is a song, not a person.',
    'Try the "un-squeeze" test: split the word back into two whole words. If it still makes sense, it was the squeezed twin — if not, it wasn’t.',
    'Some sentences are traps in the OTHER direction — every twin sitting correctly, nothing to accuse. Read every word before you decide ALL CLEAN.',
  ],

  bank: [
    // ---------------- TIER 1 (12: 10 errors + 2 all-clean) ----------------
    {
      id: 'homophones-t1-01', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Every Friday the whole' },
        { text: 'school sings him number' },
        { text: 'four during morning assembly' },
        { text: 'before the notices begin.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'A numbered song sung in assembly is a "hymn" (silent N), not "him" (a person).',
        whyN: null,
      },
      hintSteps: [
        'A HYMN is a song — it just happens to sound exactly like HIM.',
        'Is the sentence naming a SONG being sung, or a person?',
      ],
    },
    {
      id: 'homophones-t1-02', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Nobody could quite remember' },
        { text: 'were the spare key' },
        { text: 'had been hidden after' },
        { text: 'the caretaker locked up.' },
      ],
      faultyIndex: 1,
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
      id: 'homophones-t1-03', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The netball team stacked' },
        { text: 'there kit bags neatly' },
        { text: 'beside the changing room' },
        { text: 'before Wednesday evening practice.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'The kit bags are OWNED by the team, so it needs "their" (belonging), not "there" (a place).',
        whyN: null,
      },
      hintSteps: [
        'Is this word pointing at a PLACE, or naming something that’s OWNED?',
        'The kit bags belong to the team — so the sound-twin you need is the OWNING one.',
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
        { text: 'Sam couldn’t decide wear' },
        { text: 'to leave his muddy' },
        { text: 'trainers before stepping inside' },
        { text: 'the busy school hallway.' },
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
      id: 'homophones-t1-07', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The whole choir insisted' },
        { text: 'there definitely ready to' },
        { text: 'perform the assembly hymn' },
        { text: 'in front of parents.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Un-squeeze it: "they are definitely ready" still makes perfect sense — so it must be "they’re", not "there" (a place).',
        whyN: null,
      },
      hintSteps: [
        'Try un-squeezing the word into "they are" — does the sentence still make sense?',
        '"They are definitely ready" works perfectly — so the sound-twin needed here is "they’re".',
      ],
    },
    {
      id: 'homophones-t1-08', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The choir leader chose' },
        { text: 'a brand new him' },
        { text: 'for the whole school' },
        { text: 'to learn this term.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'A song chosen for the whole school to learn is a "hymn" (silent N), not "him" (a person).',
        whyN: null,
      },
      hintSteps: [
        'A HYMN is a song — it just happens to sound exactly like HIM.',
        'Is the sentence naming a SONG being chosen, or a person?',
      ],
    },
    {
      id: 'homophones-t1-09', topicId: 'homophones', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Both goalkeepers where late' },
        { text: 'arriving for Saturday’s big' },
        { text: 'match against the rival' },
        { text: 'school across the county.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: '"Both goalkeepers WERE late" needs the past tense of "are" — "where" only ever asks "which place?"',
        whyN: null,
      },
      hintSteps: [
        'WHERE always asks "which place?" WERE is simply the past of "are".',
        'Is this sentence describing something that happened in the past, or asking a place question?',
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
        { text: 'They’re bringing the trophy' },
        { text: 'back because their assembly' },
        { text: 'case sits over there' },
        { text: 'beside the school office.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"They’re" un-squeezes cleanly to "they are", "their assembly case" correctly shows belonging, and "over there beside the office" correctly points at a place — all three jobs are correct.',
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
        { text: 'The whole team hummed' },
        { text: 'him number nine quietly' },
        { text: 'while waiting for the' },
        { text: 'referee’s final whistle.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'A numbered song hummed quietly by the team is a "hymn" (silent N), not "him" (a person).',
        whyN: null,
      },
      hintSteps: [
        'A HYMN is a song — it just happens to sound exactly like HIM.',
        'Is the sentence naming a SONG being hummed, or a person?',
      ],
    },
    {
      id: 'homophones-t2-04', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Come and sit down' },
        { text: 'quietly on there mats' },
        { text: 'until the teacher finishes' },
        { text: 'calling the whole register.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'The mats belong to the class, so this needs "their" (belonging), not "there" (a place).',
        whyN: null,
      },
      hintSteps: [
        'Is this word pointing at a PLACE, or naming something that’s OWNED?',
        'The mats belong to the class — that’s the OWNING twin.',
      ],
    },
    {
      id: 'homophones-t2-05', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Every swimmer needed to' },
        { text: 'know wear their goggles' },
        { text: 'had been left before' },
        { text: 'the gala could begin.' },
      ],
      faultyIndex: 1,
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
      id: 'homophones-t2-06', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The relay team promised' },
        { text: 'there definitely bringing spare' },
        { text: 'batons to Saturday’s athletics' },
        { text: 'meet at the stadium.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Un-squeeze it: "they are definitely bringing spare batons" still makes sense — so it must be "they’re", not "there" (a place).',
        whyN: null,
      },
      hintSteps: [
        'Try un-squeezing the word into "they are" — does the sentence still make sense?',
        '"They are definitely bringing spare batons" works perfectly — so the sound-twin needed here is "they’re".',
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
        { text: 'The farmer couldn’t remember' },
        { text: 'were he had left' },
        { text: 'the milking buckets after' },
        { text: 'finishing the morning round.' },
      ],
      faultyIndex: 1,
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
      id: 'homophones-t2-11', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Everybody in the hall' },
        { text: 'stood to sing him' },
        { text: 'number twelve before the' },
        { text: 'head teacher’s final notices.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'A numbered song sung by everybody standing is a "hymn" (silent N), not "him" (a person).',
        whyN: null,
      },
      hintSteps: [
        'A HYMN is a song — it just happens to sound exactly like HIM.',
        'Is the sentence naming a SONG being sung, or a person?',
      ],
    },
    {
      id: 'homophones-t2-12', topicId: 'homophones', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Nobody quite knew where' },
        { text: 'the spare goggles were' },
        { text: 'kept, so everyone had' },
        { text: 'to wear their own instead.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Where" correctly asks a place question, "were" correctly shows the past of "are", and "wear" correctly means putting something on — every twin is in its right seat.',
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
        { text: 'During the carol concert' },
        { text: 'the choir sang him' },
        { text: 'number seven twice because' },
        { text: 'the vicar requested it.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'A numbered song requested twice by the vicar is a "hymn" (silent N), not "him" (a person) — easy to skim past when a number sits right beside it.',
        whyN: null,
      },
      hintSteps: [
        'A HYMN is a song — it just happens to sound exactly like HIM.',
        'Is the choir naming a numbered SONG, or referring to a person?',
      ],
    },
    {
      id: 'homophones-t3-02', topicId: 'homophones', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The rugby squad always' },
        { text: 'complain that there Thursday' },
        { text: 'session runs far longer' },
        { text: 'than any other training.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'The Thursday session belongs to the squad, so it needs "their" (belonging), not "there" (a place) — easy to skim past mid-sentence.',
        whyN: null,
      },
      hintSteps: [
        'Is this word pointing at a PLACE, or naming something that’s OWNED?',
        'The Thursday session belongs to the squad — that’s the OWNING twin, however it’s tucked into the sentence.',
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
        { text: 'Nobody in the changing' },
        { text: 'room could quite agree' },
        { text: 'wear the missing whistle' },
        { text: 'had rolled after training.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'This is asking "which place?" — that’s "where". "Wear" only ever means putting clothes on a body — tricky here because it’s buried mid-sentence.',
        whyN: null,
      },
      hintSteps: [
        'WEAR always means putting clothes on a body. WHERE always asks "which place?"',
        'Read it slowly — is a PLACE question hiding in that clause?',
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
        { text: 'Nobody could remember where' },
        { text: 'the spare bibs were' },
        { text: 'kept, so every player' },
        { text: 'had to wear their own.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Where" correctly asks a place question, "were kept" correctly uses the past of "are", and "wear their own" correctly means putting clothing on — every twin is doing its real job.',
        whyN: 'Three sound-twins packed into one sentence, and every single one is honest.',
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
        { text: 'They’re convinced their favourite' },
        { text: 'hymn will be sung' },
        { text: 'again this year over' },
        { text: 'there in the cathedral.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"They’re" un-squeezes cleanly to "they are", "their favourite hymn" correctly shows belonging (and "hymn" correctly names a song, not a person), and "over there" correctly points at the cathedral — every twin is honest.',
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
        { text: 'Everyone finally worked out' },
        { text: 'where the missing kit' },
        { text: 'bags were sitting there' },
        { text: 'beside the equipment shed.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Where" correctly asks the place question, "were" correctly shows the past of "are", and "there" correctly points at the equipment shed — every twin is in its right seat.',
        whyN: 'One sentence, three sound-twins, all correct — no imposter to catch.',
      },
      hintSteps: [
        'Check each twin word one at a time against its real job — don’t assume there’s always an imposter hiding.',
        'If every single word passes its checkup, the honest answer is ALL CLEAN.',
      ],
    },
  ],
};
