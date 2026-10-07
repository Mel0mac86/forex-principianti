import { test } from "node:test";
import assert from "node:assert/strict";
import { createState, makeRng, openPosition, closePosition, step, summary, START_BALANCE } from "../js/sim.js";

test("stato iniziale con storico candele", () => {
  const s = createState(makeRng(1));
  assert.equal(s.balance, START_BALANCE);
  assert.ok(s.candles["EUR/USD"].length >= 80);
  const p = s.prices["EUR/USD"];
  assert.ok(p.ask > p.bid);
});

test("aprire e chiudere subito costa lo spread", () => {
  const s = createState(makeRng(2));
  const r = openPosition(s, { pair: "EUR/USD", side: "buy", lots: 1 });
  assert.ok(r.ok);
  const t = closePosition(s, r.position.id);
  assert.ok(Math.abs(t.pips + 1.0) < 1e-6, "spread di 1 pip");
  assert.ok(Math.abs(t.pl + 10) < 1e-6);
  assert.equal(s.positions.length, 0);
  assert.equal(s.history.length, 1);
});

test("validazione SL/TP e margine", () => {
  const s = createState(makeRng(3));
  const px = s.prices["EUR/USD"];
  assert.equal(openPosition(s, { pair: "EUR/USD", side: "buy", lots: 1, sl: px.ask + 0.001 }).ok, false);
  assert.equal(openPosition(s, { pair: "EUR/USD", side: "sell", lots: 1, tp: px.bid + 0.001 }).ok, false);
  assert.equal(openPosition(s, { pair: "EUR/USD", side: "buy", lots: 0.001 }).ok, false);
  // 10.000 USD con leva 30 non bastano per 5 lotti (~18.000 USD di margine)
  assert.equal(openPosition(s, { pair: "EUR/USD", side: "buy", lots: 5 }).ok, false);
});

test("lo stop loss chiude la posizione", () => {
  const rng = makeRng(4);
  const s = createState(rng);
  const px = s.prices["GBP/USD"];
  const r = openPosition(s, { pair: "GBP/USD", side: "buy", lots: 0.1, sl: px.bid - 0.0005, tp: px.ask + 0.0005 });
  assert.ok(r.ok);
  let closed = [];
  for (let i = 0; i < 5000 && s.positions.length; i++) closed = closed.concat(step(s, rng));
  assert.equal(s.positions.length, 0);
  assert.ok(["stop loss", "take profit"].includes(closed[0].reason));
});

test("stop out sotto il 50% di margin level", () => {
  const rng = makeRng(5);
  const s = createState(rng);
  s.balance = 4000; // ~3.600 USD di margine per 1 lotto
  const r = openPosition(s, { pair: "EUR/USD", side: "buy", lots: 1 });
  assert.ok(r.ok);
  // Crollo del prezzo forzato
  s.prices["EUR/USD"] = { mid: r.position.entry - 0.03, bid: r.position.entry - 0.03, ask: r.position.entry - 0.0299 };
  const sm = summary(s);
  assert.ok(sm.marginLevel < 50);
  const closed = step(s, rng);
  assert.equal(closed.at(-1).reason, "stop out");
  assert.equal(s.positions.length, 0);
});
