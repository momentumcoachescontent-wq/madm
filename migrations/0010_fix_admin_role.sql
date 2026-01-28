-- Fix Admin Role
-- Force update the role to admin for the admin email, in case it was created as a student
UPDATE users
SET role = 'admin', active = 1, email_verified = 1
WHERE email = 'admin@masalladelmiedo.com';
