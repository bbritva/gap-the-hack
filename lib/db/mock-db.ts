// Mock database for MVP - Replace with Vercel Postgres later
import { Session, Question, Student, Response, Teacher } from '../types';

// In-memory storage
let teachers: Teacher[] = [];
let sessions: Session[] = [];
let questions: Question[] = [];
let students: Student[] = [];
let responses: Response[] = [];

let teacherId = 1;
let sessionId = 1;
let questionId = 1;
let studentId = 1;
let responseId = 1;

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
  return teacher;
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  return teachers.find(t => t.email === email) || null;
}

// Session operations
export async function createSession(teacherId: number, title: string): Promise<Session> {
  const session: Session = {
    id: sessionId++,
    teacher_id: teacherId,
    title,
    code: generateSessionCode(),
    status: 'active',
    created_at: new Date(),
    started_at: new Date(),
  };
  sessions.push(session);
  return session;
}

export async function getSessionByCode(code: string): Promise<Session | null> {
  return sessions.find(s => s.code === code && s.status === 'active') || null;
}

export async function getSessionById(id: number): Promise<Session | null> {
  return sessions.find(s => s.id === id) || null;
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
  return question;
}

export async function getQuestionsBySession(sessionId: number): Promise<Question[]> {
  return questions
    .filter(q => q.session_id === sessionId)
    .sort((a, b) => a.order_index - b.order_index);
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
