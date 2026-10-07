// Grafico a candele su canvas, senza librerie.

import { priceDecimals } from "./calc.js";

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function drawChart(canvas, { pair, candles, bid, lines = [] }) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const axisW = 64;
  const pad = 10;
  const plotW = w - axisW;
  const slot = 8;
  const visible = candles.slice(-Math.max(10, Math.floor(plotW / slot)));
  const prices = visible.flatMap((c) => [c.h, c.l]).concat(lines.map((l) => l.price), [bid]);
  let hi = Math.max(...prices);
  let lo = Math.min(...prices);
  if (hi === lo) { hi += 0.0001; lo -= 0.0001; }
  const span = hi - lo;
  hi += span * 0.05;
  lo -= span * 0.05;
  const y = (p) => pad + (hi - p) / (hi - lo) * (h - pad * 2);
  const dec = priceDecimals(pair);

  const grid = css("--border");
  const muted = css("--text-muted");
  ctx.font = "11px " + css("--mono");
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const p = lo + (hi - lo) * i / 4;
    const yy = Math.round(y(p)) + 0.5;
    ctx.strokeStyle = grid;
    ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(plotW, yy); ctx.stroke();
    ctx.fillStyle = muted;
    ctx.fillText(p.toFixed(dec), plotW + 6, yy);
  }

  const up = css("--up");
  const down = css("--down");
  const offset = plotW - visible.length * slot;
  visible.forEach((c, i) => {
    const x = offset + i * slot + slot / 2;
    const col = c.c >= c.o ? up : down;
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, y(c.h)); ctx.lineTo(Math.round(x) + 0.5, y(c.l)); ctx.stroke();
    const top = y(Math.max(c.o, c.c));
    const bh = Math.max(1, y(Math.min(c.o, c.c)) - top);
    ctx.fillRect(Math.round(x - slot / 2 + 1.5), top, slot - 3, bh);
  });

  for (const l of lines) {
    const yy = Math.round(y(l.price)) + 0.5;
    ctx.strokeStyle = l.color;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(plotW, yy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = l.color;
    ctx.fillText(l.label, 4, yy - 8);
  }

  const by = Math.round(y(bid)) + 0.5;
  ctx.fillStyle = css("--accent");
  ctx.fillRect(plotW, by - 9, axisW, 18);
  ctx.fillStyle = css("--on-accent");
  ctx.fillText(bid.toFixed(dec), plotW + 6, by);
}
