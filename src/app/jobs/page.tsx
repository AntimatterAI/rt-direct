'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Clock, DollarSign, Building, Map as MapIcon, Briefcase } from 'lucide-react'
import { Job, WorkType, EmploymentType } from '@/types'
import { supabase } from '@/lib/supabase'
import JobMap from '@/components/JobMap'

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkType | 'all'>('all')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | 'all'>('all')
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Set page title for SEO
    document.title = 'Browse Jobs | RT Direct - Radiology Technologist Positions'
    
    loadJobs()
  }, [])

  async function loadJobs() {
    try {
      setIsLoading(true)
      const query = supabase
        .from('jobs')
        .select(`
          *,
          profiles!inner (
            employer_profiles!inner (
              company_name,
              logo_url
            )
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



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                RT Direct
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="text-sm sm:text-base px-3 sm:px-4"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Radiology Jobs
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
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

        {/* Job Listings with Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-lg text-gray-600">Loading jobs...</div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search criteria to find more opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card 
                    key={job.id}
                    data-job-id={job.id}
                    className={`hover:shadow-lg transition-all cursor-pointer bg-white/70 backdrop-blur-sm border-0 shadow-md ${
                      selectedJobId === job.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    onMouseEnter={() => setSelectedJobId(job.id)}
                    onMouseLeave={() => setSelectedJobId(undefined)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 text-gray-900 hover:text-blue-600 transition-colors">
                            {job.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              {(job as Job & { profiles?: { employer_profiles?: { company_name: string } } }).profiles?.employer_profiles?.company_name || 'Company Name'}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(job.created_at || job.posted_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-blue-100 text-blue-800">
                              {job.employment_type}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              {job.work_type}
                            </Badge>
                            {job.shift_type && job.shift_type.slice(0, 2).map((shift: string) => (
                              <Badge key={shift} variant="outline" className="text-xs">
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
                      <CardDescription className="text-base mb-4 text-gray-700">
                        {job.description.length > 150 
                          ? `${job.description.substring(0, 150)}...` 
                          : job.description
                        }
                      </CardDescription>
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 text-gray-900">Key Requirements:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {job.requirements.slice(0, 2).map((req: string, index: number) => (
                              <li key={index}>{req}</li>
                            ))}
                            {job.requirements.length > 2 && (
                              <li className="text-blue-600">...and {job.requirements.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/jobs/${job.id}`)
                          }}
                          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        >
                          View Details & Apply
                        </Button>
                        <div className="text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {job.employment_type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Map Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapIcon className="w-5 h-5 text-blue-600" />
                    <span>Job Locations</span>
                  </CardTitle>
                  <CardDescription>
                    Explore opportunities by location
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <JobMap 
                    jobs={filteredJobs.map(job => ({
                      id: job.id,
                      title: job.title,
                      company_name: (job as Job & { profiles?: { employer_profiles?: { company_name: string } } }).profiles?.employer_profiles?.company_name,
                      location: job.location,
                      employment_type: job.employment_type,
                      work_type: job.work_type,
                      salary_min: job.salary_min,
                      salary_max: job.salary_max
                    }))}
                    selectedJobId={selectedJobId}
                    onJobSelect={(job) => {
                      setSelectedJobId(job.id)
                      // Scroll to the job card
                      const jobCard = document.querySelector(`[data-job-id="${job.id}"]`)
                      if (jobCard) {
                        jobCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 