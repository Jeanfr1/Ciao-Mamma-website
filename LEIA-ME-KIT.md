# Ciao Mamma! — Rosso in Movimento

Kit completo do **modelo 2**, aprovado na conversa. Hero e todas as cenas seguem o modelo 2. Público: Hamburg, Alemanha. Idioma do site: alemão. Entrega local de 04/11/2026, sem publicação.

## Comece aqui

1. Extraia o ZIP inteiro. Mantenha as pastas e os nomes.
2. Abra `GUIA-VISUAL.html` para consultar a identidade, o mapa de cenas e os arquivos.
3. Abra `site/index.html` em um navegador atual para usar o site. Não há instalação, conta, compilação ou dependência de CDN. Fontes locais podem exigir servir `site/` em uma hospedagem estática, conforme as restrições do navegador para `file://`.
4. Leia os seis documentos em `roteiros/` antes de integrar mudanças.
5. Consulte `docs/QA.md` para distinguir os testes executados das verificações ainda necessárias no navegador.

## O que está incluído

| Pasta / arquivo | Conteúdo |
| --- | --- |
| `site/` | HTML, CSS, JavaScript, imagens WebP, logo vetorial e fontes locais; experiência estática funcional |
| `brand/` | Logos nativas SVG e PNG RGBA com fundo transparente, símbolo, avatar, paleta e tokens |
| `fonts/` | Fontes TTF de produção, originais oficiais e licenças OFL |
| `images/master/` | Oito imagens de campanha em resolução original; seis recortes com transparência |
| `images/originals/` | Três fotos reais fornecidas, preservadas sem alterações |
| `references/` | Concepts visuais e reprodução de trabalho do modelo 2 aprovado |
| `motion/` | Timeline e parâmetros da animação implementada |
| `roteiros/` | Direção de arte, sequência de movimento, integração, conteúdo, imagens e validação |
| `docs/` | Decisão aprovada, fontes, mapa de assets, verificações e limite da entrega |
| `tools/` | Verificador do kit, exportador de assets e dependências de reprodução |
| `MANIFEST.sha256` | Integridade de todos os demais arquivos do kit |

## As quatro cenas aprovadas

1. **Amore auf den ersten Biss.** Cartaz vermelho, logo creme, tipografia inclinada e pizzas em primeiro plano. É a única cena principal com fundo de cor lisa.
2. **Was darf’s sein? Pizza / Pasta.** Mesa escura com fotografia de campanha e a mesma pizza conduzida visualmente desde o hero no desktop.
3. **Der gute Teil? Alles.** Ingredientes em planos separados sobre imagem de pedra escura; texto vivo e objetos responsivos.
4. **Mittendrin. Mamma.** Foto real do restaurante, endereço, telefone e consulta de mesa. O rodapé integra essa cena.

Três cortes diagonais alternados unem as cenas. Não foram adicionadas seções dos modelos 1 ou 3, cartões repetitivos ou um quinto bloco de fundo liso.

## Marca

Nome de produção: **Ciao Mamma!**, conforme a fachada e as fontes locais consultadas. Paleta: Pomodoro `#AC2E27`, Creme `#F3EAD6`, Basilico `#2F4A34`, Carbone `#181613`. Títulos: Barlow Condensed em itálico. Textos: Manrope. O lettering da logo é um desenho de marca vetorizado, não um alfabeto tipográfico completo.

Use a versão creme em vermelho e em fotografia escura. Use Pomodoro/Basilico sobre creme. O PNG transparente não contém um retângulo de fundo; o avatar, por sua função, tem uma base creme. A logo do cabeçalho usa um SVG recortado para ocupar bem o espaço sem margens vazias.

## Movimento entregue

O site contém animação programada em CSS e JavaScript, com elementos 2D em planos de profundidade. No desktop a pizza atravessa o limite do cartaz e chega à cena Pizza/Pasta. Ingredientes respondem à progressão da página. O roteiro descreve a continuidade e os limites de movimento. **Não há vídeo gerado, render 3D, sequência de frames ou vídeo de fundo.**

O botão de pausa mantém a preferência local. A versão de movimento reduzido fica estática, com conteúdo visível e sem um grande espaço vazio do hero. Em telas estreitas, o efeito de transferência fixa é substituído por enquadramentos locais e deslocamentos menores. O scroll permanece nativo.

## Conteúdo e ações

Endereço: Am Sandtorkai 38–40, 20457 Hamburg. Telefone: 040 325 137 64. “Tisch anfragen” abre uma chamada; não confirma reserva. “Route planen” abre o mapa. Pizza/Pasta abre uma apresentação das duas categorias com foto real da mesa e aviso sobre a carta atual.

**A carta completa e os preços atuais não foram obtidos de fonte oficial.** Não foram inventados pratos, preços, horários ou avaliações. Para publicar uma carta completa, substitua a apresentação de categorias por dados confirmados pelo restaurante, conforme `roteiros/04-CONTEUDO-E-INTEGRACAO.md`. Não há pedidos online, carrinho, formulário, pagamento ou backend.

## Fotos e referência

As três fotos reais permanecem em `images/originals/`. A foto do interior e a foto da mesa são usadas no site com recorte de enquadramento; não foram reconstruídas por IA. Pizzas, ingredientes e mesas de estúdio são imagens de campanha geradas para o conceito, não registros de pratos servidos nem de instalações reais.

`references/Modelo-2-Referencia-de-Trabalho.png` é uma reprodução gerada para consulta local a partir da proposta aprovada na conversa. Não é o arquivo binário original da proposta e não é uma captura da implementação HTML. A referência MOV foi analisada por amostragem de frames; o vídeo e as capturas da gravação não fazem parte do kit.

## Edição e passagem para produção

- Textos e contatos: `site/index.html` e `site/content.js`. Atualize também o JSON-LD no HTML ao alterar a empresa.
- Aparência: `site/styles.css`. Preserve a ordem das quatro cenas e o recorte diagonal de cada junção.
- Movimento: `site/app.js` e `motion/timeline.json`. Altere parâmetros com a direção de arte em mãos.
- Imagens: substitua os arquivos correspondentes mantendo transparência, proporções e pontos focais; ajuste as dimensões no HTML se necessário.
- Conteúdo operacional ainda a fornecer: carta/preços atuais, horários se desejados e textos institucionais/legais aprovados para publicação. O kit não inventa esses dados.

Validação local: `python3 tools/verificar-kit.py`. O verificador exige Pillow e fontTools; o site não depende deles. Para reexportar SVG/PNG/fontes/WebP: `python3 -m pip install -r tools/requirements.txt` e `python3 tools/preparer-assets.py`. A reexportação não executa geração de imagens. Depois de editar arquivos, regenere o manifesto SHA e o ZIP; o manifesto entregue corresponde à versão fechada.

O site não foi publicado. A prévia gerenciada ficou indisponível neste ambiente, portanto a revisão em navegador permanece pendente. As verificações estáticas e a integridade do arquivo estão descritas em `docs/QA.md`.
