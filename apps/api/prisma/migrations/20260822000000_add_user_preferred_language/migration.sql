-- Migration: Add preferredLanguage to users table
ALTER TABLE "users" ADD COLUMN "preferredLanguage" VARCHAR(5) NOT NULL DEFAULT 'vi';

-- Add check constraint for valid locales
ALTER TABLE "users" ADD CONSTRAINT "users_preferred_language_check"
  CHECK ("preferredLanguage" IN ('vi', 'en'));

-- Comment on column
COMMENT ON COLUMN "users"."preferredLanguage" IS 'User preferred application locale (vi = Vietnamese, en = English)';
