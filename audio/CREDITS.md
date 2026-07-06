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

## Verification

Every file below was checked with `afinfo` on macOS to confirm it decodes as valid audio, with the
reported duration noted. Total combined payload of audio/sfx + audio/music = **2.7 MB**.
