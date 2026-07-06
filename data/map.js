// FART QUEST world map data (Phase 1) — authored content, do not modify.
// Phase 1: Number Swamp open with 3 live locations; everything else visibly teased.

export const REGIONS = [
  {
    id: 'number-swamp', name: 'Number Swamp', open: true,
    bg: 'linear-gradient(180deg,#1E3325 0%,#2E4A33 55%,#3A5A3F 100%)',
    boss: { name: 'The Countfather', image: 'assets/monsters/countfather-silhouette.png',
            note: 'Clean all 10 locations, then face him.' },
    locations: [
      { topicId: 'place-value',  live: true },
      { topicId: 'decimals-x10', live: true },
      { topicId: 'rounding',     live: true },
      { name: 'Mental Maths Mudflats',   live: false },
      { name: 'The Written-Methods Wallow', live: false },
      { name: 'Fraction Falls',          live: false },
      { name: 'The FDP Triangle',        live: false },
      { name: 'Pattern Path',            live: false },
      { name: 'Special Number Springs',  live: false },
      { name: 'The Mystery Machine Bog', live: false },
    ],
  },
  { id: 'measure-marsh',   name: 'Measure Marsh',      open: false, closedSign: 'CLOSED — Old Farter Time overslept. Again.' },
  { id: 'shape-caves',     name: 'Shape Caves',        open: false, closedSign: 'CLOSED — The Mirror Bum is doing his hair.' },
  { id: 'money-mines',     name: 'Money Mines',        open: false, closedSign: 'CLOSED — The Penny Pincher pinched the key.' },
  { id: 'chance-cliffs',   name: 'Chance Cliffs',      open: false, closedSign: 'CLOSED — 50% chance of opening tomorrow. Maybe.' },
  { id: 'data-dump',       name: 'The Data Dump',      open: false, closedSign: 'CLOSED — Graf is still counting the rubbish.' },
  { id: 'punctuation-pits',name: 'Punctuation Pits',   open: false, closedSign: 'CLOSED, until further notice…!?' },
  { id: 'spelling-sewers', name: 'The Spelling Sewers',open: false, closedSign: 'CLOSED — blocked by a rogue “necessery”.' },
  { id: 'grammar-grotto',  name: 'Grammar Grotto',     open: false, closedSign: 'CLOSED — it done broke. It IS broke. Hmm.' },
  { id: 'storybog',        name: 'Storybog',           open: false, closedSign: 'CLOSED — Lord Waffle won’t stop talking.' },
];

export const CASTLE = {
  id: 'castle-clench', name: 'Castle Clench', open: false,
  sign: 'The Skidmark King waits inside. Train first, hero — this door opens when enough of the kingdom is clean.',
};
