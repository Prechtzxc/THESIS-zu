# Authentication Code Reference

## Quick Links

- **Admin Setup**: See `ADMIN_SETUP_GUIDE.md` for complete setup instructions
- **NextAuth Configuration**: `/app/api/auth/[...nextauth]/route.ts`
- **Registration API**: `/app/api/register/route.ts`
- **SQL Scripts**: `/scripts/002_seed_admin.sql`
- **Hash Generator**: `/scripts/generate-admin-hash.js`

---

## Current Code Implementation

### 1. NextAuth Route (`/app/api/auth/[...nextauth]/route.ts`)

```typescript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createServiceRoleClient } from "@/lib/supabase/server"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[Auth] Missing credentials")
            return null
          }

          // Query Supabase for user
          const supabase = await createServiceRoleClient()
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (error || !user) {
            console.error("[Auth] User not found:", error)
            return null
          }

          // Check if user is active
          if (!user.is_active) {
            console.error("[Auth] User is inactive")
            return null
          }

          // Verify password using bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.password_hash || ""
          )

          if (!isValidPassword) {
            console.error("[Auth] Invalid password")
            return null
          }

          // Update last login
          await supabase
            .from("users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", user.id)

          // Return user with role (CRITICAL for admin routing)
          return {
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role,  // ⭐ This is passed to JWT/session
          }
        } catch (error) {
          console.error("[Auth] Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    // JWT Callback - runs when token is created/updated
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role  // ⭐ Store role in JWT
        token.sub = user.id     // Standard JWT subject claim
      }
      return token
    },
    // Session Callback - runs when session is accessed
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub      // Add user ID to session
        session.user.role = token.role   // ⭐ Add role to session
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Key Points:**
- ✅ Uses bcryptjs for password verification
- ✅ Loads user from Supabase with role
- ✅ Passes role to JWT token
- ✅ Passes role to session
- ✅ Updates last_login timestamp

---

### 2. Registration API (`/app/api/register/route.ts`)

Key validation steps:

```typescript
// Step 4: Check if email is PRE-APPROVED (STRICT ENFORCEMENT)
const emailApproved = await isEmailApproved(email.toLowerCase())

if (!emailApproved) {
  return NextResponse.json(
    {
      success: false,
      error: "Email not authorized for registration",
      userMessage:
        "This email is not on the approved list. Please contact the BTS administrator.",
    },
    { status: 403 },
  )
}

// Step 6: Hash password using bcryptjs (10 rounds)
const hashedPassword = await bcrypt.hash(password, 10)

// Step 7: Create user in Supabase
const { data: newUser, error: userError } = await supabase
  .from("users")
  .insert([
    {
      email: email.toLowerCase(),
      full_name: fullName,
      password_hash: hashedPassword,  // ✅ Hashed, not plain text
      role: "student",                 // ✅ Always student for registrations
      is_active: true,
    },
  ])
  .select("id, email, full_name, role")
  .single()
```

**Key Points:**
- ✅ Email approval checked FIRST
- ✅ Password hashed with bcryptjs (10 rounds)
- ✅ User role hardcoded to "student"
- ✅ All fields validated before database insert
- ✅ Helpful error messages for blocked registrations

---

### 3. SQL Commands for Setup

#### Create Pre-Approved Emails Table

```sql
CREATE TABLE IF NOT EXISTS approved_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approved_emails_email ON approved_emails(email);

ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;
```

#### Create Admin Account (with hash)

```sql
-- Step 1: Generate hash using: node scripts/generate-admin-hash.js
-- Step 2: Replace the hash below with the actual generated hash
-- Step 3: Run this SQL in Supabase

INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  is_active,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'admin@carmona.gov.ph',
  '$2a$10$PASTE_GENERATED_HASH_HERE',  -- Replace with actual hash
  'Head Administrator',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
```

#### Add Pre-Approved Student Emails

```sql
INSERT INTO approved_emails (email, approved_at) VALUES
  ('student1@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student2@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student3@example.com', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
```

#### Verify Setup

```sql
-- Check admin account
SELECT id, email, role, is_active 
FROM users 
WHERE email = 'admin@carmona.gov.ph';

-- Check approved emails
SELECT email, approved_at 
FROM approved_emails 
ORDER BY approved_at DESC;
```

---

### 4. Password Hash Generation Script

Run this to generate the bcryptjs hash:

```bash
node scripts/generate-admin-hash.js
```

Output will show:
```
Email:    admin@carmona.gov.ph
Password: Admin123

Bcrypt Hash (use this in SQL):
$2a$10$abcdefghijklmnopqrstuvwxyz...

✓ Hash verification successful!
✓ The password will work correctly with this hash.
```

---

### 5. Environment Variables Needed

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Admin Flow

```
Admin navigates to /login
           ↓
Enters: admin@carmona.gov.ph / Admin123
           ↓
NextAuth calls authorize() in credentials provider
           ↓
Query users table: SELECT * FROM users WHERE email = ...
           ↓
User found with role = 'admin'
           ↓
bcrypt.compare('Admin123', $2a$10$...) → TRUE
           ↓
Return { id, name, email, role: 'admin' }
           ↓
JWT Token created with role: 'admin'
           ↓
Middleware checks role
           ↓
Redirect to /admin/dashboard
           ↓
Admin menu appears with full permissions
```

---

## Student Registration Flow

```
Student navigates to /register
           ↓
Enters: student@example.com (must be pre-approved)
           ↓
Form validates required fields
           ↓
API POST /api/register called
           ↓
Check approved_emails table: SELECT * FROM approved_emails WHERE email = ...
           ↓
Email found → Continue
Email NOT found → Return 403 error "Email not authorized"
           ↓
Check if email already exists in users
           ↓
Hash password: bcryptjs.hash('password', 10)
           ↓
Create user: INSERT INTO users (email, password_hash, role='student', ...)
           ↓
Create scholar: INSERT INTO scholars (user_id, ...)
           ↓
Return success message
           ↓
Redirect to /login
           ↓
Student can now login
```

---

## Key Security Features

1. **Password Hashing**
   - Uses bcryptjs with 10 salt rounds
   - One-way cryptographic hashing
   - Passwords NEVER stored in plain text

2. **Email Approval**
   - Pre-approved emails stored in database
   - Registration blocked for unapproved emails
   - Strict enforcement in registration API

3. **Role-Based Access**
   - Admin role stored in JWT token
   - Middleware routes based on role
   - Admin pages protected

4. **Session Security**
   - JWT strategy (stateless)
   - 30-day expiration
   - HTTPS required in production

5. **Password Verification**
   - bcryptjs.compare() used for verification
   - Prevents timing attacks
   - Constant-time comparison

---

## Testing

### Test Admin Login

```bash
# In terminal
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carmona.gov.ph",
    "password": "Admin123"
  }'
```

### Test Student Registration (Approved Email)

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "course": "Computer Science",
    "yearLevel": "2nd Year"
  }'
```

### Test Student Registration (Unapproved Email)

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "email": "unapproved@example.com",
    "password": "SecurePass123"
  }'
# Should return: 403 "Email not authorized for registration"
```

---

## Troubleshooting Checklist

- [ ] NEXTAUTH_SECRET is set and 32+ characters
- [ ] Supabase environment variables are correct
- [ ] Admin password hash was generated and inserted
- [ ] Student emails are in approved_emails table
- [ ] Users table has created admin account
- [ ] Role column shows 'admin' for admin account
- [ ] Password hashing is bcryptjs, not plain text
- [ ] NextAuth callbacks include role in JWT and session

