# Installing Damien's voice recordings into Fart Quest

## What you do (Damien)
1. Record clips per `AUDIO_SCRIPTS.md` (any subset — Priority A first).
2. Put the `.m4a` files in: `/Users/damiengartland/Desktop/Claude Work/Jarlath SEAG App/VO Recordings/`
3. Open a **new Claude Code session** (Sonnet is plenty — do NOT burn Fable on this) and paste the prompt below.
4. First run may show a one-time macOS permission popup for folder access — click Allow.

## The prompt to paste (self-contained)

```
Install voice-over recordings into the Fart Quest app. Follow these steps exactly:

1. Source folder: /Users/damiengartland/Desktop/Claude Work/Jarlath SEAG App/VO Recordings/
   Repo: /Users/damiengartland/Sites/fart-quest (git, GitHub Pages on main)
   Canonical filename list: /Users/damiengartland/Sites/fart-quest/docs/AUDIO_SCRIPTS.md

2. List every audio file in the source folder. Valid names match ^vo-[a-z-]+-\d\d\.m4a$ AND appear in AUDIO_SCRIPTS.md. For near-misses (wrong case, spaces, missing leading zero, .mp3/.wav extension, "vo-correct-1"), rename/convert to the canonical name (afconvert -f m4af -d aac for non-m4a). List anything you can't confidently match and skip it — never guess between two plausible targets.

3. Run `afinfo` on each valid file: confirm it decodes, duration 0.3s–25s, non-zero size. Reject and report failures.

4. Copy valid files into /Users/damiengartland/Sites/fart-quest/audio/vo/ (overwrite same-name files — re-recordings are expected).

5. Rewrite /Users/damiengartland/Sites/fart-quest/audio/vo/manifest.json as {"files":[...]} listing EVERY vo-*.m4a actually present in that folder (sorted). Validate with python3 -m json.tool.

6. git add audio/vo && git commit -m "Add/update voice-over recordings" && git push origin main.

7. Wait for GitHub Pages to redeploy (poll: curl -s https://dgaj-g.github.io/fart-quest/audio/vo/manifest.json until it contains the new files; up to ~3 min), then confirm one audio file serves: curl -sI a sample file → 200.

8. Report: files installed, files renamed (old → new), files skipped and why, and confirmation the live manifest matches.

Do not touch any other file in the repo. Do not run the full app or edit code.
```

## Notes
- The app reads `manifest.json` network-first, so new recordings appear without any cache-version change.
- Partial sets are fine — the app randomises among whatever exists and stays silent for missing prefixes.
- Re-record any line whenever: same filename = automatic replacement on the next run.
