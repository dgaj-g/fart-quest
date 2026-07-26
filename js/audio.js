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

// shuffled-rotation state for musicPlaylist() (see "public: music playlist" below)
let playlistGen = 0;              // this rotation's own generation token (separate from musicGen)
let playlistPollIv = null;        // the single clock-poll interval for the live rotation, if any
let playlistTracksSrc = [];        // original (unshuffled) track list passed to musicPlaylist()
let playlistOrder = [];            // current shuffled rotation order
let playlistIndex = 0;             // index into playlistOrder currently playing
let playlistCrossfadeMs = 3000;    // how early (before track end) to start blending, and how long the blend takes
let playlistAdvancing = false;     // guards against the poller firing a second advance while one is in flight
let playlistLive = false;          // true while a rotation owns the music layer (see isPlaylistLive())

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

// Fisher-Yates. Returns a new array — never mutates the input.
function shuffleFisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
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

// Generation guard. music()/stopMusic() overlap in real navigation (music() has
// network awaits before its 800ms fade, and map → topic → lesson can happen well
// inside that) and both drive the SAME two elements. Only the NEWEST call may
// keep touching them: older calls bail at their next checkpoint — without ever
// touching the elements, which the newer call may already have re-src'd — and
// there is only ever ONE live fade interval. Without this, two competing
// crossfades can settle with BOTH tracks looping audibly (nobody pauses the
// loser) — Damien heard exactly that.
let musicGen = 0;
let musicFadeIv = null;

function cancelMusicFade() {
  if (musicFadeIv) { clearInterval(musicFadeIv); musicFadeIv = null; }
}

// `_plGen` and `_fadeMs` are internal-only params used by musicPlaylist()'s own
// advance/start step — external callers (screens) always call music(track) with
// one argument and get exactly the old behaviour (800ms fade, no playlist ties).
async function music(track, _plGen, _fadeMs) {
  try {
    if (!track) return;
    track = TRACK_ALIASES[track] || track;
    if (track === currentTrackName) return; // already playing

    // A genuine track switch. If a playlist rotation is live and this call is
    // NOT that rotation's own advance/start step (tagged with its playlistGen),
    // the screen changed under it — stand the rotation down so it can't keep
    // silently overriding whatever plays next. (Never touches anything when no
    // rotation is running: playlistPollIv is null in that case.)
    if (playlistPollIv && (_plGen === undefined || _plGen !== playlistGen)) {
      cancelPlaylist();
    }

    if (musicFailedTracks.has(track)) return; // remembered failure, stay silent

    const gen = ++musicGen;
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
    if (gen !== musicGen) return; // superseded while loading (a "failure" here may just be the newer call re-src'ing the element — don't record it)
    if (!loaded) {
      musicFailedTracks.add(track);
      return; // stay silent, don't retry this track this session
    }

    nextEl.volume = 0;
    try {
      await nextEl.play();
    } catch (e) {
      if (gen === musicGen) musicFailedTracks.add(track);
      return;
    }
    if (gen !== musicGen) return; // superseded while starting — the newer call owns the elements now

    currentTrackName = track;
    activeMusicSlot = nextSlot;
    cancelMusicFade();

    // JS crossfade. 800ms by default; musicPlaylist() passes its own crossfadeMs
    // here so the blend actually spans the requested length (kept as the one
    // and only fade implementation rather than a second one for playlists).
    const totalFadeMs = (typeof _fadeMs === 'number' && _fadeMs > 0) ? _fadeMs : 800;
    const steps = 16;
    const stepMs = totalFadeMs / steps;
    const prevStart = prevEl ? clamp01(prevEl.volume) : 0; // continue from wherever an interrupted fade left it
    let i = 0;

    await new Promise((resolve) => {
      const iv = setInterval(() => {
        if (gen !== musicGen) { clearInterval(iv); resolve(); return; } // superseded mid-fade
        i += 1;
        const frac = i / steps;
        // target is read per-tick so a duck (VO starting) or a Music-toggle flip
        // mid-fade still lands — a captured value would ramp back over them
        const targetVol = clamp01(musicBaseVolume) * (duckActive ? 0.25 : 1);
        nextEl.volume = clamp01(targetVol * frac);
        if (prevEl) prevEl.volume = clamp01(prevStart * (1 - frac));
        if (i >= steps) {
          clearInterval(iv);
          if (musicFadeIv === iv) musicFadeIv = null;
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
      musicFadeIv = iv;
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
  cancelPlaylist(); // a live rotation must not resurrect a track after this stops it
  const gen = ++musicGen; // supersede any in-flight music() call and its fade
  cancelMusicFade();
  // cleared immediately (not at fade end) so a music() call issued during the
  // stop-fade isn't swallowed by the "already playing" early-return — it bumps
  // the generation and this fade stands down at its next tick.
  currentTrackName = null;
  const els = [musicEls.a, musicEls.b].filter((el) => el && !el.paused);
  if (els.length === 0) return;

  const startVols = els.map((el) => el.volume);
  const steps = 12;
  const stepMs = Math.max(1, fadeMs) / steps;
  let i = 0;

  const iv = setInterval(() => {
    if (gen !== musicGen) { clearInterval(iv); return; } // superseded — the newer call owns the elements
    i += 1;
    const frac = i / steps;
    els.forEach((el, idx) => {
      el.volume = clamp01(startVols[idx] * (1 - frac));
    });
    if (i >= steps) {
      clearInterval(iv);
      if (musicFadeIv === iv) musicFadeIv = null;
      els.forEach((el) => {
        try {
          el.pause();
          el.src = '';
        } catch (e) {
          // swallow
        }
      });
    }
  }, stepMs);
  musicFadeIv = iv;
}

// ---------- public: music playlist (shuffled rotation with crossfade) ----------
// Whiff-End Pier wants FOUR tracks in shuffled rotation, each blending into the
// next, instead of one track looping forever. This layers on TOP of music() —
// every actual play/crossfade still goes through music() (so musicGen, the
// canplaythrough load-guard, musicFailedTracks, the VO-duck-aware fade, and the
// visibilitychange pause/resume all apply for free) — this block only decides
// WHICH track to hand to music() and WHEN, by polling the audio clock.

// Cancels the live rotation (if any): bumps playlistGen so any in-flight
// advance/poll-tick bails at its next check, and clears the single poll
// interval. Called from musicPlaylist() (new rotation replacing an old one),
// stopMusic() (explicit stop), and from inside music() itself when a plain
// call for a different track supersedes the rotation (see there). Safe to
// call when no rotation is live.
function cancelPlaylist() {
  playlistGen += 1;
  if (playlistPollIv) { clearInterval(playlistPollIv); playlistPollIv = null; }
  playlistAdvancing = false;
  playlistLive = false;
}

// True while a rotation owns the music layer. Callers that mount repeatedly
// (the pier screen mounts again for every machine route) use this to avoid
// restarting the rotation — and so restarting the current TRACK — on each
// mount. Anything that supersedes the rotation (a plain music() for another
// track, stopMusic(), a new musicPlaylist()) routes through cancelPlaylist(),
// so this can never report a rotation that has already been stood down.
function isPlaylistLive() {
  return playlistLive;
}

// Reshuffles `tracks` (Fisher-Yates), re-rolling if the new first entry would
// repeat `avoidTrack` — used at each wrap of the rotation so the last track of
// one lap can never immediately replay as the first track of the next lap.
// `guard` caps the re-roll loop; with 4 tracks the odds of needing more than a
// couple of re-rolls are negligible, but a hard cap keeps this from ever being
// an infinite loop. The swap fallback guarantees the invariant even in the
// pathological case.
function reshuffleAvoidingRepeat(tracks, avoidTrack) {
  let order = shuffleFisherYates(tracks);
  if (tracks.length > 1 && avoidTrack) {
    let guard = 0;
    while (order[0] === avoidTrack && guard < 20) {
      order = shuffleFisherYates(tracks);
      guard += 1;
    }
    if (order[0] === avoidTrack) {
      const tmp = order[0]; order[0] = order[1]; order[1] = tmp;
    }
  }
  return order;
}

// Starts the single clock-poll for a live rotation. No-op if one is already
// running — this is the only place an interval is created for the playlist,
// and it is guarded so there is never more than one at a time.
function startPlaylistPoll(gen) {
  if (playlistPollIv) return;
  playlistPollIv = setInterval(() => playlistPollTick(gen), 500);
}

// Ticks ~2x/second watching the CURRENTLY ACTIVE music element's own clock —
// deliberately not a wall-clock setTimeout, which would fire while the tab is
// hidden and the element paused (see visibilitychange handler above) and could
// fire an advance against audio that isn't actually progressing. `loop` stays
// true on both elements throughout, so if a tick is ever missed (tab hidden
// right through the window, a slow device, etc.) the track just loops again
// rather than going silent.
function playlistPollTick(gen) {
  if (gen !== playlistGen) {
    // superseded since this tick was scheduled — stop polling immediately
    if (playlistPollIv) { clearInterval(playlistPollIv); playlistPollIv = null; }
    return;
  }
  if (playlistAdvancing) return; // an advance is already in flight — don't double-fire
  const el = musicEls[activeMusicSlot];
  if (!el) return;
  const dur = el.duration;
  if (!Number.isFinite(dur) || dur <= 0) return; // metadata not loaded yet — nothing to measure
  const remaining = dur - el.currentTime;
  if (remaining > playlistCrossfadeMs / 1000) return; // not yet time to blend into the next track

  playlistAdvancing = true;
  advancePlaylistTo(gen, false).finally(() => { playlistAdvancing = false; });
}

// Moves the rotation forward (or, on the very first call from musicPlaylist(),
// tries the current index) and hands the chosen track to the EXISTING music()
// function, tagged with this rotation's gen so music() recognises the call as
// its own advance step rather than an external switch. If a track fails to
// load, music() records it in musicFailedTracks and leaves currentTrackName
// unchanged — this loop notices that and tries the next track in the rotation
// instead of stalling. If every track in the rotation fails, it gives up
// silently (matches music()'s own "stay silent" convention for bad tracks).
async function advancePlaylistTo(gen, useCurrentIndex) {
  let first = useCurrentIndex;
  let attempts = 0;
  const maxAttempts = playlistTracksSrc.length + 2; // one full lap, plus slack for a wrap-reshuffle
  while (attempts < maxAttempts) {
    if (gen !== playlistGen) return; // superseded — bail without touching anything

    if (!first) {
      playlistIndex += 1;
      if (playlistIndex >= playlistOrder.length) {
        // wrap: reshuffle, never repeating the track that just finished
        playlistOrder = reshuffleAvoidingRepeat(playlistTracksSrc, playlistOrder[playlistOrder.length - 1]);
        playlistIndex = 0;
      }
    }
    first = false;
    attempts += 1;

    const candidate = playlistOrder[playlistIndex];
    if (musicFailedTracks.has(candidate)) continue; // known-bad — skip without a network round trip

    await music(candidate, gen, playlistCrossfadeMs);
    if (gen !== playlistGen) return; // superseded while loading/starting

    if (currentTrackName === candidate) {
      startPlaylistPoll(gen); // no-op if already running (true on every advance after the first)
      return;
    }
    // else music() couldn't load/play it (now in musicFailedTracks) — loop tries the next one
  }
  // every track in the rotation failed to load/play — stop silently, nothing to poll
  cancelPlaylist();
}

// Shuffles `tracks` and plays them in rotation, each crossfading into the next
// as it nears its end, reshuffling (without repeating the last track) on every
// wrap. Routes all playback through music() — see comment above the block.
// opts.crossfadeMs (default 3000) is both how early before a track's natural
// end the blend into the next track starts, AND how long that blend takes —
// the two use the same number so the fade exactly spans the old track's
// remaining runtime instead of over- or under-shooting it.
function musicPlaylist(tracks, opts) {
  if (!Array.isArray(tracks) || tracks.length === 0) return;

  cancelPlaylist(); // stand down any previous rotation + its poller/gen first
  const gen = playlistGen; // this rotation's own identity for its whole lifetime

  const requested = (opts && typeof opts.crossfadeMs === 'number' && opts.crossfadeMs > 0) ? opts.crossfadeMs : 3000;
  playlistCrossfadeMs = Math.max(100, requested); // floor so a bad opts value can't spin the poller
  playlistTracksSrc = tracks.slice();
  playlistOrder = shuffleFisherYates(playlistTracksSrc);
  playlistIndex = 0;
  playlistLive = true;

  advancePlaylistTo(gen, true); // fire-and-forget, same style as startTitleMusic()'s music() call
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
          // only revive the ACTIVE slot — resuming a superseded/fading-out
          // element is how a second track comes back from the dead after a
          // tab-switch mid-crossfade
          if (el !== musicEls[activeMusicSlot]) return;
          try { const p = el.play(); if (p && p.catch) p.catch(safeNoop); } catch (e) { /* swallow */ }
        });
        hiddenPausedEls = [];
        applyMusicVolume();
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
  musicPlaylist,
  isPlaylistLive,
  stopMusic,
  duck,
  setVolumes,
  setFartOMeter,
  preinit,
  getMusicState,
};
