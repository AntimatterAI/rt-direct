'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Eye,
  Check,
  X,
  Clock,
  Award,
  Briefcase,
  ExternalLink
} from 'lucide-react'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Application {
  id: string
  status: 'pending' | 'reviewed' | 'interview' | 'hired' | 'rejected'
  cover_letter?: string
  applied_at: string
  updated_at: string
  tech_profiles: {
    profile_id: string
    certifications: string[]
    experience_years: number
    specializations: string[]
    preferred_shifts: string[]
    resume_url?: string
    portfolio_url?: string
  }
  profiles: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    phone?: string
    location?: string
    bio?: string
    avatar_url?: string
  }
}

interface Job {
  id: string
  title: string
  location: string
  employment_type: string
  work_type: string
}

export default function JobApplicationsPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const loadJobAndApplications = useCallback(async () => {
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

      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('id, title, location, employment_type, work_type')
        .eq('id', jobId)
        .eq('employer_id', user.id)
        .single()

      if (jobError) throw jobError
      setJob(jobData)

      // Load applications with tech profiles and user profiles
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          *,
          tech_profiles!inner (
            profile_id,
            certifications,
            experience_years,
            specializations,
            preferred_shifts,
            resume_url,
            portfolio_url
          ),
          profiles!inner (
            id,
            email,
            first_name,
            last_name,
            phone,
            location,
            bio,
            avatar_url
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false })

      if (applicationsError) throw applicationsError
      setApplications(applicationsData || [])

    } catch (error) {
      console.error('Error loading applications:', error)
      router.push('/employers/jobs')
    } finally {
      setIsLoading(false)
    }
  }, [jobId, router])

  const filterApplications = useCallback(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications)
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter))
    }
  }, [applications, statusFilter])

  useEffect(() => {
    loadJobAndApplications()
  }, [loadJobAndApplications])

  useEffect(() => {
    filterApplications()
  }, [filterApplications])

  async function updateApplicationStatus(applicationId: string, newStatus: 'reviewed' | 'interview' | 'hired' | 'rejected') {
    try {
      setIsUpdating(applicationId)
      
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app
      ))

    } catch (error) {
      console.error('Error updating application status:', error)
      alert('Error updating application status')
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'interview': return 'bg-purple-100 text-purple-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Applications...</h2>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Button onClick={() => router.push('/employers/jobs')}>
            Back to Jobs
          </Button>
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
              <Button variant="outline" onClick={() => router.push('/employers/jobs')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Applications</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Info */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription className="flex items-center space-x-4 text-base">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </div>
              <Badge className="bg-blue-100 text-blue-800">{job.employment_type}</Badge>
              <Badge className="bg-green-100 text-green-800">{job.work_type}</Badge>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications ({applications.length})</SelectItem>
                <SelectItem value="pending">
                  Pending ({applications.filter(app => app.status === 'pending').length})
                </SelectItem>
                <SelectItem value="reviewed">
                  Reviewed ({applications.filter(app => app.status === 'reviewed').length})
                </SelectItem>
                <SelectItem value="interview">
                  Interview ({applications.filter(app => app.status === 'interview').length})
                </SelectItem>
                <SelectItem value="hired">
                  Hired ({applications.filter(app => app.status === 'hired').length})
                </SelectItem>
                <SelectItem value="rejected">
                  Rejected ({applications.filter(app => app.status === 'rejected').length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No applications match your filter'}
              </h3>
              <p className="text-gray-600">
                {applications.length === 0 
                  ? 'Applications will appear here as candidates apply to your job posting.' 
                  : 'Try selecting a different status filter to see more applications.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {application.profiles.first_name?.[0] || application.profiles.email[0].toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {application.profiles.first_name && application.profiles.last_name 
                            ? `${application.profiles.first_name} ${application.profiles.last_name}`
                            : application.profiles.email
                          }
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {application.profiles.email}
                    </div>
                    {application.profiles.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {application.profiles.phone}
                      </div>
                    )}
                    {application.profiles.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {application.profiles.location}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Experience & Skills */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Award className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">{application.tech_profiles.experience_years} years experience</span>
                    </div>
                    
                    {application.tech_profiles.certifications.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {application.tech_profiles.certifications.slice(0, 3).map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                          {application.tech_profiles.certifications.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.tech_profiles.certifications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {application.tech_profiles.specializations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Specializations:</p>
                        <div className="flex flex-wrap gap-1">
                          {application.tech_profiles.specializations.slice(0, 2).map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                              {spec}
                            </Badge>
                          ))}
                          {application.tech_profiles.specializations.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              +{application.tech_profiles.specializations.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Application Info */}
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center mb-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Applied {formatDate(application.applied_at)}
                    </div>
                    {application.updated_at !== application.applied_at && (
                      <div>Updated {formatDate(application.updated_at)}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {/* Document Links */}
                    <div className="flex space-x-2">
                      {application.tech_profiles.resume_url && (
                        <Button
                          onClick={() => window.open(application.tech_profiles.resume_url, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Resume</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      {application.tech_profiles.portfolio_url && (
                        <Button
                          onClick={() => window.open(application.tech_profiles.portfolio_url, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>Portfolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    {/* Status Actions */}
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                          disabled={isUpdating === application.id}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Mark Reviewed
                        </Button>
                        <Button
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          disabled={isUpdating === application.id}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {application.status === 'reviewed' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateApplicationStatus(application.id, 'interview')}
                          disabled={isUpdating === application.id}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-purple-600 hover:text-purple-700"
                        >
                          <User className="w-4 h-4 mr-1" />
                          Interview
                        </Button>
                        <Button
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          disabled={isUpdating === application.id}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {application.status === 'interview' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateApplicationStatus(application.id, 'hired')}
                          disabled={isUpdating === application.id}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Hire
                        </Button>
                        <Button
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          disabled={isUpdating === application.id}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {application.cover_letter && (
                      <Button
                        onClick={() => setSelectedApplication(selectedApplication?.id === application.id ? null : application)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {selectedApplication?.id === application.id ? 'Hide' : 'View'} Cover Letter
                      </Button>
                    )}

                    {/* Show Cover Letter */}
                    {selectedApplication?.id === application.id && application.cover_letter && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
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