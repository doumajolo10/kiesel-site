/* Kiesel Negócios Imobiliários — comportamento do site (v3) */
/* formulários que só rodam no navegador (simuladores, filtros) nunca recarregam a página */
document.addEventListener("submit", function (e) { if (e.target.matches("[data-sem-envio]")) e.preventDefault(); }, true);
/* mapa do Google: carrega só quando a pessoa pede */
document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest(".mapa-aviso button"); if (!b) return;
  var box = b.closest(".mapa-aviso"), f = document.createElement("iframe");
  f.title = box.getAttribute("data-titulo") || "Mapa"; f.src = box.getAttribute("data-mapa"); f.referrerPolicy = "no-referrer-when-downgrade"; f.setAttribute("allowfullscreen", "");
  box.replaceWith(f);
});
/* espera o vivo.js trazer a carteira atualizada pelo painel (no máximo ~2,5 s) antes de ligar os efeitos */
(window.KIESEL_VIVO || Promise.resolve()).then(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const ZAP = "5555999479495";
  const num = n => Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const largo = () => innerWidth > 900;
  const pagina = document.body.dataset.pagina || "";
  const params = new URLSearchParams(location.search);
  const temGsap = !!(window.gsap && window.ScrollTrigger) && !reduz;
  if (temGsap) gsap.registerPlugin(ScrollTrigger);
  const sessao = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { } } };

  // ---------- aviso e WhatsApp ----------
  let avisoT;
  function aviso(t) { const a = $("#aviso"); if (!a) return; a.textContent = t; a.classList.add("vis"); clearTimeout(avisoT); avisoT = setTimeout(() => a.classList.remove("vis"), 2400); }
  function abreZap(msg) { window.open("https://wa.me/" + ZAP + "?text=" + encodeURIComponent(msg), "_blank", "noopener"); }

  // ---------- favoritos ----------
  const FAV = "kiesel-favs";
  function favs() { try { return JSON.parse(localStorage.getItem(FAV) || "[]"); } catch (e) { return []; } }
  function salvaFavs(l) { try { localStorage.setItem(FAV, JSON.stringify(l)); } catch (e) { } }
  function pintaFavs() {
    const l = favs();
    const n = $("#favs-n"); if (n) { n.textContent = l.length; n.classList.toggle("vis", l.length > 0); }
    $$("[data-fav]").forEach(b => { const on = l.indexOf(b.dataset.fav) >= 0; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); const s = $("span", b); if (s) s.textContent = on ? "Guardado" : "Guardar"; });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fav]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const l = favs(), r = b.dataset.fav, i = l.indexOf(r);
    if (i >= 0) { l.splice(i, 1); aviso(r + " saiu dos favoritos"); } else { l.push(r); aviso(r + " guardado nos favoritos"); }
    salvaFavs(l); pintaFavs();
    if (typeof filtra === "function" && estado.fin === "favoritos") filtra();
  }, true);
  pintaFavs();

  // ---------- cabeçalho (sólido ao rolar, esconde ao descer) ----------
  const topo = $("#topo"); let ultimoY = 0;
  function topoScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (topo) { topo.classList.toggle("solida", y > 40); topo.classList.toggle("escondida", y > 400 && y > ultimoY + 4 && !document.body.classList.contains("travada")); }
    ultimoY = y;
  }
  addEventListener("scroll", topoScroll, { passive: true }); topoScroll();
  if (topo && pagina !== "index") topo.classList.add("ink");
  const menu = $("#menu-movel"), btnMenu = $("#btn-menu");
  function abreMenu(v) { if (!menu) return; menu.classList.toggle("aberto", v); document.body.classList.toggle("travada", v); if (btnMenu) btnMenu.setAttribute("aria-expanded", v ? "true" : "false"); if (v && topo) topo.classList.remove("escondida"); }
  if (btnMenu) btnMenu.addEventListener("click", () => abreMenu(true));
  const btnFechar = $("#btn-menu-fechar"); if (btnFechar) btnFechar.addEventListener("click", () => abreMenu(false));
  addEventListener("keydown", e => { if (e.key === "Escape") abreMenu(false); });

  // ---------- cortina de transição entre páginas ----------
  const cortina = $("#cortina");
  if (cortina && !reduz) {
    if (sessao.get("kiesel-nav") === "1") { cortina.classList.add("entra"); sessao.set("kiesel-nav", "0"); requestAnimationFrame(() => requestAnimationFrame(() => { cortina.classList.remove("entra"); cortina.classList.add("sai"); setTimeout(() => cortina.classList.remove("sai"), 800); })); }
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]"); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const h = a.getAttribute("href"); if (!h || h.startsWith("#") || h.startsWith("http") || h.startsWith("mailto") || h.startsWith("tel") || a.target === "_blank" || a.hasAttribute("download")) return;
      if (!/\.html(\?|#|$)/.test(h)) return;
      e.preventDefault(); sessao.set("kiesel-nav", "1"); cortina.classList.add("entra");
      setTimeout(() => { location.href = h; }, 520);
    });
  }

  // ---------- preloader ----------
  const pre = $("#pre"), heroi = $("#heroi");
  // Os números já vêm certos no HTML (leitura de tela, buscador e celular sem animação veem o valor real).
  // A contagem só roda quando o número aparece na tela, e termina sempre no valor certo.
  function contaNumeros() {
    const els = $$("[data-n]"); if (!els.length || reduz || !("IntersectionObserver" in window)) return;
    const ioN = new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return; ioN.unobserve(en.target);
      const el = en.target, fim = +el.dataset.n, t0 = performance.now(), dur = 1400;
      (function passo(t) { const p = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 3); el.textContent = p < 1 ? Math.round(fim * e) : fim; if (p < 1) requestAnimationFrame(passo); })(t0);
      setTimeout(() => { el.textContent = fim; }, dur + 400);
    }), { threshold: 0.4 });
    els.forEach(el => ioN.observe(el));
  }
  function mostraHeroi() { if (heroi) heroi.classList.add("pronto"); contaNumeros(); }
  if (pre && sessao.get("kiesel-pre") !== "1" && !reduz) {
    document.body.classList.add("travada");
    const c = $("#pre-conta"), barra = $("#pre-barra"); const t0 = performance.now(), dur = 1700;
    (function passo(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 2.2);
      if (c) c.textContent = Math.round(100 * e); if (barra) barra.style.transform = "scaleX(" + e + ")";
      if (p < 1) requestAnimationFrame(passo); else { pre.classList.add("sai"); document.body.classList.remove("travada"); sessao.set("kiesel-pre", "1"); setTimeout(mostraHeroi, 250); setTimeout(() => pre.remove(), 1200); }
    })(t0);
  } else { if (pre) pre.remove(); mostraHeroi(); }

  // ---------- herói: filme aéreo em loop ----------
  // Toca sem som e em repetição; pausa fora da tela e com a aba escondida. Quem economiza dados vê o quadro parado
  // e o botão de tocar. O botão de pausa atende quem não quer movimento (WCAG 2.2.2).
  const vid = $("#heroi-video"), pausa = $("#heroi-pausa"), filme = $("#heroi-fotos");
  let querPausado = false, heroiVisivel = true, modalAberto = false;
  if (vid) {
    const economia = !!(navigator.connection && navigator.connection.saveData) || matchMedia("(prefers-reduced-data: reduce)").matches;
    const botao = () => { const p = vid.paused; pausa.setAttribute("aria-pressed", String(p)); pausa.setAttribute("aria-label", p ? "Tocar o vídeo de fundo" : "Pausar o vídeo de fundo"); pausa.classList.toggle("parado", p); };
    const tenta = () => {
      if (querPausado || !heroiVisivel || modalAberto || document.hidden) return;
      vid.preload = "auto";
      const r = vid.play(); if (r && r.catch) r.catch(() => { pausa.hidden = false; botao(); });
    };
    vid.addEventListener("playing", () => { filme.classList.add("tocando"); pausa.hidden = false; botao(); });
    vid.addEventListener("pause", botao);
    pausa.addEventListener("click", () => { if (vid.paused) { querPausado = false; tenta(); } else { querPausado = true; vid.pause(); } });
    if ("IntersectionObserver" in window) new IntersectionObserver(ents => { heroiVisivel = ents[0].isIntersecting; if (heroiVisivel) tenta(); else vid.pause(); }, { threshold: 0.05 }).observe(filme);
    document.addEventListener("visibilitychange", () => { if (document.hidden) vid.pause(); else tenta(); });
    if (economia) { querPausado = true; pausa.hidden = false; botao(); } else tenta();
  }
  // filme completo: YouTube da Kiesel, só depois do clique (sem cookies de rastreamento até a pessoa pedir)
  const abreFilme = $("#filme-abrir");
  if (abreFilme) abreFilme.addEventListener("click", () => {
    const veu = document.createElement("div");
    veu.className = "filme-modal"; veu.setAttribute("role", "dialog"); veu.setAttribute("aria-modal", "true"); veu.setAttribute("aria-label", "Filme: São Martinho vista do alto");
    veu.innerHTML = '<div class="filme-caixa"><div class="filme-topo"><b>São Martinho vista do alto</b><button type="button" class="filme-fechar" aria-label="Fechar o filme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="filme-tela"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(abreFilme.dataset.yt) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="São Martinho vista do alto, filme no YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="filme-nota">Filme exibido pelo YouTube da Kiesel. Ao assistir, o YouTube recebe o seu acesso.</p></div>';
    modalAberto = true; if (vid) vid.pause();
    const fecha = () => { veu.remove(); document.body.classList.remove("travada"); document.removeEventListener("keydown", tecla); if (lenis) lenis.start(); modalAberto = false; abreFilme.focus(); if (vid) setTimeout(() => { if (!querPausado && heroiVisivel) vid.play().catch(() => { }); }, 50); };
    const tecla = e => { if (e.key === "Escape") fecha(); };
    veu.addEventListener("click", e => { if (e.target === veu || e.target.closest(".filme-fechar")) fecha(); });
    document.addEventListener("keydown", tecla);
    document.body.appendChild(veu); document.body.classList.add("travada"); if (lenis) lenis.stop();
    $(".filme-fechar", veu).focus();
  });

  // ---------- revelação por rolagem ----------
  const io = new IntersectionObserver(ents => {
    ents.forEach(en => {
      if (!en.isIntersecting) return; const el = en.target; io.unobserve(el);
      const pai = el.closest("[data-stagger]"); let atraso = 0;
      if (pai) { const irm = $$(".rv,.mask,.quadro", pai); atraso = Math.min(irm.indexOf(el), 8) * 90; }
      setTimeout(() => el.classList.add("ok"), atraso);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  $$(".rv,.mask,.quadro").forEach(el => io.observe(el));
  function revelaPassados() { $$(".rv:not(.ok),.mask:not(.ok),.quadro:not(.ok)").forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < 0 || (r.top < innerHeight && r.height === 0)) el.classList.add("ok"); }); }
  let rp = false; addEventListener("scroll", () => { if (rp) return; rp = true; requestAnimationFrame(() => { rp = false; revelaPassados(); afirmaScroll(); }); }, { passive: true });
  setTimeout(() => $$(".rv:not(.ok),.mask:not(.ok),.quadro:not(.ok)").forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add("ok"); }), 2500);

  // ---------- afirmação: palavras acendem conforme a rolagem ----------
  const afirma = $("#afirma-texto"), pals = afirma ? $$(".pal", afirma) : [];
  function afirmaScroll() {
    if (!afirma) return; const r = afirma.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
    const n = Math.round(p * pals.length); pals.forEach((el, k) => el.classList.toggle("on", k < n));
  }
  afirmaScroll();

  // ---------- rolagem suave + efeitos com GSAP ----------
  let lenis = null;
  if (mouse && !reduz && window.Lenis) { try { lenis = new Lenis({ lerp: 0.09 }); } catch (e) { lenis = null; } }
  if (temGsap) {
    if (lenis) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    $$("[data-parallax]").forEach(el => { const f = +el.dataset.parallax || 8; gsap.fromTo(el, { yPercent: -f }, { yPercent: f, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }); });
    const gal = $("#galeria"); if (gal && mouse) gsap.to(gal, { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".imovel-galeria", start: "top top", end: "bottom top", scrub: true } });
    const ch = $(".chamada h2"); if (ch) gsap.from(ch, { xPercent: -5, ease: "none", scrollTrigger: { trigger: ".chamada", start: "top bottom", end: "bottom top", scrub: true } });
    // seleção horizontal pinada (só telas largas)
    const pin = $("#selecao-pin"), trilho = $("#trilho-h");
    if (pin && trilho && largo()) {
      const dist = () => trilho.scrollWidth - innerWidth + 40;
      const pecas = $$(".peca", trilho), prog = $("#selecao-prog"), cont = $("#selecao-cont");
      gsap.to(trilho, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "#selecao", start: "top top", end: () => "+=" + dist(), pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: st => { if (prog) prog.style.transform = "scaleX(" + st.progress + ")"; if (cont) cont.textContent = String(Math.min(pecas.length, 1 + Math.floor(st.progress * pecas.length))).padStart(2, "0") + " / " + String(pecas.length).padStart(2, "0"); } } });
    }
    // tema escuro ao passar por seções marcadas
    $$("[data-tema='escuro']").forEach(sec => {
      ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 45%", onEnter: () => document.body.classList.add("tema-escuro"), onLeave: () => document.body.classList.remove("tema-escuro"), onEnterBack: () => document.body.classList.add("tema-escuro"), onLeaveBack: () => document.body.classList.remove("tema-escuro") });
    });
    // cartões empilhados
    const cartoes = $$("#pilha .cartao");
    if (cartoes.length && innerWidth > 860) cartoes.forEach((c, i) => { const prox = cartoes[i + 1]; if (!prox) return; gsap.to(c, { scale: 0.94, opacity: 0.6, ease: "none", scrollTrigger: { trigger: prox, start: "top 80%", end: "top 20%", scrub: true } }); });
    // palavra gigante do rodapé sobe com a rolagem
    const gig = $(".rodape .gigante"); if (gig) gsap.from(gig, { yPercent: 30, ease: "none", scrollTrigger: { trigger: ".rodape", start: "top bottom", end: "bottom bottom", scrub: true } });
  } else if (lenis) { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0); }
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute("href").length < 2) return;
    const alvo = $(a.getAttribute("href")); if (!alvo) return; e.preventDefault();
    if (lenis) lenis.scrollTo(alvo, { offset: -80 }); else alvo.scrollIntoView({ behavior: reduz ? "auto" : "smooth" });
  });

  // ---------- cursor, rótulo e botões magnéticos ----------
  if (mouse && !reduz) {
    const c = $(".cursor"), rot = $("#cursor-rotulo");
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; if (c) c.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)"; }, { passive: true });
    (function anel() { rx += (mx - rx) * .16; ry += (my - ry) * .16; if (rot) rot.style.transform = "translate(" + rx + "px," + ry + "px)"; const bf = $("#bairro-foto"); if (bf && bf.classList.contains("vis")) bf.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%) scale(1)"; requestAnimationFrame(anel); })();
    document.addEventListener("mouseover", e => { const al = e.target.closest("[data-cursor]"); if (rot) { if (al) { $("span", rot).textContent = al.dataset.cursor; rot.classList.add("vis"); } else rot.classList.remove("vis"); } });
    document.addEventListener("mouseleave", () => { if (c) c.style.opacity = 0; });
    document.addEventListener("mouseenter", () => { if (c) c.style.opacity = 1; });
    $$(".btn").forEach(b => {
      b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); const dx = (e.clientX - r.left - r.width / 2) / r.width, dy = (e.clientY - r.top - r.height / 2) / r.height; b.style.transform = "translate(" + dx * 8 + "px," + dy * 8 + "px)"; });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
    // foto do bairro acompanha o mouse
    const bf = $("#bairro-foto");
    if (bf) $$(".bairro[data-foto]").forEach(a => {
      a.addEventListener("mouseenter", () => { $("img", bf).src = a.dataset.foto; bf.classList.add("vis"); });
      a.addEventListener("mouseleave", () => bf.classList.remove("vis"));
    });
  }

  // ---------- relógio de São Martinho ----------
  const rel = $("#relogio");
  if (rel) { const tic = () => { try { rel.textContent = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date()); } catch (e) { rel.textContent = new Date().toTimeString().slice(0, 5); } }; tic(); setInterval(tic, 20000); }

  // ---------- busca da home ----------
  const fb = $("#form-busca");
  if (fb) {
    $$(".alterna button", fb).forEach(b => b.addEventListener("click", () => { $$(".alterna button", fb).forEach(o => o.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); $("#b-fin").value = b.dataset.fin; }));
    fb.addEventListener("submit", () => { $$("select", fb).forEach(s => { if (!s.value) s.disabled = true; }); setTimeout(() => $$("select", fb).forEach(s => s.disabled = false), 500); });
  }

  // ---------- catálogo ----------
  const grade = $("#grade");
  var estado = { fin: "comprar", tipo: "", bairro: "", quartos: "", ordem: "recentes", busca: "", pag: 1 };
  var filtra;
  if (grade && pagina === "imoveis") {
    const POR = 12;
    const itens = $$(".item", grade), vazio = $("#vazio"), pagin = $("#paginacao");
    const fT = $("#f-tipo"), fB = $("#f-bairro"), fQ = $("#f-quartos"), fO = $("#f-ordem"), fS = $("#f-busca");
    const fins = $$("#filtros .alterna button");
    if (["comprar", "alugar", "favoritos"].indexOf(params.get("fin")) >= 0) estado.fin = params.get("fin");
    if (params.get("tipo")) estado.tipo = params.get("tipo");
    if (params.get("bairro")) estado.bairro = params.get("bairro");
    if (params.get("quartos")) estado.quartos = params.get("quartos");
    if (params.get("q")) estado.busca = params.get("q");
    fT.value = estado.tipo; if (fT.value !== estado.tipo) estado.tipo = "";
    fB.value = estado.bairro; if (fB.value !== estado.bairro) estado.bairro = "";
    fQ.value = estado.quartos; fS.value = estado.busca;
    fins.forEach(b => b.setAttribute("aria-pressed", b.dataset.fin === estado.fin ? "true" : "false"));
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    filtra = function () {
      const l = favs(); const q = norm(estado.busca.trim());
      let vis = itens.filter(it => {
        if (estado.fin === "favoritos") { if (l.indexOf(it.dataset.ref) < 0) return false; } else if (it.dataset.fin !== estado.fin) return false;
        if (estado.tipo && it.dataset.tipo !== estado.tipo) return false;
        if (estado.bairro && it.dataset.bairro !== estado.bairro) return false;
        if (estado.quartos && +it.dataset.quartos < +estado.quartos) return false;
        if (q && norm(it.dataset.busca).indexOf(q) < 0 && norm(it.dataset.ref).indexOf(q) < 0) return false;
        return true;
      });
      const o = estado.ordem;
      vis.sort((a, b) => o === "menor" ? a.dataset.preco - b.dataset.preco : o === "maior" ? b.dataset.preco - a.dataset.preco : o === "area" ? b.dataset.area - a.dataset.area : (b.dataset.data.localeCompare(a.dataset.data) || b.dataset.preco - a.dataset.preco));
      const paginas = Math.max(1, Math.ceil(vis.length / POR)); if (estado.pag > paginas) estado.pag = paginas;
      itens.forEach(it => { it.hidden = true; });
      vis.forEach((it, i) => { grade.appendChild(it); it.hidden = !(i >= (estado.pag - 1) * POR && i < estado.pag * POR); });
      grade.appendChild(vazio); vazio.hidden = vis.length > 0;
      $("#res-n").textContent = vis.length; $("#res-txt").textContent = vis.length === 1 ? "imóvel" : "imóveis";
      const partes = [];
      partes.push(estado.fin === "favoritos" ? "nos favoritos" : estado.fin === "alugar" ? "para alugar" : "à venda");
      if (estado.tipo) partes.push(estado.tipo.toLowerCase()); if (estado.bairro) partes.push("em " + estado.bairro); if (estado.quartos) partes.push(estado.quartos + "+ quartos"); if (q) partes.push("“" + estado.busca.trim() + "”");
      $("#res-fil").textContent = partes.join(" · ");
      pagin.innerHTML = paginas > 1 ? Array.from({ length: paginas }, (_, i) => '<button type="button" class="num" data-pag="' + (i + 1) + '"' + (i + 1 === estado.pag ? ' aria-current="page"' : "") + ">" + (i + 1) + "</button>").join("") : "";
      const u = new URL(location.href); u.search = ""; const p = u.searchParams;
      if (estado.fin !== "comprar") p.set("fin", estado.fin); if (estado.tipo) p.set("tipo", estado.tipo); if (estado.bairro) p.set("bairro", estado.bairro); if (estado.quartos) p.set("quartos", estado.quartos); if (estado.busca.trim()) p.set("q", estado.busca.trim()); if (estado.pag > 1) p.set("pag", estado.pag);
      try { history.replaceState(null, "", u.pathname.split("/").pop() + (p.toString() ? "?" + p.toString() : "")); } catch (e) { }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      // se a barra de filtros ficou escondida atrás do cabeçalho, traz de volta
      const fil = $("#filtros"), rf = fil.getBoundingClientRect();
      if (rf.top < 60 || rf.top > innerHeight) { const y = window.scrollY + rf.top - 70; if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }
    };
    fins.forEach(b => b.addEventListener("click", () => { fins.forEach(o => o.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); estado.fin = b.dataset.fin; estado.pag = 1; filtra(); }));
    fT.addEventListener("change", () => { estado.tipo = fT.value; estado.pag = 1; filtra(); });
    fB.addEventListener("change", () => { estado.bairro = fB.value; estado.pag = 1; filtra(); });
    fQ.addEventListener("change", () => { estado.quartos = fQ.value; estado.pag = 1; filtra(); });
    fO.addEventListener("change", () => { estado.ordem = fO.value; estado.pag = 1; filtra(); });
    let tS; fS.addEventListener("input", () => { clearTimeout(tS); tS = setTimeout(() => { estado.busca = fS.value; estado.pag = 1; filtra(); }, 180); });
    $("#f-limpar").addEventListener("click", () => { estado = { fin: "comprar", tipo: "", bairro: "", quartos: "", ordem: "recentes", busca: "", pag: 1 }; fT.value = ""; fB.value = ""; fQ.value = ""; fO.value = "recentes"; fS.value = ""; fins.forEach(o => o.setAttribute("aria-pressed", o.dataset.fin === "comprar" ? "true" : "false")); filtra(); });
    pagin.addEventListener("click", e => { const b = e.target.closest("[data-pag]"); if (!b) return; estado.pag = +b.dataset.pag; filtra(); const alvo = $("#filtros"); if (lenis) lenis.scrollTo(alvo, { offset: -90 }); else alvo.scrollIntoView({ behavior: reduz ? "auto" : "smooth" }); });
    if (params.get("pag")) estado.pag = +params.get("pag") || 1;
    filtra();
  }

  // ---------- galeria da página do imóvel ----------
  const gal = $("#galeria");
  if (gal) {
    const slides = $$(".slide", gal), minis = $$("#miniaturas button"), atual = $("#g-atual");
    let i = 0;
    function vai(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("ativo", k === i));
      minis.forEach((m, k) => { m.classList.toggle("ativa", k === i); if (k === i && m.scrollIntoView) m.scrollIntoView({ block: "nearest", inline: "center", behavior: reduz ? "auto" : "smooth" }); });
      if (atual) atual.textContent = i + 1;
      const prox = slides[(i + 1) % slides.length]; const im = prox && $("img", prox); if (im && im.loading === "lazy") im.loading = "eager";
    }
    const bA = $("#g-ant"), bP = $("#g-prox");
    if (bA) bA.addEventListener("click", () => vai(i - 1)); if (bP) bP.addEventListener("click", () => vai(i + 1));
    minis.forEach(m => m.addEventListener("click", () => vai(+m.dataset.i)));
    addEventListener("keydown", e => { if (e.target.matches("input,textarea,select")) return; if (e.key === "ArrowRight") vai(i + 1); if (e.key === "ArrowLeft") vai(i - 1); });
    let tx = null; gal.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
    gal.addEventListener("touchend", e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) vai(dx < 0 ? i + 1 : i - 1); tx = null; }, { passive: true });
    const comp = $("#ficha-compart");
    if (comp) comp.addEventListener("click", async () => {
      const dados = { title: document.title, url: location.href };
      try { if (navigator.share) { await navigator.share(dados); return; } } catch (e) { if (e && e.name === "AbortError") return; }
      try { await navigator.clipboard.writeText(location.href); aviso("Link copiado"); } catch (e) { prompt("Copie o link:", location.href); }
    });
  }

  // ---------- financiamento ----------
  function price(pv, i, n) { return i ? pv * i / (1 - Math.pow(1 + i, -n)) : pv / n; }
  const fBolso = $("#form-bolso");
  if (fBolso) {
    const calc = () => {
      const renda = +$("#bolso-renda").value || 0, j = (+$("#bolso-juros").value || 0) / 100, i = Math.pow(1 + j, 1 / 12) - 1, n = 360;
      const parcela = renda * .3; const pv = i ? parcela * (1 - Math.pow(1 + i, -n)) / i : parcela * n; const valor = pv / .8;
      $("#bolso-valor").textContent = "R$ " + num(Math.round(valor / 1000) * 1000);
      $("#bolso-parcela").textContent = "parcela de R$ " + num(parcela) + " por mês, 20% de entrada (R$ " + num(valor * .2) + ")";
    };
    fBolso.addEventListener("input", calc); calc();
  }
  const fFin = $("#form-fin");
  if (fFin) {
    if (params.get("valor")) $("#fin-valor").value = +params.get("valor") || $("#fin-valor").value;
    const calc = () => {
      const valor = +$("#fin-valor").value || 0, ent = +$("#fin-entrada").value, j = (+$("#fin-juros").value || 0) / 100, n = +$("#fin-prazo").value, i = Math.pow(1 + j, 1 / 12) - 1;
      $("#fin-entrada-v").textContent = ent + "% (R$ " + num(valor * ent / 100) + ")";
      const pv = valor * (1 - ent / 100);
      const p1 = price(pv, i, n), sacA = pv / n, sac1 = sacA + pv * i, sacF = sacA + sacA * i;
      $("#fin-parcela").textContent = "R$ " + num(p1) + " × R$ " + num(sac1);
      $("#fin-financiado").textContent = "financiando R$ " + num(pv) + " em " + n + " meses a " + (j * 100).toLocaleString("pt-BR") + "% ao ano";
      const totSac = sacA * n + pv * i * (n + 1) / 2;
      $("#fin-tabela").innerHTML = "<tr><td>Price</td><td>R$ " + num(p1) + "</td><td>R$ " + num(p1) + "</td><td>R$ " + num(p1 * n) + "</td></tr><tr><td>SAC</td><td>R$ " + num(sac1) + "</td><td>R$ " + num(sacF) + "</td><td>R$ " + num(totSac) + "</td></tr>";
    };
    fFin.addEventListener("input", calc); calc();
  }

  // ---------- formulários → WhatsApp ----------
  const v = id => { const el = $(id); return el ? el.value.trim() : ""; };
  const fEnc = $("#form-enc");
  if (fEnc) fEnc.addEventListener("submit", e => {
    e.preventDefault();
    let m = "Olá, quero encomendar um imóvel.\nNome: " + v("#enc-nome") + (v("#enc-fone") ? "\nTelefone: " + v("#enc-fone") : "") + "\nTipo: " + v("#enc-tipo") + " para " + v("#enc-fin").toLowerCase();
    if (v("#enc-bairro")) m += "\nBairro: " + v("#enc-bairro"); if (v("#enc-valor")) m += "\nAté R$ " + num(v("#enc-valor")); if (v("#enc-obs")) m += "\nDetalhes: " + v("#enc-obs");
    abreZap(m);
  });
  const fAn = $("#form-anuncie");
  if (fAn) fAn.addEventListener("submit", e => {
    e.preventDefault();
    let m = "Olá, quero anunciar um imóvel com a Kiesel.\nNome: " + v("#an-nome") + (v("#an-fone") ? "\nTelefone: " + v("#an-fone") : "") + "\n" + v("#an-tipo") + " para " + v("#an-fin").toLowerCase();
    if (v("#an-end")) m += "\nLocal: " + v("#an-end"); if (v("#an-obs")) m += "\nDetalhes: " + v("#an-obs");
    abreZap(m);
  });
  const fCt = $("#form-contato");
  if (fCt) fCt.addEventListener("submit", e => {
    e.preventDefault();
    abreZap("Olá, meu nome é " + v("#ct-nome") + "." + (v("#ct-fone") ? " Telefone: " + v("#ct-fone") + "." : "") + (v("#ct-msg") ? "\n" + v("#ct-msg") : " Quero conversar sobre um imóvel."));
  });
});
