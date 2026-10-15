// Gera as páginas do site da Kiesel a partir de dados.js. Rodar: node build/build.js
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const w = {}; global.window = w; require(path.join(RAIZ, "dados.js"));
const IMOVEIS = w.IMOVEIS;
const ZAP = "5555999479495";
const SITE = "https://www.imobiliariakiesel.com.br";

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = n => Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
const preco = x => x.finalidade === "alugar" ? "R$ " + num(x.preco) + "<small>/mês</small>" : "R$ " + num(x.preco);
const precoTxt = x => x.finalidade === "alugar" ? "R$ " + num(x.preco) + "/mês" : "R$ " + num(x.preco);
const areaTxt = x => !x.area || x.area <= 1 ? "" : x.area < 50 ? Number(x.area).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " ha" : num(x.area) + " m²";
const onde = x => x.bairro + " · " + x.cidade + (x.uf ? "/" + x.uf : "");
const zapMsg = t => "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(t);
const foto = (f, t = "g") => "img/" + t + "/" + f + ".webp";
const CAPA = { CA0044: 1, CA0036: 2, CH0002: 2, CA0047: 1, CA0040: 2 };
const capa = x => x.fotos[CAPA[x.ref] || 0];
const capa2 = x => x.fotos.find((f, i) => i !== (CAPA[x.ref] || 0));
const ico = {
  cama: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 18V8h18v10M3 12h18M6 8V5h5v3M13 8V5h5v3"/></svg>',
  banho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
  carro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 16l1.5-5h11L19 16M3 16h18v3H3zM7 19v1M17 19v1"/><circle cx="7.5" cy="16" r="1"/><circle cx="16.5" cy="16" r="1"/></svg>',
  area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4h16v16H4zM4 9h5V4M15 20v-5h5"/></svg>',
  coracao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.5 0 .2 5.3.2 11.8c0 2.1.5 4.1 1.6 5.9L0 24l6.5-1.7a11.8 11.8 0 0 0 5.6 1.4c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.4zM12 21.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 0 1-1.5-5.2C2.1 6.4 6.5 2 12 2c2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 0 1 2.9 6.9c0 5.4-4.4 9.9-9.8 9.9zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5v-.6l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/></svg>',
  seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  esq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  compart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7"/></svg>'
};

// ---------- pedaços comuns ----------
const PAGS = [["index.html", "Início"], ["imoveis.html", "Imóveis"], ["financiamento.html", "Financiamento"], ["anuncie.html", "Anuncie"], ["sobre.html", "A Kiesel"], ["contato.html", "Contato"]];
function topo(atual) {
  return `<a class="pular so-leitor" href="#conteudo">Ir para o conteúdo</a>
<div class="faixa-topo"><div class="miolo"><div><span>Av. Getúlio Vargas, Centro · São Martinho/RS</span><span>CRECI 45.125/RS</span></div><div><span><a href="https://wa.me/5555999479495" target="_blank" rel="noopener">(55) 99947-9495</a></span><span><a href="https://wa.me/5555996298532" target="_blank" rel="noopener">(55) 99629-8532</a></span></div></div></div>
<header class="topo" id="topo">
  <a class="marca" href="index.html" aria-label="Kiesel Negócios Imobiliários, início"><img src="assets/logo-kiesel-hd.png" width="1290" height="500" alt="Kiesel Negócios Imobiliários" decoding="async"></a>
  <nav class="nav" aria-label="Principal">${PAGS.map(([h, t], i) => `<a href="${h}"${h === atual ? ' class="ativo" aria-current="page"' : ""}><span class="i">0${i + 1}</span>${t}</a>`).join("")}</nav>
  <div class="topo-acoes">
    <a class="ico-btn" id="favs-topo" href="imoveis.html?fin=favoritos" aria-label="Imóveis favoritos">${ico.coracao}<span class="conta num" id="favs-n">0</span></a>
    <a class="btn btn-zap" id="zap-topo" href="${zapMsg("Olá, vi o site da Kiesel e quero conversar sobre um imóvel.")}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${ico.zap}<span>WhatsApp</span></a>
    <button class="ico-btn menu-btn" id="btn-menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-movel">${ico.menu}</button>
  </div>
</header>
<nav class="menu-movel" id="menu-movel" aria-label="Menu">
  <button class="ico-btn fechar" id="btn-menu-fechar" aria-label="Fechar menu">${ico.x}</button>
  ${PAGS.map(([h, t], i) => `<a href="${h}">${t}<small class="num">0${i + 1}</small></a>`).join("")}
  <div class="rod">Av. Getúlio Vargas, Centro · São Martinho/RS<br>(55) 99947-9495 · CRECI 45.125/RS</div>
</nav>`;
}
function rodape() {
  return `<footer class="rodape">
  <div class="miolo">
    <div class="colunas">
      <div><span class="logo-rod"><img src="assets/logo-kiesel-hd.png" width="1290" height="500" alt="Kiesel Negócios Imobiliários" loading="lazy"></span><p>Kipper Kiesel Ltda · CRECI 45.125/RS<br>Av. Getúlio Vargas, Centro<br>São Martinho, RS · CEP 98690-000</p><div class="hud" style="margin-top:18px"><span>Imóveis publicados · <b class="num">${IMOVEIS.length}</b></span></div></div>
      <div><h4>Imóveis</h4><a href="imoveis.html?tipo=Casa">Casas</a><a href="imoveis.html?tipo=Terreno">Terrenos</a><a href="imoveis.html?tipo=Ch%C3%A1cara">Chácaras e áreas</a><a href="imoveis.html?fin=alugar">Para alugar</a><a href="imoveis.html?fin=favoritos">Meus favoritos</a></div>
      <div><h4>A Kiesel</h4><a href="sobre.html">Quem somos</a><a href="financiamento.html">Financiamento</a><a href="anuncie.html">Anuncie seu imóvel</a><a href="encomende.html">Encomende um imóvel</a><a href="privacidade.html">Privacidade</a></div>
      <div><h4>Contato</h4><a href="https://wa.me/5555999479495" target="_blank" rel="noopener">(55) 99947-9495</a><a href="https://wa.me/5555996298532" target="_blank" rel="noopener">(55) 99629-8532</a><a href="https://www.facebook.com/imobiliariakiesel" target="_blank" rel="noopener">facebook.com/imobiliariakiesel</a><a href="contato.html">Como chegar</a></div>
    </div>
    <div class="fim"><span>© ${new Date().getFullYear()} Kiesel Negócios Imobiliários. Todos os direitos reservados.</span><span>Valores sujeitos a alteração sem aviso. Fotos dos imóveis são do acervo da imobiliária.</span></div>
  </div>
</footer>
<div class="barra-zap"><a class="btn btn-zap" href="${zapMsg("Olá, vi o site da Kiesel e quero conversar sobre um imóvel.")}" target="_blank" rel="noopener">${ico.zap}Falar com a Kiesel no WhatsApp</a></div>
<div class="aviso" id="aviso" role="status" aria-live="polite"></div>
<div class="grao" aria-hidden="true"></div>
<div class="cortina" id="cortina" aria-hidden="true"></div>
<div class="bairro-foto" id="bairro-foto" aria-hidden="true"><img alt="" src="" width="260" height="195"></div>
<div class="cursor" aria-hidden="true"></div><div class="cursor-rotulo" id="cursor-rotulo" aria-hidden="true"><span>Ver imóvel</span></div>`;
}
function pagina({ arquivo, titulo, desc, corpo, jsonld, escuro, extraHead = "", atual }) {
  return `<!doctype html>
<html lang="pt-BR" class="sem-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#F4F2ED">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${SITE}/og.jpg"><meta property="og:locale" content="pt_BR">
<link rel="icon" href="favicon.png" type="image/png">
<link rel="preload" href="fontes/InstrumentSans-400_700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fontes/DMMono-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="fontes/fontes3.css">
<link rel="stylesheet" href="estilo.css">
${extraHead}
<script>document.documentElement.classList.remove("sem-js")</script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body${escuro ? ' class="escuro"' : ""} data-pagina="${arquivo.replace(".html", "")}">
${topo(atual || arquivo)}
<main id="conteudo">
${corpo.replace(/<(h1|p) class="(mask|grande mask)">([\s\S]*?)<\/\1>/g, '<$1 class="$2"><span>$3</span></$1>').replace(/class="(trilha|onde)"/g, 'class="$1 mono"').replace(/class="num-sec rv"/g, 'class="mono rv"')}
</main>
${rodape()}
<script src="dados.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.1/dist/lenis.min.js" defer></script>
<script src="app.js" defer></script>
</body>
</html>`;
}

// ---------- cartões ----------
function specs(x, escuro) {
  const s = [];
  if (x.quartos) s.push(`<span>${ico.cama}${x.quartos} ${x.quartos > 1 ? "quartos" : "quarto"}</span>`);
  if (x.banheiros) s.push(`<span>${ico.banho}${x.banheiros} ${x.banheiros > 1 ? "banheiros" : "banheiro"}</span>`);
  if (x.vagas) s.push(`<span>${ico.carro}${x.vagas} ${x.vagas > 1 ? "vagas" : "vaga"}</span>`);
  const a = areaTxt(x); if (a) s.push(`<span>${ico.area}${a}</span>`);
  return s.join("");
}
function card(x, lazy = true) {
  const f1 = capa(x), f2 = capa2(x);
  return `<a class="item" href="imovel-${x.ref}.html" data-cursor="Ver imóvel" data-ref="${x.ref}" data-tipo="${esc(x.tipo)}" data-fin="${x.finalidade}" data-bairro="${esc(x.bairro)}" data-preco="${x.preco}" data-quartos="${x.quartos}" data-area="${x.area}" data-data="${x.atualizado}" data-busca="${esc((x.titulo + " " + x.bairro + " " + x.cidade + " " + x.ref + " " + x.comodidades.join(" ") + " " + x.descricao).toLowerCase())}">
  <div class="moldura"><img class="a" src="${foto(f1, "p")}" srcset="${foto(f1, "p")} 640w, ${foto(f1, "g")} 1280w" sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw" width="640" height="360" alt="${esc(x.titulo)} em ${esc(x.bairro)}"${lazy ? ' loading="lazy" decoding="async"' : ""}>${f2 ? `<img class="b" src="${foto(f2, "p")}" alt="" loading="lazy" decoding="async">` : ""}<span class="cod">${x.ref}</span><span class="tipo">${esc(x.tipo)}${x.finalidade === "alugar" ? " · aluguel" : ""}</span><button class="fav" type="button" data-fav="${x.ref}" aria-label="Guardar ${x.ref} nos favoritos" aria-pressed="false">${ico.coracao}</button></div>
  <div class="dados"><h3>${esc(x.titulo)}</h3><span class="preco num">${preco(x)}</span></div>
  <span class="onde">${esc(onde(x))}</span>
  <div class="specs">${specs(x)}</div>
</a>`;
}
function peca(x, i) {
  return `<a class="peca" href="imovel-${x.ref}.html" data-cursor="Ver imóvel">
  <div class="moldura"><img src="${foto(capa(x), "g")}" width="1280" height="720" alt="${esc(x.titulo)} em ${esc(x.bairro)}"${i < 2 ? "" : ' loading="lazy" decoding="async"'}><span class="cod">${x.ref}</span></div>
  <div class="legenda"><div><h3>${esc(x.titulo)}</h3><span class="mono">${esc(onde(x))}</span></div><span class="preco num">${preco(x)}</span></div>
</a>`;
}

// ---------- home ----------
const venda = IMOVEIS.filter(x => x.finalidade === "comprar");
const cont = t => IMOVEIS.filter(x => x.tipo === t).length;
const bairros = {}; for (const x of IMOVEIS) { const k = x.bairro + "|" + x.cidade; bairros[k] = (bairros[k] || 0) + 1; }
const listaBairros = Object.entries(bairros).sort((a, b) => b[1] - a[1]);
const recentes = [...IMOVEIS].sort((a, b) => b.atualizado.localeCompare(a.atualizado) || b.preco - a.preco).slice(0, 6);
const porRef = r => IMOVEIS.find(x => x.ref === r);
const selecao = [porRef("CA0018"), porRef("CA0035"), porRef("CH0007"), porRef("CA0044")];

const home = pagina({
  arquivo: "index.html",
  titulo: "Imobiliária Kiesel · Casas, terrenos e chácaras em São Martinho/RS",
  desc: `Kiesel Negócios Imobiliários, CRECI 45.125/RS. ${IMOVEIS.length} imóveis à venda e para alugar em São Martinho e região, com atendimento direto pelo WhatsApp.`,
  jsonld: { "@context": "https://schema.org", "@type": "RealEstateAgent", name: "Kiesel Negócios Imobiliários", legalName: "Kipper Kiesel Ltda", url: SITE + "/", telephone: "+55 55 99947-9495", address: { "@type": "PostalAddress", streetAddress: "Avenida Getúlio Vargas", addressLocality: "São Martinho", addressRegion: "RS", postalCode: "98690-000", addressCountry: "BR" }, sameAs: ["https://www.facebook.com/imobiliariakiesel"], identifier: { "@type": "PropertyValue", name: "CRECI", value: "45.125/RS" } },
  extraHead: `<link rel="preload" href="img/g/CA0036-03.webp" as="image">`,
  corpo: require("./home.js")({ IMOVEIS, esc, num, preco, precoTxt, onde, foto, capa, card, peca, ico, zapMsg, listaBairros, cont, recentes, porRef })
});

// ---------- catálogo ----------
const tipos = [...new Set(IMOVEIS.map(x => x.tipo))];
const catalogo = pagina({
  arquivo: "imoveis.html",
  titulo: "Imóveis à venda e para alugar em São Martinho · Imobiliária Kiesel",
  desc: `Catálogo completo da Kiesel: ${IMOVEIS.length} casas, terrenos, chácaras, áreas e salas comerciais em São Martinho/RS e região, com preço e fotos.`,
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Imóveis</div><h1 class="mask">Catálogo <span class="ital">completo.</span></h1><p>Todos os imóveis disponíveis hoje, com preço, fotos e descrição. Filtre por finalidade, tipo, bairro e quartos, ou guarde favoritos para comparar depois.</p></div></section>
<section class="secao" style="padding-top:clamp(28px,4vw,48px);min-height:100vh">
  <div class="miolo">
    <form class="filtros" id="filtros" onsubmit="return false">
      <div class="alterna" role="group" aria-label="Finalidade"><button type="button" data-fin="comprar" aria-pressed="true">Comprar</button><button type="button" data-fin="alugar" aria-pressed="false">Alugar</button><button type="button" data-fin="favoritos" aria-pressed="false">Favoritos</button></div>
      <div class="campo"><label for="f-tipo">Tipo</label><select class="sel" id="f-tipo"><option value="">Todos</option>${tipos.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
      <div class="campo"><label for="f-bairro">Bairro</label><select class="sel" id="f-bairro"><option value="">Todos</option>${listaBairros.map(([k]) => { const [b, c] = k.split("|"); return `<option value="${esc(b)}">${esc(b)} · ${esc(c)}</option>`; }).join("")}</select></div>
      <div class="campo"><label for="f-quartos">Quartos</label><select class="sel" id="f-quartos"><option value="">Qualquer</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></div>
      <div class="campo"><label for="f-ordem">Ordem</label><select class="sel" id="f-ordem"><option value="recentes">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="area">Maior área</option></select></div>
      <div class="campo campo-busca"><label for="f-busca">Buscar</label><input class="ent" id="f-busca" type="search" placeholder="piscina, Centro, CA0018…" autocomplete="off"></div>
      <button class="limpar" type="button" id="f-limpar">Limpar</button>
    </form>
    <div class="resumo"><span><b class="num" id="res-n">${IMOVEIS.length}</b> <span id="res-txt">imóveis</span></span><span id="res-fil"></span></div>
    <div class="vitrine" id="grade">${IMOVEIS.map(x => card(x)).join("")}<div class="vazio" id="vazio" hidden><h3>Nenhum imóvel com esses filtros.</h3><p>Tente outro bairro ou tipo, ou <a href="encomende.html">encomende</a> o imóvel que você procura.</p></div></div>
    <nav class="paginacao" id="paginacao" aria-label="Páginas"></nav>
  </div>
</section>`
});

// ---------- página de imóvel ----------
function semelhantes(x) {
  return IMOVEIS.filter(y => y.ref !== x.ref && y.finalidade === x.finalidade).map(y => ({ y, d: (y.tipo === x.tipo ? 0 : 1e9) + Math.abs(y.preco - x.preco) })).sort((a, b) => a.d - b.d).slice(0, 3).map(o => o.y);
}
function paginaImovel(x) {
  const fotos = x.fotos;
  const esp = [];
  if (x.quartos) esp.push([x.quartos, x.quartos > 1 ? "quartos" : "quarto"]);
  if (x.suites) esp.push([x.suites, x.suites > 1 ? "suítes" : "suíte"]);
  if (x.banheiros) esp.push([x.banheiros, x.banheiros > 1 ? "banheiros" : "banheiro"]);
  if (x.vagas) esp.push([x.vagas, x.vagas > 1 ? "vagas" : "vaga"]);
  const a = areaTxt(x); if (a) esp.push([a.split(" ")[0], a.split(" ")[1] === "ha" ? "hectares" : "m² de área"]);
  const msg = `Olá, tenho interesse no imóvel ${x.ref} (${x.titulo}, ${onde(x)}, ${precoTxt(x)}). Pode me passar mais informações?`;
  const desc = `${x.titulo} em ${onde(x)}, ${precoTxt(x)}. ${x.descricao.split("\n")[0].slice(0, 140)}`;
  return pagina({
    arquivo: `imovel-${x.ref}.html`, atual: "imoveis.html",
    titulo: `${x.titulo} · ${x.bairro}, ${x.cidade} · ${precoTxt(x)} · Kiesel ${x.ref}`,
    desc,
    jsonld: { "@context": "https://schema.org", "@type": "RealEstateListing", name: x.titulo, url: `${SITE}/imovel-${x.ref}.html`, datePosted: x.atualizado, image: fotos.slice(0, 5).map(f => `${SITE}/${foto(f)}`), offers: { "@type": "Offer", price: x.preco, priceCurrency: "BRL", availability: "https://schema.org/InStock" }, address: { "@type": "PostalAddress", addressLocality: x.cidade, addressRegion: x.uf || "RS", addressCountry: "BR" } },
    extraHead: `<link rel="preload" href="${foto(fotos[0])}" as="image">`,
    corpo: `
<section class="imovel-galeria">
  <div class="galeria" id="galeria" aria-roledescription="galeria" aria-label="Fotos do imóvel ${x.ref}">
    ${fotos.map((f, i) => `<div class="slide${i === 0 ? " ativo" : ""}" data-i="${i}"><img src="${foto(f)}" width="1280" height="720" alt="${esc(x.titulo)}, foto ${i + 1} de ${fotos.length}"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}></div>`).join("")}
    ${fotos.length > 1 ? `<button class="seta ant" id="g-ant" type="button" aria-label="Foto anterior">${ico.esq}</button><button class="seta prox" id="g-prox" type="button" aria-label="Próxima foto">${ico.seta}</button>` : ""}
    <div class="contador num" id="g-contador"><span id="g-atual">1</span><i>/</i>${fotos.length}</div>
  </div>
  ${fotos.length > 1 ? `<div class="miniaturas" id="miniaturas">${fotos.map((f, i) => `<button type="button" class="${i === 0 ? "ativa" : ""}" data-i="${i}" aria-label="Ver foto ${i + 1}"><img src="${foto(f, "p")}" width="108" height="81" alt="" loading="lazy" decoding="async"></button>`).join("")}</div>` : ""}
</section>
<section class="secao" style="padding-top:clamp(28px,4vw,48px)">
  <div class="miolo">
    <div class="trilha" style="font-size:13px;color:var(--tinta-3);margin-bottom:18px;font-weight:500"><a href="index.html" style="text-decoration:none;color:var(--azul)">Início</a> / <a href="imoveis.html" style="text-decoration:none;color:var(--azul)">Imóveis</a> / ${x.ref}</div>
    <div class="imovel">
      <div>
        <h1 class="mask">${esc(x.titulo)}</h1>
        <div class="onde">${esc(x.tipo)} ${x.finalidade === "alugar" ? "para alugar" : "à venda"} · ${esc(onde(x))} · ref. ${x.ref}</div>
        <div class="preco num">${preco(x)}${x.finalidade === "comprar" ? `<small>à venda</small>` : ""}</div>
        <div class="especs" data-stagger>${esp.map(([n, t]) => `<div class="rv"><b class="num">${n}</b><span>${t}</span></div>`).join("")}</div>
        <h2>Sobre o imóvel</h2>
        <div class="descricao">${esc(x.descricao)}</div>
        ${x.comodidades.length ? `<h2>Características</h2><div class="chips">${x.comodidades.map(c => `<span>${esc(c)}</span>`).join("")}</div>` : ""}
        <p class="nota" style="margin-top:28px;font-size:13px;color:var(--tinta-3)">Atualizado em ${x.atualizado.split("-").reverse().join("/")}. Valores sujeitos a alteração sem aviso prévio.</p>
      </div>
      <aside class="imovel-lado">
        <div class="placa">
          <h3>Quer visitar?</h3>
          <p>Fale direto com o corretor. A mensagem já vai com o código ${x.ref} para agilizar.</p>
          <a class="btn btn-zap" id="ficha-zap" href="${zapMsg(msg)}" target="_blank" rel="noopener">${ico.zap}Falar sobre este imóvel</a>
          <div class="acoes-linha"><button class="btn btn-contorno" type="button" data-fav="${x.ref}" aria-pressed="false" id="ficha-fav">${ico.coracao}<span>Guardar</span></button><button class="btn btn-contorno" type="button" id="ficha-compart">${ico.compart}Compartilhar</button></div>
          ${x.finalidade === "comprar" ? `<a class="btn btn-contorno" href="financiamento.html?valor=${x.preco}">Simular financiamento</a>` : ""}
          <div class="corretor"><img src="assets/logo-kiesel-hd.png" alt="" width="72" height="33"><div>Kiesel Negócios Imobiliários<br>CRECI 45.125/RS · (55) 99947-9495</div></div>
        </div>
      </aside>
    </div>
  </div>
</section>
<section class="secao secao-escura" id="semelhantes">
  <div class="miolo">
    <div class="cabeca"><div><span class="num-sec rv">Veja também</span><h2 class="rv">Imóveis semelhantes.</h2></div><a class="btn btn-contorno rv" href="imoveis.html?tipo=${encodeURIComponent(x.tipo)}">Todos os ${esc(x.tipo.toLowerCase())}s ${ico.seta}</a></div>
    <div class="vitrine" data-stagger>${semelhantes(x).map(y => card(y)).join("")}</div>
  </div>
</section>
<nav class="prox-ant" aria-label="Outros imóveis">${(() => { const i = IMOVEIS.indexOf(x), n = IMOVEIS.length, a = IMOVEIS[(i - 1 + n) % n], p = IMOVEIS[(i + 1) % n]; return `<a href="imovel-${a.ref}.html"><span class="mono">Anterior · ${a.ref}</span><b>${esc(a.titulo)}</b><span class="mono">${esc(onde(a))} · ${precoTxt(a)}</span></a><a href="imovel-${p.ref}.html"><span class="mono">Próximo · ${p.ref}</span><b>${esc(p.titulo)}</b><span class="mono">${esc(onde(p))} · ${precoTxt(p)}</span></a>`; })()}</nav>`
  });
}

// ---------- páginas institucionais ----------
const sobre = pagina({
  arquivo: "sobre.html", titulo: "A Kiesel · Imobiliária em São Martinho/RS desde o balcão da Avenida",
  desc: "Kiesel Negócios Imobiliários (Kipper Kiesel Ltda), CRECI 45.125/RS. Corretagem de casas, terrenos, chácaras e salas em São Martinho e região.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / A Kiesel</div><h1 class="mask">Respeito e <span class="ital">confiança,</span> negócio a negócio.</h1><p>A Kiesel Negócios Imobiliários é o escritório de corretagem de São Martinho, no noroeste gaúcho, registrado no CRECI sob o nº 45.125/RS.</p></div></section>
<section class="secao">
  <div class="miolo">
    <div class="manifesto">
      <div><p class="grande mask">Quem vende uma casa em São Martinho vende também <em>uma rua, uma vizinhança e uma história.</em></p><div class="quadro rv quadro-mapa"><iframe title="Mapa: escritório da Kiesel, Avenida Getúlio Vargas, Centro, São Martinho" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox=-53.9780%2C-27.7150%2C-53.9530%2C-27.7010&layer=mapnik&marker=-27.70806%2C-53.96561"></iframe><span class="selo-mapa"><img src="assets/logo-kiesel-hd.png" width="1290" height="500" alt="" loading="lazy"><b>Av. Getúlio Vargas, Centro</b><span>São Martinho/RS · CRECI 45.125/RS</span></span></div><img class="rv" src="assets/logo-kiesel-hd.png" width="1290" height="500" alt="Logotipo Kiesel Negócios Imobiliários" style="margin-top:28px;max-width:260px;height:auto" loading="lazy"></div>
      <div>
        <p class="rv">A Kiesel trabalha com casas, terrenos, chácaras, áreas rurais e salas comerciais na cidade, no interior e nos municípios vizinhos. O escritório fica na Avenida Getúlio Vargas, no Centro, e o atendimento é direto com o corretor, pelo WhatsApp ou no balcão.</p>
        <p class="rv">Toda a carteira está publicada aqui com preço, fotos e descrição completa. Quem anuncia com a Kiesel recebe avaliação do valor de mercado, fotos do imóvel, divulgação neste site e no Facebook, e acompanhamento das visitas até a escritura.</p>
        <p class="rv">O lema da casa resume o jeito de trabalhar: por trás de cada negócio, uma história de respeito e confiança.</p>
        <p class="assin rv">Kipper Kiesel Ltda · CRECI 45.125/RS</p>
      </div>
    </div>
    <div class="valores" data-stagger>
      <div class="valor rv"><i>Da cidade</i><h3>Conhece cada quadra</h3><p>Sabe o histórico dos imóveis, quem é vizinho de quem e o que cada bairro oferece.</p></div>
      <div class="valor rv"><i>Registrada</i><h3>CRECI 45.125/RS</h3><p>Corretagem regular, com contrato, documentação conferida e orientação em cada etapa.</p></div>
      <div class="valor rv"><i>Direta</i><h3>Preço na vitrine</h3><p>Nenhum imóvel "sob consulta". Valor, fotos e descrição de tudo o que está disponível.</p></div>
    </div>
  </div>
</section>
<section class="chamada"><div class="miolo"><h2 class="rv">Vamos <em>conversar?</em></h2><div class="acoes rv"><a class="btn btn-ouro" href="contato.html">Endereço e contato ${ico.seta}</a><a class="btn btn-contorno" href="imoveis.html">Ver os imóveis</a></div></div></section>`
});

const contato = pagina({
  arquivo: "contato.html", titulo: "Contato · Imobiliária Kiesel, Av. Getúlio Vargas, São Martinho/RS",
  desc: "Fale com a Kiesel pelo WhatsApp (55) 99947-9495 ou visite o escritório na Avenida Getúlio Vargas, Centro, São Martinho/RS, CEP 98690-000.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Contato</div><h1 class="mask">Na Avenida, <span class="ital">ou no seu celular.</span></h1><p>O atendimento é direto com o corretor. Mande mensagem a qualquer hora ou passe no escritório, no Centro de São Martinho.</p></div></section>
<section class="secao">
  <div class="miolo">
    <div class="contato">
      <div data-stagger>
        <div class="dado rv"><b>WhatsApp e telefone</b><a href="https://wa.me/5555999479495" target="_blank" rel="noopener" class="num">(55) 99947-9495</a><a href="https://wa.me/5555996298532" target="_blank" rel="noopener" class="num">(55) 99629-8532</a></div>
        <div class="dado rv"><b>Endereço</b><a href="https://www.openstreetmap.org/?mlat=-27.70806&mlon=-53.96561#map=17/-27.70806/-53.96561" target="_blank" rel="noopener">Av. Getúlio Vargas, Centro<br>São Martinho, RS · CEP 98690-000</a></div>
        <div class="dado rv"><b>Redes</b><a href="https://www.facebook.com/imobiliariakiesel" target="_blank" rel="noopener">facebook.com/imobiliariakiesel</a></div>
        <div class="dado rv"><b>Registro</b><span style="font-size:clamp(20px,2vw,26px);font-weight:600;color:var(--marinho)">Kipper Kiesel Ltda · CRECI 45.125/RS</span></div>
        <form class="form rv" id="form-contato" style="margin-top:30px">
          <h3 style="font-size:24px">Mande uma mensagem</h3>
          <div class="duas"><div class="campo"><label for="ct-nome">Seu nome</label><input class="ent" id="ct-nome" required autocomplete="name"></div><div class="campo"><label for="ct-fone">Telefone</label><input class="ent" id="ct-fone" type="tel" autocomplete="tel"></div></div>
          <div class="campo"><label for="ct-msg">Mensagem</label><textarea class="ent" id="ct-msg" placeholder="Quero informações sobre…"></textarea></div>
          <button class="btn btn-zap" type="submit">${ico.zap}Enviar pelo WhatsApp</button>
          <p class="nota">A mensagem abre no seu WhatsApp, pronta para enviar. Nenhum dado fica guardado neste site.</p>
        </form>
      </div>
      <div class="mapa mask"><iframe title="Mapa: Avenida Getúlio Vargas, Centro, São Martinho" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox=-53.9780%2C-27.7150%2C-53.9530%2C-27.7010&layer=mapnik&marker=-27.70806%2C-53.96561"></iframe></div>
    </div>
  </div>
</section>`
});

const financiamento = pagina({
  arquivo: "financiamento.html", titulo: "Simulador de financiamento · Imobiliária Kiesel",
  desc: "Descubra quanto cabe no seu bolso e compare parcelas Price e SAC antes de visitar. Simulação transparente, sem cadastro.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Financiamento</div><h1 class="mask">Quanto cabe <span class="ital">no seu bolso?</span></h1><p>Duas contas simples antes de visitar: o valor de imóvel compatível com a sua renda e a parcela de um financiamento, pelas tabelas Price e SAC.</p></div></section>
<section class="secao">
  <div class="miolo">
    <div class="duas-col">
      <form class="form rv" id="form-bolso" onsubmit="return false">
        <h3 style="font-size:24px">Cabe no bolso</h3>
        <p class="nota">Os bancos costumam limitar a parcela a 30% da renda bruta familiar. Com entrada de 20% e 360 meses, este é o valor de imóvel que essa parcela paga.</p>
        <div class="campo"><label for="bolso-renda">Renda bruta familiar (R$ por mês)</label><input class="ent num" id="bolso-renda" type="number" min="500" step="100" value="6000" inputmode="numeric"></div>
        <div class="campo"><label for="bolso-juros">Juros ao ano (%)</label><input class="ent num" id="bolso-juros" type="number" min="1" max="30" step="0.1" value="11" inputmode="decimal"></div>
        <div class="resultado"><span class="rotulo">Imóvel de até</span><b class="grande num" id="bolso-valor">R$ 0</b><small id="bolso-parcela">parcela de R$ 0 por mês</small></div>
        <p class="nota">Estimativa para orientar a busca. O banco define o valor final conforme análise de crédito.</p>
      </form>
      <form class="form rv" id="form-fin" onsubmit="return false">
        <h3 style="font-size:24px">Parcela do financiamento</h3>
        <div class="campo"><label for="fin-valor">Valor do imóvel (R$)</label><input class="ent num" id="fin-valor" type="number" min="20000" step="1000" value="420000" inputmode="numeric"></div>
        <div class="campo"><label for="fin-entrada">Entrada: <b class="num" id="fin-entrada-v">20%</b></label><input class="faixa" id="fin-entrada" type="range" min="10" max="90" step="5" value="20"></div>
        <div class="duas"><div class="campo"><label for="fin-juros">Juros ao ano (%)</label><input class="ent num" id="fin-juros" type="number" min="1" max="30" step="0.1" value="11" inputmode="decimal"></div><div class="campo"><label for="fin-prazo">Prazo (meses)</label><select class="sel num" id="fin-prazo"><option>120</option><option>180</option><option>240</option><option>300</option><option selected>360</option><option>420</option></select></div></div>
        <div class="resultado"><span class="rotulo">Price × SAC (1ª parcela)</span><b class="grande num" id="fin-parcela" style="font-size:26px">R$ 0 × R$ 0</b><small id="fin-financiado">financiando R$ 0</small></div>
        <table class="tabela num" aria-label="Comparação Price e SAC"><thead><tr><th>Sistema</th><th>1ª parcela</th><th>Última</th><th>Total pago</th></tr></thead><tbody id="fin-tabela"></tbody></table>
        <p class="nota">Juros simulados; a taxa real depende do banco, do seu perfil e do programa (SBPE, Minha Casa Minha Vida). Não inclui seguros e tarifas.</p>
      </form>
    </div>
  </div>
</section>
<section class="chamada"><div class="miolo"><h2 class="rv">Fechou a conta? <em>Veja os imóveis</em> nessa faixa.</h2><div class="acoes rv"><a class="btn btn-ouro" href="imoveis.html" id="fin-ver">Ver imóveis ${ico.seta}</a><a class="btn btn-contorno" href="${zapMsg("Olá, fiz uma simulação no site da Kiesel e quero orientação sobre financiamento.")}" target="_blank" rel="noopener">${ico.zap}Falar sobre financiamento</a></div></div></section>`
});

const anuncie = pagina({
  arquivo: "anuncie.html", titulo: "Anuncie seu imóvel · Imobiliária Kiesel",
  desc: "Venda ou alugue seu imóvel em São Martinho com a Kiesel: avaliação, fotos, divulgação neste site e no Facebook e acompanhamento até a escritura.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Anuncie</div><h1 class="mask">Seu imóvel, <span class="ital">bem apresentado.</span></h1><p>Avaliação de mercado, fotos, anúncio neste site e no Facebook, visitas acompanhadas e documentação conferida. Você só fala com a Kiesel.</p></div></section>
<section class="secao">
  <div class="miolo">
    <div class="duas-col">
      <div>
        <div class="valores" data-stagger style="margin-top:0;grid-template-columns:1fr">
          <div class="valor rv"><i class="num">01</i><h3>Avaliação honesta</h3><p>Preço compatível com o que a cidade paga hoje, comparado com a carteira e com os negócios recentes.</p></div>
          <div class="valor rv"><i class="num">02</i><h3>Fotos e anúncio completo</h3><p>Ficha com todas as fotos, descrição, características e preço visível, igual às que você vê neste site.</p></div>
          <div class="valor rv"><i class="num">03</i><h3>Divulgação onde o comprador está</h3><p>Este site, o Facebook da imobiliária e a lista de clientes que já encomendaram um imóvel como o seu.</p></div>
        </div>
      </div>
      <form class="form rv" id="form-anuncie">
        <h3 style="font-size:24px">Conte sobre o imóvel</h3>
        <div class="duas"><div class="campo"><label for="an-nome">Seu nome</label><input class="ent" id="an-nome" required autocomplete="name"></div><div class="campo"><label for="an-fone">Telefone</label><input class="ent" id="an-fone" type="tel" autocomplete="tel"></div></div>
        <div class="duas"><div class="campo"><label for="an-tipo">Tipo</label><select class="sel" id="an-tipo"><option>Casa</option><option>Terreno</option><option>Chácara</option><option>Área rural</option><option>Apartamento</option><option>Sala comercial</option><option>Prédio</option></select></div><div class="campo"><label for="an-fin">Quero</label><select class="sel" id="an-fin"><option>Vender</option><option>Alugar</option></select></div></div>
        <div class="campo"><label for="an-end">Bairro ou endereço</label><input class="ent" id="an-end" placeholder="Centro, Rua…"></div>
        <div class="campo"><label for="an-obs">Detalhes</label><textarea class="ent" id="an-obs" placeholder="Quartos, área, estado, valor pretendido…"></textarea></div>
        <button class="btn btn-zap" type="submit">${ico.zap}Enviar pelo WhatsApp</button>
        <p class="nota">A mensagem abre no seu WhatsApp, pronta para enviar.</p>
      </form>
    </div>
  </div>
</section>`
});

const encomende = pagina({
  arquivo: "encomende.html", titulo: "Encomende um imóvel · Imobiliária Kiesel",
  desc: "Diga o que procura em São Martinho e região. A Kiesel busca na carteira e avisa quando entrar um imóvel com o seu perfil.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Encomende</div><h1 class="mask">Diga o que procura. <span class="ital">A Kiesel acha.</span></h1><p>Nem todo imóvel chega ao site no dia em que o dono decide vender. Deixe o seu pedido e você é avisado antes.</p></div></section>
<section class="secao">
  <div class="miolo">
    <div class="duas-col">
      <form class="form rv" id="form-enc">
        <h3 style="font-size:24px">O que você procura</h3>
        <div class="duas"><div class="campo"><label for="enc-nome">Seu nome</label><input class="ent" id="enc-nome" required autocomplete="name"></div><div class="campo"><label for="enc-fone">Telefone</label><input class="ent" id="enc-fone" type="tel" autocomplete="tel"></div></div>
        <div class="duas"><div class="campo"><label for="enc-tipo">Tipo</label><select class="sel" id="enc-tipo"><option>Casa</option><option>Terreno</option><option>Chácara</option><option>Área rural</option><option>Sala comercial</option><option>Qualquer</option></select></div><div class="campo"><label for="enc-fin">Para</label><select class="sel" id="enc-fin"><option>Comprar</option><option>Alugar</option></select></div></div>
        <div class="duas"><div class="campo"><label for="enc-bairro">Bairro preferido</label><input class="ent" id="enc-bairro" placeholder="Centro, Novo, interior…"></div><div class="campo"><label for="enc-valor">Até quanto (R$)</label><input class="ent num" id="enc-valor" type="number" min="0" step="10000" inputmode="numeric"></div></div>
        <div class="campo"><label for="enc-obs">Detalhes</label><textarea class="ent" id="enc-obs" placeholder="Quartos, garagem, piscina, prazo…"></textarea></div>
        <button class="btn btn-zap" type="submit">${ico.zap}Enviar pelo WhatsApp</button>
        <p class="nota">A mensagem abre no seu WhatsApp, pronta para enviar.</p>
      </form>
      <div class="manifesto" style="grid-template-columns:1fr"><p class="grande mask">A carteira muda toda semana. <em>Quem encomenda, vê primeiro.</em></p><p class="rv">Enquanto isso, <a href="imoveis.html">o catálogo completo</a> está aberto, com preço e fotos de tudo o que está disponível hoje.</p></div>
    </div>
  </div>
</section>`
});

const privacidade = pagina({
  arquivo: "privacidade.html", titulo: "Privacidade · Imobiliária Kiesel",
  desc: "Como este site trata os seus dados.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Privacidade</div><h1 class="mask">Privacidade.</h1><p>Este site foi feito para ser simples também nisso.</p></div></section>
<section class="secao"><div class="miolo"><div class="manifesto" style="grid-template-columns:1fr;max-width:72ch">
<p class="rv">Este site não tem cadastro, não usa cookies de rastreamento nem ferramentas de publicidade. Os formulários não enviam nada para um servidor: eles montam uma mensagem e abrem o seu WhatsApp, e só você decide se envia.</p>
<p class="rv">A lista de favoritos fica guardada apenas no seu navegador (armazenamento local) e pode ser apagada limpando os dados do site. O mapa da página de contato é carregado do OpenStreetMap, que pode registrar o seu acesso conforme a política de privacidade dele.</p>
<p class="rv">Ao conversar pelo WhatsApp, os seus dados são tratados pela Kiesel Negócios Imobiliários (Kipper Kiesel Ltda, CRECI 45.125/RS) somente para o atendimento solicitado, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Para pedir acesso, correção ou exclusão, fale pelo (55) 99947-9495.</p>
</div></div></section>`
});

// ---------- grava ----------
const saida = { "index.html": home, "imoveis.html": catalogo, "sobre.html": sobre, "contato.html": contato, "financiamento.html": financiamento, "anuncie.html": anuncie, "encomende.html": encomende, "privacidade.html": privacidade };
for (const x of IMOVEIS) saida[`imovel-${x.ref}.html`] = paginaImovel(x);
for (const [n, h] of Object.entries(saida)) fs.writeFileSync(path.join(RAIZ, n), h);
console.log("gerado:", Object.keys(saida).length, "páginas");
