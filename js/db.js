// FART QUEST — js/db.js (CORE agent)
// Minimal promise wrapper over IndexedDB. No dependencies.
// In node (no `indexedDB` global) this module loads fine; only `open()` rejects,
// since the actual game screens never run in node (tests use a fake db instead).

const DB_NAME = 'fartquest';
// v1 -> v2: added the 'mocks' store (Castle Clench exam history, ENGINE_SPEC_2 §H).
// Bumping this is additive-only — see runUpgrade()'s "preserving existing data" contract.
const DB_VERSION = 2;
const STORES = ['progress', 'settings', 'meta', 'mocks'];

let _dbPromise = null;

function hasIndexedDB() {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

/**
 * runUpgrade(idb, oldVersion) — pure-ish upgrade step, deliberately factored out
 * of openOnce() so it can be exercised in node with a fake `idb` object (no real
 * indexedDB required): { objectStoreNames:{contains(name)}, createObjectStore(name) }.
 *
 * oldVersion 0 (fresh install): create every store.
 * oldVersion 1 (pre-mocks installs): create ONLY 'mocks' — progress/settings/meta
 *   are left completely untouched, so their existing data survives the upgrade
 *   (IndexedDB never wipes an object store's contents just because onupgradeneeded
 *   ran; only calling deleteObjectStore/clear would, and we never do that here).
 * oldVersion >= 2: no-op.
 */
function runUpgrade(idb, oldVersion) {
  const need = oldVersion < 1 ? STORES : oldVersion < 2 ? ['mocks'] : [];
  for (const name of need) {
    if (!idb.objectStoreNames.contains(name)) {
      idb.createObjectStore(name);
    }
  }
}

function openOnce() {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      reject(new Error('db.open failed: IndexedDB is not available in this environment.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      runUpgrade(req.result, event.oldVersion);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('db.open failed.'));
    req.onblocked = () => reject(new Error('db.open blocked (another tab holds an older version open).'));
  });
}

/**
 * db.open() -> Promise<void>. Idempotent; safe to call repeatedly.
 * Retries once on transient failure (Safari sometimes throws on first attempt
 * inside certain contexts). Fails gracefully (rejects) if IndexedDB is absent,
 * e.g. under node during tests.
 */
async function open() {
  if (_dbPromise) return _dbPromise;
  try {
    _dbPromise = await openOnce();
  } catch (err) {
    // Retry once for transient errors (but not for "no indexedDB at all").
    if (!hasIndexedDB()) throw err;
    try {
      _dbPromise = await openOnce();
    } catch (err2) {
      _dbPromise = null;
      throw err2;
    }
  }
  return _dbPromise;
}

function withStore(storeName, mode, fn) {
  return open().then(
    (idb) =>
      new Promise((resolve, reject) => {
        const tx = idb.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        let result;
        try {
          result = fn(store);
        } catch (err) {
          reject(err);
          return;
        }
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error || new Error(`transaction on ${storeName} failed.`));
        tx.onabort = () => reject(tx.error || new Error(`transaction on ${storeName} aborted.`));
      })
  );
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function get(storeName, key) {
  const idb = await open();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function put(storeName, key, val) {
  return withStore(storeName, 'readwrite', (store) => {
    store.put(val, key);
  });
}

async function getAll(storeName) {
  const idb = await open();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const keysReq = store.getAllKeys();
    const valsReq = store.getAll();
    let keys, vals;
    let pending = 2;
    const done = () => {
      pending--;
      if (pending === 0) {
        const out = {};
        for (let i = 0; i < keys.length; i++) out[keys[i]] = vals[i];
        resolve(out);
      }
    };
    keysReq.onsuccess = () => {
      keys = keysReq.result;
      done();
    };
    valsReq.onsuccess = () => {
      vals = valsReq.result;
      done();
    };
    keysReq.onerror = () => reject(keysReq.error);
    valsReq.onerror = () => reject(valsReq.error);
  });
}

async function del(storeName, key) {
  return withStore(storeName, 'readwrite', (store) => {
    store.delete(key);
  });
}

/**
 * exportAll() -> { progress: {...}, settings: {...}, meta: {...} }
 */
async function exportAll() {
  const out = {};
  for (const name of STORES) {
    out[name] = await getAll(name);
  }
  return out;
}

/**
 * importAll(obj) -> overwrites each store's contents with obj[storeName] (key/val map).
 * Stores not present in obj are left untouched. Existing keys not present in the
 * imported map are cleared first (full replace per store).
 */
async function importAll(obj) {
  for (const name of STORES) {
    if (!(name in obj)) continue;
    const data = obj[name] || {};
    await withStore(name, 'readwrite', (store) => {
      store.clear();
      for (const key of Object.keys(data)) {
        store.put(data[key], key);
      }
    });
  }
}

export default { open, get, put, getAll, del, exportAll, importAll };
export { open, get, put, getAll, del, exportAll, importAll, runUpgrade, DB_VERSION, STORES };
