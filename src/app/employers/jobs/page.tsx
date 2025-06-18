'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Edit, 
  Eye, 
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Job {
  id: string
  title: string
  location: string
  work_type: string
  employment_type: string
  salary_min?: number
  salary_max?: number
  status: 'active' | 'closed' | 'draft'
  created_at: string
  application_count: number
  pending_count: number
  approved_count: number
}

export default function EmployerJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all')

  const loadEmployerJobs = useCallback(async () => {
    try {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const userProfile = await getUserProfile()
      if (userProfile.role !== 'employer') {
        router.push('/dashboard')
        return
      }

      // Load jobs with application counts
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_applications (
            id,
            status
          )
        `)
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process jobs with application counts
      const processedJobs = jobsData?.map(job => ({
        ...job,
        application_count: job.job_applications?.length || 0,
        pending_count: job.job_applications?.filter((app: { status: string }) => app.status === 'pending').length || 0,
        approved_count: job.job_applications?.filter((app: { status: string }) => ['interview', 'hired'].includes(app.status)).length || 0
      })) || []

      setJobs(processedJobs)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const filterJobs = useCallback(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    setFilteredJobs(filtered)
  }, [jobs, searchTerm, statusFilter])

  useEffect(() => {
    loadEmployerJobs()
  }, [loadEmployerJobs])

  useEffect(() => {
    filterJobs()
  }, [filterJobs])

  async function updateJobStatus(jobId: string, newStatus: 'active' | 'closed') {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId)

      if (error) throw error

      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ))
    } catch (error) {
      console.error('Error updating job status:', error)
      alert('Error updating job status')
    }
  }

  async function deleteJob(jobId: string) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) throw error

      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Error deleting job')
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Your Jobs...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ← Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Manage Jobs</span>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/employers/post-job')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Job Postings</h1>
          <p className="text-gray-600">Manage your job listings and review applications</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'closed' | 'draft') => setStatusFilter(value)}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">{filteredJobs.length}</span>
            <span className="ml-1">job{filteredJobs.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>

        {/* Job List */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {jobs.length === 0 
                  ? 'Start by posting your first job to attract qualified radiologic technologists.' 
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {jobs.length === 0 && (
                <Button onClick={() => router.push('/employers/post-job')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl text-gray-900">{job.title}</CardTitle>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatSalary(job.salary_min, job.salary_max)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <Badge className="bg-blue-100 text-blue-800">
                          {job.employment_type}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {job.work_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-lg">{job.application_count}</span>
                        <span className="text-sm text-gray-600">applications</span>
                      </div>
                      {job.pending_count > 0 && (
                        <div className="text-xs text-orange-600 mb-1">
                          {job.pending_count} pending review
                        </div>
                      )}
                      {job.approved_count > 0 && (
                        <div className="text-xs text-green-600">
                          {job.approved_count} approved
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => router.push(`/employers/jobs/${job.id}/applications`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Users className="w-4 h-4" />
                        <span>Applications</span>
                        {job.pending_count > 0 && (
                          <Badge className="bg-orange-100 text-orange-800 ml-1">
                            {job.pending_count}
                          </Badge>
                        )}
                      </Button>

                      <Button
                        onClick={() => router.push(`/employers/jobs/${job.id}/edit`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      {job.status === 'active' ? (
                        <Button
                          onClick={() => updateJobStatus(job.id, 'closed')}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Close Job
                        </Button>
                      ) : job.status === 'closed' ? (
                        <Button
                          onClick={() => updateJobStatus(job.id, 'active')}
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          Reopen Job
                        </Button>
                      ) : null}

                      <Button
                        onClick={() => deleteJob(job.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 