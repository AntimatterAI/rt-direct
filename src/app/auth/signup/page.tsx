'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, User, Building, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tech' as 'tech' | 'employer'
  })

  // Check if user is already authenticated (with protection against infinite loops)
  useEffect(() => {
    if (hasCheckedAuth) return

    const checkAuthStatus = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const user = await getCurrentUser()
        if (user) {
          console.log('User already authenticated, redirecting to dashboard...')
          router.replace('/dashboard')
          return
        }
      } catch (authError) {
        console.log('No authenticated user found or auth error:', authError)
      } finally {
        setIsCheckingAuth(false)
        setHasCheckedAuth(true)
      }
    }

    checkAuthStatus()
  }, [router, hasCheckedAuth])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRoleChange = (role: 'tech' | 'employer') => {
    setFormData(prev => ({
      ...prev,
      role
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required'
    if (!formData.lastName.trim()) return 'Last name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.email.includes('@')) return 'Please enter a valid email address'
    if (!formData.password) return 'Password is required'
    if (formData.password.length < 8) return 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Starting signup process...')
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      console.log('Signup result:', result)

      if (result.success) {
        setSuccess(true)
        
        setTimeout(() => {
          console.log('Redirecting to dashboard...')
          router.replace('/dashboard')
        }, 3000)
      } else {
        throw new Error('Signup failed for unknown reason')
      }

    } catch (signUpError: unknown) {
      console.error('Signup error:', signUpError)
      const message = signUpError instanceof Error ? signUpError.message : 'An error occurred during signup'
      setError(message)
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Welcome to RT Direct!</CardTitle>
            <CardDescription>
              Your account has been created successfully. Redirecting you to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join RT Direct</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Join thousands of respiratory therapy professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">I am a...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="radio"
                      id="tech"
                      name="role"
                      value="tech"
                      checked={formData.role === 'tech'}
                      onChange={() => handleRoleChange('tech')}
                      className="sr-only peer"
                    />
                    <Label
                      htmlFor="tech"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary cursor-pointer"
                    >
                      <User className="mb-3 h-6 w-6" />
                      <span className="font-medium">RT Professional</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Looking for opportunities
                      </span>
                    </Label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="employer"
                      name="role"
                      value="employer"
                      checked={formData.role === 'employer'}
                      onChange={() => handleRoleChange('employer')}
                      className="sr-only peer"
                    />
                    <Label
                      htmlFor="employer"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary cursor-pointer"
                    >
                      <Building className="mb-3 h-6 w-6" />
                      <span className="font-medium">Healthcare Facility</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Looking to hire
                      </span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 