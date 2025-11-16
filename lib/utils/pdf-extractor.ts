const pdf = require('pdf-parse');

export interface PDFExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Extracts text from a PDF buffer with a 5-second timeout
 * Falls back to manual input if extraction fails or takes too long
 */
export async function extractPDFText(buffer: Buffer): Promise<PDFExtractionResult> {
  return new Promise((resolve) => {
    // Set a 5-second timeout
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        error: 'PDF extraction timed out after 5 seconds'
      });
    }, 5000);

    // Attempt to extract PDF text
    pdf(buffer)
      .then((data: any) => {
        clearTimeout(timeout);
        
        // Check if we got meaningful text
        const text = data.text.trim();
        if (!text || text.length < 100) {
          resolve({
            success: false,
            error: 'PDF appears to be empty or contains insufficient text'
          });
        } else {
          resolve({
            success: true,
            text: text
          });
        }
      })
      .catch((error: any) => {
        clearTimeout(timeout);
        console.error('PDF extraction error:', error);
        resolve({
          success: false,
          error: `Failed to extract PDF: ${error.message}`
        });
      });
  });
}

/**
 * Validates if a file is a PDF
 */
export function isPDFFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

/**
 * Validates PDF file size (max 10MB)
 */
export function validatePDFSize(sizeInBytes: number): boolean {
  const maxSizeInMB = 10;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}
