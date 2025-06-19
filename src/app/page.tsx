'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/shared/Header'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { 
  Users, 
  MapPin, 
  Clock, 
  Shield, 
  TrendingUp, 
  Stethoscope, 
  Activity, 
  Award, 
  Heart, 
  ArrowRight, 
  CheckCircle, 
  Building,
  User,
  Briefcase,
  FileText
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
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

  useEffect(() => {
    // Only run animations if we're on the home page and elements exist
    if (typeof window === 'undefined') return

    // Wait for DOM to be fully ready
    const timer = setTimeout(() => {
      // Check if we have the essential home page elements before running animations
      const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons')
      const isHomePage = heroElements.length >= 3

      if (!isHomePage) {
        console.log('Not on home page, skipping animations')
        return
      }

      // Create GSAP context for cleanup
      const ctx = gsap.context(() => {
        // Helper function to safely animate elements with existence checks
        const safeAnimate = (selector: string, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) => {
          const elements = document.querySelectorAll(selector)
          if (elements.length > 0) {
            try {
              gsap.fromTo(elements, fromVars, toVars)
            } catch (error) {
              console.warn(`GSAP animation failed for ${selector}:`, error)
            }
          }
        }

        // Animate hero elements with staggered entrance
        safeAnimate('.hero-title', 
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.2 }
        )
        
        safeAnimate('.hero-subtitle',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
        )
        
        safeAnimate('.hero-buttons',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.8 }
        )

        // Animate feature cards on scroll
        safeAnimate('.feature-card',
          { y: 60, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            ease: 'power3.out', 
            stagger: 0.2,
            scrollTrigger: {
              trigger: '.features-section',
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        )

        // Animate stats section
        safeAnimate('.stat-item',
          { scale: 0.8, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.6, 
            ease: 'back.out(1.7)', 
            stagger: 0.1,
            scrollTrigger: {
              trigger: '.stats-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )

        // Animate CTA section with better targeting
        const ctaContent = document.querySelector('.cta-section .cta-content')
        if (ctaContent) {
          gsap.fromTo(ctaContent,
            { y: 50, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.8, 
              ease: 'power3.out',
              scrollTrigger: {
                trigger: '.cta-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          )
        }

      }, [heroRef, featuresRef, statsRef, ctaRef])

      // Cleanup function
      return () => {
        ctx.revert()
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }, 100) // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const renderHeroButtons = () => {
    if (isLoading) {
      return (
        <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="w-48 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-48 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      )
    }

    if (isAuthenticated && userProfile) {
      // Show different buttons based on user role
      if (userProfile.role === 'tech') {
        return (
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/jobs')}
            >
              <Briefcase className="mr-2 w-5 h-5" />
              Browse Jobs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/applications')}
            >
              <FileText className="mr-2 w-5 h-5" />
              My Applications
            </Button>
          </div>
        )
      } else {
        return (
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/employers/post-job')}
            >
              <Building className="mr-2 w-5 h-5" />
              Post a Job
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/employers/jobs')}
            >
              <Users className="mr-2 w-5 h-5" />
              Manage Jobs
            </Button>
          </div>
        )
      }
    }

    // Not authenticated - show default signup buttons
    return (
      <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => router.push('/auth/signup')}
        >
          Find Your Next Role
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
          onClick={() => router.push('/auth/signup')}
        >
          <Building className="mr-2 w-5 h-5" />
          Post a Position
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <Header variant="home" showBackground={false} />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="hero-title">
            <Badge variant="secondary" className="mb-6 text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200">
              <Users className="w-4 h-4 mr-2" />
              Connecting Healthcare Professionals
            </Badge>
          </div>
          
          <h1 className="hero-title text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent mb-8 leading-tight">
            RT Direct
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The premier platform connecting top radiologic technologist talent with leading healthcare facilities across the nation.
          </p>
          
          {renderHeroButtons()}
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="stats-section py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: '500+', label: 'Active Professionals' },
              { icon: Building, number: '200+', label: 'Partner Facilities' },
              { icon: MapPin, number: '50', label: 'States Served' },
              { icon: CheckCircle, number: '98%', label: 'Satisfaction Rate' }
            ].map((stat, index) => (
              <div key={index} className="stat-item text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="features-section py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose RT Direct?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We understand the unique needs of radiologic technologist professionals and the facilities that depend on them.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Stethoscope,
                title: 'Specialized Focus',
                description: 'Exclusively for radiologic technologist professionals and positions.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Clock,
                title: 'Fast Placement',
                description: 'Quick matching process gets you working sooner.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Shield,
                title: 'Verified Opportunities',
                description: 'All positions and facilities are thoroughly vetted.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: TrendingUp,
                title: 'Career Growth',
                description: 'Access to positions that advance your career.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: Activity,
                title: 'Real-Time Updates',
                description: 'Get instant notifications about new opportunities.',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Award,
                title: 'Quality Assurance',
                description: 'Only the best facilities and highest-rated professionals.',
                color: 'from-yellow-500 to-orange-500'
              }
            ].map((feature, index) => (
              <Card key={index} className="feature-card group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-content">
            <Heart className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Take the Next Step in Your RT Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of radiologic technologist professionals who have found their perfect match through RT Direct.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => router.push('/auth/signup')}
                  >
                    Get Started Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
                    onClick={() => router.push('/jobs')}
                  >
                    Browse Opportunities
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => router.push('/dashboard')}
                  >
                    <User className="mr-2 w-5 h-5" />
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
                    onClick={() => router.push('/jobs')}
                  >
                    Browse Opportunities
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
