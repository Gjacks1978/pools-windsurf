# Changelog

Todas as alterações relevantes do projeto serão registradas aqui para facilitar o acompanhamento do desenvolvimento.

## [Unreleased] - 2025-04-22

### Added
- Implementação da funcionalidade de rastreamento de carteiras por endereço:
    - Criação do componente `TrackByAddress.tsx` para adicionar e gerenciar endereços.
    - Integração com API para buscar dados de pools de liquidez da Uniswap (Ethereum).
    - Exibição de dados reais de pools com as mesmas informações das listas manuais.
    - Adição de indicador visual (barra verde) para mostrar o valor atual do ativo no range.
    - Tratamento de erros ao rastrear endereços inválidos ou sem dados.
    - Integração dos resultados totais aos cards superiores do dashboard.

- Implementação da autenticação de usuários usando Supabase:
    - Adição do pacote `@supabase/supabase-js`.
    - Criação do `AuthContext` (`src/contexts/AuthContext.tsx`) para gerenciar estado de autenticação.
    - Criação do `AuthForm` (`src/components/AuthForm.tsx`) para login/cadastro.
    - Criação do `LogoutButton` (`src/components/LogoutButton.tsx`).
    - Integração do `AuthProvider` no layout raiz (`src/app/layout.tsx`).
    - Condicionamento da renderização da página principal (`src/app/page.tsx`) com base no estado de autenticação.
    - Criação do arquivo de configuração do cliente Supabase (`src/lib/supabaseClient.ts`).
    - Adição do componente de erro padrão `src/app/error.tsx` para o App Router.

### Fixed
- Correção de problemas de build e dependências relacionados ao `pnpm` e Next.js:
    - Resolvido erro "Module not found" para `@supabase/supabase-js`.
    - Corrigido erro de componente cliente adicionando `"use client"` ao `AuthContext`.
    - Resolvidos problemas de carregamento de chunks e arquivos estáticos (erros 404) limpando cache e garantindo a correta instalação das dependências com `pnpm`.

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
