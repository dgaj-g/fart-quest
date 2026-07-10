// FART QUEST topic: The Quote Quarry — speech marks & brackets (Punctuation Pits)
// Authored content — implementation agents: read, never modify.
// Bank-driven topic (bankTopic:true): battles draw from the curated `bank` array
// below rather than a procedural generator.

const RULE = 'Speech marks hug ONLY the spoken words — and the punctuation stays inside the hug.';

export default {
  id: 'speech-brackets',
  name: 'The Quote Quarry',
  region: 'punctuation-pits',
  bankTopic: true,

  creature: {
    id: 'the-air-quoter',
    name: 'The Air-Quoter',
    rarity: 'rare',
    image: 'assets/monsters/the-air-quoter.png',
    bio: 'The Air-Quoter cannot say a single sentence without wrapping bits of it in speech marks — and he insists every single one of his little hugs must be properly closed. He gets twitchy around loose punctuation.',
    factSneak: 'Speech marks hug ONLY the spoken words — and the punctuation stays inside the hug.',
  },

  weapon: {
    id: 'speech-trap',
    name: 'The Speech Trap',
    tagline: 'Catch every runaway punctuation mark and drag it back inside the hug.',
    rule: RULE,
    example: '<b>"Watch out, that puddle is deep!"</b> warned Maya — the exclamation mark stays snug INSIDE the hug, exactly where it belongs.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-speechbr',
      text: 'Ahoy there, my brave little nose-soldier! Welcome to the Quote Quarry, home of the strangest creature I have ever met: <b>The Air-Quoter</b>. He puts speech marks around EVERYTHING he says — and today you shall learn his secret: those little marks are not decoration. They are a <b>HUG</b>.',
    },
    {
      type: 'show',
      title: 'Speech Marks Are a Hug',
      html: `<p>When someone actually SPEAKS out loud, we wrap their exact words in <b>speech marks</b> — like a pair of arms giving those words a hug.</p>
<div class="law-scroll">Speech marks hug ONLY the spoken words — nothing else.</div>
<p>Look at this: Jake said, <b>"I scored a hat-trick today!"</b> The speech marks open right before "I" and close right after the exclamation mark — because that is EXACTLY what came out of Jake's mouth. Not "Jake said" — just his actual words.</p>`,
    },
    {
      type: 'show',
      title: 'The Punctuation Stays INSIDE the Hug',
      html: `<p>Two more rules for a perfect hug:</p>
<div class="law-scroll">1. A spoken sentence starts with a CAPITAL letter, just like any other sentence.<br>2. The punctuation mark at the end of the spoken words stays INSIDE the closing speech mark.</div>
<p>Watch: <b>"Careful, that puddle is deep!"</b> warned Maya. See how the capital <b>C</b> starts the speech, and the <b>!</b> is tucked safely INSIDE, before the closing mark? That's a perfect hug. If you ever saw <b>"Careful, that puddle is deep"!</b> — with the mark left OUTSIDE — something has escaped the hug!</p>`,
    },
    {
      type: 'talk',
      text: 'Now then — sometimes I want to add a little EXTRA detail without interrupting my main sentence. For that, I reach for a different pair of arms altogether: brackets. And every so often, two words get so friendly they need a tiny hyphen to hold hands. Let me show you both.',
    },
    {
      type: 'show',
      title: 'Brackets for Extra Bits — and Friendly Hyphens',
      html: `<p><b>Brackets ( )</b> are a hug too — but for EXTRA information you could remove and the sentence would still make sense. Sam scored the winning goal <b>(his third this season)</b> in the last minute. Take the bracket out — "Sam scored the winning goal in the last minute" — still a perfect sentence! Brackets always come in PAIRS: open one, close one.</p>
<div class="law-scroll">A bracket that opens MUST close. No exceptions — an open bracket is a hug with only one arm.</div>
<p>And hyphens? They join two words that work as ONE describing word, like <b>well-known</b>, <b>three-legged</b>, or a <b>six-year-old</b>. Small mark, big job — it glues the words together so there's no confusion.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'speechbr-try-1', topicId: 'speech-brackets', tier: 1, format: 'errorspot',
        segments: [
          { text: 'Ryan grinned and shouted,' },
          { text: '"we won the cup!"' },
          { text: 'as the whole team' },
          { text: 'ran onto the pitch.' },
        ],
        faultyIndex: 1,
        hintSteps: [
          'Check the very first letter after the opening speech mark in segment B.',
          'A spoken sentence starts exactly like a written one — with a capital letter.',
        ],
        explain: {
          rule: RULE,
          worked: 'Segment B starts the spoken sentence with a lowercase "we" — spoken sentences begin with a capital, just like any other: "We won the cup!"',
          whyN: null,
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'speechbr-try-2', topicId: 'speech-brackets', tier: 1, format: 'errorspot',
        segments: [
          { text: 'Aoife\'s painting' },
          { text: '(the one with the purple dragon' },
          { text: 'won first prize' },
          { text: 'at the art show.' },
        ],
        faultyIndex: 1,
        hintSteps: [
          'Segment B has an opening bracket — check whether a closing bracket ever appears.',
          'This bracket opens its arms for the extra detail but the hug is never finished.',
        ],
        explain: {
          rule: RULE,
          worked: 'Segment B opens a bracket — "(the one with the purple dragon" — but it never closes. Every bracket needs its matching partner: "(the one with the purple dragon)".',
          whyN: null,
        },
      },
    },
    { type: 'anim', anim: 'speech-brackets' },
    { type: 'weapon' },
  ],

  tips: [
    'Speech marks hug ONLY the words that were actually said out loud — never the reporting clause like "she said".',
    'The punctuation mark at the end of the spoken words — full stop, comma, "!", "?" — always sits INSIDE the closing speech mark.',
    'Every spoken sentence starts with a capital letter, exactly like a written one.',
    'Brackets come in pairs: an opening ( always needs its closing ) — never leave the hug half-finished.',
    'Use brackets only for EXTRA detail you could delete and the sentence would still make perfect sense.',
    'A hyphen joins two words acting as one describing word — well-known, three-legged, six-year-old.',
  ],

  bank: [
    // ---------- TIER 1 (12: 10 faulty + 2 N) ----------
    {
      id: 'speech-brackets-t1-01', tier: 1, format: 'errorspot',
      segments: [
        { text: '"Watch out for that puddle"!' },
        { text: 'yelled Sam,' },
        { text: 'but Leah' },
        { text: 'jumped straight into it.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'The mark closes before the "!" in segment A — "Watch out for that puddle"! The exclamation mark is part of what Sam actually said, so it must stay INSIDE the hug: "Watch out for that puddle!"',
        whyN: null,
      },
      hintSteps: [
        'Find the segment with speech marks. Where does the punctuation mark sit — before or after the closing mark?',
        'The exclamation mark belongs to the shout itself, so it needs to be tucked inside the speech marks, not left outside.',
      ],
    },
    {
      id: 'speech-brackets-t1-02', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Ryan called out,' },
        { text: '"Pass it here"!' },
        { text: 'as the ball' },
        { text: 'rolled past the goalpost.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Segment B closes the speech marks before the "!" — "Pass it here"! The exclamation mark belongs to Ryan\'s shout, so it must sit inside the hug: "Pass it here!"',
        whyN: null,
      },
      hintSteps: [
        'Look at segment B — where the speech marks close. Check what comes right before that closing mark.',
        'The "!" is part of what Ryan shouted, so it needs to live inside the speech marks, not after them.',
      ],
    },
    {
      id: 'speech-brackets-t1-03', tier: 1, format: 'errorspot',
      segments: [
        { text: '"Mind the wet paint"!' },
        { text: 'warned Miss Doyle,' },
        { text: 'but Connor' },
        { text: 'touched it anyway.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Segment A shuts the hug before the "!" — "Mind the wet paint"! The exclamation mark is part of the warning, so it belongs inside: "Mind the wet paint!"',
        whyN: null,
      },
      hintSteps: [
        'Segment A has the speech marks — check exactly where they close compared to the end punctuation.',
        'Miss Doyle\'s warning includes the "!" — it must stay inside the hug, not sit outside it.',
      ],
    },
    {
      id: 'speech-brackets-t1-04', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Priya shouted,' },
        { text: '"The bus is leaving!' },
        { text: 'as everyone' },
        { text: 'sprinted for the door.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Segment B opens the hug with " but never closes it — "The bus is leaving! ...and the sentence carries on with no closing mark. Every hug needs two arms: "The bus is leaving!"',
        whyN: null,
      },
      hintSteps: [
        'Count the speech marks in segment B — a hug needs one at the start AND one at the end.',
        'The opening mark is there, but look right after "leaving!" — is there a matching closing mark?',
      ],
    },
    {
      id: 'speech-brackets-t1-05', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The teacher said,' },
        { text: 'quite firmly,' },
        { text: '"Line up outside now!' },
        { text: 'before the fire drill.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Segment C opens with " before "Line up outside now!" but never closes — the hug is left open. It needs a closing mark: "Line up outside now!"',
        whyN: null,
      },
      hintSteps: [
        'Segment C has an opening speech mark — track forward: does a matching closing mark ever appear?',
        'The teacher\'s whole sentence needs both arms of the hug — spot which one is missing.',
      ],
    },
    {
      id: 'speech-brackets-t1-06', tier: 1, format: 'errorspot',
      segments: [
        { text: '"well played, everyone!"' },
        { text: 'grinned the coach,' },
        { text: 'as the whistle' },
        { text: 'blew for full time.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Segment A starts the spoken sentence with a lowercase "well" — speech begins like any sentence, with a capital: "Well played, everyone!"',
        whyN: null,
      },
      hintSteps: [
        'Check the very first letter inside the speech marks in segment A.',
        'Spoken sentences start exactly like written ones — with a capital letter.',
      ],
    },
    {
      id: 'speech-brackets-t1-07', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The zookeeper whispered,' },
        { text: '"don\'t feed the otters!"' },
        { text: 'as Ben' },
        { text: 'reached into his bag.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Segment B begins the spoken sentence with a lowercase "don\'t" — it needs a capital, just like any sentence start: "Don\'t feed the otters!"',
        whyN: null,
      },
      hintSteps: [
        'Look at the first word right after the opening speech mark in segment B.',
        'A capital letter should open every spoken sentence — this one is missing it.',
      ],
    },
    {
      id: 'speech-brackets-t1-08', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The referee blew his whistle,' },
        { text: 'pointed at the pitch,' },
        { text: 'and shouted,' },
        { text: '"penalty to the home team!"' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Segment D opens the shout with a lowercase "penalty" — the spoken sentence needs a capital start: "Penalty to the home team!"',
        whyN: null,
      },
      hintSteps: [
        'Check the word straight after the opening speech mark in segment D.',
        'Every spoken sentence starts with a capital — this one has slipped through in lowercase.',
      ],
    },
    {
      id: 'speech-brackets-t1-09', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Maya scored the winning goal' },
        { text: 'in the last minute' },
        { text: '(her fourth this season' },
        { text: 'and everyone cheered.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Segment C opens a bracket with "(her fourth this season" but never closes it — brackets come in pairs, just like speech marks: "(her fourth this season)".',
        whyN: null,
      },
      hintSteps: [
        'Find the opening bracket in segment C — a bracket always needs a partner to close it.',
        'Track forward from the "(" — does a matching ")" ever turn up before the sentence ends?',
      ],
    },
    {
      id: 'speech-brackets-t1-10', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The farm trip' },
        { text: 'ran an hour late' },
        { text: 'because of traffic' },
        { text: '(much to everyone\'s delight.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Segment D opens a bracket — "(much to everyone\'s delight" — but it never closes. Every bracket needs its matching partner: "(much to everyone\'s delight)".',
        whyN: null,
      },
      hintSteps: [
        'Segment D has an opening bracket — check whether a closing bracket ever appears.',
        'A bracket is a hug too — this one opens its arms but never closes them.',
      ],
    },
    {
      id: 'speech-brackets-t1-11', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Leah cheered,' },
        { text: '"We won the match!"' },
        { text: 'as her teammates' },
        { text: 'lifted her onto their shoulders.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'Every hug is complete here: the speech marks open and close, "We won the match!" starts with a capital, and the "!" sits safely inside. ALL CLEAN!',
        whyN: 'It is tempting to hunt for a mistake in every sentence, but this one gets the hug exactly right — nothing to fix here.',
      },
      hintSteps: [
        'Check each rule in turn: capital at the start of the speech, punctuation inside the marks, and a closing mark present.',
        'Every single rule is followed correctly here — so what is the honest answer?',
      ],
    },
    {
      id: 'speech-brackets-t1-12', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Tom brought his lunchbox' },
        { text: '(a bright green one)' },
        { text: 'to the museum trip' },
        { text: 'on Thursday.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'The bracket opens with ( and closes with ) around the extra detail — "(a bright green one)" — a complete hug with nothing missing. ALL CLEAN!',
        whyN: 'The bracket here opens and closes properly, so there is honestly no mistake to hunt for.',
      },
      hintSteps: [
        'Check the bracket in segment B — does it have both an opening AND a closing half?',
        'Both halves of the bracket are present and correctly placed — is there really an error here?',
      ],
    },

    // ---------- TIER 2 (12: 10 faulty + 2 N) ----------
    {
      id: 'speech-brackets-t2-01', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Zara laughed' },
        { text: 'and pointed at the puppy,' },
        { text: '"Look at his silly ears"!' },
        { text: 'she giggled.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Segment C closes the hug before the "!" — "Look at his silly ears"! The exclamation mark belongs to Zara\'s words, so it must sit inside: "Look at his silly ears!"',
        whyN: null,
      },
      hintSteps: [
        'Segment C has the speech marks — check exactly where the closing mark sits compared to the "!".',
        'The "!" is part of what Zara said, so it needs to be tucked inside the hug, not left outside.',
      ],
    },
    {
      id: 'speech-brackets-t2-02', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Ollie crouched by the goal,' },
        { text: 'punched the air,' },
        { text: 'and roared,' },
        { text: '"That\'s a hat-trick"!' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Segment D closes the hug before the "!" — "That\'s a hat-trick"! The exclamation belongs to Ollie\'s roar, so it must stay inside: "That\'s a hat-trick!"',
        whyN: null,
      },
      hintSteps: [
        'Segment D has the closing speech mark — check where it sits compared to the "!".',
        'The excitement mark is part of the shout itself, so it lives inside the hug.',
      ],
    },
    {
      id: 'speech-brackets-t2-03', tier: 2, format: 'errorspot',
      segments: [
        { text: '"I left my coat on the bus' },
        { text: 'gasped Aoife,' },
        { text: 'searching every pocket' },
        { text: 'for her bus pass.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Segment A opens the hug with " but never closes it — "I left my coat on the bus" needs its matching mark before "gasped Aoife".',
        whyN: null,
      },
      hintSteps: [
        'Segment A has an opening speech mark — track forward to check for a matching closing mark.',
        'The whole sentence Aoife says needs both arms of the hug — one is missing.',
      ],
    },
    {
      id: 'speech-brackets-t2-04', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Kyle grinned and said,' },
        { text: '"This sports day is brilliant' },
        { text: 'before dashing off' },
        { text: 'to the long jump.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Segment B opens the hug with " before "This sports day is brilliant" but the closing mark never arrives — it needs one right after "brilliant": "This sports day is brilliant!"',
        whyN: null,
      },
      hintSteps: [
        'Segment B has an opening speech mark — check whether a matching closing mark shows up before the sentence moves on.',
        'Kyle\'s whole comment needs both arms of the hug — spot the missing one.',
      ],
    },
    {
      id: 'speech-brackets-t2-05', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Freya turned round' },
        { text: 'in the dinner hall,' },
        { text: '"Someone\'s taken my tray' },
        { text: 'she said crossly.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Segment C opens the hug with " before "Someone\'s taken my tray" but it\'s never closed — it needs a matching mark right after "tray": "Someone\'s taken my tray!"',
        whyN: null,
      },
      hintSteps: [
        'Segment C starts a speech mark — check if a closing mark ever appears before the sentence ends.',
        'Freya\'s whole sentence needs both arms of the hug, and one is missing.',
      ],
    },
    {
      id: 'speech-brackets-t2-06', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The dinner lady frowned' },
        { text: 'at the empty tray' },
        { text: 'and muttered,' },
        { text: '"someone\'s been very greedy today!"' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Segment D starts the spoken sentence with a lowercase "someone\'s" — it needs a capital, just like any sentence: "Someone\'s been very greedy today!"',
        whyN: null,
      },
      hintSteps: [
        'Check the very first letter after the opening speech mark in segment D.',
        'A capital letter should open every spoken sentence — this one has slipped through.',
      ],
    },
    {
      id: 'speech-brackets-t2-07', tier: 2, format: 'errorspot',
      segments: [
        { text: '"we\'re not allowed pets on the trip,"' },
        { text: 'explained the driver,' },
        { text: 'as Chloe' },
        { text: 'hid her hamster.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Segment A starts the spoken sentence with a lowercase "we\'re" — spoken sentences begin with a capital, just like any other: "We\'re not allowed pets on the trip,"',
        whyN: null,
      },
      hintSteps: [
        'Check the first word inside the speech marks in segment A.',
        'This is the very start of a spoken sentence — it needs a capital letter.',
      ],
    },
    {
      id: 'speech-brackets-t2-08', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The swimming gala' },
        { text: '(delayed twice by rain' },
        { text: 'finally started' },
        { text: 'at half past two.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Segment B opens a bracket — "(delayed twice by rain" — but it\'s never closed. The extra detail needs its closing partner: "(delayed twice by rain)".',
        whyN: null,
      },
      hintSteps: [
        'Segment B has an opening bracket — check whether a closing bracket ever appears.',
        'This bracket opens its arms for the extra detail but never closes them.',
      ],
    },
    {
      id: 'speech-brackets-t2-09', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Niamh\'s project on volcanoes' },
        { text: 'won first prize' },
        { text: '(the judges loved her model' },
        { text: 'and asked questions.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Segment C opens a bracket — "(the judges loved her model" — but it never closes. Every bracket needs its matching partner: "(the judges loved her model)".',
        whyN: null,
      },
      hintSteps: [
        'Segment C has an opening bracket — track forward to see if a closing bracket ever turns up.',
        'The extra detail opens with a bracket but the hug is never finished.',
      ],
    },
    {
      id: 'speech-brackets-t2-10', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Ben\'s new football boots' },
        { text: 'squeaked loudly' },
        { text: 'on the gym floor' },
        { text: '(much to his embarrassment.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Segment D opens a bracket — "(much to his embarrassment" — but never closes it. Every bracket needs its matching partner: "(much to his embarrassment)".',
        whyN: null,
      },
      hintSteps: [
        'Segment D has an opening bracket — check whether a closing bracket ever appears before the sentence ends.',
        'This bracket opens its arms but the hug is left unfinished.',
      ],
    },
    {
      id: 'speech-brackets-t2-11', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Callum muttered,' },
        { text: '"I\'m never eating sprouts again,"' },
        { text: 'as he pushed' },
        { text: 'his plate away.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'The hug is complete: the speech marks open and close, "I\'m" starts with a capital, and the comma sits safely inside the marks. ALL CLEAN!',
        whyN: 'Every rule is followed correctly here, so there is honestly nothing to fix.',
      },
      hintSteps: [
        'Check capital at the start of the speech, punctuation inside the marks, and a proper closing mark.',
        'All three rules are followed perfectly — what is the honest answer?',
      ],
    },
    {
      id: 'speech-brackets-t2-12', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The school choir' },
        { text: '(all forty of them)' },
        { text: 'sang beautifully' },
        { text: 'at the carol service.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'The bracket opens with ( and closes with ) around the extra detail — a complete hug with nothing missing. ALL CLEAN!',
        whyN: 'The bracket here is correctly opened and closed, so there is no mistake to find.',
      },
      hintSteps: [
        'Check the bracket in segment B for both an opening AND closing half.',
        'Both halves of the bracket are present and correctly placed — is there really an error?',
      ],
    },

    // ---------- TIER 3 (10: 8 faulty + 2 N, subtlest) ----------
    {
      id: 'speech-brackets-t3-01', tier: 3, format: 'errorspot',
      segments: [
        { text: '"The match finishes at three o\'clock",' },
        { text: 'the referee confirmed,' },
        { text: 'checking his watch' },
        { text: 'one last time.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Segment A closes the hug before the comma — "The match finishes at three o\'clock", — but the comma belongs to what was said, so it must sit inside: "The match finishes at three o\'clock,"',
        whyN: null,
      },
      hintSteps: [
        'Segment A has the speech marks — look closely at exactly where the comma sits compared to the closing mark.',
        'The comma is part of the spoken sentence, so it needs to be tucked inside the hug, not left outside.',
      ],
    },
    {
      id: 'speech-brackets-t3-02', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Priya read her score' },
        { text: '"Ninety-eight out of a hundred",' },
        { text: 'and the whole class' },
        { text: 'gasped in shock.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Segment B closes the hug before the comma — "Ninety-eight out of a hundred", — but the comma belongs to the number Priya read out, so it must sit inside: "Ninety-eight out of a hundred,"',
        whyN: null,
      },
      hintSteps: [
        'Segment B has the speech marks — check exactly where the comma sits next to the closing mark.',
        'The comma is part of what was actually read out, so it needs to live inside the hug.',
      ],
    },
    {
      id: 'speech-brackets-t3-03', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Leah checked the noticeboard' },
        { text: 'and read aloud,' },
        { text: '"Non-uniform day is Friday' },
        { text: 'to the class.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Segment C opens the hug with " before "Non-uniform day is Friday" but the closing mark never comes — it needs one right after "Friday": "Non-uniform day is Friday!"',
        whyN: null,
      },
      hintSteps: [
        'Segment C opens a speech mark — check carefully whether a matching closing mark appears anywhere after it.',
        'The whole notice Leah reads needs both arms of the hug, and one is missing.',
      ],
    },
    {
      id: 'speech-brackets-t3-04', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Just before the bell,' },
        { text: 'the head teacher stood up' },
        { text: 'and announced,' },
        { text: '"Well done, everyone' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Segment D opens the hug with " before "Well done, everyone" but it\'s never closed — the head teacher\'s whole sentence needs a matching mark: "Well done, everyone!"',
        whyN: null,
      },
      hintSteps: [
        'Segment D starts a speech mark — check whether a closing mark ever appears to finish the hug.',
        'This is the very end of the sentence, and the closing arm of the hug is missing.',
      ],
    },
    {
      id: 'speech-brackets-t3-05', tier: 3, format: 'errorspot',
      segments: [
        { text: '"even the goalkeeper couldn\'t believe it,"' },
        { text: 'laughed the commentator,' },
        { text: 'replaying the save' },
        { text: 'in slow motion.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Segment A opens the spoken sentence with a lowercase "even" — it needs a capital, just like any sentence start: "Even the goalkeeper couldn\'t believe it,"',
        whyN: null,
      },
      hintSteps: [
        'Check the very first word inside the speech marks in segment A.',
        'This is the beginning of a spoken sentence — it should start with a capital letter, like any other.',
      ],
    },
    {
      id: 'speech-brackets-t3-06', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The librarian tapped the sign' },
        { text: '"quiet reading only, please,"' },
        { text: 'as two boys' },
        { text: 'kept on chatting.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'Segment B begins the spoken sentence with a lowercase "quiet" — it needs a capital, just like any sentence: "Quiet reading only, please,"',
        whyN: null,
      },
      hintSteps: [
        'Check the first word after the opening speech mark in segment B.',
        'A capital letter should begin every spoken sentence — this one has been missed.',
      ],
    },
    {
      id: 'speech-brackets-t3-07', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The school bake sale' },
        { text: 'raised two hundred pounds' },
        { text: '(a new school record' },
        { text: 'said Mrs Kelly.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'Segment C opens a bracket — "(a new school record" — but it never closes. The extra detail needs its matching partner: "(a new school record)".',
        whyN: null,
      },
      hintSteps: [
        'Segment C has an opening bracket — check whether a closing bracket appears before the sentence ends.',
        'This bracket opens for the extra fact but the hug is never completed.',
      ],
    },
    {
      id: 'speech-brackets-t3-08', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The talent show' },
        { text: 'ran two hours over' },
        { text: 'because everyone loved it' },
        { text: '(mostly because of the encores.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'Segment D opens a bracket — "(mostly because of the encores" — but it\'s never closed. Every bracket needs its matching partner: "(mostly because of the encores)".',
        whyN: null,
      },
      hintSteps: [
        'Segment D has an opening bracket — check whether a closing bracket ever turns up before the sentence ends.',
        'This bracket opens its arms for the extra detail but the hug is left unfinished.',
      ],
    },
    {
      id: 'speech-brackets-t3-09', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Callum said,' },
        { text: '"That was the best day of my life!"' },
        { text: 'as he' },
        { text: 'collected his medal.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'The hug is complete: the speech marks open and close, "That" starts with a capital, and the "!" sits safely inside the marks. ALL CLEAN!',
        whyN: 'Every rule is followed correctly here — capital, inside punctuation, and a proper close — so there is honestly nothing to fix.',
      },
      hintSteps: [
        'Check capital at the speech start, punctuation inside the marks, and a matching closing mark — all three, carefully.',
        'Every rule checks out here. What is the honest answer?',
      ],
    },
    {
      id: 'speech-brackets-t3-10', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The science trip to the planetarium' },
        { text: '(booked months in advance)' },
        { text: 'finally happened' },
        { text: 'last Tuesday.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'The bracket opens with ( and closes with ) around the extra detail — a complete hug with nothing missing. ALL CLEAN!',
        whyN: 'The bracket is correctly opened and closed here, so there is no mistake to find.',
      },
      hintSteps: [
        'Check the bracket in segment B for both an opening AND a closing half.',
        'Both halves of the bracket are present and correctly placed here — is there really an error?',
      ],
    },
  ],
};
