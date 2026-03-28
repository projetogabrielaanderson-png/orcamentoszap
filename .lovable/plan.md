

## Estudo Atualizado — Funcionalidades LeadFlow CRM

Itens removidos conforme solicitado: Dashboard do Profissional, Google Sheets, Multi-usuários, Webhooks, Landing Page.

---

### Funcionalidades Aprovadas

| # | Funcionalidade | Impacto | Complexidade |
|---|---|---|---|
| 1 | **Notificações em tempo real** — alerta sonoro/visual no dashboard para novos leads, badge no menu, push no navegador | Alto | Baixa |
| 2 | **Follow-up / Lembretes** — agendar tarefas por lead, lista de pendências, alerta para leads parados. Nova tabela `follow_ups` | Alto | Média |
| 3 | **Histórico de atividades por lead** — timeline de eventos no modal do lead. Nova tabela `lead_activities` | Alto | Média |
| 4 | **Página de Configurações** — dados da empresa, logo, preferências, CRUD de categorias | Alto | Baixa |
| 6 | **Relatórios exportáveis (PDF/CSV)** — exportar leads filtrados por período/categoria/status | Médio | Média |
| 9 | **Filtros avançados e busca global** — busca por nome/telefone, filtros combinados no Kanban | Baixo | Baixa |
| 12 | **Tags e notas nos leads** — tags livres e notas internas. Campos `tags text[]` + tabela `lead_notes` | Baixo | Baixa |

---

### Ordem de implementação recomendada

1. Notificações em tempo real
2. Página de Configurações
3. Follow-up / Lembretes
4. Histórico de atividades
5. Filtros avançados e busca global
6. Tags e notas nos leads
7. Relatórios exportáveis

