

## Plano: Personalização de mensagens + som customizado nas push notifications

### Objetivo
Permitir que o usuário personalize **título**, **corpo**, **ícone** e **som** das push notifications de novo lead, com suporte a variáveis dinâmicas (`{{nome}}`, `{{telefone}}`, `{{categoria}}`, `{{empresa}}`).

### Estado atual (já existe)
- `push-send` envia payload fixo: `"🔔 Novo Lead — CRM ZAP"` + `nome • telefone`
- SW (`src/sw.ts`) mostra notificação com `tag: 'crmzap-lead'`, sem som customizado
- `user_settings` já existe mas não tem campos de personalização

### Mudanças

**1. Schema (migration)**
Adicionar colunas em `user_settings`:
- `push_title_template` text default `'🔔 Novo Lead — {{empresa}}'`
- `push_body_template` text default `'{{nome}} • {{telefone}}'`
- `push_sound` text default `'default'` (opções: `default`, `bell`, `chime`, `alert`, `none`)
- `push_vibrate` boolean default `true`

**2. Edge function `push-send`**
- Buscar `user_settings` do `user_id` junto com as subscriptions
- Renderizar templates substituindo `{{nome}}`, `{{telefone}}`, `{{categoria}}` (join com `categories`), `{{empresa}}` (de `company_name`)
- Incluir no payload: `sound`, `vibrate`, `requireInteraction`

**3. Service Worker (`src/sw.ts`)**
- Ler `data.sound` do payload e tocar áudio via `clients.matchAll()` postando mensagem ao client ativo (Web Push API não toca som direto — precisa do client)
- Se nenhum client aberto, usar `vibrate: [200, 100, 200]` na própria notification
- Adicionar `requireInteraction: true` para iOS/Android segurar a notificação

**4. Assets de som**
Adicionar 4 arquivos curtos (~1-2s) em `public/sounds/`:
- `bell.mp3`, `chime.mp3`, `alert.mp3` (gerados/baixados de fonte livre)

**5. UI em `Settings.tsx`**
Novo card "Personalização das notificações" dentro da seção Notificações:
- Input: Título (com hint das variáveis disponíveis)
- Textarea: Corpo (com hint das variáveis)
- Select: Som (Padrão / Sino / Chime / Alerta / Sem som) + botão ▶ "Testar som"
- Switch: Vibrar
- Botão "Enviar push de teste" que chama `push-send` com lead fake

**6. Listener no client (novo hook `usePushSoundListener`)**
Em `App.tsx`, registrar listener `navigator.serviceWorker.addEventListener('message', ...)` que toca o `<audio>` quando SW pede.

### Limitações conhecidas
- **iOS**: som customizado em PWA é limitado; só toca se o app estiver em foreground via client message
- **Som no SW**: Web Push não permite tocar áudio direto do SW — solução é client message + fallback vibrate

### Arquivos a editar
```text
supabase/migrations/<new>.sql              [novo]
supabase/functions/push-send/index.ts      [editar]
src/sw.ts                                  [editar]
src/pages/Settings.tsx                     [editar]
src/App.tsx                                [editar — montar listener]
src/hooks/usePushSoundListener.ts          [novo]
public/sounds/bell.mp3                     [novo]
public/sounds/chime.mp3                    [novo]
public/sounds/alert.mp3                    [novo]
```

### Fluxo final
```text
Lead INSERT → trigger → push-send
  → busca user_settings + categoria
  → renderiza templates
  → envia payload {title, body, sound, vibrate}
SW recebe push
  → showNotification (com vibrate)
  → postMessage({type:'PLAY_SOUND', sound}) aos clients
Client (hook) → toca <audio src={`/sounds/${sound}.mp3`} />
```

