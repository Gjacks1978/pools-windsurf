# Documentação Técnica: Dashboard de Pools de Liquidez

## Visão Geral do Projeto

O Dashboard de Pools de Liquidez é uma aplicação web construída com Next.js que permite aos usuários gerenciar e monitorar suas posições em pools de liquidez de exchanges descentralizadas (DEXs). A aplicação oferece recursos para adicionar, editar, duplicar e fechar posições manualmente, além de cálculos automáticos de métricas financeiras como ganhos, rendimento estimado e taxas acumuladas. Também inclui uma ampla seção de relatórios com gráficos interativos para análise de desempenho ao longo do tempo.

Data de atualização: 23/04/2025

## Tecnologias Utilizadas

- **Frontend:**
  - React 18+ com TypeScript
  - Next.js 15.3.0 (App Router)
  - TailwindCSS para estilização
  - Componentes funcionais com Hooks
  - Recharts para visualizações gráficas
  - Heroicons para ícones consistentes

- **Autenticação:**
  - Supabase para autenticação e persistência
  - Context API para gerenciamento de estado de autenticação

- **Persistência:**
  - LocalStorage para armazenamento de posições
  - Supabase para dados de usuário
  - Exportação/importação via JSON para backup

## Arquitetura e Estrutura do Projeto

### Estrutura de Diretórios

```
pools/
├── public/                  # Arquivos estáticos
├── src/
│   ├── app/                 # Rotas do App Router
│   │   ├── api/             # API Routes
│   │   ├── error.tsx        # Tratamento de erros
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página principal (Dashboard)
│   ├── components/          # Componentes React
│   │   ├── AddPositionModal.tsx   # Modal para adicionar/editar posições
│   │   ├── AuthForm.tsx           # Formulário de autenticação
│   │   ├── DashboardCards.tsx     # Cards de métricas do dashboard
│   │   ├── LogoutButton.tsx       # Botão de logout
│   │   ├── Navbar.tsx             # Barra de navegação com ícones
│   │   ├── Notification.tsx       # Componentes de notificação
│   │   ├── PositionsTable.tsx     # Tabela de posições
│   │   └── ReportSection.tsx      # Seção de relatórios e gráficos
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   └── lib/                 # Bibliotecas e utilitários
│       ├── supabaseClient.ts # Cliente Supabase
│       └── supabaseData.ts   # Funções para manipulação de dados
├── tailwind.config.js       # Configuração do Tailwind CSS
├── CHANGELOG.md             # Histórico de mudanças
├── TECHNICAL.md             # Documentação técnica
└── tsconfig.json            # Configuração do TypeScript
```

## Componentes Principais

### 1. `page.tsx` (Página Principal)

Este é o componente raiz da aplicação que contém a lógica principal e o estado. Ele gerencia:
- Lista de posições abertas e fechadas
- Tabs para alternar entre posições abertas, fechadas e relatórios
- Integração com LocalStorage para persistência
- Funcionalidades de exportação/importação
- Alternância entre temas claro e escuro
- Renderização condicional baseada no estado de autenticação

**Estado Principal:**
- `positions`: Array com posições abertas
- `closedPositions`: Array com posições fechadas
- `tab`: Estado atual da aba ('open', 'closed' ou 'reports')
- `modalOpen`: Controla a exibição do modal de adição/edição
- `isDarkMode`: Controla o tema visual da aplicação

### 2. `AddPositionModal.tsx`

Modal para adicionar novas posições ou editar existentes. Inclui:
- Formulário com validação de campos
- Preenchimento automático para edição
- Cálculos em tempo real de valores estimados

### 3. `PositionsTable.tsx`

Tabela responsiva que exibe as posições com as seguintes funcionalidades:
- Ações para cada posição (editar, duplicar, fechar/restaurar, excluir)
- Exibição visual da posição atual no intervalo de preço (barra colorida)
- Indicadores visuais para valores P&L positivos/negativos
- Diferentes modos para posições abertas e fechadas
- Suporte completo para tema claro/escuro

### 4. `DashboardCards.tsx`

Componente que exibe métricas agregadas, incluindo:
- Valor total investido
- Valor atual total
- Ganhos totais (coletados e não coletados)
- P&L total (com destaque visual verde/vermelho)
- Rendimento estimado (com seleção de período)
- Taxas estimadas (com seleção de período)

### 5. `ReportSection.tsx`

Componente que implementa a seção de relatórios e análises, incluindo:
- Visualização de dados temporais (gráfico de área e barras)
- Análise por DEX/protocolo (gráfico de pizza)
- Filtros de período (7D, 30D, 90D, 1A, Tudo)
- Cards de resumo estatístico
- Suporte para diferentes métricas (P&L, Investimentos, Taxas, Protocolos)

## Tipos e Interfaces Principais

### Interface `Position`

```typescript
// Definido em AddPositionModal.tsx
interface Position {
  pool: string;          // Nome do pool (ex: "ETH/USDC")
  invested: number;      // Valor investido
  current: number;       // Valor atual da posição
  uncollected: number;   // Taxas não coletadas
  collected: number;     // Taxas já coletadas
  rangeMin: number;      // Limite inferior do intervalo de preço
  rangeMax: number;      // Limite superior do intervalo de preço
  entryPrice: number;    // Preço de entrada
  currentPrice: number;  // Preço atual do par
  network: string;       // Rede blockchain (ex: "Ethereum")
  dex: string;           // DEX onde a posição está (ex: "Uniswap")
  created: string;       // Data de criação (ISO string)
  observacoes?: string;  // Notas adicionais (opcional)
  isTracked?: boolean;   // Se a posição foi rastreada (não mais utilizado)
  isSimulated?: boolean; // Se a posição tem dados simulados (não mais utilizado)
}
```

## Fluxo de Dados

1. **Inicialização:**
   - Verificação de autenticação via `AuthContext`
   - Carregamento de posições do LocalStorage
   - Renderização do dashboard ou formulário de login

2. **Adição de Posição:**
   - Usuário clica em "Adicionar Posição"
   - Modal de adição é exibido
   - Ao submeter, posição é adicionada ao state `positions`
   - O state atualizado é salvo no LocalStorage

3. **Gerenciamento de Posições:**
   - Editar: Abre o modal com dados preenchidos da posição
   - Duplicar: Cria uma cópia da posição com nova data
   - Fechar: Move a posição para `closedPositions`
   - Excluir: Remove a posição do state

4. **Cálculos Financeiros:**
   - Realizados em tempo real nos componentes
   - P&L = (valorAtual + coletado + naoColetado) - investido
   - Rendimento % = (ganhos / investido) * 100
   - APR Anual = (ganhos / investido / dias) * 365 * 100

## Autenticação

A autenticação é implementada usando o Supabase:

1. `AuthContext.tsx` gerencia o estado de autenticação e fornece funções de login/logout
2. `AuthForm.tsx` fornece a UI para login/cadastro
3. `supabaseClient.ts` contém a configuração do cliente Supabase

Estado é mantido via cookies e verificado em cada carregamento da página.

## Persistência de Dados

1. **LocalStorage:**
   - Posições abertas: `localStorage.getItem('positions')`
   - Posições fechadas: `localStorage.getItem('closedPositions')`

2. **Backup e Restauração:**
   - Exportação: Download de arquivo JSON com posições
   - Importação: Upload e parsing de arquivo JSON

## Responsividade

A interface é responsiva e se adapta a diferentes tamanhos de tela:
- Layout fluido com TailwindCSS
- Cards em grid que se reorganizam em telas menores
- Tabela com scroll horizontal em dispositivos móveis

## Considerações de Performance

1. **Renderização Otimizada:**
   - Uso de chaves estáveis para listas
   - Memoização para cálculos pesados
   - Lazy loading para o modal de adição/edição

2. **Limitações Conhecidas:**
   - Grandes volumes de posições podem impactar a performance
   - Cálculos financeiros são baseados em valores fornecidos pelo usuário

## Decisões de Design Técnico

1. **Uso de Context API vs. Redux:**
   - Context API foi escolhido por sua simplicidade e integração nativa
   - O escopo atual da aplicação não justifica o overhead do Redux

2. **Armazenamento em LocalStorage vs. Banco de Dados:**
   - LocalStorage foi escolhido para simplicidade e operação offline
   - Exportação/importação manual para backups
   - Integração futura com Supabase para sincronização entre dispositivos

3. **Remoção da Funcionalidade de Rastreamento de Carteiras:**
   - Implementação confiável requer integrações complexas com contratos
   - Foco no gerenciamento manual para maior precisão e controle

## Próximos Passos e Melhorias Potenciais

1. **Aprimoramento dos Relatórios:**
   - Exportação de relatórios em PDF
   - Gráficos comparativos entre diferentes períodos
   - Previsões baseadas em tendências históricas

2. **Sincronização de Dados:**
   - Migrar dados do LocalStorage para Supabase para sincronização entre dispositivos

3. **Melhorias de UX:**
   - Personalização das cores e tema pelo usuário
   - Configuração de alertas para limites de preço


   - Adicionar mais visualizações e gráficos

3. **Integrações Futuras:**
   - Considerar APIs confiáveis para preços em tempo real
   - Integrar com ferramentas como Zapper, DeBank para dados complementares

4. **Internacionalização:**
   - Implementar i18n para suporte a múltiplos idiomas

## Guia de Desenvolvimento

### Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente para Supabase
4. Execute o servidor de desenvolvimento: `npm run dev`

### Adicionando Novos Componentes

1. Crie o componente em `src/components/`
2. Use TypeScript para definir props e interfaces
3. Implemente estilos com TailwindCSS
4. Importe e utilize em outros componentes

### Contribuindo com o Projeto

1. Mantenha o CHANGELOG.md atualizado
2. Documente mudanças significativas neste arquivo
3. Escreva código limpo e bem comentado
4. Mantenha a consistência com o estilo existente

---

*Este documento deve ser atualizado sempre que houver mudanças significativas na arquitetura ou implementação do projeto.*
