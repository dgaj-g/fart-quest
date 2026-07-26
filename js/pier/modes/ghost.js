// FART QUEST — js/pier/modes/ghost.js (GHOST agent)
// WHIFF-END PIER — THE GHOST TRAIN: a 20-fact mixed-times-tables time trial
// raced against your own personal-best "ghost" cart. See docs/PIER_SPEC.md
// §6 "ghost" for the binding mechanic contract.
//
// Mechanic summary:
// - Fixed run of 20 facts drawn live from facts.draw() (gremlin-weighted,
//   never the same family twice running — both handled inside facts.js).
// - Numpad entry (padkit). The run clock starts on START and never stops —
//   a wrong answer just wobbles the cart; the SAME fact must be re-answered
//   correctly before the player's cart advances a station. That re-answer
//   requirement, with the clock still running, IS the penalty (§6) — there
//   is deliberately no worked-answer reveal on a miss here (unlike Gunge),
//   because trading a miss for a hint would undercut the "beat the clock"
//   tension this cabinet is built around.
// - The PB ghost cart is entirely clock-driven, not player-driven: at the
//   moment the run starts, a CHAIN of kit tween() calls is scheduled, one
//   per stored PB split, each running for exactly that split's real
//   millisecond gap. That satisfies rule ④ (all state movement via tween(),
//   no bare rAF loop) while still tracking real elapsed time faithfully —
//   each tween's `done` callback schedules the next segment, so the whole
//   chain self-drives independent of anything the player does.
// - Splits are stored as 20 CUMULATIVE milliseconds (elapsed-since-run-start
//   at the moment each of the 20 facts was correctly answered) — read that
//   straight back as tween segment boundaries next time, no conversion.
// - A new PB writes {ms, when, splits} in a SINGLE putBest() call so the
//   headline time and the splits driving next run's ghost can never drift
//   out of sync with each other.
import {
  el, sfx, tween, toast, sparkleBurst, party, injectCss,
} from '../../anims/_kit.js';
import { mulberry32, pick } from '../../rng.js';
import { makeNumpad } from '../padkit.js';

const TOTAL = 20;

const CSS = `
/* position:absolute + inset:0 (not min-height:100%) deliberately: .pier-mode-host's
   own height comes from ITS min-height:100%, which is not an "explicitly specified"
   height per the CSS height-percentage rule, so a plain min-height:100% here would
   resolve against nothing and collapse to content height (invisible on the stub's
   transparent background, but fatal here since .gh-root paints a full-bleed tunnel
   backdrop). Absolute positioning with inset:0 is exempt from that rule — it always
   fills the nearest positioned ancestor's rendered box, whatever produced it. */
.gh-root { position:absolute; inset:0; overflow-y:auto; overflow-x:hidden; padding-bottom:36px;
  background:
    radial-gradient(70% 40% at 50% 0%, rgba(155,107,240,.18), transparent 65%),
    linear-gradient(180deg, var(--pier-navy-deep,#050914) 0%, var(--pier-navy,#0a1230) 55%, var(--pier-navy-mid,#141c44) 100%);
}
.gh-back { position:absolute; top:calc(16px + var(--safe-t,0px)); left:calc(16px + var(--safe-l,0px)); min-height:60px; padding:0 20px; font-size:16px; z-index:30; }

/* ---------- welcome / end veil ---------- */
.gh-veil { position:absolute; inset:0; z-index:20; display:none; padding:88px 18px 40px; background:rgba(4,7,16,.6); overflow:auto; }
.gh-card { background:var(--card); color:var(--ink); border-radius:var(--r-lg); box-shadow:var(--shadow-card); padding:30px 26px 26px; max-width:440px; width:100%; text-align:center; margin:auto; }
.gh-card .gh-emoji { font-size:52px; margin-bottom:6px; }
.gh-card h2 { font-family:'Fredoka',sans-serif; font-size:clamp(19px,4vw,24px); margin:0 0 10px; color:#3a2a52; }
.gh-blurb { font-size:14.5px; line-height:1.45; font-weight:500; color:#4a3d52; margin:0 0 12px; }
.gh-pb-line { font-size:14px; font-weight:600; color:#5a3d7a; background:rgba(155,107,240,.12); border-radius:12px; padding:8px 12px; margin-bottom:12px; }
.gh-pb-line.gh-pb-none { color:#6b4d1f; background:rgba(244,197,66,.18); }
.gh-tiers { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px; }
.gh-tier-chip { font-size:12.5px; font-weight:700; background:rgba(51,38,29,.06); border-radius:999px; padding:6px 10px; color:#4a3d2f; }
.gh-start-btn, .gh-again-btn { min-height:64px; padding:0 30px; font-size:17px; width:100%; }
.gh-end-actions { display:flex; flex-direction:column; gap:10px; margin-top:6px; }
.gh-end-card .gh-final-time { font-family:'Fredoka',sans-serif; font-weight:700; font-size:26px; color:#3a2a52; margin:6px 0 10px; }
.gh-compare { font-size:14px; font-weight:600; color:#4a3d52; background:rgba(155,107,240,.1); border-radius:12px; padding:8px 12px; margin-bottom:12px; }
.gh-compare-win { background:rgba(46,204,113,.16); color:#1d8f4e; }
.gh-compare-first { background:rgba(244,197,66,.2); color:#7a5a10; }
.gh-tier-row { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:14px; }
.gh-tier-row .gh-tier-chip { font-size:20px; padding:4px 6px; opacity:.3; background:none; }
.gh-tier-row .gh-tier-chip.achieved { opacity:1; }
.gh-trophy { font-size:22px; animation:gh-trophy-spin 2.4s ease-in-out infinite; }
@keyframes gh-trophy-spin { 0%, 100% { transform:rotate(-8deg) scale(1); } 50% { transform:rotate(8deg) scale(1.14); } }

/* ---------- HUD ---------- */
.gh-hud { position:relative; z-index:2; padding:calc(80px + var(--safe-t,0px)) 18px 20px; display:flex; flex-direction:column; align-items:center; gap:16px; }
.gh-topline { display:flex; align-items:center; gap:14px; flex-wrap:wrap; justify-content:center; }
.gh-clock, .gh-counter { font-family:'Fredoka',sans-serif; font-weight:700; font-size:15px; background:rgba(10,18,48,.65); border:2px solid rgba(255,255,255,.14); color:var(--parchment); border-radius:999px; padding:8px 16px; box-shadow:0 4px 0 rgba(0,0,0,.3); }
.gh-clock-val { color:var(--pier-teal,#2fe3c4); }
.gh-fact-n { color:var(--pier-pink,#ff4fa3); }

.gh-stem-card { background:var(--card); color:var(--ink); border-radius:var(--r-lg); box-shadow:var(--shadow-card); padding:18px 32px; font-size:clamp(28px,6vw,42px); font-weight:700; text-align:center; min-width:180px; }
.gh-stem-card.gh-correct-flash { animation:gh-flash-green .55s ease; }
.gh-stem-card.gh-wrong-shake { animation:gh-shake-card .45s ease; }
@keyframes gh-flash-green { 0% { box-shadow:var(--shadow-card), 0 0 0 0 rgba(46,204,113,0); } 30% { box-shadow:var(--shadow-card), 0 0 0 9px rgba(46,204,113,.4); } 100% { box-shadow:var(--shadow-card), 0 0 0 0 rgba(46,204,113,0); } }
@keyframes gh-shake-card { 0%, 100% { transform:translateX(0); } 20% { transform:translateX(-6px); } 40% { transform:translateX(5px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(3px); } }

.gh-tunnel { position:relative; width:min(640px,92vw); border-radius:22px; padding:26px 18px 20px; overflow:hidden;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 2px, transparent 2px 26px),
    linear-gradient(180deg, #241a3c, #140f26);
  box-shadow:inset 0 0 30px rgba(0,0,0,.5), 0 8px 0 rgba(0,0,0,.3);
}
.gh-web { position:absolute; font-size:22px; opacity:.35; z-index:0; }
.gh-web-l { top:-6px; left:-4px; }
.gh-web-r { top:-6px; right:-4px; transform:scaleX(-1); }
.gh-lamprow { position:relative; z-index:1; display:flex; justify-content:space-between; padding:0 6px; margin-bottom:10px; }
.gh-lamp { width:8px; height:8px; border-radius:50%; background:var(--pier-bulb,#ffe9a8); box-shadow:0 0 8px 2px var(--pier-bulb,#ffe9a8); animation:pier-bulb-flicker 1.6s ease-in-out infinite; }
.gh-bat { position:absolute; top:16%; font-size:16px; opacity:.5; animation:gh-drift-bat 9s ease-in-out infinite; pointer-events:none; z-index:0; }
.gh-bat-2 { top:38%; animation-duration:12s; animation-delay:2s; font-size:13px; }
@keyframes gh-drift-bat { 0% { transform:translateX(-4%); } 50% { transform:translateX(96%) translateY(-8px); } 100% { transform:translateX(-4%); } }

.gh-track { position:relative; z-index:1; height:52px; border-radius:14px; margin:8px 0 24px;
  background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(0,0,0,.25));
  box-shadow:inset 0 2px 6px rgba(0,0,0,.5);
}
.gh-track-label { position:absolute; top:-18px; left:2px; font-family:'Fredoka',sans-serif; font-weight:700; font-size:10px; letter-spacing:.06em; color:rgba(246,235,212,.65); }
.gh-cart { position:absolute; top:50%; left:0%; transform:translate(-50%,-50%); font-size:28px; z-index:2; filter:drop-shadow(0 3px 5px rgba(0,0,0,.5)); }
.gh-cart-ghost { opacity:.6; filter:drop-shadow(0 0 10px rgba(47,227,196,.7)); }
.gh-cart.gh-wobble { animation:gh-wobble-cart .45s ease; }
@keyframes gh-wobble-cart { 0%, 100% { transform:translate(-50%,-50%) rotate(0); } 25% { transform:translate(-50%,-50%) rotate(-9deg) translateX(-3px); } 50% { transform:translate(-50%,-50%) rotate(8deg) translateX(3px); } 75% { transform:translate(-50%,-50%) rotate(-6deg) translateX(-2px); } }
.gh-noghost-msg { display:none; position:absolute; inset:0; align-items:center; justify-content:center; text-align:center; font-size:11.5px; font-weight:700; color:var(--pier-bulb,#ffe9a8); padding:0 14px; }
.gh-track-ghost.gh-no-ghost .gh-cart-ghost, .gh-track-ghost.gh-no-ghost .gh-track-label { opacity:0; }
.gh-track-ghost.gh-no-ghost .gh-noghost-msg { display:flex; }
.gh-finish { position:absolute; right:2px; top:50%; transform:translateY(-50%); font-size:22px; z-index:1; }

.gh-numpad-wrap { margin-top:2px; }
.gh-hint { font-size:12.5px; font-weight:600; color:rgba(246,235,212,.68); text-align:center; max-width:320px; }
`;

function formatMs(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—';
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return m > 0 ? `${m}m ${s.toFixed(2)}s` : `${s.toFixed(2)}s`;
}

function formatClockLive(ms) {
  const totalSec = Math.max(0, ms) / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return m > 0 ? `${m}m ${s.toFixed(1)}s` : `${s.toFixed(1)}s`;
}

export default {
  id: 'ghost',
  title: 'THE GHOST TRAIN',
  blurb: 'Race your own ghost through 20 mixed facts!',

  mount(host, ctx, pier) {
    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const tid = setTimeout(() => { timers.delete(tid); if (alive) fn(); }, ms);
      timers.add(tid);
      return tid;
    };

    injectCss('pier-ghost', CSS);

    const rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    const tiers = pier.facts.nanaTiers('ghost'); // {bronze, silver, gold} ms thresholds, lower=better

    let currentBest = null;   // {ms, when, splits, goldSeen} | null — refreshed after every completed run
    let runToken = 0;         // guards delayed captions against firing after a fresh "ONE MORE GO"
    let ghostCancelTween = null;
    let cartCancelTween = null;
    let clockInterval = null;

    let currentFact = null;
    let factIndex = 0;
    let recordedSplits = [];
    let runStart = 0;
    let factShownAt = 0;
    let lastAttemptAt = 0;
    let playerPos = 0;

    /* ---------- DOM scaffold ---------- */
    const root = el('div', 'gh-root');
    host.appendChild(root);

    const back = el('button', 'btn btn-ghost gh-back', '← PIER');
    root.appendChild(back);
    back.addEventListener('click', () => {
      ctx.audio.sfx('back');
      ctx.go('#/pier');
    });

    const veil = el('div', 'gh-veil');
    root.appendChild(veil);

    const hud = el('div', 'gh-hud');
    hud.style.display = 'none';

    const topline = el('div', 'gh-topline');
    const clockBox = el('div', 'gh-clock', '⏱ <span class="gh-clock-val">0.0s</span>');
    const counterBox = el('div', 'gh-counter', 'FACT <span class="gh-fact-n">1</span>/20');
    topline.append(clockBox, counterBox);
    const clockValEl = clockBox.querySelector('.gh-clock-val');
    const factNEl = counterBox.querySelector('.gh-fact-n');

    const stemCard = el('div', 'gh-stem-card');
    const stemText = el('span', 'gh-stem-text', '');
    stemCard.appendChild(stemText);

    const tunnel = el('div', 'gh-tunnel');
    tunnel.append(
      el('span', 'gh-web gh-web-l', '🕸️'),
      el('span', 'gh-web gh-web-r', '🕸️'),
      el('span', 'gh-bat', '🦇'),
      el('span', 'gh-bat gh-bat-2', '🦇'),
    );
    const lampRow = el('div', 'gh-lamprow');
    for (let i = 0; i < 7; i += 1) {
      const lamp = el('span', 'gh-lamp');
      lamp.style.animationDelay = `${(i * 0.14).toFixed(2)}s`;
      lampRow.appendChild(lamp);
    }
    tunnel.appendChild(lampRow);

    const trackPlayer = el('div', 'gh-track gh-track-player');
    trackPlayer.appendChild(el('div', 'gh-track-label', 'YOU'));
    const cartPlayer = el('div', 'gh-cart gh-cart-player', '🚋');
    trackPlayer.appendChild(cartPlayer);

    const trackGhost = el('div', 'gh-track gh-track-ghost');
    trackGhost.appendChild(el('div', 'gh-track-label', 'PB GHOST'));
    const cartGhost = el('div', 'gh-cart gh-cart-ghost', '👻');
    const noGhostMsg = el('div', 'gh-noghost-msg', "Setting the FIRST ghost tonight!");
    trackGhost.append(cartGhost, noGhostMsg);

    const finishFlag = el('div', 'gh-finish', '🏁');
    tunnel.append(trackPlayer, trackGhost, finishFlag);

    const numpadWrap = el('div', 'gh-numpad-wrap');
    const hintLine = el('div', 'gh-hint', "Get one wrong and the cart wobbles — answer it again to roll on. The clock never stops!");

    hud.append(topline, stemCard, tunnel, numpadWrap, hintLine);
    root.appendChild(hud);

    const numpad = makeNumpad(numpadWrap, { onSubmit: handleSubmit });
    numpad.setEnabled(false);

    /* ---------- cart / ghost position helpers ---------- */
    function setCartPos(cartEl, stationValue) {
      const pct = Math.max(0, Math.min(100, (stationValue / TOTAL) * 100));
      cartEl.style.left = `${pct}%`;
    }

    function stopGhostChain() {
      if (ghostCancelTween) { ghostCancelTween(); ghostCancelTween = null; }
    }
    function stopCartTween() {
      if (cartCancelTween) { cartCancelTween(); cartCancelTween = null; }
    }
    function stopClock() {
      if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
    }

    function scheduleGhostSegment(idx, splits) {
      if (!alive || idx >= TOTAL) return;
      const prevMs = idx === 0 ? 0 : splits[idx - 1];
      const segMs = Math.max(60, splits[idx] - prevMs);
      ghostCancelTween = tween((v) => setCartPos(cartGhost, v), idx, idx + 1, segMs, () => {
        ghostCancelTween = null;
        scheduleGhostSegment(idx + 1, splits);
      });
    }

    function advancePlayerCart(toIndex) {
      stopCartTween();
      const from = playerPos;
      cartCancelTween = tween((v) => { playerPos = v; setCartPos(cartPlayer, v); }, from, toIndex, 420, () => {
        cartCancelTween = null;
      });
    }

    function cartWobble() {
      cartPlayer.classList.remove('gh-wobble');
      void cartPlayer.offsetWidth; // restart the keyframe even on rapid repeats
      cartPlayer.classList.add('gh-wobble');
    }

    /* ---------- welcome ---------- */
    function buildWelcomeContent() {
      const goldStr = tiers ? formatMs(tiers.gold) : '—';
      const silverStr = tiers ? formatMs(tiers.silver) : '—';
      const bronzeStr = tiers ? formatMs(tiers.bronze) : '—';
      const havePb = currentBest && typeof currentBest.ms === 'number';
      const pbBlock = havePb
        ? `<div class="gh-pb-line">👻 Your ghost's time to beat: <b>${formatMs(currentBest.ms)}</b></div>`
        : '<div class="gh-pb-line gh-pb-none">No ghost in the tunnel yet, nose-soldier — tonight, <b>YOU</b> lay down the very first haunting!</div>';

      veil.innerHTML = '';
      const card = el('div', 'gh-card enter-pop');
      card.innerHTML = `
        <div class="gh-emoji">👻🚋</div>
        <h2>THE GHOST TRAIN</h2>
        <p class="gh-blurb">20 mixed times-table facts, numpad entry, the clock never stops. Get one wrong and your cart wobbles — you'll need to answer it again before you can roll on!</p>
        ${pbBlock}
        <div class="gh-tiers">
          <span class="gh-tier-chip">🥉 <b>${bronzeStr}</b></span>
          <span class="gh-tier-chip">🥈 <b>${silverStr}</b></span>
          <span class="gh-tier-chip">🥇 <b>${goldStr}</b></span>
        </div>
      `;
      const startBtn = el('button', 'btn btn-gold gh-start-btn', 'START 👻');
      card.appendChild(startBtn);
      veil.appendChild(card);
      veil.style.display = 'flex';

      startBtn.addEventListener('click', () => {
        ctx.audio.sfx('confirm');
        startRun();
      });
    }

    /* ---------- run loop ---------- */
    function loadFact() {
      currentFact = pier.facts.draw(rng, { deluxe: pier.deluxe });
      factShownAt = performance.now();
      lastAttemptAt = factShownAt;
      stemText.textContent = currentFact.stem;
      factNEl.textContent = String(factIndex + 1);
      numpad.clear();
      numpad.setEnabled(true);
    }

    function handleSubmit(valueString) {
      if (!alive || !currentFact) return;
      const now = performance.now();
      const attemptMs = Math.round(now - lastAttemptAt);
      const val = parseInt(valueString, 10);
      const correct = Number.isFinite(val) && val === currentFact.answer;
      const result = pier.facts.record(currentFact.family, { correct, ms: attemptMs, mode: 'ghost' });
      lastAttemptAt = now;
      numpad.clear();

      if (correct) {
        stemCard.classList.remove('gh-wrong-shake');
        void stemCard.offsetWidth;
        stemCard.classList.add('gh-correct-flash');
        sfx.tick(Math.min(factIndex, 5));

        const cum = Math.round(now - runStart);
        recordedSplits.push(cum);
        factIndex += 1;
        advancePlayerCart(factIndex);

        if (result && result.justFlushed) celebrateFlush(result.name);

        if (factIndex >= TOTAL) {
          finishRun();
        } else {
          loadFact();
        }
      } else {
        stemCard.classList.remove('gh-correct-flash');
        void stemCard.offsetWidth;
        stemCard.classList.add('gh-wrong-shake');
        cartWobble();
        sfx.nudge();
        const line = pick(rng, pier.content.gremlin.taunt);
        if (line) pier.say(line);
      }
    }

    function celebrateFlush(name) {
      const line = pick(rng, pier.content.gremlin.flushed);
      if (line) pier.say(line);
      sparkleBurst(root, root.clientWidth / 2, 170);
      toast(root, `🚽 ${name || 'A gremlin'} FLUSHED!`);
    }

    function startClock() {
      stopClock();
      clockInterval = setInterval(() => {
        if (!alive) return;
        clockValEl.textContent = formatClockLive(performance.now() - runStart);
      }, 100);
    }

    function startRun() {
      runToken += 1;
      stopGhostChain();
      stopCartTween();
      stopClock();

      veil.style.display = 'none';
      hud.style.display = '';

      recordedSplits = [];
      factIndex = 0;
      playerPos = 0;
      setCartPos(cartPlayer, 0);
      setCartPos(cartGhost, 0);
      cartPlayer.classList.remove('gh-wobble');
      stemCard.classList.remove('gh-correct-flash', 'gh-wrong-shake');

      const usableSplits = currentBest && Array.isArray(currentBest.splits) && currentBest.splits.length === TOTAL
        ? currentBest.splits
        : null;
      trackGhost.classList.toggle('gh-no-ghost', !usableSplits);

      runStart = performance.now();
      clockValEl.textContent = '0.0s';
      startClock();
      if (usableSplits) scheduleGhostSegment(0, usableSplits);

      const kickoff = pick(rng, pier.content.announcer.roundStart);
      if (kickoff) pier.say(kickoff);

      loadFact();
    }

    /* ---------- finish + end screen ---------- */
    async function finishRun() {
      stopClock();
      stopGhostChain();
      numpad.setEnabled(false);

      const finalMs = recordedSplits[recordedSplits.length - 1];
      const wasBest = (currentBest && typeof currentBest.ms === 'number') ? currentBest : null;
      const isNewRecord = !wasBest || finalMs < wasBest.ms;
      let goldNewlyBeaten = false;

      if (isNewRecord) {
        const goldAchieved = !!(tiers && finalMs <= tiers.gold);
        goldNewlyBeaten = goldAchieved && !(wasBest && wasBest.goldSeen);
        // Single atomic putBest call: the headline time and the splits that
        // will drive next run's ghost are written together, so they can
        // never end up describing two different runs.
        const patch = { ms: finalMs, when: Date.now(), splits: recordedSplits.slice() };
        if (goldNewlyBeaten) patch.goldSeen = true;
        try {
          currentBest = await pier.facts.putBest('ghost', patch);
        } catch (e) {
          currentBest = { ...(wasBest || {}), ...patch };
        }
      }

      if (!alive) return;
      showEndScreen({
        finalMs, wasBest, isNewRecord, goldNewlyBeaten,
      });
    }

    function showEndScreen({
      finalMs, wasBest, isNewRecord, goldNewlyBeaten,
    }) {
      const myToken = runToken;
      hud.style.display = 'none';

      let compareHtml;
      if (!wasBest) {
        compareHtml = '<div class="gh-compare gh-compare-first">👻 You are the very FIRST ghost of Whiff-End Pier!</div>';
      } else if (isNewRecord) {
        compareHtml = `<div class="gh-compare gh-compare-win">You beat your old ghost by <b>${formatMs(wasBest.ms - finalMs)}</b>!</div>`;
      } else {
        compareHtml = `<div class="gh-compare">Your ghost got there <b>${formatMs(finalMs - wasBest.ms)}</b> ahead this time — have another go, nose-soldier!</div>`;
      }

      const bestForChips = isNewRecord ? finalMs : (wasBest ? wasBest.ms : finalMs);
      const chipsHtml = tiers ? ['bronze', 'silver', 'gold'].map((t) => {
        const icon = t === 'bronze' ? '🥉' : (t === 'silver' ? '🥈' : '🥇');
        const achieved = bestForChips <= tiers[t];
        return `<span class="gh-tier-chip${achieved ? ' achieved' : ''}">${icon}</span>`;
      }).join('') : '';

      veil.innerHTML = '';
      const card = el('div', 'gh-card gh-end-card enter-pop');
      card.innerHTML = `
        <div class="gh-emoji">${isNewRecord ? '🏆👻' : '👻'}</div>
        <h2>${isNewRecord ? 'A NEW GHOST HAUNTS THE PIER!' : 'RUN COMPLETE!'}</h2>
        <div class="gh-final-time">⏱ <b>${formatMs(finalMs)}</b></div>
        ${compareHtml}
        <div class="gh-tier-row">${chipsHtml}${goldNewlyBeaten ? '<span class="gh-trophy">🏆</span>' : ''}</div>
      `;
      const actions = el('div', 'gh-end-actions');
      const again = el('button', 'btn btn-gold gh-again-btn', 'ONE MORE GO 👻');
      actions.appendChild(again);
      card.appendChild(actions);
      veil.appendChild(card);
      veil.style.display = 'flex';

      again.addEventListener('click', () => {
        ctx.audio.sfx('confirm');
        startRun();
      });

      if (isNewRecord) {
        sfx.win();
        party(root);
        const l1 = pick(rng, pier.content.announcer.highScore);
        if (l1) pier.say(l1);
        later(() => {
          if (runToken !== myToken) return; // a fresh run started before this fired — skip, stale
          const l2 = goldNewlyBeaten ? pick(rng, pier.content.nana.goldBeaten) : pick(rng, pier.content.nana.win);
          if (l2) pier.say(l2);
        }, 2600);
      } else {
        sfx.settle();
        const l = pick(rng, pier.content.nana.win);
        if (l) pier.say(l);
      }
    }

    /* ---------- initial load ---------- */
    (async () => {
      let allBests = {};
      try { allBests = await pier.facts.getBests(); } catch (e) { allBests = {}; }
      if (!alive) return;
      currentBest = (allBests && allBests.ghost) || null;
      buildWelcomeContent();
      const wLine = pick(rng, pier.content.nana.welcome);
      if (wLine) pier.say(wLine);
    })();

    return function cleanup() {
      alive = false;
      timers.forEach((tid) => clearTimeout(tid));
      timers.clear();
      stopClock();
      stopGhostChain();
      stopCartTween();
      numpad.destroy();
      root.remove();
    };
  },
};
