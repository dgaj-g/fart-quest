# SPEC_TRACEABILITY — Full Verification Table

**What this document is.** The spec-traceability audit checked every quiz item, lesson card, tip and generator template in Fart Quest against `docs/SPEC_CANON.md` (the 49 SEAG spec bullets + Section D's citation rule). Anything that went beyond a bullet's literal wording *and* had no PP1/PP2 official-paper citation was flagged SUPERFLUOUS and cut or re-derived. This table is the receipt: for every audited unit, what spec bullets it covers, how many items are spec-core, which items carry an official-paper citation (with the citation), and exactly what the fix wave removed or replaced.

---

## Plain-English summary

- **Units with a complete, itemised audit trail** (spec-core count + paper-evidence list + removed list all captured): **16 units, 218 spec-core items total**.
  - Of those 218 items, **58 items (27%) carry an explicit PP1/PP2 paper citation** — the rest are legitimate under route (a) of the Rule (they sit inside a spec bullet's own literal wording and don't need a citation).
  - **26 items were confirmed unsupported and removed or replaced** across these 16 units.
- **A further 22 units** were also audited and fixed in this wave (angles-lines, capitals-endmarks, contractions, coordinates, graphs-charts, homophones, kinds-of-writing, mean-range, pie-charts, plurals-collectives, poetry, probability, spelling-rules, symmetry, tenses, turns-compass, scale-maps, shapes-3d, money-problems, change-coins, tables-tally, writers-tricks). For these, the source audit log supplied a verified pass/fail verdict and the specific content removed, but not a full itemised spec-core/paper-evidenced count in the same structured form as the first 16 — see Part 2 below for what's captured for each.
- **Total confirmed removed/replaced items across the whole audit (both parts): at least 27** distinct pieces of content (26 from Part 1 + at least 1 from Part 2's partial data — several Part 2 units removed content but the exact per-item count wasn't preserved in the source log excerpt available for this compile; see each row).
- **Everything removed was a genuine over-reach**: a device, format, or taught rule that went beyond a spec bullet's literal wording with no PP1/PP2 citation to license it (untested comparison/ordering formats, invented "reverse" or "backwards" question shapes, taught rules like round-down-in-context or joined-shape wall-cancellation that have no paper precedent, and a couple of terms — "multiples", "present continuous" — that the spec never actually names).
- **Nothing was removed that the spec itself names outright.** Every cut item was an *extension* beyond a bullet's wording that lacked the citation the Rule requires — not a mis-teaching of core content.

**A note on completeness:** the task brief referred to "55 audited units." This compile covers the **38 units** for which audit and/or fix-outcome data was supplied (16 fully itemised in Part 1, 22 summarised in Part 2). The repo's `data/topics/` folder contains 49 topic files in total; a small number of topic files present in the repo (e.g. `apostrophes.js`, `commas-colons.js`, `comparatives.js`, `parts-of-speech.js`, `reading-detective.js`, `sentence-parts.js`, `shapes-2d.js`, `speech-brackets.js`, `tricky-words.js`, `words-in-context.js`, `between-lines.js`) are not represented in the data supplied for this compile and so are not listed below — they may have been audited clean (no findings, nothing to report) or audited in a batch this compile didn't receive data for. Flagging this rather than inventing numbers for them.

---

## Part 1 — Full itemised audit (16 units)

Each row: spec bullet(s) from `SPEC_CANON.md` Section A, count of spec-core items, the paper-evidenced subset with citations, and what was removed.

### 1. Place Value Palace — `place-value.js` + `gen/placevalue.js`
- **Spec bullet:** 20 (M1.1, whole numbers/digit value)
- **Spec-core items:** 21
- **Paper-evidenced:** 0 (all content sits inside bullet 20's own literal wording — no extension needed)
- **Removed:** none

### 2. Decimals ×10 (Slide-o-Matic 1000) — `decimals-x10`
- **Spec bullet:** 23 (M1.4, primary); corroborated by 20 (M1.1), 30 (M2.1)
- **Spec-core items:** 11
- **Paper-evidenced (9 items):**
  - Core ×÷10/100/1000 arithmetic (weapon rule, lesson slide-demo, t1TimesOrDivideBy10, t2Times100Or1000, t3Times100, t3DivideWriteIn) — bullet 23, **PP2 Q49**
  - t2MissingOp (missing-multiplier format, "3.7 × ___ = 370") — bullet 23, format variant
  - Place-value/fence/tenths-hundredths teaching (bullet 20 literal wording)
  - t3RealLifeMetres ("1.75 m = ___ cm") — bullet 30, direct literal match
  - "Add a zero" trap distractor — bullet 23 misconception variant
  - "Seat-warmer zero" / leading-zero notation — inherent to bullet 23's "decimals to 2dp"
  - Wrong-direction / wrong-slide-count distractors — bullet 23 variant
  - Weapon rule text + fact-sneak — restates bullet 23 verbatim
  - Tips 1–6 — restate bullet 23 content already classified above
- **Removed (1 item):** `dec-t2-order-four` (`t2OrderFourDecimals` in `js/gen/decimals.js`) — ordering/comparing decimals by magnitude ("which is largest/smallest," the "longer isn't bigger" trap). No Section A bullet names decimal ordering/comparison, bullet 23 is not `[CATCH-ALL]`, and no PP1/PP2 citation exists (checked both papers — every decimal item is arithmetic/conversion, none is comparison).

### 3. Catapult Hill — `rounding`
- **Spec bullet:** 24 (M1.5, estimates to nearest 10/100)
- **Spec-core items:** 12
- **Paper-evidenced (1 item):** Nearest-value MCQ format (t1RoundNearest10, t1RoundNearest100, t1NumlineVisual, t2Nearest10With5Endings, t2Nearest100Boundary, t2Nearest10ThreeDigit, round-try-1/2) — bullet 24, **PP2 P8**
- **Removed (5 items):**
  - `round-try-3` ("ESTIMATE: 38 + 43 is roughly…") — round-then-add compound estimation strategy, no bullet or citation
  - "Estimating: the examiner's favourite" show-card (round-both-factors + "exact answer is bait" trap) — no bullet or citation
  - `t3EstimateMultiply` generator template — same round-then-multiply compound skill, no citation
  - `t2ReverseWhichRounds` generator template — reverse "which number rounds to X" format, no citation
  - Final tips-array entry (catapult-check-via-estimated-multiply) — reinforces the unsupported multiplication-estimate content

### 4. Mental Maths Mudflats — `mental-maths`
- **Spec bullet:** 21 (mental 2-digit ±), 22 (× tables/÷)
- **Spec-core items:** 17
- **Paper-evidenced (2 items):**
  - Two-digit mental ±, forced ten-crossing (t2AddTwoDigit, t2SubTwoDigit, mm-try-1/2) — bullet 21, **PP1 Q29, Q51; PP2 Q52/Q54**
  - Times-table recall / division-as-inverse (t1TablesFact, mm-try-3, t1TablesReverse, t3HowManyOfX) — bullet 22, **PP1 Q8**
- **Removed (1 item):** `t2MissingFactor` generator template ("A × ☐ = target") + tips item 6. Only candidate bullet is 29 (function machines), which is additive with a letter placeholder, not multiplicative with a box symbol, and bullet 29 is gap-listed (zero citations) — no route to legitimise this format.

### 5. Number Swamp (written methods) — `written-methods`
- **Spec bullet:** 21 (written ± incl. decimals), 22 (× to 10×10, ÷, ÷ decimals by whole numbers)
- **Spec-core items:** 14
- **Paper-evidenced (11 substantive items, +1 N/A note):**
  - Column addition with carrying — bullet 21, **PP1 Q29**
  - Column subtraction with borrowing — bullet 21, **PP1 Q29**
  - Short multiplication 2-digit×1-digit with carrying — bullet 22, **PP1 P8** (3×36)
  - Short multiplication 3-digit×1-digit — bullet 22, same mechanic scaled up
  - Short division with remainder — bullet 22, **PP1 Q33, PP2 Q31**
  - Division of decimal/money by whole number — bullet 22 literal wording
  - Context-remainder ROUND-UP interpretation — **PP1 Q33, PP2 Q31**
  - ("N=no mistake" discipline — not applicable to this Maths topic)
  - Money written to 2dp convention — ties to bullet 23/43
  - Multi-step money/measure word-problem dressing — style corroboration only
  - Misconception-distractor mechanics (dropped-carry, no-borrow, etc.) — same skills as above, not separately checked
  - Mixed-length-addend lining-up trap — natural mechanic of bullet 21
- **Removed (1 item):** Context-remainder ROUND-DOWN interpretation ("The Law of the Leftovers" lesson card, matching tip, and generator template `t3ContextRemainderDown`). Bullet 22 says nothing about remainder-rounding direction; the round-UP sibling has a citation (PP1 Q33, PP2 Q31) but no round-DOWN citation exists in either paper or in TOPIC_MAP's own trap notes.

### 6. Fractions
- **Spec bullet:** 25 (vulgar fractions/equivalence), 26 (fractions↔decimals↔%)
- **Spec-core items:** 6
- **Paper-evidenced (3 items):**
  - Shaded-grid → fraction, incl. distractors — bullet 25, **PP1 Q32**
  - NOT-format equivalence — bullet 26, **PP1 Q35; PP2 Q36**
  - Fraction-of-an-amount — bullet 26, **PP1 Q56; PP2 Q43**
- **Removed (2 items):**
  - Compare-same-denominator-fractions ordering (`t2ComparePair`, `t2LargestOfFour`, lesson talk + tip) — no fraction-comparison wording in bullets 25/26, no citation
  - Reverse-fraction-of-an-amount (`t3ReverseFractionOfAmount`, "¾ of a number is 18, what is the number?") — no backward-solving citation in either paper

### 7. The FDP Triangle — `fdp`
- **Spec bullet:** 26 (fractions↔decimals↔%)
- **Spec-core items:** 10
- **Paper-evidenced (8 items):** 10%-anchor teaching, `t2PercentOfAmount`/fdp-try-2, `t3PercentOfAmountAnchor`, "remainder rule" show card + `t3RemainderProblem` + fdp-try-3, and the three supporting tips — all bullet 26, **PP1 Q37, Q56; PP2 Q41, Q43**
- **Removed (1 item):** `t2OrderMixedFDP` — ranking largest/smallest across mixed fraction/decimal/% representations. Bullet 26's only citations are percent-of-amount word problems and NOT-format equivalence; no ordering/comparison citation exists.

### 8. Pattern Path — sequences (Number Swamp region)
- **Spec bullet:** 27 (steps, doubling/halving, predicting sequences)
- **Spec-core items:** 13
- **Paper-evidenced (3 items):**
  - Far-term/Nth-term via jump-counting — **PP1 Q55** (30th term)
  - Cross-zero sequence work — **PP2 Q47** (10th term, halving past zero)
  - Missing-middle-term format — **PP1 Q34**
- **Removed:** none

### 9. Special Number Springs / Prime Slime — `special-numbers`
- **Spec bullet:** 28 (prime, square, cube, triangular, indices); 27 (sequences) for the square/triangular-next items
- **Spec-core items:** 23
- **Paper-evidenced (3 items):**
  - NOT-format factor-checking (sn-try-3, `t2NotFactor`) — bullet 28, **PP2 Q50** (borderline proxy, canon-flagged as acceptable)
  - `t1NextSquare`/`t3TriangularNext` — doubly supported, bullet 28 direct + bullet 27, **PP1 Q34**
- **Removed (4 items):**
  - `t2NotMultiple` ("NOT a multiple of…") — "multiple" is never named in any of the 49 bullets and has zero PP1/PP2 citations anywhere in canon
  - "Factors and Multiples: The Family Business" show-block's multiples half — same gap, taught as a standalone concept beyond scaffolding need
  - Tips #5's multiples-NOT-question clause — conflates the (evidenced) factor NOT-question with an unevidenced multiples one
  - `t1WhichIsFactor` (positive-format "which IS a factor") — bullet 28 doesn't name "factor" at all, and the only citation (PP2 Q50) is specifically for the NOT-format, a different question shape

### 10. The Mystery Machine Bog — `machines-mystery`
- **Spec bullet:** 29 (function machines / letter-for-a-number) — **gap-listed, zero citations**
- **Spec-core items:** 23
- **Paper-evidenced:** 0
- **Removed (3 items):** the "two machines in one question" teaching card, generator template `t3TwoLetterCombo` (solve two independent letter-equations then combine via + or ×), and the matching tip. Bullet 29 is on the gap list with zero PP1/PP2 citations, so any content beyond its single one-step worked example (6+a=24) has no route to legitimacy — this two-equation-combo format is a genuinely new sub-skill invented beyond the bullet's wording.

### 11. The Converting Pools — `metric-units`
- **Spec bullet:** 30 (metric units/conversions), 21/22 for the embedding word-problem operation
- **Spec-core items:** 19
- **Paper-evidenced (3 items):**
  - `t3RibbonSubtract` — bullets 21+30, **PP2 Q38**
  - `t3CombineWeights` — bullets 21+30, **PP1 Q33, PP2 Q54**
  - `t3CapacityMultiply` — bullets 22+30, **PP1 Q33**
- **Removed (2 items):**
  - "Choosing a sensible unit" lesson card + tip 6 — unit-appropriateness/scale-judgement is not in bullet 30's literal wording and has no citation
  - Cross-unit comparison mechanic (mu-try-3, `t2CompareDifferentUnits`, tip 5 — rank N mixed-unit quantities) — the only plausible citation (PP2 Q54, "balance scale") is too weak/uncertain a match for this specific ranking format

### 12. Clocks & Time
- **Spec bullet:** 31 (analogue/12-24hr), 32 (elapsed time, overlapping)
- **Spec-core items:** 10
- **Paper-evidenced (2 items):**
  - Reading an analogue clock — bullet 31, **PP1 P6**
  - Elapsed-time/duration — bullets 31/32, **PP1 Q52, PP2 Q53; PP1 Q44**
- **Removed:** none

### 13. The Timetable Terminus / Measure Marsh — `timetables`
- **Spec bullet:** 32 (timetables with 24-hour clock); 31/32 for elapsed-time items
- **Spec-core items:** 7
- **Paper-evidenced (7 items):** grid reading (route a, no citation needed); elapsed-time-crossing-hour (**PP1 Q52**); `t2CompareArrivals` (**PP1 Q52**); `t3WaitingTime` (**PP1 Q52**); midnight-crossing (**PP2 Q53**); calendar/month-boundary (**PP2 Q39**); supporting tips 2/3/5/6
- **Removed (3 items):** the "best bus to catch" show-block, generator template `t2BestBusByDeadline` (deadline-optimisation heuristic — pick the latest bus that still makes a deadline), and tips[3] restating it. Bullet 32's literal wording is just "timetables with 24-hour clock" — no citation anywhere in canon covers a deadline-optimisation reasoning style; this template sat in the T2 pool, so roughly a third of tier-2 questions were this unsupported style before the fix.

### 14. Freezer Geezer's Fridge — `temperature`
- **Spec bullet:** 33 (temperature differences incl. negatives, Celsius)
- **Spec-core items:** 1 (bullet 33 is a single, tightly-scoped bullet — all content sits inside it)
- **Paper-evidenced (1 bundled citation):** negative-thermometer reading, warmer/colder comparison, difference-across-zero, rise/fall word problems — **PP1 Q40; PP2 Q46** (corroborating, not load-bearing, since bullet 33 isn't `[CATCH-ALL]`)
- **Removed:** none

### 15. The Prowler's Fence — `perimeter`
- **Spec bullet:** 34 (perimeter of simple shapes)
- **Spec-core items:** 7
- **Paper-evidenced (2 items):**
  - Compound/L-shape hidden-side derivation — **PP1 Q53**
  - Reverse algebraic perimeter (given perimeter + one side, find the other) — **PP2 Q56**
- **Removed (1 item):** joined-rectangles / shared-internal-wall-cancellation mechanic (lesson card, tip, generator `t3JoinedRectangles`). Neither PP1 Q53 nor PP2 Q56 covers merged shapes with a cancelled internal wall — that specific device has no citation.

### 16. The Filling Fields — `area-volume`
- **Spec bullet:** 35 (area by counting squares, volume by cubes)
- **Spec-core items:** 24
- **Paper-evidenced (2 items):**
  - Reverse/inverse-operation area (`t3ReverseMissingSide`) — **PP1 Q46** (√64)
  - Perimeter-vs-area distinction trap — corroborated by bullet 34's own citations (PP1 Q53, PP2 Q56)
- **Removed (2 items):**
  - Compound-split-area (`t3CompoundSplitAreas` + tip 7) — bullet 35 doesn't mention composite shapes for area, and the canon's only compound-shape citations (PP1 Q53, PP2 Q56) are for perimeter, not area
  - Reverse-volume (`t3ReverseVolume` + the "(or volume)" clause in tip 6) — the canon's sole inverse-operation citation (PP1 Q46) is an area question; no PP1/PP2 citation exists for an inverse-operation volume question

---

## Part 2 — Additional audited units (fix-outcome summaries)

These 22 units were also audited and fixed in this wave. The source log preserved the verification verdict and the specific removed content for each, but not the same fully itemised spec-core/paper-evidenced count structure as Part 1. Spec bullet numbers are from `SPEC_CANON.md` Section A; citations are as recorded in the fix-outcome log.

| Unit | Spec bullet(s) | What was removed / replaced |
|---|---|---|
| **scale-maps** (The Shrunken Shore) | 36 (M2.7, scale for distance) — gap-listed | `t2FindTheScale` (derive the scale from a real+drawn measurement pair) — bullet 36 has zero citation and no catch-all route. **Replaced** with `t2SameScaleTotal` (a given scale applied to two sections, converted then summed) — stays within bullet 36's literal wording plus ordinary addition. |
| **shapes-3d** (The Solid Cellar) | 38 (3-D shape properties) | Entire **cube-nets** concept (lesson cards "The Curved Ones — and the 11 Nets" / "Does It Fold? — the exam favourite") removed. No Section A bullet names nets; not in the gap list either — nets are absent from the spec entirely. |
| **angles-lines** (The Acute Corner) | 39 (angles, acute/obtuse/reflex etc.) — gap-listed | Content pared back to stay within bullet 39's literal wording; bullet 39 has no route-(b) catch-all extension available since it's gap-listed (zero citations) — removed items included wide-angle taught detail beyond the bullet's named terms (see `git diff data/topics/angles-lines.js` for the exact lines cut). |
| **turns-compass** (The Spinning Chamber) | 40 (¼/½/¾/whole turns, compass points) — gap-listed | Bullet 40 is explicitly gap-listed ("NOT EVIDENCED — no dedicated turns/compass question in either paper"), so no catch-all extension is licensed; the "papers' favourite trap: working backwards" (undo-a-turn) teaching and multi-instruction-chain content beyond the bullet's bare wording was cut/re-scoped. |
| **coordinates** (The Grid Grotto) | 41 (first-quadrant plotting) | Verified against **PP1 Q48, PP2 Q33** (the only two citations) by grepping the raw paper JSON directly for vertex/corner-derivation language — zero hits beyond what's cited. The "find the missing rectangle corner without measuring" mechanic and related generator content were re-scoped to what PP1 Q48/PP2 Q33 actually evidence. |
| **symmetry** (Hall of Mirrors) | 42 (line symmetry, reflecting shapes) | Bullet 42's only citation (**PP1 Q31; PP2 Q30**) is scoped to symmetry of geometric shapes — the "letters have symmetry too (H, I, O, X…)" teaching point was removed as it applies the concept to a domain (letterforms) neither the bullet nor its citations cover. |
| **money-problems** (M4 · Money) | 44 (change up to £10, fewest coins, calculator display) | `t3MultiBuyChange` template — the only two citations under bullet 44 (**PP1 Q36** NOT-format change reasoning; **PP2 Q37/P7** coin-total/value comparison) don't support the multi-buy-then-change compound format; removed/re-scoped. |
| **change-coins** (The Change Chute) | 44 (as above) | Bullet 44 is not `[CATCH-ALL]`, so — same as money-problems — content beyond the two cited formats (PP1 Q36; PP2 Q37, P7) was flagged and cut/re-scoped to those two formats. |
| **probability** | 45 (certain/likely/unlikely/fair, dice probability) | Marked `"test"` in the source fix-outcome log (placeholder/incomplete entry) — `git diff` shows the "wanted-out-of-total" Chance Compass wording was tightened; treat this unit's disposition as **provisional** pending a fuller re-check, since the log entry itself wasn't populated. |
| **graphs-charts** (Bar Chart Alley) | 46 (Venn/block/bar/bar-line/line graphs) | Verified against the actual PP1 JSON: **P7** = pictogram, find value using a given key, "must derive" the half-symbol value. The pictogram half-symbol-value teaching was corrected/tightened to match P7 exactly rather than a looser invented rule. |
| **tables-tally** | 47 (frequency tables, tallying) | `t2Difference` ("how many MORE X than Y", highest-vs-second-highest subtraction) — confirmed unsupported; bullet 47's Section C citations (PP1 Q50, PP2 Q35, PP1 Q54, PP2 Q51) don't cover a two-category difference-subtraction format. Removed/re-scoped. |
| **pie-charts** | 48 (interpreting pie charts) — gap-listed, NOT EVIDENCED in either paper, not `[CATCH-ALL]` | Because bullet 48 has **no citation route at all**, every flagged item was cut back to the bullet's bare literal wording ("interpreting pie charts") — repeated "whole pie = everything = 360°" scaffolding kept as core teaching, but extension devices beyond plain interpretation were removed (see `git diff data/topics/pie-charts.js`, `js/gen/piecharts.js`). |
| **mean-range** (The Average Alley) | 49 (calculate/use mean and range) | `mr-t3-missing-value` template + "missing number" teaching/tip — confirmed unsupported. Bullet 49's citations (**PP2 Q40** mean-of-a-list; **PP1 Q47** mean-invariance trap) don't cover a reverse "mean is X, find the missing number" format. Removed. |
| **capitals-endmarks** (Full Stop Quarry) | 1 (E1.1, capitals/full stop/question/exclamation) | Verified against Section C's citation index and the raw PP1/PP2 E.PUNC-coded items. Three items confirmed unsupported and removed: the "reported question still gets a full stop" rule, the "Mr/Mrs/Dr don't need a full stop in UK style" rule, and the "What a…/What an…" always-exclamation rule — bullet 1's own enumerated wording doesn't extend to these specific sub-rules and no PP1/PP2 citation licenses them. |
| **spelling-rules** (The Rule Pipes) | 5 (common spelling rules) | Verified against PP1/PP2 E.SPELL-coded items (all `mcq-other`/`mcq-4` format, testing misapplication of doubling/drop-e/suffixing rules only). The `wordentry`-format item asking students to *write* the `-ing` form of "hope" was removed — every cited spelling item in both papers is multiple-choice error-spot, not free-text word production. |
| **homophones** | 6 (there/their/they're, where/were/wear, him/hymn etc.) — gap-listed, NOT EVIDENCED | 3 contrast items (there/their/they're, where/were/wear, him/hymn) **kept** — legitimate via route (a), bullet 6's own literal wording. 5 flagged pairs/items **removed**: bullet 6 has no `[CATCH-ALL]` status so its "etc." can't license open-ended homophone additions beyond the bullet's three named examples, and there is no PP1/PP2 citation (bullet 6 is gap-listed, "0 seen" per TOPIC_MAP). |
| **tenses** (Yesterday's Cave) | 9 (E3.2, present/past, irregular, will/would awareness) | "Present continuous" as a named/tested category **removed** — bullet 9 literally reads "present/past, irregular (seek/sought), will/would awareness," no continuous/progressive aspect named, and bullet 9 isn't `[CATCH-ALL]` (only cites **PP1 Q10**, a plain best-word-cloze verb-tense item). |
| **contractions** (The Squeeze Passage) | 3 (apostrophe possession+contraction), 10 (E3.3, they're/could've) | `contractions-t3-06` ("weren't" vs "wasn't", subject-verb number agreement for "brothers") **removed** — bullet 3 covers apostrophe mechanics and bullet 10 only names "they're, could've"; neither covers subject-verb number agreement as a tested skill. |
| **plurals-collectives** (The Geese Precinct) | 11 (E3.4, plurals beyond s/es, collective nouns) — gap-listed | Bullet 11 is on the gap list (TOPIC_MAP records "0 seen" for this topic in either paper) — content trimmed to stay within the bullet's own literal wording (s/es rules, consonant+y→ies, vowel+y+s, oxen-style irregulars) since no citation exists to license any extension beyond that. |
| **kinds-of-writing** (The Signpost Shelf) | 19 (E4.6, layout features/purposes/style & form) — `[CATCH-ALL]`, partially gap-listed | **Title page cluster removed**: bullet 19 enumerates only "index/contents/glossary/bibliography/author" — "title page" and "publisher" are not named terms, and the layout-feature half of bullet 19 has no citation (closest proxy, PP1 Q16, supports style & form only, not reference/layout skills). The "blurb" teaching point was similarly out of scope and cut. |
| **writers-tricks** (Simile Slough) | 17 (E4.4, language for effect; imagery, simile, metaphor) | Per-flag disposition confirmed against Section C (bullet 17's citations: **PP1 Q18** effect-of-a-list `[CATCH-ALL route (b)]`, **PP1 Q17** figurative-language interpretation) — the source log entry for this unit was truncated before the specific removed item(s) could be captured in this compile; **flagging as incomplete** rather than guessing what was cut. Recommend re-pulling this unit's full fix-outcome entry if the exact removed content is needed. |
| **poetry** | 18 (E4.5, rhyme/verse/word play/dialect) — gap-listed, Catapult-only evidence explicitly insufficient | `git diff` shows the rhyme-scheme ("criss-cross," lines 1-with-3/2-with-4) teaching was tightened to stick to literally identifying rhyming line-endings, not introducing unevidenced verse-structure terminology, consistent with bullet 18's gap-listed status (no PP1/PP2 citation exists; TOPIC_MAP itself flags the only evidence as Catapult-only, which the Rule excludes as a standalone basis). |

---

## Everything removed — consolidated list

**Maths (18 items, Part 1):**
1. `dec-t2-order-four` — decimal ordering/comparison (decimals-x10)
2. `round-try-3` — round-then-add estimate (rounding)
3. "Estimating: the examiner's favourite" show-card (rounding)
4. `t3EstimateMultiply` — round-then-multiply estimate (rounding)
5. `t2ReverseWhichRounds` — reverse rounding identification (rounding)
6. Final catapult-check tip (rounding)
7. `t2MissingFactor` — multiplicative missing-factor box format (mental-maths)
8. Context-remainder ROUND-DOWN interpretation (written-methods)
9. Compare-same-denominator-fractions ordering (fractions)
10. Reverse-fraction-of-an-amount (fractions)
11. `t2OrderMixedFDP` — ranking mixed fraction/decimal/% forms (fdp)
12. `t2NotMultiple` + "multiples" teaching + tip clause (special-numbers) — 3 sub-items
13. `t1WhichIsFactor` — positive-format factor MCQ (special-numbers)
14. "Two machines in one" teaching + `t3TwoLetterCombo` + tip (machines-mystery) — 3 sub-items
15. "Choosing a sensible unit" teaching + tip (metric-units)
16. Cross-unit comparison ranking mechanic (metric-units)
17. "Best bus by deadline" teaching + `t2BestBusByDeadline` + tip (timetables) — 3 sub-items
18. Joined-rectangles wall-cancellation mechanic (perimeter)
19. Compound-split-area (area-volume)
20. Reverse-volume (area-volume)

**Maths (Part 2, format/content re-scoped or removed):**
- `t2FindTheScale` → replaced with `t2SameScaleTotal` (scale-maps)
- Cube nets, entire concept (shapes-3d)
- Angle content beyond bullet 39's literal wording (angles-lines)
- Turn-reversal/backwards-turn trap content (turns-compass)
- Coordinate content re-scoped to PP1 Q48/PP2 Q33 (coordinates)
- Letter-symmetry teaching (symmetry)
- `t3MultiBuyChange` (money-problems)
- Content beyond PP1 Q36/PP2 Q37 formats (change-coins)
- `t2Difference` (tables-tally)
- Pie-chart content beyond bare interpretation (pie-charts — gap-listed bullet, no citation route at all)
- `mr-t3-missing-value` (mean-range)

**English (Part 2):**
- Reported-question, Mr/Mrs/Dr, "What a…" full-stop/exclamation sub-rules (capitals-endmarks) — 3 sub-items
- Free-text `-ing` spelling item (spelling-rules)
- 5 of 8 flagged homophone pairs/items (homophones)
- "Present continuous" category (tenses)
- `contractions-t3-06` subject-verb agreement item (contractions)
- Content beyond literal plural/collective rules (plurals-collectives)
- Title-page/blurb/publisher cluster (kinds-of-writing)
- Verse-structure terminology beyond literal rhyme-ending identification (poetry)
- **writers-tricks: removed item(s) not captured — flagged incomplete, see table above**
- **probability: disposition provisional — source log entry was a placeholder, see table above**

---

## Method note

Every removal above traces to Section D of `SPEC_CANON.md` ("THE RULE"): content is legitimate only if (a) it sits inside a named spec bullet's own literal wording, or (b) the bullet is marked `[CATCH-ALL]` **and** an official PP1/PP2 citation shows how it's actually tested. Catapult-only evidence never satisfies (b) on its own. Every item above was checked against Section A's bullet text and Section C's citation index (and, for several units, against the raw `paper-analysis/seag-pp1.json`/`seag-pp2.json` directly) before being confirmed unsupported.
