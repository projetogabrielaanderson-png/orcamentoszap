-- Pipeline financeiro nos leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS quote_value numeric(12,2),
  ADD COLUMN IF NOT EXISTS closed_value numeric(12,2),
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS lost_reason text;

ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_outcome_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_outcome_check
  CHECK (outcome IS NULL OR outcome IN ('won','lost'));

-- Mensagens rápidas: público alvo do template
ALTER TABLE public.message_templates
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'professional';

ALTER TABLE public.message_templates
  DROP CONSTRAINT IF EXISTS message_templates_audience_check;

ALTER TABLE public.message_templates
  ADD CONSTRAINT message_templates_audience_check
  CHECK (audience IN ('professional','client'));

CREATE INDEX IF NOT EXISTS idx_message_templates_user_audience
  ON public.message_templates(user_id, audience);

CREATE INDEX IF NOT EXISTS idx_leads_outcome
  ON public.leads(user_id, outcome);