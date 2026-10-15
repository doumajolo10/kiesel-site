// Acrescenta ao supabase/estrutura.sql e ao supabase/kiesel.sql as proteções extras do banco (uma vez só):
// limites de tamanho nos campos, histórico de alterações/exclusões e bloqueio de execução direta das funções internas.
const fs = require("fs"), path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const BLOCO = `
-- ============ 1b. PROTEÇÕES EXTRAS ============
-- limites de tamanho (evita texto gigante ou centenas de fotos por engano)
do $$ begin
  alter table public.kiesel_imoveis add constraint kiesel_titulo_tam check (char_length(titulo) <= 120);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.kiesel_imoveis add constraint kiesel_descricao_tam check (char_length(descricao) <= 10000);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.kiesel_imoveis add constraint kiesel_listas_tam check (cardinality(fotos) <= 60 and cardinality(comodidades) <= 60);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.kiesel_imoveis add constraint kiesel_textos_tam check (char_length(tipo) <= 40 and char_length(bairro) <= 80 and char_length(cidade) <= 80 and char_length(uf) <= 2);
exception when duplicate_object then null; end $$;

-- histórico: guarda a versão anterior a cada alteração ou exclusão (recupera imóvel apagado por engano)
create table if not exists public.kiesel_historico (
  id     bigint generated always as identity primary key,
  ref    text not null,
  acao   text not null,
  antes  jsonb not null,
  quem   text,
  quando timestamptz not null default now()
);
alter table public.kiesel_historico enable row level security;
drop policy if exists "kiesel: equipe le historico" on public.kiesel_historico;
create policy "kiesel: equipe le historico" on public.kiesel_historico for select to authenticated
  using (public.kiesel_eh_equipe());
revoke all on public.kiesel_historico from anon;
grant select on public.kiesel_historico to authenticated;

create or replace function public.kiesel_guarda_historico() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.kiesel_historico (ref, acao, antes, quem) values (old.ref, lower(tg_op), to_jsonb(old), auth.jwt() ->> 'email');
  return null;
end $$;
drop trigger if exists kiesel_historico on public.kiesel_imoveis;
create trigger kiesel_historico after update or delete on public.kiesel_imoveis
  for each row execute function public.kiesel_guarda_historico();

-- funções internas não podem ser chamadas de fora
revoke execute on function public.kiesel_guarda_historico() from public, anon, authenticated;
revoke execute on function public.kiesel_carimbo() from public, anon, authenticated;
-- a equipe e o público nunca escrevem na lista da equipe pelo site (só pelo SQL Editor)
revoke insert, update, delete on public.kiesel_equipe from anon, authenticated;
revoke insert, update, delete on public.kiesel_imoveis from anon;
`;
const MARCA = "-- ============ 2. EQUIPE ============";
for (const f of ["estrutura.sql", "kiesel.sql"]) {
  const arq = path.join(RAIZ, "supabase", f);
  let s = fs.readFileSync(arq, "utf8");
  if (s.includes("1b. PROTEÇÕES EXTRAS")) { console.log(f, "já tem"); continue; }
  if (!s.includes(MARCA)) throw new Error("marca não achada em " + f);
  s = s.replace(MARCA, () => BLOCO.trim() + "\n\n" + MARCA);
  fs.writeFileSync(arq, s);
  console.log(f, "ok");
}
