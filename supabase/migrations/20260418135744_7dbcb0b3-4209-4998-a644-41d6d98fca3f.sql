ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS push_title_template text NOT NULL DEFAULT '🔔 Novo Lead — {{empresa}}',
  ADD COLUMN IF NOT EXISTS push_body_template text NOT NULL DEFAULT '{{nome}} • {{telefone}}',
  ADD COLUMN IF NOT EXISTS push_sound text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS push_vibrate boolean NOT NULL DEFAULT true;