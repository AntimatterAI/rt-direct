'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { Plus, Eye, Edit, Trash2, MapPin, Clock, DollarSign, Users, ArrowLeft } from 'lucide-react'

interface Job {
  id: string
  title: string
  location: string
  employment_type: string
  work_type: string
  salary_min: number
  salary_max: number
  status: string
  posted_at: string
  applications_count?: number
}

export default function EmployerJobsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Manage Jobs | RT Direct - Employer Dashboard'
    loadProfileAndJobs()
  }, [])

  async function loadProfileAndJobs() {
    try {
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

      setProfile(userProfile)

      // Load jobs posted by this employer
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          employment_type,
          work_type,
          salary_min,
          salary_max,
          status,
          posted_at
        `)
        .eq('employer_id', user.id)
        .order('posted_at', { ascending: false })

      if (jobsError) {
        console.error('Error loading jobs:', jobsError)
      } else {
        setJobs(jobsData || [])
      }

    } catch (error) {
      console.error('Error loading profile and jobs:', error)
      router.push('/auth/signin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return
    }

    setIsDeleting(jobId)
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) {
        throw error
      }

      // Remove the job from state
      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
      return `$${num.toLocaleString()}`
    }
    
    if (min === max) return formatNumber(min)
    return `${formatNumber(min)} - ${formatNumber(max)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Loading your job postings</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Manage Jobs</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => router.push('/employers/post-job')} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Post New Job</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Job Postings</h1>
          <p className="text-gray-600">
            Manage your active job postings and track applications
          </p>
        </div>

        {jobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start attracting top radiologic technologists by posting your first job opening.
              </p>
              <Button onClick={() => router.push('/employers/post-job')} className="flex items-center space-x-2 mx-auto">
                <Plus className="w-4 h-4" />
                <span>Post Your First Job</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {job.employment_type}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatSalary(job.salary_min, job.salary_max)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Posted {new Date(job.posted_at).toLocaleDateString()}
                      {job.applications_count !== undefined && (
                        <span className="ml-4">
                          {job.applications_count} applications
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={isDeleting === job.id}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {isDeleting === job.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 