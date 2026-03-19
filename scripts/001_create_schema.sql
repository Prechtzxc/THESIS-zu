-- BTS Scholarship System - Database Schema
-- Execute this entire script in your Supabase SQL Editor

-- =====================================================
-- 1. USERS TABLE - Application user profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'admin', 'staff')),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. SCHOLARS TABLE - Student scholar records
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scholars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state_province VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(50),
  civil_status VARCHAR(50),
  mother_name VARCHAR(255),
  father_name VARCHAR(255),
  monthly_family_income NUMERIC(15, 2),
  number_of_siblings INTEGER,
  college_name VARCHAR(255),
  course_program VARCHAR(255),
  year_level VARCHAR(50),
  gpa NUMERIC(3, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  barangay VARCHAR(255),
  municipality VARCHAR(255),
  province VARCHAR(255),
  application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approval_date TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. APPLICATIONS TABLE - Scholarship applications
-- =====================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scholar_id UUID REFERENCES public.scholars(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  application_year INTEGER NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  review_date TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  feedback TEXT,
  scholarship_type VARCHAR(100),
  scholarship_amount NUMERIC(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. DOCUMENTS TABLE - Uploaded documents
-- =====================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scholar_id UUID REFERENCES public.scholars(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_date TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. VERIFICATION SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.verification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id UUID NOT NULL REFERENCES public.scholars(id) ON DELETE CASCADE,
  schedule_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. FINANCIAL DISTRIBUTION SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_distribution_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id UUID NOT NULL REFERENCES public.scholars(id) ON DELETE CASCADE,
  barangay VARCHAR(255) NOT NULL,
  distribution_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'distributed', 'cancelled')),
  distributed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. CLAIMED FINANCIAL AID TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.claimed_financial_aid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id UUID NOT NULL REFERENCES public.scholars(id) ON DELETE CASCADE,
  distribution_schedule_id UUID REFERENCES public.financial_distribution_schedules(id) ON DELETE CASCADE,
  amount_claimed NUMERIC(15, 2) NOT NULL,
  claim_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  proof_of_claim TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. PRE-APPROVED EMAILS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pre_approved_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. APPLICATION HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  change_reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. ACTIVITY LOGS TABLE - Audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 11. EVENTS TABLE - Scheduling events
-- =====================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(100),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. EVENT ATTENDEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'absent')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_scholars_user_id ON public.scholars(user_id);
CREATE INDEX idx_scholars_status ON public.scholars(status);
CREATE INDEX idx_scholars_barangay ON public.scholars(barangay);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_scholar_id ON public.documents(scholar_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_verification_schedules_scholar_id ON public.verification_schedules(scholar_id);
CREATE INDEX idx_financial_distributions_scholar_id ON public.financial_distribution_schedules(scholar_id);
CREATE INDEX idx_financial_distributions_barangay ON public.financial_distribution_schedules(barangay);
CREATE INDEX idx_pre_approved_emails_email ON public.pre_approved_emails(email);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_distribution_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claimed_financial_aid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_approved_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - USERS TABLE
-- =====================================================
-- Users can view their own profile
CREATE POLICY "Users view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES - SCHOLARS TABLE
-- =====================================================
-- Students can view their own scholar profile
CREATE POLICY "Students view own scholar" ON public.scholars
  FOR SELECT USING (user_id = auth.uid());

-- Admins and staff can view all scholars
CREATE POLICY "Admins view all scholars" ON public.scholars
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Students can create their own scholar profile
CREATE POLICY "Students create own scholar" ON public.scholars
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Students can update their own scholar profile
CREATE POLICY "Students update own scholar" ON public.scholars
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can update scholar status
CREATE POLICY "Admins update scholar status" ON public.scholars
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES - APPLICATIONS TABLE
-- =====================================================
-- Students can view their own applications
CREATE POLICY "Students view own applications" ON public.applications
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all applications
CREATE POLICY "Admins view all applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Students can create applications
CREATE POLICY "Students create applications" ON public.applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can update applications
CREATE POLICY "Admins update applications" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES - DOCUMENTS TABLE
-- =====================================================
-- Students can view their own documents
CREATE POLICY "Students view own documents" ON public.documents
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all documents
CREATE POLICY "Admins view all documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Students can upload documents
CREATE POLICY "Students upload documents" ON public.documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can verify documents
CREATE POLICY "Admins verify documents" ON public.documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES - VERIFICATION SCHEDULES
-- =====================================================
-- Students can view their own verification schedules
CREATE POLICY "Students view own schedules" ON public.verification_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scholars
      WHERE id = scholar_id AND user_id = auth.uid()
    )
  );

-- Admins can manage verification schedules
CREATE POLICY "Admins manage schedules" ON public.verification_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- =====================================================
-- RLS POLICIES - FINANCIAL DISTRIBUTION SCHEDULES
-- =====================================================
-- Students can view their own distribution schedules
CREATE POLICY "Students view own distributions" ON public.financial_distribution_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scholars
      WHERE id = scholar_id AND user_id = auth.uid()
    )
  );

-- Admins can manage distribution schedules
CREATE POLICY "Admins manage distributions" ON public.financial_distribution_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- =====================================================
-- RLS POLICIES - CLAIMED FINANCIAL AID
-- =====================================================
-- Students can view their own claimed aid
CREATE POLICY "Students view own claimed aid" ON public.claimed_financial_aid
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scholars
      WHERE id = scholar_id AND user_id = auth.uid()
    )
  );

-- Students can claim financial aid
CREATE POLICY "Students claim aid" ON public.claimed_financial_aid
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scholars
      WHERE id = scholar_id AND user_id = auth.uid()
    )
  );

-- Admins can view all claimed aid
CREATE POLICY "Admins view all claimed aid" ON public.claimed_financial_aid
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- =====================================================
-- RLS POLICIES - PRE-APPROVED EMAILS
-- =====================================================
-- Anyone can view pre-approved emails (for registration)
CREATE POLICY "Anyone view pre-approved emails" ON public.pre_approved_emails
  FOR SELECT USING (TRUE);

-- Admins can manage pre-approved emails
CREATE POLICY "Admins manage pre-approved emails" ON public.pre_approved_emails
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES - ACTIVITY LOGS
-- =====================================================
-- Users can view their own logs
CREATE POLICY "Users view own logs" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins view all logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can create logs
CREATE POLICY "System creates logs" ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES - EVENTS & EVENT ATTENDEES
-- =====================================================
-- Anyone can view events
CREATE POLICY "Anyone view events" ON public.events
  FOR SELECT USING (TRUE);

-- Admins can create events
CREATE POLICY "Admins create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Admins can update events
CREATE POLICY "Admins update events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Anyone can view event attendees
CREATE POLICY "Anyone view attendees" ON public.event_attendees
  FOR SELECT USING (TRUE);

-- Users can register for events
CREATE POLICY "Users register for events" ON public.event_attendees
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- APPLICATION HISTORY RLS
-- =====================================================
-- Users can view application history for their applications
CREATE POLICY "Users view own history" ON public.application_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Admins can view all history
CREATE POLICY "Admins view all history" ON public.application_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FIX FOR CLAIMED FINANCIAL AID TABLE
-- =====================================================
-- Note: There was a syntax error in the table creation (AMOUNT CLAIMED).
-- Execute this to fix it:
ALTER TABLE IF EXISTS public.claimed_financial_aid
DROP COLUMN IF EXISTS amount_claimed;

ALTER TABLE IF EXISTS public.claimed_financial_aid
ADD COLUMN IF NOT EXISTS amount_claimed NUMERIC(15, 2) NOT NULL;
