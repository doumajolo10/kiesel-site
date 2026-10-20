// Gera o logotipo da Kiesel em alta resolução (PNG transparente) a partir de build/logo2.html.
// Uso: node build/logo2.js            -> assets/marca-kiesel.png (1564x760) e assets/marca-kiesel-p.png (782x380)
//      node build/logo2.js comparar   -> pesquisa/shots/logo-comparar.png (desenho sobre o original, para conferir)
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const path = require("path"), url = require("url");
(async () => {
  const comparar = process.argv[2] === "comparar";
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const p = await b.newPage();
  for (const [esc, nome] of comparar ? [[1, "../pesquisa/shots/logo-comparar.png"]] : [[1, "../assets/marca-kiesel.png"], [0.5, "../assets/marca-kiesel-p.png"]]) {
    await p.setViewport({ width: 1564, height: 760, deviceScaleFactor: esc });
    await p.goto(url.pathToFileURL(path.join(__dirname, "logo2.html")).href, { waitUntil: "networkidle0" });
    await p.evaluate(async c => { await document.fonts.ready; if (c) document.body.classList.add("comparar"); if (c) document.body.style.background = "#fff"; }, comparar);
    await p.screenshot({ path: path.join(__dirname, nome), omitBackground: !comparar, clip: { x: 0, y: 0, width: 1564, height: 760 } });
    console.log("ok", nome);
  }
  await b.close();
})();
