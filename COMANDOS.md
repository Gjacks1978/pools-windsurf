# Guia de Comandos para Manutenção do Projeto

Este guia contém todos os comandos essenciais para o desenvolvimento e manutenção do projeto.

## Comandos Git

### Branches

```bash
# Ver em qual branch você está atualmente
git branch

# Criar uma nova branch e mudar para ela
git checkout -b nome-da-branch

# Mudar para uma branch existente
git checkout nome-da-branch

# Listar todas as branches (incluindo remotas)
git branch -a

# Deletar uma branch local
git branch -d nome-da-branch
```

### Commits e Alterações

```bash
# Ver status das alterações
git status

# Adicionar todas as alterações ao próximo commit
git add .

# Adicionar um arquivo específico
git add caminho/do/arquivo

# Criar um novo commit com mensagem
git commit -m "Descrição do que foi alterado"

# Ver histórico de commits
git log
git log --oneline  # Versão resumida
```

### Sincronização com GitHub

```bash
# Enviar commits para o GitHub
git push

# Enviar uma nova branch para o GitHub
git push -u origin nome-da-branch

# Buscar atualizações do GitHub
git fetch

# Baixar e integrar atualizações do GitHub
git pull
```

### Merge e Integração

```bash
# Integrar outra branch à branch atual
git merge nome-da-outra-branch

# Cancelar um merge com conflitos
git merge --abort

# Ver diferenças entre branches
git diff branch1..branch2
```

### Desfazer Alterações

```bash
# Descartar alterações não commitadas em um arquivo
git checkout -- caminho/do/arquivo

# Desfazer o último commit (mantém alterações)
git reset --soft HEAD~1

# Desfazer o último commit (descarta alterações)
git reset --hard HEAD~1
```

## Comandos NPM/Next.js

```bash
# Instalar dependências
npm install

# Instalar uma nova dependência
npm install nome-pacote

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Iniciar versão de produção localmente
npm run start

# Executar linting
npm run lint
```

## Comandos Vercel

```bash
# Fazer login no Vercel
npx vercel login

# Deploy para ambiente de preview
npx vercel

# Deploy para produção
npx vercel --prod

# Listar projetos
npx vercel list

# Adicionar variáveis de ambiente
npx vercel env add NOME_DA_VARIAVEL
```

## Banco de Dados Supabase

```bash
# Instalar CLI do Supabase (se necessário)
npm install -g supabase

# Fazer login
supabase login

# Iniciar Supabase localmente (requer Docker)
supabase start

# Parar Supabase local
supabase stop
```

## Fluxo de Trabalho Recomendado

1. Criar nova branch: `git checkout -b feature/nova-funcionalidade`
2. Fazer alterações e testar: `npm run dev`
3. Adicionar e commitar: `git add .` e `git commit -m "Mensagem"`
4. Voltar para a branch principal: `git checkout main`
5. Integrar alterações: `git merge feature/nova-funcionalidade`
6. Enviar para GitHub: `git push`
7. Deploy para produção: `npx vercel --prod`

## Solução de Problemas Comuns

### Erro ao fazer push
```bash
# Se receber erro ao tentar push
git pull
# Resolva conflitos se necessário
git push
```

### Porta já em uso
```bash
# Para encontrar o processo usando a porta
# Windows:
netstat -ano | findstr :NUMERO_DA_PORTA
# Para matar o processo:
taskkill /PID NUMERO_DO_PROCESSO /F
```

### Reverter para versão anterior
```bash
# Ver commits
git log --oneline
# Voltar para um commit específico
git checkout HASH_DO_COMMIT
```
