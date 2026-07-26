# WHIFF-END PIER — REWORK v2 (binding; supersedes PIER_SPEC.md where they conflict)
Damien's verdict on v1 (26 Jul 2026): **"entirely underwhelming"**. He is right. This document is the fix contract. Read `docs/PIER_SPEC.md` first for the world/mechanics (still valid), then this for what must change. Craft bar = `js/anims/fractions.js` and the Scout-Tech gallery, NOT v1 of the pier.

## 0. The diagnosis (measured, not guessed — do not re-litigate)
Damien's Safari window ≈ **1000×540 CSS**. At that size:
- `.splat-stage` computes to **254px tall with `overflow-y: hidden`**; the welcome card `.splat-card-panel` is **390px tall at top:-68px** → the card is sliced through the middle and **the START button is physically unreachable** (`document.scrollHeight === innerHeight`, so no scroll rescue). Screenshot-confirmed by Damien.
- Gunge: the **GO key's bottom is 569px in a 540px viewport (29px below the fold), page cannot scroll** → "I have to scroll sometimes to get the answer put in" (it is worse than scrolling: it is unreachable).
- Hub at 1180×820: the DELUXE lever sits **115px below the fold**.
- Gremlin Tank on a **fresh profile** (zero gremlins ever) renders **"SPARKLING CLEAN! … Marvellous work!" + full confetti party** → "when entered, just tells you you've finished the game". Confirmed.
- Nana's line is printed **twice simultaneously** (welcome card body AND the bottom caption bar) on every mode entry → "text bubbles … distracting".

## 1. THE LAYOUT LAW (highest priority; applies to hub + all five modes + every overlay)
1. **Nothing interactive may ever sit outside the viewport.** Every pier screen and every state of it must fit entirely within **1000×540**, **1024×640** and **1180×745** with zero scrolling.
2. Screen structure is a fixed flex column, exactly:
   `.pier-screen { height:100dvh (100vh fallback line ABOVE it); display:flex; flex-direction:column; overflow:hidden }`
   → `[HUD bar: flex:none]` `[stage: flex:1 1 auto; min-height:0]` `[action dock: flex:none]`.
   `min-height:0` on the stage is mandatory (without it flex refuses to shrink and pushes the dock off-screen — that is the v1 bug).
3. **The action dock (numpad / answer controls / primary buttons) never shrinks and is never clipped.** Size keys with `clamp()` off available height; keys stay **≥60px** at every test size. If height is tight, the STAGE gives up space, never the dock.
4. **Overlays (welcome, end card, ceremonies, scorecards) render at screen level**, not inside the stage: `position:fixed; inset:0`, card centred using the **`translate:` property (NOT `transform:`)** — v1 of the app already learned this (fq-v11 coach-card bug: `animation-fill-mode:both` pins `transform` forever and kills a transform-based centring). Card gets `max-height: calc(100dvh - 32px); overflow-y:auto`.
5. `overflow:hidden` is permitted ONLY on containers holding pure decoration. Any container that can hold a control must not clip it.
6. **Committed automated proof:** `fq-tests/pier-layout.test.mjs` is not enough (no DOM); instead build `fq-verify/pier-layout.html` — a harness page that mounts each pier screen/state at each of the three viewport sizes and asserts every interactive element's bounding rect is fully inside the viewport and ≥60px on its smaller axis. It must print PASS/FAIL per screen. The orchestrator will run it in a browser. Also list, in your report, every state you enumerated (welcome / playing / mid-feedback / end card / ceremony / empty state).

## 2. COMEDY DIRECTION (his "text bubbles … distracting and not funny")
- **Never display the same line in two places at once.** The caption bar must not echo text already on screen. On mode entry the welcome card speaks; the caption bar stays silent.
- **The caption bar is for reactive beats only** — a combo, a theft, a taunt, a flush — never instructions, never narration of what the player just read. Short, auto-dismissing, out of the way of controls.
- **Rewrite every line pool in `js/pier/content.js`.** v1 lines are wordy and generic ("Ahh, back again? Good. This pier runs on two things: candyfloss and quick sums. Pick your machine, petal!"). Rules: **max ~12 words**, specific beats vague, surprise beats warmth-by-itself. Nana's boasts must be **absurd and escalating** (increasingly implausible 1974 feats). Dave steals **increasingly outrageous objects** (the mallet → the till → Nana's teeth → the scoreboard → the actual number 7). Gremlins are proud of being wrong.
- **The funny must be on the screen, not in a paragraph about the screen.** Physical comedy (things flattening, splatting, falling, fleeing) carries it; text is a punchline, not a description.
- Warm-never-mocking still binding. UK English. No line may block or overlap a control.

## 3. PER-MACHINE OVERHAUL
### splat — hammer is "barely visible; flashes too quickly"
Big mallet (≥140px) swings in on an **arc** with anticipation (wind-up ~120ms) → impact → **hold on the squashed frame ~350ms** so it is unmissable. On impact: screen shake, radial splat-star, the gremlin **flattens to a pancake** and pings off-screen spinning, goo splatter persists on the hole for a few seconds. Combo tiers visibly **grow the mallet** (and rename it — e.g. MALLET → SLEDGE → THE BIG ONE) with an escalating sound. Miss = gremlin blows a raspberry and **ducks with a cheeky wiggle**. Nothing under 250ms may carry meaning.
### gunge — "concept is great but the animation is primitive"
Real gunge: a **thick wobbling surface** (layered animated waves), bubbles that **rise, swell and pop**, drips down the tank glass. The plank **visibly tilts, creaks and strains** as the gauge falls; rope fibres fray at low health. Death is a **multi-stage set piece**: plank snaps → slow-mo fall (brief) → **huge splash with flying droplets** → hero surfaces, gunge sliding off in gloops → Dave lands on his head holding the scorecard. Correct answers: the winch **cranks up a notch** with a satisfying ratchet and a puff.
### ghost — "entirely uninspiring" (rebuild the feel; keep the mechanic)
Make it a ride you are actually **moving through**: parallax tunnel layers rushing past (walls, cobwebs, sleepers), lantern light wobbling, speed lines on a correct answer. The **PB ghost is a visible cart** ahead/behind with a glowing lantern — position it by real split comparison, and when it is within one station, escalate ("👻 IT'S ON YOUR TAIL!"). Daft-spooky set dressing that reacts (bedsheet ghosts flapping, a skeleton reciting a times table, a bat that carries the wrong answer off). Finish = **photo-finish** against the ghost with a clear win/lose beat. First run: you are chased by nothing — Nana's dare instead.
### teacups — visibly spin
The cups actually rotate between facts; lap 2 spins the other way (make the direction reversal obvious and silly). Keep it gentle and untimed.
### tank — "just tells you you've finished the game"
**Three distinct states, never confused:**
- **Never-had-gremlins (fresh):** NOT a celebration. Empty tank + net + Nana explaining the tank fills itself as he plays: "Nothing in the tank yet, pet. Go and make some mistakes." Primary action = a button straight to Splat-a-Gremlin; secondary = a free practice round (mixed facts) so the screen is never a dead end. **No confetti, no "Marvellous work!"**
- **Has gremlins:** the aquarium — gremlins **swim/bob with personality**, name + fact + tally.
- **Earned-clean (`pierFlushed > 0` and none left):** THAT is when the sparkling-clean celebration and confetti fire.
### hub
Fits 1000×540 with the DELUXE lever visible without scrolling. Cabinets may be a tighter grid; the lever must be on-screen.

## 4. MUSIC + MUTE
- **Mute button in the pier HUD** (always visible, ≥60px, obvious icon 🔊/🔇). It toggles the app's music setting via the existing audio/settings API (persisted, consistent with the Settings screen — do not invent a parallel setting). Mute must silence immediately.
- **New track.** v1's "Carnival Rides" was chosen from metadata by an agent who could not hear it; Damien says it is awful. Fetch **4 candidate CC0/public-domain tracks** (verify each licence statement on its page; OpenGameArt CC0 filter, Kevin MacLeod CC0-only items, Pixabay-style PD equivalents — reject anything not clearly CC0/PD). Save them as `audio/music/pier-candidate-{1..4}.mp3` in the repo working tree AND build **`fq-verify/pier-music-audition.html`** — a plain page with a labelled play button per candidate plus title/source/licence, so **Damien picks by ear**. Keep the current pier.mp3 in place until he chooses. Report the candidates with their sources.

## 5. MAP SHORTCUT
Permanent **🎡 pier button in the map HUD bar** (beside the collection/settings chips, ≥60px) → `ctx.go('#/pier')`, always enabled, works regardless of scroll position. The coast landmark stays.

## 6. DEFINITION OF DONE
`node --check` clean; imports resolve; the layout harness PASSES at all three viewport sizes for every enumerated state; fresh-profile tank shows the first-visit state (no confetti); no duplicated caption text anywhere; mute silences music; map HUD shortcut navigates; sw.js precache regenerated + `CACHE_V` → `fq-v18`; `.nojekyll` untouched. Orchestrator plays every machine at 1000×540 before push.
