// FART QUEST — js/anims/graphs-charts.js
// BARRY'S SCALE SPYGLASS — interactive bar-chart scale reader for the
// graphs-charts Scout Report. A dial that never moves the bars but changes
// what every one of them is worth; structure follows fdp.js/decimals-x10.js
// (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const BARRY_IMG = 'assets/monsters/barry-chart.png';
const RULE = 'Read the SCALE before the bars — one square is not always one.';

/* ---------- pure content (unit-tested in scratch script — do not "improve" the numbers) ---------- */
const BARS = [
  { key: 'football', label: 'Football', emoji: '⚽', gridlines: 3, color: '#5b7fa6' },
  { key: 'swim', label: 'Swimming', emoji: '🏊', gridlines: 5, color: '#E08A3D' },
  { key: 'tag', label: 'Tag', emoji: '🏃', gridlines: 2, color: '#9B59D0' },
  { key: 'chess', label: 'Chess', emoji: '♟️', gridlines: 4, color: '#4CAF7D' },
];
const DIAL_STOPS = [1, 2, 5, 10];
const MAX_GRID = 6; // headroom above the tallest bar (5)
const MOOD_GRID = 3; // Barry's own chest-chart, always 3 gridlines
const MOOD_MAX = 10;
const MOOD_CAPTIONS = {
  1: { face: '😤', word: 'a bit cross' },
  2: { face: '😠', word: 'getting crosser' },
  5: { face: '😡', word: 'proper cross now' },
  10: { face: '🤬', word: 'FURIOUS!! Same mood, BIGGER numbers' },
};
const WIN_PHRASES = ['SPYGLASS SPOT ON! 🔍', 'SCALE CRACKED! 📊', 'BARRY APPROVES! 👍', 'READ LIKE A PRO! ⭐'];
const AHA_TEXT = 'Same bars, same pictures — but the SCALE dial changes what every one of '
  + 'them is really worth. That’s why my own chest reads <b>3/10 cross</b> at ×1 but '
  + '<b>30/100 FURIOUS</b> at ×10 — I’m exactly as cross either way! Always read the scale '
  + '<b>FIRST</b>, before you read a single bar.';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MISSIONS = [
  {
    id: 'm1',
    worked: 'Swimming reaches 5 gridlines. At ×5, 5 × 5 = 25.',
    options: [
      { v: 25, correct: true },
      { v: 5, why: 'That’s just the number of gridlines — you forgot to multiply by the scale (×5)!' },
      { v: 10, why: 'That’s the TAG bar at this scale, not Swimming — check you’re reading the right bar.' },
      { v: 20, why: 'That’s the CHESS bar at this scale, not Swimming — check you’re reading the right bar.' },
    ],
  },
  {
    id: 'm2',
    worked: 'Swimming = 25, Tag = 10. 25 − 10 = 15 more pupils.',
    options: [
      { v: 15, correct: true },
      { v: 35, why: 'That’s 25 + 10 — the question asked "how many MORE", which means subtract, not add.' },
      { v: 3, why: 'That’s the difference in GRIDLINES (5 − 2), not the difference in pupils. Convert to the real values first.' },
      { v: 25, why: 'That’s just Swimming’s total on its own — the question wants the DIFFERENCE between the two.' },
      { v: 10, why: 'That’s just Tag’s total on its own — the question wants the DIFFERENCE between the two.' },
    ],
  },
  {
    id: 'm3',
    worked: '3 whole ⚽ (3 × 4 = 12) plus a half ⚽ (half of 4 = 2). 12 + 2 = 14.',
    options: [
      { v: 14, correct: true },
      { v: 12, why: 'That’s just the whole balls — you forgot the half symbol is still worth something (half of 4 = 2).' },
      { v: 16, why: 'That treats the half symbol as if it were a WHOLE one — a half symbol is only worth HALF the value.' },
      { v: 4, why: 'That’s how many ball PICTURES are drawn, not the total — each picture is worth 4, not 1.' },
    ],
  },
];

const MODE_LABELS = [
  { key: 'm1', label: 'MISSION 1 🏊' },
  { key: 'm2', label: 'MISSION 2 ➖' },
  { key: 'm3', label: 'BONUS ⚽' },
  { key: 'free', label: 'FREE PLAY 🎛️' },
];

/* ---------- the anim card ---------- */
export default {
  id: 'graphs-charts',
  title: 'BARRY’S SCALE SPYGLASS',

  mount(host, ctx) {
    injectCss('graphs-charts', CSS);
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'bss-q');
    const qsub = el('div', 'bss-qsub');

    /* ----- bar chart ----- */
    const chartWrap = el('div', 'bss-chartcard');
    const plot = el('div', 'bss-plot');
    const axis = el('div', 'bss-axis');
    const barsRow = el('div', 'bss-bars');
    plot.append(axis, barsRow);
    const labelsRow = el('div', 'bss-labels');
    chartWrap.append(plot, labelsRow);

    const axisTicks = [];
    for (let i = 0; i <= MAX_GRID; i += 1) {
      const t = el('div', 'bss-tick'); t.style.bottom = ((i / MAX_GRID) * 100) + '%';
      const lab = el('div', 'bss-ticklabel', '0'); lab.style.bottom = ((i / MAX_GRID) * 100) + '%';
      axis.append(t, lab);
      axisTicks.push({ i, lab });
    }
    const barRefs = {};
    BARS.forEach((b) => {
      const col = el('button', 'bss-barcol');
      const emoji = el('div', 'bss-baremoji', b.emoji);
      const fill = el('div', 'bss-barfill');
      const pct = (b.gridlines / MAX_GRID) * 100;
      fill.style.height = pct + '%';
      fill.style.background = b.color;
      const chip = el('div', 'bss-chip');
      chip.style.bottom = `calc(${pct}% + 10px)`;
      col.append(emoji, fill, chip);
      col.addEventListener('click', () => tapBar(b.key));
      barsRow.append(col);
      labelsRow.append(el('div', 'bss-labelitem', b.label));
      barRefs[b.key] = { col, chip };
    });

    /* ----- pictogram (mission 3 / bonus) ----- */
    const pictoWrap = el('div');
    const pictoCard = el('button', 'bss-pictocard');
    pictoCard.append(el('div', 'bss-pictotitle', 'Ball Club selfies this week'));
    const pictoRow = el('div', 'bss-pictorow');
    for (let k = 0; k < 3; k += 1) pictoRow.append(el('span', 'bss-pictoball', '⚽'));
    pictoRow.append(el('span', 'bss-pictohalf', '⚽'));
    pictoCard.append(pictoRow, el('div', 'bss-pictokey', '⚽ = 4 balls'));
    pictoWrap.append(pictoCard);
    let pictoRead = false;
    pictoCard.addEventListener('click', () => {
      if (pictoRead || mode !== 'm3') return;
      pictoRead = true;
      pictoCard.classList.add('read');
      sfx.blip(680);
      sparkleBurst(stage, stage.clientWidth / 2, 130, 8);
      later(() => { if (mode !== 'm3') return; buildQuiz(MISSIONS[2]); }, 380);
    });

    /* ----- scale dial ----- */
    const dialWrap = el('div', 'bss-dialwrap');
    dialWrap.append(el('div', 'bss-dialtitle', '🔍 SCALE DIAL'));
    const dialBar = el('div', 'bss-dialbar');
    const dialFill = el('div', 'bss-dialfill');
    const dialTicks = el('div', 'bss-dialticks');
    DIAL_STOPS.forEach((s, i) => {
      const t = el('div', 'bss-dialtick');
      t.style.left = ((i / (DIAL_STOPS.length - 1)) * 100) + '%';
      dialTicks.append(t);
    });
    const dialHandle = el('div', 'bss-dialhandle', '🔍');
    const dialHit = el('div', 'bss-dialhit');
    dialBar.append(dialFill, dialTicks, dialHandle, dialHit);
    dialWrap.append(dialBar);
    const dialLabels = el('div', 'bss-diallabels');
    const dialLabelEls = DIAL_STOPS.map((s) => { const d = el('div', 'bss-diallabel', '×' + s); dialLabels.append(d); return d; });
    dialWrap.append(dialLabels);
    const dialReadout = el('div', 'bss-dialreadout');
    const dialLockNote = el('div', 'bss-diallock');
    dialWrap.append(dialReadout, dialLockNote);

    /* ----- mood panel ----- */
    const moodPanel = el('div', 'bss-mood');
    const moodFace = el('div', 'bss-moodface', '😤');
    const moodText = el('div', 'bss-moodtext');
    moodPanel.append(moodFace, moodText);

    const subStrip = el('div', 'bss-substrip');
    const quizrow = el('div', 'anim-chiprow bss-quizrow');
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const nl = el('button', 'anim-nudge', '⬅');
    const nr = el('button', 'anim-nudge', '➡');
    const reset = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nl, nr, reset);

    stage.append(chiprow, q, qsub, chartWrap, pictoWrap, dialWrap, moodPanel, subStrip, quizrow, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    /* ----- state ----- */
    let mode = 'm1';
    let scale = 1;
    const readings = new Map();
    let m1Revealed = false;
    let m2Revealed = false;
    const doneSet = new Set();
    const dialState = { W: 0, px: 0, liveIdx: 0, targetIdx: 0, dragBase: 0, settling: false, cancelTween: null, disabled: false };

    /* ----- dial engine (drag + snap, tween settle — see decimals-x10/fdp for the pattern) ----- */
    function dialLayout() {
      if (dialState.cancelTween) { dialState.cancelTween(); dialState.cancelTween = null; }
      dialDrag.abort();
      dialBar.classList.remove('dragging');
      dialState.W = dialBar.clientWidth || 260;
      dialSetPx((dialState.targetIdx / (DIAL_STOPS.length - 1)) * dialState.W, true);
    }
    function dialSetPx(px, silent) {
      dialState.px = px;
      const frac = dialState.W ? Math.max(0, Math.min(1, px / dialState.W)) : 0;
      dialFill.style.width = (frac * 100) + '%';
      dialHandle.style.left = (frac * 100) + '%';
      const idx = Math.max(0, Math.min(DIAL_STOPS.length - 1, Math.round(frac * (DIAL_STOPS.length - 1))));
      if (idx !== dialState.liveIdx) {
        dialState.liveIdx = idx;
        if (!silent) sfx.tick(0);
        dialLabelEls.forEach((d, i) => d.classList.toggle('active', i === idx));
      }
    }
    const rubberDial = (px) => (px > dialState.W ? dialState.W + (px - dialState.W) * 0.25 : (px < 0 ? px * 0.25 : px));
    function dialSettleTo(idx) {
      dialState.targetIdx = idx;
      const targetPx = (idx / (DIAL_STOPS.length - 1)) * dialState.W;
      if (dialState.cancelTween) dialState.cancelTween();
      dialState.settling = true;
      dialState.cancelTween = tween((v) => dialSetPx(v), dialState.px, targetPx, 260, () => {
        dialState.settling = false;
        dialState.cancelTween = null;
        if (!alive) return;
        sfx.settle();
        onDialSettle(DIAL_STOPS[dialState.liveIdx]);
      });
    }
    const dialDrag = makeDrag(dialHit, {
      enabled: () => !dialState.disabled,
      onStart() {
        if (dialState.cancelTween) { dialState.cancelTween(); dialState.cancelTween = null; dialState.settling = false; }
        dialState.dragBase = dialState.px;
        dialBar.classList.add('dragging');
      },
      onMove(dx) { dialSetPx(rubberDial(dialState.dragBase + dx)); },
      onEnd() {
        dialBar.classList.remove('dragging');
        dialSettleTo(dialState.liveIdx);
      },
    });
    function dialNudge(dir) {
      if (dialState.disabled || dialDrag.dragging()) return;
      const base = dialState.settling ? dialState.targetIdx : dialState.liveIdx;
      const next = Math.max(0, Math.min(DIAL_STOPS.length - 1, base + dir));
      if (next === base && !dialState.settling) { sfx.nudge(); return; }
      dialSettleTo(next);
    }
    function dialSetInstant(idx) {
      if (dialState.cancelTween) { dialState.cancelTween(); dialState.cancelTween = null; }
      dialState.settling = false;
      dialState.targetIdx = idx; dialState.liveIdx = idx;
      dialSetPx((idx / (DIAL_STOPS.length - 1)) * dialState.W, true);
      dialLabelEls.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    /* ----- readouts ----- */
    function updateAxisLabels() { axisTicks.forEach(({ i, lab }) => { lab.textContent = String(i * scale); }); }
    function updateDialReadout() { dialReadout.innerHTML = `×<b>${scale}</b> — each square on the chart = <b>${scale}</b>`; }
    function updateMood() {
      const cap = MOOD_CAPTIONS[scale];
      moodFace.textContent = cap.face;
      moodText.innerHTML = `Barry’s chest reads <b>${MOOD_GRID * scale}/${MOOD_MAX * scale}</b> — ${cap.word}.`;
    }
    function clearReadingsVisual() {
      readings.clear();
      Object.values(barRefs).forEach((r) => { r.chip.classList.remove('show'); r.chip.textContent = ''; r.col.classList.remove('read'); });
    }

    function onDialSettle(newScale) {
      if (!alive) return;
      scale = newScale;
      clearReadingsVisual();
      updateAxisLabels();
      updateMood();
      updateDialReadout();
    }

    function tapBar(key) {
      if (mode === 'm3') return;
      const bar = BARS.find((b) => b.key === key);
      const value = bar.gridlines * scale;
      readings.set(key, value);
      const ref = barRefs[key];
      ref.chip.textContent = String(value);
      ref.chip.classList.add('show');
      ref.col.classList.add('read');
      sfx.blip(520 + BARS.indexOf(bar) * 40);
      const r = ref.col.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      sparkleBurst(stage, r.left - sr.left + r.width / 2, r.top - sr.top + 10, 6);
      checkModeProgress();
    }

    function checkModeProgress() {
      if (mode === 'm1' && !m1Revealed && scale === 5 && readings.has('swim')) {
        m1Revealed = true;
        dialState.disabled = true;
        later(() => { if (mode !== 'm1') return; buildQuiz(MISSIONS[0]); }, 420);
      } else if (mode === 'm2' && !m2Revealed && scale === 5 && readings.has('swim') && readings.has('tag')) {
        m2Revealed = true;
        const swimVal = readings.get('swim'); const tagVal = readings.get('tag');
        later(() => {
          if (!alive || mode !== 'm2') return;
          subStrip.innerHTML = `<b>${swimVal}</b> − <b>${tagVal}</b> = ?`;
          buildQuiz(MISSIONS[1]);
        }, 420);
      }
    }

    /* ----- quiz (MCQ, tap-to-answer — see fdp.js buildQuiz for the pattern) ----- */
    function buildQuiz(missionCfg) {
      quizrow.innerHTML = '';
      shuffle(missionCfg.options).forEach((opt) => {
        const c = el('button', 'anim-mchip', String(opt.v));
        c.addEventListener('click', () => {
          if (c.disabled) return;
          if (opt.correct) {
            sfx.win(); party(stage);
            quizrow.querySelectorAll('.anim-mchip').forEach((x) => { x.disabled = true; });
            c.classList.add('done');
            doneSet.add(missionCfg.id);
            paintChips();
            winBox.innerHTML = '';
            const w = el('div', 'bss-win',
              `<div class="wp">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} — <b>${opt.v}</b></div>`
              + `<div class="wk">${missionCfg.worked}</div>`);
            winBox.append(w);
            finishMission(w);
          } else {
            sfx.nudge();
            c.disabled = true;
            c.classList.add('wrongchip');
            toast(stage, opt.why);
          }
        });
        quizrow.append(c);
      });
    }

    function finishMission(w) {
      const allDone = doneSet.size === MISSIONS.length;
      if (allDone) ctx.complete();
      const undone = MODE_LABELS.filter((m) => m.key !== 'free' && !doneSet.has(m.key));
      if (undone.length) {
        const nb = el('button', 'btn btn-gold', 'NEXT ONE ➡');
        nb.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        nb.addEventListener('click', () => { sfx.ui(); start(undone[0].key); });
        w.append(nb);
      } else {
        const fp = el('button', 'btn btn-gold', 'FREE PLAY 🎛️');
        fp.style.cssText = 'margin-top:8px;padding:10px 22px;font-size:15px;';
        fp.addEventListener('click', () => { sfx.ui(); start('free'); });
        w.append(fp);
        later(() => { if (alive) bubble(stage, { title: 'THE SCALE IS THE DECODER RING! 🔍', text: AHA_TEXT, img: BARRY_IMG }); }, 550);
      }
    }

    /* ----- mode switching ----- */
    function paintChips() {
      chiprow.innerHTML = '';
      MODE_LABELS.forEach((m) => {
        const done = m.key !== 'free' && doneSet.has(m.key);
        const c = el('button', 'anim-mchip' + (m.key === mode ? ' active' : '') + (done ? ' done' : ''), m.label);
        c.addEventListener('click', () => { sfx.ui(); start(m.key); });
        chiprow.append(c);
      });
    }

    function start(modeKey) {
      mode = modeKey;
      m1Revealed = false; m2Revealed = false;
      clearReadingsVisual();
      quizrow.innerHTML = '';
      winBox.innerHTML = '';
      subStrip.innerHTML = '';
      paintChips();

      const isM3 = modeKey === 'm3';
      chartWrap.style.display = isM3 ? 'none' : '';
      dialWrap.style.display = isM3 ? 'none' : '';
      moodPanel.style.display = isM3 ? 'none' : '';
      pictoWrap.style.display = isM3 ? '' : 'none';
      // m2's dial is locked for a fair comparison, so hide the now-inert nudge buttons too
      nl.style.display = (isM3 || modeKey === 'm2') ? 'none' : '';
      nr.style.display = (isM3 || modeKey === 'm2') ? 'none' : '';

      if (modeKey === 'm1') {
        q.textContent = 'Turn the SCALE DIAL to ×5. Then tap the SWIMMING 🏊 bar with your spyglass.';
        qsub.textContent = 'Read the true number, then tap it below.';
        dialState.disabled = false;
        dialLockNote.textContent = '';
        dialSetInstant(0);
        scale = 1; updateAxisLabels(); updateMood(); updateDialReadout();
      } else if (modeKey === 'm2') {
        q.textContent = 'How many MORE pupils came to SWIM 🏊 than played TAG 🏃?';
        qsub.textContent = 'Tap both bars to read them, then pick the difference.';
        dialState.disabled = true;
        dialLockNote.textContent = '🔒 dial locked at ×5 — so it’s a fair comparison';
        dialSetInstant(DIAL_STOPS.indexOf(5));
        scale = 5; updateAxisLabels(); updateMood(); updateDialReadout();
      } else if (modeKey === 'm3') {
        q.textContent = 'BONUS: Barry’s cousins keep a pictogram of ball-club selfies.';
        qsub.textContent = 'Each ⚽ is worth 4. Tap the row to count them up.';
        pictoRead = false;
        pictoCard.classList.remove('read');
      } else {
        q.textContent = 'Free play — turn the dial, tap any bar (or Barry’s own mood chart) to read it.';
        qsub.textContent = 'Nothing to lock in here — just see how the SAME bars mean different numbers.';
        dialState.disabled = false;
        dialLockNote.textContent = '';
        dialSetInstant(0);
        scale = 1; updateAxisLabels(); updateMood(); updateDialReadout();
      }
    }

    nl.addEventListener('click', () => dialNudge(-1));
    nr.addEventListener('click', () => dialNudge(1));
    reset.addEventListener('click', () => {
      sfx.ui();
      if (mode === 'm3') { pictoRead = false; pictoCard.classList.remove('read'); quizrow.innerHTML = ''; return; }
      clearReadingsVisual();
      quizrow.innerHTML = '';
      winBox.innerHTML = '';
      subStrip.innerHTML = '';
      m1Revealed = false; m2Revealed = false;
      if (mode === 'm1' || mode === 'free') { dialState.disabled = false; dialSettleTo(0); }
    });

    const onResize = () => { dialLayout(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    dialLayout(); // measure the dial's real pixel width now it's in the live DOM
    start('m1');

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (dialState.cancelTween) dialState.cancelTween();
      dialDrag.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};

/* ---------- scoped CSS (prefix bss-) ---------- */
const CSS = `
.bss-q { text-align: center; font-weight: 700; font-size: clamp(16px, 2.6vw, 21px); margin-bottom: 2px; }
.bss-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; }
.bss-chartcard { background: var(--card); border-radius: 16px; box-shadow: var(--shadow-card); padding: 16px 12px 8px 40px; max-width: 620px; margin: 0 auto; }
.bss-plot { position: relative; height: 170px; }
.bss-axis { position: absolute; inset: 0; pointer-events: none; }
.bss-tick { position: absolute; left: 0; right: 0; border-top: 1px dashed rgba(51,38,29,.3); }
.bss-ticklabel { position: absolute; left: -34px; width: 28px; text-align: right; font-size: 11px; color: var(--ink); opacity: .75; transform: translateY(-50%); font-weight: 600; }
.bss-bars { position: relative; z-index: 1; display: flex; gap: 12px; height: 100%; align-items: flex-end; border-bottom: 3px solid var(--ink); }
.bss-barcol { position: relative; flex: 1 1 0; max-width: 92px; height: 100%; display: flex; align-items: flex-end; justify-content: center; background: none; border: none; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; font: inherit; }
.bss-barfill { width: 68%; border: 3px solid var(--ink); border-radius: 9px 9px 0 0; box-shadow: 0 3px 0 rgba(51,38,29,.25); transition: box-shadow .2s; }
.bss-barcol.read .bss-barfill { box-shadow: 0 0 0 4px rgba(244,197,66,.6), 0 3px 0 rgba(51,38,29,.25); }
.bss-baremoji { position: absolute; top: -28px; left: 50%; transform: translateX(-50%); font-size: 19px; }
.bss-chip {
  position: absolute; left: 50%; transform: translate(-50%, 0) scale(.6); background: #241d15; color: var(--stink-lime);
  font-weight: 700; font-size: 13px; padding: 4px 9px; border-radius: 999px; box-shadow: 0 3px 6px rgba(0,0,0,.3);
  opacity: 0; pointer-events: none; white-space: nowrap; z-index: 2;
}
.bss-chip.show { opacity: 1; animation: bssChipPop .3s var(--spring) both; }
@keyframes bssChipPop { 0% { transform: translate(-50%,6px) scale(.5); opacity: 0; } 100% { transform: translate(-50%,0) scale(1); opacity: 1; } }
.bss-labels { display: flex; gap: 12px; padding-left: 0; margin-top: 6px; }
.bss-labelitem { flex: 1 1 0; max-width: 92px; text-align: center; font-size: 11.5px; font-weight: 700; color: var(--ink); }
.bss-dialwrap { max-width: 380px; margin: 16px auto 0; }
.bss-dialtitle { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: .08em; color: #a08c74; margin-bottom: 4px; }
.bss-dialbar { position: relative; height: 30px; margin: 0 20px; touch-action: none; }
.bss-dialbar::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 14px; transform: translateY(-50%); background: linear-gradient(180deg,#efe1c4,#e8d7b4); border-radius: 999px; box-shadow: inset 0 2px 6px rgba(51,38,29,.22); }
.bss-dialfill { position: absolute; left: 0; top: 50%; height: 14px; transform: translateY(-50%); width: 0; background: linear-gradient(180deg, var(--stink), #7a3fae); border-radius: 999px 0 0 999px; pointer-events: none; }
.bss-dialticks { position: absolute; inset: 0; pointer-events: none; }
.bss-dialtick { position: absolute; top: 50%; width: 3px; height: 20px; background: rgba(51,38,29,.28); transform: translate(-50%,-50%); border-radius: 2px; }
.bss-dialhandle { position: absolute; top: 50%; width: 40px; height: 40px; transform: translate(-50%,-50%); font-size: 22px; display: flex; align-items: center; justify-content: center; z-index: 4; pointer-events: none; filter: drop-shadow(0 3px 5px rgba(0,0,0,.35)); }
.bss-dialhit { position: absolute; left: -20px; right: -20px; top: -22px; bottom: -22px; z-index: 5; cursor: grab; touch-action: none; }
.bss-dialbar.dragging .bss-dialhit { cursor: grabbing; }
.bss-diallabels { display: flex; margin: 6px 20px 0; }
.bss-diallabel { flex: 1; text-align: center; font-size: 12px; font-weight: 700; color: #a08c74; }
.bss-diallabel.active { color: var(--gold-deep); }
.bss-dialreadout { text-align: center; font-weight: 700; font-size: 13.5px; color: var(--ink); margin-top: 6px; }
.bss-dialreadout b { color: var(--gold-deep); }
.bss-diallock { text-align: center; font-size: 11.5px; color: #6b5744; font-weight: 600; margin-top: 3px; min-height: 1.2em; }
.bss-mood {
  display: flex; align-items: center; gap: 10px; justify-content: center; margin: 12px auto 0; max-width: 380px;
  background: var(--card); border: 2.5px solid var(--swamp-mid); border-radius: 14px; padding: 8px 14px;
}
.bss-moodface { font-size: 25px; }
.bss-moodtext { font-size: 12.5px; font-weight: 600; color: var(--ink); }
.bss-moodtext b { color: var(--stink); }
.bss-substrip { text-align: center; font-weight: 700; font-size: 18px; margin-top: 10px; color: var(--ink); }
.bss-substrip:empty { margin: 0; }
.bss-substrip b { color: var(--stink); }
.bss-pictocard {
  display: block; text-align: center; background: var(--card); border-radius: 14px; box-shadow: var(--shadow-card);
  padding: 16px; max-width: 380px; margin: 6px auto 0; cursor: pointer; border: 3px solid var(--swamp-mid); font: inherit;
}
.bss-pictotitle { font-weight: 700; font-size: 13.5px; color: var(--ink); }
.bss-pictorow { display: flex; gap: 4px; justify-content: center; margin: 12px 0; }
.bss-pictoball, .bss-pictohalf { font-size: 30px; }
.bss-pictohalf { display: inline-block; clip-path: inset(0 50% 0 0); }
.bss-pictokey { font-size: 12px; font-style: italic; color: #6b5744; }
.bss-pictocard.read { border-color: var(--gold-deep); }
.bss-quizrow .anim-mchip.wrongchip { opacity: .4; border-color: #c0392b; }
.bss-quizrow .anim-mchip.done { background: var(--correct); color: #fff; border-color: var(--correct); }
.bss-win {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 10px 14px;
  animation: animBubbleIn .34s var(--spring) both;
}
.bss-win .wp { font-weight: 700; color: #1d8f4e; font-size: 15.5px; }
.bss-win .wk { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
`;
