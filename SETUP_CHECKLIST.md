# Complete Setup Checklist

Use this checklist to verify every step of the authentication setup is complete.

---

## ✓ Pre-Setup Verification

- [ ] Supabase project is created and accessible
- [ ] Supabase URL and keys are in environment variables
- [ ] NEXTAUTH_SECRET is set (32+ characters)
- [ ] NEXTAUTH_URL is set correctly
- [ ] Database schema (001_create_schema.sql) has been run
- [ ] `users` and `approved_emails` tables exist in Supabase
- [ ] npm packages are installed (`npm install`)

---

## ✓ Step 1: Generate Password Hash

**File:** `scripts/generate-admin-hash.js`

### Execute Script
- [ ] Open terminal in project root
- [ ] Run: `node scripts/generate-admin-hash.js`
- [ ] Script runs without errors
- [ ] Bcryptjs hash is displayed
- [ ] Hash starts with `$2a$10$` or `$2b$10$`
- [ ] Verification message shows "Hash verification successful!"

### Copy Hash
- [ ] Copy entire hash to clipboard
- [ ] Hash is not edited or modified
- [ ] Hash is in a safe place (notepad/editor)

**Example hash:**
```
$2a$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

---

## ✓ Step 2: Update SQL Script

**File:** `scripts/002_seed_admin.sql`

### Find the Placeholder
- [ ] Open `scripts/002_seed_admin.sql`
- [ ] Search for "YOUR_HASH_HERE"
- [ ] Found on line with `'$2a$10$9xh2pV.w1jUwLh4L2H5z8eOy...`
- [ ] Comment shows "⚠️ REPLACE THIS HASH!"

### Replace Hash
- [ ] Delete the placeholder hash
- [ ] Paste your generated hash
- [ ] Hash is properly formatted
- [ ] Comma is after the hash
- [ ] Line is syntactically correct

### Verify Changes
- [ ] SQL file is saved
- [ ] Line 50-52 shows your hash
- [ ] No syntax errors visible
- [ ] Rest of SQL script unchanged

---

## ✓ Step 3: Execute SQL in Supabase

**Location:** Supabase Dashboard → SQL Editor

### Open Supabase
- [ ] Go to https://app.supabase.com
- [ ] Select correct project
- [ ] Project name matches your config

### Create New Query
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click blue "New Query" button
- [ ] Editor is empty and ready

### Paste SQL Script
- [ ] Open `scripts/002_seed_admin.sql`
- [ ] Select ALL content (Ctrl+A)
- [ ] Copy content (Ctrl+C)
- [ ] Go back to Supabase SQL Editor
- [ ] Click in the editor area
- [ ] Paste content (Ctrl+V)
- [ ] Entire script visible in editor

### Run SQL
- [ ] Click "Run" button (or press Ctrl+Enter)
- [ ] "Query executed successfully" message appears
- [ ] No error messages shown
- [ ] Execution completes within 10 seconds

### Verify Output
- [ ] Output shows data was inserted
- [ ] No "duplicate key" errors
- [ ] No "column not found" errors

---

## ✓ Step 4: Verify Admin Account Created

### Check in Supabase

In the same SQL editor, run:
```sql
SELECT id, email, role, is_active FROM users WHERE email = 'admin@carmona.gov.ph';
```

- [ ] Click Run
- [ ] Exactly 1 row returned
- [ ] email = `admin@carmona.gov.ph`
- [ ] role = `admin`
- [ ] is_active = `true`
- [ ] id is a UUID (not null)

### Verify Table Structure
```sql
SELECT * FROM approved_emails LIMIT 5;
```

- [ ] Table has data
- [ ] Shows student emails
- [ ] Columns: id, email, approved_at, created_at
- [ ] No errors

---

## ✓ Step 5: Add Student Approved Emails

### Add Initial Emails

Run in Supabase SQL Editor:
```sql
INSERT INTO approved_emails (email) VALUES
  ('teststudent@example.com')
ON CONFLICT (email) DO NOTHING;
```

- [ ] Click Run
- [ ] Query executes successfully
- [ ] At least 1 email added

### Verify Addition
```sql
SELECT email FROM approved_emails ORDER BY created_at DESC LIMIT 5;
```

- [ ] New email appears in results
- [ ] Email is correctly formatted
- [ ] Can see all approved emails

### Add More Emails (Optional)
```sql
INSERT INTO approved_emails (email) VALUES
  ('student1@carmona.gov.ph'),
  ('student2@carmona.gov.ph'),
  ('student3@example.com')
ON CONFLICT (email) DO NOTHING;
```

- [ ] Multiple emails can be added at once
- [ ] All added successfully

---

## ✓ Step 6: Verify Environment Variables

### Check .env.local or deployment config

**Required variables:**
```
NEXTAUTH_SECRET=____________  (32+ chars)
NEXTAUTH_URL=________________  (your app URL)
NEXT_PUBLIC_SUPABASE_URL=_____
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=____
```

- [ ] NEXTAUTH_SECRET is set
- [ ] NEXTAUTH_SECRET is 32+ characters
- [ ] NEXTAUTH_URL is correct
- [ ] Supabase URL is set
- [ ] Supabase ANON key is set
- [ ] Supabase SERVICE key is set
- [ ] No empty values
- [ ] Variables are in correct location (.env.local or deployment settings)

---

## ✓ Step 7: Test Admin Login

### Navigate to Login Page
- [ ] App is running locally (npm run dev)
- [ ] Go to http://localhost:3000/login
- [ ] Login page loads correctly
- [ ] Email and password input fields visible
- [ ] Login button visible

### Test with Admin Credentials
- [ ] Click email field
- [ ] Type: `admin@carmona.gov.ph`
- [ ] Click password field
- [ ] Type: `Admin123`
- [ ] Click Login button
- [ ] No validation errors on form
- [ ] Request is sent to NextAuth

### Verify Success
- [ ] Redirected to `/admin/dashboard`
- [ ] NOT showing login error page
- [ ] Admin menu appears
- [ ] Can see admin-specific pages
- [ ] Session shows admin role
- [ ] Can access admin features

### Test Navigation
- [ ] Click on admin menu items
- [ ] Can navigate between admin pages
- [ ] No "unauthorized" errors
- [ ] Can see data in admin dashboards

### Logout and Reverify
- [ ] Click Logout
- [ ] Redirected to `/login`
- [ ] Session cleared
- [ ] Can login again successfully

---

## ✓ Step 8: Test Student Registration (Approved Email)

### Navigate to Registration
- [ ] Go to http://localhost:3000/register
- [ ] Registration form loads
- [ ] Form fields visible (name, email, password, etc.)

### Fill Form (With Approved Email)
- [ ] Full Name: Enter a test name
- [ ] Email: Use one from approved_emails table (e.g., teststudent@example.com)
- [ ] Password: Enter secure password (6+ chars)
- [ ] Fill other required fields
- [ ] All fields properly formatted

### Submit Registration
- [ ] Click Register button
- [ ] Form validates input
- [ ] No validation error messages
- [ ] Request sent to /api/register

### Verify Success
- [ ] Success message appears: "Registration successful"
- [ ] Redirected to `/login`
- [ ] NOT showing error page
- [ ] Email field may be pre-filled with registered email

### Test Login with New Account
- [ ] Enter registered email
- [ ] Enter registered password
- [ ] Click Login
- [ ] Redirected to `/student/dashboard`
- [ ] Student menu appears
- [ ] Can access student pages

---

## ✓ Step 9: Test Student Registration (Unapproved Email)

### Navigate to Registration
- [ ] Go to http://localhost:3000/register (if not already there)
- [ ] Form is clear/reset

### Fill Form (With Unapproved Email)
- [ ] Full Name: Enter test name
- [ ] Email: Use email NOT in approved_emails
- [ ] Password: Enter valid password
- [ ] Fill other fields

### Submit Registration
- [ ] Click Register
- [ ] Form validates
- [ ] Request sent to API

### Verify Rejection
- [ ] Error message appears
- [ ] Message says: "Email not authorized for registration"
- [ ] OR "This email is not on the approved list"
- [ ] NOT redirected to /login
- [ ] Can see full error message
- [ ] Error is user-friendly

### Verify Account NOT Created
In Supabase SQL:
```sql
SELECT * FROM users WHERE email = 'unapprovedemail@example.com';
```

- [ ] No rows returned
- [ ] Account not in database
- [ ] Cannot login with that email

---

## ✓ Step 10: Test Role-Based Routing

### Admin Accessing Student Routes
- [ ] Logout from admin
- [ ] Login as admin again
- [ ] Try to manually go to `/student/dashboard`
- [ ] Redirected to `/admin/dashboard`
- [ ] OR shown access denied message

### Student Accessing Admin Routes
- [ ] Logout
- [ ] Login with student account
- [ ] Try to manually go to `/admin/dashboard`
- [ ] Redirected to `/student/dashboard`
- [ ] OR shown access denied message

### Unauthenticated Accessing Protected Routes
- [ ] Logout
- [ ] Try to go to `/admin/dashboard`
- [ ] Redirected to `/login`
- [ ] Logout from student account
- [ ] Try to go to `/student/dashboard`
- [ ] Redirected to `/login`

---

## ✓ Step 11: Test Password Security

### Verify Hash in Database

In Supabase SQL:
```sql
SELECT password_hash FROM users WHERE email = 'admin@carmona.gov.ph';
```

- [ ] Password is hashed
- [ ] Hash starts with `$2a$10$` or `$2b$10$`
- [ ] Hash is NOT plain text "Admin123"
- [ ] Hash is long (60+ characters)
- [ ] Hash cannot be reversed to get password

### Test Wrong Password
- [ ] Go to `/login`
- [ ] Enter email: `admin@carmona.gov.ph`
- [ ] Enter wrong password (e.g., "wrongpassword")
- [ ] Click Login
- [ ] Error message: "Invalid credentials" or similar
- [ ] NOT logged in
- [ ] Remains on login page

### Test Password Case Sensitivity
- [ ] Try email with different case: `Admin@Carmona.Gov.Ph`
- [ ] Should NOT login (email is case-insensitive but system may normalize)
- [ ] OR should login if system normalized email to lowercase

---

## ✓ Step 12: Test Email Normalization

### Check Email Case Handling
- [ ] Register with email: `TestStudent@Example.COM`
- [ ] System should normalize to: `teststudent@example.com`
- [ ] Or explicitly block mixed-case in form

### Verify in Database
```sql
SELECT email FROM users ORDER BY created_at DESC LIMIT 1;
```

- [ ] Email is lowercase
- [ ] Database stores consistent format

---

## ✓ Step 13: Verify Middleware Protection

### Check Protected Routes
All these routes should require login:
- [ ] `/admin/dashboard` - redirects to login if not authenticated
- [ ] `/admin/scholars` - redirects to login if not authenticated
- [ ] `/student/dashboard` - redirects to login if not authenticated
- [ ] `/student/profile` - redirects to login if not authenticated

### Check Role Enforcement
- [ ] Admin cannot access `/student/*` routes
- [ ] Student cannot access `/admin/*` routes
- [ ] Redirects to allowed dashboard

### Check Public Routes
These should be accessible without login:
- [ ] `/` - Homepage loads
- [ ] `/login` - Login page loads
- [ ] `/register` - Register page loads

---

## ✓ Step 14: Verify Error Handling

### Test Network Error Handling
- [ ] Disconnect internet temporarily
- [ ] Try to login
- [ ] Appropriate error message shown
- [ ] Not a cryptic error

### Test Database Connection Error
- [ ] Temporarily disable Supabase (if possible)
- [ ] Try to login
- [ ] Graceful error message
- [ ] Console shows debug logs

### Test Invalid Input Handling
- [ ] Try SQL injection in email: `admin' OR '1'='1`
- [ ] Should be safely rejected
- [ ] System not vulnerable

---

## ✓ Step 15: Verify Logging

### Check Application Logs
- [ ] Console shows login attempts
- [ ] Logs include: email, status (success/fail)
- [ ] Logs include: timestamp
- [ ] Check for: `[Auth]` or `[Register]` prefixes
- [ ] No sensitive data in logs (no passwords)

### Check Database Activity (Optional)
In Supabase, check activity logs:
- [ ] User creation events visible
- [ ] Email verification attempts visible
- [ ] Password changes visible (if implemented)

---

## ✓ Step 16: Check Performance

### Verify Login Speed
- [ ] Login completes in < 3 seconds
- [ ] No timeout errors
- [ ] Response time is reasonable

### Verify Registration Speed
- [ ] Registration completes in < 5 seconds
- [ ] Hash generation doesn't block UI
- [ ] Database insert is fast

### Check for N+1 Queries
- [ ] No excessive database queries
- [ ] Single query per operation (ideally)
- [ ] No duplicate database calls

---

## ✓ Step 17: Production Checklist

### Environment Variables
- [ ] NEXTAUTH_SECRET is strong (random 32+ chars)
- [ ] NEXTAUTH_URL matches production domain
- [ ] All keys are production keys (not dev keys)
- [ ] No test keys in production

### Security Headers
- [ ] HTTPS enabled (not HTTP)
- [ ] Secure cookie flags set
- [ ] CORS headers properly configured
- [ ] X-Frame-Options set to DENY

### Database
- [ ] Regular backups configured
- [ ] RLS policies enabled
- [ ] Indexes created for performance
- [ ] Connection pooling enabled

### Monitoring
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Login attempt logging
- [ ] Failed authentication tracking
- [ ] Performance monitoring

---

## ✓ Final Verification Summary

### Admin Account
- [ ] Admin account created ✅
- [ ] Admin can login ✅
- [ ] Admin sees admin dashboard ✅
- [ ] Admin password is hashed ✅

### Student Registration
- [ ] Approved emails can register ✅
- [ ] Unapproved emails blocked ✅
- [ ] Registered students can login ✅
- [ ] Password hashing works ✅

### Security
- [ ] Role-based routing enforced ✅
- [ ] Protected routes require auth ✅
- [ ] Email approval is strict ✅
- [ ] Passwords are hashed ✅

### Overall System
- [ ] Setup complete ✅
- [ ] All tests pass ✅
- [ ] No errors in logs ✅
- [ ] Ready for production ✅

---

## 📞 Troubleshooting Quick Links

| Issue | Checklist Item | Solution |
|-------|---|---|
| Hash generation fails | Step 1 | Run `npm install bcryptjs` |
| SQL execution fails | Step 3 | Check hash replacement |
| Admin can't login | Step 7 | Verify hash and password |
| Student registration blocked | Step 8 | Check email in approved_emails |
| Wrong redirect | Step 10 | Check middleware configuration |
| Password not working | Step 11 | Verify bcryptjs hash |

---

## ✨ Completion Checklist

Mark these when complete:

- [ ] All steps 1-17 completed
- [ ] All tests passing
- [ ] No errors in console
- [ ] Documentation reviewed
- [ ] Team trained on system
- [ ] Ready to announce to users
- [ ] Monitoring configured
- [ ] Backup strategy in place

**Total items to verify: 150+**

---

## 🎉 You're Done!

When all items are checked:
✅ Authentication system is fully operational
✅ Admin account is secure
✅ Student email approval enforced
✅ Password hashing secure
✅ Role-based access working
✅ Ready for production use

Congratulations! 🚀

