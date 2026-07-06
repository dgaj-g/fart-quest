// FART QUEST — screens/topic.js (UI agent)

const LADDER = [
  { emoji: '🌫️', label: 'Untaught' },
  { emoji: '📖', label: 'Taught' },
  { emoji: '💪', label: 'Practising' },
  { emoji: '🔥', label: 'Boss-Ready' },
  { emoji: '🏆', label: 'Captured' },
  { emoji: '👑', label: 'Legend' },
];

function unlockRequirementText(record, needed) {
  if (needed === 't2') {
    const need = Math.max(0, 5 - record.tierCorrectCount[1]);
    return need > 0 ? `Win ${need} more minion scraps` : 'Almost there — keep your streak up!';
  }
  if (needed === 't3') {
    const need = Math.max(0, 5 - record.tierCorrectCount[2]);
    return need > 0 ? `Win ${need} more elite scraps` : 'Almost there — keep your streak up!';
  }
  return '';
}

export function mount(root, ctx, params) {
  const topic = ctx.topics[params.id];
  if (!topic) {
    ctx.go('#/map');
    return;
  }
  ctx.audio.music('map');

  const screen = document.createElement('div');
  screen.className = 'topic-screen screen enter-pop';

  const back = document.createElement('button');
  back.className = 'btn btn-ghost topic-back';
  back.textContent = '← Map';
  back.style.padding = '10px 18px';
  back.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/map'); });
  screen.appendChild(back);

  const record = ctx.state.topic(topic.id);
  const level = ctx.state.masteryLevel(topic.id);
  const captured = record.captured;

  const panel = document.createElement('div');
  panel.className = 'topic-panel';

  const artWrap = document.createElement('div');
  artWrap.className = 'topic-creature-art';
  artWrap.innerHTML = `
    <img class="idle-bob ${captured ? '' : 'silhouette'}" src="${topic.creature.image}" alt="${topic.creature.name}">
    <div class="topic-creature-name">${topic.creature.name}</div>
    <div class="topic-creature-line">${captured ? topic.creature.bio : '???'}</div>
  `;
  panel.appendChild(artWrap);

  const info = document.createElement('div');
  info.className = 'topic-info';

  const ladderHtml = LADDER.map((l, i) => `
    <div class="mastery-badge ${i <= level ? 'reached' : ''}">
      <span class="badge-emoji">${l.emoji}</span>${l.label}
    </div>
  `).join('');

  const t2Unlocked = record.t2Unlocked;
  const t3Unlocked = record.t3Unlocked;
  const bossReady = level >= 3;

  info.innerHTML = `
    <h1>${topic.name}</h1>
    <p class="topic-tagline">${topic.tagline}</p>
    <div class="mastery-ladder">${ladderHtml}</div>
    <div class="topic-actions">
      <button class="btn btn-parchment topic-action-btn ${!record.taught ? 'pulsing' : ''}" data-action="lesson">
        <span>📜 Scout Report</span>
        <span class="lock-note">${record.taught ? 'Revisit' : 'Start here!'}</span>
      </button>
      <button class="btn btn-parchment topic-action-btn" data-action="minion" ${!record.taught ? 'disabled' : ''}>
        <span>⚔️ Minion Battle</span>
        <span class="lock-note">${record.taught ? 'Tier 1' : 'Learn it first'}</span>
      </button>
      <button class="btn btn-parchment topic-action-btn" data-action="elite" ${!t2Unlocked ? 'disabled' : ''}>
        <span>${t2Unlocked ? '🗡️' : '🔒'} Elite Battle</span>
        <span class="lock-note">${t2Unlocked ? 'Tier 2/3' : unlockRequirementText(record, 't2')}</span>
      </button>
      <button class="btn btn-gold topic-action-btn" data-action="boss" ${!bossReady ? 'disabled' : ''}>
        <span>${bossReady ? '👑' : '🔒'} BOSS: ${topic.creature.name}</span>
        <span class="lock-note">${bossReady ? (record.bossBeaten ? 'Rematch' : 'Ready!') : 'Reach Boss-Ready first'}</span>
      </button>
    </div>
    ${record.taught ? `<div class="weapon-mini"><b>${topic.weapon.name}:</b> ${topic.weapon.tagline}</div>` : ''}
  `;
  panel.appendChild(info);
  screen.appendChild(panel);
  root.appendChild(screen);

  info.querySelector('[data-action="lesson"]').addEventListener('click', () => {
    ctx.audio.sfx('confirm');
    ctx.go(`#/lesson/${topic.id}`);
  });
  const minionBtn = info.querySelector('[data-action="minion"]');
  if (!minionBtn.disabled) {
    minionBtn.addEventListener('click', () => { ctx.audio.sfx('confirm'); ctx.go(`#/battle/${topic.id}/minion`); });
  }
  const eliteBtn = info.querySelector('[data-action="elite"]');
  if (!eliteBtn.disabled) {
    eliteBtn.addEventListener('click', () => { ctx.audio.sfx('confirm'); ctx.go(`#/battle/${topic.id}/elite`); });
  }
  const bossBtn = info.querySelector('[data-action="boss"]');
  if (!bossBtn.disabled) {
    bossBtn.addEventListener('click', () => {
      ctx.audio.sfx('confirm');
      ctx.audio.vo('boss-intro');
      ctx.go(`#/battle/${topic.id}/boss`);
    });
  }
}

export function unmount() {}

export default { mount, unmount };
