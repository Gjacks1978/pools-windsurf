# Dashboard de Pools de Liquidez

## Descrição

Dashboard para gerenciamento e monitoramento de posições em pools de liquidez de exchanges descentralizadas (DEXs). A aplicação permite adicionar, editar, duplicar e fechar posições manualmente, além de calcular métricas financeiras como ganhos, rendimento estimado e taxas acumuladas. Inclui visualizações gráficas avançadas para análise de desempenho ao longo do tempo.

## Funcionalidades

- Gerenciamento completo de posições (adicionar, editar, duplicar, fechar, restaurar)
- Cálculos automáticos de métricas financeiras
- Persistência local com localStorage e/ou Supabase
- Exportação e importação de dados via JSON
- Tema escuro (padrão) e claro com alternância dinâmica
- Relatórios visuais com gráficos interativos (evolução de P&L, taxas e investimentos)
- Filtros temporais para análise de dados (7D, 30D, 90D, 1A, Tudo)
- Análise de desempenho por DEX/protocolo
- Autenticação de usuários com Supabase
- Suporte para múltiplas redes e DEXs

## Configuração e Instalação

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd pools
```

2. Instale as dependências
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Execute o projeto em modo desenvolvimento
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

4. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## Configurando o Supabase para Sincronização de Dados

Para habilitar a sincronização de dados entre dispositivos e portas, você precisa configurar o Supabase corretamente:

### 1. Crie uma conta no Supabase

- Acesse [https://supabase.com](https://supabase.com) e crie uma conta
- Crie um novo projeto

### 2. Configure a autenticação

- No Supabase Dashboard, vá para Authentication > Providers
- Configure o Email provider como desejar

### 3. Crie a tabela de posições

- Vá para SQL Editor e execute o seguinte SQL:

```sql
CREATE TABLE public.positions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  pool text NOT NULL,
  invested numeric NOT NULL,
  current numeric NOT NULL,
  uncollected numeric NOT NULL,
  collected numeric NOT NULL,
  range_min numeric NOT NULL,
  range_max numeric NOT NULL,
  entry_price numeric NOT NULL,
  current_price numeric NOT NULL,
  network text NOT NULL,
  dex text NOT NULL,
  created timestamp with time zone NOT NULL,
  observacoes text,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT positions_pkey PRIMARY KEY (id),
  CONSTRAINT positions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que os usuários vejam apenas suas posições
CREATE POLICY "Users can only access their own positions"
  ON public.positions
  USING (auth.uid() = user_id);

-- Função para definir automaticamente o user_id
CREATE OR REPLACE FUNCTION public.handle_new_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para definir o user_id automaticamente
CREATE TRIGGER on_position_created
  BEFORE INSERT ON positions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_position();
```

### 4. Configure as variáveis de ambiente

- No Supabase Dashboard, vá para Project Settings > API
- Copie a URL do projeto e a anon key
- Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Após essas configurações, reinicie o servidor de desenvolvimento e sua aplicação estará utilizando o Supabase para sincronização de dados. Isso garantirá que seus dados estejam disponíveis em qualquer porta ou dispositivo quando você estiver logado.
