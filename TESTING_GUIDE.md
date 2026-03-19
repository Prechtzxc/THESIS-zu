# Testing Guide for Supabase Migration

## End-to-End Testing Scenarios

### Scenario 1: User Registration
**Goal:** Verify user registration flow with Supabase

**Steps:**
1. Navigate to `/register`
2. Email must be in `approved_emails` table
3. Fill all required fields:
   - Full Name
   - Email
   - Password (min 8 characters)
   - Contact Number
   - Address
   - Barangay
   - School Name
   - Course
   - Year Level
4. Click Submit

**Expected Result:**
- Success message displayed
- User created in Supabase `users` table
- Scholar profile created in `scholars` table
- Automatic redirect to login page
- Application created in `applications` table

**Verify in Supabase:**
```sql
SELECT * FROM public.users WHERE email = 'test@example.com';
SELECT * FROM public.scholars WHERE email = 'test@example.com';
SELECT * FROM public.applications WHERE email = 'test@example.com';
```

### Scenario 2: User Login
**Goal:** Verify authentication with Supabase and NextAuth

**Steps:**
1. Navigate to `/login`
2. Enter registered email and password
3. Click Sign In

**Expected Result:**
- Successful authentication
- Redirect based on role:
  - Student → `/student/dashboard`
  - Admin → `/admin/dashboard`
- Session cookie set
- User info available in context

**Browser Console Check:**
```javascript
// In browser console after login
const response = await fetch('/api/auth/session');
const session = await response.json();
console.log(session);
```

### Scenario 3: Admin Scholar Approval
**Goal:** Verify admin can approve scholar applications

**Steps (as Admin):**
1. Navigate to `/admin/scholars`
2. Search or filter for a scholar
3. Click "View Profile"
4. Look for approve/reject buttons
5. Click Approve

**Expected Result:**
- Scholar status updated to "approved" in Supabase
- `approval_date` timestamp set
- `approved_by` field contains admin user ID
- UI reflects status change

**Verify in Supabase:**
```sql
SELECT id, first_name, last_name, status, approval_date, approved_by 
FROM public.scholars 
WHERE status = 'approved';
```

### Scenario 4: Document Upload
**Goal:** Verify document upload and Supabase persistence

**Steps (as Student):**
1. Navigate to `/student/documents`
2. Click "Upload Document"
3. Select a PDF or image file (max 5MB)
4. Choose document type
5. Click Upload

**Expected Result:**
- File uploaded to Vercel Blob (private access)
- Document record created in Supabase `documents` table
- UI shows uploaded document with metadata
- Status shows "pending"

**Verify in Supabase:**
```sql
SELECT id, file_name, document_type, status, upload_date 
FROM public.documents 
WHERE user_id = 'your-user-id';
```

### Scenario 5: Approved Emails Management
**Goal:** Verify email approval workflow

**Steps (as Admin):**
1. Navigate to `/admin/approved-emails`
2. Click "Add Email"
3. Enter an email address
4. Click Submit

**Expected Result:**
- Email added to `approved_emails` table
- Can be used for registration
- Shows in the approved emails list
- Can be removed

**Verify in Supabase:**
```sql
SELECT * FROM public.approved_emails 
WHERE approved_at > NOW() - INTERVAL '1 day';
```

### Scenario 6: Application Status Workflow
**Goal:** Verify complete application status tracking

**Steps:**
1. Register as student (creates pending application)
2. Login as admin
3. Go to `/admin/applications`
4. Update application status
5. Add feedback

**Expected Result:**
- Application status changes in Supabase
- Feedback stored in `feedback` field
- `review_date` timestamp set
- `reviewed_by` field contains admin ID
- Student sees updated status

**Verify in Supabase:**
```sql
SELECT * FROM public.applications 
WHERE status IN ('submitted', 'under_review', 'approved', 'rejected')
ORDER BY submission_date DESC;
```

### Scenario 7: Role-Based Access Control
**Goal:** Verify middleware protects routes by role

**Steps:**
1. Login as student
2. Try to access `/admin/dashboard`
3. Logout
4. Try to access `/student/dashboard` without login

**Expected Result:**
- Student redirected to `/student/dashboard` from admin
- Unauthenticated users redirected to `/login`
- Permission denied messages shown appropriately

## Database Validation Tests

### Test RLS Policies
```sql
-- Verify RLS is enabled on critical tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Expected: users, scholars, applications, documents, etc.
```

### Test Indexes
```sql
-- Check all indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should see indexes on: email, role, user_id, status, etc.
```

### Test Foreign Keys
```sql
-- Verify referential integrity
SELECT constraint_name, table_name, column_name
FROM information_schema.constraint_column_usage
WHERE table_name IN ('scholars', 'applications', 'documents')
ORDER BY table_name;
```

## API Endpoint Testing

### Test Scholar Approval Endpoint
```bash
curl -X POST http://localhost:3000/api/scholars/approve \
  -H "Content-Type: application/json" \
  -b "next-auth.session-token=your_session_token" \
  -d '{"scholarId": "uuid-here"}'
```

### Test Document Upload Endpoint
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -b "next-auth.session-token=your_session_token" \
  -F "file=@document.pdf" \
  -F "documentType=requirement"
```

### Test Approved Email Endpoint
```bash
curl -X POST http://localhost:3000/api/approved-emails/add \
  -H "Content-Type: application/json" \
  -b "next-auth.session-token=your_session_token" \
  -d '{"email": "newstudent@example.com"}'
```

## Performance Tests

### Load Test Scholars List
1. As admin, go to `/admin/scholars`
2. Measure load time with DevTools (Network tab)
3. Expected: < 2 seconds with 100+ records

### Query Performance
Check Supabase query analyzer:
```sql
EXPLAIN ANALYZE
SELECT s.*, u.email, u.full_name
FROM public.scholars s
JOIN public.users u ON s.user_id = u.id
WHERE s.status = 'pending'
ORDER BY s.created_at DESC
LIMIT 50;
```

## Security Tests

### Test Password Hashing
```javascript
// Verify bcrypt hashing
const bcrypt = require('bcryptjs');
const hash = '$2a$10$...'; // from database
const isValid = await bcrypt.compare('password', hash);
console.log('Password valid:', isValid);
```

### Test Session Token
```javascript
// Check token includes role
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(sessionToken);
console.log('Token claims:', decoded);
```

### Test RLS in Action
Try to access another user's data:
```sql
-- This should return no results (assuming row security)
SET ROLE authenticated;
SET request.jwt.claims = '{"sub":"different-uuid"}';

SELECT * FROM public.users WHERE id = 'your-uuid';
```

## Cleanup & Reset

### Reset Test Database
```sql
-- Delete all data (careful in production!)
DELETE FROM public.documents;
DELETE FROM public.applications;
DELETE FROM public.scholars;
DELETE FROM public.users;
DELETE FROM public.approved_emails;

-- Reset sequences if needed
ALTER SEQUENCE schema_name.table_id_seq RESTART WITH 1;
```

### Clear NextAuth Sessions (Browser)
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

## Common Issues & Solutions

### Session Not Persisting
**Problem:** User logged in but session lost on page refresh

**Solution:**
1. Check NEXTAUTH_SECRET is set
2. Clear cookies and try again
3. Verify database connection in logs
4. Check Supabase is accessible

### Documents Not Uploading
**Problem:** Upload endpoint returns 401 or 500

**Solution:**
1. Verify authentication session is active
2. Check file size < 5MB
3. Verify BLOB_READ_WRITE_TOKEN if using Vercel Blob
4. Check documents table exists in Supabase

### RLS Recursion Errors
**Problem:** "infinite recursion detected" in logs

**Solution:**
1. Check RLS policies don't reference `auth.uid()` in joins
2. Ensure service role bypasses work for admin operations
3. Review policy definitions in Supabase

### Slow Queries
**Problem:** Pages load slowly

**Solution:**
1. Check indexes are created (see Database Validation Tests)
2. Review query in Supabase Analytics
3. Consider adding composite indexes for common filters
4. Check row count isn't excessive for table scans

## Monitoring Queries

### Monitor Active Connections
```sql
SELECT datname, usename, state, count(*)
FROM pg_stat_activity
GROUP BY datname, usename, state;
```

### Check Cache Hit Ratio
```sql
SELECT
  sum(heap_blks_read) as heap_read, sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

### Monitor Table Growth
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Reporting Issues

When issues occur, collect:
1. Error message and stack trace
2. Browser console logs
3. Network tab (HAR file)
4. Supabase logs (if available)
5. Database state (relevant tables)
6. Steps to reproduce

Create issue with template:
```markdown
**Scenario:** [Describe the test scenario]
**Expected:** [What should happen]
**Actual:** [What happened instead]
**Error:** [Error message/code]
**Database State:** [SQL queries showing data state]
**Logs:** [Application logs]
```
