// FART QUEST — screens/collection.js (UI agent)
import { COMMONS, TEASERS, RARITY_META } from '../../data/creatures.js';
import { REGIONS } from '../../data/map.js';
import { regionBossCreatureId } from './battle.js';

function starsFor(rarity) {
  const meta = RARITY_META[rarity];
  return meta ? '⭐'.repeat(meta.stars) : '';
}

// Only the 3 topic bosses (rarity 'rare') ship a '<name>-shiny.png' sibling; commons
// and teasers never do (their records have no `shiny` flag at all). Only ever derive
// the shiny path for an OWNED creature whose record says shiny — otherwise use the
// normal image, so we never fire a request for a file that can't exist. onerror is
// still wired as a belt-and-braces fallback in case a shiny file is ever missing.
function imageFor(owned, data) {
  if (owned && data.shiny && data.image) return data.image.replace(/\.png$/, '-shiny.png');
  return data.image;
}

function shinyOnerrorAttr(owned, data) {
  if (owned && data.shiny && data.image) {
    return ` onerror="this.onerror=null;this.src='${data.image}'"`;
  }
  return '';
}

function openModal(ctx, owned, data) {
  const overlay = document.getElementById('overlay');
  const modal = document.createElement('div');
  modal.className = 'creature-modal';
  modal.innerHTML = `
    <div class="creature-modal-card enter-pop">
      <button class="modal-close">✕</button>
      <img src="${imageFor(owned, data)}" alt="${data.name}"${shinyOnerrorAttr(owned, data)}>
      <h2>${data.name}${data.shiny ? ' <span class="shiny-badge">✨</span>' : ''}</h2>
      <div class="stars">${starsFor(data.rarity)}</div>
      <p>${data.bio}</p>
      ${data.topicGuarded ? `<p><b>Topic guarded:</b> ${data.topicGuarded}</p>` : ''}
      ${data.regionGuarded ? `<p><b>Region guarded:</b> ${data.regionGuarded}</p>` : ''}
    </div>
  `;
  overlay.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

export function mount(root, ctx) {
  const screen = document.createElement('div');
  screen.className = 'collection-screen screen enter-pop';

  const back = document.createElement('button');
  back.className = 'btn btn-ghost topic-back';
  back.style.padding = '10px 18px';
  back.textContent = '← Map';
  back.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/map'); });
  screen.appendChild(back);

  const commonsOwned = ctx.state.commonsOwned();
  let capturedTopics = 0;
  let capturedRegionBosses = 0;
  // Fix (CRITICAL, teasers never counted): TEASERS (Skidmark King, Golden Turd) are granted
  // via the same commonsOwned list as regular commons (see js/screens/exam.js's
  // ctx.state.grantCommon('skidmark-king') on a King win), so `commonsOwned.length` below
  // already includes any captured teasers — `total` just needs to add TEASERS.length so the
  // denominator accounts for them too (previously they were excluded from both sides entirely).
  const total = COMMONS.length + Object.keys(ctx.topics).length + REGIONS.length + TEASERS.length;
  const cardsHtml = [];

  // Commons
  COMMONS.forEach((c) => {
    const owned = commonsOwned.includes(c.id);
    cardsHtml.push({ owned, data: { ...c, topicGuarded: null } });
  });

  // Topic bosses
  Object.keys(ctx.topics).forEach((id) => {
    const topic = ctx.topics[id];
    const record = ctx.state.topic(id);
    if (record.captured) capturedTopics += 1;
    cardsHtml.push({
      owned: record.captured,
      data: {
        ...topic.creature,
        shiny: record.shiny,
        topicGuarded: topic.name,
      },
    });
  });

  // Region bosses (INTEGRATION_NOTES.md item 5) — all 10, silhouette/'???' until the
  // region is cleansed (its boss beaten). rarity 'epic' per docs/ROSTER.md; no shiny
  // variant (that's topic-boss-only, per the comment on imageFor() below).
  REGIONS.forEach((region) => {
    const owned = ctx.state.regionCleansed(region.id);
    if (owned) capturedRegionBosses += 1;
    cardsHtml.push({
      owned,
      data: {
        id: regionBossCreatureId(region),
        name: region.boss.name,
        rarity: 'epic',
        image: region.boss.image,
        bio: region.boss.bio || `Guards ${region.name} — clean the whole region to face them.`,
        regionGuarded: region.name,
      },
    });
  });

  const capturedCount = commonsOwned.length + capturedTopics + capturedRegionBosses;

  screen.innerHTML += `
    <h1 class="collection-title">The Stink Vault</h1>
    <p class="collection-sub">${capturedCount} / ${total} beasties captured</p>
  `;

  const grid = document.createElement('div');
  grid.className = 'collection-grid';

  cardsHtml.forEach(({ owned, data }) => {
    const plinth = document.createElement('button');
    plinth.className = `plinth ${owned ? '' : 'unowned'}`;
    plinth.innerHTML = `
      <img class="${owned ? 'idle-bob' : ''}" src="${owned ? imageFor(owned, data) : data.image}" alt="${owned ? data.name : '???'}"${owned ? shinyOnerrorAttr(owned, data) : ''}>
      <div class="plinth-name">${owned ? data.name : '???'}</div>
      <div class="plinth-stars">${owned ? starsFor(data.rarity) : ''}</div>
    `;
    plinth.addEventListener('click', () => {
      ctx.audio.sfx('click');
      if (owned) openModal(ctx, true, data);
      else openModal(ctx, false, { ...data, name: '???', bio: 'Not yet captured. Keep questing, hero!', image: data.image });
    });
    grid.appendChild(plinth);
  });

  // Teasers — locked plinth until legitimately earned (Skidmark King via a Castle Clench
  // King win, Golden Turd has no capture mechanic yet), then rendered exactly like any other
  // captured creature (image/name/stars + tappable modal), same as COMMONS/topic/region cards.
  TEASERS.forEach((t) => {
    const owned = commonsOwned.includes(t.id);
    const plinth = document.createElement('button');
    plinth.className = `plinth ${owned ? '' : 'unowned locked-teaser'}`;
    if (!owned) {
      plinth.innerHTML = `
        <div style="font-size:40px; margin-bottom:6px;">🔒</div>
        <div class="plinth-name">${t.name}</div>
        <div class="plinth-stars">${starsFor(t.rarity)}</div>
      `;
      plinth.addEventListener('click', () => {
        ctx.audio.sfx('click');
        ctx.toast(t.hint);
      });
      grid.appendChild(plinth);
      return;
    }
    const data = t;
    plinth.innerHTML = `
      <img class="idle-bob" src="${imageFor(owned, data)}" alt="${data.name}"${shinyOnerrorAttr(owned, data)}>
      <div class="plinth-name">${data.name}</div>
      <div class="plinth-stars">${starsFor(data.rarity)}</div>
    `;
    plinth.addEventListener('click', () => {
      ctx.audio.sfx('click');
      openModal(ctx, true, data);
    });
    grid.appendChild(plinth);
  });

  screen.appendChild(grid);
  root.appendChild(screen);
}

export function unmount() {
  document.getElementById('overlay').querySelectorAll('.creature-modal').forEach((m) => m.remove());
}

export default { mount, unmount };
