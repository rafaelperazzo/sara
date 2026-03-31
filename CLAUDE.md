# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SARA** — Sistema de Agendamento de Reservas do Auditório do DC/UFRPE

Calendário de reservas do auditório do Departamento de Computação da UFRPE. Área pública (somente leitura) e área administrativa (CRUD autenticado). Deploy no GitHub Pages.

## Stack

- **Frontend:** React 19 + Vite 8 (CSS Modules, sem framework de UI)
- **Backend:** Supabase (projeto `departamento_computacao`, tabela `auditorio`)
- **Roteamento:** React Router v7 com `HashRouter` (obrigatório para GitHub Pages)
- **Data:** date-fns com locale `ptBR`
- **Auth:** @supabase/auth-ui-react (e-mail+senha, sem OAuth)
- **Deploy:** GitHub Actions → branch `gh-pages`

## Comandos

```bash
# Requer nvm — ativar antes:
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"

npm run dev       # servidor de desenvolvimento em localhost:5173
npm run build     # gera dist/
npm run preview   # serve o build localmente
npm run deploy    # npm run build && gh-pages -d dist (deploy manual)
npm run lint      # ESLint
```

O deploy automático ocorre via GitHub Actions (`.github/workflows/deploy.yml`) a cada push em `master`, usando os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Variáveis de Ambiente

Copiar `.env.example` para `.env.local` e preencher com as credenciais do Supabase:

```
VITE_SUPABASE_URL=https://rdabtknlinheqfoaikod.supabase.co
VITE_SUPABASE_ANON_KEY=<chave anon>
```

## Arquitetura

### Tabela Supabase (`auditorio`)

| Coluna | Tipo |
|---|---|
| id | integer PK |
| data | date |
| inicio | time |
| fim | time |
| responsavel | text (nullable) |

RLS: SELECT público para todos; INSERT/UPDATE/DELETE somente para `authenticated`.

### Estrutura `src/`

```
lib/
  supabase.js       → instância do cliente Supabase
  config.js         → DAILY_CAPACITY_HOURS, CONTACT_EMAIL

hooks/
  useAuth.js              → { session, loading } via onAuthStateChange
  useReservations.js      → busca reservas do mês → Map<"YYYY-MM-DD", row[]>
  useConflict.js          → hasConflictLocal() e hasConflictRemote()

components/
  auth/             → LoginPage, ProtectedRoute
  calendar/         → CalendarGrid, CalendarCell, CalendarHeader, ReservationChip
  modals/           → Modal (portal), ReservationDetail, ReservationForm, ConfirmDelete
  report/           → UtilizationReport, UtilizationBar

pages/
  PublicPage.jsx    → abas Calendário e Relatório (sem auth)
  AdminPage.jsx     → calendário com CRUD (requer auth)
```

### Decisões de design importantes

- **`HashRouter`** (não `BrowserRouter`) — GitHub Pages não faz rewrite de rotas no servidor.
- **Calendário Seg–Sáb** — dias com `getDay() === 0` (domingo) são filtrados do grid de 6 colunas. O offset inicial posiciona o 1º dia na coluna correta.
- **Detecção de conflito** — comparação lexicográfica de strings `"HH:MM"` funciona corretamente para horas. Verificação primária usa dados em memória; verificação secundária faz fetch ao Supabase para datas fora do mês carregado.
- **Utilização** — `DAILY_CAPACITY_HOURS` em `config.js` define 100% de utilização por dia (padrão: 12h). Altere lá se necessário.
- **Contas admin** — criadas manualmente no painel Supabase (Authentication → Users → Invite). Sem auto-cadastro exposto na UI.
