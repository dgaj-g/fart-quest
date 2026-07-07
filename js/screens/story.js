// FART QUEST — js/screens/story.js (UI agent)
// #/story — 6-scene CSS-animated cold-open, then hands off to the coach.js tutorial, then #/map.
// Replay-safe: mount() always starts at scene 1, regardless of storySeen.

import coach from '../engine/coach.js';

const AUTO_ADVANCE_MS = 7000; // fallback if VO has no measurable length / is silent

let alive = false;
let sceneTimer = null;
let sceneIndex = 0;
let ctxRef = null;
let rootEl = null;
let finished = false;

// ---------- scene data ----------
// Each scene is a declarative composition built from EXISTING assets only.
const SCENES = [
  {
    id: 'scene-1',
    tint: 'tint-dawn',
    caption: 'Once, the Kingdom of Fart Quest was the freshest place for miles around…',
    voId: 'story-01',
    fumes: false,
    build(el) {
      el.innerHTML = `
        <div class="story-sky"></div>
        <div class="story-layer story-hills">
          <img class="story-hill back" src="assets/ui/hill-2.png" alt="">
          <img class="story-tree t1" src="assets/ui/tree-2.png" alt="">
          <img class="story-tree t2" src="assets/ui/tree-1.png" alt="">
          <img class="story-hill front" src="assets/ui/hill-1.png" alt="">
        </div>
        <img class="story-cloud c1 drift" src="assets/ui/cloud-1.png" alt="">
        <img class="story-cloud c2 drift-slow" src="assets/ui/cloud-2.png" alt="">
        <img class="story-critter idle-bob a" src="assets/monsters/stinkling-1.png" alt="">
        <img class="story-critter idle-bob b" src="assets/monsters/stinkling-3.png" alt="">
      `;
    },
  },
  {
    id: 'scene-2',
    tint: 'tint-dusk',
    caption: 'But deep in the Sewer Below, the SKIDMARK KING stirred…',
    voId: 'story-02',
    fumes: false,
    build(el) {
      el.innerHTML = `
        <div class="story-sky"></div>
        <div class="story-layer story-hills">
          <img class="story-hill back" src="assets/ui/hill-2.png" alt="">
          <img class="story-hill front" src="assets/ui/hill-1.png" alt="">
        </div>
        <img class="story-king slide-up" src="assets/monsters/countfather-silhouette.png" alt="The Skidmark King">
        <div class="story-king-glow"></div>
      `;
    },
  },
  {
    id: 'scene-3',
    tint: 'tint-stink',
    caption: 'He unleashed THE GREAT STINK across the whole land!',
    voId: 'story-03',
    fumes: true,
    fumeScale: '1.6',
    onEnter(ctx) {
      ctx.audio.sfx('wail'); // graceful no-op until an audio agent adds this key
      ctx.audio.parp(3);
    },
    build(el) {
      el.innerHTML = `
        <div class="story-sky"></div>
        <div class="story-layer story-hills">
          <img class="story-hill back" src="assets/ui/hill-2.png" alt="">
          <img class="story-hill front" src="assets/ui/hill-1.png" alt="">
        </div>
        <img class="story-king story-king-loom" src="assets/monsters/countfather-silhouette.png" alt="">
        <img class="story-critter idle-bob a stink-tinted" src="assets/monsters/stinkling-2.png" alt="">
        <img class="story-critter idle-bob b stink-tinted" src="assets/monsters/stinkling-5.png" alt="">
        <img class="story-critter idle-bob c stink-tinted" src="assets/monsters/stinkling-6.png" alt="">
      `;
    },
  },
  {
    id: 'scene-4',
    tint: 'tint-stink',
    caption: 'The monsters aren’t wicked… they’re just VERY smelly. They need your help.',
    voId: 'story-04',
    fumes: true,
    fumeScale: '.6',
    build(el) {
      el.innerHTML = `
        <img class="story-closeup sad-then-cheeky" src="assets/monsters/stinkling-4.png" alt="A stinkling">
      `;
    },
  },
  {
    id: 'scene-5',
    tint: 'tint-dawn',
    caption: 'Enter WHIFFBEARD, Professor of Pong, keeper of the Secret Weapons!',
    voId: 'story-05',
    fumes: false,
    build(el) {
      el.innerHTML = `
        <div class="story-sparkle-rays"></div>
        <img class="story-closeup whiffbeard-arrive idle-bob" src="assets/monsters/whiffbeard.png" alt="Whiffbeard">
      `;
    },
  },
  {
    id: 'scene-6',
    tint: 'tint-dawn',
    caption: 'Only one hero can clear the stink for good. Only one hero… is YOU.',
    voId: 'story-06',
    fumes: false,
    build(el) {
      el.innerHTML = `
        <div class="story-layer story-hills zoom-in">
          <img class="story-hill back" src="assets/ui/hill-2.png" alt="">
          <img class="story-tree t1" src="assets/ui/tree-1.png" alt="">
          <img class="story-hill front" src="assets/ui/hill-1.png" alt="">
        </div>
        <div class="story-hero-card enter-pop">
          <div class="story-hero-title">SIR JARLATH<br>OF FART QUEST</div>
        </div>
      `;
    },
  },
];

// ---------- coach.js tutorial script (Fart Quest's concrete 4-step onboarding) ----------
// Selectors point at real classes already shipped by the UI agent's screens; if a target
// isn't found on the live screen (e.g. re-ordered markup) coach.js falls back to a centred
// non-cutout card, so this stays robust even if those files change shape later.
export const TUTORIAL_STEPS = [
  {
    target: '.map-pad',
    text: 'Tap a stinky pad to begin, my brave nose-soldier!',
    vo: 'tutorial-01',
    advanceOn: 'tap-target',
  },
  {
    target: '.topic-action-btn[data-action="lesson"]',
    text: 'Scout Report first — ALWAYS learn before you fight!',
    vo: 'tutorial-02',
    advanceOn: 'tap-target',
  },
  {
    type: 'battle-demo',
    text: 'Answer right and the PONG METER drains. Answer wrong? No worries — I’ll teach you and we try again!',
    vo: 'tutorial-03',
  },
  {
    target: '.collection-title, .collection-grid',
    text: 'Everything you de-stink lives here, in the Stink Vault!',
    vo: 'tutorial-04',
    advanceOn: 'tap-anywhere',
  },
];

// ---------- caption + chrome ----------
function clearTimers() {
  clearTimeout(sceneTimer);
  sceneTimer = null;
}

function renderScene(root, ctx, index) {
  const scene = SCENES[index];
  const stage = root.querySelector('.story-stage');
  const captionEl = root.querySelector('.story-caption-text');
  const dotsEl = root.querySelector('.story-dots');

  stage.className = `story-stage enter-pop ${scene.tint}`;
  stage.innerHTML = '';
  scene.build(stage);

  if (scene.fumes) {
    const fumes = document.createElement('div');
    fumes.className = 'fumes story-fumes';
    fumes.style.setProperty('--fume-scale', scene.fumeScale || '1');
    fumes.innerHTML = '<div class="blob"></div><div class="blob"></div><div class="blob"></div>';
    stage.appendChild(fumes);
  }

  captionEl.textContent = scene.caption;
  if (dotsEl) {
    dotsEl.querySelectorAll('.story-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  if (typeof scene.onEnter === 'function') {
    try { scene.onEnter(ctx); } catch (e) { /* swallow — story must never crash the app */ }
  }

  ctx.audio.vo(scene.voId);

  clearTimers();
  sceneTimer = setTimeout(() => advance(), AUTO_ADVANCE_MS);
}

function advance() {
  if (!alive || finished) return;
  clearTimers();
  sceneIndex += 1;
  if (sceneIndex >= SCENES.length) {
    finish();
    return;
  }
  renderScene(rootEl, ctxRef, sceneIndex);
}

async function finish() {
  if (finished) return;
  finished = true;
  clearTimers();

  try {
    if (ctxRef && ctxRef.db) await ctxRef.db.put('meta', 'storySeen', true);
  } catch (e) { /* swallow — never block progression on a persistence hiccup */ }

  // Navigate to the map FIRST so the tutorial's spotlight targets (map pads,
  // topic buttons) actually exist on screen — the coach overlay lives in
  // #overlay and deliberately outlives this screen's unmount.
  const ctx = ctxRef;
  ctx.go('#/map');
  setTimeout(() => {
    coach.run(TUTORIAL_STEPS, ctx).catch(() => { /* coach.run never throws by contract */ });
  }, 750);
}

export function mount(root, ctx, params) {
  alive = true;
  finished = false;
  sceneIndex = 0;
  ctxRef = ctx;

  const screen = document.createElement('div');
  screen.className = 'story-screen screen';
  screen.innerHTML = `
    <div class="story-stage"></div>
    <button class="btn btn-ghost story-skip">Skip ⏭</button>
    <div class="story-caption-band">
      <div class="story-caption-text"></div>
    </div>
    <div class="story-dots">${SCENES.map(() => '<span class="story-dot"></span>').join('')}</div>
  `;
  root.appendChild(screen);
  rootEl = screen;

  renderScene(screen, ctx, sceneIndex);

  screen.addEventListener('click', (e) => {
    if (e.target.closest('.story-skip')) {
      ctx.audio.sfx('click');
      finish();
      return;
    }
    advance();
  });
}

export function unmount() {
  alive = false;
  clearTimers();
}

export default { mount, unmount };
