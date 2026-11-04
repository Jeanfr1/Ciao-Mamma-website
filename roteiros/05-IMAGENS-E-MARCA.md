# 05 — Imagens e marca

## Campanha: oito mestres

`pizza-main`, `pizza-secondary`, `pizza-slice`, `basil`, `tomato` e `mozzarella` são PNG RGBA com canal alfa real. `menu-stage` e `taste-stage` são fundos RGB opacos. Os oito originais de geração estão em `images/master/`; as versões WebP de produção estão em `site/assets/`. Os prompts ficam em `docs/image-prompts.json`.

A principal tem um recorte de fatia consistente com a composição. A fatia é um elemento de campanha separado: não há simulação física exata de retirada 3D nem promessa de correspondência de cada ingrediente entre imagens. Manter o movimento curto e a escala coerente. Não estender fios de queijo artificialmente para conectar duas imagens que não foram fotografadas juntas.

## Fotografias reais

Os três PNG fornecidos estão intactos em `images/originals/`, com hashes no manifesto de assets. Interior e mesa têm cópias WebP usadas no site; o recorte nativo em SVG exclui a interface da captura no topo. A fachada é preservada como fonte documental e não ocupa uma quinta cena. Não substituir o letreiro da foto por uma logo ficticiamente instalada.

## Logo e tipografia

`Logo-Ciao-Mamma-Pomodoro-Transparente.png` e `Logo-Ciao-Mamma-Creme-Transparente.png`: 1774×887 px, RGBA, fundo transparente. Os SVG equivalentes têm paths nativos e não dependem de fontes instaladas nem de imagens embutidas. `Sinal-Folha.svg` e `Avatar-Ciao-Mamma` completam o conjunto. O avatar possui fundo creme intencional.

A origem raster de produção e o exportador estão incluídos. Os contornos foram vetorizados e as cores normalizadas à paleta definida. Pequenos pontos soltos foram removidos na extração. Não afirmar que o SVG é uma fonte comercial ou que o lettering oferece um alfabeto completo.

As famílias Barlow Condensed e Manrope vieram do repositório oficial Google Fonts. TTF, WOFF e licenças OFL acompanham o kit. Não trocar a família silenciosamente por uma fonte “parecida”. As cores da interface não devem ser gravadas nas fotos: usar CSS e as artes de logo correspondentes.

## Classificação e uso

Campanha gerada = direção de arte do site. Fotos reais = registros do restaurante fornecidos pelo usuário. Concepts = inspiração, sem logotipos, textos estrangeiros ou marcas de outras empresas publicados. A prancha de trabalho do modelo 2 = reprodução para consulta; não é screenshot do site. Os arquivos de referência não são carregados pela página pública.
