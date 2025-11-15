# Quick Setup Guide

## 1. Configure Google OAuth

### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API (or Google Identity Services)

### Create OAuth Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: Your app name
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - Your production URL (when deploying)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Click **Create** and copy the Client ID and Client Secret

## 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your credentials
```

Your `.env.local` should look like:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=8FuH0tggZYTqDcmqRcyhSAhRwX9vlBrQQ7nsWNcB3sI=
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

## 3. Install Dependencies

```bash
pnpm install
```

## 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Test Authentication

1. Click "Sign in with Google"
2. Select your Google account
3. Grant permissions
4. You'll be redirected to the Account page
5. Your profile information will be displayed

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page (public)
│   ├── account/
│   │   └── page.tsx          # Account page (protected)
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts          # NextAuth API routes
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── SignInButton.tsx      # Sign-in button
│   └── SignOutButton.tsx     # Sign-out button
├── auth.ts                   # NextAuth configuration
├── middleware.ts             # Route protection
└── .env.local                # Environment variables
```

## Troubleshooting

### "Error: Invalid client_id"
- Verify your `GOOGLE_CLIENT_ID` in `.env.local`
- Make sure there are no extra spaces or quotes

### "Error: redirect_uri_mismatch"
- Check that `http://localhost:3000/api/auth/callback/google` is added to authorized redirect URIs in Google Cloud Console
- Verify `NEXTAUTH_URL` matches your current URL

### Session not persisting
- Clear browser cookies
- Regenerate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Restart the dev server

## Deployment

### Vercel
1. Push to GitHub
2. Import on Vercel
3. Add environment variables
4. Update `NEXTAUTH_URL` to production URL
5. Add production callback URL to Google OAuth

### Other Platforms
- Set all environment variables
- Update `NEXTAUTH_URL`
- Add production callback URL to Google OAuth
- Build: `pnpm build`
- Start: `pnpm start`

## Next Steps

- Customize the UI in `app/page.tsx` and `app/account/page.tsx`
- Add more OAuth providers in `auth.ts`
- Implement database session storage
- Add user roles and permissions
- Create additional protected routes
