# QuizClass - Setup Guide

## 🚀 Quick Start (MVP Version)

The app is ready to run with **in-memory storage** (no database setup required for testing).

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

### 4. Test the App

**Demo Session Code:** `1234` (auto-generated with sample questions)

#### Student Flow:
1. Click "I'm a Student"
2. Enter your name and code `1234`
3. Select your interests
4. Take the quiz!

#### Teacher Flow:
1. Click "I'm a Teacher"
2. View the demo session or create a new one
3. Add questions manually
4. Share the 4-digit code with students
5. Monitor live results

---

## 📊 Features Implemented

### ✅ Student Features
- **Quick Join**: Enter name + 4-digit code (no account required)
- **Interest Selection**: Personalize quiz experience
- **Gamified Quiz**: Points, streaks, and real-time feedback
- **Leaderboard**: See class rankings
- **Results Page**: View score and performance

### ✅ Teacher Features
- **Dashboard**: View all sessions
- **Create Sessions**: Add questions manually
- **Live Monitoring**: Track student progress in real-time
- **Analytics**: See which topics students struggle with
- **Session Management**: End sessions when complete

### ✅ Technical Features
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark Mode**: Automatic theme switching
- **Real-time Updates**: Stats refresh every 5 seconds
- **Local Storage**: Student preferences saved in browser

---

## 🔧 Production Setup (Optional)

### Connect Vercel Postgres

1. **Create Vercel Project**
   ```bash
   vercel
   ```

2. **Add Postgres Database**
   - Go to Vercel Dashboard → Storage → Create Database
   - Select "Postgres"
   - Copy environment variables

3. **Update Environment Variables**
   - Add Postgres credentials to `.env.local`
   - Or use Vercel's automatic environment variable injection

4. **Run Database Migration**
   ```bash
   # Connect to your Postgres database and run:
   psql -h <your-host> -U <your-user> -d <your-database> -f lib/db/schema.sql
   ```

5. **Replace Mock Database**
   - Update API routes to use `@vercel/postgres` instead of `mock-db`
   - Example:
   ```typescript
   import { sql } from '@vercel/postgres';
   
   export async function GET() {
     const { rows } = await sql`SELECT * FROM sessions`;
     return NextResponse.json({ sessions: rows });
   }
   ```

---

## 🎨 Customization

### Change App Name
Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your description",
};
```

### Modify Interests
Edit `app/student/interests/page.tsx` - update `AVAILABLE_INTERESTS` array

### Add More Questions
Use the teacher dashboard to create sessions with custom questions

---

## 🔐 Authentication (Optional)

The app currently works without authentication for quick testing. To enable Google OAuth:

1. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Update .env.local**
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   AUTH_SECRET=your-secret-key
   ```

3. **Protect Teacher Routes**
   - Uncomment authentication checks in teacher pages
   - Use `useSession()` hook to verify login

---

## 📱 Mobile Testing

The app is fully responsive. Test on mobile by:

1. **Local Network**
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
   Then access via `http://your-local-ip:3000` on mobile

2. **Vercel Preview**
   ```bash
   vercel
   ```
   Get a public URL for testing

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Dark Mode Not Working
- Check browser settings
- Clear localStorage: `localStorage.clear()`

---

## 🚀 Next Steps (Future Enhancements)

1. **AI Quiz Generation**
   - Integrate OpenAI/Claude API
   - Upload PDF → Auto-generate questions
   - Implement in `app/teacher/create/page.tsx`

2. **Real-time WebSockets**
   - Add Socket.io for live updates
   - Push notifications to students
   - Live leaderboard updates

3. **Advanced Analytics**
   - Export to CSV/PDF
   - Student progress tracking over time
   - Topic mastery heatmaps

4. **Persistent Student Accounts**
   - Optional registration
   - Save progress across sessions
   - Achievement badges

5. **Question Types**
   - True/False
   - Fill in the blank
   - Drag and drop
   - Image-based questions

---

## 📚 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v5
- **Database**: In-memory (MVP) → Vercel Postgres (Production)
- **Deployment**: Vercel

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📞 Support

For issues or questions:
- Check existing issues on GitHub
- Create a new issue with detailed description
- Include error messages and screenshots

---

**Happy Teaching! 🎓**
