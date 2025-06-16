export type { Database } from './database'
import type { Database } from './database'

// Utility types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type TechProfile = Database['public']['Tables']['tech_profiles']['Row'] 
export type EmployerProfile = Database['public']['Tables']['employer_profiles']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type JobApplication = Database['public']['Tables']['job_applications']['Row']

export type UserRole = 'tech' | 'employer'
export type JobStatus = 'active' | 'closed' | 'draft'
export type ApplicationStatus = 'pending' | 'reviewed' | 'interview' | 'hired' | 'rejected'
export type WorkType = 'on-site' | 'remote' | 'hybrid'
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'per-diem'

// Form types
export interface SignUpFormData {
  email: string
  password: string
  role: UserRole
  firstName: string
  lastName: string
}

export interface SignInFormData {
  email: string
  password: string
}

export interface JobFormData {
  title: string
  description: string
  requirements: string[]
  benefits: string[]
  salaryMin?: number
  salaryMax?: number
  location: string
  workType: WorkType
  employmentType: EmploymentType
  shiftType: string[]
  experienceRequired: number
  expiresAt?: string
} 