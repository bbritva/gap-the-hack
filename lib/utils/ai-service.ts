export interface GeneratedQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface QuestionGenerationParams {
  courseContent: string;
  concept: string;
  numQuestions: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

class AIService {
  private apiKey: string | null = null;
  private apiUrl = 'https://api.blackbox.ai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.BLACKBOX_API_KEY || null;
  }

  /**
   * Generates quiz questions based on course content and specific concept
   */
  async generateQuestions(params: QuestionGenerationParams): Promise<GeneratedQuestion[]> {
    const { courseContent, concept, numQuestions, difficulty = 'mixed' } = params;

    // If no API key, return mock questions for testing
    if (!this.apiKey) {
      console.warn('No BLACKBOX_API_KEY found, using mock questions');
      return this.generateMockQuestions(concept, numQuestions);
    }

    try {
      const prompt = `You are an expert educator creating quiz questions. Based on the following course content and the specific concept just explained, generate ${numQuestions} multiple-choice questions.

Course Content:
${courseContent.substring(0, 8000)}

Concept just explained: ${concept}

Requirements:
1. Questions should directly relate to the concept "${concept}"
2. Each question should have 4 options (A, B, C, D)
3. Include a mix of difficulty levels: ${difficulty}
4. Questions should test understanding, not just memorization
5. Make distractors (wrong answers) plausible but clearly incorrect

Return ONLY a valid JSON array in this exact format (no markdown, no code blocks):
[
  {
    "question": "Question text here",
    "options": {
      "A": "Option A text",
      "B": "Option B text", 
      "C": "Option C text",
      "D": "Option D text"
    },
    "correct": "A",
    "topic": "${concept}",
    "difficulty": "medium",
    "explanation": "Brief explanation of why this answer is correct"
  }
]`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'blackboxai/anthropic/claude-sonnet-4.5',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Blackbox API error response:', errorText);
        throw new Error(`Blackbox API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Blackbox API response:', JSON.stringify(data).substring(0, 500));
      
      try {
        // Extract content from Blackbox API response
        const content = data.choices?.[0]?.message?.content || data.content || '';
        console.log('Extracted content:', content.substring(0, 300));
        
        // Remove markdown code blocks if present
        let jsonText = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        console.log('After removing markdown:', jsonText.substring(0, 300));
        
        // Find JSON array in the response
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          console.log('JSON match found:', jsonMatch[0].substring(0, 200));
          const rawQuestions = JSON.parse(jsonMatch[0]);
          console.log('Parsed questions count:', rawQuestions.length);
          
          // Normalize the response format
          const questions = rawQuestions.map((q: any) => {
            // Handle different option formats
            let options = { A: '', B: '', C: '', D: '' };
            if (Array.isArray(q.options)) {
              options = {
                A: q.options[0] || '',
                B: q.options[1] || '',
                C: q.options[2] || '',
                D: q.options[3] || ''
              };
            } else if (typeof q.options === 'object' && q.options !== null) {
              options = {
                A: q.options.A || q.options['0'] || '',
                B: q.options.B || q.options['1'] || '',
                C: q.options.C || q.options['2'] || '',
                D: q.options.D || q.options['3'] || ''
              };
            }
            
            // Handle correct answer format
            let correct = q.correct || q.correct_answer || 'A';
            // If correct answer is the actual text, find which option it matches
            if (correct && correct.length > 1) {
              const optionEntries = Object.entries(options);
              const match = optionEntries.find(([_, value]) => value === correct);
              correct = match ? match[0] : 'A';
            }
            
            return {
              question: q.question,
              options,
              correct: correct as 'A' | 'B' | 'C' | 'D',
              topic: q.topic || concept,
              difficulty: q.difficulty || 'medium',
              explanation: q.explanation || ''
            };
          });
          
          return questions.slice(0, numQuestions);
        }
      } catch (parseError) {
        console.error('Failed to parse Blackbox AI response:', parseError);
        console.error('Response was:', data);
      }

      // Fallback to mock questions if parsing fails
      return this.generateMockQuestions(concept, numQuestions);
    } catch (error) {
      console.error('Blackbox AI service error:', error);
      // Fallback to mock questions
      return this.generateMockQuestions(concept, numQuestions);
    }
  }

  /**
   * Generates mock questions for testing or when AI service is unavailable
   */
  private generateMockQuestions(concept: string, numQuestions: number): GeneratedQuestion[] {
    const mockQuestions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < numQuestions; i++) {
      mockQuestions.push({
        question: `Sample question ${i + 1} about ${concept}?`,
        options: {
          A: `Option A for question ${i + 1}`,
          B: `Option B for question ${i + 1}`,
          C: `Option C for question ${i + 1}`,
          D: `Option D for question ${i + 1}`
        },
        correct: (['A', 'B', 'C', 'D'] as const)[Math.floor(Math.random() * 4)],
        topic: concept,
        difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
        explanation: `This is the correct answer because it relates to ${concept}.`
      });
    }

    return mockQuestions;
  }

  /**
   * Generates questions from PDF content without specific concept
   */
  async generateQuestionsFromContent(
    courseContent: string, 
    numQuestions: number = 5
  ): Promise<GeneratedQuestion[]> {
    if (!this.apiKey) {
      console.warn('No BLACKBOX_API_KEY found, using mock questions');
      return this.generateMockQuestions('General Content', numQuestions);
    }

    try {
      const prompt = `Based on the following course content, generate ${numQuestions} comprehensive multiple-choice questions that cover the main topics.

Course Content:
${courseContent.substring(0, 8000)}

Requirements:
1. Cover different topics from the content
2. Each question should have 4 options (A, B, C, D)
3. Include a mix of difficulty levels
4. Test understanding and application

Return ONLY a valid JSON array (no markdown, no code blocks) in this format:
[
  {
    "question": "Question text",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "correct": "A",
    "topic": "Topic name",
    "difficulty": "medium",
    "explanation": "Explanation"
  }
]`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'blackboxai/anthropic/claude-sonnet-4.5',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Blackbox API error response:', errorText);
        throw new Error(`Blackbox API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Blackbox API response:', JSON.stringify(data).substring(0, 500));
      
      try {
        // Extract content from Blackbox API response
        const content = data.choices?.[0]?.message?.content || data.content || '';
        console.log('Extracted content (generateQuestionsFromContent):', content.substring(0, 300));
        
        // Remove markdown code blocks if present
        let jsonText = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        console.log('After removing markdown (generateQuestionsFromContent):', jsonText.substring(0, 300));
        
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          console.log('JSON match found (generateQuestionsFromContent):', jsonMatch[0].substring(0, 200));
          const rawQuestions = JSON.parse(jsonMatch[0]);
          console.log('Parsed questions count (generateQuestionsFromContent):', rawQuestions.length);
          
          // Normalize the response format
          const questions = rawQuestions.map((q: any) => {
            // Handle different option formats
            let options = { A: '', B: '', C: '', D: '' };
            if (Array.isArray(q.options)) {
              options = {
                A: q.options[0] || '',
                B: q.options[1] || '',
                C: q.options[2] || '',
                D: q.options[3] || ''
              };
            } else if (typeof q.options === 'object') {
              options = {
                A: q.options.A || q.options['0'] || '',
                B: q.options.B || q.options['1'] || '',
                C: q.options.C || q.options['2'] || '',
                D: q.options.D || q.options['3'] || ''
              };
            }
            
            // Handle correct answer format
            let correct = q.correct || q.correct_answer || 'A';
            // If correct answer is the actual text, find which option it matches
            if (correct.length > 1) {
              const optionEntries = Object.entries(options);
              const match = optionEntries.find(([_, value]) => value === correct);
              correct = match ? match[0] : 'A';
            }
            
            return {
              question: q.question,
              options,
              correct: correct as 'A' | 'B' | 'C' | 'D',
              topic: q.topic || 'General',
              difficulty: q.difficulty || 'medium',
              explanation: q.explanation || ''
            };
          });
          
          return questions.slice(0, numQuestions);
        }
      } catch (parseError) {
        console.error('Failed to parse Blackbox AI response:', parseError);
      }

      return this.generateMockQuestions('General Content', numQuestions);
    } catch (error) {
      console.error('Blackbox AI service error:', error);
      return this.generateMockQuestions('General Content', numQuestions);
    }
  }

  /**
   * Personalizes a generic question based on student's interest
   */
  async personalizeQuestion(params: {
    genericQuestion: string;
    options: { A: string; B: string; C: string; D: string };
    interest: string;
    concept: string;
  }): Promise<{ question: string; options: { A: string; B: string; C: string; D: string } }> {
    const { genericQuestion, options, interest, concept } = params;

    // If no API key, return original question
    if (!this.apiKey) {
      console.warn('No BLACKBOX_API_KEY found, returning original question');
      return { question: genericQuestion, options };
    }

    try {
      const prompt = `You are an expert educator. Rewrite this quiz question to make it more engaging by contextualizing it with the student's interest: "${interest}".

Original Question: ${genericQuestion}
Original Options:
A: ${options.A}
B: ${options.B}
C: ${options.C}
D: ${options.D}

Concept being taught: ${concept}
Student's interest: ${interest}

Requirements:
1. Keep the SAME mathematical/conceptual difficulty
2. Keep the SAME correct answer
3. Contextualize the question using "${interest}" theme
4. Make it relatable and engaging for someone interested in ${interest}
5. Ensure the question still tests understanding of ${concept}
6. Keep options concise and clear

Return ONLY a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "question": "Rewritten question text with ${interest} context",
  "options": {
    "A": "Rewritten option A",
    "B": "Rewritten option B",
    "C": "Rewritten option C",
    "D": "Rewritten option D"
  }
}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'blackboxai/anthropic/claude-sonnet-4.5',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Blackbox API error response (personalize):', errorText);
        throw new Error(`Blackbox API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Blackbox API response (personalize):', JSON.stringify(data).substring(0, 300));
      
      try {
        const content = data.choices?.[0]?.message?.content || data.content || '';
        
        // Remove markdown code blocks if present
        let jsonText = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        
        // Find JSON object in the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const personalizedData = JSON.parse(jsonMatch[0]);
          
          return {
            question: personalizedData.question || genericQuestion,
            options: personalizedData.options || options
          };
        }
      } catch (parseError) {
        console.error('Failed to parse personalization response:', parseError);
      }

      // Fallback to original question
      return { question: genericQuestion, options };
    } catch (error) {
      console.error('Question personalization error:', error);
      // Fallback to original question
      return { question: genericQuestion, options };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
