'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Clock, DollarSign, Building } from 'lucide-react'
import { Job, WorkType, EmploymentType } from '@/types'
import { supabase } from '@/lib/supabase'

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkType | 'all'>('all')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | 'all'>('all')

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    try {
      setIsLoading(true)
      const query = supabase
        .from('jobs')
        .select(`
          *,
          employer_profiles!inner (
            company_name,
            logo_url
          )
        `)
        .eq('status', 'active')
        .order('posted_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error loading jobs:', error)
        return
      }

      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !locationFilter || 
                           job.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesWorkType = workTypeFilter === 'all' || job.work_type === workTypeFilter
    const matchesEmploymentType = employmentTypeFilter === 'all' || 
                                 job.employment_type === employmentTypeFilter

    return matchesSearch && matchesLocation && matchesWorkType && matchesEmploymentType
  })

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
  }

  const getWorkTypeColor = (workType: WorkType) => {
    switch (workType) {
      case 'remote': return 'bg-green-100 text-green-800'
      case 'hybrid': return 'bg-blue-100 text-blue-800'
      case 'on-site': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEmploymentTypeColor = (employmentType: EmploymentType) => {
    switch (employmentType) {
      case 'full-time': return 'bg-purple-100 text-purple-800'
      case 'part-time': return 'bg-orange-100 text-orange-800'
      case 'contract': return 'bg-yellow-100 text-yellow-800'
      case 'per-diem': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                RT Direct
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Radiology Jobs
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Find your next opportunity in diagnostic imaging
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Input
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          
          <Select value={workTypeFilter} onValueChange={(value: WorkType | 'all') => setWorkTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Work Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Work Types</SelectItem>
              <SelectItem value="on-site">On-site</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={employmentTypeFilter} onValueChange={(value: EmploymentType | 'all') => setEmploymentTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="per-diem">Per Diem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            {isLoading ? 'Loading...' : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading jobs...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search criteria to find more opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                 <div className="flex items-center">
                           <Building className="w-4 h-4 mr-1" />
                           {(job as Job & { employer_profiles?: { company_name: string } }).employer_profiles?.company_name || 'Company Name'}
                         </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(job.posted_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getWorkTypeColor(job.work_type)}>
                          {job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
                        </Badge>
                        <Badge className={getEmploymentTypeColor(job.employment_type)}>
                          {job.employment_type.charAt(0).toUpperCase() + job.employment_type.slice(1)}
                        </Badge>
                                                 {job.shift_type.map((shift: string) => (
                           <Badge key={shift} variant="outline">
                             {shift}
                           </Badge>
                         ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-600 font-semibold mb-2">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {job.description.length > 200 
                      ? `${job.description.substring(0, 200)}...` 
                      : job.description
                    }
                  </CardDescription>
                  {job.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                                 {job.requirements.slice(0, 3).map((req: string, index: number) => (
                           <li key={index}>{req}</li>
                         ))}
                        {job.requirements.length > 3 && (
                          <li>...and {job.requirements.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <Button 
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="w-full sm:w-auto"
                  >
                    View Details & Apply
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
} 