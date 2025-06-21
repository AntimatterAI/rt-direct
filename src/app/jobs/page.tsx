'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import PageLayout from '@/components/shared/PageLayout'
import JobMap from '@/components/JobMap'
import { supabase } from '@/lib/supabase'
import { 
  MapPin, 
  DollarSign, 
  Building, 
  Search, 
  Filter,
  ArrowRight,
  Briefcase,
  Users,
  Shield,
  Heart,
  Loader2,
  Eye
} from 'lucide-react'

interface Job {
  id: string
  title: string
  company?: string
  location: string
  salary_min?: number
  salary_max?: number
  employment_type: string
  work_type: string
  shift_type: string[]
  description: string
  requirements?: string[]
  benefits?: string[]
  posted_date?: string
  posted_at?: string
  created_at?: string
  latitude?: number
  longitude?: number
  application_count?: number
  profiles?: {
    employer_profiles?: {
      company_name: string
    }
  }
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    // Set page-specific metadata
    document.title = 'Browse Jobs - RT Direct | Radiologic Technologist Job Board'
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover radiologic technology job opportunities. Browse CT, MRI, X-ray and other imaging positions across the United States.')
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', 'Browse Jobs - RT Direct')
    
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) ogDescription.setAttribute('content', 'Discover radiologic technology job opportunities. Browse CT, MRI, X-ray and other imaging positions across the United States.')
    
    loadJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, locationFilter, typeFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!inner (
            employer_profiles!inner (
              company_name
            )
          )
        `)
        .eq('status', 'active')
        .order('posted_at', { ascending: false })

      if (error) {
        console.error('Error loading jobs:', error)
        return
      }

      const jobsWithCompany = data?.map(job => ({
        ...job,
        company: job.profiles?.employer_profiles?.company_name || 'Company Name',
        posted_date: job.posted_at || job.created_at || new Date().toISOString()
      })) || []

      setJobs(jobsWithCompany)
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
        (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    if (typeFilter) {
      filtered = filtered.filter(job =>
        job.employment_type === typeFilter || job.work_type === typeFilter
      )
    }

    setFilteredJobs(filtered)
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

  return (
    <PageLayout>
      <div className="min-h-screen">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 w-full">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Browse Opportunities
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Discover your next radiologic technology position
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4 flex-shrink-0">
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'Position' : 'Positions'}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search jobs, companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full pl-10 pr-4 h-12 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white appearance-none"
                    >
                      <option value="">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Travel">Travel</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <Button 
                    className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
                    onClick={() => {
                      setSearchTerm('')
                      setLocationFilter('')
                      setTypeFilter('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Section */}
          {showMap && (
            <Card className="mb-8 bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Job Locations</span>
                </CardTitle>
                <CardDescription>
                  Interactive map showing job locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <JobMap jobs={filteredJobs} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jobs List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading opportunities...</span>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria to find more opportunities.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setLocationFilter('')
                    setTypeFilter('')
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group w-full"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 break-words">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 font-medium truncate">{job.company || 'Company Name'}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 flex-shrink-0 self-start"
                      >
                        {job.posted_date ? getTimeAgo(job.posted_date) : 'Recently'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <div className="flex items-center space-x-2 min-w-0">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium whitespace-nowrap">
                          {formatSalary(job.salary_min, job.salary_max)}
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
                      {job.shift_type && Array.isArray(job.shift_type) && job.shift_type.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {job.shift_type.join(', ')}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {job.application_count && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{job.application_count} applied</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group-hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/jobs/${job.id}`)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredJobs.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                variant="outline"
                size="lg"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8"
              >
                Load More Opportunities
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Newsletter Signup */}
          <Card className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 border-0 text-white">
            <CardContent className="p-6 sm:p-8 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-blue-100 mb-6 text-sm sm:text-base">
                Get notified about new radiologic technology opportunities that match your preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto w-full">
                <Input 
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-100 flex-1 w-full"
                />
                <Button 
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap w-full sm:w-auto"
                >
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
} 