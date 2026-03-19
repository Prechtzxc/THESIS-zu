# Admin Authentication Setup - Complete Summary

## 📋 What You Need To Do

You need to set up two things:
1. **Head Admin Account** with email `admin@carmona.gov.ph` and password `Admin123`
2. **Email Approval System** to control which student emails can register

---

## ✅ What's Already Done

The code is **100% ready**. All you need to do is:
1. Generate a password hash
2. Run SQL to create the admin account
3. Add student emails to the approved list
4. Test the setup

---

## 🔐 Step-by-Step Setup (5 minutes)

### Step 1: Generate Admin Password Hash (1 minute)

**Why?** Passwords must be hashed for security. We can't store plain text.

**What to do:**
```bash
# Open terminal in project root
node scripts/generate-admin-hash.js
```

**You'll see:**
```
====================================================
BTS Admin Account Hash Generator
====================================================

Email:    admin@carmona.gov.ph
Password: Admin123

Bcrypt Hash (use this in SQL):
$2a$10$abcdef1234567890abcdef1234567890abcdef...

✓ Hash verification successful!
```

**Copy this hash** → You'll need it in the next step

### Step 2: Execute SQL in Supabase (2 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query** (blue button)
5. Copy ALL the SQL from `scripts/002_seed_admin.sql`
6. Paste it into the SQL editor
7. **FIND THIS LINE:**
   ```sql
   '$2a$10$9xh2pV.w1jUwLh4L2H5z8eOyH0b7V7K3j6m9L0n5P2Q1R3S4T5U6V7W8X9Y0', -- ⚠️  REPLACE THIS HASH!
   ```
8. **REPLACE** the hash with the one you copied from Step 1
9. Click **Run** button

### Step 3: Verify Setup (1 minute)

In Supabase SQL Editor, run:

```sql
SELECT email, role, is_active FROM users WHERE email = 'admin@carmona.gov.ph';
```

You should see:
```
email: admin@carmona.gov.ph
role: admin
is_active: true
```

### Step 4: Test Admin Login (1 minute)

1. Go to your app `/login`
2. Enter:
   - Email: `admin@carmona.gov.ph`
   - Password: `Admin123`
3. Click Login
4. You should be redirected to `/admin/dashboard`
5. If you see the admin menu → **Success!** ✅

---

## 📧 Add Approved Student Emails

Students can ONLY register with emails you pre-approve.

### Option A: Via SQL (Fastest)

In Supabase SQL Editor:

```sql
INSERT INTO approved_emails (email, approved_at) VALUES
  ('student1@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student2@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student3@example.com', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
```

### Option B: Via Admin Dashboard

Once logged in as admin:
1. Go to **Admin Dashboard**
2. Click **Approved Emails**
3. Click **Add Email**
4. Enter email and click Add

---

## 🔍 How It Works

### Authentication Flow

```
User → /login
  ↓
Enters email + password
  ↓
NextAuth calls authorization function
  ↓
Queries Supabase users table
  ↓
Finds user with admin@carmona.gov.ph
  ↓
Verifies password with bcryptjs.compare()
  ↓
Checks is_active = true
  ↓
Returns user with role = 'admin'
  ↓
Creates JWT token with role
  ↓
Middleware checks role
  ↓
Routes to /admin/dashboard
```

### Registration Flow

```
Student → /register
  ↓
Enters email + password
  ↓
Form submitted to /api/register
  ↓
🔴 CHECK 1: Email must be in approved_emails table
  ↓
If NOT approved → ERROR "Email not authorized"
  ↓
If approved → Continue
  ↓
🔴 CHECK 2: Email must not already exist in users
  ↓
If exists → ERROR "Email already registered"
  ↓
If new → Continue
  ↓
🔴 CHECK 3: Password hashed with bcryptjs
  ↓
✅ User created in database with role='student'
  ↓
✅ Scholar profile created
  ↓
Student can now login
```

---

## 📁 Files Modified/Created

### New Files Created:
- ✅ `/scripts/002_seed_admin.sql` - SQL to create admin and approved emails table
- ✅ `/scripts/generate-admin-hash.js` - Hash generator script
- ✅ `/ADMIN_SETUP_GUIDE.md` - Detailed setup instructions
- ✅ `/AUTHENTICATION_CODE_REFERENCE.md` - Code reference
- ✅ `/SQL_COMMANDS_REFERENCE.md` - All SQL commands

### Files Updated:
- ✅ `/app/api/auth/[...nextauth]/route.ts` - NextAuth with role support (already done)
- ✅ `/app/api/register/route.ts` - Registration with email approval (already done)
- ✅ `/lib/supabase/db.ts` - Database functions including isEmailApproved() (already done)
- ✅ `/middleware.ts` - Role-based routing (already done)

---

## 🔐 Security Features Implemented

1. **Password Hashing**
   - ✅ Uses bcryptjs (10 rounds)
   - ✅ One-way cryptographic hashing
   - ✅ Never stored in plain text

2. **Email Approval**
   - ✅ Pre-approval stored in database
   - ✅ Registration blocked for unapproved emails
   - ✅ Strict enforcement in API

3. **Role-Based Access**
   - ✅ Admin role stored in JWT
   - ✅ Middleware enforces role routing
   - ✅ Admin pages protected

4. **Session Security**
   - ✅ JWT tokens used (stateless)
   - ✅ 30-day expiration
   - ✅ HTTPS required in production

5. **Row Level Security**
   - ✅ RLS enabled on all tables
   - ✅ Users can only see their own data
   - ✅ Admins can see approved emails

---

## 🧪 Testing Checklist

### Admin Setup
- [ ] Run `node scripts/generate-admin-hash.js`
- [ ] Copy hash to SQL script
- [ ] Execute SQL in Supabase
- [ ] Verify admin account created with `SELECT` query
- [ ] Login at `/login` with admin@carmona.gov.ph / Admin123
- [ ] See admin dashboard

### Student Registration
- [ ] Add emails to approved_emails table
- [ ] Go to `/register`
- [ ] Try registering with APPROVED email → Success ✅
- [ ] Try registering with UNAPPROVED email → Error ✅
- [ ] Login with newly created student account → Works ✅

### Role Routing
- [ ] Login as admin → Redirected to `/admin/dashboard`
- [ ] Login as student → Redirected to `/student/dashboard`
- [ ] Try accessing `/admin/*` as student → Blocked
- [ ] Try accessing `/student/*` as admin → Redirected

---

## 🚀 Quick Troubleshooting

### Admin can't login
```sql
-- Check admin exists
SELECT * FROM users WHERE email = 'admin@carmona.gov.ph';

-- Check password hash is correct (don't reveal the actual hash)
-- Instead, test in Node.js:
require('bcryptjs').compare('Admin123', 'HASH_HERE', (err, match) => {
  console.log('Match:', match); // Should be true
});
```

### Students can't register even with approved email
```sql
-- Check email is approved
SELECT * FROM approved_emails WHERE email = 'student@example.com';

-- Email case matters - system converts to lowercase
SELECT * FROM approved_emails WHERE email = lower('Student@Example.COM');
```

### NextAuth not reading role
- Check `/app/api/auth/[...nextauth]/route.ts` line 47-48 (JWT callback)
- Check `/app/api/auth/[...nextauth]/route.ts` line 56-57 (session callback)
- Verify role exists in database for user

### Hash verification fails
```bash
# Regenerate hash
node scripts/generate-admin-hash.js

# Copy new hash and update in database
UPDATE users SET password_hash = 'NEW_HASH' WHERE email = 'admin@carmona.gov.ph';
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `ADMIN_SETUP_GUIDE.md` | Detailed step-by-step setup guide |
| `AUTHENTICATION_CODE_REFERENCE.md` | All code with explanations |
| `SQL_COMMANDS_REFERENCE.md` | All SQL commands and examples |
| `scripts/002_seed_admin.sql` | SQL to run in Supabase |
| `scripts/generate-admin-hash.js` | Script to generate password hash |

---

## 🎯 Environment Variables Needed

Make sure these are set in your `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 📞 Need Help?

Check these files in order:
1. `ADMIN_SETUP_GUIDE.md` - Detailed guide with troubleshooting
2. `AUTHENTICATION_CODE_REFERENCE.md` - Code examples and flows
3. `SQL_COMMANDS_REFERENCE.md` - SQL queries and debugging

---

## ✨ What You Get After Setup

✅ **Admin Account**
- Email: admin@carmona.gov.ph
- Password: Admin123
- Role: admin
- Access: Full admin dashboard

✅ **Student Registration Control**
- Only pre-approved emails can register
- Unapproved emails blocked with clear error message
- Admin can manage approved list anytime

✅ **Secure Authentication**
- Passwords hashed with bcryptjs
- Role-based routing
- JWT sessions
- Protected admin pages

✅ **Database Integration**
- All data persists in Supabase
- No mock data
- Production-ready

---

## 🎉 Summary

You now have:
1. ✅ Complete authentication system
2. ✅ Admin account setup ready
3. ✅ Student email approval system
4. ✅ Secure password hashing
5. ✅ Role-based access control
6. ✅ Detailed documentation

**Next Step:** Run the 4-step setup above, and you're done! 🚀

