// FART QUEST — js/anims/pie-charts.js
// PIE-FACE'S SLICE SPLITTER — interactive pie-cutting machine for the
// pie-charts Scout Report. Structure and interaction discipline follow
// decimals-x10.js (the house reference implementation).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const PIEFACE_IMG = 'assets/monsters/pie-face.png';
const RULE = 'The whole pie = everything. Half the pie = half of everything.';

/* ---------- pure slice-splitter engine (unit-tested in scratch script — do not "improve") ---------- */
const FRACTIONS = [
  { angle: 90, num: 1, den: 4, name: 'quarter' },
  { angle: 120, num: 1, den: 3, name: 'third' },
  { angle: 180, num: 1, den: 2, name: 'half' },
  { angle: 270, num: 3, den: 4, name: 'three-quarter' },
];
const ANGLE_MIN = 55;
const ANGLE_MAX = 305;

function clampAngle(a) { return Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, a)); }
function nearestSnapIndex(angle) {
  let best = 0; let bestD = Infinity;
  FRACTIONS.forEach((f, i) => { const d = Math.abs(f.angle - angle); if (d < bestD) { bestD = d; best = i; } });
  return best;
}
function computeCounts(total, angle) {
  const chosen = Math.round((total * angle) / 360);
  return { chosen, rest: total - chosen };
}
function isAtTarget(angle, targetAngle) { return Math.abs(angle - targetAngle) < 0.5; }
// pointer (x,y) relative to circle centre (cx,cy) -> degrees clockwise from 12 o'clock
function angleFromPoint(x, y, cx, cy) {
  const dx = x - cx; const dy = y - cy;
  let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (a < 0) a += 360;
  return a;
}

/* ---------- content ---------- */
const MISSIONS = [
  {
    id: 'a', total: 36, angle: 180,
    q: 'Cut exactly <b>HALF</b> the pie — how many pupils is that?',
    qsub: 'Drag the crust boundary round the circle, then LOCK IT IN.',
    worked: 'Half of 36 = 18. Chosen 18, Rest 18 — 18 + 18 = 36, the whole pie.',
  },
  {
    id: 'b', total: 36, angle: 90,
    q: 'Now cut a <b>QUARTER</b> of the pie — how many pupils?',
    qsub: 'A quarter means the pie splits into four equal parts — one part is chosen.',
    worked: 'A quarter of 36 = 9. Chosen 9, Rest 27 — 9 + 27 = 36.',
  },
  {
    id: 'c', total: 24, angle: 90, printed: true,
    q: "Pie-Face's second poll: <b>24 pupils</b> named their favourite pet. His Cat slice is a quarter of the pie.",
    qsub: 'Match the Splitter to the SAME size slice as the picture, then LOCK IT IN.',
    worked: 'The Cat slice is a quarter of 24 pupils. A quarter of 24 = 6 — the Splitter counts it for you.',
  },
  {
    id: 'd', total: 36, angle: 180, trap: true,
    q: 'Some pupils reckon a slice worth <b>50%</b> means 50 pupils. Tap what YOU think first.',
    qsub: 'Tap a prediction, then cut the pie to exactly half to prove it.',
    worked: '50% OF 36 = 18, never 50 — the pie is dressed as a circle, but underneath it is only ever the 36 pupils asked.',
  },
];
const FREE_TOTALS = [36, 24, 40, 20];
const WIN_PHRASES = ['PERFECTLY SLICED! 🥧', 'PIE-FACE APPROVES! 🎂', 'CRUMB-PERFECT!', 'THE WHOLE PIE COUNTS!'];

/* Fisher-Yates — the trap mission's two prediction chips must never sit in a fixed order */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- the wheel (draggable pie) ---------- */
function makeWheel(host, opts) {
  const W = {
    total: opts.total, angle: 150, D: 0, r: 0, settling: false, targetIndex: null,
    cancelTween: null, alive: true,
  };
  const wrap = el('div', 'psl-wheelwrap');
  const spoke = el('div', 'psl-spoke');
  const handle = el('div', 'psl-handle', '🔪');
  const hit = el('div', 'psl-hit');
  wrap.append(spoke, handle, hit);
  host.append(wrap);
  let lastZone = nearestSnapIndex(W.angle); // avoid a spurious zone-ding on first render

  W.layout = function layout() {
    if (W.cancelTween) {
      W.cancelTween(); W.cancelTween = null;
      if (W.settling) { W.angle = W.targetIndex != null ? FRACTIONS[W.targetIndex].angle : W.angle; W.settling = false; }
    }
    drag.abort();
    wrap.classList.remove('dragging');
    const avail = Math.min(230, Math.max(150, (host.clientWidth || 300)));
    W.D = avail;
    W.r = W.D / 2;
    wrap.style.width = W.D + 'px';
    wrap.style.height = W.D + 'px';
    spoke.style.width = W.r + 'px';
    spoke.style.left = W.r + 'px';
    spoke.style.top = W.r + 'px';
    render();
  };

  function render() {
    wrap.style.background = `conic-gradient(var(--psl-chosen) 0deg ${W.angle}deg, var(--psl-rest) ${W.angle}deg 360deg)`;
    spoke.style.transform = `rotate(${W.angle - 90}deg)`;
    const rad = (W.angle * Math.PI) / 180;
    const hr = W.r - 6;
    handle.style.left = (W.r + hr * Math.sin(rad)) + 'px';
    handle.style.top = (W.r - hr * Math.cos(rad)) + 'px';
    if (opts.onChange) opts.onChange(W.angle, W.total);
    const zone = nearestSnapIndex(W.angle);
    if (zone !== lastZone) { lastZone = zone; if (opts.onZone) opts.onZone(zone); }
  }

  W.setAngle = function setAngle(a) { W.angle = clampAngle(a); render(); };

  W.settleToIndex = function settleToIndex(idx, silent) {
    const target = FRACTIONS[idx].angle;
    W.targetIndex = idx;
    if (W.cancelTween) W.cancelTween();
    W.settling = true;
    const from = W.angle;
    W.cancelTween = tween((v) => { W.angle = v; render(); }, from, target, 260, () => {
      W.settling = false; W.cancelTween = null; W.angle = target; render();
      if (!silent) sfx.settle();
      if (opts.onSettle) opts.onSettle(W.angle);
    });
  };

  const drag = makeDrag(hit, {
    enabled: () => !W.disabled,
    onStart() {
      if (W.cancelTween) { W.cancelTween(); W.cancelTween = null; W.settling = false; }
      const rect = wrap.getBoundingClientRect();
      W.cx = rect.left + rect.width / 2; W.cy = rect.top + rect.height / 2;
      W.lastRaw = null;
      wrap.classList.add('dragging');
    },
    onMove(dx, dy, e) {
      const raw = angleFromPoint(e.clientX, e.clientY, W.cx, W.cy);
      if (W.lastRaw === null) { W.lastRaw = raw; return; }
      let delta = raw - W.lastRaw;
      if (delta > 180) delta -= 360; else if (delta < -180) delta += 360;
      W.lastRaw = raw;
      W.setAngle(W.angle + delta);
    },
    onEnd() {
      wrap.classList.remove('dragging');
      W.settleToIndex(nearestSnapIndex(W.angle));
    },
  });

  W.nudge = function nudge(dir) {
    if (W.disabled || drag.dragging()) return;
    const base = W.settling ? W.targetIndex : nearestSnapIndex(W.angle);
    const idx = Math.max(0, Math.min(FRACTIONS.length - 1, base + dir));
    if (idx === base) { sfx.nudge(); return; }
    W.settleToIndex(idx);
  };

  W.setTotal = function setTotal(t) { W.total = t; render(); };
  W.setDisabled = function setDisabled(v) {
    W.disabled = v;
    wrap.classList.toggle('psl-disabled', v);
  };
  W.resetToNeutral = function resetToNeutral() {
    if (W.disabled || drag.dragging()) return;
    if (W.cancelTween) { W.cancelTween(); W.cancelTween = null; }
    W.settling = true;
    const from = W.angle;
    W.cancelTween = tween((v) => { W.angle = v; render(); }, from, 150, 260, () => {
      W.settling = false; W.cancelTween = null; W.angle = 150; W.targetIndex = null; render();
    });
  };
  W.busy = () => W.settling || drag.dragging();
  W.destroy = function destroy() {
    W.alive = false;
    if (W.cancelTween) W.cancelTween();
    drag.destroy();
    wrap.remove();
  };

  W.layout();
  return W;
}

/* ---------- the anim card ---------- */
export default {
  id: 'pie-charts',
  title: 'PIE-FACE’S SLICE SPLITTER',

  mount(host, ctx) {
    let alive = true;
    let wheel = null;
    let mi = 0; // current mission index; MISSIONS.length === free play
    let gen = 0; // bumped on every start() so stale later() bubbles can't fire over a switched-away mission
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('pie-charts', `
      :root { --psl-chosen: var(--gold); --psl-rest: var(--swamp-mid); }
      .psl-total { text-align: center; font-weight: 700; font-size: 14px; color: var(--stink); margin-bottom: 6px; }
      .psl-total b { font-size: 17px; }
      .psl-wrap-row { display: flex; align-items: center; justify-content: center; gap: 22px; flex-wrap: wrap; }
      .psl-wheelwrap {
        position: relative; border-radius: 50%; margin: 6px auto; touch-action: none;
        border: 4px solid var(--ink); box-shadow: 0 5px 0 rgba(51,38,29,.3), inset 0 0 0 3px rgba(255,255,255,.5);
        -webkit-user-select: none; user-select: none;
      }
      .psl-wheelwrap.psl-disabled { opacity: .45; }
      .psl-spoke {
        position: absolute; height: 4px; background: var(--ink); border-radius: 3px;
        transform-origin: 0 50%; z-index: 3; pointer-events: none;
      }
      .psl-handle {
        position: absolute; width: 34px; height: 34px; transform: translate(-50%, -50%);
        display: flex; align-items: center; justify-content: center; font-size: 17px;
        background: var(--card); border: 3px solid var(--gold-deep); border-radius: 50%;
        box-shadow: 0 3px 0 rgba(0,0,0,.3); z-index: 4; pointer-events: none;
      }
      .psl-wheelwrap.dragging .psl-handle { box-shadow: 0 1px 0 rgba(0,0,0,.3); }
      .psl-hit { position: absolute; inset: -14px; z-index: 5; cursor: grab; border-radius: 50%; }
      .psl-wheelwrap.dragging .psl-hit { cursor: grabbing; }
      .psl-dash { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
      .psl-count {
        border-radius: 12px; padding: 8px 16px; text-align: center; min-width: 92px;
        font-weight: 700; box-shadow: 0 3px 0 rgba(0,0,0,.25);
      }
      .psl-count .cl { font-size: 10px; letter-spacing: .12em; opacity: .85; }
      .psl-count .cn { font-size: clamp(19px, 2.6vw, 24px); }
      .psl-count.chosen { background: var(--gold); color: #5a4408; }
      .psl-count.rest { background: var(--swamp-mid); color: var(--parchment); }
      .psl-printed { text-align: center; }
      .psl-printed-pie {
        width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 6px;
        border: 3px solid var(--ink); box-shadow: 0 4px 0 rgba(0,0,0,.25);
        background: conic-gradient(var(--stink) 0deg 90deg, #cbb995 90deg 360deg);
      }
      .psl-printed .pl { font-size: 12.5px; font-weight: 700; color: var(--ink); }
      .psl-printed .pl b { color: var(--stink); }
      .psl-predictrow { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 4px 0 8px; }
      .psl-predict {
        background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink);
        border-radius: 999px; padding: 10px 18px; font-weight: 700; font-size: 15px;
        min-height: 44px; cursor: pointer; box-shadow: 0 3px 0 rgba(0,0,0,.2);
      }
      .psl-predict.chosen { background: var(--swamp-mid); color: var(--stink-lime); }
      .psl-predict[disabled] { opacity: .55; pointer-events: none; }
      .psl-win {
        margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
        border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
        animation: animBubbleIn .34s var(--spring) both;
      }
      .psl-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
      .psl-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'som-q');
    const qsub = el('div', 'som-qsub');
    const totalBanner = el('div', 'psl-total');
    const predictRow = el('div', 'psl-predictrow');
    const wrapRow = el('div', 'psl-wrap-row');
    const wheelHost = el('div');
    const printedBox = el('div', 'psl-printed', '<div class="psl-printed-pie"></div><div class="pl">🐱 Cat — <b>a quarter</b> of the pie</div>');
    wrapRow.append(wheelHost);
    const dash = el('div', 'psl-dash');
    const chosenBox = el('div', 'psl-count chosen', '<div class="cl">CHOSEN</div><div class="cn">0</div>');
    const restBox = el('div', 'psl-count rest', '<div class="cl">REST</div><div class="cn">0</div>');
    dash.append(chosenBox, restBox);
    const winBox = el('div');
    const controls = el('div', 'anim-controls som-lockrow');
    const nl = el('button', 'anim-nudge', '⬅');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 🍰');
    const nr = el('button', 'anim-nudge', '➡');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, lock, nr, reset);
    stage.append(chiprow, q, qsub, totalBanner, predictRow, wrapRow, dash, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mission = null;
    let attempts = 0;
    let predicted = null; // 'right' | 'wrong' — which chip the child tapped, for mission d

    function setCounts(angle, total) {
      const { chosen, rest } = computeCounts(total, angle);
      chosenBox.querySelector('.cn').textContent = String(chosen);
      restBox.querySelector('.cn').textContent = String(rest);
    }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const label = m.trap ? '50% trap' : m.printed ? 'match the pie' : `cut a ${m.angle === 180 ? 'half' : 'quarter'}`;
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🎮');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function start(i) {
      mi = i;
      gen += 1;
      attempts = 0;
      predicted = null;
      winBox.innerHTML = '';
      predictRow.innerHTML = '';
      printedBox.remove();
      if (wheel) { wheel.destroy(); wheel = null; }
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      lock.style.display = sandbox ? 'none' : '';

      if (sandbox) {
        q.innerHTML = 'Free play — pick a poll size, then cut any slice you like:';
        qsub.textContent = '';
        const picker = el('div', 'anim-chiprow');
        FREE_TOTALS.forEach((t, k) => {
          const c = el('button', 'anim-mchip' + (k === 0 ? ' active' : ''), `${t} pupils`);
          c.addEventListener('click', () => {
            picker.querySelectorAll('.anim-mchip').forEach((x) => x.classList.remove('active'));
            c.classList.add('active'); sfx.ui();
            wheel.setTotal(t);
            totalBanner.innerHTML = `🥧 <b>${t}</b> pupils asked`;
            setCounts(wheel.angle, t);
          });
          picker.append(c);
        });
        predictRow.append(picker);
        totalBanner.innerHTML = `🥧 <b>${FREE_TOTALS[0]}</b> pupils asked`;
        buildWheel(FREE_TOTALS[0], false);
        return;
      }

      q.innerHTML = mission.q;
      qsub.textContent = mission.qsub;
      totalBanner.innerHTML = `🥧 <b>${mission.total}</b> pupils asked`;

      if (mission.printed) {
        wrapRow.prepend(printedBox);
      }

      if (mission.trap) {
        const opts = shuffle([
          { text: '50 pupils', right: false },
          { text: '18 pupils', right: true },
        ]);
        opts.forEach((o) => {
          const b = el('button', 'psl-predict', o.text);
          b.addEventListener('click', () => {
            if (predicted !== null) return;
            predicted = o.right ? 'right' : 'wrong';
            sfx.ui();
            predictRow.querySelectorAll('.psl-predict').forEach((x) => { x.disabled = true; });
            b.classList.add('chosen');
            wheel.setDisabled(false);
            lock.disabled = false;
            qsub.textContent = 'Now cut the pie to exactly HALF to prove it.';
          });
          predictRow.append(b);
        });
      }

      buildWheel(mission.total, !!mission.trap);
    }

    function buildWheel(total, startDisabled) {
      if (wheel) { wheel.destroy(); wheel = null; }
      wheel = makeWheel(wheelHost, {
        total,
        onChange: (angle, t) => setCounts(angle, t),
        onZone: (idx) => { if (!alive) return; sfx.blip(560 + idx * 70, 0.05, 0.09); },
        onSettle: () => {},
      });
      wheel.setDisabled(!!startDisabled);
      lock.disabled = !!startDisabled;
      setCounts(wheel.angle, total);
    }

    nl.addEventListener('click', () => wheel && wheel.nudge(-1));
    nr.addEventListener('click', () => wheel && wheel.nudge(1));
    reset.addEventListener('click', () => { sfx.ui(); if (wheel) wheel.resetToNeutral(); });

    lock.addEventListener('click', () => {
      if (!wheel || wheel.busy() || !mission) return;
      if (mission.trap && predicted === null) { sfx.nudge(); toast(stage, '🍰 Tap a prediction first — then prove it!'); return; }
      sfx.ui();
      const angle = wheel.angle;
      if (isAtTarget(angle, mission.angle)) { win(angle); return; }
      attempts += 1;
      sfx.nudge();
      let text;
      if (mission.printed) {
        text = angle > mission.angle
          ? 'That slice is a bit BIGGER than Pie-Face’s printed Cat slice — nudge it back down.'
          : 'That slice is a bit SMALLER than Pie-Face’s printed Cat slice — give it a touch more room.';
      } else {
        text = angle > mission.angle
          ? 'That slice is a bit too BIG for this one — shrink it back towards Pie-Face’s crust.'
          : 'That slice is a bit too SMALL for this one — stretch it round a little further.';
      }
      if (attempts >= 2) {
        const f = FRACTIONS.find((x) => x.angle === mission.angle);
        text += `<br><br>🥧 Psst: we need exactly a <b>${f.name.toUpperCase()}</b> slice this time.`;
      }
      bubble(stage, { title: 'SLICE AGAIN! 🔪', text, img: PIEFACE_IMG });
    });

    function win(angle) {
      const myGen = gen; // snapshot so a mission switch during the delayed bubbles below can't fire them over the wrong screen
      const predictedAtWin = predicted;
      doneSet.add(mission.id);
      if (wheel) wheel.setDisabled(true);
      lock.disabled = true;
      sfx.win();
      party(stage);
      const stageRect = stage.getBoundingClientRect();
      const whRect = wheelHost.getBoundingClientRect();
      sparkleBurst(stage, whRect.left - stageRect.left + whRect.width / 2, whRect.top - stageRect.top + whRect.height / 2, 14);
      paintChips();
      winBox.innerHTML = '';
      const { chosen } = computeCounts(mission.total, angle);
      const w = el('div', 'psl-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; <b>${chosen}</b> pupils</div>`
        + `<div class="wk">${mission.worked}</div>`);
      winBox.append(w);

      if (mission.trap) {
        later(() => {
          if (!alive || gen !== myGen) return;
          bubble(stage, {
            title: predictedAtWin === 'right' ? 'YOU CALLED IT! 🎯' : 'NOW YOU’VE SEEN IT! 👀',
            text: predictedAtWin === 'right'
              ? 'Spot on — 50% OF 36 is <b>18</b>, never 50. The pie is only ever the <b>36 pupils Pie-Face actually asked</b>, wearing a circle costume.'
              : 'The pie proves it: 50% OF 36 is <b>18</b>, not 50. The pie is only ever the <b>36 pupils Pie-Face actually asked</b> — never assume the percentage is out of 100 people.',
            img: PIEFACE_IMG,
          });
        }, 500);
      }

      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        later(() => {
          if (!alive || gen !== myGen) return;
          bubble(stage, {
            title: 'THE WHOLE PIE! 🥧',
            text: 'Every pie is the TOTAL ASKED wearing a circle costume. A slice’s fraction is always a fraction of THAT total — never 100, never a guess.',
            img: PIEFACE_IMG,
          });
        }, 700);
      }
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold', 'FREE PLAY 🎮');
        fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
        w.append(fp);
      }
    }

    const onResize = () => { if (wheel) wheel.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (wheel) wheel.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
