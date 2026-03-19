# Visual Setup Flowchart & Diagrams

## 🎯 Setup Process Flow

```
START
  ↓
[1] Run: node scripts/generate-admin-hash.js
  ↓
[2] Copy hash output
  ↓
[3] Open scripts/002_seed_admin.sql
  ↓
[4] Replace YOUR_HASH_HERE with copied hash
  ↓
[5] Go to Supabase Dashboard
  ↓
[6] SQL Editor → New Query
  ↓
[7] Paste entire 002_seed_admin.sql content
  ↓
[8] Click RUN
  ↓
[9] Verify: Admin account created
  ↓
[10] Add student emails to approved_emails
  ↓
[11] Test at /login with admin credentials
  ↓
SUCCESS ✅
```

---

## 🔐 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  User enters email + password at /login                          │
│  Form submits to NextAuth                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  NextAuth CredentialsProvider.authorize()                        │
│  (File: /app/api/auth/[...nextauth]/route.ts)                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Query Supabase users table:                                     │
│  SELECT * FROM users WHERE email = ?                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
            USER FOUND          USER NOT FOUND
                    │                │
                    ↓                ↓
              Continue         REJECT LOGIN ✗
                    │
                    ↓
        ┌───────────────────────────┐
        │ Check is_active = true    │
        └───────────────────────────┘
                    │
            ┌───────┴────────┐
            ↓                ↓
        ACTIVE            INACTIVE
            │                │
            ↓                ↓
      Continue         REJECT LOGIN ✗
            │
            ↓
   ┌────────────────────────────┐
   │ Verify password with       │
   │ bcryptjs.compare()         │
   │ Compare(form_password,     │
   │         db_hash)           │
   └────────────────────────────┘
            │
    ┌───────┴──────────┐
    ↓                  ↓
MATCH              NO MATCH
    │                  │
    ↓                  ↓
Continue         REJECT LOGIN ✗
    │
    ↓
┌──────────────────────────────────────┐
│ Extract user role from database      │
│ user.role = 'admin' or 'student'     │
└──────────────────────────────────────┘
    │
    ↓
┌──────────────────────────────────────┐
│ Create JWT Token with role:          │
│ token = sign({                       │
│   sub: user.id,                      │
│   email: user.email,                 │
│   role: user.role  ← CRITICAL        │
│ })                                   │
└──────────────────────────────────────┘
    │
    ↓
┌──────────────────────────────────────┐
│ Create Session with role:            │
│ session.user.role = token.role       │
└──────────────────────────────────────┘
    │
    ↓
┌──────────────────────────────────────┐
│ Middleware reads role from session   │
│ Checks if admin OR student           │
└──────────────────────────────────────┘
    │
    ├─────────────────┬────────────────┐
    ↓                 ↓                ↓
  ADMIN            STUDENT         UNKNOWN
    │                 │                │
    ↓                 ↓                ↓
Redirect to      Redirect to      REJECT ✗
/admin/          /student/
dashboard        dashboard
    │                 │
    ↓                 ↓
  SUCCESS ✅       SUCCESS ✅
```

---

## 📧 Student Registration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT REGISTRATION                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  User fills /register form:                                      │
│  - Full Name                                                     │
│  - Email                                                         │
│  - Password                                                      │
│  - Other fields                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Form submits to POST /api/register                              │
│  (File: /app/api/register/route.ts)                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┴──────────────────┐
         │   VALIDATION CHECKS (in order)      │
         └──────────────────┬──────────────────┘
                            ↓
    ┌────────────────────────────────────────┐
    │ CHECK 1: Required Fields Present?      │
    │ - fullName, email, password            │
    └────────────────────────────────────────┘
            │
    ┌───────┴──────────┐
    ↓                  ↓
  YES                 NO
    │                  │
    ↓                  ↓
Continue         ERROR 400
    │              (Missing fields)
    ↓
    ┌────────────────────────────────────────┐
    │ CHECK 2: Email Format Valid?           │
    │ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/   │
    └────────────────────────────────────────┘
            │
    ┌───────┴──────────┐
    ↓                  ↓
  YES                 NO
    │                  │
    ↓                  ↓
Continue         ERROR 400
    │              (Invalid email)
    ↓
    ┌────────────────────────────────────────┐
    │ CHECK 3: Password Strong Enough?       │
    │ Minimum 6 characters                   │
    └────────────────────────────────────────┘
            │
    ┌───────┴──────────┐
    ↓                  ↓
  YES                 NO
    │                  │
    ↓                  ↓
Continue         ERROR 400
    │              (Weak password)
    ↓
    ┌────────────────────────────────────────┐
    │ CHECK 4: ⭐ EMAIL PRE-APPROVED? ⭐      │
    │ Query: SELECT * FROM approved_emails   │
    │        WHERE email = ?                 │
    │                                        │
    │ THIS IS STRICT ENFORCEMENT!            │
    └────────────────────────────────────────┘
            │
    ┌───────┴───────────┐
    ↓                   ↓
  FOUND              NOT FOUND
    │                   │
    ↓                   ↓
Continue          ERROR 403
    │              (NOT AUTHORIZED)
    │              "This email is not on
    │               the approved list"
    ↓
    ┌────────────────────────────────────────┐
    │ CHECK 5: Email Already Registered?     │
    │ Query: SELECT id FROM users            │
    │        WHERE email = ?                 │
    └────────────────────────────────────────┘
            │
    ┌───────┴────────────┐
    ↓                    ↓
NOT FOUND            FOUND
    │                    │
    ↓                    ↓
Continue          ERROR 400
    │              (Email exists)
    ↓
    ┌────────────────────────────────────────┐
    │ HASH PASSWORD with bcryptjs:           │
    │ hashedPassword = bcrypt.hash(password) │
    │                (10 rounds)             │
    └────────────────────────────────────────┘
    │
    ↓
    ┌────────────────────────────────────────┐
    │ CREATE USER in Supabase:               │
    │ INSERT INTO users (                    │
    │   email,                               │
    │   password_hash,  ← HASHED!            │
    │   full_name,                           │
    │   role: 'student', ← ALWAYS STUDENT    │
    │   is_active: true                      │
    │ )                                      │
    └────────────────────────────────────────┘
    │
    ├─────────────────────────┐
    ↓                         ↓
SUCCESS                    ERROR
    │                         │
    ↓                         ↓
Create Scholar           ERROR 400
Profile                  (DB error)
    │
    ↓
┌──────────────────────────────────┐
│ REGISTRATION COMPLETE ✅         │
│                                  │
│ Response: 201 Created            │
│ Message: "Registration successful│
│ Redirect: User can login now     │
└──────────────────────────────────┘
```

---

## 🗄️ Database Table Relationships

```
┌─────────────────────────────────────────┐
│              USERS TABLE                │
├─────────────────────────────────────────┤
│ id (UUID, PK)                           │
│ email (VARCHAR, UNIQUE)                 │
│ password_hash (VARCHAR) ← bcryptjs hash │
│ full_name (VARCHAR)                     │
│ role (VARCHAR) ← 'admin'|'student'      │
│ is_active (BOOLEAN)                     │
│ email_verified_at (TIMESTAMP)           │
│ created_at (TIMESTAMP)                  │
│ updated_at (TIMESTAMP)                  │
│ last_login (TIMESTAMP)                  │
└─────────────────────────────────────────┘
         ▲                        │
         │                        │
         └─ Can create many ──────┘
                                  │
                    ┌─────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│         APPROVED_EMAILS TABLE           │
├─────────────────────────────────────────┤
│ id (UUID, PK)                           │
│ email (VARCHAR, UNIQUE)                 │
│ approved_by (UUID, FK→users.id)         │
│ approved_at (TIMESTAMP)                 │
│ created_at (TIMESTAMP)                  │
└─────────────────────────────────────────┘

Example Flow:
1. Admin adds email to approved_emails
2. Student registers with that email
3. System checks approved_emails table
4. If found → registration allowed
5. User created in users table
```

---

## 🔄 Password Hashing Process

```
Plain Password: "Admin123"
        │
        ↓
┌──────────────────────────┐
│   bcryptjs.hash()        │
│   - Rounds: 10           │
│   - Algorithm: bcrypt    │
│   - Salt: random         │
└──────────────────────────┘
        │
        ↓
Hashed Password (one-way):
"$2a$10$abcdef1234567890abcdef
1234567890abcdef1234567890abcde"
        │
        ↓
Store in DB:
users.password_hash = "$2a$10$..."
        │
        ↓
┌──────────────────────────┐
│ Login Verification:      │
│ bcryptjs.compare(        │
│   "Admin123",    ← form  │
│   "$2a$10$..."   ← db    │
│ ) → true/false           │
└──────────────────────────┘
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────┐
│         LAYER 1: PASSWORD HASHING                   │
│  Password stored as one-way bcryptjs hash          │
│  Not even admins can see plain passwords            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 2: EMAIL APPROVAL                     │
│  Students can only register with pre-approved       │
│  emails from approved_emails table                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 3: JWT SESSION                        │
│  Role stored in JWT token, signed with secret      │
│  Token includes user role for routing               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 4: MIDDLEWARE PROTECTION              │
│  Routes checked for authentication                  │
│  Role-based routing enforced                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         LAYER 5: ROW LEVEL SECURITY (RLS)           │
│  Database policies restrict access by role         │
│  Users only see their own data                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Role Routing Matrix

```
        ↓ Role
Accessed →
        │
/login          ✅ All | ✅ All
/register       ✅ All | ✅ All
/                ✅ All | ✅ All

/admin/*        ✅ Admin/Staff | ❌ Student
/admin/dashboard    ✅ | ❌
/admin/scholars     ✅ | ❌
/admin/applications ✅ | ❌
/admin/settings     ✅ | ❌

/student/*      ❌ Admin/Staff | ✅ Student
/student/dashboard  ❌ | ✅
/student/profile    ❌ | ✅
/student/documents  ❌ | ✅
/student/settings   ❌ | ✅

Legend:
✅ = Allowed
❌ = Blocked (redirect to allowed dashboard)
```

---

## 📈 User Journey Timeline

### Admin User Journey
```
Day 1
├─ Admin account created with email admin@carmona.gov.ph
├─ Password hashed: bcryptjs.hash("Admin123", 10)
└─ Stored in users table with role='admin'

Day 2+
├─ Navigate to /login
├─ Enter credentials
├─ NextAuth verifies password
├─ JWT created with role='admin'
├─ Middleware routes to /admin/dashboard
└─ Full admin access granted
```

### Student User Journey
```
Day 1
├─ Admin adds email to approved_emails table
└─ Email pre-approved

Day 2
├─ Student navigates to /register
├─ Enters email + password
├─ System checks approved_emails
├─ Email found → Continue
├─ Password hashed: bcryptjs.hash("password", 10)
├─ User created in users table with role='student'
└─ Scholar profile created

Day 3+
├─ Navigate to /login
├─ Enter credentials
├─ NextAuth verifies password
├─ JWT created with role='student'
├─ Middleware routes to /student/dashboard
└─ Student dashboard access granted
```

---

## 🔐 Data Security Checklist

```
✅ Passwords hashed with bcryptjs (10 rounds)
✅ Passwords never stored in plain text
✅ Email approval enforced at registration
✅ Role stored in JWT token
✅ HTTPS required in production
✅ Session expires after 30 days
✅ Database access restricted by role
✅ Row Level Security (RLS) enabled
✅ Service role key never exposed to client
✅ SQL injection prevented with parameterized queries
✅ CORS properly configured
✅ NEXTAUTH_SECRET required (32+ chars)
```

---

## 🎯 Success Indicators

After setup is complete, you should see:

1. **Admin Login Works**
   - Can login with admin@carmona.gov.ph / Admin123
   - Redirected to /admin/dashboard
   - Admin menu visible

2. **Student Registration Works (Approved Email)**
   - Can register with email in approved_emails
   - Account created successfully
   - Can login afterwards

3. **Student Registration Blocked (Unapproved Email)**
   - Cannot register with unapproved email
   - Gets error: "Email not authorized for registration"
   - Clear message to contact admin

4. **Role-Based Routing Works**
   - Admin sees /admin/dashboard
   - Student sees /student/dashboard
   - Cannot access other role's pages

5. **Password Security Works**
   - Passwords hashed in database (not plain text)
   - Hash verification works on login
   - Wrong password rejected

---

## 📞 Flow Diagram Legend

```
┌────────────┐ = Process/Action
│            │
└────────────┘

    │
    ↓         = Next step/Flow direction

  ┌─┘
  ├─ or ┌──┐ = Branching/Decision
  │     └──┘

✅ = Success
❌ = Failed/Error
```

Use this guide to understand the entire flow from setup to login to routing!
