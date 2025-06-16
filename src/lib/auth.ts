import { supabase } from './supabase'
import { SignUpFormData, SignInFormData, UserRole } from '@/types'

export async function signUp(data: SignUpFormData) {
  const { email, password, role, firstName, lastName } = data

  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (authData.user) {
      // Wait a bit for auth session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Use the database function for profile creation
      const { data: functionResult, error: functionError } = await supabase
        .rpc('handle_user_signup', {
          user_id: authData.user.id,
          user_email: email,
          user_role: role,
          first_name: firstName,
          last_name: lastName,
        })

      if (functionError) {
        console.error('Profile creation error:', functionError)
        // Fallback to manual creation
        await createProfileManually(authData.user.id, email, role, firstName, lastName)
      } else if (functionResult && !functionResult.success) {
        console.error('Profile function error:', functionResult.message)
        // Fallback to manual creation
        await createProfileManually(authData.user.id, email, role, firstName, lastName)
      }
    }

    return authData
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

// Fallback function for manual profile creation
async function createProfileManually(userId: string, email: string, role: string, firstName: string, lastName: string) {
  try {
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        role,
        first_name: firstName,
        last_name: lastName,
      })

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    // Create role-specific profile
    if (role === 'tech') {
      const { error: techProfileError } = await supabase
        .from('tech_profiles')
        .insert({
          profile_id: userId,
          experience_years: 0,
          certifications: [],
          specializations: [],
          preferred_shifts: [],
          travel_radius: 50,
        })

      if (techProfileError) {
        console.error('Tech profile creation failed:', techProfileError.message)
      }
    } else if (role === 'employer') {
      const { error: employerProfileError } = await supabase
        .from('employer_profiles')
        .insert({
          profile_id: userId,
          company_name: '',
          company_size: '',
          industry: 'Healthcare',
          verified: false,
        })

      if (employerProfileError) {
        console.error('Employer profile creation failed:', employerProfileError.message)
      }
    }
  } catch (error) {
    console.error('Manual profile creation failed:', error)
    throw error
  }
}

export async function signIn(data: SignInFormData) {
  const { email, password } = data

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return authData
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(error.message)
  }

  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const profile = await getUserProfile(userId)
  return profile?.role || null
} 