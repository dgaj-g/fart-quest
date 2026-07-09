// FART QUEST — js/anims/clocks-time.js
// THE MINUTE MUNCHER'S CLOCK — interactive draggable analogue clock for the
// clocks-time Scout Report. Minute hand rotates freely (rotary drag); the
// hour hand follows with true gearing (1/12 speed). The rim shows the
// secret 5-times-table; a live chip narrates PAST/TO, flipping exactly at
// the half-hour. Missions: set-the-time x2, the 24-hour lever, duration.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const MUNCHER_IMG = 'assets/monsters/the-minute-muncher.png';
const RULE = 'Past or to? Minute hand left half = TO, right half = PAST. For 24-hour: afternoon = add 12.';
const EXAMPLE = '25 past 3 in the afternoon: the minute hand is on the right half — that’s PAST — so it’s 3:25. It’s the afternoon, so the 24-hour clock adds 12: 15:25.';
const FACT_SNEAK = 'The minute hand’s numbers are a secret 5-times-table — the 7 doesn’t mean 7 minutes, it means 35.';

/* ---------- pure clock-face maths (proven in /tmp/mmc_test.js — 40 green) ---------- */
function mod(n, m) { return ((n % m) + m) % m; }
function describeTime(absMin) {
  const m = mod(absMin, 720);
  const h0 = Math.floor(m / 60);
  const hour12 = h0 === 0 ? 12 : h0;
  let minuteOfHour = Math.round(m - h0 * 60);
  if (minuteOfHour === 60) minuteOfHour = 0;
  let phrase; let mode;
  if (minuteOfHour === 0) { phrase = `${hour12} o'clock`; mode = 'oclock'; }
  else if (minuteOfHour === 30) { phrase = `half past ${hour12}`; mode = 'half'; }
  else if (minuteOfHour < 30) { phrase = `${minuteOfHour} past ${hour12}`; mode = 'past'; }
  else { const to = 60 - minuteOfHour; const nextHour = (h0 % 12) + 1; phrase = `${to} to ${nextHour}`; mode = 'to'; }
  return { hour12, minuteOfHour, phrase, mode };
}
const minuteAngle = (absMin) => mod(absMin, 60) * 6;
const hourAngle = (absMin) => mod(absMin, 720) * 0.5;
const rimIndex = (absMin) => Math.round(minuteAngle(absMin) / 30) % 12;
const rimValue = (i) => (i === 0 ? 60 : i * 5);
function to24(hour12, mm, isPM) {
  let h = hour12 % 12;
  if (isPM) h += 12;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
const MODE_TAG = { oclock: 'O’CLOCK', half: 'HALF PAST', past: 'PAST', to: 'TO' };

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', kind: 'set', startAbs: 3 * 60, targetAbs: 3 * 60 + 25, label: '25 past 3',
    prompt: 'Set 25 past 3', qsub: 'Drag anywhere on the dial to spin the minute hand.',
    worked: '25 past 3 → the minute hand sits on the 5, and 5 × 5 = 25 → 3:25.' },
  { id: 'b', kind: 'set', startAbs: 6 * 60, targetAbs: 6 * 60 + 40, label: '20 to 7',
    prompt: 'Set 20 to 7', qsub: 'Keep spinning past half past 6 — watch PAST flip to TO.',
    worked: '6:40 → the minute hand is on the LEFT half, chasing 7 → that’s 20 TO 7.' },
  { id: 'c', kind: 'ampm', fixedAbs: 3 * 60 + 25, label: '24-hour lever',
    prompt: 'This quest happened in the AFTERNOON — pull the right lever',
    qsub: 'The clock is locked on 3:25. Choose the matching face.',
    worked: EXAMPLE },
  { id: 'd', kind: 'duration', startAbs: 3 * 60 + 25, targetAbs: 4 * 60 + 10, checkpointAbs: 4 * 60,
    label: '3:25 → 4:10',
    prompt: 'How long from 3:25 to 4:10?', qsub: 'Drag the minute hand forward and watch the count add up.',
    worked: '3:25 to 4:00 is 35 minutes, then 4:00 to 4:10 is +10 more → 45 minutes altogether.' },
];
const FREEPLAY_TIMES = [
  { label: '3:00', abs: 3 * 60 }, { label: '6:40', abs: 6 * 60 + 40 },
  { label: '9:15', abs: 9 * 60 + 15 }, { label: '12:00', abs: 0 }, { label: '7:50', abs: 7 * 60 + 50 },
];
const WIN_PHRASES = ['TICK-TASTIC! ⏰', 'THE MUNCHER IS STUMPED!', 'NOT A MINUTE LOST!', 'TIME NAILED! 🏆'];

/* Fisher-Yates — used for the AM/PM lever order so the answer position never telegraphs */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* ---------- the clock widget ---------- */
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
  return e;
}

function makeClock(host, opts) {
  const C = {
    absMin: opts.startAbs, dragging: false, lastAngle: 0, cancelTween: null, settling: false,
    targetAbsMin: opts.startAbs, disabled: false, alive: true, firstDragDone: false,
  };
  const wrap = el('div', 'mmc-wrap');
  const svg = svgEl('svg', { viewBox: '0 0 300 300', class: 'mmc-face' });
  svg.appendChild(svgEl('circle', { cx: 150, cy: 150, r: 132, class: 'mmc-facebg' }));
  const rimGroup = svgEl('g', {}); const numGroup = svgEl('g', {});
  const rimEls = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = i * 30; const rad = (angle * Math.PI) / 180;
    const nx = 150 + 96 * Math.sin(rad); const ny = 150 - 96 * Math.cos(rad);
    const t = svgEl('text', { x: nx, y: ny + 5, class: 'mmc-num', 'text-anchor': 'middle' });
    t.textContent = i === 0 ? '12' : String(i);
    numGroup.appendChild(t);
    const rx = 150 + 121 * Math.sin(rad); const ry = 150 - 121 * Math.cos(rad);
    const rt = svgEl('text', { x: rx, y: ry + 4, class: 'mmc-rim', 'text-anchor': 'middle' });
    rt.textContent = String(rimValue(i)).padStart(2, '0');
    rimGroup.appendChild(rt); rimEls.push(rt);
  }
  svg.append(rimGroup, numGroup);
  const hourHand = svgEl('line', { x1: 150, y1: 150, x2: 150, y2: 150, class: 'mmc-hourhand' });
  const minHand = svgEl('line', { x1: 150, y1: 150, x2: 150, y2: 150, class: 'mmc-minhand' });
  const pin = svgEl('circle', { cx: 150, cy: 150, r: 8, class: 'mmc-pin' });
  const hit = svgEl('circle', { cx: 150, cy: 150, r: 142, class: 'mmc-hit' });
  svg.append(hourHand, minHand, pin, hit);
  wrap.appendChild(svg);
  host.appendChild(wrap);

  function setHand(handEl, len, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    handEl.setAttribute('x2', String(150 + len * Math.sin(rad)));
    handEl.setAttribute('y2', String(150 - len * Math.cos(rad)));
  }
  function render() {
    setHand(minHand, 92, minuteAngle(C.absMin));
    setHand(hourHand, 55, hourAngle(C.absMin));
    const idx = rimIndex(C.absMin);
    rimEls.forEach((e2, i) => e2.classList.toggle('lit', i === idx));
    if (opts.onRender) opts.onRender(describeTime(C.absMin), C.absMin);
  }
  function angleFromEvent(e) {
    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
    let a = (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
    if (a < 0) a += 360;
    return a;
  }

  const drag = makeDrag(hit, {
    enabled: () => !C.disabled,
    onStart(e) {
      if (C.cancelTween) { C.cancelTween(); C.cancelTween = null; C.settling = false; }
      C.dragging = true;
      C.lastAngle = angleFromEvent(e);
      wrap.classList.add('dragging');
      if (opts.onFirstDrag && !C.firstDragDone) { C.firstDragDone = true; opts.onFirstDrag(); }
    },
    onMove(dx, dy, e) {
      const a = angleFromEvent(e);
      let d = a - C.lastAngle;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      C.lastAngle = a;
      const prevInt = Math.round(C.absMin);
      C.absMin += d / 6;
      render();
      const newInt = Math.round(C.absMin);
      if (newInt !== prevInt) {
        const step = newInt > prevInt ? 1 : -1;
        const n = Math.min(Math.abs(newInt - prevInt), 4);
        for (let k = 0; k < n; k += 1) { if (step > 0) sfx.tick(0); else sfx.tock(0); }
      }
      if (opts.onDragMove) opts.onDragMove(C.absMin, prevInt);
    },
    onEnd() {
      C.dragging = false;
      wrap.classList.remove('dragging');
      C.settleAt(Math.round(C.absMin));
    },
  });

  C.settleAt = function settleAt(target) {
    C.targetAbsMin = target;
    if (C.cancelTween) C.cancelTween();
    C.settling = true;
    C.cancelTween = tween((v) => { C.absMin = v; render(); }, C.absMin, target, 320, () => {
      C.settling = false; C.cancelTween = null; C.absMin = target; render();
      sfx.settle();
      if (opts.onSettle) opts.onSettle(target);
    });
  };
  C.setAbs = function setAbs(target) {
    drag.abort(); C.dragging = false; wrap.classList.remove('dragging');
    if (C.cancelTween) { C.cancelTween(); C.cancelTween = null; }
    C.settling = false;
    C.absMin = target; C.targetAbsMin = target; render();
  };
  C.nudge = function nudge(dir) {
    if (C.disabled || C.dragging) return;
    const base = C.settling ? C.targetAbsMin : Math.round(C.absMin);
    C.settleAt(base + dir);
  };
  C.busy = () => C.settling || C.dragging;
  C.abortLive = function abortLive() {
    if (C.dragging) { drag.abort(); C.dragging = false; wrap.classList.remove('dragging'); }
    if (C.cancelTween) { C.cancelTween(); C.cancelTween = null; C.settling = false; }
  };
  C.destroy = function destroy() { C.alive = false; if (C.cancelTween) C.cancelTween(); drag.destroy(); wrap.remove(); };

  render();
  return C;
}

/* ---------- the anim card ---------- */
export default {
  id: 'clocks-time',
  title: 'THE MINUTE MUNCHER’S CLOCK',

  mount(host, ctx) {
    let alive = true;
    let clock = null;
    let mi = 0;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'mmc-q');
    const qsub = el('div', 'mmc-qsub');
    const clockHost = el('div');
    const chip = el('div', 'mmc-chip');
    const extra = el('div');
    const winBox = el('div');
    stage.append(chiprow, q, qsub, clockHost, chip, extra, winBox);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mission = null;
    let attempts = 0;
    let shownPops = new Set();
    let checkpointShown = false;
    let ampmCommitted = false;

    function updateChip(desc) {
      const digital = `${desc.hour12}:${String(desc.minuteOfHour).padStart(2, '0')}`;
      chip.innerHTML = `<span class="mmc-digital">${digital}</span><span class="mmc-tag ${desc.mode}">${MODE_TAG[desc.mode]}</span><span class="mmc-phrase">${desc.phrase}</span>`;
    }

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🎮');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function buildExtra() {
      extra.innerHTML = '';
      if (!mission) {
        const picker = el('div', 'anim-chiprow');
        FREEPLAY_TIMES.forEach((t, k) => {
          const c = el('button', 'anim-mchip' + (k === 0 ? ' active' : ''), t.label);
          c.addEventListener('click', () => {
            picker.querySelectorAll('.anim-mchip').forEach((x) => x.classList.remove('active'));
            c.classList.add('active'); sfx.ui(); clock.setAbs(t.abs);
          });
          picker.append(c);
        });
        extra.append(picker);
        return;
      }
      if (mission.kind === 'set' || mission.kind === 'duration') {
        const controls = el('div', 'anim-controls');
        const nl = el('button', 'anim-nudge', '⬅');
        const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💚');
        const nr = el('button', 'anim-nudge', '➡');
        const reset = el('button', 'anim-ghostbtn', '↩ RESET');
        controls.append(nl, lock, nr, reset);
        extra.append(controls);
        if (mission.kind === 'duration') {
          const elapsedChip = el('div', 'mmc-elapsed');
          extra.append(elapsedChip);
          updateElapsed(clock.absMin);
        }
        nl.addEventListener('click', () => clock.nudge(-1));
        nr.addEventListener('click', () => clock.nudge(1));
        reset.addEventListener('click', () => {
          sfx.ui(); checkpointShown = false; clock.abortLive(); clock.settleAt(mission.startAbs);
        });
        lock.addEventListener('click', onLock);
      } else if (mission.kind === 'ampm') {
        const row = el('div', 'mmc-leverrow');
        const opts2 = shuffle([
          { pm: false, label: '☀️ MORNING FACE' },
          { pm: true, label: '🌙 AFTERNOON FACE' },
        ]);
        opts2.forEach((o) => {
          const b = el('button', 'btn btn-gold mmc-leverbtn', o.label);
          b.addEventListener('click', () => onAmPm(o.pm));
          row.append(b);
        });
        const digital = el('div', 'mmc-digital24', '<span class="mmc-d24num">--:--</span>');
        extra.append(row, digital);
      }
    }

    function updateElapsed(absMin) {
      const chipEl = extra.querySelector('.mmc-elapsed');
      if (!chipEl || !mission || mission.kind !== 'duration') return;
      const elapsed = Math.round(absMin) - mission.startAbs;
      if (elapsed <= 0) chipEl.innerHTML = 'not even started yet — <b>3:25</b> is the starting whistle';
      else chipEl.innerHTML = `<b>${elapsed}</b> minute${elapsed === 1 ? '' : 's'} counted on so far`;
    }

    function onDragMove(absMin, prevIntBefore) {
      if (!alive) return;
      updateElapsed(absMin);
      if (mission && mission.kind === 'duration' && !checkpointShown) {
        if (prevIntBefore < mission.checkpointAbs && Math.round(absMin) >= mission.checkpointAbs) {
          checkpointShown = true;
          const leg1 = mission.checkpointAbs - mission.startAbs;
          toast(stage, `⏰ 4 o’clock! That’s ${leg1} minutes gone since 3:25 — keep counting on.`);
        }
      }
    }

    function onLock() {
      if (!clock || clock.busy() || !mission) return;
      sfx.ui();
      const cur = Math.round(clock.absMin);
      if (mod(cur - mission.targetAbs, 720) === 0) { win(); return; }
      attempts += 1;
      sfx.nudge();
      const d = describeTime(cur);
      const diffFwd = mod(mission.targetAbs - cur, 720);
      const diffBack = 720 - diffFwd;
      let text;
      if (Math.min(diffFwd, diffBack) > 180) text = `Nowhere near yet — right now the hand shows <b>${d.phrase}</b>. Spin further round the dial.`;
      else if (diffFwd <= diffBack) text = `Getting closer — right now it’s <b>${d.phrase}</b>. Spin the minute hand a little further FORWARD.`;
      else text = `A bit too far — right now it’s <b>${d.phrase}</b>. Ease the minute hand back a touch.`;
      if (attempts >= 2) {
        const tPhrase = describeTime(mission.targetAbs).phrase;
        text += `<br><br>🧊 Psst: you’re aiming for exactly <b>${tPhrase}</b>.`;
      }
      bubble(stage, { title: 'KEEP SPINNING! 💪', text, img: MUNCHER_IMG });
    }

    function onAmPm(isPM) {
      if (!mission || mission.kind !== 'ampm') return;
      sfx.ui();
      if (!isPM) {
        toast(stage, '☀️ That’s the morning face — but this quest happened in the afternoon! Try the other lever.');
        return;
      }
      if (ampmCommitted) return;
      ampmCommitted = true;
      const d = describeTime(mission.fixedAbs);
      const stamp = to24(d.hour12, d.minuteOfHour, true);
      const digital = extra.querySelector('.mmc-digital24');
      digital.innerHTML = `<span class="mmc-d24num">${stamp}</span><span class="mmc-stamp">+12</span>`;
      sfx.sparkle();
      const r = digital.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2);
      later(() => { if (alive) win(); }, 550);
    }

    function start(i) {
      mi = i; attempts = 0; checkpointShown = false; ampmCommitted = false; shownPops = new Set();
      winBox.innerHTML = '';
      if (clock) { clock.destroy(); clock = null; }
      paintChips();
      mission = i === MISSIONS.length ? null : MISSIONS[i];
      if (!mission) {
        q.textContent = 'Free play — spin the hand or pick a time:';
        qsub.textContent = 'Watch the rim light up — that’s the secret 5-times-table.';
      } else {
        q.textContent = mission.prompt;
        qsub.textContent = mission.qsub;
      }
      const startAbs = mission ? (mission.fixedAbs != null ? mission.fixedAbs : mission.startAbs) : FREEPLAY_TIMES[0].abs;
      clock = makeClock(clockHost, {
        startAbs,
        onRender: updateChip,
        onDragMove,
        onFirstDrag() {
          if (!alive) return;
          if (!shownPops.has('rim')) { shownPops.add('rim'); toast(stage, '👀 watch the gold rim — that’s the 5-times-table lighting up!'); }
        },
      });
      clock.disabled = !!(mission && mission.kind === 'ampm');
      buildExtra();
    }

    function win() {
      doneSet.add(mission.id);
      sfx.win(); party(stage); paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'mmc-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${mission.label}</div>`
        + `<div class="wk">${mission.worked}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) ctx.complete();
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
        ctx.complete();
      }
    }

    later(() => { if (alive) bubble(stage, { title: 'THE MINUTE MUNCHER 🐹⏰', text: FACT_SNEAK, img: MUNCHER_IMG }); }, 300);

    const onResize = () => { if (clock) clock.abortLive(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (clock) clock.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};

injectCss('clocks-time', `
.mmc-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3.2vw, 26px); margin-bottom: 2px; }
.mmc-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; }
.mmc-wrap { display: flex; justify-content: center; margin: 4px auto 10px; touch-action: none; max-width: 300px; margin-left: auto; margin-right: auto; }
.mmc-face { width: 100%; height: auto; display: block; touch-action: none; }
.mmc-facebg { fill: var(--card); stroke: var(--ink); stroke-width: 6; filter: drop-shadow(0 4px 0 rgba(0,0,0,.25)); }
.mmc-num { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 17px; fill: var(--ink); }
.mmc-rim { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 11px; fill: #b9ab97; font-style: italic; transition: fill .15s, font-size .15s; }
.mmc-rim.lit { fill: var(--gold-deep); font-size: 14px; }
.mmc-hourhand { stroke: var(--ink); stroke-width: 7; stroke-linecap: round; }
.mmc-minhand { stroke: var(--stink); stroke-width: 4.5; stroke-linecap: round; }
.mmc-pin { fill: var(--ink); }
.mmc-hit { fill: transparent; cursor: grab; }
.mmc-wrap.dragging .mmc-hit { cursor: grabbing; }
.mmc-chip {
  display: flex; align-items: center; justify-content: center; gap: 9px; flex-wrap: wrap;
  background: var(--swamp-mid); border-radius: 14px; padding: 10px 16px; margin: 4px auto 0;
  box-shadow: 0 3px 0 rgba(0,0,0,.3); max-width: 460px;
}
.mmc-digital {
  font-family: 'SF Mono', Menlo, Consolas, monospace; font-weight: 700; font-size: 19px;
  color: var(--stink-lime); background: #241d15; border-radius: 8px; padding: 4px 10px;
}
.mmc-tag { font-size: 11px; font-weight: 700; letter-spacing: .06em; padding: 4px 9px; border-radius: 999px; color: #241d15; }
.mmc-tag.past { background: #F4C542; }
.mmc-tag.to { background: #9BD6E8; }
.mmc-tag.half { background: #C9A6E8; }
.mmc-tag.oclock { background: #C7F464; }
.mmc-phrase { color: var(--parchment); font-weight: 700; font-size: 14px; }
.mmc-elapsed {
  margin-top: 10px; text-align: center; background: var(--swamp-mid); color: var(--parchment);
  border-radius: 12px; padding: 8px 14px; font-weight: 700; font-size: 14px; box-shadow: 0 3px 0 rgba(0,0,0,.3);
}
.mmc-elapsed b { color: var(--stink-lime); }
.mmc-leverrow { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 10px; }
.mmc-leverbtn { font-size: 14px; padding: 12px 18px; }
.mmc-digital24 {
  margin: 12px auto 0; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #241d15; border: 3px solid #4a3b28; border-radius: 12px; padding: 10px 18px;
  max-width: 220px; box-shadow: inset 0 3px 10px rgba(0,0,0,.6); position: relative;
}
.mmc-d24num { font-family: 'SF Mono', Menlo, Consolas, monospace; font-weight: 700; font-size: 26px; color: var(--stink-lime); letter-spacing: .05em; }
.mmc-stamp {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 15px; color: var(--gold);
  border: 2.5px solid var(--gold); border-radius: 8px; padding: 1px 6px; transform: rotate(-12deg);
  animation: mmcStampIn .4s var(--spring) both;
}
@keyframes mmcStampIn { 0% { transform: rotate(-12deg) scale(2.4); opacity: 0; } 60% { transform: rotate(-12deg) scale(.9); opacity: 1; } 100% { transform: rotate(-12deg) scale(1); } }
.mmc-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.mmc-win .wp { font-weight: 700; color: #1d8f4e; font-size: 16px; }
.mmc-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
`);
