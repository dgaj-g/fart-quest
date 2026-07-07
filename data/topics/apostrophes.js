// FART QUEST topic: It's-Its Junction — apostrophes (Punctuation Pits)
// Authored content — implementation agents: read, never modify.
// Bank-driven topic (bankTopic:true): battles draw from the curated `bank` array
// below rather than a procedural generator.

const RULE = 'An apostrophe either OWNS something (the dog\'s ball) or SQUEEZES letters out (it\'s = it is). Its without an apostrophe = belonging.';

export default {
  id: 'apostrophes',
  name: "It's-Its Junction",
  region: 'punctuation-pits',
  bankTopic: true,
  tagline: 'One tiny mark, two very different jobs — muddle them up and you own nothing but embarrassment.',

  creature: {
    id: 'its-its-the-confused',
    name: "It's-Its the Confused",
    rarity: 'rare',
    image: 'assets/monsters/its-its-the-confused.png',
    bio: "Two heads, one constant argument. The left head grabs anything it can OWN; the right head insists it simply IS things and owns nothing at all. Whiffbeard has learned never to referee.",
    factSneak: "An apostrophe either OWNS something (the dog's ball) or SQUEEZES letters out (it's = it is) — never both, and never for a plain plural.",
  },

  weapon: {
    id: 'owner-or-squeezer-badge',
    name: 'The Owner-or-Squeezer Badge',
    tagline: 'Ask what the little mark is doing before you trust it.',
    rule: RULE,
    example: "The dog's ball is OWNED by the dog. It's raining means it is raining — a SQUEEZE. Same tiny mark, two totally different jobs.",
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-apostrop',
      text: "Gather close, my brave little nose-soldier! See this tiny floating mark: ' ? Grown-ups muddle it up CONSTANTLY, and today you shall never be one of them. This little squiggle only ever does ONE of TWO jobs — and once you know the trick, you will spot every fake for the rest of your life.",
    },
    {
      type: 'show',
      title: 'Two Jobs, One Tiny Mark',
      html: "<p>The apostrophe looks harmless. It is NOT harmless. It has exactly <b>two jobs</b> in the entire kingdom, and nothing else.</p>\n<div class=\"law-scroll\">📜 <b>THE OWNER-OR-SQUEEZER LAW:</b> An apostrophe either OWNS something (the goblin's nose) or SQUEEZES letters out (it's = it is). Nothing else. Ever.</div>\n<p>Look at <b>Whiffbeard's beard</b> — that apostrophe is OWNING. The beard belongs to Whiffbeard. Now look at <b>Whiffbeard's late again</b> — that apostrophe is SQUEEZING. It's short for \"Whiffbeard is late again\". Same little mark, two completely different jobs. Sneaky.</p>",
    },
    {
      type: 'show',
      title: 'Owning: One Owner or a Whole Crowd?',
      html: "<p>When an apostrophe OWNS something, WHERE it sits tells you HOW MANY owners there are.</p>\n<p><b>One owner</b> → the apostrophe goes BEFORE the s: <b>a day's work</b> means the work of ONE day.</p>\n<p><b>Many owners</b> → the apostrophe goes AFTER the s: <b>five days' work</b> means the work of FIVE days.</p>\n<p>Same trick with people: <b>the goblin's treasure</b> (one goblin) versus <b>the goblins' treasure</b> (a whole gang, sharing one hoard). Before the s means one. After the s means more than one. That is the entire secret.</p>",
    },
    {
      type: 'show',
      title: 'Squeezing: Letters Vanish',
      html: "<p>SQUEEZING happens when two words get squashed into one, and the apostrophe sits EXACTLY where the missing letters used to be.</p>\n<ul>\n<li><b>it is</b> → <b>it's</b> (the \"i\" vanishes)</li>\n<li><b>do not</b> → <b>don't</b> (the \"o\" in \"not\" vanishes)</li>\n<li><b>cannot</b> → <b>can't</b></li>\n<li><b>they are</b> → <b>they're</b></li>\n<li><b>would not</b> → <b>wouldn't</b></li>\n</ul>\n<p>Here is your test for ANY squeezed word: un-squeeze it! If \"it's\" doesn't comfortably turn back into \"it is\", something is off — either it needed to be \"its\" (owning) instead, or the apostrophe has wandered off to a place it shouldn't be.</p>",
    },
    {
      type: 'try',
      q: {
        id: 'apos-try-1', topicId: 'apostrophes', tier: 1, format: 'errorspot',
        stem: "One segment is missing an apostrophe it desperately needs. Find it, or shout ALL CLEAN!",
        segments: [
          { text: 'Jarlath tied his boot' },
          { text: 'then handed Whiffbeard' },
          { text: 'the referees whistle' },
          { text: 'before kick-off.' },
        ],
        faultyIndex: 2,
        hintSteps: [
          'Read each segment and check: does anything need to OWN something with an apostrophe?',
          'Whose whistle is it? Just ONE referee owns it — "referees" needs an apostrophe before the s.',
        ],
        explain: {
          rule: RULE,
          worked: "The whistle belongs to ONE referee, so it needs an apostrophe: referee's whistle. \"Referees\" with no apostrophe would just mean several referees.",
          whyN: null,
        },
      },
    },
    {
      type: 'show',
      title: "Its vs It's — The Ultimate Showdown",
      html: "<p>The single most confusing word in the whole kingdom: <b>its</b> vs <b>it's</b>. Get this one trick and you will never fumble it again.</p>\n<div class=\"law-scroll\">📜 <b>ITS vs IT'S:</b> \"It's\" ALWAYS means \"it is\" (or \"it has\"). \"Its\" (no apostrophe) means belonging — just like \"his\" or \"her\" never take an apostrophe either.</div>\n<p>Test it: <b>It's smelly in here</b> → un-squeeze it → \"It is smelly in here\". Works! But <b>the stinkling waved its tail</b> — try un-squeezing that: \"the stinkling waved it is tail\"? Nonsense! So it must be the OWNING word: its.</p>\n<p>And here is a crime Whiffbeard will NOT tolerate: adding an apostrophe to a plain plural. <b>Banana's for sale</b> is a CRIME — nothing is owned by one banana, it's simply lots of bananas. Plain plurals NEVER get an apostrophe. Never. Ever. Not once.</p>",
    },
    {
      type: 'try',
      q: {
        id: 'apos-try-2', topicId: 'apostrophes', tier: 2, format: 'errorspot',
        stem: "Somewhere here, an apostrophe is doing a job it has no right to do. Find it, or shout ALL CLEAN!",
        segments: [
          { text: 'The stinkling licked' },
          { text: 'its muddy paws clean' },
          { text: 'while several cousin\'s watched' },
          { text: 'from the swamp bank.' },
        ],
        faultyIndex: 2,
        hintSteps: [
          'One segment has an apostrophe doing a job it shouldn\'t. Check: is anything actually being OWNED there?',
          '"Several cousin\'s" — how many cousins, and are they OWNING anything? If not, no apostrophe belongs there at all.',
        ],
        explain: {
          rule: RULE,
          worked: "\"Cousin's\" with an apostrophe would mean something belonging to ONE cousin — but here it's simply SEVERAL cousins watching, a plain plural. No apostrophe needed: cousins.",
          whyN: null,
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    "An apostrophe only ever OWNS or SQUEEZES — if it's doing neither, it shouldn't be there at all.",
    "One owner → apostrophe BEFORE the s (the dog's bone). Many owners → apostrophe AFTER the s (the dogs' bones).",
    "It's = it is (or it has). Its = belonging, no apostrophe — just like his, hers and ours never take one either.",
    "Plain plurals NEVER get an apostrophe. More than one banana is bananas, not banana's.",
    "Stuck on a squeezed word? Un-squeeze it! If \"they're\" won't turn back into \"they are\" sensibly, you need their instead.",
    "\"Could of\" and \"would of\" don't exist — say it slowly and you'll hear \"could've\", short for \"could have\".",
  ],

  bank: [
    // ---------- TIER 1 (12: 10 faulty + 2 N) ----------
    {
      id: 'apostrophes-t1-01', tier: 1, format: 'errorspot',
      segments: [
        { text: "The dog's lead" },
        { text: 'hung on its usual hook' },
        { text: 'by the door' },
        { text: 'every single night.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: "\"Dog's\" OWNS the lead (one dog, one apostrophe-s) and \"its\" shows belonging with NO apostrophe needed — both jobs done correctly. ALL CLEAN!",
        whyN: "It's tempting to hunt for a mistake, but sometimes every apostrophe has done its job properly — like right here.",
      },
      hintSteps: [
        'Check every apostrophe word: is it OWNING something or SQUEEZING letters together — and is that the right job for this sentence?',
        'Look hard at "dog\'s" and "its"... are you sure one of them is off? Read the whole sentence out loud.',
      ],
    },
    {
      id: 'apostrophes-t1-02', tier: 1, format: 'errorspot',
      segments: [
        { text: "It's tail wagged fast" },
        { text: 'when Jarlath grabbed' },
        { text: 'the muddy football' },
        { text: 'near the goalpost.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it's → \"it is tail wagged fast\" — nonsense! The tail BELONGS to the dog, so we need the belonging word: its (no apostrophe).",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze any apostrophe word: does the sentence still make sense as "it is"?',
        'Segment A says "It\'s tail" — try "It is tail wagged fast"... does a tail belong to a dog, or IS it "it is"?',
      ],
    },
    {
      id: 'apostrophes-t1-03', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Sir Jarlath spotted' },
        { text: "three stray dog's" },
        { text: 'near the smelly bins' },
        { text: 'before hometime.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: "\"Dog's\" with an apostrophe means something belonging to ONE dog — but here there are just several dogs, a plain plural. No apostrophe needed: dogs.",
        whyN: null,
      },
      hintSteps: [
        'One segment has an apostrophe doing a job it shouldn\'t. Is anything actually being OWNED there?',
        'How many dogs are there? A plain plural never gets an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t1-04', tier: 1, format: 'errorspot',
      segments: [
        { text: 'After the muddy match' },
        { text: 'both captains searched' },
        { text: "because the captain's whistles" },
        { text: 'had gone missing.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: "Both captains own the whistles — TWO owners means the apostrophe goes AFTER the s: captains'. \"Captain's\" (apostrophe before s) would mean only ONE captain owns them.",
        whyN: null,
      },
      hintSteps: [
        'Count the owners in segment C. Is it one captain, or more than one?',
        'Two captains share the whistles — for more than one owner, the apostrophe moves AFTER the s.',
      ],
    },
    {
      id: 'apostrophes-t1-05', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Jarlath found a coin' },
        { text: 'lying by the goalpost' },
        { text: 'and proudly announced' },
        { text: "that it was her's." },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: "\"Hers\" already OWNS all by itself — it never needs an apostrophe. \"Her's\" is a fake word Whiffbeard has never once seen in any spellbook.",
        whyN: null,
      },
      hintSteps: [
        'Check the very last word — is "her\'s" actually a real spelling?',
        'Just like his and its, hers never takes an apostrophe. Segment D has a fabricated word.',
      ],
    },
    {
      id: 'apostrophes-t1-06', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Their heading straight' },
        { text: 'for the tuck shop' },
        { text: 'before the bell' },
        { text: 'finally rings.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: does \"their heading\" mean anything? No — we need \"they're\" (they are) heading for the tuck shop.",
        whyN: null,
      },
      hintSteps: [
        'Try un-squeezing the first word: does "their heading" make sense as a sentence start?',
        '"They\'re" = "they are". Try reading segment A out loud with "they are"...',
      ],
    },
    {
      id: 'apostrophes-t1-07', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Sir Jarlath searched' },
        { text: 'but he cant find' },
        { text: 'his missing left welly' },
        { text: 'in the changing room.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: "\"Cant\" isn't a squeezed word at all — the apostrophe is missing! It should be \"can't\" (can + not, with the \"no\" squeezed to 't).",
        whyN: null,
      },
      hintSteps: [
        'Read segment B slowly — is a squeeze mark missing from a word that needs one?',
        '"Can" and "not" squeeze together as can\'t — check the spelling in segment B.',
      ],
    },
    {
      id: 'apostrophes-t1-08', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Every Friday' },
        { text: 'the canteen sells' },
        { text: "hot sausage's" },
        { text: 'to hungry footballers.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: "\"Sausage's\" with an apostrophe would mean something belonging to ONE sausage. Here it's just LOTS of sausages — a plain plural, no apostrophe: sausages.",
        whyN: null,
      },
      hintSteps: [
        'Segment C has an apostrophe doing a job it shouldn\'t. Is anything actually being OWNED there?',
        'The canteen sells many sausages — a plain plural never gets an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t1-09', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The twins packed' },
        { text: 'their kit bags' },
        { text: 'insisting the trophy' },
        { text: "was their's." },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: "\"Theirs\" already owns all on its own — no apostrophe needed, ever. \"Their's\" is a made-up word that should never appear.",
        whyN: null,
      },
      hintSteps: [
        'Check the last word carefully — is "their\'s" actually a real spelling?',
        'Just like hers and ours, theirs never takes an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t1-10', tier: 1, format: 'errorspot',
      segments: [
        { text: "The sister's bedroom" },
        { text: 'was painted bright pink' },
        { text: 'for their birthday party' },
        { text: 'last October half-term.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: "TWO sisters own the bedroom together — plural owners need the apostrophe AFTER the s: sisters'. \"Sister's\" (before the s) would mean only ONE sister owns it.",
        whyN: null,
      },
      hintSteps: [
        'Count the owners in segment A. Is it one sister, or more than one, sharing the bedroom?',
        'The party is "their" birthday, plural — so more than one sister owns that bedroom.',
      ],
    },
    {
      id: 'apostrophes-t1-11', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The team celebrated' },
        { text: "because they're goalkeeper" },
        { text: 'saved a penalty' },
        { text: 'in the final minute.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: \"because they are goalkeeper saved\" makes no sense. The goalkeeper BELONGS to the team, so we need their (no apostrophe).",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze the apostrophe word in segment B: does "they are goalkeeper" make any sense?',
        'The goalkeeper belongs to the team — that needs the owning word, not the squeezed one.',
      ],
    },
    {
      id: 'apostrophes-t1-12', tier: 1, format: 'errorspot',
      segments: [
        { text: "The whole squad's kit" },
        { text: 'smelled utterly disgusting' },
        { text: 'after the muddy match' },
        { text: 'finally came to an end.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: "\"Squad's\" shows the kit belongs to ONE squad — correctly placed apostrophe, and nothing else in the sentence needs one. ALL CLEAN!",
        whyN: 'Not every sentence is hiding a stink — sometimes the apostrophe has done its job perfectly, like here.',
      },
      hintSteps: [
        'Find the only apostrophe word and check its job: is it owning something correctly?',
        '"Squad\'s" — one squad, one apostrophe, correctly placed. Read the whole sentence again... anything actually off?',
      ],
    },

    // ---------- TIER 2 (12: 10 faulty + 2 N) ----------
    {
      id: 'apostrophes-t2-01', tier: 2, format: 'errorspot',
      segments: [
        { text: 'By half past three' },
        { text: "the twins' matching boots" },
        { text: 'were finally spotless' },
        { text: 'after a long scrub.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: "Two twins together own the boots — plural owners, apostrophe AFTER the s: twins'. Correctly placed, and no other apostrophes are needed anywhere else. ALL CLEAN!",
        whyN: "Don't let the tricky little mark fool you — sometimes \"twins'\" really is the correct spelling, exactly as it looks.",
      },
      hintSteps: [
        'Check the only apostrophe word: how many owners are there, and is the apostrophe on the right side of the s?',
        'TWO twins own the boots together. Where should the apostrophe go for plural owners — and is it already there?',
      ],
    },
    {
      id: 'apostrophes-t2-02', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Everyone wondered aloud' },
        { text: 'long into the evening' },
        { text: "who's football boots" },
        { text: 'were the muddiest.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: \"who is football boots\" makes no sense. We need the OWNING word instead — whose (no apostrophe).",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze the apostrophe word in segment C: does "who is football boots" make sense?',
        'The boots belong to someone — that needs the owning word whose, not who\'s.',
      ],
    },
    {
      id: 'apostrophes-t2-03', tier: 2, format: 'errorspot',
      segments: [
        { text: 'After every training session' },
        { text: 'the boys always hung' },
        { text: 'their kit bags up' },
        { text: "then folded their towel's." },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: "\"Towel's\" with an apostrophe means something belonging to ONE towel — but here it's simply MANY towels, a plain plural. No apostrophe needed: towels.",
        whyN: null,
      },
      hintSteps: [
        'Segment D has an apostrophe doing a job it shouldn\'t. Is anything actually being OWNED there?',
        'The boys folded many towels — a plain plural never gets an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t2-04', tier: 2, format: 'errorspot',
      segments: [
        { text: "Our's was the loudest cheer" },
        { text: 'in the entire stadium' },
        { text: 'that whole Saturday afternoon' },
        { text: 'according to Whiffbeard.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: "\"Ours\" already owns all by itself — no apostrophe, ever. \"Our's\" is a fake word that should never appear on any page.",
        whyN: null,
      },
      hintSteps: [
        'Check the very first word — is "our\'s" actually a real spelling?',
        'Just like hers and theirs, ours never takes an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t2-05', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Down at the pitch' },
        { text: 'their about to kick' },
        { text: 'off the very last' },
        { text: 'match of the season.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: \"their about to kick off\" — try \"they are about to kick off\". That's the meaning we want: they're.",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze the apostrophe-less word in segment B: does "their about to kick off" make sense as it stands?',
        'Try reading it as "they are about to kick off" instead — that\'s the squeeze we need.',
      ],
    },
    {
      id: 'apostrophes-t2-06', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Every single locker' },
        { text: 'had a neat name tag' },
        { text: "but only one boys' jumper" },
        { text: 'hung there neatly.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: "Only ONE boy owns the jumper — a single owner needs the apostrophe BEFORE the s: boy's. \"Boys'\" (after the s) would mean several boys shared it.",
        whyN: null,
      },
      hintSteps: [
        'Count the owners in segment C. The sentence says "only one" — how many boys is that?',
        'A single owner needs the apostrophe BEFORE the s, not after it.',
      ],
    },
    {
      id: 'apostrophes-t2-07', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Whiffbeard made a promise' },
        { text: 'to the whole squad' },
        { text: 'that they simply' },
        { text: 'wouldnt lose the trophy.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: "\"Wouldnt\" is missing its squeeze mark — it should be \"wouldn't\" (would + not, with the \"o\" squeezed out to an apostrophe).",
        whyN: null,
      },
      hintSteps: [
        'Read segment D slowly — is a squeeze mark missing from a word that needs one?',
        '"Would" and "not" squeeze together as wouldn\'t — check the spelling in segment D.',
      ],
    },
    {
      id: 'apostrophes-t2-08', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Its been raining' },
        { text: 'for hours and hours' },
        { text: 'yet the match' },
        { text: "still hasn't been cancelled." },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: \"it has been raining\" makes sense — that's the squeeze we need: it's (it has), not the belonging word its.",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze the apostrophe-less word in segment A: does "its been raining" make sense as it stands?',
        'Try "it has been raining" instead — that\'s a squeeze, and squeezes need an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t2-09', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The shiny trophy' },
        { text: "that was clearly her's" },
        { text: 'sat proudly displayed' },
        { text: 'on the top shelf.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: "\"Hers\" already owns all by itself and never takes an apostrophe. \"Her's\" is a fabricated word — it should simply be hers.",
        whyN: null,
      },
      hintSteps: [
        'Check the word after "clearly" in segment B — is "her\'s" actually a real spelling?',
        'Just like his and ours, hers never takes an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t2-10', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The whole crowd knew' },
        { text: 'deep down inside' },
        { text: 'that their finally going' },
        { text: 'to lift the cup.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: \"that their finally going\" — try \"that they are finally going\". That's the meaning here: they're.",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze the apostrophe-less word in segment C: does "their finally going" make sense on its own?',
        'Try "they are finally going" instead — that\'s the squeeze we need.',
      ],
    },
    {
      id: 'apostrophes-t2-11', tier: 2, format: 'errorspot',
      segments: [
        { text: 'At the very end' },
        { text: "of Friday's noisy assembly" },
        { text: 'the head teacher handed out' },
        { text: "shiny golden medal's." },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: "\"Medal's\" with an apostrophe means something belonging to ONE medal — but here it's just LOTS of medals, a plain plural. No apostrophe needed: medals.",
        whyN: null,
      },
      hintSteps: [
        'Segment D has an apostrophe doing a job it shouldn\'t. Is anything actually being OWNED there?',
        'The head teacher handed out many medals — a plain plural never gets an apostrophe.',
      ],
    },
    {
      id: 'apostrophes-t2-12', tier: 2, format: 'errorspot',
      segments: [
        { text: "By Friday's end" },
        { text: "the whole team's kit bags" },
        { text: 'were finally packed' },
        { text: 'neatly away in the shed.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: "\"Friday's end\" and \"team's kit bags\" both correctly OWN something with a single apostrophe before the s. Nothing here is squeezed or plural-crimed. ALL CLEAN!",
        whyN: 'Two apostrophes in one sentence can look suspicious — but here, both of them are doing their job exactly right.',
      },
      hintSteps: [
        'Check both apostrophe words one at a time: what does each one OWN, and is the apostrophe in the right place?',
        '"Friday\'s end" and "team\'s kit bags" — singular owners, apostrophe before the s. Anything actually broken here?',
      ],
    },

    // ---------- TIER 3 (10: 8 faulty + 2 N, subtlest errors) ----------
    {
      id: 'apostrophes-t3-01', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The two captains shook hands' },
        { text: 'before kick-off began' },
        { text: "and the captains' whistles" },
        { text: 'gleamed in the sun.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: "The FIRST \"captains\" is a plain plural (no owning, no apostrophe needed) — the SECOND \"captains'\" owns the whistles (plural owners, apostrophe after the s). Both spelled exactly right. ALL CLEAN!",
        whyN: 'Two nearly-identical words side by side can trick your eyes — but check each one\'s job separately, and this sentence is spotless.',
      },
      hintSteps: [
        'There are two similar-looking words here — check each one\'s job separately: is it naming, or owning?',
        'The first "captains" just names them (no apostrophe needed). The second "captains\'" owns the whistles (apostrophe after s, since there are two). Anything off?',
      ],
    },
    {
      id: 'apostrophes-t3-02', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Its half time already' },
        { text: 'yet the match feels' },
        { text: 'like it barely' },
        { text: 'even started at all.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: \"it is half time already\" makes perfect sense — that's the squeeze we need: it's, not the belonging word its.",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze the apostrophe-less word in segment A: does "its half time already" make sense as it stands?',
        'Try "it is half time already" instead — that\'s the squeeze we need.',
      ],
    },
    {
      id: 'apostrophes-t3-03', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Everyone packed their own kit' },
        { text: "but the gloves were her's" },
        { text: "not the goalkeeper's" },
        { text: 'as first assumed.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: "\"Hers\" already owns all by itself — no apostrophe, ever. \"Her's\" is a fabricated word; it should simply be hers.",
        whyN: null,
      },
      hintSteps: [
        'Segment B ends with a possessive word — check it against segment C\'s "goalkeeper\'s". Do they follow the same rule?',
        'The goalkeeper\'s gloves take an apostrophe because "goalkeeper" is a noun — but hers is a pronoun and never does.',
      ],
    },
    {
      id: 'apostrophes-t3-04', tier: 3, format: 'errorspot',
      segments: [
        { text: "Both teams' captains" },
        { text: 'shook hands warmly' },
        { text: "but only one boys' shirt" },
        { text: 'was ripped at the seam.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: "Only ONE boy owns the torn shirt — a single owner needs the apostrophe BEFORE the s: boy's. \"Boys'\" (after the s) would mean it belonged to several boys.",
        whyN: null,
      },
      hintSteps: [
        'Compare segment A\'s "teams\'" with segment C\'s "boys\'" — do they have the same number of owners?',
        'The sentence says "only one" boy — a single owner needs the apostrophe BEFORE the s, not after it.',
      ],
    },
    {
      id: 'apostrophes-t3-05', tier: 3, format: 'errorspot',
      segments: [
        { text: "Whiffbeard simply couldn't believe" },
        { text: 'his own two eyes' },
        { text: "when the referee's whistle" },
        { text: 'wouldnt stop squeaking loudly.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: "\"Wouldnt\" is missing its squeeze mark — it should be \"wouldn't\" (would + not). Notice \"couldn't\" earlier in the sentence got it right!",
        whyN: null,
      },
      hintSteps: [
        'Compare "couldn\'t" in segment A with the similar word right at the end of segment D — do they match?',
        '"Would" and "not" squeeze together as wouldn\'t, exactly like couldn\'t did.',
      ],
    },
    {
      id: 'apostrophes-t3-06', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Their absolutely certain' },
        { text: 'that their new kit' },
        { text: 'will finally arrive' },
        { text: "before Saturday's big match." },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: "Un-squeeze the FIRST word: \"they are absolutely certain\" — that works! So segment A needs they're. The second \"their\" (their new kit) is correctly used for belonging.",
        whyN: null,
      },
      hintSteps: [
        'Two similar words appear here — segment A and segment B. Un-squeeze each one separately: which one actually means "they are"?',
        'Segment A: "they are absolutely certain" makes sense — that needs they\'re. Segment B\'s "their new kit" is correctly owning.',
      ],
    },
    {
      id: 'apostrophes-t3-07', tier: 3, format: 'errorspot',
      segments: [
        { text: "The referee's whistle" },
        { text: "silenced the noisy player's" },
        { text: 'before the whole match' },
        { text: 'finally resumed again.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: "\"Player's\" with an apostrophe means something belonging to ONE player — but here it's simply the players themselves (plain plural). No apostrophe needed: players.",
        whyN: null,
      },
      hintSteps: [
        'Compare segment A\'s "referee\'s" with segment B\'s "player\'s" — is anything actually being OWNED in segment B?',
        'The whistle silenced the noisy players themselves, not something belonging to one player.',
      ],
    },
    {
      id: 'apostrophes-t3-08', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The dog wagged its tail' },
        { text: 'happily round the kitchen' },
        { text: "sure the biscuit was our's" },
        { text: 'before dinner.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: "\"Ours\" already owns all by itself and never takes an apostrophe. \"Our's\" is a fabricated word — it should simply be ours.",
        whyN: null,
      },
      hintSteps: [
        'Compare "its" in segment A with the possessive word in segment C — do they follow the same never-an-apostrophe rule?',
        'Just like its, ours never takes an apostrophe. Segment C has a fabricated word.',
      ],
    },
    {
      id: 'apostrophes-t3-09', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The old whistle shrieked' },
        { text: 'unbelievably loudly today' },
        { text: 'and nobody could believe' },
        { text: "it's awful piercing sound." },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: "Un-squeeze it: \"believe it is awful piercing sound\" makes no sense. The sound BELONGS to the whistle, so we need its (no apostrophe).",
        whyN: null,
      },
      hintSteps: [
        'Un-squeeze the apostrophe word in segment D: does "believe it is awful piercing sound" make sense?',
        'The sound belongs to the whistle — that needs the owning word its, not it\'s.',
      ],
    },
    {
      id: 'apostrophes-t3-10', tier: 3, format: 'errorspot',
      segments: [
        { text: "It's odd that the whistle" },
        { text: 'lost its shine' },
        { text: 'after just one match' },
        { text: 'in the pouring rain.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: "\"It's\" = it is (a squeeze) — correct here. \"Its\" shows the whistle's own shine belongs to it (no apostrophe) — also correct. Two similar words, both spot on. ALL CLEAN!",
        whyN: "It's and its sitting in the very same sentence looks like a trap — but check each one's job, and you'll see both are exactly right.",
      },
      hintSteps: [
        'Check BOTH apostrophe-ish words separately: is each one OWNING or SQUEEZING — and is that the correct job for it?',
        '"It\'s odd" un-squeezes to "it is odd" (correct). "Its shine" shows belonging with no apostrophe (correct). Anything actually broken?',
      ],
    },
  ],
};
