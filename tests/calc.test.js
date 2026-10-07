import { test } from "node:test";
import assert from "node:assert/strict";
import { pipSize, pipValue, positionSize, margin, profitLoss, riskReward } from "../js/calc.js";

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("dimensione del pip", () => {
  assert.equal(pipSize("EUR/USD"), 0.0001);
  assert.equal(pipSize("USD/JPY"), 0.01);
  assert.equal(pipSize("eur/jpy"), 0.01);
});

test("valore del pip: quotata = conto", () => {
  near(pipValue({ pair: "EUR/USD", lots: 1, account: "USD" }), 10);
  near(pipValue({ pair: "EUR/USD", lots: 0.1, account: "USD" }), 1);
});

test("valore del pip: base = conto", () => {
  // USD/JPY a 150: 1000 JPY = 6.6667 USD
  near(pipValue({ pair: "USD/JPY", lots: 1, account: "USD", price: 150 }), 1000 / 150);
});

test("valore del pip: conversione esterna", () => {
  // EUR/GBP, conto EUR? base = EUR -> 10 GBP / 0.85
  near(pipValue({ pair: "EUR/GBP", lots: 1, account: "EUR", price: 0.85 }), 10 / 0.85);
  // EUR/GBP, conto USD, GBP/USD 1.27
  near(pipValue({ pair: "EUR/GBP", lots: 1, account: "USD", quoteToAccount: 1.27 }), 12.7);
  assert.throws(() => pipValue({ pair: "EUR/GBP", lots: 1, account: "USD" }));
});

test("size della posizione", () => {
  // 10.000 USD, rischio 1% = 100 USD, stop 20 pip su EUR/USD -> 0.5 lotti
  const r = positionSize({ balance: 10000, riskPct: 1, stopPips: 20, pair: "EUR/USD", account: "USD" });
  near(r.riskAmount, 100);
  near(r.lots, 0.5);
  assert.throws(() => positionSize({ balance: 10000, riskPct: 1, stopPips: 0, pair: "EUR/USD" }));
});

test("margine", () => {
  // 1 lotto EUR/USD a 1.10 con leva 30 -> 110.000 / 30
  near(margin({ pair: "EUR/USD", lots: 1, price: 1.1, leverage: 30, account: "USD" }), 110000 / 30);
  // USD/JPY con conto USD: 100.000 / 30
  near(margin({ pair: "USD/JPY", lots: 1, price: 150, leverage: 30, account: "USD" }), 100000 / 30);
});

test("profitto/perdita", () => {
  const buy = profitLoss({ pair: "EUR/USD", side: "buy", lots: 1, entry: 1.1, exit: 1.102, account: "USD" });
  near(buy.pips, 20);
  near(buy.amount, 200);
  const sell = profitLoss({ pair: "EUR/USD", side: "sell", lots: 1, entry: 1.1, exit: 1.102, account: "USD" });
  near(sell.amount, -200);
  const jpy = profitLoss({ pair: "USD/JPY", side: "buy", lots: 1, entry: 150, exit: 150.5, account: "USD" });
  near(jpy.pips, 50);
  near(jpy.amount, 50000 / 150.5);
});

test("rischio/rendimento", () => {
  const r = riskReward({ entry: 1.1, stop: 1.098, target: 1.106 });
  near(r.ratio, 3);
  near(r.breakEvenWinRate, 25);
  assert.throws(() => riskReward({ entry: 1.1, stop: 1.102, target: 1.106 }));
});
