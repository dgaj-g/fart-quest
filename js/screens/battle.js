// FART QUEST — screens/battle.js (UI agent)
import { createBattleEngine } from '../engine/battle.js';
import formats from '../engine/formats/index.js';
import { COMMONS } from '../../data/creatures.js';
import { REGIONS } from '../../data/map.js';

const STAGE_LABEL = { minion: 'Minion Battle', elite: 'Elite Battle', boss: 'BOSS BATTLE' };

// Whiffbeard's reteach-card heading rotates randomly so a wrong answer never feels
// like the same scolding twice — re-rolled on every showReteach() call.
const RETEACH_HEADINGS = [
  'Ooof, my young stinker — watch closely…',
  'A trap! A classic trap! Observe…',
  "Ha! That one fools EVERYONE. Here's the secret…",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function regionBgFor(topic) {
  const region = REGIONS.find((r) => r.id === topic.region);
  return region ? region.bg : 'linear-gradient(180deg,#1E3325,#2E4A33)';
}

// Minion/elite stages are fought against a random rank-and-file stinkling, never the
// topic's boss creature — the boss only appears in the boss stage (§5 battle spec).
function castCreatureFor(topic, stage) {
  if (stage === 'boss') return { creature: topic.creature, isBoss: true };
  const stinkling = pick(COMMONS);
  return {
    creature: {
      id: stinkling.id,
      name: `${stinkling.name} the Stinkling`,
      image: stinkling.image,
    },
    isBoss: false,
  };
}

let cleanupFns = [];
let alive = false; // false once unmounted — guards deferred (setTimeout/sleep) callbacks

// setTimeout wrapper used for every game-flow-control timer in this file so its id is
// always registered for disposal in cleanupFns (see unmount()) — prevents orphan timers
// from firing into a torn-down screen after navigating away mid-battle.
function deferTimeout(fn, ms) {
  const id = setTimeout(fn, ms);
  cleanupFns.push(() => clearTimeout(id));
  return id;
}

export async function mount(root, ctx, params) {
  cleanupFns = [];
  alive = true;
  const topic = ctx.topics[params.id];
  const stage = params.stage;
  if (!topic || !STAGE_LABEL[stage]) { ctx.go(`#/topic/${params.id || ''}`); return; }

  const { creature: castCreature, isBoss } = castCreatureFor(topic, stage);

  const screen = document.createElement('div');
  screen.className = 'battle-screen screen enter-pop';
  screen.style.background = regionBgFor(topic);

  const fumes = document.createElement('div');
  fumes.className = 'fumes';
  screen.appendChild(fumes);

  const hud = document.createElement('div');
  hud.className = 'battle-hud';
  hud.innerHTML = `
    <button class="btn btn-ghost battle-back" style="padding:8px 14px;">←</button>
    <div class="pong-meter-wrap">
      <span class="pong-meter-label">PONG METER</span>
      <div class="pong-meter"><div class="pong-meter-fill"></div></div>
    </div>
    ${isBoss ? `<div class="boss-nameplate">${castCreature.name}</div>` : ''}
  `;
  screen.appendChild(hud);

  const streakPips = document.createElement('div');
  streakPips.className = 'streak-pips';
  streakPips.innerHTML = '<span class="streak-pip"></span><span class="streak-pip"></span><span class="streak-pip"></span>';
  screen.appendChild(streakPips);

  // MEGA PARP banner: only mounted into the DOM when a 3-streak actually fires
  // (see triggerMegaBanner) — never present in the tree beforehand.
  let megaBanner = null;

  const arena = document.createElement('div');
  arena.className = 'battle-arena';

  const creatureWrap = document.createElement('div');
  creatureWrap.className = 'battle-creature-wrap';
  // Minion/elite stages fight a common stinkling, shown smaller than a boss
  // (boss art is a 450px asset; stinklings are scaled to ~65% of that presentation).
  creatureWrap.innerHTML = `
    <img class="idle-bob" src="${castCreature.image}" alt="${castCreature.name}" style="${isBoss ? '' : 'transform:scale(.65); transform-origin:center bottom;'}">
    <div class="battle-nameplate-under">${castCreature.name}</div>
  `;
  arena.appendChild(creatureWrap);

  const card = document.createElement('div');
  card.className = 'battle-card';
  arena.appendChild(card);

  screen.appendChild(arena);

  const vignette = document.createElement('div');
  vignette.className = 'vignette-wrong';
  screen.appendChild(vignette);

  const whiteFlash = document.createElement('div');
  whiteFlash.className = 'white-flash';
  screen.appendChild(whiteFlash);

  const stamp = document.createElement('div');
  stamp.className = 'stamp-captured';
  stamp.textContent = 'CAPTURED!';
  screen.appendChild(stamp);

  root.appendChild(screen);

  hud.querySelector('.battle-back').addEventListener('click', () => {
    ctx.audio.sfx('back');
    ctx.go(`#/topic/${topic.id}`);
  });

  ctx.audio.music('battle');

  const engine = createBattleEngine({ topic, stage, seed: Date.now() });

  function updateGauge(refill, forceValue) {
    const fill = hud.querySelector('.pong-meter-fill');
    const pct = forceValue !== undefined ? forceValue : Math.round(engine.getState().gauge * 100);
    fill.style.width = `${pct}%`;
    if (refill) {
      fill.classList.remove('refill-flash');
      void fill.offsetWidth;
      fill.classList.add('refill-flash');
    }
    return fill;
  }

  // Wait for the gauge's CSS width transition (300ms ease, see battle.css) to actually
  // finish before continuing — used before showing the boss-capture end screen so the
  // meter visibly reaches 0% rather than showing residual fill.
  function waitForGaugeTransition(fill) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (done) return; done = true; fill.removeEventListener('transitionend', onEnd); resolve(); };
      const onEnd = (e) => { if (e.propertyName === 'width') finish(); };
      fill.addEventListener('transitionend', onEnd);
      deferTimeout(finish, 400); // safety fallback in case transitionend doesn't fire
    });
  }

  // MEGA PARP banner is created and appended to the DOM only at the moment a 3-streak
  // actually fires, then removed once its animation completes — it must never sit in
  // the tree (even hidden) beforehand, so a DOM text dump right after card 1 is clean.
  function triggerMegaBanner() {
    if (megaBanner) megaBanner.remove();
    megaBanner = document.createElement('div');
    megaBanner.className = 'mega-parp-banner';
    megaBanner.textContent = 'MEGA PARP!';
    screen.appendChild(megaBanner);
    requestAnimationFrame(() => megaBanner.classList.add('show'));
    const el = megaBanner;
    // Cleanup-only timer (removes the banner node), but still registered for disposal
    // so unmount() doesn't leave it dangling against a torn-down screen.
    deferTimeout(() => { el.remove(); if (megaBanner === el) megaBanner = null; }, 1400);
  }

  function updateStreakPips(streak) {
    const pips = streakPips.querySelectorAll('.streak-pip');
    const lit = streak % 3 === 0 && streak > 0 ? 3 : streak % 3;
    pips.forEach((p, i) => p.classList.toggle('lit', i < lit));
  }

  function floatScore(text, colour) {
    const f = document.createElement('div');
    f.className = 'float-score';
    f.textContent = text;
    if (colour) f.style.color = colour;
    arena.appendChild(f);
    requestAnimationFrame(() => f.classList.add('go'));
    // Cleanup-only timer (removes the floating score node); registered for disposal
    // so it can't fire against a screen that's already been torn down.
    deferTimeout(() => f.remove(), 1200);
  }

  let currentQuestion = null;
  let formatHandle = null;

  function renderQuestion(q) {
    currentQuestion = q;
    const api = {
      rng: Math.random, // battle engine already used seeded rng for generation; format shuffle just needs variety
      scaffold: false,
      onAnswer(result) { onAnswer(q, result); },
    };
    // formats need an rng function; supply a lightweight one for shuffling only
    const shuffleRng = (() => { let s = Date.now() ^ Math.floor(Math.random() * 1e9); return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s % 100000) / 100000; }; })();
    api.rng = shuffleRng;
    formatHandle = formats[q.format].render(card, q, api);
  }

  async function bossIntroBeat() {
    // Nameplate slam-in (existing spring-pop entrance class, no new CSS needed) +
    // VO + a double parp, then a beat before the first question appears.
    const nameplate = hud.querySelector('.boss-nameplate');
    if (nameplate) {
      nameplate.classList.remove('enter-pop');
      void nameplate.offsetWidth;
      nameplate.classList.add('enter-pop');
    }
    ctx.audio.vo('boss-intro');
    ctx.audio.parp(2);
    await sleep(650);
    if (!alive) return; // screen was unmounted during the intro beat
  }

  async function firstQuestion() {
    if (isBoss) await bossIntroBeat();
    if (!alive) return; // unmounted during the boss intro beat (or before it, for minions)
    renderQuestion(engine.nextQuestion());
  }

  function onAnswer(q, result) {
    const outcome = engine.recordAnswer(result.correct);

    if (result.correct) {
      ctx.audio.sfx('correct');
      card.classList.remove('flash-correct');
      void card.offsetWidth;
      card.classList.add('flash-correct');
      floatScore('+1 PONG KNOCKED OUT!', 'var(--correct)');
      creatureWrap.classList.remove('jolt');
      void creatureWrap.offsetWidth;
      creatureWrap.classList.add('jolt');
      updateGauge(false);
      updateStreakPips(outcome.streak);

      if (outcome.isMegaParp) {
        ctx.audio.parp(3);
        ctx.audio.vo('streak');
        triggerMegaBanner();
        updateGauge(false);
      } else {
        ctx.audio.vo('correct');
      }

      ctx.state.recordAnswer(topic.id, { correct: true, tier: q.tier }).catch(() => {});

      if (outcome.finished) {
        deferTimeout(() => { if (!alive) return; finishBattle(outcome); }, 700);
      } else {
        deferTimeout(() => { if (!alive) return; renderQuestion(engine.nextQuestion()); }, 900);
      }
    } else {
      ctx.audio.sfx('wrong');
      ctx.audio.parp(1);
      ctx.audio.vo('wrong');
      vignette.classList.remove('pulse');
      void vignette.offsetWidth;
      vignette.classList.add('pulse');
      creatureWrap.classList.remove('wiggle');
      void creatureWrap.offsetWidth;
      creatureWrap.classList.add('wiggle');
      updateStreakPips(0);
      if (stage === 'boss') updateGauge(true);

      ctx.state.recordAnswer(topic.id, { correct: false, tier: q.tier }).catch(() => {});

      showReteach(q, result);

      if (engine.getState().finished) {
        deferTimeout(() => { if (!alive) return; finishBattle(engine.getState()); }, 900);
      }
    }
  }

  function showReteach(q, result) {
    const overlay = document.createElement('div');
    overlay.className = 'reteach-overlay';
    const chosenText = result.chosenText;
    const whyWrong = (q.explain.whyWrong && chosenText && q.explain.whyWrong[chosenText]) || '';
    const reteachHeading = pick(RETEACH_HEADINGS);
    overlay.innerHTML = `
      <div class="reteach-card">
        <div class="reteach-head">
          <div class="wb-portrait"><img class="wb-img" src="assets/monsters/whiffbeard.png" alt=""></div>
          <h3>${reteachHeading}</h3>
        </div>
        <div class="reteach-body">
          <div class="rule-line">${q.explain.rule}</div>
          <div>${q.explain.worked}</div>
          ${whyWrong ? `<div class="why-wrong">${whyWrong}</div>` : ''}
        </div>
        <button class="btn btn-gold" style="padding:14px 26px;">Got it — again!</button>
      </div>
    `;
    arena.appendChild(overlay);
    requestAnimationFrame(() => overlay.querySelector('.reteach-card').classList.add('show'));

    overlay.querySelector('button').addEventListener('click', () => {
      ctx.audio.sfx('confirm');
      overlay.remove();
      if (!engine.getState().finished) {
        renderQuestion(engine.variantQuestion(q.tier));
      }
    });
  }

  // Hide the question area and streak pips before any end screen shows — end screens
  // are full-bleed overlays but the card/pips must not remain visible/behind them.
  function hideQuestionArea() {
    card.style.display = 'none';
    card.innerHTML = '';
    streakPips.style.display = 'none';
    if (megaBanner) { megaBanner.remove(); megaBanner = null; }
  }

  async function finishBattle(outcome) {
    if (!alive) return; // screen already unmounted (e.g. a queued deferTimeout firing late)
    if (outcome.won) {
      // Ensure the PONG METER visibly finishes draining to exactly 0% before any
      // end screen appears — force the value and await the transition.
      const fill = updateGauge(false, 0);
      await waitForGaugeTransition(fill);
      if (!alive) return; // unmounted while waiting for the gauge transition
    }
    hideQuestionArea();

    if (stage === 'boss' && outcome.won) {
      await runCaptureSequence(outcome);
    } else if (stage === 'boss') {
      await runBossNotYetScreen(outcome);
    } else {
      await runScrapEndScreen(outcome);
    }
  }

  async function runBossNotYetScreen(outcome) {
    ctx.audio.music('map');
    ctx.audio.sfx('confirm');
    const tip = pick(topic.tips);
    const end = document.createElement('div');
    end.className = 'battle-end-screen enter-pop';
    end.innerHTML = `
      <h1 class="end-title">So close, hero!</h1>
      <div class="end-tally">${topic.creature.name} held on — but only just. No progress lost, no lives gone. Have another go whenever you're ready!</div>
      <div class="wisdom-tip"><b>Whiff of Wisdom:</b> ${tip}</div>
      <button class="btn btn-gold" style="padding:16px 36px; font-size:18px;">Back to ${topic.name}</button>
    `;
    screen.appendChild(end);
    end.querySelector('button').addEventListener('click', () => {
      ctx.audio.sfx('click');
      ctx.go(`#/topic/${topic.id}`);
    });
  }

  async function runScrapEndScreen(outcome) {
    ctx.audio.music('map');
    const end = document.createElement('div');
    end.className = 'battle-end-screen enter-pop';

    let dropHtml = '';
    let dropCreature = null;
    if (stage === 'elite' && outcome.won && Math.random() < 0.2) {
      const owned = ctx.state.commonsOwned();
      const unowned = COMMONS.filter((c) => !owned.includes(c.id));
      if (unowned.length > 0) {
        dropCreature = pick(unowned);
        await ctx.state.grantCommon(dropCreature.id);
        if (!alive) return; // unmounted while grantCommon was pending
        dropHtml = `
          <div class="stinkling-drop-card enter-up">
            <img src="${dropCreature.image}" alt="${dropCreature.name}">
            <div><b>${dropCreature.name}</b> joined your collection!</div>
          </div>
        `;
      }
    }

    const tip = pick(topic.tips);

    end.innerHTML = `
      <h1 class="end-title">${outcome.won ? 'SCRAP WON!' : 'Nearly there!'}</h1>
      <div class="end-tally">Hits landed: ${outcome.hitsLanded} / ${outcome.totalHitsNeeded}</div>
      ${dropHtml}
      <div class="wisdom-tip"><b>Whiff of Wisdom:</b> ${tip}</div>
      <button class="btn btn-gold" style="padding:16px 36px; font-size:18px;">Back to ${topic.name}</button>
    `;
    screen.appendChild(end);
    ctx.audio.sfx('confirm');
    if (dropCreature) ctx.audio.vo('collect');

    end.querySelector('button').addEventListener('click', () => {
      ctx.audio.sfx('click');
      ctx.go(`#/topic/${topic.id}`);
    });
  }

  async function runCaptureSequence(outcome) {
    creatureWrap.classList.add('slowmo-wobble');
    await sleep(1400);
    if (!alive) return; // unmounted mid slow-mo wobble
    whiteFlash.classList.add('go');
    await sleep(160);
    if (!alive) return; // unmounted during the white flash beat
    ctx.audio.sfx('capture');
    ctx.audio.vo('boss-defeated');

    const flawless = outcome.flawless;
    // recordBoss persistence is best-effort (state.js never rejects post-fix, but we
    // guard here too, belt-and-braces): a storage failure must never strand the child
    // on the white-flash overlay with no way forward — always continue to the capture
    // end screen regardless of whether the write succeeded.
    try {
      await ctx.state.recordBoss(topic.id, { won: true, flawless });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('battle.js: recordBoss failed, continuing capture sequence anyway:', err);
    }
    if (!alive) return; // unmounted while recordBoss was pending
    if (flawless) ctx.audio.vo('shiny');

    spawnConfetti(screen);
    stamp.classList.add('show');

    await sleep(600);
    if (!alive) return; // unmounted during the confetti/stamp beat
    ctx.audio.music('map');

    const record = ctx.state.topic(topic.id);
    const stars = record.shiny ? '⭐⭐⭐ SHINY!' : '⭐⭐';
    const tip = pick(topic.tips);
    // Only place-value/decimals-x10/rounding bosses have a -shiny.png sibling (rare-rarity
    // topic bosses); show it once flawless, falling back to the normal image if missing.
    const captureImage = record.shiny ? topic.creature.image.replace(/\.png$/, '-shiny.png') : topic.creature.image;

    const end = document.createElement('div');
    end.className = 'battle-end-screen enter-pop';
    end.innerHTML = `
      <h1 class="end-title">CAPTURED!</h1>
      <div class="end-creature-card">
        <img src="${captureImage}" alt="${topic.creature.name}" onerror="this.onerror=null;this.src='${topic.creature.image}'">
        <h2 style="font-family:'Fredoka',sans-serif; margin:6px 0;">${topic.creature.name}</h2>
        <div class="stars">${stars}</div>
      </div>
      <div class="wisdom-tip"><b>Whiff of Wisdom:</b> ${tip}</div>
      <button class="btn btn-gold" style="padding:16px 36px; font-size:18px;">You absolute legend of the bog!</button>
    `;
    screen.appendChild(end);
    end.querySelector('button').addEventListener('click', () => {
      ctx.audio.sfx('click');
      ctx.go(`#/topic/${topic.id}`);
    });
  }

  // Registers its own timeout for disposal in cleanupFns, so an awaited sleep() that's
  // still pending when the screen unmounts never resolves into torn-down DOM/state.
  function sleep(ms) {
    return new Promise((r) => { deferTimeout(r, ms); });
  }

  function spawnConfetti(container) {
    const colours = ['#F4C542', '#2ecc71', '#9B59D0', '#C7F464', '#e74c3c', '#FFF9EC'];
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colours[i % colours.length];
      piece.style.animationDuration = `${1.2 + Math.random() * 1.4}s`;
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      container.appendChild(piece);
      // Cleanup-only timer (removes a single confetti piece); registered for disposal —
      // 80 of these can otherwise queue up and fire long after the screen has gone.
      deferTimeout(() => piece.remove(), 3200);
    }
  }

  updateGauge(false);
  firstQuestion();
}

export function unmount() {
  alive = false;
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}

export default { mount, unmount };
