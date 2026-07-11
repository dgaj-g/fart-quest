// FART QUEST — sw.js (UI agent)
const CACHE_V = 'fq-v15';

const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/apple-touch-180.png',
  'assets/fonts/fredoka-500.woff2',
  'assets/fonts/fredoka-700.woff2',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png',
  'assets/monsters/backwards-bertha-shiny.png',
  'assets/monsters/backwards-bertha.png',
  'assets/monsters/baron-bumdigit-shiny.png',
  'assets/monsters/baron-bumdigit.png',
  'assets/monsters/barry-chart-shiny.png',
  'assets/monsters/barry-chart.png',
  'assets/monsters/borrowin-barry-shiny.png',
  'assets/monsters/borrowin-barry.png',
  'assets/monsters/bus-conductor-bogface-shiny.png',
  'assets/monsters/bus-conductor-bogface.png',
  'assets/monsters/captain-apostrophe-catastrophe.png',
  'assets/monsters/centi-peed-shiny.png',
  'assets/monsters/centi-peed.png',
  'assets/monsters/comma-chameleon-shiny.png',
  'assets/monsters/comma-chameleon.png',
  'assets/monsters/contents-mcindex-shiny.png',
  'assets/monsters/contents-mcindex.png',
  'assets/monsters/couldve-colin-shiny.png',
  'assets/monsters/couldve-colin.png',
  'assets/monsters/countfather-silhouette.png',
  'assets/monsters/cubby-mcsquareface-shiny.png',
  'assets/monsters/cubby-mcsquareface.png',
  'assets/monsters/fifty-fifty-fred.png',
  'assets/monsters/freezer-geezer-shiny.png',
  'assets/monsters/freezer-geezer.png',
  'assets/monsters/full-stop-phil-shiny.png',
  'assets/monsters/full-stop-phil.png',
  'assets/monsters/graf-the-chart-goblin.png',
  'assets/monsters/grammazilla.png',
  'assets/monsters/gridlock-shiny.png',
  'assets/monsters/gridlock.png',
  'assets/monsters/halfbottom-the-divided-shiny.png',
  'assets/monsters/halfbottom-the-divided.png',
  'assets/monsters/i-before-e-leen-shiny.png',
  'assets/monsters/i-before-e-leen.png',
  'assets/monsters/inspector-sniff-shiny.png',
  'assets/monsters/inspector-sniff.png',
  'assets/monsters/its-its-the-confused-shiny.png',
  'assets/monsters/its-its-the-confused.png',
  'assets/monsters/lord-waffle.png',
  'assets/monsters/maybe-marvin-shiny.png',
  'assets/monsters/maybe-marvin.png',
  'assets/monsters/neccessarry-the-unspellable-shiny.png',
  'assets/monsters/neccessarry-the-unspellable.png',
  'assets/monsters/nudge-nudge-ned-shiny.png',
  'assets/monsters/nudge-nudge-ned.png',
  'assets/monsters/obtusius-shiny.png',
  'assets/monsters/obtusius.png',
  'assets/monsters/old-farter-time.png',
  'assets/monsters/paragraph-pete-shiny.png',
  'assets/monsters/paragraph-pete.png',
  'assets/monsters/percy-percent-shiny.png',
  'assets/monsters/percy-percent.png',
  'assets/monsters/pie-face-shiny.png',
  'assets/monsters/pie-face.png',
  'assets/monsters/pointy-mcpoopants-shiny.png',
  'assets/monsters/pointy-mcpoopants.png',
  'assets/monsters/polly-gone-shiny.png',
  'assets/monsters/polly-gone.png',
  'assets/monsters/prime-slime-shiny.png',
  'assets/monsters/prime-slime.png',
  'assets/monsters/reflecto-shiny.png',
  'assets/monsters/reflecto.png',
  'assets/monsters/rhymin-simon-shiny.png',
  'assets/monsters/rhymin-simon.png',
  'assets/monsters/royal-guard.png',
  'assets/monsters/simile-emily-shiny.png',
  'assets/monsters/simile-emily.png',
  'assets/monsters/sir-facelot-shiny.png',
  'assets/monsters/sir-facelot.png',
  'assets/monsters/sir-roundbottom-shiny.png',
  'assets/monsters/sir-roundbottom.png',
  'assets/monsters/skinty-mcgrabhands-shiny.png',
  'assets/monsters/skinty-mcgrabhands.png',
  'assets/monsters/splatrick-the-swift-shiny.png',
  'assets/monsters/splatrick-the-swift.png',
  'assets/monsters/stinkling-1.png',
  'assets/monsters/stinkling-2.png',
  'assets/monsters/stinkling-3.png',
  'assets/monsters/stinkling-4.png',
  'assets/monsters/stinkling-5.png',
  'assets/monsters/stinkling-6.png',
  'assets/monsters/synonym-sinead-shiny.png',
  'assets/monsters/synonym-sinead.png',
  'assets/monsters/tally-wally-shiny.png',
  'assets/monsters/tally-wally.png',
  'assets/monsters/the-air-quoter-shiny.png',
  'assets/monsters/the-air-quoter.png',
  'assets/monsters/the-changeling-shiny.png',
  'assets/monsters/the-changeling.png',
  'assets/monsters/the-countfather.png',
  'assets/monsters/the-geese-police-shiny.png',
  'assets/monsters/the-geese-police.png',
  'assets/monsters/the-golden-turd.png',
  'assets/monsters/the-goodest-boy-shiny.png',
  'assets/monsters/the-goodest-boy.png',
  'assets/monsters/the-meanie-shiny.png',
  'assets/monsters/the-meanie.png',
  'assets/monsters/the-minute-muncher-shiny.png',
  'assets/monsters/the-minute-muncher.png',
  'assets/monsters/the-mirror-bum.png',
  'assets/monsters/the-noun-hound-shiny.png',
  'assets/monsters/the-noun-hound.png',
  'assets/monsters/the-penny-pincher.png',
  'assets/monsters/the-perimeter-prowler-shiny.png',
  'assets/monsters/the-perimeter-prowler.png',
  'assets/monsters/the-sequel-shiny.png',
  'assets/monsters/the-sequel.png',
  'assets/monsters/the-shrinkler-shiny.png',
  'assets/monsters/the-shrinkler.png',
  'assets/monsters/the-skidmark-king.png',
  'assets/monsters/the-there-their-theyre-wolf.png',
  'assets/monsters/two-too-the-twinned-shiny.png',
  'assets/monsters/two-too-the-twinned.png',
  'assets/monsters/whiffbeard.png',
  'assets/monsters/wrong-way-wanda-shiny.png',
  'assets/monsters/wrong-way-wanda.png',
  'assets/monsters/yesterdays-gary-shiny.png',
  'assets/monsters/yesterdays-gary.png',
  'assets/ui/cloud-1.png',
  'assets/ui/cloud-2.png',
  'assets/ui/hill-1.png',
  'assets/ui/hill-2.png',
  'assets/ui/tree-1.png',
  'assets/ui/tree-2.png',
  'css/anims.css',
  'css/battle.css',
  'css/exam.css',
  'css/formats.css',
  'css/lesson.css',
  'css/main.css',
  'css/passage.css',
  'css/story.css',
  'data/creatures.js',
  'data/map.js',
  'data/passages/index.js',
  'data/passages/passage-fiction-1.js',
  'data/passages/passage-fiction-2.js',
  'data/passages/passage-nonfiction-1.js',
  'data/passages/passage-nonfiction-2.js',
  'data/passages/passage-poem-1.js',
  'data/passages/passage-poem-2.js',
  'data/topics/angles-lines.js',
  'data/topics/apostrophes.js',
  'data/topics/area-volume.js',
  'data/topics/between-lines.js',
  'data/topics/capitals-endmarks.js',
  'data/topics/change-coins.js',
  'data/topics/clocks-time.js',
  'data/topics/commas-colons.js',
  'data/topics/comparatives.js',
  'data/topics/contractions.js',
  'data/topics/coordinates.js',
  'data/topics/decimals-x10.js',
  'data/topics/fdp.js',
  'data/topics/fractions.js',
  'data/topics/graphs-charts.js',
  'data/topics/homophones.js',
  'data/topics/index.js',
  'data/topics/kinds-of-writing.js',
  'data/topics/machines-mystery.js',
  'data/topics/mean-range.js',
  'data/topics/mental-maths.js',
  'data/topics/metric-units.js',
  'data/topics/money-problems.js',
  'data/topics/parts-of-speech.js',
  'data/topics/perimeter.js',
  'data/topics/pie-charts.js',
  'data/topics/place-value.js',
  'data/topics/plurals-collectives.js',
  'data/topics/poetry.js',
  'data/topics/probability.js',
  'data/topics/reading-detective.js',
  'data/topics/rounding.js',
  'data/topics/scale-maps.js',
  'data/topics/sentence-parts.js',
  'data/topics/sequences.js',
  'data/topics/shapes-2d.js',
  'data/topics/shapes-3d.js',
  'data/topics/special-numbers.js',
  'data/topics/speech-brackets.js',
  'data/topics/spelling-rules.js',
  'data/topics/symmetry.js',
  'data/topics/tables-tally.js',
  'data/topics/temperature.js',
  'data/topics/tenses.js',
  'data/topics/timetables.js',
  'data/topics/tricky-words.js',
  'data/topics/turns-compass.js',
  'data/topics/words-in-context.js',
  'data/topics/writers-tricks.js',
  'data/topics/written-methods.js',
  'js/anims/_kit.js',
  'js/anims/angles-lines.js',
  'js/anims/apostrophes.js',
  'js/anims/area-volume.js',
  'js/anims/between-lines.js',
  'js/anims/capitals-endmarks.js',
  'js/anims/change-coins.js',
  'js/anims/clocks-time.js',
  'js/anims/commas-colons.js',
  'js/anims/comparatives.js',
  'js/anims/contractions.js',
  'js/anims/coordinates.js',
  'js/anims/decimals-x10.js',
  'js/anims/fdp.js',
  'js/anims/fractions.js',
  'js/anims/graphs-charts.js',
  'js/anims/homophones.js',
  'js/anims/index.js',
  'js/anims/kinds-of-writing.js',
  'js/anims/machines-mystery.js',
  'js/anims/mean-range.js',
  'js/anims/mental-maths.js',
  'js/anims/metric-units.js',
  'js/anims/money-problems.js',
  'js/anims/parts-of-speech.js',
  'js/anims/perimeter.js',
  'js/anims/pie-charts.js',
  'js/anims/place-value.js',
  'js/anims/plurals-collectives.js',
  'js/anims/poetry.js',
  'js/anims/probability.js',
  'js/anims/reading-detective.js',
  'js/anims/rounding.js',
  'js/anims/scale-maps.js',
  'js/anims/sentence-parts.js',
  'js/anims/sequences.js',
  'js/anims/shapes-2d.js',
  'js/anims/shapes-3d.js',
  'js/anims/special-numbers.js',
  'js/anims/speech-brackets.js',
  'js/anims/spelling-rules.js',
  'js/anims/symmetry.js',
  'js/anims/tables-tally.js',
  'js/anims/temperature.js',
  'js/anims/tenses.js',
  'js/anims/timetables.js',
  'js/anims/tricky-words.js',
  'js/anims/turns-compass.js',
  'js/anims/words-in-context.js',
  'js/anims/writers-tricks.js',
  'js/anims/written-methods.js',
  'js/audio.js',
  'js/db.js',
  'js/engine/battle.js',
  'js/engine/coach.js',
  'js/engine/diagrams.js',
  'js/engine/formats/clozebox.js',
  'js/engine/formats/errorspot.js',
  'js/engine/formats/index.js',
  'js/engine/formats/mcq.js',
  'js/engine/formats/numpad.js',
  'js/engine/formats/selecttwo.js',
  'js/engine/formats/wordentry.js',
  'js/engine/lesson.js',
  'js/engine/passage.js',
  'js/examProvider.js',
  'js/gen/angles.js',
  'js/gen/areavolume.js',
  'js/gen/changecoins.js',
  'js/gen/clocks.js',
  'js/gen/coordinates.js',
  'js/gen/decimals.js',
  'js/gen/fdp.js',
  'js/gen/fractions.js',
  'js/gen/graphs.js',
  'js/gen/index.js',
  'js/gen/machines.js',
  'js/gen/meanrange.js',
  'js/gen/mentalmaths.js',
  'js/gen/metricunits.js',
  'js/gen/moneyproblems.js',
  'js/gen/perimeter.js',
  'js/gen/piecharts.js',
  'js/gen/placevalue.js',
  'js/gen/probability.js',
  'js/gen/rounding.js',
  'js/gen/scalemaps.js',
  'js/gen/sequences.js',
  'js/gen/shapes2d.js',
  'js/gen/shapes3d.js',
  'js/gen/specialnumbers.js',
  'js/gen/symmetry.js',
  'js/gen/tablestally.js',
  'js/gen/temperature.js',
  'js/gen/timetables.js',
  'js/gen/turnscompass.js',
  'js/gen/writtenmethods.js',
  'js/main.js',
  'js/rng.js',
  'js/router.js',
  'js/screens/armoury.js',
  'js/screens/battle.js',
  'js/screens/collection.js',
  'js/screens/exam.js',
  'js/screens/lesson.js',
  'js/screens/map.js',
  'js/screens/parent.js',
  'js/screens/settings.js',
  'js/screens/story.js',
  'js/screens/title.js',
  'js/screens/topic.js',
  'js/state.js',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    // Atomic on purpose: if ANY precache file is missing, the whole install fails
    // and the previous version keeps serving. A half-populated cache must never
    // activate — a "best-effort" partial install is exactly how the app once went
    // blank for real visitors (fq-v6 activated without js/anims/_kit.js).
    // {cache:'reload'} bypasses the HTTP cache so a stale CDN/browser copy can't
    // poison a fresh version's precache.
    caches.open(CACHE_V).then((cache) =>
      cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_V).map((k) => caches.delete(k)));
      // Self-heal: if this version's cache is missing entries (storage eviction on
      // iOS, or a resurrected registration whose install never re-ran), top it up.
      // Best-effort per entry — unlike install, activation must never fail.
      const cache = await caches.open(CACHE_V);
      const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
      const missing = PRECACHE_URLS.filter((u) => !have.has(new URL(u, self.location.href).pathname));
      await Promise.all(missing.map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
      await self.clients.claim();
    })()
  );
});

function isVoManifest(url) {
  return url.pathname.endsWith('/audio/vo/manifest.json');
}

function isAudio(url) {
  return url.pathname.includes('/audio/');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // VO manifest: network-first so new recordings show up immediately.
  if (isVoManifest(url)) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_V).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // audio/**: runtime cache-first
  if (isAudio(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_V).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // everything else (shell): cache-first, version-pinned. Shell files are written
  // ONLY at install time — never refreshed at runtime — so one running version can
  // never serve a mix of old and new files (a stale worker background-refreshing
  // its own cache is how clients ended up on a broken old/new hybrid). Updates
  // arrive solely via a new sw.js with a bumped CACHE_V — every deploy that
  // changes any shell file MUST bump CACHE_V.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
