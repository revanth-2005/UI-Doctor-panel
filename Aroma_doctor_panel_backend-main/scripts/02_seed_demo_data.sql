-- Seed demo users with passwords for demo purposes
-- In production, use bcrypt or similar password hashing
INSERT INTO users (email, password_hash, role, full_name) VALUES
  ('admin@example.com', 'password', 'admin', 'Admin User'),
  ('doctor@example.com', 'password', 'doctor', 'Dr. John Smith');

-- Get the doctor user ID to create a doctor profile
WITH doctor_user AS (
  SELECT id FROM users WHERE email = 'doctor@example.com'
)
INSERT INTO doctors (user_id, specialization, license_number, phone, clinic_address) 
SELECT id, 'General Medicine', 'LIC123456', '+1-555-0123', '123 Medical Center, City' 
FROM doctor_user;
