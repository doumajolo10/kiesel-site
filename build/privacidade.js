// Política de privacidade (LGPD, Lei nº 13.709/2018). Usada pelo build.js. Atualizar a data ao mudar o texto.
module.exports = function () {
  const sec = (t, ...ps) => `<h2>${t}</h2>${ps.map(p => p.startsWith("<ul") ? p : `<p>${p}</p>`).join("")}`;
  return `
<section class="pag-topo"><div class="miolo"><div class="trilha"><a href="index.html">Início</a> / Privacidade</div><h1 class="mask">Política de <span class="ital">privacidade.</span></h1><p>Como este site trata os seus dados, em linguagem direta. Atualizada em 15 de outubro de 2026.</p></div></section>
<section class="secao"><div class="miolo"><div class="texto-legal">
${sec("Em resumo",
    "Este site não tem cadastro, não usa cookies de rastreamento, de publicidade ou de estatística, e não vende nem empresta dados de ninguém. Os formulários não guardam nada: eles montam uma mensagem e abrem o seu WhatsApp, e só você decide se envia.")}
${sec("Quem cuida dos seus dados",
    "A controladora é a <b>Kipper Kiesel Ltda</b> (Kiesel Negócios Imobiliários), CNPJ 19.758.552/0001-91, CRECI 45.125/RS, Avenida Getúlio Vargas, 873, sala 02, Centro, São Martinho/RS, CEP 98690-000.",
    "Para qualquer assunto sobre os seus dados, fale com a Kiesel pelo WhatsApp <a href=\"https://wa.me/5555999479495\" target=\"_blank\" rel=\"noopener\">(55) 99947-9495</a> ou no escritório. A Kiesel é agente de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022), e este é o canal de atendimento ao titular.")}
${sec("Quais dados e para quê",
    `<ul>
<li><b>Navegação.</b> Como todo site, o servidor de hospedagem registra dados técnicos de cada acesso (endereço IP, navegador, página e horário), para manter o site no ar e protegê-lo contra ataques. Base legal: legítimo interesse (art. 7º, IX, da LGPD).</li>
<li><b>Favoritos e preferências.</b> Os imóveis que você guarda como favoritos ficam só no seu navegador (armazenamento local), assim como uma cópia de até 30 segundos da lista de imóveis, usada para as páginas abrirem mais rápido. Nada disso é enviado para a Kiesel. Para apagar, limpe os dados do site no seu navegador.</li>
<li><b>Contato, encomenda e anúncio de imóvel.</b> Os formulários usam o nome, o telefone e a mensagem que você digitar apenas para montar o texto do WhatsApp. O site não guarda nada. Se você enviar a mensagem, a Kiesel usa esses dados para responder e dar andamento ao que você pediu. Base legal: procedimentos preliminares de um contrato, a seu pedido (art. 7º, V).</li>
<li><b>Atendimento e negócios.</b> Quando uma conversa vira visita, proposta, compra, venda ou locação, a Kiesel guarda os dados necessários para o negócio e para cumprir as obrigações legais da corretagem de imóveis (art. 7º, II e V).</li>
</ul>`)}
${sec("Com quem os dados são compartilhados",
    `<ul>
<li><b>Vercel Inc.</b>: hospedagem do site (registros técnicos de acesso).</li>
<li><b>WhatsApp (Meta)</b>: somente se você escolher conversar com a Kiesel por lá, conforme os termos do próprio WhatsApp.</li>
<li><b>Google</b>: somente se você clicar em "Mostrar o mapa". O mapa só é carregado depois do seu clique.</li>
<li><b>Supabase</b>: guarda o cadastro dos imóveis exibidos no site. Não recebe dados de visitantes.</li>
<li>Autoridades públicas, quando houver obrigação legal ou ordem judicial.</li>
</ul>`,
    "Alguns desses serviços mantêm servidores fora do Brasil, principalmente nos Estados Unidos. Essa transferência internacional se apoia nas garantias contratuais de proteção de dados oferecidas por esses provedores (art. 33 da LGPD).")}
${sec("Por quanto tempo",
    "Os registros técnicos de acesso ficam com a hospedagem pelo prazo curto definido por ela. Os dados de atendimento ficam pelo tempo necessário para o atendimento e pelos prazos exigidos por lei para a atividade de corretagem. Depois disso, são apagados ou anonimizados.")}
${sec("Os seus direitos",
    "Pela LGPD (art. 18), você pode pedir à Kiesel, a qualquer momento e sem custo:",
    `<ul>
<li>confirmação de que tratamos dados seus e acesso a eles;</li>
<li>correção de dados incompletos, errados ou desatualizados;</li>
<li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
<li>portabilidade dos dados a outro fornecedor;</li>
<li>informação sobre com quem os dados foram compartilhados;</li>
<li>revogação do consentimento, quando ele for a base do tratamento, e oposição a tratamentos que você não aceite.</li>
</ul>`,
    "Os pedidos são atendidos pelo WhatsApp (55) 99947-9495 ou no escritório. Se não ficar satisfeito, você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD), em <a href=\"https://www.gov.br/anpd\" target=\"_blank\" rel=\"noopener\">gov.br/anpd</a>.")}
${sec("Segurança",
    "O site só funciona por conexão criptografada (HTTPS) e segue as proteções recomendadas para navegadores. A área de cadastro de imóveis é restrita à equipe da Kiesel, com senha individual, e guarda o histórico de cada alteração.")}
${sec("Crianças e adolescentes",
    "Este site não é dirigido a menores de 18 anos, e a Kiesel não coleta, de propósito, dados de crianças ou adolescentes.")}
${sec("Mudanças nesta política",
    "Se esta política mudar, a nova versão é publicada nesta página, com a data de atualização no topo.")}
</div></div></section>`;
};
