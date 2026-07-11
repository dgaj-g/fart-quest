// FART QUEST — screens/map.js (UI agent) — Map v2 (ENGINE_SPEC_2 §G)
import { REGIONS, CASTLE } from '../../data/map.js';
import { COMMONS } from '../../data/creatures.js';

const COACH_KEY = 'mapCoachSeen';
const TUTORIAL_KEY = 'tutorialDone';

// vertical offsets so each region's trail snakes rather than sitting in a flat row
const PAD_OFFSETS = [18, -32, 8, -22, 30, -14, 20, -30, 10, -18];

const PAD_CELL = 250;   // pad width (210) + its 2x20px margins
const BOSS_CELL = 260;
const LOCKED_W = 280;
const GATE_W = 340;
const REGION_GAP = 64;
const START_X = 40;

// module-scoped so scroll position survives unmount/remount within THIS session
// (spec: "Map remembers scroll position per session" — not persisted to db).
let savedScrollLeft = 0;

function regionCapturedCount(region, ctx) {
  let count = 0;
  region.locations.forEach((loc) => {
    const topic = ctx.topics[loc.topicId];
    if (topic && ctx.state.topic(loc.topicId).captured) count += 1;
  });
  return count;
}

function regionFullyCleansed(region, ctx) {
  if (!region.locations.length) return false;
  return region.locations.every((loc) => {
    const topic = ctx.topics[loc.topicId];
    return topic && ctx.state.topic(loc.topicId).captured;
  });
}

function computeUnlocked(ctx) {
  const byId = {};
  REGIONS.forEach((r) => { byId[r.id] = r; });
  const unlocked = {};
  REGIONS.forEach((region) => {
    if (!region.unlockAfter) { unlocked[region.id] = true; return; }
    const prev = byId[region.unlockAfter];
    unlocked[region.id] = prev ? regionCapturedCount(prev, ctx) >= region.unlockNeeded : true;
  });
  return { unlocked, byId };
}

// weakest > due review > next untaught, restricted to topics actually in the registry
// (spec order: due review > weakest practising > next untaught — implemented in that order).
function computeNextQuest(ctx) {
  const liveIds = Object.keys(ctx.topics);
  if (liveIds.length === 0) return null;

  const due = ctx.state.dueReviews().filter((id) => liveIds.includes(id));
  if (due.length > 0) return due[0];

  let weakest = null;
  let weakestAcc = Infinity;
  liveIds.forEach((id) => {
    const record = ctx.state.topic(id);
    if (record.taught && !record.bossBeaten) {
      const window = record.last10 || [];
      const acc = window.length ? window.filter((a) => a.correct).length / window.length : 0;
      if (acc < weakestAcc) { weakestAcc = acc; weakest = id; }
    }
  });
  if (weakest) return weakest;

  for (const region of REGIONS) {
    for (const loc of region.locations) {
      if (ctx.topics[loc.topicId] && !ctx.state.topic(loc.topicId).taught) return loc.topicId;
    }
  }
  return null;
}

function buildPad(loc, i, ctx) {
  const pad = document.createElement('button');
  pad.className = 'map-pad';
  pad.style.setProperty('--pad-offset', `${PAD_OFFSETS[i % PAD_OFFSETS.length]}px`);
  pad.dataset.topicId = loc.topicId;

  const topic = ctx.topics[loc.topicId];
  if (topic) {
    const record = ctx.state.topic(loc.topicId);
    const stinkVal = ctx.state.stink(loc.topicId);
    const conquered = record.captured;
    if (conquered) pad.classList.add('conquered');
    const fumeScale = Math.max(0.2, stinkVal / 100);

    pad.innerHTML = `
      <div class="pad-fumes fumes" style="--fume-scale:${fumeScale.toFixed(2)}">
        ${stinkVal > 5 ? '<div class="blob"></div><div class="blob"></div><div class="blob"></div>' : ''}
      </div>
      ${conquered ? '<div class="pad-sparkle">✨</div>' : ''}
      <img class="pad-creature idle-bob ${conquered ? '' : 'silhouette'}" src="${topic.creature.image}" alt="${topic.creature.name}">
      <div class="pad-stone"></div>
      <div class="pad-plaque">${topic.name}</div>
    `;
    pad.addEventListener('click', () => {
      ctx.audio.sfx('click');
      ctx.go(`#/topic/${loc.topicId}`);
    });
  } else {
    pad.classList.add('map-pad-fogged');
    pad.disabled = true;
    pad.innerHTML = `
      <div class="pad-stone"></div>
      <div class="plank-sign">${loc.name}${loc.creatureName ? `<br><span class="plank-creature">${loc.creatureName}</span>` : ''}<br>OPENS SOON</div>
    `;
  }
  return pad;
}

function buildBossHill(region, ctx) {
  const bossHill = document.createElement('div');
  bossHill.className = 'map-boss-hill map-boss-hill-region';
  bossHill.innerHTML = `
    <div class="boss-aura"></div>
    <img src="${region.boss.image}" alt="${region.boss.name}" onerror="this.style.visibility='hidden'">
    <div class="boss-note">${region.boss.name}<br>${region.boss.note}</div>
  `;
  bossHill.addEventListener('click', () => {
    ctx.audio.sfx('click');
    bossHill.querySelector('.boss-note').classList.toggle('show');
  });
  return bossHill;
}

function buildLiveRegionBand(region, ctx) {
  const width = region.locations.length * PAD_CELL + BOSS_CELL + 60;
  const wrap = document.createElement('div');
  wrap.className = 'map-band';
  wrap.style.width = `${width}px`;
  wrap.style.background = region.palette.band;
  if (regionFullyCleansed(region, ctx)) wrap.classList.add('cleansed');

  const sign = document.createElement('div');
  sign.className = 'region-band-sign';
  sign.style.borderColor = region.palette.accent;
  sign.textContent = `${region.name.toUpperCase()} 💨`;
  wrap.appendChild(sign);

  const padsRow = document.createElement('div');
  padsRow.className = 'band-pads-row';
  region.locations.forEach((loc, i) => {
    padsRow.appendChild(buildPad(loc, i, ctx));
    if (i < region.locations.length - 1) {
      const tree = document.createElement('img');
      tree.className = `map-between-tree ${i % 2 === 0 ? 'tree-a' : 'tree-b'}`;
      tree.src = i % 3 === 0 ? 'assets/ui/tree-1.png' : 'assets/ui/tree-2.png';
      tree.alt = '';
      padsRow.appendChild(tree);
    }
  });
  wrap.appendChild(padsRow);
  wrap.appendChild(buildBossHill(region, ctx));

  return { el: wrap, width };
}

function buildLockedBlock(region, ctx, byId) {
  const wrap = document.createElement('button');
  wrap.className = 'map-region-locked';
  wrap.style.width = `${LOCKED_W}px`;

  const prev = region.unlockAfter ? byId[region.unlockAfter] : null;
  const prevCaptured = prev ? regionCapturedCount(prev, ctx) : 0;
  const need = prev ? Math.max(0, region.unlockNeeded - prevCaptured) : 0;
  const requirement = prev
    ? (need > 0
      ? `Capture ${need} more monster${need === 1 ? '' : 's'} in ${prev.name} to clear this path!`
      : 'This path is about to clear — one more step!')
    : '';

  wrap.innerHTML = `
    <div class="region-block"></div>
    <div class="closed-sign">${region.name}<br>${region.closedSign}</div>
    ${requirement ? `<div class="locked-requirement">${requirement}</div>` : ''}
  `;
  wrap.addEventListener('click', () => {
    ctx.audio.sfx('click');
    const note = wrap.querySelector('.locked-requirement');
    if (note) note.classList.toggle('show');
  });
  return { el: wrap, width: LOCKED_W };
}

function buildCastleGate(ctx) {
  const wrap = document.createElement('div');
  wrap.className = 'map-region-locked map-castle-gate';
  wrap.style.width = `${GATE_W}px`;
  wrap.innerHTML = `
    <div class="region-block castle-block">🏰</div>
    <div class="closed-sign">${CASTLE.name}<br>${CASTLE.sign}</div>
  `;
  // The gate opens the Castle Clench hub — entry itself is never gated because
  // the hub's two doors (Training Skirmish / the Skidmark King) each show their
  // own lock state and cleansed-region progress. Without this handler the whole
  // exam wing was unreachable in normal play.
  wrap.style.cursor = 'pointer';
  wrap.addEventListener('click', () => {
    ctx.audio.sfx('confirm');
    ctx.go('#/exam');
  });
  return { el: wrap, width: GATE_W };
}

export async function mount(root, ctx) {
  ctx.audio.music('map');
  const screen = document.createElement('div');
  screen.className = 'map-screen screen enter-pop';

  const { unlocked, byId } = computeUnlocked(ctx);

  // ---- HUD ----
  const hud = document.createElement('div');
  hud.className = 'map-hud';

  const commonsOwned = ctx.state.commonsOwned();
  const totalCollectible = COMMONS.length + Object.keys(ctx.topics).length;
  let capturedCount = commonsOwned.length;
  for (const id of Object.keys(ctx.topics)) {
    if (ctx.state.topic(id).captured) capturedCount += 1;
  }

  const dueCount = ctx.state.dueReviews().length;

  // INTEGRATION_NOTES.md item 7: wire the bugle to a real 'patrol' battle stage IF the
  // engine ships one (ctx.capabilities.patrol, feature-detected in js/main.js from
  // STAGE_CONFIG); js/engine/battle.js has no 'patrol' stage yet, so today this is
  // always false and the button is simply omitted — no disabled/dead button shown.
  const patrolBtnHtml = ctx.capabilities.patrol
    ? `<button class="hud-chip hud-btn" id="map-patrol-btn">🎺 Morning Patrol${dueCount > 0 ? ` (${dueCount})` : ''}</button>`
    : '';

  hud.innerHTML = `
    <div class="hud-left">
      <div class="hud-chip">🛡️</div>
      <div class="hud-chip">💩 ${capturedCount}/${totalCollectible}</div>
    </div>
    <div class="hud-right">
      <button class="hud-chip hud-btn" id="map-next-quest-btn">📍 Next quest</button>
      ${patrolBtnHtml}
      <button class="crest-btn" id="map-settings-btn" aria-label="Settings">⚙️</button>
    </div>
  `;
  screen.appendChild(hud);

  // ---- scroll stage ----
  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'map-scroll';
  const stage = document.createElement('div');
  stage.className = 'map-stage';
  scrollWrap.appendChild(stage);
  screen.appendChild(scrollWrap);

  // sky band: gradient (css), moon, stars
  const sky = document.createElement('div');
  sky.className = 'map-sky';
  sky.innerHTML = `
    <div class="map-moon"></div>
    <span class="map-star" style="left:8%; top:20%; --d:.2s;"></span>
    <span class="map-star" style="left:18%; top:55%; --d:1.1s;"></span>
    <span class="map-star" style="left:60%; top:15%; --d:.6s;"></span>
    <span class="map-star" style="left:75%; top:45%; --d:1.6s;"></span>
    <span class="map-star" style="left:92%; top:25%; --d:.9s;"></span>
    <span class="map-star" style="left:40%; top:65%; --d:2s;"></span>
  `;
  stage.appendChild(sky);

  // fireflies — tiny gold dots drifting on long loops
  const fireflies = document.createElement('div');
  fireflies.className = 'map-fireflies';
  fireflies.innerHTML = Array.from({ length: 6 }).map((_, i) => (
    `<span class="firefly" style="left:${(i * 17 + 6) % 100}%; bottom:${20 + (i * 13) % 40}%; animation-duration:${14 + i * 3}s; animation-delay:${i * 1.6}s;"></span>`
  )).join('');
  stage.appendChild(fireflies);

  // ---- lay out every region band + Castle Clench gate left-to-right ----
  let cursor = START_X;

  REGIONS.forEach((region) => {
    const built = unlocked[region.id]
      ? buildLiveRegionBand(region, ctx)
      : buildLockedBlock(region, ctx, byId);
    built.el.style.position = 'absolute';
    built.el.style.left = `${cursor}px`;
    stage.appendChild(built.el);
    cursor += built.width + REGION_GAP;
  });

  const gate = buildCastleGate(ctx);
  gate.el.style.position = 'absolute';
  gate.el.style.left = `${cursor}px`;
  stage.appendChild(gate.el);
  cursor += gate.width + 120;

  const totalWidth = cursor;
  stage.style.width = `${totalWidth}px`;

  // background parallax layers now that we know the full width
  const hillsLayer = document.createElement('div');
  hillsLayer.className = 'map-layer layer-hills';
  hillsLayer.innerHTML = Array.from({ length: Math.ceil(totalWidth / 700) }).map((_, i) => (
    `<img src="assets/ui/hill-${i % 2 === 0 ? 2 : 1}.png" style="left:${i * 700}px;" alt="">`
  )).join('');
  stage.insertBefore(hillsLayer, fireflies);

  const cloudsLayer = document.createElement('div');
  cloudsLayer.className = 'map-layer layer-clouds';
  cloudsLayer.innerHTML = Array.from({ length: Math.ceil(totalWidth / 700) }).map((_, i) => (
    `<img src="assets/ui/cloud-${i % 2 === 0 ? 1 : 2}.png" style="left:${i * 700 + 100}px;" alt="">`
  )).join('');
  stage.insertBefore(cloudsLayer, fireflies);

  root.appendChild(screen);

  // parallax on scroll + remember scroll position for this session
  const onScroll = () => {
    const x = scrollWrap.scrollLeft;
    hillsLayer.style.transform = `translateX(${x * -0.3}px)`;
    cloudsLayer.style.transform = `translateX(${x * -0.15}px)`;
    sky.style.transform = `translateX(${x * -0.08}px)`;
    savedScrollLeft = x;
  };
  scrollWrap.addEventListener('scroll', onScroll, { passive: true });
  requestAnimationFrame(() => { scrollWrap.scrollLeft = savedScrollLeft; });

  hud.querySelector('#map-settings-btn').addEventListener('click', () => {
    ctx.audio.sfx('click');
    ctx.go('#/settings');
  });

  hud.querySelector('#map-next-quest-btn').addEventListener('click', () => {
    ctx.audio.sfx('click');
    const targetId = computeNextQuest(ctx);
    if (!targetId) { ctx.toast('Every open quest is done for now — amazing work!'); return; }
    const targetPad = stage.querySelector(`.map-pad[data-topic-id="${targetId}"]`);
    if (!targetPad) { ctx.toast('That quest is just out of reach for now!'); return; }
    const left = targetPad.offsetLeft - (scrollWrap.clientWidth / 2) + (targetPad.offsetWidth / 2);
    scrollWrap.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    targetPad.classList.remove('next-quest-ping');
    void targetPad.offsetWidth;
    targetPad.classList.add('next-quest-ping');
  });
  // Morning Patrol: only wired up when ctx.capabilities.patrol is true (the button
  // itself is omitted entirely otherwise — see patrolBtnHtml above, no dead UI).
  if (ctx.capabilities.patrol) {
    const patrolBtn = hud.querySelector('#map-patrol-btn');
    if (patrolBtn) {
      patrolBtn.addEventListener('click', () => {
        ctx.audio.sfx('click');
        ctx.audio.vo('patrol');
        ctx.go('#/battle/patrol/patrol');
      });
    }
  }

  // first-visit coach bubble — a lightweight legacy fallback. Suppressed if the
  // full spotlight tutorial (js/engine/coach.js, run via #/story) already played,
  // so a fresh profile never sees both hints stacked on the same map visit.
  let coachSeen = false;
  try {
    const [bubbleSeen, tutorialDone] = await Promise.all([
      ctx.db.get('meta', COACH_KEY),
      ctx.db.get('meta', TUTORIAL_KEY),
    ]);
    coachSeen = !!bubbleSeen || !!tutorialDone;
  } catch (e) { /* ignore */ }

  if (!coachSeen) {
    const bubble = document.createElement('div');
    bubble.className = 'coach-bubble enter-up';
    bubble.textContent = 'Tap a stinky pad to begin, my brave nose-soldier!';
    screen.appendChild(bubble);
    setTimeout(() => { bubble.remove(); }, 5000);
    try {
      await ctx.db.put('meta', COACH_KEY, true);
    } catch (e) { /* ignore */ }
  }

  screen._onScroll = onScroll;
  screen._scrollWrap = scrollWrap;
  mount._activeScreen = screen;
}

export function unmount() {
  const screen = mount._activeScreen;
  if (screen && screen._scrollWrap) {
    screen._scrollWrap.removeEventListener('scroll', screen._onScroll);
  }
}

export default { mount, unmount };
