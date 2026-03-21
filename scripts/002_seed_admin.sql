-- ============================================================================
-- ADMIN ACCOUNT SEEDING SCRIPT
-- ============================================================================
-- This script creates the default head admin account and pre-approved emails
-- 
-- PASSWORD SECURITY:
-- The password is hashed using bcryptjs (10 rounds)
-- Original password: Admin123
-- DO NOT store plain text passwords in the database!
-- ============================================================================

-- Step 1: Ensure the approved_emails table exists
CREATE TABLE IF NOT EXISTS approved_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_approved_emails_email ON approved_emails(email);

-- Enable RLS on approved_emails
ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for public read (admins can manage)
CREATE POLICY "Authenticated users can view approved emails" ON approved_emails
  FOR SELECT USING (auth.role() = 'authenticated');

-- Step 2: Insert the head admin account
-- ⚠️  IMPORTANT: Replace the hash below with the actual bcryptjs hash
-- 
-- Run this command to generate the hash:
--   node scripts/generate-admin-hash.js
-- 
-- Or in Node REPL:
--   require('bcryptjs').hash('Admin123', 10, (err, hash) => console.log(hash))
--
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
  '$2a$10$9xh2pV.w1jUwLh4L2H5z8eOyH0b7V7K3j6m9L0n5P2Q1R3S4T5U6V7W8X9Y0', -- ⚠️  REPLACE THIS HASH!
  'Head Administrator',
  'admin',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Step 3: Add pre-approved student emails
-- These emails are allowed to register in the system
INSERT INTO approved_emails (email, approved_at) VALUES
  ('student@carmona.gov.ph', CURRENT_TIMESTAMP),
  ('student1@example.com', CURRENT_TIMESTAMP),
  ('student2@example.com', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Step 4: Verify creation
SELECT 
  'Admin Account' as type,
  id, 
  email, 
  role, 
  is_active 
FROM users 
WHERE email = 'admin@carmona.gov.ph'
UNION ALL
SELECT 
  'Approved Emails' as type,
  id::text,
  email,
  'approved' as role,
  true as is_active
FROM approved_emails;
