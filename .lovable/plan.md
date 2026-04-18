
## Plano: PWA + Push Notifications Reais

### Avisos importantes
1. **Service Worker não funciona no preview do editor** (iframe + hosts `id-preview--*`). Push real só funciona em `whatsapp.assistenciatecnica.maringa.br` ou `orcamentoszap.lovable.app` após **publicar**.
2. SW será desabilitado em dev e bloqueado em iframes/preview para evitar cache stale (regra obrigatória do Lovable).
3. Push real precisa de chaves **VAPID** + tabela de subscriptions + Edge Function de envio.

### O que será implementado

**Parte 1 — PWA instalável**
- Adicionar `vite-plugin-pwa` + `workbox-window`
- Configurar `vite.config.ts` com `injectManifest`, `devOptions.enabled: false`, `navigateFallbackDenylist: [/^\/auth/, /^\/form/]`
- Manifest: nome "CRM ZAP", theme color, ícones 192/512 (gerados via IA com a marca)
- Meta tags PWA no `index.html` (`theme-color`, `apple-mobile-web-app-*`)
- **Guard de registro** em `src/main.tsx`: desregistra SW em iframes/preview, registra apenas em produção

**Parte 2 — Service Worker custom (`src/sw.ts`)**
- Listener `push` → mostra notificação (título, body, icon, badge, data com URL)
- Listener `notificationclick` → abre/foca a aba no `/kanban`
- Workbox precaching do app shell

**Parte 3 — Backend Push**
- **Tabela `push_subscriptions`**: `user_id`, `endpoint` (unique), `p256dh`, `auth`, `user_agent`, `created_at` + RLS (usuário gerencia só as suas)
- **Habilitar `pg_net`** para trigger chamar Edge Function
- **Trigger `on_lead_insert`**: dispara em `INSERT` na tabela `leads`, chama Edge Function `push-send` com `user_id` dono
- **Edge Functions**:
  - `vapid-public-key` (público) — retorna a public key pro client
  - `push-subscribe` (autenticado) — salva subscription
  - `push-unsubscribe` (autenticado) — remove subscription
  - `push-send` (interno via service role) — busca subs do user_id e envia via `npm:web-push`

**Parte 4 — UI em `Settings`**
- Botão "Ativar Push Notifications" → pede permissão → fetch da public key → `pushManager.subscribe` → POST `push-subscribe`
- Status visual: "Ativo neste dispositivo" / "Desativado"
- Botão para desativar deste dispositivo
- Aviso amigável: "Funciona apenas no app publicado, não no preview"

**Parte 5 — Memória**
- Criar `mem://features/pwa-push` documentando a arquitetura
- Atualizar `mem://index.md`

### Decisões que preciso de você

Antes de implementar, preciso confirmar 3 coisas:

**1. Chaves VAPID** — opções:
- (a) Você gera com `npx web-push generate-vapid-keys` (ou em https://vapidkeys.com) e cola quando eu pedir → mais seguro
- (b) Eu crio uma Edge Function temporária que gera, mostra uma vez, você salva como secret → mais rápido

**2. Quais eventos disparam push?**
- (a) Só novo lead (recomendado para começar)
- (b) Novo lead + mudanças de status
- (c) Novo lead + SLA atrasado (cron a cada 5min)
- (d) Todos (novo lead + status + SLA + follow-up)

**3. Ícones do PWA:**
- (a) Gerar com IA (logo CRM ZAP nas cores da marca) — recomendado
- (b) Usar o favicon atual ampliado (qualidade limitada)
- (c) Você envia os PNGs depois (uso placeholder por enquanto)

**Responda nas 3 perguntas e eu prossigo com a implementação completa.**
