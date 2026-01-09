-- Migration: Update profiles table for redesign
-- Adds cover_image and is_verified_pro
-- Moves cover_image from users to profiles

-- 1. Add new columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS is_verified_pro BOOLEAN DEFAULT FALSE;

-- 2. Migrate existing data if any (from users.cover_image to profiles.cover_image)
UPDATE profiles p
SET cover_image = u.cover_image
FROM users u
WHERE p.user_id = u.id AND u.cover_image IS NOT NULL;

-- 3. Remove column from users (Optional, but planned for hygiene)
-- ALTER TABLE users DROP COLUMN IF EXISTS cover_image;

-- Note: We'll leave the DROP COLUMN commented out for now to prevent data loss 
-- in case the migration is run before the code is ready to handle the shift.
