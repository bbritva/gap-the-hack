# Vercel Postgres Database Setup Guide

This guide will help you set up a Vercel Postgres database for the QuizClass application.

---

## 🚀 Quick Setup (5-10 minutes)

### Step 1: Create a Vercel Account (if you don't have one)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub, GitLab, or Bitbucket (recommended) or email

---

### Step 2: Create a New Vercel Project

#### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with authentication"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Import"
6. Configure project settings (use defaults)
7. Click "Deploy"

#### Option B: Deploy with Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

---

### Step 3: Create Postgres Database

1. Go to your project dashboard on [vercel.com](https://vercel.com)
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a database name (e.g., "quizclass-db")
6. Select a region (choose closest to your users)
7. Click "Create"

**Wait 1-2 minutes for the database to be provisioned.**

---

### Step 4: Get Database Connection String

1. After database is created, click on it
2. Go to the ".env.local" tab
3. You'll see environment variables like:
   ```
   POSTGRES_URL="postgres://..."
   POSTGRES_PRISMA_URL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   ```

4. Copy the `POSTGRES_URL` value

---

### Step 5: Configure Local Environment

1. Open your `.env.local` file in the project root
2. Add the database connection string:
   ```env
   # Database
   POSTGRES_URL="paste_your_postgres_url_here"
   
   # NextAuth
   AUTH_SECRET="your_auth_secret_here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```

3. Generate AUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as AUTH_SECRET value

---

### Step 6: Initialize Database and Seed Teachers

1. Run the seed script:
   ```bash
   npx tsx scripts/seed-teachers.ts
   ```

2. You should see:
   ```
   Initializing database...
   Database initialized successfully!
   
   Seeding teachers...
   Successfully seeded 5 teachers
   
   ✅ Database setup complete!
   
   You can now login with:
     Username: teacher1, teacher2, teacher3, teacher4, or teacher5
     Password: 123
   ```

---

### Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test the authentication!

---

## 🔧 Alternative: Local Development with Docker (Optional)

If you prefer to develop locally without Vercel:

### 1. Install Docker Desktop
- Download from [docker.com](https://www.docker.com/products/docker-desktop)

### 2. Run Postgres Container
```bash
docker run --name quizclass-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=quizclass \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Update .env.local
```env
POSTGRES_URL="postgres://postgres:postgres@localhost:5432/quizclass"
AUTH_SECRET="your_generated_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Seed Database
```bash
npx tsx scripts/seed-teachers.ts
```

---

## 🎯 Vercel CLI Commands (Useful)

### Link Local Project to Vercel
```bash
vercel link
```

### Pull Environment Variables
```bash
vercel env pull .env.local
```

### Deploy to Production
```bash
vercel --prod
```

### View Logs
```bash
vercel logs
```

---

## 📊 Vercel Dashboard Features

### Database Management
- **Query Editor**: Run SQL queries directly in the dashboard
- **Metrics**: View database performance and usage
- **Backups**: Automatic daily backups (on paid plans)
- **Logs**: View database connection logs

### Useful SQL Queries

#### View all teachers:
```sql
SELECT id, username, email, name, created_at FROM teachers;
```

#### Check if teachers were seeded:
```sql
SELECT COUNT(*) as teacher_count FROM teachers;
```

#### View all sessions:
```sql
SELECT * FROM sessions ORDER BY created_at DESC;
```

#### Reset a teacher's password:
```sql
-- First, generate a new hash for password "123"
-- Then update (you'll need to generate the hash using bcrypt)
UPDATE teachers 
SET password_hash = '$2a$10$...' 
WHERE username = 'teacher1';
```

---

## 🔐 Environment Variables Checklist

Make sure your `.env.local` has:

```env
# ✅ Required
POSTGRES_URL="postgres://..."
AUTH_SECRET="generated_secret_here"

# ✅ Recommended
NEXTAUTH_URL="http://localhost:3000"

# ⚠️ Optional (for Google OAuth)
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```

---

## 🐛 Troubleshooting

### Error: "missing_connection_string"
- **Solution**: Make sure `POSTGRES_URL` is set in `.env.local`
- Restart your dev server after adding it

### Error: "Connection refused"
- **Solution**: Check if database is running (Vercel dashboard)
- Verify the connection string is correct
- Check your internet connection

### Error: "relation does not exist"
- **Solution**: Run the seed script to create tables:
  ```bash
  npx tsx scripts/seed-teachers.ts
  ```

### Teachers not seeding
- **Solution**: Check database logs in Vercel dashboard
- Verify POSTGRES_URL is correct
- Try running the seed script again

### Can't login after seeding
- **Solution**: Verify teachers were created:
  ```sql
  SELECT * FROM teachers;
  ```
- Check username is exactly "teacher1" (case-sensitive)
- Password is exactly "123"

---

## 📈 Production Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Add authentication"
git push
```

### 2. Vercel Auto-Deploy
- Vercel will automatically deploy when you push to main branch
- Environment variables from dashboard are used automatically

### 3. Set Production Environment Variables
1. Go to Project Settings → Environment Variables
2. Add the same variables from `.env.local`
3. Make sure to set `NEXTAUTH_URL` to your production URL:
   ```
   NEXTAUTH_URL="https://your-app.vercel.app"
   ```

### 4. Redeploy
```bash
vercel --prod
```

---

## 💡 Tips

1. **Free Tier Limits**: Vercel Postgres free tier includes:
   - 256 MB storage
   - 60 hours compute time per month
   - Good for development and small projects

2. **Connection Pooling**: Use `POSTGRES_URL` (with pooling) for better performance

3. **Security**: Never commit `.env.local` to git (it's in `.gitignore`)

4. **Backups**: On paid plans, Vercel provides automatic backups

5. **Monitoring**: Check the Vercel dashboard regularly for database metrics

---

## 🎓 Next Steps After Setup

1. ✅ Database is running
2. ✅ Tables are created
3. ✅ Teachers are seeded
4. ✅ Test authentication:
   - Go to http://localhost:3000
   - Click "I'm a Teacher"
   - Login with teacher1/123
   - Verify dashboard access
   - Test sign out

---

## 📚 Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [NextAuth.js Documentation](https://authjs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel dashboard logs
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

## ✨ Success Checklist

- [ ] Vercel account created
- [ ] Project deployed to Vercel
- [ ] Postgres database created
- [ ] Connection string added to .env.local
- [ ] AUTH_SECRET generated and added
- [ ] Seed script ran successfully
- [ ] 5 teachers created in database
- [ ] Dev server running
- [ ] Can login with teacher1/123
- [ ] Dashboard loads correctly
- [ ] Sign out works

Once all items are checked, your authentication system is fully operational! 🎉
