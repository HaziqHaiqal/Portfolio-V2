import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface Profile {
  id: string
  full_name: string
  display_name: string
  title?: string
  subtitle?: string
  bio?: string
  location?: string
  phone?: string
  email?: string
  profile_image_url?: string
  resume_url?: string
  linkedin_url?: string
  github_url?: string
  website_url?: string
  status?: string
  response_time?: string
  years_coding?: number
  projects_count?: number
  lines_of_code?: string
  coffee_consumed?: string
  created_at?: string
  updated_at?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  company_logo_url?: string
  start_date: string
  end_date?: string
  is_current: boolean
  location?: string
  description?: string
  responsibilities?: string[]
  technologies?: string[]
  achievements?: string[]
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field_of_study?: string
  specialization?: string
  minor_subject?: string
  start_date: string
  end_date?: string
  is_current: boolean
  gpa?: number
  grade?: string
  location?: string
  description?: string
  achievements?: string[]
  activities?: string[]
  institution_logo_url?: string
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface Skill {
  id: string
  name: string
  category: string
  proficiency_level: number
  proficiency_percentage: number
  icon_emoji?: string
  color_from?: string
  color_to?: string
  years_experience?: number
  is_featured: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  title: string
  description: string
  long_description?: string
  category: string
  status: string
  start_date?: string
  end_date?: string
  year: number
  featured: boolean
  project_url?: string
  github_url?: string
  demo_url?: string
  primary_tech?: string
  tech_stack?: string[]
  commits_count?: string
  team_size?: string
  duration?: string
  features?: string[]
  challenges_solved?: string[]
  gradient_from?: string
  gradient_to?: string
  thumbnail_url?: string
  sort_order: number
  created_at?: string
  updated_at?: string
  images?: ProjectImage[]
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  alt_text?: string
  caption?: string
  is_primary: boolean
  sort_order: number
  created_at?: string
}

export interface Interest {
  id: string
  name: string
  description?: string
  icon_emoji?: string
  category?: string
  proficiency_level?: string
  years_involved?: number
  is_featured: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
} 