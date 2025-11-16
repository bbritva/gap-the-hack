# Mock Quiz Flow Documentation

## Overview
This document explains how the mock quiz generation works when teachers upload documents and how students can join sessions from their phones.

## Teacher Flow

### 1. Create Session with Document Upload
**Page:** `/teacher/create`

1. Teacher enters session title
2. Teacher uploads a PDF document (drag & drop or file select)
3. On submit, the system:
   - Generates 3 mock quiz questions automatically
   - Creates a session in the database with a unique 4-digit code
   - Stores the questions in the database
   - Redirects teacher to session management page

### 2. Mock Quiz Generation
**File:** `/lib/mock-quiz-generator.ts`

The mock quiz generator creates 3 default questions:
- **Question 1:** Foundation level - "What is the main topic covered in this document?"
- **Question 2:** Application level - "Which of the following best describes the key concept discussed?"
- **Question 3:** Analysis level - "How would you apply the information from this document?"

Each question has:
- 4 multiple choice options
- Correct answer index
- Topic classification
- Difficulty level (foundation/application/analysis)
- Points (100 per question)

### 3. Session Management
**Page:** `/teacher/session/[id]`

Teachers can:
- View the unique 4-digit session code
- Share the code with students
- Monitor student participation
- Start/end the session
- View real-time analytics

## Student Flow

### 1. Join Session
**Page:** `/student/join`

1. Student enters their name
2. Student enters the 4-digit code from teacher
3. System validates the code against the database
4. If valid, student proceeds to interests page

### 2. Select Interests (Optional)
**Page:** `/student/interests`

1. Student selects their interests from 12 options
2. Student can skip this step
3. On continue, student is registered in the session
4. Student is redirected to the session waiting page

### 3. Session Waiting Page
**Page:** `/student/session/[sessionId]`

Students see:
- Welcome message with their name
- Session title
- Waiting message for teacher to start
- Quick tips for the quiz
- Session information

### 4. Quiz Page (When Started)
**Page:** `/student/quiz/[sessionId]`

Students can:
- Answer questions one by one
- See their score and streak
- Get immediate feedback
- View results at the end

## API Endpoints

### Session Creation
**POST** `/api/sessions/create`
```json
{
  "title": "Session Title",
  "expected_students": 25,
  "questions": [
    {
      "question_text": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "topic": "Topic",
      "difficulty": "foundation",
      "points": 100
    }
  ]
}
```

### Session Validation
**GET** `/api/sessions/validate?code=1234`

Returns:
```json
{
  "valid": true,
  "session": {
    "id": 1,
    "title": "Session Title",
    "code": "1234"
  }
}
```

### Student Join
**POST** `/api/students/join`
```json
{
  "name": "Student Name",
  "code": "1234",
  "interests": ["sports", "music"]
}
```

Returns:
```json
{
  "studentId": 1,
  "sessionId": 1,
  "student": {...},
  "session": {...}
}
```

### Get Questions
**GET** `/api/questions?sessionId=1`

Returns:
```json
{
  "questions": [
    {
      "id": 1,
      "question_text": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "topic": "Topic",
      "difficulty": "foundation",
      "points": 100
    }
  ]
}
```

## Database Schema

### Sessions Table
- `id` - Primary key
- `teacher_id` - Foreign key to teachers
- `title` - Session title
- `code` - Unique 4-digit code
- `status` - 'active' or 'ended'
- `created_at` - Timestamp

### Questions Table
- `id` - Primary key
- `session_id` - Foreign key to sessions
- `question_text` - Question text
- `options` - JSON array of options
- `correct_answer` - Index of correct option
- `topic` - Question topic
- `difficulty` - 'foundation', 'application', or 'analysis'
- `points` - Points for correct answer
- `order_index` - Display order

### Students Table
- `id` - Primary key
- `session_id` - Foreign key to sessions
- `name` - Student name
- `interests` - JSON array of interests
- `joined_at` - Timestamp

### Responses Table
- `id` - Primary key
- `student_id` - Foreign key to students
- `question_id` - Foreign key to questions
- `answer` - Student's answer
- `is_correct` - Boolean
- `time_taken` - Time in seconds
- `created_at` - Timestamp

## Mobile Access

Students can access the quiz from their phones by:
1. Opening a web browser on their phone
2. Navigating to the application URL
3. Going to `/student/join`
4. Entering their name and the 4-digit code
5. Following the flow described above

The UI is fully responsive and optimized for mobile devices with:
- Touch-friendly buttons
- Large input fields
- Clear typography
- Smooth animations
- Dark mode support

## Testing the Flow

### As Teacher:
1. Go to `/teacher/create`
2. Enter a session title (e.g., "Test Session")
3. Upload any PDF file
4. Click "Create Session from PDF"
5. Note the 4-digit code displayed

### As Student (on phone):
1. Open browser on phone
2. Go to `/student/join`
3. Enter your name
4. Enter the 4-digit code from teacher
5. Select interests or skip
6. Wait on the session page

### Verify:
- Session appears in teacher dashboard
- Student appears in session participants
- Questions are loaded correctly
- All 3 mock questions are available

## Future Enhancements

The mock quiz generator can be replaced with:
- AI-powered PDF analysis
- OpenAI GPT integration
- Custom question templates
- Question difficulty adjustment
- Multi-language support
- Image-based questions
- Video content analysis

## Notes

- The mock quiz generator is a placeholder for AI-powered question generation
- All data is stored in Vercel Postgres database
- Session codes are unique and validated
- Students can join from any device with a web browser
- The system supports real-time updates (when WebSocket is enabled)
