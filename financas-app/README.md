# 💰 Finanças App

Aplicativo de finanças pessoais construído com **Next.js 16**, **Supabase** e **Claude AI**. Controle receitas, despesas e obtenha análises inteligentes dos seus dados financeiros.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔐 **Autenticação** | Cadastro com confirmação por e-mail, login seguro via Supabase Auth |
| 📊 **Dashboard** | Resumo mensal com cards de Receitas, Despesas e Saldo; gráfico de categorias; transações recentes |
| 💳 **Transações** | CRUD completo com filtros por mês, tipo e categoria |
| 📥 **Importação** | Importa extratos do Nubank em `.ofx` e `.csv` com detecção automática de categoria |
| 🤖 **Análise com IA** | Cada card do dashboard tem um botão "Analisar" que abre um modal com visualização rica + chat em streaming via Claude |
| 🌙 **Tema escuro** | Toggle claro/escuro disponível em toda a aplicação |

---

## 🤖 Análise com IA

Ao clicar em **Analisar** em qualquer card do dashboard, um modal se expande com:

- **Painel esquerdo** — visualização detalhada dos dados do card (gráficos, listas, taxa de economia)
- **Painel direito** — chat com streaming que entrega uma análise automática ao abrir; o usuário pode fazer perguntas de acompanhamento

Utiliza o modelo **Claude** via API da Anthropic com respostas em markdown renderizado.

---

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_do_supabase
ANTHROPIC_API_KEY=sua_api_key_da_anthropic
```

> A `ANTHROPIC_API_KEY` é necessária apenas para o recurso de Análise com IA. Obtenha em [console.anthropic.com](https://console.anthropic.com).

### 3. Configurar o banco de dados

Execute no **SQL Editor** do Supabase:

```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  date date not null,
  category text not null,
  description text,
  created_at timestamptz default now()
);

alter table transactions enable row level security;

create policy "users can manage own transactions"
  on transactions for all
  using (auth.uid() = user_id);
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Stack

- **Framework** — Next.js 16 (App Router)
- **Banco de dados / Auth** — Supabase
- **UI** — Tailwind CSS + shadcn/ui + Radix UI
- **Gráficos** — Recharts
- **IA** — Anthropic Claude API (`@anthropic-ai/sdk`)
- **Tema** — next-themes
- **Markdown** — react-markdown

---

## 📥 Importação de extratos Nubank

| Formato | Como exportar |
|---|---|
| `.csv` (cartão) | App Nubank → Fatura → Exportar fatura |
| `.ofx` / `.csv` (conta) | App Nubank → Extrato → Baixar extrato |

O parser detecta automaticamente o formato e sugere categorias com base na descrição da transação.
