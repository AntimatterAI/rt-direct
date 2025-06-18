'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { geocodeAddress, getPlacesAutocomplete } from '@/lib/google-maps'
import { Briefcase, MapPin, DollarSign, Clock, Save, Plus, X, Search } from 'lucide-react'

export default function PostJobPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<{ id: string; email: string; role: string } | null>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  // Location search state
  const [locationSearch, setLocationSearch] = useState('')
  const [filteredLocations, setFilteredLocations] = useState<{ description: string; place_id: string }[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false)

  // Job form data
  const [jobData, setJobData] = useState({
    title: '',
    company_name: '',
    location: '',
    formatted_address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    work_type: 'on-site',
    employment_type: 'contract',
    experience_level: 'Mid-level',
    pay_type: 'hourly', // This will be auto-set based on employment_type
    pay_rate: '',
    pay_rate_max: '',
    duration: '',
    description: '',
    requirements: [] as string[],
    benefits: [] as string[],
    shifts: [] as string[],
    department: '',
    equipment: '',
    contact_email: '',
    start_date: '',
    application_deadline: ''
  })

  const [newRequirement, setNewRequirement] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  const workTypeOptions = [
    { value: 'on-site', label: 'On-site' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ]

  const employmentTypeOptions = [
    { value: 'contract', label: 'Contract', defaultPayType: 'hourly' },
    { value: 'per-diem', label: 'PRN/Per Diem', defaultPayType: 'daily' },
    { value: 'full-time', label: 'Full-time', defaultPayType: 'annual' },
    { value: 'part-time', label: 'Part-time', defaultPayType: 'hourly' }
  ]

  const experienceLevelOptions = ['Entry-level', 'Mid-level', 'Senior', 'Lead']

  // Comprehensive US locations database
  const usLocationsDatabase = [
    // Major cities with state abbreviations
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'San Francisco, CA', 'Columbus, OH', 'Charlotte, NC',
    'Fort Worth, TX', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
    'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK', 'Portland, OR',
    'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD', 'Milwaukee, WI',
    'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA', 'Kansas City, MO',
    'Mesa, AZ', 'Atlanta, GA', 'Omaha, NE', 'Colorado Springs, CO', 'Raleigh, NC',
    'Miami, FL', 'Virginia Beach, VA', 'Oakland, CA', 'Minneapolis, MN', 'Tulsa, OK',
    'Arlington, TX', 'New Orleans, LA', 'Wichita, KS', 'Cleveland, OH', 'Tampa, FL',
    'Bakersfield, CA', 'Aurora, CO', 'Honolulu, HI', 'Anaheim, CA', 'Santa Ana, CA',
    'Corpus Christi, TX', 'Riverside, CA', 'Lexington, KY', 'Stockton, CA', 'St. Paul, MN',
    'Cincinnati, OH', 'Anchorage, AK', 'Henderson, NV', 'Greensboro, NC', 'Plano, TX',
    'Newark, NJ', 'Lincoln, NE', 'Buffalo, NY', 'Jersey City, NJ', 'Chula Vista, CA',
    'Orlando, FL', 'Norfolk, VA', 'Chandler, AZ', 'Laredo, TX', 'Madison, WI',
    'Durham, NC', 'Lubbock, TX', 'Winston-Salem, NC', 'Garland, TX', 'Glendale, AZ',
    'Hialeah, FL', 'Reno, NV', 'Baton Rouge, LA', 'Irvine, CA', 'Chesapeake, VA',
    'Irving, TX', 'Scottsdale, AZ', 'North Las Vegas, NV', 'Fremont, CA', 'Gilbert, AZ',
    'San Bernardino, CA', 'Boise, ID', 'Birmingham, AL', 'Spokane, WA', 'Rochester, NY',
    // Add more healthcare-focused locations
    'Albany, NY', 'Richmond, VA', 'Salt Lake City, UT', 'Grand Rapids, MI', 'Huntsville, AL',
    'Mobile, AL', 'Little Rock, AR', 'Hartford, CT', 'Bridgeport, CT', 'Wilmington, DE',
    'Tallahassee, FL', 'Gainesville, FL', 'Pensacola, FL', 'Savannah, GA', 'Macon, GA',
    'Cedar Rapids, IA', 'Des Moines, IA', 'Boise, ID', 'Peoria, IL', 'Rockford, IL',
    'Evansville, IN', 'Fort Wayne, IN', 'Topeka, KS', 'Bowling Green, KY', 'Shreveport, LA',
    'Portland, ME', 'Annapolis, MD', 'Worcester, MA', 'Springfield, MA', 'Ann Arbor, MI',
    'Lansing, MI', 'Duluth, MN', 'Jackson, MS', 'Springfield, MO', 'Billings, MT',
    'Charlotte, NC', 'Fargo, ND', 'Manchester, NH', 'Trenton, NJ', 'Santa Fe, NM',
    'Syracuse, NY', 'Fayetteville, NC', 'Akron, OH', 'Youngstown, OH', 'Eugene, OR',
    'Harrisburg, PA', 'Providence, RI', 'Columbia, SC', 'Sioux Falls, SD', 'Knoxville, TN',
    'Amarillo, TX', 'Beaumont, TX', 'Burlington, VT', 'Newport News, VA', 'Spokane, WA',
    'Charleston, WV', 'Green Bay, WI', 'Casper, WY'
  ]

  const shiftOptions = [
    'Day Shift (7AM-7PM)',
    'Night Shift (7PM-7AM)', 
    'Evening (3PM-11PM)',
    'Rotating Shifts',
    'On-call',
    'PRN (As Needed)',
    'Weekend Only'
  ]

  const departmentOptions = [
    'Radiology',
    'Emergency Department',
    'Operating Room',
    'Outpatient Imaging',
    'Nuclear Medicine',
    'MRI',
    'CT',
    'Mammography',
    'Interventional Radiology',
    'Cardiac Cath Lab'
  ]

  const commonRequirements = [
    'ARRT (R) certification required',
    'State license required',
    'BLS certification required',
    'CT certification preferred',
    'MRI certification preferred',
    'Mammography certification required',
    '2+ years experience required',
    'Epic experience preferred',
    'Weekend availability required',
    'On-call availability required'
  ]

  const commonBenefits = [
    'Housing provided',
    'Travel stipend',
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    '401(k) with matching',
    'Paid Time Off',
    'Continuing Education',
    'Tuition Reimbursement',
    'Professional Development',
    'Flexible Scheduling',
    'Sign-on Bonus',
    'Completion Bonus',
    'Relocation Assistance'
  ]

  // Load Google Maps API for location search
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true)
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
      
      if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        console.warn('Google Maps API key not configured')
        return
      }

      // Check if script is already loading/loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
      if (existingScript) {
        // Script already exists, just wait for it to load
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            setIsGoogleMapsLoaded(true)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      // Set up callback function with unique name
      const callbackName = `initGoogleMapsPostJob_${Date.now()}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window[callbackName as keyof Window] = (() => {
        setIsGoogleMapsLoaded(true)
        delete window[callbackName as keyof Window] // Clean up
      }) as any

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = () => console.error('Failed to load Google Maps API')
      
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  useEffect(() => {
    loadUserProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Smart location search with Google Places API
  useEffect(() => {
    const searchLocations = async () => {
      if (locationSearch.length < 2) {
        setFilteredLocations([])
        setShowLocationDropdown(false)
        return
      }

      try {
        // Try Google Places API first if loaded
        if (isGoogleMapsLoaded) {
          const placesResults = await getPlacesAutocomplete(locationSearch, ['establishment', 'geocode'])
          
          if (placesResults.length > 0) {
            setFilteredLocations(placesResults.slice(0, 8))
            setShowLocationDropdown(true)
            return
          }
        }

        // Fallback to static database if Places API fails or not loaded
        const staticFiltered = usLocationsDatabase
          .filter(location => 
            location.toLowerCase().includes(locationSearch.toLowerCase())
          )
          .slice(0, 8)
          .map(location => ({
            description: location,
            place_id: `static_${location.replace(/\s+/g, '_')}`
          }))
        
        setFilteredLocations(staticFiltered)
        setShowLocationDropdown(true)
      } catch (error) {
        console.error('Location search error:', error)
        // Fallback to static database
        const staticFiltered = usLocationsDatabase
          .filter(location => 
            location.toLowerCase().includes(locationSearch.toLowerCase())
          )
          .slice(0, 8)
          .map(location => ({
            description: location,
            place_id: `static_${location.replace(/\s+/g, '_')}`
          }))
        
        setFilteredLocations(staticFiltered)
        setShowLocationDropdown(true)
      }
    }

    const timeoutId = setTimeout(searchLocations, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [locationSearch, isGoogleMapsLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-set pay type based on employment type
  useEffect(() => {
    const employmentOption = employmentTypeOptions.find(option => option.value === jobData.employment_type)
    if (employmentOption) {
      setJobData(prev => ({
        ...prev,
        pay_type: employmentOption.defaultPayType
      }))
    }
  }, [jobData.employment_type]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadUserProfile() {
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
      
      // Load employer profile for default company name
      const { data: employerData } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (employerData) {
        setJobData(prev => ({
          ...prev,
          company_name: employerData.company_name || '',
          contact_email: userProfile.email || ''
        }))
      }

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = async (locationData: { description: string; place_id: string }) => {
    const locationText = locationData.description
    setJobData(prev => ({ ...prev, location: locationText }))
    setLocationSearch('')
    setShowLocationDropdown(false)
    
    // Only geocode if using real Google Places result and Maps API is loaded
    if (isGoogleMapsLoaded && !locationData.place_id.startsWith('static_')) {
      setIsGeocodingLocation(true)
      try {
        const geocodeResult = await geocodeAddress(locationText)
        if (geocodeResult) {
          setJobData(prev => ({
            ...prev,
            formatted_address: geocodeResult.formatted_address,
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude
          }))
        }
      } catch (error) {
        console.error('Error geocoding location:', error)
      } finally {
        setIsGeocodingLocation(false)
      }
    }
  }

  const addRequirement = () => {
    if (newRequirement && !jobData.requirements.includes(newRequirement)) {
      setJobData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (requirement: string) => {
    setJobData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }))
  }

  const addBenefit = () => {
    if (newBenefit && !jobData.benefits.includes(newBenefit)) {
      setJobData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit]
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (benefit: string) => {
    setJobData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }))
  }

  const toggleShift = (shift: string) => {
    setJobData(prev => ({
      ...prev,
      shifts: prev.shifts.includes(shift)
        ? prev.shifts.filter(s => s !== shift)
        : [...prev.shifts, shift]
    }))
  }

  const getPayRateLabels = () => {
    switch (jobData.pay_type) {
      case 'hourly':
        return {
          min: 'Hourly Rate ($)',
          max: 'Max Hourly ($)',
          placeholder: '35.00',
          maxPlaceholder: '45.00'
        }
      case 'daily':
        return {
          min: 'Daily Rate ($)',
          max: 'Max Daily ($)',
          placeholder: '280.00',
          maxPlaceholder: '350.00'
        }
      case 'weekly':
        return {
          min: 'Weekly Rate ($)',
          max: 'Max Weekly ($)',
          placeholder: '1400.00',
          maxPlaceholder: '1750.00'
        }
      case 'annual':
        return {
          min: 'Annual Salary ($)',
          max: 'Max Salary ($)',
          placeholder: '70000',
          maxPlaceholder: '85000'
        }
      default:
        return {
          min: 'Rate ($)',
          max: 'Max Rate ($)',
          placeholder: '0.00',
          maxPlaceholder: '0.00'
        }
    }
  }

  const validateForm = () => {
    if (!jobData.title.trim()) return 'Job title is required'
    if (!jobData.description.trim()) return 'Job description is required'
    if (!jobData.location) return 'Location is required'
    
    if (jobData.pay_rate) {
      const rate = parseFloat(jobData.pay_rate)
      if (isNaN(rate) || rate <= 0) {
        return 'Please enter a valid pay rate'
      }
      
      if (jobData.pay_rate_max) {
        const maxRate = parseFloat(jobData.pay_rate_max)
        if (isNaN(maxRate) || maxRate <= 0) {
          return 'Please enter a valid maximum pay rate'
        }
        if (maxRate <= rate) {
          return 'Maximum pay rate must be higher than minimum'
        }
      }
    }
    
    return null
  }

  async function submitJob() {
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    if (!profile) {
      alert('Profile not loaded. Please refresh and try again.')
      return
    }

    setIsSubmitting(true)
    try {
      // Convert pay rates to consistent format for database storage
      let salaryMin = null
      let salaryMax = null
      
      if (jobData.pay_rate) {
        const rate = parseFloat(jobData.pay_rate)
        const maxRate = jobData.pay_rate_max ? parseFloat(jobData.pay_rate_max) : rate
        
        // Convert all rates to annual equivalent for consistent storage
        switch (jobData.pay_type) {
          case 'hourly':
            salaryMin = Math.round(rate * 40 * 52) // 40 hours/week * 52 weeks
            salaryMax = Math.round(maxRate * 40 * 52)
            break
          case 'daily':
            salaryMin = Math.round(rate * 5 * 52) // 5 days/week * 52 weeks
            salaryMax = Math.round(maxRate * 5 * 52)
            break
          case 'weekly':
            salaryMin = Math.round(rate * 52) // 52 weeks
            salaryMax = Math.round(maxRate * 52)
            break
          case 'annual':
            salaryMin = Math.round(rate)
            salaryMax = Math.round(maxRate)
            break
        }
      }

      // Map experience level to years (approximate)
      const experienceMap: { [key: string]: number } = {
        'Entry-level': 0,
        'Mid-level': 3,
        'Senior': 7,
        'Lead': 10
      }

      const jobPayload = {
        employer_id: profile.id,
        title: jobData.title.trim(),
        location: jobData.location,
        work_type: jobData.work_type,
        employment_type: jobData.employment_type,
        experience_required: experienceMap[jobData.experience_level] || 0,
        salary_min: salaryMin,
        salary_max: salaryMax,
        description: `${jobData.description.trim()}

${jobData.company_name ? `Company: ${jobData.company_name}\n` : ''}${jobData.department ? `Department: ${jobData.department}\n` : ''}${jobData.equipment ? `Equipment & Technology: ${jobData.equipment}\n` : ''}${jobData.duration ? `Duration: ${jobData.duration}\n` : ''}${jobData.start_date ? `Start Date: ${jobData.start_date}\n` : ''}${jobData.contact_email ? `Contact: ${jobData.contact_email}\n` : ''}${jobData.application_deadline ? `Application Deadline: ${jobData.application_deadline}\n` : ''}${jobData.pay_type && jobData.pay_rate ? `Pay: $${jobData.pay_rate}${jobData.pay_rate_max ? ` - $${jobData.pay_rate_max}` : ''} ${jobData.pay_type}\n` : ''}`.trim(),
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        shift_type: jobData.shifts,
        status: 'active'
      }

      console.log('Submitting job payload:', jobPayload)

      const { error } = await supabase
        .from('jobs')
        .insert(jobPayload)

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      router.push('/employers/jobs?success=Job posted successfully!')
      
    } catch (error) {
      console.error('Error posting job:', error)
      alert(`Error posting job: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    )
  }

  const payLabels = getPayRateLabels()

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
                <span className="font-semibold text-gray-900">Post New Job</span>
              </div>
            </div>
            <Button 
              onClick={submitJob} 
              disabled={isSubmitting || !jobData.title || !jobData.description}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post Job'}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Job Details */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Job Details</span>
                </CardTitle>
                <CardDescription>
                  Provide the basic information about this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={jobData.title}
                    onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Radiologic Technologist - CT Specialist"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={jobData.company_name}
                      onChange={(e) => setJobData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Your Healthcare Facility"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={jobData.department} 
                      onValueChange={(value) => setJobData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="location"
                      value={locationSearch || jobData.location}
                      onChange={(e) => {
                        setLocationSearch(e.target.value)
                                                 if (!e.target.value) {
                           setJobData(prev => ({ ...prev, location: '', formatted_address: '', latitude: null, longitude: null }))
                         }
                       }}
                       onFocus={() => setLocationSearch(jobData.location)}
                       placeholder="Search for city, state..."
                       className="pl-10"
                       disabled={isGeocodingLocation}
                     />
                     {isGeocodingLocation && (
                       <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                         <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                       </div>
                     )}
                                         {showLocationDropdown && filteredLocations.length > 0 && (
                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                         {filteredLocations.map((location, index) => (
                           <button
                             key={location.place_id || index}
                             type="button"
                             className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                             onClick={() => handleLocationSelect(location)}
                           >
                             <div className="flex items-center">
                               <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                               {location.description}
                             </div>
                           </button>
                         ))}
                       </div>
                     )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Work Type</Label>
                    <Select 
                      value={jobData.work_type} 
                      onValueChange={(value) => setJobData(prev => ({ ...prev, work_type: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypeOptions.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Employment Type</Label>
                    <Select 
                      value={jobData.employment_type} 
                      onValueChange={(value) => setJobData(prev => ({ ...prev, employment_type: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypeOptions.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Experience Level</Label>
                    <Select 
                      value={jobData.experience_level} 
                      onValueChange={(value) => setJobData(prev => ({ ...prev, experience_level: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevelOptions.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dynamic Pay Structure based on Employment Type */}
                <div>
                  <Label>
                    Pay Structure - {employmentTypeOptions.find(t => t.value === jobData.employment_type)?.label}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="pay_rate" className="text-sm">{payLabels.min}</Label>
                      <Input
                        id="pay_rate"
                        type="number"
                        min="0"
                        step={jobData.pay_type === 'annual' ? '1000' : '0.01'}
                        value={jobData.pay_rate}
                        onChange={(e) => setJobData(prev => ({ ...prev, pay_rate: e.target.value }))}
                        placeholder={payLabels.placeholder}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pay_rate_max" className="text-sm">{payLabels.max}</Label>
                      <Input
                        id="pay_rate_max"
                        type="number"
                        min="0"
                        step={jobData.pay_type === 'annual' ? '1000' : '0.01'}
                        value={jobData.pay_rate_max}
                        onChange={(e) => setJobData(prev => ({ ...prev, pay_rate_max: e.target.value }))}
                        placeholder={payLabels.maxPlaceholder}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {jobData.employment_type === 'contract' && 'Perfect for temporary assignments (1-2 weeks)'}
                    {jobData.employment_type === 'per-diem' && 'Ideal for flexible, as-needed coverage'}
                    {jobData.employment_type === 'full-time' && 'Annual salary for permanent positions'}
                    {jobData.employment_type === 'part-time' && 'Hourly rate for part-time schedules'}
                  </div>
                </div>

                {(jobData.employment_type === 'contract' || jobData.employment_type === 'per-diem') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Assignment Duration</Label>
                      <Input
                        id="duration"
                        value={jobData.duration}
                        onChange={(e) => setJobData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 2 weeks, 1 month, 13 weeks"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={jobData.start_date}
                        onChange={(e) => setJobData(prev => ({ ...prev, start_date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={jobData.description}
                    onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role, responsibilities, and what makes this position great..."
                    className="mt-1"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="equipment">Equipment & Technology</Label>
                  <Textarea
                    id="equipment"
                    value={jobData.equipment}
                    onChange={(e) => setJobData(prev => ({ ...prev, equipment: e.target.value }))}
                    placeholder="List the imaging equipment, software, and technology candidates will work with..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>
                  Add the qualifications and requirements for this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={newRequirement} onValueChange={setNewRequirement}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add requirement from common list or type below..." />
                    </SelectTrigger>
                    <SelectContent>
                      {commonRequirements.map(req => (
                        <SelectItem key={req} value={req}>{req}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addRequirement} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Or type custom requirement..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button onClick={addRequirement} size="sm">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {jobData.requirements.map(req => (
                    <Badge key={req} className="bg-blue-100 text-blue-800 px-3 py-1">
                      {req}
                      <button 
                        onClick={() => removeRequirement(req)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
                <CardDescription>
                  Highlight the benefits and perks that come with this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={newBenefit} onValueChange={setNewBenefit}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add benefit from common list or type below..." />
                    </SelectTrigger>
                    <SelectContent>
                      {commonBenefits.map(benefit => (
                        <SelectItem key={benefit} value={benefit}>{benefit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addBenefit} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Or type custom benefit..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                  />
                  <Button onClick={addBenefit} size="sm">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {jobData.benefits.map(benefit => (
                    <Badge key={benefit} className="bg-green-100 text-green-800 px-3 py-1">
                      {benefit}
                      <button 
                        onClick={() => removeBenefit(benefit)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shifts */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>Available Shifts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shiftOptions.map(shift => (
                    <button
                      key={shift}
                      onClick={() => toggleShift(shift)}
                      className={`w-full p-2 text-left rounded-lg border-2 text-sm transition-colors ${
                        jobData.shifts.includes(shift)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300'
                      }`}
                    >
                      {shift}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact & Application */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={jobData.contact_email}
                    onChange={(e) => setJobData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="hr@company.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={jobData.application_deadline}
                    onChange={(e) => setJobData(prev => ({ ...prev, application_deadline: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Job Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-semibold">{jobData.title || 'Job Title'}</div>
                <div className="text-gray-600">{jobData.company_name || 'Company Name'}</div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{jobData.location || 'Location'}</span>
                </div>
                {jobData.pay_rate && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <DollarSign className="w-3 h-3" />
                    <span>
                      ${jobData.pay_rate}{jobData.pay_rate_max ? ` - $${jobData.pay_rate_max}` : ''} {jobData.pay_type}
                    </span>
                  </div>
                )}
                {jobData.duration && (
                  <div className="text-blue-600 text-xs">
                    Duration: {jobData.duration}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">
                    {employmentTypeOptions.find(t => t.value === jobData.employment_type)?.label || jobData.employment_type}
                  </Badge>
                  <Badge variant="secondary">
                    {workTypeOptions.find(t => t.value === jobData.work_type)?.label || jobData.work_type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 