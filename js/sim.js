// Motore del conto demo. Prezzi SIMULATI (random walk), nessun dato di mercato reale.
// Tutte le funzioni lavorano su un oggetto `state` serializzabile in JSON.

import { pipSize, profitLoss, margin as marginFor, LOT_UNITS } from "./calc.js";

export const SIM_PAIRS = {
  "EUR/USD": { start: 1.0850, spreadPips: 1.0, vol: 0.00012 },
  "GBP/USD": { start: 1.2700, spreadPips: 1.4, vol: 0.00015 },
  "USD/JPY": { start: 149.50, spreadPips: 1.2, vol: 0.00013 },
  "AUD/USD": { start: 0.6600, spreadPips: 1.3, vol: 0.00016 },
  "USD/CHF": { start: 0.8800, spreadPips: 1.5, vol: 0.00012 },
  "EUR/GBP": { start: 0.8550, spreadPips: 1.5, vol: 0.00010 },
};

export const ACCOUNT_CCY = "USD";
export const START_BALANCE = 10000;
export const LEVERAGE = 30;          // limite ESMA per le major
export const STOP_OUT_LEVEL = 50;    // margin level % sotto cui si chiude
export const TICKS_PER_CANDLE = 10;
export const MAX_CANDLES = 120;
export const MIN_LOTS = 0.01;
export const MAX_LOTS = 50;

export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng) {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function quote(pair, mid) {
  const half = SIM_PAIRS[pair].spreadPips * pipSize(pair) / 2;
  return { mid, bid: mid - half, ask: mid + half };
}

export function createState(rng = makeRng()) {
  const state = {
    balance: START_BALANCE,
    leverage: LEVERAGE,
    prices: {},
    candles: {},
    tick: 0,
    positions: [],
    history: [],
    nextId: 1,
    notes: {},
  };
  for (const [pair, cfg] of Object.entries(SIM_PAIRS)) {
    state.prices[pair] = quote(pair, cfg.start);
    state.candles[pair] = [];
  }
  // Un po' di storico, così il grafico non parte vuoto.
  for (let i = 0; i < 80 * TICKS_PER_CANDLE; i++) movePrices(state, rng);
  return state;
}

function movePrices(state, rng) {
  state.tick += 1;
  const newCandle = (state.tick - 1) % TICKS_PER_CANDLE === 0;
  for (const [pair, cfg] of Object.entries(SIM_PAIRS)) {
    const prev = state.prices[pair].mid;
    const mid = prev * Math.exp(cfg.vol * gauss(rng));
    state.prices[pair] = quote(pair, mid);
    const list = state.candles[pair];
    if (newCandle || list.length === 0) {
      list.push({ o: prev, h: Math.max(prev, mid), l: Math.min(prev, mid), c: mid });
      if (list.length > MAX_CANDLES) list.shift();
    } else {
      const c = list[list.length - 1];
      c.h = Math.max(c.h, mid);
      c.l = Math.min(c.l, mid);
      c.c = mid;
    }
  }
}

// Tasso per convertire dalla valuta quotata della coppia al conto (USD), con i prezzi correnti.
export function quoteToUsd(state, pair) {
  const q = pair.split("/")[1];
  if (q === ACCOUNT_CCY) return 1;
  for (const p of Object.keys(state.prices)) {
    const [b, qq] = p.split("/");
    if (b === q && qq === ACCOUNT_CCY) return state.prices[p].mid;
    if (b === ACCOUNT_CCY && qq === q) return 1 / state.prices[p].mid;
  }
  throw new Error("Nessun tasso per " + q + "/" + ACCOUNT_CCY);
}

function closePrice(state, pos) {
  const p = state.prices[pos.pair];
  return pos.side === "buy" ? p.bid : p.ask;
}

export function positionPL(state, pos) {
  const exit = closePrice(state, pos);
  const { pips, amount } = profitLoss({
    pair: pos.pair, side: pos.side, lots: pos.lots, entry: pos.entry, exit,
    account: ACCOUNT_CCY, quoteToAccount: quoteToUsd(state, pos.pair),
  });
  return { exit, pips, amount };
}

export function requiredMargin(state, pair, lots) {
  return marginFor({
    pair, lots, price: state.prices[pair].mid, leverage: state.leverage,
    account: ACCOUNT_CCY, quoteToAccount: quoteToUsd(state, pair),
  });
}

export function summary(state) {
  let floating = 0;
  let used = 0;
  for (const pos of state.positions) {
    floating += positionPL(state, pos).amount;
    used += requiredMargin(state, pos.pair, pos.lots);
  }
  const equity = state.balance + floating;
  return {
    balance: state.balance,
    floating,
    equity,
    usedMargin: used,
    freeMargin: equity - used,
    marginLevel: used > 0 ? equity / used * 100 : null,
  };
}

export function openPosition(state, { pair, side, lots, sl = null, tp = null }) {
  if (!SIM_PAIRS[pair]) return { ok: false, error: "Coppia non disponibile" };
  if (side !== "buy" && side !== "sell") return { ok: false, error: "Direzione non valida" };
  lots = Number(lots);
  if (!(lots >= MIN_LOTS) || lots > MAX_LOTS) {
    return { ok: false, error: "I lotti devono essere tra " + MIN_LOTS + " e " + MAX_LOTS };
  }
  lots = Math.round(lots * 100) / 100;
  sl = sl === "" || sl == null ? null : Number(sl);
  tp = tp === "" || tp == null ? null : Number(tp);
  const p = state.prices[pair];
  const entry = side === "buy" ? p.ask : p.bid;
  if (sl != null && (!(sl > 0) || (side === "buy" ? sl >= p.bid : sl <= p.ask))) {
    return { ok: false, error: side === "buy" ? "Per un Buy lo stop loss va sotto il prezzo" : "Per un Sell lo stop loss va sopra il prezzo" };
  }
  if (tp != null && (!(tp > 0) || (side === "buy" ? tp <= entry : tp >= entry))) {
    return { ok: false, error: side === "buy" ? "Per un Buy il take profit va sopra il prezzo" : "Per un Sell il take profit va sotto il prezzo" };
  }
  const need = requiredMargin(state, pair, lots);
  if (need > summary(state).freeMargin) {
    return { ok: false, error: "Margine insufficiente: servono " + need.toFixed(2) + " USD" };
  }
  const pos = { id: state.nextId++, pair, side, lots, entry, sl, tp, openedAt: state.tick, margin: need };
  state.positions.push(pos);
  return { ok: true, position: pos };
}

export function closePosition(state, id, reason = "manuale") {
  const i = state.positions.findIndex((p) => p.id === id);
  if (i < 0) return null;
  const pos = state.positions[i];
  const { exit, pips, amount } = positionPL(state, pos);
  state.positions.splice(i, 1);
  state.balance += amount;
  const trade = { ...pos, exit, pips, pl: amount, closedAt: state.tick, reason };
  state.history.unshift(trade);
  return trade;
}

// Avanza di un tick: muove i prezzi, poi controlla SL/TP e stop out.
// Restituisce le operazioni chiuse automaticamente.
export function step(state, rng) {
  movePrices(state, rng);
  const closed = [];
  for (const pos of [...state.positions]) {
    const px = closePrice(state, pos);
    const hitSl = pos.sl != null && (pos.side === "buy" ? px <= pos.sl : px >= pos.sl);
    const hitTp = pos.tp != null && (pos.side === "buy" ? px >= pos.tp : px <= pos.tp);
    if (hitSl) closed.push(closePosition(state, pos.id, "stop loss"));
    else if (hitTp) closed.push(closePosition(state, pos.id, "take profit"));
  }
  let s = summary(state);
  while (state.positions.length && s.marginLevel != null && s.marginLevel < STOP_OUT_LEVEL) {
    const worst = state.positions
      .map((pos) => ({ pos, pl: positionPL(state, pos).amount }))
      .sort((a, b) => a.pl - b.pl)[0].pos;
    closed.push(closePosition(state, worst.id, "stop out"));
    s = summary(state);
  }
  return closed;
}

export function stats(state) {
  const h = state.history;
  const wins = h.filter((t) => t.pl > 0);
  const losses = h.filter((t) => t.pl <= 0);
  const sum = (a) => a.reduce((x, t) => x + t.pl, 0);
  const grossWin = sum(wins);
  const grossLoss = -sum(losses);
  return {
    trades: h.length,
    winRate: h.length ? wins.length / h.length * 100 : 0,
    net: grossWin - grossLoss,
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
  };
}

export { LOT_UNITS };
