ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS category_ids UUID[] DEFAULT '{}';

-- Migration to populate category_ids based on existing category_id
UPDATE public.professionals SET category_ids = ARRAY[category_id] WHERE category_id IS NOT NULL;

-- Make category_id optional but kept for backward compatibility and fallback
ALTER TABLE public.professionals ALTER COLUMN category_id DROP NOT NULL;