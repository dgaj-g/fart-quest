# Fart Quest 💨

A monster-battling revision kingdom that prepares one particular hero for the Northern Ireland SEAG transfer test (November 2027). Built as an offline-capable PWA for iPad: every topic is taught from zero by Professor Whiffbeard, distilled into a collectable Secret Weapon (the exam shortcut), then battled through minions → elites → boss. Beaten bosses are de-stunk and join the collection. The map's stink level is the confidence tracker.

**Play:** https://dgaj-g.github.io/fart-quest/ — on iPad: open in Safari → Share → Add to Home Screen.

## Tech
- Vanilla HTML/CSS/JS, native ES modules, zero build step, zero runtime dependencies.
- PWA: service worker precaches the shell; audio is lazy-loaded then cached. Progress lives in IndexedDB (export/import in the Grown-Ups' Door).
- Local dev: `python3 -m http.server 8123` from the repo root.

## Content
All teaching content, questions and characters are original, written for this app. Question *formats* mirror the official SEAG assessment structure. No purchased practice-paper material is included in this repository. Maths practice questions are parameterised generators — answers are computed, never authored.

- Curriculum plan: `docs/BUILD_SPEC.md` + the topic map (kept outside the repo).
- Adding topics: `docs/ADDING_A_TOPIC.md`.
- Voice-over: `docs/AUDIO_SCRIPTS.md` + `docs/AUDIO_PLACEMENT.md`.

## Credits
Creature art composited from Kenney.nl asset packs (CC0); sounds & music per `audio/CREDITS.md` (CC0/public domain); Fredoka font (OFL). Thank you, generous internet.

## Licence
Code MIT. Character names, lesson text and Professor Whiffbeard's opinions belong to the Gartland household.
