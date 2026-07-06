// FART QUEST — screens/map.js (UI agent)
import { REGIONS, CASTLE } from '../../data/map.js';
import { COMMONS } from '../../data/creatures.js';

const COACH_KEY = 'mapCoachSeen';

function creatureImageFor(topic) {
  return topic.creature.image;
}

// vertical offsets so the trail snakes rather than sitting in a flat row
const PAD_OFFSETS = [18, -32, 8, -22, 30, -14, 20, -30, 10, -18];

export async function mount(root, ctx) {
  ctx.audio.music('map');
  const screen = document.createElement('div');
  screen.className = 'map-screen screen enter-pop';

  // HUD
  const hud = document.createElement('div');
  hud.className = 'map-hud';

  const commonsOwned = ctx.state.commonsOwned();
  const totalCollectible = COMMONS.length + 3; // 6 commons + 3 topic bosses (phase 1)
  let capturedCount = commonsOwned.length;
  for (const id of Object.keys(ctx.topics)) {
    if (ctx.state.topic(id).captured) capturedCount += 1;
  }

  hud.innerHTML = `
    <div class="hud-chip">🛡️</div>
    <div class="hud-chip">💩 ${capturedCount}/${totalCollectible}</div>
    <button class="crest-btn" id="map-settings-btn" aria-label="Settings">⚙️</button>
  `;
  screen.appendChild(hud);

  // scroll stage
  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'map-scroll';
  const stage = document.createElement('div');
  stage.className = 'map-stage';
  scrollWrap.appendChild(stage);
  screen.appendChild(scrollWrap);

  // ---- sky band: gradient (css), moon, stars, drifting clouds ----
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

  // background layers (parallax via scroll listener)
  const STAGE_WIDTH = 5100;
  const hillsLayer = document.createElement('div');
  hillsLayer.className = 'map-layer layer-hills';
  hillsLayer.innerHTML = Array.from({ length: Math.ceil(STAGE_WIDTH / 700) }).map((_, i) => (
    `<img src="assets/ui/hill-${i % 2 === 0 ? 2 : 1}.png" style="left:${i * 700}px;" alt="">`
  )).join('');
  stage.appendChild(hillsLayer);

  const cloudsLayer = document.createElement('div');
  cloudsLayer.className = 'map-layer layer-clouds';
  cloudsLayer.innerHTML = Array.from({ length: Math.ceil(STAGE_WIDTH / 700) }).map((_, i) => (
    `<img src="assets/ui/cloud-${i % 2 === 0 ? 1 : 2}.png" style="left:${i * 700 + 100}px;" alt="">`
  )).join('');
  stage.appendChild(cloudsLayer);

  // fireflies — tiny gold dots drifting on long loops
  const fireflies = document.createElement('div');
  fireflies.className = 'map-fireflies';
  fireflies.innerHTML = Array.from({ length: 6 }).map((_, i) => (
    `<span class="firefly" style="left:${(i * 17 + 6) % 100}%; bottom:${20 + (i * 13) % 40}%; animation-duration:${14 + i * 3}s; animation-delay:${i * 1.6}s;"></span>`
  )).join('');
  stage.appendChild(fireflies);

  // region entrance sign
  const regionSign = document.createElement('div');
  regionSign.className = 'region-sign';
  regionSign.innerHTML = 'NUMBER SWAMP 💨';
  stage.appendChild(regionSign);

  const trail = document.createElement('div');
  trail.className = 'map-trail';
  stage.appendChild(trail);

  // Number Swamp region — left third, 10 location pads along a winding trail
  const swamp = REGIONS.find((r) => r.id === 'number-swamp');
  const regionWrap = document.createElement('div');
  regionWrap.className = 'map-region';

  swamp.locations.forEach((loc, i) => {
    const pad = document.createElement('button');
    pad.className = 'map-pad';
    pad.style.setProperty('--pad-offset', `${PAD_OFFSETS[i % PAD_OFFSETS.length]}px`);

    if (loc.live) {
      const topic = ctx.topics[loc.topicId];
      const record = ctx.state.topic(loc.topicId);
      const level = ctx.state.masteryLevel(loc.topicId);
      const stink = ctx.state.stink(loc.topicId);
      const conquered = record.captured;
      if (conquered) pad.classList.add('conquered');

      const fumeScale = Math.max(0.2, stink / 100);

      pad.innerHTML = `
        <div class="pad-fumes fumes" style="--fume-scale:${fumeScale.toFixed(2)}">
          ${stink > 5 ? '<div class="blob"></div><div class="blob"></div><div class="blob"></div>' : ''}
        </div>
        ${conquered ? '<div class="pad-sparkle">✨</div>' : ''}
        <img class="pad-creature idle-bob ${conquered ? '' : 'silhouette'}" src="${creatureImageFor(topic)}" alt="${topic.creature.name}">
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
        <div class="plank-sign">${loc.name}<br>OPENS SOON</div>
      `;
    }
    regionWrap.appendChild(pad);

    // a tree between pads for depth (skip after the last pad)
    if (i < swamp.locations.length - 1) {
      const tree = document.createElement('img');
      tree.className = `map-between-tree ${i % 2 === 0 ? 'tree-a' : 'tree-b'}`;
      tree.src = i % 3 === 0 ? 'assets/ui/tree-1.png' : 'assets/ui/tree-2.png';
      tree.alt = '';
      regionWrap.appendChild(tree);
    }
  });
  stage.appendChild(regionWrap);

  // Region boss — Countfather silhouette on a hill with a purple glow aura
  const bossHill = document.createElement('div');
  bossHill.className = 'map-boss-hill';
  bossHill.innerHTML = `
    <div class="boss-aura"></div>
    <img src="${swamp.boss.image}" alt="${swamp.boss.name}">
    <div class="boss-note">${swamp.boss.name}<br>${swamp.boss.note}</div>
  `;
  stage.appendChild(bossHill);
  bossHill.addEventListener('click', () => {
    ctx.audio.sfx('click');
    const note = bossHill.querySelector('.boss-note');
    note.classList.toggle('show');
  });

  // Other 9 fogged regions (distant)
  const otherRegions = REGIONS.filter((r) => r.id !== 'number-swamp');
  const farWrap = document.createElement('div');
  farWrap.className = 'map-far-wrap';
  otherRegions.forEach((region) => {
    const block = document.createElement('div');
    block.className = 'map-region-far';
    block.innerHTML = `
      <div class="region-block"></div>
      <div class="closed-sign">${region.name}<br>${region.closedSign}</div>
    `;
    farWrap.appendChild(block);
  });
  // Castle Clench teaser at the very end
  const castleBlock = document.createElement('div');
  castleBlock.className = 'map-region-far';
  castleBlock.innerHTML = `
    <div class="region-block" style="background:#1a1210;"></div>
    <div class="closed-sign">${CASTLE.name}<br>${CASTLE.sign}</div>
  `;
  farWrap.appendChild(castleBlock);
  stage.appendChild(farWrap);

  root.appendChild(screen);

  // parallax on scroll
  const onScroll = () => {
    const x = scrollWrap.scrollLeft;
    hillsLayer.style.transform = `translateX(${x * -0.3}px)`;
    cloudsLayer.style.transform = `translateX(${x * -0.15}px)`;
    sky.style.transform = `translateX(${x * -0.08}px)`;
  };
  scrollWrap.addEventListener('scroll', onScroll, { passive: true });

  hud.querySelector('#map-settings-btn').addEventListener('click', () => {
    ctx.audio.sfx('click');
    ctx.go('#/settings');
  });

  // first-visit coach bubble
  let coachSeen = false;
  try {
    coachSeen = !!(await ctx.db.get('meta', COACH_KEY));
  } catch (e) { /* ignore */ }

  if (!coachSeen) {
    const bubble = document.createElement('div');
    bubble.className = 'coach-bubble enter-up';
    bubble.textContent = 'Tap a stinky pad to begin, my brave nose-soldier!';
    screen.appendChild(bubble);
    setTimeout(() => { bubble.remove(); }, 5000);
    try { await ctx.db.put('meta', COACH_KEY, true); } catch (e) { /* ignore */ }
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
