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
export async function createSession(teacherId: number, title: string, expectedStudents?: number): Promise<Session> {
  const session: Session = {
    id: sessionId++,
    teacher_id: teacherId,
    title,
    code: generateSessionCode(),
    status: 'active',
    expected_students: expectedStudents,
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

// Mock student names for simulation
const MOCK_STUDENT_NAMES = [
  'Alex Johnson', 'Emma Smith', 'Michael Brown', 'Sophia Davis', 'James Wilson',
  'Olivia Martinez', 'William Garcia', 'Ava Rodriguez', 'Benjamin Lee', 'Isabella Walker',
  'Lucas Hall', 'Mia Allen', 'Henry Young', 'Charlotte King', 'Alexander Wright',
  'Amelia Lopez', 'Daniel Hill', 'Harper Scott', 'Matthew Green', 'Evelyn Adams',
  'Jackson Baker', 'Abigail Nelson', 'Sebastian Carter', 'Emily Mitchell', 'David Perez',
  'Elizabeth Roberts', 'Joseph Turner', 'Sofia Phillips', 'Samuel Campbell', 'Avery Parker',
  'Owen Evans', 'Ella Edwards', 'Jack Collins', 'Scarlett Stewart', 'Luke Sanchez',
  'Grace Morris', 'Ryan Rogers', 'Chloe Reed', 'Nathan Cook', 'Zoey Morgan',
  'Isaac Bell', 'Lily Murphy', 'Gabriel Bailey', 'Hannah Rivera', 'Anthony Cooper',
  'Aria Richardson', 'Dylan Cox', 'Layla Howard', 'Christopher Ward', 'Nora Torres'
];

// Simulation state - simplified
interface SimulationState {
  sessionId: number;
  isRunning: boolean;
  studentIds: number[];
}

const simulations: Map<number, SimulationState> = new Map();

// Calculate success rate based on difficulty
function getSuccessRate(difficulty: 'foundation' | 'application' | 'analysis'): number {
  switch (difficulty) {
    case 'foundation':
      return 0.70 + Math.random() * 0.20; // 70-90%
    case 'application':
      return 0.50 + Math.random() * 0.20; // 50-70%
    case 'analysis':
      return 0.30 + Math.random() * 0.20; // 30-50%
    default:
      return 0.60;
  }
}

// Simulate student answering a question
async function simulateStudentAnswer(studentId: number, question: Question) {
  const successRate = getSuccessRate(question.difficulty);
  const isCorrect = Math.random() < successRate;
  const answer = isCorrect 
    ? question.options[question.correct_answer]
    : question.options[Math.floor(Math.random() * question.options.length)];
  
  // Random time between 5-15 seconds
  const timeTaken = 5 + Math.floor(Math.random() * 11);
  
  await createResponse(studentId, question.id, answer, isCorrect, timeTaken);
}

// Start simulation for a session - SIMPLIFIED VERSION
export async function startSimulation(sessionId: number) {
  // Stop existing simulation if any
  stopSimulation(sessionId);

  const session = await getSessionById(sessionId);
  if (!session || session.status !== 'active') {
    return;
  }

  // Get all questions for this session
  const questions = await getQuestionsBySession(sessionId);
  if (questions.length === 0) {
    console.error('No questions found for session', sessionId);
    return;
  }

  // Create new simulation state
  const simulation: SimulationState = {
    sessionId,
    isRunning: true,
    studentIds: [],
  };

  simulations.set(sessionId, simulation);

  // STEP 1: Add all 21 students immediately
  const targetStudents = 21;
  console.log(`Starting simulation for session ${sessionId}: Adding ${targetStudents} students...`);
  
  for (let i = 0; i < targetStudents; i++) {
    const studentName = MOCK_STUDENT_NAMES[i % MOCK_STUDENT_NAMES.length];
    const student = await createStudent(sessionId, studentName);
    simulation.studentIds.push(student.id);
  }

  console.log(`Added ${simulation.studentIds.length} students to session ${sessionId}`);

  // STEP 2: Each student answers all questions with staggered timing
  for (let studentIndex = 0; studentIndex < simulation.studentIds.length; studentIndex++) {
    const studentId = simulation.studentIds[studentIndex];
    
    // Each student starts at a slightly different time (0-3 seconds apart)
    const studentStartDelay = studentIndex * 150; // 150ms between each student starting
    
    // Each student answers all questions
    for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
      const question = questions[questionIndex];
      
      // Each question takes 5-15 seconds to answer
      // Questions are answered sequentially by each student
      const questionDelay = studentStartDelay + (questionIndex * (7000 + Math.random() * 5000));
      
      setTimeout(async () => {
        if (simulation.isRunning) {
          await simulateStudentAnswer(studentId, question);
        }
      }, questionDelay);
    }
  }

  // STEP 3: Stop simulation after all students have answered all questions
  // Max time = (21 students * 150ms) + (8 questions * 15 seconds max) = ~123 seconds
  const maxSimulationTime = (targetStudents * 150) + (questions.length * 15000) + 5000; // +5s buffer
  setTimeout(() => {
    console.log(`Simulation completed for session ${sessionId}`);
    stopSimulation(sessionId);
  }, maxSimulationTime);
}

// Stop simulation for a session
export function stopSimulation(sessionId: number) {
  const simulation = simulations.get(sessionId);
  if (simulation) {
    simulation.isRunning = false;
    simulations.delete(sessionId);
  }
}

// Check if simulation is running
export function isSimulationRunning(sessionId: number): boolean {
  const simulation = simulations.get(sessionId);
  return simulation ? simulation.isRunning : false;
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
