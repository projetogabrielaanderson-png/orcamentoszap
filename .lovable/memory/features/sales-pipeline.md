---
name: Pipeline Financeiro
description: Sales pipeline tracking with quote/closed values, won/lost outcomes and lost reasons on leads
type: feature
---
Cada lead pode ter `quote_value` (valor orçamento), `closed_value` (valor fechado), `outcome` (`won`|`lost`|null) e `lost_reason`.

**Onde aparece:**
- Aba "Financeiro" no LeadModal: usuário registra valores e marca Ganho/Perdido. Marcar como Ganho/Perdido força status='done'.
- Card do Kanban exibe badge Ganho/Perdido + valor compacto (R$ Xk).
- KPICards no Dashboard: Receita Fechada, Taxa de Conversão (won/decididos), Ticket Médio, Pipeline em Aberto.
- SalesFunnel em /analytics: barras por etapa (Total → Em Atendimento → Orçamento → Ganhos/Perdidos) + top motivos de perda.
- Exportação CSV de Finalizados inclui Resultado, Valor Orçamento, Valor Fechado, Motivo Perda.

**Constraint:** `outcome` aceita apenas 'won', 'lost' ou NULL. `closed_value` é zerado ao marcar Perdido. `lost_reason` é obrigatório para marcar como Perdido.
