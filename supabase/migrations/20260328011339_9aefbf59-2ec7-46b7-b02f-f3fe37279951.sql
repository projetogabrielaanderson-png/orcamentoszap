
-- Allow authenticated users to delete categories
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

-- Enable realtime for follow_ups so dashboard can show pending reminders
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
