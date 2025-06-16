import { supabase } from './supabase'
import { SignUpFormData, SignInFormData, UserRole } from '@/types'

export async function signUp(data: SignUpFormData) {
  const { email, password, role, firstName, lastName } = data

  try {
    // Step 1: Sign up the user with role metadata
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
      console.error('Auth signup error:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('No user data returned from signup')
    }

    console.log('User signed up successfully:', authData.user.id)

    // Step 2: Wait for auth user to be fully created
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 3: Verify user exists and retry if needed
    let authUserExists = false
    for (let i = 0; i < 5; i++) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user?.id === authData.user.id) {
          authUserExists = true
          break
        }
      } catch (error) {
        console.log(`Auth verification attempt ${i + 1} failed:`, error)
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!authUserExists) {
      throw new Error('Auth user creation could not be verified')
    }

    // Step 4: Try RPC function first (with retries)
    let rpcSuccess = false
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`RPC attempt ${attempt}...`)
        const { data: rpcData, error: rpcError } = await supabase.rpc('handle_user_signup', {
          user_id: authData.user.id,
          user_email: email,
          user_role: role,
          first_name: firstName,
          last_name: lastName
        })

        if (rpcError) {
          console.error(`RPC attempt ${attempt} failed:`, rpcError)
          if (attempt === 3) {
            console.log('All RPC attempts failed, will try trigger fallback...')
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
        } else {
          console.log('RPC success:', rpcData)
          if (rpcData?.success) {
            rpcSuccess = true
            break
          } else {
            console.log('RPC returned failure:', rpcData)
          }
        }
      } catch (error) {
        console.error(`RPC attempt ${attempt} exception:`, error)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    // Step 5: Check if trigger created profile (with multiple attempts)
    let profileExists = false
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`Profile verification attempt ${attempt}...`)
        
        // Try to get the profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          console.log(`Profile check attempt ${attempt} failed:`, profileError.message)
          if (attempt < 5) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
        } else {
          console.log('Profile found:', profileData)
          profileExists = true
          break
        }
      } catch (error) {
        console.error(`Profile verification attempt ${attempt} exception:`, error)
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    // Step 6: Manual profile creation as final fallback
    if (!profileExists && !rpcSuccess) {
      console.log('Profile not found, attempting manual creation...')
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Manual profile creation with ultra-simple approach
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: email,
              role: role,
              first_name: firstName,
              last_name: lastName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error(`Manual profile creation attempt ${attempt} failed:`, insertError)
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 2000))
              continue
            } else {
              throw insertError
            }
          } else {
            console.log('Manual profile creation succeeded')
            profileExists = true
            break
          }
        } catch (error) {
          console.error(`Manual profile creation attempt ${attempt} exception:`, error)
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }
    }

    // Step 7: Final verification
    if (!profileExists) {
      // As absolute last resort, let's check if the user got created anyway
      try {
        const { data: finalCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single()
        
        if (finalCheck) {
          console.log('Profile found in final check')
          profileExists = true
        }
      } catch (error) {
        console.log('Final profile check failed:', error)
      }
    }

    if (!profileExists) {
      console.error('Profile creation could not be verified after all attempts')
      throw new Error('Profile creation could not be verified')
    }

    console.log('Signup completed successfully!')
    return { success: true, user: authData.user }

  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

export async function signIn(data: SignInFormData) {
  const { email, password } = data

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many login attempts. Please wait a few minutes and try again.')
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network connection issue. Please check your internet connection and try again.')
      } else {
        throw new Error(`Sign in failed: ${error.message}`)
      }
    }

    if (!authData.user) {
      throw new Error('No user data returned from sign in')
    }

    return { success: true, user: authData.user }

  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
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

export async function getUserProfile() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('No authenticated user')
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        tech_profiles(*),
        employer_profiles(*)
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return profile

  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return null
    }

    return profile.role as UserRole
  } catch (error) {
    console.error('Get user role error:', error)
    return null
  }
}