# Scout-Tech helper animations — design briefs (all topics)

Written by Fable 5, 9 Jul 2026, after Damien approved the Slide-o-Matic PoC and asked for
an interactive visualiser in EVERY topic's Scout Report. Goal: Jarlath **manipulates the
concept with his hands** before the try-cards and battles test it.

## The contract (identical for every module)

File: `js/anims/<topicId>.js`, ES module, zero deps beyond `./_kit.js`:

```js
import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';
export default {
  id: '<topicId>',
  title: 'THE MACHINE NAME',          // matches the brief below
  mount(host, ctx) { /* build DOM under host */ return function cleanup() {}; }
};
```

- `ctx = { audio, sfx, complete() }`. Call `ctx.complete()` once when the guided items are
  all done (makes CARRY ON pulse). NEVER gate progress on it.
- Build everything inside ONE `el('div','anim-stage')` appended to host. Per-anim CSS goes
  through `injectCss(id, css)` with every selector prefixed by a unique 3-4 letter code
  (e.g. `.pvw-` for place-value) — never restyle shared classes.
- Reuse kit widgets: `bubble()` for explainer popups (with the topic creature's PNG at
  `assets/monsters/<creature-kebab-name>.png` — verify the file exists with ls; omit img if
  missing), `toast()` for small notes, `party()`/`sparkleBurst()` for wins,
  `sfx.tick/tock/drop/pop/sparkle/win/ui/nudge/blip/thud/whoosh` for sound.
- Handle host widths 640–980px; relayout on window resize (debounced ~180ms) must abandon
  any live drag/tween first. Cleanup must remove listeners and cancel every timer/rAF.

## The five hard rules (each cost us a real bug in the PoC — non-negotiable)

1. NO transform transitions while a pointer drag is live; track the pointer 1:1
   (use `makeDrag`, apply positions directly).
2. Any feedback that quotes a number/word/state may only appear when the display is
   showing EXACTLY that state (gate on state equality, not on event diffs).
3. Repeat-tap controls act on where the UI is HEADING (pending target), not where the
   last animation settled.
4. All movement between states uses `tween()` (it survives rAF throttling). Never a bare
   requestAnimationFrame loop, never CSS transitions for state you must read back.
5. Warm-never-mocking copy, UK English, mark-scheme vocabulary from the topic file. Read
   `data/topics/<id>.js` FIRST and reuse its exact metaphors/rule wording verbatim.
   The weapon `rule` string is sacred — quote it exactly if shown.

Every brief below: **Core** (the manipulable), **Guided** (missions; expected states are
authoritative — test them), **Aha** (the moment that must land). Numbers in briefs are
worked and correct; if you believe one is wrong, recheck — then trust the maths, and if
still wrong, fix it and say so in your report.

---

## number-swamp

### place-value — "THE THRONE WEIGH-IN" (prefix pvw)
**Core:** One big digit tile (e.g. 7) + the throne row (TTh…U). Child drags the digit onto
any throne; a huge brass value-meter rolls to digit×throne (7 on H → 700) with rising
blips; the occupied throne physically swells. Zero seat-warmers auto-fill lower thrones
(gold, like Slide-o-Matic).
**Guided:** (1) "Make the 7 worth seven hundred" → H. (2) "Make the 4 worth 4,000" → Th.
(3) "Put the 3 where it beats 900" → Th or higher (accept both, meter proves 3000>900).
(4) Two tiles 5 and 2: "build a number worth more than 400" (5 on H beats it; 2 on H
fails — meter shows 200, warm nudge).
**Aha:** same digit, wildly different value — the THRONE does the work.

### mental-maths — "THE TEN-FRIEND TRAMPOLINE" (prefix tft)
**Core:** A number line (e.g. 30–50) with Splatrick on 36. Question: 36 + 7. Child TAPS
where the first jump should land; a green arc animates only if it's the ten-friend (40);
then taps the final landing (43). Tapping 43 directly first: allowed but Splatrick
wobbles mid-air — "one clumsy hop! Two neat jumps beat it" — then requires the two-jump
replay. Jump arcs stay drawn with +4 / +3 labels.
**Guided:** 36+7=43 (via 40); 58+6=64 (via 60); 42−5=37 (via 40, jumps go LEFT — arrows
and copy make direction explicit); 63−7=56 (via 60).
**Aha:** the friendly ten is a stepping stone; two small jumps, zero effort.

### written-methods — "THE CARRY CANNON" (prefix ccn)
**Core:** Column addition laid out on thrones (236 + 187). Child taps a column to add it;
if the sum ≥ 10 a little glowing ① cannonball launches up and hovers — the child must
CATCH it (tap) and DROP it on the next throne left, where it lands with a thunk and joins
that column's sum. Units: 6+7=13 → write 3, carry ① to Tens. Tens: 3+8+①=12 → write 2,
carry ① to Hundreds. Hundreds: 2+1+①=4. Answer 423.
**Guided:** (1) 236+187=423. (2) 358+164=522. (3) Subtraction with borrowing 52−27:
tap Units, 2−7 can't do — child drags a TEN from the Tens throne next door; it cracks
into ten ones raining onto the Units (12−7=5), Tens now 4−2=2 → 25.
**Aha:** the carry/borrow is a physical object that moves between thrones.

### fractions — "THE FAIR-SHARE BLADE" (prefix fsb)
**Core:** A chocolate bar. A cut-dial (2–8) sets the bottom number: turning it re-slices
the bar into that many EQUAL pieces (satisfying chop sounds). Then child TAPS pieces to
take them (they lift + tint) — the fraction display builds itself: taken/slices.
**Guided:** (1) Build ¾ (dial 4, take 3). (2) Build 2/6. (3) Equivalence: with ½ built
(dial 2, take 1), tap "TWIN CHECK": a ghost bar overlays cut into 4 with 2 taken — the
shaded area lines up EXACTLY → "½ = 2/4, same chocolate!". (4) Fraction of an amount:
12 sweets fall onto the bar's 4 slices (3 each); ¾ of 12 → take 3 slices → 9 sweets
counted up.
**Aha:** bottom = cuts, top = takes; equivalent fractions cover identical chocolate.

### fdp — "PERCY'S DISGUISE WHEEL" (prefix pdw)
**Core:** Three linked displays of ONE amount — fraction card, decimal card, % card —
around a single fill-bar. Child drags the fill-bar anywhere: it SNAPS to the taught set
(0, ⅒, ⅕, ¼, ½, ¾, 1) and all three cards morph live (drag to half: ½ / 0.5 / 50%).
Percy's monocle swaps to face whichever card the child taps.
**Guided:** (1) "Show me a quarter" → snap 25%. (2) "Set 75%" → ¾ appears. (3) Disguise
quiz: cards flip face-down except 0.2 — "what fraction is hiding?" tap ⅕ from options.
(4) 25% of £60: bar at ¼, coins pour: 60÷4 → £15 counted out.
**Aha:** three disguises, one amount — the bar never lies.

### sequences — "THE GAP-O-METER" (prefix gpm)
**Core:** Stepping stones with numbers (3, 7, 11, ?, 19). Child stretches the Gap-o-Meter
(drag from one stone to its neighbour) — it clamps on and reads the jump (+4) with a
ratchet sound. The measured jump loads into The Sequel's launcher; tap the ? stone and
the launcher fires the jump from 11 → the stone flips to 15. Measuring a NON-adjacent
pair: meter reads the gap but flashes "neighbours only — that's two jumps!".
**Guided:** (1) 3,7,11,?,19 → 15. (2) backwards: 40, 34, 28, ? → 22 (meter shows −6,
arrows left). (3) through zero: 9, 6, 3, ?, −3 → 0 ("the pattern never panics at zero").
(4) doubling: 2, 4, 8, ? → 16 (meter reads ×2 — it shows both +4 and ×2 candidates;
firing +4 gives 12 which CLANKS wrong against the 19-th... no: next given term is absent,
so instead the meter tests BOTH against the NEXT KNOWN stone: sequence shown 2,4,8,?,32 —
+4 predicts 12 then 16 (misses 32), ×2 predicts 16 then 32 (hits) → ×2 wins).
**Aha:** measure the gap FIRST; the gap is the sequence's engine.

### special-numbers — "THE PRIME PROBE" (prefix prp)
**Core:** Feed a number to Prime Slime's door: its counters (pebbles) tumble out and the
child drags a RECTANGLE FORMER slider — pebbles rearrange live into every rows×cols
grid: 12 → 1×12, 2×6, 3×4. A tally of "real rectangles found" builds. Numbers that only
ever form the single queue (1×n) make Prime Slime beam: PRIME. Then child stamps the
number PRIME / NOT PRIME.
**Guided:** probe 12 (not prime — 3 rectangles), 13 (prime — only a queue), 9 (1×9, 3×3 —
not prime; "square number!" bonus flag, the 3×3 grid glows square), 2 ("the only even
prime — the guard lets him in"), 1 (trap: only ONE factor — "not prime, needs exactly
two"; Slime shakes his head sadly).
**Aha:** prime = a number that can only queue, never rectangle.

### rounding — "THE CATAPULT" (prefix cat)
**Core:** A hill between two camps (70 ⛺ and 80 ⛺) with Sir Roundbottom placed at the
question number (74). Child first STAMPS a prediction on a camp, then drags-and-releases
Sir R: he physically rolls downhill to the nearest camp (the hill's peak is at 75; at
exactly 5 the Law of Five springboard FLINGS him up to the higher camp with a boing).
Decider digit is spotlit on the number throughout.
**Guided:** 74→70; 78→80; 75→80 (the Law of Five fling — bubble explains); nearest 100:
camps 300/400 with 350→400; 62 to nearest 10 → 60.
**Aha:** every number lives on a hill between two camps; the decider digit is the slope.

### machines-mystery — "BERTHA'S REVERSE LEVER" (prefix brl)
**Core:** A two-window machine: [+3] → [×2], conveyor carries a number through with
visible transformation. FORWARD mode first: feed 5 → watch 5→8→16. Then the mystery: OUT
shows 16, IN shows "?" — child pulls the big red REVERSE LEVER: the whole machine flips
horizontally AND each window must be re-set by the child from choice chips: which
operation undoes ×2? (÷2) — and which step goes FIRST when reversed? (the LAST one). Run
it: 16→8→5.
**Guided:** (1) +3,×2 out 16 → in 5. (2) ×4,−2 out 18 → in 5 (undo −2 first: 18+2=20,
then ÷4=5). (3) one-step letter machine: a+12=27 → pull lever → a=27−12=15 ("letters are
numbers in disguise").
**Aha:** reversing = opposite operations in opposite order, last step first.

## money-mines

### change-coins — "THE CHANGE CHUTE" (prefix chc)
**Core:** A number-line chute from the PRICE (65p) to the PAID (£1 = 100p). Real UK coin
buttons (1p 2p 5p 10p 20p 50p). Child drags coins onto the chute; each coin physically
tiles forward from 65 with its width proportional to value; running total chip counts
up (65 → 70 → 100). Overshoot = coin bounces off ("too big!"). When the chute is exactly
full: change = the coins used (5p + 20p + 10p… whatever they chose), totalled.
**Guided:** (1) 65p paid £1 → 35p (any valid tiling; then "can you do it in TWO coins?"
5p+30p impossible → 5p+10p+20p is three: actually fewest = 5p+30p not a coin, so
5p+10p+20p (3 coins) — star for any ≤3-coin solution). (2) 27p paid 50p → 23p
(3 coins: 1p+2p+20p). (3) trap mission: a "25p coin" appears in the tray — dragging it:
it dissolves ("no 25p coin exists in the UK!").
**Guided answers verified:** 100−65=35 ✓, 50−27=23 ✓.
**Aha:** change isn't subtraction — it's filling the gap with hops you can hold.

### money-problems — "SKINTY'S TILL" (prefix skt)
**Core:** Two prices as digit-card stacks (£2.35 and £1.45). The second stack starts
MISALIGNED (offset one column); the tower visibly leans. Child drags it sideways until
the decimal points click into line (satisfying CLUNK + tower straightens). Then taps
columns right-to-left to crunch the addition: 5+5=10 → 0 carry ① (reuses carry idea
lightly), 3+4+1=8, 2+1=3 → £3.80.
**Guided:** (1) £2.35+£1.45=£3.80. (2) The calculator trap: a calculator screen shows
"3.4" — child must dress it for the till: drag a 0 into the pence gap → £3.40 ("a
calculator drops the last pence digit — you put it back"). (3) 3 stickers at 45p each:
"find ONE first" — 45p tile stamps three times down the column → 135p → £1.35.
**Aha:** money is decimals in a £ costume — line up the points and everything works.

## measure-marsh

### metric-units — "CENTI-PEED'S LADDER LIFT" (prefix cpl)
**Core:** A vertical ladder: km at the top, then m, cm, mm (rungs labelled with their
factors: ×1000 between km/m, ×100 between m/cm, ×10 between cm/mm). A number rides a
platform; child drags the platform up/down rungs and the number's digits slide live
(the Slide-o-Matic's cousin — say so: "Pointy's fence never moves here either"). Going
DOWN (bigger→smaller unit) multiplies; UP divides. The factor badge lights during travel.
**Guided:** (1) 4 kg → g (uses the mass ladder kg→g ×1000): 4000 g. (2) 250 cm → m:
÷100 → 2.5 m. (3) 3.5 m → cm: ×100 → 350 cm. (4) sensible-unit sort: "a door's height"
→ m (drag the object card to a rung).
**Aha:** every conversion is a ladder ride; down = ×, up = ÷.

### perimeter — "THE PROWLER'S PATROL" (prefix ppw)
**Core:** A labelled rectangle (6 cm × 4 cm). The Prowler stands at a corner; child drags
him ALONG the fence — he's constrained to the boundary; each completed side lights up
and its length flies into a running sum strip (6 → +4 → +6 → +4). Back at the start:
gate slams, total 20 cm. Skipping is impossible by construction — that's the point.
**Guided:** (1) rectangle 6×4 → 20 cm. (2) square side 5 → 20 cm ("four equal walks").
(3) L-shape with two hidden sides: labelled sides 8, 3, 5, 2 and two ?s — before
walking, child taps each ? and picks its length (8−5=3 and 3+2=5... use this exact
figure: outer 8 wide, 3 tall on the left, steps in 5 across then down 2: hidden vertical
= 3+2? Set the L concretely: width 8, left height 5, notch: top-right cut of width 3 and
height 2. Sides walked: 8 (bottom), 5 (right? ...). IMPLEMENTER: build the L from two
rectangles 8×3 (bottom) + 5×2 (top-left), so the sides are 8,3,3,2,5,5 → perimeter 26;
hidden sides resolved as 8−5=3 and 3−... verify your own figure sums by closing the
loop: sum of rights = sum of lefts, ups = downs. The walk must visit six sides and the
running strip must total the true perimeter.) Keep numbers small and self-consistent.
**Aha:** perimeter = actually walking every side; hidden sides get found, then walked.

### area-volume — "CUBBY'S TILE-AND-STACK" (prefix cts)
**Core:** A 4×3 rectangle outline on squared paper. Child SWEEPS a finger across the
inside: tiles pop in under the finger (pop sounds, counter climbing). Full base: 12 tiles
= 4×3 spotlit as a multiplication. Then VOLUME mode: a pull-tab lifts the base upward
into isometric view; each pull adds a full LAYER of 12 ghost-cubes (thunk): 2 layers →
24 cm³. Unit badge switches cm² → cm³ with the ²/³ physically stamping on.
**Guided:** (1) tile 4×3 → 12 cm². (2) stack ×2 → 24 cm³. (3) perimeter-vs-area trap:
"how much SKIRTING walks the edge?" — tapping tiles is wrong tool; child must switch to
the Prowler-style edge tool → 14 cm ("edge is perimeter, tiles are area").
(4) 5×2 → 10 cm², stack 3 → 30 cm³.
**Aha:** area = tiles that cover; volume = the same tiles stacked in layers.

### clocks-time — "THE MINUTE MUNCHER'S CLOCK" (prefix mmc)
**Core:** A big analogue clock with a DRAGGABLE minute hand; the hour hand follows with
true gearing (1/12 speed). As the minute hand passes each numeral, the secret
5-times-table lights on the rim (7 lights as 35). A live chip narrates: "25 past 3" /
"20 to 7", flipping PAST↔TO exactly at the half-hour. Ratchet ticks per minute-mark.
**Guided:** (1) "Set 25 past 3" (from 3:00). (2) "Set 20 to 7" (start 6:00 — child must
cross the half-hour and see PAST flip to TO). (3) 24-hour lever: with 3:25 set,
pull the AFTERNOON lever → digital face shows 15:25 (+12 stamps visibly). (4) duration:
"How long from 3:25 to 4:10?" — drag the hand forward and count accumulates: to 4:00
(35 min) then on (+10) = 45 min.
**Aha:** the numbers on the rim are secretly the 5-times table; PAST/TO is just which
half the hand is in.

### temperature — "THE ZERO BRIDGE" (prefix zbr)
**Core:** A big vertical thermometer (−10…10) with Freezer Geezer beside it. Child drags
a marker from −3 to 8: the journey splits visibly at 0 — segment one (−3→0) fills blue
with counter 3, crossing the glowing ZERO BRIDGE plank, segment two (0→8) fills orange
with counter 8; total = 3+8 = 11 degrees apart. Zero flashes ONCE as you cross ("one
plank, never counted twice").
**Guided:** (1) −3 to 8 → 11. (2) −7 to 2 → 9. (3) "4 degrees colder than 1°C" — drag
DOWN 4 from 1 → −3. (4) order three temperatures coldest-first by dragging cards onto
the thermometer (−6, 2, −1 → −6, −1, 2).
**Aha:** crossing zero = two small jumps that ADD; colder = further below zero.

### timetables — "BOGFACE'S FINGER-TRACK" (prefix bft)
**Core:** A real 4-stop × 3-bus timetable grid. Two giant draggable fingers: a ROW finger
(slides vertically, highlights a whole stop-row) and a COLUMN finger (slides
horizontally, highlights a bus-column). Where they cross glows gold; the cell pops its
time large. Timetable: stops Swamp Gate / Puddle Lane / Catapult Hill / Terminus; Bus A
08:40 08:52 09:03 09:15; Bus B 09:00 09:12 09:23 09:35; Bus C 09:30 09:42 09:53 10:05.
**Guided:** (1) "When does Bus B reach Catapult Hill?" → 09:23. (2) journey time Bus A
Swamp Gate→Terminus: count-up arc 08:40→09:00 (20) then →09:15 (+15) = 35 min (the arc
physically bends at the hour). (3) "You arrive at Puddle Lane at 09:05 — which bus is
next?" → Bus B 09:12 (Bus A's 08:52 greys out: already gone).
**Aha:** one finger row, one finger column, answer where they kiss; time maths counts UP
through the hour, never subtracts.

### scale-maps — "THE SHRINKLER'S RAY" (prefix shr)
**Core:** A real bridge (side view) and the Shrinkler's scroll drawing of it. The scale
label "1 cm = 4 m" is a physical dial on the ray-gun. Child drags a measuring strip
along the DRAWING (it counts 1…6 cm with ticks), then fires the reverse-ray: each
drawing-centimetre inflates into a 4 m span across the real bridge, one WHOMP at a time
(4, 8, 12…24 m). Change the dial to 1 cm = 2 m and refire: same 6 cm drawing → 12 m
("same drawing, different world — the LABEL is everything").
**Guided:** (1) 6 cm at 1:4 m → 24 m. (2) 3 cm path at 1 cm = 5 m → 15 m. (3) reverse:
real pond 20 m, scale 1 cm = 4 m → drawing 5 cm (child sets the strip length before
firing the shrink direction).
**Aha:** the scale label is a recipe: measure, then multiply (or divide backwards).

## shape-caves

### angles-lines — "THE ANGLE JAWS" (prefix ajw)
**Core:** Obtusius's jaw: two arms hinged at a vertex; child drags the top arm to open
the angle 0–360°. Live classification chip: ACUTE (sharp teeth icon) < 90 CLUNK at
exactly 90 (a right-angle square corner-piece snaps in) < OBTUSE < 180 CLUNK (flat
line, "straight") < REFLEX. Colour zones sweep the arc. No degree numbers shown during
free play — the SHAPE teaches, not the number (SEAG never asks to measure).
**Guided:** (1) "Open me an acute angle" (any <90 accepted on LOCK). (2) "Exactly a
right angle" (snap zone at 90). (3) "Make Obtusius comfortable — obtuse!" (90–180).
(4) "Past a straight line — reflex!". (5) Triangle promise: a triangle whose corner the
child drags — all three angle-arcs re-balance live, their three numbers displayed AND
always summing 180 on a balance meter ("drag all you like — the promise holds").
**Aha:** angle families are SHAPES of openness; a triangle's three corners share 180
between them, always.

### shapes-2d — "POLLY'S SHAPE SHIFTER" (prefix pss)
**Core:** Two modes. SIDES mode: a big slider 3–8 morphs a regular polygon live; its name
stamps on (triangle→…→octagon); Polly loses/gains a side with a comic gasp at each step.
CORNERS mode: a quadrilateral with four draggable corners; snap-zones announce special
forms as achieved: all sides equal → RHOMBUS chime; four right angles → RECTANGLE chime;
both at once → SQUARE fanfare ("a square is BOTH — family loyalty flows one way!").
Tick-marks appear on equal sides as they equalise.
**Guided:** (1) "Make a pentagon" (slider 5). (2) "Drag me into a rectangle" (snap).
(3) "Now the royal one — a square". (4) name-that-shape flash: 4 sides all equal, no
right angles → tap RHOMBUS from options.
**Aha:** names come from counting sides and checking angles/equal marks — and a square
is always a rectangle AND a rhombus.

### shapes-3d — "SIR FACELOT'S TAG COUNT" (prefix sfc)
**Core:** A CSS-3D cube the child spins by dragging (momentum, honest 3D). Three tag
modes: FACES (tap a face → it paints and counts, spin to reach hidden ones), EDGES (tap
an edge-bar → lights), VERTICES (tap a corner-stud → pings). Counters build to 6/12/8;
Sir Facelot announces them in his strict order. A curved guest appears after: a cylinder
— its curved face still counts ("curved counts as a face; no sharp point, no vertex").
**Guided:** (1) cube 6-12-8 by tagging. (2) speed-round on a square-based pyramid
(5 faces, 8 edges, 5 vertices). (3) does-it-fold: two flat nets shown — tap the one that
folds into a cube (the true cross vs a 5-square impostor); the chosen net FOLDS in 3D to
prove it (impostor folds into an open box, one face missing, comic trombone).
**Aha:** count by physically touching every face/edge/corner — spinning finds the hidden
ones; folding is provable, not guessable.

### symmetry — "THE FOLD TEST" (prefix fld)
**Core:** A shape on a board with a candidate mirror line; child DRAGS the fold — one
half physically rotates over the line (3D flip). Matching: the folded half lands green,
CHIME. Not matching: the overhang sticks out RED and flaps (rectangle diagonal fold —
the famous trap — must look emphatically wrong). Fold lines selectable: vertical /
horizontal / two diagonals.
**Guided:** (1) rectangle: test all four lines → exactly 2 work ("NOT 4 — the diagonals
betray you"). (2) square: all 4 work — golden fanfare. (3) complete-the-twin: half a
rocket on squared paper, child paints mirror squares on the other side, then folds to
check — mismatched squares glow red and can be repainted (place-all-then-check, genuine
consequence). (4) mirror or myth: tap every named fold (rectangle vertical, square
diagonal, rhombus diagonal — genuine; rectangle diagonal, parallelogram diagonal,
trapezium diagonal — trap lines).
**Aha:** symmetry is a physical fold where every point finds its twin; rectangles have 2
lines, never 4.

### coordinates — "GRIDLOCK'S DELIVERY RUN" (prefix gdr)
**Core:** A first-quadrant grid (0–8). Gridlock must deliver a parcel to (4, 3). He only
moves ALONG first: child drags him along the hall (x-axis floor) — a big counter ticks
along 1,2,3,4 and the coordinate builds "(4, _)"; then and only then the stairs unlock
and the child drags him UP — "(4, 3)" completes and the parcel THUNKS onto the spot.
Trying to drag up first: he plants his feet, grumbles, arrow points along the hall.
**Guided:** (1) deliver to (4,3). (2) (0,5) — "zero along! He starts climbing at the
origin's own doorstep". (3) read-off: a treasure chest sits at (6,2) — child taps the
two dials to write its address (along-dial then up-dial; dials REFUSE to accept up
first). (4) trap mission: parcel addressed (2,5) vs a decoy chest at (5,2) — deliver
correctly ("swap the order, wrong house!").
**Aha:** along the hall THEN up the stairs — the order is the whole game.

### turns-compass — "WANDA'S SPINNING CHAMBER" (prefix wsc)
**Core:** A big compass rose; Wanda stands centre with a visible facing-arrow. Child
spins her by rotary drag — ratchet clicks per compass point passed, N-E-S-W letters
light as she faces them, and the "Naughty Elephants Squirt Water" words sing along the
rim. Quarter/half/three-quarter turn badges pop as the spin accumulates (90°=2 points on
the 8-point rose... keep to the 4-point rose for turns: quarter = next letter).
**Guided:** predict-then-spin (tap the compass point you predict FIRST, then spin to
check — genuine consequence): (1) face N, quarter-turn clockwise → E. (2) face W,
half-turn → E. (3) face S, quarter-turn ANTI-clockwise → E ("backwards through the
letters!"). (4) backwards trap: "Wanda ended facing W after a quarter-turn clockwise —
where did she START?" → S.
**Aha:** a quarter turn is one letter along the N-E-S-W song; anticlockwise walks the
song backwards.

## data-dump

### graphs-charts — "BARRY'S SCALE SPYGLASS" (prefix bss)
**Core:** A bar chart (4 bars: Football 3 lines, Swimming 5 lines, Tag 2, Chess 4 —
drawn in GRIDLINES, not values) and a SCALE DIAL (each line = 1 / 2 / 5 / 10). Turning
the dial never moves the bars — but every bar's value label recalculates live (Swimming:
5 → 10 → 25 → 50). Barry's own chest-chart mood is the punchline: read at scale 1 he
looks "3/10 cross"; the dial's true setting (10) reveals he's "30/100 FURIOUS" (comic).
**Guided:** (1) dial at 5: how many swim? → 25. (2) "how many MORE swim than play tag?"
two readings then subtract: 25−10=15 (the two bars spotlight; the subtraction builds on
screen). (3) pictogram bonus: a row of 3½ ball symbols where each ball = 4 → 14
("symbols have scales too").
**Aha:** the same picture means different numbers — the scale is the decoder ring;
read it FIRST.

### pie-charts — "PIE-FACE'S SLICE SPLITTER" (prefix psl)
**Core:** A pie labelled "36 pupils asked". Child drags the crust-boundary of a slice —
as the slice grows/shrinks, its live count morphs (half pie → 18 pupils, quarter → 9);
the OTHER slices' counts compensate so the total always reads 36 ("the whole pie is
everyone — not a crumb more"). Snap points at ¼, ⅓, ½, ¾.
**Guided:** (1) "Cut exactly half — how many pupils?" → 18. (2) quarter → 9. (3) a
printed pie: pets chart, total 24, cat slice is a quarter → 6 cats (child sets the
splitter to match the printed slice, count reads off). (4) trap: "the pie shows 50% like
football — does that mean 50 pupils?" → No: 50% OF 36 = 18 (bubble only at the moment
the half-slice + 18 are both on screen).
**Aha:** the pie is the TOTAL ASKED wearing a circle costume; fractions of the pie are
fractions of that total, never "out of 100 people".

### tables-tally — "WALLY'S GATE BUILDER" (prefix wgb)
**Core:** A counting yard. Child taps to add tally strokes for arriving creatures — the
first four strokes stand upright; the FIFTH auto-slams diagonally across with a THUNK
and the gate briefly glows ("four sticks and a gate — five, never six"). Building past
five starts a new gate. A live translation chip shows gates×5+strays.
**Guided:** (1) "Count 13 frogs in" → 2 gates + 3 strays, chip reads 13. (2) read-back:
a finished row of 3 gates + 4 strays → tap the total: 19. (3) the six-stick trap: a
pre-built WRONG gate with 5 uprights + slash (=6) sneaks in — child must spot and tap
the imposter gate ("Wally is sulking in the bin"). (4) table lookup: mini 2-way table
(Y5/Y6 × walk/bus), "how many Y6 walk?" — row+column fingers reused from Bogface.
**Aha:** tallies chunk the world into fives; gates×5+strays beats counting sticks one
by one.

### mean-range — "THE MEANIE'S LEVELLING SCOOP" (prefix mls)
**Core:** Block towers for 4, 6, 8 (real draggable blocks). Child scoops blocks off tall
towers onto short ones; a TOTAL chip (18) never changes as blocks move ("sharing moves
sweets, never makes them"); when all towers stand equal at 6, the level-line lights:
THE MEAN. A separate RANGE caliper stretches tallest-to-shortest of the ORIGINAL set
(ghost towers remain visible): 8−4=4.
**Guided:** (1) level 4,6,8 → mean 6. (2) level 2,3,7 → mean 4. (3) the fair-share
formula recap builds AS they level: 4+6+8=18, 18÷3=6 stamps in. (4) range of 3,9,4,8 →
caliper 9−3=6 ("biggest minus smallest — the middle numbers are bystanders").
**Aha:** the mean is what every tower gets when you level them; total never changes.

### probability — "THE MAYBE LEDGE WASHING LINE" (prefix mwl)
**Core:** A washing line strung IMPOSSIBLE → UNLIKELY → EVENS → LIKELY → CERTAIN, with
Marvin teetering at EVENS. Child pegs event cards onto the line (drag a card + peg
sound): "Tomorrow has a morning" (certain), "Roll a 7 on one dice" (impossible), "A
fair coin lands heads" (evens), "Pull a red from a bag of 9 red + 1 blue" (likely).
Place-all-then-check: pegs lock only on CHECK; misplaced cards flap and can be re-pegged.
Then DICE DECK: the six faces laid out; question "even number?" — child taps the wanted
faces (2,4,6) and the chance chip assembles "3 out of 6" and a pointer swings to EVENS.
**Guided:** the four pegs above; dice: even → 3/6 (evens); "more than 4" → 2/6
(unlikely); "less than 7" → 6/6 (certain — pointer slams to the end).
**Aha:** every chance lives somewhere on one line; for dice, count wanted out of six.

## punctuation-pits

### capitals-endmarks — "PHIL'S CAP DISPENSER" (prefix pcd)
**Core:** A sentence in all-lowercase on a work bench, a dispenser of tiny caps 🧢 above.
Child taps any letter → a cap drops onto it and the letter POPS uppercase (drop+pop
sounds). Tap a wrong letter: the cap slides off ("caps are earned, not worn for fun").
Then the END-MARK STAMPS: three big stamps (. ? !) — child inks one onto the sentence
end; the sentence reacts in kind (statement settles, question curls up, exclamation
jumps). Place-all-then-check.
**Guided:** (1) "on tuesday jarlath went to belfast" → caps on O(start), T(uesday),
J(arlath), B(elfast) + full stop. (2) "where is my sausage roll" → cap W + ?. (3) "i
can't believe i won" → BOTH i's capped ("I always wears the cap, even mid-sentence") +
!. (4) earth/Earth: "the rocket left earth" → cap E when it's the planet (bubble at
check explains the name-vs-soil rule).
**Aha:** caps are a physical badge worn by sentence-starts and names; the end mark is
chosen by the sentence's JOB.

### apostrophes — "IT'S-ITS JUNCTION" (prefix iij)
**Core:** A railway junction. Sentence-trains roll in with a highlighted word; child
pulls the points-lever LEFT (OWNER track — a little possession-arrow links owner to
owned as the train passes) or RIGHT (SQUEEZER track — the apostrophe visibly squeezes
letters out: "it's" stretches back to "it is" on an overhead gantry as proof). Wrong
track: the train reverses back to the junction with a warm whistle.
**Guided:** (1) "the dog's ball bounced" → OWNER (arrow: dog→ball). (2) "it's raining
again" → SQUEEZER (gantry: it is ✓). (3) "the cat licked its paw" → NEITHER lever — a
third small track exists: NO APOSTROPHE ("its = belonging, like his and hers — no mark
at all"). (4) plural trap: "the dogs barked all night" → NO APOSTROPHE track ("a plain
plural earns nothing").
**Aha:** every apostrophe is doing exactly one of two jobs — and its/it's is settled by
the un-squeeze proof, not by guessing.

### commas-colons — "THE COMMA CHAMELEON HUNT" (prefix cch)
**Core:** List sentences where the commas are LIVE chameleons in camouflage (invisible).
Child taps the gap between words where a comma should sit: right gap → the chameleon
fades into view, settles, curls into a comma shape (sparkle). Wrong gap → leaves rustle,
he scurries visibly to hint. The gap before "and" is a decoy zone: tapping it makes the
chameleon shake his head ("no pause before the final and").
**Guided:** (1) "Whiffbeard packed a peg a torch and his pride" → 1 chameleon (after
peg). Hmm — two items before 'and': "a peg, a torch and his pride" = 1 comma. ✓
(2) "The recipe needs eggs flour sugar and one brave frog" → 2 commas. (3) fronted
opener: "After tea Jarlath trained his goose" → comma after tea ("the opener gets its
pause"). (4) colon announcer: drag the COLON (a different creature — two stacked eggs)
to the announcing spot: "Bring these: rope, boots and courage" — it only sticks after a
COMPLETE announcing sentence (dragging it after "Bring" bounces off).
**Aha:** commas are pauses you can SEE once you know where they hide — and none before
the final "and".

### speech-brackets — "THE AIR-QUOTER'S HUG" (prefix aqh)
**Core:** A sentence lies on the bench: Watch out, that puddle is deep! warned Maya.
The Air-Quoter's two ARMS (giant 66 and 99 marks) are draggable; child places the
opening arm and closing arm to hug the spoken words. The hug validates on CHECK: hugging
"warned Maya" too → those words wriggle free ("the reporting clause was never spoken").
Crucially the ! must end INSIDE the hug — closing the arm before it leaves the ! shivering
outside ("the punctuation stays in the hug — it's part of what was said").
**Guided:** (1) the Maya sentence above. (2) speech-second: Maya whispered, "the geese
are watching us." — hug placement + the comma BEFORE the opening hug spotlit. (3)
brackets cameo: "My brother (who is seven) ate the whole pie." — swap arms for round
brackets hugging the extra bit; removing the bracketed bit still leaves a working
sentence (the bit lifts out to prove it, sentence re-reads clean).
**Aha:** speech marks are a hug around ONLY the spoken words, and end punctuation stays
inside the hug.

## grammar-grotto

### contractions — "COLIN'S SQUEEZE PRESS" (prefix csp)
**Core:** A great iron press. Feed in word pairs on a tray: COULD + HAVE. Child pulls the
press lever: the words squash together, the squeezed-out letters (H-A) physically pop out
and flutter away, and the apostrophe drops from a hatch to plug the hole: could've.
REVERSE mode: put a contraction in, pull the stretch lever, letters fly back in.
THE JAM: feed in COULD + OF → the press grinds, jams, red lights, Colin appears in
smoke: "OF was NEVER in there! It's could HAVE!" (his blood-oath lore).
**Guided:** (1) squeeze do+not → don't. (2) squeeze they+are → they're. (3) stretch
should've → should HAVE. (4) the could-of jam (trap mission — child chooses which pair
to feed from options including the imposter). (5) rule-breaker: will+not → won't (the
press does a comedy somersault — "some squeezes mangle the word — learn them by heart").
**Aha:** the apostrophe marks EXACTLY where letters were squeezed out; "of" never comes
out of the press because it never went in.

### tenses — "GARY'S TIME MACHINE" (prefix gtm)
**Core:** A verb stands on the time platform under three zone-lights: YESTERDAY | TODAY |
TOMORROW. Child pulls the big lever left/right to time-travel the verb. Regular verbs:
the -ed BOLTS on with a clank (jump → jumped). Irregular rebels TRANSFORM whole-body in
a puff (seek → sought; the letters visibly morph). Before each pull, the child predicts:
two candidate cards (seeked / sought) — pick one, then pull; the machine produces the
truth (Gary sadly holds his "SEEKED" sign when proven wrong — his lore).
**Guided:** (1) jump → jumped (regular, bolt-on). (2) seek → sought (rebel). (3) find →
found. (4) go → went ("the biggest rebel of all — nothing survives"). (5) TOMORROW pull:
will + verb assembles ("the future just borrows WILL").
**Aha:** the Ear Test made visible — regular verbs bolt on -ed; rebels change shape
completely, and you learn them by meeting them.

### parts-of-speech — "THE NOUN HOUND'S FETCH YARD" (prefix nhf)
**Core:** A sentence's words printed on throwable balls. Four kennels: NOUN (the Hound
waits there), VERB, ADJECTIVE, ADVERB. Child flicks each ball toward a kennel (drag +
release with momentum). Correct kennel: the resident reacts (Hound catches joyfully;
Verb kennel does a star-jump; Adjective preens; Adverb zooms). Throw a verb at the
Hound: he lets it drop and STARES, deeply unimpressed (his lore) — ball rolls back.
**Guided:** (1) "The brave hound barked loudly" → hound:NOUN, brave:ADJ, barked:VERB,
loudly:ADV (articles pre-sorted as "glue words" in a bucket). (2) "Jarlath kicked the
muddy ball" → Jarlath+ball nouns, kicked verb, muddy adj. (3) same-word-different-job:
"I watch the match" vs "My watch is broken" — the ball WATCH must go to VERB kennel in
sentence one and NOUN kennel in sentence two ("ask the word's JOB in THIS sentence").
**Aha:** a word's class is the JOB it's doing right now — the same ball lands in
different kennels.

### comparatives — "THE -ER/-EST PODIUM" (prefix cep)
**Core:** A race podium and a word-builder. Start with TWO runners racing (they animate):
the word FAST sits on the builder; with exactly two finishers only the -ER ending will
click on (drag -ER onto FAST → FASTER stamps onto the winner). Drag -EST with only two
runners: it bounces off ("-est needs a crowd of three!"). Add a third runner (button):
now -EST clicks and crowns the champion FASTEST. Try dragging BOTH endings: the word
buckles comically ("never both — 'more faster' breaks the machine"). GOOD mode: the
builder's endings melt off — only the golden cards BETTER / BEST work ("good breaks
every rule").
**Guided:** (1) two dogs: build FASTER. (2) three dogs: FASTEST. (3) long word: with two
paintings, "beautiful" → MORE beautiful (the -er tile physically doesn't fit the long
word slot; the MORE card does). (4) good→better→best golden round. (5) the "most
goodest" crime: a wanted-poster round — tap everything wrong with "the most goodest dog"
(two crimes: goodest isn't real; most+est doubles up).
**Aha:** two things → -er/more; three or more → -est/most; never both; good plays by
royal rules of its own.

### plurals-collectives — "THE CLONING CRANK" (prefix pcc)
**Core:** One goose in a pen; a big crank handle. Child cranks: a second goose pops in —
and the label must be updated: two cards offered (GOOSES / GEESE); choosing GOOSES
triggers the Geese Police sirens + a warm arrest of the CARD (not the child) — "straight
to the filing cabinet with that". Correct card stamps onto the pen. Keep cranking:
labels for 3, 4… stay GEESE. Then the pen fills with a whole crowd → pick the GROUP name
from cards (GAGGLE ✓ / HERD / SWARM). Rounds swap the animal.
**Guided:** (1) goose→geese→a gaggle. (2) mouse→mice ("mouses" gets arrested). (3)
sheep→sheep ("the word refuses to change — sneaky") → a flock. (4) cow→cows (regular!
"not every plural rebels") → a herd. (5) bee crowd → a swarm.
**Aha:** some plurals transform, some refuse to change, and every crowd earns one
special name.

### sentence-parts — "PETE'S BLOCK TOWER" (prefix pbt)
**Core:** Word-group blocks on a building site. PHRASE blocks ("under the old bridge")
are physically WOBBLY — set one down alone and it tips over (comic clatter): it cannot
stand. Snap a WHO block ("Jarlath") + a DOING block ("hid") onto it → the block fuses,
squares up and STANDS: a sentence brick. Child builds bricks, then stacks bricks into a
paragraph tower — but every brick must share the tower's ONE idea (idea flag on top:
"the match"); an off-topic brick ("My gran collects spoons") makes the tower LEAN
alarmingly until it's pulled out.
**Guided:** (1) make "under the old bridge" stand (add subject+verb from a parts tray).
(2) sort 4 cards: sentence or phrase? (place-all-then-check). (3) build a 3-brick
tower about the match from 5 candidate bricks (2 off-topic). (4) the size ladder recap:
tap the blocks in size order — phrase → sentence → paragraph → chapter.
**Aha:** a sentence stands because it has a who AND a doing; a paragraph is bricks
sharing one idea.

## spelling-sewers

### spelling-rules — "THE RULE PIPES" (prefix rpp)
**Core:** Word-plumbing. Words flow through pipes toward a joining valve where an ending
waits. LAW TWO pipe: HOPE approaches +ING — the silent E must be grabbed by the claw
(child drags the claw to the right letter and drops it in the bin) before the pipes
join: HOPING flows out. Grab the wrong letter → the pipe coughs it back. LAW THREE pipe:
CRY approaches +S: the child must spin the Y-valve — the y flips into IES: CRIES. LAW
ONE pipe: a letter gap in BEL_EVE — child slots IE or EI; after a C (RECEIVE) the C
glows and flips the order.
**Guided:** (1) hope+ing → hoping. (2) make+ing → making. (3) cry→cries; boy→boys (the
valve only activates after a CONSONANT — the O of boy pacifies it). (4) believe (ie) vs
receive (ei after c). (5) swim+ing → swimming (bonus doubling pipe: the M stamps twice).
**Aha:** spelling rules are machinery — the E drops, the Y flips, and C reverses ie.

### homophones — "THE TWIN SCANNER" (prefix tsc)
**Core:** A sentence with a glowing gap: "____ bags are heavy." The three twins
(there / their / they're) stand in a line-up. Child lifts a twin INTO the scanner over
the gap: the scanner runs the PROOF — for they're it un-squeezes to "they are" IN PLACE
and the whole sentence re-reads ("they are bags are heavy" — nonsense klaxon, comic);
for there a place-arrow probes for a location (finds none); for their a belonging-thread
ties bags to owners (SNAPS taut — green). The proof, not the child's memory, does the
judging; the child watches all three proofs then stamps the survivor.
**Guided:** (1) ___ bags are heavy → their. (2) "Look over ___!" → there (place-arrow
lands). (3) "___ late again" → they're (un-squeeze reads "they are late again" ✓).
(4) round two twins: to/too/two — "It's ___ cold ___ swim" → too, to (the TOO card
carries an extra O that literally means "too much").
**Aha:** don't guess twins — run the proof: un-squeeze it, point at the place, or tie
the belonging thread.

### tricky-words — "THE MEMORY HOOK FORGE" (prefix mhf)
**Core:** Big letter tiles spell a monster word. The forge dresses it with its hook:
NECESSARY — child drags ONE collar onto the C and TWO socks onto the two S's (dragging
a second collar: no neck for it — bounces). SEPARATE — a live RAT waddles in and the
child parks him in his hiding spot: sep-A-[RAT]-e. DEFINITELY — the word FINITE glows
inside. Then the letters SCATTER and the child rebuilds the word from tiles with the
hook items as ghost anchors (collar/socks/rat still faintly visible in position).
**Guided:** (1) necessary (dress + rebuild). (2) separate (park the rat + rebuild).
(3) definitely (light the FINITE + rebuild). (4) Wednesday — the silent D-N-E-S gets a
"speak-it-silly" button: WED-NES-DAY chanted aloud in caption as tiles pulse; rebuild.
**Aha:** hard words stick when you hang something ridiculous on them — the hook rebuilds
the word for you.

## storybog

### reading-detective — "THE LINE-NUMBER LASSO" (prefix lnl)
**Core:** A short numbered passage (8–10 lines, write an original: Inspector Sniff
investigates a missing sandwich — every 2nd line numbered like real papers). A question
cites a line: "According to line 6, where was the lunchbox found?" The answer options
are LOCKED (padlock icons) until the child throws the lasso: drag from Sniff to a line —
lassoing line 6 highlights it gold and CLICK, options unlock. Lasso a wrong line: Sniff
sniffs it theatrically — "nothing here but crumbs" (and the line briefly highlights so
they SEE it's answerless).
**Guided:** three literal questions on the passage, each lasso-gated; final question
cites "lines 7–8" — the lasso must rope BOTH lines (drag spans them) before unlocking
("a range means walk both lines with your finger").
**Aha:** go BACK to the line first — the physical habit of never answering from memory.

### between-lines — "NED'S CLUE SCALES" (prefix ncs)
**Core:** A balance scale with a feelings-dial beneath (nervous / excited / angry /
sad). A mini-scene plays in text (original: Michael before the big match — hands
fidgeting, dropped bottle, checking the clock). CLUE cards drift up from the text
(child drags each onto the scale pan): each clue nudges the dial; ONE clue leaves the
needle wobbling undecided (Ned's lore: never trust a single clue); TWO+ agreeing clues
lock the needle. Distractor cards with "always/never/entirely" wording weigh NOTHING —
placed on the pan they float off like balloons ("too big a claim to weigh").
**Guided:** (1) the match scene → nervous (2 clues lock it). (2) second scene (Aoife's
birthday morning: up at dawn, list checked nine times, singing) → excited. (3) trap
round: one strong-looking clue that actually points elsewhere — needle refuses to lock
until the second clue arrives.
**Aha:** feelings are never written down — clues ADD UP, and one clue is never enough.

### words-in-context — "THE SWAP-IN SOCKET" (prefix sis)
**Core:** A sentence with the mystery word glowing in a SOCKET: "The pain in his ankle
was sharp." Candidate meaning-plugs on cables: "clever", "sudden and intense", "pointy
like a knife-edge". Child plugs each into the socket: the sentence re-reads itself with
the swap visibly inserted — a bad swap SPARKS and ejects ("a clever pain?? nonsense!");
the right swap seats with a satisfying CLUNK and green glow. The trap plug is always
the word's most FAMOUS meaning (the dictionary favourite) — it sparks in THIS sentence.
**Guided:** (1) sharp → sudden and intense. (2) "She rose to answer" → stood up (not
"a flower"). (3) "The window was rigid with frost" → stiff/unbending (not "strict").
(4) "The setback cost them the match" → a problem that delays you.
**Aha:** never trust the meaning you know best — swap it INTO the sentence and let the
sentence judge.

### poetry — "SIMON'S RHYME STRINGS" (prefix srs)
**Core:** An original 2-verse poem (write one: Rhymin' Simon's storm at the pond, 4
lines per verse, ABAB or AABB). VERSE task first: drag a bracket to wrap each verse
("a verse is a paragraph of poetry"). Then RHYME STRINGS: tap two words to tie a
glowing string between them — strings only ATTACH to line-END words; tap a mid-line
word and the string slips off ("rhymes live at line-ends"). Correct pairs hum a little
two-note chime (the two words pulse in time).
**Guided:** (1) bracket the 2 verses. (2) string all rhyme pairs (4 strings). (3) the
STORY question last: "what actually happened in the poem?" — 4 options; the right one
is about events, the trap options are about rhymes ("the rhyme is the tune; the story
is the song").
**Aha:** find the shape (verses), enjoy the tune (line-end rhymes), but READ FOR THE
STORY first.

### kinds-of-writing — "THE SIGNPOST SHELF" (prefix ssf)
**Core:** A physical book (CSS, opens both ends) titled "The Bumper Book of Swamp
Beasts". Question cards arrive: "Which page does Chapter 4 start on?" — child drags the
card to the part of the book that answers it: the FRONT (contents) or the BACK (index /
glossary / bibliography tabs). The book flips open to that section with a page-turn
sound and the answer highlights (contents: chapters in story order with page numbers;
index: A-Z topics; glossary: word meanings; bibliography: books the author read).
Wrong part: the book shrugs shut.
**Guided:** (1) "page for Chapter 4?" → contents. (2) "every page that mentions
geese?" → index ("A-Z, at the back"). (3) "what does 'nocturnal' mean in this book?" →
glossary. (4) "did the author make these facts up?" → bibliography ("the proof shelf").
(5) fiction/non-fiction sorter: 4 book covers onto two shelves ("ask ONE question:
invented, or true?").
**Aha:** a book's signposts each answer ONE kind of lostness — learn which door to
knock on.

### writers-tricks — "EMILY'S TRICK DETECTOR" (prefix etd)
**Core:** Sentences from an original stormy-night paragraph drift past on cards. The
child sets the detector lens FIRST (choose SIMILE / METAPHOR / LIST), then scans the
card: if the claim is right the lens locks on — and SHOWS ITS EVIDENCE: simile mode
highlights the "like/as" comparing word; metaphor mode highlights the bold "WAS/IS"
claim with no comparing word; list mode counts the piled-up items 1-2-3. Wrong claim:
the lens fizzles ("no 'like' or 'as' anywhere — scan again").
**Guided:** (1) "The sea was like a growling monster" → simile (evidence: like).
(2) "The sea WAS a monster" → metaphor ("no comparing word — it just DARES you").
(3) "Rain hammered the roof, the windows, the door, the whole shaking house" → list
(items counted). (4) effect-matching: drag each found trick to its EFFECT card ("makes
you picture it", "hits harder — claims it IS", "overwhelms you — too much at once").
**Aha:** name the trick by its EVIDENCE (like/as, IS-claim, piling up) — then ask what
it DOES to the reader.
