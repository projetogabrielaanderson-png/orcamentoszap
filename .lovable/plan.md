
## Análise do Sistema Atual

**CRM ZAP** já possui:
- Captação de leads (formulários públicos + widget WhatsApp + Edge Function)
- Kanban com drag & drop (4 status)
- Página de Finalizados com filtros
- Profissionais multi-categoria
- Templates de mensagem com variáveis
- Follow-ups, notas e timeline de atividades
- Tags por lead
- Analytics básico
- Notificações realtime

**Lacunas identificadas**:
1. Sem automações (lead chega → ação automática)
2. Sem distribuição inteligente entre profissionais (round-robin)
3. Sem feedback do profissional (atendeu? fechou? perdeu?)
4. Sem métricas de conversão por profissional
5. Sem pipeline financeiro (valor do orçamento, ticket médio)
6. Sem respostas rápidas para mensagens ao cliente
7. Sem SLA/alertas de atraso

---

## Propostas de Melhorias

### 🔥 Alto Impacto / Curto Prazo

**1. Distribuição Automática (Round-Robin)**
- Quando lead chega, atribui automaticamente ao próximo profissional disponível da categoria
- Evita "esquecer" leads, equilibra carga
- Toggle on/off por categoria

**2. Pipeline Financeiro**
- Adicionar campo `valor_orcamento` e `valor_fechado` no lead
- Status extra: "Ganho" vs "Perdido" (com motivo)
- KPI: ticket médio, taxa de conversão, receita projetada
- Funil de vendas visual

**3. Mensagens Rápidas (Quick Replies)**
- Biblioteca de respostas prontas para usar no botão "Conversar com Cliente"
- Variáveis dinâmicas ({{nome}}, {{categoria}})
- Hoje só existe template para profissional, não para cliente

**4. Feedback do Profissional**
- Link único enviado ao profissional para marcar: "Atendi" / "Fechei" / "Não consegui contato"
- Atualiza status automaticamente sem login
- Fecha o ciclo de informação

### 📈 Médio Impacto

**5. Lead Scoring**
- Pontuação automática baseada em: origem (UTM), categoria, horário, mensagem
- Destaca leads "quentes" no Kanban com badge
- Ajuda priorização

**6. Métricas por Profissional**
- Dashboard individual: leads recebidos, taxa de fechamento, tempo médio de resposta
- Ranking de performance
- Detecta profissionais inativos

**7. SLA & Alertas de Atraso**
- Lead "Novo" há mais de X minutos → alerta vermelho
- Lead "Aguardando Profissional" há mais de Y horas → notificação
- Banner no topo do Kanban

---

## Recomendação de Priorização

```text
Sprint 1 (essencial para vendas):
├── Pipeline Financeiro (valor + Ganho/Perdido)
└── Mensagens Rápidas para cliente

Sprint 2 (eficiência operacional):
├── Distribuição Automática Round-Robin
└── SLA & Alertas de Atraso

Sprint 3 (fechar o ciclo):
├── Feedback do Profissional via link único
└── Métricas por Profissional
```

## Detalhes Técnicos (referência)

- **Pipeline financeiro**: nova migration adicionando `quote_value`, `closed_value`, `lost_reason` na tabela `leads`; novo enum `outcome` (`won`/`lost`).
- **Round-robin**: campo `auto_assign` em `categories` + função SQL que retorna próximo profissional ordenado por `leads_count` ASC.
- **Feedback profissional**: nova tabela `lead_feedback_tokens` (uuid público) + Edge Function pública `lead-feedback`.
- **Quick replies**: estender `message_templates` com coluna `audience` (`professional` | `client`).
- **SLA**: configuração em `user_settings` (minutos) + cálculo client-side no Kanban.

Qual bloco quer implementar primeiro? Sugiro começar pelo **Pipeline Financeiro + Mensagens Rápidas** (Sprint 1), que entregam maior retorno imediato.
