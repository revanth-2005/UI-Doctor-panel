-- Add Row Level Security policies for tables
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own user record
CREATE POLICY "users_select_own" ON users FOR SELECT
  USING (auth.uid() = id);

-- Doctors can view their own profile and patients
CREATE POLICY "doctors_select_own" ON doctors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "doctors_update_own" ON doctors FOR UPDATE
  USING (auth.uid() = user_id);

-- Doctors can view their patients
CREATE POLICY "patients_select_own_doctor" ON patients FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM doctors WHERE id = doctor_id));

-- Allow public read on conditions and recipes (for mobile app)
CREATE POLICY "conditions_select_public" ON medical_conditions FOR SELECT
  USING (true);

CREATE POLICY "recipes_select_public" ON recipes FOR SELECT
  USING (true);

-- Recommendations policies
CREATE POLICY "recommendations_select_patient_or_doctor" ON recommendations FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM doctors WHERE id = doctor_id) OR
    patient_id IN (SELECT id FROM patients WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
  );
