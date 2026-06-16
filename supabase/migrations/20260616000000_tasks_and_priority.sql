-- 1. Modify PROFILES table
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS xp,
DROP COLUMN IF EXISTS level;

-- 2. Modify HABITS table
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
DROP COLUMN IF EXISTS xp_reward,
DROP COLUMN IF EXISTS emoji;

-- 3. Update realtime configuration (No changes needed since we are just altering columns, but good to refresh schema cache)
NOTIFY pgrst, 'reload schema';
