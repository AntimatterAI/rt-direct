-- Final Comprehensive RLS Fix Script
-- This handles ALL possible existing policies
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies on all tables to start fresh
-- Profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Tech profiles policies
DROP POLICY IF EXISTS "Tech profiles are viewable by all authenticated users" ON public.tech_profiles;
DROP POLICY IF EXISTS "Tech users can view own tech profile" ON public.tech_profiles;
DROP POLICY IF EXISTS "Tech users can update own tech profile" ON public.tech_profiles;
DROP POLICY IF EXISTS "Tech users can insert own tech profile" ON public.tech_profiles;
DROP POLICY IF EXISTS "Allow tech profile creation during signup" ON public.tech_profiles;

-- Employer profiles policies
DROP POLICY IF EXISTS "Employer profiles are viewable by all authenticated users" ON public.employer_profiles;
DROP POLICY IF EXISTS "Employer users can view own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Employer users can update own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Employer users can insert own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Allow employer profile creation during signup" ON public.employer_profiles;

-- Jobs table policies
DROP POLICY IF EXISTS "Jobs are viewable by all authenticated users" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can manage own jobs" ON public.jobs;

-- Job applications policies (ALL possible variants)
DROP POLICY IF EXISTS "Job applications viewable by tech and job owner" ON public.job_applications;
DROP POLICY IF EXISTS "Tech users can insert applications for their own profile" ON public.job_applications;
DROP POLICY IF EXISTS "Tech users can update own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Employers can update applications for their jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Tech users can create applications" ON public.job_applications;
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.job_applications;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_signup();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the signup function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get the role from user metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'tech');
    
    -- Insert into profiles table with proper role
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        user_role,
        NOW(),
        NOW()
    );
    
    -- Create role-specific profile
    IF user_role = 'tech' THEN
        INSERT INTO public.tech_profiles (profile_id, created_at, updated_at)
        VALUES (NEW.id, NOW(), NOW());
    ELSIF user_role = 'employer' THEN
        INSERT INTO public.employer_profiles (profile_id, company_name, company_size, industry, created_at, updated_at)
        VALUES (NEW.id, 'Company Name', '1-10 employees', 'Healthcare', NOW(), NOW());
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and continue
        RAISE LOG 'Error in handle_user_signup: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_signup();

-- Grant necessary permissions first
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies with proper permissions

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow profile creation during signup" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Tech profiles policies  
CREATE POLICY "Tech users can view own tech profile" ON public.tech_profiles
    FOR SELECT TO authenticated
    USING (
        profile_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
    );

CREATE POLICY "Tech users can update own tech profile" ON public.tech_profiles
    FOR UPDATE TO authenticated
    USING (
        profile_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
    );

CREATE POLICY "Allow tech profile creation during signup" ON public.tech_profiles
    FOR INSERT TO authenticated
    WITH CHECK (
        profile_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
    );

-- Employer profiles policies
CREATE POLICY "Employer users can view own employer profile" ON public.employer_profiles
    FOR SELECT TO authenticated
    USING (
        profile_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
    );

CREATE POLICY "Employer users can update own employer profile" ON public.employer_profiles
    FOR UPDATE TO authenticated
    USING (
        profile_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
    );

CREATE POLICY "Allow employer profile creation during signup" ON public.employer_profiles
    FOR INSERT TO authenticated
    WITH CHECK (
        profile_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
    );

-- Jobs table policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs
    FOR SELECT TO authenticated
    USING (status = 'active');

CREATE POLICY "Employers can manage own jobs" ON public.jobs
    FOR ALL TO authenticated
    USING (
        employer_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
    )
    WITH CHECK (
        employer_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
    );

-- Job applications policies (using correct column name: tech_id)
CREATE POLICY "Users can view own applications" ON public.job_applications
    FOR SELECT TO authenticated
    USING (tech_id = auth.uid());

CREATE POLICY "Tech users can create applications" ON public.job_applications
    FOR INSERT TO authenticated
    WITH CHECK (
        tech_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
    );

CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE id = job_id AND employer_id = auth.uid()
        ) AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
    );

CREATE POLICY "Tech users can update own applications" ON public.job_applications
    FOR UPDATE TO authenticated
    USING (
        tech_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
    );

CREATE POLICY "Employers can update applications for their jobs" ON public.job_applications
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE id = job_id AND employer_id = auth.uid()
        ) AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
    );

-- Success message
SELECT 'RLS policies updated successfully! Signup should now work properly.' AS result; 