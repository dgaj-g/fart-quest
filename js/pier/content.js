// FART QUEST — js/pier/content.js (CONTENT agent)
// WHIFF-END PIER — captions, Gas Gremlin names and the VO id manifest.
// Pure data module: no DOM, no imports, node-testable in isolation.
//
// REWORK v2 (docs/PIER_REWORK.md §2): every line pool below was rewritten
// from scratch. Damien's verdict on v1 was "distracting and not funny" —
// v1 lines were wordy and generic (e.g. "Ahh, back again? Good. This pier
// runs on two things: candyfloss and quick sums. Pick your machine,
// petal!"). The house rules for every line in this file now are:
//   - max ~12 words (a little slack for a stage-direction full stop)
//   - specific beats vague — a real image (a waltzer, a fruit machine, a
//     stolen till), never a mood-word ("brilliant!", "amazing!")
//   - the surprise/punchline IS the line — it is not a description of a
//     punchline that's happening on screen elsewhere
//   - warm-never-mocking, UK English, never "fail"/"wrong"/"bad"
//   - Nana's boasts are ABSURD AND ESCALATING implausible 1974 feats
//   - Dave never speaks — his lines are capitalised stage directions, and
//     across the pool he steals increasingly outrageous things (mallet →
//     till → Nana's teeth → the scoreboard → the actual number 7)
//   - gremlins are squeaky and entirely proud of being wrong
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
  // Pier-wide hub welcome (js/screens/pier.js mountHub). Per-machine
  // welcomes live in `machine.<id>.welcome` below — keep this pool for the
  // hub, don't repurpose it.
  welcome: p('pier-nana-welcome', [
    "In 1974 I out-summed the whole fairground. Beat that, pet!",
    "I arm-wrestled a dodgem in 1974. Tables next, petal.",
    "1974: I beat a fruit machine at its own game.",
    "Nana once out-multiplied a calculator. It cried. Your go now.",
    "I taught a seagull long division in 1974. Off you pop.",
    "1974, darts champion, blindfolded, one flip-flop on fire. Your turn.",
    "I once won bingo using only my seven times table.",
    "Nana's beaten every machine on this pier. Yes, even that one.",
  ]),
  win: p('pier-nana-win', [
    "Get in, pet! Even 1974 me is impressed.",
    "That's a scorecard for the pier museum, petal!",
    "Whiff-End's got a new legend. It's you, hero.",
    "Nana's putting that scorecard straight in the window!",
    "You've out-summed Nana's best year. 1974, watch out.",
    "Magnificent, young stinker! Candyfloss is on the house.",
    "Faster than my 1974 waltzer record, that was!",
    "Sir Jarlath, you clever article. Pier royalty, you are.",
  ]),
  goldBeaten: p('pier-nana-gold-beaten', [
    "GOLD?! Nana's so shocked she just — *TRUMP* — ignore that.",
    "GOLD! I need a sit-down and a strong cup of tea.",
    "Never in fifty years — GOLD?! *TRUMP* — pure astonishment, pet.",
    "You've won GOLD and blown the roof off Nana's dignity. *TRUMP*",
    "GOLD, on my own pier?! Excuse the parp, petal.",
  ]),
  deluxeOn: p('pier-nana-deluxe-on', [
    "Eleven and twelve join in — proper pier royalty, those two.",
    "Deluxe ON! Welcome to the grown-up end of the boardwalk.",
    "The big numbers now, petal. Nana's already impressed.",
    "Eleven and twelve — always my favourites. Sneaky pair.",
    "Flick! Deluxe engaged. No going back now, young stinker.",
  ]),
  deluxeOff: p('pier-nana-deluxe-off', [
    "Deluxe off — back to the classic 1974 lineup.",
    "One to ten, nice and steady. Can't beat the classics.",
    "Elevens and twelves having a day off, petal.",
    "Back to basics! Even Nana started on the easy tables.",
    "Deluxe off. No shame in it, pet.",
  ]),
  tankClean: p('pier-nana-tank-clean', [
    "Not a gremlin left! Frame this moment, petal.",
    "Squeaky clean tank, squeaky clean sums. Beautiful work.",
    "You've flushed the lot! Cleanest since 1974, that.",
    "Every last gremlin gone. Nana might actually cry.",
    "Spotless! You've done Whiff-End proud, Sir Jarlath.",
  ]),
};

// ---------- The pier tannoy announcer ----------
export const announcer = {
  roundStart: p('pier-announcer-round-start', [
    "ROLL UP! One hero, one pier, ONE shot at glory!",
    "Lights up, gremlins down — let's GO!",
    "Hush now — the machine is WARMING UP!",
    "And AWAY we go, Whiff-End's finest hour — NOW!",
    "The tannoy never lies — this could be a big one!",
    "One brave nose-soldier steps up. LADIES AND GENTLEMEN!",
  ]),
  highScore: p('pier-announcer-high-score', [
    "STOP THE PIER! A NEW RECORD, ladies and gentlemen!",
    "Ring the bell — BRAND NEW HIGH SCORE!",
    "They've only gone and SMASHED the personal best!",
    "NEW RECORD! The pier will be talking for weeks!",
    "A genuine, gold-plated NEW BEST! Round of applause!",
    "The old record didn't stand a chance. Champion, folks!",
  ]),
};

// ---------- Dave (the seagull) — stage directions only, never speech ----------
// Escalating outrageous thefts across the pool (PIER_REWORK §2): mallet →
// till → Nana's teeth → the scoreboard → the actual number 7. Entry 6 keeps
// the "SCORECARD" wording gunge.js pattern-matches on
// (`dave.steal.find(/SCORECARD/i)`) for its end-of-round beat — do not
// rename that entry without checking gunge.js first.
export const dave = {
  steal: p('pier-dave-steal', [
    'DAVE THE SEAGULL SWOOPS IN. THE MALLET IS GONE.',
    'DAVE HAS THE TILL NOW. HE DID NOT ASK.',
    "DAVE IS AIRBORNE WITH NANA'S TEETH. SHE IS FURIOUS.",
    'THE SCOREBOARD HAS VANISHED. DAVE LOOKS ENTIRELY INNOCENT.',
    'DAVE HAS STOLEN THE NUMBER 7. MATHS FEELS HARDER NOW.',
    'TIME\'S UP. DAVE HOLDS UP THE SCORECARD, SURPRISINGLY WELL.',
  ]),
};

// ---------- Gremlins — squeaky menace, proud of wrongness ----------
export const gremlin = {
  taunt: p('pier-gremlin-taunt', [
    'SQUEAK! Missed me by a country mile!',
    "Nyeh-heh! Not even close, and I'm still here!",
    'Ha! I dodge smarter nose-soldiers before breakfast.',
    'SO close. SO very not. Squeak!',
    "Try again, hero — I'm not going anywhere.",
    'Did you even LOOK at the number? Nyeh!',
    'Gremlins one, hero nil. Squeak squeak!',
    "I'm practically untappable. Practically. Squeak!",
  ]),
  flushed: p('pier-gremlin-flushed', [
    'NOOO — not the swirly water! *GLUB*',
    "I'll be back, hero. Someday. Somehow. *GLUB*",
    'Wait, I can change! I— *SWIRL* — *GLUB*',
    'One last squeak echoes up the pipes. Silence.',
    'Curses! Flushed by a nose-soldier! *GLUB GLUB GLUB*',
    'The gremlin spins, squeaks once, and is gone.',
  ]),
};

// ---------- Per-machine welcomes + reactive beats (PIER_REWORK §2) ----------
// Every mode gets its own SHORT welcome (spoken once by that mode's own
// welcome card — see docs/PIER_REWORK.md §0/§2: the caption bar must stay
// silent on mode entry, never echo text already on the card) plus six
// reactive beats the mode can fire mid-play: combo, nearMiss, daveTheft,
// gremlinFlush, newPB, goldBeaten. Character-per-beat is fixed on purpose so
// the caption bar's avatar/tag stays meaningful:
//   welcome/newPB(-ish)/goldBeaten -> nana (she owns the pier, she boasts)
//   combo/newPB                    -> announcer (tannoy hypes the crowd)
//   nearMiss                       -> gremlin (squeaky, gloating, proud)
//   daveTheft                      -> dave (stage direction, never speech)
//   gremlinFlush                   -> gremlin (in-character reaction)
// teacups and tank have no PB/tiers per PIER_SPEC.md §7 — their newPB/
// goldBeaten pools are reframed as "table polished"/"flawless round"
// moments so the same six-beat shape still fits without inventing a score
// that doesn't exist.
//
// INTEGRATION NOTE FOR REVIEWERS: `js/screens/pier.js` (HUB-owned,
// out of CONTENT agent's scope) currently whitelists which content.js
// exports reach modes via the `pier.content` kit (`ensureContent()` only
// forwards nana/announcer/dave/gremlin) — `machine` below will NOT be
// visible as `pier.content.machine` until that whitelist is extended, OR
// each mode imports `machine` directly from this file the same way
// js/pier/modes/tank.js already does for `GREMLIN_NAMES` (a plain sibling
// import, not an edit to a file this agent doesn't own). Flagging this
// loudly rather than silently shipping data nothing can reach yet.
export const machine = {
  splat: {
    welcome: p('pier-nana-splat-welcome', [
      "Grab the mallet, pet — those gremlins won't splat themselves!",
      'Five holes, one mallet, endless squeaky trouble. Go on!',
      "Whack fast, whack true. Nana's timing you, petal.",
    ]),
    combo: p('pier-announcer-splat-combo', [
      'THREE SPLATS IN A ROW! THE CROWD GOES WILD!',
      "MEGA SPLAT! The mallet's practically glowing!",
      'A combo! A GENUINE combo! Whiff-End roars!',
    ]),
    nearMiss: p('pier-gremlin-splat-nearmiss', [
      'Ha! Grazed my hat and nothing more!',
      'SO close! I felt the breeze, hero!',
      'Nyeh! Nearly had me — nearly!',
    ]),
    daveTheft: p('pier-dave-splat-theft', [
      "DAVE SNATCHES THE MALLET MID-SWING. SHOW'S OVER.",
      'THE MALLET IS AIRBORNE. SO IS DAVE.',
      'DAVE LANDS ON A HOLE. THE MALLET IS HIS NOW.',
    ]),
    gremlinFlush: p('pier-gremlin-splat-flush', [
      'Flattened AND flushed?! Bit much, hero. *GLUB*',
      'One splat too many — down the pipes I go!',
      'Squashed, then swirled away. Rude. *GLUB*',
    ]),
    newPB: p('pier-announcer-splat-pb', [
      'NEW SPLAT RECORD! Somebody alert the newspapers!',
      "That's the fastest mallet in Whiff-End history!",
      'A BRAND NEW BEST! Ring the bell!',
    ]),
    goldBeaten: p('pier-nana-splat-gold', [
      "GOLD at the mallet cabinet?! *TRUMP* — pure shock, pet!",
      "Thirty splats?! Nana's never seen the like. *TRUMP*",
      'GOLD! I need a sit-down after that mallet work.',
    ]),
  },
  gunge: {
    welcome: p('pier-nana-gunge-welcome', [
      "Mind the plank, pet — it's wobbled since 1974.",
      "Answer quick or the gunge gets closer. Good luck!",
      "That plank's older than your dad. Sums first, petal.",
    ]),
    combo: p('pier-announcer-gunge-combo', [
      'THE WINCH CRANKS AGAIN! LISTEN TO THAT RATCHET!',
      "Answer after answer — the plank's climbing, folks!",
      'Ratchet, ratchet, RATCHET! What a run!',
    ]),
    nearMiss: p('pier-gremlin-gunge-nearmiss', [
      'Ooh, that plank creaked! Nearly had you there!',
      'SO close to a splash! Nyeh-heh!',
      'Careful — one wobble left in that plank!',
    ]),
    daveTheft: p('pier-dave-gunge-theft', [
      'DAVE PECKS AT THE ROPE. PURELY FOR SPORT.',
      'DAVE NICKS THE WINCH HANDLE MID-CRANK.',
      'A ROPE FIBRE SNAPS. DAVE LOOKS VERY PLEASED.',
    ]),
    gremlinFlush: p('pier-gremlin-gunge-flush', [
      'Flushed mid-gunge?! That is just showing off, hero.',
      'Down the pipes, gunge and all. *GLUB*',
      'Squelch, swirl, gone. Not my finest moment.',
    ]),
    newPB: p('pier-announcer-gunge-pb', [
      'NEW SURVIVAL RECORD! That plank never stood a chance!',
      'Longest stand yet! The gunge tank salutes you!',
      'A gunge-soaked NEW BEST! Magnificent scenes!',
    ]),
    goldBeaten: p('pier-nana-gunge-gold', [
      "GOLD in the gunge tank?! *TRUMP* — I'm overcome, pet!",
      "150 seconds?! Nana's never lasted that long. *TRUMP*",
      'GOLD! Somebody fetch me a towel and a biscuit.',
    ]),
  },
  ghost: {
    welcome: p('pier-nana-ghost-welcome', [
      "Race your own ghost, pet — 1974 me would've won.",
      'Down the tunnel, quick sums, one determined ghost.',
      "That lantern's not just for show. Off you pop!",
    ]),
    combo: p('pier-announcer-ghost-combo', [
      'SPEED LINES! The cart is FLYING through the tunnel!',
      "Answer after answer — the ghost can't keep up!",
      'Full speed ahead! What a run through the tunnel!',
    ]),
    nearMiss: p('pier-gremlin-ghost-nearmiss', [
      'The ghost nearly caught you there! Nyeh-heh!',
      'One station behind! SO close, hero!',
      "Ooh, it's on your tail! Nearly!",
    ]),
    daveTheft: p('pier-dave-ghost-theft', [
      'DAVE SWOOPS THROUGH THE TUNNEL AND STEALS THE LANTERN.',
      'THE CART GOES DARK. DAVE HAS THE LANTERN NOW.',
      'A BAT FLIES OFF WITH A NUMBER CARD. DAVE FOLLOWS, DELIGHTED.',
    ]),
    gremlinFlush: p('pier-gremlin-ghost-flush', [
      'Flushed mid-tunnel?! There was not even a toilet there!',
      'Swirled away between stations. Undignified. *GLUB*',
      'Gone before the next lamp post. *GLUB*',
    ]),
    newPB: p('pier-announcer-ghost-pb', [
      'NEW GHOST TRAIN RECORD! A brand new haunting begins!',
      'Fastest run yet! The old ghost has been overtaken!',
      'A NEW GHOST HAUNTS THE PIER! Magnificent!',
    ]),
    goldBeaten: p('pier-nana-ghost-gold', [
      "GOLD on the ghost train?! *TRUMP* — shocked speechless, pet!",
      "Fifty-five seconds?! Nana's own ghost is impressed. *TRUMP*",
      "GOLD! That tunnel's never moved so fast. Marvellous!",
    ]),
  },
  teacups: {
    welcome: p('pier-nana-teacups-welcome', [
      'Pick a table, pet — gentle spinning, no clock in sight.',
      'Lap one forwards, lap two backwards. Hop in!',
      'No rush here, petal. Just cups, tables, and tea.',
    ]),
    combo: p('pier-nana-teacups-combo', [
      'Three in a row, pet! Steady hands, sharp mind.',
      "Lovely spinning, petal! You're barely even wobbling.",
      "That's the way — cup after cup, calm as you like.",
    ]),
    nearMiss: p('pier-gremlin-teacups-nearmiss', [
      'Ooh, nearly! The cup wobbled just for you.',
      'So close! I felt that one spin past.',
      "Nearly — but I'm still here, squeaking.",
    ]),
    daveTheft: p('pier-dave-teacups-theft', [
      'DAVE LANDS ON THE RIM AND STEALS A TEACUP.',
      'A CUP HANDLE VANISHES. DAVE LOOKS EXTREMELY PLEASED.',
      'DAVE SIPS FROM THE SPARE CUP. UNINVITED.',
    ]),
    gremlinFlush: p('pier-gremlin-teacups-flush', [
      "Too much spinning — I'm dizzy AND flushed. *GLUB*",
      'The teacups did what the tank could not. *GLUB*',
      'Spun right off the saucer and down the drain!',
    ]),
    newPB: p('pier-nana-teacups-polish', [
      'Table polished, pet! Not a single wobble left.',
      "That table's gleaming now — every fact, spinning true.",
      'Polished to a shine! Onto the next table, petal.',
    ]),
    goldBeaten: p('pier-nana-teacups-gold', [
      'Both laps, forwards and backwards, spotless! *tiny trump* Oops.',
      "Perfect table, both directions! Nana's ever so proud.",
      'Not one wobble on either lap. Champion cups, petal.',
    ]),
  },
  tank: {
    welcome: p('pier-nana-tank-welcome', [
      "Every gremlin you've ever wobbled at is in here, pet.",
      "Have a look, then SPLAT 'em back where they came from.",
      'The tank fills itself the more sums you play. Go on.',
    ]),
    combo: p('pier-announcer-tank-combo', [
      "SPLAT AFTER SPLAT! The tank's clearing out fast!",
      'The gremlins are running out of places to hide!',
      "Round after round — the tank's nearly empty, folks!",
    ]),
    nearMiss: p('pier-gremlin-tank-nearmiss', [
      'Ooh, nearly caught! Slippery, aren\'t I?',
      'SO close to the plughole! Nyeh-heh!',
      'You will have to try harder than that, hero!',
    ]),
    daveTheft: p('pier-dave-tank-theft', [
      'DAVE STEALS THE NET. THE GREMLINS CHEER.',
      'DAVE PERCHES ON THE TANK. THE NET IS GONE.',
      "DAVE MAKES OFF WITH A GREMLIN'S TALLY CARD.",
    ]),
    gremlinFlush: p('pier-gremlin-tank-flush', [
      'Not the swirly water — not THAT, please! *GLUB*',
      'Flushed at last. Fair enough, really. *GLUB*',
      'Down the pipes, tally and all. *GLUB*',
    ]),
    newPB: p('pier-announcer-tank-flushcount', [
      'Another one flushed forever! The count keeps climbing!',
      "That's the tank looking cleaner already, petal!",
      'One more gremlin gone for good. Marvellous work!',
    ]),
    goldBeaten: p('pier-nana-tank-flawless', [
      'A flawless round?! GOLD-standard splatting, pet! *TRUMP*',
      "Not one miss the whole round?! Nana's astonished. *TRUMP*",
      'Perfect round! I need a sit-down after that. *TRUMP*',
    ]),
  },
};

// ---------- Gas Gremlins: one per fact family, a <= b, both in 1..12 ----------
// CRITICAL CORRECTNESS RULE (see PIER_SPEC.md §9 + build brief): every digit
// named in a gremlin's name/oneliner is EITHER the family's true product
// (a*b, computed — never guessed) OR one of the two operands (always <=12,
// safe to quote as "the fact itself"). Cross-checked mechanically by
// fq-tests/pier-content.test.mjs, which re-derives a*b from the family key
// and scans every digit-string in name+oneliner.
//
// Deliberately UNCHANGED in this rework (PIER_REWORK §2 only asked that names
// stay correct where touched — "do not break it"): these 78 entries were
// already specific, funny and mechanically verified, and the dad's
// "distracting and not funny" verdict was aimed at the wordy pier-wide voice
// pools above, not this table. Rewriting 78 hand-checked product-correct
// entries for a word-count trim alone was judged not worth the correctness
// risk — flagged here for reviewers rather than silently left unmentioned.
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

// Character-per-beat is fixed by design (see `machine` block comment above:
// welcome/newPB/goldBeaten -> nana, combo -> announcer (except teacups,
// kept gentle per PIER_SPEC.md §6), nearMiss/gremlinFlush -> gremlin,
// daveTheft -> dave). Every pool id already encodes its real character in
// the id's second segment, so VO_MANIFEST is built straight off that rather
// than duplicating the mapping in a second place that could drift from it.
const machineVoEntries = Object.values(machine).flatMap((beats) =>
  Object.values(beats).flatMap((pool) => pool.map((e) => ({
    id: e.id,
    text: e.text,
    character: e.id.split('-')[1],
  })))
);

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
  ...machineVoEntries,
];

export default {
  nana, announcer, dave, gremlin, machine, GREMLIN_NAMES, VO_MANIFEST,
};
