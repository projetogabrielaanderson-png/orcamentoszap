
CREATE TABLE public.form_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Solicite um Orçamento',
  description text NOT NULL DEFAULT 'Preencha seus dados e entraremos em contato',
  primary_color text NOT NULL DEFAULT '#3b82f6',
  bg_color text NOT NULL DEFAULT '#eef2ff',
  logo_url text NOT NULL DEFAULT '',
  custom_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active form configs"
  ON public.form_configs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Users can insert their own form configs"
  ON public.form_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own form configs"
  ON public.form_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own form configs"
  ON public.form_configs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_form_configs_updated_at
  BEFORE UPDATE ON public.form_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
