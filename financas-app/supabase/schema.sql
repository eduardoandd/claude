-- Tabela de transações
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  category text not null,
  description text default '',
  created_at timestamptz default now() not null
);

-- Índices para performance
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date);
create index transactions_type_idx on public.transactions(type);

-- Row Level Security
alter table public.transactions enable row level security;

-- Políticas RLS: cada usuário só acessa suas próprias transações
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
