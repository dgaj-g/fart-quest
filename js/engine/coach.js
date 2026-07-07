// FART QUEST — js/engine/coach.js (UI agent)
// Reusable spotlight-cutout tutorial overlay, driven by a step script.
//
// Step shape: { target: selector|rect|null, text, vo?, advanceOn:'tap-target'|'tap-anywhere' }
//   - target: CSS selector string (resolved against the live DOM each step), a rect-like
//     object {top,left,width,height}, or omitted/null for a centred non-cutout card.
//   - advanceOn 'tap-target': only tapping inside the cutout (or the card's "Got it!"
//     button) advances. 'tap-anywhere': tapping anywhere on the dimmed backdrop advances too.
// Special step: { type:'battle-demo', text, vo } — renders a fully self-contained two-question
// mini battle demo (scripted, NOT the real battle engine) inside the overlay card.
//
// run(steps, ctx) -> Promise<void>, resolves once every step is done or the user hits Skip.
// Marks db meta 'tutorialDone' = true on completion (including a full skip-out).

const RESIZE_THROTTLE_MS = 120;

function rectOf(target) {
  if (!target) return null;
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) return null;
    try { el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); } catch (e) { /* older Safari lacks options obj support for some values — ignore */ }
    return el.getBoundingClientRect();
  }
  if (typeof target === 'object' && 'width' in target && 'height' in target) return target;
  return null;
}

function buildShell() {
  const wrap = document.createElement('div');
  wrap.className = 'coach-overlay';
  wrap.innerHTML = `
    <div class="coach-dim"></div>
    <div class="coach-cutout-ring" style="display:none;"></div>
    <button class="btn btn-ghost coach-skip">Skip tutorial ✕</button>
    <div class="coach-card enter-up">
      <div class="coach-portrait"><img class="wb-img" src="assets/monsters/whiffbeard.png" alt="" style="width:100%;height:100%;object-fit:contain;"></div>
      <div class="coach-text"></div>
      <div class="coach-demo" style="display:none;"></div>
      <button class="btn btn-gold coach-next">Got it!</button>
    </div>
  `;
  return wrap;
}

function positionCutout(wrap, rect) {
  const ring = wrap.querySelector('.coach-cutout-ring');
  const card = wrap.querySelector('.coach-card');
  if (!rect) {
    ring.style.display = 'none';
    card.classList.add('coach-card-centred');
    card.style.top = '';
    card.style.left = '';
    return;
  }
  card.classList.remove('coach-card-centred');
  const pad = 14;
  ring.style.display = 'block';
  ring.style.top = `${rect.top - pad}px`;
  ring.style.left = `${rect.left - pad}px`;
  ring.style.width = `${rect.width + pad * 2}px`;
  ring.style.height = `${rect.height + pad * 2}px`;

  // place the card below the target if there's room, else above
  const vh = window.innerHeight;
  const spaceBelow = vh - rect.bottom;
  const cardH = card.offsetHeight || 220;
  card.style.left = `${Math.max(16, Math.min(rect.left, window.innerWidth - 340))}px`;
  if (spaceBelow > cardH + 24) {
    card.style.top = `${rect.bottom + pad + 12}px`;
  } else {
    card.style.top = `${Math.max(16, rect.top - cardH - pad - 12)}px`;
  }
}

// ---------- self-contained battle demo (step type 'battle-demo') ----------
// Two scripted MCQ questions against Whiffy art with a mock PONG METER. This never touches
// the real battle engine/state — purely illustrative, always the same two questions.
const DEMO_QUESTIONS = [
  { stem: 'What is <b>3 &times; 10</b>?', options: ['13', '30', '31', '300'], correctIndex: 1 },
  { stem: 'Which number has a <b>7</b> in the tens place?', options: ['704', '170', '407', '740'], correctIndex: 3 },
];

function renderBattleDemo(container, ctx, onDemoDone) {
  container.style.display = 'block';
  container.innerHTML = `
    <div class="coach-demo-arena">
      <img class="coach-demo-creature idle-bob" src="assets/monsters/stinkling-3.png" alt="Whiffy">
      <div class="coach-demo-meter"><div class="coach-demo-meter-fill"></div></div>
    </div>
    <div class="coach-demo-question"></div>
    <div class="coach-demo-options"></div>
    <div class="coach-demo-note">Demo — try it!</div>
  `;
  const qEl = container.querySelector('.coach-demo-question');
  const optsEl = container.querySelector('.coach-demo-options');
  const fillEl = container.querySelector('.coach-demo-meter-fill');
  let qIndex = 0;
  let progress = 100;

  function renderQ() {
    if (qIndex >= DEMO_QUESTIONS.length) {
      onDemoDone();
      return;
    }
    const q = DEMO_QUESTIONS[qIndex];
    qEl.innerHTML = q.stem;
    optsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'btn btn-parchment coach-demo-opt';
      b.textContent = opt;
      b.addEventListener('click', () => {
        optsEl.querySelectorAll('button').forEach((btn) => { btn.disabled = true; });
        const correct = i === q.correctIndex;
        b.classList.add(correct ? 'is-correct' : 'is-wrong');
        if (correct) {
          if (ctx && ctx.audio) { ctx.audio.sfx('correct'); }
          progress = Math.max(0, progress - 50);
          fillEl.style.width = `${progress}%`;
        } else {
          if (ctx && ctx.audio) { ctx.audio.sfx('wrong'); }
          optsEl.querySelectorAll('button')[q.correctIndex].classList.add('is-correct');
        }
        setTimeout(() => {
          qIndex += 1;
          renderQ();
        }, 900);
      });
      optsEl.appendChild(b);
    });
  }
  renderQ();
}

// ---------- main runner ----------
function run(steps, ctx) {
  return new Promise((resolve) => {
    if (!Array.isArray(steps) || steps.length === 0) {
      resolve();
      return;
    }
    const overlay = document.getElementById('overlay');
    if (!overlay) { resolve(); return; }

    const wrap = buildShell();
    overlay.appendChild(wrap);
    // #overlay is pointer-events:none by default (main.js convention) — this modal needs input.
    wrap.style.pointerEvents = 'auto';

    let stepIndex = 0;
    let resizeTimer = null;
    let finished = false;

    function cleanup() {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      wrap.remove();
    }

    function finishAll() {
      if (finished) return;
      finished = true;
      cleanup();
      (async () => {
        try {
          if (ctx && ctx.db) await ctx.db.put('meta', 'tutorialDone', true);
        } catch (e) { /* swallow — tutorial completion shouldn't hard-fail on db errors */ }
        resolve();
      })();
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const step = steps[stepIndex];
        if (step && step.type !== 'battle-demo') positionCutout(wrap, rectOf(step.target));
      }, RESIZE_THROTTLE_MS);
    }
    window.addEventListener('resize', onResize);

    function renderStep() {
      const step = steps[stepIndex];
      if (!step) { finishAll(); return; }

      const textEl = wrap.querySelector('.coach-text');
      const demoEl = wrap.querySelector('.coach-demo');
      const nextBtn = wrap.querySelector('.coach-next');
      const dim = wrap.querySelector('.coach-dim');
      const ring = wrap.querySelector('.coach-cutout-ring');

      textEl.textContent = step.text || '';
      if (step.vo && ctx && ctx.audio) ctx.audio.vo(step.vo);

      if (step.type === 'battle-demo') {
        ring.style.display = 'none';
        wrap.querySelector('.coach-card').classList.add('coach-card-centred');
        wrap.querySelector('.coach-card').classList.add('coach-card-wide');
        nextBtn.style.display = 'none';
        demoEl.style.display = 'block';
        renderBattleDemo(demoEl, ctx, () => {
          nextBtn.style.display = 'block';
          nextBtn.textContent = 'Got it — let\'s go!';
        });
        nextBtn.onclick = () => {
          if (ctx && ctx.audio) ctx.audio.sfx('confirm');
          advanceStep();
        };
        dim.onclick = null;
        return;
      }

      wrap.querySelector('.coach-card').classList.remove('coach-card-wide');
      demoEl.style.display = 'none';
      demoEl.innerHTML = '';
      nextBtn.textContent = 'Got it!';

      const rect = rectOf(step.target);
      positionCutout(wrap, rect);

      const advance = () => {
        if (ctx && ctx.audio) ctx.audio.sfx('click');
        advanceStep();
      };

      // 'tap-target' hides the "Got it!" button ONLY when there's a real cutout to tap
      // instead — if the target selector didn't resolve (robustness fallback), always
      // show the button so the tutorial can never soft-lock with no way to advance.
      nextBtn.style.display = (step.advanceOn === 'tap-target' && rect) ? 'none' : 'block';

      nextBtn.onclick = advance;
      dim.onclick = (step.advanceOn === 'tap-anywhere' || !rect) ? advance : null;
      ring.onclick = advance; // tapping the spotlit target itself always advances
    }

    function advanceStep() {
      stepIndex += 1;
      if (stepIndex >= steps.length) {
        finishAll();
        return;
      }
      renderStep();
    }

    wrap.querySelector('.coach-skip').addEventListener('click', () => {
      if (ctx && ctx.audio) ctx.audio.sfx('click');
      finishAll();
    });

    renderStep();
  });
}

export default { run };
export { run };
