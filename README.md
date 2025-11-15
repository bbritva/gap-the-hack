# Next.js App with Google Authentication

A minimal Next.js application featuring Google OAuth authentication, a home page, and a user account page.

## Features

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- NextAuth.js v5 for authentication
- Google OAuth integration
- Protected routes with middleware
- Responsive design with dark mode support

## Pages

- **Home (`/`)**: Landing page with Google sign-in button
- **Account (`/account`)**: Protected user account page showing profile information

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Google Cloud Console project with OAuth 2.0 credentials

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy your Client ID and Client Secret

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
AUTH_SECRET=your-auth-secret-here-generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AUTH_URL=http://localhost:3000
```

Generate a secure `AUTH_SECRET`:

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
.
├── app/
│   ├── account/
│   │   └── page.tsx          # User account page (protected)
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts  # NextAuth API route
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── auth.ts                   # NextAuth configuration
├── middleware.ts             # Route protection middleware
└── .env.local                # Environment variables (not committed)
```

## Authentication Flow

1. User visits the home page
2. Clicks "Sign in with Google"
3. Redirected to Google OAuth consent screen
4. After approval, redirected back to the app
5. User can access protected `/account` page
6. User can sign out to return to the home page

## Protected Routes

The `/account` route is protected by middleware. Unauthenticated users are automatically redirected to the home page.

## Technologies Used

- **Next.js 16**: React framework with App Router
- **NextAuth.js v5**: Authentication library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS v4**: Utility-first CSS framework
- **pnpm**: Fast, disk space efficient package manager

## Development

### Type Checking

```bash
pnpm tsc --noEmit
```

### Linting

```bash
pnpm lint
```

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## License

MIT
