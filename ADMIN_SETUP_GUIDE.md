# Admin Setup Guide - BTS Scholarship System

## Overview

This guide walks you through setting up the head admin account and configuring the student registration approval system.

---

## Part 1: Create the Head Admin Account

### Step 1: Generate the Bcryptjs Hash

The admin password must be hashed before storing in the database. Follow these steps:

#### Option A: Using Node.js Script (Recommended)

```bash
# From the project root directory
node scripts/generate-admin-hash.js
```

This will output:
- Your admin email: `admin@carmona.gov.ph`
- Your admin password: `Admin123`
- A bcryptjs hash (looks like: `$2a$10$...`)

Copy the hash to your clipboard.

#### Option B: Using Node.js REPL

```bash
node
# In the Node REPL:
> require('bcryptjs').hash('Admin123', 10, (err, hash) => console.log(hash))
```

Wait for the hash to be printed, then copy it.

#### Option C: Generate Programmatically

Create a file `hash-gen.js`:
```javascript
const bcrypt = require('bcryptjs');

async function generateHash() {
  const hash = await bcrypt.hash('Admin123', 10);
  console.log(hash);
}

generateHash();
```

Run it:
```bash
node hash-gen.js
```

### Step 2: Update the SQL Script

Open `scripts/002_seed_admin.sql` and find this line:

```sql
'$2a$10$9xh2pV.w1jUwLh4L2H5z8eOyH0b7V7K3j6m9L0n5P2Q1R3S4T5U6V7W8X9Y0', -- ⚠️  REPLACE THIS HASH!
```

Replace the hash with the one you generated.

### Step 3: Execute SQL in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Open `scripts/002_seed_admin.sql` and copy ALL the SQL code
6. Paste it into the Supabase SQL editor
7. Click **Run**

You should see output confirming:
- Admin account created
- Pre-approved emails added

### Step 4: Verify Admin Account

In Supabase SQL Editor, run:

```sql
SELECT id, email, role, is_active, created_at 
FROM users 
WHERE email = 'admin@carmona.gov.ph';
```

You should see one row with:
- `role`: `admin`
- `is_active`: `true`

---

## Part 2: Configure Student Email Approval System

### How It Works

1. **Pre-Approval Required**: Students can ONLY register with emails that are in the `approved_emails` table
2. **Admin Control**: Admins can add or remove approved emails at any time
3. **Clear Error Messages**: If a student tries to register with an unapproved email, they get a helpful error message

### Adding Approved Student Emails

#### Via SQL (Direct)

In Supabase SQL Editor, run:

```sql
INSERT INTO approved_emails (email, approved_at)
VALUES 
  ('student1@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student2@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student3@example.com', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
```

#### Via Application (UI)

Once logged in as admin, go to:
- Admin Dashboard → Approved Emails → Add Email

Then click "Add" and enter the email.

### Removing Approved Emails

#### Via SQL

```sql
DELETE FROM approved_emails 
WHERE email = 'student@example.com';
```

#### Via Application

Admin Dashboard → Approved Emails → Find email → Delete

---

## Part 3: NextAuth Configuration

The authentication is already configured to work with the admin role. Here's how it works:

### Login Flow

```
User enters email + password
    ↓
[API] /api/auth/signin (NextAuth)
    ↓
Query users table for email
    ↓
Verify password with bcrypt.compare()
    ↓
Check is_active flag
    ↓
Return user with role (admin/student/staff)
    ↓
Create JWT token with role
    ↓
Session contains user.role
```

### Middleware Routing

After login, the middleware (`middleware.ts`) routes users based on their role:

- **Admin/Staff**: → `/admin/dashboard`
- **Student**: → `/student/dashboard`

### Code Location

- **Auth Configuration**: `/app/api/auth/[...nextauth]/route.ts`
- **NextAuth Options**: Lines 6-47
- **JWT Callback**: Lines 48-53 (adds role to token)
- **Session Callback**: Lines 54-61 (adds role to session)

---

## Part 4: Registration API Enhanced Logic

The registration API now enforces strict email approval:

### File Location

`/app/api/register/route.ts`

### Validation Steps

1. **Required Fields Check**
   - fullName, email, password required
   - Returns: 400 Bad Request if missing

2. **Email Format Validation**
   - Checks for valid email format
   - Returns: 400 Bad Request if invalid

3. **Password Strength Check**
   - Minimum 6 characters required
   - Returns: 400 Bad Request if too short

4. **Email Approval Check** ⭐ **STRICT ENFORCEMENT**
   - Queries `approved_emails` table
   - If NOT found → Returns: 403 Forbidden
   - Error message tells user to contact admin

5. **Duplicate Email Check**
   - Checks if email already registered
   - Returns: 400 Bad Request if exists

6. **Password Hashing**
   - Uses bcryptjs (10 rounds)
   - Secure one-way hashing

7. **User Creation**
   - Creates user in `users` table
   - Role always set to `student`
   - is_active set to `true`

8. **Scholar Profile Creation**
   - Creates corresponding scholar record
   - Links to user account

### Error Messages Returned to UI

**Email Not Approved:**
```json
{
  "success": false,
  "error": "Email not authorized for registration",
  "userMessage": "This email is not authorized to register. Only pre-approved emails can create accounts. Please contact the administrator for approval."
}
```

**Email Already Exists:**
```json
{
  "success": false,
  "error": "Email already registered",
  "details": "This email is already associated with an account"
}
```

**Password Too Short:**
```json
{
  "success": false,
  "error": "Password must be at least 6 characters long"
}
```

**Registration Successful:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "Student Name",
    "role": "student"
  }
}
```

---

## Part 5: Testing the Setup

### Test 1: Admin Login

1. Go to `/login`
2. Enter:
   - Email: `admin@carmona.gov.ph`
   - Password: `Admin123`
3. Click Login
4. Should redirect to `/admin/dashboard`
5. Admin menu should appear

### Test 2: Student Registration (Approved Email)

1. Go to `/register`
2. Click "Approve Email" or add `testuser@example.com` to `approved_emails`
3. Fill form with:
   - Name: Test Student
   - Email: `testuser@example.com`
   - Password: `TestPass123`
   - Other fields as needed
4. Submit
5. Should redirect to `/login` with success message
6. Can now login with those credentials

### Test 3: Student Registration (Unapproved Email)

1. Go to `/register`
2. Fill form with:
   - Email: `unapproved@example.com`
   - Other fields as needed
3. Submit
4. Should see error: "This email is not authorized to register"
5. Cannot complete registration

### Test 4: Verify Passwords

In Node.js:
```javascript
const bcrypt = require('bcryptjs');

// Test admin password
bcrypt.compare('Admin123', '$2a$10$...', (err, isMatch) => {
  console.log('Admin password matches:', isMatch); // true
});

// Test wrong password
bcrypt.compare('WrongPassword', '$2a$10$...', (err, isMatch) => {
  console.log('Admin password matches:', isMatch); // false
});
```

---

## Part 6: Security Checklist

- [ ] Admin password hash generated and stored
- [ ] Admin account created in database
- [ ] NextAuth secret set in environment variables
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] Pre-approved emails table populated
- [ ] HTTPS enabled in production
- [ ] Database backups configured
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Password hashing uses bcryptjs (not plain text)
- [ ] Admin email address kept confidential

---

## Part 7: Troubleshooting

### Admin can't login

1. Verify admin account exists:
   ```sql
   SELECT * FROM users WHERE email = 'admin@carmona.gov.ph';
   ```

2. Check password hash:
   - Don't look at the actual hash (it's one-way)
   - Instead, test in Node.js:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.compare('Admin123', 'PASTE_HASH_HERE', (err, match) => {
     console.log('Match:', match);
   });
   ```

3. Check NEXTAUTH_SECRET is set:
   ```bash
   echo $NEXTAUTH_SECRET
   ```

### Students can't register even with approved email

1. Check email is in approved_emails:
   ```sql
   SELECT * FROM approved_emails WHERE email = 'student@example.com';
   ```

2. Check email case sensitivity (system converts to lowercase):
   ```sql
   SELECT * FROM approved_emails WHERE email = lower('Student@Example.com');
   ```

3. Check logs in Vercel or console for SQL errors

### NextAuth not reading role

1. Check callback code in `/app/api/auth/[...nextauth]/route.ts`
2. Verify role exists in database:
   ```sql
   SELECT role FROM users WHERE email = 'admin@carmona.gov.ph';
   ```

3. Clear browser cookies and try again

---

## Useful SQL Queries

### View all users and roles
```sql
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;
```

### View all approved emails
```sql
SELECT email, approved_at, created_at 
FROM approved_emails 
ORDER BY created_at DESC;
```

### Add bulk approved emails
```sql
INSERT INTO approved_emails (email) VALUES
  ('email1@example.com'),
  ('email2@example.com'),
  ('email3@example.com')
ON CONFLICT (email) DO NOTHING;
```

### Remove all approved emails (danger!)
```sql
DELETE FROM approved_emails;
```

### Reset admin password
```sql
-- First generate new hash using scripts/generate-admin-hash.js
UPDATE users 
SET password_hash = 'NEW_HASH_HERE' 
WHERE email = 'admin@carmona.gov.ph';
```

---

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000  # or your production URL

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

---

## Support

For issues:
1. Check the troubleshooting section above
2. Review database logs in Supabase dashboard
3. Check application logs in Vercel
4. Verify all environment variables are set correctly

