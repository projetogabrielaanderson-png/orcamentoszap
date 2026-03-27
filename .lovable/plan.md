

## LeadFlow CRM — Plano Revisado com Supabase

### Mudança Principal
O backend será **Supabase** (conexão externa, não Lovable Cloud). Tabelas com RLS, realtime subscriptions para atualizações ao vivo, e Edge Function para receber leads externos.

---

### Banco de Dados (Supabase)

**Tabelas:**

```text
categories
├── id (uuid, PK)
├── name (text)
├── color (text)
└── created_at (timestamptz)

professionals
├── id (uuid, PK)
├── name (text)
├── category_id (uuid, FK → categories)
├── whatsapp (text)
├── leads_count (int, default 0)
├── user_id (uuid, FK → auth.users)
└── created_at (timestamptz)

leads
├── id (uuid, PK)
├── name (text)
├── phone (text)
├── message (text)
├── category_id (uuid, FK → categories)
├── professional_id (uuid, FK → professionals, nullable)
├── status (text: 'new' | 'in_progress' | 'waiting' | 'done')
├── origin_url (text)
├── utm_source (text)
├── utm_medium (text)
├── utm_campaign (text)
├── user_id (uuid, FK → auth.users)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

- **RLS** habilitado em todas as tabelas, políticas baseadas em `auth.uid()`
- **Realtime** habilitado na tabela `leads` para atualizações ao vivo no Kanban

---

### Edge Function: Receber Leads Externos

- `supabase/functions/receive-lead/index.ts`
- Endpoint público (sem JWT) para receber leads de formulários externos
- Validação com Zod (nome, telefone, mensagem, categoria)
- Sanitização de inputs
- CORS headers configurados
- Insere lead com status `'new'`

---

### Autenticação

- Login com email/senha via Supabase Auth
- Página de login/registro simples
- Rotas protegidas (redirect se não autenticado)

---

### Estrutura de Arquivos

```text
src/
├── integrations/supabase/     # Client e tipos gerados
├── contexts/AuthContext.tsx    # Auth state
├── types/crm.ts               # Tipos TypeScript
├── components/
│   ├── layout/ (Sidebar, Header)
│   ├── dashboard/ (KPICards, AlertBanners, QuickChart)
│   ├── kanban/ (KanbanBoard, KanbanColumn, LeadCard, KanbanFilters)
│   ├── leads/ (LeadModal)
│   ├── professionals/ (ProfessionalsTable, ProfessionalForm)
│   ├── capture/ (EmbedGenerator, FormPreview)
│   └── analytics/ (LineChart, BarChart, PieChart, FunnelChart)
├── pages/
│   ├── Auth.tsx
│   ├── Index.tsx (Dashboard)
│   ├── Kanban.tsx
│   ├── Professionals.tsx
│   ├── Capture.tsx
│   └── Analytics.tsx
supabase/
├── functions/receive-lead/index.ts
└── migrations/ (schema SQL)
```

---

### Funcionalidades (mesmo escopo)

1. **Dashboard**: KPIs via queries Supabase, gráficos com Recharts, alertas
2. **Kanban**: Drag-and-drop com `@hello-pangea/dnd`, realtime via Supabase subscriptions, filtros
3. **Modal do Lead**: Info + ações, envio WhatsApp via `wa.me` deep link
4. **Profissionais**: CRUD completo via Supabase, tabela + modal
5. **Captação**: Gerador de HTML embed apontando para a Edge Function, link direto, preview
6. **Analytics**: Gráficos (linha, barra, pizza, funil) com dados do Supabase
7. **Dark mode** opcional

### Dependências Novas
- `@hello-pangea/dnd`, `recharts`, `date-fns`

