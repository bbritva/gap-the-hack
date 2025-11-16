# PDF Upload & AI Integration TODO

## ✅ Completed
- [x] Create TODO file to track progress

## 🔄 In Progress

## 📋 Pending

### 1. Dependencies Installation
- [ ] Add pdf-parse for PDF extraction
- [ ] Add @anthropic-ai/sdk for Claude API
- [ ] Add formidable for file handling in Next.js

### 2. Backend Implementation
- [ ] Create PDF extraction utility with 5s timeout
- [ ] Create Claude AI service for question generation
- [ ] Update Session type to include courseContent
- [ ] Create PDF upload endpoint (/api/sessions/upload-pdf)
- [ ] Create checkpoint generation endpoint (/api/checkpoint/generate)
- [ ] Update mock database to handle courseContent

### 3. Frontend Implementation
- [ ] Create PDF upload component with loading spinner
- [ ] Update teacher create page with PDF upload option
- [ ] Add checkpoint generation button in active session
- [ ] Add manual concept input fallback UI

### 4. Testing & Configuration
- [ ] Test PDF upload with timeout handling
- [ ] Test fallback to manual input
- [ ] Configure Claude API key in environment variables
- [ ] Test question generation from course content
