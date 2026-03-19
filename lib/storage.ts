// Storage utility - DEPRECATED IN FAVOR OF SUPABASE
// This file now re-exports from database and types modules for backward compatibility

export type AdminRole = "head_admin" | "verifier_staff" | "scanner_staff"

// Permissions for each admin role
export const ADMIN_PERMISSIONS: Record<AdminRole, string[]> = {
  head_admin: [
    "dashboard", "scholars", "applications", "approved-emails", 
    "verification", "reports", "scheduling", "staff-management", "settings"
  ],
  verifier_staff: [
    "dashboard", "scholars", "applications", "verification"
  ],
  scanner_staff: [
    "dashboard", "verification"
  ],
}

// Legacy type exports for backward compatibility
export type User = {
  id: string
  name: string
  email: string
  password: string
  role: "student" | "admin"
  adminRole?: AdminRole
  profileData?: any
  isPWD?: boolean
  studentProfile?: any
  profilePicture?: string
}

export type StudentProfile = {
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

export type AdminProfile = {
  fullName: string
  email: string
  contactNumber: string
  position: string
  department: string
  bio?: string
}

export type Application = {
  id: string
  studentId: string
  fullName: string
  email: string
  course: string
  yearLevel: string
  school: string
  barangay: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  submittedAt: string
  feedback?: string
  isPWD?: boolean
}

export type Document = {
  id: string
  studentId: string
  name: string
  type: string
  status: "pending" | "approved" | "rejected"
  uploadedAt: string
  reviewedAt?: string
  feedback?: string
  fileSize: string
  semester: string
  academicYear: string
  url?: string
}

export type Notification = {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "announcement"
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export type PreApprovedEmail = {
  id: string
  email: string
  fullName?: string
  notes?: string
  status: "available" | "used"
  addedBy: string
  addedAt: string
  isUsed: boolean
  usedAt?: string
  usedBy?: string
}

export type VerificationSchedule = {
  id: string
  barangay: string
  startDate: string
  endDate: string
  dailyLimit?: number
  status: "active" | "ended" | "upcoming"
  createdAt: string
  createdBy: string
  updatedAt: string
}

export type FinancialDistributionSchedule = {
  id: string
  barangays: string[]
  startDate: string
  endDate: string
  startTime: string
  distributionAmount: number
  status: "active" | "ended" | "upcoming"
  createdAt: string
  createdBy: string
  updatedAt: string
}

// Helper function for permission checking
export function hasPermission(user: User | any, permission: string): boolean {
  if (!user || user.role !== "admin") return false
  
  const adminRole = user.adminRole || "head_admin"
  const permissions = ADMIN_PERMISSIONS[adminRole as AdminRole] || []
  
  return permissions.includes(permission)
}

// Note: All actual data operations are now handled by Supabase through lib/supabase/db.ts
// Remove any calls to functions like getUsers(), createApplication(), etc. from this file
// and replace them with async calls to the corresponding functions in lib/supabase/db.ts
