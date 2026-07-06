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

export const TEASERS = [
  { id: 'countfather', name: 'The Countfather', rarity: 'epic', locked: true,
    hint: 'Rules the whole Number Swamp. Defeat all ten locations to make him an offer he can’t refuse.' },
  { id: 'golden-turd', name: '???', rarity: 'mythic', locked: true,
    hint: 'A legend whispered in the swamp… something golden… something magnificent…' },
  { id: 'skidmark-king', name: 'The Skidmark King', rarity: 'legendary', locked: true,
    hint: 'The source of ALL the stink. He waits in Castle Clench. You are not ready. Yet.' },
];

export const RARITY_META = {
  common:    { label: 'Common',    stars: 1, colour: '#9fb8a5' },
  rare:      { label: 'Rare',      stars: 2, colour: '#6fb7ff' },
  epic:      { label: 'Epic',      stars: 3, colour: '#b07bff' },
  legendary: { label: 'Legendary', stars: 4, colour: '#ff9b3d' },
  mythic:    { label: 'MYTHIC',    stars: 5, colour: '#F4C542' },
};
