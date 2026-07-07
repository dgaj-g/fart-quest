// FART QUEST — screens/parent.js (UI agent)

const MASTERY_LABELS = ['Unseen', 'Taught', 'Practising', 'Boss-Ready', 'Captured', 'Legend'];
const LAST_EXPORTED_KEY = 'lastExportedAt';
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB');
}

function last10Acc(record) {
  const w = record.last10 || [];
  if (w.length === 0) return '—';
  const c = w.filter((a) => a.correct).length;
  return `${Math.round((c / w.length) * 100)}%`;
}

// The `mocks` store (ENGINE_SPEC_2 §H) is written by the Castle Clench exam
// screen, which may not exist/have run yet — read it defensively so a missing
// object store (or simply no rows yet) degrades to an empty list, never a crash.
async function loadMockHistory(ctx) {
  try {
    const all = await ctx.db.getAll('mocks');
    return Object.keys(all || {}).map((key) => ({ key, ...(all[key] || {}) }));
  } catch (e) {
    return [];
  }
}

async function readLastExported(ctx) {
  try {
    const ts = await ctx.db.get('meta', LAST_EXPORTED_KEY);
    return typeof ts === 'number' ? ts : null;
  } catch (e) {
    return null;
  }
}

function lastExportedLine(ts) {
  if (!ts) return 'Never exported — export a backup after a good session!';
  const overdue = Date.now() - ts > MONTH_MS;
  const line = `Last exported: ${fmtDate(ts)}`;
  return overdue ? `${line} — it's been over a month, time for a fresh backup!` : line;
}

export async function mount(root, ctx) {
  const screen = document.createElement('div');
  screen.className = 'parent-screen screen enter-pop';

  const backWrap = document.createElement('div');
  backWrap.className = 'parent-back';
  backWrap.innerHTML = `<button class="btn">← Back</button>`;
  backWrap.querySelector('button').addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/title'); });
  screen.appendChild(backWrap);

  screen.innerHTML += `<h1 class="parent-title">Parent / Teacher Dashboard</h1>`;

  const table = document.createElement('table');
  table.className = 'parent-table';
  const rows = Object.keys(ctx.topics).map((id) => {
    const topic = ctx.topics[id];
    const record = ctx.state.topic(id);
    const level = ctx.state.masteryLevel(id);
    return `
      <tr data-topic-id="${id}">
        <td>${topic.name}</td>
        <td>${MASTERY_LABELS[level]}</td>
        <td>${last10Acc(record)}</td>
        <td>${record.attempts}</td>
        <td>${fmtDate(record.lastPlayed)}</td>
        <td>${fmtDate(record.reviewDue)}</td>
        <td><button class="topic-reset-btn" data-topic-id="${id}" data-topic-name="${topic.name}">Reset</button></td>
      </tr>
    `;
  }).join('');

  table.innerHTML = `
    <thead>
      <tr><th>Topic</th><th>Mastery</th><th>Last-10 accuracy</th><th>Attempts</th><th>Last practised</th><th>Review due</th><th>Action</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  `;
  screen.appendChild(table);

  table.querySelectorAll('.topic-reset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      openTopicResetConfirm(ctx, btn.dataset.topicId, btn.dataset.topicName);
    });
  });

  // ---- mock exam history (Castle Clench, ENGINE_SPEC_2 §E/§H) ----
  const mockSection = document.createElement('div');
  mockSection.className = 'parent-mock-section';
  const mocks = await loadMockHistory(ctx);
  if (mocks.length === 0) {
    mockSection.innerHTML = `
      <h2 class="parent-subhead">Mock exam history</h2>
      <p class="parent-empty-note">No mock exams taken yet — Castle Clench's Training Skirmish unlocks once a few regions are cleansed.</p>
    `;
  } else {
    const mockRows = mocks
      .slice()
      .sort((a, b) => (b.date || 0) - (a.date || 0))
      .map((m) => `
        <tr>
          <td>${fmtDate(m.date)}</td>
          <td>${m.type || 'Mock'}</td>
          <td>${m.score != null && m.total != null ? `${m.score} / ${m.total}` : '—'}</td>
        </tr>
      `).join('');
    mockSection.innerHTML = `
      <h2 class="parent-subhead">Mock exam history</h2>
      <table class="parent-table">
        <thead><tr><th>Date</th><th>Type</th><th>Score</th></tr></thead>
        <tbody>${mockRows}</tbody>
      </table>
    `;
  }
  screen.appendChild(mockSection);

  const actions = document.createElement('div');
  actions.className = 'parent-actions';
  actions.innerHTML = `
    <button class="btn" id="export-btn" style="background:#2c6e49;color:#fff;">Export progress (JSON)</button>
    <label class="btn" style="background:#2c5a8a;color:#fff; cursor:pointer;">
      Import progress
      <input type="file" id="import-input" accept="application/json" style="display:none;">
    </label>
    <button class="btn" id="reset-btn" style="background:#a12f2f;color:#fff;">Reset all progress</button>
  `;
  screen.appendChild(actions);

  const exportNote = document.createElement('p');
  exportNote.className = 'parent-export-note';
  const lastExportedTs = await readLastExported(ctx);
  exportNote.textContent = lastExportedLine(lastExportedTs);
  actions.insertAdjacentElement('afterend', exportNote);

  actions.querySelector('#export-btn').addEventListener('click', async () => {
    const data = await ctx.db.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fart-quest-progress-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    const now = Date.now();
    try { await ctx.db.put('meta', LAST_EXPORTED_KEY, now); } catch (e) { /* best-effort */ }
    exportNote.textContent = lastExportedLine(now);
    ctx.toast('Progress exported.');
  });

  actions.querySelector('#import-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await ctx.db.importAll(data);
      await ctx.state.load(ctx.db);
      ctx.toast('Progress imported. Reloading…');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      ctx.toast('Import failed — check the file.');
    }
  });

  actions.querySelector('#reset-btn').addEventListener('click', () => {
    openResetConfirm(ctx);
  });

  const sliders = document.createElement('div');
  sliders.className = 'parent-sliders';
  sliders.innerHTML = `
    <div class="slider-row"><label>Music</label><input type="range" min="0" max="100" id="s-music"></div>
    <div class="slider-row"><label>Sound effects</label><input type="range" min="0" max="100" id="s-sfx"></div>
    <div class="slider-row"><label>Professor's Voice</label><input type="range" min="0" max="100" id="s-vo"></div>
  `;
  screen.appendChild(sliders);

  const prefs = ctx.prefs;
  sliders.querySelector('#s-music').value = Math.round((prefs.music || 1) * 100);
  sliders.querySelector('#s-sfx').value = Math.round((prefs.sfx || 1) * 100);
  sliders.querySelector('#s-vo').value = Math.round((prefs.vo || 1) * 100);

  async function persistVolumes() {
    prefs.music = sliders.querySelector('#s-music').value / 100;
    prefs.sfx = sliders.querySelector('#s-sfx').value / 100;
    prefs.vo = sliders.querySelector('#s-vo').value / 100;
    ctx.audio.setVolumes({
      music: prefs.musicOn ? prefs.music : 0,
      sfx: prefs.sfxOn ? prefs.sfx : 0,
      vo: prefs.voOn ? prefs.vo : 0,
    });
    await ctx.db.put('settings', 'prefs', prefs);
  }

  ['s-music', 's-sfx', 's-vo'].forEach((id) => {
    sliders.querySelector('#' + id).addEventListener('input', persistVolumes);
  });

  root.appendChild(screen);
}

function openResetConfirm(ctx) {
  const overlay = document.getElementById('overlay');
  const modal = document.createElement('div');
  modal.className = 'gate-modal';
  modal.innerHTML = `
    <div class="gate-card">
      <h2>Reset ALL progress?</h2>
      <p>This cannot be undone. Type <b>RESET</b> to confirm.</p>
      <input type="text" class="gate-input" autocapitalize="characters">
      <div class="gate-error"></div>
      <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
        <button class="btn btn-parchment gate-cancel" style="padding:10px 20px;">Cancel</button>
        <button class="btn" style="padding:10px 20px; background:#a12f2f; color:#fff;" id="confirm-reset">Reset</button>
      </div>
    </div>
  `;
  overlay.appendChild(modal);
  modal.querySelector('.gate-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('#confirm-reset').addEventListener('click', async () => {
    const val = modal.querySelector('.gate-input').value.trim();
    if (val === 'RESET') {
      await ctx.db.importAll({ progress: {}, settings: {}, meta: {} });
      modal.remove();
      ctx.toast('Progress reset.');
      setTimeout(() => window.location.reload(), 600);
    } else {
      modal.querySelector('.gate-error').textContent = 'Type RESET exactly to confirm.';
    }
  });
}

// Per-topic reset (ENGINE_SPEC_2 §H): "clears topic record + lesson progress +
// seenItems". That composite clear is state.js's (CORE agent) responsibility
// via a `resetTopic` action — it doesn't exist on state.js yet in this build,
// so we feature-detect it rather than hand-roll a partial db.del that would
// leave state's in-memory record out of sync with what's on disk.
function openTopicResetConfirm(ctx, topicId, topicName) {
  if (typeof ctx.state.resetTopic !== 'function') {
    ctx.toast(`Per-topic reset for ${topicName} isn't available in this build yet.`);
    return;
  }
  const overlay = document.getElementById('overlay');
  const modal = document.createElement('div');
  modal.className = 'gate-modal';
  modal.innerHTML = `
    <div class="gate-card">
      <h2>Reset ${topicName}?</h2>
      <p>This clears this topic's progress only (mastery, captures, lesson position). Type <b>RESET</b> to confirm.</p>
      <input type="text" class="gate-input" autocapitalize="characters">
      <div class="gate-error"></div>
      <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
        <button class="btn btn-parchment gate-cancel" style="padding:10px 20px;">Cancel</button>
        <button class="btn" style="padding:10px 20px; background:#a12f2f; color:#fff;" id="confirm-topic-reset">Reset</button>
      </div>
    </div>
  `;
  overlay.appendChild(modal);
  modal.querySelector('.gate-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('#confirm-topic-reset').addEventListener('click', async () => {
    const val = modal.querySelector('.gate-input').value.trim();
    if (val === 'RESET') {
      try {
        await ctx.state.resetTopic(topicId);
        modal.remove();
        ctx.toast(`${topicName} reset.`);
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        modal.querySelector('.gate-error').textContent = 'Reset failed — try again.';
      }
    } else {
      modal.querySelector('.gate-error').textContent = 'Type RESET exactly to confirm.';
    }
  });
}

export function unmount() {
  document.getElementById('overlay').querySelectorAll('.gate-modal').forEach((m) => m.remove());
}

export default { mount, unmount };
