// FART QUEST — screens/title.js (UI agent)

let holdTimer = null;
let holdStart = 0;

function buildWordmark() {
  const word = 'FART QUEST';
  const wrap = document.createElement('div');
  wrap.className = 'title-wordmark';
  [...word].forEach((ch, i) => {
    if (ch === ' ') {
      const sp = document.createElement('span');
      sp.style.width = '0.3em';
      sp.style.display = 'inline-block';
      wrap.appendChild(sp);
      return;
    }
    const span = document.createElement('span');
    span.className = 'ch';
    span.textContent = ch;
    const tilt = (i % 2 === 0 ? 1 : -1) * (2 + (i % 3));
    span.style.setProperty('--tilt', `${tilt}deg`);
    span.style.animationDelay = `${i * 90}ms`;
    if (ch === 'Q') {
      span.classList.add('q-letter');
      const puff = document.createElement('span');
      puff.className = 'title-puff';
      puff.textContent = '💨';
      span.appendChild(puff);
      // periodically animate the puff
      const puffLoop = () => {
        puff.classList.remove('go');
        // force reflow to restart animation
        void puff.offsetWidth;
        puff.classList.add('go');
      };
      puffLoop();
      const iv = setInterval(puffLoop, 6000);
      span.dataset.puffInterval = String(iv);
    }
    wrap.appendChild(span);
  });
  return wrap;
}

function openParentGate(ctx) {
  const overlay = document.getElementById('overlay');
  const a = rand(2, 9), b = rand(2, 9);
  let tries = 0;

  const modal = document.createElement('div');
  modal.className = 'gate-modal';
  modal.innerHTML = `
    <div class="gate-card">
      <h2>Grown-up check</h2>
      <p>What is <b>${a} × ${b}</b>?</p>
      <input type="number" inputmode="numeric" class="gate-input" autofocus>
      <div class="gate-error"></div>
      <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
        <button class="btn btn-parchment gate-cancel" style="padding:10px 20px;">Cancel</button>
        <button class="btn btn-gold gate-submit" style="padding:10px 20px;">Enter</button>
      </div>
    </div>`;
  overlay.appendChild(modal);

  function close() { modal.remove(); }

  modal.querySelector('.gate-cancel').addEventListener('click', close);
  modal.querySelector('.gate-submit').addEventListener('click', () => {
    const val = Number(modal.querySelector('.gate-input').value);
    if (val === a * b) {
      close();
      ctx.go('#/parent');
    } else {
      tries += 1;
      const errEl = modal.querySelector('.gate-error');
      if (tries >= 3) {
        errEl.textContent = 'Too many tries — ask a grown-up to help.';
        setTimeout(close, 1400);
      } else {
        errEl.textContent = `Not quite — ${3 - tries} tries left.`;
      }
    }
  });
}

function rand(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function mount(root, ctx) {
  const screen = document.createElement('div');
  screen.className = 'title-screen screen enter-pop';

  const sky = document.createElement('div');
  sky.className = 'title-sky';
  sky.innerHTML = `
    <span class="title-star" style="left:12%; top:14%; --d:0s;"></span>
    <span class="title-star" style="left:22%; top:28%; --d:.6s;"></span>
    <span class="title-star" style="left:82%; top:12%; --d:1.1s;"></span>
    <span class="title-star" style="left:70%; top:22%; --d:1.8s;"></span>
    <span class="title-star" style="left:90%; top:32%; --d:.3s;"></span>
    <img class="title-cloud c1" src="assets/ui/cloud-1.png" alt="">
    <img class="title-cloud c2" src="assets/ui/cloud-2.png" alt="">
  `;
  screen.appendChild(sky);

  const fumesLeft = document.createElement('div');
  fumesLeft.className = 'fumes title-fumes title-fumes-left';
  fumesLeft.style.setProperty('--fume-scale', '.8');
  fumesLeft.innerHTML = '<div class="blob"></div><div class="blob"></div><div class="blob"></div>';
  screen.appendChild(fumesLeft);

  const fumesRight = document.createElement('div');
  fumesRight.className = 'fumes title-fumes title-fumes-right';
  fumesRight.style.setProperty('--fume-scale', '.7');
  fumesRight.innerHTML = '<div class="blob"></div><div class="blob"></div><div class="blob"></div>';
  screen.appendChild(fumesRight);

  const hills = document.createElement('div');
  hills.className = 'title-hills';
  hills.innerHTML = `
    <img class="hill-back" src="assets/ui/hill-2.png" alt="">
    <img class="title-tree tree-back-1" src="assets/ui/tree-2.png" alt="">
    <img class="title-tree tree-back-2" src="assets/ui/tree-2.png" alt="">
    <img class="stinkling stinkling-a idle-bob" src="assets/monsters/stinkling-2.png" alt="">
    <img class="stinkling stinkling-b idle-bob" src="assets/monsters/stinkling-4.png" alt="">
    <img class="hill-front" src="assets/ui/hill-1.png" alt="">
    <img class="title-tree tree-front-1" src="assets/ui/tree-1.png" alt="">
    <img class="title-tree tree-front-2" src="assets/ui/tree-1.png" alt="">
    <img class="stinkling stinkling-c idle-bob" src="assets/monsters/stinkling-6.png" alt="">
  `;
  screen.appendChild(hills);

  const whiff = document.createElement('img');
  whiff.className = 'title-whiffbeard idle-bob';
  whiff.src = 'assets/monsters/whiffbeard.png';
  whiff.alt = 'Whiffbeard';
  screen.appendChild(whiff);

  screen.appendChild(buildWordmark());

  const subtitle = document.createElement('p');
  subtitle.className = 'title-subtitle';
  subtitle.textContent = 'The Kingdom needs YOU… it smells TERRIBLE.';
  screen.appendChild(subtitle);

  const buttons = document.createElement('div');
  buttons.className = 'title-buttons';
  buttons.innerHTML = `
    <button class="btn btn-gold title-play-btn">PLAY</button>
    <div class="title-secondary-row">
      <button class="btn btn-ghost">Collection</button>
      <button class="btn btn-ghost">Settings</button>
    </div>
  `;
  screen.appendChild(buttons);

  const crest = document.createElement('button');
  crest.className = 'crest-btn title-crest-corner';
  crest.textContent = '🛡️';
  crest.setAttribute('aria-label', 'Parent area');
  screen.appendChild(crest);

  const vignette = document.createElement('div');
  vignette.className = 'title-vignette';
  screen.appendChild(vignette);

  root.appendChild(screen);

  buttons.querySelector('.title-play-btn').addEventListener('click', () => {
    ctx.audio.sfx('confirm');
    ctx.go('#/map');
  });
  const secondaryBtns = buttons.querySelectorAll('.title-secondary-row button');
  secondaryBtns[0].addEventListener('click', () => { ctx.audio.sfx('click'); ctx.go('#/collection'); });
  secondaryBtns[1].addEventListener('click', () => { ctx.audio.sfx('click'); ctx.go('#/settings'); });

  crest.addEventListener('pointerdown', () => {
    holdStart = Date.now();
    holdTimer = setTimeout(() => {
      ctx.audio.sfx('click');
      openParentGate(ctx);
    }, 2500);
  });
  const cancelHold = () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } };
  crest.addEventListener('pointerup', cancelHold);
  crest.addEventListener('pointerleave', cancelHold);

  // greet with VO once per boot
  ctx.audio.vo('welcome');
}

export function unmount() {
  document.querySelectorAll('[data-puff-interval]').forEach((el) => {
    clearInterval(Number(el.dataset.puffInterval));
  });
}

export default { mount, unmount };
