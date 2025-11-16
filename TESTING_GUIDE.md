# Testing Guide - Demo Session with Mock Storage

This guide shows you how to test the session creation and student joining flow without needing database setup.

## Quick Start

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the test page** in your browser:
   ```
   http://localhost:3000/test-session.html
   ```

## Testing Flow

### Step 1: Create a Session

1. In the test page, click **"Create Session"**
2. You'll see a 4-digit code displayed (e.g., `7859`)
3. The session is created with 3 default quiz questions:
   - Geography: "What is the capital of France?"
   - Science: "Which planet is known as the Red Planet?"
   - Math: "What is 15 + 27?"

### Step 2: Validate the Code

1. The code is automatically filled in the "Test Student Join" section
2. Click **"Validate Code"** to verify the session exists
3. You should see "✅ Valid Code!" with session details

### Step 3: Join as a Student

1. Enter a student name (or use the default "Test Student")
2. Click **"Join Session"**
3. You should see "✅ Successfully Joined!" with student and session IDs

### Step 4: View Questions

1. The session ID is automatically filled
2. Click **"View Questions"** to see all 3 quiz questions
3. The correct answers are highlighted in green

## API Endpoints (Demo/Mock)

These endpoints use in-memory storage and don't require database setup:

- **POST** `/api/sessions/create-demo` - Create a session with 3 default questions
- **GET** `/api/sessions/validate-demo?code=XXXX` - Validate a session code
- **POST** `/api/students/join-demo` - Student joins a session
- **GET** `/api/questions-demo?sessionId=X` - Get questions for a session

## Testing with cURL

### Create a session:
```bash
curl -X POST http://localhost:3000/api/sessions/create-demo \
  -H "Content-Type: application/json" \
  -d '{"title":"My Test Quiz"}'
```

### Validate code (replace 7859 with your code):
```bash
curl "http://localhost:3000/api/sessions/validate-demo?code=7859"
```

### Join as student:
```bash
curl -X POST http://localhost:3000/api/students/join-demo \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","code":"7859","interests":[]}'
```

### Get questions:
```bash
curl "http://localhost:3000/api/questions-demo?sessionId=1"
```

## Default Questions

The demo session includes these 3 questions:

1. **Geography** (Knowledge): What is the capital of France?
   - Options: London, Berlin, Paris ✓, Madrid

2. **Science** (Knowledge): Which planet is known as the Red Planet?
   - Options: Venus, Mars ✓, Jupiter, Saturn

3. **Math** (Application): What is 15 + 27?
   - Options: 40, 41, 42 ✓, 43

## Notes

- The mock storage is in-memory, so data is lost when the server restarts
- Session codes are randomly generated 4-digit numbers
- All sessions are created by a demo teacher (ID: 1)
- Sessions are automatically set to "active" status

## Next Steps

Once you've verified the flow works:
1. Set up Vercel Postgres database (see VERCEL_DB_SETUP.md)
2. Switch to the real database endpoints (remove `-demo` suffix)
3. The flow will work exactly the same but with persistent storage
