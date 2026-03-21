# Quick Start - BTS Scholarship System with Supabase

**Time to setup: 10 minutes**

## 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Name: `BTS-Scholarship-System`
- Choose region & password
- Wait 2-3 minutes for provisioning

## 2. Get Your Keys
In Supabase Dashboard → Settings → API:
- Copy: **Project URL**
- Copy: **Anon Key**  
- Copy: **Service Role Key** (keep secret!)

## 3. Run SQL Schema
In Supabase → SQL Editor → New Query:
1. Copy all from `/scripts/001_create_schema.sql`
2. Paste into SQL editor
3. Click "Run"
4. Wait for "Success"

## 4. Add Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
NEXTAUTH_SECRET=any_random_32_char_string
NEXTAUTH_URL=http://localhost:3000
```

## 5. Install & Run
```bash
npm install
npm run dev
```

## 6. Set Up Admin Account
In Supabase → SQL Editor:
```sql
INSERT INTO public.approved_emails (email) VALUES ('admin@example.com');
```

## 7. Create Admin User
1. Go to http://localhost:3000/register
2. Use email: `admin@example.com`
3. Fill form and submit
4. Login with same credentials
5. You're now in admin dashboard!

## 8. Test Everything
- ✅ Register new student: `/register`
- ✅ Login: `/login`
- ✅ Admin dashboard: `/admin/dashboard` (if admin)
- ✅ Student dashboard: `/student/dashboard` (if student)
- ✅ Scholars list: `/admin/scholars` (admin only)
- ✅ Upload document: `/student/documents` (student)

## Key Files Created

**Database & Auth:**
- `/lib/supabase/client.ts` - Browser client
- `/lib/supabase/server.ts` - Server client
- `/lib/supabase/db.ts` - All database functions
- `/types/database.ts` - TypeScript types
- `/scripts/001_create_schema.sql` - Database schema

**API Endpoints:**
- `/app/api/scholars/approve` - Approve scholar
- `/app/api/documents/upload` - Upload document
- `/app/api/applications/status` - Update application status

**Documentation:**
- `MIGRATION_COMPLETE.md` - Full details
- `SUPABASE_SETUP_GUIDE.md` - Detailed setup
- `TESTING_GUIDE.md` - Test procedures

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck
```

## Default Test Credentials
After setup, you can use:
- **Email:** admin@example.com
- **Password:** Your password from registration

## What's Changed

**Removed:**
- All in-memory mock data
- Hardcoded user arrays
- Fake storage functions

**Added:**
- Supabase PostgreSQL database
- Bcryptjs password hashing
- NextAuth JWT sessions
- Real API endpoints
- Row Level Security (RLS)

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check Supabase URL and keys in .env.local |
| "Email not pre-approved" | Add email to approved_emails table in Supabase |
| "NextAuth error" | Set NEXTAUTH_SECRET in .env.local |
| "Session lost" | Clear cookies, check NEXTAUTH_URL |
| "Upload failed" | Check file size < 5MB, verify auth |

## Important Security Notes

- **SUPABASE_SERVICE_ROLE_KEY:** Keep this secret! Never expose in client code.
- **Passwords:** Are hashed with bcryptjs before storing
- **Sessions:** Expire after 30 days
- **Files:** Stored privately in Vercel Blob
- **Database:** Protected with Row Level Security (RLS)

## What to Do Next

1. **Local Testing:** Run all test scenarios in TESTING_GUIDE.md
2. **Customization:** Update branding, text, colors as needed
3. **Data Import:** If migrating from old system, write import script
4. **Production:** Deploy to Vercel with production Supabase keys
5. **Monitoring:** Set up Supabase backups and monitoring

## Production Checklist

Before deploying to production:
- [ ] All test scenarios pass locally
- [ ] Environment variables set in Vercel
- [ ] NEXTAUTH_URL points to production domain
- [ ] Supabase backups enabled
- [ ] CORS properly configured
- [ ] SSL/HTTPS verified
- [ ] Email service configured (optional)
- [ ] Monitoring and alerting enabled

## Need Help?

1. Check **MIGRATION_COMPLETE.md** for full migration details
2. Review **SUPABASE_SETUP_GUIDE.md** for detailed setup
3. Follow **TESTING_GUIDE.md** for testing procedures
4. Check application logs: `npm run dev` shows errors
5. Check Supabase dashboard for database issues

## Database Basics

Access your data in Supabase:

```sql
-- View all users
SELECT * FROM public.users;

-- View all scholars
SELECT * FROM public.scholars;

-- View applications
SELECT * FROM public.applications;

-- Check approved emails
SELECT * FROM public.approved_emails;
```

## That's It!

You now have a production-ready scholarship system with real database, authentication, and all core features. Start using it!

**Happy coding! 🚀**

---

For questions or issues, refer to the comprehensive documentation files included in the project.
