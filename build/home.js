// Corpo da página inicial (v3). Recebe os ajudantes do build.js.
module.exports = function (H) {
  const { IMOVEIS, esc, num, preco, precoTxt, onde, foto, capa, card, peca, ico, zapMsg, listaBairros, cont, recentes, porRef } = H;
  const heroiRefs = [["CA0036", "CA0036-03"], ["CA0044", "CA0044-02"], ["CH0005", "CH0005-01"], ["CH0002", "CH0002-03"]];
  const heroi = heroiRefs.map(([r, f]) => ({ x: porRef(r), f }));
  const selecao = ["CA0044", "CA0036", "CH0005", "CA0035", "CA0047", "CH0002"].map(porRef);
  const titulo = "Um lugar em São Martinho para chamar de seu.";
  const palavras = titulo.split(" ").map(p => `<span class="w"><span>${p}</span></span>`).join(" ");
  const afirma = `A Kiesel tem ${IMOVEIS.length} imóveis à venda e para alugar em São Martinho e região, com um corretor que conhece cada rua da cidade e o histórico de cada casa.`;
  const bairroFoto = b => { const y = IMOVEIS.find(x => x.bairro === b && x.tipo === "Casa") || IMOVEIS.find(x => x.bairro === b); return foto(capa(y), "p"); };
  return `
<div class="pre" id="pre" aria-hidden="true">
  <div class="pre-nome"><img src="assets/logo-topo.png" alt="" width="391" height="190" style="height:44px;width:auto"><span class="mono">Kiesel · Negócios Imobiliários</span></div>
  <div class="pre-num num" id="pre-conta">0</div>
  <div class="pre-linha"><i id="pre-barra"></i></div>
  <div class="pre-rot mono"><span>São Martinho, RS</span><span>CRECI 45.125/RS</span></div>
</div>
<section class="heroi" id="heroi">
  <div class="heroi-fotos" id="heroi-fotos">${heroi.map((h, i) => `<div class="foto${i === 0 ? " ativa" : ""}" data-ref="${h.x.ref}"><img src="${foto(h.f)}" width="1280" height="720" alt="${esc(h.x.titulo)} em ${esc(h.x.bairro)}"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}></div>`).join("")}</div>
  <div class="heroi-veu"></div>
  <div class="heroi-miolo">
    <div>
      <h1>${palavras}</h1>
      <p class="sub">Por trás de cada negócio, uma história de respeito e confiança. Casas, terrenos, chácaras e salas comerciais em São Martinho e região.</p>
      <div class="acoes"><a class="btn btn-papel" href="imoveis.html">Ver os ${IMOVEIS.length} imóveis <span class="seta">${ico.seta}</span></a><a class="btn btn-contorno" href="anuncie.html">Anunciar o meu</a></div>
    </div>
    <div class="heroi-hud">
      <div class="atual" id="heroi-atual" aria-live="polite">${heroi.map((h, i) => `<a href="imovel-${h.x.ref}.html" data-i="${i}"${i ? " hidden" : ""} style="text-decoration:none;display:grid;gap:4px"><b>${esc(h.x.titulo)}</b><span>${esc(onde(h.x))} · ${precoTxt(h.x)}</span><span>${h.x.ref} · ${String(i + 1).padStart(2, "0")} / ${String(heroi.length).padStart(2, "0")}</span></a>`).join("")}</div>
      <div class="barras" id="heroi-barras">${heroi.map((h, i) => `<i${i === 0 ? ' class="ativa"' : ""}></i>`).join("")}</div>
    </div>
  </div>
  <div class="heroi-rolar" aria-hidden="true"><span>Rolar</span><i></i></div>
</section>
<section class="busca-painel" aria-label="Buscar imóvel">
  <div class="miolo">
    <form class="busca" id="form-busca" action="imoveis.html" method="get">
      <div class="alterna" role="group" aria-label="Finalidade"><input type="hidden" name="fin" id="b-fin" value="comprar"><button type="button" data-fin="comprar" aria-pressed="true">Comprar</button><button type="button" data-fin="alugar" aria-pressed="false">Alugar</button></div>
      <div class="campo"><label for="b-tipo">Tipo</label><select class="sel" id="b-tipo" name="tipo"><option value="">Todos os tipos</option>${["Casa", "Terreno", "Chácara", "Área rural", "Prédio", "Sala comercial"].map(t => `<option>${t}</option>`).join("")}</select></div>
      <div class="campo"><label for="b-bairro">Bairro</label><select class="sel" id="b-bairro" name="bairro"><option value="">Todos os bairros</option>${listaBairros.map(([k]) => { const [b, c] = k.split("|"); return `<option value="${esc(b)}">${esc(b)} · ${esc(c)}</option>`; }).join("")}</select></div>
      <div class="campo"><label for="b-quartos">Quartos</label><select class="sel" id="b-quartos" name="quartos"><option value="">Qualquer</option><option value="1">1 ou mais</option><option value="2">2 ou mais</option><option value="3">3 ou mais</option><option value="4">4 ou mais</option></select></div>
      <button class="btn btn-tinta" type="submit">Buscar <span class="seta">${ico.seta}</span></button>
    </form>
  </div>
</section>
<section class="afirma" id="afirma">
  <div class="miolo">
    <p class="texto" id="afirma-texto">${afirma.split(" ").map(p => `<span class="pal">${esc(p)}</span>`).join("")}</p>
    <div class="fatos">
      <div class="fato rv"><b class="num" data-n="${IMOVEIS.length}">0</b><span class="mono">imóveis na carteira</span></div>
      <div class="fato rv"><b class="num" data-n="${cont("Casa")}">0</b><span class="mono">casas à venda</span></div>
      <div class="fato rv"><b class="num" data-n="${cont("Terreno") + cont("Chácara") + cont("Área rural")}">0</b><span class="mono">terrenos, chácaras e áreas</span></div>
    </div>
  </div>
</section>
<section class="selecao" id="selecao">
  <div class="selecao-pin" id="selecao-pin">
    <div class="selecao-topo"><div><span class="mono">01 — Seleção</span><h2>Os imóveis que definem a cidade.</h2></div><a class="btn btn-contorno" href="imoveis.html">Catálogo completo <span class="seta">${ico.seta}</span></a></div>
    <div class="trilho-h" id="trilho-h">${selecao.map((x, i) => peca(x, i)).join("")}</div>
    <div class="selecao-fim"><span class="mono">${selecao.length} imóveis escolhidos pela equipe</span><div class="prog"><i id="selecao-prog"></i></div><span class="mono" id="selecao-cont">01 / ${String(selecao.length).padStart(2, "0")}</span></div>
  </div>
</section>
<div class="marquee" aria-hidden="true"><div class="trilho">${[0, 1].map(() => listaBairros.map(([k, n]) => { const [b, c] = k.split("|"); return `<span>${esc(b)}, ${esc(c)}<em>${n} ${n > 1 ? "imóveis" : "imóvel"}</em></span>`; }).join("")).join("")}</div></div>
<section class="secao" id="recentes">
  <div class="miolo">
    <div class="cabeca"><div><span class="mono rv">02 — Carteira</span><h2 class="rv">Atualizados recentemente.</h2></div><a class="btn btn-contorno rv" href="imoveis.html">Ver todos os ${IMOVEIS.length} <span class="seta">${ico.seta}</span></a></div>
    <div class="vitrine" data-stagger>${recentes.map(x => card(x)).join("")}</div>
  </div>
</section>
<section class="secao" id="bairros">
  <div class="miolo">
    <div class="cabeca"><div><span class="mono rv">03 — Onde</span><h2 class="rv">Cada bairro, um jeito de morar.</h2></div><p class="rv">Do Centro às chácaras do interior, a carteira cobre São Martinho inteira e o município vizinho de Sede Nova. Passe o mouse para ver.</p></div>
    <div class="bairros" data-stagger>${listaBairros.map(([k, n], i) => { const [b, c] = k.split("|"); return `<a class="bairro rv" href="imoveis.html?bairro=${encodeURIComponent(b)}" data-foto="${bairroFoto(b)}"><span class="n num">${String(i + 1).padStart(2, "0")}</span><b>${esc(b)}</b><span class="mono">${esc(c)} · ${n} ${n > 1 ? "imóveis" : "imóvel"}</span></a>`; }).join("")}</div>
  </div>
</section>
<section class="secao" id="como">
  <div class="miolo">
    <div class="cabeca"><div><span class="mono rv">04 — Processo</span><h2 class="rv">Sem surpresa, do primeiro contato à escritura.</h2></div></div>
    <div class="pilha" id="pilha">
      <div class="cartao"><span class="n">01</span><h3>Conversa</h3><div><p>Você conta o que procura ou o que quer vender. A Kiesel responde pelo WhatsApp, sem formulário intermediário nem central de atendimento.</p><div class="mini"><span>WhatsApp</span><span>Balcão na Avenida</span></div></div></div>
      <div class="cartao"><span class="n">02</span><h3>Visita</h3><div><p>Visita acompanhada pelo corretor, que conhece o imóvel, a vizinhança e o histórico de cada quadra. Você vê o que a foto não mostra.</p><div class="mini"><span>Agenda flexível</span><span>Corretor presente</span></div></div></div>
      <div class="cartao"><span class="n">03</span><h3>Proposta, financiamento e escritura</h3><div><p>Negociação direta com o proprietário, orientação para financiar e documentação conferida até a assinatura. Simule aqui no site antes de visitar.</p><div class="mini"><span>Price e SAC</span><span>Documentação conferida</span></div></div></div>
    </div>
  </div>
</section>
<section class="secao" id="sobre-breve" style="padding-top:0">
  <div class="miolo">
    <div class="manifesto">
      <div><p class="grande mask">A imobiliária <em>da cidade</em>, registrada no CRECI sob o nº 45.125/RS.</p><div class="quadro rv"><img src="${foto("CH0007-02")}" width="1280" height="720" alt="Chácara no Centro de São Martinho" loading="lazy" decoding="async" data-parallax="6"></div></div>
      <div><p class="rv">A Kiesel Negócios Imobiliários atende São Martinho, o interior e os municípios vizinhos com casas, terrenos, chácaras, áreas rurais e salas comerciais. O escritório fica na Avenida Getúlio Vargas, no Centro.</p><p class="rv">Toda a carteira está neste site com preço, fotos e descrição. Não há imóvel escondido: o que você vê aqui é o que está disponível.</p><p class="rv" style="margin-top:28px"><a class="btn btn-contorno" href="sobre.html">Conheça a Kiesel <span class="seta">${ico.seta}</span></a></p></div>
    </div>
  </div>
</section>
<section class="chamada">
  <div class="miolo">
    <h2 class="rv">Não achou? <em>A Kiesel procura</em> para você.</h2>
    <div class="acoes rv"><a class="btn btn-papel" href="encomende.html">Encomendar um imóvel <span class="seta">${ico.seta}</span></a><a class="btn btn-contorno" href="${zapMsg("Olá, vi o site da Kiesel e quero conversar sobre um imóvel.")}" target="_blank" rel="noopener">${ico.zap}Chamar no WhatsApp</a></div>
  </div>
</section>`;
};
