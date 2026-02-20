-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor')),
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT,
  license_number TEXT,
  phone TEXT,
  clinic_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  medical_conditions TEXT[], -- Array of condition IDs
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create medical conditions table
CREATE TABLE IF NOT EXISTS medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  recommended_nutrients JSONB, -- e.g., {"protein": 50, "carbs": 200, "fiber": 30}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id UUID NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions TEXT,
  nutritional_info JSONB, -- e.g., {"protein": 25, "carbs": 45, "fiber": 8}
  preparation_time INTEGER, -- in minutes
  servings INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create recommendations table (doctor shares with patient)
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition_id UUID NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  recipes UUID[] DEFAULT ARRAY[]::UUID[], -- Array of recipe IDs
  nutrients JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  shared_at TIMESTAMP DEFAULT NOW(),
  response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_recipes_condition_id ON recipes(condition_id);
CREATE INDEX idx_recommendations_doctor_id ON recommendations(doctor_id);
CREATE INDEX idx_recommendations_patient_id ON recommendations(patient_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
