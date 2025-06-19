'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import PageLayout from '@/components/shared/PageLayout'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  Briefcase, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Star
} from 'lucide-react'

interface Job {
  id: string
  title: string
  location: string
  employment_type: string
  work_type: string
  shift_type: string[]
  salary_min?: number
  salary_max?: number
  status: string
  posted_at: string
  application_count?: number
  pending_count?: number
  approved_count?: number
  applications?: {
    status: string
  }[]
}

export default function EmployerJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<{ role: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    checkAuthAndLoadJobs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function checkAuthAndLoadJobs() {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const profile = await getUserProfile()
      if (profile.role !== 'employer') {
        router.push('/dashboard')
        return
      }

      setUserProfile(profile)
      await loadJobs(user.id)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/auth/signin')
    }
  }

  async function loadJobs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications (
            id,
            status
          )
        `)
        .eq('employer_id', userId)
        .order('posted_at', { ascending: false })

      if (error) {
        console.error('Error loading jobs:', error)
        return
      }

      const jobsWithCounts = data?.map(job => ({
        ...job,
        application_count: job.applications?.length || 0,
        pending_count: job.applications?.filter((app: { status: string }) => app.status === 'pending').length || 0,
        approved_count: job.applications?.filter((app: { status: string }) => app.status === 'hired').length || 0
      })) || []

      setJobs(jobsWithCounts)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterJobs() {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    setFilteredJobs(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'closed': return <AlertCircle className="w-3 h-3" />
      case 'draft': return <Clock className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    return `Up to $${max?.toLocaleString()}`
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

  const jobStats = {
    total: jobs.length,
    active: jobs.filter(job => job.status === 'active').length,
    closed: jobs.filter(job => job.status === 'closed').length,
    draft: jobs.filter(job => job.status === 'draft').length,
    totalApplications: jobs.reduce((sum, job) => sum + (job.application_count || 0), 0),
    pendingApplications: jobs.reduce((sum, job) => sum + (job.pending_count || 0), 0)
  }

  async function toggleJobStatus(jobId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active'
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId)

      if (error) throw error

      // Reload jobs
      if (userProfile) {
        const user = await getCurrentUser()
        if (user) await loadJobs(user.id)
      }
    } catch (error) {
      console.error('Error updating job status:', error)
    }
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
                  Manage Jobs
                </h1>
                <p className="text-gray-600 text-lg">
                  Oversee your job postings and candidate applications
                </p>
              </div>
              <Button
                onClick={() => router.push('/employers/post-job')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{jobStats.total}</div>
                  <div className="text-sm text-gray-600">Total Jobs</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{jobStats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{jobStats.closed}</div>
                  <div className="text-sm text-gray-600">Closed</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{jobStats.draft}</div>
                  <div className="text-sm text-gray-600">Draft</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{jobStats.totalApplications}</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{jobStats.pendingApplications}</div>
                  <div className="text-sm text-gray-600">Pending</div>
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
                      placeholder="Search jobs..."
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
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
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

          {/* Jobs List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading your jobs...</span>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {jobs.length === 0 
                    ? 'Start by posting your first radiologic technology position.'
                    : 'Try adjusting your search criteria to find more jobs.'
                  }
                </p>
                <Button 
                  onClick={() => router.push('/employers/post-job')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Posted {getTimeAgo(job.posted_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`flex items-center space-x-1 ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="capitalize">{job.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">
                          {job.application_count || 0} applications
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {job.employment_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {job.work_type}
                      </Badge>
                      {job.shift_type && job.shift_type.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {job.shift_type.join(', ')}
                        </Badge>
                      )}
                    </div>

                    {/* Application Stats */}
                    {(job.application_count || 0) > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Applications breakdown:</span>
                          <div className="flex space-x-4">
                            <span className="text-yellow-600">
                              {job.pending_count || 0} pending
                            </span>
                            <span className="text-green-600">
                              {job.approved_count || 0} hired
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          onClick={() => router.push(`/employers/jobs/${job.id}/edit`)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        {(job.application_count || 0) > 0 && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            onClick={() => router.push(`/employers/jobs/${job.id}/applications`)}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Applications
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className={job.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}
                          onClick={() => toggleJobStatus(job.id, job.status)}
                        >
                          {job.status === 'active' ? 'Close' : 'Reopen'}
                        </Button>
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
                  <h3 className="font-semibold text-gray-900 mb-1">Optimize Your Job Postings</h3>
                  <p className="text-gray-600 text-sm">
                    Jobs with detailed descriptions and competitive benefits receive 2x more qualified applications.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => router.push('/employers/post-job')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Post Better Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
} 