/* Kiesel — carteira ao vivo. As páginas já saem prontas do build (dados.js); aqui o navegador confere no banco do painel
   se algo mudou desde então (imóvel novo, vendido, preço, fotos) e, se mudou, redesenha a página com o mesmo modelo.js.
   O app.js espera esta promessa antes de ligar os efeitos. Sem internet ou banco fora do ar: fica a versão do build. */
(function () {
  "use strict";
  var M = window.KieselModelo, S = M && M.SUPA;
  var pagina = document.body.dataset.pagina || "";
  var CHAVE = "kiesel-vivo-v1", VALIDADE = 30 * 1000, LIMITE = 2500;
  var refPagina = (function () {
    var m = /^imovel-([A-Z]{2}\d{4})$/.exec(pagina) || /imovel-([A-Za-z]{2}\d{4})/.exec(location.pathname);
    if (m) return m[1].toUpperCase();
    var q = new URLSearchParams(location.search).get("ref");
    return q ? q.toUpperCase() : "";
  })();
  var molde = pagina === "imovel";
  var interessa = M && (pagina === "index" || pagina === "imoveis" || pagina.indexOf("imovel") === 0);

  function cache(v) {
    try {
      if (v === undefined) { var c = JSON.parse(localStorage.getItem(CHAVE) || "null"); return c && Date.now() - c.t < VALIDADE ? c.l : null; }
      localStorage.setItem(CHAVE, JSON.stringify({ t: Date.now(), l: v }));
    } catch (e) { return null; }
  }
  function busca() {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, LIMITE);
    return fetch(S.url + "/rest/v1/" + S.tabela + "?select=*&status=eq.disponivel", { headers: { apikey: S.chave, Accept: "application/json" }, signal: ctrl ? ctrl.signal : undefined, cache: "no-store" })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("banco " + r.status); return r.json(); })
      .then(function (linhas) {
        if (!Array.isArray(linhas) || !linhas.length) throw new Error("carteira vazia");
        var l = M.ordena(linhas.map(M.normaliza)); cache(l); return l;
      });
  }
  function desenha(lista) {
    var main = document.getElementById("conteudo"); if (!main) return;
    var html = null, titulo = null;
    if (pagina === "index") html = M.corpoHome(lista);
    else if (pagina === "imoveis") html = M.corpoCatalogo(lista);
    else {
      var x = lista.filter(function (y) { return y.ref === refPagina; })[0];
      if (x) { html = M.corpoImovel(x, lista); titulo = M.metaImovel(x).titulo; }
      else { html = M.corpoIndisponivel(refPagina, lista); titulo = (refPagina ? refPagina + " · " : "") + "Imóvel indisponível · Imobiliária Kiesel"; }
    }
    main.innerHTML = M.ajusta(html);
    if (titulo) document.title = titulo;
    var conta = document.querySelector(".rodape .hud b"); if (conta) conta.textContent = lista.length;
    document.documentElement.setAttribute("data-vivo", "redesenhado");
  }
  function aplica(lista, base) {
    if (molde || M.assinatura(lista) !== M.assinatura(base)) desenha(lista);
    else document.documentElement.setAttribute("data-vivo", "igual");
  }

  if (!interessa) { window.KIESEL_VIVO = Promise.resolve(); return; }
  var base = M.ordena((window.IMOVEIS || []).map(M.normaliza));
  var guardada = /[?&]fresco/.test(location.search) ? null : cache();
  window.KIESEL_VIVO = (guardada ? Promise.resolve(guardada) : busca())
    .then(function (l) { aplica(l, base); })
    .catch(function () {
      document.documentElement.setAttribute("data-vivo", "sem-banco");
      if (molde) desenha(base); // imóvel novo sem conexão com o banco: mostra o que o build conhece (ou o aviso)
    });
})();
