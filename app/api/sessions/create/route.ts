import { NextRequest, NextResponse } from 'next/server';
import { createSession, createQuestion, startSimulation } from '@/lib/db/mock-db';

// Mock question generator - ALWAYS generates exactly 8 questions
// Distribution: 2 foundation, 3 application, 3 analysis
function generateMockQuestions(title: string): Array<{
  question_text: string;
  options: string[];
  correct_answer: number;
  topic: string;
  difficulty: 'foundation' | 'application' | 'analysis';
  order_index: number;
}> {
  const topics = ['Introduction', 'Core Concepts', 'Applications', 'Advanced Topics', 'Case Studies', 'Best Practices', 'Real-world Examples', 'Summary'];
  
  // Exactly 8 questions with specific difficulty distribution
  const questionConfigs = [
    { difficulty: 'foundation' as const, topic: topics[0] },
    { difficulty: 'foundation' as const, topic: topics[1] },
    { difficulty: 'application' as const, topic: topics[2] },
    { difficulty: 'application' as const, topic: topics[3] },
    { difficulty: 'application' as const, topic: topics[4] },
    { difficulty: 'analysis' as const, topic: topics[5] },
    { difficulty: 'analysis' as const, topic: topics[6] },
    { difficulty: 'analysis' as const, topic: topics[7] },
  ];
  
  const questionTemplates = {
    foundation: [
      { q: 'What is the primary definition of {topic}?', opts: ['Definition A', 'Definition B', 'Definition C', 'Definition D'] },
      { q: 'Which of the following best describes {topic}?', opts: ['Description A', 'Description B', 'Description C', 'Description D'] },
      { q: 'What are the key characteristics of {topic}?', opts: ['Characteristics A', 'Characteristics B', 'Characteristics C', 'Characteristics D'] },
      { q: 'Identify the main components of {topic}.', opts: ['Components A', 'Components B', 'Components C', 'Components D'] },
    ],
    application: [
      { q: 'How would you apply {topic} in a real-world scenario?', opts: ['Approach A', 'Approach B', 'Approach C', 'Approach D'] },
      { q: 'Given a situation involving {topic}, what would be the best solution?', opts: ['Solution A', 'Solution B', 'Solution C', 'Solution D'] },
      { q: 'Which method is most effective when implementing {topic}?', opts: ['Method A', 'Method B', 'Method C', 'Method D'] },
      { q: 'What strategy would you use to optimize {topic}?', opts: ['Strategy A', 'Strategy B', 'Strategy C', 'Strategy D'] },
    ],
    analysis: [
      { q: 'Analyze the relationship between {topic} and its broader implications.', opts: ['Analysis A', 'Analysis B', 'Analysis C', 'Analysis D'] },
      { q: 'Evaluate the effectiveness of {topic} in complex scenarios.', opts: ['Evaluation A', 'Evaluation B', 'Evaluation C', 'Evaluation D'] },
      { q: 'Compare and contrast different approaches to {topic}.', opts: ['Comparison A', 'Comparison B', 'Comparison C', 'Comparison D'] },
      { q: 'Critically assess the limitations and benefits of {topic}.', opts: ['Assessment A', 'Assessment B', 'Assessment C', 'Assessment D'] },
    ],
  };

  const questions = [];

  // Generate exactly 8 questions
  for (let i = 0; i < 8; i++) {
    const config = questionConfigs[i];
    const templates = questionTemplates[config.difficulty];
    const template = templates[i % templates.length];
    
    questions.push({
      question_text: template.q.replace('{topic}', config.topic),
      options: template.opts,
      correct_answer: Math.floor(Math.random() * 4), // Random correct answer
      topic: config.topic,
      difficulty: config.difficulty,
      order_index: i,
    });
  }

  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, questions, expected_students } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate mock questions if none provided (PDF upload scenario)
    // ALWAYS ensure we have exactly 8 questions
    let questionsToCreate = questions && questions.length > 0 
      ? questions 
      : generateMockQuestions(title);
    
    // Ensure exactly 8 questions
    if (questionsToCreate.length > 8) {
      questionsToCreate = questionsToCreate.slice(0, 8);
    } else if (questionsToCreate.length < 8) {
      // If less than 8, generate mock questions to fill
      const mockQuestions = generateMockQuestions(title);
      questionsToCreate = [...questionsToCreate, ...mockQuestions.slice(questionsToCreate.length)].slice(0, 8);
    }

    // Create session (using demo teacher ID for MVP)
    const session = await createSession(1, title, expected_students || 21);

    // Create exactly 8 questions
    for (let i = 0; i < questionsToCreate.length; i++) {
      const q = questionsToCreate[i];
      await createQuestion(
        session.id,
        q.question_text,
        q.options,
        q.correct_answer,
        q.topic,
        q.difficulty || 'application',
        100,
        i
      );
    }

    // Auto-start mock student simulation
    startSimulation(session.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      code: session.code,
      questionsGenerated: questionsToCreate.length,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
