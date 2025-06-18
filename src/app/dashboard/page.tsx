'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { AlertCircle, User, Building, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    // Set page title for SEO
    document.title = 'Dashboard | RT Direct - Manage Your Radiology Career'
    
    async function loadProfile() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        try {
          const userProfile = await getUserProfile()
          setProfile(userProfile)
        } catch (profileError: unknown) {
          console.error('Error loading profile:', profileError)
          
          // Check if it's a missing profile error (PGRST116)
          const error = profileError as { code?: string; message?: string }
          if (error?.code === 'PGRST116' || 
              error?.message?.includes('multiple (or no) rows returned') ||
              error?.message?.includes('JSON object requested')) {
            setProfileError('Your profile needs to be set up. Please create your profile to continue.')
          } else {
            // For other errors, redirect to signin
            router.push('/auth/signin')
            return
          }
        }
      } catch (error) {
        console.error('Error in loadProfile:', error)
        router.push('/auth/signin')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  const createBasicProfile = async (role: 'tech' | 'employer') => {
    setIsCreatingProfile(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Create basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          role: role,
          first_name: '',
          last_name: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        throw profileError
      }

      // Create role-specific profile
      if (role === 'tech') {
        const { error: techError } = await supabase
          .from('tech_profiles')
          .insert({
            profile_id: user.id,
            experience_years: 0,
            certifications: [],
            specializations: [],
            preferred_shifts: [],
            travel_radius: 50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (techError) {
          console.error('Error creating tech profile:', techError)
        }
      } else {
        const { error: employerError } = await supabase
          .from('employer_profiles')
          .insert({
            profile_id: user.id,
            company_name: 'Company Name',
            company_size: '1-10 employees',
            industry: 'Healthcare',
            verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (employerError) {
          console.error('Error creating employer profile:', employerError)
        }
      }

      // Reload the page to fetch the new profile
      window.location.reload()

    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile. Please try again or contact support.')
    } finally {
      setIsCreatingProfile(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Setting up your dashboard</p>
        </div>
      </div>
    )
  }

  // Show profile setup if profile doesn't exist
  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                To continue using RT Direct, please select your role and we&apos;ll set up your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">{profileError}</span>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-auto py-4 px-6"
                  variant="outline"
                  onClick={() => createBasicProfile('tech')}
                  disabled={isCreatingProfile}
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Radiologic Technologist</div>
                      <div className="text-sm text-gray-600">Looking for job opportunities</div>
                    </div>
                  </div>
                </Button>

                <Button
                  className="w-full h-auto py-4 px-6"
                  variant="outline"
                  onClick={() => createBasicProfile('employer')}
                  disabled={isCreatingProfile}
                >
                  <div className="flex items-center space-x-3">
                    <Building className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Healthcare Employer</div>
                      <div className="text-sm text-gray-600">Posting job opportunities</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>

              {isCreatingProfile && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">Creating your profile...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                RT Direct
              </h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {profile.role === 'tech' ? 'Radiologic Tech' : 'Employer'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {profile.first_name || 'User'}!
              </span>
              <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  'Sign Out'
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {profile.role === 'tech' 
              ? 'Find your next radiology position' 
              : 'Manage your job postings and candidates'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.role === 'tech' ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Browse Jobs</CardTitle>
                  <CardDescription>
                    Explore available radiology positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => router.push('/jobs')}
                  >
                    View Jobs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                  <CardDescription>
                    Track your job applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/applications')}
                  >
                    View Applications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Update your professional profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/profile/tech')}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Post a Job</CardTitle>
                  <CardDescription>
                    Create a new job posting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => router.push('/employers/post-job')}
                  >
                    Post Job
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manage Jobs</CardTitle>
                  <CardDescription>
                    View and edit your job postings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/employers/jobs')}
                  >
                    View Jobs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>
                    Update your company information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/profile/employer')}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 