# Next.js App with Google Authentication

This is a Next.js application with Google OAuth authentication using NextAuth.js v5.

## Getting Started

### 1. Set up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already
6. For Application type, select **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
8. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Update the `.env.local` file with your Google OAuth credentials:

```bash
# Generate a secret key with: openssl rand -base64 32
AUTH_SECRET=your-secret-key-here

# Your Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Base URL
NEXTAUTH_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- ✅ Google OAuth authentication
- ✅ Server-side session management
- ✅ Protected routes
- ✅ User profile display
- ✅ Sign in/Sign out functionality
- ✅ TypeScript support
- ✅ Tailwind CSS styling

## Project Structure

```
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts          # NextAuth API routes
│   ├── components/
│   │   ├── sign-in.tsx       # Sign in button component
│   │   ├── sign-out.tsx      # Sign out button component
│   │   └── user-info.tsx     # User profile display
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── auth.ts                   # NextAuth configuration
└── .env.local                # Environment variables
```

## Authentication Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After approval, redirected back to the app
4. Session is created and stored
5. User information is displayed
6. User can sign out to end the session

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Update `NEXTAUTH_URL` to your production domain
5. Add production callback URL to Google OAuth credentials

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
