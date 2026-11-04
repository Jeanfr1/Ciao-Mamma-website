# 04 — Conteúdo e integração

## Idioma e fatos

Todo texto público está em alemão. Marca e nomes culinários italianos são preservados. Dados usados: Ciao Mamma!, Am Sandtorkai 38–40, 20457 Hamburg; 040 325 137 64. Fonte e data de consulta constam em `docs/FONTES-E-LIMITES.md`. Não usar o domínio semelhante `ciao-mama.de`: pertence a outra empresa em outra cidade.

## Ações já ligadas

- Menu: abre diálogo nativo com abas Pizza e Pasta. Setas, Home e End alternam abas; Escape fecha; o foco retorna à ação de origem. O conteúdo explica que a seleção e os preços atuais devem ser consultados diretamente.
- “Tisch anfragen” e “Anrufen”: `tel:+494032513764`. Consulta por chamada, sem confirmação de mesa pelo site.
- “Route planen”: busca no Google Maps com nome e endereço corretos.
- Navegação móvel: menu expansível nativo, fechado ao escolher uma seção.
- “Animationen”: pausa/retoma movimento e mantém a preferência local. A preferência de movimento reduzido do sistema prevalece.

## Carta atual — integração pendente de dados

O kit tem apresentação de categorias; não é uma carta completa. Não preencher preços ou combinações a partir de fotos de exemplo ou agregadores conflitantes. Solicitar ao restaurante uma carta atual autorizada em texto, PDF ou URL. Confirmar data, nome dos pratos, preços, unidades e informações fornecidas pelo estabelecimento.

Com os dados confirmados, adaptar `content.js` e a área do diálogo. Se a carta for um PDF oficial, incluir cópia autorizada em `site/assets/` e link descritivo. Não transformar botões de chamada em pedidos ou reservas sem um serviço real. Atualizar este documento e remover o aviso de carta incompleta apenas quando a integração estiver concluída.

## Onde editar

`site/index.html` contém textos das quatro cenas, navegação, telefone, endereço, metadados e JSON-LD. `site/content.js` contém as duas descrições de categorias e dados de referência. Os links existentes são HTML para funcionar também sem JavaScript. Uma alteração de telefone exige atualizar todas as ocorrências no HTML e o objeto de conteúdo; executar o verificador depois.

O site não usa email, formulário, analytics ou serviços remotos para renderizar. A preferência de animação usa somente a chave local `ciao-mamma.motion.paused`. A hospedagem deve servir `site/index.html`, imagens, fontes, CSS e JS com os caminhos relativos preservados. Nenhuma publicação faz parte desta entrega.

Antes de publicar, completar os dados operacionais desejados e os textos institucionais/legais aprovados pelo responsável. Não reutilizar endereços ou credenciais de outros projetos.
