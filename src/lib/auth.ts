import { supabase } from './supabase'
import { SignUpFormData, SignInFormData, UserRole } from '@/types'

export async function signUp(data: SignUpFormData) {
  const { email, password, role, firstName, lastName } = data

  try {
    // Sign up the user with role metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          first_name: firstName,
          last_name: lastName,
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (authData.user) {
      // Wait a bit for auth session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))

      try {
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
          // If RPC fails, the trigger should have created the profile
          // Let's verify the profile was created
          await verifyProfileCreation(authData.user.id)
        } else if (functionResult && !functionResult.success) {
          console.error('Profile function error:', functionResult.message)
          // Try manual creation as fallback
          await createProfileManually(authData.user.id, email, role, firstName, lastName)
        } else {
          console.log('Profile created successfully via RPC:', functionResult)
        }
      } catch (rpcError) {
        console.log('RPC call failed, checking if trigger created profile...', rpcError)
        // The trigger might have created the profile automatically
        await verifyProfileCreation(authData.user.id)
      }
    }

    return authData
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

// Verify that profile was created (either by RPC or trigger)
async function verifyProfileCreation(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.log('Profile not found, attempting manual creation...')
      throw new Error('Profile verification failed')
    }

    console.log('Profile verified successfully:', profile)
    return profile
  } catch (error) {
    console.error('Profile verification failed:', error)
    throw new Error('Profile creation could not be verified')
  }
}

// Fallback function for manual profile creation
async function createProfileManually(userId: string, email: string, role: string, firstName: string, lastName: string) {
  try {
    console.log('Attempting manual profile creation for user:', userId)
    
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
        // Don't throw here, main profile is created
      }
    } else if (role === 'employer') {
      const { error: employerProfileError } = await supabase
        .from('employer_profiles')
        .insert({
          profile_id: userId,
          company_name: firstName && lastName ? `${firstName} ${lastName}` : 'Company Name',
          company_size: '1-10 employees',
          industry: 'Healthcare',
          verified: false,
        })

      if (employerProfileError) {
        console.error('Employer profile creation failed:', employerProfileError.message)
        // Don't throw here, main profile is created
      }
    }

    console.log('Manual profile creation completed successfully')
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