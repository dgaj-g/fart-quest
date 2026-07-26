# Audio Credits

All files below are licensed CC0 (Creative Commons Zero / Public Domain Dedication). No attribution
is legally required, but sources are credited here for transparency and future re-verification.

## SFX (audio/sfx/)

Source pack: **Kenney "Interface Sounds"** (v1.0), by Kenney (www.kenney.nl)
Zip: https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip
Asset page: https://kenney.nl/assets/interface-sounds
Licence evidence seen on page/in bundled `License.txt`: "License: (Creative Commons Zero, CC0)
http://creativecommons.org/publicdomain/zero/1.0/ — This content is free to use in personal,
educational and commercial projects."

| File | Source file | Notes |
|---|---|---|
| click.m4a | click_001.ogg | soft UI tap |
| back.m4a | back_002.ogg | |
| confirm.m4a | confirmation_002.ogg | |
| correct.m4a | confirmation_004.ogg | bright positive ding |
| wrong.m4a | error_003.ogg | softest/longest of the "error" family; no harsh alarm tones in this pack |
| tick.m4a | tick_001.ogg | subtle |

Source pack: **Kenney "Music Jingles"**, by Kenney Vleugels (Kenney.nl)
Zip: https://kenney.nl/media/pages/assets/music-jingles/f37e530b9e-1677590399/kenney_music-jingles.zip
Asset page: https://kenney.nl/assets/music-jingles
Licence evidence seen on page/in bundled `License.txt`: "License (Creative Commons Zero, CC0)
http://creativecommons.org/publicdomain/zero/1.0/ — You may use these assets in personal and
commercial projects."

| File | Source file | Notes |
|---|---|---|
| unlock.m4a | Steel jingles/jingles_STEEL07.ogg | bright brassy jingle for weapon/creature unlock |
| capture.m4a | 8-Bit jingles/jingles_NES00.ogg | longest/grandest jingle in the pack (1.76s) — used as the big triumphant capture fanfare |

**whoosh.m4a — NOT PRODUCED.** Neither Kenney pack above contains a dedicated whoosh/swoosh
sound (closest neighbours — `scratch_*`, `glitch_*`, `drop_*` — are not true whooshes). Left out
rather than mis-labelling a different sound; UI agent should treat `audio.sfx('whoosh')` as
optional/missing.

### Fart samples (audio/sfx/fart-1.m4a … fart-4.m4a)

Source: **"Gastric Distress"** by LFA, OpenGameArt.org
Page: https://opengameart.org/content/gastric-distress
File: https://opengameart.org/sites/default/files/gastricdistress_bylfa_0.wav
Licence evidence seen on page: "License(s): CC0" (single license listed, no CC-BY/SA alternatives),
also listed in the "All CC0" collection.
Original file is a 20.9s compilation of multiple distinct takes; split at natural silence gaps
(ffmpeg `silencedetect`) into 4 standalone clips, each converted to m4a:

| File | Segment (source timestamp) |
|---|---|
| fart-1.m4a | 0.00–1.41s |
| fart-2.m4a | 1.79–4.01s |
| fart-3.m4a | 4.40–8.87s |
| fart-4.m4a | 11.44–14.34s |

## Music (audio/music/)

Note: FreePD.com (originally specified as the source) has permanently shut down as of 2025
("The Music Has Moved On" closure notice, confirmed live on freepd.com on 2026-07-06). Substituted
with individually CC0-verified tracks from OpenGameArt.org, each checked to show **only** "CC0" in
its License(s) field (not a multi-licensed CC-BY/CC-BY-SA item where CC0 is merely one of several
options) except where noted.

| File | Track | Source | Licence evidence |
|---|---|---|---|
| map-theme.mp3 | "Happy Adventure" by TinyWorlds | https://opengameart.org/content/happy-adventure-loop — file: happy_adveture.mp3 | Page shows "License(s): CC0" only; also in "CC0 8-bit/Chiptune Music" and "CC0 Audio" collections. Bouncy 8-bit loop, fits comedic/quirky map brief. |
| battle-theme.mp3 | "Chiptune Adventures — 3. Boss Fight" by Juhani Junkala | https://opengameart.org/content/4-chiptunes-adventure — file from `Juhani Junkala [Chiptune Adventures] OGG.zip`, converted ogg→mp3 | Page shows "License(s): CC0" only. Pack's own `INFO.txt` states: "These music tracks have been released under CC0 creative commons license. You can do anything you want with these tunes." Adventurous, driving boss-fight energy — playful, nothing scary. |
| lesson-theme.m4a | "Children's Game Music 2 — Adventure" by (OGA user, page author unlisted beyond upload) | https://opengameart.org/content/childrens-game-music-2-adventure — file: children_soundtrack_2.wav, converted wav→m4a (96kbps AAC) | Page shows "License(s): CC0" only. Author's own description: "Created for an interactive educational game for children." Gentle, curious synth theme — matches lesson brief. |

All three tracks were selected by title/licence/description only (no audio playback available in
this environment); each was `afinfo`-verified to decode as valid audio of a sensible loop length
(47–72s) before being placed in the repo.

### Whiff-End Pier (audio/music/pier.mp3) — CHOSEN BY DAMIEN, 26 Jul 2026

Damien auditioned four CC0 candidates by ear (the v1 track had been picked from a text
description by an agent that could not listen — that mistake is not repeated) and selected
candidate 4. The three unselected candidates and the audition page have been removed.

| File | Track | Source | Licence evidence |
| --- | --- | --- | --- |
| pier.mp3 | "Bouncy Hamster Dancing (Menu Music?)" by cynicmusic | https://opengameart.org/content/bouncy-hamster-dancing-menu-music | Page "License(s):" field shows CC0 only; also filed in the site's "CC0 Upbeat / Electronic Music" and "Music - Platform & Background" collections. Author describes it as a "ridiculously infectious theme" deliberately reminiscent of the Hamster Dance — exactly the daft arcade energy the pier wanted. Source loop 65s, looped x2 with a 1s crossfade to 2:09; re-encoded libmp3lame 160kbps CBR 44.1kHz stereo. **Selected by Damien on listening, 26 Jul 2026.** |

<!-- superseded candidate notes below (kept for provenance) -->



FreePD.com (the spec's suggested default source) remains permanently closed — see note above —
so this track was sourced from OpenGameArt.org, same as the other three.

| File | Track | Source | Licence evidence |
|---|---|---|---|
| pier.mp3 | "Carnival Rides" by Écrivain | https://opengameart.org/content/carnival-rides — file: carnivalrides.ogg | Page shows "License(s): CC0" only (single licence, no CC-BY/SA alternative); also listed in the site's own "CC0 Music" and "Truly Truly Public Domain" collections. Tagged Carnival/Fantasy/Kids — picked for Whiff-End Pier (times-tables arcade world) as the closest CC0 match to a fast, daft seaside-fairground energy. Selected by title/tag/description only, same no-playback caveat as above. |

Source loop is short (25.5s, author's own words: "a short loop"). Built up to spec-required 1–3
minute length with `ffmpeg`: the OGG was looped 4× with 1-second triangular `acrossfade` crossfades
at each seam (so no hard click at the repeat boundary), then encoded to MP3 (libmp3lame, 160kbps
CBR, 44.1kHz stereo). Verified with `ffprobe`/`ffmpeg -f null -` (clean full decode, no errors):
**98.99s, 1.98MB**, well inside the 1–3 min / ≤5MB spec bounds.

### Whiff-End Pier rework — v2 candidates PENDING SELECTION (audio/music/pier-candidate-1..4.mp3)

Per `docs/PIER_REWORK.md` §4: Damien says v1's "Carnival Rides" is awful. It was picked from
metadata by an agent who could not hear it — same blind-selection caveat applies to the four
tracks below (selected on tags/description/author's-own-words only, no audio playback available
in this environment). **`pier.mp3` above has NOT been touched or replaced.** These four are
candidates only, for Damien to audition by ear at `fq-verify/pier-music-audition.html` and pick
one; whichever is chosen should then be re-encoded/renamed over `pier.mp3` and this candidates
section (plus the three unused files and the audition page) deleted.

| File | Track | Source | Licence evidence |
|---|---|---|---|
| pier-candidate-1.mp3 | "Insert Coin" by megupets | https://opengameart.org/content/insert-coin — file: `Insert Coin_1.mp3` | Page shows "License(s): CC0" only (verified in raw page HTML, not just the summary tags); also in "8-bit Chiptune commercial ok", "CC0 Chiptunes", "CC0 Music" collections. Tagged 8-bit/chiptune/"title screen"; author's own words: "simple title screen song with chiptune/8bit style". Punchy NES-style arcade-cabinet energy. |
| pier-candidate-2.mp3 | "Bonus Round - 8bit" by Wolfgang_ | https://opengameart.org/content/bonus-round-8bit — file: `bonusgame.wav` | Page shows "License(s): CC0" only (verified in raw page HTML). In "8-bit Game Music" and "CC0 - Retro Music" collections. Tagged 8bit/retro/minigames; author's own words: "bonus round/minigame theme made with Famitracker" — different chiptune engine/composer to candidate 1. |
| pier-candidate-3.mp3 | "We Are Prophet - Happy, Energetic Tune" by TinyWorlds | https://opengameart.org/content/we-are-prophet-happy-energetic-tune — file: `bu-offensive-birds.mp3` | Page shows "License(s): CC0" only (verified in raw page HTML). In "Audio - CC0 - 8Bit -Chiptune", "CC0 Chiptunes", "CC0 Music" collections. Tags: happy, funny, fun, energy, energetic, 8-bit, chiptune — most directly on-brief title of the four. Made with Autotracker for a 2014 game jam. Same author (TinyWorlds) as the existing map-theme.mp3, different track. |
| pier-candidate-4.mp3 | "Bouncy Hamster Dancing (Menu Music?)" by cynicmusic | https://opengameart.org/content/bouncy-hamster-dancing-menu-music — file: `AlexBouncyMaster.wav` | Page shows "License(s): CC0" only (verified in raw page HTML). In "CC0 Upbeat / Electronic Music" and "Music - Platform & Background" collections. Tagged catchy/infectious/menu; author's own words: a "ridiculously infectious theme" deliberately reminiscent of the Hamster Dance meme. Synth/electronic instrumentation, not chiptune — the instrumentation outlier of the four. |

Each source loop (35–65s) was built up to spec-required 1–3 minute length with `ffmpeg`, looped
2–3× with 1-second triangular `acrossfade` crossfades at each seam (same technique as pier.mp3
above), then encoded to MP3 (libmp3lame, 160kbps CBR, 44.1kHz stereo). Verified with
`ffprobe`/`ffmpeg -f null -` (clean full decode, no errors) — 1:24–2:09 long, 1.6–2.6MB each, all
inside the 1–3 min / ≤5MB spec bounds.

## Verification

Every file below was checked with `afinfo` on macOS to confirm it decodes as valid audio, with the
reported duration noted. Total combined payload of audio/sfx + audio/music = **4.6 MB** (2.7 MB
pre-Pier + pier.mp3's 1.98 MB). This total excludes the four pending-selection candidates above
(pier-candidate-1..4.mp3, 8.4MB combined) — they are temporary audition files, not shipped
assets, and should be removed (all four, plus `fq-verify/pier-music-audition.html`) once Damien
has chosen one.
