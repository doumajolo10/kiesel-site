// Gera as páginas do site da Kiesel a partir de dados.js (que o build/puxa.js atualiza com o painel). Rodar: node build/build.js
// Os modelos das páginas de imóveis ficam em modelo.js, o mesmo arquivo que o navegador usa para mostrar mudanças do painel na hora.
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const M = require(path.join(RAIZ, "modelo.js"));
const w = {}; global.window = w; require(path.join(RAIZ, "dados.js"));
const IMOVEIS = M.ordena(w.IMOVEIS.map(M.normaliza));
const { SITE, esc, num, precoTxt, onde, zapMsg, foto, capa, ico } = M;

// ---------- pedaços comuns ----------
const PAGS = [["index.html", "Início"], ["imoveis.html", "Imóveis"], ["financiamento.html", "Financiamento"], ["anuncie.html", "Anuncie"], ["sobre.html", "Imobiliária Kiesel"], ["contato.html", "Contato"]];
function topo(atual) {
  return `<a class="pular so-leitor" href="#conteudo">Ir para o conteúdo</a>
<div class="faixa-topo"><div class="miolo"><div><span>Av. Getúlio Vargas, Centro · São Martinho/RS</span><span>CRECI 45.125/RS</span></div><div><span><a href="https://wa.me/5555996298532" target="_blank" rel="noopener">(55) 99629-8532</a></span><span><a href="tel:+5555999479495">(55) 99947-9495</a></span></div></div></div>
<header class="topo" id="topo">
  <a class="marca" href="index.html" aria-label="Kiesel Negócios Imobiliários, início"><img src="assets/logo-topo.png" width="391" height="190" alt="Kiesel Negócios Imobiliários" decoding="async"></a>
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
  <div class="rod">Av. Getúlio Vargas, Centro · São Martinho/RS<br>(55) 99629-8532 · CRECI 45.125/RS</div>
</nav>`;
}
function rodape() {
  return `<footer class="rodape">
  <div class="miolo">
    <div class="colunas">
      <div><span class="logo-rod"><img src="assets/logo-topo.png" width="391" height="190" alt="Kiesel Negócios Imobiliários" loading="lazy"></span><p>Kipper Kiesel Ltda · CRECI 45.125/RS<br>CNPJ 19.758.552/0001-91<br>Av. Getúlio Vargas, Centro<br>São Martinho, RS · CEP 98690-000</p><div class="hud" style="margin-top:18px"><span>Imóveis publicados · <b class="num">${IMOVEIS.length}</b></span></div></div>
      <div><h4>Imóveis</h4><a href="imoveis.html?tipo=Casa">Casas</a><a href="imoveis.html?tipo=Terreno">Terrenos</a><a href="imoveis.html?tipo=Ch%C3%A1cara">Chácaras e áreas</a><a href="imoveis.html?fin=alugar">Para alugar</a><a href="imoveis.html?fin=favoritos">Meus favoritos</a></div>
      <div><h4>A Imobiliária Kiesel</h4><a href="sobre.html">Quem somos</a><a href="financiamento.html">Financiamento</a><a href="anuncie.html">Anuncie seu imóvel</a><a href="encomende.html">Encomende um imóvel</a><a href="privacidade.html">Privacidade</a></div>
      <div><h4>Contato</h4><a href="https://wa.me/5555996298532" target="_blank" rel="noopener">(55) 99629-8532</a><a href="tel:+5555999479495">(55) 99947-9495</a><a href="https://www.facebook.com/imobiliariakiesel" target="_blank" rel="noopener">facebook.com/imobiliariakiesel</a><a href="contato.html">Como chegar</a></div>
    </div>
    <div class="fim"><span>© ${new Date().getFullYear()} Kiesel Negócios Imobiliários. Todos os direitos reservados.</span><span>Valores sujeitos a alteração sem aviso. Fotos dos imóveis são do acervo da imobiliária.</span></div>
  </div>
</footer>
<div class="barra-zap"><a class="btn btn-zap" href="${zapMsg("Olá, vi o site da Kiesel e quero conversar sobre um imóvel.")}" target="_blank" rel="noopener">${ico.zap}Falar com a Imobiliária Kiesel</a></div>
<div class="aviso" id="aviso" role="status" aria-live="polite"></div>
<div class="grao" aria-hidden="true"></div>
<div class="cortina" id="cortina" aria-hidden="true"></div>
<div class="bairro-foto" id="bairro-foto" aria-hidden="true"><img alt="" src="" width="260" height="195"></div>
<div class="cursor" aria-hidden="true"></div><div class="cursor-rotulo" id="cursor-rotulo" aria-hidden="true"><span>Ver imóvel</span></div>`;
}
// endereço oficial de cada página no domínio (cleanUrls: sem .html; a capa é a raiz)
const endereco = arquivo => SITE + "/" + (arquivo === "index.html" ? "" : arquivo.replace(/.html$/, ""));
function pagina({ arquivo, titulo, desc, corpo, jsonld, escuro, extraHead = "", atual, vivo = false }) {
  return `<!doctype html>
<html lang="pt-BR" class="sem-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#F4F2ED">
${arquivo === "imovel.html" ? "" : `<link rel="canonical" href="${endereco(arquivo)}"><meta property="og:url" content="${endereco(arquivo)}">`}
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
${M.ajusta(corpo)}
</main>
${rodape()}
<script src="dados.js" defer></script>${vivo ? `
<script src="modelo.js" defer></script>
<script src="vivo.js" defer></script>` : ""}
<script src="assets/vendor/gsap-3.13.0.min.js" integrity="sha384-HOvlOYPIs/zjoIkWUGXkVmXsjr8GuZLV+Q+rcPwmJOVZVpvTSXQChiN4t9Euv9Vc" defer></script>
<script src="assets/vendor/ScrollTrigger-3.13.0.min.js" integrity="sha384-P8VzCVnT9NBUkMrpcIZrJbA7EBjJvh/fJS6PmP+4nLIM284DtsImIv8D0fFjIkeh" defer></script>
<script src="assets/vendor/lenis-1.3.1.min.js" integrity="sha384-HOhEGwtEOoOqYLe/uKOml49IX3btH2saMNoBxmhl7d8YdSk1Z6UIQpJ20copTA6J" defer></script>
<script src="app.js" defer></script>
</body>
</html>`;
}


// ---------- páginas de imóveis (modelos em modelo.js) ----------
const ctx = M.contexto(IMOVEIS);
const home = pagina({
  arquivo: "index.html", vivo: true,
  titulo: "Imobiliária Kiesel · Casas, terrenos e chácaras em São Martinho/RS",
  desc: `Kiesel Negócios Imobiliários, CRECI 45.125/RS. ${IMOVEIS.length} imóveis à venda e para alugar em São Martinho e região, com atendimento direto pelo WhatsApp.`,
  jsonld: { "@context": "https://schema.org", "@type": "RealEstateAgent", name: "Kiesel Negócios Imobiliários", legalName: "Kipper Kiesel Ltda", foundingDate: "2014-02-20", slogan: "A primeira imobiliária da cidade, com tradição, experiência e compromisso em cada negócio", taxID: "19.758.552/0001-91", url: SITE + "/", telephone: "+55 55 99629-8532", address: { "@type": "PostalAddress", streetAddress: "Avenida Getúlio Vargas, 873, sala 02", addressLocality: "São Martinho", addressRegion: "RS", postalCode: "98690-000", addressCountry: "BR" }, sameAs: ["https://www.facebook.com/imobiliariakiesel"], identifier: { "@type": "PropertyValue", name: "CRECI", value: "45.125/RS" } },
  extraHead: `<link rel="preload" as="image" href="assets/video/heroi-poster.webp" imagesrcset="assets/video/heroi-poster-p.webp 960w, assets/video/heroi-poster.webp 1920w" imagesizes="(max-width:900px) 100vw, 1360px" fetchpriority="high">`,
  corpo: M.corpoHome(IMOVEIS)
});
const catalogo = pagina({
  arquivo: "imoveis.html", vivo: true,
  titulo: "Imóveis à venda e para alugar em São Martinho · Imobiliária Kiesel",
  desc: `Catálogo completo da Kiesel: ${IMOVEIS.length} casas, terrenos, chácaras, áreas e salas comerciais em São Martinho/RS e região, com preço e fotos.`,
  corpo: M.corpoCatalogo(IMOVEIS)
});
function paginaImovel(x) {
  const fotos = x.fotos, meta = M.metaImovel(x);
  return pagina({
    arquivo: `imovel-${x.ref}.html`, atual: "imoveis.html", vivo: true,
    titulo: meta.titulo, desc: meta.desc,
    jsonld: { "@context": "https://schema.org", "@type": "RealEstateListing", name: x.titulo, url: `${SITE}/imovel-${x.ref}.html`, datePosted: x.atualizado, image: fotos.slice(0, 5).map(f => /^https?:/.test(f) ? f : `${SITE}/${foto(f)}`), offers: { "@type": "Offer", price: x.preco, priceCurrency: "BRL", availability: "https://schema.org/InStock" }, address: { "@type": "PostalAddress", addressLocality: x.cidade, addressRegion: x.uf || "RS", addressCountry: "BR" } },
    extraHead: fotos[0] ? `<link rel="preload" href="${foto(fotos[0])}" as="image">` : "",
    corpo: M.corpoImovel(x, IMOVEIS)
  });
}
// página-molde: atende imóveis cadastrados no painel depois do último build (vercel.json manda /imovel-XXXX para cá)
const molde = pagina({
  arquivo: "imovel.html", atual: "imoveis.html", vivo: true,
  titulo: "Imóvel · Imobiliária Kiesel",
  desc: "Imóvel da carteira da Kiesel Negócios Imobiliários em São Martinho/RS.",
  extraHead: '<meta name="robots" content="noindex">',
  corpo: `<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / <a href="imoveis.html">Imóveis</a></div><h1 class="mask">Carregando o imóvel…</h1><p>Só um instante.</p></div></section>`
});

// ---------- páginas institucionais ----------
const sobre = pagina({
  arquivo: "sobre.html", titulo: "Imobiliária Kiesel · A primeira imobiliária de São Martinho/RS, desde 2014",
  desc: "Kiesel Negócios Imobiliários (Kipper Kiesel Ltda), CRECI 45.125/RS. Corretagem de casas, terrenos, chácaras e salas em São Martinho e região.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Imobiliária Kiesel</div><h1 class="mask">Respeito e <span class="ital">confiança,</span> negócio a negócio.</h1><p>A Kiesel Negócios Imobiliários é o escritório de corretagem de São Martinho, no noroeste gaúcho, registrado no CRECI sob o nº 45.125/RS.</p></div></section>
<section class="secao">
  <div class="miolo">
    <div class="manifesto">
      <div><p class="grande mask">Quem vende uma casa em São Martinho vende também <em>uma rua, uma vizinhança e uma história.</em></p><div class="quadro rv quadro-mapa"><iframe title="Mapa: escritório da Kiesel, Avenida Getúlio Vargas, Centro, São Martinho" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=NEG%C3%93CIOS%20IMOBILI%C3%81RIOS%20KIESEL%2C%20S%C3%A3o%20Martinho%20-%20RS&z=17&hl=pt-BR&output=embed"></iframe><span class="selo-mapa"><img src="assets/logo-topo.png" width="391" height="190" alt="" loading="lazy"><b>Av. Getúlio Vargas, Centro</b><span>São Martinho/RS · CRECI 45.125/RS</span></span></div></div>
      <div>
        <p class="destaque-texto rv">A primeira imobiliária da cidade, com tradição, experiência e compromisso em cada negócio.</p>
        <p class="desde rv">Atuamos no mercado desde fevereiro de 2014.</p>
        <p class="rv">A Imobiliária Kiesel trabalha com casas, terrenos, chácaras, áreas rurais e salas comerciais na cidade, no interior e nos municípios vizinhos. O escritório fica na Avenida Getúlio Vargas, no Centro, e o atendimento é direto com o corretor, pelo WhatsApp ou no balcão.</p>
        <p class="rv">Toda a carteira está publicada aqui com preço, fotos e descrição completa. Quem anuncia com a Imobiliária Kiesel recebe avaliação do valor de mercado, fotos do imóvel, divulgação neste site e no Facebook, e acompanhamento das visitas até a escritura.</p>
        <p class="rv">O lema da casa resume o jeito de trabalhar: por trás de cada negócio, uma história de respeito e confiança.</p>
        <p class="assin rv">Kipper Kiesel Ltda · CNPJ 19.758.552/0001-91 · CRECI 45.125/RS</p>
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
  desc: "Fale com a Imobiliária Kiesel pelo WhatsApp (55) 99629-8532 ou visite o escritório na Avenida Getúlio Vargas, Centro, São Martinho/RS, CEP 98690-000.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Contato</div><h1 class="mask">Na Avenida, <span class="ital">ou no seu celular.</span></h1><p>O atendimento é direto com o corretor. Mande mensagem a qualquer hora ou passe no escritório, no Centro de São Martinho.</p></div></section>
<section class="secao">
  <div class="miolo">
    <div class="contato">
      <div data-stagger>
        <div class="dado rv"><b>WhatsApp e telefone</b><a href="https://wa.me/5555996298532" target="_blank" rel="noopener" class="num">(55) 99629-8532</a><a href="tel:+5555999479495" class="num">(55) 99947-9495</a></div>
        <div class="dado rv"><b>Endereço</b><a href="https://www.google.com/maps/search/?api=1&query=NEG%C3%93CIOS%20IMOBILI%C3%81RIOS%20KIESEL%2C%20S%C3%A3o%20Martinho%20-%20RS" target="_blank" rel="noopener">Av. Getúlio Vargas, Centro<br>São Martinho, RS · CEP 98690-000</a></div>
        <div class="dado rv"><b>Redes</b><a href="https://www.facebook.com/imobiliariakiesel" target="_blank" rel="noopener">facebook.com/imobiliariakiesel</a></div>
        <div class="dado rv"><b>Registro</b><span style="font-size:clamp(20px,2vw,26px);font-weight:600;color:var(--marinho)">Kipper Kiesel Ltda · CRECI 45.125/RS</span><span style="display:block;margin-top:4px;font-size:15px;color:var(--tinta-3)">CNPJ 19.758.552/0001-91</span></div>
        <form class="form rv" id="form-contato" style="margin-top:30px">
          <h3 style="font-size:24px">Mande uma mensagem</h3>
          <div class="duas"><div class="campo"><label for="ct-nome">Seu nome</label><input class="ent" id="ct-nome" required autocomplete="name"></div><div class="campo"><label for="ct-fone">Telefone</label><input class="ent" id="ct-fone" type="tel" autocomplete="tel"></div></div>
          <div class="campo"><label for="ct-msg">Mensagem</label><textarea class="ent" id="ct-msg" placeholder="Quero informações sobre…"></textarea></div>
          <button class="btn btn-zap" type="submit">${ico.zap}Enviar pelo WhatsApp</button>
          <p class="nota">A mensagem abre no seu WhatsApp, pronta para enviar. Nenhum dado fica guardado neste site.</p>
        </form>
      </div>
      <div class="mapa mask"><iframe title="Mapa: Avenida Getúlio Vargas, Centro, São Martinho" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=NEG%C3%93CIOS%20IMOBILI%C3%81RIOS%20KIESEL%2C%20S%C3%A3o%20Martinho%20-%20RS&z=17&hl=pt-BR&output=embed"></iframe></div>
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
      <form class="form rv" id="form-bolso" data-sem-envio>
        <h3 style="font-size:24px">Cabe no bolso</h3>
        <p class="nota">Os bancos costumam limitar a parcela a 30% da renda bruta familiar. Com entrada de 20% e 360 meses, este é o valor de imóvel que essa parcela paga.</p>
        <div class="campo"><label for="bolso-renda">Renda bruta familiar (R$ por mês)</label><input class="ent num" id="bolso-renda" type="number" min="500" step="100" value="6000" inputmode="numeric"></div>
        <div class="campo"><label for="bolso-juros">Juros ao ano (%)</label><input class="ent num" id="bolso-juros" type="number" min="1" max="30" step="0.1" value="11" inputmode="decimal"></div>
        <div class="resultado"><span class="rotulo">Imóvel de até</span><b class="grande num" id="bolso-valor">R$ 0</b><small id="bolso-parcela">parcela de R$ 0 por mês</small></div>
        <p class="nota">Estimativa para orientar a busca. O banco define o valor final conforme análise de crédito.</p>
      </form>
      <form class="form rv" id="form-fin" data-sem-envio>
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
  desc: "Venda ou alugue seu imóvel em São Martinho com a Imobiliária Kiesel: avaliação, fotos, divulgação neste site e no Facebook e acompanhamento até a escritura.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Anuncie</div><h1 class="mask">Seu imóvel, <span class="ital">bem apresentado.</span></h1><p>Avaliação de mercado, fotos, anúncio neste site e no Facebook, visitas acompanhadas e documentação conferida. Você só fala com a Imobiliária Kiesel.</p></div></section>
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
  desc: "Diga o que procura em São Martinho e região. A Imobiliária Kiesel busca na carteira e avisa quando entrar um imóvel com o seu perfil.",
  corpo: `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Encomende</div><h1 class="mask">Diga o que procura. <span class="ital">A Imobiliária Kiesel acha.</span></h1><p>Nem todo imóvel chega ao site no dia em que o dono decide vender. Deixe o seu pedido e você é avisado antes.</p></div></section>
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
  arquivo: "privacidade.html", titulo: "Política de privacidade · Imobiliária Kiesel",
  desc: "Como o site da Kiesel trata os seus dados, conforme a LGPD (Lei nº 13.709/2018).",
  corpo: require("./privacidade.js")()
});

// ---------- grava ----------
const saida = { "index.html": home, "imoveis.html": catalogo, "imovel.html": molde, "sobre.html": sobre, "contato.html": contato, "financiamento.html": financiamento, "anuncie.html": anuncie, "encomende.html": encomende, "privacidade.html": privacidade };
for (const x of IMOVEIS) saida[`imovel-${x.ref}.html`] = paginaImovel(x);
// páginas de imóveis que saíram da carteira: apaga (o endereço antigo cai na página-molde, que avisa "não está mais disponível")
const velhas = fs.readdirSync(RAIZ).filter(f => /^imovel-[A-Z]{2}\d{4}\.html$/.test(f) && !saida[f]);
for (const f of velhas) fs.unlinkSync(path.join(RAIZ, f));
for (const [n, h] of Object.entries(saida)) fs.writeFileSync(path.join(RAIZ, n), h);
// mapa do site e regras para robôs (o painel fica de fora do Google)
const urls = Object.keys(saida).filter(n => n !== "imovel.html").map(n => `  <url><loc>${endereco(n)}</loc></url>`);
fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(RAIZ, "robots.txt"), `User-agent: *
Allow: /
Disallow: /painel

Sitemap: ${SITE}/sitemap.xml
`);
console.log("gerado:", Object.keys(saida).length, "páginas", velhas.length ? "| removidas: " + velhas.join(", ") : "");
