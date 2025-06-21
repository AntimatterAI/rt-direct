'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Menu, 
  X, 
  User, 
  Building,
  FileText,
  Briefcase,
  LogOut
} from 'lucide-react'
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth'

interface HeaderProps {
  variant?: 'home' | 'app'
  showBackground?: boolean
}

export default function Header({ showBackground = true }: HeaderProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<{ role: string; first_name?: string; company_name?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  async function checkAuthStatus() {
    try {
      const user = await getCurrentUser()
      if (user) {
        setIsAuthenticated(true)
        try {
          const profile = await getUserProfile()
          setUserProfile(profile)
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setIsAuthenticated(false)
      setUserProfile(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const headerClasses = showBackground 
    ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
    : "bg-transparent"

  return (
    <header className={`${headerClasses} sticky top-0 z-50 transition-all duration-300 w-full overflow-x-hidden`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 w-full">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RT Direct
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/jobs" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105"
            >
              Browse Jobs
            </Link>
            {isAuthenticated && userProfile?.role === 'tech' && (
              <Link 
                href="/applications" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105"
              >
                My Applications
              </Link>
            )}
            {isAuthenticated && userProfile?.role === 'employer' && (
              <Link 
                href="/employers/jobs" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105"
              >
                Manage Jobs
              </Link>
            )}
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    {userProfile && (
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                        >
                          {userProfile.role === 'tech' ? (
                            <><User className="w-3 h-3 mr-1" /> Tech</>
                          ) : (
                            <><Building className="w-3 h-3 mr-1" /> Employer</>
                          )}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Welcome, {userProfile.first_name || 'User'}!
                        </span>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      onClick={() => router.push('/dashboard')}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      onClick={() => router.push('/auth/signin')}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      onClick={() => router.push('/auth/signup')}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm rounded-b-lg shadow-lg w-full overflow-x-hidden">
            <div className="flex flex-col space-y-4 w-full">
              <Link 
                href="/jobs" 
                className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-4 hover:bg-blue-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Briefcase className="w-4 h-4 mr-3" />
                Browse Jobs
              </Link>
              
              {isAuthenticated && userProfile?.role === 'tech' && (
                <Link 
                  href="/applications" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-4 hover:bg-blue-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  My Applications
                </Link>
              )}
              
              {isAuthenticated && userProfile?.role === 'employer' && (
                <Link 
                  href="/employers/jobs" 
                  className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-4 hover:bg-blue-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building className="w-4 h-4 mr-3" />
                  Manage Jobs
                </Link>
              )}
              
              <Link 
                href="/about" 
                className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-4 hover:bg-blue-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              <Link 
                href="/contact" 
                className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 py-2 px-4 hover:bg-blue-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {!isLoading && (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                  {isAuthenticated ? (
                    <>
                      {userProfile && (
                        <div className="px-4 py-2">
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {userProfile.role === 'tech' ? (
                              <><User className="w-3 h-3 mr-1" /> Tech</>
                            ) : (
                              <><Building className="w-3 h-3 mr-1" /> Employer</>
                            )}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Welcome, {userProfile.first_name || 'User'}!
                          </p>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        className="mx-4 justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          router.push('/dashboard')
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="mx-4 justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="mx-4 justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          router.push('/auth/signin')
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        className="mx-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-start shadow-lg"
                        onClick={() => {
                          router.push('/auth/signup')
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 