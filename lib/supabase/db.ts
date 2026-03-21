import { createServiceRoleClient, createServerSupabaseClient } from './server'
import type { User, StudentProfile } from '@/types/database'

// ==================== USER OPERATIONS ====================

export async function getUserByEmail(email: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[DB] Error fetching user:', error)
    throw error
  }

  return data
}

export async function getUserById(userId: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[DB] Error fetching user by ID:', error)
    throw error
  }

  return data
}

export async function createUser(email: string, fullName: string, role: 'student' | 'admin' | 'staff') {
  const client = await createServiceRoleClient()
  const { data, error } = await client
    .from('users')
    .insert([
      {
        email,
        full_name: fullName,
        role,
        is_active: true,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[DB] Error creating user:', error)
    throw error
  }

  return data
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('[DB] Error updating user:', error)
    throw error
  }

  return data
}

// ==================== SCHOLAR OPERATIONS ====================

export async function getAllScholars(status?: string) {
  const client = await createServerSupabaseClient()
  let query = client.from('scholars').select('*')

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('[DB] Error fetching scholars:', error)
    throw error
  }

  return data
}

export async function getScholarsByUserId(userId: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('scholars')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('[DB] Error fetching scholar by user ID:', error)
    throw error
  }

  return data
}

export async function getScholarById(scholarId: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('scholars')
    .select('*')
    .eq('id', scholarId)
    .single()

  if (error) {
    console.error('[DB] Error fetching scholar:', error)
    throw error
  }

  return data
}

export async function createScholar(userId: string, scholarData: Partial<StudentProfile>) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('scholars')
    .insert([
      {
        user_id: userId,
        first_name: scholarData.fullName?.split(' ')[0] || '',
        last_name: scholarData.fullName?.split(' ').slice(1).join(' ') || '',
        email: scholarData.email,
        phone: scholarData.contactNumber,
        address: scholarData.address,
        barangay: scholarData.barangay,
        college_name: scholarData.schoolName,
        course_program: scholarData.course,
        year_level: scholarData.yearLevel,
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[DB] Error creating scholar:', error)
    throw error
  }

  return data
}

export async function updateScholar(scholarId: string, updates: Partial<StudentProfile>) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('scholars')
    .update(updates)
    .eq('id', scholarId)
    .select()
    .single()

  if (error) {
    console.error('[DB] Error updating scholar:', error)
    throw error
  }

  return data
}

export async function approveScholar(scholarId: string, adminId: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('scholars')
    .update({
      status: 'approved',
      approval_date: new Date().toISOString(),
      approved_by: adminId,
    })
    .eq('id', scholarId)
    .select()
    .single()

  if (error) {
    console.error('[DB] Error approving scholar:', error)
    throw error
  }

  return data
}

export async function rejectScholar(scholarId: string, adminId: string, notes?: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('scholars')
    .update({
      status: 'rejected',
      approval_date: new Date().toISOString(),
      approved_by: adminId,
      notes,
    })
    .eq('id', scholarId)
    .select()
    .single()

  if (error) {
    console.error('[DB] Error rejecting scholar:', error)
    throw error
  }

  return data
}

// ==================== APPLICATION OPERATIONS ====================

export async function getAllApplications(status?: string) {
  const client = await createServerSupabaseClient()
  let query = client.from('applications').select(`
    *,
    users!applications_user_id_fkey (id, email, full_name),
    scholars!applications_scholar_id_fkey (id, first_name, last_name)
  `)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('submission_date', { ascending: false })

  if (error) {
    console.error('[DB] Error fetching applications:', error)
    throw error
  }

  return data
}

export async function getApplicationsByUserId(userId: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('applications')
    .select(`
      *,
      scholars!applications_scholar_id_fkey (id, first_name, last_name)
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('[DB] Error fetching user applications:', error)
    throw error
  }

  return data
}

export async function createApplication(userId: string, scholarId?: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('applications')
    .insert([
      {
        user_id: userId,
        scholar_id: scholarId,
        status: 'submitted',
        submission_date: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[DB] Error creating application:', error)
    throw error
  }

  return data
}

export async function updateApplicationStatus(applicationId: string, status: string, feedback?: string, reviewerId?: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('applications')
    .update({
      status,
      feedback,
      reviewed_by: reviewerId,
      review_date: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .select()
    .single()

  if (error) {
    console.error('[DB] Error updating application:', error)
    throw error
  }

  return data
}

// ==================== DOCUMENT OPERATIONS ====================

export async function getDocumentsByUserId(userId: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false })

  if (error) {
    console.error('[DB] Error fetching documents:', error)
    throw error
  }

  return data
}

export async function getDocumentsByScholarId(scholarId: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('scholar_id', scholarId)
    .order('upload_date', { ascending: false })

  if (error) {
    console.error('[DB] Error fetching scholar documents:', error)
    throw error
  }

  return data
}

export async function createDocument(
  userId: string,
  scholarId: string | null,
  documentType: string,
  fileName: string,
  fileUrl: string,
  fileSize?: number
) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('documents')
    .insert([
      {
        user_id: userId,
        scholar_id: scholarId,
        document_type: documentType,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[DB] Error creating document:', error)
    throw error
  }

  return data
}

export async function deleteDocument(documentId: string) {
  const client = await createServerSupabaseClient()
  const { error } = await client.from('documents').delete().eq('id', documentId)

  if (error) {
    console.error('[DB] Error deleting document:', error)
    throw error
  }

  return true
}

export async function updateDocumentStatus(documentId: string, status: 'pending' | 'verified' | 'rejected') {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('documents')
    .update({ status })
    .eq('id', documentId)
    .select()
    .single()

  if (error) {
    console.error('[DB] Error updating document:', error)
    throw error
  }

  return data
}

// ==================== EVENT OPERATIONS ====================

export async function getAllEvents() {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('events')
    .select(`
      *,
      users!events_created_by_fkey (id, full_name, email)
    `)
    .order('event_date', { ascending: true })

  if (error) {
    console.error('[DB] Error fetching events:', error)
    throw error
  }

  return data
}

export async function createEvent(
  title: string,
  description: string,
  eventDate: string,
  location: string,
  createdBy: string
) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('events')
    .insert([
      {
        title,
        description,
        event_date: eventDate,
        location,
        created_by: createdBy,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[DB] Error creating event:', error)
    throw error
  }

  return data
}

// ==================== APPROVED EMAILS OPERATIONS ====================

export async function getAllApprovedEmails() {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('approved_emails')
    .select('*')
    .order('approved_at', { ascending: false })

  if (error) {
    console.error('[DB] Error fetching approved emails:', error)
    throw error
  }

  return data
}

export async function isEmailApproved(email: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('approved_emails')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[DB] Error checking email approval:', error)
    throw error
  }

  return !!data
}

export async function addApprovedEmail(email: string, approvedBy: string) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client
    .from('approved_emails')
    .insert([
      {
        email,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('[DB] Error adding approved email:', error)
    throw error
  }

  return data
}

export async function removeApprovedEmail(emailId: string) {
  const client = await createServerSupabaseClient()
  const { error } = await client.from('approved_emails').delete().eq('id', emailId)

  if (error) {
    console.error('[DB] Error removing approved email:', error)
    throw error
  }

  return true
}
