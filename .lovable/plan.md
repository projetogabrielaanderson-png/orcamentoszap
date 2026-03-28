

## Formulários Personalizados por Categoria

### Objetivo
Permitir que o usuário crie formulários de captação personalizados para cada categoria, com campos customizáveis e opções de design (cores, título, descrição).

---

### 1. Nova tabela: `form_configs`

Armazena a configuração de cada formulário vinculado a uma categoria.

```sql
CREATE TABLE public.form_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Solicite um Orçamento',
  description text NOT NULL DEFAULT 'Preencha seus dados e entraremos em contato',
  primary_color text NOT NULL DEFAULT '#3b82f6',
  bg_color text NOT NULL DEFAULT '#eef2ff',
  logo_url text NOT NULL DEFAULT '',
  custom_fields jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;
```

- `custom_fields`: array JSON de objetos `{ label, type, required }` onde type pode ser `text`, `email`, `select`, `textarea`
- RLS: CRUD apenas para o `user_id` autenticado
- Policy pública de SELECT para renderizar o formulário sem login

### 2. Nova página: Editor de Formulários (`/capture`)

Reformular a página de Captação para incluir:

- **Lista de formulários** por categoria (cards)
- **Botão "Criar Formulário"** que abre modal/editor
- **Editor visual** com:
  - Título e descrição personalizáveis
  - Cor primária e cor de fundo (color pickers)
  - URL do logo (opcional)
  - **Campos customizáveis**: adicionar/remover/reordenar campos extras além de nome e telefone
  - Preview ao vivo ao lado
- **Link direto e código embed** gerados automaticamente com `category_id` na URL

### 3. Formulário público (`/form`) dinâmico

Atualizar `LeadForm.tsx` para:

- Ler `category_id` dos query params
- Buscar `form_configs` do banco (query pública, sem auth)
- Renderizar o formulário com as cores, título, campos personalizados
- Enviar campos extras no campo `message` ou em um novo campo JSON
- Fallback para o formulário padrão se não houver config

### 4. Edge Function `receive-lead`

- Aceitar campo opcional `custom_data` (JSON) para dados dos campos extras
- Gravar em `leads.message` (concatenado) — sem necessidade de alterar schema de leads

### 5. Atualização do EmbedGenerator

- Substituir o gerador fixo por um seletor de formulário por categoria
- Gerar link/embed com `category_id` correto

---

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `supabase/migrations/...` | Criar tabela `form_configs` + RLS |
| `src/pages/Capture.tsx` | Reformular com lista + editor |
| `src/components/capture/FormEditor.tsx` | Novo componente editor |
| `src/components/capture/FormPreview.tsx` | Preview ao vivo |
| `src/components/capture/EmbedGenerator.tsx` | Adaptar para usar `form_configs` |
| `src/pages/LeadForm.tsx` | Renderização dinâmica baseada em config |
| `supabase/functions/receive-lead/index.ts` | Aceitar `custom_data` |

