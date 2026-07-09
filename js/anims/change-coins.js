// FART QUEST — js/anims/change-coins.js
// THE CHANGE CHUTE — interactive coin-counting machine for the change-coins
// Scout Report (Money Mines). Structure and interaction discipline follow
// decimals-x10.js / rounding.js (the house reference implementations).

import { el, sfx, tween, makeDrag, toast, bubble, sparkleBurst, party, injectCss } from './_kit.js';

const CHANGELING_IMG = 'assets/monsters/the-changeling.png';
const RULE = 'Don’t subtract — COUNT UP from the price to what you paid.';

/* ---------- pure chute engine (unit-tested in scratch script — do not "improve") ---------- */
export function dropOutcome(filled, gap, value, isTrap) {
  if (isTrap) return 'dissolve';
  const next = filled + value;
  if (next > gap) return 'overshoot';
  return next === gap ? 'complete' : 'fit';
}

export function computeGeom(hostWidth, gap) {
  const barWidth = Math.max(200, Math.min(560, hostWidth - 210));
  return { pxpp: barWidth / gap, barWidth };
}

/* ---------- content ---------- */
const COINS = [1, 2, 5, 10, 20, 50];
const FAKE_VALUE = 25;

const MISSIONS = [
  { id: 'a', price: 65, paid: 100, priceLabel: '65p', paidLabel: '£1 (100p)', trap: false, bonusTarget: 3 },
  { id: 'b', price: 27, paid: 50, priceLabel: '27p', paidLabel: '50p', trap: false, bonusTarget: null },
  { id: 'c', price: 45, paid: 100, priceLabel: '45p', paidLabel: '£1 (100p)', trap: true, bonusTarget: null },
];
const SANDBOX = [
  { price: 12, paid: 20, priceLabel: '12p', paidLabel: '20p' },
  { price: 83, paid: 100, priceLabel: '83p', paidLabel: '£1 (100p)' },
  { price: 34, paid: 50, priceLabel: '34p', paidLabel: '50p' },
];
const WIN_PHRASES = ['CHUTE FULL! 🪙', 'CHANGE COUNTED!', 'NOT A PENNY OUT! 🎯', 'COUNT-UP CHAMPION!'];

function hopsHTML(mission) {
  let running = mission.price;
  let out = `<span class="chc-hop">${mission.priceLabel}</span>`;
  mission.tiles.forEach((v) => {
    running += v;
    const label = running === mission.paid ? mission.paidLabel : `${running}p`;
    out += `<span class="chc-arrow">→</span><span class="chc-hop">${label}<span class="chc-plus">+${v}p</span></span>`;
  });
  return out;
}

/* ---------- the anim card ---------- */
export default {
  id: 'change-coins',
  title: 'THE CHANGE CHUTE',

  mount(host, ctx) {
    let alive = true;
    const doneSet = new Set();
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    const liveCancels = new Set();

    injectCss('change-coins', `
      .chc-q { text-align: center; font-weight: 700; font-size: clamp(17px, 2.9vw, 23px); margin-bottom: 2px; }
      .chc-q b { color: var(--gold-deep); }
      .chc-qsub { text-align: center; font-size: 12.5px; color: #6b5744; font-weight: 500; margin-bottom: 10px; min-height: 16px; }
      .chc-tray { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 4px 0 14px; touch-action: none; }
      .chc-coin {
        width: 56px; height: 56px; border-radius: 50%; border: none; cursor: grab;
        background: var(--swamp-deep); color: var(--gold); font-weight: 700; font-family: inherit;
        font-size: 13.5px; box-shadow: 0 4px 0 rgba(0,0,0,.3); -webkit-user-select: none; user-select: none;
        touch-action: none; position: relative;
      }
      .chc-coin.dragging { cursor: grabbing; box-shadow: 0 2px 0 rgba(0,0,0,.3); z-index: 5; }
      .chc-coin.trap { background: var(--card); color: var(--stink); border: 3px dashed var(--stink); box-shadow: none; }
      .chc-coin.chc-dissolving { animation: chcDissolve .48s ease both; pointer-events: none; }
      @keyframes chcDissolve {
        0% { transform: scale(1) rotate(0); opacity: 1; }
        50% { transform: scale(1.18) rotate(12deg); opacity: .7; }
        100% { transform: scale(.15) rotate(-30deg); opacity: 0; }
      }
      .chc-chutewrap { margin: 0 auto 6px; }
      .chc-chute { position: relative; margin: 0 auto; }
      .chc-labels { display: flex; justify-content: space-between; font-weight: 700; font-size: 12.5px; margin-bottom: 5px; padding: 0 2px; }
      .chc-pricepin { color: var(--stink); }
      .chc-paidpin { color: var(--gold-deep); }
      .chc-bar {
        position: relative; height: 52px; border-radius: 16px;
        background: repeating-linear-gradient(90deg, rgba(51,38,29,.06) 0 9px, transparent 9px 18px), linear-gradient(180deg,#efe1c4,#e8d7b4);
        box-shadow: inset 0 3px 8px rgba(51,38,29,.18); border: 3px dashed rgba(51,38,29,.28);
        touch-action: none; overflow: visible;
      }
      .chc-tile {
        position: absolute; top: 4px; bottom: 4px;
        background: var(--swamp-deep); color: var(--gold); border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 11.5px; box-shadow: 0 3px 0 rgba(0,0,0,.3);
        border: 2px solid rgba(0,0,0,.25); overflow: hidden; white-space: nowrap;
      }
      .chc-tilepop { animation: chcTilePop .38s var(--spring) both; }
      @keyframes chcTilePop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }
      .chc-dash { text-align: center; margin-top: 10px; }
      .chc-hops { font-size: 12.5px; font-weight: 600; color: #6b5744; line-height: 1.6; margin-bottom: 8px; display: flex; flex-wrap: wrap; gap: 4px 6px; justify-content: center; }
      .chc-hop { background: #241d15; color: var(--stink-lime); border-radius: 8px; padding: 3px 9px; font-weight: 700; }
      .chc-hop .chc-plus { color: var(--gold); font-size: 10px; margin-left: 4px; }
      .chc-arrow { color: #a08c74; align-self: center; }
      .chc-gapchip {
        display: inline-block; background: var(--swamp-mid); color: var(--parchment); border-radius: 12px;
        padding: 8px 16px; font-weight: 700; font-size: 13.5px; box-shadow: 0 3px 0 rgba(0,0,0,.3);
      }
      .chc-gapchip b { color: var(--stink-lime); }
      .chc-win { margin-top: 12px; text-align: center; background: linear-gradient(180deg,#E9FBEF,#D3F3DF); border: 3px solid var(--correct); border-radius: 14px; padding: 12px 16px; animation: animBubbleIn .34s var(--spring) both; }
      .chc-win .cw-title { font-weight: 700; color: #1d8f4e; font-size: 15.5px; }
      .chc-win .cw-line { font-size: 13.5px; font-weight: 600; margin-top: 3px; }
      .chc-win .cw-coins { font-size: 12.5px; color: #4d6b58; font-weight: 500; margin-top: 2px; }
      .chc-win .cw-bonus { margin-top: 8px; font-weight: 700; color: var(--gold-deep); font-size: 13px; }
      .chc-win .cw-btn { margin-top: 9px; padding: 10px 22px; font-size: 15px; }
    `);

    const stage = el('div', 'anim-stage');
    const chiprow = el('div', 'anim-chiprow');
    const q = el('div', 'chc-q');
    const qsub = el('div', 'chc-qsub');
    const trayEl = el('div', 'chc-tray');
    const chuteWrap = el('div', 'chc-chutewrap');
    const chuteEl = el('div', 'chc-chute');
    const labelsRow = el('div', 'chc-labels', '<span class="chc-pricepin"></span><span class="chc-paidpin"></span>');
    const barEl = el('div', 'chc-bar');
    chuteEl.append(labelsRow, barEl);
    chuteWrap.append(chuteEl);
    const priceLbl = labelsRow.querySelector('.chc-pricepin');
    const paidLbl = labelsRow.querySelector('.chc-paidpin');
    const dash = el('div', 'chc-dash');
    const hopsEl = el('div', 'chc-hops');
    const gapEl = el('div', 'chc-gapchip');
    dash.append(hopsEl, gapEl);
    const winBox = el('div');
    const controls = el('div', 'anim-controls');
    const resetBtn = el('button', 'anim-ghostbtn', '↩ RESET CHUTE');
    controls.append(resetBtn);
    stage.append(chiprow, q, qsub, trayEl, chuteWrap, dash, winBox, controls);
    host.append(stage);

    const ruleCard = el('div', 'goldcard', RULE);
    ruleCard.style.cssText = 'margin-top:12px;font-size:13.5px;line-height:1.35;background:linear-gradient(180deg,#FFF3CE,#FBE29A);border:3px solid var(--gold-deep);border-radius:14px;padding:10px 14px;color:#5a4408;font-weight:700;text-align:center;';
    host.append(ruleCard);

    let mi = 0;
    let sbIdx = 0;
    let sandboxMode = false;
    let mission = null;
    let geomState = { pxpp: 1, barWidth: 300 };
    let coinDrags = [];
    let activeDragEl = null;
    let shown = new Set();

    function paintChips() {
      chiprow.innerHTML = '';
      MISSIONS.forEach((m, i) => {
        const c = el('button', 'anim-mchip' + (i === mi ? ' active' : '') + (doneSet.has(m.id) ? ' done' : ''), `${m.priceLabel} → ${m.paidLabel}`);
        c.addEventListener('click', () => { sfx.ui(); start(i); });
        chiprow.append(c);
      });
      const fp = el('button', 'anim-mchip' + (mi === MISSIONS.length ? ' active' : ''), 'FREE PLAY 🕹️');
      fp.addEventListener('click', () => { sfx.ui(); start(MISSIONS.length); });
      chiprow.append(fp);
    }

    function makeMissionFromDef(m) {
      return { id: m.id, price: m.price, paid: m.paid, gap: m.paid - m.price, priceLabel: m.priceLabel, paidLabel: m.paidLabel, trap: m.trap, bonusTarget: m.bonusTarget, filled: 0, tiles: [] };
    }
    function makeMissionFromPreset(p) {
      return { id: 'sandbox', price: p.price, paid: p.paid, gap: p.paid - p.price, priceLabel: p.priceLabel, paidLabel: p.paidLabel, trap: false, bonusTarget: null, filled: 0, tiles: [] };
    }

    function buildCoin(value, isTrap) {
      const label = isTrap ? '25p' : `${value}p`;
      const c = el('button', 'chc-coin' + (isTrap ? ' trap' : ''), label);
      c.type = 'button';
      return c;
    }

    function wireCoinDrag(coinEl, value, isTrap) {
      let lastDx = 0; let lastDy = 0;
      const ctrl = makeDrag(coinEl, {
        enabled: () => alive,
        onStart() {
          coinEl.classList.add('dragging');
          activeDragEl = coinEl;
        },
        onMove(dx, dy) {
          lastDx = dx; lastDy = dy;
          coinEl.style.transform = `translate(${dx}px, ${dy}px)`;
        },
        onEnd(dx, dy) {
          coinEl.classList.remove('dragging');
          activeDragEl = null;
          handleDrop(coinEl, value, isTrap, dx, dy);
        },
      });
      coinDrags.push(ctrl);
      return ctrl;
    }

    function buildTray() {
      coinDrags.forEach((d) => d.destroy());
      coinDrags = [];
      trayEl.innerHTML = '';
      COINS.forEach((v) => {
        const c = buildCoin(v, false);
        wireCoinDrag(c, v, false);
        trayEl.append(c);
      });
      if (mission.trap) {
        const fake = buildCoin(FAKE_VALUE, true);
        wireCoinDrag(fake, FAKE_VALUE, true);
        const idx = 1 + Math.floor(Math.random() * COINS.length);
        trayEl.insertBefore(fake, trayEl.children[idx] || null);
      }
    }

    function bounceHome(coinEl, dx, dy) {
      const cancel = tween((v) => {
        coinEl.style.transform = `translate(${dx * v}px, ${dy * v}px)`;
      }, 1, 0, 260, () => { coinEl.style.transform = ''; liveCancels.delete(cancel); });
      liveCancels.add(cancel);
    }

    function dissolveCoin(coinEl) {
      sfx.pop();
      coinEl.classList.add('chc-dissolving');
      toast(stage, '🫧 No 25p coin exists in the UK!');
      if (!shown.has('trap')) {
        shown.add('trap');
        later(() => bubble(stage, {
          title: 'NO SUCH COIN! 🫧',
          text: 'There is <b>NO 25p coin</b> in the UK. The Changeling wishes there was — it would save its poor pennies — but there isn’t. Don’t invent one!',
          img: CHANGELING_IMG,
        }), 260);
      }
      const id = setTimeout(() => { timers.delete(id); if (coinEl.isConnected) coinEl.remove(); }, 480);
      timers.add(id);
    }

    function landCoin(value) {
      const left = Math.round(mission.filled * geomState.pxpp);
      const w = Math.max(1, Math.round(value * geomState.pxpp));
      const tile = el('div', 'chc-tile chc-tilepop', `${value}p`);
      tile.style.left = `${left}px`;
      tile.style.width = `${w}px`;
      barEl.append(tile);
      mission.filled += value;
      mission.tiles.push(value);
      sfx.tick(mission.tiles.length);
      renderDash();
    }

    function handleDrop(coinEl, value, isTrap, dx, dy) {
      if (!alive) return;
      const barRect = barEl.getBoundingClientRect();
      const coinRect = coinEl.getBoundingClientRect();
      const cx = coinRect.left + coinRect.width / 2;
      const cy = coinRect.top + coinRect.height / 2;
      const overBar = cx >= barRect.left - 12 && cx <= barRect.right + 12 && cy >= barRect.top - 36 && cy <= barRect.bottom + 36;
      if (!overBar) { bounceHome(coinEl, dx, dy); return; }
      const outcome = dropOutcome(mission.filled, mission.gap, value, isTrap);
      if (outcome === 'dissolve') { dissolveCoin(coinEl); return; }
      if (outcome === 'overshoot') {
        sfx.nudge();
        toast(stage, `Too big! ${value}p would go over — try a smaller coin.`);
        bounceHome(coinEl, dx, dy);
        return;
      }
      coinEl.style.transform = '';
      landCoin(value);
      if (outcome === 'complete') win();
    }

    function layoutAndRenderChute() {
      geomState = computeGeom(stage.clientWidth || host.clientWidth || 700, mission.gap);
      chuteEl.style.width = `${geomState.barWidth}px`;
      priceLbl.textContent = mission.priceLabel;
      paidLbl.textContent = mission.paidLabel;
      barEl.innerHTML = '';
      let cum = 0;
      mission.tiles.forEach((v) => {
        const tile = el('div', 'chc-tile', `${v}p`);
        tile.style.left = `${Math.round(cum * geomState.pxpp)}px`;
        tile.style.width = `${Math.max(1, Math.round(v * geomState.pxpp))}px`;
        barEl.append(tile);
        cum += v;
      });
    }

    function renderDash() {
      hopsEl.innerHTML = hopsHTML(mission);
      const left = mission.gap - mission.filled;
      gapEl.innerHTML = left === 0 ? 'CHUTE FULL! 🪙' : `<b>${left}p</b> to go`;
    }

    function retryMission() {
      winBox.innerHTML = '';
      mission.filled = 0;
      mission.tiles = [];
      buildTray();
      layoutAndRenderChute();
      renderDash();
    }

    function win() {
      if (!sandboxMode) doneSet.add(mission.id);
      sfx.win(); party(stage);
      paintChips();
      const phrase = WIN_PHRASES[Math.floor(Math.random() * WIN_PHRASES.length)];
      const coinsStr = mission.tiles.map((v) => `${v}p`).join(' + ');
      winBox.innerHTML = '';
      const w = el('div', 'chc-win',
        `<div class="cw-title">${phrase}</div>`
        + `<div class="cw-line">${mission.priceLabel} → ${mission.paidLabel} = <b>${mission.gap}p change</b></div>`
        + `<div class="cw-coins">${coinsStr} (${mission.tiles.length} coin${mission.tiles.length === 1 ? '' : 's'})</div>`);
      winBox.append(w);
      if (!sandboxMode && mission.bonusTarget) {
        if (mission.tiles.length <= mission.bonusTarget) {
          w.append(el('div', 'cw-bonus', `⭐ ${mission.bonusTarget} coins or fewer too — champion counter!`));
        } else {
          const bb = el('button', 'anim-ghostbtn cw-btn', `⭐ Try it in ${mission.bonusTarget} coins or fewer?`);
          bb.addEventListener('click', () => { sfx.ui(); retryMission(); });
          w.append(bb);
        }
      }
      if (!sandboxMode && doneSet.size === MISSIONS.length) ctx.complete();
      if (!sandboxMode) {
        const nextIdx = MISSIONS.findIndex((m) => !doneSet.has(m.id));
        const nb = el('button', 'btn btn-gold cw-btn', nextIdx !== -1 ? 'NEXT ONE ➡' : 'FREE PLAY 🕹️');
        nb.addEventListener('click', () => { sfx.ui(); start(nextIdx !== -1 ? nextIdx : MISSIONS.length); });
        w.append(nb);
      } else {
        const nb = el('button', 'btn btn-gold cw-btn', 'PLAY AGAIN 🕹️');
        nb.addEventListener('click', () => { sfx.ui(); retryMission(); });
        w.append(nb);
      }
    }

    function start(i) {
      mi = i;
      sandboxMode = i === MISSIONS.length;
      shown = new Set();
      winBox.innerHTML = '';
      mission = sandboxMode ? makeMissionFromPreset(SANDBOX[sbIdx]) : makeMissionFromDef(MISSIONS[i]);
      q.innerHTML = `Price <b>${mission.priceLabel}</b> — paid with <b>${mission.paidLabel}</b>`;
      qsub.innerHTML = '';
      if (sandboxMode) {
        const picker = el('div', 'anim-chiprow');
        picker.style.marginBottom = '4px';
        SANDBOX.forEach((p, k) => {
          const c = el('button', 'anim-mchip' + (k === sbIdx ? ' active' : ''), `${p.priceLabel} → ${p.paidLabel}`);
          c.addEventListener('click', () => { sfx.ui(); sbIdx = k; start(MISSIONS.length); });
          picker.append(c);
        });
        qsub.append(picker);
      } else {
        qsub.textContent = mission.trap
          ? 'Fill the chute exactly — but watch the tray closely, something in there isn’t a real coin…'
          : 'Drag coins into the chute — fill the gap exactly, no more, no less.';
      }
      paintChips();
      buildTray();
      layoutAndRenderChute();
      renderDash();
    }

    resetBtn.addEventListener('click', () => { sfx.ui(); retryMission(); });

    const onResize = () => {
      if (!alive) return;
      liveCancels.forEach((c) => c()); liveCancels.clear();
      coinDrags.forEach((d) => d.abort());
      if (activeDragEl) { activeDragEl.style.transform = ''; activeDragEl.classList.remove('dragging'); activeDragEl = null; }
      trayEl.querySelectorAll('.chc-coin').forEach((c) => { c.style.transform = ''; c.classList.remove('dragging'); });
      layoutAndRenderChute();
    };
    let rsTimer = null;
    const rsHandler = () => { clearTimeout(rsTimer); rsTimer = setTimeout(onResize, 180); };
    window.addEventListener('resize', rsHandler);

    start(0);
    later(() => bubble(stage, {
      title: 'THE CHANGE CHUTE 🪙',
      text: 'The Changeling pays for <b>everything</b> in 1p coins — Whiffbeard once watched it buy a sausage roll with 87 separate pennies. FOUR HOURS. Don’t end up like it: drag coins into the chute and <b>COUNT UP</b> from the price to what you paid — never subtract!',
      img: CHANGELING_IMG,
    }), 200);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', rsHandler);
      clearTimeout(rsTimer);
      timers.forEach((t) => clearTimeout(t));
      liveCancels.forEach((c) => c()); liveCancels.clear();
      coinDrags.forEach((d) => d.destroy());
      stage.remove();
      ruleCard.remove();
    };
  },
};
