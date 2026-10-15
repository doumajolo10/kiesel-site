// Servidor local que imita a Vercel deste projeto (cleanUrls + vercel.json): porta 4050.
// /painel -> painel/index.html; /imovel-XXXX sem arquivo -> imovel.html (página-molde).
const http = require("http"), fs = require("fs"), path = require("path");
const RAIZ = path.join(__dirname, ".."), PORTA = +(process.env.PORT || 4050);
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg" };
const existe = f => { try { return fs.statSync(f).isFile(); } catch (e) { return false; } };
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]);
  const local = p => path.join(RAIZ, path.normalize(p).replace(/^([/\\])+/, ""));
  let f = local(u);
  if (!f.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  if (!existe(f)) {
    const tentativas = [local(u + ".html"), local(path.join(u, "index.html"))];
    f = tentativas.find(existe) || (/^\/imovel-/.test(u) ? local("/imovel.html") : null);
  }
  if (!f) { res.writeHead(404, { "Content-Type": TIPOS[".html"] }); return res.end("404"); }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(f).pipe(res);
}).listen(PORTA, () => console.log("Kiesel em http://localhost:" + PORTA));
