# PDF Upload & AI Integration TODO

## ✅ Completed
- [x] Create TODO file to track progress
- [x] Add pdf-parse for PDF extraction
- [x] Add formidable for file handling in Next.js
- [x] Configure Blackbox AI API integration
- [x] Create PDF extraction utility with 5s timeout
- [x] Create Blackbox AI service for question generation
- [x] Update Session type to include courseContent
- [x] Create PDF upload endpoint (/api/sessions/upload-pdf)
- [x] Create checkpoint generation endpoint (/api/checkpoint/generate)
- [x] Update mock database to handle courseContent
- [x] Create PDF upload component with loading spinner
- [x] Update teacher create page with PDF upload option
- [x] Add manual concept input fallback UI
- [x] Add checkpoint generation button in active session

## 🔄 In Progress
- [ ] Testing & Configuration

## 📋 Pending

### Testing & Configuration
- [ ] Install dependencies with npm install
- [ ] Configure Blackbox API key in environment variables
- [ ] Test PDF upload with timeout handling
- [ ] Test fallback to manual input
- [ ] Test question generation from course content

### Environment Setup Required
Create a `.env.local` file with:
```
BLACKBOX_API_KEY=your_blackbox_api_key_here
```

## Features Implemented

### 1. PDF Upload System
- Synchronous PDF processing (3-5 seconds)
- 5-second timeout with automatic fallback
- File validation (PDF only, max 10MB)
- Loading spinner during processing
- Success/error messaging

### 2. AI Integration
- Blackbox AI API integration for question generation
- Automatic question generation from PDF content
- Checkpoint system for generating questions during course
- Mock questions for testing without API key

### 3. Fallback Handling
- Manual concept input when PDF extraction fails
- Clear error messaging: "Unable to extract the PDF. Type the concept to be evaluated:"
- Session creation continues even if extraction fails

### 4. User Interface
- Toggle between PDF upload and manual creation modes
- PDF upload component with all options
- Automatic question generation toggle
- Number of questions selector (1-20)
- Progress indicators and status messages

## API Endpoints

1. **POST /api/sessions/upload-pdf**
   - Handles PDF file upload
   - Extracts text with timeout
   - Creates session with course content
   - Optionally generates questions

2. **POST /api/checkpoint/generate**
   - Generates questions during active session
   - Requires session ID and concept
   - Uses stored course content for context

## Next Steps

1. Run `npm install` to install new dependencies
2. Add Blackbox API key to environment variables
3. Test the PDF upload functionality
4. Test checkpoint generation in active sessions
