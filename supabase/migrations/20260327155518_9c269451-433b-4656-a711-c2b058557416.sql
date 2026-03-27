-- Fix categories policies to be scoped to authenticated users only
DROP POLICY "Authenticated users can insert categories" ON public.categories;
DROP POLICY "Authenticated users can update categories" ON public.categories;

-- Only allow insert/update for authenticated (still permissive but scoped to auth)
CREATE POLICY "Authenticated users can insert categories" ON public.categories 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- The anon insert on leads is intentional for external lead capture forms
-- No changes needed there