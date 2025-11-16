import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/utils/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionText, options, studentInterests, concept } = body;

    console.log('Personalization request:', {
      questionText: questionText?.substring(0, 50) + '...',
      studentInterests,
      concept
    });

    // Validate inputs
    if (!questionText) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    if (!studentInterests || !Array.isArray(studentInterests) || studentInterests.length === 0) {
      return NextResponse.json(
        { error: 'Student interests are required' },
        { status: 400 }
      );
    }

    // Select random interest from student's interests (max 3)
    const interestsToUse = studentInterests.slice(0, 3);
    const selectedInterest = interestsToUse[Math.floor(Math.random() * interestsToUse.length)];

    console.log('Selected interest for personalization:', selectedInterest);

    // Personalize the question using AI
    try {
      const personalizedQuestion = await aiService.personalizeQuestion({
        genericQuestion: questionText,
        options,
        interest: selectedInterest,
        concept
      });

      console.log('Question personalized successfully');

      return NextResponse.json({
        success: true,
        personalizedQuestion: personalizedQuestion.question,
        options: personalizedQuestion.options,
        usedInterest: selectedInterest
      });
    } catch (error) {
      console.error('Failed to personalize question:', error);
      
      // Fallback: return original question if AI fails
      return NextResponse.json({
        success: true,
        personalizedQuestion: questionText,
        options,
        usedInterest: null,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error personalizing question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
