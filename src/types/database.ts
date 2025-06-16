export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'tech' | 'employer'
          created_at: string
          updated_at: string
          first_name?: string
          last_name?: string
          phone?: string
          location?: string
          bio?: string
          avatar_url?: string
        }
        Insert: {
          id: string
          email: string
          role: 'tech' | 'employer'
          first_name?: string
          last_name?: string
          phone?: string
          location?: string
          bio?: string
          avatar_url?: string
        }
        Update: {
          email?: string
          role?: 'tech' | 'employer'
          first_name?: string
          last_name?: string
          phone?: string
          location?: string
          bio?: string
          avatar_url?: string
        }
      }
      tech_profiles: {
        Row: {
          id: string
          profile_id: string
          certifications: string[]
          experience_years: number
          specializations: string[]
          preferred_shifts: string[]
          travel_radius: number
          resume_url?: string
          portfolio_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          certifications?: string[]
          experience_years: number
          specializations?: string[]
          preferred_shifts?: string[]
          travel_radius?: number
          resume_url?: string
          portfolio_url?: string
        }
        Update: {
          certifications?: string[]
          experience_years?: number
          specializations?: string[]
          preferred_shifts?: string[]
          travel_radius?: number
          resume_url?: string
          portfolio_url?: string
        }
      }
      employer_profiles: {
        Row: {
          id: string
          profile_id: string
          company_name: string
          company_size: string
          industry: string
          website?: string
          description?: string
          logo_url?: string
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          company_name: string
          company_size: string
          industry: string
          website?: string
          description?: string
          logo_url?: string
          verified?: boolean
        }
        Update: {
          company_name?: string
          company_size?: string
          industry?: string
          website?: string
          description?: string
          logo_url?: string
          verified?: boolean
        }
      }
      jobs: {
        Row: {
          id: string
          employer_id: string
          title: string
          company_name?: string
          description: string
          requirements: string[]
          benefits: string[]
          salary_min?: number
          salary_max?: number
          location: string
          work_type: 'on-site' | 'remote' | 'hybrid'
          employment_type: 'full-time' | 'part-time' | 'contract' | 'per-diem'
          experience_level?: string
          shifts?: string[]
          shift_type: string[]
          department?: string
          equipment?: string
          contact_email?: string
          application_deadline?: string
          experience_required: number
          posted_at: string
          expires_at?: string
          status: 'active' | 'closed' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          company_name?: string
          description: string
          requirements?: string[]
          benefits?: string[]
          salary_min?: number
          salary_max?: number
          location: string
          work_type: 'on-site' | 'remote' | 'hybrid'
          employment_type: 'full-time' | 'part-time' | 'contract' | 'per-diem'
          experience_level?: string
          shifts?: string[]
          shift_type?: string[]
          department?: string
          equipment?: string
          contact_email?: string
          application_deadline?: string
          experience_required?: number
          expires_at?: string
          status?: 'active' | 'closed' | 'draft'
        }
        Update: {
          title?: string
          description?: string
          requirements?: string[]
          benefits?: string[]
          salary_min?: number
          salary_max?: number
          location?: string
          work_type?: 'on-site' | 'remote' | 'hybrid'
          employment_type?: 'full-time' | 'part-time' | 'contract' | 'per-diem'
          shift_type?: string[]
          experience_required?: number
          expires_at?: string
          status?: 'active' | 'closed' | 'draft'
        }
      }
      job_applications: {
        Row: {
          id: string
          job_id: string
          tech_id: string
          status: 'pending' | 'reviewed' | 'interview' | 'hired' | 'rejected'
          cover_letter?: string
          applied_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          tech_id: string
          status?: 'pending' | 'reviewed' | 'interview' | 'hired' | 'rejected'
          cover_letter?: string
        }
        Update: {
          status?: 'pending' | 'reviewed' | 'interview' | 'hired' | 'rejected'
          cover_letter?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 