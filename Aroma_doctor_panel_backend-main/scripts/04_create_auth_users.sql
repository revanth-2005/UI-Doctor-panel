-- Create users in Supabase auth system
-- First, we'll insert into auth.users using the admin API
-- For now, manually create users in Supabase dashboard with these credentials:
-- Email: doctor@example.com, Password: password, Role: doctor
-- Email: admin@example.com, Password: password, Role: admin

-- Then insert into public.users table
-- Doctor user
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'doctor@example.com',
  'Dr. Sarah Smith',
  'doctor',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Admin user
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@example.com',
  'Admin User',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Doctor profile
INSERT INTO public.doctors (id, user_id, specialization, clinic_address, phone, license_number, created_at)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Nutritionist',
  '123 Medical Center, New York, NY',
  '+1-555-0123',
  'LICENSE-12345',
  NOW()
)
ON CONFLICT DO NOTHING;
