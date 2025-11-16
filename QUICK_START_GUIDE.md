# Quick Start Guide - Mock Quiz System

## Prerequisites
- Node.js 22+ installed
- Vercel Postgres database configured (see VERCEL_DB_SETUP.md)
- Environment variables set up (see .env.example)

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing the Complete Flow

### Step 1: Teacher Creates a Session

1. Open browser and navigate to: `http://localhost:3000/teacher/create`
2. Fill in the form:
   - **Session Title**: "Test Biology Session"
   - **Expected Students**: 25 (optional)
   - **Upload PDF**: Any PDF file (content doesn't matter - mock questions will be generated)
3. Click "Create Session from PDF"
4. You'll be redirected to the session page
5. **Note the 4-digit code** displayed (e.g., "1234")

### Step 2: Student Joins from Phone

#### Option A: Using Phone Browser
1. Open your phone's browser
2. Navigate to: `http://[your-local-ip]:3000/student/join`
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `http://192.168.1.100:3000/student/join`
3. Enter student details:
   - **Name**: "John Doe"
   - **Code**: The 4-digit code from Step 1
4. Click "Join Class"
5. Select interests (or skip)
6. You should see the waiting page with session details

#### Option B: Using Desktop Browser (for testing)
1. Open a new incognito/private window
2. Navigate to: `http://localhost:3000/student/join`
3. Follow steps 3-6 from Option A

### Step 3: Verify Session

**On Teacher's Screen:**
- Session page shows the 4-digit code
- Can see session details
- Can start/end session

**On Student's Screen:**
- Waiting page shows:
  - Welcome message with student name
  - Session title
  - Tips for the quiz
  - Session ID

## Mock Quiz Questions

Every session automatically gets these 3 questions:

1. **Foundation Level**: "What is the main topic covered in this document?"
2. **Application Level**: "Which of the following best describes the key concept discussed?"
3. **Analysis Level**: "How would you apply the information from this document?"

## Troubleshooting

### Issue: "Invalid code" error
**Solution**: Make sure the session was created successfully and you're using the correct 4-digit code.

### Issue: Can't access from phone
**Solution**: 
- Ensure phone and computer are on the same WiFi network
- Use your computer's local IP address, not `localhost`
- Check firewall settings

### Issue: Database errors
**Solution**: 
- Verify Vercel Postgres is configured correctly
- Check environment variables in `.env.local`
- Run database initialization if needed

### Issue: Build fails
**Solution**:
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

## Key Features Implemented

✅ Teacher uploads PDF (any PDF works)
✅ System generates 3 mock quiz questions automatically
✅ Session created with unique 4-digit code
✅ Students can join from any device (phone, tablet, desktop)
✅ Student interest selection (optional)
✅ Student waiting page after joining
✅ All data persists in Vercel Postgres database
✅ TypeScript type-safe throughout
✅ Responsive design for mobile devices

## Next Steps

After verifying the basic flow works:

1. **Test with multiple students**: Open multiple browser windows/devices
2. **Check database**: Verify sessions, students, and questions are stored
3. **Test session lifecycle**: Create, join, start, end sessions
4. **Mobile responsiveness**: Test on different screen sizes

## API Endpoints Reference

- `POST /api/sessions/create` - Create new session with questions
- `GET /api/sessions/validate?code=XXXX` - Validate session code
- `POST /api/students/join` - Join student to session
- `GET /api/sessions/[id]` - Get session details
- `GET /api/questions?sessionId=X` - Get session questions
- `POST /api/responses` - Submit student answer

## File Structure

```
/vercel/sandbox/
├── app/
│   ├── teacher/
│   │   ├── create/page.tsx          # Teacher creates session
│   │   └── session/[id]/page.tsx    # Teacher session view
│   ├── student/
│   │   ├── join/page.tsx            # Student enters code
│   │   ├── interests/page.tsx       # Student selects interests
│   │   └── session/[sessionId]/page.tsx  # Student waiting page
│   └── api/
│       ├── sessions/
│       │   ├── create/route.ts      # Create session endpoint
│       │   └── validate/route.ts    # Validate code endpoint
│       └── students/
│           └── join/route.ts        # Join session endpoint
├── lib/
│   ├── db.ts                        # Database functions
│   ├── mock-quiz-generator.ts       # Mock quiz generation
│   └── types.ts                     # TypeScript types
└── MOCK_QUIZ_IMPLEMENTATION.md      # Detailed implementation docs
```

## Support

For issues or questions:
1. Check MOCK_QUIZ_IMPLEMENTATION.md for detailed implementation info
2. Review VERCEL_DB_SETUP.md for database configuration
3. Check console logs for error messages
4. Verify all environment variables are set correctly
