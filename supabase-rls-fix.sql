-- RT Direct RLS Fix for Signup Issues
-- Run this in your Supabase SQL editor AFTER running the main schema

-- Drop the existing restrictive profile insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create a more permissive insert policy for new signups
CREATE POLICY "Enable insert for authenticated users during signup" ON public.profiles
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Create a function to handle the complete signup process
CREATE OR REPLACE FUNCTION public.handle_user_signup(
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  first_name TEXT,
  last_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert the main profile
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (user_id, user_email, user_role, first_name, last_name);
  
  -- Insert role-specific profile
  IF user_role = 'tech' THEN
    INSERT INTO public.tech_profiles (
      profile_id, 
      experience_years, 
      certifications, 
      specializations, 
      preferred_shifts, 
      travel_radius
    )
    VALUES (
      user_id, 
      0, 
      ARRAY[]::TEXT[], 
      ARRAY[]::TEXT[], 
      ARRAY[]::TEXT[], 
      50
    );
  ELSIF user_role = 'employer' THEN
    INSERT INTO public.employer_profiles (
      profile_id, 
      company_name, 
      company_size, 
      industry, 
      verified
    )
    VALUES (
      user_id, 
      '', 
      '', 
      'Healthcare', 
      false
    );
  END IF;
  
  -- Return success
  result = json_build_object(
    'success', true,
    'message', 'Profile created successfully'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  result = json_build_object(
    'success', false,
    'message', SQLERRM
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_user_signup TO authenticated;

-- Update the RLS policies for tech and employer profiles to be less restrictive during creation
DROP POLICY IF EXISTS "Tech users can insert own tech profile" ON public.tech_profiles;
DROP POLICY IF EXISTS "Employer users can insert own employer profile" ON public.employer_profiles;

-- More permissive policies for initial profile creation
CREATE POLICY "Enable tech profile insert for authenticated users" ON public.tech_profiles
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable employer profile insert for authenticated users" ON public.employer_profiles
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Keep the update policies restrictive
CREATE POLICY "Tech users can update own tech profile" ON public.tech_profiles
  FOR UPDATE TO authenticated 
  USING (
    profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tech')
  );

CREATE POLICY "Employer users can update own employer profile" ON public.employer_profiles
  FOR UPDATE TO authenticated 
  USING (
    profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
  ); 