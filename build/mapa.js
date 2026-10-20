// Mapa ilustrado do entorno da Imobiliária Kiesel, desenhado com os dados do OpenStreetMap (© colaboradores do OpenStreetMap, ODbL).
// Entrada: pesquisa/mapa/osm.json (consulta Overpass: ruas, construções, praças do Centro de São Martinho).
// Saída: assets/fotos/mapa-kiesel.webp (2400x1800) e assets/fotos/mapa-kiesel-800.webp. Uso: node build/mapa.js
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const fs = require("fs"), path = require("path");
const RAIZ = path.join(__dirname, "..");
const osm = JSON.parse(fs.readFileSync(path.join(RAIZ, "pesquisa", "mapa", "osm.json"), "utf8"));
const LAT0 = -27.7083986, LON0 = -53.9640406;            // ponto "NEGÓCIOS IMOBILIÁRIOS KIESEL" no Google
const W = 1200, H = 900, M_POR_UN = 0.62;                 // ~745 m de largura
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 110540;
const px = (lat, lon) => [W / 2 + (lon - LON0) * KX / M_POR_UN, H / 2 - (lat - LAT0) * KY / M_POR_UN];
const d = g => g.map((p, i) => (i ? "L" : "M") + px(p.lat, p.lon).map(v => v.toFixed(1)).join(" ")).join("");
const fora = g => g.every(p => { const [x, y] = px(p.lat, p.lon); return x < -60 || x > W + 60 || y < -60 || y > H + 60; });
const LARG = { primary: 22, primary_link: 14, tertiary: 19, tertiary_link: 12, secondary: 20, residential: 13, unclassified: 13, living_street: 11, service: 7 };
const ruas = [], predios = [], verdes = [], escolas = [];
for (const e of osm.elements) {
  if (!e.geometry || fora(e.geometry)) continue;
  const t = e.tags || {};
  if (t.building) predios.push(`<path d="${d(e.geometry)}Z"/>`);
  else if (t.leisure === "park" || t.leisure === "pitch") verdes.push(`<path d="${d(e.geometry)}Z"/>`);
  else if (t.landuse === "education") escolas.push(`<path d="${d(e.geometry)}Z"/>`);
  else if (t.highway && LARG[t.highway]) ruas.push({ t: t.highway, nome: t.name || "", g: e.geometry, w: LARG[t.highway] });
}
ruas.sort((a, b) => a.w - b.w);
const contorno = ruas.map(r => `<path d="${d(r.g)}" stroke-width="${r.w + 4}"/>`).join("");
const miolo = ruas.map(r => `<path d="${d(r.g)}" stroke-width="${r.w}"${/Getúlio Vargas/.test(r.nome) ? ' class="av"' : ""}/>`).join("");
// nomes: o trecho mais comprido de cada rua, escrito da esquerda para a direita
const porNome = {};
for (const r of ruas) { if (!r.nome || r.t === "service") continue; const pts = r.g.map(p => px(p.lat, p.lon)); let c = 0; for (let i = 1; i < pts.length; i++) c += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); const dentro = pts.filter(([x, y]) => x > 40 && x < W - 40 && y > 40 && y < H - 40).length / pts.length; c *= dentro; if (!porNome[r.nome] || porNome[r.nome].c < c) porNome[r.nome] = { c, pts, r }; }
const curto = n => n.replace(/^Avenida /, "Av. ").replace(/^Travessa /, "Tv. ").replace("Venancio Motta", "Venâncio Mota");
let rotulos = "", defs = "", k = 0;
for (const [nome, o] of Object.entries(porNome).sort((a, b) => b[1].c - a[1].c)) {
  if (o.c < 170) continue;
  let pts = o.pts; if (pts[pts.length - 1][0] < pts[0][0]) pts = pts.slice().reverse();
  // nome só onde cabe inteiro: o meio do trecho longe das bordas e trecho visível comprido o bastante
  { let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    let acc = 0, mid = pts[0]; for (let i = 0; i < seg.length; i++) { if (acc + seg[i] >= tot / 2) { const f = (tot / 2 - acc) / seg[i]; mid = [pts[i][0] + f * (pts[i + 1][0] - pts[i][0]), pts[i][1] + f * (pts[i + 1][1] - pts[i][1])]; break; } acc += seg[i]; }
    const meia = curto(nome).length * 4.4 + 10; if (mid[0] < meia + 20 || mid[0] > W - meia - 20 || mid[1] < 30 || mid[1] > H - 34) continue; }
  const id = "r" + (k++); defs += `<path id="${id}" d="${pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("")}"/>`;
  const av = /Getúlio Vargas/.test(nome);
  rotulos += `<text class="${av ? "rot av" : "rot"}" dy="${av ? 6 : 4.5}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${curto(nome)}</textPath></text>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>${defs}<radialGradient id="vinheta" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#EEF2F6" stop-opacity="0"/><stop offset="100%" stop-color="#E3E9F0" stop-opacity=".9"/></radialGradient></defs>
<style>.rot{font:600 13px 'Instrument Sans',system-ui,sans-serif;fill:#5B6B7C;paint-order:stroke;stroke:#fff;stroke-width:4px;letter-spacing:.02em}.rot.av{font-size:16px;font-weight:700;fill:#0F2A44}</style>
<rect width="${W}" height="${H}" fill="#EEF2F6"/>
<g fill="#DCEAD8">${verdes.join("")}</g>
<g fill="#E6E2F0" opacity=".7">${escolas.join("")}</g>
<g fill="#DDE3EB" stroke="#D2D9E2" stroke-width=".8">${predios.join("")}</g>
<g fill="none" stroke="#D3DAE3" stroke-linecap="round" stroke-linejoin="round">${contorno}</g>
<g fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">${miolo.replace(/ class="av"/g, ' stroke="#CFE2F4"')}</g>
${rotulos}
<rect width="${W}" height="${H}" fill="url(#vinheta)"/>
<g transform="translate(${W / 2} ${H / 2})">
  <circle r="46" fill="#1F6FB8" opacity=".12"/><circle r="26" fill="#1F6FB8" opacity=".18"/>
  <path d="M0 0 C -6 -14 -22 -24 -22 -42 A 22 22 0 0 1 22 -42 C 22 -24 6 -14 0 0 Z" fill="#1F6FB8" stroke="#fff" stroke-width="4"/>
  <circle cy="-42" r="8" fill="#fff"/>
</g>
<text x="${W - 14}" y="${H - 12}" text-anchor="end" style="font:500 12px 'Instrument Sans',system-ui,sans-serif;fill:#7A8796">© colaboradores do OpenStreetMap</text>
</svg>`;
fs.writeFileSync(path.join(RAIZ, "pesquisa", "mapa", "mapa.svg"), svg);
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const p = await b.newPage();
  const fonte = "file:///" + path.join(RAIZ, "fontes", "InstrumentSans-400_700.woff2").split(path.sep).join("/");
  const html = `<!doctype html><html><head><style>@font-face{font-family:'Instrument Sans';src:url('${fonte}') format('woff2');font-weight:400 700}html,body{margin:0}</style></head><body>${svg}</body></html>`;
  fs.writeFileSync(path.join(RAIZ, "pesquisa", "mapa", "mapa.html"), html);
  for (const [esc, nome] of [[2, "mapa-kiesel.png"], [800 / W, "mapa-kiesel-800.png"]]) {
    await p.setViewport({ width: W, height: H, deviceScaleFactor: esc });
    await p.goto("file:///" + path.join(RAIZ, "pesquisa", "mapa", "mapa.html").split(path.sep).join("/"), { waitUntil: "networkidle0" });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(RAIZ, "pesquisa", "mapa", nome), clip: { x: 0, y: 0, width: W, height: H } });
  }
  await b.close();
  console.log("ruas:", ruas.length, "| construções:", predios.length, "| nomes:", k);
})();
