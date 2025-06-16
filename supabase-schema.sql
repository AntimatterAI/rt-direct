-- RT Direct Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('tech', 'employer')),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tech profiles table
CREATE TABLE IF NOT EXISTS public.tech_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    certifications TEXT[] DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    specializations TEXT[] DEFAULT '{}',
    preferred_shifts TEXT[] DEFAULT '{}',
    travel_radius INTEGER DEFAULT 50,
    resume_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Employer profiles table
CREATE TABLE IF NOT EXISTS public.employer_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    company_size TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'Healthcare',
    website TEXT,
    description TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    salary_min INTEGER,
    salary_max INTEGER,
    location TEXT NOT NULL,
    work_type TEXT NOT NULL CHECK (work_type IN ('on-site', 'remote', 'hybrid')),
    employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'per-diem')),
    shift_type TEXT[] DEFAULT '{}',
    experience_required INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    tech_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'hired', 'rejected')),
    cover_letter TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(job_id, tech_id) -- Prevent duplicate applications
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_work_type ON public.jobs(work_type);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_tech_id ON public.job_applications(tech_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for tech_profiles
CREATE POLICY "Tech profiles are viewable by all authenticated users" ON public.tech_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tech users can update own tech profile" ON public.tech_profiles FOR UPDATE TO authenticated USING (
    profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
);
CREATE POLICY "Tech users can insert own tech profile" ON public.tech_profiles FOR INSERT TO authenticated WITH CHECK (
    profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
);

-- RLS Policies for employer_profiles
CREATE POLICY "Employer profiles are viewable by all authenticated users" ON public.employer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employer users can update own employer profile" ON public.employer_profiles FOR UPDATE TO authenticated USING (
    profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);
CREATE POLICY "Employer users can insert own employer profile" ON public.employer_profiles FOR INSERT TO authenticated WITH CHECK (
    profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);

-- RLS Policies for jobs
CREATE POLICY "Jobs are viewable by all authenticated users" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employers can insert their own jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (
    employer_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);
CREATE POLICY "Employers can update their own jobs" ON public.jobs FOR UPDATE TO authenticated USING (
    employer_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);
CREATE POLICY "Employers can delete their own jobs" ON public.jobs FOR DELETE TO authenticated USING (
    employer_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);

-- RLS Policies for job_applications
CREATE POLICY "Job applications viewable by tech and job owner" ON public.job_applications FOR SELECT TO authenticated USING (
    tech_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND employer_id = auth.uid())
);
CREATE POLICY "Tech users can insert applications for their own profile" ON public.job_applications FOR INSERT TO authenticated WITH CHECK (
    tech_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
);
CREATE POLICY "Tech users can update own applications" ON public.job_applications FOR UPDATE TO authenticated USING (
    tech_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
);
CREATE POLICY "Employers can update applications for their jobs" ON public.job_applications FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND employer_id = auth.uid())
);

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER update_tech_profiles_updated_at BEFORE UPDATE ON public.tech_profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON public.employer_profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Function to handle user signup and profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- This function will be called by a trigger on auth.users
    -- Note: You'll need to set this up in the Supabase Auth hooks
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Insert some sample data for development (optional)
-- Uncomment the following if you want sample data

/*
-- Sample employer profile
INSERT INTO public.profiles (id, email, role, first_name, last_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'hospital@example.com', 'employer', 'Regional', 'Hospital');

INSERT INTO public.employer_profiles (profile_id, company_name, company_size, industry, description) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Regional Medical Center', '500-1000', 'Healthcare', 'A leading healthcare facility providing comprehensive medical services.');

-- Sample tech profile
INSERT INTO public.profiles (id, email, role, first_name, last_name) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'tech@example.com', 'tech', 'John', 'Smith');

INSERT INTO public.tech_profiles (profile_id, experience_years, certifications, specializations) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 5, ARRAY['ARRT'], ARRAY['CT', 'MRI']);

-- Sample job posting
INSERT INTO public.jobs (employer_id, title, description, location, work_type, employment_type, salary_min, salary_max, requirements, benefits, shift_type) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 
 'CT Technologist', 
 'We are seeking an experienced CT Technologist to join our imaging team. The ideal candidate will have strong technical skills and excellent patient care abilities.',
 'Denver, CO',
 'on-site',
 'full-time',
 70000,
 85000,
 ARRAY['ARRT certification required', 'CT experience preferred', 'BLS certification'],
 ARRAY['Health insurance', 'Dental coverage', 'Retirement plan', 'Paid time off'],
 ARRAY['Day shift', 'Some weekends']);
*/ 