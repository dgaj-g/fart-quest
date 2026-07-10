// FART QUEST passage: passage-nonfiction-2 (Storybog)
// Non-fiction report WITH subheadings + Conclusion — "How Submarines Sink and Float".
// Authored content — implementation agents: read, never modify.
//
// Each question's explain.rule is the VERBATIM weapon rule of the Storybog topic
// that owns its skill tag (per CONTENT_SPECS_ENGLISH.md §Storybog):
//   lit -> reading-detective ("The Line-Number Lasso")
//   inf -> between-lines ("The Sniff-It-Out Snout")
//   vocab -> words-in-context ("The Swap-In Tester")
//   lang -> writers-tricks ("The Trick Detector")
//   text -> kinds-of-writing ("The Signpost Reader")

const LIT_RULE = 'The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm\'s reach.';
const INF_RULE = 'The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with \'always\', \'never\', \'entirely\'.';
const VOCAB_RULE = 'Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap.';
const LANG_RULE = 'A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has.';
const TEXT_RULE = 'Contents = where chapters start; index = where topics hide (back, A-Z); glossary = word meanings; bibliography = books used. Fiction is invented; non-fiction is fact.';

export default {
  id: 'passage-nonfiction-2',
  title: 'How Submarines Sink and Float',
  genre: 'nonfiction',

  lines: [
    'Imagine a giant machine that can disappear beneath the waves.',
    'A submarine is a strange, clever ship built for hiding underwater.',
    'It can float calmly on the surface like any ordinary boat.',
    'Minutes later, the very same vessel can vanish completely from sight.',
    'This report explains the brilliant science behind that amazing trick.',
    'Every fact in this report is real — so let\'s dive in and discover how.',
    'Why Things Float Or Sink',
    'Every object pushes aside some water when it enters the sea.',
    'Scientists call this pushed-aside water the object\'s displacement.',
    'If the displaced water weighs more than the object, it floats happily.',
    'If the object weighs more than the water it displaces, it sinks.',
    'A submarine\'s hull is stuffed with echoing spaces called ballast tanks.',
    'Air inside those tanks makes the submarine lighter than the sea.',
    'That is why an empty submarine floats calmly on the waves.',
    'How A Submarine Dives',
    'To dive, the crew opens huge valves along the submarine\'s sides.',
    'Seawater rushes into the ballast tanks and pushes out the air.',
    'The extra water makes the submarine heavier than the sea.',
    'Now the submarine slips smoothly downwards, just like a sinking apple.',
    'Wing-like fins called diving planes tilt to steer the vessel deeper.',
    'Crew members watch dials and screens to check the exact depth.',
    'A pressure hull, thick and strong, keeps the crushing sea outside.',
    'How A Submarine Rises Again',
    'Rising is simply the diving trick performed in cheerful reverse.',
    'Compressed air, stored in strong cylinders, blasts into the ballast tanks.',
    'This powerful blast shoves the seawater straight back out again.',
    'The submarine becomes lighter than the water it displaces once more.',
    'Slowly, gracefully, the huge machine rises back towards daylight.',
    'A tall periscope pokes above the waves before the hull appears.',
    'Crew members finally breathe fresh air and blink in the sunlight.',
    'Keeping The Crew Safe',
    'Living underwater for months brings dangers no ordinary ship must face.',
    'The thick pressure hull must never crack under the heavy sea.',
    'Engineers test every weld and seam again and again before sailing.',
    'Sonar sends out sound waves and listens closely for the echo.',
    'That echo tells the crew about rocks, ships and other submarines.',
    'Some submarines carry a nuclear reactor that powers them for months.',
    'Others use diesel engines and must surface often for fresh air.',
    'Every single person on board trusts the science keeping them safe.',
    'Conclusion',
    'Floating and sinking are simply a clever balancing act with water.',
    'Submarines control that balance perfectly using air, water, and strong tanks.',
    'This same trick lets a giant steel ship vanish and reappear.',
    'Next time you see the sea, remember what might be below.',
    'Somewhere down there, a submarine might be floating, diving or rising.',
  ],

  questions: [
    // ===== Q1-7: mcq5 (3 lit, 2 inf, 1 vocab, 1 text-feature) =====
    {
      id: 'passage-nonfiction-2-q1', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '25',
      stem: 'According to line 25, what is blasted into the ballast tanks to make the submarine rise?',
      options: [
        { text: 'Compressed air', misconception: null },
        { text: 'Seawater', misconception: 'confuses-diving-process' },
        { text: 'Diesel fuel', misconception: 'irrelevant-detail' },
        { text: 'Sound waves', misconception: 'confuses-sonar' },
        { text: 'Crew members', misconception: 'absurd-literal' },
      ],
      correctIndex: 0,
      explain: {
        rule: LIT_RULE,
        worked: 'Line 25 says "Compressed air, stored in strong cylinders, blasts into the ballast tanks." Go back to line 25 and the answer is right there — compressed air.',
        whyWrong: {
          'Seawater': 'Seawater floods IN in lines 16–18, when the submarine DIVES — that is the opposite job.',
          'Diesel fuel': 'Diesel fuel is mentioned later as one way to power a submarine, not what fills the tanks.',
          'Sound waves': 'Sound waves are what sonar uses in lines 35–36, not what fills a ballast tank.',
          'Crew members': 'The crew watch and work the controls — they are never blasted into any tank!',
        },
      },
      hintSteps: [
        'The line number is a gift — go back to line 25 and put your finger on it.',
        'Read the sentence slowly: what word comes right before "stored in strong cylinders"?',
      ],
    },
    {
      id: 'passage-nonfiction-2-q2', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '34',
      stem: 'According to line 34, what do engineers do to every weld and seam before a submarine sails?',
      options: [
        { text: 'Test them again and again', misconception: null },
        { text: 'Paint them a bright colour', misconception: 'unrelated-action' },
        { text: 'Only check them once', misconception: 'contradicts-text' },
        { text: 'Replace them with new metal', misconception: 'overreach' },
        { text: 'Ask the crew to check them', misconception: 'wrong-subject' },
      ],
      correctIndex: 0,
      explain: {
        rule: LIT_RULE,
        worked: 'Line 34 says "Engineers test every weld and seam again and again before sailing." The line number points straight to the answer.',
        whyWrong: {
          'Paint them a bright colour': 'Nothing about paint appears in line 34 — that is invented.',
          'Only check them once': 'The text says AGAIN AND AGAIN, which means far more than once.',
          'Replace them with new metal': 'The text says they TEST the welds, not replace them.',
          'Ask the crew to check them': 'Line 34 names ENGINEERS as the ones doing the testing, not the crew.',
        },
      },
      hintSteps: [
        'Line numbers are gifts — go back to line 34 and put your finger on it.',
        'Read the exact action word the engineers do to the weld and seam — it is repeated twice for emphasis.',
      ],
    },
    {
      id: 'passage-nonfiction-2-q3', tier: 2, format: 'mcq5', skill: 'lit', lineRef: '37-38',
      stem: 'According to lines 37–38, which two types of power are mentioned for submarines?',
      options: [
        { text: 'Nuclear and diesel', misconception: null },
        { text: 'Petrol and electric', misconception: 'invented-pair' },
        { text: 'Wind and solar', misconception: 'invented-pair' },
        { text: 'Steam and coal', misconception: 'invented-pair' },
        { text: 'Solar and battery', misconception: 'invented-pair' },
      ],
      correctIndex: 0,
      explain: {
        rule: LIT_RULE,
        worked: 'Lines 37–38 name a "nuclear reactor" and "diesel engines" as the two kinds of power — go back and check.',
        whyWrong: {
          'Petrol and electric': 'Lines 37–38 never mention this pair — only nuclear and diesel appear in the text.',
          'Wind and solar': 'Lines 37–38 never mention this pair — only nuclear and diesel appear in the text.',
          'Steam and coal': 'Lines 37–38 never mention this pair — only nuclear and diesel appear in the text.',
          'Solar and battery': 'Lines 37–38 never mention this pair — only nuclear and diesel appear in the text.',
        },
      },
      hintSteps: [
        'Go back to lines 37–38 and put your finger on the two power words.',
        'One line names a reactor; the next line names an engine that needs fresh air — what are they called?',
      ],
    },
    {
      id: 'passage-nonfiction-2-q4', tier: 2, format: 'mcq5', skill: 'inf', lineRef: '8-14',
      stem: 'Based on lines 8–14, why does an empty submarine float on the surface?',
      options: [
        { text: 'Because it is lighter than the water it displaces', misconception: null },
        { text: 'Because submarines are built from very light metal', misconception: 'plausible-misreading' },
        { text: 'Because submarines always float no matter what', misconception: 'absolute-language' },
        { text: 'Because the crew paddles it upward', misconception: 'irrelevant-action' },
        { text: 'Because the ballast tanks are full of seawater', misconception: 'confuses-diving-state' },
      ],
      correctIndex: 0,
      explain: {
        rule: INF_RULE,
        worked: 'Lines 8–14 explain that an object floats when it weighs LESS than the water it displaces. An empty submarine is full of air, which makes it light — so it displaces more weight in water than it weighs, and floats. No single line states this outright — you must add the clues together.',
        whyWrong: {
          'Because submarines are built from very light metal': 'The text never says the METAL is light — it says the submarine is light because of the AIR inside it, not its material.',
          'Because submarines always float no matter what': 'The text says the opposite — lines 15–22 show a submarine can also sink. Watch for "always"!',
          'Because the crew paddles it upward': 'Nothing about paddling appears anywhere in the report.',
          'Because the ballast tanks are full of seawater': 'Full tanks are what make a submarine SINK (lines 16–18) — the opposite of floating.',
        },
      },
      hintSteps: [
        'The text gives clues, not answers — add together what lines 8–14 say about weight and displaced water.',
        'An empty submarine is full of air. Is air heavy or light? What does that do to the whole vessel\'s weight?',
      ],
    },
    {
      id: 'passage-nonfiction-2-q5', tier: 3, format: 'mcq5', skill: 'inf', lineRef: '32-35',
      stem: 'Based on lines 32–35, why must engineers test the pressure hull\'s welds and seams so carefully?',
      options: [
        { text: 'Because a weak weld could let the crushing sea pressure break the hull', misconception: null },
        { text: 'Because sonar cannot work if the hull has any marks on it', misconception: 'plausible-misreading' },
        { text: 'Because a single crack would sink every submarine in the world', misconception: 'absolute-language' },
        { text: 'Because the paint would peel off in salty water', misconception: 'irrelevant-detail' },
        { text: 'Because the crew are not allowed to leave the submarine', misconception: 'unrelated-fact' },
      ],
      correctIndex: 0,
      explain: {
        rule: INF_RULE,
        worked: 'Line 32 warns that living underwater "brings dangers no ordinary ship must face", line 22 says the pressure hull "keeps the crushing sea outside", and line 33 warns it "must never crack under the heavy sea". Put those clues together: a weak weld could crack under all that crushing, heavy pressure, so engineers test everything twice over in line 34 to stop that danger before it starts.',
        whyWrong: {
          'Because sonar cannot work if the hull has any marks on it': 'Sonar (lines 35–36) uses sound waves and has nothing to do with weld strength — that mixes up two different systems.',
          'Because a single crack would sink every submarine in the world': 'That is way too big a claim — the text only talks about ONE submarine\'s safety, never "every submarine in the world".',
          'Because the paint would peel off in salty water': 'Paint is never mentioned anywhere in the report.',
          'Because the crew are not allowed to leave the submarine': 'Nothing in lines 32–35 talks about rules for leaving — that is invented.',
        },
      },
      hintSteps: [
        'The text gives clues, not answers — what has already been said about the pressure hull and the sea\'s crushing weight?',
        'Beware answers with "every" or "always" — re-read lines 32–35 for what is actually AT RISK if a weld fails.',
      ],
    },
    {
      id: 'passage-nonfiction-2-q6', tier: 2, format: 'mcq5', skill: 'vocab', lineRef: '9',
      stem: 'In line 9, what does the word \'displacement\' mean, as the text explains it?',
      options: [
        { text: 'The water pushed aside by an object', misconception: null },
        { text: 'How deep the water is', misconception: 'unrelated-meaning' },
        { text: 'How fast a submarine can travel', misconception: 'unrelated-meaning' },
        { text: 'The weight of the crew on board', misconception: 'unrelated-meaning' },
        { text: 'The length of the ballast tanks', misconception: 'unrelated-meaning' },
      ],
      correctIndex: 0,
      explain: {
        rule: VOCAB_RULE,
        worked: 'Line 9 tells you directly: "Scientists call this pushed-aside water the object\'s displacement." Swap "displacement" out for "the pushed-aside water" and the sentence still makes perfect sense — that is the true meaning surviving the swap.',
        whyWrong: {
          'How deep the water is': 'Swap it in: "the object\'s how-deep-the-water-is" makes no sense — depth is never what displacement means here.',
          'How fast a submarine can travel': 'Speed is a different idea altogether — line 9 is only talking about pushed-aside water.',
          'The weight of the crew on board': 'Crew weight is never mentioned in line 9 — displacement is about water, not people.',
          'The length of the ballast tanks': 'Tank length never appears in line 9 — displacement is the water an object pushes aside.',
        },
      },
      hintSteps: [
        'Swap each meaning INTO line 9 and read it aloud — only the true meaning survives the swap.',
        'Look at the words right before "displacement" — what kind of water is being described?',
      ],
    },
    {
      id: 'passage-nonfiction-2-q7', tier: 2, format: 'mcq5', skill: 'text', lineRef: '5-6',
      stem: 'Lines 5–6 explain the science of submarines and promise every fact is real. What kind of writing is this report?',
      options: [
        { text: 'A non-fiction report, built entirely from fact', misconception: null },
        { text: 'A fiction story, made up by the writer', misconception: 'confuses-genre' },
        { text: 'A poem, built from rhyme and verse', misconception: 'poetry-confusion' },
        { text: 'A play script, showing characters speaking', misconception: 'wrong-text-type' },
        { text: 'A glossary, just a list of word meanings', misconception: 'irrelevant' },
      ],
      correctIndex: 0,
      explain: {
        rule: TEXT_RULE,
        worked: 'Line 6 states "Every fact in this report is real" and line 5 promises to explain real science. Fiction is invented; non-fiction is fact — and this report is packed with true submarine science, so it is a non-fiction report.',
        whyWrong: {
          'A fiction story, made up by the writer': 'Fiction is invented — but lines 5–6 promise real, true facts, not an invented story.',
          'A poem, built from rhyme and verse': 'This report is written in ordinary sentences, not rhyme or verse — that rules out poetry.',
          'A play script, showing characters speaking': 'There are no characters speaking here, just a writer explaining facts.',
          'A glossary, just a list of word meanings': 'A glossary is only a list of word meanings — this report explains a whole topic, not just definitions.',
        },
      },
      hintSteps: [
        'Fiction is invented; non-fiction is fact — which one does line 6 promise?',
        'Look for clues about rhyme, characters speaking, or word lists — none of those appear in lines 5–6.',
      ],
    },

    // ===== Q8-13: wordentry write-ins =====
    {
      id: 'passage-nonfiction-2-q8', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '18',
      stem: 'Copy the exact four-word phrase from line 18 that tells you what happens to the submarine\'s weight when the tanks fill with water.',
      hint: 'copy the exact phrase (four words)',
      maxLen: 40,
      accept: ['makes the submarine heavier'],
      exact: true,
      explain: {
        rule: LIT_RULE,
        worked: 'Line 18 says "The extra water makes the submarine heavier than the sea." The four words asked for are "makes the submarine heavier" — copied exactly as they appear.',
      },
      hintSteps: [
        'Go back to line 18 and put your finger on the words right after "water".',
        'Copy exactly four words in a row — no more, no less — and match the spelling exactly.',
      ],
    },
    {
      id: 'passage-nonfiction-2-q9', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '16-22',
      stem: 'Besides \'dive\', find one other word in lines 16–22 that means going down or lower.',
      hint: 'one word',
      maxLen: 20,
      accept: ['downwards', 'deeper', 'sinking'],
      explain: {
        rule: VOCAB_RULE,
        worked: 'Swap in "downwards" (line 19), "sinking" (line 19), or "deeper" (line 20) and the sentence keeps its true meaning of moving lower — all three work as another word for going down.',
      },
      hintSteps: [
        'Swap your word into the sentence and read it aloud — does it still mean going lower?',
        'Look at lines 19 and 20 for a word describing which way the submarine slips, or how far the diving planes steer it.',
      ],
    },
    {
      id: 'passage-nonfiction-2-q10', tier: 3, format: 'wordentry', skill: 'lang', lineRef: '28',
      stem: 'In line 28, what word class (part of speech) is \'gracefully\'?',
      hint: 'one word',
      maxLen: 20,
      accept: ['adverb'],
      explain: {
        rule: LANG_RULE,
        worked: '"Gracefully" describes HOW the huge machine rises — that job (describing a verb) makes it an adverb. Spot the pattern: most adverbs that describe HOW something happens end in "-ly", just like this one.',
      },
      hintSteps: [
        'Ask what JOB "gracefully" is doing — is it naming a thing, or describing HOW something happens?',
        'Words that describe HOW a verb happens (rises gracefully) are adverbs — many end in "-ly", like "gracefully", "quickly", or "slowly".',
      ],
    },
    {
      id: 'passage-nonfiction-2-q11', tier: 2, format: 'wordentry', skill: 'text', lineRef: null,
      stem: 'What is the name for the list of word meanings often found at the back of a non-fiction book, to explain any tricky words?',
      hint: 'one word',
      maxLen: 20,
      accept: ['glossary'],
      explain: {
        rule: TEXT_RULE,
        worked: 'The rule says it plainly: glossary = word meanings. A glossary sits at the back of a non-fiction book and explains any tricky words the reader might not know.',
      },
      hintSteps: [
        'Think about the reference tools from the rule: contents, index, glossary, bibliography — which one is all about word meanings?',
        'It usually sits near the very back of a non-fiction book, after the main writing ends.',
      ],
    },
    {
      id: 'passage-nonfiction-2-q12', tier: 2, format: 'wordentry', skill: 'lit', lineRef: '12',
      stem: 'Copy the exact two-word phrase from line 12 that names the special spaces inside a submarine\'s hull.',
      hint: 'copy the exact phrase (two words)',
      maxLen: 30,
      accept: ['ballast tanks'],
      exact: true,
      explain: {
        rule: LIT_RULE,
        worked: 'Line 12 names them directly: "echoing spaces called ballast tanks." The line number points straight to the two words: ballast tanks.',
      },
      hintSteps: [
        'Go back to line 12 and put your finger on the words right after "called".',
        'Copy exactly two words, matching the spelling in the text.',
      ],
    },
    {
      id: 'passage-nonfiction-2-q13', tier: 2, format: 'wordentry', skill: 'vocab', lineRef: '32-39',
      stem: 'Find one word in lines 32–39 that means \'break apart\' or \'split\'.',
      hint: 'one word',
      maxLen: 20,
      accept: ['crack'],
      explain: {
        rule: VOCAB_RULE,
        worked: 'Swap "crack" into line 33 in place of "break apart" — "must never crack under the heavy sea" keeps exactly the same true meaning.',
      },
      hintSteps: [
        'Swap your word into line 33 and read it aloud — does it still describe what the hull must never do?',
        'Look for the one action word in line 33 that describes a hull failing under pressure.',
      ],
    },
  ],
};
