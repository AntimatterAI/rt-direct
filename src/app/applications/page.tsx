'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import PageLayout from '@/components/shared/PageLayout'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Building, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Briefcase,
  Search,
  Filter,
  Loader2,
  TrendingUp,
  Star,
  Eye,
  ArrowRight
} from 'lucide-react'

interface Application {
  id: string
  job_id: string
  status: string
  applied_at: string
  cover_letter?: string
  jobs: {
    id: string
    title: string
    location: string
    employment_type: string
    work_type: string
    profiles: {
      employer_profiles: {
        company_name: string
      }
    }
  }
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadApplications = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            employment_type,
            work_type,
            profiles (
              employer_profiles (
                company_name
              )
            )
          )
        `)
        .eq('tech_id', user.id)
        .order('applied_at', { ascending: false })

      if (error) {
        console.error('Error loading applications:', error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  function filterApplications() {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.jobs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs.profiles.employer_profiles.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'interview': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'hired': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'reviewed': return <Eye className="w-3 h-3" />
      case 'interview': return <User className="w-3 h-3" />
      case 'hired': return <CheckCircle className="w-3 h-3" />
      case 'rejected': return <AlertCircle className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    interview: applications.filter(app => app.status === 'interview').length,
    hired: applications.filter(app => app.status === 'hired').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  }

  return (
    <PageLayout>
      <div className="min-h-screen">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  My Applications
                </h1>
                <p className="text-gray-600 text-lg">
                  Track your job application progress and status
                </p>
              </div>
              <Button
                onClick={() => router.push('/jobs')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Find More Jobs
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{applicationStats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{applicationStats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{applicationStats.reviewed}</div>
                  <div className="text-sm text-gray-600">Reviewed</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{applicationStats.interview}</div>
                  <div className="text-sm text-gray-600">Interview</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{applicationStats.hired}</div>
                  <div className="text-sm text-gray-600">Hired</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{applicationStats.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full md:w-48 pl-10 pr-4 h-12 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interview">Interview</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('')
                    }}
                    className="h-12 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading your applications...</span>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {applications.length === 0 ? 'No applications yet' : 'No applications found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {applications.length === 0 
                    ? 'Start applying to radiologic technology positions to track your progress here.'
                    : 'Try adjusting your search criteria to find more applications.'
                  }
                </p>
                <Button 
                  onClick={() => router.push('/jobs')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card 
                  key={application.id} 
                  className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                  onClick={() => router.push(`/jobs/${application.job_id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {application.jobs.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{application.jobs.profiles.employer_profiles.company_name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{application.jobs.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Applied {getTimeAgo(application.applied_at)}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {application.jobs.employment_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {application.jobs.work_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Application #{application.id.slice(-6)}
                          </Badge>
                        </div>

                        {application.cover_letter && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Cover Letter Preview</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Application ID: {application.id}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 group-hover:scale-105 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/jobs/${application.job_id}`)
                            }}
                          >
                            View Job
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tips Card */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Improve Your Application Success Rate</h3>
                  <p className="text-gray-600 text-sm">
                    Applications with complete profiles and personalized cover letters are 3x more likely to get responses.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => router.push('/profile')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Optimize Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
} 