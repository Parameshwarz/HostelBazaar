-- Update the user's record to set email_confirmed_at to the current timestamp
-- This effectively confirms the email address in the Supabase auth system
UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'blablabla@gmail.com';

-- Optionally, verify the update was successful
SELECT id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email = 'blablabla@gmail.com'; 