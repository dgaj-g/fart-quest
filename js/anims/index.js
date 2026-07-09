// FART QUEST — js/anims/index.js
// Registry of Scout Report helper animations (the 'anim' lesson card type).
// One module per topic, keyed by topic id. A missing entry is never an error —
// lesson.js skips unknown anim cards so a lesson can never be blocked by one.

import decimalsX10 from './decimals-x10.js';

const anims = {
  [decimalsX10.id]: decimalsX10,
};

export default anims;
