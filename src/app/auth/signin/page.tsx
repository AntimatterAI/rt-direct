'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  // Check if user is already authenticated (with protection against infinite loops)
  useEffect(() => {
    if (hasCheckedAuth) return // Prevent multiple auth checks

    const checkAuthStatus = async () => {
      try {
        // Add a small delay to prevent rapid redirects
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const user = await getCurrentUser()
        if (user) {
          console.log('User already authenticated, redirecting to dashboard...')
          // Use replace instead of push to prevent back button issues
          router.replace('/dashboard')
          return
        }
      } catch (authError) {
        console.log('No authenticated user found or auth error:', authError)
        // Don't redirect on auth errors, just show the signin form
      } finally {
        setIsCheckingAuth(false)
        setHasCheckedAuth(true)
      }
    }

    checkAuthStatus()
  }, [router, hasCheckedAuth])

  const onSubmit = async (data: SignInFormData) => {
    if (isLoading) return // Prevent double submissions
    
    setIsLoading(true)
    setError(null)

    try {
      console.log('Starting signin process...')
      const result = await signIn({
        email: data.email,
        password: data.password,
      })

      console.log('Signin successful:', result.user?.id)
      
      // Small delay to ensure session is established, then redirect
      setTimeout(() => {
        router.replace('/dashboard')
      }, 1000)

    } catch (signInError: unknown) {
      console.error('Signin error:', signInError)
      const message = signInError instanceof Error ? signInError.message : 'An error occurred during sign in'
      setError(message)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your RT Direct dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Continue your radiology career journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-blue-600 hover:underline">
                    Create account
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