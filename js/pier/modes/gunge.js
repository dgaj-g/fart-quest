// FART QUEST — js/pier/modes/gunge.js (GUNGE agent)
// THE GUNGE TANK — survival cabinet: numpad answers keep a plank aloft over
// a bubbling gunge vat. A continuous drain (ramping every 15s) is fought
// back with correct-answer boosts; a wrong OR too-slow answer lurches the
// plank down and flashes the real fact family. Score = seconds survived.
// See docs/PIER_SPEC.md §6 "gunge" (this machine's binding subsection) plus
// the common §6 preamble (welcome overlay / caption bar / end screen shape).
//
// Contract: mount(host, ctx, pier) -> cleanup(). `pier` = {facts, content,
// say, deluxe} (hub-provided kit, §4/§5) — everything fact-related goes
// through `pier.facts`, never a direct db/IndexedDB touch from here.

import { el, sfx, tween, toast, party, injectCss } from '../../anims/_kit.js';
import { makeNumpad } from '../padkit.js';
import { mulberry32, pick } from '../../rng.js';

/* =====================================================================
 * Tuning constants — PIER_SPEC §6's "gunge" bullet describes the MECHANIC
 * (continuous drain, ramps every 15s, correct=boost, wrong/slow=lurch+flash)
 * but gives no exact numbers. Chosen here so bronze/silver/gold (45/90/150s
 * survived — facts.nanaTiers('gunge')) read as a genuine climbing-difficulty
 * curve; see the final report for the worked reasoning.
 * ===================================================================== */
const START_GAUGE = 100;
const BASE_DRAIN_PER_SEC = 4;       // an untouched plank empties in 25s
const RAMP_EVERY_MS = 15000;        // "drain ramp every 15s" (§6, binding)
const RAMP_MULTIPLIER = 1.28;
const TICK_MS = 220;                // one continuous-drain tween "tick"
const BOOST_AMOUNT = 16;            // correct answer, gauge points
const LURCH_AMOUNT = 18;            // wrong/slow answer, gauge points
const SLOW_MS = 6000;               // matches facts.js's own gremlin slow-time
                                     // threshold — a "slow" answer here is one
                                     // that would also nudge the family toward
                                     // gremlin status upstream; see report.
const FLASH_MS = 1700;              // how long the fact-family flash holds
const RESET_RISE_MS = 550;          // plank hoist-back-up animation on (re)start
const STREAK_FOR_FLOURISH = 5;
const PLANK_TRAVEL_PCT = 56;        // % of vatwrap height the plank travels
const STAMP_WORDS = ['GLOOOOOP!', 'SPLOOSH!', 'GUNGED!', 'KERSPLAT!'];

/* ---------- tiny pure helpers ---------- */
// Recomputed independently from the family key every time — never trusted
// off a stored/guessed value (rule ②: only show numbers the state truly is).
function familyFlashText(fact) {
  const [lo, hi] = fact.family.split('x').map(Number);
  const product = lo * hi;
  return `${lo} × ${hi} = ${product}, so ${product} ÷ ${hi} = ${lo}`;
}
function liveSecondsText(ms) { return `${Math.floor(Math.max(0, ms) / 1000)}s`; }

function sayFrom(pier, rng, pool) {
  if (!Array.isArray(pool) || !pool.length) return;
  const entry = pick(rng, pool);
  if (entry) pier.say(entry);
}

/* ---------- self-contained styles ---------- */
const CSS = `
.gg-back { position:absolute; top:calc(16px + var(--safe-t,0px)); left:calc(16px + var(--safe-l,0px)); min-height:60px; padding:0 20px; font-size:16px; z-index:50; touch-action:manipulation; }
.gg-stage { position:relative; min-height:100%; display:flex; flex-direction:column; padding:76px 16px calc(24px + var(--safe-b,0px)); gap:14px; }

.gg-hud { display:flex; flex-direction:column; align-items:center; gap:6px; }
.gg-timer { font-family:'Fredoka',sans-serif; font-weight:700; font-size:15px; color:var(--pier-teal); background:rgba(10,18,48,.6); border:2px solid rgba(47,227,196,.35); border-radius:999px; padding:5px 16px; transition:box-shadow 180ms ease; }
.gg-timer.gg-ramp-pulse { animation:gg-ramp-flash .5s ease-out; }
@keyframes gg-ramp-flash { 0%{ box-shadow:0 0 0 0 rgba(255,79,163,.55); } 100%{ box-shadow:0 0 0 14px rgba(255,79,163,0); } }
/* Question stems read plain and calm — silliness lives in the chrome, never
   the stem typography (PIER_SPEC §2, binding). System font, not Fredoka. */
.gg-fact { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-weight:700; font-size:clamp(26px,4.6vw,42px); color:var(--parchment); text-align:center; line-height:1.2; min-height:1.3em; }

.gg-playrow { flex:1; display:flex; gap:24px; align-items:flex-start; justify-content:center; flex-wrap:wrap; width:100%; max-width:900px; margin:0 auto; }

.gg-vatwrap { position:relative; width:min(260px,42vw); height:min(300px,46vh); flex:0 0 auto; margin-top:6px; }
.gg-rope { position:absolute; top:0; left:50%; width:4px; height:14%; background:repeating-linear-gradient(180deg,#8a7458 0 4px,#6b5744 4px 8px); transform:translateX(-50%); border-radius:2px; }
.gg-plank { position:absolute; left:50%; top:0%; width:78%; height:18px; transform:translate(-50%,0); background:linear-gradient(90deg,#a06b3a,#7a4a22); border-radius:5px; box-shadow:0 4px 0 rgba(0,0,0,.35), inset 0 0 0 2px rgba(0,0,0,.15); }
.gg-plank.gg-snap { animation:gg-snap .6s cubic-bezier(.5,-.2,.7,1) forwards; }
@keyframes gg-snap { 0% { transform:translate(-50%,0) rotate(0deg); opacity:1; } 100% { transform:translate(-50%,150px) rotate(58deg); opacity:0; } }
.gg-figure { position:absolute; left:50%; bottom:100%; transform:translate(-50%,0); font-size:34px; animation:gg-idlebob 2.2s ease-in-out infinite alternate; filter:drop-shadow(0 4px 5px rgba(0,0,0,.4)); }
.gg-figure.gg-scared { animation:gg-scared-shake .32s ease-in-out infinite; }
@keyframes gg-idlebob { from { transform:translate(-50%,0); } to { transform:translate(-50%,-6px); } }
@keyframes gg-scared-shake { 0%,100% { transform:translate(-50%,0) rotate(0deg); } 50% { transform:translate(-53%,0) rotate(-5deg); } }
.gg-vat { position:absolute; left:0; right:0; bottom:0; height:42%; border-radius:16px 16px 10px 10px; background:linear-gradient(180deg,#4a6b1e,#2c4210); box-shadow:inset 0 6px 14px rgba(0,0,0,.5), 0 6px 0 rgba(0,0,0,.35); overflow:hidden; }
.gg-goo { position:absolute; inset:0; background:radial-gradient(circle at 30% 20%,rgba(180,235,90,.55),transparent 55%),radial-gradient(circle at 70% 60%,rgba(120,200,60,.5),transparent 60%),linear-gradient(180deg,#8fca3c,#5f9224); animation:gg-goo-wobble 3.4s ease-in-out infinite; }
@keyframes gg-goo-wobble { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-3px) scale(1.015); } }
.gg-bub { position:absolute; bottom:2px; width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.55); animation:gg-bub-rise 2.6s ease-in infinite; }
@keyframes gg-bub-rise { 0% { transform:translateY(0) scale(.6); opacity:0; } 20% { opacity:.9; } 100% { transform:translateY(-70px) scale(1.15); opacity:0; } }
.gg-meter { position:absolute; right:-20px; top:0; width:11px; height:58%; border-radius:8px; background:rgba(255,255,255,.12); overflow:hidden; box-shadow:inset 0 0 0 2px rgba(255,255,255,.16); }
.gg-meter-fill { position:absolute; left:0; right:0; bottom:0; background:linear-gradient(0deg,var(--pier-teal),#8ff0d8); }
.gg-meter-fill.gg-low { background:linear-gradient(0deg,var(--gold),#ffdb7a); }
.gg-meter-fill.gg-critical { background:linear-gradient(0deg,var(--wrong),#ff8a7a); animation:gg-crit-pulse .6s ease-in-out infinite; }
@keyframes gg-crit-pulse { 0%,100% { opacity:1; } 50% { opacity:.55; } }
.gg-floatplus { position:absolute; left:50%; bottom:100%; transform:translate(-50%,0); font-family:'Fredoka',sans-serif; font-weight:700; font-size:20px; color:var(--correct); text-shadow:0 0 8px rgba(46,204,113,.5); animation:gg-floatup .9s ease-out forwards; pointer-events:none; }
@keyframes gg-floatup { 0% { transform:translate(-50%,0); opacity:1; } 100% { transform:translate(-50%,-46px); opacity:0; } }

.gg-side { display:flex; flex-direction:column; align-items:center; gap:14px; flex:0 0 auto; width:min(300px,80vw); }
.gg-flash { width:100%; background:rgba(231,76,60,.14); border:2px solid rgba(231,76,60,.4); border-radius:14px; padding:10px 14px; text-align:center; opacity:0; transform:translateY(-6px); transition:opacity 220ms var(--spring), transform 220ms var(--spring); pointer-events:none; }
.gg-flash.show { opacity:1; transform:translateY(0); }
.gg-flash-heading { font-family:'Fredoka',sans-serif; font-weight:700; font-size:13px; color:#ffd7d0; margin-bottom:4px; }
.gg-flash-body { font-size:14.5px; font-weight:600; color:var(--parchment); }

.gg-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:24px; z-index:30; background:rgba(4,7,18,.55); opacity:0; pointer-events:none; transition:opacity 260ms var(--spring); }
.gg-overlay.show { opacity:1; pointer-events:auto; }
.gg-card { background:linear-gradient(160deg,#131c3e,#0c1330); border:3px solid rgba(255,79,163,.32); border-radius:var(--r-lg); box-shadow:0 10px 0 rgba(0,0,0,.35), 0 20px 40px rgba(0,0,0,.45); padding:28px 26px; max-width:420px; width:100%; text-align:center; animation:gg-card-in 380ms var(--spring) both; }
@keyframes gg-card-in { from { transform:scale(.9) translateY(14px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }
.gg-card-emoji { font-size:52px; margin-bottom:6px; filter:drop-shadow(0 4px 6px rgba(0,0,0,.4)); }
.gg-card h2 { font-family:'Fredoka',sans-serif; font-weight:700; color:var(--pier-bulb); margin:0 0 10px; letter-spacing:.02em; }
.gg-card-line { font-size:14.5px; font-weight:600; color:var(--parchment); line-height:1.4; margin:0 0 8px; }
.gg-card-sub { font-size:13px; color:rgba(246,235,212,.7); line-height:1.4; margin:0 0 18px; }
.gg-startbtn, .gg-onemorebtn { min-height:60px; padding:0 30px; font-size:17px; touch-action:manipulation; }

.gg-dave-row { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:10px; }
.gg-dave-tag { font-family:'Fredoka',sans-serif; font-weight:700; font-size:10.5px; letter-spacing:.03em; color:#dceeff; background:rgba(255,255,255,.08); border-radius:8px; padding:5px 9px; }
.gg-score-big { font-family:'Fredoka',sans-serif; font-weight:700; font-size:52px; color:var(--pier-teal); text-shadow:0 0 14px rgba(47,227,196,.5); margin:6px 0 0; }
.gg-score-sub { font-size:12.5px; color:rgba(246,235,212,.7); margin-bottom:14px; }
.gg-pb-row { font-weight:700; font-size:13.5px; margin-bottom:10px; padding:7px 12px; border-radius:999px; display:inline-block; }
.gg-pb-row.gg-newrecord { background:rgba(244,197,66,.18); color:var(--gold); }
.gg-pb-row.gg-oldrecord { background:rgba(47,227,196,.12); color:var(--pier-teal); }
.gg-tier-row { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:18px; }
.gg-tier-chip { font-size:22px; opacity:.28; filter:grayscale(1); }
.gg-tier-chip.achieved { opacity:1; filter:none; }
.gg-trophy { font-size:22px; margin-left:2px; animation:gg-trophy-spin 2.6s ease-in-out infinite; }
@keyframes gg-trophy-spin { 0%,100% { transform:rotate(-6deg) scale(1); } 50% { transform:rotate(6deg) scale(1.12); } }
.gg-endbtns { display:flex; flex-direction:column; gap:10px; }

.gg-splash { position:absolute; inset:0; z-index:40; display:flex; align-items:center; justify-content:center; overflow:hidden; opacity:0; pointer-events:none; }
.gg-splash.show { opacity:1; }
.gg-splash-wash { position:absolute; inset:0; background:radial-gradient(circle at 50% 100%,rgba(143,204,60,.92),rgba(70,110,20,.86) 60%,rgba(20,30,8,.92)); animation:gg-wash-in .5s ease-out both; }
@keyframes gg-wash-in { from { transform:scale(.4); opacity:0; } to { transform:scale(1); opacity:1; } }
.gg-splashblobs { position:absolute; inset:0; }
.gg-splat-blob { position:absolute; bottom:0; border-radius:50%; background:radial-gradient(circle at 30% 30%,#c8f06a,#6f9c28); animation:gg-blob-burst .8s cubic-bezier(.2,.9,.3,1) both; }
@keyframes gg-blob-burst { 0% { transform:translate(var(--bx0,0),0) scale(.2); opacity:0; } 40% { opacity:1; } 100% { transform:translate(var(--bx,0),var(--by,-160px)) scale(1); opacity:0; } }
.gg-splash-stamp { position:relative; z-index:2; font-family:'Fredoka',sans-serif; font-weight:700; font-size:clamp(30px,7vw,58px); color:#fff; text-shadow:0 0 12px rgba(0,0,0,.5); text-align:center; transform:rotate(-8deg); animation:gg-stamp-in .5s var(--spring) both; }
@keyframes gg-stamp-in { from { transform:rotate(-8deg) scale(.4); opacity:0; } to { transform:rotate(-8deg) scale(1); opacity:1; } }

@media (prefers-reduced-motion: reduce) {
  .gg-figure, .gg-goo, .gg-bub, .gg-meter-fill.gg-critical, .gg-timer.gg-ramp-pulse { animation:none !important; }
  .gg-plank.gg-snap { animation-duration:.01ms !important; }
  .gg-card, .gg-splash-stamp, .gg-splat-blob, .gg-splash-wash { animation:none !important; opacity:1 !important; transform:none !important; }
}
`;

export default {
  id: 'gunge',
  title: 'THE GUNGE TANK',
  blurb: "Answer fast, keep the plank up — don't get gunged!",

  mount(host, ctx, pier) {
    injectCss('pier-gunge', CSS);

    let alive = true;
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    };
    const every = (fn, ms) => { const id = setInterval(() => { if (alive) fn(); }, ms); timers.add(id); return id; };
    const clearTimer = (id) => { clearTimeout(id); clearInterval(id); timers.delete(id); };

    const rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);

    /* ---------- DOM shell ---------- */
    const back = el('button', 'btn btn-ghost gg-back', '← PIER');
    back.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/pier'); });

    const stage = el('div', 'gg-stage');

    const hud = el('div', 'gg-hud');
    const timerEl = el('div', 'gg-timer', '⏱ 0s survived');
    const factEl = el('div', 'gg-fact', 'Press START to begin!');
    hud.append(timerEl, factEl);

    const playrow = el('div', 'gg-playrow');

    const vatwrap = el('div', 'gg-vatwrap');
    const rope = el('div', 'gg-rope');
    const plank = el('div', 'gg-plank');
    const figure = el('div', 'gg-figure', '🧍');
    plank.append(figure);
    const vat = el('div', 'gg-vat');
    const goo = el('div', 'gg-goo');
    vat.append(goo);
    for (let i = 0; i < 5; i += 1) {
      const b = el('div', 'gg-bub');
      b.style.left = `${8 + rng() * 82}%`;
      b.style.animationDelay = `${(rng() * 2.6).toFixed(2)}s`;
      vat.append(b);
    }
    const meter = el('div', 'gg-meter');
    const meterFill = el('div', 'gg-meter-fill');
    meter.append(meterFill);
    vatwrap.append(rope, vat, plank, meter);

    const side = el('div', 'gg-side');
    const flash = el('div', 'gg-flash');
    const flashHeading = el('div', 'gg-flash-heading');
    const flashBody = el('div', 'gg-flash-body');
    flash.append(flashHeading, flashBody);
    const numpadWrap = el('div', 'gg-numpad-wrap');
    side.append(flash, numpadWrap);

    playrow.append(vatwrap, side);
    stage.append(hud, playrow);

    const welcomeOverlay = el('div', 'gg-overlay gg-welcome show');
    const welcomeCard = el('div', 'gg-card');
    welcomeCard.innerHTML = '<div class="gg-card-emoji">🪣</div><h2>THE GUNGE TANK</h2>'
      + '<p class="gg-card-line"></p>'
      + '<p class="gg-card-sub">Answer fast to keep your plank up — miss one or dawdle and down it goes. Survive as long as you can!</p>';
    const startBtn = el('button', 'btn btn-gold gg-startbtn', 'START ⚡');
    welcomeCard.append(startBtn);
    welcomeOverlay.append(welcomeCard);

    const endOverlay = el('div', 'gg-overlay gg-endscreen');
    stage.append(welcomeOverlay, endOverlay);
    host.append(back, stage);

    /* ---------- game state ---------- */
    let gaugeValue = START_GAUGE;
    let gaugeCancel = null;
    let drainPerSec = BASE_DRAIN_PER_SEC;
    let rampInterval = null;
    let survivalInterval = null;
    let runStart = 0;
    let fact = null;
    let factStart = 0;
    let streak = 0;
    let ended = true; // true until the first round begins
    let numpad = null;

    function cancelGauge() { if (gaugeCancel) { gaugeCancel(); gaugeCancel = null; } }

    function setGauge(v) {
      gaugeValue = v;
      const pct = Math.max(0, Math.min(100, v));
      plank.style.top = `${(1 - pct / 100) * PLANK_TRAVEL_PCT}%`;
      meterFill.style.height = `${pct}%`;
      meterFill.classList.toggle('gg-critical', pct <= 20);
      meterFill.classList.toggle('gg-low', pct > 20 && pct <= 45);
      figure.classList.toggle('gg-scared', pct <= 20);
    }
    setGauge(START_GAUGE); // initial static paint — not gameplay "movement"

    // ALL gauge movement funnels through here (rule ④): exactly one active
    // tween owns gaugeValue at a time; starting a new one always cancels
    // whatever was mid-flight first.
    function driveTo(target, dur, onDone) {
      cancelGauge();
      const from = gaugeValue;
      gaugeCancel = tween((val) => setGauge(val), from, target, dur, () => {
        gaugeCancel = null;
        if (onDone) onDone();
      });
    }

    function clearRampTimer() { if (rampInterval) { clearTimer(rampInterval); rampInterval = null; } }
    function clearSurvivalTimer() { if (survivalInterval) { clearTimer(survivalInterval); survivalInterval = null; } }

    function scheduleTick() {
      if (!alive || ended) return;
      const dec = drainPerSec * (TICK_MS / 1000);
      const target = Math.max(0, gaugeValue - dec);
      driveTo(target, TICK_MS, () => {
        if (!alive || ended) return;
        if (gaugeValue <= 0) { endRun(); return; }
        scheduleTick();
      });
    }

    function drawNextFact() {
      fact = pier.facts.draw(rng, { deluxe: pier.deluxe });
      factStart = performance.now();
      factEl.textContent = fact.stem;
    }

    function hideFlash() { flash.classList.remove('show'); }
    function showFlash(heading, body) {
      flashHeading.textContent = heading;
      flashBody.textContent = body;
      flash.classList.add('show');
    }

    function floatPlus() {
      const s = el('span', 'gg-floatplus', `+${BOOST_AMOUNT}`);
      plank.append(s);
      later(() => s.remove(), 900);
    }

    function handleFlush(rec) {
      if (!rec || !rec.justFlushed) return;
      sayFrom(pier, rng, pier.content.gremlin && pier.content.gremlin.flushed);
      toast(stage, `🚽 ${rec.name} FLUSHED!`, 2400);
      sfx.whoosh();
      later(() => sfx.drop(), 260);
    }

    function handleCorrect(answeredFact) {
      streak += 1;
      sfx.tick(Math.min(streak, 5));
      floatPlus();
      if (streak > 0 && streak % STREAK_FOR_FLOURISH === 0) {
        toast(stage, `🔥 STREAK ×${streak}! The plank barely wobbles!`, 2200);
        sfx.sparkle();
      }
      drawNextFact(); // snappy — the next question shows immediately
      numpad.clear();
      const target = Math.min(100, gaugeValue + BOOST_AMOUNT);
      driveTo(target, 300, () => {
        if (!alive || ended) return;
        if (gaugeValue <= 0) { endRun(); return; }
        scheduleTick();
      });
    }

    // Shared tail for both "wrong" and "correct-but-slow": lurch the gauge,
    // hold the flash for its full read time, then resume.
    function lurchThenContinue() {
      numpad.setEnabled(false);
      const target = Math.max(0, gaugeValue - LURCH_AMOUNT);
      driveTo(target, 340, () => {
        if (!alive || ended) return;
        if (gaugeValue <= 0) { endRun(); return; }
        later(() => {
          if (!alive || ended) return;
          hideFlash();
          numpad.setEnabled(true);
          numpad.clear();
          drawNextFact();
          scheduleTick();
        }, Math.max(200, FLASH_MS - 340));
      });
    }

    function handleWrong(answeredFact) {
      streak = 0;
      sfx.tock(2);
      sayFrom(pier, rng, pier.content.gremlin && pier.content.gremlin.taunt);
      showFlash("Here's the fact:", familyFlashText(answeredFact));
      lurchThenContinue();
    }

    function handleSlowCorrect(answeredFact) {
      streak = 0;
      sfx.tock(1);
      showFlash('Quick as you can, hero! ⏱', familyFlashText(answeredFact));
      lurchThenContinue();
    }

    function onSubmit(valueString) {
      if (!fact || ended) return;
      const answeredFact = fact;
      const value = parseInt(valueString, 10);
      const elapsed = performance.now() - factStart;
      const isCorrect = value === answeredFact.answer;
      let rec = { justFlushed: false };
      try {
        rec = pier.facts.record(answeredFact.family, { correct: isCorrect, ms: Math.round(elapsed), mode: 'gunge' }) || rec;
      } catch (e) { /* the plank must never freeze because a persist call hiccupped */ }
      if (isCorrect) handleFlush(rec);
      if (isCorrect && elapsed <= SLOW_MS) handleCorrect(answeredFact);
      else if (isCorrect) handleSlowCorrect(answeredFact);
      else handleWrong(answeredFact);
    }

    numpad = makeNumpad(numpadWrap, { onSubmit });
    numpad.setEnabled(false);

    function scheduleRampTimer() {
      clearRampTimer();
      rampInterval = every(() => {
        if (ended) return;
        drainPerSec *= RAMP_MULTIPLIER;
        sfx.blip(320, 0.12, 0.12);
        timerEl.classList.remove('gg-ramp-pulse');
        void timerEl.offsetWidth;
        timerEl.classList.add('gg-ramp-pulse');
      }, RAMP_EVERY_MS);
    }

    function startSurvivalDisplay() {
      clearSurvivalTimer();
      survivalInterval = every(() => {
        timerEl.textContent = `⏱ ${liveSecondsText(performance.now() - runStart)} survived`;
      }, 200);
    }

    function beginRound() {
      welcomeOverlay.classList.remove('show');
      endOverlay.classList.remove('show');
      ended = false;
      streak = 0;
      drainPerSec = BASE_DRAIN_PER_SEC;
      runStart = performance.now();
      hideFlash();
      numpad.setEnabled(true);
      numpad.clear();
      drawNextFact();
      scheduleRampTimer();
      startSurvivalDisplay();
      driveTo(START_GAUGE, RESET_RISE_MS, () => {
        if (!alive || ended) return;
        scheduleTick();
      });
      sayFrom(pier, rng, pier.content.announcer && pier.content.announcer.roundStart);
      sfx.ui();
    }

    function endRun() {
      if (ended) return;
      ended = true;
      cancelGauge();
      clearRampTimer();
      clearSurvivalTimer();
      numpad.setEnabled(false);
      const finalSeconds = (performance.now() - runStart) / 1000;
      plank.classList.add('gg-snap');
      sfx.drop();
      later(() => {
        if (!alive) return;
        sfx.thud();
        showSplash();
      }, 420);
      later(() => {
        if (!alive) return;
        hideSplash();
        plank.classList.remove('gg-snap');
        showEndScreen(finalSeconds);
      }, 420 + 1500);
    }

    /* ---------- splash finale ---------- */
    const splash = el('div', 'gg-splash');
    const splashWash = el('div', 'gg-splash-wash');
    const splashBlobs = el('div', 'gg-splashblobs');
    const splashStamp = el('div', 'gg-splash-stamp');
    splash.append(splashWash, splashBlobs, splashStamp);
    stage.append(splash);

    function showSplash() {
      splashBlobs.innerHTML = '';
      for (let i = 0; i < 10; i += 1) {
        const b = el('div', 'gg-splat-blob');
        const size = 24 + rng() * 46;
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${8 + rng() * 82}%`;
        b.style.setProperty('--bx', `${((rng() - 0.5) * 170).toFixed(0)}px`);
        b.style.setProperty('--by', `${-(110 + rng() * 150).toFixed(0)}px`);
        b.style.animationDelay = `${(rng() * 0.16).toFixed(2)}s`;
        splashBlobs.append(b);
      }
      splashStamp.textContent = pick(rng, STAMP_WORDS);
      splash.classList.add('show');
    }
    function hideSplash() { splash.classList.remove('show'); }

    /* ---------- end screen (the Dave stage-direction scorecard) ---------- */
    function tierChipsHtml(tiers, bestVal) {
      if (!tiers) return '';
      const order = ['bronze', 'silver', 'gold'];
      const icon = { bronze: '🥉', silver: '🥈', gold: '🥇' };
      return order.map((t) => {
        const achieved = bestVal != null && bestVal >= tiers[t];
        return `<span class="gg-tier-chip${achieved ? ' achieved' : ''}" title="${t}">${icon[t]}</span>`;
      }).join('');
    }

    async function showEndScreen(rawSeconds) {
      if (!alive) return;
      const roundedSeconds = Math.round(rawSeconds);
      let bests = {};
      try { bests = (await pier.facts.getBests()) || {}; } catch (e) { bests = {}; }
      if (!alive) return;
      const prevBest = bests.gunge || null;
      const prevSeconds = prevBest ? prevBest.seconds : null;
      const isNewRecord = prevSeconds == null || roundedSeconds > prevSeconds;
      const tiers = pier.facts.nanaTiers('gunge');
      const goldAlreadySeen = !!(prevBest && prevBest.goldSeen);
      const goldNow = !!(tiers && roundedSeconds >= tiers.gold);
      const firstTimeGold = goldNow && !goldAlreadySeen;

      const patch = {};
      if (isNewRecord) { patch.seconds = roundedSeconds; patch.when = Date.now(); }
      if (firstTimeGold) { patch.goldSeen = true; }
      let finalBest = prevBest;
      if (Object.keys(patch).length) {
        try { finalBest = await pier.facts.putBest('gunge', patch); } catch (e) { finalBest = { ...(prevBest || {}), ...patch }; }
      }
      if (!finalBest) finalBest = { seconds: roundedSeconds };
      if (!alive) return;

      const daveLine = (pier.content.dave && Array.isArray(pier.content.dave.steal) && pier.content.dave.steal.length)
        ? (pier.content.dave.steal.find((e) => /SCORECARD/i.test(e.text)) || pick(rng, pier.content.dave.steal))
        : null;

      const pbHtml = isNewRecord
        ? '<div class="gg-pb-row gg-newrecord">🏅 NEW RECORD!</div>'
        : `<div class="gg-pb-row gg-oldrecord">PB: ${prevSeconds}s</div>`;
      const trophyHtml = finalBest.goldSeen ? '<span class="gg-trophy" title="Gold beaten!">🏆</span>' : '';

      endOverlay.innerHTML = '';
      const card = el('div', 'gg-card gg-scorecard');
      card.innerHTML = '<div class="gg-dave-row">🐦'
        + `<span class="gg-dave-tag">${daveLine ? daveLine.text : 'DAVE THE SEAGULL HOLDS UP THE SCORECARD.'}</span></div>`
        + '<h2>SURVIVAL SCORECARD</h2>'
        + `<div class="gg-score-big">${roundedSeconds}s</div>`
        + '<div class="gg-score-sub">survived on the plank</div>'
        + pbHtml
        + `<div class="gg-tier-row">${tierChipsHtml(tiers, finalBest.seconds)}${trophyHtml}</div>`;
      const btnRow = el('div', 'gg-endbtns');
      const onemoreBtn = el('button', 'btn btn-gold gg-onemorebtn', 'ONE MORE GO 🔁');
      const pierBtn = el('button', 'btn btn-ghost gg-pierbtn', '← PIER');
      btnRow.append(onemoreBtn, pierBtn);
      card.append(btnRow);
      endOverlay.append(card);
      endOverlay.classList.add('show');

      onemoreBtn.addEventListener('click', () => { sfx.ui(); beginRound(); });
      pierBtn.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/pier'); });

      if (daveLine) pier.say(daveLine);
      if (isNewRecord) party(stage);

      later(() => {
        if (!alive) return;
        if (firstTimeGold) {
          sayFrom(pier, rng, pier.content.nana && pier.content.nana.goldBeaten);
          sfx.win();
        } else if (isNewRecord) {
          sayFrom(pier, rng, pier.content.announcer && pier.content.announcer.highScore);
        } else {
          sayFrom(pier, rng, pier.content.nana && pier.content.nana.win);
        }
      }, 1300);
    }

    /* ---------- welcome overlay wiring ---------- */
    const welcomeLine = (pier.content.nana && Array.isArray(pier.content.nana.welcome) && pier.content.nana.welcome.length)
      ? pick(rng, pier.content.nana.welcome)
      : null;
    if (welcomeLine) {
      welcomeCard.querySelector('.gg-card-line').textContent = welcomeLine.text;
      pier.say(welcomeLine);
    } else {
      welcomeCard.querySelector('.gg-card-line').remove();
    }
    startBtn.addEventListener('click', () => { sfx.ui(); beginRound(); });

    return function cleanup() {
      alive = false;
      ended = true;
      cancelGauge();
      clearRampTimer();
      clearSurvivalTimer();
      timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
      timers.clear();
      if (numpad) numpad.destroy();
      stage.remove();
      back.remove();
    };
  },
};
