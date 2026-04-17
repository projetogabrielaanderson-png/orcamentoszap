---
name: Message Templates
description: Dynamic templates for WhatsApp messages, with separate audiences for professional and client
type: feature
---
Templates ficam em `message_templates` e têm coluna `audience` ('professional' | 'client', default 'professional').

**Para profissional** — variáveis: `{{profissional}}`, `{{lead_nome}}`, `{{lead_telefone}}`, `{{lead_mensagem}}`, `{{categoria}}`. Usado no LeadModal ao "Enviar para Profissional".

**Para cliente (Quick Replies)** — variáveis: `{{lead_nome}}`, `{{lead_primeiro_nome}}`, `{{categoria}}`, `{{empresa}}` (vem de `user_settings.company_name`). Usado na aba "Cliente" do LeadModal via componente `ClientQuickReplies` — abre wa.me com mensagem pré-preenchida e editável.

**Página /templates** — Tabs separam Profissional vs Cliente. Cada audience tem seu próprio template padrão (`is_default` único por audience).
