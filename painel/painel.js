/* Kiesel · Painel de imóveis.
   Fala direto com o Supabase (Auth, REST e Storage) por fetch; sem biblioteca. Com ?demo na URL, roda sem banco
   (dados de exemplo guardados só neste navegador), para mostrar o painel antes de ligar tudo. */
(function () {
  "use strict";
  const M = window.KieselModelo, S = M.SUPA;
  const DEMO = /[?&]demo\b/.test(location.search);
  const SITE_PUB = /kiesel-site\.vercel\.app|localhost|127\.0\.0\.1/.test(location.host) ? location.origin : "https://kiesel-site.vercel.app";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = M.esc;
  const app = $("#app");
  const sem = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const hoje = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const fotoURL = (f, t) => !f ? "/assets/sem-foto.svg" : /^(https?:|blob:|data:)/.test(f) ? (/^https?:/.test(f) ? M.foto(f, t) : f) : "/" + M.foto(f, t);
  const linkSite = ref => SITE_PUB + "/imovel-" + ref + "?fresco=1";

  const I = {
    mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    menos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/></svg>',
    busca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    estrela: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/></svg>',
    editar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
    pontos: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    olhoNao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    etiqueta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
    volta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 14l-5-5 5-5M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
    lixo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    sair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/></svg>',
    chave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/></svg>',
    externo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
    foto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/></svg>',
    envia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9.5"/><path d="M12 12v9M8.5 15.5L12 12l3.5 3.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    esq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    dir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    alerta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 8v5M12 16.5v.5M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    casa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/></svg>'
  };
  const PREFIXO = { "Casa": "CA", "Apartamento": "AP", "Terreno": "TE", "Chácara": "CH", "Área rural": "AR", "Prédio": "PR", "Sala comercial": "SA" };
  const COMODIDADES_BASE = ["Água", "Energia elétrica", "Esgoto", "Pavimentação", "Pátio", "Churrasqueira", "Piscina", "Lavanderia", "Cozinha", "Armários na cozinha", "Armários no banheiro", "Armários na lavanderia", "Piso cerâmico", "Porcelanato", "Piso de madeira", "Ar-condicionado", "Portão eletrônico", "Varanda", "Escritório", "Despensa", "Lavabo", "Cercado", "Pomar", "Açude", "Aceita animais", "Gera renda"];
  const STATUS = { disponivel: ["No site", "et-disponivel"], vendido: ["Vendido / alugado", "et-vendido"], oculto: ["Oculto", "et-oculto"] };

  // =====================================================================
  // sessão e acesso ao banco
  // =====================================================================
  const SES = DEMO ? "kiesel-painel-sessao-demo" : "kiesel-painel-sessao";
  const guarda = { get: k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  let sessao = guarda.get(SES);
  function salvaSessao(d) {
    sessao = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (Number(d.expires_in) || 3600), email: (d.user && d.user.email) || (sessao && sessao.email) || "" };
    guarda.set(SES, sessao);
  }
  function erro(msg, extra) { const e = new Error(msg); Object.assign(e, extra || {}); return e; }
  const SEM_REDE = "Sem conexão com a internet agora. Nada foi perdido: confira a conexão e tente de novo.";
  async function chama(url, op) {
    try { return await fetch(url, op); } catch (e) { throw erro(SEM_REDE, { rede: true }); }
  }
  function traduzAuth(j, st) {
    const m = sem(j.error_description || j.msg || j.message || j.error || j.error_code || "");
    if (st === 429 || m.includes("rate limit")) return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
    if (m.includes("invalid login") || m.includes("invalid_credentials") || m.includes("invalid grant")) return "E-mail ou senha incorretos.";
    if (m.includes("not confirmed")) return "Este e-mail ainda não foi confirmado. Abra o convite que chegou por e-mail.";
    if (m.includes("same") && m.includes("password")) return "A nova senha precisa ser diferente da atual.";
    if (m.includes("weak") || m.includes("at least") || m.includes("should be")) return "Senha fraca: use pelo menos 8 caracteres, misturando letras e números.";
    if (m.includes("expired") || m.includes("invalid") && m.includes("token")) return "O link expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\".";
    return "Não foi possível concluir agora. Tente de novo em instantes.";
  }
  async function auth(caminho, corpo, metodo, tk) {
    const r = await chama(S.url + "/auth/v1/" + caminho, { method: metodo || "POST", headers: Object.assign({ apikey: S.chave, "Content-Type": "application/json" }, tk ? { Authorization: "Bearer " + tk } : {}), body: corpo ? JSON.stringify(corpo) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw erro(traduzAuth(j, r.status), { status: r.status });
    return j;
  }
  let renovando = null;
  async function renova() {
    if (!sessao || !sessao.refresh_token) throw erro("Sua sessão terminou. Entre de novo.", { sessao: true });
    if (!renovando) renovando = auth("token?grant_type=refresh_token", { refresh_token: sessao.refresh_token }).then(salvaSessao).catch(e => { if (!e.rede) { sessao = null; guarda.set(SES, null); } throw e.rede ? e : erro("Sua sessão terminou. Entre de novo.", { sessao: true }); }).finally(() => { renovando = null; });
    return renovando;
  }
  async function token() {
    if (!sessao) throw erro("Sua sessão terminou. Entre de novo.", { sessao: true });
    if (sessao.expires_at - 90 < Date.now() / 1000) await renova();
    return sessao.access_token;
  }
  function traduzRest(j, st, ctx) {
    const c = j.code || "", m = sem(j.message || "");
    if (c === "23505") return ctx && ctx.ref ? `Já existe um imóvel com o código ${ctx.ref}. Use outro código.` : "Esse registro já existe.";
    if (c === "42501" || st === 403) return "Seu usuário não tem permissão para alterar imóveis. Peça para incluírem o seu e-mail na equipe do painel.";
    if (c === "23514" || c === "22P02") return "Algum campo está com um valor inválido. Confira os números e o código do imóvel.";
    if (c === "42P01" || m.includes("does not exist")) return "O banco do painel ainda não foi preparado (falta rodar o arquivo kiesel.sql no Supabase).";
    if (st >= 500) return "O banco de dados não respondeu. Tente de novo em instantes.";
    return "Não foi possível salvar: " + (j.message || "erro " + st) + ".";
  }
  async function rest(caminho, o) {
    o = o || {};
    const faz = async () => chama(S.url + "/rest/v1/" + caminho, { method: o.metodo || "GET", headers: Object.assign({ apikey: S.chave, Authorization: "Bearer " + (await token()), "Content-Type": "application/json", Accept: "application/json" }, o.prefer ? { Prefer: o.prefer } : {}), body: o.corpo ? JSON.stringify(o.corpo) : undefined });
    let r = await faz();
    if (r.status === 401) { await renova(); r = await faz(); }
    if (r.status === 401) throw erro("Sua sessão terminou. Entre de novo.", { sessao: true });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw erro(traduzRest(j, r.status, o.ctx), { status: r.status }); }
    if (r.status === 204) return null;
    const t = await r.text(); return t ? JSON.parse(t) : null;
  }
  const caminhoBalde = url => { const m = String(url).split("/storage/v1/object/public/" + S.balde + "/")[1]; return m ? decodeURIComponent(m.split("?")[0]) : null; };
  const SEM_PERMISSAO = "Seu usuário não tem permissão para alterar imóveis. Peça para incluírem o seu e-mail na equipe do painel.";

  const nuvem = {
    async entrar(email, senha) { salvaSessao(await auth("token?grant_type=password", { email, password: senha })); },
    async recuperar(email) { await auth("recover?redirect_to=" + encodeURIComponent(location.origin + location.pathname), { email }); },
    async novaSenha(senha) { await auth("user", { password: senha }, "PUT", await token()); },
    async sair() { const tk = sessao && sessao.access_token; sessao = null; guarda.set(SES, null); if (tk) { try { await fetch(S.url + "/auth/v1/logout", { method: "POST", headers: { apikey: S.chave, Authorization: "Bearer " + tk } }); } catch (e) { } } },
    async equipe() { return rest("kiesel_equipe?select=email,nome"); },
    async listar() { return rest(S.tabela + "?select=*&order=alterado_em.desc"); },
    async criar(d) { const r = await rest(S.tabela, { metodo: "POST", corpo: d, prefer: "return=representation", ctx: { ref: d.ref } }); if (!r || !r.length) throw erro(SEM_PERMISSAO); return r[0]; },
    async alterar(ref, d) { const r = await rest(S.tabela + "?ref=eq." + encodeURIComponent(ref), { metodo: "PATCH", corpo: d, prefer: "return=representation" }); if (!r || !r.length) throw erro(SEM_PERMISSAO); return r[0]; },
    async excluir(ref) { const r = await rest(S.tabela + "?ref=eq." + encodeURIComponent(ref), { metodo: "DELETE", prefer: "return=representation" }); if (!r || !r.length) throw erro(SEM_PERMISSAO); },
    async enviarFoto(caminho, blob) {
      const faz = async () => chama(S.url + "/storage/v1/object/" + S.balde + "/" + caminho, { method: "POST", headers: { apikey: S.chave, Authorization: "Bearer " + (await token()), "Content-Type": blob.type, "Cache-Control": "31536000", "x-upsert": "false" }, body: blob });
      let r = await faz(); if (r.status === 401) { await renova(); r = await faz(); }
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw erro(r.status === 403 || /policy|unauthorized/i.test(j.message || j.error || "") ? SEM_PERMISSAO : r.status === 413 ? "Foto grande demais." : "A foto não subiu (" + (j.message || r.status) + ")."); }
      return S.url + "/storage/v1/object/public/" + S.balde + "/" + caminho;
    },
    async apagarFotos(urls) {
      const prefixes = urls.map(caminhoBalde).filter(Boolean).flatMap(c => [c, c.replace(/-g\.(webp|jpg)$/, "-p.$1")]); if (!prefixes.length) return;
      await chama(S.url + "/storage/v1/object/" + S.balde, { method: "DELETE", headers: { apikey: S.chave, Authorization: "Bearer " + (await token()), "Content-Type": "application/json" }, body: JSON.stringify({ prefixes }) });
    }
  };

  // modo demonstração: mesma interface, dados só neste navegador
  const DEMO_K = "kiesel-painel-demo-v1";
  const demo = {
    lista: null,
    async carrega() {
      if (this.lista) return;
      const g = guarda.get(DEMO_K); if (g) { this.lista = g; return; }
      if (!window.IMOVEIS) await new Promise((ok, falha) => { const s = document.createElement("script"); s.src = "/dados.js"; s.onload = ok; s.onerror = falha; document.head.appendChild(s); });
      this.lista = window.IMOVEIS.map(x => Object.assign(M.normaliza(x), { status: "disponivel", alterado_em: x.atualizado + "T12:00:00Z", alterado_por: null }));
    },
    grava() { guarda.set(DEMO_K, this.lista.map(x => Object.assign({}, x, { fotos: x.fotos.filter(f => !/^blob:/.test(f)) }))); },
    espera: () => new Promise(r => setTimeout(r, 260)),
    async entrar(email) { await this.espera(); salvaSessao({ access_token: "demo", refresh_token: "demo", expires_in: 86400, user: { email: email || "demo@kiesel" } }); },
    async recuperar() { await this.espera(); },
    async novaSenha() { await this.espera(); },
    async sair() { sessao = null; guarda.set(SES, null); },
    async equipe() { return [{ email: sessao.email, nome: "Demonstração" }]; },
    async listar() { await this.carrega(); return this.lista.map(x => Object.assign({}, x)); },
    async criar(d) { await this.carrega(); await this.espera(); if (this.lista.some(x => x.ref === d.ref)) throw erro(`Já existe um imóvel com o código ${d.ref}. Use outro código.`); const r = Object.assign({}, d, { alterado_em: new Date().toISOString(), alterado_por: sessao.email }); this.lista.unshift(r); this.grava(); return Object.assign({}, r); },
    async alterar(ref, d) { await this.carrega(); await this.espera(); const x = this.lista.find(y => y.ref === ref); Object.assign(x, d, { alterado_em: new Date().toISOString(), alterado_por: sessao.email }); this.grava(); return Object.assign({}, x); },
    async excluir(ref) { await this.carrega(); await this.espera(); this.lista = this.lista.filter(y => y.ref !== ref); this.grava(); },
    async enviarFoto(caminho, blob) { await this.espera(); return URL.createObjectURL(blob); },
    async apagarFotos() { }
  };
  const api = DEMO ? demo : nuvem;

  // =====================================================================
  // utilidades de tela
  // =====================================================================
  function aviso(texto, o) {
    o = o || {};
    const box = $("#avisos"), el = document.createElement("div");
    // um aviso novo substitui o anterior do mesmo tipo e nunca empilham mais de 2
    $$(".aviso" + (o.erro ? ".erro" : ":not(.erro)"), box).forEach(a => a.remove());
    while (box.children.length > 1) box.firstChild.remove();
    el.className = "aviso" + (o.erro ? " erro" : "");
    el.innerHTML = (o.erro ? I.alerta : I.ok) + "<span>" + esc(texto) + "</span>" + (o.acao ? `<a href="#" role="button">${esc(o.acao)}</a>` : "") + (o.link ? `<a href="${esc(o.link[1])}" target="_blank" rel="noopener">${esc(o.link[0])}</a>` : "");
    if (o.acao) $("a[role=button]", el).addEventListener("click", e => { e.preventDefault(); el.remove(); o.fn(); });
    box.appendChild(el);
    setTimeout(() => el.remove(), o.tempo || (o.erro ? 7000 : 5200));
  }
  function dialogo({ titulo, texto, foto, corpo, botoes }) {
    return new Promise(resolve => {
      const veu = document.createElement("div"); veu.className = "veu";
      veu.innerHTML = `<div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="dlg-t">${foto ? `<div class="dfoto"><img src="${esc(foto)}" alt=""></div>` : ""}<div class="dcorpo"><h2 id="dlg-t">${esc(titulo)}</h2>${texto ? `<p>${texto}</p>` : ""}${corpo || ""}</div><div class="dacoes">${botoes.map((b, i) => `<button type="button" class="btn ${b.classe || "btn-linha"}${b.esq ? " esq" : ""}" data-i="${i}">${b.texto}</button>`).join("")}</div></div>`;
      const anterior = document.activeElement;
      const fecha = v => { veu.remove(); document.body.classList.remove("travada"); document.removeEventListener("keydown", tecla); if (anterior && anterior.focus) anterior.focus(); resolve(v); };
      const tecla = e => { if (e.key === "Escape") fecha(null); if (e.key === "Tab") { const f = $$("button,input,a[href]", veu); const p = f[0], u = f[f.length - 1]; if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); } else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); } } };
      veu.addEventListener("click", async e => {
        if (e.target === veu) return fecha(null);
        const b = e.target.closest("button[data-i]"); if (!b) return;
        const def = botoes[+b.dataset.i];
        if (def.antes) { b.classList.add("carregando"); const ok = await def.antes(veu).catch(er => { mostraErroDialogo(veu, er.message); return false; }); b.classList.remove("carregando"); if (!ok) return; }
        fecha(def.valor);
      });
      document.addEventListener("keydown", tecla);
      document.body.appendChild(veu); document.body.classList.add("travada");
      const foco = $("input", veu) || $$("button[data-i]", veu).slice(-1)[0]; if (foco) foco.focus();
    });
  }
  function mostraErroDialogo(veu, msg) { let m = $(".msg-erro", veu); if (!m) { m = document.createElement("div"); m.className = "msg msg-erro"; m.style.marginTop = "14px"; $(".dcorpo", veu).appendChild(m); } m.textContent = msg; }
  const precoTela = x => x.preco ? M.preco({ finalidade: x.finalidade, preco: x.preco }) : "<span style='color:var(--tinta-3)'>Sem preço</span>";
  const dataBR = s => { if (!s) return ""; const d = new Date(s.length <= 10 ? s + "T12:00:00" : s); return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined }); };
  const inicial = s => (s || "?").trim().charAt(0);
  // mesma regra configurada no Supabase: 8+ caracteres, letras e números
  const senhaBoa = s => s.length >= 8 && /[A-Za-zÀ-ÿ]/.test(s) && /\d/.test(s);

  // =====================================================================
  // estado
  // =====================================================================
  const E = { lista: [], equipe: null, filtro: { status: "disponivel", tipo: "", busca: "", ordem: "alterado" }, ed: null, carregou: false };
  try { const f = JSON.parse(sessionStorage.getItem("kiesel-painel-filtro") || "null"); if (f) Object.assign(E.filtro, f); } catch (e) { }
  const guardaFiltro = () => { try { sessionStorage.setItem("kiesel-painel-filtro", JSON.stringify(E.filtro)); } catch (e) { } };

  // =====================================================================
  // entrada, senha nova e sem acesso
  // =====================================================================
  // lado esquerdo das telas de entrada: a marca e o que o painel faz (sem foto de imóvel)
  function ladoMarca(frase) {
    const itens = [[I.mais, "Cadastre imóveis com fotos, preço e descrição"], [I.editar, "Edite qualquer informação quando quiser"], [I.etiqueta, "Marque como vendido e ele sai do site"], [I.estrela, "Escolha os destaques da página inicial"]];
    return `<div class="entrada-marca">
    <div class="placa-logo"><img src="/assets/logo-topo.png" width="391" height="190" alt="Kiesel Negócios Imobiliários"></div>
    <div class="miolo-marca"><span class="rotulo-marca">Painel de imóveis</span><b>${esc(frase)}</b>
      <ul>${itens.map(([i, t]) => `<li><span class="ic">${i}</span>${t}</li>`).join("")}</ul></div>
    <p class="pe-marca">O site muda na hora em que você salva.<br>Kiesel Negócios Imobiliários · CRECI 45.125/RS</p>
  </div>`;
  }
  function telaEntrada(msg, tipoMsg) {
    document.title = "Entrar · Painel Kiesel";
    app.innerHTML = `${DEMO ? '<div class="demo-faixa">Modo demonstração: nada aqui vai para o site. Use qualquer e-mail e senha.</div>' : ""}
<main class="entrada">
  ${ladoMarca("Os imóveis da Kiesel, atualizados por quem conhece cada um.")}
  <div class="entrada-miolo">
    <div class="entrada-cartao">
      <img class="logo" src="/assets/logo-topo.png" width="391" height="190" alt="Kiesel Negócios Imobiliários">
      <h1>Painel de imóveis</h1>
      <p class="sub">Entre com o e-mail e a senha da sua conta.</p>
      <form id="f-entrar" novalidate>
        ${msg ? `<div class="msg msg-${tipoMsg || "erro"}" role="alert">${esc(msg)}</div>` : ""}
        <div class="campo"><label for="e-email">E-mail</label><input class="ent" id="e-email" type="email" autocomplete="username" inputmode="email" required></div>
        <div class="campo"><label for="e-senha">Senha</label><div class="senha-caixa"><input class="ent" id="e-senha" type="password" autocomplete="current-password" required><button class="ico-btn" type="button" id="ver-senha" aria-label="Mostrar senha" aria-pressed="false">${I.olho}</button></div></div>
        <button class="btn btn-azul" type="submit" id="b-entrar">Entrar</button>
        <div class="linha-fim"><a class="link" href="#" id="esqueci">Esqueci minha senha</a></div>
      </form>
      <p class="entrada-rodape">Kiesel Negócios Imobiliários · CRECI 45.125/RS</p>
    </div>
  </div>
</main>`;
    const f = $("#f-entrar"), em = $("#e-email"), se = $("#e-senha");
    const ultimo = guarda.get("kiesel-painel-email"); if (ultimo) { em.value = ultimo; } (ultimo ? se : em).focus();
    $("#ver-senha").addEventListener("click", e => { const b = e.currentTarget, v = se.type === "password"; se.type = v ? "text" : "password"; b.setAttribute("aria-pressed", v); b.setAttribute("aria-label", v ? "Esconder senha" : "Mostrar senha"); b.innerHTML = v ? I.olhoNao : I.olho; });
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const email = em.value.trim(), senha = se.value;
      if (!/^\S+@\S+\.\S+$/.test(email)) return mensagemEntrada("Digite o seu e-mail completo.", em);
      if (!senha) return mensagemEntrada("Digite a sua senha.", se);
      const b = $("#b-entrar"); b.classList.add("carregando"); b.disabled = true;
      try { await api.entrar(email, senha); guarda.set("kiesel-painel-email", email); await iniciaSessao(); }
      catch (er) { b.classList.remove("carregando"); b.disabled = false; mensagemEntrada(er.message, se); }
    });
    $("#esqueci").addEventListener("click", async e => {
      e.preventDefault();
      const r = await dialogo({ titulo: "Criar uma senha nova", texto: "Enviamos um link para o seu e-mail. Pelo link você escolhe a senha nova.", corpo: `<div class="campo"><label for="d-email">E-mail</label><input class="ent" id="d-email" type="email" autocomplete="username" value="${esc(em.value.trim())}"></div>`, botoes: [{ texto: "Cancelar", valor: null }, { texto: "Enviar link", classe: "btn-azul", valor: "ok", antes: async veu => { const v = $("#d-email", veu).value.trim(); if (!/^\S+@\S+\.\S+$/.test(v)) { mostraErroDialogo(veu, "Digite o seu e-mail completo."); return false; } await api.recuperar(v); return true; } }] });
      if (r) telaEntrada("Pronto. Se o e-mail estiver cadastrado, o link chega em alguns minutos (confira também o spam).", "ok");
    });
  }
  function mensagemEntrada(t, campo) {
    let m = $("#f-entrar .msg"); if (!m) { m = document.createElement("div"); m.setAttribute("role", "alert"); $("#f-entrar").prepend(m); }
    m.className = "msg msg-erro"; m.textContent = t; if (campo) campo.focus();
  }
  function telaNovaSenha(tipo) {
    document.title = "Nova senha · Painel Kiesel";
    app.innerHTML = `<main class="entrada">${ladoMarca(tipo === "invite" ? "Boas-vindas ao painel da Kiesel." : "Vamos criar uma senha nova.")}
  <div class="entrada-miolo"><div class="entrada-cartao">
    <img class="logo" src="/assets/logo-topo.png" width="391" height="190" alt="Kiesel Negócios Imobiliários">
    <h1>${tipo === "invite" ? "Crie a sua senha" : "Senha nova"}</h1>
    <p class="sub">${esc(sessao && sessao.email || "")}</p>
    <form id="f-senha" novalidate>
      <div class="campo"><label for="s1">Senha nova</label><input class="ent" id="s1" type="password" autocomplete="new-password" minlength="8" required><span class="dica">Pelo menos 8 caracteres, com letras e números.</span></div>
      <div class="campo"><label for="s2">Repita a senha</label><input class="ent" id="s2" type="password" autocomplete="new-password" required></div>
      <button class="btn btn-azul" type="submit" id="b-senha">Salvar e entrar</button>
    </form></div></div></main>`;
    $("#s1").focus();
    $("#f-senha").addEventListener("submit", async e => {
      e.preventDefault();
      const a = $("#s1").value, b = $("#s2").value, msg = t => { let m = $("#f-senha .msg"); if (!m) { m = document.createElement("div"); m.className = "msg msg-erro"; m.setAttribute("role", "alert"); $("#f-senha").prepend(m); } m.textContent = t; };
      if (!senhaBoa(a)) return msg("A senha precisa ter pelo menos 8 caracteres, com letras e números.");
      if (a !== b) return msg("As duas senhas não estão iguais.");
      const bt = $("#b-senha"); bt.classList.add("carregando"); bt.disabled = true;
      try { await api.novaSenha(a); aviso("Senha salva."); await iniciaSessao(); }
      catch (er) { bt.classList.remove("carregando"); bt.disabled = false; if (er.sessao) return telaEntrada(er.message); msg(er.message); }
    });
  }
  function telaSemAcesso() {
    app.innerHTML = `<main class="entrada" style="grid-template-columns:1fr"><div class="entrada-miolo" style="align-items:center"><div class="entrada-cartao">
      <img class="logo" src="/assets/logo-topo.png" width="391" height="190" alt="Kiesel Negócios Imobiliários">
      <h1>Acesso ainda não liberado</h1>
      <p class="sub" style="margin-top:12px">Você entrou como <b>${esc(sessao && sessao.email)}</b>, mas este e-mail ainda não está na equipe do painel. Peça para o responsável pelo site incluir o seu e-mail e entre de novo.</p>
      <form style="margin-top:24px"><button class="btn btn-linha" type="button" id="b-sair">Sair e entrar com outro e-mail</button></form>
    </div></div></main>`;
    $("#b-sair").addEventListener("click", async () => { await api.sair(); telaEntrada(); });
  }

  // =====================================================================
  // casca (topo) e rotas
  // =====================================================================
  function casca(conteudo) {
    const nome = (E.equipe && E.equipe.nome) || (sessao && sessao.email) || "";
    return `${DEMO ? '<div class="demo-faixa">Modo demonstração: as alterações ficam só neste navegador e não vão para o site.</div>' : ""}
<header class="topo">
  <a class="marca" href="#" data-ir="lista"><img src="/assets/logo-topo.png" width="391" height="190" alt="Kiesel"><span>Painel de imóveis</span></a>
  <div class="espaco"></div>
  <a class="btn btn-fantasma ver-site" href="${SITE_PUB}/?fresco=1" target="_blank" rel="noopener">${I.externo}<span>Ver o site</span></a>
  <div class="usuario"><button type="button" id="b-usuario" aria-haspopup="menu" aria-expanded="false"><span class="avatar">${esc(inicial(nome))}</span><span class="nome">${esc(nome)}</span></button></div>
</header>
<main class="pagina" id="pagina">${conteudo}</main>`;
  }
  function ligaCasca() {
    $$("[data-ir=lista]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); vai(""); }));
    const b = $("#b-usuario");
    b.addEventListener("click", e => {
      e.stopPropagation();
      const aberto = $(".usuario .menu"); if (aberto) { aberto.remove(); b.setAttribute("aria-expanded", "false"); return; }
      const m = document.createElement("div"); m.className = "menu"; m.setAttribute("role", "menu");
      m.innerHTML = `<div class="cab"><b>${esc((E.equipe && E.equipe.nome) || "Conta")}</b>${esc(sessao && sessao.email)}</div><button type="button" role="menuitem" data-a="senha">${I.chave}Trocar minha senha</button><a role="menuitem" href="${SITE_PUB}/?fresco=1" target="_blank" rel="noopener">${I.externo}Abrir o site</a><hr><button type="button" role="menuitem" data-a="sair" class="perigo">${I.sair}Sair</button>`;
      b.parentNode.appendChild(m); b.setAttribute("aria-expanded", "true");
      m.addEventListener("click", async ev => {
        const a = ev.target.closest("[data-a]"); if (!a) return; m.remove(); b.setAttribute("aria-expanded", "false");
        if (a.dataset.a === "sair") { if (E.ed && E.ed.sujo && !(await confirmaDescartar())) return; await api.sair(); E.ed = null; history.replaceState(null, "", location.pathname + location.search); telaEntrada("Você saiu do painel.", "info"); }
        if (a.dataset.a === "senha") trocaSenha();
      });
    });
  }
  document.addEventListener("click", e => { if (!e.target.closest(".usuario")) { const m = $(".usuario .menu"); if (m) { m.remove(); const b = $("#b-usuario"); if (b) b.setAttribute("aria-expanded", "false"); } } if (!e.target.closest(".menu-cartao,[data-menu]")) fechaMenuCartao(); });
  async function trocaSenha() {
    const r = await dialogo({ titulo: "Trocar minha senha", corpo: `<div class="campo"><label for="t1">Senha nova</label><input class="ent" id="t1" type="password" autocomplete="new-password"><span class="dica">Pelo menos 8 caracteres, com letras e números.</span></div><div class="campo"><label for="t2">Repita a senha nova</label><input class="ent" id="t2" type="password" autocomplete="new-password"></div>`, botoes: [{ texto: "Cancelar", valor: null }, { texto: "Salvar senha", classe: "btn-azul", valor: "ok", antes: async veu => { const a = $("#t1", veu).value, b = $("#t2", veu).value; if (!senhaBoa(a)) { mostraErroDialogo(veu, "A senha precisa ter pelo menos 8 caracteres, com letras e números."); return false; } if (a !== b) { mostraErroDialogo(veu, "As duas senhas não estão iguais."); return false; } await api.novaSenha(a); return true; } }] });
    if (r) aviso("Senha trocada.");
  }

  // navegação interna: pergunta antes de sair de um imóvel com alterações não salvas
  async function vai(h) {
    if (E.ed && E.ed.sujo && !/^(editar\/|novo)/.test(h)) { if (!(await confirmaDescartar())) return; E.ed.sujo = false; }
    if (location.hash.slice(1) === h) return rota();
    location.hash = h;
  }
  async function confirmaDescartar() {
    const r = await dialogo({ titulo: "Sair sem salvar?", texto: "As alterações deste imóvel ainda não foram salvas.", botoes: [{ texto: "Continuar editando", valor: null }, { texto: "Descartar alterações", classe: "btn-perigo", valor: "sim" }] });
    if (r && E.ed) descartaEnvios(E.ed);
    return !!r;
  }
  let hashAnterior = location.hash;
  window.addEventListener("hashchange", async () => {
    if (/access_token=|error_description=/.test(location.hash)) return inicio(); // link do e-mail aberto com o painel já na tela
    // botão voltar do navegador com alterações não salvas: devolve o endereço do editor e pergunta
    if (E.ed && E.ed.sujo && !/^#(editar\/|novo)/.test(location.hash)) {
      const destino = location.hash;
      history.replaceState(null, "", hashAnterior || location.pathname + location.search);
      if (!(await confirmaDescartar())) return;
      E.ed.sujo = false; history.replaceState(null, "", destino || location.pathname + location.search);
    }
    hashAnterior = location.hash; rota();
  });
  window.addEventListener("beforeunload", e => { if (E.ed && E.ed.sujo) { e.preventDefault(); e.returnValue = ""; } });
  function rota() {
    if (!sessao) return telaEntrada();
    const h = location.hash.slice(1);
    if (h === "novo") return editor(null);
    const m = /^editar\/([A-Z]{2}\d{4})$/.exec(h);
    if (m) { const x = E.lista.find(y => y.ref === m[1]); if (x) return editor(x); aviso("Imóvel " + m[1] + " não encontrado.", { erro: true }); history.replaceState(null, "", location.pathname + location.search); }
    E.ed = null; telaLista();
  }

  // =====================================================================
  // lista
  // =====================================================================
  function contagem() { const c = { disponivel: 0, vendido: 0, oculto: 0, todos: E.lista.length }; E.lista.forEach(x => { c[x.status] = (c[x.status] || 0) + 1; }); return c; }
  function filtrados() {
    const f = E.filtro, q = sem(f.busca).trim();
    let l = E.lista.filter(x => (f.status === "todos" || x.status === f.status) && (!f.tipo || x.tipo === f.tipo) && (!q || sem([x.ref, x.titulo, x.bairro, x.cidade, x.tipo, x.descricao].join(" ")).includes(q)));
    const ord = { alterado: (a, b) => String(b.alterado_em || b.atualizado).localeCompare(String(a.alterado_em || a.atualizado)), maior: (a, b) => b.preco - a.preco, menor: (a, b) => a.preco - b.preco, ref: (a, b) => a.ref.localeCompare(b.ref) }[f.ordem] || (() => 0);
    return l.sort(ord);
  }
  function telaLista() {
    document.title = "Imóveis · Painel Kiesel";
    const c = contagem(), tipos = [...new Set(E.lista.map(x => x.tipo))].sort((a, b) => M.TIPOS.indexOf(a) - M.TIPOS.indexOf(b));
    const dest = E.lista.filter(x => x.status === "disponivel" && x.destaque > 0).length;
    app.innerHTML = casca(`
<div class="cab-lista">
  <div><h1>Imóveis</h1><div class="resumo-n"><span><b class="num">${c.disponivel}</b> no site</span><span><b class="num">${c.vendido}</b> vendidos ou alugados</span><span><b class="num">${c.oculto}</b> ocultos</span><span><b class="num">${dest}</b> em destaque</span></div></div>
  <a class="btn btn-azul" href="#novo" id="b-novo">${I.mais}Novo imóvel</a>
</div>
<div class="barra" role="search">
  <label class="busca"><span class="so-leitor">Buscar imóvel</span>${I.busca}<input class="ent" id="l-busca" type="search" placeholder="Buscar por código, bairro ou título" value="${esc(E.filtro.busca)}" autocomplete="off"></label>
  <div class="seg" role="group" aria-label="Situação">${[["disponivel", "No site"], ["vendido", "Vendidos"], ["oculto", "Ocultos"], ["todos", "Todos"]].map(([v, t]) => `<button type="button" data-st="${v}" aria-pressed="${E.filtro.status === v}">${t}<span class="n num">${c[v] || 0}</span></button>`).join("")}</div>
  <select class="ent" id="l-tipo" aria-label="Tipo"><option value="">Todos os tipos</option>${tipos.map(t => `<option${E.filtro.tipo === t ? " selected" : ""}>${esc(t)}</option>`).join("")}</select>
  <select class="ent" id="l-ordem" aria-label="Ordem">${[["alterado", "Mais recentes"], ["maior", "Maior preço"], ["menor", "Menor preço"], ["ref", "Código"]].map(([v, t]) => `<option value="${v}"${E.filtro.ordem === v ? " selected" : ""}>${t}</option>`).join("")}</select>
</div>
<div class="grade" id="grade">${E.carregou ? "" : Array.from({ length: 6 }, () => '<div class="esqueleto"><i></i><i></i><i></i></div>').join("")}</div>`);
    ligaCasca();
    if (E.carregou) pintaGrade();
    const busca = $("#l-busca");
    busca.addEventListener("input", () => { E.filtro.busca = busca.value; guardaFiltro(); pintaGrade(); });
    $$(".barra .seg button").forEach(b => b.addEventListener("click", () => { E.filtro.status = b.dataset.st; guardaFiltro(); $$(".barra .seg button").forEach(x => x.setAttribute("aria-pressed", x === b)); pintaGrade(); }));
    $("#l-tipo").addEventListener("change", e => { E.filtro.tipo = e.target.value; guardaFiltro(); pintaGrade(); });
    $("#l-ordem").addEventListener("change", e => { E.filtro.ordem = e.target.value; guardaFiltro(); pintaGrade(); });
    $("#grade").addEventListener("click", cliqueGrade);
  }
  function cartao(x) {
    const st = STATUS[x.status] || STATUS.disponivel;
    const quem = x.alterado_por ? " por " + x.alterado_por.split("@")[0] : "";
    return `<article class="cartao${x.status !== "disponivel" ? " esmaecido" : ""}" data-ref="${x.ref}">
  <div class="foto" data-editar><img src="${esc(fotoURL(x.fotos[0], "p"))}" alt="" loading="lazy" decoding="async" width="640" height="400"><span class="ref">${x.ref}</span>${x.fotos.length ? `<span class="qtd-fotos">${I.foto}${x.fotos.length}</span>` : ""}
    <button type="button" class="estrela" data-estrela aria-pressed="${x.destaque > 0}" aria-label="${x.destaque > 0 ? "Tirar dos destaques" : "Colocar em destaque na página inicial"}" title="${x.destaque > 0 ? "Em destaque na página inicial" : "Destacar na página inicial"}">${I.estrela}</button></div>
  <div class="corpo">
    <div class="linha1"><span class="etiqueta ${st[1]}">${st[0]}</span><span class="etiqueta et-tipo">${esc(x.tipo)}${x.finalidade === "alugar" ? " · aluguel" : ""}</span></div>
    <h3 data-editar>${esc(x.titulo)}</h3>
    <div class="onde">${esc(x.bairro)}${x.bairro ? " · " : ""}${esc(x.cidade)}</div>
    <div class="preco num">${precoTela(x)}</div>
    <div class="alterado">Alterado em ${dataBR(x.alterado_em || x.atualizado)}${esc(quem)}</div>
  </div>
  <div class="acoes"><a class="btn btn-linha" href="#editar/${x.ref}">${I.editar}Editar</a><button type="button" class="btn btn-linha mais" data-menu aria-label="Mais ações para ${x.ref}" aria-haspopup="menu">${I.pontos}</button></div>
</article>`;
  }
  function pintaGrade() {
    const g = $("#grade"); if (!g) return;
    const l = filtrados();
    if (!E.lista.length) { g.innerHTML = `<div class="vazio">${I.casa}<h3>Nenhum imóvel cadastrado ainda.</h3><p>Comece pelo botão "Novo imóvel".</p></div>`; return; }
    g.innerHTML = l.length ? l.map(cartao).join("") : `<div class="vazio">${I.busca}<h3>Nenhum imóvel com esses filtros.</h3><p>Tente outra busca ou veja <button type="button" class="link" style="color:var(--azul);font-weight:600" data-limpa>todos os imóveis</button>.</p></div>`;
  }
  async function cliqueGrade(e) {
    if (e.target.closest("[data-limpa]")) { E.filtro = { status: "todos", tipo: "", busca: "", ordem: E.filtro.ordem }; guardaFiltro(); return telaLista(); }
    const c = e.target.closest(".cartao"); if (!c) return;
    const x = E.lista.find(y => y.ref === c.dataset.ref); if (!x) return;
    if (e.target.closest("[data-estrela]")) { e.preventDefault(); return alternaDestaque(x); }
    if (e.target.closest("[data-menu]")) { e.preventDefault(); return abreMenuCartao(x, e.target.closest("[data-menu]")); }
    if (e.target.closest("[data-editar]")) return vai("editar/" + x.ref);
  }
  function fechaMenuCartao() { const m = $(".menu-cartao"); if (m) m.remove(); }
  function abreMenuCartao(x, botao) {
    const aberto = $(".menu-cartao"); fechaMenuCartao(); if (aberto && aberto.dataset.ref === x.ref) return;
    const m = document.createElement("div"); m.className = "menu menu-cartao"; m.dataset.ref = x.ref; m.setAttribute("role", "menu");
    const it = [];
    if (x.status !== "vendido") it.push(["vendido", I.etiqueta, x.finalidade === "alugar" ? "Marcar como alugado" : "Marcar como vendido"]);
    if (x.status !== "oculto") it.push(["oculto", I.olhoNao, "Ocultar do site"]);
    if (x.status !== "disponivel") it.push(["disponivel", I.olho, "Voltar para o site"]);
    m.innerHTML = it.map(([v, i, t]) => `<button type="button" role="menuitem" data-st="${v}">${i}${t}</button>`).join("") + (x.status === "disponivel" ? `<a role="menuitem" href="${esc(linkSite(x.ref))}" target="_blank" rel="noopener">${I.externo}Ver no site</a>` : "") + `<hr><button type="button" role="menuitem" class="perigo" data-excluir>${I.lixo}Excluir imóvel</button>`;
    const c = botao.closest(".cartao"); c.appendChild(m);
    const f = m.querySelector("button"); if (f) f.focus();
    m.addEventListener("keydown", ev => { if (ev.key === "Escape") { fechaMenuCartao(); botao.focus(); } });
    m.addEventListener("click", ev => {
      const b = ev.target.closest("button"); if (!b) return; fechaMenuCartao();
      if (b.dataset.st) mudaStatus(x, b.dataset.st);
      if (b.hasAttribute("data-excluir")) excluir(x);
    });
  }
  async function mudaStatus(x, st, semDesfazer) {
    const antes = x.status;
    try {
      const novo = await api.alterar(x.ref, { status: st });
      Object.assign(x, linha(novo)); pintaGradeOuLista();
      const txt = { vendido: x.finalidade === "alugar" ? "marcado como alugado e retirado do site" : "marcado como vendido e retirado do site", oculto: "ocultado do site", disponivel: "de volta ao site" }[st];
      aviso(`${x.ref} ${txt}.`, semDesfazer ? {} : { acao: "Desfazer", fn: () => mudaStatus(x, antes, true) });
    } catch (er) { trataErro(er); }
  }
  async function alternaDestaque(x) {
    const ligar = !(x.destaque > 0);
    const maior = E.lista.reduce((m, y) => Math.max(m, y.destaque || 0), 0);
    try {
      const novo = await api.alterar(x.ref, { destaque: ligar ? maior + 1 : 0 });
      Object.assign(x, linha(novo)); pintaGradeOuLista();
      const pos = E.lista.filter(y => y.status === "disponivel" && y.destaque > 0).sort((a, b) => a.destaque - b.destaque).findIndex(y => y.ref === x.ref) + 1;
      aviso(ligar ? (pos > 6 ? `${x.ref} marcado. A página inicial mostra os 6 primeiros destaques; tire a estrela de outro para ele aparecer.` : `${x.ref} agora aparece nos destaques da página inicial.`) : `${x.ref} saiu dos destaques.`, { tempo: pos > 6 ? 8000 : 4000 });
    } catch (er) { trataErro(er); }
  }
  function pintaGradeOuLista() { if ($("#grade")) telaLista(); }
  async function excluir(x, depois) {
    const r = await dialogo({ titulo: `Excluir ${x.ref}?`, foto: fotoURL(x.fotos[0], "p"), texto: `<b>${esc(x.titulo)}</b> some do site e do painel, junto com as fotos enviadas por aqui. Não dá para desfazer.<br><br>Se o imóvel foi vendido ou alugado, prefira <b>marcar como vendido</b>: ele sai do site, mas continua guardado aqui.`, botoes: [{ texto: "Cancelar", valor: null, esq: true }, ...(x.status !== "vendido" ? [{ texto: x.finalidade === "alugar" ? "Marcar como alugado" : "Marcar como vendido", valor: "vendido" }] : []), { texto: "Excluir de vez", classe: "btn-perigo", valor: "excluir" }] });
    if (r === "vendido") { await mudaStatus(x, "vendido"); if (depois) depois(); return; }
    if (r !== "excluir") return;
    try {
      await api.excluir(x.ref);
      api.apagarFotos(x.fotos.filter(f => /^https?:/.test(f))).catch(() => { });
      E.lista = E.lista.filter(y => y.ref !== x.ref);
      aviso(`${x.ref} excluído.`);
      if (depois) depois(); else pintaGradeOuLista();
    } catch (er) { trataErro(er); }
  }
  function trataErro(er) {
    if (er.sessao) { aviso(er.message, { erro: true }); E.ed = null; return telaEntrada(er.message); }
    aviso(er.message || "Algo deu errado. Tente de novo.", { erro: true });
  }
  // linha do banco -> objeto da lista do painel
  function linha(r) {
    const x = Object.assign(M.normaliza(r), { status: r.status || "disponivel", alterado_em: r.alterado_em || null, alterado_por: r.alterado_por || null });
    if (DEMO) x.fotos = (r.fotos || []).filter(f => typeof f === "string" && f); // na demonstração as fotos novas são blob: locais
    return x;
  }

  // =====================================================================
  // editor
  // =====================================================================
  let seqFoto = 0;
  function proximaRef(tipo, ignorar) {
    const p = PREFIXO[tipo] || "IM";
    const n = E.lista.filter(x => x.ref.startsWith(p) && x.ref !== ignorar).reduce((m, x) => Math.max(m, parseInt(x.ref.slice(2), 10) || 0), 0);
    return p + String(n + 1).padStart(4, "0");
  }
  function tituloAuto(d) {
    const area = d.area ? (d.unidade === "ha" ? Number(d.area).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " ha" : M.num(d.area) + " m²") : "";
    let t = d.tipo || "Imóvel";
    if (d.quartos) t += ` com ${d.quartos} ${d.quartos > 1 ? "quartos" : "quarto"}`;
    if (area) t += (d.quartos ? ", " : ", ") + area;
    else if (d.bairro && !d.quartos) t += " no " + d.bairro;
    return t;
  }
  function editor(x) {
    const novo = !x;
    // área: < 50 no banco = hectares (mesma regra do site)
    const ha = x && x.area > 0 && x.area < 50;
    const d = novo ? { ref: proximaRef("Casa"), tipo: "Casa", finalidade: "comprar", bairro: "", cidade: "São Martinho", uf: "RS", preco: 0, quartos: 0, suites: 0, banheiros: 0, vagas: 0, area: 0, unidade: "m2", titulo: "", descricao: "", comodidades: [], destaque: 0, status: "disponivel" }
      : { ref: x.ref, tipo: x.tipo, finalidade: x.finalidade, bairro: x.bairro, cidade: x.cidade, uf: x.uf, preco: x.preco, quartos: x.quartos, suites: x.suites, banheiros: x.banheiros, vagas: x.vagas, area: x.area, unidade: ha ? "ha" : "m2", titulo: x.titulo, descricao: x.descricao, comodidades: x.comodidades.slice(), destaque: x.destaque, status: x.status };
    E.ed = { novo, orig: x, d, fotos: (x ? x.fotos : []).map(f => ({ id: ++seqFoto, f, estado: "ok" })), enviadas: [], removidas: [], sujo: false, refManual: false, tituloManual: !novo && d.titulo !== tituloAuto(d), marca: guarda.get("kiesel-painel-marca") !== false };
    desenhaEditor();
  }
  function desenhaEditor() {
    const ed = E.ed, d = ed.d;
    document.title = (ed.novo ? "Novo imóvel" : "Editar " + d.ref) + " · Painel Kiesel";
    const bairros = [...new Set(E.lista.map(x => x.bairro).filter(Boolean))].sort();
    const cidades = [...new Set(["São Martinho"].concat(E.lista.map(x => x.cidade).filter(Boolean)))].sort();
    const comod = [...new Set(COMODIDADES_BASE.concat(E.lista.flatMap(x => x.comodidades), d.comodidades))];
    const passo = (k, t) => `<div class="campo"><span class="rotulo" id="r-${k}">${t}</span><div class="passo" role="group" aria-labelledby="r-${k}"><button type="button" data-passo="${k}" data-d="-1" aria-label="Menos ${t.toLowerCase()}">${I.menos}</button><input type="number" inputmode="numeric" min="0" max="99" id="c-${k}" value="${d[k]}" aria-labelledby="r-${k}"><button type="button" data-passo="${k}" data-d="1" aria-label="Mais ${t.toLowerCase()}">${I.mais}</button></div></div>`;
    app.innerHTML = casca(`
<div class="ed-cab">
  <a class="btn btn-fantasma voltar" href="#" data-ir="lista">${I.seta}Imóveis</a>
  <h1>${ed.novo ? "Novo imóvel" : "Editar " + esc(d.ref)}</h1>
  <div class="espaco"></div>
  ${!ed.novo && ed.orig.status === "disponivel" ? `<a class="btn btn-linha ver" href="${esc(linkSite(d.ref))}" target="_blank" rel="noopener">${I.externo}Ver no site</a>` : ""}
</div>
<form id="f-ed" novalidate>
<div class="ed-grade">
  <div class="blocos">
    <section class="bloco" aria-labelledby="b1">
      <h2 id="b1"><span class="n">1</span>Fotos</h2>
      <p class="sub">A primeira é a capa. ${matchMedia("(hover:hover)").matches ? "Arraste para mudar a ordem." : "Use as setas para mudar a ordem."}</p>
      <div class="conteudo">
        <label class="solta" id="solta">${I.envia}<b>Escolher fotos</b><span>ou arraste os arquivos para cá · JPG, PNG ou WEBP</span><input type="file" id="arq" accept="image/*" multiple></label>
        <div class="fotos" id="fotos"></div>
        <label class="marca-agua"><input type="checkbox" id="c-marca"${ed.marca ? " checked" : ""}>Colocar a marca d'água da Kiesel nas fotos novas</label>
      </div>
    </section>
    <section class="bloco" aria-labelledby="b2">
      <h2 id="b2"><span class="n">2</span>O imóvel</h2>
      <div class="conteudo">
        <div class="campo"><span class="rotulo" id="r-tipo">Tipo</span><div class="fichas" role="group" aria-labelledby="r-tipo">${M.TIPOS.concat(M.TIPOS.indexOf(d.tipo) < 0 ? [d.tipo] : []).map(t => `<button type="button" class="ficha" data-tipo="${esc(t)}" aria-pressed="${d.tipo === t}">${esc(t)}</button>`).join("")}</div></div>
        <div class="linha">
          <div class="campo"><span class="rotulo" id="r-fin">Para</span><div class="seg" role="group" aria-labelledby="r-fin"><button type="button" data-fin="comprar" aria-pressed="${d.finalidade === "comprar"}">Venda</button><button type="button" data-fin="alugar" aria-pressed="${d.finalidade === "alugar"}">Aluguel</button></div></div>
          <div class="campo"><label for="c-ref">Código</label><input class="ent" id="c-ref" value="${esc(d.ref)}" maxlength="6" autocomplete="off" spellcheck="false" style="text-transform:uppercase"${ed.novo ? "" : " readonly aria-readonly=\"true\""}><span class="dica">${ed.novo ? "Gerado sozinho pelo tipo. Pode trocar, se precisar." : "O código não muda depois de criado."}</span></div>
        </div>
        <div class="campo"><label for="c-titulo">Título no site</label><input class="ent" id="c-titulo" value="${esc(d.titulo || tituloAuto(d))}" maxlength="90"><span class="dica" id="dica-titulo">${ed.tituloManual ? `Escrito à mão. <a href="#" id="titulo-auto">Voltar ao título automático</a>` : "Montado sozinho com tipo, quartos e área. Pode escrever outro."}</span></div>
      </div>
    </section>
    <section class="bloco" aria-labelledby="b3">
      <h2 id="b3"><span class="n">3</span>Valor e medidas</h2>
      <div class="conteudo">
        <div class="linha">
          <div class="campo"><label for="c-preco">${d.finalidade === "alugar" ? "Aluguel por mês" : "Preço de venda"}</label><div class="ent-prefixo"><span>R$</span><input class="ent num" id="c-preco" inputmode="numeric" autocomplete="off" value="${d.preco ? M.num(d.preco) : ""}" placeholder="0"></div></div>
          <div class="campo"><label for="c-area">Área</label><div class="ent-sufixo"><input class="ent num" id="c-area" inputmode="decimal" autocomplete="off" value="${d.area ? String(d.area).replace(".", ",") : ""}" placeholder="0"><select class="ent" id="c-unidade" aria-label="Unidade da área"><option value="m2"${d.unidade === "m2" ? " selected" : ""}>m²</option><option value="ha"${d.unidade === "ha" ? " selected" : ""}>hectares</option></select></div></div>
        </div>
        <div class="linha linha-4">${passo("quartos", "Quartos")}${passo("suites", "Suítes")}${passo("banheiros", "Banheiros")}${passo("vagas", "Vagas")}</div>
      </div>
    </section>
    <section class="bloco" aria-labelledby="b4">
      <h2 id="b4"><span class="n">4</span>Onde fica</h2>
      <div class="conteudo">
        <div class="linha linha-3" style="grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) 90px">
          <div class="campo"><label for="c-bairro">Bairro</label><input class="ent" id="c-bairro" list="l-bairros" value="${esc(d.bairro)}" autocomplete="off"><datalist id="l-bairros">${bairros.map(b => `<option value="${esc(b)}">`).join("")}</datalist></div>
          <div class="campo"><label for="c-cidade">Cidade</label><input class="ent" id="c-cidade" list="l-cidades" value="${esc(d.cidade)}" autocomplete="off"><datalist id="l-cidades">${cidades.map(b => `<option value="${esc(b)}">`).join("")}</datalist></div>
          <div class="campo"><label for="c-uf">UF</label><input class="ent" id="c-uf" value="${esc(d.uf)}" maxlength="2" style="text-transform:uppercase"></div>
        </div>
      </div>
    </section>
    <section class="bloco" aria-labelledby="b5">
      <h2 id="b5"><span class="n">5</span>Características</h2>
      <p class="sub">Toque para marcar o que o imóvel tem.</p>
      <div class="conteudo">
        <div class="fichas" id="comod">${comod.map(c => `<button type="button" class="ficha" data-c="${esc(c)}" aria-pressed="${d.comodidades.indexOf(c) >= 0}">${esc(c)}</button>`).join("")}</div>
        <div class="ficha-nova"><input class="ent" id="c-nova" placeholder="Outra característica" maxlength="40" aria-label="Outra característica"><button type="button" class="btn btn-linha" id="b-nova">${I.mais}Incluir</button></div>
      </div>
    </section>
    <section class="bloco" aria-labelledby="b6">
      <h2 id="b6"><span class="n">6</span>Descrição</h2>
      <div class="conteudo">
        <div class="campo"><label for="c-desc" class="so-leitor">Descrição</label><textarea class="ent" id="c-desc" rows="8" placeholder="Terreno, construção, cômodos, acabamento, documentação, rua e ponto de referência.">${esc(d.descricao)}</textarea></div>
      </div>
    </section>
    <section class="bloco" aria-labelledby="b7">
      <h2 id="b7"><span class="n">7</span>No site</h2>
      <div class="conteudo">
        <div class="seg" role="group" aria-label="Situação" id="c-status">${Object.entries(STATUS).map(([v, [t]]) => `<button type="button" data-st="${v}" aria-pressed="${d.status === v}">${t}</button>`).join("")}</div>
        <label class="marca-agua"><input type="checkbox" id="c-destaque"${d.destaque > 0 ? " checked" : ""}>Destacar na página inicial</label>
      </div>
    </section>
  </div>
  <aside class="lateral" aria-label="Prévia">
    <div class="previa" id="previa"></div>
    <div class="lista-ok" id="lista-ok"></div>
  </aside>
</div>
<div class="rodape-ed">
  ${ed.novo ? "" : `<button type="button" class="btn btn-perigo-texto" id="b-excluir">${I.lixo}<span>Excluir</span></button>`}
  <div class="estado" id="estado" aria-live="polite">Tudo salvo.</div>
  <a class="btn btn-linha" href="#" data-ir="lista">Cancelar</a>
  <button type="submit" class="btn btn-azul" id="b-salvar">${ed.novo ? "Publicar imóvel" : "Salvar alterações"}</button>
</div>
</form>`);
    ligaCasca();
    ligaEditor();
    pintaFotos(); pintaPrevia(); marcaSujo(false);
    window.scrollTo(0, 0);
  }
  function marcaSujo(v) {
    if (!E.ed) return; if (v !== undefined) E.ed.sujo = v;
    const e = $("#estado"); if (!e) return;
    const enviando = E.ed.fotos.some(f => f.estado === "enviando");
    e.className = "estado" + (E.ed.sujo ? " sujo" : "");
    e.textContent = enviando ? "Enviando fotos…" : E.ed.sujo ? "Alterações não salvas" : (E.ed.novo ? "Preencha e publique." : "Tudo salvo.");
  }
  function leNumero(s) { const v = String(s || "").replace(/[^\d,]/g, "").replace(",", "."); return v ? Number(v) : 0; }
  function ligaEditor() {
    const ed = E.ed, d = ed.d, f = $("#f-ed");
    const muda = () => { marcaSujo(true); pintaPrevia(); };
    const atualizaTitulo = () => { if (!ed.tituloManual) { d.titulo = tituloAuto(d); $("#c-titulo").value = d.titulo; } };
    $$("[data-tipo]").forEach(b => b.addEventListener("click", () => {
      d.tipo = b.dataset.tipo; $$("[data-tipo]").forEach(x => x.setAttribute("aria-pressed", x === b));
      if (ed.novo && !ed.refManual) { d.ref = proximaRef(d.tipo); $("#c-ref").value = d.ref; }
      atualizaTitulo(); muda();
    }));
    $$("[data-fin]").forEach(b => b.addEventListener("click", () => { d.finalidade = b.dataset.fin; $$("[data-fin]").forEach(x => x.setAttribute("aria-pressed", x === b)); $("label[for=c-preco]").textContent = d.finalidade === "alugar" ? "Aluguel por mês" : "Preço de venda"; muda(); }));
    const ref = $("#c-ref");
    ref.addEventListener("input", () => { ref.value = ref.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); d.ref = ref.value; ed.refManual = true; ref.classList.remove("invalido"); muda(); });
    const tit = $("#c-titulo");
    tit.addEventListener("input", () => { d.titulo = tit.value; ed.tituloManual = true; $("#dica-titulo").innerHTML = `Escrito à mão. <a href="#" id="titulo-auto">Voltar ao título automático</a>`; muda(); });
    f.addEventListener("click", e => { if (e.target.id === "titulo-auto") { e.preventDefault(); ed.tituloManual = false; atualizaTitulo(); $("#dica-titulo").textContent = "Montado sozinho com tipo, quartos e área. Pode escrever outro."; muda(); } });
    const preco = $("#c-preco");
    preco.addEventListener("input", () => {
      const pos = preco.value.length - preco.selectionStart;
      const n = parseInt(preco.value.replace(/\D/g, "").slice(0, 11) || "0", 10);
      d.preco = n; preco.value = n ? M.num(n) : "";
      const p = Math.max(0, preco.value.length - pos); try { preco.setSelectionRange(p, p); } catch (e) { }
      preco.classList.remove("invalido"); muda();
    });
    const area = $("#c-area");
    area.addEventListener("input", () => { area.value = area.value.replace(/[^\d,]/g, ""); d.area = leNumero(area.value); atualizaTitulo(); muda(); });
    $("#c-unidade").addEventListener("change", e => { d.unidade = e.target.value; atualizaTitulo(); muda(); });
    $$("[data-passo]").forEach(b => b.addEventListener("click", () => { const k = b.dataset.passo, inp = $("#c-" + k); d[k] = Math.max(0, Math.min(99, (d[k] || 0) + Number(b.dataset.d))); inp.value = d[k]; if (k === "quartos") atualizaTitulo(); muda(); }));
    ["quartos", "suites", "banheiros", "vagas"].forEach(k => $("#c-" + k).addEventListener("input", e => { d[k] = Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0)); if (k === "quartos") atualizaTitulo(); muda(); }));
    [["bairro", "c-bairro"], ["cidade", "c-cidade"], ["uf", "c-uf"], ["descricao", "c-desc"]].forEach(([k, id]) => $("#" + id).addEventListener("input", e => { d[k] = k === "uf" ? e.target.value.toUpperCase() : e.target.value; e.target.classList.remove("invalido"); if (k === "bairro") atualizaTitulo(); muda(); }));
    const comod = $("#comod");
    comod.addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; const c = b.dataset.c, i = d.comodidades.indexOf(c); if (i >= 0) d.comodidades.splice(i, 1); else d.comodidades.push(c); b.setAttribute("aria-pressed", i < 0); muda(); });
    const nova = $("#c-nova");
    const inclui = () => { const v = nova.value.trim().replace(/\s+/g, " "); if (!v) return; const ex = $$("[data-c]", comod).find(b => sem(b.dataset.c) === sem(v)); if (ex) { if (ex.getAttribute("aria-pressed") !== "true") ex.click(); } else { d.comodidades.push(v); comod.insertAdjacentHTML("beforeend", `<button type="button" class="ficha" data-c="${esc(v)}" aria-pressed="true">${esc(v)}</button>`); muda(); } nova.value = ""; nova.focus(); };
    $("#b-nova").addEventListener("click", inclui);
    nova.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); inclui(); } });
    $$("#c-status [data-st]").forEach(b => b.addEventListener("click", () => { d.status = b.dataset.st; $$("#c-status [data-st]").forEach(x => x.setAttribute("aria-pressed", x === b)); muda(); }));
    $("#c-destaque").addEventListener("change", e => { const maior = E.lista.reduce((m, y) => Math.max(m, y.destaque || 0), 0); d.destaque = e.target.checked ? (ed.orig && ed.orig.destaque > 0 ? ed.orig.destaque : maior + 1) : 0; muda(); });
    $("#c-marca").addEventListener("change", e => { ed.marca = e.target.checked; guarda.set("kiesel-painel-marca", ed.marca); });
    // fotos
    const arq = $("#arq"), solta = $("#solta");
    arq.addEventListener("change", () => { recebeArquivos(arq.files); arq.value = ""; });
    ["dragenter", "dragover"].forEach(t => solta.addEventListener(t, e => { e.preventDefault(); solta.classList.add("sobre"); }));
    ["dragleave", "drop"].forEach(t => solta.addEventListener(t, e => { e.preventDefault(); solta.classList.remove("sobre"); }));
    solta.addEventListener("drop", e => { if (e.dataTransfer && e.dataTransfer.files.length) recebeArquivos(e.dataTransfer.files); });
    const caixaFotos = $("#fotos");
    caixaFotos.addEventListener("click", e => {
      const m = e.target.closest(".mini"); if (!m) return; const i = ed.fotos.findIndex(x => x.id === +m.dataset.id); if (i < 0) return;
      if (e.target.closest("[data-tirar]")) { const [t] = ed.fotos.splice(i, 1); if (t.f && /^https?:/.test(t.f)) ed.removidas.push(t.f); marcaSujo(true); pintaFotos(); pintaPrevia(); const p = $$(".mini [data-tirar]")[Math.min(i, ed.fotos.length - 1)]; if (p) p.focus(); return; }
      const mv = e.target.closest("[data-mover]"); if (mv) { const j = i + Number(mv.dataset.mover); if (j < 0 || j >= ed.fotos.length) return; const [t] = ed.fotos.splice(i, 1); ed.fotos.splice(j, 0, t); marcaSujo(true); pintaFotos(); pintaPrevia(); const b = $(`.mini[data-id="${t.id}"] [data-mover="${mv.dataset.mover}"]`) || $(`.mini[data-id="${t.id}"] [data-mover]:not([disabled])`); if (b) b.focus(); }
    });
    ligaArrastar(caixaFotos);
    const bx = $("#b-excluir"); if (bx) bx.addEventListener("click", () => excluir(ed.orig, () => { E.ed = null; vai(""); }));
    f.addEventListener("submit", e => { e.preventDefault(); salva(); });
    f.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); salva(); } });
  }
  function pintaFotos() {
    const ed = E.ed, c = $("#fotos"); if (!c) return;
    c.innerHTML = ed.fotos.map((x, i) => `<div class="mini" data-id="${x.id}">
  <img src="${esc(x.prev || fotoURL(x.f, "p"))}" alt="Foto ${i + 1}">
  ${i === 0 ? '<span class="capa">Capa</span>' : ""}
  <button type="button" class="tirar" data-tirar aria-label="Tirar a foto ${i + 1}">${I.x}</button>
  <div class="mover"><button type="button" data-mover="-1" aria-label="Mover a foto ${i + 1} para antes"${i === 0 ? " disabled" : ""}>${I.esq}</button><button type="button" data-mover="1" aria-label="Mover a foto ${i + 1} para depois"${i === ed.fotos.length - 1 ? " disabled" : ""}>${I.dir}</button></div>
  ${x.estado === "enviando" ? `<div class="progresso">Enviando…</div>` : x.estado === "erro" ? `<div class="progresso erro">${esc(x.erro || "Não subiu")}</div>` : ""}
</div>`).join("");
    marcaSujo();
  }
  function ligaArrastar(caixa) {
    let arr = null;
    caixa.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("button")) return;
      const m = e.target.closest(".mini"); if (!m) return;
      arr = { m, x0: e.clientX, y0: e.clientY, ativo: false };
    });
    window.addEventListener("pointermove", e => {
      if (!arr) return;
      if (!arr.ativo) {
        if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 6) return;
        arr.ativo = true; const r = arr.m.getBoundingClientRect();
        arr.dx = arr.x0 - r.left; arr.dy = arr.y0 - r.top;
        arr.g = arr.m.cloneNode(true); arr.g.classList.add("fantasma"); arr.g.style.width = r.width + "px"; arr.g.style.height = r.height + "px"; document.body.appendChild(arr.g);
        arr.m.classList.add("arrastando");
      }
      arr.g.style.left = e.clientX - arr.dx + "px"; arr.g.style.top = e.clientY - arr.dy + "px";
      const alvo = document.elementFromPoint(e.clientX, e.clientY); const o = alvo && alvo.closest && alvo.closest(".mini");
      if (o && o !== arr.m && o.parentNode === caixa) { const r = o.getBoundingClientRect(); const depois = e.clientX > r.left + r.width / 2; caixa.insertBefore(arr.m, depois ? o.nextSibling : o); }
    });
    const fim = () => {
      if (!arr) return; const a = arr; arr = null; if (!a.ativo) return;
      a.g.remove(); a.m.classList.remove("arrastando");
      const ordem = $$(".mini", caixa).map(el => +el.dataset.id);
      const antes = E.ed.fotos.map(x => x.id).join();
      E.ed.fotos.sort((p, q) => ordem.indexOf(p.id) - ordem.indexOf(q.id));
      if (antes !== E.ed.fotos.map(x => x.id).join()) marcaSujo(true);
      pintaFotos(); pintaPrevia();
    };
    window.addEventListener("pointerup", fim); window.addEventListener("pointercancel", fim);
  }

  // ---------- fotos: reduz, marca d'água e envia ----------
  let marcaImg = null;
  function carregaMarca() { if (!marcaImg) marcaImg = new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = "/assets/watermark.png"; }); return marcaImg; }
  async function abreImagem(file) {
    if (window.createImageBitmap) { try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (e) { } }
    return new Promise((ok, falha) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => ok(i); i.onerror = () => falha(new Error("formato")); i.src = u; });
  }
  // g: lado maior até 1600 px; p (miniatura): 640 px de largura, como as fotos do acervo
  function desenha(img, modo, marca) {
    const w0 = img.width, h0 = img.height;
    const k = modo === "p" ? Math.min(1, 640 / w0) : Math.min(1, 1600 / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const cx = cv.getContext("2d"); cx.imageSmoothingQuality = "high"; cx.drawImage(img, 0, 0, w, h);
    if (marca) { const mw = Math.round(Math.min(w, h * 1.5) * 0.24), mh = Math.round(mw * marca.height / marca.width); cx.globalAlpha = 0.5; cx.drawImage(marca, Math.round((w - mw) / 2), Math.round((h - mh) / 2), mw, mh); cx.globalAlpha = 1; }
    return cv;
  }
  const paraBlob = (cv, tipo, q) => new Promise(ok => cv.toBlob(ok, tipo, q));
  async function prepara(file, comMarca) {
    const img = await abreImagem(file), marca = comMarca ? await carregaMarca() : null;
    if (!img.width || !img.height) throw new Error("formato");
    let g = await paraBlob(desenha(img, "g", marca), "image/webp", 0.82), ext = "webp";
    if (!g || g.type !== "image/webp") { g = await paraBlob(desenha(img, "g", marca), "image/jpeg", 0.86); ext = "jpg"; }
    const p = await paraBlob(desenha(img, "p", marca), ext === "webp" ? "image/webp" : "image/jpeg", ext === "webp" ? 0.76 : 0.82);
    if (img.close) img.close();
    return { g, p, ext };
  }
  function recebeArquivos(lista) {
    const ed = E.ed; if (!ed) return;
    const arqs = Array.from(lista).filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
    if (!arqs.length) return aviso("Escolha arquivos de foto (JPG, PNG ou WEBP).", { erro: true });
    const caixa = ed;
    arqs.forEach(file => {
      const item = { id: ++seqFoto, f: null, estado: "enviando", prev: URL.createObjectURL(file) };
      caixa.fotos.push(item);
      (async () => {
        try {
          const { g, p, ext } = await prepara(file, caixa.marca);
          const nome = (caixa.d.ref || "NOVO") + "/" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          const urlG = await api.enviarFoto(nome + "-g." + ext, g);
          await api.enviarFoto(nome + "-p." + ext, p);
          item.f = urlG; item.estado = "ok"; caixa.enviadas.push(urlG);
        } catch (er) {
          item.estado = "erro";
          item.erro = er.message === "formato" ? (/hei[cf]$/i.test(file.name) ? "Formato HEIC: no iPhone, envie como JPG" : "Arquivo não é uma foto válida") : (er.sessao ? "Sessão terminou" : er.message || "Não subiu");
        }
        if (E.ed === caixa) { pintaFotos(); pintaPrevia(); }
      })();
    });
    marcaSujo(true); pintaFotos(); pintaPrevia();
  }
  function descartaEnvios(ed) { if (ed.enviadas.length) api.apagarFotos(ed.enviadas).catch(() => { }); ed.enviadas = []; }

  // ---------- prévia e checklist ----------
  function pintaPrevia() {
    const ed = E.ed; if (!ed) return; const d = ed.d, pv = $("#previa"), ok = $("#lista-ok"); if (!pv) return;
    const primeira = ed.fotos.find(x => x.estado !== "erro");
    const x = { tipo: d.tipo, finalidade: d.finalidade, preco: d.preco, quartos: d.quartos, banheiros: d.banheiros, vagas: d.vagas, area: d.unidade === "ha" ? Math.min(d.area, 49.99) : d.area };
    pv.innerHTML = `<div class="rot">Como aparece no site</div><div class="pfoto"><img src="${esc(primeira ? (primeira.prev || fotoURL(primeira.f, "p")) : "/assets/sem-foto.svg")}" alt=""><span class="ref">${esc(d.ref || "—")}</span><span class="tipo">${esc(d.tipo)}${d.finalidade === "alugar" ? " · aluguel" : ""}</span></div><div class="pcorpo"><h3>${esc(d.titulo || tituloAuto(d))}</h3><div class="onde">${esc(d.bairro || "Bairro")} · ${esc(d.cidade || "Cidade")}/${esc(d.uf || "RS")}</div><div class="preco num">${d.preco ? M.preco(x) : "R$ —"}</div><div class="specs">${[d.quartos ? d.quartos + (d.quartos > 1 ? " quartos" : " quarto") : "", d.banheiros ? d.banheiros + (d.banheiros > 1 ? " banheiros" : " banheiro") : "", d.vagas ? d.vagas + (d.vagas > 1 ? " vagas" : " vaga") : "", d.area ? (d.unidade === "ha" ? String(d.area).replace(".", ",") + " ha" : M.num(d.area) + " m²") : ""].filter(Boolean).map(s => `<span>${s}</span>`).join("")}</div></div>`;
    const itens = [[ed.fotos.some(f => f.estado === "ok"), "Pelo menos uma foto"], [ed.fotos.length >= 5, "5 fotos ou mais"], [d.preco > 0, "Preço"], [!!d.bairro.trim(), "Bairro"], [d.area > 0, "Área"], [d.descricao.trim().length >= 60, "Descrição"]];
    ok.innerHTML = `<h3>Anúncio completo</h3><ul>${itens.map(([v, t]) => `<li class="${v ? "ok" : ""}"><i></i>${t}</li>`).join("")}</ul>`;
  }

  // ---------- salvar ----------
  let salvando = false;
  async function salva() {
    const ed = E.ed; if (!ed || salvando) return; const d = ed.d;
    const problema = (id, t) => { const el = $("#" + id); if (el) { el.classList.add("invalido"); el.focus(); el.scrollIntoView({ block: "center", behavior: "smooth" }); } aviso(t, { erro: true }); return false; };
    d.ref = (d.ref || "").toUpperCase();
    if (ed.fotos.some(f => f.estado === "erro")) return aviso("Tem foto que não subiu (marcada em vermelho). Tire ela da lista ou envie de novo.", { erro: true });
    if (ed.novo) {
      if (!/^[A-Z]{2}\d{4}$/.test(d.ref)) return problema("c-ref", "O código precisa ter 2 letras e 4 números, como CA0048.");
      if (E.lista.some(x => x.ref === d.ref)) return problema("c-ref", `Já existe um imóvel com o código ${d.ref}.`);
    }
    if (!(d.preco > 0)) return problema("c-preco", "Informe o preço. O site da Kiesel não mostra imóvel sem valor.");
    if (!d.bairro.trim()) return problema("c-bairro", "Informe o bairro.");
    if (!d.cidade.trim()) return problema("c-cidade", "Informe a cidade.");
    if (d.unidade === "ha" && d.area >= 50) return problema("c-area", "Para 50 hectares ou mais, informe a área em m² (1 hectare = 10.000 m²).");
    const b = $("#b-salvar"); salvando = true; b.classList.add("carregando"); b.disabled = true;
    try {
      if (ed.fotos.some(f => f.estado === "enviando")) {
        $("#estado").textContent = "Terminando de enviar as fotos…";
        await new Promise(ok => { const t = setInterval(() => { if (!E.ed || !ed.fotos.some(f => f.estado === "enviando")) { clearInterval(t); ok(); } }, 200); });
        if (ed.fotos.some(f => f.estado === "erro")) throw new Error("Tem foto que não subiu (marcada em vermelho). Tire ela da lista ou envie de novo.");
      }
      const titulo = (d.titulo || "").trim() || tituloAuto(d);
      const reg = { tipo: d.tipo, finalidade: d.finalidade, bairro: d.bairro.trim(), cidade: d.cidade.trim(), uf: (d.uf || "RS").trim().toUpperCase().slice(0, 2) || "RS", preco: d.preco, quartos: d.quartos, banheiros: d.banheiros, vagas: d.vagas, suites: d.suites, area: d.area, titulo, descricao: d.descricao.trim(), comodidades: d.comodidades, fotos: ed.fotos.map(f => f.f).filter(Boolean), destaque: d.destaque, status: d.status, atualizado: hoje() };
      let r;
      if (ed.novo) r = await api.criar(Object.assign({ ref: d.ref }, reg));
      else r = await api.alterar(d.ref, reg);
      const x = linha(r);
      const i = E.lista.findIndex(y => y.ref === x.ref); if (i >= 0) E.lista[i] = x; else E.lista.unshift(x);
      const sobra = ed.removidas.filter(u => reg.fotos.indexOf(u) < 0); if (sobra.length) api.apagarFotos(sobra).catch(() => { });
      ed.enviadas = []; ed.sujo = false; salvando = false;
      aviso(x.status === "disponivel" ? (ed.novo ? `${x.ref} publicado. Já aparece no site.` : `${x.ref} salvo. O site já mostra a versão nova.`) : `${x.ref} salvo (fora do site: ${STATUS[x.status][0].toLowerCase()}).`, x.status === "disponivel" ? { link: ["Ver no site", linkSite(x.ref)], tempo: 7000 } : {});
      E.ed = null; vai("");
    } catch (er) {
      salvando = false; if (b) { b.classList.remove("carregando"); b.disabled = false; } marcaSujo();
      if (er.sessao) { aviso(er.message + " As alterações deste imóvel não foram salvas.", { erro: true }); return telaEntrada(er.message); }
      aviso(er.message, { erro: true, tempo: 9000 });
    }
  }

  // =====================================================================
  // início
  // =====================================================================
  async function iniciaSessao() {
    app.innerHTML = casca('<div class="carregando-tela" role="status" aria-label="Carregando os imóveis"></div>'); ligaCasca();
    try {
      const eq = await api.equipe();
      if (!eq || !eq.length) return telaSemAcesso();
      E.equipe = eq[0];
      E.lista = (await api.listar()).map(linha); E.carregou = true;
      rota();
    } catch (er) {
      if (er.sessao || er.status === 401) return telaEntrada(er.sessao ? er.message : "Sua sessão terminou. Entre de novo.");
      app.innerHTML = casca(`<div class="vazio">${I.alerta}<h3>Não foi possível carregar os imóveis.</h3><p>${esc(er.message)}</p><p><button class="btn btn-azul" type="button" id="b-tenta">Tentar de novo</button></p></div>`); ligaCasca();
      $("#b-tenta").addEventListener("click", iniciaSessao);
    }
  }
  function inicio() {
    // volta de link de e-mail (convite ou senha nova): #access_token=...&type=recovery|invite
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get("error") || h.get("error_description")) {
      history.replaceState(null, "", location.pathname + location.search);
      return telaEntrada(/expired|invalid/i.test(h.get("error_description") || h.get("error_code") || "") ? "O link expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\"." : "Não foi possível abrir o link do e-mail. Peça um novo em \"Esqueci minha senha\".");
    }
    if (h.get("access_token")) {
      let email = "";
      try { email = JSON.parse(atob(h.get("access_token").split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).email || ""; } catch (e) { }
      salvaSessao({ access_token: h.get("access_token"), refresh_token: h.get("refresh_token"), expires_in: h.get("expires_in"), expires_at: Number(h.get("expires_at")) || 0, user: { email } });
      const tipo = h.get("type");
      history.replaceState(null, "", location.pathname + location.search);
      if (tipo === "recovery" || tipo === "invite") return telaNovaSenha(tipo);
      return iniciaSessao();
    }
    if (!sessao) return telaEntrada();
    iniciaSessao();
  }
  window.KieselPainel = { E, api, versao: 1 };
  inicio();
})();
