import { NextRequest, NextResponse } from 'next/server';
import { createSession, createQuestion, startSimulation } from '@/lib/db/mock-db';

// Mock question generator - generates realistic quiz questions
function generateMockQuestions(title: string): Array<{
  question_text: string;
  options: string[];
  correct_answer: number;
  topic: string;
  difficulty: 'foundation' | 'application' | 'analysis';
  order_index: number;
}> {
  const topics = ['Introduction', 'Core Concepts', 'Applications', 'Advanced Topics', 'Case Studies'];
  const difficulties: Array<'foundation' | 'application' | 'analysis'> = ['foundation', 'foundation', 'application', 'application', 'analysis'];
  
  const questionTemplates = [
    {
      foundation: [
        { q: 'What is the primary definition of {topic}?', opts: ['Definition A', 'Definition B', 'Definition C', 'Definition D'] },
        { q: 'Which of the following best describes {topic}?', opts: ['Description A', 'Description B', 'Description C', 'Description D'] },
        { q: 'What are the key characteristics of {topic}?', opts: ['Characteristics A', 'Characteristics B', 'Characteristics C', 'Characteristics D'] },
      ],
      application: [
        { q: 'How would you apply {topic} in a real-world scenario?', opts: ['Approach A', 'Approach B', 'Approach C', 'Approach D'] },
        { q: 'Given a situation involving {topic}, what would be the best solution?', opts: ['Solution A', 'Solution B', 'Solution C', 'Solution D'] },
        { q: 'Which method is most effective when implementing {topic}?', opts: ['Method A', 'Method B', 'Method C', 'Method D'] },
      ],
      analysis: [
        { q: 'Analyze the relationship between {topic} and its broader implications.', opts: ['Analysis A', 'Analysis B', 'Analysis C', 'Analysis D'] },
        { q: 'Evaluate the effectiveness of {topic} in complex scenarios.', opts: ['Evaluation A', 'Evaluation B', 'Evaluation C', 'Evaluation D'] },
        { q: 'Compare and contrast different approaches to {topic}.', opts: ['Comparison A', 'Comparison B', 'Comparison C', 'Comparison D'] },
      ],
    },
  ];

  const questions = [];
  const numQuestions = 8; // Generate 8 questions

  for (let i = 0; i < numQuestions; i++) {
    const topic = topics[i % topics.length];
    const difficulty = difficulties[i % difficulties.length];
    const templates = questionTemplates[0][difficulty];
    const template = templates[i % templates.length];
    
    questions.push({
      question_text: template.q.replace('{topic}', topic),
      options: template.opts,
      correct_answer: Math.floor(Math.random() * 4), // Random correct answer
      topic: topic,
      difficulty: difficulty,
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
    const questionsToCreate = questions && questions.length > 0 
      ? questions 
      : generateMockQuestions(title);

    // Create session (using demo teacher ID for MVP)
    const session = await createSession(1, title, expected_students);

    // Create questions
    for (const q of questionsToCreate) {
      await createQuestion(
        session.id,
        q.question_text,
        q.options,
        q.correct_answer,
        q.topic,
        q.difficulty,
        q.order_index
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
