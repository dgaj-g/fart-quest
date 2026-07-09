// FART QUEST — js/anims/clocks-time.js
// THE MINUTE MUNCHER'S CLOCK — interactive analogue clock for the
// clocks-time Scout Report. A draggable minute hand with true 1/12-speed
// hour-hand gearing, a live PAST/TO chip that flips at the half-hour, a
// secret 5-times-table rim, a 24-hour lever, and a duration counter.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const MUNCHER_IMG = 'assets/monsters/the-minute-muncher.png';
const RULE = 'Past or to? Minute hand left half = TO, right half = PAST. For 24-hour: afternoon = add 12.';

/* ---------- pure clock-face engine (independently unit-tested — do not "improve") ---------- */
function hIdx(h) { return h % 12; } // 12 o'clock -> index 0
function absMin(h, m) { return hIdx(h) * 60 + m; }
function normMin(x) { return ((x % 720) + 720) % 720; }
function stateFromAbs(x) {
  const n = normMin(Math.round(x));
  const hi = Math.floor(n / 60);
  const m = n % 60;
  const h = hi === 0 ? 12 : hi;
  return { h, m, abs: n };
}
function chipFor(h, m) {
  const nh = h === 12 ? 1 : h + 1;
  if (m === 0) return { text: `${h} o'clock`, mode: 'oclock' };
  if (m === 30) return { text: `half past ${h}`, mode: 'half' };
  if (m < 30) return { text: `${m} past ${h}`, mode: 'past' };
  return { text: `${60 - m} to ${nh}`, mode: 'to' };
}
function handDegs(absFloat) {
  const n = ((absFloat % 720) + 720) % 720;
  const minuteDeg = ((n % 60) + 60) % 60 * 6;
  const hourDeg = (n * 0.5) % 360;
  return { minuteDeg, hourDeg };
}
function to24(h, m, pm) {
  const h24 = pm ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function durationSegments(startAbs, currentAbs) {
  const elapsed = Math.max(0, currentAbs - startAbs);
  const toHour = 60 - (startAbs % 60);
  const part1 = Math.min(elapsed, toHour);
  const part2 = Math.max(0, elapsed - toHour);
  return { elapsed, toHour, part1, part2 };
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', kind: 'time', label: '25 past 3', start: { h: 3, m: 0 }, target: { h: 3, m: 25 },
    prompt: 'Set 25 past 3.', worked: 'The minute hand sits on the RIGHT half of the face — that’s PAST — 3:25.' },
  { id: 'b', kind: 'time', label: '20 to 7', start: { h: 6, m: 0 }, target: { h: 6, m: 40 }, flipPop: true,
    prompt: 'Set 20 to 7.', worked: 'The minute hand crossed onto the LEFT half — PAST flips to TO — 6:40, which is 20 minutes before 7.' },
  { id: 'c', kind: 'ampm', start: { h: 3, m: 25 }, target: { pm: true },
    prompt: 'Pull the afternoon lever for 3:25.', worked: '3:25 in the afternoon — the Two-Face Watch adds 12 to the hour — 15:25.' },
  { id: 'd', kind: 'time', durationUI: true, start: { h: 3, m: 25 }, target: { h: 4, m: 10 },
    prompt: 'How long from 3:25 to 4:10? Drag the hand on and watch the count.',
    worked: '3:25 to 4:00 is 35 minutes. 4:00 to 4:10 is another 10 minutes. 35 + 10 = 45 minutes.' },
];
const WIN_PHRASES = ['TICK-TASTIC! ⏰', 'NOT A MINUTE MISSING!', 'THE MUNCHER GOES HUNGRY!', 'PERFECTLY ON TIME!'];

/* ---------- the clock widget ---------- */
function makeClock(host, opts) {
  const C = {
    abs: absMin(opts.start.h, opts.start.m), pending: 0, settling: false, cancelTween: null,
    disabled: !!opts.disabled, alive: true, lastMode: null, size: 0, rect: null, lastAngle: 0,
  };
  C.pending = C.abs;
  const wrap = el('div', 'mmc-clockwrap');
  const face = el('div', 'mmc-face');
  const nums = el('div', 'mmc-nums');
  const rim = el('div', 'mmc-rim');
  const hourHand = el('div', 'mmc-hour');
  const minHand = el('div', 'mmc-min');
  const pivot = el('div', 'mmc-pivot');
  const hit = el('div', 'mmc-hit');
  face.append(nums, rim, hourHand, minHand, pivot, hit);
  wrap.append(face);
  host.append(wrap);
  const rimEls = [];

  C.layout = function layout() {
    if (C.cancelTween) { C.cancelTween(); C.cancelTween = null; }
    drag.abort();
    wrap.classList.remove('dragging');
    const avail = Math.min(host.clientWidth || 300, 340);
    C.size = Math.max(190, Math.min(280, avail));
    face.style.width = C.size + 'px';
    face.style.height = C.size + 'px';
    nums.innerHTML = ''; rim.innerHTML = ''; rimEls.length = 0;
    const cx = C.size / 2; const cy = C.size / 2;
    const rNum = C.size * 0.31; const rRim = C.size * 0.435;
    for (let k = 1; k <= 12; k += 1) {
      const rad = (k % 12) * 30 * Math.PI / 180;
      const x = cx + rNum * Math.sin(rad); const y = cy - rNum * Math.cos(rad);
      const n = el('div', 'mmc-num', String(k));
      n.style.left = x + 'px'; n.style.top = y + 'px';
      nums.append(n);
      const rx = cx + rRim * Math.sin(rad); const ry = cy - rRim * Math.cos(rad);
      const val = k * 5;
      const r = el('div', 'mmc-rimnum', String(val).padStart(2, '0'));
      r.style.left = rx + 'px'; r.style.top = ry + 'px';
      rim.append(r);
      rimEls[k % 12] = r; // index 0..11, index 0 == the "60" at top
    }
    hourHand.style.height = (C.size * 0.23) + 'px';
    minHand.style.height = (C.size * 0.37) + 'px';
    hit.style.pointerEvents = C.disabled ? 'none' : 'auto';
    C.render(C.abs, true);
  };

  C.render = function render(absFloat, instant) {
    const { minuteDeg, hourDeg } = handDegs(absFloat);
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    minHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    const litIdx = Math.round((((absFloat % 60) + 60) % 60) / 5) % 12;
    rimEls.forEach((r, i) => { if (r) r.classList.toggle('lit', i === litIdx); });
    const s = stateFromAbs(absFloat);
    const chip = chipFor(s.h, s.m);
    if (opts.onRender) opts.onRender(s, chip, instant);
    return { s, chip };
  };

  const clampDeadzone = C.size ? C.size * 0.12 : 25;
  function angleAt(clientX, clientY) {
    const cx = C.rect.left + C.rect.width / 2; const cy = C.rect.top + C.rect.height / 2;
    const dx = clientX - cx; const dy = clientY - cy;
    if (Math.hypot(dx, dy) < clampDeadzone) return null;
    let deg = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  }

  const drag = makeDrag(hit, {
    enabled: () => !C.disabled,
    onStart(e) {
      if (C.cancelTween) { C.cancelTween(); C.cancelTween = null; C.settling = false; }
      C.rect = face.getBoundingClientRect();
      const a = angleAt(e.clientX, e.clientY);
      C.lastAngle = a == null ? handDegs(C.abs).minuteDeg : a;
      C.dragMin = C.abs;
      wrap.classList.add('dragging');
      if (opts.onFirstDrag && !C.firstDragDone) { C.firstDragDone = true; opts.onFirstDrag(); }
    },
    onMove(dx, dy, e) {
      const a = angleAt(e.clientX, e.clientY);
      if (a == null) return;
      let d = a - C.lastAngle;
      if (d > 180) d -= 360; if (d < -180) d += 360;
      C.lastAngle = a;
      C.dragMin += d / 6;
      const prevInt = Math.round(C.abs);
      C.abs = C.dragMin;
      const nowInt = Math.round(C.abs);
      if (nowInt !== prevInt) {
        const step = nowInt > prevInt ? 1 : -1;
        let p = prevInt;
        let guard = 0;
        while (p !== nowInt && guard < 12) { p += step; if (step > 0) sfx.tick(1); else sfx.tock(1); guard += 1; }
      }
      C.render(C.abs, false);
    },
    onEnd() {
      wrap.classList.remove('dragging');
      const target = Math.round(C.abs);
      C.pending = target;
      C.settling = true;
      C.cancelTween = tween((v) => C.render(v, false), C.abs, target, 220, () => {
        C.settling = false; C.cancelTween = null; C.abs = target;
        sfx.settle();
        if (opts.onSettle) opts.onSettle(C.render(C.abs, false));
      });
    },
  });

  C.nudge = function nudge(dir) {
    if (C.disabled || drag.dragging()) return;
    const base = C.settling ? C.pending : Math.round(C.abs);
    const target = base + dir;
    C.pending = target;
    if (C.cancelTween) C.cancelTween();
    C.settling = true;
    const from = C.abs;
    C.cancelTween = tween((v) => C.render(v, false), from, target, 220, () => {
      C.settling = false; C.cancelTween = null; C.abs = target;
      sfx.settle();
      if (opts.onSettle) opts.onSettle(C.render(C.abs, false));
    });
  };

  C.setAbs = function setAbs(target, instant) {
    if (C.cancelTween) { C.cancelTween(); C.cancelTween = null; }
    C.settling = false;
    C.abs = target; C.pending = target;
    C.render(C.abs, true);
  };

  C.busy = () => C.settling || drag.dragging();
  C.current = () => stateFromAbs(C.abs);
  C.destroy = function destroy() {
    C.alive = false;
    if (C.cancelTween) C.cancelTween();
    drag.destroy();
    wrap.remove();
  };
  C.layout();
  return C;
}

/* ---------- the anim card ---------- */
export default {
  id: 'clocks-time',
  title: "THE MINUTE MUNCHER'S CLOCK",

  mount(host, ctx) {
    let alive = true;
    let clock = null;
    let mi = 0;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('clocks-time', `
      .mmc-q { text-align:center; font-weight:700; font-size:clamp(18px,3vw,26px); margin-bottom:2px; }
      .mmc-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:10px; }
      .mmc-clockwrap { display:flex; justify-content:center; margin:6px auto 4px; }
      .mmc-face { position:relative; border-radius:50%; background:var(--card); border:6px solid var(--ink);
        box-shadow:0 4px 0 rgba(0,0,0,.3); touch-action:none; }
      .mmc-nums, .mmc-rim { position:absolute; inset:0; pointer-events:none; }
      .mmc-num { position:absolute; transform:translate(-50%,-50%); font-weight:700; font-size:15px; color:var(--ink); }
      .mmc-rimnum { position:absolute; transform:translate(-50%,-50%); font-weight:700; font-size:10px;
        color:var(--gold-deep); font-style:italic; opacity:.68; transition:none; }
      .mmc-rimnum.lit { color:var(--stink); opacity:1; text-shadow:0 0 8px rgba(155,89,208,.5); }
      .mmc-hour, .mmc-min { position:absolute; left:50%; bottom:50%; transform-origin:50% 100%;
        border-radius:4px; will-change:transform; }
      .mmc-hour { width:7px; background:var(--ink); margin-left:-3.5px; }
      .mmc-min { width:4.5px; background:var(--stink); margin-left:-2.25px; }
      .mmc-pivot { position:absolute; left:50%; top:50%; width:14px; height:14px; margin:-7px 0 0 -7px;
        background:var(--gold-deep); border:3px solid var(--ink); border-radius:50%; z-index:5; }
      .mmc-hit { position:absolute; inset:-14px; border-radius:50%; cursor:grab; z-index:6; }
      .mmc-clockwrap.dragging .mmc-hit, .mmc-hit:active { cursor:grabbing; }
      .mmc-dash { display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:10px; }
      .mmc-chip { background:var(--swamp-mid); color:var(--parchment); border-radius:12px; padding:9px 18px;
        font-weight:700; font-size:clamp(15px,2.2vw,18px); box-shadow:0 3px 0 rgba(0,0,0,.3); text-align:center; }
      .mmc-chip.flip { animation:mmcFlip .38s ease; }
      @keyframes mmcFlip { 0% { transform:rotateX(0); } 50% { transform:rotateX(90deg); } 100% { transform:rotateX(0); } }
      .mmc-lever-row { display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:8px; }
      .mmc-lever { background:var(--card); border:3px solid var(--swamp-mid); color:var(--ink); border-radius:14px;
        padding:12px 20px; font-weight:700; font-size:15px; cursor:pointer; box-shadow:0 3px 0 rgba(0,0,0,.2); min-height:44px; }
      .mmc-lever.pulled { background:var(--swamp-mid); color:var(--stink-lime); }
      .mmc-digital { position:relative; display:inline-block; background:var(--swamp-deep); color:var(--gold);
        font-family:'SF Mono',Menlo,Consolas,monospace; font-weight:700; font-size:24px; padding:10px 18px;
        border-radius:12px; box-shadow:0 4px 0 rgba(0,0,0,.3); }
      .mmc-stamp12 { position:absolute; top:-14px; right:-18px; background:var(--gold); color:var(--ink);
        font-family:'Fredoka',sans-serif; font-weight:700; font-size:13px; padding:2px 7px; border-radius:8px;
        animation:mmcStampIn .5s var(--spring) both; }
      @keyframes mmcStampIn { 0% { transform:scale(0) rotate(-25deg); opacity:0; } 60% { transform:scale(1.25) rotate(6deg); opacity:1; } 100% { transform:scale(1) rotate(-8deg); } }
      .mmc-duration { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:8px; }
      .mmc-seg { background:var(--card); border:2.5px solid var(--swamp-mid); border-radius:12px; padding:7px 13px;
        font-size:13px; font-weight:700; color:var(--ink); opacity:.5; }
      .mmc-seg.locked { opacity:1; border-color:var(--correct); background:#E9FBEF; }
      .mmc-seg.total { border-color:var(--gold-deep); background:#FFF3D0; opacity:1; }
      .mmc-win { margin-top:12px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF);
        border:3px solid var(--correct); border-radius:14px; padding:10px 14px; animation:animBubbleIn .34s var(--spring) both; }
      .mmc-win .wp { font-weight:700; color:#1d8f4e; font-size:16px; }
      .mmc-win .wk { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:2px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'mmc-q');
    const qsub = el('div', 'mmc-qsub');
    const clockHost = el('div');
    const dash = el('div', 'mmc-dash');
    const chip = el('div', 'mmc-chip', "3 o'clock");
    dash.append(chip);
    const leverRow = el('div', 'mmc-lever-row');
    const durationRow = el('div', 'mmc-duration');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const nr = el('button', 'anim-nudge', '➡');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, lock, nr, reset);
    stage.append(chiprow, q, qsub, clockHost, dash, leverRow, durationRow, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mission = null;
    let attempts = 0;
    let flipShown = false;
    let pm = false;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''),
          m.kind === 'ampm' ? '24-hour lever' : m.label);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function updateDigital(h, m) {
      const box = leverRow.querySelector('.mmc-digital');
      if (!box) return;
      const wasPm = box.dataset.pm === '1';
      box.textContent = to24(h, m, pm);
      box.dataset.pm = pm ? '1' : '0';
      if (pm && !wasPm) {
        const stamp = el('span', 'mmc-stamp12', '+12');
        box.append(stamp);
        later(() => { if (stamp.isConnected) stamp.remove(); }, 900);
      }
    }

    function updateDuration(s) {
      if (!mission || !mission.durationUI) return;
      const startAbs = absMin(mission.start.h, mission.start.m);
      const seg = durationSegments(startAbs, s.abs >= startAbs ? s.abs : startAbs + (s.abs - startAbs + 720) % 720);
      const p1 = durationRow.querySelector('.mmc-seg.p1');
      const p2 = durationRow.querySelector('.mmc-seg.p2');
      const tot = durationRow.querySelector('.mmc-seg.total');
      if (p1) { p1.textContent = `to ${mission.target.h > mission.start.h || mission.start.h === 12 ? (mission.start.h === 12 ? 1 : mission.start.h + 1) : mission.start.h}:00 = ${seg.part1} min`; p1.classList.toggle('locked', seg.part1 >= seg.toHour); }
      if (p2) { p2.textContent = `then +${seg.part2} min`; p2.classList.toggle('locked', seg.part2 > 0); }
      if (tot) tot.textContent = `TOTAL = ${seg.part1 + seg.part2} min`;
    }

    function onRender(s, ch, instant) {
      const flipped = ch.mode !== chip.dataset.mode && chip.dataset.mode != null;
      chip.textContent = ch.text;
      chip.dataset.mode = ch.mode;
      if (flipped && !instant) { chip.classList.remove('flip'); void chip.offsetWidth; chip.classList.add('flip'); }
      updateDuration(s);
      if (mission && mission.flipPop && !flipShown && ch.mode === 'to') {
        flipShown = 'pending';
      }
    }

    function buildLever() {
      leverRow.innerHTML = '';
      pm = false;
      const digital = el('div', 'mmc-digital', '00:00');
      digital.dataset.pm = '0';
      const lever = el('button', 'mmc-lever', '☀️ MORNING — tap to pull the AFTERNOON lever');
      lever.addEventListener('click', () => {
        sfx.ui();
        pm = !pm;
        lever.textContent = pm ? '🌙 AFTERNOON — lever pulled!' : '☀️ MORNING — tap to pull the AFTERNOON lever';
        lever.classList.toggle('pulled', pm);
        const s = clock.current();
        updateDigital(s.h, s.m);
        if (pm) sfx.pop();
      });
      leverRow.append(digital, lever);
      const s = clock ? clock.current() : mission.start;
      updateDigital(s.h, s.m);
    }

    function start(i) {
      mi = i;
      attempts = 0;
      flipShown = false;
      winBox.innerHTML = '';
      leverRow.innerHTML = '';
      durationRow.innerHTML = '';
      leverRow.style.display = 'none';
      durationRow.style.display = 'none';
      nl.style.display = ''; nr.style.display = '';
      if (clock) { clock.destroy(); clock = null; }
      paintChips();
      const sandbox = i === MISSIONS.length;
      mission = sandbox ? null : MISSIONS[i];
      lock.style.display = sandbox ? 'none' : '';
      const startPoint = sandbox ? { h: 3, m: 0 } : mission.start;
      if (sandbox) {
        q.textContent = 'Free play — drag the minute hand and read the clock.';
        qsub.textContent = '';
      } else if (mission.kind === 'ampm') {
        q.textContent = mission.prompt;
        qsub.textContent = 'The clock is frozen at 3:25 — just pull the lever.';
        leverRow.style.display = '';
        nl.style.display = 'none'; nr.style.display = 'none';
      } else {
        q.textContent = mission.prompt;
        qsub.textContent = mission.durationUI
          ? 'Drag the minute hand forward and watch the count build.'
          : 'Drag the minute hand around, then LOCK IT IN.';
        if (mission.durationUI) {
          durationRow.style.display = '';
          durationRow.append(
            el('div', 'mmc-seg p1', 'to 4:00 = 0 min'),
            el('div', 'mmc-seg p2', 'then +0 min'),
            el('div', 'mmc-seg total', 'TOTAL = 0 min'),
          );
        }
      }
      clock = makeClock(clockHost, {
        start: startPoint,
        disabled: !sandbox && mission.kind === 'ampm',
        onRender,
        onSettle(res) {
          if (!alive) return;
          if (mission && mission.flipPop && flipShown === 'pending') {
            flipShown = true;
            later(() => bubble(stage, {
              title: 'PAST FLIPS TO TO! ⚖️',
              text: 'The minute hand just crossed onto the <b>LEFT half</b> of the face — past the 6, heading up towards 12. That side always means <b>TO</b> the next hour, never PAST this one.',
              img: MUNCHER_IMG,
            }), 300);
          }
        },
      });
      if (mission && mission.kind === 'ampm') buildLever();
    }

    nl.addEventListener('click', () => clock && clock.nudge(-1));
    nr.addEventListener('click', () => clock && clock.nudge(1));
    reset.addEventListener('click', () => {
      sfx.ui();
      if (!clock) return;
      const startPoint = mission ? mission.start : { h: 3, m: 0 };
      clock.setAbs(absMin(startPoint.h, startPoint.m), true);
      const res = clock.render(clock.abs, true);
      onRender(res.s, res.chip, true);
      if (mission && mission.kind === 'ampm') buildLever();
    });

    lock.addEventListener('click', () => {
      if (!mission || (clock && clock.busy())) return;
      sfx.ui();
      if (mission.kind === 'ampm') {
        if (pm === mission.target.pm) { win(); return; }
        attempts += 1;
        bubble(stage, {
          title: 'PULL THE LEVER! 🕰️',
          text: 'The clock face alone can’t say morning or afternoon — that’s the Two-Face Watch’s secret job. Tap the lever to swap it to <b>AFTERNOON</b>, then lock it in.',
          img: MUNCHER_IMG,
        });
        return;
      }
      const s = clock.current();
      if (s.h === mission.target.h && s.m === mission.target.m) { win(); return; }
      attempts += 1;
      sfx.nudge();
      const curAbs = absMin(s.h, s.m);
      const tgtAbs = absMin(mission.target.h, mission.target.m);
      let diff = tgtAbs - curAbs;
      if (diff > 360) diff -= 720; if (diff < -360) diff += 720;
      let text;
      if (diff > 0) text = 'Keep dragging the minute hand <b>FORWARD</b> (clockwise) — not quite there yet!';
      else text = 'You’ve gone a little too far — drag the minute hand <b>BACK</b> a touch.';
      if (attempts >= 2) {
        const tgtChip = chipFor(mission.target.h, mission.target.m);
        text += `<br><br>🎩 Psst: you’re aiming for <b>${tgtChip.text}</b>. You’ve got this!`;
      }
      bubble(stage, { title: 'KEEP GOING! 💪', text, img: MUNCHER_IMG });
    });

    function win() {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      winBox.innerHTML = '';
      const label = mission.kind === 'ampm' ? `3:25 p.m. = ${to24(3, 25, true)}` : `${mission.prompt.replace(/\.$/, '')} → ${chipFor(mission.target.h, mission.target.m).text}`;
      const w = el('div', 'mmc-win',
        `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} &nbsp; ${label}</div>`
        + `<div class="wk">${mission.worked}</div>`);
      winBox.append(w);
      sparkleBurst(stage, stage.clientWidth / 2, 60);
      if (doneSet.size === MISSIONS.length) ctx.complete();
      const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
      if (nextIdx !== -1) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold', 'FREE PLAY 🕹️');
        fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
        w.append(fp);
        ctx.complete();
      }
    }

    const onResize = () => { if (clock) clock.layout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    later(() => bubble(stage, {
      title: 'MISSION BRIEFING 🕒',
      text: 'The Minute Muncher swallows stray minutes whole — he’s never once read a clock right! The numbers round the rim are a secret <b>5-times-table</b>: the 7 doesn’t mean 7 minutes, it means 35. Drag the minute hand and catch him out.',
      img: MUNCHER_IMG,
    }), 200);

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
