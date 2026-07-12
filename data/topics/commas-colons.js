// FART QUEST topic: The Comma Cavern (Punctuation Pits)
// Authored content — implementation agents: read, never modify.

const RULE = "A comma is a small pause that keeps a list or a sentence tidy; a colon announces what's coming.";

export default {
  id: 'commas-colons',
  name: 'The Comma Cavern',
  region: 'punctuation-pits',
  bankTopic: true,
  tagline: 'One slipped comma and this shifty little lizard changes what you meant entirely.',

  creature: {
    id: 'comma-chameleon',
    name: 'Comma Chameleon',
    rarity: 'rare',
    image: 'assets/monsters/comma-chameleon.png',
    bio: 'This shifty little lizard can hide anywhere in a sentence, and one slipped comma is all it takes for him to change what you meant entirely. Catch him mid-disguise before he ruins your list.',
    factSneak: 'A comma needs a pause after EVERY list item except the very last one before "and".',
  },

  weapon: {
    id: 'pause-paddle',
    name: 'The Pause Paddle',
    tagline: 'Never let a sentence run away with itself again.',
    rule: RULE,
    example: 'Whiffbeard packed <b>a peg, a torch and his pride</b> — pause, pause, no pause before "and".',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-commasco',
      text: 'Careful now, young stinker — this cave has a shapeshifter in it! The <b>Comma Chameleon</b> can hide a tiny mark ANYWHERE in a sentence, and when he does, the whole meaning changes. Today you learn to spot exactly where a pause belongs, and where a colon gets to shout "here it comes!"',
    },
    {
      type: 'show',
      title: 'Rule 1: The List Comma',
      html: `<div class="law-scroll">In a list of three or more things, put a comma after each item — except the very last one before "and".</div>
<p>Look at this: <b>Jarlath needed a peg, a nose plug and a very brave face.</b></p>
<p>Comma after "peg" (pause). Comma after "nose plug" (pause). No comma before "and a very brave face" — that's the KS2 way to write a list. Miss just ONE of those pauses and the list squashes together and gets confusing.</p>`,
    },
    {
      type: 'show',
      title: 'Rule 2: The Fronted Opener',
      html: `<div class="law-scroll">If a sentence starts with a phrase that sets the scene (Before tea, After the match, Suddenly), pause with a comma before the main action.</div>
<p><b>After the smelly cloud passed, everyone breathed out slowly.</b></p>
<p>"After the smelly cloud passed" sets the scene — it isn't the main event yet. The comma tells the reader: "pause here, the real action is coming next."</p>`,
    },
    {
      type: 'show',
      title: 'Rule 3: The Colon Announces',
      html: `<div class="law-scroll">A colon (:) stands at the door of a full sentence and announces "here it comes" before a list.</div>
<p><b>Whiffbeard packed three essentials: a peg, a torch and his pride.</b></p>
<p>"Whiffbeard packed three essentials" is a complete sentence all by itself — so the colon is allowed to open the door. Watch out though: "Whiffbeard packed:" is NOT complete on its own (packed what?), so a colon there would be a trap, not a rule!</p>`,
    },
    {
      type: 'show',
      title: 'Bonus Rule: The Semi-Colon Super-Comma',
      html: `<div class="law-scroll">A semi-colon (;) is a super-comma — it links two full sentences that are closely related, instead of starting a brand new one.</div>
<p><b>The smell was terrible; nobody dared open the window.</b></p>
<p>Both halves could stand alone as their own sentence. A plain comma is too weak a pause to hold two whole sentences together on its own — that's why a full stop or a semi-colon is needed instead.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'commas-colons-try-1', topicId: 'commas-colons', tier: 1, format: 'errorspot',
        segments: [
          { text: "Tom's lunchbox held" },
          { text: 'a sandwich crisps and an apple' },
          { text: 'ready for break' },
          { text: 'every single day.' },
        ],
        faultyIndex: 1,
        explain: {
          rule: RULE,
          worked: 'Three items in the list — sandwich, crisps, apple — need a pause between the first two: "a sandwich, crisps and an apple." No pause is needed before "and an apple."',
          whyN: null,
        },
        hintSteps: [
          'Read the list out loud. Where does your voice naturally pause between items?',
          'Count the list items: sandwich, crisps, apple. Which join is missing its comma?',
        ],
      },
    },
    {
      type: 'try',
      q: {
        id: 'commas-colons-try-2', topicId: 'commas-colons', tier: 1, format: 'errorspot',
        segments: [
          { text: 'The coach had one rule' },
          { text: 'work hard, play fair' },
          { text: 'and shake hands' },
          { text: 'after every game.' },
        ],
        faultyIndex: 0,
        explain: {
          rule: RULE,
          worked: '"The coach had one rule" is a complete sentence, so a colon can open the door to the list: "The coach had one rule:" — without it, the list just crashes straight into the sentence.',
          whyN: null,
        },
        hintSteps: [
          'Is the first part a full, complete sentence all on its own? If yes, it can announce a list.',
          'A colon stands right at the door before a list starts — check the very end of segment A.',
        ],
      },
    },
    { type: 'anim', anim: 'commas-colons' },
    { type: 'weapon' },
  ],

  tips: [
    'Lists: comma after each item except the very last one before "and".',
    'A fronted opener (After tea, Before the match, Suddenly) always gets a comma straight after it.',
    'A colon can only announce a list after a COMPLETE sentence — never mid-thought after words like "bring" or "contained" (bring WHAT?).',
    'A comma is too weak to join two whole sentences on its own — use a full stop or a semi-colon instead.',
    'A semi-colon is a super-comma: it links two closely related full sentences.',
    'Long lists hide their missing comma in the MIDDLE just as often as at the start — check every single join, not just the first.',
  ],

  bank: [
    // ---------- TIER 1 (12: 10 errors + 2 N) ----------
    {
      id: 'commas-colons-t1-01', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Wellies a raincoat and a torch' },
        { text: 'sat by the door' },
        { text: 'ready for the trip' },
        { text: 'before school.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'Three things in the list — wellies, a raincoat, a torch — need a pause after the first: "Wellies, a raincoat and a torch." No pause is needed before "and a torch."',
        whyN: null,
      },
      hintSteps: [
        'This list starts the sentence. Say the three items out loud — where does your voice pause?',
        'Wellies... a raincoat... a torch. The pause belongs straight after the first item.',
      ],
    },
    {
      id: 'commas-colons-t1-02', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Every morning Jack packs' },
        { text: 'shin pads boots and socks' },
        { text: 'into his battered bag' },
        { text: 'before school.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: 'The list is shin pads, boots, socks. A pause is needed after "shin pads": "shin pads, boots and socks." No pause before "and socks."',
        whyN: null,
      },
      hintSteps: [
        'Find the list of three things Jack packs, then read it out loud slowly.',
        'The missing pause sits between the first two items in that list.',
      ],
    },
    {
      id: 'commas-colons-t1-03', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Nana packed' },
        { text: 'a basket for him' },
        { text: 'with a chew toy a bone and a blanket' },
        { text: 'tonight.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'The list is a chew toy, a bone, a blanket. A pause is needed after "a chew toy": "a chew toy, a bone and a blanket."',
        whyN: null,
      },
      hintSteps: [
        'Find the three things in the basket and read them out loud.',
        'The pause is missing right after the very first item in that list.',
      ],
    },
    {
      id: 'commas-colons-t1-04', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Mrs Kelly needs three things' },
        { text: 'from you' },
        { text: 'a pencil, a ruler and a rubber' },
        { text: 'before break.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: '"Mrs Kelly needs three things from you" is a complete sentence, so a colon can announce the list: "from you:" A colon is missing before "a pencil, a ruler and a rubber."',
        whyN: null,
      },
      hintSteps: [
        'Is the part before the list a complete sentence on its own? If yes, it can announce the list.',
        'Check the very end of the second segment — is anything missing right there?',
      ],
    },
    {
      id: 'commas-colons-t1-05', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Dad reached in' },
        { text: 'and grinned' },
        { text: 'he had three snacks' },
        { text: 'crisps, a sandwich and an apple.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: '"He had three snacks" is a complete sentence, so it can announce the list with a colon: "he had three snacks:" That colon is missing before "crisps, a sandwich and an apple."',
        whyN: null,
      },
      hintSteps: [
        'Find the part that introduces the snacks — is it a full sentence on its own?',
        'A colon belongs right at the end of that introducing part, before the list starts.',
      ],
    },
    {
      id: 'commas-colons-t1-06', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The referee blew' },
        { text: 'the final whistle,' },
        { text: 'the whole crowd' },
        { text: 'cheered wildly.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: '"The referee blew the final whistle" and "the whole crowd cheered wildly" are both complete sentences. A comma is too weak to join them — it needs to be a semi-colon: "the final whistle;"',
        whyN: null,
      },
      hintSteps: [
        'Check if the words before AND after the mark could each stand alone as their own sentence.',
        'Two whole sentences joined together need a semi-colon or full stop, never just a comma.',
      ],
    },
    {
      id: 'commas-colons-t1-07', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The match kept going' },
        { text: 'in the rain' },
        { text: 'the crowd stayed put' },
        { text: 'it was pouring, nobody cared.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: '"It was pouring" and "nobody cared" are both complete sentences. A comma alone can’t join them — it needs to be a semi-colon: "it was pouring; nobody cared."',
        whyN: null,
      },
      hintSteps: [
        'Look at the last segment closely — is it secretly two sentences squashed together?',
        'If both halves could stand alone, the comma between them needs to be a semi-colon.',
      ],
    },
    {
      id: 'commas-colons-t1-08', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The whole team ran' },
        { text: 'onto the pitch' },
        { text: 'to celebrate together' },
        { text: 'cheering clapping and hugging' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'The list is cheering, clapping, hugging. A pause is needed after "cheering": "cheering, clapping and hugging." No pause before "and hugging."',
        whyN: null,
      },
      hintSteps: [
        'This list is at the very end of the sentence — read it out loud slowly.',
        'The pause that’s missing sits between the first two items in that list.',
      ],
    },
    {
      id: 'commas-colons-t1-09', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Crisps a squashed sandwich and a whoopee cushion' },
        { text: 'filled his bag' },
        { text: 'for the trip' },
        { text: 'on Monday.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'The list is crisps, a squashed sandwich, a whoopee cushion. A pause is needed after "Crisps": "Crisps, a squashed sandwich and a whoopee cushion."',
        whyN: null,
      },
      hintSteps: [
        'This list opens the whole sentence — say the three things out loud.',
        'The pause belongs straight after the very first word.',
      ],
    },
    {
      id: 'commas-colons-t1-10', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'The dog barked loudly' },
        { text: 'at the postman' },
        { text: 'he was scared, he ran off' },
        { text: 'every single time.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: '"He was scared" and "he ran off" are both complete sentences. A comma alone is too weak to join them — it needs to be a semi-colon: "he was scared; he ran off."',
        whyN: null,
      },
      hintSteps: [
        'This whole segment is secretly two mini sentences pushed together — spot the join.',
        'If both halves could stand alone, that comma needs to be a semi-colon instead.',
      ],
    },
    {
      id: 'commas-colons-t1-11', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Molly always packs her lunch, a drink and a snack' },
        { text: 'before school' },
        { text: 'every morning' },
        { text: 'each day.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'The list — lunch, a drink, a snack — already has its pause after "lunch," and correctly has none before "and a snack." Nothing here needs fixing.',
        whyN: 'Check the list carefully: the comma sits after "lunch" exactly where it should, and there’s no comma before "and a snack." All four segments are clean.',
      },
      hintSteps: [
        'Read the whole sentence slowly and check every list join, one at a time.',
        'The list already has its one pause in the right place — is there really a problem here?',
      ],
    },
    {
      id: 'commas-colons-t1-12', topicId: 'commas-colons', tier: 1, format: 'errorspot',
      segments: [
        { text: 'Dad packed three things:' },
        { text: 'a map, a compass and a torch' },
        { text: 'for the hike' },
        { text: 'today.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Dad packed three things" is a complete sentence, so the colon correctly announces the list, and the list itself already pauses after "a map" with no pause before "and a torch."',
        whyN: 'The colon sits after a full sentence, exactly where the rule allows it, and the list pauses are already correct. All four segments are clean.',
      },
      hintSteps: [
        'Check whether the part before the colon is a complete sentence on its own — is it?',
        'Now check the list itself for its one needed pause — has it already got it?',
      ],
    },

    // ---------- TIER 2 (12: 10 errors + 2 N) ----------
    {
      id: 'commas-colons-t2-01', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'After the final whistle' },
        { text: 'the whole crowd erupted' },
        { text: 'into loud cheering' },
        { text: 'and applause.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: '"After the final whistle" sets the scene before the main action — it needs a comma straight after it: "After the final whistle,"',
        whyN: null,
      },
      hintSteps: [
        'Does the sentence start with a phrase that sets the scene before the main action?',
        'A fronted opener like this always gets a comma right after it, before the main action begins.',
      ],
    },
    {
      id: 'commas-colons-t2-02', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Sandwiches crisps and juice' },
        { text: 'filled the picnic basket' },
        { text: 'that Mum had packed' },
        { text: 'for the whole family.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'The list is sandwiches, crisps, juice. A pause is needed after "Sandwiches": "Sandwiches, crisps and juice."',
        whyN: null,
      },
      hintSteps: [
        'This list opens the sentence — read the three items out loud.',
        'The missing pause sits between the first two items in the list.',
      ],
    },
    {
      id: 'commas-colons-t2-03', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'My favourite snacks are:' },
        { text: 'crisps, biscuits' },
        { text: 'and fizzy pop' },
        { text: 'from the shop.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: '"My favourite snacks are" is not a complete sentence on its own — it needs the list to finish it. A colon should never interrupt "are" straight before its own complement, so no colon belongs here at all.',
        whyN: null,
      },
      hintSteps: [
        'Cover up everything after the colon. Does what’s left make a complete sentence by itself?',
        '"My favourite snacks are" isn’t finished without the list — so a colon isn’t allowed there.',
      ],
    },
    {
      id: 'commas-colons-t2-04', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Just before the final whistle' },
        { text: 'blew' },
        { text: 'the whole crowd held' },
        { text: 'its breath tightly.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: '"Just before the final whistle blew" sets the scene before the main action — it needs a comma straight after "blew."',
        whyN: null,
      },
      hintSteps: [
        'Find where the scene-setting opener actually ends and the main action starts.',
        'A comma belongs right at the end of the opener, before the main action begins.',
      ],
    },
    {
      id: 'commas-colons-t2-05', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The stadium lights' },
        { text: 'flickered,' },
        { text: 'the whole crowd' },
        { text: 'gasped loudly.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: '"The stadium lights flickered" and "the whole crowd gasped loudly" are both complete sentences. A comma alone can’t join them — it needs to be a semi-colon: "flickered;"',
        whyN: null,
      },
      hintSteps: [
        'Check if both halves of this sentence could stand completely alone.',
        'Two whole sentences joined together need a semi-colon or full stop, never just a comma.',
      ],
    },
    {
      id: 'commas-colons-t2-06', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Miss Adams asked' },
        { text: 'every pupil to bring' },
        { text: 'cakes sweets and lemonade' },
        { text: 'to the stall.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'The list is cakes, sweets, lemonade. A pause is needed after "cakes": "cakes, sweets and lemonade."',
        whyN: null,
      },
      hintSteps: [
        'Find the three things pupils were asked to bring and read them aloud.',
        'The missing pause sits between the first two items in that list.',
      ],
    },
    {
      id: 'commas-colons-t2-07', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'Camp instructions were simple' },
        { text: 'and clear enough' },
        { text: 'you should bring:' },
        { text: 'a sleeping bag and a torch.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: '"You should bring" is not a complete sentence on its own — bring WHAT? The thought isn’t finished, so a colon isn’t allowed to interrupt it. No colon should follow "bring."',
        whyN: null,
      },
      hintSteps: [
        'Cover up everything after that colon. Does what’s left stand alone as a full sentence?',
        '"You should bring" is left hanging without the list — that’s the sign a colon shouldn’t be there.',
      ],
    },
    {
      id: 'commas-colons-t2-08', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The scouts filled their rucksacks' },
        { text: 'with warm layers' },
        { text: 'ready for the hike' },
        { text: 'hats scarves and gloves' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'The list is hats, scarves, gloves. A pause is needed after "hats": "hats, scarves and gloves."',
        whyN: null,
      },
      hintSteps: [
        'This list is at the very end — read the three items out loud slowly.',
        'The missing pause sits between the first two items in the list.',
      ],
    },
    {
      id: 'commas-colons-t2-09', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'The players warmed up' },
        { text: 'early that morning' },
        { text: 'before the big match' },
        { text: 'nerves were high, nobody spoke.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: '"Nerves were high" and "nobody spoke" are both complete sentences. A comma alone can’t join them — it needs to be a semi-colon: "nerves were high; nobody spoke."',
        whyN: null,
      },
      hintSteps: [
        'Look closely at the final segment — is it secretly two sentences squashed together?',
        'If both halves could stand alone, the comma between them needs to be a semi-colon.',
      ],
    },
    {
      id: 'commas-colons-t2-10', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: "Grandma's fruit bowl held" },
        { text: 'apples for snacking' },
        { text: 'ready for lunchtime' },
        { text: 'oranges pears and grapes' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'The list is oranges, pears, grapes. A pause is needed after "oranges": "oranges, pears and grapes."',
        whyN: null,
      },
      hintSteps: [
        'This list is at the very end of the sentence — say the fruits out loud.',
        'The missing pause sits between the first two items in that list.',
      ],
    },
    {
      id: 'commas-colons-t2-11', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: 'After the walk,' },
        { text: 'Sam ate crisps, a sandwich and an apple' },
        { text: 'sitting in the sun' },
        { text: 'happily.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'The fronted opener "After the walk," already has its comma, and the list — crisps, a sandwich, an apple — already pauses after "crisps" with none before "and an apple." Nothing needs fixing.',
        whyN: 'The opener has its comma and the list has its one pause exactly where the rule says it should be. All four segments are clean.',
      },
      hintSteps: [
        'Check the opener first — has it already got its comma?',
        'Now check the list — has it already got its one pause in the right spot?',
      ],
    },
    {
      id: 'commas-colons-t2-12', topicId: 'commas-colons', tier: 2, format: 'errorspot',
      segments: [
        { text: "Mum's plan was simple:" },
        { text: 'pack snacks, drinks and sun cream' },
        { text: 'ready for the beach' },
        { text: 'this weekend.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"Mum’s plan was simple" is a complete sentence, so the colon correctly announces the list, and the list itself already pauses after "snacks" with none before "and sun cream."',
        whyN: 'The colon follows a complete sentence exactly as the rule allows, and the list already has its correct pause. All four segments are clean.',
      },
      hintSteps: [
        'Check whether the part before the colon is a full sentence on its own — is it?',
        'Now check the list itself — has it already got its one needed pause?',
      ],
    },

    // ---------- TIER 3 (10: 8 errors + 2 N, subtlest traps) ----------
    {
      id: 'commas-colons-t3-01', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The bag contained:' },
        { text: 'a torch, a map' },
        { text: 'and some snacks' },
        { text: 'for the trip.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: '"The bag contained" is not a complete sentence on its own — contained WHAT? The thought isn’t finished, so no colon belongs there at all.',
        whyN: null,
      },
      hintSteps: [
        'Cover up everything after that colon. Is what’s left a complete sentence on its own?',
        '"The bag contained" is left hanging — contained WHAT? A colon can’t jump in before the sentence says what.',
      ],
    },
    {
      id: 'commas-colons-t3-02', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Pencils, rulers rubbers, glue sticks and highlighters' },
        { text: 'filled the school shop' },
        { text: 'every single week' },
        { text: 'each time.' },
      ],
      faultyIndex: 0,
      explain: {
        rule: RULE,
        worked: 'This long list has pauses after "Pencils" and after "rubbers" — but the pause between "rulers" and "rubbers" is missing. It should read "rulers, rubbers."',
        whyN: null,
      },
      hintSteps: [
        'This list has FIVE items — some pauses are already there, so check every single join.',
        'One pause is missing in the middle of the list, not at the very start.',
      ],
    },
    {
      id: 'commas-colons-t3-03', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Without any warning' },
        { text: 'at all' },
        { text: 'the fire alarm rang' },
        { text: 'loudly through school.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: '"Without any warning at all" sets the scene before the main action — the whole opener needs its comma right at the end, after "at all", which is missing here.',
        whyN: null,
      },
      hintSteps: [
        'The scene-setting opener runs across two segments — find where it actually ends.',
        'A comma belongs at the very end of that opener, right before the main action begins.',
      ],
    },
    {
      id: 'commas-colons-t3-04', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The whole class had practised' },
        { text: 'their spellings all week,' },
        { text: 'the test still felt hard' },
        { text: 'for everyone.' },
      ],
      faultyIndex: 1,
      explain: {
        rule: RULE,
        worked: '"The whole class had practised their spellings all week" and "the test still felt hard for everyone" are both complete sentences. A comma alone can’t join them — it needs to be a semi-colon.',
        whyN: null,
      },
      hintSteps: [
        'This sentence is longer, so check carefully: could both halves stand completely alone?',
        'Two whole sentences joined together need a semi-colon or a full stop, never just a comma.',
      ],
    },
    {
      id: 'commas-colons-t3-05', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'Every explorer packed' },
        { text: 'a map and torch' },
        { text: 'spare batteries a whistle and string' },
        { text: 'for the trek.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: 'The list is spare batteries, a whistle, string. A pause is needed after "spare batteries": "spare batteries, a whistle and string."',
        whyN: null,
      },
      hintSteps: [
        'Find the list of three things buried in the middle of the sentence.',
        'The missing pause sits between the first two items in that list, not the last join.',
      ],
    },
    {
      id: 'commas-colons-t3-06', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'When the bell rang,' },
        { text: 'the teacher reminded us' },
        { text: 'to bring: a pen and a ruler' },
        { text: 'today.' },
      ],
      faultyIndex: 2,
      explain: {
        rule: RULE,
        worked: '"To bring" is not a complete sentence on its own — bring WHAT? The thought isn’t finished, so a colon isn’t allowed to interrupt it there.',
        whyN: null,
      },
      hintSteps: [
        'Cover up everything after that colon. Does what’s left make sense as its own sentence?',
        '"To bring" is left hanging — bring WHAT? That unfinished feeling is the sign a colon shouldn’t sit there.',
      ],
    },
    {
      id: 'commas-colons-t3-07', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The museum gift shop sold' },
        { text: 'postcards and pencils' },
        { text: 'for every visitor' },
        { text: 'rubbers stickers and magnets' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: 'The list is rubbers, stickers, magnets. A pause is needed after "rubbers": "rubbers, stickers and magnets."',
        whyN: null,
      },
      hintSteps: [
        'This list is right at the end of the sentence — read the three items aloud.',
        'The missing pause sits between the first two items in that list.',
      ],
    },
    {
      id: 'commas-colons-t3-08', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The class waited' },
        { text: 'outside the hall' },
        { text: 'for their turn' },
        { text: 'hearts were racing, nobody spoke.' },
      ],
      faultyIndex: 3,
      explain: {
        rule: RULE,
        worked: '"Hearts were racing" and "nobody spoke" are both complete sentences. A comma alone can’t join them — it needs to be a semi-colon: "hearts were racing; nobody spoke."',
        whyN: null,
      },
      hintSteps: [
        'Look closely at the last segment — is it secretly two short sentences squashed together?',
        'If both halves could stand alone, that comma needs to be a semi-colon instead.',
      ],
    },
    {
      id: 'commas-colons-t3-09', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: "The teacher's instructions were clear:" },
        { text: 'line up, stay quiet' },
        { text: 'and wait outside' },
        { text: 'before the fire drill.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: '"The teacher’s instructions were clear" is a complete sentence, so the colon correctly announces the list, and the list itself already pauses after "line up" with none before "and wait outside."',
        whyN: 'The colon follows a complete sentence exactly as the rule allows, and the list already has its correct pause. All four segments are clean.',
      },
      hintSteps: [
        'Check whether the part before the colon is a full sentence on its own first.',
        'Now check the list — has it already got its one needed pause in the right place?',
      ],
    },
    {
      id: 'commas-colons-t3-10', topicId: 'commas-colons', tier: 3, format: 'errorspot',
      segments: [
        { text: 'The bag contained' },
        { text: 'a torch, a map and a whistle' },
        { text: 'just in case' },
        { text: 'of an emergency.' },
      ],
      faultyIndex: null,
      explain: {
        rule: RULE,
        worked: 'No colon interrupts "The bag contained" here — good, because it isn’t a complete sentence on its own. The list already pauses after "a torch" with none before "and a whistle."',
        whyN: 'The list already has its one needed pause in the right place, and no colon jumps in before the sentence has said WHAT. All four segments are clean.',
      },
      hintSteps: [
        'Check "The bag contained" — is a colon needed there, or is it correctly left out?',
        'Now check the list itself for its one pause — has it already got it right?',
      ],
    },
  ],
};
