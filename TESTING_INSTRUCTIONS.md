# Testing Instructions - Mock Quiz Flow

## Quick Start Testing

### Prerequisites
1. Ensure the database is initialized (Vercel Postgres)
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

### Test Scenario 1: Teacher Creates Session

1. **Navigate to Teacher Create Page**
   ```
   http://localhost:3000/teacher/create
   ```

2. **Fill in the form:**
   - Session Title: "Test Biology Quiz"
   - Expected Students: 25 (optional)
   - Upload any PDF file (the content doesn't matter - mock questions will be generated)

3. **Submit the form**
   - Click "Create Session from PDF"
   - Wait for processing (should be quick)

4. **Verify Success:**
   - You should be redirected to `/teacher/session/[id]`
   - You should see a 4-digit code (e.g., "1234")
   - You should see "3 questions" in the session details
   - Note down this code for student testing

### Test Scenario 2: Student Joins from Phone

#### Option A: Using Phone Browser
1. **Get your local IP address:**
   ```bash
   # On Mac/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

2. **On your phone, open browser and navigate to:**
   ```
   http://[YOUR_IP]:3000/student/join
   ```
   Example: `http://192.168.1.100:3000/student/join`

3. **Fill in the form:**
   - Name: "John Doe"
   - Code: [The 4-digit code from teacher]

4. **Click "Join Session"**

5. **Select Interests (or skip)**
   - Choose some interests or click "Skip for now"

6. **Verify Success:**
   - You should see the welcome page
   - Your name should be displayed
   - Session title should be shown
   - You should see "Waiting for teacher to start"

#### Option B: Using Desktop Browser (for quick testing)
1. **Open a new incognito/private window**
2. **Navigate to:**
   ```
   http://localhost:3000/student/join
   ```
3. **Follow steps 3-6 from Option A**

### Test Scenario 3: Verify Database

1. **Check Session was Created:**
   - Go to teacher dashboard: `http://localhost:3000/teacher/dashboard`
   - You should see your test session listed
   - Status should be "Active"

2. **Check Questions were Generated:**
   - In the session page, you should see 3 questions
   - Each question should have:
     - Question text
     - 4 options
     - Topic
     - Difficulty level

3. **Check Student Joined:**
   - In the session page, you should see the student listed
   - Student name should match what was entered
   - Join time should be recent

### Test Scenario 4: Multiple Students

1. **Open multiple browser windows/tabs (incognito)**
2. **Have each "student" join with different names:**
   - Student 1: "Alice"
   - Student 2: "Bob"
   - Student 3: "Charlie"
3. **Use the same 4-digit code for all**
4. **Verify all students appear in teacher's session view**

### Expected Mock Questions

When you create a session, these 3 questions should be generated:

**Question 1 (Foundation):**
- Text: "What is the main topic covered in this document?"
- Options: 
  - Introduction to the subject ✓
  - Advanced concepts
  - Historical background
  - Practical applications

**Question 2 (Application):**
- Text: "Which of the following best describes the key concept discussed?"
- Options:
  - A fundamental principle ✓
  - A complex theory
  - A practical method
  - An experimental approach

**Question 3 (Analysis):**
- Text: "How would you apply the information from this document?"
- Options:
  - By understanding the basics first ✓
  - By memorizing all details
  - By skipping to advanced topics
  - By ignoring the fundamentals

### Troubleshooting

#### Issue: "Invalid code" error
- **Solution:** Make sure you're using the exact 4-digit code from the teacher session
- **Check:** Code is case-sensitive and must be exactly 4 digits

#### Issue: Session not found
- **Solution:** Verify the session was created successfully
- **Check:** Look in teacher dashboard for the session

#### Issue: Can't access from phone
- **Solution:** Make sure phone and computer are on the same WiFi network
- **Check:** Firewall settings might be blocking port 3000

#### Issue: Database errors
- **Solution:** Ensure Vercel Postgres is configured
- **Check:** `.env.local` file has correct database credentials

#### Issue: Build errors
- **Solution:** Run `npm install` again
- **Check:** Node version is 18 or higher

### API Testing (Optional)

You can also test the APIs directly using curl or Postman:

#### Create Session
```bash
curl -X POST http://localhost:3000/api/sessions/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Session",
    "questions": [
      {
        "question_text": "Test question?",
        "options": ["A", "B", "C", "D"],
        "correct_answer": 0,
        "topic": "Test",
        "difficulty": "foundation",
        "points": 100
      }
    ]
  }'
```

#### Validate Code
```bash
curl http://localhost:3000/api/sessions/validate?code=1234
```

#### Join Session
```bash
curl -X POST http://localhost:3000/api/students/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "code": "1234",
    "interests": ["sports", "music"]
  }'
```

### Success Criteria

✅ Teacher can upload PDF and create session
✅ 3 mock questions are generated automatically
✅ Unique 4-digit code is created
✅ Student can join using the code
✅ Student sees welcome page after joining
✅ Multiple students can join the same session
✅ All data is stored in database
✅ No TypeScript errors in build
✅ Mobile-responsive UI works on phone

### Next Steps

After successful testing:
1. Replace mock quiz generator with AI-powered PDF analysis
2. Implement real-time session updates with WebSocket
3. Add quiz start/stop functionality
4. Implement scoring and leaderboard
5. Add session analytics and reporting

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the server logs in terminal
3. Verify database connection
4. Review the MOCK_QUIZ_FLOW.md documentation
