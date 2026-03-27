-- Fix missing columns in conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Update existing conversations with default values
UPDATE conversations SET user_name = 'Guest User' WHERE user_name IS NULL;
UPDATE conversations SET email = 'guest@example.com' WHERE email IS NULL;
