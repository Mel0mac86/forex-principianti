// Contenuti originali del corso. Ogni livello ha lezioni brevi e un quiz.

export const LEVELS = [
  { id: 1, title: "Le basi", desc: "Cos'è il forex, coppie, pip e lotti." },
  { id: 2, title: "Come si fa un'operazione", desc: "Bid/ask, spread, ordini, leva e margine." },
  { id: 3, title: "Leggere i grafici", desc: "Candele, trend, supporti e resistenze." },
  { id: 4, title: "Gestione del rischio", desc: "Stop loss, size della posizione, rischio/rendimento." },
  { id: 5, title: "Mente e metodo", desc: "Piano di trading, diario, errori tipici." },
];

export const LESSONS = [
  {
    id: "1-1", level: 1, minutes: 4, title: "Cos'è il forex",
    body: `
<p>Il <strong>forex</strong> (foreign exchange) è il mercato in cui si scambiano le valute. Quando in vacanza cambi euro in dollari stai facendo, in piccolo, un'operazione sul forex.</p>
<p>È il mercato più grande del mondo: ogni giorno passano di mano migliaia di miliardi di dollari. Lo usano banche centrali, banche, aziende che pagano fornitori all'estero, fondi e, in piccolissima parte, i trader privati.</p>
<h3>Niente sede centrale</h3>
<p>Non esiste una "borsa del forex": gli scambi avvengono tra banche e intermediari collegati in rete. Per questo il mercato è aperto <strong>24 ore su 24 dal lunedì al venerdì</strong>, seguendo il sole: Sydney, Tokyo, Londra, New York.</p>
<h3>Come guadagna (o perde) un trader</h3>
<p>Il trader cerca di trarre profitto dalla variazione del <em>tasso di cambio</em>. Se pensi che l'euro si rafforzerà sul dollaro, compri euro contro dollari; se succede, rivendi a un prezzo più alto.</p>
<div class="callout warn"><strong>Da sapere subito:</strong> la maggior parte dei privati che fa trading con prodotti a leva perde denaro. Questo corso serve a capire come funziona, non a promettere guadagni.</div>`,
  },
  {
    id: "1-2", level: 1, minutes: 5, title: "Le coppie di valute",
    body: `
<p>Nel forex le valute si scambiano sempre <strong>in coppia</strong>: compri una valuta e contemporaneamente ne vendi un'altra.</p>
<p>Prendiamo <code>EUR/USD = 1,0850</code>:</p>
<ul>
<li><strong>EUR</strong> è la <em>valuta base</em> (la prima);</li>
<li><strong>USD</strong> è la <em>valuta quotata</em> (la seconda);</li>
<li>il prezzo dice quante unità della quotata servono per 1 unità della base: 1 euro = 1,0850 dollari.</li>
</ul>
<h3>Comprare e vendere</h3>
<p><strong>Buy (long)</strong> EUR/USD = compri euro e vendi dollari. Guadagni se il prezzo sale.<br>
<strong>Sell (short)</strong> EUR/USD = vendi euro e compri dollari. Guadagni se il prezzo scende.</p>
<h3>Major, minor ed esotiche</h3>
<ul>
<li><strong>Major</strong>: coppie con il dollaro USA e un'altra valuta forte (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD). Sono le più scambiate e di solito hanno costi più bassi.</li>
<li><strong>Cross (minor)</strong>: coppie forti senza dollaro, come EUR/GBP o EUR/JPY.</li>
<li><strong>Esotiche</strong>: una valuta forte con una di un mercato emergente (es. USD/TRY). Più costose e più nervose: non adatte per iniziare.</li>
</ul>`,
  },
  {
    id: "1-3", level: 1, minutes: 6, title: "Pip: l'unità di misura",
    body: `
<p>Il <strong>pip</strong> è il movimento minimo "standard" di un tasso di cambio. Serve per misurare guadagni, perdite e distanze in modo uguale per tutte le coppie.</p>
<ul>
<li>Per quasi tutte le coppie 1 pip = <strong>0,0001</strong> (la quarta cifra decimale).</li>
<li>Per le coppie quotate in yen (USD/JPY, EUR/JPY...) 1 pip = <strong>0,01</strong> (la seconda cifra decimale).</li>
</ul>
<p>Esempio: EUR/USD passa da 1,0850 a 1,0875 → si è mosso di <strong>25 pip</strong>.<br>
USD/JPY passa da 149,50 a 149,20 → è sceso di <strong>30 pip</strong>.</p>
<h3>E la cifra in più?</h3>
<p>Molti broker mostrano un decimale aggiuntivo (1,08503). Quell'ultima cifra è un <em>decimo di pip</em> (a volte chiamato <em>pipette</em>).</p>
<div class="callout">Prova il <a href="#/calcolatori">calcolatore del valore del pip</a> per vedere quanto vale un pip in euro o dollari.</div>`,
  },
  {
    id: "1-4", level: 1, minutes: 6, title: "Lotti e valore del pip",
    body: `
<p>Nel forex le quantità si misurano in <strong>lotti</strong>:</p>
<table class="table"><thead><tr><th>Nome</th><th>Lotti</th><th>Unità della valuta base</th></tr></thead><tbody>
<tr><td>Standard</td><td>1</td><td>100.000</td></tr>
<tr><td>Mini</td><td>0,1</td><td>10.000</td></tr>
<tr><td>Micro</td><td>0,01</td><td>1.000</td></tr></tbody></table>
<h3>Quanto vale 1 pip?</h3>
<p>Valore del pip = dimensione del pip × unità. Il risultato è nella <em>valuta quotata</em>.</p>
<p>EUR/USD, 1 lotto: 0,0001 × 100.000 = <strong>10 USD</strong> per pip.<br>
EUR/USD, 0,01 lotti: 0,0001 × 1.000 = <strong>0,10 USD</strong> per pip.</p>
<p>Se il tuo conto è in un'altra valuta va convertito. USD/JPY, 1 lotto: 0,01 × 100.000 = 1.000 JPY; con USD/JPY a 150 sono circa 6,67 USD.</p>
<div class="callout">Iniziare con i <strong>micro lotti</strong> significa che ogni pip vale pochi centesimi: gli errori costano poco mentre impari.</div>`,
  },
  {
    id: "2-1", level: 2, minutes: 5, title: "Bid, ask e spread",
    body: `
<p>Ogni coppia ha <strong>due prezzi</strong>:</p>
<ul>
<li><strong>Bid</strong>: il prezzo a cui puoi <em>vendere</em>;</li>
<li><strong>Ask</strong>: il prezzo a cui puoi <em>comprare</em> (è sempre un po' più alto).</li>
</ul>
<p>La differenza si chiama <strong>spread</strong> ed è il costo principale di un'operazione. Con EUR/USD bid 1,08500 e ask 1,08510 lo spread è di 1 pip.</p>
<p>Conseguenza pratica: appena apri un'operazione sei già leggermente in perdita, pari allo spread. Il prezzo deve muoversi a tuo favore almeno di quella distanza per arrivare in pari.</p>
<h3>Quando lo spread si allarga</h3>
<p>Lo spread cresce quando c'è poca liquidità (notte, festività) o durante notizie importanti. Le esotiche hanno spread molto più ampi delle major.</p>
<div class="callout">Nel <a href="#/simulatore">simulatore</a>, apri e chiudi subito un'operazione: vedrai che il risultato è esattamente meno lo spread.</div>`,
  },
  {
    id: "2-2", level: 2, minutes: 5, title: "Tipi di ordine",
    body: `
<ul>
<li><strong>Ordine a mercato</strong>: compri o vendi subito al prezzo corrente (ask per comprare, bid per vendere).</li>
<li><strong>Ordine limite</strong>: entri solo se il prezzo arriva a un livello <em>migliore</em> di quello attuale (compri più in basso, vendi più in alto).</li>
<li><strong>Ordine stop</strong>: entri solo se il prezzo arriva a un livello <em>peggiore</em> dell'attuale, per esempio per seguire una rottura.</li>
<li><strong>Stop loss</strong>: chiude automaticamente in perdita a un livello stabilito. È la tua cintura di sicurezza.</li>
<li><strong>Take profit</strong>: chiude automaticamente in guadagno a un livello stabilito.</li>
</ul>
<h3>Lo slippage</h3>
<p>Se il mercato si muove molto velocemente, un ordine può essere eseguito a un prezzo un po' diverso da quello previsto. Si chiama <strong>slippage</strong> e può succedere anche agli stop loss.</p>`,
  },
  {
    id: "2-3", level: 2, minutes: 7, title: "Leva e margine",
    body: `
<p>La <strong>leva</strong> ti permette di controllare una posizione molto più grande del denaro che depositi. Con leva 1:30, per aprire 30.000 € di posizione bastano 1.000 € di <strong>margine</strong>.</p>
<p>Margine richiesto = valore della posizione ÷ leva.<br>
Esempio: 1 lotto EUR/USD a 1,0850 vale 108.500 USD → con leva 1:30 servono circa <strong>3.617 USD</strong>.</p>
<h3>La leva moltiplica tutto</h3>
<p>Moltiplica i guadagni <em>e</em> le perdite. Con 1 lotto ogni pip vale 10 USD: un movimento contrario di 100 pip (meno dell'1%) fa perdere 1.000 USD.</p>
<h3>Regole in Europa</h3>
<p>Per i clienti al dettaglio l'ESMA ha fissato una leva massima di <strong>1:30</strong> sulle coppie principali (1:20 per le altre) e la chiusura automatica delle posizioni quando il margine scende sotto il <strong>50%</strong> del richiesto. C'è anche la protezione dal saldo negativo.</p>
<div class="callout warn">Il fatto che il broker ti permetta di usare 1:30 non significa che tu debba farlo. La leva effettiva dovrebbe essere decisa dalla gestione del rischio (livello 4).</div>`,
  },
  {
    id: "2-4", level: 2, minutes: 5, title: "Equity, margine libero e stop out",
    body: `
<ul>
<li><strong>Saldo</strong>: il denaro sul conto senza contare le posizioni aperte.</li>
<li><strong>Equity</strong>: saldo + profitti/perdite delle posizioni aperte. È quanto avresti chiudendo tutto adesso.</li>
<li><strong>Margine usato</strong>: il denaro "bloccato" per tenere aperte le posizioni.</li>
<li><strong>Margine libero</strong>: equity − margine usato. È quello che puoi usare per nuove operazioni.</li>
<li><strong>Margin level</strong>: equity ÷ margine usato × 100.</li>
</ul>
<p>Se il margin level scende troppo il broker prima avvisa (<em>margin call</em>) e poi chiude le posizioni (<em>stop out</em>), a partire dalla più in perdita.</p>
<p>Nel nostro simulatore lo stop out scatta al <strong>50%</strong>, come previsto per i clienti retail europei.</p>`,
  },
  {
    id: "3-1", level: 3, minutes: 6, title: "Le candele giapponesi",
    body: `
<p>Una <strong>candela</strong> riassume l'andamento del prezzo in un periodo (1 minuto, 1 ora, 1 giorno...). Ha quattro prezzi: <strong>apertura, massimo, minimo, chiusura</strong>.</p>
<ul>
<li>Il <strong>corpo</strong> va dall'apertura alla chiusura.</li>
<li>Le <strong>ombre</strong> (o stoppini) arrivano al massimo e al minimo.</li>
<li>Candela <span class="up">rialzista</span>: chiusura sopra l'apertura. Candela <span class="down">ribassista</span>: chiusura sotto l'apertura.</li>
</ul>
<h3>Cosa racconta</h3>
<p>Un corpo grande indica una spinta decisa. Ombre lunghe indicano che il prezzo è stato respinto: per esempio un'ombra lunga in basso dice che i venditori hanno spinto giù ma i compratori hanno riportato su il prezzo.</p>
<p>Una singola candela dice poco: conta il contesto, cioè dove si forma rispetto al trend e ai livelli importanti.</p>`,
  },
  {
    id: "3-2", level: 3, minutes: 6, title: "Trend e timeframe",
    body: `
<p>Un <strong>trend rialzista</strong> fa massimi e minimi via via più alti. Un <strong>trend ribassista</strong> fa massimi e minimi via via più bassi. Quando il prezzo oscilla senza direzione si parla di <strong>laterale</strong> (range).</p>
<p>Il trend dipende dal <strong>timeframe</strong>: sul grafico a 5 minuti può scendere mentre sul giornaliero sale. Un'abitudine utile è guardare prima un timeframe più ampio per il quadro generale e poi uno più piccolo per i dettagli.</p>
<h3>Medie mobili</h3>
<p>Una <strong>media mobile</strong> è la media dei prezzi delle ultime N candele. Aiuta a vedere la direzione filtrando il rumore: prezzo stabilmente sopra una media che sale = tendenza rialzista.</p>`,
  },
  {
    id: "3-3", level: 3, minutes: 6, title: "Supporti e resistenze",
    body: `
<p>Un <strong>supporto</strong> è una zona in cui in passato il prezzo ha smesso di scendere. Una <strong>resistenza</strong> è una zona in cui ha smesso di salire.</p>
<ul>
<li>Sono <em>zone</em>, non linee precise al pip.</li>
<li>Più volte una zona è stata toccata, più è osservata dai trader.</li>
<li>Quando una resistenza viene rotta con decisione spesso diventa supporto (e viceversa).</li>
<li>I numeri tondi (1,1000; 150,00) attirano spesso ordini.</li>
</ul>
<p>Questi livelli sono utili soprattutto per decidere <strong>dove mettere lo stop loss</strong>: oltre la zona che, se rotta, smentisce la tua idea.</p>`,
  },
  {
    id: "3-4", level: 3, minutes: 5, title: "Analisi tecnica e fondamentale",
    body: `
<p><strong>Analisi tecnica</strong>: studia il grafico (prezzi, trend, livelli, indicatori) partendo dall'idea che il comportamento passato aiuti a capire quello futuro.</p>
<p><strong>Analisi fondamentale</strong>: studia l'economia. Per le valute contano soprattutto i <strong>tassi d'interesse</strong> delle banche centrali (BCE, Fed, BoE, BoJ), l'inflazione, l'occupazione, la crescita.</p>
<h3>Il calendario economico</h3>
<p>Le pubblicazioni dei dati (es. l'occupazione USA il primo venerdì del mese) e le decisioni sui tassi possono muovere il prezzo di decine di pip in pochi secondi, con spread larghi e slippage. Molti principianti preferiscono non avere operazioni aperte in quei momenti.</p>`,
  },
  {
    id: "4-1", level: 4, minutes: 6, title: "Lo stop loss",
    body: `
<p>Lo <strong>stop loss</strong> decide in anticipo quanto sei disposto a perdere su un'operazione. Senza, una singola operazione può cancellare settimane di lavoro.</p>
<h3>Dove metterlo</h3>
<ul>
<li>In un punto che <strong>smentisce la tua idea</strong> (oltre un supporto per un Buy, oltre una resistenza per un Sell);</li>
<li>non troppo vicino, o verrà colpito dal normale "rumore" del prezzo e dallo spread;</li>
<li>deciso <strong>prima</strong> di entrare, non dopo.</li>
</ul>
<h3>Regola d'oro</h3>
<p>Non allontanare mai lo stop loss per "dare più spazio" a un'operazione in perdita. Puoi avvicinarlo per proteggere un guadagno, non allontanarlo.</p>`,
  },
  {
    id: "4-2", level: 4, minutes: 7, title: "Quanto rischiare: la size della posizione",
    body: `
<p>Il metodo più usato: rischiare una <strong>percentuale fissa</strong> del conto per operazione, spesso l'1% o meno.</p>
<ol>
<li>Rischio in denaro = saldo × rischio %. Con 10.000 USD e 1% = <strong>100 USD</strong>.</li>
<li>Distanza dello stop in pip, decisa dal grafico. Esempio: <strong>25 pip</strong>.</li>
<li>Valore per pip ammesso = 100 ÷ 25 = <strong>4 USD per pip</strong>.</li>
<li>Su EUR/USD 1 lotto vale 10 USD/pip → 4 ÷ 10 = <strong>0,4 lotti</strong>.</li>
</ol>
<p>Così è lo stop loss a decidere i lotti, non l'istinto. Con stop più largo apri meno lotti, con stop più stretto di più: il rischio resta sempre 100 USD.</p>
<h3>Perché l'1%</h3>
<p>Dopo 10 perdite di fila (capita!) perdi circa il 10% del conto. Rischiando il 10% a operazione, la stessa serie ti lascia con circa un terzo del conto.</p>
<div class="callout">Usa il <a href="#/calcolatori">calcolatore della size</a> prima di ogni operazione nel simulatore.</div>`,
  },
  {
    id: "4-3", level: 4, minutes: 6, title: "Rischio/rendimento",
    body: `
<p>Il rapporto <strong>rischio/rendimento</strong> (R:R) confronta quanto rischi con quanto puoi guadagnare. Stop a 20 pip e target a 40 pip = <strong>1:2</strong>.</p>
<p>Il R:R e la percentuale di operazioni vincenti vanno guardati insieme:</p>
<table class="table"><thead><tr><th>R:R</th><th>Vincenti necessarie per andare in pari</th></tr></thead><tbody>
<tr><td>1:1</td><td>50%</td></tr><tr><td>1:2</td><td>33%</td></tr><tr><td>1:3</td><td>25%</td></tr></tbody></table>
<p>(costi esclusi). Un R:R alto non è automaticamente migliore: un target lontano viene raggiunto meno spesso.</p>
<p>L'importante è che la combinazione abbia un'aspettativa positiva, e lo puoi scoprire solo registrando molte operazioni nel <a href="#/diario">diario</a>.</p>`,
  },
  {
    id: "5-1", level: 5, minutes: 5, title: "Il piano di trading",
    body: `
<p>Un <strong>piano di trading</strong> è un documento scritto che risponde a queste domande prima di operare:</p>
<ul>
<li>Quali coppie e quali orari?</li>
<li>Che cosa deve succedere per entrare (in modo verificabile)?</li>
<li>Dove va lo stop loss e dove il take profit?</li>
<li>Quanto rischio per operazione e al massimo al giorno/settimana?</li>
<li>Quando smetto (es. dopo 3 perdite di fila mi fermo per oggi)?</li>
</ul>
<p>Se una regola non è scritta, nei momenti di stress verrà dimenticata.</p>`,
  },
  {
    id: "5-2", level: 5, minutes: 5, title: "Il diario e gli errori tipici",
    body: `
<p>Il <strong>diario</strong> registra ogni operazione: perché sei entrato, dove erano stop e target, com'è finita e cosa provavi. Dopo 30-50 operazioni dice più di qualunque opinione.</p>
<h3>Errori tipici dei principianti</h3>
<ul>
<li><strong>Troppa leva</strong> e lotti troppo grandi.</li>
<li><strong>Nessuno stop loss</strong>, o stop spostato quando si è in perdita.</li>
<li><strong>Revenge trading</strong>: aprire subito un'altra operazione per "rifarsi".</li>
<li><strong>Overtrading</strong>: operare per noia.</li>
<li><strong>Chiudere i guadagni troppo presto</strong> e lasciar correre le perdite.</li>
<li>Seguire segnali o "guru" senza capire cosa si sta facendo.</li>
</ul>
<h3>Prima di passare al reale</h3>
<p>Usa il conto demo finché i risultati sono costanti per mesi, poi eventualmente inizia con importi che puoi permetterti di perdere, scegliendo un intermediario autorizzato (in Italia verifica sul sito della <strong>CONSOB</strong>).</p>`,
  },
];
