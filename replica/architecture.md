# Architettura

- **Stack**: HTML + CSS + JavaScript (ES modules), nessuna build, nessuna dipendenza.
  Si apre con qualunque server statico e si pubblica su GitHub Pages.
- **Stato**: `localStorage` (chiave `primopip:v1`), letto/scritto con try/catch: se non disponibile l'app funziona lo stesso in memoria.
- **Routing**: hash router (`#/corso`, `#/lezione/1-2`, ...).
- **Moduli**
  - `js/calc.js` funzioni pure: dimensione pip, valore pip, size posizione, margine, P/L, R:R.
  - `js/sim.js` motore del conto demo: prezzi (random walk), candele, ordini, SL/TP, margin level, stop out. Puro e testabile (rng iniettabile).
  - `js/chart.js` grafico a candele su `<canvas>`.
  - `js/data/*.js` contenuti originali: lezioni, quiz, glossario.
  - `js/app.js` viste e router.
- **Test**: `node --test` (unit su calc e sim) + smoke e2e Playwright (`tests/e2e.mjs`).
- **Ordine di build**: calc -> sim -> shell/router -> corso+quiz -> calcolatori -> simulatore -> diario -> impostazioni.

## Regole del conto demo
- Conto in USD, saldo iniziale 10.000, leva 1:30 (limite ESMA per le major).
- 1 lotto = 100.000 unità della valuta base.
- Buy a prezzo ask, chiusura a bid; Sell a bid, chiusura ad ask.
- Margin level = equity / margine usato × 100. Sotto il 50% le posizioni vengono chiuse (dalla peggiore).
