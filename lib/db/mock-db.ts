// Mock database for MVP - Replace with Vercel Postgres later
import { Session, Question, Student, Response, Teacher } from '../types';

// Use global to persist data across hot reloads in development
const globalForDb = global as unknown as {
  teachers: Teacher[];
  sessions: Session[];
  questions: Question[];
  students: Student[];
  responses: Response[];
  teacherId: number;
  sessionId: number;
  questionId: number;
  studentId: number;
  responseId: number;
};

// Initialize or reuse existing data
const teachers = globalForDb.teachers || [];
const sessions = globalForDb.sessions || [];
const questions = globalForDb.questions || [];
const students = globalForDb.students || [];
const responses = globalForDb.responses || [];

let teacherId = globalForDb.teacherId || 1;
let sessionId = globalForDb.sessionId || 1;
let questionId = globalForDb.questionId || 1;
let studentId = globalForDb.studentId || 1;
let responseId = globalForDb.responseId || 1;

// Store in global to persist across hot reloads
globalForDb.teachers = teachers;
globalForDb.sessions = sessions;
globalForDb.questions = questions;
globalForDb.students = students;
globalForDb.responses = responses;

// Helper to generate 4-digit code
export function generateSessionCode(): string {
  let code: string;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (sessions.some(s => s.code === code && s.status === 'active'));
  return code;
}

// Teacher operations
export async function createTeacher(email: string, name: string): Promise<Teacher> {
  const teacher: Teacher = {
    id: teacherId++,
    email,
    name,
    created_at: new Date(),
  };
  teachers.push(teacher);
  globalForDb.teacherId = teacherId;
  return teacher;
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  return teachers.find(t => t.email === email) || null;
}

// Session operations
export async function createSession(teacherId: number, title: string, courseContent?: string): Promise<Session> {
  const session: Session = {
    id: sessionId++,
    teacher_id: teacherId,
    title,
    code: generateSessionCode(),
    status: 'active',
    courseContent,
    created_at: new Date(),
    started_at: new Date(),
  };
  sessions.push(session);
  globalForDb.sessionId = sessionId;
  
  console.log('[DB] Session created:', {
    id: session.id,
    title: session.title,
    code: session.code,
    hasCourseContent: !!courseContent,
    contentLength: courseContent?.length || 0,
    totalSessions: sessions.length
  });
  
  return session;
}

export async function getSessionByCode(code: string): Promise<Session | null> {
  return sessions.find(s => s.code === code && s.status === 'active') || null;
}

export async function getSessionById(id: number): Promise<Session | null> {
  const session = sessions.find(s => s.id === id) || null;
  console.log('[DB] getSessionById:', {
    requestedId: id,
    found: !!session,
    totalSessions: sessions.length,
    allSessionIds: sessions.map(s => ({ id: s.id, title: s.title, code: s.code }))
  });
  return session;
}

export async function getSessionsByTeacher(teacherId: number): Promise<Session[]> {
  return sessions.filter(s => s.teacher_id === teacherId);
}

export async function endSession(id: number): Promise<void> {
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.status = 'ended';
    session.ended_at = new Date();
  }
}

export async function updateSessionQuizSettings(
  id: number,
  quizTimeLimit: number
): Promise<Session | null> {
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.quizTimeLimit = quizTimeLimit;
    session.quizStatus = 'not_started';
    console.log('[DB] Session quiz settings updated:', {
      sessionId: id,
      quizTimeLimit,
      quizStatus: 'not_started'
    });
  }
  return session || null;
}

export async function startQuiz(id: number): Promise<Session | null> {
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.quizStatus = 'in_progress';
    session.quizStartedAt = new Date();
    console.log('[DB] Quiz started:', {
      sessionId: id,
      startedAt: session.quizStartedAt,
      timeLimit: session.quizTimeLimit
    });
  }
  return session || null;
}

export async function completeQuiz(id: number): Promise<Session | null> {
  const session = sessions.find(s => s.id === id);
  if (session) {
    session.quizStatus = 'completed';
    console.log('[DB] Quiz completed:', {
      sessionId: id
    });
  }
  return session || null;
}

// Question operations
export async function createQuestion(
  sessionId: number,
  questionText: string,
  options: string[],
  correctAnswer: number,
  topic?: string,
  difficulty: 'foundation' | 'application' | 'analysis' = 'application',
  points: number = 100,
  orderIndex: number = 0
): Promise<Question> {
  const question: Question = {
    id: questionId++,
    session_id: sessionId,
    question_text: questionText,
    options,
    correct_answer: correctAnswer,
    topic,
    difficulty,
    points,
    order_index: orderIndex,
    created_at: new Date(),
  };
  questions.push(question);
  globalForDb.questionId = questionId;
  
  console.log('[DB] Question created:', {
    id: question.id,
    sessionId: question.session_id,
    text: questionText.substring(0, 50) + '...',
    totalQuestions: questions.length
  });
  
  return question;
}

export async function getQuestionsBySession(sessionId: number): Promise<Question[]> {
  const sessionQuestions = questions
    .filter(q => q.session_id === sessionId)
    .sort((a, b) => a.order_index - b.order_index);
  
  console.log('[DB] getQuestionsBySession:', {
    sessionId,
    count: sessionQuestions.length
  });
  
  return sessionQuestions;
}

export async function getQuestionById(id: number): Promise<Question | null> {
  return questions.find(q => q.id === id) || null;
}

// Student operations
export async function createStudent(
  sessionId: number,
  name: string,
  interests?: string[]
): Promise<Student> {
  const student: Student = {
    id: studentId++,
    session_id: sessionId,
    name,
    interests,
    joined_at: new Date(),
  };
  students.push(student);
  globalForDb.studentId = studentId;
  return student;
}

export async function getStudentsBySession(sessionId: number): Promise<Student[]> {
  return students.filter(s => s.session_id === sessionId);
}

export async function getStudentById(id: number): Promise<Student | null> {
  return students.find(s => s.id === id) || null;
}

// Response operations
export async function createResponse(
  studentId: number,
  questionId: number,
  answer: string,
  isCorrect: boolean,
  timeTaken?: number
): Promise<Response> {
  const response: Response = {
    id: responseId++,
    student_id: studentId,
    question_id: questionId,
    answer,
    is_correct: isCorrect,
    time_taken: timeTaken,
    created_at: new Date(),
  };
  responses.push(response);
  globalForDb.responseId = responseId;
  return response;
}

export async function getResponsesByStudent(studentId: number): Promise<Response[]> {
  return responses.filter(r => r.student_id === studentId);
}

export async function getResponsesByQuestion(questionId: number): Promise<Response[]> {
  return responses.filter(r => r.question_id === questionId);
}

export async function getResponsesBySession(sessionId: number): Promise<Response[]> {
  const sessionStudents = await getStudentsBySession(sessionId);
  const studentIds = sessionStudents.map(s => s.id);
  return responses.filter(r => studentIds.includes(r.student_id));
}

// Analytics
export async function getSessionStats(sessionId: number) {
  const sessionStudents = await getStudentsBySession(sessionId);
  const sessionQuestions = await getQuestionsBySession(sessionId);
  const sessionResponses = await getResponsesBySession(sessionId);

  const totalStudents = sessionStudents.length;
  const correctResponses = sessionResponses.filter(r => r.is_correct).length;
  const averageScore = sessionResponses.length > 0 
    ? (correctResponses / sessionResponses.length) * 100 
    : 0;

  const questionStats = sessionQuestions.map(q => {
    const questionResponses = sessionResponses.filter(r => r.question_id === q.id);
    const correctCount = questionResponses.filter(r => r.is_correct).length;
    const totalTime = questionResponses.reduce((sum, r) => sum + (r.time_taken || 0), 0);
    
    return {
      questionId: q.id,
      questionText: q.question_text,
      topic: q.topic,
      correctPercentage: questionResponses.length > 0 
        ? (correctCount / questionResponses.length) * 100 
        : 0,
      averageTime: questionResponses.length > 0 
        ? totalTime / questionResponses.length 
        : 0,
      totalResponses: questionResponses.length,
    };
  });

  return {
    totalStudents,
    activeStudents: totalStudents,
    averageScore,
    questionStats,
    students: sessionStudents,
  };
}

export async function getLeaderboard(sessionId: number) {
  const sessionStudents = await getStudentsBySession(sessionId);
  const sessionQuestions = await getQuestionsBySession(sessionId);
  
  const leaderboard = await Promise.all(
    sessionStudents.map(async (student) => {
      const studentResponses = await getResponsesByStudent(student.id);
      const correctAnswers = studentResponses.filter(r => r.is_correct).length;
      const totalTime = studentResponses.reduce((sum, r) => sum + (r.time_taken || 0), 0);
      
      // Calculate score: correct answers * 100 + speed bonus
      const baseScore = correctAnswers * 100;
      const speedBonus = studentResponses.length > 0 
        ? Math.max(0, 500 - totalTime / studentResponses.length) 
        : 0;
      const score = Math.round(baseScore + speedBonus);
      
      return {
        studentId: student.id,
        name: student.name,
        score,
        correctAnswers,
        totalQuestions: sessionQuestions.length,
      };
    })
  );
  
  return leaderboard.sort((a, b) => b.score - a.score);
}

// Seed some demo data
export async function seedDemoData() {
  // Create a demo teacher
  const teacher = await createTeacher('demo@teacher.com', 'Demo Teacher');
  
  // Create a demo session
  const session = await createSession(teacher.id, 'Introduction to Biology');
  
  // Add some questions
  await createQuestion(
    session.id,
    'What is the powerhouse of the cell?',
    ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'],
    1,
    'Cell Biology',
    'foundation',
    100,
    0
  );
  
  await createQuestion(
    session.id,
    'Which process do plants use to make food?',
    ['Respiration', 'Photosynthesis', 'Fermentation', 'Digestion'],
    1,
    'Plant Biology',
    'foundation',
    100,
    1
  );
  
  await createQuestion(
    session.id,
    'What is DNA an abbreviation for?',
    ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Dual Nuclear Acid', 'Dynamic Nucleic Acid'],
    0,
    'Genetics',
    'application',
    100,
    2
  );
  
  await createQuestion(
    session.id,
    'How many chromosomes do humans have?',
    ['23', '46', '48', '92'],
    1,
    'Genetics',
    'application',
    100,
    3
  );
  
  await createQuestion(
    session.id,
    'What is the largest organ in the human body?',
    ['Heart', 'Liver', 'Skin', 'Brain'],
    2,
    'Human Anatomy',
    'foundation',
    100,
    4
  );
  
  return { teacher, session };
}

// Debug function to check database state
export function getDbState() {
  return {
    teachers: teachers.length,
    sessions: sessions.length,
    questions: questions.length,
    students: students.length,
    responses: responses.length,
    sessionDetails: sessions.map(s => ({ id: s.id, title: s.title, code: s.code }))
  };
}
