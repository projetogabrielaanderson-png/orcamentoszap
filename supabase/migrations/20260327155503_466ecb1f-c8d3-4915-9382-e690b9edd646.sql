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
  ('a1b2c3d4-0005-0000-0000-000000000005', 'Marceneiro', '280 68% 60%');