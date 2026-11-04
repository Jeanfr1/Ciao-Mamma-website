# 06 — Validação e entrega

## Conferência do escopo

Confirmar quatro cenas e somente um fundo principal liso; hero e seções do modelo 2; logo transparente; imagens de produção e fontes locais; fotos reais preservadas; animações programadas e instruções sem vídeo. Usar `docs/architecture-lock.json` para a ordem aprovada e `docs/selection.json` para a decisão.

## Verificações executáveis

Na raiz do kit: `python3 tools/verificar-kit.py`. A ferramenta valida estrutura, caminhos locais, referências de acessibilidade, JavaScript, dimensões de imagens, canal alfa, paths SVG nativos, licenças e hashes dos originais. O resultado fica em `docs/QA.json` e `docs/QA.md`. Não confundir verificações estáticas com navegação real.

Para conferir o arquivo recebido: testar extração do ZIP e comparar `MANIFEST.sha256` com os arquivos extraídos, por exemplo `sha256sum -c MANIFEST.sha256` em um terminal compatível. O manifesto não inclui a si próprio. Qualquer alteração posterior exige gerar novo manifesto e ZIP.

## Revisão de navegador ainda necessária

Neste ambiente o serviço de prévia não estava disponível. Testar antes de publicar em 320, 375, 390, 768, 1024 e 1440 px: ausência de overflow; posições dos objetos; legibilidade do título; continuidade da pizza; junções diagonais; modal de categorias por mouse/teclado; retorno do foco; menu móvel; mapa e chamada; pausa; movimento reduzido; sem JavaScript; economia de dados quando suportada. Conferir também Safari/iOS e Chrome/Android reais. Não declarar essa lista como aprovada sem executá-la.

## Passagem final

Confirmar carta e preços, conteúdo operacional e textos aprovados para publicação. Servir a pasta `site/` como estática, sem remover arquivos. Inspecionar a versão hospedada, sobretudo caminho de fontes e imagens. Publicar somente no projeto correto quando houver solicitação; este ZIP não contém identidade de hospedagem de outro cliente.

Em caso de falha de download, usar o arquivo completo salvo, sem renomear um PDF como ZIP e sem entregar apenas o guia. Uma cópia deve conservar o mesmo hash do arquivo validado. A estrutura tem uma única pasta principal para facilitar extração e evitar mistura com kits anteriores.
