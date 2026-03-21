// Database types for Supabase schema

export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'admin' | 'staff'
  is_active: boolean
  email_verified_at: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Scholar {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state_province: string | null
  zip_code: string | null
  country: string | null
  date_of_birth: string | null
  gender: string | null
  civil_status: string | null
  mother_name: string | null
  father_name: string | null
  monthly_family_income: number | null
  number_of_siblings: number | null
  college_name: string | null
  course_program: string | null
  year_level: string | null
  gpa: number | null
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  barangay: string | null
  municipality: string | null
  province: string | null
  application_date: string
  approval_date: string | null
  approved_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  scholar_id: string | null
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  submission_date: string
  review_date: string | null
  reviewed_by: string | null
  feedback: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  scholar_id: string | null
  document_type: string
  file_name: string
  file_url: string
  file_size: number | null
  upload_date: string
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  location: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'attended' | 'absent'
  created_at: string
}

export interface ApprovedEmail {
  id: string
  email: string
  approved_by: string | null
  approved_at: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, any> | null
  created_at: string
}

// Legacy types for compatibility during migration
export interface StudentProfile {
  fullName: string
  email: string
  contactNumber: string
  address: string
  age?: string
  barangay: string
  bio?: string
  schoolName: string
  course: string
  yearLevel: string
  studentId?: string
  isPWD?: boolean
}

export interface AdminProfile {
  name: string
  email: string
  adminRole: 'head_admin' | 'verifier_staff' | 'scanner_staff'
}
