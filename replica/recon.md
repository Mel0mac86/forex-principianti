# Recon map: scuola forex per principianti + conto demo (web)

Scope: il "core loop" delle app educative forex per principianti: corso a livelli,
quiz di verifica, glossario, calcolatori di trading e un simulatore con conto demo
(soldi virtuali). Riferimenti di categoria: le scuole online di forex gratuite
(es. corsi a livelli con quiz), i calcolatori pubblici dei broker e le piattaforme
demo dei broker retail.
For: principianti italiani che vogliono capire il forex **prima** di rischiare soldi veri.
Date: 2026-10-07

Metodo: clean-room. Studiate solo funzionalità e flussi da pagine pubbliche.
Nessun testo, logo, codice o contenuto copiato: lezioni, quiz e glossario sono scritti da zero in italiano.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | corso pubblico a livelli (categoria "school of forex") | pagine pubbliche dei corsi forex gratuiti | struttura: livelli -> lezioni -> quiz |
| 2 | calcolatori pubblici dei broker | pagine pubbliche "pip value / position size / margin calculator" | input e output standard del settore |
| 3 | piattaforme demo dei broker retail | pagine pubbliche "conto demo" | ordini a mercato, SL/TP, margine, stop out |
| 4 | regole ESMA per i CFD retail | esma.europa.eu | leva max 1:30 sulle major, margin close-out al 50% |

## Core loop

Imparo una lezione -> verifico con il quiz -> provo sul conto demo senza rischiare soldi.

## Screens

| ID | screen | route | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Home / dashboard | `#/` | progressi, prossima lezione, avviso rischio | ProgressBar, Card, Button | nuovo utente, in corso, corso finito |
| S02 | Corso (indice) | `#/corso` | livelli e lezioni con stato | LevelCard, LessonRow, Badge | nessuna lezione letta, parziale, completo |
| S03 | Lezione | `#/lezione/:id` | testo della lezione, segna completata, avanti/indietro | Prose, Callout, Button | letta, non letta, id inesistente |
| S04 | Quiz di livello | `#/quiz/:livello` | domande a scelta multipla con spiegazione | QuizQuestion, Radio, Result | da iniziare, in corso, superato, non superato |
| S05 | Glossario | `#/glossario` | termini A-Z con ricerca | SearchInput, DefinitionList | pieno, ricerca vuota |
| S06 | Calcolatori | `#/calcolatori` | valore pip, size posizione, margine, profitto/perdita, rischio/rendimento | Tabs, NumberInput, Select, ResultBox | valido, input non valido |
| S07 | Simulatore demo | `#/simulatore` | prezzi simulati, grafico a candele, ordini Buy/Sell, SL/TP | Chart, PairSelect, OrderTicket, PositionsTable, AccountBar | nessuna posizione, posizioni aperte, margine insufficiente, stop out |
| S08 | Diario | `#/diario` | storico operazioni demo e note | Table, Textarea, Stat | vuoto, pieno |
| S09 | Impostazioni | `#/impostazioni` | tema, valuta conto, reset progressi/demo | Toggle, Select, DangerButton | default, confermato reset |

## Flows

```
F01 Il principiante completa la prima lezione
    S01 -> S03 -> (segna completata) -> S03 lezione successiva
    happy path clicks: 2
    edge: id lezione inesistente, localStorage non disponibile

F02 Supera il quiz di un livello
    S02 -> S04 -> rispondi a N domande -> risultato
    happy path clicks: 1 + N + 1
    edge: risposte mancanti, ripeti quiz

F03 Calcola quanti lotti aprire
    S06 -> tab "Size posizione" -> saldo, rischio %, stop in pip, coppia -> risultato
    happy path clicks: 1 (risultato live)
    edge: stop = 0, coppia JPY, valuta conto diversa dalla quotata

F04 Apre e chiude un'operazione demo
    S07 -> coppia -> lotti -> SL/TP opzionali -> Buy/Sell -> chiudi
    happy path clicks: 3
    edge: margine insufficiente, SL dal lato sbagliato, stop out al 50% di margin level

F05 Rivede le operazioni
    S07 -> S08
    edge: nessuna operazione
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, buy, sell, danger | default, hover, focus, disabled | all |
| Card | default, highlight | - | S01, S02 |
| ProgressBar | - | 0-100% | S01, S02 |
| NumberInput / Select | - | default, focus, invalid | S06, S07, S09 |
| Tabs | - | selected | S06 |
| Toast | info, success, error | visible | S03, S07, S09 |
| Chart (candele) | - | caricamento, live, pausa | S07 |
| Table | positions, history | vuota, piena | S07, S08 |

## Inferred data model

```
Lesson      id, level, title, minutes, body(html)              confidence: high
Quiz        level, questions[{q, options[], answer, why}]       confidence: high
Term        term, definition                                   confidence: high
Progress    completedLessons[id], quizScores{level: pct}       confidence: high (lato client)
Account     currency(USD), balance, leverage(30)                confidence: high
Position    id, pair, side(buy|sell), lots, entry, sl, tp, openedAt
Trade       Position + exit, closedAt, pl, reason(manual|sl|tp|stopout)
JournalNote tradeId, text
```

Relationships: Level 1-n Lesson, Level 1-1 Quiz, Account 1-n Position, Account 1-n Trade, Trade 1-1 JournalNote.

## Feature matrix

See `features.csv`.

## Out of scope (cannot or should not be cloned)

- Esecuzione con soldi veri / collegamento a un broker: richiede licenza (CONSOB/ESMA). Il simulatore usa solo prezzi **simulati**.
- Prezzi di mercato in tempo reale: dati licenziati dai fornitori.
- Community/forum e contenuti degli autori originali.
- Segnali di trading o consigli d'investimento: non si danno.

## Size

Screens 9, flows 5, entities 8. Hard parts: matematica pip/margine con conversione valuta, motore del simulatore (SL/TP, stop out), grafico a candele senza librerie. Size: S/M.
