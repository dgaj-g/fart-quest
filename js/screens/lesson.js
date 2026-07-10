// FART QUEST — screens/lesson.js (UI agent)
import { createLessonEngine } from '../engine/lesson.js';
import formats from '../engine/formats/index.js';
import anims from '../anims/index.js';
import { sfx as animSfx } from '../anims/_kit.js';
import { mulberry32 } from '../rng.js';

const TYPE_MS = 28;

let engineRef = null;
let typeTimer = null;
let animCleanup = null; // active anim card's cleanup fn (see renderAnimCard)

function runAnimCleanup() {
  if (animCleanup) {
    try { animCleanup(); } catch (e) { /* an anim must never break the lesson */ }
    animCleanup = null;
  }
}

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
    <div class="wb-frame"><img class="wb-img" src="assets/monsters/whiffbeard.png" alt=""></div>
    <div class="speech-bubble tap-hint"><span class="bubble-text"></span></div>
  `;
  const textEl = wrap.querySelector('.bubble-text');
  const bubble = wrap.querySelector('.speech-bubble');
  bubble.classList.add('lesson-bubble-text');

  // vo(prefix) resolves true only if a real recording exists for this prefix;
  // fall back to the generic teach voice line for topics with no recording yet
  // (INTEGRATION_NOTES.md #2). Fire-and-forget IIFE — this function stays sync
  // so its DOM element can still be returned/appended synchronously above.
  (async () => {
    if (!(await ctx.audio.vo(card.vo))) ctx.audio.vo('teach-generic');
  })();

  let doneTyping = false;
  let advanced = false; // re-entry guard: ignore further activations once onNext has been triggered for this card
  const typer = typewriter(textEl, card.text, () => {
    doneTyping = true;
    bubble.classList.remove('tap-hint');
  });

  bubble.addEventListener('click', () => {
    if (advanced) return;
    if (!doneTyping) {
      typer.complete();
      doneTyping = true;
    } else {
      advanced = true;
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
  `;
  wireSlideDemo(wrap);
  // Built as a direct reference, never wrap.querySelector('button'): card.html is
  // data-authored and may embed its own buttons (the .slide-replay cards do), and
  // a first-button query hands the advance handler to THAT button instead —
  // replay advances the lesson while the real Got it! sits dead.
  const gotItBtn = document.createElement('button');
  gotItBtn.className = 'btn btn-gold';
  gotItBtn.style.cssText = 'margin-top:18px; padding:14px 30px; font-size:17px;';
  gotItBtn.textContent = 'Got it!';
  wrap.appendChild(gotItBtn);
  gotItBtn.addEventListener('click', () => {
    if (gotItBtn.disabled) return;
    gotItBtn.disabled = true;
    ctx.audio.sfx('click');
    onNext();
  });
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

function renderAnimCard(card, ctx, topic, onNext) {
  const wrap = document.createElement('div');
  wrap.className = 'lesson-card anim-card enter-up';
  const mod = anims[card.anim];
  if (!mod) {
    // unknown/missing anim — never block the lesson, just move on
    queueMicrotask(onNext);
    return wrap;
  }
  wrap.innerHTML = `
    <div class="anim-chip">🔧 SCOUT-TECH</div>
    <h2>${mod.title}</h2>
  `;
  const hostEl = document.createElement('div');
  hostEl.className = 'anim-host';
  wrap.appendChild(hostEl);
  const carry = document.createElement('button');
  carry.className = 'btn btn-gold anim-carry';
  carry.textContent = 'CARRY ON ➡';
  wrap.appendChild(carry);
  // The anim synth lives outside ctx.audio's volume model — apply the child's
  // saved Sounds pref here so a toggle made before this session's first anim
  // (or in a previous session) is honoured.
  animSfx.setEnabled(ctx.prefs.sfxOn !== false);
  try {
    animCleanup = mod.mount(hostEl, {
      audio: ctx.audio,
      sfx: animSfx,
      complete() { carry.classList.add('pulse'); },
    });
  } catch (e) {
    // a broken anim must never trap the child in the lesson
    queueMicrotask(onNext);
    return wrap;
  }
  carry.addEventListener('click', () => {
    if (carry.disabled) return;
    carry.disabled = true;
    ctx.audio.sfx('confirm');
    runAnimCleanup();
    onNext();
  });
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
  // Warm the SW's runtime audio cache for this topic's first talk-card clip
  // (falls back gracefully to 'teach-generic' at play time if unrecorded — see
  // renderTalkCard below) plus the other clips this screen can play (hints,
  // the weapon-unlock sting), so first playback doesn't stall on a cold fetch.
  const firstCardVo = topic.lesson && topic.lesson[0] && topic.lesson[0].vo;
  const preloadPrefixes = firstCardVo
    ? [firstCardVo, 'teach-generic', 'hint', 'weapon']
    : ['teach-generic', 'hint', 'weapon'];
  ctx.audio.preloadVo(preloadPrefixes);

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
  // unmount() may have destroyed this engine while loadProgress() was pending
  // (e.g. the child navigated away mid-load) — bail before touching DOM/state.
  if (engine.isDestroyed()) return;

  function renderDots() {
    dots.innerHTML = '';
    // Dots must exactly match the authored lesson card count — read topic.lesson.length
    // directly rather than trusting an intermediary so the two can never drift apart.
    const total = topic.lesson.length;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('span');
      d.className = 'lesson-dot';
      if (i < engine.currentIndex()) d.classList.add('done');
      if (i === engine.currentIndex()) d.classList.add('current');
      dots.appendChild(d);
    }
  }

  async function renderCurrent() {
    runAnimCleanup(); // leaving a card — an active anim must release its timers/listeners
    body.innerHTML = '';
    renderDots();
    const card = engine.currentCard();
    let advancing = false; // re-entry guard: fresh per card render, blocks double-advance from rapid taps
    const onNext = async () => {
      if (advancing) return;
      advancing = true;
      const more = await engine.goNext();
      if (engine.isDestroyed()) return; // unmounted while goNext() was pending
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
    else if (card.type === 'anim') el = renderAnimCard(card, ctx, topic, onNext);
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
    if (engine.isDestroyed()) return; // unmounted while goBack() was pending
    if (went) renderCurrent();
    else ctx.go(`#/topic/${topic.id}`);
  });

  renderCurrent();
}

export function unmount() {
  clearTimeout(typeTimer);
  runAnimCleanup();
  if (engineRef) { engineRef.destroy(); engineRef = null; }
  const overlay = document.getElementById('overlay');
  overlay.querySelectorAll('.weapon-fullscreen').forEach((el) => el.remove());
}

export default { mount, unmount };
