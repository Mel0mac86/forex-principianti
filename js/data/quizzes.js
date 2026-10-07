// Quiz di fine livello. `answer` è l'indice dell'opzione corretta.

export const QUIZZES = {
  1: [
    { q: "In EUR/USD = 1,0850, qual è la valuta base?", options: ["USD", "EUR", "Nessuna delle due"], answer: 1, why: "La valuta base è la prima della coppia." },
    { q: "Se compri (Buy) EUR/USD, quando guadagni?", options: ["Se il prezzo sale", "Se il prezzo scende", "Mai, paghi solo lo spread"], answer: 0, why: "Comprando la base guadagni se si rafforza, cioè se il prezzo sale." },
    { q: "EUR/USD passa da 1,1020 a 1,1045. Di quanti pip si è mosso?", options: ["2,5", "25", "250"], answer: 1, why: "0,0025 ÷ 0,0001 = 25 pip." },
    { q: "Quanto vale 1 pip per USD/JPY?", options: ["0,0001", "0,01", "1"], answer: 1, why: "Nelle coppie quotate in yen il pip è la seconda cifra decimale." },
    { q: "Quante unità sono 0,1 lotti?", options: ["1.000", "10.000", "100.000"], answer: 1, why: "1 lotto = 100.000 unità, quindi 0,1 = 10.000 (mini lotto)." },
    { q: "Quanto vale un pip su EUR/USD con 1 lotto (conto in USD)?", options: ["1 USD", "10 USD", "100 USD"], answer: 1, why: "0,0001 × 100.000 = 10 USD." },
  ],
  2: [
    { q: "A quale prezzo apri un Buy a mercato?", options: ["Bid", "Ask", "La media tra i due"], answer: 1, why: "Si compra all'ask, si vende al bid." },
    { q: "Bid 1,27000, ask 1,27014. Quanto è lo spread?", options: ["1,4 pip", "14 pip", "0,14 pip"], answer: 0, why: "0,00014 ÷ 0,0001 = 1,4 pip." },
    { q: "Con leva 1:30, quanto margine serve per una posizione da 30.000 USD?", options: ["30 USD", "1.000 USD", "30.000 USD"], answer: 1, why: "30.000 ÷ 30 = 1.000." },
    { q: "Equity 2.000, margine usato 1.000. Qual è il margin level?", options: ["50%", "100%", "200%"], answer: 2, why: "2.000 ÷ 1.000 × 100 = 200%." },
    { q: "Che cos'è lo stop out?", options: ["Un ordine per entrare in rottura", "La chiusura forzata delle posizioni quando il margine è troppo basso", "Una commissione del broker"], answer: 1, why: "Scatta quando il margin level scende sotto la soglia (50% per i clienti retail UE)." },
    { q: "Un ordine che entra solo se il prezzo scende al livello che vuoi per comprare è:", options: ["Buy limit", "Buy stop", "Ordine a mercato"], answer: 0, why: "Il limit entra a un prezzo migliore dell'attuale." },
  ],
  3: [
    { q: "Una candela rialzista ha:", options: ["Chiusura sopra l'apertura", "Chiusura sotto l'apertura", "Massimo uguale al minimo"], answer: 0, why: "Rialzista = il prezzo ha chiuso più in alto di dove ha aperto." },
    { q: "Un trend rialzista fa:", options: ["Massimi e minimi decrescenti", "Massimi e minimi crescenti", "Sempre candele verdi"], answer: 1, why: "La struttura conta più del colore delle singole candele." },
    { q: "Una resistenza rotta con decisione spesso:", options: ["Sparisce per sempre", "Diventa supporto", "Diventa una media mobile"], answer: 1, why: "È il cambio di polarità dei livelli." },
    { q: "Quale dato muove di più le valute nel lungo periodo?", options: ["I tassi d'interesse delle banche centrali", "Il numero di candele verdi", "L'orario di Londra"], answer: 0, why: "I differenziali di tasso sono il motore fondamentale principale." },
    { q: "Supporti e resistenze vanno considerati come:", options: ["Linee precise al pip", "Zone", "Segnali sicuri"], answer: 1, why: "Il prezzo raramente rispetta un livello al pip esatto." },
  ],
  4: [
    { q: "Saldo 5.000 USD, rischio 1%. Quanto puoi perdere sull'operazione?", options: ["5 USD", "50 USD", "500 USD"], answer: 1, why: "5.000 × 1% = 50." },
    { q: "Rischio 100 USD, stop 50 pip su EUR/USD. Quanti lotti?", options: ["0,2", "2", "0,02"], answer: 0, why: "100 ÷ 50 = 2 USD/pip; 2 ÷ 10 = 0,2 lotti." },
    { q: "Sei in perdita e il prezzo si avvicina allo stop. Cosa fai?", options: ["Allontano lo stop", "Lascio lo stop dov'è", "Raddoppio la posizione"], answer: 1, why: "Lo stop si decide prima: non si allontana mai." },
    { q: "Con R:R 1:3, quale percentuale di vincenti serve per andare in pari (senza costi)?", options: ["25%", "33%", "75%"], answer: 0, why: "1 ÷ (1 + 3) = 25%." },
    { q: "Dove ha senso mettere lo stop di un Buy?", options: ["Sopra la resistenza", "Sotto un supporto che smentirebbe l'idea", "A 1 pip dall'entrata"], answer: 1, why: "Lo stop va dove la tua idea è sbagliata, oltre il rumore." },
  ],
  5: [
    { q: "Un piano di trading deve essere:", options: ["Scritto e verificabile", "Tenuto a mente", "Cambiato ogni giorno"], answer: 0, why: "Le regole non scritte si dimenticano sotto stress." },
    { q: "Dopo tre perdite di fila, la cosa più sana è:", options: ["Aumentare i lotti per recuperare", "Fermarsi come previsto dal piano", "Togliere lo stop loss"], answer: 1, why: "Aumentare la size per recuperare è revenge trading." },
    { q: "A cosa serve il diario di trading?", options: ["A misurare cosa funziona e cosa no", "A niente, conta solo l'istinto", "Solo a calcolare le tasse"], answer: 0, why: "Dopo decine di operazioni mostra dati reali sul tuo metodo." },
    { q: "Prima di scegliere un broker in Italia conviene verificare:", options: ["Che sia autorizzato (es. registri CONSOB)", "Che prometta rendimenti alti", "Che abbia la leva più alta"], answer: 0, why: "Chi promette guadagni o leva altissima è un campanello d'allarme." },
  ],
};

export const PASS_PCT = 70;
