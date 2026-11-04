# 02 — Hero e animação

## Ideia narrativa

“O primeiro impulso vem do cartaz; a pizza conduz o olhar até a mesa.” A animação cria continuidade de produto. Não repetir um loop inteiro, não bloquear o scroll e não criar um vídeo. A montagem é feita com imagens RGBA, transforms, CSS e JavaScript.

## Abertura, ao entrar no topo

1. O vermelho e a marca já estão disponíveis como base. Depois de fonte e pizza decodificarem, a pizza principal entra em 1,5 s: deslocamento vertical 100→0 px, rotação −8→0°, escala .86→1 e opacidade .2→1.
2. A fatia entra com atraso de 100 ms e duração de 1,65 s; deslocamento 40/−70→0/0 px, rotação 14→0°, escala .88→1. Não simular queijo infinito ou deformação elástica do alimento.
3. O manjericão aparece em 1 s, atraso de 220 ms, leve desfoque 3→0 px. As três linhas do título sobem 25 px em 800 ms, com 100 ms de intervalo.
4. O estado final permanece quieto. A abertura acontece uma vez por carregamento; não reinicia ao voltar de cada seção. Ao rolar cedo, as entradas são canceladas para a interação assumir o controle.

## Scroll desktop, largura mínima 900 px

Hero com percurso de 160svh e palco aderente ao topo. A mesma imagem de pizza é desenhada em um plano fixo que interpola o retângulo da posição inicial e o da posição final da cena de menu. A transferência começa quando o menu entra na janela e termina quando o topo do menu chega ao topo da janela. No meio, inclinação máxima de 5°; endpoints sem rotação adicional.

Não há captura do scroll nem câmera 3D. As pizzas locais continuam no layout como posições mensuráveis e passam a invisíveis apenas enquanto o plano compartilhado está ativo. Ao pausar, restaurar as versões locais imediatamente. O título e as ações precisam continuar legíveis; a pizza não deve interceptar cliques.

Fatia, pizza secundária e folha deslocam-se em velocidades diferentes. No apontador fino, parallax de até 4 px por eixo: sutil, sem perseguir o cursor. A roda do mouse, trackpad e teclado continuam naturais.

## Mobile e redução de movimento

Abaixo de 900 px não usar pizza fixa atravessando a página. As imagens locais mantêm o enquadramento e os movimentos são reduzidos. Preferência de movimento reduzido ou economia de dados desliga a animação. O botão de pausa registra a escolha no armazenamento local; ao alterar a altura do hero, preservar a posição de leitura. Não deixar 160svh vazio na versão estática.

## Inspiração analisada

O arquivo de referência `ANIMATIONIDEIA.mov`, 14 s, foi examinado por sete frames amostrados. O exemplo mostra um site de café: moedor, grãos, peças separadas, filtro, serviço de café e produtos. A adaptação aproveita escala, planos e continuidade entre objetos. Não copia café, marca, layout literal ou áudio. O MOV e as capturas de análise não são entregáveis. O site entregue não contém vídeo.
