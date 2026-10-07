// Smoke test end-to-end dei flussi F01-F05 (replica/test-plan.md).
// Uso: npm run e2e   (serve Playwright; PLAYWRIGHT_MODULE per un percorso non standard)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let pw;
try { pw = require(process.env.PLAYWRIGHT_MODULE || "playwright"); }
catch { pw = require("/opt/node-tools/node_modules/playwright"); }

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

const browser = await pw.chromium.launch();
const errors = [];
let failed = 0;
async function check(name, fn) {
  try { await fn(); console.log("ok   " + name); }
  catch (e) { failed++; console.log("FAIL " + name + "\n     " + e.message.split("\n")[0]); }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

for (const viewport of [{ width: 1280, height: 900 }, { width: 375, height: 800 }]) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("dialog", (d) => d.accept());
  const tag = viewport.width < 500 ? "[mobile] " : "";
  await page.goto(base);

  await check(tag + "home con avviso di rischio", async () => {
    await page.waitForSelector("text=Avviso di rischio");
    expect(await page.locator(".progress").count() > 0, "manca la barra di progresso");
  });

  await check(tag + "F01 completa la prima lezione", async () => {
    await page.click("text=Inizia il corso");
    await page.waitForSelector("h1:has-text(\"Cos'è il forex\")");
    await page.click("#mark");
    await page.waitForSelector("#mark:has-text('Completata')");
    await page.goto(base + "#/corso");
    await page.waitForSelector(".lessons li.done");
  });

  await check(tag + "F02 quiz livello 1 superato", async () => {
    await page.goto(base + "#/quiz/1");
    await page.click("#submit");
    await page.waitForSelector(".toast.error");
    const answers = [1, 0, 1, 1, 1, 1];
    for (let i = 0; i < answers.length; i++) await page.check(`input[name=q${i}][value="${answers[i]}"]`);
    await page.click("#submit");
    await page.waitForSelector("#result:has-text('Superato')");
  });

  await check(tag + "F03 size posizione 0,50 lotti", async () => {
    await page.goto(base + "#/calcolatori");
    await page.click("button[data-tab=size]");
    await page.selectOption("select[name=account]", "USD");
    await page.fill("input[name=balance]", "10000");
    await page.fill("input[name=risk]", "1");
    await page.fill("input[name=stop]", "20");
    await page.waitForSelector("#calc-out:has-text('0,50 lotti')");
  });

  await check(tag + "calcolatore chiede il tasso di conversione quando serve", async () => {
    await page.click("button[data-tab=pip]");
    await page.selectOption("select[name=account]", "EUR");
    await page.selectOption("select[name=pair]", "USD/JPY");
    expect(await page.isVisible(".conv"), "campo tasso non visibile");
    await page.waitForSelector("#calc-out .down");
    await page.fill("input[name=conv]", "0.0062");
    await page.waitForSelector("#calc-out:has-text('6,20 EUR')");
  });

  await check(tag + "F04 apri e chiudi un'operazione demo", async () => {
    await page.goto(base + "#/simulatore");
    await page.waitForSelector("#chart");
    const box = await page.locator("#chart").boundingBox();
    expect(box.width > 200 && box.height > 200, "grafico troppo piccolo");
    await page.fill("input[name=lots]", "0.5");
    await page.click("button[data-side=buy]");
    await page.waitForSelector("tr[data-id]");
    await page.waitForTimeout(1200);
    await page.click("button[data-close]");
    await page.waitForSelector("text=Nessuna posizione aperta");
  });

  await check(tag + "F04 margine insufficiente e SL sbagliato bloccati", async () => {
    await page.fill("input[name=lots]", "20");
    await page.click("button[data-side=buy]");
    await page.waitForSelector(".toast.error:has-text('Margine insufficiente')");
    await page.fill("input[name=lots]", "0.1");
    await page.fill("input[name=sl]", "999");
    await page.click("button[data-side=buy]");
    await page.waitForSelector(".toast.error:has-text('stop loss')");
  });

  await check(tag + "F05 il diario mostra l'operazione", async () => {
    await page.goto(base + "#/diario");
    await page.waitForSelector("table tbody tr");
    await page.fill("textarea[data-note]", "Test nota");
    await page.locator("textarea[data-note]").blur();
    await page.waitForSelector(".toast:has-text('Nota salvata')");
  });

  await check(tag + "glossario: ricerca e stato vuoto", async () => {
    await page.goto(base + "#/glossario");
    await page.fill("#gq", "spread");
    expect(await page.locator(".term:visible").count() >= 1, "nessun risultato per spread");
    await page.fill("#gq", "zzzz");
    await page.waitForSelector("#gempty:visible");
  });

  await check(tag + "lezione inesistente e persistenza dopo reload", async () => {
    await page.goto(base + "#/lezione/9-9");
    await page.waitForSelector("text=Questa lezione non esiste");
    await page.goto(base + "#/corso");
    await page.reload();
    await page.waitForSelector(".lessons li.done");
  });

  await check(tag + "nessuno scroll orizzontale", async () => {
    for (const r of ["", "corso", "calcolatori", "simulatore", "glossario"]) {
      await page.goto(base + "#/" + r);
      await page.waitForTimeout(150);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(over <= 1, `#/${r} sborda di ${over}px`);
    }
  });

  await check(tag + "impostazioni: tema scuro e reset", async () => {
    await page.goto(base + "#/impostazioni");
    await page.selectOption("#theme", "dark");
    expect(await page.getAttribute("html", "data-theme") === "dark", "tema non applicato");
    await page.click("#reset-all");
    await page.goto(base + "#/corso");
    expect(await page.locator(".lessons li.done").count() === 0, "progressi non azzerati");
  });

  if (viewport.width > 500) await page.goto(base + "#/simulatore"), await page.waitForTimeout(1500), await page.screenshot({ path: path.join(root, "replica/screens/clone-simulatore.png") }).catch(() => {});
  await page.close();
}

await check("nessun errore JS in console", async () => expect(errors.length === 0, errors.join(" | ")));
await browser.close();
server.close();
console.log(failed ? `\n${failed} test falliti` : "\ntutti i test e2e passati");
process.exit(failed ? 1 : 0);
