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
import { Briefcase, MapPin, DollarSign, Clock, Save, Plus, X } from 'lucide-react'

export default function PostJobPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<{ id: string; email: string; role: string } | null>(null)

  // Job form data
  const [jobData, setJobData] = useState({
    title: '',
    company_name: '',
    location: '',
    work_type: 'on-site', // on-site, remote, hybrid
    employment_type: 'contract', // contract, full-time, part-time, per-diem
    experience_level: 'Mid-level', // Entry-level, Mid-level, Senior, Lead
    pay_type: 'hourly', // hourly, daily, weekly, annual
    pay_rate: '',
    pay_rate_max: '',
    duration: '', // For contract work (e.g., "2 weeks", "1 month")
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
    { value: 'contract', label: 'Contract' },
    { value: 'per-diem', label: 'PRN/Per Diem' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' }
  ]
  const experienceLevelOptions = ['Entry-level', 'Mid-level', 'Senior', 'Lead']
  const payTypeOptions = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'daily', label: 'Daily Rate' },
    { value: 'weekly', label: 'Weekly Rate' },
    { value: 'annual', label: 'Annual Salary' }
  ]

  const usLocations = [
    'Atlanta, GA', 'Austin, TX', 'Boston, MA', 'Charlotte, NC', 'Chicago, IL',
    'Dallas, TX', 'Denver, CO', 'Houston, TX', 'Jacksonville, FL', 'Las Vegas, NV',
    'Los Angeles, CA', 'Miami, FL', 'Nashville, TN', 'New York, NY', 'Orlando, FL',
    'Philadelphia, PA', 'Phoenix, AZ', 'Portland, OR', 'San Antonio, TX', 'San Diego, CA',
    'San Francisco, CA', 'Seattle, WA', 'Tampa, FL', 'Washington, DC',
    'Birmingham, AL', 'Little Rock, AR', 'Tucson, AZ', 'Sacramento, CA',
    'Colorado Springs, CO', 'Hartford, CT', 'Wilmington, DE', 'Tallahassee, FL',
    'Columbus, GA', 'Honolulu, HI', 'Boise, ID', 'Springfield, IL', 'Indianapolis, IN',
    'Des Moines, IA', 'Wichita, KS', 'Louisville, KY', 'New Orleans, LA',
    'Portland, ME', 'Baltimore, MD', 'Worcester, MA', 'Detroit, MI', 'Minneapolis, MN',
    'Jackson, MS', 'Kansas City, MO', 'Billings, MT', 'Omaha, NE', 'Reno, NV',
    'Manchester, NH', 'Newark, NJ', 'Albuquerque, NM', 'Buffalo, NY', 'Charlotte, NC',
    'Fargo, ND', 'Cleveland, OH', 'Oklahoma City, OK', 'Portland, OR', 'Pittsburgh, PA',
    'Providence, RI', 'Columbia, SC', 'Sioux Falls, SD', 'Memphis, TN', 'El Paso, TX',
    'Salt Lake City, UT', 'Burlington, VT', 'Virginia Beach, VA', 'Spokane, WA',
    'Charleston, WV', 'Milwaukee, WI', 'Cheyenne, WY'
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

  useEffect(() => {
    loadUserProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const getPayRateLabel = () => {
    switch (jobData.pay_type) {
      case 'hourly': return 'Hourly Rate ($)'
      case 'daily': return 'Daily Rate ($)'
      case 'weekly': return 'Weekly Rate ($)'
      case 'annual': return 'Annual Salary ($)'
      default: return 'Pay Rate ($)'
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

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select 
                    value={jobData.location} 
                    onValueChange={(value) => setJobData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {usLocations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                <div>
                  <Label>Pay Structure</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="pay_type" className="text-sm">Pay Type</Label>
                      <Select 
                        value={jobData.pay_type} 
                        onValueChange={(value) => setJobData(prev => ({ ...prev, pay_type: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {payTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pay_rate" className="text-sm">{getPayRateLabel()}</Label>
                      <Input
                        id="pay_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={jobData.pay_rate}
                        onChange={(e) => setJobData(prev => ({ ...prev, pay_rate: e.target.value }))}
                        placeholder={jobData.pay_type === 'hourly' ? '35.00' : jobData.pay_type === 'daily' ? '280.00' : jobData.pay_type === 'weekly' ? '1400.00' : '70000'}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pay_rate_max" className="text-sm">Max Rate (Optional)</Label>
                      <Input
                        id="pay_rate_max"
                        type="number"
                        min="0"
                        step="0.01"
                        value={jobData.pay_rate_max}
                        onChange={(e) => setJobData(prev => ({ ...prev, pay_rate_max: e.target.value }))}
                        placeholder={jobData.pay_type === 'hourly' ? '45.00' : jobData.pay_type === 'daily' ? '350.00' : jobData.pay_type === 'weekly' ? '1750.00' : '85000'}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

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