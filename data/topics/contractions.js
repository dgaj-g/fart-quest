// FART QUEST topic: The Squeeze Passage — contractions (Grammar Grotto)
// Authored content — implementation agents: read, never modify.
// Bank-driven English topic (clozebox + wordentry). No generator.

const WEAPON_RULE = "Stretch it back out to check: could've = could HAVE. 'Could of' is always an imposter.";

export default {
  id: 'contractions',
  name: 'The Squeeze Passage',
  region: 'grammar-grotto',
  bankTopic: true,
  tagline: 'Two words squashed into one — and one impostor word that has never existed a day in its life.',

  creature: {
    id: 'couldve-colin',
    name: "Could've Colin",
    rarity: 'rare',
    image: 'assets/monsters/couldve-colin.png',
    bio: "Colin has sworn a lifelong blood oath against a villain named Could Of, who — delightfully — does not exist and never has. He proves it constantly by stretching every squeezed word back out to check.",
    factSneak: "Could've squeezes down from could HAVE — never 'could of', which is not a real phrase at all; the same un-squeeze trick catches should've, would've and must've too.",
  },

  weapon: {
    id: 'un-squeezer',
    name: 'The Un-Squeezer',
    tagline: 'Stretch first, trust second.',
    rule: WEAPON_RULE,
    example: "Jarlath swore he could've scored twice — never \"could of\". Stretch it back out: could HAVE.",
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-contract',
      text: "Oi oi, my brave little nose-soldier! Down here in the Squeeze Passage, two words get squashed into one so often that people stop noticing the apostrophe is doing all the hard work. Today you learn the one test that catches every fake squeeze — even the sneaky ones that fool grown-ups.",
    },
    {
      type: 'show',
      title: 'What Is a Squeeze?',
      html: `<p>A <b>contraction</b> squeezes two words into one — and the apostrophe sits EXACTLY where the missing letters used to live.</p>
<div class="law-scroll">📜 THE SQUEEZE LAW: Find the missing letters, and that is exactly where the apostrophe goes. Nowhere else.</div>
<ul>
<li><b>I am</b> → <b>I'm</b> (the "a" vanishes)</li>
<li><b>do not</b> → <b>don't</b> (the "o" in "not" vanishes)</li>
<li><b>is not</b> → <b>isn't</b> (the "o" in "not" vanishes)</li>
<li><b>we have</b> → <b>we've</b> (the "ha" vanishes)</li>
</ul>
<p>Say each pair out loud, then squeeze it — the apostrophe always marks the gap where letters disappeared.</p>`,
    },
    {
      type: 'show',
      title: 'Could Of? NEVER!',
      html: `<p>Now meet Colin's sworn enemy: <b>"could of"</b>. Say "could've" out loud and it SOUNDS almost exactly like "could of" — but "of" is not a squeeze of anything at all. It is a total impostor.</p>
<div class="law-scroll">📜 ${WEAPON_RULE}</div>
<p>Un-squeeze "could've" and you get "could have" — a real, sensible phrase. Try un-squeezing "could of" and you get… "could of"? That means absolutely nothing. The very same trap catches should've, would've and must've too.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'contractions-try-1', topicId: 'contractions', tier: 1, format: 'clozebox',
        stemParts: ['At half time, Jarlath grinned and admitted ', ' absolutely starving after all that running.'],
        options: [
          { text: "I'm", misconception: null },
          { text: 'Im', misconception: 'missing-apostrophe' },
          { text: "I am't", misconception: 'nonstandard-contraction' },
          { text: 'Iam', misconception: 'no-squeeze-mark' },
          { text: 'I,m', misconception: 'wrong-punctuation-mark' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Which two words are being squeezed together here — and which letter vanishes?',
          '"I am" squeezes into I\'m — the apostrophe replaces the missing "a".',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: '"I am" squeezes down to I\'m — the apostrophe sits exactly where the "a" disappeared.',
          whyWrong: {
            Im: 'The apostrophe has vanished completely — without it, this is not a proper squeeze at all.',
            "I am't": 'That is not a real English contraction — nobody squeezes "am" onto the end like that.',
            Iam: 'With no apostrophe and no space, this is just two words squashed together with no squeeze mark at all.',
            'I,m': "A comma cannot do the apostrophe's job — it never marks a squeeze.",
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Rule-Breakers',
      html: `<p>Most squeezes are polite and predictable. A few are absolute rebels who refuse the normal pattern.</p>
<ul>
<li><b>will not</b> → <b>won't</b> (NOT "willn't" — the whole word changes shape!)</li>
<li><b>shall not</b> → <b>shan't</b> (the "ll" vanishes too)</li>
<li><b>cannot</b> → <b>can't</b> (squeezed into one word first, then squeezed again)</li>
</ul>
<p>These three don't just remove some letters — you simply have to know them. Learn these rebels and almost nothing left in the Squeeze Passage can catch you out.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'contractions-try-2', topicId: 'contractions', tier: 2, format: 'clozebox',
        stemParts: ['Whiffbeard sighed and admitted the whole team ', ' won that match with a bit more luck.'],
        options: [
          { text: "could've", misconception: null },
          { text: 'could of', misconception: 'of-not-ve' },
          { text: "couldn't", misconception: 'opposite-meaning' },
          { text: 'could have of', misconception: 'double-marked' },
          { text: 'coulda', misconception: 'informal-nonstandard' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Un-squeeze the gap word: does it mean "could HAVE" or something else entirely?',
          '"Could\'ve" = could have. "Could of" sounds the same out loud but is a total impostor — "of" is never a squeeze of "have".',
        ],
        explain: {
          rule: WEAPON_RULE,
          worked: '"Could\'ve" un-squeezes to "could have" — Whiffbeard means the team had the ABILITY to win, just not the luck.',
          whyWrong: {
            'could of': '"Of" is never a squeeze of "have" — stretch it back out and "could of" means nothing at all.',
            "couldn't": 'That is the NEGATIVE — could NOT — the opposite meaning to what Whiffbeard is describing here.',
            'could have of': 'That bolts "of" on as well — "have" only ever needs squeezing once, not twice.',
            coulda: 'That is a casual spoken shortcut, not standard written English.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'The Un-Squeeze Test',
      html: `<p>Stuck on any contraction? Run the Un-Squeeze Test: say the two full words out loud in place of the squeezed word. If it makes sense, the contraction is correct. If it sounds like nonsense — like "he could of" — you have just caught an impostor.</p>
<div class="law-scroll">📜 ${WEAPON_RULE}</div>
<p>This test works every single time, on every squeeze in the whole passage.</p>`,
    },
    { type: 'weapon' },
  ],

  tips: [
    "A contraction squeezes two words into one — the apostrophe marks exactly where letters vanished, nowhere else.",
    "Stretch it back out to check: could've, should've, would've and must've all mean could/should/would/must HAVE.",
    "\"Could of\", \"should of\", \"would of\" and \"must of\" are always impostors — \"of\" is never a squeeze of \"have\".",
    "Three rebels change shape completely: will not → won't, shall not → shan't, cannot → can't.",
    "It's/its, you're/your, who's/whose, there's/theirs — the squeezed word always un-squeezes into two sensible words; the other word never does.",
    "They're only ever means \"they are\" — their shows something belongs to them. If you can't say \"they are\" in its place, it isn't they're.",
  ],

  bank: [
    // ================= TIER 1 (12): core everyday contractions, clozebox =================
    {
      id: 'contractions-t1-01', tier: 1, format: 'clozebox',
      stemParts: ['Jarlath wiped his brow at training and said, ', ' finally getting the hang of dribbling.'],
      options: [
        { text: "I'm", misconception: null },
        { text: 'Im', misconception: 'missing-apostrophe' },
        { text: "I am't", misconception: 'nonstandard-contraction' },
        { text: 'Iam', misconception: 'no-squeeze-mark' },
        { text: 'I,m', misconception: 'wrong-punctuation-mark' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letter vanishes?',
        '"I am" squeezes into I\'m — the apostrophe marks the missing "a".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"I am" squeezes down to I\'m, with the apostrophe sitting exactly where the "a" disappeared.',
        whyWrong: {
          Im: 'The apostrophe has vanished completely — without it, this is not a real squeeze.',
          "I am't": 'That is not a real English contraction — "am" is never squeezed onto the end like that.',
          Iam: 'With no apostrophe and no space, this just squashes two words together with no squeeze mark at all.',
          'I,m': "A comma cannot do the apostrophe's job — it never marks a squeeze.",
        },
      },
    },
    {
      id: 'contractions-t1-02', tier: 1, format: 'clozebox',
      stemParts: ['Whiffbeard beamed and announced that ', ' getting braver on the pitch every single week.'],
      options: [
        { text: "you're", misconception: null },
        { text: 'your', misconception: 'wrong-word-possessive' },
        { text: 'youre', misconception: 'missing-apostrophe' },
        { text: "you'r", misconception: 'misplaced-apostrophe' },
        { text: "your'e", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "you are", or does it show something belonging to you?',
        '"You are" squeezes into you\'re — the apostrophe marks the missing "a".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"You are" squeezes down to you\'re — Whiffbeard means Jarlath IS getting braver.',
        whyWrong: {
          your: 'That word shows something BELONGS to you — it never means "you are".',
          youre: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "you'r": 'The apostrophe has landed one letter too early — the missing letter is the "a" in "are".',
          "your'e": 'That squashes the apostrophe into a spot that matches no missing letter at all.',
        },
      },
    },
    {
      id: 'contractions-t1-03', tier: 1, format: 'clozebox',
      stemParts: ['Jarlath peered out the window and groaned that ', ' absolutely pouring outside again.'],
      options: [
        { text: "it's", misconception: null },
        { text: 'its', misconception: 'wrong-word-possessive' },
        { text: "its'", misconception: 'misplaced-apostrophe' },
        { text: "it is's", misconception: 'double-marked' },
        { text: "its's", misconception: 'nonstandard-contraction' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "it is", or does it show belonging?',
        '"It is" squeezes into it\'s — the apostrophe marks the missing "i".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"It is" squeezes down to it\'s — Jarlath means the weather IS raining hard.',
        whyWrong: {
          its: 'That word shows belonging (like "its tail") — it never means "it is".',
          "its'": 'An apostrophe after the s makes no sense here — nothing is being owned by more than one thing.',
          "it is's": 'That squeezes "it is" AND then adds another apostrophe-s — only one squeeze is ever needed.',
          "its's": 'That is not a real word in any form — it mixes belonging and squeezing together.',
        },
      },
    },
    {
      id: 'contractions-t1-04', tier: 1, format: 'clozebox',
      stemParts: ['The sign on the gate warned that pupils ', ' run across the wet playground.'],
      options: [
        { text: "don't", misconception: null },
        { text: 'dont', misconception: 'missing-apostrophe' },
        { text: "do'nt", misconception: 'misplaced-apostrophe' },
        { text: 'don not', misconception: 'incomplete-squeeze' },
        { text: "do'not", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letter vanishes?',
        '"Do not" squeezes into don\'t — the apostrophe marks the missing "o" in "not".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Do not" squeezes down to don\'t, with the apostrophe sitting exactly where the "o" in "not" disappeared.',
        whyWrong: {
          dont: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "do'nt": 'The apostrophe has landed one letter too early — the missing letter is the "o" in "not".',
          'don not': 'That squashes "do" and "not" together without ever actually removing the missing letter.',
          "do'not": 'The apostrophe sits in a spot that does not match any missing letter.',
        },
      },
    },
    {
      id: 'contractions-t1-05', tier: 1, format: 'clozebox',
      stemParts: ['Jarlath tugged at his bootlaces and admitted he ', ' undo the stubborn double knot.'],
      options: [
        { text: "can't", misconception: null },
        { text: 'cant', misconception: 'missing-apostrophe' },
        { text: "ca'nt", misconception: 'misplaced-apostrophe' },
        { text: "can'not", misconception: 'misplaced-apostrophe' },
        { text: 'cannt', misconception: 'nonstandard-contraction' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together here, and where does the apostrophe belong?',
        '"Cannot" squeezes into can\'t — the apostrophe marks the missing "no".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Cannot" squeezes down to can\'t, with the apostrophe marking exactly where the "no" disappeared.',
        whyWrong: {
          cant: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "ca'nt": 'The apostrophe has landed one letter too early — it should mark the missing "no", not split "cant" like this.',
          "can'not": 'That keeps "not" almost whole and just adds an apostrophe — the squeeze needs to lose those letters.',
          cannt: 'That is not a real spelling — it neither keeps the full word nor squeezes it correctly.',
        },
      },
    },
    {
      id: 'contractions-t1-06', tier: 1, format: 'clozebox',
      stemParts: ['The referee checked the muddy pitch and decided it ', ' safe for a match today.'],
      options: [
        { text: "isn't", misconception: null },
        { text: 'isnt', misconception: 'missing-apostrophe' },
        { text: "is'nt", misconception: 'misplaced-apostrophe' },
        { text: "isn'not", misconception: 'double-marked' },
        { text: 'isnot', misconception: 'no-squeeze-mark' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letter vanishes?',
        '"Is not" squeezes into isn\'t — the apostrophe marks the missing "o" in "not".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Is not" squeezes down to isn\'t, with the apostrophe sitting exactly where the "o" in "not" disappeared.',
        whyWrong: {
          isnt: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "is'nt": 'The apostrophe has landed one letter too early — the missing letter is the "o" in "not".',
          "isn'not": 'That keeps almost all of "not" AND adds an apostrophe — the whole point of squeezing is that letters disappear.',
          isnot: 'With no apostrophe at all, this is just two words squashed together with no squeeze mark at all.',
        },
      },
    },
    {
      id: 'contractions-t1-07', tier: 1, format: 'clozebox',
      stemParts: ['Before the school trip, Jarlath checked twice that ', ' packed every single boot and sock.'],
      options: [
        { text: "we've", misconception: null },
        { text: 'weve', misconception: 'missing-apostrophe' },
        { text: "we'v", misconception: 'incomplete-squeeze' },
        { text: "we have've", misconception: 'double-marked' },
        { text: "wev'e", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letters vanish?',
        '"We have" squeezes into we\'ve — the apostrophe marks the missing "ha".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"We have" squeezes down to we\'ve, with the apostrophe sitting exactly where the "ha" disappeared.',
        whyWrong: {
          weve: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "we'v": 'That drops the final "e" as well as the apostrophe placement being off — "we\'ve" keeps that closing e.',
          "we have've": 'That keeps "have" whole AND adds a squeeze on top — only one version should ever appear.',
          "wev'e": 'The apostrophe has landed in a spot that matches no missing letter at all.',
        },
      },
    },
    {
      id: 'contractions-t1-08', tier: 1, format: 'clozebox',
      stemParts: ['Whiffbeard promised the crowd that the team ', ' definitely try their best out there.'],
      options: [
        { text: "they'll", misconception: null },
        { text: 'theyll', misconception: 'missing-apostrophe' },
        { text: "the'yll", misconception: 'misplaced-apostrophe' },
        { text: "they will'll", misconception: 'double-marked' },
        { text: "they'l", misconception: 'incomplete-squeeze' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letters vanish?',
        '"They will" squeezes into they\'ll — the apostrophe marks the missing "wi".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"They will" squeezes down to they\'ll, with the apostrophe sitting where the "wi" disappeared.',
        whyWrong: {
          theyll: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "the'yll": 'The apostrophe has landed in the middle of "they" itself — that is not where the missing letters were.',
          "they will'll": 'That keeps "will" whole AND adds an extra squeezed ending — only one version is ever needed.',
          "they'l": 'That only keeps one "l" — the squeeze of "will" needs both.',
        },
      },
    },
    {
      id: 'contractions-t1-09', tier: 1, format: 'clozebox',
      stemParts: ['Whiffbeard clapped his hands and shouted, ', ' the best goal I have seen all season!'],
      options: [
        { text: "that's", misconception: null },
        { text: 'thats', misconception: 'missing-apostrophe' },
        { text: "that is's", misconception: 'double-marked' },
        { text: "tha'ts", misconception: 'misplaced-apostrophe' },
        { text: "thats'", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together here, and which letter vanishes?',
        '"That is" squeezes into that\'s — the apostrophe marks the missing "i".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"That is" squeezes down to that\'s, with the apostrophe sitting exactly where the "i" disappeared.',
        whyWrong: {
          thats: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "that is's": 'That squeezes "that is" AND then adds another apostrophe-s — only one squeeze is ever needed.',
          "tha'ts": 'The apostrophe has landed inside "that" itself, not where "is" lost its letter.',
          "thats'": 'An apostrophe after the s makes no sense here — nothing is being owned by more than one thing.',
        },
      },
    },
    {
      id: 'contractions-t1-10', tier: 1, format: 'clozebox',
      stemParts: ['The bell rang for lunch, so Jarlath shouted, ', ' race each other to the canteen.'],
      options: [
        { text: "let's", misconception: null },
        { text: 'lets', misconception: 'homophone-different-word' },
        { text: "le'ts", misconception: 'misplaced-apostrophe' },
        { text: "let us's", misconception: 'double-marked' },
        { text: "lets'", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "let us", or is it a completely different word that just looks similar?',
        '"Let us" squeezes into let\'s — the apostrophe marks the missing "u".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Let us" squeezes down to let\'s, with the apostrophe sitting exactly where the "u" disappeared.',
        whyWrong: {
          lets: '"Lets" (no apostrophe) is a real word too — it means "allows", as in "she lets him play" — not "let us" at all.',
          "le'ts": 'The apostrophe has landed one word too early — the missing letter is the "u" in "us", not inside "let".',
          "let us's": 'That keeps "us" whole AND adds an apostrophe-s on top — only one squeeze is ever needed.',
          "lets'": 'An apostrophe after the s makes no sense here — nothing is being owned by more than one thing.',
        },
      },
    },
    {
      id: 'contractions-t1-11', tier: 1, format: 'clozebox',
      stemParts: ['Whiffbeard scratched his beard, wondering ', ' left muddy footprints across the whole hall.'],
      options: [
        { text: "who's", misconception: null },
        { text: 'whose', misconception: 'wrong-word-possessive' },
        { text: 'whos', misconception: 'missing-apostrophe' },
        { text: "who is's", misconception: 'double-marked' },
        { text: "who'is", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "who is", or does it show belonging?',
        '"Who is" squeezes into who\'s — the apostrophe marks the missing "i".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Who is" squeezes down to who\'s — Whiffbeard is asking who IS responsible for the footprints.',
        whyWrong: {
          whose: 'That word shows belonging (like "whose boot is this") — it never means "who is".',
          whos: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "who is's": 'That squeezes "who is" AND then adds another apostrophe-s — only one squeeze is ever needed.',
          "who'is": 'The apostrophe should mark the missing "i", not sit directly in front of the whole word "is".',
        },
      },
    },
    {
      id: 'contractions-t1-12', tier: 1, format: 'clozebox',
      stemParts: ['Jarlath searched his bag twice and realised he ', ' pack his shin pads after all.'],
      options: [
        { text: "didn't", misconception: null },
        { text: 'didnt', misconception: 'missing-apostrophe' },
        { text: "did'nt", misconception: 'misplaced-apostrophe' },
        { text: "didn'not", misconception: 'double-marked' },
        { text: "did not't", misconception: 'double-marked' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letter vanishes?',
        '"Did not" squeezes into didn\'t — the apostrophe marks the missing "o" in "not".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Did not" squeezes down to didn\'t, with the apostrophe sitting exactly where the "o" in "not" disappeared.',
        whyWrong: {
          didnt: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "did'nt": 'The apostrophe has landed one letter too early — the missing letter is the "o" in "not".',
          "didn'not": 'That keeps almost all of "not" AND adds an apostrophe — the whole point of squeezing is that letters disappear.',
          "did not't": 'That keeps "not" fully spelled out AND bolts on an extra squeeze — only one version is ever needed.',
        },
      },
    },

    // ================= TIER 2 (12): could've/should've/would've/must've family, irregular squeezes, clozebox =================
    {
      id: 'contractions-t2-01', tier: 2, format: 'clozebox',
      stemParts: ['After the final whistle, Jarlath sighed that he ', ' scored twice with just a little more luck.'],
      options: [
        { text: "could've", misconception: null },
        { text: 'could of', misconception: 'of-not-ve' },
        { text: "couldn't", misconception: 'opposite-meaning' },
        { text: 'could have of', misconception: 'double-marked' },
        { text: 'coulda', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "could HAVE" or something else entirely?',
        '"Could\'ve" = could have. "Could of" sounds the same out loud but is a total impostor.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Could\'ve" un-squeezes to "could have" — Jarlath means he HAD the ability to score more, just not the luck.',
        whyWrong: {
          'could of': '"Of" is never a squeeze of "have" — stretch it back out and "could of" means nothing at all.',
          "couldn't": 'That is the NEGATIVE — could NOT — the opposite meaning to what Jarlath is describing here.',
          'could have of': 'That bolts "of" on as well — "have" only ever needs squeezing once, not twice.',
          coulda: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
    {
      id: 'contractions-t2-02', tier: 2, format: 'clozebox',
      stemParts: ['Jarlath groaned in the rain, admitting he ', ' brought his big yellow umbrella after all.'],
      options: [
        { text: "should've", misconception: null },
        { text: 'should of', misconception: 'of-not-ve' },
        { text: "shouldn't", misconception: 'opposite-meaning' },
        { text: 'should have of', misconception: 'double-marked' },
        { text: 'shoulda', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "should HAVE" or something else entirely?',
        '"Should\'ve" = should have. "Should of" sounds the same out loud but is a total impostor.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Should\'ve" un-squeezes to "should have" — Jarlath is describing something he did not do, but ought to have done.',
        whyWrong: {
          'should of': '"Of" is never a squeeze of "have" — stretch it back out and "should of" means nothing at all.',
          "shouldn't": 'That is the NEGATIVE — should NOT — the opposite meaning to what Jarlath is describing here.',
          'should have of': 'That bolts "of" on as well — "have" only ever needs squeezing once, not twice.',
          shoulda: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
    {
      id: 'contractions-t2-03', tier: 2, format: 'clozebox',
      stemParts: ["Whiffbeard explained that the whole squad ", ' missed the bus without Jarlath\'s quick thinking.'],
      options: [
        { text: "would've", misconception: null },
        { text: 'would of', misconception: 'of-not-ve' },
        { text: "wouldn't", misconception: 'opposite-meaning' },
        { text: 'would have of', misconception: 'double-marked' },
        { text: 'woulda', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "would HAVE" or something else entirely?',
        '"Would\'ve" = would have. "Would of" sounds the same out loud but is a total impostor.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Would\'ve" un-squeezes to "would have" — the squad only avoided missing the bus because of Jarlath.',
        whyWrong: {
          'would of': '"Of" is never a squeeze of "have" — stretch it back out and "would of" means nothing at all.',
          "wouldn't": 'That is the NEGATIVE — would NOT — the opposite meaning to what Whiffbeard is describing here.',
          'would have of': 'That bolts "of" on as well — "have" only ever needs squeezing once, not twice.',
          woulda: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
    {
      id: 'contractions-t2-04', tier: 2, format: 'clozebox',
      stemParts: ['The empty biscuit tin sat on the shelf, so somebody ', ' eaten every single one already.'],
      options: [
        { text: "must've", misconception: null },
        { text: 'must of', misconception: 'of-not-ve' },
        { text: "mustn't", misconception: 'opposite-meaning' },
        { text: 'must have of', misconception: 'double-marked' },
        { text: 'musta', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "must HAVE" or something else entirely?',
        '"Must\'ve" = must have. "Must of" sounds the same out loud but is a total impostor.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Must\'ve" un-squeezes to "must have" — the empty tin means somebody almost certainly ate the biscuits.',
        whyWrong: {
          'must of': '"Of" is never a squeeze of "have" — stretch it back out and "must of" means nothing at all.',
          "mustn't": 'That is the NEGATIVE — must NOT — the opposite of what the empty tin actually suggests happened.',
          'must have of': 'That bolts "of" on as well — "have" only ever needs squeezing once, not twice.',
          musta: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
    {
      id: 'contractions-t2-05', tier: 2, format: 'clozebox',
      stemParts: ['No matter how hard Jarlath pulled, his soggy left boot simply ', ' come off his foot.'],
      options: [
        { text: "won't", misconception: null },
        { text: "willn't", misconception: 'nonstandard-contraction' },
        { text: 'wont', misconception: 'missing-apostrophe' },
        { text: "won'not", misconception: 'double-marked' },
        { text: "will not't", misconception: 'double-marked' },
      ],
      correctIndex: 0,
      hintSteps: [
        'This is one of the rule-breakers — it does not just remove some letters.',
        '"Will not" does not squeeze the neat way — it rebels completely into won\'t.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Will not" rebels completely into won\'t — this is one of the three squeezes you simply have to know.',
        whyWrong: {
          "willn't": 'Will and not do not squeeze the neat way — "will not" rebels completely into won\'t instead.',
          wont: 'Without the apostrophe, this word looks identical to "wont" (a habit) — a completely different word.',
          "won'not": 'That keeps almost all of "not" AND adds an apostrophe — won\'t has already lost those letters.',
          "will not't": 'That keeps "will not" fully spelled out AND bolts on an extra squeeze — only won\'t is needed.',
        },
      },
    },
    {
      id: 'contractions-t2-06', tier: 2, format: 'clozebox',
      stemParts: ['Whiffbeard folded his arms grandly and declared he ', ' be moved on the matter of sprouts.'],
      options: [
        { text: "shan't", misconception: null },
        { text: "shalln't", misconception: 'nonstandard-contraction' },
        { text: 'shant', misconception: 'missing-apostrophe' },
        { text: "sha'nt", misconception: 'misplaced-apostrophe' },
        { text: "shall not't", misconception: 'double-marked' },
      ],
      correctIndex: 0,
      hintSteps: [
        'This is another rule-breaker — it does not just remove some letters neatly.',
        '"Shall not" does not squeeze the neat way either — it rebels completely into shan\'t.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Shall not" rebels completely into shan\'t — another one of the squeezes you simply have to learn.',
        whyWrong: {
          "shalln't": 'Shall and not do not squeeze the neat way — "shall not" rebels completely into shan\'t instead.',
          shant: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "sha'nt": 'The apostrophe has landed in a spot that does not match how shan\'t is actually spelt.',
          "shall not't": 'That keeps "shall not" fully spelled out AND bolts on an extra squeeze — only shan\'t is needed.',
        },
      },
    },
    {
      id: 'contractions-t2-07', tier: 2, format: 'clozebox',
      stemParts: ['Jarlath insisted the grumpy stinkling simply ', ' share a single crumb of his packed lunch.'],
      options: [
        { text: "wouldn't", misconception: null },
        { text: "would'nt", misconception: 'misplaced-apostrophe' },
        { text: 'wouldnt', misconception: 'missing-apostrophe' },
        { text: "would not't", misconception: 'double-marked' },
        { text: 'wouldna', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letter vanishes?',
        '"Would not" squeezes into wouldn\'t — the apostrophe marks the missing "o" in "not".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Would not" squeezes down to wouldn\'t, with the apostrophe sitting exactly where the "o" in "not" disappeared.',
        whyWrong: {
          "would'nt": 'The apostrophe has landed one letter too early — the missing letter is the "o" in "not".',
          wouldnt: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "would not't": 'That keeps "not" fully spelled out AND bolts on an extra squeeze — only one version is ever needed.',
          wouldna: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
    {
      id: 'contractions-t2-08', tier: 2, format: 'clozebox',
      stemParts: ['Search as he might, the referee simply ', ' find his shiny silver whistle anywhere.'],
      options: [
        { text: "couldn't", misconception: null },
        { text: "could'nt", misconception: 'misplaced-apostrophe' },
        { text: 'couldnt', misconception: 'missing-apostrophe' },
        { text: "could not't", misconception: 'double-marked' },
        { text: 'couldna', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which two words are squeezed together, and which letter vanishes?',
        '"Could not" squeezes into couldn\'t — the apostrophe marks the missing "o" in "not".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Could not" squeezes down to couldn\'t, with the apostrophe sitting exactly where the "o" in "not" disappeared.',
        whyWrong: {
          "could'nt": 'The apostrophe has landed one letter too early — the missing letter is the "o" in "not".',
          couldnt: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "could not't": 'That keeps "not" fully spelled out AND bolts on an extra squeeze — only one version is ever needed.',
          couldna: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
    {
      id: 'contractions-t2-09', tier: 2, format: 'clozebox',
      stemParts: ['Given the choice at the tuck shop, Jarlath decided ', ' rather have crisps than an apple.'],
      options: [
        { text: "I'd", misconception: null },
        { text: 'Id', misconception: 'missing-apostrophe' },
        { text: "I'ed", misconception: 'nonstandard-contraction' },
        { text: "I would'd", misconception: 'double-marked' },
        { text: 'I,d', misconception: 'wrong-punctuation-mark' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Which words are squeezed together, and which letters vanish?',
        '"I would" squeezes into I\'d — the apostrophe marks the missing "woul".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"I would" squeezes down to I\'d, with the apostrophe marking exactly where "woul" disappeared.',
        whyWrong: {
          Id: 'The apostrophe has vanished — without it, this reads as a completely different short word, "Id".',
          "I'ed": 'That is not how the squeeze works — "would" loses "woul", not just gains an "ed".',
          "I would'd": 'That keeps "would" fully spelled out AND bolts on an extra squeeze — only one version is ever needed.',
          'I,d': "A comma cannot do the apostrophe's job — it never marks a squeeze.",
        },
      },
    },
    {
      id: 'contractions-t2-10', tier: 2, format: 'clozebox',
      stemParts: ['Whiffbeard froze in the corridor, certain ', ' something rustling behind the cupboard door.'],
      options: [
        { text: "there's", misconception: null },
        { text: 'theres', misconception: 'missing-apostrophe' },
        { text: "their's", misconception: 'wrong-word-homophone' },
        { text: "there is's", misconception: 'double-marked' },
        { text: "there'is", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "there is", or something about belonging?',
        '"There is" squeezes into there\'s — the apostrophe marks the missing "i".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"There is" squeezes down to there\'s — Whiffbeard means something IS rustling nearby.',
        whyWrong: {
          theres: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "their's": 'That mixes the belonging word "their" with an apostrophe that has no job to do — it never means "there is".',
          "there is's": 'That squeezes "there is" AND then adds another apostrophe-s — only one squeeze is ever needed.',
          "there'is": 'The apostrophe should mark the missing "i", not sit directly in front of the whole word "is".',
        },
      },
    },
    {
      id: 'contractions-t2-11', tier: 2, format: 'clozebox',
      stemParts: ['The head teacher held up a shiny medal at assembly and announced, ', ' one for every player today.'],
      options: [
        { text: "here's", misconception: null },
        { text: 'heres', misconception: 'missing-apostrophe' },
        { text: "hear's", misconception: 'wrong-word-homophone' },
        { text: "here is's", misconception: 'double-marked' },
        { text: "here'is", misconception: 'misplaced-apostrophe' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "here is", or is it a sound-alike word about listening?',
        '"Here is" squeezes into here\'s — the apostrophe marks the missing "i".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Here is" squeezes down to here\'s — the head teacher means "here IS one" as she holds it up.',
        whyWrong: {
          heres: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "hear's": 'That word is about listening — it sounds similar but never means "here is".',
          "here is's": 'That squeezes "here is" AND then adds another apostrophe-s — only one squeeze is ever needed.',
          "here'is": 'The apostrophe should mark the missing "i", not sit directly in front of the whole word "is".',
        },
      },
    },
    {
      id: 'contractions-t2-12', tier: 2, format: 'clozebox',
      stemParts: ['Jarlath grabbed his kit bag and called out that ', ' already running late for training.'],
      options: [
        { text: "we're", misconception: null },
        { text: 'were', misconception: 'wrong-word-homophone' },
        { text: "wer'e", misconception: 'misplaced-apostrophe' },
        { text: "we'er", misconception: 'misplaced-apostrophe' },
        { text: 'weare', misconception: 'no-squeeze-mark' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "we are" right now, or is it a word from the past?',
        '"We are" squeezes into we\'re — the apostrophe marks the missing "a".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"We are" squeezes down to we\'re — Jarlath means the team IS running late right now.',
        whyWrong: {
          were: 'That word looks and sounds almost identical, but it is the PAST tense of "to be" — not a squeeze of "we are" at all.',
          "wer'e": 'The apostrophe has landed one letter too early — the missing letter is the "a" in "are".',
          "we'er": 'That reorders the letters after the apostrophe incorrectly — "are" loses its "a", not its order.',
          weare: 'With no apostrophe at all, this is just two words squashed together with no squeeze mark at all.',
        },
      },
    },

    // ================= TIER 3 (10): 5 wordentry un-squeeze + 5 clozebox subtlest traps =================
    {
      id: 'contractions-t3-01', tier: 3, format: 'wordentry',
      stem: "Write 'won't' in full.",
      hint: 'two words',
      maxLen: 20,
      accept: ['will not'],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Won\'t" is one of the rebel squeezes — it un-squeezes to "will not", not "willn\'t".',
      },
      hintSteps: [
        'This is one of the three rule-breaking squeezes from the lesson.',
        '"Will" and "not" rebel completely into won\'t — so un-squeezed, it is simply will not.',
      ],
    },
    {
      id: 'contractions-t3-02', tier: 3, format: 'wordentry',
      stem: "Write 'shouldn't' in full.",
      hint: 'two words',
      maxLen: 20,
      accept: ['should not'],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Shouldn\'t" un-squeezes neatly to "should not" — the apostrophe marks the missing "o".',
      },
      hintSteps: [
        'Which letter did the apostrophe replace inside "not"?',
        '"Should" plus "not" squeeze together — un-squeezed, it is should not.',
      ],
    },
    {
      id: 'contractions-t3-03', tier: 3, format: 'wordentry',
      stem: "Write 'they've' in full.",
      hint: 'two words',
      maxLen: 20,
      accept: ['they have'],
      explain: {
        rule: WEAPON_RULE,
        worked: '"They\'ve" un-squeezes to "they have" — the apostrophe marks the missing "ha".',
      },
      hintSteps: [
        'Which letters did the apostrophe replace?',
        '"They" plus "have" squeeze together, losing "ha" — un-squeezed, it is they have.',
      ],
    },
    {
      id: 'contractions-t3-04', tier: 3, format: 'wordentry',
      stem: "Write 'couldn't' in full.",
      hint: 'two words',
      maxLen: 20,
      accept: ['could not'],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Couldn\'t" un-squeezes neatly to "could not" — the apostrophe marks the missing "o".',
      },
      hintSteps: [
        'Which letter did the apostrophe replace inside "not"?',
        '"Could" plus "not" squeeze together — un-squeezed, it is could not.',
      ],
    },
    {
      id: 'contractions-t3-05', tier: 3, format: 'wordentry',
      stem: "Write 'shan't' in full.",
      hint: 'two words',
      maxLen: 20,
      accept: ['shall not'],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Shan\'t" is another rebel squeeze — it un-squeezes to "shall not", losing the "ll" as well as the "o".',
      },
      hintSteps: [
        'This is one of the three rule-breaking squeezes from the lesson.',
        '"Shall" and "not" rebel completely into shan\'t — so un-squeezed, it is shall not.',
      ],
    },
    {
      id: 'contractions-t3-06', tier: 3, format: 'clozebox',
      stemParts: ['After training, Whiffbeard swore ', ' definitely the toughest team in the entire league this season.'],
      options: [
        { text: "they're", misconception: null },
        { text: 'their', misconception: 'wrong-word-possessive' },
        { text: 'theyre', misconception: 'missing-apostrophe' },
        { text: "the'yre", misconception: 'misplaced-apostrophe' },
        { text: "they are're", misconception: 'double-marked' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "they are", or does it show something belonging to them?',
        '"They are" squeezes into they\'re — the apostrophe marks the missing "a".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"They are" squeezes down to they\'re — Whiffbeard means the squad definitely IS the toughest team.',
        whyWrong: {
          their: 'That word shows something BELONGS to them — it never means "they are".',
          theyre: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "the'yre": 'The apostrophe has landed inside "they" itself, not where "are" lost its letter.',
          "they are're": 'That keeps "are" fully spelled out AND bolts on an extra squeeze — only one version is ever needed.',
        },
      },
    },
    {
      id: 'contractions-t3-07', tier: 3, format: 'clozebox',
      stemParts: ['Whiffbeard grinned at the trophy cabinet and announced that ', ' a shinier cup on the top shelf this year.'],
      options: [
        { text: "there's", misconception: null },
        { text: 'theirs', misconception: 'wrong-word-possessive' },
        { text: 'theres', misconception: 'missing-apostrophe' },
        { text: "there'is", misconception: 'misplaced-apostrophe' },
        { text: "there is's", misconception: 'double-marked' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "there is", or does it show something belonging to them?',
        '"There is" squeezes into there\'s — the apostrophe marks the missing "i".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"There is" squeezes down to there\'s — Whiffbeard means there IS a shinier cup this year.',
        whyWrong: {
          theirs: 'That word shows something belongs to THEM (like "that cup is theirs") — it never means "there is".',
          theres: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "there'is": 'The apostrophe should mark the missing "i", not sit directly in front of the whole word "is".',
          "there is's": 'That squeezes "there is" AND then adds another apostrophe-s — only one squeeze is ever needed.',
        },
      },
    },
    {
      id: 'contractions-t3-08', tier: 3, format: 'clozebox',
      stemParts: ['Whiffbeard studied the muddy footprints all the way down the corridor, determined to work out exactly ', ' responsible for the mess.'],
      options: [
        { text: "who's", misconception: null },
        { text: 'whose', misconception: 'wrong-word-possessive' },
        { text: 'whos', misconception: 'missing-apostrophe' },
        { text: "who'is", misconception: 'misplaced-apostrophe' },
        { text: "who is's", misconception: 'double-marked' },
      ],
      correctIndex: 0,
      hintSteps: [
        'Un-squeeze the gap word: does it mean "who is", or does it show belonging?',
        '"Who is" squeezes into who\'s — the apostrophe marks the missing "i".',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Who is" squeezes down to who\'s — Whiffbeard is trying to work out who IS to blame for the muddy trail.',
        whyWrong: {
          whose: 'That word shows belonging (like "whose boots left these prints") — it never means "who is".',
          whos: 'The apostrophe has vanished — without it, this is not a proper squeeze.',
          "who'is": 'The apostrophe has landed directly in front of "is" instead of marking its own missing "i".',
          "who is's": 'That squeezes "who is" AND then adds another apostrophe-s — only one squeeze is ever needed.',
        },
      },
    },
    {
      id: 'contractions-t3-09', tier: 3, format: 'clozebox',
      stemParts: ['After thinking of every possible excuse, Jarlath admitted the team ', ' trained harder before the final.'],
      options: [
        { text: "could've", misconception: null },
        { text: 'could of', misconception: 'of-not-ve' },
        { text: "couldn't", misconception: 'opposite-meaning' },
        { text: 'could have of', misconception: 'double-marked' },
        { text: 'coulda', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'The word "of" already appears earlier in this sentence — do not let that trick you into choosing it again for the gap.',
        'Un-squeeze the gap word: "could\'ve" means could HAVE, not could of.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Could\'ve" un-squeezes to "could have" — the earlier "of" (thinking OF excuses) is a completely different, correct use of that word, not a clue for the gap.',
        whyWrong: {
          'could of': '"Of" is never a squeeze of "have", however many times "of" appears elsewhere in the sentence.',
          "couldn't": 'That is the NEGATIVE — could NOT — the opposite meaning to what Jarlath admits here.',
          'could have of': 'That bolts "of" on as well — "have" only ever needs squeezing once, not twice.',
          coulda: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
    {
      id: 'contractions-t3-10', tier: 3, format: 'clozebox',
      stemParts: ['Regardless of the type of weather forecast, the coach admitted the match ', ' been postponed sooner.'],
      options: [
        { text: "should've", misconception: null },
        { text: 'should of', misconception: 'of-not-ve' },
        { text: "shouldn't", misconception: 'opposite-meaning' },
        { text: 'should have of', misconception: 'double-marked' },
        { text: 'shoulda', misconception: 'informal-nonstandard' },
      ],
      correctIndex: 0,
      hintSteps: [
        'The word "of" already appears twice earlier in this sentence — do not let that trick you into choosing it again for the gap.',
        'Un-squeeze the gap word: "should\'ve" means should HAVE, not should of.',
      ],
      explain: {
        rule: WEAPON_RULE,
        worked: '"Should\'ve" un-squeezes to "should have" — the earlier uses of "of" ("regardless of", "type of") are completely different, correct uses of that word, not a clue for the gap.',
        whyWrong: {
          'should of': '"Of" is never a squeeze of "have", however many times "of" appears elsewhere in the sentence.',
          "shouldn't": 'That is the NEGATIVE — should NOT — the opposite meaning to what the coach admits here.',
          'should have of': 'That bolts "of" on as well — "have" only ever needs squeezing once, not twice.',
          shoulda: 'That is a casual spoken shortcut, not standard written English.',
        },
      },
    },
  ],
};
