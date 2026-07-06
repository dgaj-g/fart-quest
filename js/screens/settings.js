// FART QUEST — screens/settings.js (UI agent)

async function persist(ctx) {
  await ctx.db.put('settings', 'prefs', ctx.prefs);
  ctx.audio.setVolumes({
    music: ctx.prefs.musicOn ? ctx.prefs.music : 0,
    sfx: ctx.prefs.sfxOn ? ctx.prefs.sfx : 0,
    vo: ctx.prefs.voOn ? ctx.prefs.vo : 0,
  });
  ctx.audio.setFartOMeter(ctx.prefs.fartOMeter);
  document.body.classList.toggle('text-size-large', ctx.prefs.textSize === 'A+');
}

export function mount(root, ctx) {
  const screen = document.createElement('div');
  screen.className = 'settings-screen screen enter-pop';

  const back = document.createElement('button');
  back.className = 'btn btn-ghost settings-back';
  back.style.padding = '10px 18px';
  back.textContent = '← Back';
  back.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/map'); });
  screen.appendChild(back);

  const panel = document.createElement('div');
  panel.className = 'settings-panel';
  panel.innerHTML = `
    <h1>Settings</h1>
    <div class="settings-row">
      <span class="settings-label">Music</span>
      <button class="toggle-switch ${ctx.prefs.musicOn ? 'on' : ''}" data-key="musicOn"></button>
    </div>
    <div class="settings-row">
      <span class="settings-label">Sounds</span>
      <button class="toggle-switch ${ctx.prefs.sfxOn ? 'on' : ''}" data-key="sfxOn"></button>
    </div>
    <div class="settings-row">
      <span class="settings-label">Professor's Voice</span>
      <button class="toggle-switch ${ctx.prefs.voOn ? 'on' : ''}" data-key="voOn"></button>
    </div>
    <div class="fart-slider-row">
      <span class="settings-label">Fart-o-meter</span>
      <input type="range" min="0" max="2" step="1" id="fart-slider" value="${ctx.prefs.fartOMeter}">
      <div class="fart-slider-labels"><span>Silly</span><span>VERY SILLY</span></div>
    </div>
    <div class="settings-row">
      <span class="settings-label">Text size</span>
      <div class="text-size-btns">
        <button data-size="A" class="${ctx.prefs.textSize === 'A' ? 'active' : ''}">A</button>
        <button data-size="A+" class="${ctx.prefs.textSize === 'A+' ? 'active' : ''}">A+</button>
      </div>
    </div>
  `;
  screen.appendChild(panel);
  root.appendChild(screen);

  panel.querySelectorAll('.toggle-switch').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      ctx.prefs[key] = !ctx.prefs[key];
      btn.classList.toggle('on', ctx.prefs[key]);
      ctx.audio.sfx('click');
      await persist(ctx);
    });
  });

  panel.querySelector('#fart-slider').addEventListener('input', async (e) => {
    ctx.prefs.fartOMeter = Number(e.target.value);
    await persist(ctx);
    ctx.audio.parp(2);
  });

  panel.querySelectorAll('.text-size-btns button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      ctx.prefs.textSize = btn.dataset.size;
      panel.querySelectorAll('.text-size-btns button').forEach((b) => b.classList.toggle('active', b === btn));
      ctx.audio.sfx('click');
      await persist(ctx);
    });
  });
}

export function unmount() {}

export default { mount, unmount };
