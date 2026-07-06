// FART QUEST — screens/map.js (UI agent)
import { REGIONS, CASTLE } from '../../data/map.js';
import { COMMONS } from '../../data/creatures.js';

const COACH_KEY = 'mapCoachSeen';

function creatureImageFor(topic) {
  return topic.creature.image;
}

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

  // background layers (parallax via scroll listener)
  const hillsLayer = document.createElement('div');
  hillsLayer.className = 'map-layer layer-hills';
  hillsLayer.innerHTML = `
    <img src="assets/ui/hill-2.png" style="left:0;" alt="">
    <img src="assets/ui/hill-1.png" style="left:600px;" alt="">
    <img src="assets/ui/hill-2.png" style="left:1300px;" alt="">
    <img src="assets/ui/hill-1.png" style="left:2000px;" alt="">
  `;
  stage.appendChild(hillsLayer);

  const cloudsLayer = document.createElement('div');
  cloudsLayer.className = 'map-layer layer-clouds';
  cloudsLayer.innerHTML = `
    <img src="assets/ui/cloud-1.png" style="left:100px;" alt="">
    <img src="assets/ui/cloud-2.png" style="left:700px;" alt="">
    <img src="assets/ui/cloud-1.png" style="left:1400px;" alt="">
    <img src="assets/ui/cloud-2.png" style="left:2100px;" alt="">
  `;
  stage.appendChild(cloudsLayer);

  const trail = document.createElement('div');
  trail.className = 'map-trail';
  stage.appendChild(trail);

  // Number Swamp region — left third, 10 location pads
  const swamp = REGIONS.find((r) => r.id === 'number-swamp');
  const regionWrap = document.createElement('div');
  regionWrap.className = 'map-region';
  regionWrap.style.left = '20px';
  regionWrap.style.display = 'flex';
  regionWrap.style.flexDirection = 'row';
  regionWrap.style.alignItems = 'flex-end';

  swamp.locations.forEach((loc) => {
    const pad = document.createElement('button');
    pad.className = 'map-pad';

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
  });
  stage.appendChild(regionWrap);

  // Region boss — Countfather silhouette on a hill
  const bossHill = document.createElement('div');
  bossHill.className = 'map-boss-hill';
  bossHill.innerHTML = `
    <img src="${swamp.boss.image}" alt="${swamp.boss.name}">
    <div class="boss-note">${swamp.boss.name}<br>${swamp.boss.note}</div>
  `;
  stage.appendChild(bossHill);

  // Other 9 fogged regions (distant)
  const otherRegions = REGIONS.filter((r) => r.id !== 'number-swamp');
  const farWrap = document.createElement('div');
  farWrap.style.position = 'absolute';
  farWrap.style.left = '1750px';
  farWrap.style.display = 'flex';
  farWrap.style.gap = '30px';
  farWrap.style.bottom = '60px';
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
