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
import { Stethoscope, Award, MapPin, Clock, FileText, Camera, Save, Edit, Plus } from 'lucide-react'

interface TechProfile {
  id: string
  profile_id: string
  certifications: string[]
  experience_years: number
  specializations: string[]
  preferred_shifts: string[]
  travel_radius: number
  resume_url?: string
  portfolio_url?: string
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

export default function TechProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [techProfile, setTechProfile] = useState<TechProfile | null>(null)
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

  const [professionalInfo, setProfessionalInfo] = useState({
    experience_years: 0,
    certifications: [] as string[],
    specializations: [] as string[],
    preferred_shifts: [] as string[],
    travel_radius: 50,
    resume_url: '',
    portfolio_url: ''
  })

  const [newCertification, setNewCertification] = useState('')
  const [newSpecialization, setNewSpecialization] = useState('')

  const commonCertifications = [
    'ARRT (American Registry of Radiologic Technologists)',
    'BLS (Basic Life Support)',
    'CPR Certification',
    'CT Certification',
    'MRI Certification',
    'Mammography Certification',
    'Nuclear Medicine Certification',
    'Radiation Therapy Certification'
  ]

  const commonSpecializations = [
    'Computed Tomography (CT)',
    'Magnetic Resonance Imaging (MRI)',
    'Mammography',
    'Nuclear Medicine',
    'Radiation Therapy',
    'Interventional Radiology',
    'Fluoroscopy',
    'Ultrasound',
    'Bone Densitometry',
    'Cardiovascular-Interventional Radiography'
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
      if (userProfile.role !== 'tech') {
        router.push('/dashboard')
        return
      }

      setProfile(userProfile.tech_profiles[0])
      setPersonalInfo({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        bio: userProfile.bio || ''
      })

      // Load tech profile
      const { data: techData } = await supabase
        .from('tech_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (techData) {
        setTechProfile(techData)
        setProfessionalInfo({
          experience_years: techData.experience_years || 0,
          certifications: techData.certifications || [],
          specializations: techData.specializations || [],
          preferred_shifts: techData.preferred_shifts || [],
          travel_radius: techData.travel_radius || 50,
          resume_url: techData.resume_url || '',
          portfolio_url: techData.portfolio_url || ''
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

      // Update tech profile
      if (techProfile) {
        const { error: techError } = await supabase
          .from('tech_profiles')
          .update(professionalInfo)
          .eq('profile_id', profile.id)

        if (techError) throw techError
      } else {
        // Create tech profile if it doesn't exist
        const { error: techError } = await supabase
          .from('tech_profiles')
          .insert({
            profile_id: profile.id,
            ...professionalInfo
          })

        if (techError) throw techError
      }

      setIsEditing(false)
      loadProfile() // Reload to get updated data
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addCertification = () => {
    if (newCertification && !professionalInfo.certifications.includes(newCertification)) {
      setProfessionalInfo(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }))
      setNewCertification('')
    }
  }

  const removeCertification = (cert: string) => {
    setProfessionalInfo(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }))
  }

  const addSpecialization = () => {
    if (newSpecialization && !professionalInfo.specializations.includes(newSpecialization)) {
      setProfessionalInfo(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization]
      }))
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (spec: string) => {
    setProfessionalInfo(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }))
  }

  const toggleShift = (shift: string) => {
    setProfessionalInfo(prev => ({
      ...prev,
      preferred_shifts: prev.preferred_shifts.includes(shift)
        ? prev.preferred_shifts.filter(s => s !== shift)
        : [...prev.preferred_shifts, shift]
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Profile...</h2>
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
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">My Profile</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false)
                    loadProfile()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={saveProfile} disabled={isSaving} className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  <Stethoscope className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-lg text-blue-600 mb-2">Radiologic Technologist</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{professionalInfo.experience_years} years experience</span>
                  </div>
                  {personalInfo.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{personalInfo.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Personal Information</span>
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
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
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
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell us about your experience and goals..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <span>Professional Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={professionalInfo.experience_years}
                  onChange={(e) => setProfessionalInfo(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="travel_radius">Travel Radius (miles)</Label>
                <Input
                  id="travel_radius"
                  type="number"
                  value={professionalInfo.travel_radius}
                  onChange={(e) => setProfessionalInfo(prev => ({ ...prev, travel_radius: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Resume URL</Label>
                <Input
                  value={professionalInfo.resume_url}
                  onChange={(e) => setProfessionalInfo(prev => ({ ...prev, resume_url: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Portfolio URL</Label>
                <Input
                  value={professionalInfo.portfolio_url}
                  onChange={(e) => setProfessionalInfo(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex space-x-2">
                    <Select value={newCertification} onValueChange={setNewCertification}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add certification..." />
                      </SelectTrigger>
                      <SelectContent>
                        {commonCertifications.map(cert => (
                          <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addCertification} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {professionalInfo.certifications.map(cert => (
                    <Badge 
                      key={cert} 
                      className="bg-purple-100 text-purple-800 px-3 py-1"
                    >
                      {cert}
                      {isEditing && (
                        <button 
                          onClick={() => removeCertification(cert)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <span>Specializations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex space-x-2">
                    <Select value={newSpecialization} onValueChange={setNewSpecialization}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add specialization..." />
                      </SelectTrigger>
                      <SelectContent>
                        {commonSpecializations.map(spec => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addSpecialization} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {professionalInfo.specializations.map(spec => (
                    <Badge 
                      key={spec} 
                      className="bg-blue-100 text-blue-800 px-3 py-1"
                    >
                      {spec}
                      {isEditing && (
                        <button 
                          onClick={() => removeSpecialization(spec)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferred Shifts */}
        <Card className="mt-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span>Preferred Shifts</span>
            </CardTitle>
                            <CardDescription>
                  Select the shifts you&apos;re available to work
                </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {shiftOptions.map(shift => (
                <button
                  key={shift}
                  onClick={() => isEditing && toggleShift(shift)}
                  disabled={!isEditing}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    professionalInfo.preferred_shifts.includes(shift)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300'
                  } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {shift}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 