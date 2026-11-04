# 03 — Cenas e transições

| Cena | Composição | Ligação e comportamento |
| --- | --- | --- |
| 1 — `amore` | Vermelho; logo creme; título condensado; pizza principal, secundária e fatia | Entrada única; plano compartilhado conduz pizza ao menu no desktop |
| 2 — `speisekarte` | Pedra escura, garfo e pasta à direita; pizza à esquerda; palavras Pizza/Pasta ao centro-direita | Corte diagonal ascendente; pizza termina na posição local da mesa; ações abrem categorias |
| 3 — `zutaten` | Pedra fotografada; frase e “Alles.” à esquerda; fatia e ingredientes à direita | Corte descendente; objetos se separam com a progressão, sem alterar sua anatomia |
| 4 — `restaurant` | Fotografia real; “Mittendrin. Mamma.”; marca, telefone e endereço | Corte ascendente; deslocamento fotográfico máximo ±9 px desktop; contato estável |

## Ingredientes

Progresso normalizado: `(alturaJanela - topoCena) / (alturaJanela + alturaCena)`. A dispersão segue `sin(progresso × π)` para retornar suavemente ao repouso nos extremos. Desktop: folha até −48/−85 px e −35°; tomate até 25/−70 px e 28°; mozzarella até 35/−50 px e −16°. A fatia varia aproximadamente ±17,5/±12,5 px e ±4°. Em telas estreitas usar fator .32. O segundo tomate é uma repetição decorativa da mesma imagem, não um asset adicional.

## Legibilidade e camadas

Os textos e controles ficam em planos superiores às imagens de movimento. Imagens decorativas têm `aria-hidden`/alt vazio. Não embutir slogans nas imagens. As fotos não recebem filtros que mudem as cores reais do restaurante. O gradiente local na cena final dá contraste à leitura, preservando o interior reconhecível.

## Responsividade

Desktop usa composição larga. Tablet reduz escalas e reorganiza o hero. Até 600 px, o menu mostra pizza recortada à esquerda, texto à direita e fotografia de pasta na base. Na cena de ingredientes, texto ocupa o topo e alimentos a metade inferior. Contato final vira uma coluna; a foto real preenche o fundo sem esticar.

## Controle

Revelação do texto: 18 px e opacidade, 800 ms, uma vez. Nenhum loop constante. `requestAnimationFrame` é acionado por eventos, sem render contínuo em repouso. Ao sair da aba, interromper entradas pendentes. A versão sem JavaScript permanece legível com links de chamada e mapa. O documento `motion/timeline.json` registra os parâmetros técnicos correspondentes.
