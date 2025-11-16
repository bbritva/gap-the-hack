/**
 * Mock Quiz Generator
 * Generates sample quiz questions when a teacher uploads a document
 * This simulates AI-powered question generation from PDF content
 */

export interface MockQuestion {
  question_text: string;
  options: string[];
  correct_answer: number;
  topic: string;
  difficulty: 'foundation' | 'application' | 'analysis';
  points: number;
}

/**
 * Generates mock quiz questions based on uploaded file
 * In production, this would analyze the PDF content using AI
 */
export function generateMockQuiz(fileName: string): MockQuestion[] {
  // Default quiz questions that work for any topic
  const mockQuestions: MockQuestion[] = [
    {
      question_text: "What is the main topic covered in this document?",
      options: [
        "Introduction to the subject",
        "Advanced concepts",
        "Historical background",
        "Practical applications"
      ],
      correct_answer: 0,
      topic: "General Understanding",
      difficulty: "foundation",
      points: 100
    },
    {
      question_text: "Which of the following best describes the key concept discussed?",
      options: [
        "A fundamental principle",
        "A complex theory",
        "A practical method",
        "An experimental approach"
      ],
      correct_answer: 0,
      topic: "Core Concepts",
      difficulty: "application",
      points: 100
    },
    {
      question_text: "How would you apply the information from this document?",
      options: [
        "By understanding the basics first",
        "By memorizing all details",
        "By skipping to advanced topics",
        "By ignoring the fundamentals"
      ],
      correct_answer: 0,
      topic: "Application",
      difficulty: "analysis",
      points: 100
    }
  ];

  return mockQuestions;
}

/**
 * Simulates processing time for PDF analysis
 */
export async function simulatePDFProcessing(file: File): Promise<MockQuestion[]> {
  // Simulate processing delay (optional - can be removed for instant results)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return generateMockQuiz(file.name);
}
