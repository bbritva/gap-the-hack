# Authentication Implementation Guide

## Overview

This document describes the authentication system implemented for the QuizClass application. The system supports both **Google OAuth** and **username/password** authentication for teachers.

---

## 🎯 Features Implemented

### ✅ Dual Authentication Methods
1. **Google OAuth** - Sign in with Google account
2. **Username/Password** - Traditional credentials-based login

### ✅ Protected Routes
- Teacher dashboard requires authentication
- Automatic redirect to login page for unauthenticated users
- Session management with NextAuth.js v5

### ✅ User Experience
- Dedicated teacher login page
- User info display in dashboard
- Sign out functionality
- Demo credentials provided for testing

---

## 📁 Files Created

### 1. `app/teacher/login/page.tsx`
Teacher login page featuring:
- Google OAuth button
- Username/password form
- Demo credentials display
- Responsive design
- Loading states

### 2. `app/components/credentials-sign-in.tsx`
Reusable credentials form component with:
- Form validation
- Error handling
- Loading states
- Accessible inputs

### 3. `scripts/seed-teachers.ts`
Database seeding script that creates 5 teacher accounts:
- teacher1 through teacher5
- All with password: 123
- Includes email and name fields

---

## 📝 Files Modified

### 1. `auth.ts`
**Changes:**
- Added Credentials provider alongside Google OAuth
- Implemented password verification logic
- Added callbacks for user creation and session management
- Updated sign-in page path to `/teacher/login`

### 2. `lib/types.ts`
**Changes:**
- Added `username?: string` to Teacher interface
- Added `password_hash?: string` to Teacher interface

### 3. `lib/db.ts`
**New Functions:**
- `getTeacherByUsername()` - Fetch teacher by username
- `createTeacherWithPassword()` - Create teacher with hashed password
- `verifyTeacherPassword()` - Verify username/password combination
- `seedTeachers()` - Seed database with 5 demo teachers

**Updated:**
- `initializeDatabase()` - Added username and password_hash columns

### 4. `lib/db/schema.sql`
**Changes:**
- Added `username VARCHAR(255) UNIQUE` column
- Added `password_hash VARCHAR(255)` column
- Added index on username for performance

### 5. `app/teacher/dashboard/page.tsx`
**Changes:**
- Removed authentication bypass
- Added redirect to login for unauthenticated users
- Added user info display in header
- Added sign-out button
- Improved loading states

### 6. `app/page.tsx`
**Changes:**
- Updated "I'm a Teacher" card link from `/teacher/dashboard` to `/teacher/login`

### 7. `package.json`
**Dependencies Added:**
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types
- `tsx` (dev) - TypeScript execution for scripts

---

## 🔐 Security Features

### Password Hashing
- Uses bcryptjs with salt rounds of 10
- Passwords are never stored in plain text
- Secure comparison using bcrypt.compare()

### Session Management
- NextAuth.js v5 handles session tokens
- Secure HTTP-only cookies
- CSRF protection built-in

### Route Protection
- Client-side checks with useSession()
- Automatic redirects for unauthenticated users
- Protected API routes (existing implementation)

---

## 🗄️ Database Schema

### Teachers Table
```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_username ON teachers(username);
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or update `.env.local`:
```env
# Required for NextAuth
AUTH_SECRET=your_secret_key_here

# Required for database
POSTGRES_URL=your_postgres_connection_string

# Optional: Google OAuth (if you want to use Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Initialize Database and Seed Teachers
```bash
npx tsx scripts/seed-teachers.ts
```

This creates 5 teacher accounts:
| Username  | Password | Email                    | Name         |
|-----------|----------|--------------------------|--------------|
| teacher1  | 123      | teacher1@quizclass.com   | Teacher One  |
| teacher2  | 123      | teacher2@quizclass.com   | Teacher Two  |
| teacher3  | 123      | teacher3@quizclass.com   | Teacher Three|
| teacher4  | 123      | teacher4@quizclass.com   | Teacher Four |
| teacher5  | 123      | teacher5@quizclass.com   | Teacher Five |

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Authentication
1. Navigate to http://localhost:3000
2. Click "I'm a Teacher"
3. Try logging in with:
   - **Google OAuth** (if configured)
   - **Username**: teacher1, **Password**: 123

---

## 🧪 Testing Checklist

- [ ] Google OAuth login works (if configured)
- [ ] Username/password login works
- [ ] Invalid credentials show error message
- [ ] Dashboard redirects to login when not authenticated
- [ ] User info displays correctly in dashboard
- [ ] Sign out button works
- [ ] Session persists on page refresh
- [ ] Protected routes are inaccessible without auth

---

## 🔄 Authentication Flow

### Username/Password Flow
```
1. User enters credentials on /teacher/login
2. CredentialsSignIn component calls signIn('credentials', {...})
3. NextAuth calls authorize() function in auth.ts
4. verifyTeacherPassword() checks username and password
5. If valid, user object returned and session created
6. User redirected to /teacher/dashboard
```

### Google OAuth Flow
```
1. User clicks "Sign in with Google" on /teacher/login
2. SignIn component calls signIn('google')
3. User redirected to Google OAuth consent screen
4. After approval, Google redirects back with profile
5. signIn callback creates/updates teacher in database
6. Session created with user info
7. User redirected to /teacher/dashboard
```

---

## 🛠️ Troubleshooting

### "Missing connection string" error
- Ensure `POSTGRES_URL` is set in `.env.local`
- Restart the development server after adding env vars

### "Invalid username or password"
- Verify the database has been seeded
- Check username spelling (case-sensitive)
- Ensure password is exactly "123"

### Google OAuth not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check redirect URIs in Google Cloud Console
- Ensure `AUTH_SECRET` is set

### Session not persisting
- Clear browser cookies
- Check `AUTH_SECRET` is set
- Verify `trustHost: true` is in auth.ts

---

## 📚 Additional Resources

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

## 🎓 Demo Credentials

For testing purposes, use any of these accounts:

```
Username: teacher1  |  Password: 123
Username: teacher2  |  Password: 123
Username: teacher3  |  Password: 123
Username: teacher4  |  Password: 123
Username: teacher5  |  Password: 123
```

**Note:** In production, use strong passwords and implement proper password policies.

---

## ✨ Future Enhancements

Potential improvements for the authentication system:

1. **Password Reset** - Email-based password recovery
2. **Email Verification** - Verify teacher email addresses
3. **Two-Factor Authentication** - Add 2FA for enhanced security
4. **Role-Based Access Control** - Different permission levels
5. **Account Management** - Allow teachers to update profile
6. **Password Strength Requirements** - Enforce strong passwords
7. **Rate Limiting** - Prevent brute force attacks
8. **Audit Logging** - Track authentication events

---

## 📞 Support

If you encounter any issues with the authentication system, please check:
1. Environment variables are correctly set
2. Database is properly initialized
3. Dependencies are installed
4. Development server is running

For additional help, refer to the troubleshooting section above.
