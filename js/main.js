// FART QUEST — js/main.js (UI agent)
// Boot: register SW, open db, load state, preinit audio, wire router, go.

import db from './db.js';
import state from './state.js';
import audio from './audio.js';
import router from './router.js';
import { STAGE_CONFIG } from './engine/battle.js';
import { createExamProvider } from './examProvider.js';

import { TOPICS } from '../data/topics/index.js';

import * as titleScreen from './screens/title.js';
import * as mapScreen from './screens/map.js';
import * as topicScreen from './screens/topic.js';
import * as lessonScreen from './screens/lesson.js';
import * as battleScreen from './screens/battle.js';
import * as collectionScreen from './screens/collection.js';
import * as armouryScreen from './screens/armoury.js';
import * as parentScreen from './screens/parent.js';
import * as settingsScreen from './screens/settings.js';

export { TOPICS };

const SFX_MAP = {
  'click': 'audio/sfx/click.m4a',
  'confirm': 'audio/sfx/confirm.m4a',
  'back': 'audio/sfx/back.m4a',
  'correct': 'audio/sfx/correct.m4a',
  'wrong': 'audio/sfx/wrong.m4a',
  'unlock': 'audio/sfx/unlock.m4a',
  'capture': 'audio/sfx/capture.m4a',
  'tick': 'audio/sfx/tick.m4a',
  'fart-1': 'audio/sfx/fart-1.m4a',
  'fart-2': 'audio/sfx/fart-2.m4a',
  'fart-3': 'audio/sfx/fart-3.m4a',
  'fart-4': 'audio/sfx/fart-4.m4a',
};

function showToast(msg) {
  const overlay = document.getElementById('overlay');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  overlay.appendChild(el);
  setTimeout(() => { el.remove(); }, 2800);
}

async function loadSettings() {
  const defaults = {
    music: 1, sfx: 1, vo: 1, fartOMeter: 2, musicOn: true, sfxOn: true, voOn: true, textSize: 'A',
    examTimerSounds: true,
  };
  try {
    const saved = await db.get('settings', 'prefs');
    return Object.assign({}, defaults, saved || {});
  } catch (e) {
    return defaults;
  }
}

// Screens for #/story and #/exam are authored by other concurrent agents and
// may not exist on disk yet — load them defensively via dynamic import so a
// missing file degrades to a friendly redirect instead of a fatal boot error.
// Once those files land, this same code picks them up with zero changes here.
async function loadOptionalScreen(path) {
  try {
    const mod = await import(path);
    if (mod && typeof mod.mount === 'function') return mod;
    if (mod && mod.default && typeof mod.default.mount === 'function') return mod.default;
    return null;
  } catch (e) {
    return null;
  }
}

function comingSoonScreen(message, redirectHash) {
  return {
    mount(root, ctx) {
      ctx.toast(message);
      ctx.go(redirectHash);
    },
    unmount() {},
  };
}

async function boot() {
  // register service worker (best-effort, never blocks boot)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  try {
    await db.open();
  } catch (e) {
    // no IndexedDB (shouldn't happen in Safari) — app still boots, just won't persist
  }

  try {
    await state.load(db);
  } catch (e) {
    // swallow — state has safe in-memory defaults
  }

  const prefs = await loadSettings();
  audio.setSfxMap(SFX_MAP);
  audio.setVolumes({
    music: prefs.musicOn ? prefs.music : 0,
    sfx: prefs.sfxOn ? prefs.sfx : 0,
    vo: prefs.voOn ? prefs.vo : 0,
  });
  audio.setFartOMeter(prefs.fartOMeter);
  audio.attachUnlock();
  audio.preinit();

  document.body.classList.toggle('text-size-large', prefs.textSize === 'A+');

  const [storyMod, examMod] = await Promise.all([
    loadOptionalScreen('./screens/story.js'),
    loadOptionalScreen('./screens/exam.js'),
  ]);

  const capabilities = {
    story: !!storyMod,
    exam: !!examMod,
    // Morning Patrol (§I) needs a 'patrol' battle stage the battle engine may
    // not have wired up yet — feature-detect rather than assume.
    patrol: !!(STAGE_CONFIG && STAGE_CONFIG.patrol),
  };

  const ctx = {
    db,
    state,
    audio,
    topics: TOPICS,
    prefs,
    capabilities,
    go: (hash) => router.go(hash),
    toast: showToast,
    // Real question source for Castle Clench (INTEGRATION_NOTES.md item 3) — draws
    // from the maths generators, English drill banks and storybog passages instead
    // of js/screens/exam.js's own createStubProvider() placeholder.
    examProvider: createExamProvider(),
  };

  router.register('/title', titleScreen);
  router.register('/map', mapScreen);
  // Specific region-battle path MUST be registered before the generic
  // '/battle/:id/:stage' pattern below, or that pattern would swallow it
  // (matching id='region', stage=':regionId').
  router.register('/battle/region/:regionId', battleScreen);
  router.register('/battle/:id/:stage', battleScreen);
  router.register('/topic/:id', topicScreen);
  router.register('/lesson/:id', lessonScreen);
  router.register('/collection', collectionScreen);
  router.register('/armoury', armouryScreen);
  router.register('/parent', parentScreen);
  router.register('/settings', settingsScreen);
  router.register('/story', storyMod || comingSoonScreen("The kingdom's tale arrives soon!", '#/map'));
  router.register('/exam', examMod || comingSoonScreen('Castle Clench opens once more of the kingdom is clean!', '#/map'));
  // '/patrol' is deliberately NOT registered: the battle engine has no 'patrol'
  // stage yet (see capabilities.patrol above). The map's Morning Patrol button
  // stays disabled until that lands, rather than routing anywhere broken.

  const appRoot = document.getElementById('app');
  router.start(appRoot, ctx);
}

boot();
