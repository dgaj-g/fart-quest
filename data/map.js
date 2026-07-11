// FART QUEST world map data (v2 — full 10-region kingdom)
// Authored content. Locations use the EXACT topic ids from docs/ROSTER.md.
// A location is only ever "live" at runtime if its topicId is present in the
// data/topics/index.js registry — screens must derive liveness from the
// registry, never trust a static flag here (this file carries none).
//
// Track unlock rule (UPDATED 11 Jul 2026, Damien's call — supersedes ENGINE_SPEC_2
// §G's 2-capture rule): two tracks start open — Number Swamp (maths) and
// Punctuation Pits (english). Each subsequent region in a track unlocks only when
// the PREVIOUS region in that track is CLEANSED — every topic captured AND its
// region boss defeated — so the boss is literally the key to the next path (the
// stronger incentive Damien wanted). Enforced in js/screens/map.js
// computeUnlocked(); `unlockNeeded` below is legacy and no longer read.
// `unlockAfter: null` = track starter, always open. Boss image slugs follow <creature-name-kebab>.png (apostrophes
// and punctuation stripped, "the" kept where it's part of the name) — see
// docs/ROSTER.md. Region render order below is deliberately maths-track then
// english-track then Castle Clench, matching ENGINE_SPEC_2 §G's stated order.

export const REGIONS = [
  // ---------------------------------------------------------------- MATHS TRACK
  {
    id: 'number-swamp', name: 'Number Swamp', track: 'maths', unlockAfter: null, unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#1E3325 0%,#2E4A33 55%,#3A5A3F 100%)', accent: '#7BC950' },
    closedSign: 'CLOSED — Old Farter Time overslept. Again.',
    boss: { name: 'The Countfather', image: 'assets/monsters/the-countfather.png',
            note: 'Clean all 10 locations, then face him.',
            bio: 'Rules every last digit in the Number Swamp from a soggy armchair — and when The Countfather makes you an offer, it\'s always a number, and you\'d best accept it.' },
    locations: [
      { topicId: 'place-value',      name: 'Place Value Palace',          creatureName: 'Baron Bumdigit' },
      { topicId: 'decimals-x10',     name: 'The Slide-o-Matic Swamp',     creatureName: 'Pointy McPoopants' },
      { topicId: 'rounding',         name: 'Catapult Hill',               creatureName: 'Sir Roundbottom' },
      { topicId: 'mental-maths',     name: 'Mental Maths Mudflats',       creatureName: 'Splatrick the Swift' },
      { topicId: 'written-methods',  name: 'The Written-Methods Wallow',  creatureName: "Borrowin' Barry" },
      { topicId: 'fractions',        name: 'Fraction Falls',              creatureName: 'Halfbottom the Divided' },
      { topicId: 'fdp',              name: 'The FDP Triangle',            creatureName: 'Percy Percent' },
      { topicId: 'sequences',        name: 'Pattern Path',                creatureName: 'The Sequel' },
      { topicId: 'special-numbers',  name: 'Special Number Springs',      creatureName: 'Prime Slime' },
      { topicId: 'machines-mystery', name: 'The Mystery Machine Bog',     creatureName: 'Backwards Bertha' },
    ],
  },
  {
    id: 'measure-marsh', name: 'Measure Marsh', track: 'maths', unlockAfter: 'number-swamp', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#122A2C 0%,#1D4245 55%,#295B5E 100%)', accent: '#5FD6D0' },
    closedSign: 'CLOSED — Old Farter Time overslept. Again.',
    boss: { name: 'Old Farter Time', image: 'assets/monsters/old-farter-time.png',
            note: 'Clean all of Measure Marsh, then face him.',
            bio: 'Ancient beyond counting and permanently, dramatically gassy, he has run every clock in Measure Marsh for a thousand years — and insists, loudly, that it is NOT roasting in here.' },
    locations: [
      { topicId: 'metric-units', name: 'The Converting Pools',    creatureName: 'Centi-Peed' },
      { topicId: 'clocks-time',  name: 'Tick-Tock Hollow',        creatureName: 'The Minute Muncher' },
      { topicId: 'timetables',   name: 'The Timetable Terminus',  creatureName: 'Bus-Conductor Bogface' },
      { topicId: 'temperature',  name: "Freezer Geezer's Fridge", creatureName: 'Freezer Geezer' },
      { topicId: 'perimeter',    name: "The Prowler's Fence",     creatureName: 'The Perimeter Prowler' },
      { topicId: 'area-volume',  name: 'The Filling Fields',      creatureName: 'Cubby McSquareface' },
      { topicId: 'scale-maps',   name: 'The Shrunken Shore',      creatureName: 'The Shrinkler' },
    ],
  },
  {
    id: 'money-mines', name: 'Money Mines', track: 'maths', unlockAfter: 'measure-marsh', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#2E2410 0%,#4A3A14 55%,#63501B 100%)', accent: '#F4C542' },
    closedSign: 'CLOSED — The Penny Pincher pinched the key.',
    boss: { name: 'The Penny Pincher', image: 'assets/monsters/the-penny-pincher.png',
            note: 'Clean all of Money Mines, then face him.',
            bio: 'A gigantic crab who has never once knowingly overpaid for anything — his claws pinch pennies quite literally, and he never lets a single one go.' },
    locations: [
      { topicId: 'money-problems', name: 'The Bargain Basement', creatureName: 'Skinty McGrabhands' },
      { topicId: 'change-coins',   name: 'The Change Chute',      creatureName: 'The Changeling' },
    ],
  },
  {
    id: 'shape-caves', name: 'Shape Caves', track: 'maths', unlockAfter: 'money-mines', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#241530 0%,#3A2350 55%,#4E2F6B 100%)', accent: '#B07BFF' },
    closedSign: 'CLOSED — The Mirror Bum is doing his hair.',
    boss: { name: 'The Mirror Bum', image: 'assets/monsters/the-mirror-bum.png',
            note: 'Clean all of Shape Caves, then face him.',
            bio: 'His bum, remarkably, IS a mirror — and he is so deeply, insufferably proud of it that he has never once considered wearing trousers.' },
    locations: [
      { topicId: 'shapes-2d',     name: 'Polygon Parlour',       creatureName: 'Polly Gone' },
      { topicId: 'shapes-3d',     name: 'The Solid Cellar',      creatureName: 'Sir Facelot' },
      { topicId: 'angles-lines',  name: 'The Acute Corner',      creatureName: 'Obtusius' },
      { topicId: 'turns-compass', name: 'The Spinning Chamber',  creatureName: 'Wrong-Way Wanda' },
      { topicId: 'coordinates',   name: 'The Grid Grotto',       creatureName: 'Gridlock' },
      { topicId: 'symmetry',      name: 'The Hall of Mirrors',   creatureName: 'Reflecto' },
    ],
  },
  {
    id: 'data-dump', name: 'The Data Dump', track: 'maths', unlockAfter: 'shape-caves', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#2E1A10 0%,#4A2A16 55%,#6B3B1D 100%)', accent: '#E08A3D' },
    closedSign: 'CLOSED — Graf is still counting the rubbish.',
    boss: { name: 'Graf the Chart Goblin', image: 'assets/monsters/graf-the-chart-goblin.png',
            note: 'Clean all of The Data Dump, then face him.',
            bio: 'Hoards data the way other goblins hoard gold, and will personally check that every single axis starts at zero — he checked, he checked, HE CHECKED.' },
    locations: [
      { topicId: 'graphs-charts', name: 'Bar Chart Alley',   creatureName: 'Barry Chart' },
      { topicId: 'tables-tally',  name: 'The Tally Tip',     creatureName: 'Tally Wally' },
      { topicId: 'pie-charts',    name: 'The Pie Bakery',    creatureName: 'Pie-Face' },
      { topicId: 'mean-range',    name: 'The Average Alley', creatureName: 'The Meanie' },
    ],
  },
  {
    id: 'chance-cliffs', name: 'Chance Cliffs', track: 'maths', unlockAfter: 'data-dump', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#101B2E 0%,#1A2C4A 55%,#233C63 100%)', accent: '#5B8CFF' },
    closedSign: 'CLOSED — 50% chance of opening. Maybe.',
    boss: { name: 'Fifty-Fifty Fred', image: 'assets/monsters/fifty-fifty-fred.png',
            note: 'Clean all of Chance Cliffs, then face him.',
            bio: 'Flips a coin for absolutely every decision he has ever made, including breakfast, bedtime, and whether today is even Tuesday.' },
    locations: [
      { topicId: 'probability', name: 'The Maybe Ledge', creatureName: 'Maybe-Marvin' },
    ],
  },

  // -------------------------------------------------------------- ENGLISH TRACK
  {
    id: 'punctuation-pits', name: 'Punctuation Pits', track: 'english', unlockAfter: null, unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#101326 0%,#1C2140 55%,#272E58 100%)', accent: '#8FA0FF' },
    closedSign: 'CLOSED, until further notice…!?',
    boss: { name: 'Captain Apostrophe Catastrophe', image: 'assets/monsters/captain-apostrophe-catastrophe.png',
            note: 'Clean all of Punctuation Pits, then face him.',
            bio: 'A pirate captain whose treasure map is riddled with rogue apostrophe\'s — sorry, apostrophes — in every single wrong place imaginable.' },
    locations: [
      { topicId: 'capitals-endmarks', name: 'Full Stop Quarry',    creatureName: 'Full-Stop Phil' },
      { topicId: 'commas-colons',     name: 'The Comma Cavern',    creatureName: 'Comma Chameleon' },
      { topicId: 'apostrophes',       name: "It's-Its Junction",   creatureName: "It's-Its the Confused" },
      { topicId: 'speech-brackets',   name: 'The Quote Quarry',    creatureName: 'The Air-Quoter' },
    ],
  },
  {
    id: 'spelling-sewers', name: 'The Spelling Sewers', track: 'english', unlockAfter: 'punctuation-pits', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#182A16 0%,#264322 55%,#345A2D 100%)', accent: '#9ED65C' },
    closedSign: 'CLOSED — blocked by a rogue "necessery".',
    boss: { name: "The There-Their-They're Wolf", image: 'assets/monsters/the-there-their-theyre-wolf.png',
            note: 'Clean all of The Spelling Sewers, then face him.',
            bio: "A shapeshifting wolf who wears three disguises — there, their, they're — and always, ALWAYS gets one tiny detail almost, but not quite, right." },
    locations: [
      { topicId: 'spelling-rules', name: 'The Rule Pipes',        creatureName: 'I-Before-E-leen' },
      { topicId: 'homophones',     name: 'Soundalike Sluice',     creatureName: 'Two-Too the Twinned' },
      { topicId: 'tricky-words',   name: 'The Unspellable Sump',  creatureName: 'Neccessarry the Unspellable' },
    ],
  },
  {
    id: 'grammar-grotto', name: 'Grammar Grotto', track: 'english', unlockAfter: 'spelling-sewers', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#2A2412 0%,#453B1C 55%,#5E5127 100%)', accent: '#D9C24A' },
    closedSign: 'CLOSED — it done broke. It IS broke. Hmm.',
    boss: { name: 'Grammazilla', image: 'assets/monsters/grammazilla.png',
            note: 'Clean all of Grammar Grotto, then face her.',
            bio: 'Enormous, scaly, and utterly terrifying — right up until she pauses mid-rampage to correct your grammar, then calmly resumes roaring.' },
    locations: [
      { topicId: 'parts-of-speech',      name: 'The Noun Kennels',   creatureName: 'The Noun Hound' },
      { topicId: 'tenses',               name: "Yesterday's Cave",   creatureName: "Yesterday's Gary" },
      { topicId: 'contractions',         name: 'The Squeeze Passage', creatureName: "Could've Colin" },
      { topicId: 'plurals-collectives',  name: 'The Geese Precinct', creatureName: 'The Geese Police' },
      { topicId: 'comparatives',         name: 'The Goodest Bit',    creatureName: 'The Goodest Boy' },
      { topicId: 'sentence-parts',       name: 'Paragraph Pass',     creatureName: 'Paragraph Pete' },
    ],
  },
  {
    id: 'storybog', name: 'Storybog', track: 'english', unlockAfter: 'grammar-grotto', unlockNeeded: 2,
    palette: { band: 'linear-gradient(180deg,#241A2C 0%,#392844 55%,#4C3860 100%)', accent: '#C9A6E0' },
    closedSign: "CLOSED — Lord Waffle won't stop talking.",
    boss: { name: 'Lord Waffle', image: 'assets/monsters/lord-waffle.png',
            note: 'Clean all of Storybog, then face him.',
            bio: 'Buries every single point he has ever made under an avalanche of endless, meandering words — getting him to actually finish a sentence is the real final battle.' },
    locations: [
      { topicId: 'reading-detective', name: 'The Clue Shallows',    creatureName: 'Inspector Sniff' },
      { topicId: 'between-lines',     name: 'Nudge-Nudge Narrows',  creatureName: 'Nudge-Nudge Ned' },
      { topicId: 'words-in-context',  name: 'Synonym Springs',      creatureName: 'Synonym Sinead' },
      { topicId: 'writers-tricks',    name: 'Simile Slough',        creatureName: 'Simile Emily' },
      { topicId: 'poetry',            name: 'The Rhyme Reeds',      creatureName: 'Rhymin’ Simon' },
      { topicId: 'kinds-of-writing',  name: 'The Signpost Shelf',   creatureName: 'Contents McIndex' },
    ],
  },
];

// Back-compat: js/screens/battle.js (battle-ext agent) still reads `region.bg`
// for the arena background (topic battles + region-boss battles) — keep it in
// sync with the v2 palette rather than making that file re-derive it.
REGIONS.forEach((r) => { r.bg = r.palette.band; });

export const CASTLE = {
  id: 'castle-clench', name: 'Castle Clench', open: false,
  sign: 'The Skidmark King waits inside. Train first, hero — this door opens when enough of the kingdom is clean.',
};
