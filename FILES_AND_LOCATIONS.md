# Complete File Reference & Locations

## 📂 All Modified and New Files

### Scripts (To Run)
```
scripts/
├── generate-admin-hash.js          ← RUN THIS FIRST to generate password hash
└── 002_seed_admin.sql              ← RUN THIS IN SUPABASE (after updating hash)
```

### Application Code (Updated)
```
app/api/auth/
└── [...nextauth]/
    └── route.ts                     ← NextAuth configuration (UPDATED ✅)

app/api/
└── register/
    └── route.ts                     ← Registration API (UPDATED ✅)

lib/supabase/
├── client.ts                        ← Browser Supabase client (ALREADY DONE)
├── server.ts                        ← Server Supabase client (ALREADY DONE)
└── db.ts                            ← Database functions (UPDATED ✅)
                                      - Line 469: isEmailApproved()
                                      - Line 485: addApprovedEmail()
                                      - Line 500: removeApprovedEmail()

middleware.ts                         ← Route protection (ALREADY DONE)
```

### Documentation (New)
```
docs/
├── ADMIN_AUTH_SETUP_SUMMARY.md      ← START HERE (Quick 5-min setup)
├── ADMIN_SETUP_GUIDE.md             ← Detailed guide with troubleshooting
├── AUTHENTICATION_CODE_REFERENCE.md ← All code with explanations
├── SQL_COMMANDS_REFERENCE.md        ← All SQL commands
└── FILES_AND_LOCATIONS.md           ← This file
```

---

## 🎯 Quick Links to Key Code

### NextAuth Configuration
**File:** `/app/api/auth/[...nextauth]/route.ts`

**Key sections:**
- **Lines 6-46:** CredentialsProvider setup
- **Line 28:** User lookup query
- **Line 39:** bcryptjs password verification
- **Line 47-53:** JWT callback (stores role in token)
- **Line 54-61:** Session callback (stores role in session)
- **Line 63-71:** Auth options (pages, session strategy, secret)

**Critical code:**
```typescript
// Line 39: Password verification
const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash || "")

// Line 49: Store role in JWT
token.role = user.role

// Line 56: Store role in session
session.user.role = token.role as string
```

---

### Registration API
**File:** `/app/api/register/route.ts`

**Key sections:**
- **Lines 1-4:** Imports (bcryptjs, Supabase)
- **Line 27:** Email approval check (STRICT)
- **Line 62:** Email format validation
- **Line 71:** Password strength validation
- **Line 85:** Hash password with bcryptjs
- **Lines 92-100:** Create user in Supabase
- **Line 115:** Create scholar profile

**Critical code:**
```typescript
// Line 27: Strict email approval check
const emailApproved = await isEmailApproved(email.toLowerCase())
if (!emailApproved) {
  return NextResponse.json(
    { success: false, error: "Email not authorized for registration" },
    { status: 403 }
  )
}

// Line 85: Hash password
const hashedPassword = await bcrypt.hash(password, 10)

// Lines 92-100: Insert into database
const { data: newUser } = await supabase
  .from("users")
  .insert([{
    email: email.toLowerCase(),
    password_hash: hashedPassword,
    role: "student",
    is_active: true
  }])
```

---

### Email Approval Functions
**File:** `/lib/supabase/db.ts`

**Function locations:**
```typescript
// Line 469: Check if email is approved
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

// Line 485: Add email to approval list
export async function addApprovedEmail(email: string, approvedBy: string) {
  // Implementation...
}

// Line 500: Remove email from approval list
export async function removeApprovedEmail(email: string) {
  // Implementation...
}
```

---

## 🗄️ Database Tables

### users Table
**Location:** Created by `/scripts/001_create_schema.sql`

**Key columns:**
```
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
full_name       VARCHAR(255)
role            VARCHAR(50) [student|admin|staff]
is_active       BOOLEAN DEFAULT true
email_verified_at TIMESTAMP
created_at      TIMESTAMP
updated_at      TIMESTAMP
last_login      TIMESTAMP
```

### approved_emails Table
**Location:** Created by `/scripts/002_seed_admin.sql`

**Key columns:**
```
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
approved_by     UUID REFERENCES users(id)
approved_at     TIMESTAMP
created_at      TIMESTAMP
```

---

## 🚀 Setup Process (Files to Run In Order)

### 1. Generate Hash
**File:** `scripts/generate-admin-hash.js`
```bash
node scripts/generate-admin-hash.js
```
**Output:** Bcryptjs hash for password Admin123

### 2. Update SQL Script
**File:** `scripts/002_seed_admin.sql`
- Find line with `YOUR_HASH_HERE`
- Replace with hash from Step 1

### 3. Run SQL in Supabase
**File:** `scripts/002_seed_admin.sql`
- Copy ALL content
- Paste in Supabase SQL Editor
- Click Run

### 4. Verify Setup
**File:** None (manual check)
- Run verification SQL in Supabase
- Test login at /login

---

## 📖 Reading Order for Documentation

1. **START HERE:** `ADMIN_AUTH_SETUP_SUMMARY.md`
   - Quick overview (5 minutes to understand)
   - Step-by-step setup (4 steps)
   - Testing checklist

2. **DETAILED GUIDE:** `ADMIN_SETUP_GUIDE.md`
   - In-depth explanation
   - Security details
   - Troubleshooting section
   - Useful SQL queries

3. **CODE REFERENCE:** `AUTHENTICATION_CODE_REFERENCE.md`
   - Full code with comments
   - Explains every line
   - Admin flow diagram
   - Student registration flow diagram

4. **SQL REFERENCE:** `SQL_COMMANDS_REFERENCE.md`
   - All SQL commands
   - Common operations
   - Verification queries
   - Backup/restore

5. **THIS FILE:** `FILES_AND_LOCATIONS.md`
   - File structure
   - Quick links to code
   - Table definitions
   - Setup order

---

## 🔍 Finding Specific Code

### Admin Login Logic
**File:** `/app/api/auth/[...nextauth]/route.ts`
**Lines:** 20-56

### Student Registration Blocking
**File:** `/app/api/register/route.ts`
**Lines:** 27-50

### Email Approval Check
**File:** `/lib/supabase/db.ts`
**Lines:** 469-483

### Password Hashing
**File:** `/app/api/register/route.ts` (Line 85)
OR `/app/api/auth/[...nextauth]/route.ts` (Line 39)

### JWT Token Creation
**File:** `/app/api/auth/[...nextauth]/route.ts`
**Lines:** 47-53

### Session Creation
**File:** `/app/api/auth/[...nextauth]/route.ts`
**Lines:** 54-61

### Route Protection
**File:** `/middleware.ts`
**Lines:** 1-43

---

## 🗝️ Key Variables

### In NextAuth Route
```typescript
credentials.email        // User's email from login form
credentials.password     // User's password from login form
user.password_hash       // Hashed password from database
user.role                // User's role [admin|student|staff]
token.role               // Role stored in JWT
session.user.role        // Role available in session
```

### In Registration API
```typescript
email                    // Student's email (must be pre-approved)
password                 // Student's password (gets hashed)
fullName                 // Student's full name
hashedPassword          // Result of bcryptjs.hash()
emailApproved           // Result of isEmailApproved() check
```

### In Database Functions
```typescript
approved_emails table   // Stores emails allowed to register
users.role             // Column: [admin|student|staff]
users.is_active        // Column: user account active status
users.password_hash    // Column: bcryptjs hashed password
```

---

## 🔐 Security Features by File

### `/app/api/auth/[...nextauth]/route.ts`
- ✅ bcryptjs password verification (Line 39)
- ✅ Role-based JWT (Line 49)
- ✅ is_active check (Line 34)
- ✅ NEXTAUTH_SECRET required (Line 43)

### `/app/api/register/route.ts`
- ✅ Email approval check (Line 27)
- ✅ Email format validation (Line 62)
- ✅ Password strength check (Line 71)
- ✅ bcryptjs hashing (Line 85)
- ✅ Duplicate email check (Line 93)

### `/middleware.ts`
- ✅ Authentication required for protected routes
- ✅ Role-based route protection
- ✅ Admin/staff routes protected
- ✅ Student routes protected

### `/lib/supabase/db.ts`
- ✅ isEmailApproved() check before registration
- ✅ addApprovedEmail() for admin management
- ✅ removeApprovedEmail() for admin management
- ✅ All queries use parameterized queries (no SQL injection)

---

## 🧪 Test File Examples

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carmona.gov.ph","password":"Admin123"}'
```

### Test Student Registration (Approved)
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@approved.com","password":"Pass123","course":"CS"}'
```

### Test Student Registration (Unapproved)
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane Doe","email":"jane@unapproved.com","password":"Pass123"}'
# Returns: 403 "Email not authorized for registration"
```

---

## 📊 Data Flow Diagram

```
User Login/Register
        ↓
NextAuth/API Route
        ↓
Database Query
        ↓
Validation Check
  ├─ Email exists?
  ├─ Email approved?
  ├─ Password valid?
  └─ Active?
        ↓
Create JWT Token
        ↓
Create Session
        ↓
Middleware Routing
        ↓
Redirect to Dashboard
```

---

## 🎯 Summary

- **Hash Generator:** `scripts/generate-admin-hash.js`
- **SQL Script:** `scripts/002_seed_admin.sql`
- **Auth Code:** `/app/api/auth/[...nextauth]/route.ts`
- **Register Code:** `/app/api/register/route.ts`
- **DB Functions:** `/lib/supabase/db.ts`
- **Documentation:** Start with `ADMIN_AUTH_SETUP_SUMMARY.md`

Everything is ready. Just run the setup! 🚀

