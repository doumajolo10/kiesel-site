// Renderiza build/logo.html em PNG transparente de alta resolução → assets/logo-kiesel-hd.png
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const p = await b.newPage(); await p.setViewport({ width: 1400, height: 560, deviceScaleFactor: 2 });
  await p.goto("file:///" + path.join(__dirname, "logo.html").split(path.sep).join("/"), { waitUntil: "networkidle0" });
  await p.screenshot({ path: path.join(__dirname, "..", "assets", "logo-kiesel-hd.png"), omitBackground: true, clip: { x: 80, y: 30, width: 1290, height: 500 } });
  await b.close(); console.log("logo hd ok");
})();
