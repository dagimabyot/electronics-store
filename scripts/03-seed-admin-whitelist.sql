-- Seed the admin_whitelist table with authorized admin emails
-- Replace these emails with your actual admin emails
INSERT INTO public.admin_whitelist (email, approved_by, notes) VALUES
  ('admin@electra.com', 'system', 'Primary admin account'),
  ('admin@example.com', 'system', 'Example admin account'),
  ('test.admin@electra.com', 'system', 'Test admin account')
ON CONFLICT (email) DO NOTHING;
