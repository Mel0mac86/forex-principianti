// Salvataggio locale. Se localStorage non è disponibile l'app funziona in memoria.

const KEY = "primopip:v1";

const DEFAULTS = () => ({ completed: [], quiz: {}, theme: "auto", sim: null });

let cache = null;

export function load() {
  if (cache) return cache;
  cache = DEFAULTS();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) cache = { ...cache, ...JSON.parse(raw) };
  } catch (e) {
    /* storage non disponibile o corrotto: si riparte dai default */
  }
  return cache;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    /* pazienza: resta in memoria */
  }
}

export function update(fn) {
  fn(load());
  save();
}

export function resetAll() {
  cache = DEFAULTS();
  save();
}
