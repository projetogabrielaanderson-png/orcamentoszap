---
name: PWA + Push Notifications
description: PWA instalável + Web Push real via VAPID, Service Worker custom, edge functions e trigger no insert de leads
type: feature
---

## Arquitetura

- **Plugin**: `vite-plugin-pwa` em modo `injectManifest`. SW custom em `src/sw.ts` (Workbox precaching + listeners `push` e `notificationclick`).
- **Manifest**: nome "CRM ZAP", theme `#22c55e`, ícones em `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon.png` (gerados via IA).
- **Guard de registro** (`src/main.tsx`): NUNCA registra SW em iframe, hosts `id-preview--*` / `lovableproject.com`, ou em dev. Se houver SW antigo nesses contextos, desregistra.
- **Config TOML**: `vapid-public-key` e `push-send` com `verify_jwt = false` (precisam ser públicos: o primeiro pro client buscar a key sem auth, o segundo pra ser chamado pelo trigger via pg_net).

## Backend

- **Tabela `push_subscriptions`** (user_id, endpoint UNIQUE, p256dh, auth, user_agent) com RLS por `auth.uid() = user_id`.
- **Extensão `pg_net`** habilitada.
- **Trigger `on_lead_insert_push`** em `leads AFTER INSERT` chama `notify_new_lead()` que faz `extensions.http_post` para a edge function `push-send` com `{ user_id, lead_name, lead_phone, lead_id }`. Erros são engolidos pra não bloquear inserts.

## Edge Functions

- **`vapid-public-key`** (público) — retorna `{ publicKey: VAPID_PUBLIC_KEY }`.
- **`push-subscribe`** (autenticado) — valida JWT via `getClaims`, faz upsert da subscription.
- **`push-unsubscribe`** (autenticado) — deleta subscription do user_id + endpoint.
- **`push-send`** (público, chamado pelo trigger) — busca subs do `user_id`, envia via `npm:web-push@3.6.7` com VAPID. Remove subs com status 404/410 (expiradas).

## Secrets necessários
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (mailto:)

## UI
Em `src/pages/Settings.tsx`: card dedicado "Push Notifications (PWA)" com badge de status, aviso amarelo se em iframe/preview, e botões Ativar/Desativar **deste dispositivo**. Cada dispositivo tem sua subscription separada.

## Limitações
- **Não funciona no preview do editor** (iframe + host bloqueado). Só funciona em `https://orcamentoszap.lovable.app` ou domínio próprio publicado.
- iOS exige que o usuário "Adicione à Tela de Início" antes de receber push.
- Apenas evento de novo lead dispara push (decisão do usuário).
