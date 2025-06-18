'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Briefcase, 
  Calendar, 
  ArrowLeft,
  Shield,
  Award,
  Users,
  Heart,
  Share2
} from 'lucide-react'
import { Job } from '@/types'

interface EmployerProfile {
  company_name: string
  company_size: string
  industry: string
  website?: string
  description?: string
  verified: boolean
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    loadJobDetails()
    loadUser()
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        // Check if user has already applied
        const { data: application } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('tech_id', currentUser.id)
          .single()

        setHasApplied(!!application)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  async function loadJobDetails() {
    try {
      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError) throw jobError
      setJob(jobData)

      // Load employer profile
      const { data: employerData } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('profile_id', jobData.employer_id)
        .single()

      if (employerData) {
        setEmployerProfile(employerData)
      }

    } catch (error) {
      console.error('Error loading job details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function applyToJob() {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    setIsApplying(true)
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          tech_id: user.id,
          status: 'pending',
          applied_at: new Date().toISOString()
        })

      if (error) throw error

      setHasApplied(true)
      alert('Application submitted successfully!')
      
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Error submitting application. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    if (max) return `Up to $${max.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Job Details...</h2>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push('/jobs')}>
            Browse All Jobs
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
              <Button variant="outline" onClick={() => router.push('/jobs')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save Job
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center space-x-4 text-lg text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Building className="w-5 h-5" />
                        <span>{employerProfile?.company_name || 'Company'}</span>
                        {employerProfile?.verified && (
                          <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>Verified</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-blue-100 text-blue-800">{job.employment_type}</Badge>
                  <Badge className="bg-green-100 text-green-800">{job.work_type}</Badge>
                </div>

                {!hasApplied ? (
                  <Button 
                    onClick={applyToJob} 
                    disabled={isApplying || job.status !== 'active'}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    size="lg"
                  >
                    {isApplying ? 'Applying...' : 'Apply Now'}
                  </Button>
                ) : (
                  <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-2 text-green-700">
                      <Award className="w-5 h-5" />
                      <span className="font-semibold">Application Submitted</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Your application has been sent to the employer
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>



            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Information */}
            {employerProfile && (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-green-600" />
                    <span>About {employerProfile?.company_name || 'Company'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{employerProfile.company_size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{employerProfile.industry}</span>
                  </div>
                  
                  {employerProfile.description && (
                    <div>
                      <Separator className="my-3" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {employerProfile.description}
                      </p>
                    </div>
                  )}

                  {employerProfile.website && (
                    <div>
                      <Separator className="my-3" />
                      <a 
                        href={employerProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit Company Website →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Shifts */}
                          {job.shift_type && job.shift_type.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span>Available Shifts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {job.shift_type.map((shift, index) => (
                      <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                        {shift}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>
    </div>
  )
} 