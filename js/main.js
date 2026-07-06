// FART QUEST — js/main.js (UI agent)
// Boot: register SW, open db, load state, preinit audio, wire router, go.

import db from './db.js';
import state from './state.js';
import audio from './audio.js';
import router from './router.js';

import placeValueTopic from '../data/topics/place-value.js';
import decimalsTopic from '../data/topics/decimals-x10.js';
import roundingTopic from '../data/topics/rounding.js';

import * as titleScreen from './screens/title.js';
import * as mapScreen from './screens/map.js';
import * as topicScreen from './screens/topic.js';
import * as lessonScreen from './screens/lesson.js';
import * as battleScreen from './screens/battle.js';
import * as collectionScreen from './screens/collection.js';
import * as armouryScreen from './screens/armoury.js';
import * as parentScreen from './screens/parent.js';
import * as settingsScreen from './screens/settings.js';

export const TOPICS = {
  'place-value': placeValueTopic,
  'decimals-x10': decimalsTopic,
  'rounding': roundingTopic,
};

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
  const defaults = { music: 1, sfx: 1, vo: 1, fartOMeter: 2, musicOn: true, sfxOn: true, voOn: true, textSize: 'A' };
  try {
    const saved = await db.get('settings', 'prefs');
    return Object.assign({}, defaults, saved || {});
  } catch (e) {
    return defaults;
  }
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

  const ctx = {
    db,
    state,
    audio,
    topics: TOPICS,
    prefs,
    go: (hash) => router.go(hash),
    toast: showToast,
  };

  router.register('/title', titleScreen);
  router.register('/map', mapScreen);
  router.register('/topic/:id', topicScreen);
  router.register('/lesson/:id', lessonScreen);
  router.register('/battle/:id/:stage', battleScreen);
  router.register('/collection', collectionScreen);
  router.register('/armoury', armouryScreen);
  router.register('/parent', parentScreen);
  router.register('/settings', settingsScreen);

  const appRoot = document.getElementById('app');
  router.start(appRoot, ctx);
}

boot();
