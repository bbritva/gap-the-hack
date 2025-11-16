# Testing Guide - PDF Upload & AI Integration

## ✅ Pre-Testing Checklist

- [x] Dependencies installed (`npm install`)
- [x] Development server running (`npm run dev`)
- [ ] Blackbox API key configured in `.env.local`
- [ ] Sample PDF file ready for testing

## 🧪 Testing Scenarios

### 1. PDF Upload Flow (Critical Path)

#### Test 1.1: Successful PDF Upload
**Steps:**
1. Navigate to `http://localhost:3000/teacher/create`
2. Click "Upload PDF" toggle
3. Enter session title: "Test Biology Session"
4. Drag and drop a PDF file (< 10MB)
5. Enable "Generate questions automatically"
6. Set number of questions to 5
7. Click "Create Session with PDF"

**Expected Results:**
- ✅ Loading spinner appears during extraction
- ✅ PDF text is extracted within 5 seconds
- ✅ 5 questions are generated automatically
- ✅ Session is created with a 4-digit code
- ✅ Redirect to session dashboard

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 1.2: PDF Upload Without Auto-Generation
**Steps:**
1. Navigate to `/teacher/create`
2. Toggle to "Upload PDF"
3. Upload PDF file
4. Disable "Generate questions automatically"
5. Click "Create Session with PDF"

**Expected Results:**
- ✅ PDF text extracted and stored
- ✅ Session created without questions
- ✅ Can add questions manually later

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### 2. File Validation Tests

#### Test 2.1: File Size Limit
**Steps:**
1. Try to upload a PDF > 10MB

**Expected Results:**
- ✅ Error message: "File size must be less than 10MB"
- ✅ Upload is rejected

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 2.2: Invalid File Type
**Steps:**
1. Try to upload a .docx or .txt file

**Expected Results:**
- ✅ Error message: "Please upload a PDF file"
- ✅ Upload is rejected

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 2.3: Empty File
**Steps:**
1. Try to upload an empty PDF

**Expected Results:**
- ✅ Error message displayed
- ✅ Fallback to manual input

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### 3. Timeout & Fallback Tests

#### Test 3.1: PDF Extraction Timeout
**Steps:**
1. Upload a very large or complex PDF (that takes > 5 seconds)

**Expected Results:**
- ✅ After 5 seconds, timeout occurs
- ✅ Message: "Unable to extract the PDF. Type the concept to be evaluated:"
- ✅ Manual input field appears
- ✅ Session can still be created

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 3.2: Corrupted PDF
**Steps:**
1. Upload a corrupted or password-protected PDF

**Expected Results:**
- ✅ Extraction fails gracefully
- ✅ Fallback message appears
- ✅ Manual input option available

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 3.3: Scanned PDF (Image-based)
**Steps:**
1. Upload a scanned PDF (no text layer)

**Expected Results:**
- ✅ Extraction returns empty or minimal text
- ✅ Fallback to manual input
- ✅ Clear error message

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### 4. Checkpoint Generation (Critical Path)

#### Test 4.1: Generate Checkpoint in Active Session
**Steps:**
1. Create a session with PDF
2. Navigate to session view
3. Click "🎯 Generate Checkpoint" button
4. Enter concept: "Photosynthesis"
5. Select 5 questions
6. Click "Generate Questions"

**Expected Results:**
- ✅ Modal opens correctly
- ✅ Loading spinner during generation
- ✅ 5 questions generated and added
- ✅ Success message displayed
- ✅ Questions appear in session
- ✅ Modal closes automatically

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 4.2: Checkpoint with Different Question Counts
**Steps:**
1. Test with 3, 5, 7, and 10 questions

**Expected Results:**
- ✅ Correct number of questions generated each time
- ✅ Questions are relevant to the concept

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 4.3: Checkpoint Without Course Content
**Steps:**
1. Create session without PDF (manual mode)
2. Try to generate checkpoint

**Expected Results:**
- ✅ Questions still generated (using concept only)
- ✅ Or appropriate error message if course content required

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### 5. AI Integration Tests

#### Test 5.1: With Valid Blackbox API Key
**Steps:**
1. Ensure BLACKBOX_API_KEY is set in `.env.local`
2. Upload PDF and generate questions

**Expected Results:**
- ✅ Real questions generated from Blackbox AI
- ✅ Questions are relevant and well-formatted
- ✅ All fields populated (question, options, correct answer)

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 5.2: Without API Key (Mock Mode)
**Steps:**
1. Remove or comment out BLACKBOX_API_KEY
2. Restart server
3. Try to generate questions

**Expected Results:**
- ✅ Console warning: "No BLACKBOX_API_KEY found, using mock questions"
- ✅ Mock questions generated successfully
- ✅ Session creation continues normally

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 5.3: Invalid API Key
**Steps:**
1. Set BLACKBOX_API_KEY to invalid value
2. Try to generate questions

**Expected Results:**
- ✅ API error caught gracefully
- ✅ Fallback to mock questions
- ✅ Error logged to console

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### 6. API Endpoint Tests (Using curl)

#### Test 6.1: POST /api/sessions/upload-pdf
```bash
curl -X POST http://localhost:3000/api/sessions/upload-pdf \
  -F "pdf=@sample.pdf" \
  -F "title=Test Session" \
  -F "generateQuestions=true" \
  -F "numQuestions=5"
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": 123,
  "code": "4567",
  "extractionFailed": false,
  "questionsGenerated": 5,
  "message": "Session created successfully with PDF content."
}
```

**Actual Results:**
- [ ] Pass / [ ] Fail
- Response: _______________

---

#### Test 6.2: POST /api/checkpoint/generate
```bash
curl -X POST http://localhost:3000/api/checkpoint/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": 123,
    "concept": "Cell Biology",
    "numQuestions": 3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "questionsGenerated": 3,
  "concept": "Cell Biology",
  "message": "Generated 3 questions for concept: Cell Biology"
}
```

**Actual Results:**
- [ ] Pass / [ ] Fail
- Response: _______________

---

### 7. UI/UX Tests

#### Test 7.1: Loading States
**Steps:**
1. Upload PDF and observe loading indicators
2. Generate checkpoint and observe loading

**Expected Results:**
- ✅ Spinner appears during PDF extraction
- ✅ "Extracting PDF..." message shown
- ✅ "Generating..." shown during AI generation
- ✅ Buttons disabled during processing

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 7.2: Error Messages
**Steps:**
1. Trigger various errors (invalid file, timeout, etc.)

**Expected Results:**
- ✅ Clear, user-friendly error messages
- ✅ Red/warning styling for errors
- ✅ Errors don't crash the application

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 7.3: Modal Interactions
**Steps:**
1. Open checkpoint modal
2. Try to close with X button
3. Try to close with Cancel button
4. Try to close by clicking outside

**Expected Results:**
- ✅ Modal opens smoothly
- ✅ All close methods work
- ✅ Form resets on close
- ✅ No data loss

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 7.4: Responsive Design
**Steps:**
1. Test on different screen sizes
2. Test mobile view

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ All buttons accessible
- ✅ Text readable on all devices

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### 8. Integration Tests

#### Test 8.1: End-to-End Flow
**Steps:**
1. Upload PDF with auto-generation
2. View created session
3. Generate checkpoint
4. Verify questions appear
5. Student joins session
6. Student answers questions

**Expected Results:**
- ✅ Complete flow works seamlessly
- ✅ Data persists correctly
- ✅ Students see all questions

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 8.2: Multiple Checkpoints
**Steps:**
1. Create session with PDF
2. Generate checkpoint 1 (concept A, 3 questions)
3. Generate checkpoint 2 (concept B, 5 questions)
4. Generate checkpoint 3 (concept C, 3 questions)

**Expected Results:**
- ✅ All checkpoints created successfully
- ✅ Total 11 questions in session
- ✅ Questions properly ordered
- ✅ No duplicates

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### 9. Edge Cases

#### Test 9.1: Very Long PDF
**Steps:**
1. Upload a PDF with 100+ pages

**Expected Results:**
- ✅ Extraction completes or times out gracefully
- ✅ Content truncated if too long (8000 chars)
- ✅ Questions still generated

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 9.2: Special Characters in PDF
**Steps:**
1. Upload PDF with special characters, equations, symbols

**Expected Results:**
- ✅ Text extracted correctly
- ✅ Special characters handled
- ✅ Questions generated appropriately

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

#### Test 9.3: Concurrent Uploads
**Steps:**
1. Try uploading multiple PDFs simultaneously

**Expected Results:**
- ✅ Each upload processed independently
- ✅ No race conditions
- ✅ All sessions created correctly

**Actual Results:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

## 📊 Test Summary

### Critical Path Tests
- [ ] PDF Upload Flow: ___/3 passed
- [ ] Checkpoint Generation: ___/3 passed
- [ ] API Endpoints: ___/2 passed

### Comprehensive Tests
- [ ] File Validation: ___/3 passed
- [ ] Timeout & Fallback: ___/3 passed
- [ ] AI Integration: ___/3 passed
- [ ] UI/UX: ___/4 passed
- [ ] Integration: ___/2 passed
- [ ] Edge Cases: ___/3 passed

### Overall Score: ___/26 tests passed

---

## 🐛 Issues Found

| Issue # | Severity | Description | Status |
|---------|----------|-------------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## ✅ Sign-off

- [ ] All critical path tests passed
- [ ] All major issues resolved
- [ ] Documentation updated
- [ ] Ready for production

**Tested by:** _______________
**Date:** _______________
**Notes:** _______________
