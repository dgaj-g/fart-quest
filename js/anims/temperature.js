// FART QUEST — js/anims/temperature.js
// THE ZERO BRIDGE — interactive vertical thermometer for the temperature
// Scout Report. Structure and interaction discipline follow decimals-x10.js
// and rounding.js (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, party, injectCss } from './_kit.js';

const GEEZER_IMG = 'assets/monsters/freezer-geezer.png';
const RULE = 'Crossing zero? Count to zero first, then keep going. Two small jumps beat one big slip.';

/* ---------- pure scale engine (unit-tested in scratch script — do not "improve") ---------- */
const MIN = -10, MAX = 10;
const TRACK_H = 280;
function clampVal(v) { return Math.max(MIN, Math.min(MAX, v)); }
function valueToY(v) { return TRACK_H * (MAX - v) / (MAX - MIN); }
function yToValue(y) { return MAX - (y / TRACK_H) * (MAX - MIN); }
// distance-through-zero: how much of the A..P interval is below zero (blue)
// and how much is above zero (orange). Zero is never double-counted because
// it's a single continuous interval split at one point, not two hops.
function segLens(A, P) {
  const loA = Math.min(A, P), hiA = Math.max(A, P);
  const blueLen = Math.max(0, Math.min(hiA, 0) - loA);
  const orangeLen = Math.max(0, hiA - Math.max(loA, 0));
  return { blueLen, orangeLen, total: blueLen + orangeLen };
}
function fmt(v) { return v < 0 ? ('−' + Math.abs(v)) : String(v); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

/* ---------- geometry constants (fixed-size widget; comfortably fits 640–980px hosts) ---------- */
const STAGE_W = 260;
const TUBE_X = 130, TUBE_W = 54;
const TRACK_TOP = 60;
const BEAD_D = 36;
const CARD_W = 60, CARD_H = 44, HOME_Y = 26;
const LANES = [40, 130, 220];
const LABEL_R = TUBE_X - TUBE_W / 2 - 4, LABEL_W = 26;
const RIGHT_X = TUBE_X + TUBE_W / 2 + 6;
const absY = (v) => TRACK_TOP + valueToY(v);

/* ---------- content ---------- */
const MISSIONS = [
  { id: 'a', kind: 'bridge', start: -3, target: 8,
    q: 'How far apart are <b>−3°C</b> and <b>8°C</b>?',
    sub: 'Drag the marker up from the flag to 8°C — watch the bridge build as you cross zero.',
    worked: '−3°C to 0°C is 3 steps. 0°C to 8°C is 8 steps. 3 + 8 = 11°C apart.' },
  { id: 'b', kind: 'bridge', start: -7, target: 2,
    q: 'How far apart are <b>−7°C</b> and <b>2°C</b>?',
    sub: 'Drag the marker up from the flag to 2°C — watch the bridge build as you cross zero.',
    worked: '−7°C to 0°C is 7 steps. 0°C to 2°C is 2 steps. 7 + 2 = 9°C apart.' },
  { id: 'c', kind: 'shift', start: 1, delta: -4, target: -3,
    q: '<b>4 degrees colder</b> than 1°C — where do you land?',
    sub: 'Drag the marker DOWN from the flag. Don’t stop at zero — keep going.',
    worked: '1°C down to 0°C is 1 step. The fall is 4°C, so 4 − 1 = 3 more steps continue BELOW zero. That lands on −3°C.' },
  { id: 'd', kind: 'order', cards: [-6, 2, -1],
    q: 'Drag all three cards onto the thermometer, coldest first.',
    sub: 'Place all three at their own temperature, then tap CHECK. Colder always sits further down.',
    worked: 'Coldest to warmest: −6°C, −1°C, 2°C — colder always sits further below zero.' },
];
const WIN_PHRASES = ['BRIDGE BUILT! 🌉', 'ZERO CROSSED CLEANLY!', 'FREEZER GEEZER APPROVES! 🧊', 'NOT COUNTED TWICE!'];

const CSS = `
.zbr-q { text-align: center; font-weight: 700; font-size: clamp(18px, 3vw, 25px); margin-bottom: 2px; }
.zbr-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
.zbr-main { display: flex; align-items: flex-end; justify-content: center; gap: 10px; }
.zbr-geezer { width: 62px; flex: 0 0 auto; margin-bottom: ${Math.round(TRACK_TOP + TRACK_H * 0.42)}px;
  filter: drop-shadow(0 4px 5px rgba(0,0,0,.3)); animation: zbrBob 2.6s ease-in-out infinite; }
@keyframes zbrBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.zbr-stagearea { position: relative; width: ${STAGE_W}px; height: ${TRACK_TOP + TRACK_H + 20}px; touch-action: none; }
.zbr-tube {
  position: absolute; left: ${TUBE_X - TUBE_W / 2}px; top: ${TRACK_TOP}px; width: ${TUBE_W}px; height: ${TRACK_H}px;
  background: linear-gradient(180deg,#eef6fb,#dcecf5); border: 3px solid rgba(51,38,29,.22); border-radius: 15px;
  box-shadow: inset 0 3px 8px rgba(51,38,29,.18); overflow: hidden; z-index: 1;
}
.zbr-bulb {
  position: absolute; left: ${TUBE_X - TUBE_W / 2 - 8}px; top: ${TRACK_TOP + TRACK_H - 10}px;
  width: ${TUBE_W + 16}px; height: ${TUBE_W + 16}px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, #dcecf5 60%, #b9d3e6); border: 3px solid rgba(51,38,29,.22);
  box-shadow: inset 0 -4px 8px rgba(51,38,29,.15); z-index: 0;
}
.zbr-tick { position: absolute; left: ${TUBE_X - TUBE_W / 2}px; width: ${TUBE_W}px; height: 1.5px; background: rgba(51,38,29,.16); z-index: 2; }
.zbr-tick.major { height: 2px; background: rgba(51,38,29,.32); }
.zbr-ticklabel {
  position: absolute; left: ${LABEL_R - LABEL_W}px; width: ${LABEL_W}px; text-align: right;
  transform: translateY(-50%); font-size: 10px; font-weight: 700; color: #6b5744; z-index: 2;
}
.zbr-ticklabel.zero { color: var(--gold-deep); font-size: 11px; }
.zbr-zero {
  position: absolute; left: ${TUBE_X - TUBE_W / 2 - 5}px; width: ${TUBE_W + 10}px; height: 4px; border-radius: 3px;
  background: var(--gold); box-shadow: 0 0 8px 2px rgba(244,197,66,.55); z-index: 3; transform: translateY(-50%);
}
.zbr-zero.flash { animation: zbrZeroFlash .6s ease; }
@keyframes zbrZeroFlash {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(244,197,66,.55); }
  40% { box-shadow: 0 0 22px 10px rgba(244,197,66,.95); transform: translateY(-50%) scaleY(2.4); }
}
.zbr-fill { position: absolute; left: ${TUBE_X - TUBE_W / 2}px; width: ${TUBE_W}px; z-index: 2; border-radius: 3px; }
.zbr-fill.blue { background: linear-gradient(180deg,#8fd0f2,#4fa8db); }
.zbr-fill.orange { background: linear-gradient(180deg,#ffbf7a,#ff9a3d); }
.zbr-badge {
  position: absolute; left: ${RIGHT_X}px; transform: translateY(-50%); font-size: 11px; font-weight: 700; color: #fff;
  background: rgba(51,38,29,.75); border-radius: 999px; padding: 2px 8px; white-space: nowrap; z-index: 4; pointer-events: none;
}
.zbr-flag {
  position: absolute; right: ${STAGE_W - (TUBE_X - TUBE_W / 2 - 8)}px; transform: translateY(-50%);
  display: flex; align-items: center; gap: 3px; z-index: 4; pointer-events: none; white-space: nowrap;
}
.zbr-flag .zf-pin { font-size: 15px; }
.zbr-flag .zf-label {
  background: var(--card); border: 2px solid var(--swamp-mid); border-radius: 999px; padding: 2px 7px;
  font-size: 10.5px; font-weight: 700; color: var(--ink);
}
.zbr-bead {
  position: absolute; width: ${BEAD_D}px; height: ${BEAD_D}px; left: ${TUBE_X - BEAD_D / 2}px; transform: translateY(-50%);
  border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #bfe6ff 55%, #5cb3e0);
  border: 3px solid #2f7fae; box-shadow: 0 3px 0 rgba(0,0,0,.25); z-index: 6;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.zbr-hit { position: absolute; z-index: 7; cursor: grab; touch-action: none; }
.zbr-hit:active { cursor: grabbing; }
.zbr-beadlabel {
  position: absolute; left: ${RIGHT_X}px; transform: translateY(-50%); z-index: 6; pointer-events: none;
  background: #241d15; color: var(--stink-lime); font-weight: 700; font-size: 12px; border-radius: 999px;
  padding: 3px 9px; box-shadow: 0 2px 6px rgba(0,0,0,.3); white-space: nowrap;
}
.zbr-tray { position: absolute; left: 0; top: 0; width: 100%; height: ${TRACK_TOP}px; z-index: 8; }
.zbr-card {
  position: absolute; width: ${CARD_W}px; height: ${CARD_H}px; margin-left: ${-CARD_W / 2}px; margin-top: ${-CARD_H / 2}px;
  background: var(--card); border: 2.5px solid var(--swamp-mid); border-radius: 11px; box-shadow: 0 3px 0 rgba(0,0,0,.2);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12.5px; color: var(--ink);
  cursor: grab; touch-action: none; z-index: 9; -webkit-user-select: none; user-select: none;
}
.zbr-card.dragging { cursor: grabbing; }
.zbr-card.correct { background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border-color: var(--correct); color: #1d8f4e; cursor: default; }
.zbr-card.correct::after { content: ' ✓'; }
.zbr-card.wrong { animation: zbrCardWobble .5s ease; }
@keyframes zbrCardWobble { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 60% { transform: rotate(7deg); } }
.zbr-counterwrap { display: flex; justify-content: center; margin-top: 12px; }
.zbr-counter {
  background: var(--swamp-mid); color: var(--parchment); border-radius: 12px; padding: 9px 15px;
  font-weight: 700; font-size: clamp(12.5px, 2vw, 14.5px); box-shadow: 0 3px 0 rgba(0,0,0,.3); text-align: center; min-width: 220px;
}
.zbr-counter b { color: var(--stink-lime); }
.zbr-resultcard {
  margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF);
  border: 3px solid var(--correct); border-radius: 14px; padding: 11px 16px; animation: animBubbleIn .34s var(--spring) both;
}
.zbr-resultcard.retry { background: linear-gradient(180deg,#FFF3CE,#FBE29A); border-color: var(--gold-deep); }
.zbr-resultcard .zc-title { font-weight: 700; font-size: 16px; color: #1d8f4e; }
.zbr-resultcard.retry .zc-title { color: #7a5c08; }
.zbr-resultcard .zc-worked { font-size: 13.5px; color: #4d6b58; font-weight: 500; margin-top: 3px; }
.zbr-resultcard.retry .zc-worked { color: #7a5c08; }
.zbr-resultcard .zc-btn { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
`;

/* ---------- the anim card ---------- */
export default {
  id: 'temperature',
  title: 'THE ZERO BRIDGE',

  mount(host, ctx) {
    let alive = true;
    let crossTaught = false;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };

    injectCss('temperature', CSS);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'zbr-q');
    const qsub = el('div', 'zbr-qsub');
    const geezerImg = el('img', 'zbr-geezer'); geezerImg.src = GEEZER_IMG; geezerImg.alt = 'Freezer Geezer';
    const stageArea = el('div', 'zbr-stagearea');
    const main = el('div', 'zbr-main'); main.append(geezerImg, stageArea);
    const counterWrap = el('div', 'zbr-counterwrap');
    const counter = el('div', 'zbr-counter'); counterWrap.append(counter);
    const controls = el('div', 'anim-controls');
    const nu = el('button', 'anim-nudge', '⬆');
    const lock = el('button', 'btn btn-gold', 'LOCK IT IN 💨');
    const nd = el('button', 'anim-nudge', '⬇');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET');
    controls.append(nu, lock, nd, resetBtn);
    const resultBox = el('div');
    stage.append(chiprow, q, qsub, main, counterWrap, controls, resultBox);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;';
    host.append(ruleCard);

    let mi = 0;
    let mission = null;
    let widget = null;
    let attempts = 0;
    let zeroPlank = null;

    function chipLabel(m) {
      if (m.kind === 'order') return 'COLDEST FIRST 🔢';
      if (m.kind === 'shift') return `${fmt(m.start)}° ${m.delta < 0 ? '−' : '+'} ${Math.abs(m.delta)}`;
      return `${fmt(m.start)}° ↔ ${fmt(m.target)}°`;
    }
    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), chipLabel(m));
        c.addEventListener('click', () => { if (widget && widget.busy()) return; sfx.ui(); start(i); });
        chiprow.append(c);
      });
    }

    function updateCounter(blueLen, orangeLen) {
      if (blueLen === 0 && orangeLen === 0) { counter.innerHTML = 'no distance yet — drag the marker!'; return; }
      const parts = [];
      if (blueLen > 0) parts.push(`<b>${blueLen}°C</b> below zero`);
      if (orangeLen > 0) parts.push(`<b>${orangeLen}°C</b> above zero`);
      counter.innerHTML = `${parts.join(' + ')} = <b>${blueLen + orangeLen}°C</b>`;
    }

    function buildScaffold() {
      const tube = el('div', 'zbr-tube');
      const bulb = el('div', 'zbr-bulb');
      stageArea.append(bulb, tube);
      for (let v = MIN; v <= MAX; v += 1) {
        if (v === 0) continue;
        const major = v % 2 === 0;
        const t = el('div', 'zbr-tick' + (major ? ' major' : ''));
        t.style.top = absY(v) + 'px';
        stageArea.append(t);
        if (major) {
          const lab = el('div', 'zbr-ticklabel', fmt(v));
          lab.style.top = absY(v) + 'px';
          stageArea.append(lab);
        }
      }
      zeroPlank = el('div', 'zbr-zero');
      zeroPlank.style.top = absY(0) + 'px';
      stageArea.append(zeroPlank);
      const zeroLabel = el('div', 'zbr-ticklabel zero', '0');
      zeroLabel.style.top = absY(0) + 'px';
      stageArea.append(zeroLabel);
    }

    /* ---------- bridge / shift widget: one draggable marker on the tube ---------- */
    function buildBeadWidget(m) {
      let local = valueToY(m.start);
      let settledValue = m.start;
      let headingValue = m.start;
      let cancelTween = null;
      let crossFlashed = false;

      const flag = el('div', 'zbr-flag', `<span class="zf-pin">🚩</span><span class="zf-label">START ${fmt(m.start)}°C</span>`);
      flag.style.top = absY(m.start) + 'px';
      const fillBlue = el('div', 'zbr-fill blue');
      const fillOrange = el('div', 'zbr-fill orange');
      const badgeBlue = el('div', 'zbr-badge');
      const badgeOrange = el('div', 'zbr-badge');
      const bead = el('div', 'zbr-bead', '❄️');
      const beadLabel = el('div', 'zbr-beadlabel');
      const hit = el('div', 'zbr-hit');
      stageArea.append(fillBlue, fillOrange, flag, badgeBlue, badgeOrange, bead, beadLabel, hit);

      function paint(vFloat) {
        const { blueLen, orangeLen } = segLens(m.start, vFloat);
        const loA = Math.min(m.start, vFloat), hiA = Math.max(m.start, vFloat);
        if (blueLen > 0.001) {
          const v2 = Math.min(hiA, 0);
          const top = absY(v2), bot = absY(loA);
          fillBlue.style.display = ''; fillBlue.style.top = top + 'px'; fillBlue.style.height = (bot - top) + 'px';
          badgeBlue.style.display = ''; badgeBlue.style.top = (top + (bot - top) / 2) + 'px';
          badgeBlue.textContent = Math.round(blueLen) + '°C';
        } else { fillBlue.style.display = 'none'; badgeBlue.style.display = 'none'; }
        if (orangeLen > 0.001) {
          const v1 = Math.max(loA, 0);
          const top = absY(hiA), bot = absY(v1);
          fillOrange.style.display = ''; fillOrange.style.top = top + 'px'; fillOrange.style.height = (bot - top) + 'px';
          badgeOrange.style.display = ''; badgeOrange.style.top = (top + (bot - top) / 2) + 'px';
          badgeOrange.textContent = Math.round(orangeLen) + '°C';
        } else { fillOrange.style.display = 'none'; badgeOrange.style.display = 'none'; }
        const y = absY(vFloat);
        bead.style.top = y + 'px';
        beadLabel.style.top = y + 'px';
        beadLabel.textContent = fmt(Math.round(vFloat)) + '°C';
        hit.style.left = (TUBE_X - 32) + 'px'; hit.style.top = (y - 32) + 'px'; hit.style.width = '64px'; hit.style.height = '64px';
        if (blueLen > 0.001 && orangeLen > 0.001 && !crossFlashed) {
          crossFlashed = true;
          zeroPlank.classList.remove('flash'); void zeroPlank.offsetWidth; zeroPlank.classList.add('flash');
          sfx.sparkle();
        }
      }

      function settle(targetInt) {
        headingValue = targetInt;
        if (cancelTween) cancelTween();
        const toLocal = valueToY(targetInt);
        cancelTween = tween((v) => { local = v; paint(clampVal(yToValue(v))); }, local, toLocal, 260, () => {
          cancelTween = null;
          settledValue = targetInt;
          if (!alive) return;
          sfx.settle();
          const { blueLen, orangeLen } = segLens(m.start, targetInt);
          updateCounter(Math.round(blueLen), Math.round(orangeLen));
          if (!crossTaught && blueLen > 0 && orangeLen > 0) {
            crossTaught = true;
            later(() => bubble(stage, {
              title: 'THE ZERO BRIDGE 🌉',
              text: `${RULE} Zero is the bridge’s only middle post — you’ll never count it twice.`,
              img: GEEZER_IMG,
            }), 300);
          }
        });
      }

      let dragBaseLocal = local;
      const drag = makeDrag(hit, {
        enabled: () => alive,
        onStart() {
          if (cancelTween) { cancelTween(); cancelTween = null; }
          dragBaseLocal = local;
          crossFlashed = false;
          bead.classList.add('dragging');
        },
        onMove(dx, dy) {
          local = Math.max(0, Math.min(TRACK_H, dragBaseLocal + dy));
          paint(clampVal(yToValue(local)));
        },
        onEnd() {
          bead.classList.remove('dragging');
          const target = Math.round(clampVal(yToValue(local)));
          settle(target);
        },
      });

      paint(m.start);
      updateCounter(0, 0);

      return {
        value: () => settledValue,
        busy: () => drag.dragging() || !!cancelTween,
        nudge(dir) {
          if (drag.dragging()) return;
          const next = clampVal(headingValue + dir);
          if (next === headingValue) { sfx.nudge(); return; }
          settle(next);
        },
        reset() { if (!drag.dragging()) settle(m.start); },
        abort() { drag.abort(); if (cancelTween) { cancelTween(); cancelTween = null; } },
        destroy() { if (cancelTween) cancelTween(); drag.destroy(); },
      };
    }

    /* ---------- order widget: three draggable cards placed on the tube ---------- */
    function buildCardWidget(m) {
      const tray = el('div', 'zbr-tray');
      stageArea.append(tray);
      const order = shuffle(m.cards.slice());
      const cards = order.map((val, idx) => {
        const homeX = LANES[idx];
        const c = el('div', 'zbr-card', fmt(val) + '°C');
        c.style.left = homeX + 'px'; c.style.top = HOME_Y + 'px';
        tray.append(c);
        const state = { val, homeX, x: homeX, y: HOME_Y, correct: false, cancel: null };
        const drg = makeDrag(c, {
          enabled: () => alive && !state.correct,
          onStart() {
            if (state.cancel) { state.cancel(); state.cancel = null; }
            c.classList.add('dragging');
            drg.baseX = state.x; drg.baseY = state.y;
          },
          onMove(dx, dy) {
            state.x = Math.max(30, Math.min(STAGE_W - 30, drg.baseX + dx));
            state.y = Math.max(HOME_Y - 6, Math.min(TRACK_TOP + TRACK_H, drg.baseY + dy));
            c.style.left = state.x + 'px'; c.style.top = state.y + 'px';
          },
          onEnd() { c.classList.remove('dragging'); },
        });
        return { el: c, state, drag: drg };
      });

      function valueOf(state) {
        if (state.y < TRACK_TOP - 10) return null;
        const rel = Math.max(0, Math.min(TRACK_H, state.y - TRACK_TOP));
        return clampVal(Math.round(yToValue(rel)));
      }
      function bounceHome(cd) {
        // Assign the combined canceller BEFORE starting either tween: tween()
        // fires its done callback SYNCHRONOUSLY when the card is already at
        // its target (e.g. never dragged, distance < 0.5px), which would
        // otherwise null cd.state.cancel and then have this line stomp the
        // null back to a live (dead) function — wedging busy() forever.
        let cancelX = null, cancelY = null;
        cd.state.cancel = () => { if (cancelX) cancelX(); if (cancelY) cancelY(); };
        cancelX = tween((v) => { cd.state.x = v; cd.el.style.left = v + 'px'; }, cd.state.x, cd.state.homeX, 380, () => {});
        cancelY = tween((v) => { cd.state.y = v; cd.el.style.top = v + 'px'; }, cd.state.y, HOME_Y, 380, () => { cd.state.cancel = null; });
      }
      function checkAll() {
        let allCorrect = true;
        cards.forEach((cd) => {
          if (cd.state.correct) return;
          const v = valueOf(cd.state);
          if (v === cd.state.val) {
            cd.state.correct = true;
            const y = absY(cd.state.val);
            cd.state.x = TUBE_X; cd.state.y = y;
            cd.el.style.left = TUBE_X + 'px'; cd.el.style.top = y + 'px';
            cd.el.classList.add('correct');
            sfx.pop();
          } else {
            allCorrect = false;
            cd.el.classList.remove('wrong'); void cd.el.offsetWidth; cd.el.classList.add('wrong');
            sfx.nudge();
            bounceHome(cd);
          }
        });
        return allCorrect;
      }
      function resetAll() {
        cards.forEach((cd) => {
          if (cd.state.cancel) cd.state.cancel();
          cd.state.correct = false;
          cd.el.classList.remove('correct', 'wrong');
          bounceHome(cd);
        });
      }
      return {
        checkAll,
        busy: () => cards.some((cd) => cd.drag.dragging() || cd.state.cancel),
        reset: resetAll,
        abort() { cards.forEach((cd) => { cd.drag.abort(); if (cd.state.cancel) { cd.state.cancel(); cd.state.cancel = null; } }); },
        destroy() { cards.forEach((cd) => { cd.drag.destroy(); if (cd.state.cancel) { cd.state.cancel(); cd.state.cancel = null; } }); },
      };
    }

    function showResult(kind, titleHtml, workedText) {
      resultBox.innerHTML = '';
      const d = el('div', 'zbr-resultcard' + (kind === 'retry' ? ' retry' : ''),
        `<div class="zc-title">${titleHtml}</div><div class="zc-worked">${workedText}</div>`);
      resultBox.append(d);
      if (kind === 'win') {
        const nextIdx = MISSIONS.findIndex((mm) => !doneSet.has(mm.id));
        const btn = el('button', 'btn btn-gold zc-btn', nextIdx !== -1 ? 'NEXT ONE ➡' : 'CROSS AGAIN 🌉');
        btn.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : mi); });
        d.append(btn);
      } else {
        const btn = el('button', 'anim-ghostbtn zc-btn', '↩ TRY AGAIN');
        btn.addEventListener('click', () => { sfx.ui(); resultBox.innerHTML = ''; });
        d.append(btn);
      }
    }

    function onWinLock() {
      doneSet.add(mission.id);
      sfx.win(); party(stage);
      paintChips();
      const { blueLen, orangeLen, total } = segLens(mission.start, mission.target);
      const eq = (blueLen > 0 && orangeLen > 0) ? `${Math.round(blueLen)} + ${Math.round(orangeLen)} = ` : '';
      showResult('win', `${pick(WIN_PHRASES)} ${eq}<b>${Math.round(total)}°C</b>`, mission.worked);
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }
    function onWrongLock(val) {
      attempts += 1;
      sfx.nudge();
      let text;
      if (val === mission.start) {
        text = mission.kind === 'bridge'
          ? `The marker’s still on the flag! Drag it up toward <b>${fmt(mission.target)}°C</b> and watch the bridge build.`
          : `The marker’s still on the flag! Drag it ${mission.delta < 0 ? 'DOWN' : 'UP'} — don’t stop at zero, keep going.`;
      } else {
        const wantUp = mission.target > mission.start;
        const gotUp = val > mission.start;
        if (val !== mission.start && gotUp !== wantUp) {
          text = `Wrong way! Go ${wantUp ? 'UP' : 'DOWN'} from the flag, not the other way.`;
        } else {
          const need = Math.abs(mission.target - mission.start);
          const got = Math.abs(val - mission.start);
          text = `${got > need ? 'That’s too far.' : 'Not quite far enough.'} Watch the bridge counters as you slide.`;
        }
      }
      if (attempts >= 2) text += `<br><br>🧊 Psst: land the marker on <b>${fmt(mission.target)}°C</b> exactly.`;
      bubble(stage, { title: 'KEEP CROSSING! 💪', text, img: GEEZER_IMG });
    }
    function onOrderWin() {
      doneSet.add(mission.id);
      sfx.win(); party(stage);
      paintChips();
      const sorted = mission.cards.slice().sort((a, b) => a - b);
      const strip = sorted.map((v) => fmt(v) + '°C').join(' → ');
      showResult('win', `${pick(WIN_PHRASES)} Coldest first: <b>${strip}</b>`, mission.worked);
      if (doneSet.size === MISSIONS.length) ctx.complete();
    }

    function start(i) {
      mi = i; mission = MISSIONS[i]; attempts = 0;
      resultBox.innerHTML = '';
      if (widget) { widget.destroy(); widget = null; }
      stageArea.innerHTML = '';
      buildScaffold();
      paintChips();
      q.innerHTML = mission.q;
      qsub.textContent = mission.sub;
      lock.textContent = mission.kind === 'order' ? 'CHECK ✅' : 'LOCK IT IN 💨';
      nu.style.display = mission.kind === 'order' ? 'none' : '';
      nd.style.display = mission.kind === 'order' ? 'none' : '';
      counterWrap.style.display = mission.kind === 'order' ? 'none' : '';
      widget = mission.kind === 'order' ? buildCardWidget(mission) : buildBeadWidget(mission);
    }

    nu.addEventListener('click', () => widget && widget.nudge && widget.nudge(1));
    nd.addEventListener('click', () => widget && widget.nudge && widget.nudge(-1));
    resetBtn.addEventListener('click', () => { if (!widget || widget.busy()) return; sfx.ui(); widget.reset(); });
    lock.addEventListener('click', () => {
      if (!widget || widget.busy()) return;
      sfx.ui();
      if (mission.kind === 'order') {
        const ok = widget.checkAll();
        if (ok) onOrderWin();
        else later(() => toast(stage, '🧭 Not quite — check each card sits at its OWN temperature.'), 500);
      } else {
        const val = widget.value();
        if (val === mission.target) onWinLock(); else onWrongLock(val);
      }
    });

    const onResize = () => { if (alive && widget && widget.abort) widget.abort(); };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      if (widget) widget.destroy();
      stage.remove();
      ruleCard.remove();
    };
  },
};
