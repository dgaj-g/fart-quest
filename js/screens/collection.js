// FART QUEST — screens/collection.js (UI agent)
import { COMMONS, TEASERS, RARITY_META } from '../../data/creatures.js';

function starsFor(rarity) {
  const meta = RARITY_META[rarity];
  return meta ? '⭐'.repeat(meta.stars) : '';
}

function openModal(ctx, data) {
  const overlay = document.getElementById('overlay');
  const modal = document.createElement('div');
  modal.className = 'creature-modal';
  modal.innerHTML = `
    <div class="creature-modal-card enter-pop">
      <button class="modal-close">✕</button>
      <img src="${data.image}" alt="${data.name}">
      <h2>${data.name}${data.shiny ? ' <span class="shiny-badge">✨</span>' : ''}</h2>
      <div class="stars">${starsFor(data.rarity)}</div>
      <p>${data.bio}</p>
      ${data.topicGuarded ? `<p><b>Topic guarded:</b> ${data.topicGuarded}</p>` : ''}
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
  const total = COMMONS.length + Object.keys(ctx.topics).length;
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

  const capturedCount = commonsOwned.length + capturedTopics;

  screen.innerHTML += `
    <h1 class="collection-title">The Dungeon of Shame</h1>
    <p class="collection-sub">${capturedCount} / ${total} beasties captured</p>
  `;

  const grid = document.createElement('div');
  grid.className = 'collection-grid';

  cardsHtml.forEach(({ owned, data }) => {
    const plinth = document.createElement('button');
    plinth.className = `plinth ${owned ? '' : 'unowned'}`;
    plinth.innerHTML = `
      <img class="${owned ? 'idle-bob' : ''}" src="${data.image}" alt="${owned ? data.name : '???'}">
      <div class="plinth-name">${owned ? data.name : '???'}</div>
      <div class="plinth-stars">${owned ? starsFor(data.rarity) : ''}</div>
    `;
    plinth.addEventListener('click', () => {
      ctx.audio.sfx('click');
      if (owned) openModal(ctx, data);
      else openModal(ctx, { ...data, name: '???', bio: 'Not yet captured. Keep questing, hero!', image: data.image });
    });
    grid.appendChild(plinth);
  });

  // Locked teasers
  TEASERS.forEach((t) => {
    const plinth = document.createElement('button');
    plinth.className = 'plinth locked-teaser';
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
  });

  screen.appendChild(grid);
  root.appendChild(screen);
}

export function unmount() {
  document.getElementById('overlay').querySelectorAll('.creature-modal').forEach((m) => m.remove());
}

export default { mount, unmount };
