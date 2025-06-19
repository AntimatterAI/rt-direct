'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PageLayout from '@/components/shared/PageLayout'
import { signIn } from '@/lib/auth'
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Building, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signIn(formData.email, formData.password)
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('Sign in error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Animated background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          </div>

          <Card className="bg-white/80 backdrop-blur-md border-0 shadow-2xl relative z-10">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your RT Direct account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Don&apos;t have an account?</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/auth/signup">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold transition-all duration-200 hover:scale-[1.02]"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Join as Radiologic Technologist
                  </Button>
                </Link>
                
                <Link href="/auth/signup">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 font-semibold transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Join as Healthcare Employer
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <Link 
                  href="/" 
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
} 