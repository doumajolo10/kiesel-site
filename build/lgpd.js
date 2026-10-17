// LGPD (15/10/2026), aplicado uma vez: bibliotecas servidas pelo próprio site, mapa do Google só depois do clique,
// política de privacidade completa. Uso: node build/lgpd.js && node build/build.js
const fs = require("fs"), path = require("path");
const R = p => path.join(__dirname, "..", p);
const troca = (arq, de, para) => { let s = fs.readFileSync(R(arq), "utf8"); if (!s.includes(de)) throw new Error(arq + ": não achei " + de.slice(0, 60)); s = s.split(de).join(typeof para === "function" ? para() : para); fs.writeFileSync(R(arq), s); };

// 1) scripts locais (mesmos arquivos, conferidos pelo mesmo hash SRI)
troca("build/build.js", 'src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js" integrity="sha384-HOvlOYPIs/zjoIkWUGXkVmXsjr8GuZLV+Q+rcPwmJOVZVpvTSXQChiN4t9Euv9Vc" crossorigin="anonymous" referrerpolicy="no-referrer"', 'src="assets/vendor/gsap-3.13.0.min.js" integrity="sha384-HOvlOYPIs/zjoIkWUGXkVmXsjr8GuZLV+Q+rcPwmJOVZVpvTSXQChiN4t9Euv9Vc"');
troca("build/build.js", 'src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js" integrity="sha384-P8VzCVnT9NBUkMrpcIZrJbA7EBjJvh/fJS6PmP+4nLIM284DtsImIv8D0fFjIkeh" crossorigin="anonymous" referrerpolicy="no-referrer"', 'src="assets/vendor/ScrollTrigger-3.13.0.min.js" integrity="sha384-P8VzCVnT9NBUkMrpcIZrJbA7EBjJvh/fJS6PmP+4nLIM284DtsImIv8D0fFjIkeh"');
troca("build/build.js", 'src="https://cdn.jsdelivr.net/npm/lenis@1.3.1/dist/lenis.min.js" integrity="sha384-HOhEGwtEOoOqYLe/uKOml49IX3btH2saMNoBxmhl7d8YdSk1Z6UIQpJ20copTA6J" crossorigin="anonymous" referrerpolicy="no-referrer"', 'src="assets/vendor/lenis-1.3.1.min.js" integrity="sha384-HOhEGwtEOoOqYLe/uKOml49IX3btH2saMNoBxmhl7d8YdSk1Z6UIQpJ20copTA6J"');

// 2) CSP sem os CDNs
let v = JSON.parse(fs.readFileSync(R("vercel.json"), "utf8"));
for (const h of v.headers) for (const c of h.headers) if (c.key === "Content-Security-Policy") c.value = c.value.replace("script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net ", "script-src 'self' ");
fs.writeFileSync(R("vercel.json"), JSON.stringify(v, null, 2) + "\n");

// 3) mapa: o modelo troca todo <iframe> do Google Maps por um aviso com botão; o app.js carrega o mapa no clique
let m = fs.readFileSync(R("modelo.js"), "utf8");
m = m.replace("  // o mesmo ajuste que o build aplica em todo <main>\n", () => `  // mapa do Google só depois do clique (LGPD: o Google não recebe o acesso de quem não pediu o mapa)
  const PINO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const mapaSob = (titulo, src) => \`<div class="mapa-aviso" data-mapa="\${src}" data-titulo="\${titulo}"><span class="pino">\${PINO}</span><b>Av. Getúlio Vargas, Centro · São Martinho/RS</b><button type="button" class="btn btn-contorno">Mostrar o mapa</button><small>O mapa é do Google. Ao abrir, o Google recebe o seu acesso. <a href="https://www.google.com/maps?q=NEG%C3%93CIOS%20IMOBILI%C3%81RIOS%20KIESEL%2C%20S%C3%A3o%20Martinho%20-%20RS" target="_blank" rel="noopener">Abrir no Google Maps</a></small></div>\`;
  // o mesmo ajuste que o build aplica em todo <main>
`);
m = m.replace("  const ajusta = corpo => corpo", () => "  const ajusta = corpo => corpo.replace(/<iframe title=\"([^\"]*)\" loading=\"lazy\" referrerpolicy=\"[^\"]*\" src=\"(https:\\/\\/www\\.google\\.com\\/maps[^\"]*)\"><\\/iframe>/g, (t, a, b) => mapaSob(a, b))");
fs.writeFileSync(R("modelo.js"), m);
troca("app.js", "/* espera o vivo.js", () => `/* mapa do Google: carrega só quando a pessoa pede */
document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest(".mapa-aviso button"); if (!b) return;
  var box = b.closest(".mapa-aviso"), f = document.createElement("iframe");
  f.title = box.getAttribute("data-titulo") || "Mapa"; f.src = box.getAttribute("data-mapa"); f.referrerPolicy = "no-referrer-when-downgrade"; f.setAttribute("allowfullscreen", "");
  box.replaceWith(f);
});
/* espera o vivo.js`);
fs.appendFileSync(R("estilo.css"), `
/* mapa sob demanda (LGPD) */
.mapa-aviso{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;height:100%;min-height:inherit;padding:28px 24px;background:var(--fundo-2);color:var(--tinta-2);text-align:center}
.quadro-mapa .mapa-aviso{justify-content:flex-start;padding-top:clamp(28px,7%,56px)}
.mapa .mapa-aviso{min-height:420px}
.mapa-aviso .pino{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:#fff;color:var(--azul);box-shadow:var(--sombra)}
.mapa-aviso .pino svg{width:26px;height:26px}
.mapa-aviso b{color:var(--tinta);font-size:15px;font-weight:600}
.mapa-aviso small{max-width:34ch;font-size:12.5px;line-height:1.5;color:var(--tinta-3)}
.mapa-aviso small a{color:var(--azul)}
`);
console.log("ok");
