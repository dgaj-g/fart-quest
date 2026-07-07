// FART QUEST topic: The Goodest Bit (Grammar Grotto)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'comparatives',
  name: 'The Goodest Bit',
  region: 'grammar-grotto',
  bankTopic: true,
  tagline: 'The Goodest Boy is convinced he is “the most goodest dog” in the whole swamp. That sentence breaks two rules at once.',

  creature: {
    id: 'goodest-boy',
    name: 'The Goodest Boy',
    rarity: 'rare',
    image: 'assets/monsters/the-goodest-boy.png',
    bio: 'The Goodest Boy is a very good dog who has never once used a comparative correctly. He is not the goodest — but he might, with your help, become the better one.',
    factSneak: 'Comparing TWO things needs -er or “more”; three or more needs -est or “most” — and you never use both endings on the same word, no matter how much this dog insists.',
  },

  weapon: {
    id: 'er-est-ladder',
    name: 'The -Er/-Est Ladder',
    tagline: 'Climb the right rung and you will never stack a crime again.',
    rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
    example: 'Jarlath is <b>faster</b> than Whiffbeard (comparing TWO). Jarlath is the <b>fastest</b> runner in the whole class (comparing THREE OR MORE).',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-comparat',
      text: 'Woof! Er — sorry, my nose-soldier, that was The Goodest Boy again. He just told me, and I quote, that he is “the most goodest dog” in the whole swamp. There is a crime hiding inside that sentence. By the end of this lesson, YOU will be the one who catches it!',
    },
    {
      type: 'show',
      title: 'Comparing TWO Things',
      html: `<p>When you compare exactly <b>TWO</b> things, add <b>-er</b> to a short word, or use <b>more</b> in front of a longer word.</p>
<p>“Jarlath’s new bike is <b>faster</b> than his old one.” (short word: fast → fast<b>er</b>)</p>
<p>“This maths test was <b>more difficult</b> than the spelling test.” (long word: use MORE instead of squeezing on an ending)</p>
<div class="law-scroll">📜 TWO things being compared = -er (or “more” for longer words).</div>`,
    },
    {
      type: 'show',
      title: 'Comparing THREE OR MORE Things',
      html: `<p>When you compare <b>THREE OR MORE</b> things, add <b>-est</b>, or use <b>most</b> in front of a longer word.</p>
<p>“Out of all the players in the tournament, Whiffbeard is the <b>smelliest</b>.” (short word: smelly → smell<b>iest</b>)</p>
<p>“That was the <b>most exciting</b> game of the whole season.” (long word: use MOST)</p>
<div class="law-scroll">📜 THREE OR MORE things being compared = -est (or “most” for longer words).</div>`,
    },
    {
      type: 'talk',
      text: 'But watch out, young stinker — a couple of cheeky words refuse to follow ANY of those rules. They transform completely into brand new words!',
    },
    {
      type: 'show',
      title: 'The Irregular Ladder',
      html: `<p><b>Good</b> and <b>bad</b> don’t play by the rules — they climb their own private ladder:</p>
<ul>
<li><b>good → better → best</b> — “This goal was <b>better</b> than my last one. That was the <b>best</b> save Whiffbeard has ever made.”</li>
<li><b>bad → worse → worst</b> — “Today’s pong is <b>worse</b> than yesterday’s. This is the <b>worst</b> smell in the whole kingdom.”</li>
</ul>
<div class="law-scroll">📜 good→better→best and bad→worse→worst NEVER take -er or -est. Learn them like a magic spell.</div>`,
    },
    {
      type: 'show',
      title: 'The “Most Goodest” Crime',
      html: `<p>Here is The Goodest Boy’s tragic flaw: he says he is “the <b>most goodest</b> dog.” That’s TWO comparing words doing the SAME job at once — a crime! Never stack -er/-est together WITH more/most on one word.</p>
<p>One more trap: use <b>fewer</b> for things you can COUNT (“fewer sausages”), and <b>less</b> for things you can’t (“less gravy”).</p>
<div class="law-scroll">📜 Never both at once. Countable things = fewer. Uncountable stuff = less.</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'comp-try-1', topicId: 'comparatives', tier: 1, format: 'clozebox',
        stemParts: ['Jarlath’s kite flew ', ' than Whiffbeard’s kite at the school fair today.'],
        options: [
          { text: 'higher', misconception: null },
          { text: 'more high', misconception: 'more-not-needed' },
          { text: 'highest', misconception: 'wrong-degree-two-not-three' },
          { text: 'highter', misconception: 'spelling-slip' },
          { text: 'more higher', misconception: 'double-comparative' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Count how many kites are being compared — just two, Jarlath’s and Whiffbeard’s.',
          'High is a short word, so it just takes -er on its own: higher.',
        ],
        explain: {
          rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
          worked: 'Comparing exactly TWO kites needs -er. High is a short word: higher.',
          whyWrong: {
            'more high': 'High is a short word — it takes -er itself; it doesn’t need “more” as well.',
            'highest': 'That’s for THREE OR MORE kites — here it’s only two.',
            'highter': 'High doesn’t double any letters or change spelling — just add -er: higher.',
            'more higher': 'That stacks “more” with -er on the same word — pick just one.',
          },
        },
      },
    },
    {
      type: 'try',
      q: {
        id: 'comp-try-2', topicId: 'comparatives', tier: 2, format: 'mcq5',
        stem: 'Jarlath and Whiffbeard each rode a rollercoaster. Which sentence compares the two rides correctly?',
        options: [
          { text: 'The second ride was wobblier than the first.', misconception: null },
          { text: 'The second ride was more wobblier than the first.', misconception: 'double-comparative' },
          { text: 'The second ride was wobbliest than the first.', misconception: 'wrong-degree-two-not-three' },
          { text: 'The second ride was wobbly than the first.', misconception: 'missing-ending' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Only TWO rides are being compared here, so look for a single -er ending.',
          'Wobbly is a short word: swap the y for an i and add -er: wobblier.',
        ],
        explain: {
          rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
          worked: 'Comparing exactly TWO rides needs -er. Wobbly swaps its y for an i: wobblier.',
          whyWrong: {
            'The second ride was more wobblier than the first.': 'That stacks “more” with -er on the same word — pick just one.',
            'The second ride was wobbliest than the first.': '“Than” always compares TWO things — wobbliest is for three or more.',
            'The second ride was wobbly than the first.': 'Comparing two things needs the -er ending — “wobbly” alone doesn’t do the comparing job.',
          },
        },
      },
    },
    { type: 'weapon' },
  ],

  tips: [
    'Comparing exactly TWO things → -er (short word) or “more” (long word): faster, more careful.',
    'Comparing THREE OR MORE things → -est (short word) or “most” (long word): fastest, most careful.',
    'Good breaks every rule: good → better → best. Never say “gooder”, “goodest” or “more good”.',
    'Bad breaks every rule too: bad → worse → worst. Never say “badder”, “baddest” or “more bad”.',
    'NEVER stack two comparing methods on one word — “more better” and “most goodest” are both crimes.',
    'Fewer is for things you can COUNT one by one (fewer biscuits); less is for things you can’t (less mud).',
    'Watch the spelling changes: double the final letter (big → bigger), swap y for i (funny → funnier), or drop a silent e (safe → safer) before adding -er/-est.',
  ],

  bank: [
    // ============== TIER 1 (10) — straightforward -er/-est, good/bad irregulars, more/most ==============
    {
      id: 'comparatives-t1-01', tier: 1, format: 'clozebox',
      stemParts: ['Jarlath’s football boots are ', ' than Whiffbeard’s after the match.'],
      options: [
        { text: 'muddier', misconception: null },
        { text: 'mudier', misconception: 'spelling-slip' },
        { text: 'more muddy', misconception: 'more-not-needed' },
        { text: 'muddiest', misconception: 'superlative-for-comparative' },
        { text: 'muddyer', misconception: 'spelling-slip' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Count how many things are being compared here — just the two pairs of boots.',
        'Muddy is a short word: drop the y, add -ier.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Comparing exactly TWO pairs of boots needs -er. Muddy drops its y and takes -ier: muddier.',
        whyWrong: {
          mudier: 'Muddy already has two d’s — don’t lose one when you add the ending.',
          'more muddy': 'Muddy is a short word — it takes -ier itself; it doesn’t need “more” as well.',
          muddiest: 'That’s for THREE OR MORE things — here it’s only two pairs of boots.',
          muddyer: 'A short word ending in y swaps the y for an i before adding -er.',
        },
      },
    },
    {
      id: 'comparatives-t1-02', tier: 1, format: 'clozebox',
      stemParts: ['The old rope bridge felt ', ' than the new one Whiffbeard built.'],
      options: [
        { text: 'safer', misconception: null },
        { text: 'saferer', misconception: 'double-suffix' },
        { text: 'more safe', misconception: 'more-not-needed' },
        { text: 'safest', misconception: 'superlative-for-comparative' },
        { text: 'safeer', misconception: 'spelling-slip' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Count how many bridges are being compared — just the old one and the new one.',
        'Safe is short: drop the silent e, then add -er.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Safe is short: drop the silent e, add -er: safer.',
        whyWrong: {
          saferer: 'That adds -er twice — safer already has one ending; it doesn’t need another.',
          'more safe': 'Safe is a short word — it takes -er itself; it doesn’t need “more” as well.',
          safest: 'That’s for THREE OR MORE things — here it’s comparing just two bridges.',
          safeer: 'Drop the silent e before adding -er: safe → safer, not safeer.',
        },
      },
    },
    {
      id: 'comparatives-t1-03', tier: 1, format: 'clozebox',
      stemParts: ['Out of all ten stinklings hiding in the swamp, this one is the ', '.'],
      options: [
        { text: 'smelliest', misconception: null },
        { text: 'smellier', misconception: 'comparative-for-superlative' },
        { text: 'most smelly', misconception: 'more-not-needed' },
        { text: 'smellyest', misconception: 'spelling-slip' },
        { text: 'more smelliest', misconception: 'double-superlative' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ten stinklings means THREE OR MORE, not just two.',
        'Smelly is short: drop the y, add -iest.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Ten stinklings is THREE OR MORE — short word smelly drops its y and takes -iest: smelliest.',
        whyWrong: {
          smellier: 'That compares just TWO things — here we’re picking the smelliest of TEN.',
          'most smelly': 'Smelly is a short word — it takes -iest itself; it doesn’t need “most” as well.',
          smellyest: 'A short word ending in y swaps the y for an i before adding -est.',
          'more smelliest': 'That stacks “more” with an -iest ending on the same word — pick just one.',
        },
      },
    },
    {
      id: 'comparatives-t1-04', tier: 1, format: 'clozebox',
      stemParts: ['Jarlath’s second goal today was ', ' than his first attempt.'],
      options: [
        { text: 'better', misconception: null },
        { text: 'gooder', misconception: 'wrong-irregular' },
        { text: 'more good', misconception: 'wrong-irregular-more' },
        { text: 'best', misconception: 'wrong-degree-superlative-for-two' },
        { text: 'more better', misconception: 'double-comparative' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Good breaks the rules completely — it doesn’t take -er or “more”.',
        'Good → better → best. Comparing two goals needs the middle rung: better.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Good breaks every rule: good → better → best. Two goals compared needs better.',
        whyWrong: {
          gooder: 'Good never takes -er — it transforms completely into better.',
          'more good': 'Good never takes “more” either — it transforms into better.',
          best: 'Best is for THREE OR MORE — here it’s just two goals.',
          'more better': 'That stacks two comparing words on one job — pick just ONE: better.',
        },
      },
    },
    {
      id: 'comparatives-t1-05', tier: 1, format: 'clozebox',
      stemParts: ['That was the ', ' goal Whiffbeard has ever seen him score.'],
      options: [
        { text: 'best', misconception: null },
        { text: 'goodest', misconception: 'wrong-irregular' },
        { text: 'most good', misconception: 'wrong-irregular-more' },
        { text: 'better', misconception: 'wrong-degree-comparative-for-many' },
        { text: 'most best', misconception: 'double-superlative' },
      ],
      correctIndex: 0,
      hintSteps: [
        '“Ever seen” means comparing against EVERY goal, not just one other.',
        'Good → better → best. The top rung for three-or-more is best.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Comparing against every goal ever (three or more) needs the top of the irregular ladder: best.',
        whyWrong: {
          goodest: 'Good never takes -est — it transforms completely into best.',
          'most good': 'Good never takes “most” either — it transforms into best.',
          better: 'Better is for comparing just TWO things — this is against every goal ever scored.',
          'most best': 'That stacks two comparing words on one job — best already does it alone.',
        },
      },
    },
    {
      id: 'comparatives-t1-06', tier: 1, format: 'clozebox',
      stemParts: ['Today’s smell drifting from the bins is ', ' than yesterday’s.'],
      options: [
        { text: 'worse', misconception: null },
        { text: 'badder', misconception: 'wrong-irregular' },
        { text: 'more bad', misconception: 'wrong-irregular-more' },
        { text: 'worst', misconception: 'wrong-degree-superlative-for-two' },
        { text: 'more worse', misconception: 'double-comparative' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Bad breaks the rules too — it doesn’t take -er or “more”.',
        'Bad → worse → worst. Comparing two days needs the middle rung: worse.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Bad breaks every rule: bad → worse → worst. Comparing two days needs worse.',
        whyWrong: {
          badder: 'Bad never takes -er — it transforms completely into worse.',
          'more bad': 'Bad never takes “more” either — it transforms into worse.',
          worst: 'That’s for THREE OR MORE — here it’s just two days.',
          'more worse': 'That stacks two comparing words on one job — pick just ONE: worse.',
        },
      },
    },
    {
      id: 'comparatives-t1-07', tier: 1, format: 'clozebox',
      stemParts: ['This is the ', ' pong the whole kingdom has ever suffered.'],
      options: [
        { text: 'worst', misconception: null },
        { text: 'baddest', misconception: 'wrong-irregular' },
        { text: 'most bad', misconception: 'wrong-irregular-more' },
        { text: 'worse', misconception: 'wrong-degree-comparative-for-many' },
        { text: 'most worst', misconception: 'double-superlative' },
      ],
      correctIndex: 0,
      hintSteps: [
        '“Ever suffered” means comparing against EVERY pong, not just one.',
        'Bad → worse → worst. The top rung for three-or-more is worst.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Comparing against every pong ever suffered (three or more) needs worst.',
        whyWrong: {
          baddest: 'Bad never takes -est — it transforms completely into worst.',
          'most bad': 'Bad never takes “most” either — it transforms into worst.',
          worse: 'Worse is for comparing just TWO things — this is against every pong ever.',
          'most worst': 'That stacks two comparing words on one job — worst already does it alone.',
        },
      },
    },
    {
      id: 'comparatives-t1-08', tier: 1, format: 'clozebox',
      stemParts: ['This escape-room puzzle is ', ' than the last one Jarlath solved.'],
      options: [
        { text: 'more difficult', misconception: null },
        { text: 'difficulter', misconception: 'wrong-suffix-long-word' },
        { text: 'difficultest', misconception: 'wrong-suffix-and-degree' },
        { text: 'more difficulter', misconception: 'double-comparative' },
        { text: 'most difficult', misconception: 'wrong-degree-superlative-for-two' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Difficult is a long word — long words don’t take -er or -est.',
        'Only TWO puzzles are compared here, so use “more” in front: more difficult.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Difficult is a long word comparing just TWO puzzles — long words use MORE: more difficult.',
        whyWrong: {
          difficulter: 'Long words like difficult don’t take -er — use “more” instead.',
          difficultest: 'That mixes a superlative ending onto a long word for only TWO puzzles — a slip on two counts.',
          'more difficulter': 'That stacks “more” with an -er-style ending on the same word — pick just one.',
          'most difficult': 'Most is for THREE OR MORE — here it’s just two puzzles.',
        },
      },
    },
    {
      id: 'comparatives-t1-09', tier: 1, format: 'mcq5',
      stem: 'Which word correctly completes: “Out of the whole team, Jarlath is the ___ player”?',
      options: [
        { text: 'fastest', misconception: null },
        { text: 'faster', misconception: 'wrong-degree-comparative-for-many' },
        { text: 'most fast', misconception: 'more-not-needed' },
        { text: 'fastiest', misconception: 'spelling-slip' },
      ],
      correctIndex: 0,
      hintSteps: [
        '“The whole team” means THREE OR MORE players, not just two.',
        'Fast is short: just add -est, no y to change first.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Fast is short: comparing against the WHOLE team (three or more) needs -est: fastest.',
        whyWrong: {
          faster: 'That’s for comparing just TWO players — here it’s the whole team.',
          'most fast': 'Fast is a short word — it takes -est itself; it doesn’t need “most” as well.',
          fastiest: 'Fast doesn’t end in y, so there’s no y-to-i swap — just add -est: fastest.',
        },
      },
    },
    {
      id: 'comparatives-t1-10', tier: 1, format: 'mcq5',
      stem: 'Which sentence correctly compares Jarlath’s two pet snails?',
      options: [
        { text: 'Speedy is faster than Slowpoke.', misconception: null },
        { text: 'Speedy is more faster than Slowpoke.', misconception: 'double-comparative' },
        { text: 'Speedy is fastest than Slowpoke.', misconception: 'wrong-degree-superlative-with-than' },
        { text: 'Speedy is fast than Slowpoke.', misconception: 'missing-ending' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Only TWO snails are being compared — Speedy and Slowpoke.',
        'A short word comparing two things just adds -er: faster.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Comparing exactly TWO snails needs the comparative form -er: faster.',
        whyWrong: {
          'Speedy is more faster than Slowpoke.': 'That stacks “more” with -er on the same word — a double comparative crime.',
          'Speedy is fastest than Slowpoke.': '“Than” always compares TWO things — fastest is for three or more.',
          'Speedy is fast than Slowpoke.': 'Comparing two things needs the -er ending — “fast” alone doesn’t do the comparing job.',
        },
      },
    },

    // ============== TIER 2 (10) — fewer/less judgement, "more better" crime spotting, subtler contexts ==============
    {
      id: 'comparatives-t2-01', tier: 2, format: 'clozebox',
      stemParts: ['There are ', ' chocolate biscuits left in the tin than this morning.'],
      options: [
        { text: 'fewer', misconception: null },
        { text: 'less', misconception: 'countable-uncountable-confusion' },
        { text: 'more few', misconception: 'wrong-form' },
        { text: 'lesser', misconception: 'wrong-form-rank-not-amount' },
        { text: 'fewest', misconception: 'wrong-degree-superlative-for-two' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Can you count biscuits one by one? Yes — so it needs the countable word.',
        'Countable things use fewer, not less.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Biscuits can be COUNTED one by one — countable nouns use fewer.',
        whyWrong: {
          less: 'Less is for things you can’t count individually — biscuits can be counted, so fewer is needed.',
          'more few': 'That’s not a real comparative form — few becomes fewer, it doesn’t take “more” in front.',
          lesser: 'Lesser means “smaller in importance”, not “a smaller amount of countable things”.',
          fewest: 'That’s for comparing THREE OR MORE groups — here it’s just today against this morning.',
        },
      },
    },
    {
      id: 'comparatives-t2-02', tier: 2, format: 'clozebox',
      stemParts: ['There was ', ' mud on the pitch after the sun came out.'],
      options: [
        { text: 'less', misconception: null },
        { text: 'fewer', misconception: 'countable-uncountable-confusion' },
        { text: 'lesser', misconception: 'wrong-form-rank-not-amount' },
        { text: 'more little', misconception: 'wrong-form' },
        { text: 'least', misconception: 'wrong-degree-superlative-for-two' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Can you count mud one lump at a time? No — it’s an amount, not separate items.',
        'Uncountable things use less, not fewer.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Mud can’t be counted one-by-one — uncountable nouns use less.',
        whyWrong: {
          fewer: 'Fewer is for things you CAN count individually — mud is uncountable, so less is needed.',
          lesser: 'Lesser describes importance or rank, not a smaller AMOUNT of something uncountable.',
          'more little': 'Little already has its own comparative form — it doesn’t take “more” in front.',
          least: 'That’s for comparing THREE OR MORE amounts — here it’s just before and after the sun came out.',
        },
      },
    },
    {
      id: 'comparatives-t2-03', tier: 2, format: 'mcq5',
      stem: 'Which sentence uses fewer/less correctly?',
      options: [
        { text: 'Fewer people came to the match this week.', misconception: null },
        { text: 'Less people came to the match this week.', misconception: 'countable-uncountable-confusion' },
        { text: 'Fewer rain fell this week than last.', misconception: 'countable-uncountable-confusion' },
        { text: 'Less biscuits are left in the tin.', misconception: 'countable-uncountable-confusion' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Ask: can you count the thing one by one, or is it just an amount?',
        'People can be counted one by one, so they need fewer.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'People can be counted one by one — fewer people is correct.',
        whyWrong: {
          'Less people came to the match this week.': 'People are countable individually — that needs fewer, not less.',
          'Fewer rain fell this week than last.': 'Rain can’t be counted individually — that needs less, not fewer.',
          'Less biscuits are left in the tin.': 'Biscuits can be counted individually — that needs fewer, not less.',
        },
      },
    },
    {
      id: 'comparatives-t2-04', tier: 2, format: 'mcq5',
      stem: 'Which sentence is grammatically correct?',
      options: [
        { text: 'This dragon is bigger than that one.', misconception: null },
        { text: 'This dragon is more bigger than that one.', misconception: 'double-comparative' },
        { text: 'This dragon is most biggest than that one.', misconception: 'double-superlative' },
        { text: 'This dragon is bigger as that one.', misconception: 'wrong-linking-word' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Only ONE comparing method is ever used at a time — never two together.',
        'Big is short: double the final letter and add -er: bigger.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Big is short and doubles its final letter: bigger. Only ONE comparing method is ever used at a time.',
        whyWrong: {
          'This dragon is more bigger than that one.': 'That stacks “more” with -er on the same word — pick just one.',
          'This dragon is most biggest than that one.': 'That stacks “most” with -est AND uses “than”, which only ever compares two things — several crimes at once!',
          'This dragon is bigger as that one.': 'Comparisons with -er always pair with “than”, not “as”.',
        },
      },
    },
    {
      id: 'comparatives-t2-05', tier: 2, format: 'clozebox',
      stemParts: ['Jarlath’s new shoelaces are ', ' than his old ones.'],
      options: [
        { text: 'thinner', misconception: null },
        { text: 'thiner', misconception: 'spelling-slip' },
        { text: 'more thin', misconception: 'more-not-needed' },
        { text: 'thinnest', misconception: 'wrong-degree-superlative-for-two' },
        { text: 'thinly', misconception: 'adverb-confusion' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Only TWO sets of shoelaces are compared — old and new.',
        'Thin ends in a single vowel and consonant — double the final letter before adding -er.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Thin is short: double the final n before adding -er: thinner.',
        whyWrong: {
          thiner: 'Thin ends in a single vowel plus consonant — double the final letter before adding -er: thinner.',
          'more thin': 'Thin is a short word — it takes -er itself; it doesn’t need “more” as well.',
          thinnest: 'That’s for THREE OR MORE — here it’s just two pairs of shoelaces.',
          thinly: 'Thinly describes HOW something is done (an adverb) — it doesn’t compare two things at all.',
        },
      },
    },
    {
      id: 'comparatives-t2-06', tier: 2, format: 'clozebox',
      stemParts: ['Jarlath’s excuse was even ', ' than the one Whiffbeard invented.'],
      options: [
        { text: 'funnier', misconception: null },
        { text: 'funnyer', misconception: 'spelling-slip' },
        { text: 'more funny', misconception: 'more-not-needed' },
        { text: 'funniest', misconception: 'wrong-degree-superlative-for-two' },
        { text: 'funnily', misconception: 'adverb-confusion' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Only TWO excuses are compared here.',
        'Funny is short: swap the y for an i before adding -er.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Funny is short: swap the y for an i and add -er: funnier.',
        whyWrong: {
          funnyer: 'A short word ending in y swaps the y for an i before adding -er: funnier.',
          'more funny': 'Funny is a short word — it takes -ier itself; it doesn’t need “more” as well.',
          funniest: 'That’s for THREE OR MORE — here it’s just two excuses.',
          funnily: 'Funnily describes HOW something is done (an adverb) — it doesn’t compare two things at all.',
        },
      },
    },
    {
      id: 'comparatives-t2-07', tier: 2, format: 'clozebox',
      stemParts: ['Of all the villains Jarlath has faced, the Skidmark King is the ', '.'],
      options: [
        { text: 'most dangerous', misconception: null },
        { text: 'dangerousest', misconception: 'wrong-suffix-long-word' },
        { text: 'more dangerous', misconception: 'wrong-degree-comparative-for-many' },
        { text: 'most dangerousest', misconception: 'double-superlative' },
        { text: 'dangerouser', misconception: 'wrong-suffix-and-degree' },
      ],
      correctIndex: 0,
      hintSteps: [
        '“All the villains” means THREE OR MORE, not just two.',
        'Dangerous is long — long words use “most”, not -est.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Dangerous is a long word — long words use MOST for three-or-more comparisons: most dangerous.',
        whyWrong: {
          dangerousest: 'Long words like dangerous don’t take -est — use “most” instead.',
          'more dangerous': 'More compares just TWO things — here it’s against EVERY villain he’s faced.',
          'most dangerousest': 'That stacks “most” with an -est-style ending on the same word — pick just one.',
          dangerouser: 'Long words like dangerous don’t take -er, and this also picks the mismatched degree for three-or-more.',
        },
      },
    },
    {
      id: 'comparatives-t2-08', tier: 2, format: 'mcq5',
      stem: 'Which word correctly completes: “This maths problem is ___ than yesterday’s”?',
      options: [
        { text: 'more confusing', misconception: null },
        { text: 'confusinger', misconception: 'wrong-suffix-long-word' },
        { text: 'most confusing', misconception: 'wrong-degree-comparative-for-many' },
        { text: 'confusingest', misconception: 'wrong-suffix-and-degree' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Only TWO maths problems are compared — today’s and yesterday’s.',
        'Confusing is long — long words use “more”, not -er.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Confusing is a long word comparing just TWO problems — use more confusing.',
        whyWrong: {
          confusinger: 'Long words don’t take -er — use “more” instead.',
          'most confusing': 'Most is for THREE OR MORE — here it’s just two problems.',
          confusingest: 'Long words don’t take -est, and this also compares only two things, not three or more.',
        },
      },
    },
    {
      id: 'comparatives-t2-09', tier: 2, format: 'clozebox',
      stemParts: ['His shot, according to the disappointed coach, was ', ' than all season.'],
      options: [
        { text: 'worse', misconception: null },
        { text: 'badder', misconception: 'wrong-irregular' },
        { text: 'more bad', misconception: 'wrong-irregular-more' },
        { text: 'worst', misconception: 'wrong-degree-superlative-for-two' },
        { text: 'more worse', misconception: 'double-comparative' },
      ],
      correctIndex: 0,
      hintSteps: [
        'The coach is comparing this ONE shot against how the player usually shoots — just two points to compare.',
        'Bad → worse → worst. Comparing two points needs the middle rung: worse.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Bad breaks every rule: bad → worse → worst. Comparing this shot to his usual form needs worse.',
        whyWrong: {
          badder: 'Bad never takes -er — it transforms completely into worse.',
          'more bad': 'Bad never takes “more” either — it transforms into worse.',
          worst: 'That’s for THREE OR MORE — here it’s just this shot against his usual form.',
          'more worse': 'That stacks two comparing words on one job — pick just ONE: worse.',
        },
      },
    },
    {
      id: 'comparatives-t2-10', tier: 2, format: 'clozebox',
      stemParts: ['Considering how nervous he felt, that penalty was probably the ', ' he’s ever taken.'],
      options: [
        { text: 'best', misconception: null },
        { text: 'goodest', misconception: 'wrong-irregular' },
        { text: 'most good', misconception: 'wrong-irregular-more' },
        { text: 'better', misconception: 'wrong-degree-comparative-for-many' },
        { text: 'most best', misconception: 'double-superlative' },
      ],
      correctIndex: 0,
      hintSteps: [
        '“Ever taken” means comparing against EVERY penalty he’s ever taken, not just one.',
        'Good → better → best. The top rung for three-or-more is best.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Comparing against every penalty he’s ever taken (three or more) needs the top of the irregular ladder: best.',
        whyWrong: {
          goodest: 'Good never takes -est — it transforms completely into best.',
          'most good': 'Good never takes “most” either — it transforms into best.',
          better: 'Better is for comparing just TWO things — this is against every penalty he’s ever taken.',
          'most best': 'That stacks two comparing words on one job — best already does it alone.',
        },
      },
    },

    // ============== TIER 3 (8) — subtlest crime-spotting + wordentry write-ins ==============
    {
      id: 'comparatives-t3-01', tier: 3, format: 'wordentry',
      stem: 'Write the COMPARATIVE form of “good” (for comparing exactly TWO things).',
      accept: ['better'],
      hint: 'one word',
      maxLen: 20,
      hintSteps: [
        'Good doesn’t take -er — it transforms completely.',
        'Good → ___ → best. What sits in the middle?',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Good is irregular: good → better → best. The comparative (for two things) is better.',
      },
    },
    {
      id: 'comparatives-t3-02', tier: 3, format: 'wordentry',
      stem: 'Write the SUPERLATIVE form of “bad” (for comparing THREE OR MORE things).',
      accept: ['worst'],
      hint: 'one word',
      maxLen: 20,
      hintSteps: [
        'Bad doesn’t take -est — it transforms completely.',
        'Bad → worse → ___. What sits at the top of the ladder?',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Bad is irregular: bad → worse → worst. The superlative (for three or more) is worst.',
      },
    },
    {
      id: 'comparatives-t3-03', tier: 3, format: 'clozebox',
      stemParts: ['The pumpkin Jarlath grew this year was ', ' than last year’s winner.'],
      options: [
        { text: 'larger', misconception: null },
        { text: 'largerer', misconception: 'double-suffix' },
        { text: 'more large', misconception: 'more-not-needed' },
        { text: 'largest', misconception: 'wrong-degree-superlative-for-two' },
        { text: 'larget', misconception: 'spelling-slip' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Only TWO pumpkins are compared — this year’s and last year’s winner.',
        'Large drops its silent e before adding -er.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Large is short: drop the silent e, add -er: larger.',
        whyWrong: {
          largerer: 'That adds -er twice — larger already has one ending; it doesn’t need another.',
          'more large': 'Large is a short word — it takes -er itself; it doesn’t need “more” as well.',
          largest: 'That’s for THREE OR MORE — here it’s just this year against last year.',
          larget: 'Drop the silent e before adding -er: large → larger, not larget.',
        },
      },
    },
    {
      id: 'comparatives-t3-04', tier: 3, format: 'clozebox',
      stemParts: ['Despite the rainy forecast, ', ' people cancelled their trip than expected.'],
      options: [
        { text: 'fewer', misconception: null },
        { text: 'less', misconception: 'countable-uncountable-confusion' },
        { text: 'lesser', misconception: 'wrong-form-rank-not-amount' },
        { text: 'fewest', misconception: 'wrong-degree-superlative-for-two' },
        { text: 'more few', misconception: 'wrong-form' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Can people be counted one by one? Yes — so it needs the countable word.',
        'Countable things use fewer, not less.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'People can be counted one by one — countable nouns use fewer.',
        whyWrong: {
          less: 'Less is for things you can’t count individually — people can be counted, so fewer is needed.',
          lesser: 'Lesser describes importance or rank, not a smaller amount of countable people.',
          fewest: 'That’s for comparing THREE OR MORE groups — here it’s just actual against expected.',
          'more few': 'That’s not a real comparative form — few becomes fewer, it doesn’t take “more” in front.',
        },
      },
    },
    {
      id: 'comparatives-t3-05', tier: 3, format: 'mcq5',
      stem: 'Of the three routes home, which sentence is grammatically correct?',
      options: [
        { text: 'Of the three routes home, this one is the shortest.', misconception: null },
        { text: 'Of the three routes home, this one is more shorter.', misconception: 'double-comparative-and-wrong-degree' },
        { text: 'Of the three routes home, this one is shorter.', misconception: 'wrong-degree-comparative-for-three' },
        { text: 'Of the three routes home, this one is the most shortest.', misconception: 'double-superlative' },
      ],
      correctIndex: 0,
      hintSteps: [
        'THREE routes means you need the top rung of the ladder, not the middle one.',
        'Short is short: just add -est. No “more” or “most” needed at all.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Comparing THREE routes needs the superlative: shortest.',
        whyWrong: {
          'Of the three routes home, this one is more shorter.': 'That stacks “more” with -er, and it also picks the mismatched degree — three routes need the superlative, not the comparative.',
          'Of the three routes home, this one is shorter.': 'Shorter compares just TWO things — here there are THREE routes.',
          'Of the three routes home, this one is the most shortest.': 'That stacks “most” with -est on the same word — pick just one.',
        },
      },
    },
    {
      id: 'comparatives-t3-06', tier: 3, format: 'mcq5',
      stem: 'Which sentence uses fewer/less correctly?',
      options: [
        { text: 'There was less time left than the players expected.', misconception: null },
        { text: 'There was fewer time left than the players expected.', misconception: 'countable-uncountable-confusion' },
        { text: 'There were less minutes left than the players expected.', misconception: 'countable-uncountable-confusion' },
        { text: 'There was lesser time left than the players expected.', misconception: 'wrong-form-rank-not-amount' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Time, as a general amount, can’t be counted one by one.',
        'Minutes CAN be counted, but time itself here is treated as an amount — less time.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Time here is a general amount, not counted individually — less time is correct.',
        whyWrong: {
          'There was fewer time left than the players expected.': 'Time here is an uncountable amount — that needs less, not fewer.',
          'There were less minutes left than the players expected.': 'Minutes CAN be counted individually — that needs fewer, not less.',
          'There was lesser time left than the players expected.': 'Lesser describes importance or rank, not a smaller amount of time.',
        },
      },
    },
    {
      id: 'comparatives-t3-07', tier: 3, format: 'clozebox',
      stemParts: ['After the referee’s warning, every player became noticeably ', ' with tackles.'],
      options: [
        { text: 'more careful', misconception: null },
        { text: 'carefuller', misconception: 'wrong-suffix-long-word' },
        { text: 'most careful', misconception: 'wrong-degree-comparative-for-two' },
        { text: 'carefulest', misconception: 'wrong-suffix-and-degree' },
        { text: 'more carefuller', misconception: 'double-comparative' },
      ],
      correctIndex: 0,
      hintSteps: [
        'This compares just TWO states: before the warning and after it.',
        'Careful is long — long words use “more”, not -er.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Careful is a long word comparing just two states (before and after the warning): more careful.',
        whyWrong: {
          carefuller: 'Long words like careful don’t take -er — use “more” instead.',
          'most careful': 'Most is for THREE OR MORE — here it’s just comparing before and after the warning.',
          carefulest: 'Long words don’t take -est, and this also picks the mismatched degree for comparing two states.',
          'more carefuller': 'That stacks “more” with an -er-style ending on the same word — pick just one.',
        },
      },
    },
    {
      id: 'comparatives-t3-08', tier: 3, format: 'clozebox',
      stemParts: ['Out of every match played this season, Saturday’s game was the ', '.'],
      options: [
        { text: 'most exciting', misconception: null },
        { text: 'excitingest', misconception: 'wrong-suffix-long-word' },
        { text: 'more exciting', misconception: 'wrong-degree-comparative-for-many' },
        { text: 'most excitingest', misconception: 'double-superlative' },
        { text: 'excitinger', misconception: 'wrong-suffix-and-degree' },
      ],
      correctIndex: 0,
      hintSteps: [
        '“Every match played this season” means THREE OR MORE, not just two.',
        'Exciting is long — long words use “most”, not -est.',
      ],
      explain: {
        rule: 'Two things: -er (or \'more\'). Three or more: -est (or \'most\'). Never both at once — and it\'s fewer for things you can count.',
        worked: 'Exciting is a long word, and comparing against every match this season means three or more: most exciting.',
        whyWrong: {
          excitingest: 'Long words like exciting don’t take -est — use “most” instead.',
          'more exciting': 'More compares just TWO things — here it’s against EVERY match this season.',
          'most excitingest': 'That stacks “most” with an -est-style ending on the same word — pick just one.',
          excitinger: 'Long words don’t take -er, and this also picks the mismatched degree for three-or-more.',
        },
      },
    },
  ],
};
