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
import PageLayout from '@/components/shared/PageLayout'
import { Building, Shield, MapPin, Globe, FileText, Camera, Save, Edit, Plus, Briefcase, Users } from 'lucide-react'

interface EmployerProfile {
  id: string
  profile_id: string
  company_name: string
  company_size: string
  industry: string
  website?: string
  description?: string
  logo_url?: string
  verified: boolean
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
}

export default function EmployerProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  })

  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    company_size: '',
    industry: 'Healthcare',
    website: '',
    description: '',
    logo_url: ''
  })

  const companySizeOptions = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ]

  const industryOptions = [
    'Hospital',
    'Clinic',
    'Imaging Center',
    'Emergency Services',
    'Urgent Care',
    'Outpatient Surgery',
    'Mobile Imaging',
    'Teleradiology',
    'Healthcare Staffing',
    'Other Healthcare'
  ]

  useEffect(() => {
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProfile() {
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

      setProfile(userProfile.employer_profiles[0])
      setPersonalInfo({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        bio: userProfile.bio || ''
      })

      // Load employer profile
      const { data: employerData } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (employerData) {
        setEmployerProfile(employerData)
        setCompanyInfo({
          company_name: employerData.company_name || '',
          company_size: employerData.company_size || '',
          industry: employerData.industry || 'Healthcare',
          website: employerData.website || '',
          description: employerData.description || '',
          logo_url: employerData.logo_url || ''
        })
      }

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveProfile() {
    if (!profile) return

    setIsSaving(true)
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(personalInfo)
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Update employer profile
      if (employerProfile) {
        const { error: employerError } = await supabase
          .from('employer_profiles')
          .update(companyInfo)
          .eq('profile_id', profile.id)

        if (employerError) throw employerError
      } else {
        // Create employer profile if it doesn't exist
        const { error: employerError } = await supabase
          .from('employer_profiles')
          .insert({
            profile_id: profile.id,
            ...companyInfo,
            verified: false
          })

        if (employerError) throw employerError
      }

      setIsEditing(false)
      loadProfile() // Reload to get updated data
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading Profile...</h2>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="min-h-screen">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Company Profile
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your company information and hiring details
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  ← Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/employers/post-job')}
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false)
                      loadProfile()
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={saveProfile} 
                      disabled={isSaving} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
                {companyInfo.logo_url ? (
                  <img src={companyInfo.logo_url} alt="Company Logo" className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  <Building className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {companyInfo.company_name || 'Company Name'}
                  </h1>
                  {employerProfile?.verified ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Verified</span>
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending Verification
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-green-600 mb-2">Healthcare Employer</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{companyInfo.company_size}</span>
                  </div>
                  {personalInfo.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{personalInfo.location}</span>
                    </div>
                  )}
                  {companyInfo.website && (
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Change Logo</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-green-600" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={companyInfo.company_name}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, company_name: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Your Healthcare Facility"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry Type</Label>
                <Select 
                  value={companyInfo.industry} 
                  onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, industry: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry type" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company_size">Company Size</Label>
                <Select 
                  value={companyInfo.company_size} 
                  onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, company_size: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizeOptions.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="https://yourcompany.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Describe your healthcare facility, mission, and culture..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={personalInfo.first_name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={personalInfo.last_name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Business phone number"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Business Location</Label>
                <Input
                  id="location"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="City, State"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">About the Hiring Manager</Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell candidates about yourself and your role..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Status */}
        <Card className="mt-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span>Verification Status</span>
            </CardTitle>
            <CardDescription>
              Verified employers get priority in job listings and build more trust with candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employerProfile?.verified ? (
              <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Verified Employer</h3>
                  <p className="text-sm text-green-700">Your company has been verified and approved.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900">Verification Pending</h3>
                    <p className="text-sm text-yellow-700">Complete your profile to begin the verification process.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Step 1</h4>
                    <p className="text-sm text-gray-600">Complete company profile</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Building className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Step 2</h4>
                    <p className="text-sm text-gray-600">Submit verification documents</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Step 3</h4>
                    <p className="text-sm text-gray-600">Receive verification badge</p>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Start Verification Process
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/employers/post-job')}
              >
                <Plus className="w-6 h-6 text-blue-600" />
                <span>Post New Job</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/employers/jobs')}
              >
                <Briefcase className="w-6 h-6 text-green-600" />
                <span>Manage Jobs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </PageLayout>
  )
} 