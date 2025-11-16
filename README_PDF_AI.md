# PDF Upload & AI Question Generation System

## Overview
This system allows teachers to upload course PDFs and automatically generate quiz questions using Blackbox AI. It includes a synchronous PDF processing system with automatic fallback for extraction failures.

## Features

### 1. PDF Upload with AI Integration
- **Upload course materials** as PDF files (max 10MB)
- **Automatic text extraction** with 5-second timeout
- **AI-powered question generation** using Blackbox AI API
- **Fallback to manual input** if PDF extraction fails

### 2. Checkpoint System
- Generate questions during live sessions
- Use uploaded course content as context
- Specify concepts for targeted question generation
- Adjustable number and difficulty of questions

### 3. Dual Creation Modes
- **PDF Mode**: Upload PDF and auto-generate questions
- **Manual Mode**: Create questions manually

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Blackbox AI API
Create a `.env.local` file in the root directory:
```env
BLACKBOX_API_KEY=your_blackbox_api_key_here
```

Get your API key from: https://www.blackbox.ai/

### 3. Run the Application
```bash
npm run dev
```

## Usage Guide

### Creating a Session with PDF

1. Navigate to **Create Session** page
2. Select **Upload PDF** mode
3. Enter session title
4. Choose your PDF file (max 10MB)
5. Toggle "Generate questions automatically" (optional)
6. Set number of questions to generate (1-20)
7. Click **Create Session with PDF**

### Handling PDF Extraction Failures

If PDF extraction takes longer than 5 seconds or fails:
1. You'll see: "Unable to extract the PDF. Type the concept to be evaluated:"
2. Enter the concept manually
3. Session will be created without stored course content
4. You can still add questions manually during the session

### Generating Questions During Session (Checkpoint)

During an active session, you can generate additional questions:

1. Click the **"🎯 Generate Checkpoint"** button
2. Enter the concept you just explained
3. Select number of questions (3, 5, 7, or 10)
4. Click **"Generate Questions"**
5. Questions are automatically added to the session

**API Call Example:**
```javascript
POST /api/checkpoint/generate
{
  "sessionId": 123,
  "concept": "Cell Biology",
  "numQuestions": 5,
  "difficulty": "mixed"
}
```

## API Endpoints

### 1. Upload PDF and Create Session
**POST** `/api/sessions/upload-pdf`

**Form Data:**
- `pdf`: PDF file (required)
- `title`: Session title (required)
- `generateQuestions`: "true" or "false"
- `numQuestions`: Number of questions (1-20)

**Response:**
```json
{
  "success": true,
  "sessionId": 123,
  "code": "4567",
  "extractionFailed": false,
  "questionsGenerated": 5,
  "questions": [...],
  "message": "Session created successfully with PDF content."
}
```

### 2. Generate Checkpoint Questions
**POST** `/api/checkpoint/generate`

**Body:**
```json
{
  "sessionId": 123,
  "concept": "Photosynthesis",
  "numQuestions": 3,
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "questionsGenerated": 3,
  "questions": [...],
  "concept": "Photosynthesis",
  "message": "Generated 3 questions for concept: Photosynthesis"
}
```

## Technical Details

### PDF Processing
- Uses `pdf-parse` library for text extraction
- 5-second timeout for extraction
- Synchronous processing with loading indicator
- Automatic fallback to manual input on failure

### AI Integration (Blackbox AI)
- **API**: Blackbox AI Chat API
- **Endpoint**: `https://api.blackbox.ai/api/chat`
- **Model**: `blackboxai`
- Generates MCQs with 4 options
- Includes difficulty levels and explanations
- Mock questions available for testing without API key

### File Structure
```
lib/
├── utils/
│   ├── pdf-extractor.ts    # PDF text extraction with timeout
│   └── ai-service.ts        # Blackbox AI integration
├── types.ts                 # Updated Session type with courseContent
└── db/
    └── mock-db.ts           # Updated to handle courseContent

app/
├── api/
│   ├── sessions/
│   │   └── upload-pdf/      # PDF upload endpoint
│   └── checkpoint/
│       └── generate/        # Checkpoint generation endpoint
├── components/
│   └── pdf-upload.tsx       # PDF upload component
└── teacher/
    ├── create/
    │   └── page.tsx         # Updated with PDF/Manual modes
    └── session/
        └── [id]/
            └── page.tsx     # Active session with checkpoint button
```

## Troubleshooting

### PDF Extraction Fails
- Ensure PDF is text-based (not scanned image)
- Check file size is under 10MB
- Try a different PDF format
- Use manual concept input as fallback

### AI Questions Not Generating
- Verify Blackbox API key is set correctly in `.env.local`
- Check API key is valid
- System will use mock questions if API fails
- Check console logs for detailed error messages

### Upload Errors
- Check network connection
- Verify file is a valid PDF
- Ensure server is running
- Check browser console for errors

## Testing Without API Key

The system includes mock question generation for testing:
1. Don't set `BLACKBOX_API_KEY` in `.env.local`
2. Upload PDF and enable question generation
3. System will generate sample questions
4. Perfect for development and testing

## Environment Variables

Required in `.env.local`:
```env
# Blackbox AI API Key
BLACKBOX_API_KEY=your_api_key_here

# Other existing variables
AUTH_SECRET=your_auth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
```

## Dependencies

### Production Dependencies
- `pdf-parse`: ^1.1.1 - PDF text extraction
- `formidable`: ^3.5.1 - File upload handling
- `next`: 16.0.3 - React framework
- `react`: 19.2.0 - UI library

### Development Dependencies
- `@types/pdf-parse`: ^1.1.4 - TypeScript types for pdf-parse
- `@types/formidable`: ^3.4.5 - TypeScript types for formidable
- `typescript`: ^5 - TypeScript compiler

## Future Enhancements

- [ ] Support for multiple file formats (DOCX, TXT)
- [ ] OCR support for scanned PDFs
- [ ] Batch PDF processing
- [ ] Question bank management
- [ ] Custom AI prompts for different subjects
- [ ] Question quality scoring
- [ ] Student performance-based question generation
- [ ] Export questions to various formats
- [ ] Question difficulty auto-adjustment based on student performance

## License

This project is part of the QuizClass educational platform.
