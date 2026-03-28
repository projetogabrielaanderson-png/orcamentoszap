-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '217 91% 60%',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professionals table
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  whatsapp TEXT NOT NULL,
  leads_count INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting', 'done')),
  origin_url TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Categories: everyone can read, authenticated can manage
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);

-- Professionals: users see only their own
CREATE POLICY "Users can view their own professionals" ON public.professionals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own professionals" ON public.professionals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own professionals" ON public.professionals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own professionals" ON public.professionals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Leads: users see only their own
CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leads" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leads" ON public.leads FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Also allow anonymous inserts for external lead capture
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Indexes
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_category_id ON public.leads(category_id);
CREATE INDEX idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX idx_professionals_category_id ON public.professionals(category_id);

-- Seed categories
INSERT INTO public.categories (id, name, color) VALUES
  ('a1b2c3d4-0001-0000-0000-000000000001', 'Encanador', '217 91% 60%'),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'Eletricista', '45 93% 47%'),
  ('a1b2c3d4-0003-0000-0000-000000000003', 'Pintor', '142 71% 45%'),
  ('a1b2c3d4-0004-0000-0000-000000000004', 'Pedreiro', '25 95% 53%'),
  ('a1b2c3d4-0005-0000-0000-000000000005', 'Marceneiro', '280 68% 60%');-- Fix categories policies to be scoped to authenticated users only
DROP POLICY "Authenticated users can insert categories" ON public.categories;
DROP POLICY "Authenticated users can update categories" ON public.categories;

-- Only allow insert/update for authenticated (still permissive but scoped to auth)
CREATE POLICY "Authenticated users can insert categories" ON public.categories 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- The anon insert on leads is intentional for external lead capture forms
-- No changes needed thereCREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates" ON public.message_templates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own templates" ON public.message_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.message_templates FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.message_templates FOR DELETE TO authenticated USING (auth.uid() = user_id);
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

-- user_settings table
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL DEFAULT '',
  company_logo text NOT NULL DEFAULT '',
  company_phone text NOT NULL DEFAULT '',
  notification_sound boolean NOT NULL DEFAULT true,
  notification_push boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- follow_ups table
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own follow_ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own follow_ups" ON public.follow_ups FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own follow_ups" ON public.follow_ups FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- lead_activities table
CREATE TABLE public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own lead activities" ON public.lead_activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lead activities" ON public.lead_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- lead_notes table
CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own lead notes" ON public.lead_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lead notes" ON public.lead_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lead notes" ON public.lead_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lead notes" ON public.lead_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add tags to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Allow authenticated users to delete categories
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

-- Enable realtime for follow_ups so dashboard can show pending reminders
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
