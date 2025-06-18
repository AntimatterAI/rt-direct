'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Search,
  Calendar,
  MapPin,
  Building,
  Eye,
  Clock,
  Check,
  X,
  User,
  Briefcase,
  FileText,
  Filter
} from 'lucide-react'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Application {
  id: string
  status: 'pending' | 'reviewed' | 'interview' | 'hired' | 'rejected'
  cover_letter?: string
  applied_at: string
  updated_at: string
  jobs: {
    id: string
    title: string
    location: string
    employment_type: string
    work_type: string
    salary_min?: number
    salary_max?: number
    status: string
    profiles: {
      employer_profiles: {
        company_name: string
        verified: boolean
      }[]
    }
  }
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const userProfile = await getUserProfile()
      if (userProfile.role !== 'tech') {
        router.push('/dashboard')
        return
      }

      // Load user's applications with job details
      const { data: applicationsData, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            location,
            employment_type,
            work_type,
            salary_min,
            salary_max,
            status,
            employer_id,
            profiles!inner (
              employer_profiles!inner (
                company_name,
                verified
              )
            )
          )
        `)
        .eq('tech_id', user.id)
        .order('applied_at', { ascending: false })

      if (error) throw error
      setApplications(applicationsData || [])

    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const filterApplications = useCallback(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.jobs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs.profiles.employer_profiles[0]?.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  useEffect(() => {
    filterApplications()
  }, [filterApplications])

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
      case 'pending': return <Clock className="w-4 h-4" />
      case 'reviewed': return <Eye className="w-4 h-4" />
      case 'interview': return <User className="w-4 h-4" />
      case 'hired': return <Check className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Your application is under review'
      case 'reviewed': return 'Application has been reviewed'
      case 'interview': return 'You&apos;ve been selected for an interview!'
      case 'hired': return 'Congratulations! You&apos;ve been hired!'
      case 'rejected': return 'Application was not selected'
      default: return 'Application status unknown'
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getApplicationStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      interview: applications.filter(app => app.status === 'interview').length,
      hired: applications.filter(app => app.status === 'hired').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    }
    return stats
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Your Applications...</h2>
        </div>
      </div>
    )
  }

  const stats = getApplicationStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">My Applications</span>
              </div>
            </div>
            <Button onClick={() => router.push('/jobs')}>
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header & Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Job Applications</h1>
          <p className="text-gray-600 mb-6">Track the status of all your job applications</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
                <div className="text-sm text-gray-600">Reviewed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.interview}</div>
                <div className="text-sm text-gray-600">Interview</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
                <div className="text-sm text-gray-600">Hired</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications ({applications.length})</SelectItem>
              <SelectItem value="pending">Pending ({stats.pending})</SelectItem>
              <SelectItem value="reviewed">Reviewed ({stats.reviewed})</SelectItem>
              <SelectItem value="interview">Interview ({stats.interview})</SelectItem>
              <SelectItem value="hired">Hired ({stats.hired})</SelectItem>
              <SelectItem value="rejected">Rejected ({stats.rejected})</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">{filteredApplications.length}</span>
            <span className="ml-1">application{filteredApplications.length !== 1 ? 's' : ''} shown</span>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No applications match your filter'}
              </h3>
              <p className="text-gray-600 mb-4">
                {applications.length === 0 
                  ? 'Start applying to jobs to see your applications here.' 
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {applications.length === 0 && (
                <Button onClick={() => router.push('/jobs')}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl text-gray-900">
                          {application.jobs.title}
                        </CardTitle>
                        <Badge className={`${getStatusColor(application.status)} border`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {application.jobs.profiles.employer_profiles[0]?.company_name || 'Unknown Company'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {application.jobs.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied {formatDate(application.applied_at)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <Badge className="bg-blue-100 text-blue-800">
                          {application.jobs.employment_type}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {application.jobs.work_type}
                        </Badge>
                        {application.jobs.status !== 'active' && (
                          <Badge className="bg-gray-100 text-gray-800">
                            Job {application.jobs.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {formatSalary(application.jobs.salary_min, application.jobs.salary_max)}
                      </div>
                      {application.updated_at !== application.applied_at && (
                        <div className="text-xs text-gray-500">
                          Updated {formatDate(application.updated_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Status Message */}
                    <div className={`p-3 rounded-lg border ${getStatusColor(application.status).replace('text-', 'bg-').replace('800', '50').replace('border-', 'border-')}`}>
                      <p className="text-sm font-medium">
                        {getStatusMessage(application.status)}
                      </p>
                    </div>

                    {/* Cover Letter Preview */}
                    {application.cover_letter && (
                      <div>
                        <Separator className="mb-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Your cover letter:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-3">
                            {application.cover_letter.length > 200 
                              ? `${application.cover_letter.substring(0, 200)}...`
                              : application.cover_letter
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2">
                      <Button
                        onClick={() => router.push(`/jobs/${application.jobs.id}`)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Job</span>
                      </Button>

                      <div className="text-xs text-gray-500">
                        Application ID: {application.id.substring(0, 8)}...
                      </div>
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