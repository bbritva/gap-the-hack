# Next.js App with Google Authentication

A modern Next.js application featuring Google OAuth authentication, built with TypeScript and Tailwind CSS.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with NextAuth.js v5
- 🏠 **Home Page** - Public landing page with feature highlights
- 👤 **Account Page** - Protected user profile page
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Next.js 15** - Built with the latest Next.js App Router
- 🔒 **Protected Routes** - Middleware-based route protection

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Google Cloud Console account

### 1. Clone and Install

```bash
# Install dependencies
pnpm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - Add your production URL when deploying
   - Copy the Client ID and Client Secret

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── account/
│   │   └── page.tsx          # Protected account page
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts  # NextAuth API routes
│   ├── layout.tsx            # Root layout with header
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── SignInButton.tsx      # Google sign-in button
│   └── SignOutButton.tsx     # Sign-out button
├── auth.ts                   # NextAuth configuration
├── middleware.ts             # Route protection middleware
└── .env.local.example        # Environment variables template
```

## How It Works

### Authentication Flow

1. User clicks "Sign in with Google"
2. NextAuth redirects to Google OAuth consent screen
3. User approves the application
4. Google redirects back with authorization code
5. NextAuth exchanges code for user profile
6. Session is created and stored
7. User is redirected to the account page

### Route Protection

The `/account` route is protected by middleware. Unauthenticated users are automatically redirected to the home page.

## Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Update `NEXTAUTH_URL` to your production URL
5. Add your production URL to Google OAuth authorized redirect URIs

### Other Platforms

Make sure to:
- Set all environment variables
- Update `NEXTAUTH_URL` to your production domain
- Add production callback URL to Google OAuth settings

## Technologies Used

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **NextAuth.js v5** - Authentication library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **pnpm** - Fast, disk space efficient package manager

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

## License

MIT
