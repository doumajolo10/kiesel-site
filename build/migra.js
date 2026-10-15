// Migração única (15/10/2026): leva a carteira atual (dados.js, vinda do Kenlo) para o formato do painel.
//  - capa passa a ser sempre a 1ª foto (o mapa CAPA do build sai);
//  - destaques passam a ser uma ordem (1..6) escolhida no painel;
//  - corrige "300.000, 00" -> "300.000,00" nas descrições (defeito do limpa() antigo);
//  - TE0028 atualizado com o Kenlo de hoje (6 fotos; preço real de R$ 300 mil está na descrição).
// Grava dados.js no formato novo e supabase/kiesel.sql (estrutura + carga). Uso: node build/migra.js
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const M = require(path.join(RAIZ, "modelo.js"));
const w = {}; global.window = w; require(path.join(RAIZ, "dados.js"));
if (!w.IMOVEIS[0] || !("url_original" in w.IMOVEIS[0])) { console.log("dados.js já está no formato novo; nada a fazer."); process.exit(0); }

const CAPA = { CA0044: 1, CA0036: 2, CH0002: 2, CA0047: 1, CA0040: 2 };
const DESTAQUES = ["CA0036", "CA0044", "CH0005", "CH0002", "CA0035", "CA0047"];
const lista = w.IMOVEIS.map(x => {
  const fotos = x.fotos.slice();
  const c = CAPA[x.ref] || 0; if (c) fotos.unshift(fotos.splice(c, 1)[0]);
  const y = { ...x, fotos, destaque: DESTAQUES.indexOf(x.ref) + 1, descricao: x.descricao.replace(/(\d), (\d)/g, "$1,$2") };
  if (x.ref === "TE0028") { y.fotos = ["01", "02", "03", "04", "05", "06"].map(n => "TE0028-" + n); y.preco = 300000; y.atualizado = "2026-10-15"; }
  return M.normaliza(y);
});
const ordenada = M.ordena(lista);
fs.writeFileSync(path.join(RAIZ, "dados.js"), "window.IMOVEIS=" + JSON.stringify(ordenada) + ";\n");

// ---------- SQL ----------
const q = s => s == null ? "null" : "'" + String(s).replace(/'/g, "''") + "'";
const arr = a => "array[" + a.map(q).join(",") + "]::text[]";
const linhas = ordenada.map(x => `(${[q(x.ref), q(x.tipo), q(x.finalidade), q(x.bairro), q(x.cidade), q(x.uf), x.preco, x.quartos, x.banheiros, x.vagas, x.suites, x.area, q(x.titulo), q(x.descricao), x.comodidades.length ? arr(x.comodidades) : "'{}'::text[]", arr(x.fotos), x.destaque, "'disponivel'", q(x.atualizado)].join(", ")})`);
const sql = fs.readFileSync(path.join(RAIZ, "supabase", "estrutura.sql"), "utf8") + `
-- ============ 3. CARGA: os ${ordenada.length} imóveis disponíveis hoje (conferidos com o site atual em 15/10/2026) ============
insert into public.kiesel_imoveis (ref, tipo, finalidade, bairro, cidade, uf, preco, quartos, banheiros, vagas, suites, area, titulo, descricao, comodidades, fotos, destaque, status, atualizado) values
${linhas.join(",\n")}
on conflict (ref) do nothing;

select count(*) as imoveis_carregados from public.kiesel_imoveis;
`;
fs.mkdirSync(path.join(RAIZ, "supabase"), { recursive: true });
fs.writeFileSync(path.join(RAIZ, "supabase", "kiesel.sql"), sql);
console.log("imóveis:", ordenada.length, "| destaques:", ordenada.filter(x => x.destaque).map(x => x.ref).join(","), "| sql:", Math.round(sql.length / 1024) + " KB");
