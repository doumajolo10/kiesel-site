// Traz a carteira do painel (Supabase) para dados.js, que o build.js usa para gerar as páginas.
// Roda na rotina do GitHub (a cada 15 min) e pode rodar aqui: node build/puxa.js
// Lê só os imóveis disponíveis, com a chave pública. Se o banco não responder, mantém o dados.js atual.
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const M = require(path.join(RAIZ, "modelo.js")), S = M.SUPA;
(async () => {
  let linhas;
  try {
    const r = await fetch(S.url + "/rest/v1/" + S.tabela + "?select=*&status=eq.disponivel", { headers: { apikey: S.chave, Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error("HTTP " + r.status + " " + (await r.text()).slice(0, 200));
    linhas = await r.json();
  } catch (e) { console.log("banco indisponível, dados.js mantido:", e.message); return; }
  if (!Array.isArray(linhas) || !linhas.length) { console.log("banco sem imóveis disponíveis; dados.js mantido por segurança"); return; }
  const lista = M.ordena(linhas.map(M.normaliza));
  const novo = "window.IMOVEIS=" + JSON.stringify(lista) + ";\n";
  const arq = path.join(RAIZ, "dados.js");
  const atual = fs.existsSync(arq) ? fs.readFileSync(arq, "utf8") : "";
  if (atual === novo) { console.log("sem mudanças:", lista.length, "imóveis"); return; }
  fs.writeFileSync(arq, novo);
  console.log("dados.js atualizado:", lista.length, "imóveis");
})();
