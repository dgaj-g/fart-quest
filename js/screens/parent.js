// FART QUEST — screens/parent.js (UI agent)

const MASTERY_LABELS = ['Unseen', 'Taught', 'Practising', 'Boss-Ready', 'Captured', 'Legend'];

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

export function mount(root, ctx) {
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
      <tr>
        <td>${topic.name}</td>
        <td>${MASTERY_LABELS[level]}</td>
        <td>${last10Acc(record)}</td>
        <td>${record.attempts}</td>
        <td>${fmtDate(record.lastPlayed)}</td>
        <td>${fmtDate(record.reviewDue)}</td>
      </tr>
    `;
  }).join('');

  table.innerHTML = `
    <thead>
      <tr><th>Topic</th><th>Mastery</th><th>Last-10 accuracy</th><th>Attempts</th><th>Last practised</th><th>Review due</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  `;
  screen.appendChild(table);

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

export function unmount() {
  document.getElementById('overlay').querySelectorAll('.gate-modal').forEach((m) => m.remove());
}

export default { mount, unmount };
