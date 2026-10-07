# Primo Pip · forex per principianti

Scuola di forex gratuita in italiano, con conto demo simulato. Nessuna registrazione, nessun server: tutto resta nel browser.

- **Corso** in 5 livelli e 17 lezioni brevi: basi, come si fa un'operazione, grafici, gestione del rischio, mente e metodo.
- **Quiz** di fine livello con spiegazione di ogni risposta (si supera con il 70%).
- **Calcolatori**: valore del pip, size della posizione, margine, profitto/perdita, rischio/rendimento. Con conversione valuta del conto.
- **Simulatore demo**: 6 coppie con prezzi simulati, bid/ask e spread, grafico a candele, ordini Buy/Sell con stop loss e take profit, margine e margin level in tempo reale, leva 1:30 e stop out al 50% come le regole ESMA per i clienti retail.
- **Diario**: storico delle operazioni demo, statistiche (win rate, profit factor) e note.
- **Glossario** con ricerca, tema chiaro/scuro.

> ⚠️ Solo a scopo educativo. Non è consulenza finanziaria e non dà segnali. I prezzi del simulatore sono finti. Il trading con leva su forex e CFD è ad alto rischio e la maggior parte dei conti retail perde denaro.

## Avvio

Nessuna dipendenza. Serve solo un server statico (i moduli ES non si aprono da `file://`):

```bash
npm start            # python3 -m http.server 8000  →  http://localhost:8000
```

Pubblicazione: GitHub → Settings → Pages → Deploy from branch → `main` / root.

## Test

```bash
npm test             # unit test di calcoli e motore demo (node:test)
npm run e2e          # flussi end-to-end con Playwright, desktop e mobile
```

## Struttura

```
index.html  css/style.css
js/app.js        router e viste
js/calc.js       matematica del forex (funzioni pure)
js/sim.js        motore del conto demo
js/chart.js      grafico a candele su canvas
js/store.js      salvataggio in localStorage
js/data/         lezioni, quiz, glossario
replica/         recon, matrice funzioni, architettura, design token, piano di test, parity
```

## Come è stato fatto

Clonato con il metodo di [replica-skill](https://github.com/Jakeschincariol/replica-skill) (MIT), installato in `.claude/skills/`:
recon → architect → design → build → test → diff → brand. Clean-room: sono state rifatte le *funzioni* tipiche delle scuole di forex online
e delle piattaforme demo; tutti i testi, il nome e la grafica sono originali.

Licenza: MIT.
