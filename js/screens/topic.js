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

// Right-hand side of an action button: the little status line, plus a green tick
// once that step has actually been completed. `done` is what turns the whole
// button into its completed state (see .topic-action-btn.done in main.css).
function actionRight(note, done) {
  return `<span class="action-right">
      <span class="lock-note">${note}</span>
      ${done ? '<span class="done-tick" role="img" aria-label="Completed">✓</span>' : ''}
    </span>`;
}

// A scrap counts as beaten if we have a recorded win. minionWins/eliteWins were
// added later than the app, so records from before then fall back to the tier
// unlock flags — t2Unlocked can only happen by winning tier-1 questions, so an
// established player never loses a tick they had earned. New wins increment the
// counters and show the "won ×N" tally.
function scrapDone(record, stage) {
  if (stage === 'minion') return (record.minionWins || 0) > 0 || record.t2Unlocked;
  return (record.eliteWins || 0) > 0 || record.t3Unlocked;
}

function scrapNote(record, stage, baseNote) {
  const wins = (stage === 'minion' ? record.minionWins : record.eliteWins) || 0;
  return wins > 0 ? `${baseNote} · won ×${wins}` : baseNote;
}

function lessonProgressKey(topicId) {
  return `lessonProgress-${topicId}`;
}

async function readLessonProgress(ctx, topicId) {
  try {
    const saved = await ctx.db.get('meta', lessonProgressKey(topicId));
    return typeof saved === 'number' ? saved : null;
  } catch (e) {
    return null;
  }
}

function scoutReportLabel(record, savedIndex, totalCards) {
  if (!record.taught && savedIndex != null) {
    return { line: `Continue (card ${savedIndex + 1}/${totalCards})`, pulsing: true };
  }
  if (!record.taught) return { line: 'Start here!', pulsing: true };
  if (record.captured) return { line: 'Re-read Scout Report', pulsing: false };
  return { line: 'Revisit', pulsing: false };
}

export async function mount(root, ctx, params) {
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
  const savedIndex = await readLessonProgress(ctx, topic.id);
  const scoutLabel = scoutReportLabel(record, savedIndex, topic.lesson.length);
  const animIdx = topic.lesson.findIndex((c) => c.type === 'anim');

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
  const minionDone = record.taught && scrapDone(record, 'minion');
  const eliteDone = t2Unlocked && scrapDone(record, 'elite');

  info.innerHTML = `
    <h1>${topic.name}</h1>
    <p class="topic-tagline">${topic.tagline}</p>
    <div class="mastery-ladder">${ladderHtml}</div>
    <div class="topic-actions">
      <button class="btn btn-parchment topic-action-btn ${record.taught ? 'done' : ''} ${scoutLabel.pulsing ? 'pulsing' : ''}" data-action="lesson">
        <span>📜 Scout Report</span>
        ${actionRight(scoutLabel.line, record.taught)}
      </button>
      ${animIdx >= 0 ? `
      <button class="btn btn-parchment topic-action-btn ${record.animDriven ? 'done' : ''}" data-action="anim">
        <span>🔧 Scout-Tech</span>
        ${actionRight(record.animDriven ? 'Drive it again!' : 'Drive the machine!', record.animDriven)}
      </button>` : ''}
      <button class="btn btn-parchment topic-action-btn ${minionDone ? 'done' : ''}" data-action="minion" ${!record.taught ? 'disabled' : ''}>
        <span>⚔️ Minion Battle</span>
        ${actionRight(record.taught ? scrapNote(record, 'minion', 'Tier 1') : 'Learn it first', minionDone)}
      </button>
      <button class="btn btn-parchment topic-action-btn ${eliteDone ? 'done' : ''}" data-action="elite" ${!t2Unlocked ? 'disabled' : ''}>
        <span>${t2Unlocked ? '🗡️' : '🔒'} Elite Battle</span>
        ${actionRight(t2Unlocked ? scrapNote(record, 'elite', 'Tier 2/3') : unlockRequirementText(record, 't2'), eliteDone)}
      </button>
      <button class="btn btn-gold topic-action-btn ${record.bossBeaten ? 'done' : ''}" data-action="boss" ${!bossReady ? 'disabled' : ''}>
        <span>${bossReady ? '👑' : '🔒'} BOSS: ${topic.creature.name}</span>
        ${actionRight(bossReady ? (record.bossBeaten ? 'Captured — rematch?' : 'Ready!') : 'Reach Boss-Ready first', record.bossBeaten)}
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
  const animBtn = info.querySelector('[data-action="anim"]');
  if (animBtn) {
    animBtn.addEventListener('click', async () => {
      ctx.audio.sfx('confirm');
      // Jump straight to the Scout-Tech machine: point the lesson bookmark at the
      // anim card and open the lesson. Deliberately overwrites any mid-lesson
      // bookmark — the machine is one CARRY ON from the weapon, and a replayed
      // lesson starts over anyway (completion clears progress).
      try { await ctx.db.put('meta', lessonProgressKey(topic.id), animIdx); } catch (e) { /* ignore */ }
      ctx.go(`#/lesson/${topic.id}`);
    });
  }
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
