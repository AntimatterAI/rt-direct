'use client'

import { useEffect, useRef } from 'react'
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
import { Users, MapPin, Clock, Shield, Star, TrendingUp, Stethoscope, Activity, Award, Heart, ArrowRight, CheckCircle, Building } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set page title for SEO
    document.title = 'RT Direct - Find Your Next Radiology Career | Radiologic Technologist Jobs'
    
    // Create GSAP context for cleanup
    const ctx = gsap.context(() => {
      // Helper function to safely animate elements
      const safeAnimate = (selector: string, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) => {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          gsap.fromTo(elements, fromVars, toVars)
        }
      }

      // Animate hero elements if they exist
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
      
      safeAnimate('.hero-image',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3 }
      )

      // Features Animation with ScrollTrigger
      if (featuresRef.current && document.querySelector('.feature-card')) {
        gsap.fromTo('.feature-card',
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }

      // Stats Animation with ScrollTrigger
      if (statsRef.current && document.querySelector('.stat-item')) {
        gsap.fromTo('.stat-item',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }

      // CTA Animation with ScrollTrigger
      if (ctaRef.current && document.querySelector('.cta-content')) {
        gsap.fromTo('.cta-content',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }

      // Floating animations for hero elements (only if they exist)
      const floating1 = document.querySelector('.floating-1')
      const floating2 = document.querySelector('.floating-2')
      const floating3 = document.querySelector('.floating-3')

      if (floating1) {
        gsap.to(floating1, {
          y: -20,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut'
        })
      }

      if (floating2) {
        gsap.to(floating2, {
          y: -15,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: 0.5
        })
      }

      if (floating3) {
        gsap.to(floating3, {
          y: -25,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: 1
        })
      }

    }, [heroRef, featuresRef, statsRef, ctaRef])

    // Cleanup function
    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                RT Direct
              </h1>
              <Badge className="hidden sm:inline-flex bg-blue-100 text-blue-800 border-0 text-xs">Professional</Badge>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/auth/signin')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-sm sm:text-base px-3 sm:px-4"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base px-3 sm:px-6"
              >
                <span className="hidden sm:inline">Get Started Free</span>
                <span className="sm:hidden">Sign Up</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="hero-title flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-700 px-3 py-1">
                  Healthcare Professional Platform
                </Badge>
              </div>
              <h1 className="hero-title text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Advance Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
                  Radiology Career
                </span>
              </h1>
              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                Join the leading platform connecting radiologic technologists with top healthcare facilities. 
                Discover opportunities that match your expertise and career goals.
              </p>
              
              {/* Trust Indicators */}
              <div className="hero-trust flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">1,200+ Active Jobs</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">4.9/5 User Rating</span>
                </div>
              </div>

              <div className="hero-buttons flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                  onClick={() => router.push('/auth/signup')}
                >
                  <div className="flex items-center space-x-2">
                    <span className="hidden sm:inline">Start Your Career Journey</span>
                    <span className="sm:hidden">Get Started</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
                  onClick={() => router.push('/jobs')}
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Explore Opportunities</span>
                    <span className="sm:hidden">Explore Jobs</span>
                  </div>
                </Button>
              </div>
            </div>
            
            <div className="hero-image relative">
              <div className="relative">
                {/* Floating Cards - Hidden on small screens to prevent overlap */}
                <Card className="floating-1 absolute -top-8 -right-12 w-52 bg-white/95 backdrop-blur-sm border-0 shadow-lg hidden lg:block">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-900">Live Job Alert</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">MRI Technologist</p>
                        <p className="text-xs text-green-600 font-medium">$75K - $85K • Boston, MA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="floating-2 absolute -bottom-4 -left-8 w-48 bg-white/95 backdrop-blur-sm border-0 shadow-lg hidden lg:block">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">1,247</p>
                        <p className="text-xs text-gray-600">Healthcare Professionals</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">+15% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="floating-3 absolute top-1/2 -left-6 w-44 bg-white/95 backdrop-blur-sm border-0 shadow-lg hidden lg:block">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">4.9/5</p>
                        <p className="text-xs text-gray-600">Platform Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">Trusted by professionals</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Hero Image/Illustration */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 rounded-3xl p-8 text-white text-center shadow-2xl">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    Healthcare Excellence
                  </h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Empowering radiologic professionals with career opportunities at leading medical institutions
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-xl font-bold text-white">500+</div>
                      <div className="text-xs text-blue-100">Hospitals</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-xl font-bold text-white">24/7</div>
                      <div className="text-xs text-blue-100">Support</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-xl font-bold text-white">95%</div>
                      <div className="text-xs text-blue-100">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="stat-item text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                1,200+
              </div>
              <p className="text-gray-600 dark:text-gray-300">Active Jobs</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                850+
              </div>
              <p className="text-gray-600 dark:text-gray-300">Radiologic Techs</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                300+
              </div>
              <p className="text-gray-600 dark:text-gray-300">Healthcare Facilities</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                95%
              </div>
              <p className="text-gray-600 dark:text-gray-300">Match Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose RT Direct?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We understand the unique needs of radiology professionals and healthcare facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="w-12 h-12 text-blue-500 mb-4" />
                <CardTitle>Location Flexibility</CardTitle>
                <CardDescription>
                  Find opportunities anywhere from local hospitals to travel positions across the country.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-green-500 mb-4" />
                <CardTitle>Verified Employers</CardTitle>
                <CardDescription>
                  All healthcare facilities are thoroughly vetted to ensure legitimate and quality opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="w-12 h-12 text-purple-500 mb-4" />
                <CardTitle>Quick Applications</CardTitle>
                <CardDescription>
                  Apply to multiple positions with one click using your saved profile and preferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-orange-500 mb-4" />
                <CardTitle>Salary Insights</CardTitle>
                <CardDescription>
                  Access real-time salary data and market trends for radiology positions in your area.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-red-500 mb-4" />
                <CardTitle>Professional Network</CardTitle>
                <CardDescription>
                  Connect with fellow radiologic technologists and industry professionals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="feature-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="w-12 h-12 text-yellow-500 mb-4" />
                <CardTitle>Career Growth</CardTitle>
                <CardDescription>
                  Access continuing education resources and career advancement opportunities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="cta-content">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of radiology professionals who have found their perfect match through RT Direct.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-3"
                onClick={() => router.push('/auth/signup')}
              >
                Start Your Journey
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-lg"
                onClick={() => router.push('/jobs')}
              >
                Explore Opportunities
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">RT Direct</h3>
            <p className="text-gray-400 mb-6">
              Connecting radiologic technologists with their ideal career opportunities.
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                About
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Contact
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Privacy
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Terms
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                © 2024 RT Direct. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
