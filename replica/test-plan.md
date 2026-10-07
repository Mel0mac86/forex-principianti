# Piano di test

Unit (`npm test`, 13 test): valore del pip (quotata/base/conversione esterna), size, margine, P/L, R:R;
motore demo: spread all'apertura, validazioni SL/TP/lotti/margine, SL/TP automatici, stop out al 50%.

E2E (`npm run e2e`, Playwright, desktop 1280px e mobile 375px):

| flusso | caso | esito |
| --- | --- | --- |
| home | avviso di rischio visibile | ok |
| F01 | completa la prima lezione, stato salvato dopo reload | ok |
| F02 | quiz con risposte mancanti → errore; tutte giuste → superato | ok |
| F03 | 10.000 USD, 1%, 20 pip → 0,50 lotti | ok |
| F03 edge | conto EUR su USD/JPY chiede il tasso JPY/EUR | ok |
| F04 | apre e chiude un Buy | ok |
| F04 edge | margine insufficiente, SL dal lato sbagliato | ok |
| F05 | diario mostra l'operazione, nota salvata | ok |
| glossario | ricerca e stato vuoto | ok |
| routing | lezione inesistente → messaggio | ok |
| layout | nessuno scroll orizzontale su 5 pagine | ok |
| impostazioni | tema scuro, cancella tutto | ok |
| console | nessun errore JS | ok |

## Bug trovati e chiusi
- S3: i gestori delle viste venivano collegati con `setTimeout`, un'interazione molto rapida subito dopo il cambio vista poteva andare persa (test mobile instabile). Ora si collegano in modo sincrono subito dopo il render.
- S3: la tabella posizioni veniva ricreata a ogni tick, un clic su "Chiudi" a cavallo dell'aggiornamento poteva perdersi. Ora si aggiornano solo le celle.
