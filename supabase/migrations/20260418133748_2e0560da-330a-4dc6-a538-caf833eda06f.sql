-- Habilita pg_net para chamadas HTTP em triggers
create extension if not exists pg_net with schema extensions;

-- Tabela de subscriptions de push
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users can view own push subscriptions"
  on public.push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own push subscriptions"
  on public.push_subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Função do trigger: chama edge function push-send via pg_net
create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  edge_url text := 'https://hzzlhgfyingaphnakktg.supabase.co/functions/v1/push-send';
  service_key text;
begin
  -- Tenta obter o anon key (basta para invocar; a função usa service role internamente)
  service_key := current_setting('app.settings.service_role_key', true);

  perform extensions.http_post(
    url := edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'lead_name', NEW.name,
      'lead_phone', NEW.phone,
      'lead_id', NEW.id
    )
  );
  return NEW;
exception when others then
  -- Não bloqueia o INSERT se falhar
  return NEW;
end;
$$;

drop trigger if exists on_lead_insert_push on public.leads;
create trigger on_lead_insert_push
  after insert on public.leads
  for each row execute function public.notify_new_lead();