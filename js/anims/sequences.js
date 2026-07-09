// FART QUEST — js/anims/sequences.js
// THE GAP-O-METER — interactive stepping-stone sequence machine for the
// sequences Scout Report (Pattern Path / The Sequel). Child stretches the
// meter between two neighbouring stones to measure the jump, then fires it
// at the mystery stone. Doubling mission: the additive gap changes each
// time, but the RATIO never does — the ratio wins.

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const SEQUEL_IMG = 'assets/monsters/the-sequel.png';
const RULE = 'Find the jump between neighbours FIRST. The jump reveals everything.';
const MI = '−'; // proper minus sign, matches the topic file's negative numbers

function fmtNum(v) {
  if (v == null) return '?';
  return v < 0 ? MI + String(Math.abs(v)) : String(v);
}
function fmtSigned(n) {
  return n < 0 ? MI + String(Math.abs(n)) : '+' + String(n);
}

/* ---------- content (numbers verified independently — see report) ---------- */
const MISSIONS = [
  {
    id: 'a', stones: [3, 7, 11, null, 19], missing: 3, mode: 'add', target: 15,
    qsub: 'Stretch the Gap-o-Meter between two neighbouring stones to measure the jump. Then tap the mystery stone to fire it in.',
    worked: 'The jump is +4 each time: 3, 7, 11, 15, 19.',
  },
  {
    id: 'b', stones: [40, 34, 28, null], missing: 3, mode: 'add', target: 22,
    qsub: 'This path runs backwards. Measure the jump between two neighbours — mind which way it points — then fire it at the mystery stone.',
    worked: `The jump is ${MI}6 each time: 40, 34, 28, 22.`,
  },
  {
    id: 'c', stones: [9, 6, 3, null, -3], missing: 3, mode: 'add', target: 0, throughZero: true,
    qsub: 'Watch what happens when the jump crosses zero. Measure the gap, then fire it in.',
    worked: `The jump is ${MI}3 each time, straight through zero: 9, 6, 3, 0, ${MI}3. Zero does not slow it down one bit.`,
  },
  {
    id: 'd', stones: [2, 4, 8, null, 32], missing: 3, mode: 'mult', target: 16, checkIndex: 4,
    qsub: 'This one is not as simple as it looks. Measure a neighbouring pair and see what the Gap-o-Meter finds.',
    worked: 'The gap keeps changing (+2, then +4) — but the RATIO is always ×2: 2, 4, 8, 16, 32.',
  },
];
const WIN_PHRASES = ['NEVER SURPRISED! \u{1F60F}', 'GAP CRACKED! \u{1F52E}', 'THE JUMP REVEALS EVERYTHING!', 'THE SEQUEL KNEW ALL ALONG! \u{1F4A8}'];

/* ---------- the anim card ---------- */
export default {
  id: 'sequences',
  title: 'THE GAP-O-METER',

  mount(host, ctx) {
    injectCss('sequences', `
.gpm-q { text-align:center; font-weight:700; font-size:clamp(19px,3.2vw,27px); letter-spacing:.02em; margin-bottom:2px; font-family:'Fredoka',sans-serif; color:var(--ink); }
.gpm-qsub { text-align:center; font-size:12.5px; color:#6b5744; font-weight:500; margin-bottom:10px; }
.gpm-wrap { position:relative; margin:0 auto 14px; max-width:760px; }
.gpm-row { position:relative; display:flex; align-items:center; justify-content:space-between; width:100%; min-height:88px; }
.gpm-stone {
  flex:0 0 auto; display:flex; align-items:center; justify-content:center;
  border-radius:50%; background:radial-gradient(circle at 32% 28%, #6f8f5a, var(--swamp-deep) 70%);
  color:var(--gold); font-family:'Fredoka',sans-serif; font-weight:700;
  box-shadow:0 4px 0 rgba(0,0,0,.32), inset 0 -4px 6px rgba(0,0,0,.2);
  border:3px solid rgba(0,0,0,.2);
}
.gpm-stone.missing { background:radial-gradient(circle at 32% 28%, #8a6b3f, #5a4408 70%); color:var(--gold); border-color:rgba(244,197,66,.6); animation:gpmPulse 1.6s ease-in-out infinite; }
@keyframes gpmPulse { 0%,100% { box-shadow:0 4px 0 rgba(0,0,0,.32), 0 0 0 0 rgba(244,197,66,.4); } 50% { box-shadow:0 4px 0 rgba(0,0,0,.32), 0 0 0 9px rgba(244,197,66,0); } }
.gpm-stone.solved { color:var(--stink-lime); border-color:var(--correct); animation:gpmSolve .5s var(--spring) both; }
@keyframes gpmSolve { 0% { transform:scale(.6) rotate(-8deg); } 60% { transform:scale(1.16) rotate(4deg); } 100% { transform:scale(1) rotate(0); } }
.gpm-stone.preview { box-shadow:0 4px 0 rgba(0,0,0,.32), 0 0 0 5px rgba(155,89,208,.55); }
.gpm-stone.shake { animation:gpmShake .45s ease; }
@keyframes gpmShake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-6px); } 75% { transform:translateX(6px); } }
.gpm-hit { position:absolute; inset:-10px; z-index:5; cursor:grab; touch-action:none; }
.gpm-hit:active { cursor:grabbing; }
.gpm-elastic {
  position:absolute; z-index:3; height:8px; border-radius:999px;
  background:linear-gradient(90deg, var(--gold), var(--gold-deep)); box-shadow:0 2px 0 rgba(0,0,0,.3);
  pointer-events:none;
}
.gpm-elastic.locking { animation:gpmLock .45s ease; }
@keyframes gpmLock { 0%,100% { transform:scaleY(1); } 40% { transform:scaleY(2.4); } }
.gpm-spark { position:absolute; z-index:9; font-size:26px; transform:translate(-50%,-50%); pointer-events:none; }
.gpm-meter {
  max-width:640px; margin:0 auto 8px; background:#241d15; border-radius:14px; padding:12px 16px;
  border:3px solid #4a3b28; box-shadow:inset 0 3px 10px rgba(0,0,0,.6); text-align:center;
}
.gpm-reading { color:var(--stink-lime); font-weight:700; font-size:14.5px; line-height:1.4; text-shadow:0 0 10px rgba(199,244,100,.3); }
.gpm-reading b { color:var(--gold); }
.gpm-chooser { margin-top:8px; margin-bottom:0; }
.gpm-win { margin:10px auto 0; max-width:640px; text-align:center; background:linear-gradient(180deg,#E9FBEF,#D3F3DF); border:3px solid var(--correct); border-radius:14px; padding:12px 16px; animation:animBubbleIn .34s var(--spring) both; }
.gpm-winphrase { font-weight:700; color:#1d8f4e; font-size:16px; }
.gpm-winline { font-family:'Fredoka',sans-serif; font-weight:700; font-size:19px; color:var(--ink); margin-top:4px; }
.gpm-workedtext { font-size:13.5px; color:#4d6b58; font-weight:500; margin-top:4px; }
.gpm-alldone { margin-top:8px; font-size:13.5px; font-weight:700; color:#1d8f4e; }
.gpm-rule { margin-top:12px; font-size:13.5px; line-height:1.35; background:linear-gradient(180deg,#FFF3CE,#FBE29A); border:3px solid var(--gold-deep); border-radius:14px; padding:10px 14px; color:#5a4408; font-weight:700; }
`);

    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'gpm-q');
    const qsub = el('div', 'gpm-qsub');
    const stonesWrap = el('div', 'gpm-wrap');
    const stoneRow = el('div', 'gpm-row');
    const hit = el('div', 'gpm-hit');
    stoneRow.append(hit);
    stonesWrap.append(stoneRow);
    const meter = el('div', 'gpm-meter');
    const meterReading = el('div', 'gpm-reading', 'Not stretched yet.');
    const chooserRow = el('div', 'anim-chiprow gpm-chooser');
    meter.append(meterReading, chooserRow);
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(resetBtn);
    stage.append(chiprow, q, qsub, stonesWrap, meter, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'gpm-rule', RULE);
    host.append(ruleCard);

    let mi = 0;
    const doneSet = new Set();
    let mission = null;
    let missionStones = [];
    let stoneEls = [];
    let loadedJump = null; // { type: 'add'|'mult', value }
    let solved = false;
    let busy = false;
    let elasticEl = null;
    let cancelElastic = null;
    let cancelSpark = null;
    let currentSparkEl = null;
    let dragAnchor = -1;
    let dragCurrent = -1;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const label = m.stones.map(fmtNum).join(',');
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), label);
        c.addEventListener('click', () => { sfx.ui(); startMission(i); });
        chiprow.append(c);
      });
    }

    function sizeStones() {
      const n = stoneEls.length;
      if (!n) return;
      const avail = Math.max(260, Math.min(760, stoneRow.clientWidth || host.clientWidth || 640));
      const gap = n > 4 ? 8 : 12;
      const size = Math.max(46, Math.min(88, Math.floor((avail - gap * (n - 1)) / n)));
      stoneRow.style.gap = gap + 'px';
      stoneEls.forEach((s) => {
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.fontSize = Math.round(size * 0.4) + 'px';
      });
    }

    function buildStones() {
      stoneRow.querySelectorAll('.gpm-stone').forEach((s) => s.remove());
      stoneEls = missionStones.map((v, idx) => {
        const isMissing = idx === mission.missing;
        const s = el('div', 'gpm-stone' + (isMissing ? ' missing' : ''), isMissing ? '?' : fmtNum(v));
        stoneRow.append(s);
        return s;
      });
      sizeStones();
    }

    function startMission(i) {
      mi = i;
      mission = MISSIONS[i];
      missionStones = mission.stones.slice();
      loadedJump = null;
      solved = false;
      busy = false;
      if (cancelSpark) { cancelSpark(); cancelSpark = null; }
      if (currentSparkEl) { currentSparkEl.remove(); currentSparkEl = null; }
      clearElastic(true);
      chooserRow.innerHTML = '';
      winBox.innerHTML = '';
      paintChips();
      q.textContent = missionStones.map(fmtNum).join(', ');
      qsub.textContent = mission.qsub;
      buildStones();
      renderMeter();
    }

    /* ---------- measuring ---------- */
    function localX(clientX) {
      const r = stoneRow.getBoundingClientRect();
      return Math.max(0, Math.min(r.width, clientX - r.left));
    }
    function nearestStoneIndex(clientX) {
      const x = localX(clientX);
      let best = 0; let bestD = Infinity;
      stoneEls.forEach((s, i) => {
        const cx = s.offsetLeft + s.offsetWidth / 2;
        const d = Math.abs(cx - x);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    function anchorCenterX(idx) {
      const s = stoneEls[idx];
      return s.offsetLeft + s.offsetWidth / 2;
    }
    function startElastic(anchorIdx, clientX) {
      clearElastic(true);
      elasticEl = el('div', 'gpm-elastic');
      stoneRow.append(elasticEl);
      updateElastic(clientX);
    }
    function updateElastic(clientX) {
      if (!elasticEl || dragAnchor < 0) return;
      const x = localX(clientX);
      const ax = anchorCenterX(dragAnchor);
      const left = Math.min(ax, x);
      const width = Math.max(2, Math.abs(x - ax));
      const anchorEl = stoneEls[dragAnchor];
      const top = anchorEl.offsetTop + anchorEl.offsetHeight / 2 - 4;
      elasticEl.style.left = left + 'px';
      elasticEl.style.top = top + 'px';
      elasticEl.style.width = width + 'px';
      stoneEls.forEach((s, i) => s.classList.toggle('preview', i === dragCurrent && i !== dragAnchor));
    }
    function clearElastic(instant) {
      stoneEls.forEach((s) => s.classList.remove('preview'));
      if (cancelElastic) { cancelElastic(); cancelElastic = null; }
      if (!elasticEl) return;
      const node = elasticEl; elasticEl = null;
      if (instant) { node.remove(); return; }
      const w0 = parseFloat(node.style.width) || 0;
      const l0 = parseFloat(node.style.left) || 0;
      const cx = l0 + w0 / 2;
      cancelElastic = tween((w) => {
        node.style.width = w + 'px';
        node.style.left = (cx - w / 2) + 'px';
      }, w0, 0, 220, () => { cancelElastic = null; node.remove(); });
    }
    function flashElasticLock() {
      if (elasticEl) elasticEl.classList.add('locking');
      later(() => clearElastic(false), 450);
    }

    function handleTap(idx) {
      if (busy || solved || idx < 0) return;
      if (idx === mission.missing) fire();
      else if (!loadedJump) toast(stage, 'Drag me between two NEIGHBOURING stones to measure the jump — a tap alone will not do it!');
    }

    function handleMeasure(anchorIdx, targetIdx) {
      if (busy || solved || anchorIdx < 0 || targetIdx < 0 || anchorIdx === targetIdx) { clearElastic(false); return; }
      const dist = Math.abs(targetIdx - anchorIdx);
      const earlier = Math.min(anchorIdx, targetIdx);
      const later2 = Math.max(anchorIdx, targetIdx);
      if (dist > 1) {
        sfx.nudge();
        const a = missionStones[earlier]; const b = missionStones[later2];
        if (a != null && b != null) toast(stage, `\u{1F4CF} ${fmtNum(a)} and ${fmtNum(b)} are ${Math.abs(b - a)} apart — but that is TWO jumps, not one! Neighbours only.`);
        else toast(stage, '\u{1F4CF} Neighbours only — stretch me to the very next stone.');
        clearElastic(false);
        return;
      }
      if (missionStones[earlier] == null || missionStones[later2] == null) {
        sfx.nudge();
        toast(stage, 'The mystery stone has no number yet — measure between two KNOWN stones first!');
        clearElastic(false);
        return;
      }
      lockMeasurement(earlier, later2);
    }

    function lockMeasurement(earlier, later2) {
      const gap = missionStones[later2] - missionStones[earlier];
      if (gap >= 0) sfx.tick(Math.min(5, gap)); else sfx.tock(Math.min(5, -gap));
      flashElasticLock();
      if (mission.mode === 'mult' && missionStones[earlier] !== 0 && missionStones[later2] % missionStones[earlier] === 0) {
        const ratio = missionStones[later2] / missionStones[earlier];
        if (ratio > 1) { loadedJump = null; renderChooser(gap, ratio); return; }
      }
      loadedJump = { type: 'add', value: gap };
      chooserRow.innerHTML = '';
      renderMeter();
    }

    function renderChooser(gap, ratio) {
      meterReading.innerHTML = 'Two different readings turn up here — which one is really steering this sequence?';
      chooserRow.innerHTML = '';
      const c1 = el('button', 'anim-mchip', `${fmtSigned(gap)} each time`);
      const c2 = el('button', 'anim-mchip', `×${ratio} each time`);
      c1.addEventListener('click', () => { sfx.ui(); pickCandidate({ type: 'add', value: gap }, c1); });
      c2.addEventListener('click', () => { sfx.ui(); pickCandidate({ type: 'mult', value: ratio }, c2); });
      chooserRow.append(c1, c2);
    }
    function pickCandidate(cand, btn) {
      loadedJump = cand;
      chooserRow.querySelectorAll('.anim-mchip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderMeter();
    }
    function renderMeter() {
      if (loadedJump) {
        const label = loadedJump.type === 'add' ? `${fmtSigned(loadedJump.value)} each time` : `×${loadedJump.value} each time`;
        meterReading.innerHTML = `GAP-O-METER READS <b>${label}</b> — loaded! Tap the mystery stone to fire it in.`;
      } else {
        meterReading.textContent = 'Not stretched yet — drag between two NEIGHBOURING stones to measure the jump!';
      }
    }

    /* ---------- firing ---------- */
    function shakeStone(idx) {
      const s = stoneEls[idx];
      s.classList.add('shake');
      later(() => s.classList.remove('shake'), 500);
    }

    function fire() {
      if (busy || solved) return;
      if (!loadedJump) {
        sfx.nudge();
        toast(stage, 'Measure the gap between two neighbours first — then tap me!');
        return;
      }
      busy = true;
      const refIdx = mission.missing - 1;
      const refVal = missionStones[refIdx];
      const predicted = loadedJump.type === 'add' ? refVal + loadedJump.value : refVal * loadedJump.value;

      if (mission.checkIndex != null) {
        const predicted2 = loadedJump.type === 'add' ? predicted + loadedJump.value : predicted * loadedJump.value;
        const actualCheck = missionStones[mission.checkIndex];
        if (predicted2 !== actualCheck) {
          busy = false;
          sfx.thud();
          shakeStone(mission.missing);
          bubble(stage, {
            title: 'CLUNK! \u{1F527}',
            text: `Fire that jump twice from ${fmtNum(refVal)}: you land on ${fmtNum(predicted)}, then ${fmtNum(predicted2)}. But the board already shows <b>${fmtNum(actualCheck)}</b> two stones further on — that does not match. Try the OTHER reading!`,
            img: SEQUEL_IMG,
          });
          return;
        }
      }
      launchSpark(refIdx, mission.missing, predicted);
    }

    function launchSpark(fromIdx, toIdx, predicted) {
      const fromEl = stoneEls[fromIdx]; const toEl = stoneEls[toIdx];
      const spark = el('div', 'gpm-spark', '⚡');
      stoneRow.append(spark);
      currentSparkEl = spark;
      const x0 = fromEl.offsetLeft + fromEl.offsetWidth / 2;
      const y0 = fromEl.offsetTop + fromEl.offsetHeight / 2;
      const x1 = toEl.offsetLeft + toEl.offsetWidth / 2;
      const y1 = toEl.offsetTop + toEl.offsetHeight / 2;
      spark.style.left = x0 + 'px'; spark.style.top = y0 + 'px';
      cancelSpark = tween((k) => {
        spark.style.left = (x0 + (x1 - x0) * k) + 'px';
        spark.style.top = (y0 + (y1 - y0) * k) + 'px';
      }, 0, 1, 420, () => {
        cancelSpark = null;
        spark.remove();
        currentSparkEl = null;
        reveal(toIdx, predicted);
      });
    }

    function reveal(idx, value) {
      missionStones[idx] = value;
      const s = stoneEls[idx];
      s.textContent = fmtNum(value);
      s.classList.remove('missing');
      s.classList.add('solved');
      sfx.pop();
      sparkleBurst(stoneRow, s.offsetLeft + s.offsetWidth / 2, s.offsetTop + s.offsetHeight / 2);
      q.textContent = missionStones.map(fmtNum).join(', ');
      busy = false;
      solved = true;
      win();
    }

    function win() {
      doneSet.add(mission.id);
      sfx.win();
      party(stage);
      paintChips();
      winBox.innerHTML = '';
      const w = el('div', 'gpm-win',
        `<div class="gpm-winphrase">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]}</div>`
        + `<div class="gpm-winline">${missionStones.map(fmtNum).join(', ')}</div>`
        + `<div class="gpm-workedtext">${mission.worked}</div>`);
      winBox.append(w);
      if (doneSet.size === MISSIONS.length) {
        ctx.complete();
        w.append(el('div', 'gpm-alldone', 'Every gap measured, every mystery stone fired — The Sequel is (grudgingly) impressed. \u{1F4A8}'));
      } else {
        const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); startMission(nextIdx); });
        w.append(nb);
      }
    }

    /* ---------- drag ---------- */
    const drag = makeDrag(hit, {
      enabled: () => !busy && !solved,
      onStart(e) {
        dragAnchor = nearestStoneIndex(e.clientX);
        dragCurrent = dragAnchor;
        startElastic(dragAnchor, e.clientX);
      },
      onMove(dx, dy, e) {
        dragCurrent = nearestStoneIndex(e.clientX);
        updateElastic(e.clientX);
      },
      onEnd(dx, dy) {
        const moved = Math.hypot(dx, dy) > 6;
        if (!moved) { handleTap(dragAnchor); clearElastic(true); }
        else handleMeasure(dragAnchor, dragCurrent);
        dragAnchor = -1; dragCurrent = -1;
      },
    });

    resetBtn.addEventListener('click', () => { sfx.ui(); startMission(mi); });

    const onResize = () => { drag.abort(); clearElastic(true); sizeStones(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    bubble(stage, {
      title: 'MEET THE GAP-O-METER',
      text: 'I am The Sequel — I am never, EVER surprised, because I always measure the JUMP first. <br><br><b>Find the jump between neighbours FIRST. The jump reveals everything.</b> Stretch me between two neighbouring stones to measure it, then tap any mystery stone to fire the jump in.',
      img: SEQUEL_IMG,
    });
    startMission(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (cancelSpark) cancelSpark();
      if (cancelElastic) cancelElastic();
      drag.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
