'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PageLayout from '@/components/shared/PageLayout'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { 
  User, 
  Building, 
  Briefcase, 
  FileText, 
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight,
  PlusCircle,
  Settings
} from 'lucide-react'

interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  role: 'tech' | 'employer'
  location?: string
  years_experience?: number
  certifications?: string[]
  specializations?: string[]
  company_name?: string
  company_size?: string
  created_at?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    interview: 0,
    hired: 0,
    rejected: 0
  })
  const [jobStats, setJobStats] = useState({
    total: 0,
    active: 0,
    totalApplications: 0,
    pendingApplications: 0
  })

  useEffect(() => {
    loadUserProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadUserProfile() {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const profile = await getUserProfile()
      setUserProfile(profile)

      // TODO: Load actual stats from your API
      if (profile.role === 'tech') {
        setApplicationStats({
          total: 5,
          pending: 2,
          reviewed: 1,
          interview: 1,
          hired: 1,
          rejected: 0
        })
      } else {
        setJobStats({
          total: 3,
          active: 2,
          totalApplications: 12,
          pendingApplications: 8
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      router.push('/auth/signin')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-cyan-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-gray-600 ml-2">Loading your dashboard...</span>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!userProfile) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
              <Button onClick={() => router.push('/auth/signin')}>
                Sign In Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  const renderTechDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {userProfile.first_name || 'Professional'}!
              </h1>
              <p className="text-blue-100 text-lg">
                Ready to find your next opportunity?
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{applicationStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{applicationStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-3xl font-bold text-purple-600">{applicationStats.interview}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-3xl font-bold text-green-600">{applicationStats.hired}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Find Your Next Role</span>
            </CardTitle>
            <CardDescription>
              Discover new opportunities that match your skills and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">New Jobs Available</p>
                <p className="text-sm text-gray-600">15 new positions in your area</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">New</Badge>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => router.push('/jobs')}
            >
              Browse Jobs
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Application Status</span>
            </CardTitle>
            <CardDescription>
              Track your applications and stay updated on progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Recent Activity</p>
                <p className="text-sm text-gray-600">{applicationStats.pending} applications need attention</p>
              </div>
              {applicationStats.pending > 0 && <Badge className="bg-yellow-100 text-yellow-800">Updates</Badge>}
            </div>
            <Button 
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={() => router.push('/applications')}
            >
              View Applications
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderEmployerDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {userProfile.company_name || userProfile.first_name || 'Employer'}!
              </h1>
              <p className="text-blue-100 text-lg">
                Manage your job postings and candidates
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{jobStats.active}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-purple-600">{jobStats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{jobStats.pendingApplications}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-green-600">85%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Post New Job</span>
            </CardTitle>
            <CardDescription>
              Create a new job posting to attract top radiologic talent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Quick Posting</p>
                <p className="text-sm text-gray-600">Get your position live in minutes</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Easy</Badge>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => router.push('/employers/post-job')}
            >
              Post a Job
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Manage Applications</span>
            </CardTitle>
            <CardDescription>
              Review candidates and manage your hiring pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">New Applications</p>
                <p className="text-sm text-gray-600">{jobStats.pendingApplications} candidates waiting for review</p>
              </div>
              {jobStats.pendingApplications > 0 && <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>}
            </div>
            <Button 
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={() => router.push('/employers/jobs')}
            >
              View Applications
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <PageLayout>
      <div className="min-h-screen">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {userProfile.role === 'tech' ? renderTechDashboard() : renderEmployerDashboard()}

          {/* Profile Completion Reminder */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                  <p className="text-gray-600">
                    A complete profile increases your {userProfile.role === 'tech' ? 'job match rate' : 'candidate quality'} by 75%
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => router.push('/profile')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
} 