# SQL Commands Reference - Complete Setup

## Overview

This document contains all exact SQL commands needed to set up the admin account and email approval system.

**IMPORTANT:** Always backup your database before running these commands!

---

## Step 1: Generate Admin Password Hash

**Do NOT run SQL first!** Generate the hash first.

### Using the Node.js Script (RECOMMENDED)

```bash
# From project root
node scripts/generate-admin-hash.js
```

**Output Example:**
```
Email:    admin@carmona.gov.ph
Password: Admin123

Bcrypt Hash (use this in SQL):
$2a$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234

✓ Hash verification successful!
✓ The password will work correctly with this hash.
```

**Copy the hash to your clipboard!**

### Alternative: Using Node.js REPL

```bash
node
# Inside Node REPL:
> require('bcryptjs').hash('Admin123', 10, (err, hash) => console.log(hash))
```

Copy the output.

---

## Step 2: Execute SQL in Supabase Dashboard

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL below
6. Replace `YOUR_HASH_HERE` with the hash you generated
7. Click **Run**

---

## Complete SQL Script

**COPY EVERYTHING BELOW AND RUN IN SUPABASE:**

```sql
-- ============================================================================
-- APPROVED EMAILS TABLE
-- ============================================================================

-- Create the approved_emails table if it doesn't exist
CREATE TABLE IF NOT EXISTS approved_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_approved_emails_email ON approved_emails(email);

-- Enable Row Level Security
ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view approved emails
CREATE POLICY IF NOT EXISTS "Authenticated users can view approved emails" 
ON approved_emails
FOR SELECT 
USING (auth.role() = 'authenticated');

-- ============================================================================
-- CREATE ADMIN ACCOUNT
-- ============================================================================
-- ⚠️  IMPORTANT: Replace 'YOUR_HASH_HERE' with the bcryptjs hash you generated!
-- 
-- The hash looks like: $2a$10$abcdef...
-- Generated using: node scripts/generate-admin-hash.js
-- ============================================================================

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
  'YOUR_HASH_HERE',  -- ⚠️  REPLACE WITH YOUR GENERATED HASH!
  'Head Administrator',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- ADD PRE-APPROVED STUDENT EMAILS
-- ============================================================================
-- These emails are allowed to register in the system
-- Add or remove as needed

INSERT INTO approved_emails (email, approved_at) VALUES
  ('student1@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student2@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student3@example.com', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify everything was created correctly

-- Check admin account was created
SELECT 
  'Admin Account' as type,
  id, 
  email, 
  role, 
  is_active,
  created_at
FROM users 
WHERE email = 'admin@carmona.gov.ph'
UNION ALL
-- Check approved emails
SELECT 
  'Approved Emails' as type,
  id::text,
  email,
  'approved' as role,
  true as is_active,
  created_at
FROM approved_emails
ORDER BY created_at DESC;
```

---

## Step-by-Step Setup Process

### 1. Generate Hash (Terminal)

```bash
node scripts/generate-admin-hash.js
```

Copy the hash output.

### 2. Open Supabase SQL Editor

- Go to supabase.com
- Select your project
- Click "SQL Editor" in sidebar
- Click "New Query"

### 3. Paste SQL Script

Paste the entire SQL script above.

### 4. Replace the Hash Placeholder

Find this line:
```sql
'YOUR_HASH_HERE',  -- ⚠️  REPLACE WITH YOUR GENERATED HASH!
```

Replace `YOUR_HASH_HERE` with your hash. Example:
```sql
'$2a$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
```

### 5. Run the Query

Click the **Run** button or press `Ctrl+Enter`

### 6. Verify Output

You should see output similar to:
```
QUERY EXECUTED SUCCESSFULLY

Rows: 2
```

---

## Verification Commands

### Check Admin Account

```sql
SELECT id, email, role, is_active, created_at 
FROM users 
WHERE email = 'admin@carmona.gov.ph';
```

**Expected Output:**
| id | email | role | is_active | created_at |
|----|-------|------|-----------|------------|
| [UUID] | admin@carmona.gov.ph | admin | true | 2024-01-01 12:00:00 |

### Check Approved Emails

```sql
SELECT email, approved_at, created_at 
FROM approved_emails 
ORDER BY created_at DESC;
```

**Expected Output:**
| email | approved_at | created_at |
|-------|-------------|------------|
| student1@carmona.gov.ph | 2024-01-01 12:00:00 | 2024-01-01 12:00:00 |
| student2@carmona.gov.ph | 2024-01-01 12:00:00 | 2024-01-01 12:00:00 |
| student3@example.com | 2024-01-01 12:00:00 | 2024-01-01 12:00:00 |

### Check All Users and Roles

```sql
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;
```

---

## Common SQL Operations

### Add a New Approved Email

```sql
INSERT INTO approved_emails (email, approved_at)
VALUES ('newemail@example.com', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
```

### Add Multiple Approved Emails

```sql
INSERT INTO approved_emails (email, approved_at) VALUES
  ('student4@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student5@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student6@carmona.gov.ph', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
```

### Remove an Approved Email

```sql
DELETE FROM approved_emails 
WHERE email = 'newemail@example.com';
```

### Check if Email is Approved

```sql
SELECT * FROM approved_emails 
WHERE email = 'student@example.com';
```

If no rows returned = NOT approved.

### Update Admin Name

```sql
UPDATE users 
SET full_name = 'New Admin Name' 
WHERE email = 'admin@carmona.gov.ph';
```

### Reset Admin Password

```sql
-- First generate new hash using: node scripts/generate-admin-hash.js
UPDATE users 
SET password_hash = 'NEW_HASH_HERE' 
WHERE email = 'admin@carmona.gov.ph';
```

### Deactivate User Account

```sql
UPDATE users 
SET is_active = false 
WHERE email = 'student@example.com';
```

### Reactivate User Account

```sql
UPDATE users 
SET is_active = true 
WHERE email = 'student@example.com';
```

### List All Admin Accounts

```sql
SELECT id, email, full_name, created_at 
FROM users 
WHERE role = 'admin';
```

### List All Student Accounts

```sql
SELECT id, email, full_name, created_at 
FROM users 
WHERE role = 'student'
ORDER BY created_at DESC;
```

### Count Registered Students

```sql
SELECT COUNT(*) as total_students 
FROM users 
WHERE role = 'student';
```

### Count Approved Emails

```sql
SELECT COUNT(*) as total_approved_emails 
FROM approved_emails;
```

---

## Backup and Restore

### Backup Users Table

```sql
-- Export current users
SELECT * FROM users;
```

### Backup Approved Emails

```sql
-- Export current approved emails
SELECT * FROM approved_emails;
```

---

## Troubleshooting

### Error: "relation 'approved_emails' does not exist"

**Solution:** The table wasn't created. Run the CREATE TABLE command above.

### Error: "duplicate key value violates unique constraint"

**Solution:** The email already exists. Either:
- Use a different email, OR
- Delete the existing record first:
```sql
DELETE FROM users WHERE email = 'admin@carmona.gov.ph';
DELETE FROM approved_emails WHERE email = 'student@example.com';
```

### Error: "password_hash must not be null"

**Solution:** The password hash was empty. Make sure you replaced `YOUR_HASH_HERE` with the actual hash.

### Admin can't login after running SQL

**Solution:** Check the hash:
```sql
SELECT password_hash FROM users WHERE email = 'admin@carmona.gov.ph';
```

If it shows `YOUR_HASH_HERE` → the hash wasn't replaced properly.

---

## Password Hash Verification

To manually verify a password hash works:

```javascript
// In Node.js console
const bcrypt = require('bcryptjs');

bcrypt.compare('Admin123', '$2a$10$YOUR_HASH_HERE', (err, isMatch) => {
  console.log('Password matches:', isMatch);
});
```

Should output: `Password matches: true`

---

## Security Notes

1. **Hash is One-Way:** Once hashed, you cannot convert it back to the password
2. **Never Store Plain Passwords:** Always hash before storing
3. **10 Rounds:** Bcryptjs with 10 rounds = good security/performance balance
4. **Unique Emails:** Email addresses are unique in both users and approved_emails
5. **RLS Enabled:** Table has Row Level Security to protect data

---

## Quick Reference

| Action | SQL Command |
|--------|-------------|
| Create admin | INSERT INTO users (...) VALUES (...) |
| Add approved email | INSERT INTO approved_emails (email) VALUES (...) |
| Check admin exists | SELECT * FROM users WHERE email = 'admin@carmona.gov.ph' |
| Check email approved | SELECT * FROM approved_emails WHERE email = ... |
| Deactivate user | UPDATE users SET is_active = false WHERE ... |
| Reset password | UPDATE users SET password_hash = '...' WHERE ... |
| Delete user | DELETE FROM users WHERE ... |
| Delete approved email | DELETE FROM approved_emails WHERE email = ... |

---

## Example: Complete Fresh Setup

```bash
# 1. Generate hash
node scripts/generate-admin-hash.js

# 2. Copy output hash
# (e.g., $2a$10$...)

# 3. Go to Supabase → SQL Editor → New Query

# 4. Paste the complete SQL script above

# 5. Replace YOUR_HASH_HERE with generated hash

# 6. Click Run

# 7. Verify:
# - SELECT * FROM users WHERE role = 'admin';
# - SELECT * FROM approved_emails;

# 8. Test login:
# - Go to /login
# - Email: admin@carmona.gov.ph
# - Password: Admin123
```

Done! ✅

