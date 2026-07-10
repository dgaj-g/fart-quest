// FART QUEST topic: The Unspellable Sump (The Spelling Sewers)
// Authored content — implementation agents: read, never modify.

const WEAPON_RULE = 'Hard words need a hook: nec-ESS-ary has one collar and two socks. Make the word ridiculous and it sticks.';

export default {
  id: 'tricky-words',
  name: 'The Unspellable Sump',
  region: 'spelling-sewers',
  bankTopic: true,
  tagline: 'The words examiners love to hide in plain sight… and the hooks that catch every single one.',

  creature: {
    id: 'neccessarry-the-unspellable',
    name: 'Neccessarry the Unspellable',
    rarity: 'rare',
    image: 'assets/monsters/neccessarry-the-unspellable.png',
    bio: 'Neccessarry has had his own name misspelled since the day he hatched, and it haunts him more than any fart ever could. He is desperate for a hero who finally knows the hook.',
    factSneak: 'necessary has one Collar (single C) and two Socks (double S) — nec-ESS-ary, never neccessary.',
  },

  weapon: {
    id: 'memory-hook',
    name: 'The Memory Hook',
    tagline: 'Turn any tricky word ridiculous, and it never wriggles free again.',
    rule: WEAPON_RULE,
    example: 'sep-A-RAT-e — there is a <b>RAT</b> hiding in the middle of separate, and nobody forgets a rat.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-trickywo',
      text: 'Gather round, brave nose-soldier, and meet poor Neccessarry — even HE cannot spell his own name! Some words in English are just plain sneaky. They do not sound the way they are spelled, so your ear cannot save you. But I have a trick that always works: give the word a ridiculous little <b>hook</b>, and it can never wriggle away again.',
    },
    {
      type: 'show',
      title: 'Necessary and Separate: count the letters',
      html: `<p><b>Necessary</b> trips people up because they guess how many C's and S's it has. Here is the hook:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> necessary has one Collar (one C) and two Socks (two S's) — nec-ESS-ary. Only one C, but TWO S's.</div>
<p>Try it in a sentence: <i>"It is necessary to wash the mud off your boots before tea."</i> One collar, two socks, every time.</p>
<p><b>Separate</b> is trickier because your ear wants to say "sep-er-ate". But look what is hiding in the middle:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> there is <b>A RAT</b> in the middle of sep-A-RAT-e. Never "seperate" — that spelling has no rat at all.</div>
<p>Try it: <i>"Keep the smelly socks in a separate pile from the clean ones."</i> Find the rat, spell it right.</p>`,
    },
    {
      type: 'show',
      title: 'Definitely, Beautiful and Because',
      html: `<p><b>Definitely</b> is the most common spelling crime in the whole swamp — people write "definately" because that is how it sounds. But look closer:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> definitely has "finite" hiding inside — defi-NITE-ly. It is never defin-ATE-ly. There is no "ate" in definitely, no matter how hungry you are.</div>
<p><b>Beautiful</b> starts with a tricky trio of letters: B-E-A-U. Remember it with a silly sentence:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> "Big Elephants Are Ugly" spells the start of beau-tiful. Add -tiful and you are home.</div>
<p><b>Because</b> gets the same treatment — the whole word unpacks into a sentence:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> "Big Elephants Can Always Understand Small Elephants" — b-e-c-a-u-s-e.</div>
<p>Try them together: <i>"The dog looked genuinely beautiful, which was surprising, because he had just rolled in something."</i></p>`,
    },
    {
      type: 'show',
      title: 'Wednesday and February: the silent letters',
      html: `<p>Some words hide a whole silent letter that your ear never hears. Say "Wednesday" out loud — you say "Wenz-day". But it is spelled with a secret wedding inside:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> Wednesday hides WED — like a wedding — right in the middle: WED-nes-day.</div>
<p>Same trick with <b>February</b>. You probably say "Feb-yoo-ary" — but there is a sneaky R hiding straight after the B:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> Feb-RU-ary. Ask yourself: "Are you (R-U) ready for February?"</div>
<p>Try it: <i>"On Wednesday in February, Jarlath's wellies froze solid to the changing-room floor."</i></p>`,
    },
    {
      type: 'show',
      title: 'Favourite and Colour: the proud British U',
      html: `<p>Last hook, and it is the easiest of all once you know it. British English is proud of one extra letter that American spelling drops:</p>
<div class="law-scroll">📜 <b>THE HOOK:</b> favourite and colour always keep their U — fav-OUR-ite, col-OUR. If you see "favorite" or "color" with no U, that is the American spelling sneaking in where it does not belong.</div>
<p>Try it: <i>"Jarlath's favourite colour for a football kit is swamp green, obviously."</i></p>
<p>Here is the honest truth about this whole topic, brave one: sometimes a sentence uses EVERY one of these words correctly, and there is genuinely nothing to catch. Do not go hunting for a stink that is not there — check each word calmly against its hook, and if they all pass, shout "ALL CLEAN!"</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'tw-try-1', topicId: 'tricky-words', tier: 1, format: 'errorspot',
        segments: [
          { text: 'Grandad said it was' },
          { text: 'neccessary to bring' },
          { text: 'a spare pair of' },
          { text: 'socks on the trip.' },
        ],
        faultyIndex: 1,
        hintSteps: [
          'Only one tricky word is hiding in this sentence. Check it against its hook: one Collar, two Socks.',
          'Count the letters in segment B very carefully — nec-ESS-ary needs exactly one C and two S’s…',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: '"neccessary" has drifted from its hook — it has picked up an extra C along the way. The honest spelling is necessary: one Collar (C), two Socks (SS). nec-ESS-ary.',
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'tw-try-2', topicId: 'tricky-words', tier: 1, format: 'errorspot',
        segments: [
          { text: 'Jarlath was definitely' },
          { text: 'the smelliest boy' },
          { text: 'in the whole' },
          { text: 'school on Wednesday.' },
        ],
        faultyIndex: null,
        hintSteps: [
          'Check every tricky word here against its hook: definitely (finite inside) and Wednesday (wedding inside).',
          '"definitely" has the finite hiding in the middle, and "Wednesday" has the wedding — both pass. So what is the honest answer?',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: 'definitely has "finite" sitting right in the middle (defi-NITE-ly) and Wednesday has "wed" sitting right in the middle (WED-nesday) — both hooks check out. ALL CLEAN!',
          whyN: 'Every tricky word follows its hook exactly, so there is nothing to catch this time.',
        },
      },
    },
    { type: 'anim', anim: 'tricky-words' },
    { type: 'weapon' },
  ],

  tips: [
    'necessary = one Collar, two Socks (one C, two S’s) — nec-ESS-ary.',
    'separate has A RAT hiding in the middle — sep-A-RAT-e, never "seperate".',
    'definitely has "finite" hiding inside — defi-NITE-ly, never "definately".',
    'because unpacks to "Big Elephants Can Always Understand Small Elephants".',
    'Wednesday hides a WEDding (WED-nes-day); February hides "Are you (R-U) ready?" (Feb-RU-ary).',
    'favourite and colour are proud British words — they always keep their U.',
    'Do not go hunting for a mistake that is not there — check each hook calmly, and if every word passes, it really is ALL CLEAN.',
  ],

  bank: [
    // ---------- TIER 1 (12) ----------
    {
      id: 'tricky-words-t1-01', tier: 1, format: 'errorspot',
      segments: [
        { text: 'It is neccessary' },
        { text: 'to bring your wellies' },
        { text: 'on the muddy' },
        { text: 'school trip tomorrow.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"neccessary" has an extra C stowed away. The honest spelling is necessary — one Collar, two Socks: nec-ESS-ary.',
      },
      hintSteps: [
        'One tricky word is hiding here. Check it against its hook: one Collar, two Socks.',
        'Count the letters in segment A: how many C’s does nec-ESS-ary actually need?',
      ],
    },
    {
      id: 'tricky-words-t1-02', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Jarlath asked the dinner lady' },
        { text: 'to seperate his beans' },
        { text: 'from his disgusting' },
        { text: 'lumpy custard.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"seperate" has lost its rat. The honest spelling is separate — there is A RAT hiding in the middle: sep-A-RAT-e.',
      },
      hintSteps: [
        'Check the tricky word in segment B against its hook: what animal should be hiding in the middle?',
        'sep-A-RAT-e needs a rat spelled A-R-A-T. Is it there in "seperate"?',
      ],
    },
    {
      id: 'tricky-words-t1-03', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The dog' },
        { text: 'definately buried the ball' },
        { text: 'somewhere near the' },
        { text: 'wobbly goalpost.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"definately" has swapped its hook for an "ate". The honest spelling is definitely — "finite" hides in the middle: defi-NITE-ly.',
      },
      hintSteps: [
        'Check the tricky word in segment B against its hook: what small word should be hiding in the middle?',
        'defi-NITE-ly needs "nite", not "nate". Which one is spelled in segment B?',
      ],
    },
    {
      id: 'tricky-words-t1-04', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Jarlath skipped the football match' },
        { text: 'and everyone knew it' },
        { text: 'was becuase his tummy' },
        { text: 'rumbled so loudly.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"becuase" has muddled the order of its middle letters. The honest spelling is because — Big Elephants Can Always Understand Small Elephants: b-e-c-a-u-s-e.',
      },
      hintSteps: [
        'Check the tricky word in segment C against its hook: the sentence that spells it out.',
        'Big Elephants Can Always Understand Small Elephants gives b-e-c-a-u-s-e. Does segment C match that order?',
      ],
    },
    {
      id: 'tricky-words-t1-05', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Everyone stared at the enormous' },
        { text: 'rainbow floating above' },
        { text: 'the butiful stinking' },
        { text: 'swamp behind school.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"butiful" has lost the whole B-E-A-U trio. The honest spelling is beautiful — Big Elephants Are Ugly gives the start: beau-tiful.',
      },
      hintSteps: [
        'Check the tricky word in segment C against its hook: which four letters start it off?',
        '"Big Elephants Are Ugly" spells B-E-A-U. Does "butiful" have all four?',
      ],
    },
    {
      id: 'tricky-words-t1-06', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Miss Quigg reminded us' },
        { text: 'that raincoats were' },
        { text: 'absolutely essential and' },
        { text: 'totally neccessary today.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"neccessary" in the last segment has an extra C. The honest spelling is necessary — one Collar, two Socks: nec-ESS-ary.',
      },
      hintSteps: [
        'One tricky word is hiding in segment D. Check it against its hook: one Collar, two Socks.',
        'Count the C’s in segment D’s spelling — should there really be two?',
      ],
    },
    {
      id: 'tricky-words-t1-07', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The football coach told' },
        { text: 'the twins to stand' },
        { text: 'in completely different' },
        { text: 'queues, seperate ones.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"seperate" in the last segment has lost its rat. The honest spelling is separate — A RAT hides in the middle: sep-A-RAT-e.',
      },
      hintSteps: [
        'Check the tricky word in segment D against its hook: what animal should be hiding inside it?',
        'sep-A-RAT-e needs A-R-A-T spelled in the middle. Is the rat present in segment D?',
      ],
    },
    {
      id: 'tricky-words-t1-08', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Definately the smelliest fart' },
        { text: 'in Fart Quest history' },
        { text: 'erupted during morning' },
        { text: 'assembly on Tuesday.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"Definately" at the start has swapped its hook for an "ate". The honest spelling is Definitely — "finite" hides in the middle: defi-NITE-ly.',
      },
      hintSteps: [
        'Check the first word against its hook: what small word should be hiding in the middle?',
        'defi-NITE-ly needs "nite". Does segment A spell that, or something else?',
      ],
    },
    {
      id: 'tricky-words-t1-09', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Baron Bumdigit refused to' },
        { text: 'move becuase his throne' },
        { text: 'was covered in' },
        { text: 'soggy swamp slime.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"becuase" in segment B has its letters jumbled. The honest spelling is because — Big Elephants Can Always Understand Small Elephants: b-e-c-a-u-s-e.',
      },
      hintSteps: [
        'Check the tricky word in segment B against its hook: the sentence that spells it out letter by letter.',
        'b-e-c-a-u-s-e is the order from "Big Elephants Can Always Understand Small Elephants". Does segment B match?',
      ],
    },
    {
      id: 'tricky-words-t1-10', tier: 1, format: 'errorspot',
      segments: [
        { text: 'It is necessary' },
        { text: 'to wash your hands' },
        { text: 'before eating your' },
        { text: 'smelly packed lunch.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'necessary has exactly one Collar and two Socks — nec-ESS-ary. The hook checks out. ALL CLEAN!',
        whyN: 'The only tricky word in the sentence follows its hook perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Check the tricky word against its hook: one Collar, two Socks.',
        'Count the C’s and S’s carefully — do they match nec-ESS-ary? So what is the honest answer?',
      ],
    },
    {
      id: 'tricky-words-t1-11', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The two puppies' },
        { text: 'were separate because' },
        { text: 'they smelled completely' },
        { text: 'different after their bath.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'separate has A RAT hiding correctly in the middle (sep-A-RAT-e) and because spells out Big Elephants Can Always Understand Small Elephants exactly. Both hooks check out. ALL CLEAN!',
        whyN: 'Both tricky words follow their hooks perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Two tricky words are hiding here. Check both against their hooks: the rat in separate, and the elephant sentence in because.',
        'Both spellings match their hooks exactly. So what is the honest answer?',
      ],
    },
    {
      id: 'tricky-words-t1-12', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Grandad definitely thought' },
        { text: 'the beautiful sunset' },
        { text: 'smelled faintly of' },
        { text: 'squashed old cabbage.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'definitely has "finite" hiding correctly in the middle (defi-NITE-ly) and beautiful starts with its full B-E-A-U trio. Both hooks check out. ALL CLEAN!',
        whyN: 'Both tricky words follow their hooks perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Two tricky words are hiding here. Check both against their hooks: the finite in definitely, and the B-E-A-U in beautiful.',
        'Both spellings match their hooks exactly. So what is the honest answer?',
      ],
    },

    // ---------- TIER 2 (12) ----------
    {
      id: 'tricky-words-t2-01', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Wensday is the day' },
        { text: 'Jarlath practises his' },
        { text: 'loudest football chant' },
        { text: 'before the big match.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"Wensday" has lost its hidden wedding. The honest spelling is Wednesday — WED-nes-day, even though we only say "Wenz-day".',
      },
      hintSteps: [
        'Check the first word against its hook: what event is hiding right in the middle?',
        'WED-nes-day hides a wedding. Does segment A spell WED, or has it vanished?',
      ],
    },
    {
      id: 'tricky-words-t2-02', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Febuary brings the coldest' },
        { text: 'mornings of the' },
        { text: 'entire football season' },
        { text: 'according to the coach.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"Febuary" has lost its sneaky R. The honest spelling is February — Feb-RU-ary, "are you ready?"',
      },
      hintSteps: [
        'Check the first word against its hook: what letter hides straight after the B?',
        'Feb-RU-ary needs an R right after "Feb". Is it there in segment A?',
      ],
    },
    {
      id: 'tricky-words-t2-03', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Jarlath announced that sprouts' },
        { text: 'were his favorite' },
        { text: 'vegetable at the' },
        { text: 'school dinner table.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"favorite" has lost its proud British U. The honest spelling is favourite — fav-OUR-ite always keeps the U.',
      },
      hintSteps: [
        'Check the tricky word in segment B against its hook: British spelling always keeps one extra letter.',
        'fav-OUR-ite needs a U in the middle. Does segment B have one?',
      ],
    },
    {
      id: 'tricky-words-t2-04', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The judges argued about' },
        { text: 'which color looked' },
        { text: 'best on the' },
        { text: 'muddy team kit.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"color" has lost its proud British U. The honest spelling is colour — col-OUR always keeps the U.',
      },
      hintSteps: [
        'Check the tricky word in segment B against its hook: British spelling always keeps one extra letter.',
        'col-OUR needs a U before the R. Does segment B have one?',
      ],
    },
    {
      id: 'tricky-words-t2-05', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The referee explained calmly' },
        { text: 'that shin pads were' },
        { text: 'absolutely neccessary before' },
        { text: 'kicking the ball.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"neccessary" has an extra C stowed away. The honest spelling is necessary — one Collar, two Socks: nec-ESS-ary.',
      },
      hintSteps: [
        'Check the tricky word in segment C against its hook: one Collar, two Socks.',
        'Count the C’s and S’s in segment C. Do they match nec-ESS-ary?',
      ],
    },
    {
      id: 'tricky-words-t2-06', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Coach split the players' },
        { text: 'into three teams then' },
        { text: 'kept the goalkeepers seperate' },
        { text: 'from the strikers.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"seperate" in segment C has lost its rat. The honest spelling is separate — A RAT hides in the middle: sep-A-RAT-e.',
      },
      hintSteps: [
        'Check the tricky word in segment C against its hook: what animal should be hiding in the middle?',
        'sep-A-RAT-e needs A-R-A-T. Is the rat there in segment C?',
      ],
    },
    {
      id: 'tricky-words-t2-07', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The whole class groaned' },
        { text: 'loudly at lunchtime' },
        { text: 'becuase the sprouts' },
        { text: 'smelled like old socks.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"becuase" in segment C has its letters jumbled. The honest spelling is because — Big Elephants Can Always Understand Small Elephants: b-e-c-a-u-s-e.',
      },
      hintSteps: [
        'Check the tricky word in segment C against its hook: the sentence that spells it out letter by letter.',
        'b-e-c-a-u-s-e comes from "Big Elephants Can Always Understand Small Elephants". Does segment C match?',
      ],
    },
    {
      id: 'tricky-words-t2-08', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Everyone agreed the' },
        { text: 'muddy football pitch' },
        { text: 'looked surprisingly' },
        { text: 'butiful after the rain.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"butiful" in the last segment has lost the whole B-E-A-U trio. The honest spelling is beautiful — beau-tiful.',
      },
      hintSteps: [
        'Check the tricky word in segment D against its hook: which four letters start it off?',
        '"Big Elephants Are Ugly" spells B-E-A-U. Does segment D have all four?',
      ],
    },
    {
      id: 'tricky-words-t2-09', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The goalkeeper insisted' },
        { text: 'the winning goal' },
        { text: 'had crossed the line' },
        { text: 'definately before the whistle.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"definately" in the last segment has swapped its hook for an "ate". The honest spelling is definitely — defi-NITE-ly.',
      },
      hintSteps: [
        'Check the tricky word in segment D against its hook: what small word should be hiding in the middle?',
        'defi-NITE-ly needs "nite". Does segment D spell that, or "nate"?',
      ],
    },
    {
      id: 'tricky-words-t2-10', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Wednesday is definitely' },
        { text: 'Jarlath’s favourite day' },
        { text: 'for muddy football' },
        { text: 'practice after school.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'Wednesday keeps its hidden wedding (WED-nes-day), definitely keeps its finite (defi-NITE-ly), and favourite keeps its proud British U (fav-OUR-ite). Every hook checks out. ALL CLEAN!',
        whyN: 'Every tricky word here follows its hook perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Three tricky words are hiding here. Check each against its hook: the wedding, the finite, and the British U.',
        'All three spellings pass their hooks. So what is the honest answer?',
      ],
    },
    {
      id: 'tricky-words-t2-11', tier: 2, format: 'errorspot',
      segments: [
        { text: 'In February the' },
        { text: 'goalkeeper wore a' },
        { text: 'separate pair of' },
        { text: 'colour-coded goalie gloves.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'February keeps its sneaky hidden R (Feb-RU-ary), separate keeps its rat (sep-A-RAT-e), and colour keeps its proud British U (col-OUR). Every hook checks out. ALL CLEAN!',
        whyN: 'Every tricky word here follows its hook perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Three tricky words are hiding here. Check each against its hook: the hidden R, the hidden rat, and the British U.',
        'All three spellings pass their hooks. So what is the honest answer?',
      ],
    },
    {
      id: 'tricky-words-t2-12', tier: 2, format: 'errorspot',
      segments: [
        { text: 'It is necessary' },
        { text: 'to say sorry' },
        { text: 'because the beautiful' },
        { text: 'trophy got dented.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'necessary keeps one Collar and two Socks, because spells out its elephant sentence exactly, and beautiful keeps its full B-E-A-U trio. Every hook checks out. ALL CLEAN!',
        whyN: 'Every tricky word here follows its hook perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Three tricky words are hiding here. Check each against its hook in turn.',
        'necessary, because and beautiful all pass their hooks. So what is the honest answer?',
      ],
    },

    // ---------- TIER 3 (10, subtlest errors) ----------
    {
      id: 'tricky-words-t3-01', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Wendesday was the day' },
        { text: 'Grandad said gloves were' },
        { text: 'absolutely necessary for' },
        { text: 'the freezing football match.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"Wendesday" has swapped the order of its hidden wedding. The honest spelling is Wednesday — WED-nes-day, with the D and E in that order.',
      },
      hintSteps: [
        'Check the first word against its hook very carefully — the letters can look almost right when they are not.',
        'WED-nes-day needs W-E-D in that exact order. Does segment A have it, or has it been shuffled?',
      ],
    },
    {
      id: 'tricky-words-t3-02', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Colur was draining from' },
        { text: 'Jarlath’s face as the' },
        { text: 'referee blew the' },
        { text: 'final necessary whistle.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: WEAPON_RULE,
        worked: '"Colur" has lost its proud British U entirely — this one is even sneakier than the American spelling. The honest spelling is Colour — col-OUR.',
      },
      hintSteps: [
        'Check the first word against its hook very carefully — count every letter, not just the ones you expect.',
        'col-OUR needs a U before the R. Does segment A have one at all?',
      ],
    },
    {
      id: 'tricky-words-t3-03', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The whole team agreed' },
        { text: 'their favourate smell was' },
        { text: 'definitely the muddy' },
        { text: 'post-match socks.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"favourate" has smuggled in an extra "ate" ending, borrowed from definitely’s trap. The honest spelling is favourite — fav-OUR-ite, ending in -ite not -ate.',
      },
      hintSteps: [
        'Check the tricky word in segment B against its hook — this one hides a very sneaky ending swap.',
        'fav-OUR-ite ends in -ite. Does segment B end in -ite, or has it borrowed an -ate from a different word?',
      ],
    },
    {
      id: 'tricky-words-t3-04', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Grandad muttered that' },
        { text: 'earmuffs were necassary' },
        { text: 'during the freezing' },
        { text: 'February football match.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: WEAPON_RULE,
        worked: '"necassary" has swapped one of its Socks for an A. The honest spelling is necessary — one Collar, two Socks, both spelled with E: nec-ESS-ary.',
      },
      hintSteps: [
        'Check the tricky word in segment B against its hook very carefully — one letter has quietly changed.',
        'nec-ESS-ary needs E’s in the middle, not A’s. Does segment B have the right vowel?',
      ],
    },
    {
      id: 'tricky-words-t3-05', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The twins were told' },
        { text: 'to keep their smelly' },
        { text: 'trainers separrate from' },
        { text: 'everyone else’s beautiful shoes.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"separrate" has doubled a letter it should not have — an extra R has crept in beside the rat. The honest spelling is separate — sep-A-RAT-e, one R only.',
      },
      hintSteps: [
        'Check the tricky word in segment C against its hook very carefully — count the R’s, not just the letters.',
        'sep-A-RAT-e has exactly one R in the middle. Does segment C have one R, or two?',
      ],
    },
    {
      id: 'tricky-words-t3-06', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Jarlath refused to' },
        { text: 'remove his stinky boots' },
        { text: 'beacuse the changing' },
        { text: 'room was already freezing.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: WEAPON_RULE,
        worked: '"beacuse" has swapped the order of two middle letters. The honest spelling is because — Big Elephants Can Always Understand Small Elephants: b-e-c-a-u-s-e.',
      },
      hintSteps: [
        'Check the tricky word in segment C against its hook very carefully — two letters have swapped places.',
        'b-e-c-a-u-s-e follows the elephant sentence in that exact order. Does segment C match it letter for letter?',
      ],
    },
    {
      id: 'tricky-words-t3-07', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The coach announced' },
        { text: 'that Wednesday’s training' },
        { text: 'was cancelled' },
        { text: 'definitly because of frost.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"definitly" has dropped a whole letter from the middle. The honest spelling is definitely — defi-NITE-ly needs every letter of "nite" plus the final -ly.',
      },
      hintSteps: [
        'Check the tricky word in segment D against its hook very carefully — count every letter, none should be missing.',
        'defi-NITE-ly has an E right before the L-Y ending. Does segment D still have it?',
      ],
    },
    {
      id: 'tricky-words-t3-08', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Grandad said the' },
        { text: 'frost made the pitch' },
        { text: 'look genuinely' },
        { text: 'beautifull this February morning.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: WEAPON_RULE,
        worked: '"beautifull" has grown an extra L it does not need. The honest spelling is beautiful — beau-ti-ful, with a single L at the end.',
      },
      hintSteps: [
        'Check the tricky word in segment D against its hook very carefully — count the letters at the very end.',
        'beau-ti-ful ends in a single L. Does segment D end in one L, or two?',
      ],
    },
    {
      id: 'tricky-words-t3-09', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Wednesday’s necessary training' },
        { text: 'was definitely cancelled' },
        { text: 'because of February' },
        { text: 'frost this morning.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'Wednesday keeps its hidden wedding, necessary keeps one Collar and two Socks, definitely keeps its finite, because spells out its elephant sentence, and February keeps its hidden R. Every hook checks out. ALL CLEAN!',
        whyN: 'Five tricky words appear here and every single one follows its hook perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Several tricky words are hiding here. Check each one against its hook, one at a time, however long it takes.',
        'Wednesday, necessary, definitely, because and February all pass their hooks. So what is the honest answer?',
      ],
    },
    {
      id: 'tricky-words-t3-10', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Grandad’s favourite colour' },
        { text: 'was a separate' },
        { text: 'beautiful shade of' },
        { text: 'swamp green today.' },
      ],
      faultyIndex: null,
      explain: {
        rule: WEAPON_RULE,
        worked: 'favourite and colour both keep their proud British U, separate keeps its hidden rat, and beautiful keeps its full B-E-A-U trio. Every hook checks out. ALL CLEAN!',
        whyN: 'Four tricky words appear here and every single one follows its hook perfectly, so there is nothing to catch.',
      },
      hintSteps: [
        'Several tricky words are hiding here. Check each one against its hook, one at a time.',
        'favourite, colour, separate and beautiful all pass their hooks. So what is the honest answer?',
      ],
    },
  ],
};
