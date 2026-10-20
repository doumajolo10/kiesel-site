/* Kiesel — modelos das páginas de imóveis. O mesmo arquivo gera o HTML no build (Node) e redesenha as páginas no navegador
   quando o painel muda algum imóvel (vivo.js). Não depende de nada além dos dados. */
(function (raiz) {
  "use strict";
  const ZAP = "5555996298532";
  const SITE = "https://www.imobiliariakiesel.com.br";
  const SUPA = { url: "https://cwsjddppdogvyitspbfr.supabase.co", chave: "sb_publishable_zpNPLwlPqkOR6pnvrxRGHw_78r3siqN", tabela: "kiesel_imoveis", balde: "kiesel-fotos" };

  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const num = n => Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  const preco = x => x.finalidade === "alugar" ? "R$ " + num(x.preco) + "<small>/mês</small>" : "R$ " + num(x.preco);
  const precoTxt = x => x.finalidade === "alugar" ? "R$ " + num(x.preco) + "/mês" : "R$ " + num(x.preco);
  const areaTxt = x => !x.area || x.area <= 1 ? "" : x.area < 50 ? Number(x.area).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " ha" : num(x.area) + " m²";
  const onde = x => x.bairro + " · " + x.cidade + (x.uf ? "/" + x.uf : "");
  const zapMsg = t => "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(t);
  // foto: nome do acervo ("CA0018-01", servido de img/) ou endereço completo de uma foto enviada pelo painel (...-g.webp, com a miniatura ...-p.webp ao lado)
  const foto = (f, t = "g") => /^https?:/.test(f) ? (t === "p" ? f.replace(/-g\.(webp|jpg)$/, "-p.$1") : f) : "img/" + t + "/" + f + ".webp";
  const SEM_FOTO = "assets/sem-foto.svg";
  const capa = x => x.fotos[0] || null;
  const capa2 = x => x.fotos[1] || null;
  const fotoOu = (f, t) => f ? foto(f, t) : SEM_FOTO;
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

  // ---------- dados ----------
  const inteiro = v => Math.max(0, Math.round(Number(v) || 0));
  const PLURAL = { "Casa": "Todas as casas", "Apartamento": "Todos os apartamentos", "Terreno": "Todos os terrenos", "Chácara": "Todas as chácaras", "Área rural": "Todas as áreas rurais", "Prédio": "Todos os prédios", "Sala comercial": "Todas as salas comerciais" };
  const TIPOS = ["Casa", "Apartamento", "Terreno", "Chácara", "Área rural", "Prédio", "Sala comercial"];
  const PUBLICO = SUPA.url + "/storage/v1/object/public/" + SUPA.balde + "/";
  const fotoValida = f => typeof f === "string" && (/^[A-Z]{2}\d{4}-\d{2}$/.test(f) || (f.indexOf(PUBLICO) === 0 && /^[\w\-\/.%]+$/.test(f.slice(PUBLICO.length))));
  // linha da tabela (Supabase) -> formato usado pelas páginas
  function normaliza(r) {
    const area = Number(r.area) || 0;
    const tipo = r.tipo || "Imóvel";
    return {
      ref: String(r.ref), tipo, finalidade: r.finalidade === "alugar" ? "alugar" : "comprar",
      bairro: r.bairro || "", cidade: r.cidade || "São Martinho", uf: r.uf || "RS",
      preco: Number(r.preco) || 0, quartos: inteiro(r.quartos), banheiros: inteiro(r.banheiros), vagas: inteiro(r.vagas), suites: inteiro(r.suites),
      area, titulo: r.titulo || (tipo + " no " + (r.bairro || "")), areaInvalida: area <= 1, destaque: inteiro(r.destaque),
      comodidades: Array.isArray(r.comodidades) ? r.comodidades.filter(Boolean) : [], descricao: String(r.descricao || "").replace(/\r\n?/g, "\n"),
      fotos: Array.isArray(r.fotos) ? r.fotos.filter(fotoValida) : [], atualizado: String(r.atualizado || "").slice(0, 10)
    };
  }
  // ordem da carteira: destaques na ordem escolhida, depois do maior para o menor preço
  function ordena(l) {
    return l.slice().sort((a, b) => (a.destaque > 0 ? a.destaque : 1e6) - (b.destaque > 0 ? b.destaque : 1e6) || b.preco - a.preco || a.ref.localeCompare(b.ref));
  }
  const assinatura = l => JSON.stringify(l);

  // ---------- cartões ----------
  function specs(x) {
    const s = [];
    if (x.quartos) s.push(`<span>${ico.cama}${x.quartos} ${x.quartos > 1 ? "quartos" : "quarto"}</span>`);
    if (x.banheiros) s.push(`<span>${ico.banho}${x.banheiros} ${x.banheiros > 1 ? "banheiros" : "banheiro"}</span>`);
    if (x.vagas) s.push(`<span>${ico.carro}${x.vagas} ${x.vagas > 1 ? "vagas" : "vaga"}</span>`);
    const a = areaTxt(x); if (a) s.push(`<span>${ico.area}${a}</span>`);
    return s.join("");
  }
  function card(x, lazy = true) {
    const f1 = capa(x), f2 = capa2(x);
    return `<a class="item" href="imovel-${x.ref}.html" data-cursor="Ver imóvel" data-ref="${x.ref}" data-tipo="${esc(x.tipo)}" data-fin="${x.finalidade}" data-bairro="${esc(x.bairro)}" data-cidade="${esc(x.cidade)}" data-preco="${x.preco}" data-quartos="${x.quartos}" data-area="${x.area}" data-data="${x.atualizado}" data-busca="${esc((x.titulo + " " + x.bairro + " " + x.cidade + " " + x.ref + " " + x.comodidades.join(" ") + " " + x.descricao).toLowerCase())}">
  <div class="moldura"><img class="a" src="${fotoOu(f1, "p")}"${f1 ? ` srcset="${foto(f1, "p")} 640w, ${foto(f1, "g")} 1280w"` : ""} sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw" width="640" height="360" alt="${esc(x.titulo)} em ${esc(x.bairro)}"${lazy ? ' loading="lazy" decoding="async"' : ""}>${f2 ? `<img class="b" src="${foto(f2, "p")}" alt="" loading="lazy" decoding="async">` : ""}<span class="cod">${x.ref}</span><span class="tipo">${esc(x.tipo)}${x.finalidade === "alugar" ? " · aluguel" : ""}</span><button class="fav" type="button" data-fav="${x.ref}" aria-label="Guardar ${x.ref} nos favoritos" aria-pressed="false">${ico.coracao}</button></div>
  <div class="dados"><h3>${esc(x.titulo)}</h3><span class="preco num">${preco(x)}</span></div>
  <span class="onde">${esc(onde(x))}</span>
  <div class="specs">${specs(x)}</div>
</a>`;
  }

  // ---------- contexto comum ----------
  function contexto(IMOVEIS) {
    const bairros = {}; for (const x of IMOVEIS) { const k = x.bairro + "|" + x.cidade; bairros[k] = (bairros[k] || 0) + 1; }
    const listaBairros = Object.entries(bairros).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const listaCidades = [...new Set(IMOVEIS.map(x => x.cidade).filter(Boolean))].sort((a, b) => IMOVEIS.filter(x => x.cidade === b).length - IMOVEIS.filter(x => x.cidade === a).length || a.localeCompare(b));
    const cont = t => IMOVEIS.filter(x => x.tipo === t).length;
    const porRef = r => IMOVEIS.find(x => x.ref === r);
    const tipos = TIPOS.filter(t => cont(t)).concat([...new Set(IMOVEIS.map(x => x.tipo))].filter(t => TIPOS.indexOf(t) < 0));
    // destaques marcados no painel (na ordem), completados pelos mais caros com foto
    const marcados = IMOVEIS.filter(x => x.destaque > 0 && x.finalidade === "comprar").sort((a, b) => a.destaque - b.destaque);
    const resto = IMOVEIS.filter(x => !(x.destaque > 0) && x.fotos.length && x.finalidade === "comprar").sort((a, b) => b.preco - a.preco);
    const destaques = marcados.concat(resto).slice(0, 6);
    const heroi = destaques.filter(x => x.fotos.length).slice(0, 4);
    const recentes = IMOVEIS.slice().sort((a, b) => b.atualizado.localeCompare(a.atualizado) || b.preco - a.preco).slice(0, 6);
    return { listaBairros, cont, porRef, tipos, destaques, heroi, recentes, listaCidades };
  }

  // ---------- filme aéreo da capa (build/video.sh) ----------
  // O navegador pega a primeira fonte que sabe tocar: AV1 (Chrome, Edge, Firefox), HEVC (Safari, iPhone), H.264 (o resto).
  // As de 720p só valem no celular (media).
  const VIDEO_FONTES = [
    ["(max-width: 900px)", "heroi-720.av1.mp4", "av01.0.05M.08"],
    ["(max-width: 900px)", "heroi-720.hevc.mp4", "hvc1.1.6.L93.90"],
    ["", "heroi-1440.av1.mp4", "av01.0.12M.08"],
    ["", "heroi-1080.hevc.mp4", "hvc1.1.6.L120.90"],
    ["", "heroi-720.h264.mp4", "avc1.640028"]
  ].map(([m, a, c]) => `<source${m ? ` media="${m}"` : ""} src="assets/video/${a}" type='video/mp4; codecs="${c}"'>`).join("");
  const ICO_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>';
  const ICO_PAUSA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  // ---------- home ----------
  const CATEGORIAS = [["Casa", "Casas", "CA0047"], ["Apartamento", "Apartamentos", ""], ["Terreno", "Terrenos", "TE0028"], ["Chácara", "Chácaras", "CH0007"], ["Área rural", "Áreas rurais", "AR0001"], ["Prédio", "Prédios", "PR0001"], ["Sala comercial", "Salas comerciais", "SA0003"]];
  function corpoHome(IMOVEIS) {
    const { listaBairros, listaCidades, cont, porRef, tipos, destaques, heroi, recentes } = contexto(IMOVEIS);
    const bairroFoto = b => { const y = IMOVEIS.find(x => x.bairro === b && x.tipo === "Casa" && x.fotos.length) || IMOVEIS.find(x => x.bairro === b && x.fotos.length) || IMOVEIS.find(x => x.bairro === b); return fotoOu(capa(y), "p"); };
    const categorias = CATEGORIAS.map(([t, nome, ref]) => { const n = cont(t); const p = porRef(ref); const y = p && p.tipo === t && p.fotos.length ? p : IMOVEIS.find(x => x.tipo === t && x.fotos.length) || IMOVEIS.find(x => x.tipo === t); return { t, nome, n, y }; }).filter(c => c.n > 0).slice(0, 6);
    const icoCasa = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/></svg>';
    const icoSelo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3l2.5 2 3.2-.3.6 3.1 2.7 1.7-1.3 2.9 1.3 2.9-2.7 1.7-.6 3.1-3.2-.3L12 21l-2.5-2-3.2.3-.6-3.1L3 14.5l1.3-2.9L3 8.7l2.7-1.7.6-3.1 3.2.3z"/><path d="M9 12l2 2 4-4"/></svg>';
    const icoTrad = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';
    const icoEscudo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>';
    const icoPino = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
    const icoEtiq = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>';
    const terras = cont("Terreno") + cont("Chácara") + cont("Área rural");
    return `
<div class="pre" id="pre" aria-hidden="true"><img src="assets/marca-kiesel-400.webp" alt="" width="400" height="194"><span class="pre-num" id="pre-conta">0</span><i class="pre-linha"><i id="pre-barra"></i></i></div>
<section class="heroi" id="heroi">
  <div class="heroi-fotos heroi-filme" id="heroi-fotos">
    <img class="heroi-poster" src="assets/video/heroi-poster.webp" srcset="assets/video/heroi-poster-p.webp 960w, assets/video/heroi-poster.webp 1920w" sizes="(max-width:900px) 100vw, 1360px" width="1920" height="1080" alt="Vista aérea de São Martinho/RS, com a igreja matriz e o letreiro da cidade" fetchpriority="high">
    <video id="heroi-video" muted loop playsinline preload="none" disablepictureinpicture aria-hidden="true" tabindex="-1">${VIDEO_FONTES}</video>
  </div>
  <div class="heroi-veu"></div>
  <div class="heroi-hud">
    <div class="filme-legenda"><b>São Martinho vista do alto</b><span>Imagens aéreas da Kiesel</span></div>
    <button type="button" class="filme-pausa" id="heroi-pausa" aria-pressed="false" aria-label="Pausar o vídeo de fundo" hidden>${ICO_PAUSA.replace("<svg", '<svg class="i-pausa"')}${ICO_PLAY.replace("<svg", '<svg class="i-play"')}</button>
  </div>
  <div class="heroi-miolo">
    <div class="heroi-titulo"><h1>Encontre seu imóvel em São Martinho e região</h1><p class="sub">A primeira imobiliária da cidade, com mais de 12 anos de tradição, experiência e compromisso em cada negócio.</p></div>
  </div>
</section>
<div class="busca-faixa">
  <form class="busca busca-barra" id="form-busca" action="imoveis.html" method="get" aria-label="Buscar imóveis">
    <div class="alterna" role="group" aria-label="Finalidade"><input type="hidden" name="fin" id="b-fin" value="comprar"><button type="button" data-fin="comprar" aria-pressed="true">Comprar</button><button type="button" data-fin="alugar" aria-pressed="false">Alugar</button></div>
    <div class="campo"><label for="b-tipo">Tipo de imóvel</label><select class="sel" id="b-tipo" name="tipo"><option value="">Todos os tipos</option>${tipos.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
    <div class="campo"><label for="b-cidade">Cidade</label><select class="sel" id="b-cidade" name="cidade"><option value="">Todas as cidades</option>${listaCidades.map(c => `<option>${esc(c)}</option>`).join("")}</select></div>
    <div class="campo"><label for="b-bairro">Bairro</label><select class="sel" id="b-bairro" name="bairro"><option value="">Todos os bairros</option>${listaBairros.map(([k]) => { const [b, c] = k.split("|"); return `<option value="${esc(b)}" data-cidade="${esc(c)}">${esc(b)} · ${esc(c)}</option>`; }).join("")}</select></div>
    <div class="campo"><label for="b-quartos">Quartos</label><select class="sel" id="b-quartos" name="quartos"><option value="">Qualquer</option><option value="1">1 ou mais</option><option value="2">2 ou mais</option><option value="3">3 ou mais</option><option value="4">4 ou mais</option></select></div>
    <button class="btn btn-azul" type="submit">Buscar <span class="seta">${ico.seta}</span></button>
  </form>
</div>
<section class="numeros" aria-label="Números da Kiesel">
  <div class="miolo">
    <div class="fato rv"><b class="num" data-n="${IMOVEIS.length}">${IMOVEIS.length}</b><span>imóveis publicados hoje</span></div>
    <div class="fato rv"><b class="num" data-n="${cont("Casa")}">${cont("Casa")}</b><span>casas à venda</span></div>
    <div class="fato rv"><b class="num" data-n="${terras}">${terras}</b><span>terrenos, chácaras e áreas</span></div>
    <div class="fato rv"><b class="num" data-n="${listaBairros.length}">${listaBairros.length}</b><span>bairros em São Martinho e Sede Nova</span></div>
  </div>
</section>
<section class="frase-cidade" aria-label="Imobiliária Kiesel">
  <div class="miolo"><p class="rv">Uma <em>história</em> que faz parte da cidade.<br>Uma <em>confiança</em> que faz parte da sua história.</p></div>
</section>
<section class="secao" id="categorias">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">O que você procura</span><h2>Busque por tipo de imóvel</h2></div></div>
    <div class="categorias" data-stagger>${categorias.map(({ t, nome, n, y }) => `<a class="ladrilho rv" href="imoveis.html?tipo=${encodeURIComponent(t)}${t === "Sala comercial" ? "&fin=alugar" : ""}"><img src="${fotoOu(capa(y), "p")}" alt="" loading="lazy" decoding="async"><b>${nome}</b><span>${n} ${n === 1 ? "imóvel" : "imóveis"}</span></a>`).join("")}</div>
  </div>
</section>
<section class="secao secao-cinza" id="selecao">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Seleção da equipe</span><h2>Imóveis à venda em destaque</h2><p>Os imóveis mais completos da carteira, escolhidos pela Kiesel.</p></div><a class="btn btn-contorno" href="imoveis.html">Ver catálogo completo <span class="seta">${ico.seta}</span></a></div>
    <div class="vitrine" data-stagger id="destaques">${destaques.map(x => card(x)).join("")}</div>
  </div>
</section>
<section class="secao" id="porque">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Por que a Imobiliária Kiesel</span><h2>A primeira imobiliária da cidade</h2></div></div>
    <div class="porques" data-stagger>
      <div class="porque rv"><span class="ic">${icoTrad}</span><h3>Tradição que constrói confiança</h3><p>Mais de 10 anos de história e pioneirismo no mercado imobiliário da cidade. Uma trajetória construída com seriedade, compromisso e relações de confiança.</p></div>
      <div class="porque rv"><span class="ic">${icoEscudo}</span><h3>Segurança em cada negociação</h3><p>Da primeira conversa à assinatura do contrato, você conta com orientação profissional, transparência e atenção aos detalhes para tomar decisões com mais tranquilidade.</p></div>
      <div class="porque rv"><span class="ic">${icoPino}</span><h3>Conhecimento de quem é da cidade</h3><p>Conhecemos a história, os bairros e as particularidades do mercado local. Experiência que ajuda você a encontrar o imóvel certo e a negociar com mais confiança.</p></div>
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
    <div class="bairros" data-stagger>${listaBairros.map(([k, n]) => { const [b, c] = k.split("|"); return `<a class="bairro rv" href="imoveis.html?cidade=${encodeURIComponent(c)}&bairro=${encodeURIComponent(b)}" data-foto="${bairroFoto(b)}"><img class="th" src="${bairroFoto(b)}" alt="" loading="lazy" decoding="async" width="72" height="60"><span><b>${esc(b)}</b><span>${esc(c)}</span></span><span class="mono">${n} ${n > 1 ? "imóveis" : "imóvel"}</span></a>`; }).join("")}</div>
  </div>
</section>
<section class="secao" id="anuncie-faixa" style="padding-top:0">
  <div class="miolo">
    <div class="faixa-azul rv">
      <div><span class="mono" style="color:#9CC4EA">Proprietários</span><h2>Seu imóvel merece a <em>experiência</em> de quem conhece este mercado.</h2><p>Cuidamos de cada etapa da venda ou locação: avaliação de mercado, apresentação do imóvel, divulgação e acompanhamento das visitas. Você conta com orientação profissional e suporte na documentação, do anúncio à conclusão do negócio.</p></div>
      <div class="acoes"><a class="btn btn-papel" href="anuncie.html">Anunciar meu imóvel <span class="seta">${ico.seta}</span></a><a class="btn btn-contorno" href="financiamento.html">Simular financiamento</a></div>
    </div>
  </div>
</section>
<section class="secao secao-cinza" id="como">
  <div class="miolo">
    <div class="cabeca rv"><div><span class="mono">Com confiança em cada etapa</span><h2>Do primeiro contato à escritura, você sabe com quem contar.</h2><p>Atendimento próximo, informações claras e acompanhamento em cada etapa da negociação. <em>Porque um bom negócio começa com confiança e termina com a tranquilidade de ter feito a escolha certa.</em></p></div></div>
    <div class="pilha" id="pilha" data-stagger>
      <div class="cartao rv"><span class="n">Passo 1</span><h3>Conversa</h3><p>Você conta o que procura ou o que quer vender. A Imobiliária Kiesel responde pelo WhatsApp, sem formulário intermediário nem central de atendimento.</p><div class="mini"><span>WhatsApp</span><span>Balcão na Avenida</span></div></div>
      <div class="cartao rv"><span class="n">Passo 2</span><h3>Visita</h3><p>Visita acompanhada pelo corretor, que conhece o imóvel, a vizinhança e o histórico de cada quadra. Você vê o que a foto não mostra.</p><div class="mini"><span>Agenda flexível</span><span>Corretor presente</span></div></div>
      <div class="cartao rv"><span class="n">Passo 3</span><h3>Proposta, financiamento e escritura</h3><p>Negociação direta com o proprietário, orientação para financiar e documentação conferida até a assinatura. Simule aqui no site antes de visitar.</p><div class="mini"><span>Price e SAC</span><span>Documentação conferida</span></div></div>
    </div>
  </div>
</section>
<section class="secao" id="sobre-breve">
  <div class="miolo">
    <div class="manifesto">
      <figure class="quadro quadro-foto quadro-local rv"><a class="local-mapa" href="https://www.google.com/maps/search/?api=1&amp;query=NEG%C3%93CIOS%20IMOBILI%C3%81RIOS%20KIESEL%2C%20S%C3%A3o%20Martinho%20-%20RS" target="_blank" rel="noopener" aria-label="Ver a localização da Imobiliária Kiesel no Google Maps"><img src="assets/fotos/mapa-kiesel.webp" srcset="assets/fotos/mapa-kiesel-800.webp 800w, assets/fotos/mapa-kiesel.webp 2400w" sizes="(max-width:860px) 100vw, 50vw" width="1200" height="900" alt="Mapa com a localização da Imobiliária Kiesel na Avenida Getúlio Vargas, Centro de São Martinho" loading="lazy" decoding="async"></a><figcaption class="selo-mapa"><img src="assets/marca-kiesel-400.webp" width="400" height="194" alt="" loading="lazy"><b>Av. Getúlio Vargas, Centro</b><span>São Martinho/RS · CEP 98690-000</span><a class="local-ir" href="https://www.google.com/maps/dir/?api=1&amp;destination=NEG%C3%93CIOS%20IMOBILI%C3%81RIOS%20KIESEL%2C%20S%C3%A3o%20Martinho%20-%20RS" target="_blank" rel="noopener">${PINO}Como chegar</a></figcaption></figure>
      <div><span class="mono rv">A Imobiliária Kiesel</span><p class="grande rv" style="margin-top:10px">Por trás de cada negócio, <em>uma história de respeito e confiança.</em></p><p class="desde rv" style="margin-top:16px">Atuamos no mercado desde fevereiro de 2014.</p><p class="rv" style="margin-top:10px">A Kiesel Negócios Imobiliários atende São Martinho, o interior e os municípios vizinhos com casas, terrenos, chácaras, áreas rurais e salas comerciais. Toda a carteira está neste site com preço, fotos e descrição.</p><div class="acoes-sobre rv"><a class="btn btn-azul" href="sobre.html">Conheça a Imobiliária Kiesel <span class="seta">${ico.seta}</span></a><a class="btn btn-contorno" href="contato.html">Fale conosco</a></div></div>
    </div>
  </div>
</section>
<section class="chamada chamada-foto" style="--fundo-img:url(assets/fotos/foto-casas.webp);--fundo-img-p:url(assets/fotos/foto-casas-960.webp)">
  <div class="miolo">
    <span class="chamada-ic" aria-hidden="true">${icoPino}</span>
    <h2 class="rv">Ainda não encontrou o imóvel ideal?</h2>
    <p class="chamada-sub rv"><em>Conte com a Kiesel para encontrar o que você procura.</em></p>
    <p class="chamada-txt rv">Diga o que você precisa. Vamos buscar opções que combinem com seus planos e seu orçamento.</p>
    <div class="acoes rv"><a class="btn btn-azul" href="encomende.html">Encomendar um imóvel <span class="seta">${ico.seta}</span></a><a class="btn btn-zap" href="${zapMsg("Olá, vi o site da Kiesel e quero conversar sobre um imóvel.")}" target="_blank" rel="noopener">${ico.zap}Chamar no WhatsApp</a></div>
  </div>
</section>`;
  }

  // ---------- catálogo ----------
  function corpoCatalogo(IMOVEIS) {
    const { listaBairros, listaCidades, tipos } = contexto(IMOVEIS);
    return `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Imóveis</div><h1 class="mask">Catálogo <span class="ital">completo.</span></h1><p>Todos os imóveis disponíveis hoje, com preço, fotos e descrição. Filtre por finalidade, tipo, bairro e quartos, ou guarde favoritos para comparar depois.</p></div></section>
<section class="secao" style="padding-top:clamp(28px,4vw,48px);min-height:100vh">
  <div class="miolo">
    <form class="filtros" id="filtros" data-sem-envio>
      <div class="alterna" role="group" aria-label="Finalidade"><button type="button" data-fin="comprar" aria-pressed="true">Comprar</button><button type="button" data-fin="alugar" aria-pressed="false">Alugar</button><button type="button" data-fin="favoritos" aria-pressed="false">Favoritos</button></div>
      <div class="campo"><label for="f-tipo">Tipo</label><select class="sel" id="f-tipo"><option value="">Todos</option>${tipos.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
      <div class="campo"><label for="f-cidade">Cidade</label><select class="sel" id="f-cidade"><option value="">Todas</option>${listaCidades.map(c => `<option>${esc(c)}</option>`).join("")}</select></div>
      <div class="campo"><label for="f-bairro">Bairro</label><select class="sel" id="f-bairro"><option value="">Todos</option>${listaBairros.map(([k]) => { const [b, c] = k.split("|"); return `<option value="${esc(b)}" data-cidade="${esc(c)}">${esc(b)} · ${esc(c)}</option>`; }).join("")}</select></div>
      <div class="campo"><label for="f-quartos">Quartos</label><select class="sel" id="f-quartos"><option value="">Qualquer</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></div>
      <div class="campo"><label for="f-ordem">Ordem</label><select class="sel" id="f-ordem"><option value="recentes">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="area">Maior área</option></select></div>
      <div class="campo campo-busca"><label for="f-busca">Buscar</label><input class="ent" id="f-busca" type="search" placeholder="piscina, Centro, CA0018…" autocomplete="off"></div>
      <button class="limpar" type="button" id="f-limpar">Limpar</button>
    </form>
    <div class="resumo"><span><b class="num" id="res-n">${IMOVEIS.length}</b> <span id="res-txt">imóveis</span></span><span id="res-fil"></span></div>
    <div class="vitrine" id="grade">${IMOVEIS.map(x => card(x)).join("")}<div class="vazio" id="vazio" hidden><h3>Nenhum imóvel com esses filtros.</h3><p>Tente outro bairro ou tipo, ou <a href="encomende.html">encomende</a> o imóvel que você procura.</p></div></div>
    <nav class="paginacao" id="paginacao" aria-label="Páginas"></nav>
  </div>
</section>`;
  }

  // ---------- página do imóvel ----------
  function semelhantes(x, IMOVEIS) {
    return IMOVEIS.filter(y => y.ref !== x.ref && y.finalidade === x.finalidade).map(y => ({ y, d: (y.tipo === x.tipo ? 0 : 1e9) + Math.abs(y.preco - x.preco) })).sort((a, b) => a.d - b.d).slice(0, 3).map(o => o.y);
  }
  function metaImovel(x) {
    return {
      titulo: `${x.titulo} · ${x.bairro}, ${x.cidade} · ${precoTxt(x)} · Kiesel ${x.ref}`,
      desc: `${x.titulo} em ${onde(x)}, ${precoTxt(x)}. ${x.descricao.split("\n")[0].slice(0, 140)}`
    };
  }
  function corpoImovel(x, IMOVEIS) {
    const fotos = x.fotos.length ? x.fotos : [null];
    const esp = [];
    if (x.quartos) esp.push([x.quartos, x.quartos > 1 ? "quartos" : "quarto"]);
    if (x.suites) esp.push([x.suites, x.suites > 1 ? "suítes" : "suíte"]);
    if (x.banheiros) esp.push([x.banheiros, x.banheiros > 1 ? "banheiros" : "banheiro"]);
    if (x.vagas) esp.push([x.vagas, x.vagas > 1 ? "vagas" : "vaga"]);
    const a = areaTxt(x); if (a) esp.push([a.split(" ")[0], a.split(" ")[1] === "ha" ? "hectares" : "m² de área"]);
    const msg = `Olá, tenho interesse no imóvel ${x.ref} (${x.titulo}, ${onde(x)}, ${precoTxt(x)}). Pode me passar mais informações?`;
    const i = IMOVEIS.indexOf(x), n = IMOVEIS.length;
    const vizinhos = n > 1 && i >= 0 ? [IMOVEIS[(i - 1 + n) % n], IMOVEIS[(i + 1) % n]] : [];
    const sem = semelhantes(x, IMOVEIS);
    return `
<section class="imovel-galeria">
  <div class="galeria" id="galeria" aria-roledescription="galeria" aria-label="Fotos do imóvel ${x.ref}">
    ${fotos.map((f, i) => `<div class="slide${i === 0 ? " ativo" : ""}" data-i="${i}"><img src="${fotoOu(f)}" width="1280" height="720" alt="${esc(x.titulo)}, foto ${i + 1} de ${fotos.length}"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}></div>`).join("")}
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
        ${x.descricao ? `<h2>Sobre o imóvel</h2>
        <div class="descricao">${esc(x.descricao)}</div>` : ""}
        ${x.comodidades.length ? `<h2>Características</h2><div class="chips">${x.comodidades.map(c => `<span>${esc(c)}</span>`).join("")}</div>` : ""}
        <p class="nota" style="margin-top:28px;font-size:13px;color:var(--tinta-3)">${x.atualizado ? `Atualizado em ${x.atualizado.split("-").reverse().join("/")}. ` : ""}Valores sujeitos a alteração sem aviso prévio.</p>
      </div>
      <aside class="imovel-lado">
        <div class="placa">
          <h3>Quer visitar?</h3>
          <p>Fale direto com o corretor. A mensagem já vai com o código ${x.ref} para agilizar.</p>
          <a class="btn btn-zap" id="ficha-zap" href="${zapMsg(msg)}" target="_blank" rel="noopener">${ico.zap}Falar sobre este imóvel</a>
          <div class="acoes-linha"><button class="btn btn-contorno" type="button" data-fav="${x.ref}" aria-pressed="false" id="ficha-fav">${ico.coracao}<span>Guardar</span></button><button class="btn btn-contorno" type="button" id="ficha-compart">${ico.compart}Compartilhar</button></div>
          ${x.finalidade === "comprar" ? `<a class="btn btn-contorno" href="financiamento.html?valor=${x.preco}">Simular financiamento</a>` : ""}
          <div class="corretor"><img src="assets/marca-kiesel-400.webp" alt="" width="72" height="35"><div>Kiesel Negócios Imobiliários<br>CRECI 45.125/RS · (55) 99629-8532</div></div>
        </div>
      </aside>
    </div>
  </div>
</section>
${sem.length ? `<section class="secao secao-escura" id="semelhantes">
  <div class="miolo">
    <div class="cabeca"><div><span class="num-sec rv">Veja também</span><h2 class="rv">Imóveis semelhantes.</h2></div><a class="btn btn-contorno rv" href="imoveis.html?tipo=${encodeURIComponent(x.tipo)}">${esc(PLURAL[x.tipo] || "Ver todos")} ${ico.seta}</a></div>
    <div class="vitrine" data-stagger>${sem.map(y => card(y)).join("")}</div>
  </div>
</section>` : ""}
${vizinhos.length ? `<nav class="prox-ant" aria-label="Outros imóveis">${vizinhos.map((v, k) => `<a href="imovel-${v.ref}.html"><span class="mono">${k ? "Próximo" : "Anterior"} · ${v.ref}</span><b>${esc(v.titulo)}</b><span class="mono">${esc(onde(v))} · ${precoTxt(v)}</span></a>`).join("")}</nav>` : ""}`;
  }
  // imóvel que saiu da carteira (vendido, alugado ou retirado) ou endereço que não existe
  function corpoIndisponivel(ref, IMOVEIS) {
    const sug = IMOVEIS.slice().sort((a, b) => b.atualizado.localeCompare(a.atualizado)).slice(0, 3);
    return `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / <a href="imoveis.html">Imóveis</a>${ref ? " / " + esc(ref) : ""}</div><h1 class="mask">Este imóvel não está <span class="ital">mais disponível.</span></h1><p>${ref ? `O imóvel ${esc(ref)} foi vendido, alugado ou retirado da carteira.` : "Não encontramos esse imóvel."} Veja os que estão disponíveis hoje ou fale com a Imobiliária Kiesel: muitas vezes há opções parecidas que ainda não chegaram ao site.</p><p style="margin-top:22px"><a class="btn btn-azul" href="imoveis.html">Ver imóveis disponíveis <span class="seta">${ico.seta}</span></a> <a class="btn btn-zap" href="${zapMsg("Olá, vi no site o imóvel " + (ref || "") + " e queria saber de opções parecidas.")}" target="_blank" rel="noopener" style="margin-left:6px">${ico.zap}Falar no WhatsApp</a></p></div></section>
${sug.length ? `<section class="secao secao-cinza"><div class="miolo"><div class="cabeca"><div><span class="mono">Carteira</span><h2>Atualizados recentemente</h2></div></div><div class="vitrine">${sug.map(y => card(y)).join("")}</div></div></section>` : ""}`;
  }

  // mapa do Google só depois do clique (LGPD: o Google não recebe o acesso de quem não pediu o mapa)
  const PINO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const mapaSob = (titulo, src) => `<div class="mapa-aviso mapa-ilustrado" data-mapa="${src}" data-titulo="${titulo}"><img class="mapa-img" src="assets/fotos/mapa-kiesel.webp" srcset="assets/fotos/mapa-kiesel-800.webp 800w, assets/fotos/mapa-kiesel.webp 2400w" sizes="(max-width:860px) 100vw, 50vw" width="1200" height="900" alt="Mapa do Centro de São Martinho com a localização da Imobiliária Kiesel, na Avenida Getúlio Vargas" loading="lazy" decoding="async"><div class="mapa-cartao"><div class="mapa-id"><img src="assets/marca-kiesel-400.webp" width="400" height="194" alt="" loading="lazy"><div><b>Imobiliária Kiesel</b><span>Av. Getúlio Vargas, Centro<br>São Martinho/RS · CEP 98690-000</span></div></div><div class="mapa-acoes"><a class="btn btn-azul" href="https://www.google.com/maps/dir/?api=1&amp;destination=NEG%C3%93CIOS%20IMOBILI%C3%81RIOS%20KIESEL%2C%20S%C3%A3o%20Martinho%20-%20RS" target="_blank" rel="noopener">${PINO}Como chegar</a><button type="button" class="btn btn-contorno">Mapa interativo</button></div><small>O mapa interativo é do Google; ao abrir, o Google recebe o seu acesso.</small></div></div>`;
  // o mesmo ajuste que o build aplica em todo <main>
  // o mapa do Google abre direto (pedido da Kiesel, 20/10); mapaSob fica disponível caso volte a ser só com clique
  const ajusta = corpo => corpo.replace(/<(h1|p) class="(mask|grande mask)">([\s\S]*?)<\/\1>/g, '<$1 class="$2"><span>$3</span></$1>').replace(/class="(trilha|onde)"/g, 'class="$1 mono"').replace(/class="num-sec rv"/g, 'class="mono rv"');

  const M = { ZAP, SITE, SUPA, TIPOS, esc, num, preco, precoTxt, areaTxt, onde, zapMsg, foto, fotoOu, capa, capa2, ico, normaliza, ordena, assinatura, specs, card, contexto, corpoHome, corpoCatalogo, corpoImovel, corpoIndisponivel, metaImovel, semelhantes, ajusta };
  if (typeof module !== "undefined" && module.exports) module.exports = M; else raiz.KieselModelo = M;
})(typeof window !== "undefined" ? window : this);
