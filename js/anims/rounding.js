// FART QUEST — js/anims/rounding.js
// THE CATAPULT — interactive hill-and-camps rounding machine for the
// rounding Scout Report. Structure and interaction discipline follow
// decimals-x10.js (the house reference implementation).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const SIRR_IMG = 'assets/monsters/sir-roundbottom.png';
const RULE = 'Find the two camps. Look at the DECIDER digit only: 5 or more → fling UP. 4 or less → roll BACK.';
const LAW_HTML = '<b>THE LAW OF FIVE:</b> if the decider digit is <b>5 or more, the catapult ALWAYS flings UP.</b>';

/* ---------- pure hill-and-camps engine (unit-tested in scratch script — do not "improve") ---------- */
function computeCalc(num, unit) {
  const low = Math.floor(num / unit) * unit;
  const high = low + unit;
  const peak = low + unit / 2;
  const law = num === peak;
  const target = num >= peak ? high : low;
  const decider = unit === 10 ? num % 10 : Math.floor(num / 10) % 10;
  const startFrac = (num - low) / (high - low);
  return { num, unit, low, high, peak, law, target, decider, startFrac };
}
function numberSpotlightHTML(num, unit) {
  const s = String(num);
  const di = unit === 10 ? s.length - 1 : s.length - 2;
  let h = '';
  for (let i = 0; i < s.length; i += 1) {
    if (i === di) h += `<span class="cat-decider">${s[i]}</span>`;
    else if (i > di) h += `<span class="cat-noise">${s[i]}</span>`;
    else h += `<span class="cat-d">${s[i]}</span>`;
  }
  return h;
}

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', num: 74, unit: 10, worked: '74 sits between Camp 70 and Camp 80. The decider digit is 4 — four or less means ROLL BACK. Camp 70!' },
  { id: 'b', num: 78, unit: 10, worked: '78 sits between Camp 70 and Camp 80. The decider digit is 8 — five or more means FLING UP. Camp 80!' },
  { id: 'c', num: 75, unit: 10, worked: '75 is exactly halfway between Camp 70 and Camp 80. Decider digit 5 — the Law of Five flings UP. Camp 80!' },
  { id: 'd', num: 350, unit: 100, worked: '350 is exactly halfway between Camp 300 and Camp 400. Decider (tens) digit 5 — the Law of Five flings UP again. Camp 400!' },
  { id: 'e', num: 62, unit: 10, worked: '62 sits between Camp 60 and Camp 70. The decider digit is 2 — four or less means ROLL BACK. Camp 60!' },
];
const WIN_PHRASES = ['SPLENDID FLINGING! 🎯', 'THE HILL NEVER LIES!', 'CATAPULT MASTERED! 🏆', 'SIR R APPROVES! 🎩'];

/* ---------- hill geometry (pure) ---------- */
function geom(hostWidth) {
  const W = Math.max(300, Math.min(680, hostWidth - 6));
  const H = 190;
  const marginX = Math.max(56, W * 0.13);
  const base = H - 38;
  const peakH = 96;
  return { W, H, marginX, base, peakH, xA: marginX, xB: W - marginX };
}
function bump(f) { return 1 - (2 * f - 1) * (2 * f - 1); }
function xOf(g, f) { return g.xA + f * (g.xB - g.xA); }
function yOf(g, f) { return g.base - g.peakH * bump(f); }
function fracOfX(g, x) { return (x - g.xA) / (g.xB - g.xA); }
function hillPathD(g) {
  const N = 24; const pts = [];
  for (let i = 0; i <= N; i += 1) { const f = i / N; pts.push([xOf(g, f), yOf(g, f)]); }
  return `M ${pts[0][0].toFixed(1)} ${g.H} L ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} L ${g.xB.toFixed(1)} ${g.H} Z`;
}

/* ---------- the anim card ---------- */
export default {
  id: 'rounding',
  title: 'THE CATAPULT',

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const shownLaw = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('rounding', `
      .cat-q { text-align: center; font-weight: 700; font-size: clamp(19px, 3.2vw, 27px); margin-bottom: 2px; }
      .cat-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
      .cat-numbox {
        display: flex; justify-content: center; align-items: baseline; gap: 2px; margin: 0 auto 12px;
        background: #241d15; border-radius: 12px; padding: 8px 20px; width: fit-content;
        box-shadow: inset 0 3px 10px rgba(0,0,0,.6); border: 3px solid #4a3b28;
      }
      .cat-numbox .cat-d, .cat-numbox .cat-decider, .cat-numbox .cat-noise {
        font-size: clamp(24px, 4vw, 34px); font-weight: 700; color: var(--stink-lime); letter-spacing: .02em;
      }
      .cat-numbox .cat-decider {
        color: var(--gold); background: rgba(244,197,66,.18); border-radius: 8px; padding: 0 4px;
        text-shadow: 0 0 12px rgba(244,197,66,.5); position: relative;
      }
      .cat-numbox .cat-noise { color: #6b5c47; opacity: .55; }
      .cat-hillwrap {
        position: relative; margin: 0 auto; border-radius: 16px; overflow: visible; touch-action: none;
        background: linear-gradient(180deg, #cfeeff 0%, #eaf7dd 62%, #dff0c8 100%);
        box-shadow: inset 0 3px 8px rgba(51,38,29,.15); border: 3px solid rgba(51,38,29,.14);
      }
      .cat-hillsvg { position: absolute; inset: 0; }
      .cat-hillsvg path { fill: #8fc96b; }
      .cat-camp {
        position: absolute; bottom: 4px; transform: translateX(-50%);
        display: flex; flex-direction: column; align-items: center; gap: 1px;
        background: none; border: none; cursor: pointer; padding: 4px 6px; -webkit-user-select: none; user-select: none;
      }
      .cat-camp .cat-tent { font-size: 26px; filter: drop-shadow(0 3px 2px rgba(0,0,0,.25)); }
      .cat-camp .cat-campval {
        background: var(--card); border: 2.5px solid var(--swamp-mid); color: var(--ink); font-weight: 700;
        font-size: 14px; border-radius: 999px; padding: 3px 12px; box-shadow: 0 3px 0 rgba(0,0,0,.2);
      }
      .cat-camp.chosen .cat-campval { background: var(--swamp-mid); color: var(--stink-lime); }
      .cat-camp.chosen .cat-tent { animation: catTentPop .3s var(--spring) both; }
      @keyframes catTentPop { 0% { transform: scale(1); } 45% { transform: scale(1.28) rotate(-6deg); } 100% { transform: scale(1); } }
      .cat-camp.chosen::before {
        content: '👆 YOUR GUESS'; position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
        font-size: 9.5px; font-weight: 700; color: var(--gold-deep); white-space: nowrap;
      }
      .cat-camp.locked { pointer-events: none; opacity: .88; }
      .cat-sirr { position: absolute; z-index: 5; pointer-events: none; filter: drop-shadow(0 4px 5px rgba(0,0,0,.3)); }
      .cat-sirr.cat-boing { animation: catBoing .42s ease both; }
      @keyframes catBoing { 0%,100% { transform: scale(1,1); } 30% { transform: scale(1.22,.78); } 60% { transform: scale(.85,1.18); } }
      .cat-hit { position: absolute; z-index: 6; cursor: grab; touch-action: none; }
      .cat-hit:active { cursor: grabbing; }
      .cat-rollrow { display: flex; justify-content: center; margin-top: 12px; }
      .cat-dash {
        margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
        border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px;
        animation: animBubbleIn .34s var(--spring) both;
      }
      .cat-dash.retry { background: linear-gradient(180deg,#FFF3CE,#FBE29A); border-color: var(--gold-deep); }
      .cat-dash .cd-title { font-weight: 700; font-size: 16px; }
      .cat-dash.retry .cd-title { color: #7a5c08; }
      .cat-dash:not(.retry) .cd-title { color: #1d8f4e; }
      .cat-dash .cd-worked { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
      .cat-dash.retry .cd-worked { color: #7a5c08; }
      .cat-dash .cd-btn { margin-top: 9px; padding: 10px 22px; font-size: 15px; min-height: 44px; }
      .cat-rollbtn { font-size: 16px; padding: 13px 30px; min-height: 48px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'cat-q');
    const qsub = el('div', 'cat-qsub');
    const numbox = el('div', 'cat-numbox');
    const hillWrap = el('div', 'cat-hillwrap');
    const rollrow = el('div', 'cat-rollrow');
    const rollBtn = el('button', 'btn btn-gold cat-rollbtn', 'ROLL HIM! 🎯');
    rollrow.append(rollBtn);
    const dash = el('div');
    stage.append(chiprow, q, qsub, numbox, hillWrap, rollrow, dash);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    let calc = null;
    let predicted = null; // camp value the child stamped
    let rolling = false;
    let landed = false;
    let revealing = false; // true from the moment he lands until the reveal panel is on screen
    let attempts = 0;
    let cancelTween = null;
    let dragCtrl = null;
    const state = { frac: 0 };
    let campAEl = null; let campBEl = null; let sirEl = null; let hitEl = null; let pathEl = null;

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), `${m.num} → nearest ${m.unit}`);
        c.addEventListener('click', () => { if (revealing) return; sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function sirSize(g) { return Math.round(Math.max(46, Math.min(64, g.W * 0.1))); }
    function positionSirR(g, f, extraLift) {
      const w = sirSize(g); const h = Math.round(w * (700 / 671));
      const x = xOf(g, f); const y = yOf(g, f) - (extraLift || 0);
      sirEl.style.width = w + 'px'; sirEl.style.height = h + 'px';
      sirEl.style.left = (x - w / 2) + 'px';
      sirEl.style.top = (y - h) + 'px';
      hitEl.style.width = (w + 30) + 'px'; hitEl.style.height = (h + 30) + 'px';
      hitEl.style.left = (x - (w + 30) / 2) + 'px';
      hitEl.style.top = (y - h - 15) + 'px';
    }

    function layoutHill() {
      const g = geom(stage.clientWidth || 700);
      hillWrap.style.width = g.W + 'px';
      hillWrap.style.height = g.H + 'px';
      pathEl.setAttribute('d', hillPathD(g));
      hillWrap.querySelector('.cat-hillsvg').setAttribute('viewBox', `0 0 ${g.W} ${g.H}`);
      hillWrap.querySelector('.cat-hillsvg').setAttribute('width', g.W);
      hillWrap.querySelector('.cat-hillsvg').setAttribute('height', g.H);
      campAEl.style.left = xOf(g, 0) + 'px';
      campBEl.style.left = xOf(g, 1) + 'px';
      positionSirR(g, state.frac, 0);
      return g;
    }

    function buildMission() {
      if (dragCtrl) { dragCtrl.destroy(); dragCtrl = null; }
      hillWrap.innerHTML = '';
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'cat-hillsvg');
      pathEl = document.createElementNS(svgNS, 'path');
      svg.append(pathEl);
      campAEl = el('button', 'cat-camp', `<span class="cat-tent">⛺</span><span class="cat-campval">${calc.low}</span>`);
      campBEl = el('button', 'cat-camp', `<span class="cat-tent">⛺</span><span class="cat-campval">${calc.high}</span>`);
      sirEl = el('img', 'cat-sirr'); sirEl.src = SIRR_IMG; sirEl.alt = 'Sir Roundbottom';
      hitEl = el('div', 'cat-hit');
      hillWrap.append(svg, campAEl, campBEl, sirEl, hitEl);

      campAEl.addEventListener('click', () => choose(calc.low));
      campBEl.addEventListener('click', () => choose(calc.high));

      dragCtrl = makeDrag(hitEl, {
        enabled: () => alive && predicted !== null && !rolling && !landed,
        onStart() { sirEl.classList.remove('cat-boing'); },
        onMove(dx) {
          const cl = Math.max(-16, Math.min(16, dx * 0.4));
          const rot = Math.max(-10, Math.min(10, dx * 0.14));
          sirEl.style.transform = `translateX(${cl}px) rotate(${rot}deg)`;
        },
        onEnd() { sirEl.style.transform = ''; triggerRoll(); },
      });
      hitEl.addEventListener('click', () => {
        if (predicted === null) { sfx.nudge(); toast(stage, '🎪 Stamp a camp first — then roll him!'); }
      });
    }

    function choose(val) {
      if (rolling || landed) return;
      predicted = val;
      sfx.thud();
      campAEl.classList.toggle('chosen', val === calc.low);
      campBEl.classList.toggle('chosen', val === calc.high);
      qsub.textContent = 'Now drag Sir Roundbottom (or tap ROLL HIM!) and see where the hill sends him.';
    }

    function triggerRoll() {
      if (rolling || landed || predicted === null) return;
      rolling = true;
      campAEl.classList.add('locked'); campBEl.classList.add('locked');
      sfx.whoosh();
      const g = layoutHill();
      const startX = xOf(g, state.frac);
      const targetFrac = calc.target === calc.high ? 1 : 0;
      const targetX = xOf(g, targetFrac);
      if (calc.law) {
        sirEl.classList.add('cat-boing');
        later(() => { if (alive) sirEl.classList.remove('cat-boing'); }, 420);
        later(() => sfx.pop(), 90);
      }
      cancelTween = tween((x) => {
        const f = fracOfX(g, x);
        state.frac = f;
        let lift = 0;
        if (calc.law) {
          const progress = Math.max(0, Math.min(1, (x - startX) / (targetX - startX)));
          lift = Math.sin(progress * Math.PI) * 44;
        }
        positionSirR(g, f, lift);
      }, startX, targetX, calc.law ? 640 : 520, onRollDone);
    }

    function onRollDone() {
      if (!alive) return;
      cancelTween = null;
      rolling = false;
      landed = true;
      revealing = true;
      sfx.drop();
      if (calc.law && !shownLaw.has(calc.num)) {
        shownLaw.add(calc.num);
        later(() => {
          bubble(stage, {
            title: 'THE LAW OF FIVE 📜',
            text: `${LAW_HTML} ${calc.num} sits exactly halfway between Camp ${calc.low} and Camp ${calc.high} — no arguments, no exceptions, no take-backsies!`,
            img: SIRR_IMG,
          }).then(() => { if (alive) finishReveal(); });
        }, 260);
      } else {
        later(() => finishReveal(), 260);
      }
    }

    function finishReveal() {
      revealing = false;
      const correct = predicted === calc.target;
      const g = layoutHill();
      if (correct) {
        sfx.win(); party(stage);
        sparkleBurst(stage, xOf(g, state.frac) + hillWrap.offsetLeft, yOf(g, state.frac) + hillWrap.offsetTop);
        doneSet.add(MISSIONS[mi].id);
        paintChips();
        const d = el('div', 'cat-dash',
          `<div class="cd-title">${WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)]} Sir R rolled to Camp <b>${calc.target}</b>!</div>`
          + `<div class="cd-worked">${MISSIONS[mi].worked}</div>`);
        dash.innerHTML = ''; dash.append(d);
        if (doneSet.size === MISSIONS.length) ctx.complete();
        const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
        const btn = el('button', 'btn btn-gold cd-btn', nextIdx !== -1 ? 'NEXT ONE ➡' : 'FLING AGAIN 🎯');
        btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
        d.append(btn);
      } else {
        attempts += 1;
        sfx.nudge();
        let hint = `You stamped Camp ${predicted}, but the hill told the truth: Camp ${calc.target}.`;
        if (attempts >= 2) hint += ` <br><br>🎩 Psst: the decider digit is <b>${calc.decider}</b> — ${calc.decider >= 5 ? '5 or more ALWAYS flings UP.' : '4 or less ALWAYS rolls BACK.'}`;
        const d = el('div', 'cat-dash retry',
          `<div class="cd-title">Ooh, so close!</div><div class="cd-worked">${hint}</div>`);
        dash.innerHTML = ''; dash.append(d);
        const btn = el('button', 'anim-ghostbtn cd-btn', '↩ TRY AGAIN');
        btn.addEventListener('click', () => { sfx.ui(); tryAgain(); });
        d.append(btn);
      }
    }

    function tryAgain() {
      predicted = null; landed = false; rolling = false;
      campAEl.classList.remove('chosen', 'locked');
      campBEl.classList.remove('chosen', 'locked');
      dash.innerHTML = '';
      qsub.textContent = 'Stamp your prediction on a camp, then drag Sir Roundbottom (or tap ROLL HIM!).';
      const g = layoutHill();
      const fromX = xOf(g, state.frac);
      const toX = xOf(g, calc.startFrac);
      if (cancelTween) { cancelTween(); cancelTween = null; }
      cancelTween = tween((x) => { state.frac = fracOfX(g, x); positionSirR(g, state.frac, 0); }, fromX, toX, 380, () => { cancelTween = null; });
    }

    function start(i) {
      if (cancelTween) { cancelTween(); cancelTween = null; }
      mi = i;
      const mission = MISSIONS[i];
      calc = computeCalc(mission.num, mission.unit);
      predicted = null; rolling = false; landed = false; revealing = false; attempts = 0;
      state.frac = calc.startFrac;
      dash.innerHTML = '';
      q.innerHTML = `Round <b>${calc.num}</b> to the nearest ${calc.unit}.`;
      qsub.textContent = 'Stamp your prediction on a camp, then drag Sir Roundbottom (or tap ROLL HIM!).';
      numbox.innerHTML = numberSpotlightHTML(calc.num, calc.unit);
      paintChips();
      buildMission();
      layoutHill();
    }

    rollBtn.addEventListener('click', () => {
      if (predicted === null) { sfx.nudge(); toast(stage, '🎪 Stamp a camp first — then roll him!'); return; }
      if (rolling || landed) return;
      triggerRoll();
    });

    const onResize = () => {
      if (!alive) return;
      if (cancelTween) { cancelTween(); cancelTween = null; }
      if (dragCtrl) dragCtrl.abort();
      if (sirEl) sirEl.style.transform = '';
      rolling = false;
      layoutHill();
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (cancelTween) cancelTween();
      if (dragCtrl) dragCtrl.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
