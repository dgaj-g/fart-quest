# Fart Quest — Asset Credits

All assets below are CC0 (public domain, no attribution required) or OFL (SIL Open Font License) except where noted. Kenney does not require attribution but we credit them anyway as good practice.

## Art: Kenney "Monster Builder Pack"
- Source: https://kenney.nl/assets/monster-builder-pack
- Licence: CC0 1.0 Universal (Creative Commons Zero) — confirmed via `License.txt` inside the downloaded zip: "License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/ — This content is free to use in personal, educational and commercial projects."
- Downloaded from: https://kenney.nl/media/pages/assets/monster-builder-pack/663e4ef6de-1677495438/kenney_monster-builder-pack.zip
- Used for: all creature composites in `assets/monsters/` (bodies, arms, legs, eyes, mouths, horns/antennae/ear details), composited and re-tinted with the `sharp` npm package.

## Art: Kenney "Background Elements"
- Source: https://kenney.nl/assets/background-elements
- Licence: CC0 1.0 Universal — same `License.txt` terms as above, confirmed inside the downloaded zip.
- Downloaded from: https://kenney.nl/media/pages/assets/background-elements/b66a1ddec7-1677670395/kenney_background-elements.zip
- Used for: `assets/ui/hill-1.png`, `hill-2.png`, `tree-1.png`, `tree-2.png`, `cloud-1.png`, `cloud-2.png` (dark-tinted silhouettes for parallax scenery, source files `hills1.png`/`hills2.png`/`tree01.png`/`tree03.png`/`cloud1.png`/`cloud2.png`).

Note: the brief named "Background Elements Redux"; the current pack on kenney.nl is titled "Background Elements" (no "Redux" in the live URL slug) — same asset family, CC0, verified working download.

## Font: Fredoka (Google Fonts)
- Source: https://fonts.google.com/specimen/Fredoka
- Licence: SIL Open Font License 1.1 (OFL) — Google Fonts serves all fonts under their stated licences; Fredoka is OFL per its Google Fonts listing.
- Downloaded via: `https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&display=swap` (Safari User-Agent) → woff2 URL `https://fonts.gstatic.com/s/fredoka/v17/X7n64b87HvSqjb_WIi2yDCRwoQ_k7367_DWu89XgHPyh.woff2`
- Files: `assets/fonts/fredoka-500.woff2`, `assets/fonts/fredoka-700.woff2`
- Note: Fredoka is a variable font — Google currently serves the SAME static woff2 file (containing the full weight axis) for both the 500 and 700 `font-weight` CSS requests in the latin subset, so both files are byte-identical (29,704 bytes each, valid `wOF2` magic header). This is correct/expected for this family, not a download error; the browser's `font-weight` selector still picks the right rendered weight from the variable font at runtime.

## App icons
- Source art: `assets/monsters/stinkling-3.png` (Kenney Monster Builder Pack composite, see above), cropped/padded onto a solid `#16241B` background.
- Files: `assets/icon-192.png`, `assets/icon-512.png`, `assets/icon-maskable-512.png` (extra padding for maskable safe zone), `assets/apple-touch-180.png`.

## Compositing tooling
- Node `sharp` (npm, globally installed) used for all layering, tinting (`.modulate`, `.tint`), trimming, and resizing. No other image tools used.
