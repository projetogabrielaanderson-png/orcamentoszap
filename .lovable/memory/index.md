# Memory: index.md
Updated: now

# Project Memory

## Core
App name is CRM ZAP (rebranded from LeadFlow). Minimalist, clean Shadcn UI.
Tech stack: React, Supabase (Auth, Realtime, Edge Functions).
Production domain for embeds: https://orcamentoszap.lovable.app
Always normalize phone numbers to Brazil (+55). Use universal wa.me links.
PWA + Push enabled — SW NEVER registers in iframe/preview/dev (guard in src/main.tsx).

## Memories
- [Visual Identity](mem://style/visual-identity) — Clean premium Shadcn aesthetic, specific status colors, CRM ZAP branding
- [Database Schema Constraints](mem://tech/data-schema) — Supabase schema constraints, mandatory lead statuses, foreign key mappings
- [Kanban Workflow](mem://features/kanban-workflow) — Kanban board rules, exclusive view for finalized leads
- [WhatsApp Integration](mem://features/whatsapp-integration) — Universal wa.me links, +55 normalization
- [Message Templates](mem://features/message-templates) — Dynamic variables for WhatsApp messages
- [Lead Capture Forms](mem://features/lead-capture) — Quiz-style public forms, MiniCalendar, multi-step submit flow, LGPD
- [WhatsApp Widget](mem://features/whatsapp-widget) — Glassmorphism float widget, receive-lead Edge Function integration
- [Finalized Leads](mem://features/finalized-management) — Management and export of done leads
- [PWA + Push](mem://features/pwa-push) — Manifest, custom SW, VAPID, push_subscriptions table, trigger on lead insert, edge functions
- [Roadmap Constraints](mem://product/roadmap-constraints) — Features explicitly discarded from the project
- [PRD References](mem://product/documentation) — Links to Product Requirements Documents
