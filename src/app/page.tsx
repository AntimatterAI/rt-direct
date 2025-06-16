'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MapPin, Clock, Shield, Star, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const tl = gsap.timeline()
      
      tl.fromTo('.hero-title', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      )
      .fromTo('.hero-subtitle',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.hero-buttons',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo('.hero-image',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' },
        '-=0.8'
      )

      // Features Animation on Scroll
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

      // Stats Animation
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

      // CTA Animation
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

      // Floating animation for hero elements
      gsap.to('.floating-1', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      })

      gsap.to('.floating-2', {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: 0.5
      })

      gsap.to('.floating-3', {
        y: -25,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: 1
      })

    }, [heroRef, featuresRef, statsRef, ctaRef])

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                RT Direct
              </h1>
              <Badge className="ml-3 bg-blue-100 text-blue-800">Beta</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/auth/signup')}>
                Get Started
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
              <h1 className="hero-title text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Connect Radiologic Techs with{' '}
                <span className="text-blue-600 dark:text-blue-400">Dream Jobs</span>
              </h1>
              <p className="hero-subtitle text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                The premier platform for radiology professionals to find their next opportunity 
                and for healthcare facilities to discover top talent.
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-3"
                  onClick={() => router.push('/auth/signup')}
                >
                  Find Your Next Role
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-3"
                  onClick={() => router.push('/jobs')}
                >
                  Browse Jobs
                </Button>
              </div>
            </div>
            
            <div className="hero-image relative">
              <div className="relative">
                {/* Floating Cards */}
                <Card className="floating-1 absolute top-4 right-4 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">New Job Alert</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      CT Technologist - $80K
                    </p>
                  </CardContent>
                </Card>

                <Card className="floating-2 absolute bottom-8 left-0 w-44 bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">1,247</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      Active Professionals
                    </p>
                  </CardContent>
                </Card>

                <Card className="floating-3 absolute top-1/2 left-8 w-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">4.9/5</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      User Rating
                    </p>
                  </CardContent>
                </Card>

                {/* Main Hero Image/Illustration */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-xl font-semibold mb-2">Healthcare Innovation</h3>
                  <p className="text-blue-100">Connecting talent with opportunity</p>
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
                variant="outline"
                className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600"
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
