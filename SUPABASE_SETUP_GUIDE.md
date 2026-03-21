# Supabase Setup Guide for BTS Scholarship System

## Prerequisites
1. A Supabase account (free tier works fine)
2. Node.js 18+ and npm/yarn/pnpm installed
3. Access to your Supabase project dashboard

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name:** BTS-Scholarship-System
   - **Database Password:** Choose a strong password (save this)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier is fine
4. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get Your API Keys

1. In Supabase Dashboard, go to **Settings → API**
2. Copy these values (you'll need them):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Execute the SQL Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `/scripts/001_create_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (the play button)
6. Wait for all statements to execute successfully
7. You should see "Success" for all operations

## Step 4: Configure Environment Variables

In your project root, create or update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth
NEXTAUTH_SECRET=generate_a_random_string_here
NEXTAUTH_URL=http://localhost:3000

# Vercel Blob (if using file uploads)
BLOB_READ_WRITE_TOKEN=your_token_here (optional)
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 5: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Step 6: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Server will be available at `http://localhost:3000`

## Step 7: Create Your First Admin User

### Option A: Direct Database Insert (Manual)

1. In Supabase, go to **SQL Editor → New Query**
2. Run this SQL:

```sql
INSERT INTO public.users (email, full_name, password_hash, role, is_active)
VALUES (
  'admin@example.com',
  'Admin User',
  '$2a$10$...',  -- bcrypt hash of your password
  'admin',
  true
);
```

To get the bcrypt hash, you can use any online bcrypt generator or generate it in Node:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your_password', 10);
console.log(hash);
```

### Option B: Use Registration Endpoint (Recommended)

First, add your admin email to approved emails:

```sql
INSERT INTO public.approved_emails (email, approved_by)
VALUES ('admin@example.com', NULL);
```

Then register using the web interface at `/register`

## Step 8: Test the System

### Test Registration
1. Go to `http://localhost:3000/register`
2. Use an approved email
3. Fill in all fields
4. Submit
5. You should see success message

### Test Login
1. Go to `http://localhost:3000/login`
2. Use credentials from step above
3. Should redirect to dashboard

### Test Authenticated Pages
- Student: `http://localhost:3000/student/dashboard`
- Admin: `http://localhost:3000/admin/dashboard`

## Troubleshooting

### "Database connection failed"
- Check NEXT_PUBLIC_SUPABASE_URL and keys are correct
- Ensure SQL schema was executed successfully
- Check Supabase project status in dashboard

### "Email not pre-approved"
- Add email to `approved_emails` table in Supabase
- Or use the admin panel to add approved emails

### "NextAuth secret error"
- Ensure NEXTAUTH_SECRET is set in .env.local
- Regenerate with `openssl rand -base64 32`

### "Session not working"
- Clear browser cookies
- Check NEXTAUTH_URL matches your localhost/domain
- Verify JWT secret is consistent across restarts

### "File uploads not working"
- Ensure BLOB_READ_WRITE_TOKEN is set (if using Vercel Blob)
- Check file size is under 5MB
- Verify documents table in Supabase

## Row Level Security (RLS)

The schema includes RLS policies that protect data:
- Users can only view their own data
- Admins can view all data
- Public APIs use service role for specific operations

To bypass RLS in SQL Editor for admin tasks:
- Service role already has bypass enabled
- For manual queries in SQL Editor, RLS is disabled

## Seeding Sample Data

To add sample data for testing, create a script or use the SQL Editor:

```sql
-- Add sample admin user
INSERT INTO public.users (email, full_name, password_hash, role)
VALUES ('admin@carmona.gov.ph', 'Maria Elena Santos', '<hash>', 'admin');

-- Add sample approved emails
INSERT INTO public.approved_emails (email) VALUES
('student1@example.com'),
('student2@example.com'),
('student3@example.com');
```

## Production Deployment

### Before Going Live

1. Update `.env.production` with production Supabase keys
2. Change NEXTAUTH_URL to your production domain
3. Review RLS policies with Supabase security docs
4. Enable database backups in Supabase dashboard
5. Set up proper CORS policies
6. Enable Auth email verification
7. Configure custom SMTP for transactional emails

### Deploy to Vercel

```bash
git push origin main
```

Vercel will automatically detect environment variables and deploy. Ensure all env vars are set in Vercel project settings.

## Monitoring & Maintenance

### Check Database Health
- Supabase Dashboard → Database → Statistics
- Monitor connection count and query performance
- Set up alerts for high usage

### View Logs
- Supabase Dashboard → Logs
- Filter by table or operation type
- Useful for debugging data issues

### Backup Your Data
- Supabase Dashboard → Backups
- Enable automatic backups (default: daily)
- Can restore from any backup point

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)

## Support

For issues:
1. Check the MIGRATION_SUMMARY.md for what was changed
2. Review database schema in Supabase console
3. Check application logs with `npm run dev`
4. Verify environment variables are set correctly
