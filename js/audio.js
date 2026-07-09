// FART QUEST — audio.js (AUDIO-ENGINE agent)
// Vanilla ES module. No external deps. Must be safe to call before init (no-ops/queued).
// No console noise in normal operation.

// ---------- internal state ----------
let ctx = null;                 // AudioContext
let unlocked = false;
let unlockAttached = false;

let sfxMap = {};                 // name -> url, baked in / discoverable at runtime
const sfxBufferCache = new Map(); // url -> decoded AudioBuffer (or a pending Promise)
const sfxFailedUrls = new Set();  // urls we tried and failed to fetch/decode — don't retry

let voManifestPromise = null;    // Promise<string[]> of vo file names, fetched once
let lastVoFile = null;           // last played vo filename, to avoid immediate repeat
let currentVoEl = null;          // the single <audio> element used for VO playback

let musicEls = { a: null, b: null }; // two <audio> elements for crossfading
let activeMusicSlot = 'a';
let currentTrackName = null;
let musicFailedTracks = new Set(); // track names we've tried & failed to load — don't retry this session
let musicBaseVolume = 1;         // user-set music volume (0..1) before ducking
let duckActive = false;

let volumes = { music: 1, sfx: 1, vo: 1 };
let fartOMeter = 2; // 0 = off/soft, 1 = silly, 2 = very silly (default mid)

// candidate extensions to try for music files, in order
const MUSIC_EXTS = ['mp3', 'm4a'];

// ---------- helpers ----------

function safeNoop() {}

function nowMs() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

function clamp01(v) {
  v = Number(v);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

// Fetch + decode an sfx url, caching the decoded buffer. Never throws — resolves null on failure.
async function loadSfxBuffer(url) {
  if (!url) return null;
  if (sfxFailedUrls.has(url)) return null;
  if (sfxBufferCache.has(url)) {
    const cached = sfxBufferCache.get(url);
    return cached instanceof Promise ? cached : cached;
  }
  const ac = ensureCtx();
  if (!ac) return null;

  const p = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('sfx fetch failed');
      const arr = await res.arrayBuffer();
      const buf = await ac.decodeAudioData(arr);
      sfxBufferCache.set(url, buf);
      return buf;
    } catch (e) {
      sfxFailedUrls.add(url);
      sfxBufferCache.delete(url);
      return null;
    }
  })();

  sfxBufferCache.set(url, p);
  return p;
}

function playDecodedBuffer(buf, { gain = 1 } = {}) {
  const ac = ensureCtx();
  if (!ac || !buf) return;
  try {
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.value = clamp01(gain) * clamp01(volumes.sfx);
    src.connect(g).connect(ac.destination);
    src.start();
  } catch (e) {
    // swallow — no console noise
  }
}

// Find sfx map keys that look like real fart samples, e.g. "fart-1", "fart-big-2"
function realFartSampleNames() {
  return Object.keys(sfxMap).filter((k) => /^fart-/i.test(k));
}

function pickRandom(arr) {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------- synth parp ----------

function synthParp(size, { poof = false } = {}) {
  const ac = ensureCtx();
  if (!ac) return;

  const durationMap = { 1: 0.18, 2: 0.35, 3: 0.55 };
  const baseDur = durationMap[size] || durationMap[2];
  // slight random variance so no two parps are identical
  const duration = Math.max(0.15, Math.min(0.6, baseDur + (Math.random() * 0.08 - 0.04)));

  const t0 = ac.currentTime + 0.001;
  const detune = (Math.random() * 24 - 12); // cents

  try {
    const osc = ac.createOscillator();
    osc.type = poof ? 'sine' : 'sawtooth';
    const startFreq = poof ? 220 : 90;
    const endFreq = poof ? 120 : 45;
    osc.frequency.setValueAtTime(startFreq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration);
    if (osc.detune) osc.detune.setValueAtTime(detune, t0);

    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(poof ? 900 : 400, t0);
    filter.Q.value = poof ? 0.5 : 1.2;

    // LFO wobble on the filter cutoff
    const lfo = ac.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = poof ? 4 : 9 + Math.random() * 4;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = poof ? 60 : 120;
    lfo.connect(lfoGain).connect(filter.frequency);

    const amp = ac.createGain();
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(clamp01(volumes.sfx) * (poof ? 0.5 : 0.9) + 0.0001, t0 + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(filter).connect(amp).connect(ac.destination);

    osc.start(t0);
    lfo.start(t0);
    osc.stop(t0 + duration + 0.05);
    lfo.stop(t0 + duration + 0.05);
  } catch (e) {
    // swallow
  }
}

// ---------- public: attachUnlock ----------

function startTitleMusic() {
  // best-effort; music() itself tolerates missing files
  music('title');
}

function attachUnlock() {
  if (unlockAttached) return;
  unlockAttached = true;

  const handler = () => {
    window.removeEventListener('pointerdown', handler, true);
    unlocked = true;
    const ac = ensureCtx();
    if (ac && ac.state === 'suspended') {
      ac.resume().catch(safeNoop);
    }
    startTitleMusic();
  };

  try {
    window.addEventListener('pointerdown', handler, true);
  } catch (e) {
    // no-op if window unavailable
  }
}

// ---------- public: sfx map ----------

function setSfxMap(map) {
  if (map && typeof map === 'object') {
    sfxMap = Object.assign({}, map);
  }
}

async function sfx(name) {
  try {
    const url = sfxMap[name];
    if (!url) return;
    const buf = await loadSfxBuffer(url);
    if (buf) playDecodedBuffer(buf, { gain: 1 });
  } catch (e) {
    // swallow — never throw from sfx()
  }
}

// ---------- public: parp ----------

async function parp(size) {
  size = [1, 2, 3].includes(size) ? size : 2;

  if (fartOMeter === 0) {
    synthParp(size, { poof: true });
    return;
  }

  // always play the synth as guaranteed layer/fallback
  synthParp(size, { poof: false });

  // maybe layer/substitute a real sample if available
  const samples = realFartSampleNames();
  if (samples.length > 0 && Math.random() < 0.6) {
    const chosen = pickRandom(samples);
    try {
      const buf = await loadSfxBuffer(sfxMap[chosen]);
      if (buf) playDecodedBuffer(buf, { gain: 0.9 });
    } catch (e) {
      // swallow
    }
  }
}

// ---------- public: vo ----------

async function fetchVoManifestOnce() {
  if (voManifestPromise) return voManifestPromise;
  voManifestPromise = (async () => {
    try {
      const res = await fetch('audio/vo/manifest.json', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      if (data && Array.isArray(data.files)) return data.files;
      return [];
    } catch (e) {
      return [];
    }
  })();
  return voManifestPromise;
}

function duck(active) {
  duckActive = !!active;
  applyMusicVolume();
}

// Lets screens (e.g. story.js) react to a VO clip finishing without coupling
// them to audio.js internals — never throws.
function dispatchVoEnded(file) {
  try {
    window.dispatchEvent(new CustomEvent('fq-vo-ended', { detail: { file } }));
  } catch (e) {
    // swallow
  }
}

// Returns true if a matching vo recording was found and playback was attempted
// (i.e. this prefix has a real recording), false if no recording exists for
// this prefix. js/engine/lesson.js uses this to fall back to the
// 'teach-generic' voice line when a topic-specific teach clip hasn't been
// recorded yet — this must NEVER throw, every path below resolves.
async function vo(prefix) {
  try {
    if (!prefix) return false;
    const files = await fetchVoManifestOnce();
    if (!files || files.length === 0) return false; // resolve silently

    const re = new RegExp('^vo-' + prefix);
    let matches = files.filter((f) => re.test(f));
    if (matches.length === 0) return false; // resolve silently

    // dedupe: never same file twice in a row (if more than one option)
    if (matches.length > 1 && lastVoFile) {
      const filtered = matches.filter((f) => f !== lastVoFile);
      if (filtered.length > 0) matches = filtered;
    }

    const chosen = pickRandom(matches);
    if (!chosen) return false;
    lastVoFile = chosen;

    // single <audio> element — new vo interrupts old
    if (currentVoEl) {
      try {
        currentVoEl.pause();
        currentVoEl.src = '';
      } catch (e) {
        // swallow
      }
    }

    const el = new Audio();
    currentVoEl = el;
    el.src = 'audio/vo/' + chosen;
    el.volume = clamp01(volumes.vo);

    duck(true);
    // Fix (duck-hardening): a VO clip that stalls, gets interrupted at the OS
    // level, or otherwise never fires 'ended'/'error' used to leave music ducked
    // at 25% forever. Restoring on 'pause' too (covers programmatic/OS pauses)
    // and a 40s safety timeout (covers the "no event ever fires" case) closes
    // both gaps. clearDuck is idempotent so being called more than once (e.g.
    // 'pause' then 'ended' on natural completion) is harmless.
    let safetyTimer = null;
    let started = false; // true once play() has actually resolved (real playback began)
    const clearDuck = () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
      }
      if (currentVoEl === el) {
        duck(false);
      }
    };
    // Fix (advance-on-VO-end, ENGINE_SPEC_2 §F): screens like story.js need to
    // know when THIS clip is actually done so they can hold the scene for the
    // full narration instead of a flat timer. Only fire for a clip that really
    // played — 'pause' (used when a NEW vo() call interrupts this element) never
    // dispatches, so an interrupted clip doesn't falsely signal "ended" to a
    // listener that likely isn't even listening any more.
    // Both handlers also gate on `currentVoEl === el`: live-verified on iPad
    // Safari's engine that assigning `.src = ''` to the OLD element (a few lines
    // up, when THIS vo() call interrupts a previous one) fires that old element's
    // 'error' event asynchronously — even when the old clip had already finished
    // naturally. Without this gate that stray error re-dispatched 'fq-vo-ended'
    // for the PREVIOUS file just as the new scene's listener was attaching,
    // which could cause a false-immediate advance. Once superseded, `el` is no
    // longer `currentVoEl`, so the gate suppresses it.
    const onEnded = () => {
      clearDuck();
      if (currentVoEl === el) dispatchVoEnded(chosen);
    };
    const onError = () => {
      clearDuck();
      if (started && currentVoEl === el) dispatchVoEnded(chosen); // mid-playback failure — treat as "done" too
    };
    safetyTimer = setTimeout(clearDuck, 40000);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    el.addEventListener('pause', clearDuck);

    await el.play().then(() => {
      started = true;
    }).catch(() => {
      clearDuck();
    });
    return true; // recording for this prefix exists and playback was attempted
  } catch (e) {
    // NEVER throw or console.error
    return false;
  }
}

// Warms the service worker's runtime audio cache (sw.js caches audio/** on
// first fetch, cache-first thereafter — see sw.js isAudio()) for every vo
// manifest file matching any of the given prefixes, so the FIRST real vo(prefix)
// call on a screen doesn't stall on a cold network fetch. Deliberately does NOT
// construct <audio> elements (that would be a real "preload", not a cache warm)
// — just fires the fetch and lets the SW's fetch handler do the caching.
// Capped at 12 files per call so a screen can't accidentally flood the network.
async function preloadVo(prefixes) {
  try {
    if (!prefixes || prefixes.length === 0) return;
    const files = await fetchVoManifestOnce();
    if (!files || files.length === 0) return; // resolve silently, same as vo()

    const matched = [];
    for (const file of files) {
      for (const prefix of prefixes) {
        if (!prefix) continue;
        const re = new RegExp('^vo-' + prefix);
        if (re.test(file)) {
          matched.push(file);
          break;
        }
      }
      if (matched.length >= 12) break;
    }

    matched.forEach((file) => {
      try {
        // best-effort, low-priority warm-up fetch — never awaited, never throws.
        // `priority` is ignored (not thrown on) by engines that don't support the
        // Fetch Priority API, iPad Safari included as of this writing.
        fetch('audio/vo/' + file, { priority: 'low' }).catch(() => {});
      } catch (e) {
        // swallow
      }
    });
  } catch (e) {
    // NEVER throw — this is a best-effort optimisation only
  }
}

// ---------- public: music ----------

function applyMusicVolume() {
  const factor = duckActive ? 0.25 : 1;
  const target = clamp01(musicBaseVolume) * factor;
  const activeEl = musicEls[activeMusicSlot];
  if (activeEl) activeEl.volume = target;
}

function candidateMusicUrls(track) {
  return MUSIC_EXTS.map((ext) => `audio/music/${track}.${ext}`);
}

async function tryLoadMusicEl(el, track) {
  const urls = candidateMusicUrls(track);
  for (const url of urls) {
    const ok = await new Promise((resolve) => {
      let settled = false;
      const done = (val) => {
        if (settled) return;
        settled = true;
        el.removeEventListener('canplaythrough', onOk);
        el.removeEventListener('error', onErr);
        resolve(val);
      };
      const onOk = () => done(true);
      const onErr = () => done(false);
      el.addEventListener('canplaythrough', onOk, { once: true });
      el.addEventListener('error', onErr, { once: true });
      try {
        el.src = url;
        el.load();
      } catch (e) {
        done(false);
      }
    });
    if (ok) return true;
  }
  return false;
}

const TRACK_ALIASES = { title: 'map' }; // title screen shares the map theme

async function music(track) {
  try {
    if (!track) return;
    track = TRACK_ALIASES[track] || track;
    if (track === currentTrackName) return; // already playing
    if (musicFailedTracks.has(track)) return; // remembered failure, stay silent

    const nextSlot = activeMusicSlot === 'a' ? 'b' : 'a';
    if (!musicEls[nextSlot]) {
      const el = new Audio();
      el.loop = true;
      el.preload = 'auto';
      musicEls[nextSlot] = el;
    }
    const nextEl = musicEls[nextSlot];
    const prevEl = musicEls[activeMusicSlot];

    const loaded = await tryLoadMusicEl(nextEl, track);
    if (!loaded) {
      musicFailedTracks.add(track);
      return; // stay silent, don't retry this track this session
    }

    nextEl.volume = 0;
    try {
      await nextEl.play();
    } catch (e) {
      musicFailedTracks.add(track);
      return;
    }

    currentTrackName = track;

    // 800ms JS crossfade
    const steps = 16;
    const stepMs = 800 / steps;
    const targetVol = clamp01(musicBaseVolume) * (duckActive ? 0.25 : 1);
    let i = 0;

    activeMusicSlot = nextSlot;

    await new Promise((resolve) => {
      const iv = setInterval(() => {
        i += 1;
        const frac = i / steps;
        nextEl.volume = clamp01(targetVol * frac);
        if (prevEl) prevEl.volume = clamp01(targetVol * (1 - frac));
        if (i >= steps) {
          clearInterval(iv);
          if (prevEl && prevEl !== nextEl) {
            try {
              prevEl.pause();
              prevEl.src = '';
            } catch (e) {
              // swallow
            }
          }
          resolve();
        }
      }, stepMs);
    });
  } catch (e) {
    // swallow — music must never throw
  }
}

// Fades whichever music element(s) are currently playing down to silence over
// fadeMs, then pauses + clears them and resets currentTrackName so a later
// music(track) call — even for the SAME track that was just stopped — restarts
// cleanly instead of being swallowed by the "already playing" early-return in
// music() above. Safe no-op when nothing is playing.
function stopMusic(fadeMs = 600) {
  const els = [musicEls.a, musicEls.b].filter((el) => el && !el.paused);
  if (els.length === 0) {
    currentTrackName = null;
    return;
  }

  const startVols = els.map((el) => el.volume);
  const steps = 12;
  const stepMs = Math.max(1, fadeMs) / steps;
  let i = 0;

  const iv = setInterval(() => {
    i += 1;
    const frac = i / steps;
    els.forEach((el, idx) => {
      el.volume = clamp01(startVols[idx] * (1 - frac));
    });
    if (i >= steps) {
      clearInterval(iv);
      els.forEach((el) => {
        try {
          el.pause();
          el.src = '';
        } catch (e) {
          // swallow
        }
      });
      currentTrackName = null;
    }
  }, stepMs);
}

// ---------- page visibility: never play music from a hidden tab ----------
// Damien report (9 Jul): theme kept playing from a backgrounded tab. Pause any
// playing music element on hide; resume only those same elements on return.
// stopMusic()/crossfade may clear an element's src while hidden — the resulting
// play() rejection is swallowed, so the interaction is harmless.
let hiddenPausedEls = [];
try {
  document.addEventListener('visibilitychange', () => {
    try {
      if (document.hidden) {
        hiddenPausedEls = [musicEls.a, musicEls.b].filter((el) => el && !el.paused);
        hiddenPausedEls.forEach((el) => { try { el.pause(); } catch (e) { /* swallow */ } });
      } else {
        hiddenPausedEls.forEach((el) => {
          try { const p = el.play(); if (p && p.catch) p.catch(safeNoop); } catch (e) { /* swallow */ }
        });
        hiddenPausedEls = [];
      }
    } catch (e) { /* audio must never throw */ }
  });
} catch (e) { /* non-browser context */ }

// ---------- public: debug ----------

// Harmless read-only readout of current music state, used by manual/preview
// verification (no internal state is exposed via imports, so this is the only
// way to confirm ducking/stopping is actually happening from outside the module).
function getMusicState() {
  const activeEl = musicEls[activeMusicSlot];
  return {
    track: currentTrackName,
    paused: activeEl ? activeEl.paused : true,
    volume: activeEl ? activeEl.volume : 0,
  };
}

// ---------- public: volumes / fart-o-meter ----------

function setVolumes(v) {
  if (!v || typeof v !== 'object') return;
  if (typeof v.music === 'number') musicBaseVolume = clamp01(v.music);
  if (typeof v.sfx === 'number') volumes.sfx = clamp01(v.sfx);
  if (typeof v.vo === 'number') volumes.vo = clamp01(v.vo);
  applyMusicVolume();
  if (currentVoEl) currentVoEl.volume = clamp01(volumes.vo);
}

function setFartOMeter(v) {
  const n = Number(v);
  fartOMeter = Number.isFinite(n) ? n : fartOMeter;
}

// optional: allow late registration of sfx map (e.g. by loader that discovers files)
function preinit() {
  // reserved for future warm-up; safe no-op today
}

export default {
  attachUnlock,
  setSfxMap,
  sfx,
  parp,
  vo,
  preloadVo,
  music,
  stopMusic,
  duck,
  setVolumes,
  setFartOMeter,
  preinit,
  getMusicState,
};
