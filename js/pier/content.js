// FART QUEST — js/pier/content.js (CONTENT agent)
// WHIFF-END PIER — captions, Gas Gremlin names and the VO id manifest.
// Pure data module: no DOM, no imports, node-testable in isolation.
//
// VO id scheme (PIER_SPEC.md §9): every line-pool entry is {id, text} and the
// id IS the exact future filename stem, e.g. id 'pier-nana-welcome-01' will
// one day be `audio/vo/vo-pier-nana-welcome-01.m4a`. Unlike the Whiffbeard
// pools (which pick a random TAKE of the same line via a shared prefix),
// each Pier line here is its own single recording — variety comes from
// `pier.say()` picking a random ENTRY from the pool, not random takes of one
// entry. `ctx.audio.vo(entry.id)` resolves silently while no file exists yet
// (see js/audio.js) so this ships caption-only with zero code change needed
// later.
//
// Tone (PIER_SPEC.md §9, BUILD_SPEC.md §11):
//   Nana Windbreaker — boastful, warm, on Jarlath's side, "pet"/"petal",
//     forever name-drops 1974 (the pier's/her own golden year).
//   The tannoy announcer — pier showman, big theatrical energy.
//   Dave (the seagull) — NEVER speaks; his lines are stage-direction
//     captions in capitals, describing what he just did.
//   Gremlins — squeaky menace, deeply proud of causing mischief.
// Written text NEVER says fail/wrong/bad, never sarcasm, UK English.

function p(idBase, lines) {
  return lines.map((text, i) => ({
    id: `${idBase}-${String(i + 1).padStart(2, '0')}`,
    text,
  }));
}

// ---------- Nana Windbreaker ----------
export const nana = {
  welcome: p('pier-nana-welcome', [
    "Well would you LOOK who's back at my pier, pet! Nana's had this arcade spinning since 1974 — pick a machine and show me what you're made of!",
    "Ohhh, Sir Jarlath! I once beat the whole boardwalk at darts blindfolded in 1974 — but times tables? That's MY real speciality, petal.",
    "Welcome to Whiff-End, young stinker! Every machine on this pier has seen a champion or two — today, that's going to be YOU.",
    "In 1974 I could do my seven times table upside down on a waltzer. Get in there and give me a run for my money, pet!",
    "There's my favourite nose-soldier! Nana's polished every one of these machines herself — mind the sticky bits and go get 'em.",
    "Ahh, back again? Good. This pier runs on two things: candyfloss and quick sums. Pick your machine, petal!",
    "You know what they say on this boardwalk — a gremlin a day keeps the rust away! Go on then, off you pop!",
    "Whiff-End's been mine since before your granny was born, pet. Show it some respect — and show those gremlins some MATHS!",
  ]),
  win: p('pier-nana-win', [
    "Get IN, petal! That's the kind of scorecard Nana puts up in the window!",
    "Ohhh you absolute legend of the boardwalk! I haven't seen sums that fast since 1974!",
    "Magnificent! You've done Whiff-End Pier proud, young stinker!",
    "That's my nose-soldier! Pin that scorecard up — everyone's going to hear about this one.",
    "Would you LOOK at that! Nana's practically glowing brighter than the pier lights!",
    "Cracking stuff, pet! You've earned a sit-down and a 99 for that.",
    "Sir Jarlath, you clever article — that performance deserves a fanfare, and Nana's arranging one.",
    "Smashing! Whatever they're teaching you, keep at it — you're a credit to this pier!",
  ]),
  goldBeaten: p('pier-nana-gold-beaten', [
    "GOLD?! Nana hasn't been this shocked since 1974 — hang on, pet, just let me— *TRUMP* — sorry, that just slipped out with the excitement!",
    "Well BLOW me down — GOLD, on my own pier?! Excuse the parp, petal, that was pure astonishment!",
    "GOLD! I need a sit-down, a cup of tea and a lie-down — that was SPECTACULAR, young stinker!",
    "Never in fifty years of running this arcade — GOLD?! *TRUMP* — ignore that, I'm simply overcome!",
    "Sir Jarlath, you've gone and won GOLD, and Nana's gone and let a little parp out from the shock of it. Marvellous!",
  ]),
  deluxeOn: p('pier-nana-deluxe-on', [
    "Ooooh, the Deluxe lever! Eleven and twelve times tables now, pet — not for the faint-hearted, but I know you can manage it!",
    "Deluxe mode ON! Welcome to the grown-up end of the boardwalk, young stinker.",
    "That's the spirit! Eleven and twelve join the fun now — proper pier royalty, those two.",
    "Flick that lever and you're playing with the big numbers now, petal. Nana's impressed already.",
    "Deluxe engaged! Eleven and twelve were always my favourites — sneaky little devils, the pair of them.",
  ]),
  deluxeOff: p('pier-nana-deluxe-off', [
    "Deluxe off — back to the classic 1974 lineup, pet. Can't beat the classics.",
    "There we go, nice and steady — one to ten, just how the pier's always run.",
    "Deluxe switched off. Save the elevens and twelves for another day, petal.",
    "Back to basics! Sometimes the old machines are still the best ones, young stinker.",
    "Deluxe off. No shame in it, pet — even Nana started on the easy tables.",
  ]),
  tankClean: p('pier-nana-tank-clean', [
    "Would you look at that tank — sparkling! Not a single gremlin left in there, pet. Marvellous work!",
    "The Gremlin Tank's spotless, young stinker! Nana might just frame this moment.",
    "Every last gremlin flushed! You've cleaned this pier up better than I ever could, petal.",
    "Not a gremlin in sight! That tank hasn't been this clean since 1974, and that's saying something.",
    "Squeaky clean tank, squeaky clean sums! Beautiful work, Sir Jarlath.",
  ]),
};

// ---------- The pier tannoy announcer ----------
export const announcer = {
  roundStart: p('pier-announcer-round-start', [
    "LAAADIES and GENTLEMEN! Step right up — the numbers are LIVE and the pier is WATCHING!",
    "ROLL UP, ROLL UP! One brave nose-soldier, ONE chance to make Whiff-End Pier proud!",
    "Ohhh it's a BIG one, folks! Lights up, gremlins down — let's GO!",
    "The tannoy never lies — this could be a record-breaking round, ladies and gentlemen!",
    "Hush now, hush now — the machine is WARMING UP! Give it your best, hero!",
    "And AWAY we go! Whiff-End Pier's finest hour starts... NOW!",
  ]),
  highScore: p('pier-announcer-high-score', [
    "STOP THE PIER! We have ourselves a NEW RECORD, ladies and gentlemen!",
    "Would you believe it — a BRAND NEW HIGH SCORE! Somebody ring the bell!",
    "Ohhhh they've only gone and SMASHED the personal best! Magnificent scenes!",
    "NEW RECORD! Whiff-End Pier will be talking about THIS one for weeks!",
    "That's a scorecard for the history books, folks — a genuine, gold-plated NEW BEST!",
    "The old record didn't stand a chance! Round of applause, please, for our champion!",
  ]),
};

// ---------- Dave (the seagull) — stage directions only, never speech ----------
export const dave = {
  steal: p('pier-dave-steal', [
    'DAVE THE SEAGULL SWOOPS IN AND STEALS THE MALLET.',
    'DAVE HAS LANDED ON THE SCOREBOARD. HE DOES NOT CARE.',
    'A LOUD SQUAWK. THE MALLET IS GONE. DAVE LOOKS DELIGHTED.',
    'DAVE THE SEAGULL STROLLS OFF WITH THE MALLET LIKE HE OWNS THE PLACE.',
    "TIME'S UP — AND SO IS DAVE, MID-AIR, MALLET IN BEAK.",
    'DAVE THE SEAGULL HOLDS UP THE SCORECARD. HE IS SURPRISINGLY GOOD AT THIS.',
  ]),
};

// ---------- Gremlins — squeaky menace, proud of wrongness ----------
export const gremlin = {
  taunt: p('pier-gremlin-taunt', [
    'SQUEAK! Too slow, too slow!',
    'Nyeh-heh! Missed me by a MILE!',
    "Ha! I've dodged smarter nose-soldiers than you!",
    'Ooh, SO close — and yet SO very not!',
    'Squeak squeak! Try again, hero!',
    'Nyeh! Did you even LOOK at the number?',
    'Ha-HA! Gremlins one, hero nil!',
    "Squeak! I'm practically UNTAPPABLE!",
  ]),
  flushed: p('pier-gremlin-flushed', [
    'NOOO — not the swirly water! Anything but the swirly— GLUB.',
    "SQUEEEEAK! I'll be back, hero — someday — somehow— *GLUB*",
    'Wait, wait, I can change! I— *SWIRL* — *GLUB*',
    'The gremlin spins, squeaks once more, and vanishes with a gurgle.',
    'Curses! Flushed by a nose-soldier! *GLUB GLUB GLUB*',
    'One last squeak echoes up from the pipes... then silence.',
  ]),
};

// ---------- Gas Gremlins: one per fact family, a <= b, both in 1..12 ----------
// CRITICAL CORRECTNESS RULE (see PIER_SPEC.md §9 + build brief): every digit
// named in a gremlin's name/oneliner is EITHER the family's true product
// (a*b, computed — never guessed) OR one of the two operands (always <=12,
// safe to quote as "the fact itself"). Cross-checked mechanically by
// fq-tests/pier-content.test.mjs, which re-derives a*b from the family key
// and scans every digit-string in name+oneliner.
const GREMLIN_TABLE = [
  // a = 1 (twelve families: the shy ones — barely even gremlins)
  { a: 1, b: 1, name: 'Nib the One', oneliner: 'Believes 1 × 1 makes him a whole entire number — technically correct, desperately unimpressed by himself.' },
  { a: 1, b: 2, name: 'Tuppence the Two', oneliner: 'Struts around insisting 1 × 2 is worth a whole 2p — practically a fortune, to him.' },
  { a: 1, b: 3, name: 'Threepenny Nell', oneliner: 'Rattles proudly around the arcade, worth exactly 1 × 3 — that’s 3 — and never lets anyone forget it.' },
  { a: 1, b: 4, name: 'Corner Cronk the Four', oneliner: 'Sulks in the corner of the tank, worth a measly 1 × 4 — 4 — and finds that deeply beneath him.' },
  { a: 1, b: 5, name: 'High-Five Enda', oneliner: 'High-fives every gremlin he meets, chuffed that 1 × 5 comes to a whole 5.' },
  { a: 1, b: 6, name: 'Sixpenny Fizz', oneliner: 'Fizzes with pride that 1 × 6 makes 6 — practically a jackpot on Whiff-End Pier.' },
  { a: 1, b: 7, name: 'Lucky Sev', oneliner: 'Calls himself lucky for being worth 1 × 7 — that’s 7 — though nobody remembers asking.' },
  { a: 1, b: 8, name: 'Wonky Ochto the Eight', oneliner: 'Wobbles sideways like a fallen 8, forever insisting 1 × 8 equals 8 on purpose.' },
  { a: 1, b: 9, name: 'Nifty Niner Nora', oneliner: 'Nine and terribly pleased about it: 1 × 9 makes 9, thank you very much.' },
  { a: 1, b: 10, name: 'Round Ronan the Ten', oneliner: 'A perfectly round 10 — 1 × 10 — and will absolutely not let you forget it.' },
  { a: 1, b: 11, name: 'Twin-Stick Nibble', oneliner: 'Two matching sticks side by side: 1 × 11 makes 11, and he stands extremely straight to prove it.' },
  { a: 1, b: 12, name: 'Dapper Dinny the Dozen', oneliner: 'Calls himself a whole dozen — 1 × 12 is 12 — and expects a round of applause.' },
  // a = 2 (eleven families)
  { a: 2, b: 2, name: 'Squaresy Sal the Four', oneliner: 'Doubled herself once and became a smug little 4 — 2 × 2 — terribly full of herself about it.' },
  { a: 2, b: 3, name: 'Half-Dozen Hazel', oneliner: 'Reckons half a dozen — 2 × 3 makes 6 — is basically pier royalty.' },
  { a: 2, b: 4, name: 'Eight-Legs Ethel', oneliner: 'Eight wobbly legs, eight wobbly excuses, and 2 × 4 always somehow adds up to 8.' },
  { a: 2, b: 5, name: 'Tenpin Tessie', oneliner: 'Knocks down every excuse in the arcade, and still only ever manages 2 × 5 — a perfect 10.' },
  { a: 2, b: 6, name: 'Rowdy Ronnie the Dozen', oneliner: 'Doubles his six mates into one very cocky dozen — 2 × 6 is 12 — and never lets them forget it.' },
  { a: 2, b: 7, name: 'Fortnight Frankie', oneliner: 'Named himself after a fortnight, being worth exactly 2 × 7 — a tidy 14.' },
  { a: 2, b: 8, name: 'Sweet Sixteen Sheila', oneliner: 'Thinks 2 × 8 making 16 makes her devastatingly glamorous. It does not. She is a gremlin.' },
  { a: 2, b: 9, name: 'Eighteen-Wheeler Wes', oneliner: 'Rolls into the tank like a lorry, hauling nothing but the number 18 — 2 × 9.' },
  { a: 2, b: 10, name: 'Score Sammy', oneliner: 'A whole score of trouble — 2 × 10 is 20 — and doesn’t he just know it.' },
  { a: 2, b: 11, name: 'Double-Deuce Deirdre', oneliner: 'Twenty-two twin troubles rolled into one squeaky menace: 2 × 11 makes 22.' },
  { a: 2, b: 12, name: 'Two-Dozen Tony', oneliner: 'Two whole dozens of pure fairground cheek — 2 × 12 is 24 — and he’s proud of every bit of it.' },
  // a = 3 (ten families)
  { a: 3, b: 3, name: 'Trebles Tricia the Nine', oneliner: 'Tripled herself into a strutting little 9 — 3 × 3 — and curtsies about it constantly.' },
  { a: 3, b: 4, name: 'Bingo Bev the Dozen', oneliner: 'Calls the tank to attention: 3 × 4, house! A full dozen — 12 — every single time.' },
  { a: 3, b: 5, name: 'Quarter-Past Quinn', oneliner: 'Struts around the pier clock claiming 3 × 5 always lands on quarter-past — that’s 15 minutes of pure smugness.' },
  { a: 3, b: 6, name: 'Auntie Eighteen Orla', oneliner: 'Fusses over everyone like an auntie, forever reminding them 3 × 6 makes a tidy 18.' },
  { a: 3, b: 7, name: 'Blackjack Bertie', oneliner: 'Deals himself a winning hand every time: 3 × 7 makes 21, and he never once busts.' },
  { a: 3, b: 8, name: 'Toffee-Apple Tam the Twenty-Four', oneliner: 'Sticky, smug, and sells himself as 3 × 8 — a whole 24 — for the price of a toffee apple.' },
  { a: 3, b: 9, name: 'Curly Cassidy the Twenty-Seven', oneliner: 'Curls up proudly at 3 × 9, which comes to 27, and won’t uncurl until someone admires it.' },
  { a: 3, b: 10, name: 'Thirty-Something Sylvia', oneliner: 'Refuses to say her exact age, but everyone knows 3 × 10 makes her a solid 30.' },
  { a: 3, b: 11, name: 'Thirty-Three RPM Rodge', oneliner: 'Spins at the exact speed of Nana’s favourite old vinyl record: 3 × 11 makes 33.' },
  { a: 3, b: 12, name: 'Dirty Thirty-Six Duke', oneliner: 'Struts about grubby and proud, boasting that 3 × 12 makes a whopping 36.' },
  // a = 4 (nine families)
  { a: 4, b: 4, name: 'Squarely Sixteen Sid', oneliner: 'Perfectly square in every direction: 4 × 4 makes 16, and he’s insufferably neat about it.' },
  { a: 4, b: 5, name: 'Twenty Past Petra', oneliner: 'Always fashionably late by exactly 4 × 5 minutes — that’s 20 — and blames the tide.' },
  { a: 4, b: 6, name: 'Costa Twenty-Four Cleo', oneliner: 'Sunbathes on the pier boasting 4 × 6 makes 24, and not a degree less.' },
  { a: 4, b: 7, name: 'Leap-Year Larry the Twenty-Eight', oneliner: 'Claims his birthday only comes once every leap year, but insists 4 × 7 is always exactly 28.' },
  { a: 4, b: 8, name: 'Thirty-Two Teeth Terry', oneliner: 'Grins with every single one of his 4 × 8 teeth — a full set of 32 — and never once brushes them.' },
  { a: 4, b: 9, name: 'Squeaky Thirty-Six Nadia', oneliner: 'Squeaks so loudly the whole pier hears it: 4 × 9 makes 36, and she’s utterly certain of it.' },
  { a: 4, b: 10, name: 'Forty Winks Frank', oneliner: 'Naps constantly on the job, dreaming only of 4 × 10 — a cosy 40.' },
  { a: 4, b: 11, name: 'Double-Four Dolores', oneliner: 'Matching digits, matching menace: 4 × 11 makes 44, and she finds that delightfully tidy.' },
  { a: 4, b: 12, name: 'Forty-Eight Hour Fergal', oneliner: 'Claims he needs a full 4 × 12 hours’ sleep — that’s 48 — after every single splat.' },
  // a = 5 (eight families)
  { a: 5, b: 5, name: 'Quarter-Century Quigley', oneliner: 'Celebrates his quarter-century birthday every single day: 5 × 5 makes 25, forever.' },
  { a: 5, b: 6, name: 'Dirty Thirty Debs', oneliner: 'Struts the pier at a scandalous 5 × 6 — a full 30 — and loves every grubby minute of it.' },
  { a: 5, b: 7, name: 'Flash Thirty-Five', oneliner: 'Zooms past the fact stall boasting 5 × 7 makes 35, gone before anyone can double-check.' },
  { a: 5, b: 8, name: 'Ruby Forty Rosie', oneliner: 'Wears a ruby-red badge for reaching a proud 5 × 8 — a solid 40.' },
  { a: 5, b: 9, name: 'Forty-Five RPM Fintan', oneliner: 'Spins at single-record speed: 5 × 9 makes 45, just like Nana’s old jukebox.' },
  { a: 5, b: 10, name: 'Golden Fifty Gladys', oneliner: 'Gleams like the pier’s golden lights, proud that 5 × 10 makes a magnificent 50.' },
  { a: 5, b: 11, name: 'Fifty-Five and Fabulous Fifi', oneliner: 'Struts the boardwalk convinced 5 × 11 — a stylish 55 — is the finest number ever invented.' },
  { a: 5, b: 12, name: 'Diamond Sixty Doris', oneliner: 'Sparkles brightest of all the gremlins, boasting 5 × 12 makes a dazzling 60.' },
  // a = 6 (seven families)
  { a: 6, b: 6, name: 'Treble-Six Tex', oneliner: 'Rolls into the tank shaking dice, certain 6 × 6 always comes up 36.' },
  { a: 6, b: 7, name: 'Forty-Two Fenwick', oneliner: 'Claims to know the meaning of life, the universe and everything: it’s 6 × 7, which makes 42, obviously.' },
  { a: 6, b: 8, name: 'Late-Night Forty-Eight Fizz', oneliner: 'Never sleeps before the small hours, insisting 6 × 8 makes a wide-awake 48.' },
  { a: 6, b: 9, name: 'Fifty-Four Ferry', oneliner: 'Chugs back and forth across the tank all day, worth exactly 6 × 9 — a steady 54.' },
  { a: 6, b: 10, name: 'Minute-Hand Sixty Mo', oneliner: 'Ticks round the pier clock all day, proud that 6 × 10 makes a full 60.' },
  { a: 6, b: 11, name: 'Route Sixty-Six Reg', oneliner: 'Claims he’s driven every road in the kingdom, and swears 6 × 11 makes exactly 66.' },
  { a: 6, b: 12, name: 'Seventy-Two Hour Cyril', oneliner: 'Boasts he can hold his squeak for a full 6 × 12 hours — a marathon 72.' },
  // a = 7 (six families)
  { a: 7, b: 7, name: 'Forty-Niner Fitz', oneliner: 'Pans for gremlin gold in the gunge tank, convinced 7 × 7 makes a glittering 49.' },
  { a: 7, b: 8, name: 'Trevor the Fifty-Six', oneliner: 'The pier’s most notorious gremlin: 7 × 8 makes 56, and Trevor never lets anyone forget it.' },
  { a: 7, b: 9, name: 'Route Sixty-Three Sid', oneliner: 'Runs the express bus round the tank, worth exactly 7 × 9 — a swift 63.' },
  { a: 7, b: 10, name: 'Platform Seventy Pearl', oneliner: 'Waits at the end of the pier boasting 7 × 10 makes a grand 70.' },
  { a: 7, b: 11, name: 'Lucky Sevens Ivy', oneliner: 'Pulls the arcade lever hoping for double luck: 7 × 11 makes 77, her favourite number twice over.' },
  { a: 7, b: 12, name: 'Eighty-Four Doreen', oneliner: 'Struts about the tank claiming 7 × 12 makes a magnificent 84, and curtsies to prove it.' },
  // a = 8 (five families)
  { a: 8, b: 8, name: 'Chessboard Squig the Sixty-Four', oneliner: 'Hops across an imaginary chessboard, chuffed that 8 × 8 covers exactly 64 squares.' },
  { a: 8, b: 9, name: 'Late Bus Seventy-Two Bex', oneliner: 'Always arrives fashionably late, insisting 8 × 9 makes a solid 72.' },
  { a: 8, b: 10, name: 'Eighty Days Delia', oneliner: 'Claims she once went round the whole pier in exactly 8 × 10 days — a tidy 80.' },
  { a: 8, b: 11, name: 'Piano Keys Pip', oneliner: 'Tinkles proudly along an imaginary keyboard: 8 × 11 makes 88, one key for every boast.' },
  { a: 8, b: 12, name: 'Ninety-Six Nibbles', oneliner: 'Nibbles the edges of every scorecard, worth exactly 8 × 12 — a cheeky 96.' },
  // a = 9 (four families)
  { a: 9, b: 9, name: 'Eighty-One Ottoline', oneliner: 'Squares up to anyone who doubts her: 9 × 9 makes a proud 81.' },
  { a: 9, b: 10, name: 'Ninety Degrees Nuala', oneliner: 'Stands bolt upright at a perfect right angle, boasting 9 × 10 makes exactly 90.' },
  { a: 9, b: 11, name: 'Ninety-Nine Flake', oneliner: 'The pier’s favourite: 9 × 11 makes 99, and she always insists on a chocolate flake to go with it.' },
  { a: 9, b: 12, name: 'One-Oh-Eight Odile', oneliner: 'Boasts a number so big it needs three digits: 9 × 12 makes 108, and she counts every one aloud.' },
  // a = 10 (three families)
  { a: 10, b: 10, name: 'Century Cyd', oneliner: 'Struts about like a cricket legend: 10 × 10 makes a whole century — 100.' },
  { a: 10, b: 11, name: 'One-Ten Ivy', oneliner: 'Boasts an extra ten on top of a century: 10 × 11 makes 110, and she’s very smug about the bonus.' },
  { a: 10, b: 12, name: 'One-Twenty Ida', oneliner: 'Claims to be worth more than any two gremlins combined: 10 × 12 makes a whopping 120.' },
  // a = 11 (two families — Deluxe only)
  { a: 11, b: 11, name: 'Eleven-Plus Elsie', oneliner: 'Passed her own made-up exam with flying colours: 11 × 11 makes 121, and there’s a certificate to prove it.' },
  { a: 11, b: 12, name: 'One Three Two Tilly', oneliner: 'Recites her own number like a phone code: 11 × 12 makes 132, digit by smug digit.' },
  // a = 12 (one family — Deluxe only)
  { a: 12, b: 12, name: 'Gross Gertie', oneliner: 'The biggest boast on the whole pier: 12 × 12 makes a whole gross — that’s 144, and she never stops mentioning it.' },
];

export const GREMLIN_NAMES = Object.fromEntries(
  GREMLIN_TABLE.map((g) => [`${g.a}x${g.b}`, { name: g.name, oneliner: g.oneliner }])
);

// ---------- VO manifest (drives future TTS generation — PIER_SPEC.md §9) ----------
function toVoEntries(character, entries) {
  return entries.map((e) => ({ id: e.id, text: e.text, character }));
}

export const VO_MANIFEST = [
  ...toVoEntries('nana', nana.welcome),
  ...toVoEntries('nana', nana.win),
  ...toVoEntries('nana', nana.goldBeaten),
  ...toVoEntries('nana', nana.deluxeOn),
  ...toVoEntries('nana', nana.deluxeOff),
  ...toVoEntries('nana', nana.tankClean),
  ...toVoEntries('announcer', announcer.roundStart),
  ...toVoEntries('announcer', announcer.highScore),
  ...toVoEntries('dave', dave.steal),
  ...toVoEntries('gremlin', gremlin.taunt),
  ...toVoEntries('gremlin', gremlin.flushed),
];

export default { nana, announcer, dave, gremlin, GREMLIN_NAMES, VO_MANIFEST };
