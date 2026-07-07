# CONTENT SPECS — English (19 topics + 6 passages)
Same binding quality bar as maths spec. English topics are BANK-driven (curated items, not generators) except where noted. Lessons follow the built exemplars' card pattern; example sentences in lessons must be fresh (never reuse bank items). All items UK English, P6-appropriate, no US spellings ever presented as correct.

## Item schemas (contract with ENGINE_SPEC_2 formats)
```js
// errorspot (punctuation & spelling drills)
{ id, tier:1|2|3, format:'errorspot',
  segments:[{text},{text},{text},{text}],   // flows as ONE natural sentence
  faultyIndex: 0|1|2|3|null,                // null = the N item ("no mistake")
  explain:{ rule, worked, whyN? }, hintSteps:[2] }
// clozebox (grammar best-word)
{ id, tier, format:'clozebox', stemParts:['before ','after'], options:[{text,misconception}], correctIndex, explain, hintSteps }
// wordentry / selecttwo / mcq5: per ENGINE_SPEC_2 §A / BUILD_SPEC §7
```
**Bank sizes per drill topic:** T1 ×12, T2 ×12, T3 ×10 (T3 = the subtlest errors + ~40% N-items + wordentry where the topic suits). N-items overall ≈ 20% of each errorspot bank, distributed so a child can never learn "there's always a mistake".
**Construction rules (errorspot):** EXACTLY one deliberate error in non-N items — the other three segments must be independently verified clean (this is where sloppy authoring dies; the blind-solve protocol below catches it). Error must belong to THIS topic (a spelling error never appears in a punctuation item). Sentences 8–16 words, concrete kid-world scenarios (football, dogs, school trips, farts allowed occasionally), segment breaks at natural phrase boundaries, the error NOT always in the same segment position (track distribution: each position 20–30%, N ≈ 20%).

### Fable-authored exemplars (match these exactly in spirit)
```js
// errorspot T2 (apostrophes topic)
{ tier:2, format:'errorspot',
  segments:[{text:'The two dogs'},{text:'buried they’re bones'},{text:'behind the shed'},{text:'before lunchtime.'}],
  faultyIndex:1,
  explain:{ rule:'An apostrophe either OWNS something or SQUEEZES letters out.',
    worked:'“they’re” un-squeezes to “they are” — “buried they are bones” is nonsense. The dogs OWN the bones: their.',
    whyN:null },
  hintSteps:['Un-squeeze any apostrophe word: does the sentence still make sense?',
             '“They’re” = “they are”. Try reading segment B out loud with “they are”…'] }
// errorspot T3 N-item (spelling topic)
{ tier:3, format:'errorspot',
  segments:[{text:'It is necessary'},{text:'to separate the two rabbits'},{text:'because they definitely'},{text:'cannot behave together.'}],
  faultyIndex:null,
  explain:{ rule:'Sometimes nothing stinks. Check each word against its rule before you accuse anyone.',
    worked:'necessary (one collar, two socks), separate (there’s A RAT in sep-A-RAT-e), definitely (finite in the middle) — all correct. ALL CLEAN!' },
  hintSteps:['Check the three famous troublemakers: necessary, separate, definitely.',
             'All three are spelt correctly here… so what’s the honest answer?'] }
// clozebox T2 (grammar)
{ tier:2, format:'clozebox', stemParts:['Jarlath ate his sprouts ', ' he could reach the pudding.'],
  options:[{text:'so that',misconception:null},{text:'although',misconception:'wrong-conjunction-contrast'},
           {text:'because of',misconception:'preposition-not-conjunction'},{text:'so what',misconception:'sound-alike'},
           {text:'in order',misconception:'incomplete-phrase'}],
  correctIndex:0,
  explain:{ rule:'A conjunction joins two ideas — pick the one whose MEANING joins them correctly.',
    worked:'He ate the sprouts WITH THE PURPOSE of reaching pudding: “so that”.',
    whyWrong:{ 'although':'That signals a contrast — but there’s no contrast here.',
      'because of':'Needs a thing after it (“because of the rain”), not a whole sentence.',
      'so what':'That’s a cheeky question, not a joiner!',
      'in order':'Incomplete — it would need “to”.' } },
  hintSteps:['Read the whole sentence with each word in the gap — your ear will spit out the wrong ones.',
             'WHY did he eat the sprouts? The answer word shows purpose…'] }
```

## Topics
### Punctuation Pits (4) — all errorspot-led
- **capitals-endmarks** (Full-Stop Phil) — weapon **The Capital Cap**: "Names, places, days, months, I — and every sentence start — wear the cap." Teach: sentence starts; proper nouns incl. earth vs **E**arth, days/months, titles; . ? ! choice by sentence job. Errors: missing capital (proper noun mid-sentence), rogue capital on common noun, wrong end mark, missing end mark. T3 adds ?-vs-! judgement and N-items.
- **commas-colons** (Comma Chameleon) — weapon **The Pause Paddle**: "A comma is a small pause that keeps a list or a sentence tidy; a colon announces what's coming." Teach: list commas (incl. no comma before final "and" at KS2 norm), comma after fronted openers ("After tea, …"), colon introducing a list, semi-colon as a super-comma between two linked sentences (light). Errors: missing list comma, comma splice-ish overreach kept simple (comma where full stop needed), colon misuse, multi-line list items (the papers' hard trap) at T3.
- **apostrophes** (It's-Its the Confused) — weapon **The Owner-or-Squeezer Badge**: "An apostrophe either OWNS something (the dog's ball) or SQUEEZES letters out (it's = it is). Its without an apostrophe = belonging." Teach: possession singular/plural (day's / days'), contraction apostrophes, its/it's in depth, never-for-plurals ("banana's for sale" crime). Errors: its/it's, plural-apostrophe crime, position before/after s, her's/their's fabrications.
- **speech-brackets** (The Air-Quoter) — weapon **The Speech Trap**: "Speech marks hug ONLY the spoken words — and the punctuation stays inside the hug." Teach: opening/closing speech marks, punctuation inside, capital at speech start, brackets for extras, hyphen basics (well-known). Errors: punctuation outside marks, missing closer, capital missing at speech start, bracket unclosed.
- **REGION BOSS gauntlet**: mixed errorspot across all four, real-paper pacing.

### The Spelling Sewers (3) — errorspot + wordentry
- **spelling-rules** (I-Before-E-leen) — weapon **The Rule Wrench**: "i before e except after c (when it rhymes with bee); drop the e when adding -ing; y turns to ies." Teach those three + doubling (running, hopped) + -tion/-sion sounds. Errors: rule-broken words hidden in sentences; T3 wordentry: "write the -ing form of 'hope'" (accept hoping only — the hopping/hoping contrast taught).
- **homophones** (Two-Too the Twinned) — weapon **The Sound-Twin Separator**: "Same sound, different job: there = place, their = belonging, they're = they are. Prove it by un-squeezing." Teach: there/their/they're, where/were/wear, to/too/two, hear/here, him/hymn, no/know, loose/lose (rhymes with goose). Errors: wrong twin in context. T3: subtler pairs (affect/effect kept OUT — beyond spec need; practice/practise IN as noun/verb, gently).
- **tricky-words** (Neccessarry the Unspellable) — weapon **The Memory Hook**: "Hard words need a hook: nec-ESS-ary has one collar and two socks. Make the word ridiculous and it sticks." Teach: hooks for necessary, separate, definitely, beautiful, because (Big Elephants…), Wednesday, February, favourite/colour UK set. Errors: these words misspelt (only ONE per item); high N-rate (they LOOK wrong when right — that's the skill).
- **REGION BOSS**: mixed spelling errorspot + a few wordentry "fix the word".

### Grammar Grotto (6) — clozebox-led, mcq5 for identification
- **parts-of-speech** (The Noun Hound) — weapon **The Word-Job Scanner**: "Ask what JOB the word does in THIS sentence: naming = noun, doing = verb, describing = adjective, how = adverb." Teach all Big Seven with job-questions; the context-shift trap (words that are nouns here, verbs there — "the light fades" vs "light the fire"); find-ALL-the-adverbs style at T3 (selecttwo). Items: identify the [class] word (mcq5 of words from a sentence); which word-class is X doing HERE; clozebox needing a preposition/conjunction chosen by ear.
- **tenses** (Yesterday's Gary) — weapon **The Time-Machine Test**: "Say it out loud with 'yesterday' or 'tomorrow' — your ear knows: seek becomes sought, find becomes found." Teach: simple present/past; irregular pasts (seek/sought, find/found, catch/caught, teach/taught, go/went, write/wrote); will/would awareness only. Items: clozebox past forms; spot-the-tense mcq; T3 wordentry ("write the past tense of 'teach'").
- **contractions** (Could've Colin) — weapon **The Un-Squeezer**: "Stretch it back out to check: could've = could HAVE. 'Could of' is always an imposter." Items: clozebox could've/should've/they're/won't; errorspot-style could-of hunts (as clozebox distractor "could of" — never presented as correct); T3 wordentry un-squeeze ("write 'won't' in full" → accept "will not").
- **plurals-collectives** (The Geese Police) — weapon **The Herd Word Hoard**: "Some plurals break the rules (geese, oxen, mice) and groups get one name: a herd, a flock, a swarm." Items: clozebox irregular plurals (geese/oxen/mice/children/teeth/sheep); collective-noun mcq (herd/flock/swarm/pack/shoal); T3: rarer sets + wordentry plural-of.
- **comparatives** (The Goodest Boy) — weapon **The -Er/-Est Ladder**: "Two things: -er (or 'more'). Three or more: -est (or 'most'). Never both at once — and it's fewer for things you can count." Items: clozebox good/better/best, bad/worse/worst, more/most beautiful; fewer/less judgement; "more better" crime spotting. Small bank (T1 10 / T2 10 / T3 8) — weight matches exam.
- **sentence-parts** (Paragraph Pete) — weapon **The Building Blocks Kit**: "Phrase = a few words; sentence = a complete thought with a verb; paragraph = sentences about one idea; chapter = paragraphs about one part of the story." Items: is-it-a-sentence mcq; what-comes-next-in-size ordering; where would a new paragraph start (mini 4-sentence text, mcq). Small bank.
- **REGION BOSS**: pure exam-style clozebox run + a POS-in-context tail.

### Storybog (6 skill topics + passages)
Skill topics teach with a SHARED mini-passage in the lesson (8-10 lines, authored fresh per lesson), then battles draw tagged questions from the passage pool (ENGINE_SPEC_2 §D). Weapons:
- **reading-detective** (Inspector Sniff) — **The Line-Number Lasso**: "The line number is a gift — go BACK to the line, put your finger on it, and the answer is within arm's reach."
- **between-lines** (Nudge-Nudge Ned) — **The Sniff-It-Out Snout**: "The text gives clues, not answers. Ask: what do these clues ADD UP to? Beware answers with 'always', 'never', 'entirely'."
- **words-in-context** (Synonym Sinead) — **The Swap-In Tester**: "Swap each option INTO the sentence and read it aloud — only the true meaning survives the swap."
- **writers-tricks** (Simile Emily) — **The Trick Detector**: "A simile compares with like or as; a metaphor says it IS; a list piles things up to overwhelm you — always ask what EFFECT it has."
- **poetry** (Rhymin' Simon) — **The Verse Decoder**: "A verse is a paragraph of poetry; rhymes usually land at line-ends. Read a poem like a song: for story first, rhyme second."
- **kinds-of-writing** (Contents McIndex) — **The Signpost Reader**: "Contents = where chapters start; index = where topics hide (back, A-Z); glossary = word meanings; bibliography = books used. Fiction is invented; non-fiction is fact." (This topic also carries its own small mcq bank — book-parts questions don't need passages.)

**Passages (6 originals, `data/passages/`):** 2 prose fiction (adventure w/ a light mystery ending CLOSED not ambiguous; a funny animal tale), 2 non-fiction reports WITH subheadings + a Conclusion (models the papers' "Earthquakes": one on Venus flytraps? pick kid-gold topics: "The World's Smelliest Flower" — thematically perfect and real (Rafflesia/titan arum!) and "How Submarines Sink and Float"), 2 poems (14-16 lines, quatrains, one narrative-funny "The Dragon Who Couldn't Roar" style, one descriptive with strong imagery). Fiction/nonfiction 40-55 numbered lines (≈350-450 words); every 5th line will be numbered by the engine.
**Per passage exactly 13 questions** mirroring papers: Q1-7 mcq5 (≈3 lit, 2 inf, 1 vocab-in-context, 1 lang/verse/text-feature) then Q8-13 write-in `wordentry` (exact-phrase extraction with word-count stated, find-another-X in lines N-M, word-class of a quoted word, count-the-subheadings [non-fiction], rhyme-pair extraction [poems]). EVERY question carries a lineRef except whole-text ones (max 2 per passage). All questions tagged with their skill for topic battles. Accept arrays generous on case/punctuation, strict on words (per format spec).
**Distractor rule for inference mcqs:** one "plausible misreading" (the near-miss), one absolute-language bait ('always/entirely'), rest clearly wrong on re-reading — mirror the real papers' style.

## Verification protocol (non-negotiable, applies to every English item + passage question)
1. **Schema validation** (node script): shapes, tier counts, exactly-one-faulty-segment or null, option uniqueness, correctIndex in range, N-rate 15-25%, error-position distribution 20-30% per segment.
2. **Blind double-solve:** two independent solver agents receive each item WITHOUT the key (errorspot solvers are asked "find any error, or say none"; clozebox/mcq solvers pick; wordentry solvers write an answer checked against accept). Both must match the key. Any disagreement → a third senior solve + author fix or item deletion. Target: 100% of shipped items double-solve clean.
3. **UK-spelling + banned-words lint** (fail/wrong/stupid never in kid-facing text; US spellings only ever inside a deliberate spelling-error segment, flagged as such).
4. **Passage read-through by the design lead (Fable)** before ship — every passage, every question.
