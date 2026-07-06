// FART QUEST — js/router.js (UI agent)
// Minimal hash router. Screen modules export { mount(rootEl, ctx, params), unmount() }.

const routes = []; // { pattern: RegExp, keys: string[], mod }
let currentMod = null;
let currentRoot = null;
let ctx = null;
let generation = 0; // monotonic token: guards against overlapping hashchange renders

function compile(path) {
  const keys = [];
  const pattern = path
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) {
        keys.push(seg.slice(1));
        return '([^/]+)';
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { re: new RegExp('^' + pattern + '$'), keys };
}

export function register(path, mod) {
  const { re, keys } = compile(path);
  routes.push({ re, keys, mod });
}

function parseHash() {
  let hash = window.location.hash || '#/title';
  hash = hash.slice(1); // drop '#'
  if (!hash.startsWith('/')) hash = '/' + hash;
  return hash;
}

async function render() {
  const myGen = ++generation; // claim this render; a later hashchange bumps `generation` again
  const path = parseHash();
  for (const route of routes) {
    const m = path.match(route.re);
    if (!m) continue;
    const params = {};
    route.keys.forEach((k, i) => { params[k] = m[i + 1]; });

    if (currentMod && typeof currentMod.unmount === 'function') {
      try { currentMod.unmount(); } catch (e) { /* swallow */ }
    }
    currentRoot.innerHTML = '';
    currentMod = route.mod;
    try {
      await route.mod.mount(currentRoot, ctx, params);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Screen mount failed:', path, e);
    }
    // A newer hashchange fired while the mount above was pending — that newer
    // render call already unmounted us (or will, if it's still ahead of this
    // point) and owns currentRoot/currentMod from here. We must not touch
    // either: just unmount the module WE just mounted (it's the stale one)
    // and bail out without clearing/repopulating anything.
    if (myGen !== generation) {
      if (route.mod && typeof route.mod.unmount === 'function') {
        try { route.mod.unmount(); } catch (e) { /* swallow */ }
      }
      return;
    }
    return;
  }
  // no match — go to title
  window.location.hash = '#/title';
}

export function go(hash) {
  if (!hash.startsWith('#')) hash = '#' + hash;
  if (window.location.hash === hash) {
    render();
  } else {
    window.location.hash = hash;
  }
}

export function start(rootEl, appCtx) {
  currentRoot = rootEl;
  ctx = appCtx;
  window.addEventListener('hashchange', render);
  if (!window.location.hash) window.location.hash = '#/title';
  render();
}

export default { register, go, start };
