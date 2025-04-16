# Changelog

Todas as alterações relevantes do projeto serão registradas aqui para facilitar o acompanhamento do desenvolvimento.

## [2025-04-16]
### Melhorias Visuais e Funcionais
- Tooltip flutuante na barra de range mostrando amplitude, limites e valor de entrada.
- PNL colorido (verde/vermelho) conforme positivo/negativo.
- Edição inline dos campos "Não Coletado" e "Coletado" direto na lista.
- Redução do peso da fonte dos valores da lista.
- Símbolo `$` menor e cinza nos cards do dashboard e nas listas.

### Refino de UX
- Consistência nos ícones de ação (Heroicons outline).
- Responsividade e contraste aprimorados.
- Ajustes no alinhamento e espaçamento dos componentes.

### Correções
- Remoção de imports duplicados.
- Correção de erros de JSX (parent element).
- Atualização inline sem abrir modal.

---

## [2025-04-15]
### Novas Funcionalidades
- Exibição de três cards superiores adicionais (Ganhos Totais, P&L Total, APR Anual Total %) ao selecionar a aba "Posições fechadas".
- Cálculo do APR anual total médio ponderado para pools fechadas.

### Melhorias de Layout e UX
- Título "Dashboard de Pools de Liquidez" movido para o topo da página, acima dos cards.
- Dropdowns de período reposicionados para dentro dos cards correspondentes (Rendimento Est. e Taxas Est.), alinhados à base, sem título e com fonte branca.
- Centralização do conteúdo dos cards pelo topo.
- Botão "+ Adicionar Posição" alinhado à direita, botão "Ocultar" removido.
- Centralização dos botões de ação da tabela de posições.
## [2025-04-16]
### Melhorias
- Refino do dashboard de pools de liquidez com foco em métricas financeiras, usabilidade, clareza visual e responsividade.
- Cards de métricas principais agora exibem valores monetários com símbolo destacado e formatação consistente.
- Responsividade aprimorada em cards e tabelas usando grid/flex e cores de alto contraste.
- Dropdowns de período integrados nos cards de rendimento e taxas estimadas, alinhados ao rodapé e sem títulos.
- Layout reorganizado para melhor alinhamento e espaçamento dos elementos.
- Implementação de edição inline para campos "Coletado" e "Não Coletado" diretamente na tabela de posições.
- Persistência robusta dos dados (posições abertas e fechadas) via localStorage, com carregamento seguro no cliente para evitar erros de hidratação.

### Correções
- Ajuste de erros de JSX, fechamento de tags e estrutura de componentes React.
- Correção de cálculos e exibição dos valores nos cards e tabelas (APR, P&L, ganhos).
- Prevenção de erros de hidratação e sincronização entre SSR e client-side.

### Novas funcionalidades
- Implementação de feedback visual ao salvar dados ("Dados salvos!").
- Adição de exportação e importação de backup em JSON para posições abertas e fechadas.
- Cards exclusivos para "Posições fechadas" exibindo ganhos totais, P&L total e APR anual médio ponderado.
- Barra visual para amplitude de range e preço de entrada na tabela de posições.
- Modal para adição/edição de posições e função de duplicar posição.

