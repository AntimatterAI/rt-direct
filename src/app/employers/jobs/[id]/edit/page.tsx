'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Edit, Plus, X, Briefcase } from 'lucide-react'
import { getCurrentUser, getUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface JobData {
  id: string
  title: string
  location: string
  work_type: 'on-site' | 'remote' | 'hybrid'
  employment_type: 'full-time' | 'part-time' | 'contract' | 'per-diem'
  description: string
  requirements: string[]
  benefits: string[]
  status: 'active' | 'closed' | 'draft'
}

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newRequirement, setNewRequirement] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  const loadJobData = useCallback(async () => {
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

      const { data: jobData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('employer_id', user.id)
        .single()

      if (error) throw error

      const parsedJobData: JobData = {
        id: jobData.id,
        title: jobData.title || '',
        location: jobData.location || '',
        work_type: jobData.work_type || 'on-site',
        employment_type: jobData.employment_type || 'full-time',
        description: jobData.description || '',
        requirements: jobData.requirements || [],
        benefits: jobData.benefits || [],
        status: jobData.status || 'active'
      }

      setJobData(parsedJobData)
    } catch (error) {
      console.error('Error loading job:', error)
      router.push('/employers/jobs')
    } finally {
      setIsLoading(false)
    }
  }, [jobId, router])

  useEffect(() => {
    loadJobData()
  }, [loadJobData])

  const addRequirement = () => {
    if (newRequirement && jobData && !jobData.requirements.includes(newRequirement)) {
      setJobData(prev => prev ? {
        ...prev,
        requirements: [...prev.requirements, newRequirement]
      } : null)
      setNewRequirement('')
    }
  }

  const removeRequirement = (requirement: string) => {
    setJobData(prev => prev ? {
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    } : null)
  }

  const addBenefit = () => {
    if (newBenefit && jobData && !jobData.benefits.includes(newBenefit)) {
      setJobData(prev => prev ? {
        ...prev,
        benefits: [...prev.benefits, newBenefit]
      } : null)
      setNewBenefit('')
    }
  }

  const removeBenefit = (benefit: string) => {
    setJobData(prev => prev ? {
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    } : null)
  }

  async function saveJob() {
    if (!jobData) return

    if (!jobData.title.trim() || !jobData.description.trim() || !jobData.location) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: jobData.title.trim(),
          location: jobData.location,
          work_type: jobData.work_type,
          employment_type: jobData.employment_type,
          description: jobData.description.trim(),
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          status: jobData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) throw error
      router.push('/employers/jobs')
    } catch (error) {
      console.error('Error updating job:', error)
      alert('Error updating job. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Job...</h2>
        </div>
      </div>
    )
  }

  if (!jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <Button onClick={() => router.push('/employers/jobs')}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push('/employers/jobs')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Edit Job</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={jobData.status} onValueChange={(value: 'active' | 'closed' | 'draft') => setJobData(prev => prev ? {...prev, status: value} : null)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={saveJob} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Job Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={jobData.title}
                  onChange={(e) => setJobData(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={jobData.location}
                  onChange={(e) => setJobData(prev => prev ? { ...prev, location: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Work Type</Label>
                  <Select value={jobData.work_type} onValueChange={(value: 'on-site' | 'remote' | 'hybrid') => setJobData(prev => prev ? { ...prev, work_type: value } : null)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-site">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Employment Type</Label>
                  <Select value={jobData.employment_type} onValueChange={(value: 'full-time' | 'part-time' | 'contract' | 'per-diem') => setJobData(prev => prev ? { ...prev, employment_type: value } : null)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="per-diem">Per Diem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Job Description *</Label>
                <Textarea
                  value={jobData.description}
                  onChange={(e) => setJobData(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="mt-1 min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement..."
                    onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button onClick={addRequirement} type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {jobData.requirements.map((requirement, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{requirement}</span>
                      <button onClick={() => removeRequirement(requirement)} className="ml-1 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add a benefit..."
                    onKeyDown={(e) => e.key === 'Enter' && addBenefit()}
                  />
                  <Button onClick={addBenefit} type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {jobData.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1 bg-green-50 text-green-700">
                      <span>{benefit}</span>
                      <button onClick={() => removeBenefit(benefit)} className="ml-1 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
