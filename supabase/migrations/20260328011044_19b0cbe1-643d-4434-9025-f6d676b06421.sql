
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
