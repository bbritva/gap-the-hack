# Quick Start: Google Authentication

Your Google Auth is now configured! Follow these steps to get it working:

## 🚀 Quick Setup (5 minutes)

### 1. Generate AUTH_SECRET
Run this command in your terminal:
```bash
openssl rand -base64 32
```
Copy the output and paste it into `.env.local` replacing `your-secret-key-here`

### 2. Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Create OAuth 2.0 credentials
4. Add these redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
5. Copy your Client ID and Client Secret

### 3. Update .env.local
Open `.env.local` and add your credentials:
```env
AUTH_SECRET=paste-your-generated-secret-here
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
AUTH_URL=http://localhost:3000
```

### 4. Restart Dev Server
```bash
npm run dev
```

### 5. Test It!
Open `http://localhost:3000` and click "Sign in with Google"

## 📖 Need Detailed Instructions?

See [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) for a complete step-by-step guide with screenshots and troubleshooting.

## ✅ What Was Fixed

- ✅ Created `.env.local` with required environment variables
- ✅ Added `trustHost: true` to NextAuth configuration
- ✅ Created setup documentation

## 🔧 Files Created/Modified

- `.env.local` - Your environment variables (DO NOT commit this!)
- `.env.example` - Template for environment variables
- `auth.ts` - Added `trustHost: true` configuration
- `GOOGLE_AUTH_SETUP.md` - Detailed setup guide
- `README_AUTH.md` - This quick start guide

## ⚠️ Important Notes

- `.env.local` is already in `.gitignore` - never commit it!
- You need to restart your dev server after changing `.env.local`
- For production deployment, see the "Production Deployment" section in GOOGLE_AUTH_SETUP.md
