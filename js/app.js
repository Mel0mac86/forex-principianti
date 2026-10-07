// Primo Pip: router e viste.

import { LEVELS, LESSONS } from "./data/lessons.js";
import { QUIZZES, PASS_PCT } from "./data/quizzes.js";
import { GLOSSARY } from "./data/glossary.js";
import * as store from "./store.js";
import * as calc from "./calc.js";
import * as sim from "./sim.js";
import { drawChart } from "./chart.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const view = $("#view");

const money = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n, d = 2) => new Intl.NumberFormat("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const usd = (n) => money.format(n) + " USD";
const signed = (n) => (n > 0 ? "+" : "") + money.format(n);
const plClass = (n) => (n > 0 ? "up" : n < 0 ? "down" : "");

// I gestori degli eventi di una vista vengono collegati subito dopo averla inserita nel DOM.
let mountQueue = [];
function onMount(fn) {
  mountQueue.push(fn);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function toast(msg, kind = "info") {
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.setAttribute("role", "status");
  el.textContent = msg;
  $("#toasts").appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ---------- tema ----------
function applyTheme() {
  const t = store.load().theme;
  if (t === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
}

// ---------- progressi ----------
function isDone(id) {
  return store.load().completed.includes(id);
}
function progressPct() {
  return Math.round(store.load().completed.filter((id) => LESSONS.some((l) => l.id === id)).length / LESSONS.length * 100);
}
function nextLesson() {
  return LESSONS.find((l) => !isDone(l.id)) || null;
}
function bar(pct, label) {
  return `<div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}"><span style="width:${pct}%"></span></div>`;
}

// ---------- viste ----------
function home() {
  const pct = progressPct();
  const next = nextLesson();
  const st = store.load();
  const s = st.sim ? sim.summary(st.sim) : null;
  return `
  <section class="hero">
    <h1>Impara il forex senza rischiare un euro</h1>
    <p class="lead">Un corso breve in 5 livelli, quiz, calcolatori e un conto demo con prezzi simulati. Tutto gratis, tutto sul tuo dispositivo.</p>
  </section>
  <div class="grid">
    <article class="card highlight">
      <h2>Il tuo corso</h2>
      ${bar(pct, "Progresso del corso")}
      <p class="muted">${pct}% completato</p>
      ${next
        ? `<p>Prossima lezione: <strong>${esc(next.title)}</strong></p><a class="btn primary" href="#/lezione/${next.id}">${pct ? "Continua" : "Inizia il corso"}</a>`
        : `<p>Hai completato tutte le lezioni. Ottimo lavoro!</p><a class="btn primary" href="#/simulatore">Vai al simulatore</a>`}
    </article>
    <article class="card">
      <h2>Conto demo</h2>
      ${s
        ? `<p class="big">${usd(s.equity)}</p><p class="muted">Equity · ${st.sim.positions.length} posizioni aperte</p>`
        : `<p class="muted">10.000 USD virtuali ti aspettano.</p>`}
      <a class="btn" href="#/simulatore">Apri il simulatore</a>
    </article>
    <article class="card">
      <h2>Strumenti</h2>
      <ul class="links">
        <li><a href="#/calcolatori">Calcolatori pip, size e margine</a></li>
        <li><a href="#/glossario">Glossario (${GLOSSARY.length} termini)</a></li>
        <li><a href="#/diario">Diario di trading</a></li>
      </ul>
    </article>
  </div>
  <aside class="callout warn risk">
    <strong>Avviso di rischio.</strong> Il trading su forex e CFD con leva è ad alto rischio: la maggior parte dei conti di investitori al dettaglio perde denaro.
    Questo sito è solo educativo, non offre consulenza finanziaria né segnali, e il simulatore usa prezzi finti, non di mercato.
  </aside>`;
}

function course() {
  return `
  <h1>Il corso</h1>
  ${bar(progressPct(), "Progresso del corso")}
  <p class="muted">${progressPct()}% completato</p>
  ${LEVELS.map((lv) => {
    const lessons = LESSONS.filter((l) => l.level === lv.id);
    const done = lessons.filter((l) => isDone(l.id)).length;
    const score = store.load().quiz[lv.id];
    return `
    <section class="card level">
      <header class="level-head">
        <div><span class="badge">Livello ${lv.id}</span><h2>${esc(lv.title)}</h2><p class="muted">${esc(lv.desc)}</p></div>
        <span class="muted">${done}/${lessons.length}</span>
      </header>
      <ol class="lessons">
        ${lessons.map((l) => `<li class="${isDone(l.id) ? "done" : ""}"><a href="#/lezione/${l.id}"><span class="check" aria-hidden="true">${isDone(l.id) ? "✓" : ""}</span>${esc(l.title)}<span class="muted small">${l.minutes} min</span></a>${isDone(l.id) ? '<span class="sr-only">(completata)</span>' : ""}</li>`).join("")}
      </ol>
      <a class="btn small" href="#/quiz/${lv.id}">Quiz del livello${score != null ? ` · ultimo: ${score}%${score >= PASS_PCT ? " ✓" : ""}` : ""}</a>
    </section>`;
  }).join("")}`;
}

function lesson(id) {
  const i = LESSONS.findIndex((l) => l.id === id);
  if (i < 0) return notFound("Questa lezione non esiste.");
  const l = LESSONS[i];
  const prev = LESSONS[i - 1];
  const next = LESSONS[i + 1];
  const lastOfLevel = !next || next.level !== l.level;
  onMount(() => {
    $("#mark")?.addEventListener("click", () => {
      store.update((s) => {
        if (s.completed.includes(l.id)) s.completed = s.completed.filter((x) => x !== l.id);
        else s.completed.push(l.id);
      });
      if (isDone(l.id)) toast("Lezione completata", "success");
      render();
    });
  });
  return `
  <nav class="crumbs"><a href="#/corso">Corso</a> › Livello ${l.level}</nav>
  <article class="prose">
    <h1>${esc(l.title)}</h1>
    <p class="muted small">${l.minutes} minuti di lettura</p>
    ${l.body}
  </article>
  <div class="lesson-actions">
    <button id="mark" class="btn ${isDone(l.id) ? "" : "primary"}">${isDone(l.id) ? "✓ Completata (annulla)" : "Segna come completata"}</button>
    ${lastOfLevel ? `<a class="btn" href="#/quiz/${l.level}">Fai il quiz del livello ${l.level}</a>` : ""}
  </div>
  <nav class="pager">
    ${prev ? `<a class="btn ghost" href="#/lezione/${prev.id}">← ${esc(prev.title)}</a>` : "<span></span>"}
    ${next ? `<a class="btn ghost" href="#/lezione/${next.id}">${esc(next.title)} →</a>` : ""}
  </nav>`;
}

function quiz(levelId) {
  const lv = LEVELS.find((x) => String(x.id) === String(levelId));
  const qs = lv && QUIZZES[lv.id];
  if (!qs) return notFound("Questo quiz non esiste.");
  onMount(() => {
    $("#quiz").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      let right = 0;
      let missing = 0;
      qs.forEach((q, i) => {
        const box = $(`[data-q="${i}"]`, form);
        const sel = $(`input[name="q${i}"]:checked`, form);
        box.classList.remove("ok", "ko");
        if (!sel) { missing++; return; }
        const ok = Number(sel.value) === q.answer;
        if (ok) right++;
        box.classList.add(ok ? "ok" : "ko");
        $(".why", box).hidden = false;
      });
      if (missing) {
        toast(`Rispondi a tutte le domande (ne mancano ${missing})`, "error");
        return;
      }
      const pct = Math.round(right / qs.length * 100);
      store.update((s) => { s.quiz[lv.id] = pct; });
      const pass = pct >= PASS_PCT;
      $("#result").innerHTML = `<div class="callout ${pass ? "ok" : "warn"}"><strong>${right}/${qs.length} (${pct}%)</strong> · ${pass ? "Superato!" : `Serve almeno il ${PASS_PCT}%. Rileggi le lezioni e riprova.`}</div>`;
      $("#result").scrollIntoView({ behavior: "smooth", block: "center" });
      $$("input", form).forEach((x) => (x.disabled = true));
      $("#submit").hidden = true;
      $("#retry").hidden = false;
    });
    $("#retry").addEventListener("click", render);
  });
  return `
  <nav class="crumbs"><a href="#/corso">Corso</a> › Quiz</nav>
  <h1>Quiz · Livello ${lv.id}: ${esc(lv.title)}</h1>
  <p class="muted">${qs.length} domande · si supera con il ${PASS_PCT}%</p>
  <form id="quiz" class="quiz">
    ${qs.map((q, i) => `
    <fieldset class="card q" data-q="${i}">
      <legend>${i + 1}. ${esc(q.q)}</legend>
      ${q.options.map((o, j) => `<label class="opt"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")}
      <p class="why muted small" hidden>${q.options[q.answer] ? "Risposta: " + esc(q.options[q.answer]) + ". " : ""}${esc(q.why)}</p>
    </fieldset>`).join("")}
    <div id="result" aria-live="polite"></div>
    <button id="submit" class="btn primary" type="submit">Verifica</button>
    <button id="retry" class="btn" type="button" hidden>Riprova</button>
  </form>`;
}

function glossary() {
  onMount(() => {
    const input = $("#gq");
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      $$(".term").forEach((el) => {
        const hit = !q || el.textContent.toLowerCase().includes(q);
        el.hidden = !hit;
        if (hit) shown++;
      });
      $("#gempty").hidden = shown > 0;
    };
    input.addEventListener("input", filter);
  });
  return `
  <h1>Glossario</h1>
  <label class="field"><span>Cerca un termine</span><input id="gq" type="search" placeholder="es. spread, leva, pip" autocomplete="off"></label>
  <dl class="glossary">
    ${GLOSSARY.map(([t, d]) => `<div class="term"><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}
  </dl>
  <p id="gempty" class="muted" hidden>Nessun termine trovato.</p>`;
}

// ---------- calcolatori ----------
const DEFAULT_PRICE = { "EUR/USD": 1.085, "GBP/USD": 1.27, "USD/JPY": 149.5, "USD/CHF": 0.88, "AUD/USD": 0.66, "USD/CAD": 1.36, "EUR/GBP": 0.855, "EUR/JPY": 162.2 };
const ACCOUNTS = ["EUR", "USD", "GBP", "CHF", "JPY"];
let calcTab = "pip";

const TABS = {
  pip: { label: "Valore del pip", fields: ["account", "pair", "lots", "price", "conv"] },
  size: { label: "Size posizione", fields: ["account", "pair", "balance", "risk", "stop", "price", "conv"] },
  margin: { label: "Margine", fields: ["account", "pair", "lots", "price", "leverage", "conv"] },
  pl: { label: "Profitto/Perdita", fields: ["account", "pair", "side", "lots", "entry", "exit", "conv"] },
  rr: { label: "Rischio/Rendimento", fields: ["pair", "entry", "stopPrice", "target"] },
};

function calcField(f, v) {
  const n = (name, label, value, step = "any", extra = "") => `<label class="field"><span>${label}</span><input name="${name}" type="number" inputmode="decimal" step="${step}" value="${value}" ${extra}></label>`;
  switch (f) {
    case "account": return `<label class="field"><span>Valuta del conto</span><select name="account">${ACCOUNTS.map((a) => `<option ${a === v.account ? "selected" : ""}>${a}</option>`).join("")}</select></label>`;
    case "pair": return `<label class="field"><span>Coppia</span><select name="pair">${calc.PAIRS.map((p) => `<option ${p === v.pair ? "selected" : ""}>${p}</option>`).join("")}</select></label>`;
    case "side": return `<label class="field"><span>Direzione</span><select name="side"><option value="buy" ${v.side === "buy" ? "selected" : ""}>Buy</option><option value="sell" ${v.side === "sell" ? "selected" : ""}>Sell</option></select></label>`;
    case "lots": return n("lots", "Lotti", v.lots, "0.01", 'min="0.01"');
    case "price": return n("price", "Prezzo attuale della coppia", v.price);
    case "balance": return n("balance", "Saldo del conto", v.balance, "any", 'min="0"');
    case "risk": return n("risk", "Rischio per operazione (%)", v.risk, "0.1", 'min="0"');
    case "stop": return n("stop", "Stop loss (pip)", v.stop, "0.1", 'min="0"');
    case "leverage": return `<label class="field"><span>Leva</span><select name="leverage">${[1, 2, 5, 10, 20, 30, 50, 100].map((l) => `<option value="${l}" ${l === v.leverage ? "selected" : ""}>1:${l}</option>`).join("")}</select></label>`;
    case "entry": return n("entry", "Prezzo di entrata", v.entry);
    case "exit": return n("exit", "Prezzo di uscita", v.exit);
    case "stopPrice": return n("stopPrice", "Prezzo dello stop loss", v.stopPrice);
    case "target": return n("target", "Prezzo del take profit", v.target);
    case "conv": return `<label class="field conv"><span>Tasso <b class="conv-label"></b></span><input name="conv" type="number" inputmode="decimal" step="any" value="${v.conv}"></label>`;
  }
  return "";
}

const calcValues = { account: "EUR", pair: "EUR/USD", side: "buy", lots: 1, price: 1.085, balance: 10000, risk: 1, stop: 20, leverage: 30, entry: 1.085, exit: 1.0875, stopPrice: 1.083, target: 1.091, conv: "" };

function calculators() {
  onMount(() => {
    $$(".tabs button").forEach((b) => b.addEventListener("click", () => { calcTab = b.dataset.tab; render(); }));
    const form = $("#calc");
    form.addEventListener("input", (e) => {
      const fd = new FormData(form);
      for (const [k, v] of fd.entries()) calcValues[k] = ["account", "pair", "side"].includes(k) ? v : v === "" ? "" : Number(v);
      if (e.target.name === "pair") {
        const p = DEFAULT_PRICE[calcValues.pair];
        calcValues.price = calcValues.entry = p;
        const pip = calc.pipSize(calcValues.pair);
        calcValues.exit = calc.round(p + 25 * pip, 5);
        calcValues.stopPrice = calc.round(p - 20 * pip, 5);
        calcValues.target = calc.round(p + 60 * pip, 5);
        ["price", "entry", "exit", "stopPrice", "target"].forEach((k) => { if (form.elements[k]) form.elements[k].value = calcValues[k]; });
      }
      computeCalc();
    });
    computeCalc();
  });
  const t = TABS[calcTab];
  return `
  <h1>Calcolatori</h1>
  <div class="tabs" role="tablist">
    ${Object.entries(TABS).map(([k, x]) => `<button role="tab" aria-selected="${k === calcTab}" data-tab="${k}" class="${k === calcTab ? "active" : ""}">${x.label}</button>`).join("")}
  </div>
  <div class="calc-wrap">
    <form id="calc" class="card form-grid" onsubmit="return false">${t.fields.map((f) => calcField(f, calcValues)).join("")}</form>
    <div id="calc-out" class="card result" aria-live="polite"></div>
  </div>`;
}

function computeCalc() {
  const v = calcValues;
  const out = $("#calc-out");
  const convBox = $(".conv");
  if (!out) return;
  if (convBox) {
    const { base, quote } = calc.splitPair(v.pair);
    const need = v.account !== base && v.account !== quote;
    convBox.hidden = !need;
    $(".conv-label").textContent = `${quote}/${v.account} (1 ${quote} = ? ${v.account})`;
  }
  const conv = v.conv === "" ? undefined : v.conv;
  const acc = v.account;
  try {
    let html = "";
    if (calcTab === "pip") {
      const val = calc.pipValue({ pair: v.pair, lots: v.lots, account: acc, price: v.price, quoteToAccount: conv });
      html = `<p class="muted">1 pip vale</p><p class="big">${num(val, 2)} ${acc}</p>
        <p class="muted small">Dimensione del pip: ${calc.pipSize(v.pair)} · ${num(v.lots * calc.LOT_UNITS, 0)} unità</p>`;
    } else if (calcTab === "size") {
      const r = calc.positionSize({ balance: v.balance, riskPct: v.risk, stopPips: v.stop, pair: v.pair, account: acc, price: v.price, quoteToAccount: conv });
      const lots = Math.floor(r.lots * 100) / 100;
      html = `<p class="muted">Puoi aprire</p><p class="big">${num(lots, 2)} lotti</p>
        <p>${num(r.units, 0)} unità · rischio ${num(r.riskAmount, 2)} ${acc}</p>
        <p class="muted small">Valore del pip per 1 lotto: ${num(r.pipValuePerLot, 2)} ${acc}. Arrotondato per difetto a 0,01 lotti.</p>
        ${lots < 0.01 ? '<p class="down">Con questo stop il rischio scelto è inferiore al micro lotto: riduci lo stop o aumenta il saldo.</p>' : ""}`;
    } else if (calcTab === "margin") {
      const m = calc.margin({ pair: v.pair, lots: v.lots, price: v.price, leverage: v.leverage, account: acc, quoteToAccount: conv });
      html = `<p class="muted">Margine richiesto</p><p class="big">${num(m, 2)} ${acc}</p>
        <p class="muted small">Valore della posizione: ${num(m * v.leverage, 2)} ${acc} · leva 1:${v.leverage}</p>`;
    } else if (calcTab === "pl") {
      const r = calc.profitLoss({ pair: v.pair, side: v.side, lots: v.lots, entry: v.entry, exit: v.exit, account: acc, quoteToAccount: conv });
      html = `<p class="muted">Risultato</p><p class="big ${plClass(r.amount)}">${signed(r.amount)} ${acc}</p><p>${r.pips > 0 ? "+" : ""}${num(r.pips, 1)} pip</p>`;
    } else if (calcTab === "rr") {
      const r = calc.riskReward({ entry: v.entry, stop: v.stopPrice, target: v.target });
      const pip = calc.pipSize(v.pair);
      html = `<p class="muted">Rapporto rischio/rendimento</p><p class="big">1 : ${num(r.ratio, 2)}</p>
        <p>Rischio ${num(r.risk / pip, 1)} pip · obiettivo ${num(r.reward / pip, 1)} pip</p>
        <p class="muted small">Per andare in pari (costi esclusi) devi vincere almeno il ${num(r.breakEvenWinRate, 1)}% delle operazioni.</p>`;
    }
    out.innerHTML = html;
  } catch (err) {
    out.innerHTML = `<p class="down">${esc(err.message)}</p>`;
  }
}

// ---------- simulatore ----------
let simState = null;
let simRng = sim.makeRng();
let simTimer = null;
let simPair = "EUR/USD";
let simSpeed = 1;
let simPaused = false;
let lastSave = 0;

function getSim() {
  if (!simState) {
    const saved = store.load().sim;
    simState = saved && saved.prices && saved.candles ? saved : sim.createState(simRng);
    store.update((s) => { s.sim = simState; });
  }
  return simState;
}

function stopSim() {
  clearInterval(simTimer);
  simTimer = null;
}

function startSim() {
  stopSim();
  if (simPaused) return;
  simTimer = setInterval(() => {
    const st = getSim();
    for (let i = 0; i < simSpeed; i++) {
      const closed = sim.step(st, simRng);
      for (const t of closed) toast(`${t.pair} chiusa da ${t.reason}: ${signed(t.pl)} USD`, t.pl >= 0 ? "success" : "error");
    }
    refreshSim();
    if (Date.now() - lastSave > 3000) { store.save(); lastSave = Date.now(); }
  }, 1000);
}

function simulator() {
  const st = getSim();
  onMount(() => {
    $("#pair").addEventListener("change", (e) => { simPair = e.target.value; refreshSim(true); });
    $$(".trade").forEach((b) => b.addEventListener("click", () => {
      const f = $("#ticket");
      const r = sim.openPosition(st, { pair: simPair, side: b.dataset.side, lots: f.lots.value, sl: f.sl.value, tp: f.tp.value });
      if (!r.ok) { toast(r.error, "error"); return; }
      toast(`${b.dataset.side === "buy" ? "Buy" : "Sell"} ${r.position.lots} ${simPair} a ${r.position.entry.toFixed(calc.priceDecimals(simPair))}`, "success");
      f.sl.value = ""; f.tp.value = "";
      store.save();
      refreshSim(true);
    }));
    $("#positions").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-close]");
      if (!btn) return;
      const t = sim.closePosition(st, Number(btn.dataset.close));
      if (t) toast(`${t.pair} chiusa: ${signed(t.pl)} USD`, t.pl >= 0 ? "success" : "error");
      store.save();
      refreshSim(true);
    });
    $("#pause").addEventListener("click", () => { simPaused = !simPaused; $("#pause").textContent = simPaused ? "▶ Riprendi" : "⏸ Pausa"; startSim(); });
    $("#speed").addEventListener("change", (e) => { simSpeed = Number(e.target.value); });
    $("#fill-sl").addEventListener("click", () => {
      const f = $("#ticket");
      const p = st.prices[simPair];
      const pip = calc.pipSize(simPair);
      const d = calc.priceDecimals(simPair);
      f.sl.value = (p.bid - 20 * pip).toFixed(d);
      f.tp.value = (p.ask + 40 * pip).toFixed(d);
      toast("Livelli per un Buy: SL −20 pip, TP +40 pip. Per un Sell invertili.");
    });
    refreshSim(true);
    startSim();
  });
  return `
  <h1>Simulatore demo</h1>
  <p class="muted small">Prezzi simulati, non di mercato. Conto in USD, leva 1:${st.leverage}, stop out al ${sim.STOP_OUT_LEVEL}%.</p>
  <div id="account" class="account-bar"></div>
  <div class="sim">
    <section class="card chart-card">
      <div class="chart-head">
        <label class="field inline"><span class="sr-only">Coppia</span><select id="pair">${Object.keys(sim.SIM_PAIRS).map((p) => `<option ${p === simPair ? "selected" : ""}>${p}</option>`).join("")}</select></label>
        <div id="quote" class="quote"></div>
        <div class="controls">
          <button id="pause" class="btn small">${simPaused ? "▶ Riprendi" : "⏸ Pausa"}</button>
          <label class="field inline"><span class="sr-only">Velocità</span><select id="speed">${[1, 5, 20].map((x) => `<option value="${x}" ${x === simSpeed ? "selected" : ""}>${x}×</option>`).join("")}</select></label>
        </div>
      </div>
      <canvas id="chart" aria-label="Grafico a candele della coppia selezionata" role="img"></canvas>
    </section>
    <form id="ticket" class="card ticket" onsubmit="return false">
      <h2>Nuovo ordine</h2>
      <label class="field"><span>Lotti</span><input name="lots" type="number" min="0.01" max="50" step="0.01" value="0.10"></label>
      <p id="ticket-info" class="muted small"></p>
      <label class="field"><span>Stop loss (prezzo, facoltativo)</span><input name="sl" type="number" step="any" inputmode="decimal"></label>
      <label class="field"><span>Take profit (prezzo, facoltativo)</span><input name="tp" type="number" step="any" inputmode="decimal"></label>
      <button id="fill-sl" type="button" class="btn ghost small">Suggerisci SL/TP per un Buy</button>
      <div class="buysell">
        <button type="button" class="btn sell trade" data-side="sell">Sell<span id="bidbtn"></span></button>
        <button type="button" class="btn buy trade" data-side="buy">Buy<span id="askbtn"></span></button>
      </div>
    </form>
  </div>
  <section class="card">
    <h2>Posizioni aperte</h2>
    <div id="positions" class="table-wrap"></div>
  </section>`;
}

function refreshSim(full = false) {
  if (!$("#chart")) return;
  const st = getSim();
  const p = st.prices[simPair];
  const d = calc.priceDecimals(simPair);
  const s = sim.summary(st);
  $("#account").innerHTML = [
    ["Saldo", usd(s.balance)],
    ["Equity", usd(s.equity)],
    ["P/L aperto", `<span class="${plClass(s.floating)}">${signed(s.floating)}</span>`],
    ["Margine usato", usd(s.usedMargin)],
    ["Margine libero", usd(s.freeMargin)],
    ["Margin level", s.marginLevel == null ? "—" : `<span class="${s.marginLevel < 100 ? "down" : ""}">${num(s.marginLevel, 0)}%</span>`],
  ].map(([k, v]) => `<div><span class="muted small">${k}</span><strong>${v}</strong></div>`).join("");
  $("#quote").innerHTML = `<span>Bid <b class="down">${p.bid.toFixed(d)}</b></span><span>Ask <b class="up">${p.ask.toFixed(d)}</b></span><span class="muted small">spread ${num(sim.SIM_PAIRS[simPair].spreadPips, 1)}</span>`;
  $("#bidbtn").textContent = " " + p.bid.toFixed(d);
  $("#askbtn").textContent = " " + p.ask.toFixed(d);
  const lots = Number($("#ticket").lots.value) || 0;
  if (lots > 0) {
    const pv = calc.pipValue({ pair: simPair, lots, account: "USD", price: p.mid, quoteToAccount: sim.quoteToUsd(st, simPair) });
    $("#ticket-info").textContent = `1 pip = ${num(pv, 2)} USD · margine ≈ ${num(sim.requiredMargin(st, simPair, lots), 2)} USD`;
  }
  const lines = [];
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  for (const pos of st.positions.filter((x) => x.pair === simPair)) {
    lines.push({ price: pos.entry, label: `#${pos.id} ${pos.side === "buy" ? "Buy" : "Sell"} ${pos.lots}`, color: css("--accent") });
    if (pos.sl != null) lines.push({ price: pos.sl, label: `#${pos.id} SL`, color: css("--down") });
    if (pos.tp != null) lines.push({ price: pos.tp, label: `#${pos.id} TP`, color: css("--up") });
  }
  drawChart($("#chart"), { pair: simPair, candles: st.candles[simPair], bid: p.bid, lines });
  const posEl = $("#positions");
  const ids = st.positions.map((x) => x.id).join(",");
  if (!full && posEl.dataset.ids === ids) {
    for (const pos of st.positions) {
      const r = sim.positionPL(st, pos);
      const tr = $(`tr[data-id="${pos.id}"]`, posEl);
      if (!tr) continue;
      const set = (cls, text, n) => { const td = $(cls, tr); td.textContent = text; td.className = cls.slice(1) + " " + plClass(n); };
      set(".c-exit", r.exit.toFixed(calc.priceDecimals(pos.pair)), 0);
      set(".c-pips", num(r.pips, 1), r.pips);
      set(".c-pl", signed(r.amount), r.amount);
    }
    return;
  }
  posEl.dataset.ids = ids;
  posEl.innerHTML = !st.positions.length
    ? `<p class="muted">Nessuna posizione aperta. Scegli i lotti e premi Buy o Sell.</p>`
    : `<table class="table"><thead><tr><th>#</th><th>Coppia</th><th>Tipo</th><th>Lotti</th><th>Entrata</th><th>Attuale</th><th>SL</th><th>TP</th><th>Pip</th><th>P/L USD</th><th></th></tr></thead><tbody>${st.positions.map((pos) => {
      const r = sim.positionPL(st, pos);
      const dd = calc.priceDecimals(pos.pair);
      return `<tr data-id="${pos.id}"><td>#${pos.id}</td><td>${pos.pair}</td><td class="${pos.side === "buy" ? "up" : "down"}">${pos.side === "buy" ? "Buy" : "Sell"}</td><td>${num(pos.lots, 2)}</td><td>${pos.entry.toFixed(dd)}</td><td class="c-exit">${r.exit.toFixed(dd)}</td><td>${pos.sl != null ? pos.sl.toFixed(dd) : "—"}</td><td>${pos.tp != null ? pos.tp.toFixed(dd) : "—"}</td><td class="c-pips ${plClass(r.pips)}">${num(r.pips, 1)}</td><td class="c-pl ${plClass(r.amount)}">${signed(r.amount)}</td><td><button class="btn small" data-close="${pos.id}" aria-label="Chiudi posizione ${pos.id}">Chiudi</button></td></tr>`;
    }).join("")}</tbody></table>`;
}

// ---------- diario ----------
function journal() {
  const st = getSim();
  const k = sim.stats(st);
  onMount(() => {
    $$("textarea[data-note]").forEach((ta) => ta.addEventListener("change", () => {
      store.update(() => { st.notes[ta.dataset.note] = ta.value; });
      toast("Nota salvata", "success");
    }));
  });
  return `
  <h1>Diario di trading</h1>
  <div class="stats">
    ${[
      ["Operazioni", k.trades],
      ["Vincenti", num(k.winRate, 0) + "%"],
      ["Risultato netto", `<span class="${plClass(k.net)}">${signed(k.net)} USD</span>`],
      ["Media vincita", usd(k.avgWin)],
      ["Media perdita", usd(k.avgLoss)],
      ["Profit factor", k.profitFactor == null ? "—" : num(k.profitFactor, 2)],
    ].map(([a, b]) => `<div class="card stat"><span class="muted small">${a}</span><strong>${b}</strong></div>`).join("")}
  </div>
  ${st.history.length ? `
  <div class="table-wrap card">
    <table class="table"><thead><tr><th>#</th><th>Coppia</th><th>Tipo</th><th>Lotti</th><th>Entrata</th><th>Uscita</th><th>Pip</th><th>P/L USD</th><th>Chiusura</th><th>Nota</th></tr></thead>
    <tbody>${st.history.map((t) => {
      const d = calc.priceDecimals(t.pair);
      return `<tr><td>#${t.id}</td><td>${t.pair}</td><td>${t.side === "buy" ? "Buy" : "Sell"}</td><td>${num(t.lots, 2)}</td><td>${t.entry.toFixed(d)}</td><td>${t.exit.toFixed(d)}</td><td class="${plClass(t.pips)}">${num(t.pips, 1)}</td><td class="${plClass(t.pl)}">${signed(t.pl)}</td><td>${esc(t.reason)}</td><td><textarea data-note="${t.id}" rows="1" aria-label="Nota per l'operazione ${t.id}" placeholder="Perché sono entrato? Cosa ho imparato?">${esc(st.notes[t.id] || "")}</textarea></td></tr>`;
    }).join("")}</tbody></table>
  </div>` : `<div class="card empty"><p>Ancora nessuna operazione chiusa.</p><a class="btn primary" href="#/simulatore">Apri il simulatore</a></div>`}`;
}

// ---------- impostazioni ----------
function settings() {
  onMount(() => {
    $("#theme").addEventListener("change", (e) => { store.update((s) => { s.theme = e.target.value; }); applyTheme(); });
    $("#reset-sim").addEventListener("click", () => {
      if (!confirm("Azzerare il conto demo? Posizioni, storico e note verranno cancellati.")) return;
      simState = sim.createState(simRng);
      store.update((s) => { s.sim = simState; });
      toast("Conto demo azzerato", "success");
    });
    $("#reset-all").addEventListener("click", () => {
      if (!confirm("Cancellare tutti i progressi, i quiz e il conto demo?")) return;
      store.resetAll();
      simState = null;
      applyTheme();
      toast("Tutto azzerato", "success");
      render();
    });
  });
  const t = store.load().theme;
  return `
  <h1>Impostazioni</h1>
  <section class="card form-grid">
    <label class="field"><span>Tema</span><select id="theme">
      <option value="auto" ${t === "auto" ? "selected" : ""}>Automatico</option>
      <option value="light" ${t === "light" ? "selected" : ""}>Chiaro</option>
      <option value="dark" ${t === "dark" ? "selected" : ""}>Scuro</option></select></label>
  </section>
  <section class="card">
    <h2>Dati</h2>
    <p class="muted">Tutto è salvato solo in questo browser. Nessun account, nessun server.</p>
    <div class="row">
      <button id="reset-sim" class="btn">Azzera conto demo</button>
      <button id="reset-all" class="btn danger">Cancella tutto</button>
    </div>
  </section>`;
}

function notFound(msg = "Pagina non trovata.") {
  return `<h1>Ops</h1><p>${esc(msg)}</p><a class="btn" href="#/">Torna alla home</a>`;
}

// ---------- router ----------
const ROUTES = [
  [/^$/, home, ""],
  [/^corso$/, course, "corso"],
  [/^lezione\/([\w-]+)$/, lesson, "corso"],
  [/^quiz\/(\d+)$/, quiz, "corso"],
  [/^glossario$/, glossary, "glossario"],
  [/^calcolatori$/, calculators, "calcolatori"],
  [/^simulatore$/, simulator, "simulatore"],
  [/^diario$/, journal, "diario"],
  [/^impostazioni$/, settings, "impostazioni"],
];

let lastPath = null;

function render() {
  const path = location.hash.replace(/^#\/?/, "");
  stopSim();
  mountQueue = [];
  let html = null;
  let nav = "";
  for (const [re, fn, key] of ROUTES) {
    const m = path.match(re);
    if (m) { html = fn(...m.slice(1)); nav = key; break; }
  }
  view.innerHTML = html ?? notFound();
  const queue = mountQueue;
  mountQueue = [];
  queue.forEach((fn) => fn());
  $$(".nav a").forEach((a) => a.setAttribute("aria-current", a.dataset.nav === nav ? "page" : "false"));
  if (path !== lastPath) {
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
    const h1 = $("h1", view);
    document.title = (h1 && path ? h1.textContent + " · " : "") + "Primo Pip";
  }
  lastPath = path;
  $("#menu").setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

window.addEventListener("hashchange", render);
window.addEventListener("resize", () => refreshSim());
window.addEventListener("pagehide", () => store.save());
$("#menu").addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  $("#menu").setAttribute("aria-expanded", String(open));
});

applyTheme();
render();
