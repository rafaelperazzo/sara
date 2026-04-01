# SARA — Sistema de Agendamento de Reservas do Auditório

> Calendário de reservas do auditório do **Departamento de Computação da UFRPE**, com área pública de consulta e área administrativa com autenticação.

---

## Funcionalidades

### Área Pública
- Visualização do calendário mensal de reservas (Segunda a Sábado)
- Detalhes de cada reserva ao clicar no evento
- Relatório de utilização do auditório por mês
- Navegação entre meses
- Totalmente responsivo e sem necessidade de login

### Área Administrativa
- Login seguro com e-mail e senha (via Supabase Auth)
- Cadastro de novas reservas com verificação de conflito de horário
- Edição e exclusão de reservas existentes
- Confirmação antes de excluir
- Proteção de rotas: acesso restrito a usuários autenticados

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite 8 |
| Estilização | CSS Modules (sem framework de UI) |
| Roteamento | React Router v7 (HashRouter) |
| Backend / DB | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth + @supabase/auth-ui-react |
| Data | date-fns com locale pt-BR |
| Deploy | GitHub Actions → GitHub Pages |

---

## Arquitetura

```
src/
├── lib/
│   ├── supabase.js          # cliente Supabase
│   └── config.js            # DAILY_CAPACITY_HOURS, CONTACT_EMAIL
├── hooks/
│   ├── useAuth.js           # sessão autenticada via onAuthStateChange
│   ├── useReservations.js   # reservas do mês → Map<"YYYY-MM-DD", row[]>
│   └── useConflict.js       # verificação de conflito local e remota
├── components/
│   ├── auth/                # LoginPage, ProtectedRoute
│   ├── calendar/            # CalendarGrid, CalendarCell, CalendarHeader, ReservationChip
│   ├── modals/              # Modal (portal), ReservationDetail, ReservationForm, ConfirmDelete
│   └── report/              # UtilizationReport, UtilizationBar
└── pages/
    ├── PublicPage.jsx        # abas Calendário e Relatório (sem auth)
    └── AdminPage.jsx         # calendário com CRUD (requer auth)
```

### Banco de Dados (tabela `auditorio`)

| Coluna | Tipo |
|---|---|
| id | integer PK |
| data | date |
| inicio | time |
| fim | time |
| responsavel | text (nullable) |

**RLS:** SELECT público para todos; INSERT / UPDATE / DELETE somente para usuários autenticados.

---

## Instalação e execução local

> Requer [Node.js](https://nodejs.org) e [nvm](https://github.com/nvm-sh/nvm).

```bash
# Ativar versão correta do Node
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com as credenciais do Supabase

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em `http://localhost:5173`

### Outros comandos

```bash
npm run build     # gera o build de produção em dist/
npm run preview   # serve o build localmente
npm run deploy    # build + deploy manual no GitHub Pages
npm run lint      # executa o ESLint
```

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` a partir do `.env.example`:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave-anon>
```

No deploy via GitHub Actions, as variáveis são injetadas pelos secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

---

## Deploy

O deploy é automático a cada push em `master`, via GitHub Actions (`.github/workflows/deploy.yml`), publicando na branch `gh-pages`.

O `HashRouter` é utilizado no lugar do `BrowserRouter` porque o GitHub Pages não realiza rewrite de rotas no servidor.

---

## Autor

**Rafael Perazzo Barbosa Mota**  
Departamento de Computação — UFRPE
