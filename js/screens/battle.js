// FART QUEST — screens/battle.js (UI agent)
import { createBattleEngine } from '../engine/battle.js';
import formats from '../engine/formats/index.js';
import { COMMONS } from '../../data/creatures.js';
import { REGIONS } from '../../data/map.js';

const STAGE_LABEL = { minion: 'Minion Battle', elite: 'Elite Battle', boss: 'BOSS BATTLE' };

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function regionBgFor(topic) {
  const region = REGIONS.find((r) => r.id === topic.region);
  return region ? region.bg : 'linear-gradient(180deg,#1E3325,#2E4A33)';
}

let cleanupFns = [];

export async function mount(root, ctx, params) {
  cleanupFns = [];
  const topic = ctx.topics[params.id];
  const stage = params.stage;
  if (!topic || !STAGE_LABEL[stage]) { ctx.go(`#/topic/${params.id || ''}`); return; }

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
    ${stage === 'boss' ? `<div class="boss-nameplate">${topic.creature.name}</div>` : ''}
  `;
  screen.appendChild(hud);

  const streakPips = document.createElement('div');
  streakPips.className = 'streak-pips';
  streakPips.innerHTML = '<span class="streak-pip"></span><span class="streak-pip"></span><span class="streak-pip"></span>';
  screen.appendChild(streakPips);

  const megaBanner = document.createElement('div');
  megaBanner.className = 'mega-parp-banner';
  megaBanner.textContent = 'MEGA PARP!';
  screen.appendChild(megaBanner);

  const arena = document.createElement('div');
  arena.className = 'battle-arena';

  const creatureWrap = document.createElement('div');
  creatureWrap.className = 'battle-creature-wrap';
  creatureWrap.innerHTML = `
    <img class="idle-bob" src="${topic.creature.image}" alt="${topic.creature.name}">
    <div class="battle-nameplate-under">${topic.creature.name}</div>
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
  if (stage === 'boss') ctx.audio.vo('boss-intro');

  const engine = createBattleEngine({ topic, stage, seed: Date.now() });

  function updateGauge(refill) {
    const fill = hud.querySelector('.pong-meter-fill');
    fill.style.width = `${Math.round(engine.getState().gauge * 100)}%`;
    if (refill) {
      fill.classList.remove('refill-flash');
      void fill.offsetWidth;
      fill.classList.add('refill-flash');
    }
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
    setTimeout(() => f.remove(), 1200);
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

  function firstQuestion() {
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
        megaBanner.classList.remove('show');
        void megaBanner.offsetWidth;
        megaBanner.classList.add('show');
        updateGauge(false);
      } else {
        ctx.audio.vo('correct');
      }

      ctx.state.recordAnswer(topic.id, { correct: true, tier: q.tier });

      if (outcome.finished) {
        setTimeout(() => finishBattle(outcome), 700);
      } else {
        setTimeout(() => renderQuestion(engine.nextQuestion()), 900);
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

      ctx.state.recordAnswer(topic.id, { correct: false, tier: q.tier });

      showReteach(q, result);

      if (engine.getState().finished) {
        setTimeout(() => finishBattle(engine.getState()), 900);
      }
    }
  }

  function showReteach(q, result) {
    const overlay = document.createElement('div');
    overlay.className = 'reteach-overlay';
    const chosenText = result.chosenText;
    const whyWrong = (q.explain.whyWrong && chosenText && q.explain.whyWrong[chosenText]) || '';
    overlay.innerHTML = `
      <div class="reteach-card">
        <div class="reteach-head">
          <div class="wb-portrait">🧙</div>
          <h3>Ooof! Watch this…</h3>
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

  async function finishBattle(outcome) {
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
    whiteFlash.classList.add('go');
    await sleep(160);
    ctx.audio.sfx('capture');
    ctx.audio.vo('boss-defeated');

    const flawless = outcome.flawless;
    await ctx.state.recordBoss(topic.id, { won: true, flawless });
    if (flawless) ctx.audio.vo('shiny');

    spawnConfetti(screen);
    stamp.classList.add('show');

    await sleep(600);
    ctx.audio.music('map');

    const record = ctx.state.topic(topic.id);
    const stars = record.shiny ? '⭐⭐⭐ SHINY!' : '⭐⭐';
    const tip = pick(topic.tips);

    const end = document.createElement('div');
    end.className = 'battle-end-screen enter-pop';
    end.innerHTML = `
      <h1 class="end-title">CAPTURED!</h1>
      <div class="end-creature-card">
        <img src="${topic.creature.image}" alt="${topic.creature.name}">
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

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

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
      setTimeout(() => piece.remove(), 3200);
    }
  }

  updateGauge(false);
  firstQuestion();
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}

export default { mount, unmount };
