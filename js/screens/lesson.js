// FART QUEST — screens/lesson.js (UI agent)
import { createLessonEngine } from '../engine/lesson.js';
import formats from '../engine/formats/index.js';
import { mulberry32 } from '../rng.js';

const TYPE_MS = 28;

let engineRef = null;
let typeTimer = null;

function stripTags(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

function typewriter(el, html, onDone) {
  clearTimeout(typeTimer);
  const plain = html; // may contain <b> — we type char by char including tags for simplicity via a safe approach:
  // Render progressively by revealing an increasing substring of the raw HTML.
  el.innerHTML = '';
  const caret = document.createElement('span');
  caret.className = 'caret';
  let i = 0;
  const total = plain.length;

  function step() {
    i += 2; // step 2 chars at a time for snappier feel, still readable
    if (i >= total) {
      el.innerHTML = plain;
      onDone && onDone();
      return;
    }
    el.innerHTML = plain.slice(0, i);
    el.appendChild(caret);
    typeTimer = setTimeout(step, TYPE_MS);
  }
  step();

  return {
    complete() {
      clearTimeout(typeTimer);
      el.innerHTML = plain;
      onDone && onDone();
    },
  };
}

function renderTalkCard(card, ctx, onNext) {
  const wrap = document.createElement('div');
  wrap.className = 'lesson-card talk-card-wrap enter-up';
  wrap.innerHTML = `
    <div class="wb-frame">🧙</div>
    <div class="speech-bubble tap-hint"><span class="bubble-text"></span></div>
  `;
  const textEl = wrap.querySelector('.bubble-text');
  const bubble = wrap.querySelector('.speech-bubble');
  bubble.classList.add('lesson-bubble-text');

  if (card.vo) ctx.audio.vo(card.vo);
  else ctx.audio.vo('teach-generic');

  let doneTyping = false;
  const typer = typewriter(textEl, card.text, () => {
    doneTyping = true;
    bubble.classList.remove('tap-hint');
  });

  bubble.addEventListener('click', () => {
    if (!doneTyping) {
      typer.complete();
      doneTyping = true;
    } else {
      onNext();
    }
  });

  return wrap;
}

function wireSlideDemo(container) {
  container.querySelectorAll('.slide-demo').forEach((demo) => {
    const replay = demo.querySelector('.slide-replay');
    const before = demo.querySelector('.pv-before');
    const after = demo.querySelector('.pv-after');
    const arrow = demo.querySelector('.slide-arrow');
    if (!replay) return;
    replay.addEventListener('click', () => {
      [before, after, arrow].forEach((el) => { if (el) { el.classList.remove('animating', 'sliding-in', 'whoosh'); void el.offsetWidth; } });
      if (arrow) arrow.classList.add('whoosh');
      if (after) after.classList.add('sliding-in');
    });
  });
}

function renderShowCard(card, ctx, onNext) {
  const wrap = document.createElement('div');
  wrap.className = 'lesson-card show-card enter-up';
  wrap.innerHTML = `
    <h2>${card.title || ''}</h2>
    <div class="lesson-html">${card.html}</div>
    <button class="btn btn-gold" style="margin-top:18px; padding:14px 30px; font-size:17px;">Got it!</button>
  `;
  wireSlideDemo(wrap);
  wrap.querySelector('button').addEventListener('click', () => { ctx.audio.sfx('click'); onNext(); });
  return wrap;
}

function renderTryCard(card, ctx, topic, onNext) {
  const wrap = document.createElement('div');
  wrap.className = 'lesson-card try-card enter-up';
  const qHost = document.createElement('div');
  wrap.appendChild(qHost);

  const hintBox = document.createElement('div');
  wrap.appendChild(hintBox);

  let hintsShown = 0;
  const question = card.q;
  const rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);

  function renderQuestion(q) {
    hintBox.innerHTML = '';
    hintsShown = 0;
    const api = {
      rng,
      scaffold: true,
      onAnswer(result) {
        handleAnswer(q, result);
      },
    };
    formats[q.format].render(qHost, q, api);
  }

  function showNextHint(q) {
    if (hintsShown < q.hintSteps.length) {
      const box = document.createElement('div');
      box.className = 'try-hint-box enter-up';
      box.innerHTML = `💡 ${q.hintSteps[hintsShown]}`;
      hintBox.appendChild(box);
      hintsShown += 1;
      ctx.audio.vo('hint');
      ctx.audio.sfx('click');
      // Let the hero try again with the SAME question, now unlocked, hints preserved.
      const api = {
        rng,
        scaffold: true,
        onAnswer(result) { handleAnswer(q, result); },
      };
      formats[q.format].render(qHost, q, api);
    } else {
      showWorked(q);
    }
  }

  function showWorked(q) {
    const box = document.createElement('div');
    box.className = 'try-worked-box enter-up';
    box.innerHTML = `<b>Here's how:</b> ${q.explain.worked}<br><br>We'll smash it in battle!`;
    hintBox.innerHTML = '';
    hintBox.appendChild(box);
    const cont = document.createElement('button');
    cont.className = 'btn btn-gold try-continue-btn';
    cont.style.padding = '12px 26px';
    cont.textContent = 'Onward!';
    cont.addEventListener('click', () => { ctx.audio.sfx('confirm'); onNext(); });
    hintBox.appendChild(cont);
  }

  function handleAnswer(q, result) {
    if (result.correct) {
      ctx.audio.sfx('correct');
      const box = document.createElement('div');
      box.className = 'try-worked-box enter-up';
      box.innerHTML = `✅ <b>Nailed it!</b> ${q.explain.worked}`;
      hintBox.innerHTML = '';
      hintBox.appendChild(box);
      const cont = document.createElement('button');
      cont.className = 'btn btn-gold try-continue-btn';
      cont.style.padding = '12px 26px';
      cont.textContent = 'Onward!';
      cont.addEventListener('click', () => { ctx.audio.sfx('confirm'); onNext(); });
      hintBox.appendChild(cont);
    } else {
      ctx.audio.sfx('wrong');
      qHost.classList.add('shake');
      setTimeout(() => qHost.classList.remove('shake'), 420);
      showNextHint(q);
    }
  }

  renderQuestion(question);
  return wrap;
}

function renderWeaponCard(card, ctx, topic, onNext) {
  const overlay = document.createElement('div');
  overlay.className = 'weapon-fullscreen enter-pop';
  const weapon = topic.weapon;
  overlay.innerHTML = `
    <div class="weapon-card-flip">
      <div class="weapon-card-inner">
        <div class="shine"></div>
        <div class="weapon-icon">🗡️</div>
        <h2>${weapon.name}</h2>
        <div class="tagline">${weapon.tagline}</div>
        <div class="rule-text">${weapon.rule}</div>
        <div class="example-text">${weapon.example}</div>
        <button class="btn btn-gold" style="padding:14px 30px; font-size:17px;">Add to Armoury!</button>
      </div>
    </div>
  `;
  const inner = overlay.querySelector('.weapon-card-inner');
  requestAnimationFrame(() => {
    inner.classList.add('flip-in');
    ctx.audio.sfx('unlock');
    ctx.audio.vo('weapon');
    setTimeout(() => { overlay.querySelector('.shine').classList.add('sweep'); }, 50);
  });
  overlay.querySelector('button').addEventListener('click', () => {
    ctx.audio.sfx('confirm');
    overlay.remove();
    onNext();
  });
  return overlay;
}

export async function mount(root, ctx, params) {
  const topic = ctx.topics[params.id];
  if (!topic) { ctx.go('#/map'); return; }
  ctx.audio.music('lesson');

  const screen = document.createElement('div');
  screen.className = 'lesson-screen screen enter-pop';

  const topbar = document.createElement('div');
  topbar.className = 'lesson-topbar';
  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-parchment';
  backBtn.style.padding = '10px 16px';
  backBtn.textContent = '←';
  const dots = document.createElement('div');
  dots.className = 'lesson-progress-dots';
  topbar.appendChild(backBtn);
  topbar.appendChild(dots);
  topbar.appendChild(document.createElement('div')); // spacer
  screen.appendChild(topbar);

  const body = document.createElement('div');
  body.className = 'lesson-body';
  screen.appendChild(body);

  root.appendChild(screen);

  const engine = createLessonEngine({ topic, ctx });
  engineRef = engine;
  await engine.loadProgress();

  function renderDots() {
    dots.innerHTML = '';
    for (let i = 0; i < engine.totalCards(); i++) {
      const d = document.createElement('span');
      d.className = 'lesson-dot';
      if (i < engine.currentIndex()) d.classList.add('done');
      if (i === engine.currentIndex()) d.classList.add('current');
      dots.appendChild(d);
    }
  }

  async function renderCurrent() {
    body.innerHTML = '';
    renderDots();
    const card = engine.currentCard();
    const onNext = async () => {
      const more = await engine.goNext();
      if (more) {
        renderCurrent();
      } else {
        ctx.toast('Scout Report complete!');
        ctx.go(`#/topic/${topic.id}`);
      }
    };

    let el;
    if (card.type === 'talk') el = renderTalkCard(card, ctx, onNext);
    else if (card.type === 'show') el = renderShowCard(card, ctx, onNext);
    else if (card.type === 'try') el = renderTryCard(card, ctx, topic, onNext);
    else if (card.type === 'weapon') {
      el = document.createElement('div');
      body.appendChild(el);
      const overlayEl = renderWeaponCard(card, ctx, topic, onNext);
      document.getElementById('overlay').appendChild(overlayEl);
      return;
    } else {
      el = document.createElement('div');
    }
    body.appendChild(el);
  }

  backBtn.addEventListener('click', async () => {
    ctx.audio.sfx('back');
    const went = await engine.goBack();
    if (went) renderCurrent();
    else ctx.go(`#/topic/${topic.id}`);
  });

  renderCurrent();
}

export function unmount() {
  clearTimeout(typeTimer);
  if (engineRef) { engineRef.destroy(); engineRef = null; }
  const overlay = document.getElementById('overlay');
  overlay.querySelectorAll('.weapon-fullscreen').forEach((el) => el.remove());
}

export default { mount, unmount };
