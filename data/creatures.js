// FART QUEST creature roster (Phase 1) — authored content, do not modify.
// Bosses are defined inside their topic files; this file lists commons + teasers + registry helpers.

export const COMMONS = [
  { id: 'whiffy',   name: 'Whiffy',   rarity: 'common', image: 'assets/monsters/stinkling-1.png',
    bio: 'The smallest stinkling in the swamp. What he lacks in size he makes up for in absolutely unbelievable smell.' },
  { id: 'guffball', name: 'Guffball', rarity: 'common', image: 'assets/monsters/stinkling-2.png',
    bio: 'Perfectly round, permanently inflated, one sneeze away from disaster. Do not squeeze.' },
  { id: 'trumpet',  name: 'Trumpet',  rarity: 'common', image: 'assets/monsters/stinkling-3.png',
    bio: 'Announces his arrival from three fields away. Has never once surprised anyone.' },
  { id: 'squeaker', name: 'Squeaker', rarity: 'common', image: 'assets/monsters/stinkling-4.png',
    bio: 'Tiny, high-pitched, and always blames someone else. Classic Squeaker.' },
  { id: 'bogling',  name: 'Bogling',  rarity: 'common', image: 'assets/monsters/stinkling-5.png',
    bio: 'Lives at the bottom of the bog. The bog has asked him to leave several times.' },
  { id: 'pongle',   name: 'Pongle',   rarity: 'common', image: 'assets/monsters/stinkling-6.png',
    bio: 'Half pong, half… actually no, he’s all pong.' },
];

// Countfather deliberately does NOT appear here: he's a real, capturable region boss
// (see data/map.js number-swamp.boss) rendered by js/screens/collection.js's region-boss
// group alongside the other 9 — TEASERS is only for the two creatures with no in-game
// capture mechanic of their own (INTEGRATION_NOTES.md item 5: "Skidmark King + Golden
// Turd (locked teasers until earned)").
// Fix (CRITICAL, ownership never renderable): each teaser now carries the `image`/`bio` a
// captured plinth needs. skidmark-king IS actually grantable today (js/screens/exam.js grants
// it via ctx.state.grantCommon('skidmark-king') on a King win) — js/screens/collection.js must
// check ctx.state.commonsOwned() and render these like any other captured creature once owned,
// instead of a permanent hard lock with no ownership check at all.
export const TEASERS = [
  { id: 'golden-turd', name: '???', rarity: 'mythic', locked: true, image: 'assets/monsters/the-golden-turd.png',
    bio: 'A legend whispered in the swamp… something golden… something magnificent…',
    hint: 'A legend whispered in the swamp… something golden… something magnificent…' },
  { id: 'skidmark-king', name: 'The Skidmark King', rarity: 'legendary', locked: true, image: 'assets/monsters/the-skidmark-king.png',
    bio: 'The source of ALL the stink in Castle Clench — beaten, at last, by your own hand.',
    hint: 'The source of ALL the stink. He waits in Castle Clench. You are not ready. Yet.' },
];

export const RARITY_META = {
  common:    { label: 'Common',    stars: 1, colour: '#9fb8a5' },
  rare:      { label: 'Rare',      stars: 2, colour: '#6fb7ff' },
  epic:      { label: 'Epic',      stars: 3, colour: '#b07bff' },
  legendary: { label: 'Legendary', stars: 4, colour: '#ff9b3d' },
  mythic:    { label: 'MYTHIC',    stars: 5, colour: '#F4C542' },
};
