import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { createSession } from '@/lib/db/mock-db';
import { extractPDFText } from '@/lib/utils/pdf-extractor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    const title = formData.get('title') as string;

    if (!pdfFile || !title) {
      return NextResponse.json(
        { error: 'PDF file and title are required' },
        { status: 400 }
      );
    }

    console.log('Processing PDF upload:', {
      filename: pdfFile.name,
      size: pdfFile.size,
      type: pdfFile.type,
      title
    });

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF with timeout
    let courseContent = '';
    let extractionFailed = false;
    let message = '';

    const extractionResult = await extractPDFText(buffer);
    
    if (extractionResult.success && extractionResult.text) {
      courseContent = extractionResult.text;
      console.log('PDF text extracted successfully, length:', courseContent.length);
    } else {
      extractionFailed = true;
      message = extractionResult.error || 'Unable to extract the PDF. You can create questions manually during the session using the "Generate Checkpoint" button.';
      console.error('PDF extraction failed:', extractionResult.error);
    }

    // Create session with course content (even if extraction failed)
    const session = await createSession(1, title, courseContent || undefined);
    
    console.log('Session created:', {
      sessionId: session.id,
      code: session.code,
      hasCourseContent: !!courseContent,
      contentLength: courseContent.length
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      code: session.code,
      extractionFailed,
      message: extractionFailed ? message : 'Session created successfully! Use "Generate Checkpoint" to create questions during your class.'
    });

  } catch (error) {
    console.error('Error processing PDF upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
