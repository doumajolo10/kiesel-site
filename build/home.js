// Corpo da página inicial (v4 "portal"). Recebe os ajudantes do build.js.
module.exports = function (H) {
  const { IMOVEIS, esc, num, preco, precoTxt, onde, foto, capa, card, peca, ico, zapMsg, listaBairros, cont, recentes, porRef } = H;
  const heroiRefs = [["CA0036", "CA0036-03"], ["CA0044", "CA0044-02"], ["CH0005", "CH0005-01"], ["CH0002", "CH0002-03"]];
  const heroi = heroiRefs.map(([r, f]) => ({ x: porRef(r), f }));
  const destaques = ["CA0044", "CA0036", "CH0005", "CA0035", "CA0047", "CH0002"].map(porRef);
  const categorias = [["Casa", "Casas", "CA0047"], ["Terreno", "Terrenos", "TE0028"], ["Chácara", "Chácaras", "CH0007"], ["Área rural", "Áreas rurais", "AR0001"], ["Prédio", "Prédios", "PR0001"], ["Sala comercial", "Salas comerciais", "SA0003"]];
  const bairroFoto = b => { const y = IMOVEIS.find(x => x.bairro === b && x.tipo === "Casa") || IMOVEIS.find(x => x.bairro === b); return foto(capa(y), "p"); };
  const icoCasa = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/></svg>';
  const icoSelo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3l2.5 2 3.2-.3.6 3.1 2.7 1.7-1.3 2.9 1.3 2.9-2.7 1.7-.6 3.1-3.2-.3L12 21l-2.5-2-3.2.3-.6-3.1L3 14.5l1.3-2.9L3 8.7l2.7-1.7.6-3.1 3.2.3z"/><path d="M9 12l2 2 4-4"/></svg>';
  const icoEtiq = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>';
  return `
<div class="pre" id="pre" aria-hidden="true"><img src="assets/logo-topo.png" alt="" width="391" height="190"><span class="pre-num" id="pre-conta">0</span><i class="pre-linha"><i id="pre-barra"></i></i></div>
<section class="heroi" id="heroi">
  <div class="heroi-fotos" id="heroi-fotos">${heroi.map((h, i) => `<div class="foto${i === 0 ? " ativa" : ""}" data-ref="${h.x.ref}"><img src="${foto(h.f)}" width="1280" height="720" alt="${esc(h.x.titulo)} em ${esc(h.x.bairro)}"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}></div>`).join("")}</div>
  <div class="heroi-veu"></div>
  <div class="heroi-miolo">
    <div class="cartao-busca">
      <div><h1>Encontre seu imóvel em São Martinho e região</h1><p class="sub">${IMOVEIS.length} imóveis à venda e para alugar, com preço, fotos e atendimento direto com o corretor. CRECI 45.125/RS.</p></div>
      <form class="busca" id="form-busca" action="imoveis.html" method="get">
        <div class="alterna" role="group" aria-label="Finalidade"><input type="hidden" name="fin" id="b-fin" value="comprar"><button type="button" data-fin="comprar" aria-pressed="true">Comprar</button><button type="button" data-fin="alugar" aria-pressed="false">Alugar</button></div>
        <div class="campo"><label for="b-tipo">Tipo de imóvel</label><select class="sel" id="b-tipo" name="tipo"><option value="">Todos os tipos</option>${["Casa", "Terreno", "Chácara", "Área rural", "Prédio", "Sala comercial"].map(t => `<option>${t}</option>`).join("")}</select></div>
        <div class="campo"><label for="b-bairro">Bairro</label><select class="sel" id="b-bairro" name="bairro"><option value="">Todos os bairros</option>${listaBairros.map(([k]) => { const [b, c] = k.split("|"); return `<option value="${esc(b)}">${esc(b)} · ${esc(c)}</option>`; }).join("")}</select></div>
        <div class="campo"><label for="b-quartos">Quartos</label><select class="sel" id="b-quartos" name="quartos"><option value="">Qualquer</option><option value="1">1 ou mais</option><option value="2">2 ou mais</option><option value="3">3 ou mais</option><option value="4">4 ou mais</option></select></div>
        <button class="btn btn-azul" type="submit">Buscar imóveis <span class="seta">${ico.seta}</span></button>
      </form>
    </div>
    <div class="heroi-hud">
      <div class="atual" id="heroi-atual" aria-live="polite">${heroi.map((h, i) => `<a href="imovel-${h.x.ref}.html" data-i="${i}"${i ? " hidden" : ""}><b>${esc(h.x.titulo)}</b><span>${esc(onde(h.x))} · ${precoTxt(h.x)}</span><span>Ref. ${h.x.ref} · ver imóvel →</span></a>`).join("")}</div>
      <div class="barras" id="heroi-barras">${heroi.map((h, i) => `<i${i === 0 ? ' class="ativa"' : ""}></i>`).join("")}</div>
    </div>
  </div>
</section>
<section class="numeros" aria-label="Números da Kiesel">
  <div class="miolo">
    <div class="fato rv"><b class="num" data-n="${IMOVEIS.length}">0</b><span>imóveis publicados hoje</span></div>
    <div class="fato rv"><b class="num" data-n="${cont("Casa")}">0</b><span>casas à venda</span></div>
    <div class="fato rv"><b class="num" data-n="${cont("Terreno") + cont("Chácara") + cont("Área rural")}">0</b><span>terrenos, chácaras e áreas</span></div>
    <div class="fato rv"><b class="num" data-n="${listaBairros.length}">0</b><span>bairros em São Martinho e Sede Nova</span></div>
  </div>
</section>
<section class="secao" id="categorias">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">O que você procura</span><h2>Busque por tipo de imóvel</h2></div></div>
    <div class="categorias" data-stagger>${categorias.map(([t, nome, ref]) => { const n = IMOVEIS.filter(x => x.tipo === t).length; const y = porRef(ref); return `<a class="ladrilho rv" href="imoveis.html?tipo=${encodeURIComponent(t)}${t === "Sala comercial" ? "&fin=alugar" : ""}"><img src="${foto(capa(y), "p")}" alt="" loading="lazy" decoding="async"><b>${nome}</b><span>${n} ${n === 1 ? "imóvel" : "imóveis"}</span></a>`; }).join("")}</div>
  </div>
</section>
<section class="secao secao-cinza" id="selecao">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Seleção da equipe</span><h2>Imóveis em destaque</h2><p>Os imóveis mais completos da carteira, escolhidos pela Kiesel.</p></div><a class="btn btn-contorno" href="imoveis.html">Ver catálogo completo <span class="seta">${ico.seta}</span></a></div>
    <div class="vitrine" data-stagger id="destaques">${destaques.map(x => card(x)).join("")}</div>
  </div>
</section>
<section class="secao" id="porque">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Por que a Kiesel</span><h2>A imobiliária da cidade</h2></div></div>
    <div class="porques" data-stagger>
      <div class="porque rv"><span class="ic">${icoSelo}</span><h3>Corretagem registrada</h3><p>CRECI 45.125/RS. Contrato, documentação conferida e orientação em cada etapa, da visita à escritura.</p></div>
      <div class="porque rv"><span class="ic">${icoCasa}</span><h3>Conhece cada quadra</h3><p>Escritório na Avenida Getúlio Vargas, no Centro. Sabe o histórico dos imóveis, a vizinhança e o que cada bairro oferece.</p></div>
      <div class="porque rv"><span class="ic">${icoEtiq}</span><h3>Preço na vitrine</h3><p>Nenhum imóvel "sob consulta". Valor, fotos e descrição completa de tudo o que está disponível.</p></div>
    </div>
  </div>
</section>
<section class="secao secao-cinza" id="recentes">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Carteira</span><h2>Atualizados recentemente</h2></div><a class="btn btn-contorno" href="imoveis.html">Ver todos os ${IMOVEIS.length} <span class="seta">${ico.seta}</span></a></div>
    <div class="vitrine" data-stagger>${recentes.map(x => card(x)).join("")}</div>
  </div>
</section>
<section class="secao" id="bairros">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Onde</span><h2>Imóveis por bairro</h2></div></div>
    <div class="bairros" data-stagger>${listaBairros.map(([k, n]) => { const [b, c] = k.split("|"); return `<a class="bairro rv" href="imoveis.html?bairro=${encodeURIComponent(b)}" data-foto="${bairroFoto(b)}"><img class="th" src="${bairroFoto(b)}" alt="" loading="lazy" decoding="async" width="72" height="60"><span><b>${esc(b)}</b><span>${esc(c)}</span></span><span class="mono">${n} ${n > 1 ? "imóveis" : "imóvel"}</span></a>`; }).join("")}</div>
  </div>
</section>
<section class="secao" id="anuncie-faixa" style="padding-top:0">
  <div class="miolo">
    <div class="faixa-azul rv">
      <div><span class="mono" style="color:#9CC4EA">Proprietários</span><h2>Quer vender ou alugar o seu imóvel?</h2><p>Avaliação de mercado, fotos, anúncio neste site e no Facebook, visitas acompanhadas e documentação conferida. Você só fala com a Kiesel.</p></div>
      <div class="acoes"><a class="btn btn-papel" href="anuncie.html">Anunciar meu imóvel <span class="seta">${ico.seta}</span></a><a class="btn btn-contorno" href="financiamento.html">Simular financiamento</a></div>
    </div>
  </div>
</section>
<section class="secao secao-cinza" id="como">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Como funciona</span><h2>Sem surpresa, do primeiro contato à escritura</h2></div></div>
    <div class="pilha" id="pilha" data-stagger>
      <div class="cartao rv"><span class="n">Passo 1</span><h3>Conversa</h3><p>Você conta o que procura ou o que quer vender. A Kiesel responde pelo WhatsApp, sem formulário intermediário nem central de atendimento.</p><div class="mini"><span>WhatsApp</span><span>Balcão na Avenida</span></div></div>
      <div class="cartao rv"><span class="n">Passo 2</span><h3>Visita</h3><p>Visita acompanhada pelo corretor, que conhece o imóvel, a vizinhança e o histórico de cada quadra. Você vê o que a foto não mostra.</p><div class="mini"><span>Agenda flexível</span><span>Corretor presente</span></div></div>
      <div class="cartao rv"><span class="n">Passo 3</span><h3>Proposta, financiamento e escritura</h3><p>Negociação direta com o proprietário, orientação para financiar e documentação conferida até a assinatura. Simule aqui no site antes de visitar.</p><div class="mini"><span>Price e SAC</span><span>Documentação conferida</span></div></div>
    </div>
  </div>
</section>
<section class="secao" id="sobre-breve">
  <div class="miolo">
    <div class="manifesto">
      <div class="quadro quadro-mapa"><iframe title="Mapa: escritório da Kiesel, Avenida Getúlio Vargas, Centro, São Martinho" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=-27.70806,-53.96561&z=16&hl=pt-BR&output=embed"></iframe><span class="selo-mapa"><img src="assets/logo-topo.png" width="391" height="190" alt="" loading="lazy"><b>Av. Getúlio Vargas, Centro</b><span>São Martinho/RS · CRECI 45.125/RS</span></span></div>
      <div><span class="mono rv">A Kiesel</span><p class="grande rv" style="margin-top:10px">Por trás de cada negócio, <em>uma história de respeito e confiança.</em></p><p class="rv" style="margin-top:16px">A Kiesel Negócios Imobiliários atende São Martinho, o interior e os municípios vizinhos com casas, terrenos, chácaras, áreas rurais e salas comerciais. Toda a carteira está neste site com preço, fotos e descrição.</p><p class="rv" style="margin-top:22px"><a class="btn btn-azul" href="sobre.html">Conheça a Kiesel <span class="seta">${ico.seta}</span></a> <a class="btn btn-contorno" href="contato.html" style="margin-left:6px">Fale conosco</a></p></div>
    </div>
  </div>
</section>
<section class="chamada">
  <div class="miolo">
    <h2 class="rv">Não achou o que procura? <em>A Kiesel procura para você.</em></h2>
    <div class="acoes rv"><a class="btn btn-azul" href="encomende.html">Encomendar um imóvel <span class="seta">${ico.seta}</span></a><a class="btn btn-zap" href="${zapMsg("Olá, vi o site da Kiesel e quero conversar sobre um imóvel.")}" target="_blank" rel="noopener">${ico.zap}Chamar no WhatsApp</a></div>
  </div>
</section>`;
};
