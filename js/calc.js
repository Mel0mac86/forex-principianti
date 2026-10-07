// Calcoli di trading forex. Funzioni pure, nessuna dipendenza.

export const LOT_UNITS = 100000;

export const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "EUR/GBP", "EUR/JPY"];

export function splitPair(pair) {
  const [base, quote] = String(pair).toUpperCase().split("/");
  if (!base || !quote) throw new Error("Coppia non valida: " + pair);
  return { base, quote };
}

// 1 pip = 0.01 per le coppie quotate in JPY, 0.0001 per le altre.
export function pipSize(pair) {
  return splitPair(pair).quote === "JPY" ? 0.01 : 0.0001;
}

export function priceDecimals(pair) {
  return pipSize(pair) === 0.01 ? 3 : 5;
}

// Fattore per convertire un importo dalla valuta quotata alla valuta del conto.
// price = prezzo della coppia; quoteToAccount serve solo se il conto non è né base né quotata.
export function quoteToAccountRate(pair, account, price, quoteToAccount) {
  const { base, quote } = splitPair(pair);
  account = String(account).toUpperCase();
  if (quote === account) return 1;
  if (base === account) {
    if (!(price > 0)) throw new Error("Serve il prezzo della coppia");
    return 1 / price;
  }
  if (!(quoteToAccount > 0)) throw new Error("Serve il tasso " + quote + "/" + account);
  return quoteToAccount;
}

// Valore di 1 pip per una posizione di `lots` lotti, nella valuta del conto.
export function pipValue({ pair, lots = 1, account = "USD", price, quoteToAccount }) {
  const units = lots * LOT_UNITS;
  return pipSize(pair) * units * quoteToAccountRate(pair, account, price, quoteToAccount);
}

// Quanti lotti aprire per rischiare `riskPct`% del saldo con uno stop di `stopPips` pip.
export function positionSize({ balance, riskPct, stopPips, pair, account = "USD", price, quoteToAccount }) {
  if (!(balance > 0)) throw new Error("Il saldo deve essere maggiore di zero");
  if (!(riskPct > 0)) throw new Error("Il rischio deve essere maggiore di zero");
  if (!(stopPips > 0)) throw new Error("Lo stop loss deve essere maggiore di zero");
  const riskAmount = balance * riskPct / 100;
  const perLotPip = pipValue({ pair, lots: 1, account, price, quoteToAccount });
  const lots = riskAmount / (stopPips * perLotPip);
  return { riskAmount, lots, units: lots * LOT_UNITS, pipValuePerLot: perLotPip };
}

// Margine richiesto, nella valuta del conto.
export function margin({ pair, lots, price, leverage, account = "USD", quoteToAccount }) {
  if (!(leverage >= 1)) throw new Error("La leva deve essere almeno 1");
  if (!(price > 0)) throw new Error("Serve il prezzo della coppia");
  const notionalQuote = lots * LOT_UNITS * price;
  return notionalQuote / leverage * quoteToAccountRate(pair, account, price, quoteToAccount);
}

// Profitto o perdita di un'operazione chiusa, nella valuta del conto.
// Se il conto è nella valuta base si converte al prezzo di uscita.
export function profitLoss({ pair, side, lots, entry, exit, account = "USD", quoteToAccount }) {
  const dir = side === "sell" ? -1 : 1;
  const diff = (exit - entry) * dir;
  const pips = diff / pipSize(pair);
  const amountQuote = diff * lots * LOT_UNITS;
  const amount = amountQuote * quoteToAccountRate(pair, account, exit, quoteToAccount);
  return { pips, amount };
}

export function riskReward({ entry, stop, target }) {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  if (risk === 0) throw new Error("Lo stop non può coincidere con l'entrata");
  const sideOk = (target - entry) * (entry - stop) > 0;
  if (!sideOk) throw new Error("Stop e target devono stare da lati opposti dell'entrata");
  const ratio = reward / risk;
  // Percentuale di operazioni vincenti necessaria per andare in pari.
  const breakEvenWinRate = 1 / (1 + ratio) * 100;
  return { risk, reward, ratio, breakEvenWinRate };
}

export function round(n, d = 2) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
