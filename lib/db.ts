import { sql } from '@vercel/postgres';
import { Session, Question, Student, Response, Teacher } from './types';
import bcrypt from 'bcryptjs';

// Database utility functions using Vercel Postgres

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Teachers table
    await sql`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        code VARCHAR(4) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        ended_at TIMESTAMP
      )
    `;

    // Questions table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        topic VARCHAR(255),
        difficulty VARCHAR(20) DEFAULT 'application',
        points INTEGER DEFAULT 100,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Students table
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        interests JSONB,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Responses table
    await sql`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        session_id INTEGER NOT NULL,
        answer INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        time_taken INTEGER,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON sessions(teacher_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_students_session ON students(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_responses_student ON responses(student_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_teachers_username ON teachers(username)`;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Teacher operations
export async function createTeacher(email: string, name: string): Promise<Teacher> {
  const result = await sql<Teacher>`
    INSERT INTO teachers (email, name)
    VALUES (${email}, ${name})
    ON CONFLICT (email) DO UPDATE SET name = ${name}
    RETURNING *
  `;
  return result.rows[0];
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  const result = await sql<Teacher>`
    SELECT * FROM teachers WHERE email = ${email}
  `;
  return result.rows[0] || null;
}

export async function getTeacherById(id: number): Promise<Teacher | null> {
  const result = await sql<Teacher>`
    SELECT * FROM teachers WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function getTeacherByUsername(username: string): Promise<Teacher | null> {
  const result = await sql<Teacher>`
    SELECT * FROM teachers WHERE username = ${username}
  `;
  return result.rows[0] || null;
}

export async function createTeacherWithPassword(
  username: string,
  password: string,
  email: string,
  name: string
): Promise<Teacher> {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await sql<Teacher>`
    INSERT INTO teachers (username, password_hash, email, name)
    VALUES (${username}, ${passwordHash}, ${email}, ${name})
    ON CONFLICT (username) DO UPDATE 
    SET password_hash = ${passwordHash}, email = ${email}, name = ${name}
    RETURNING *
  `;
  return result.rows[0];
}

export async function verifyTeacherPassword(
  username: string,
  password: string
): Promise<Teacher | null> {
  const teacher = await getTeacherByUsername(username);
  if (!teacher || !teacher.password_hash) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, teacher.password_hash);
  if (!isValid) {
    return null;
  }
  
  return teacher;
}

export async function seedTeachers(): Promise<void> {
  const teachers = [
    { username: 'teacher1', password: '123', email: 'teacher1@quizclass.com', name: 'Teacher One' },
    { username: 'teacher2', password: '123', email: 'teacher2@quizclass.com', name: 'Teacher Two' },
    { username: 'teacher3', password: '123', email: 'teacher3@quizclass.com', name: 'Teacher Three' },
    { username: 'teacher4', password: '123', email: 'teacher4@quizclass.com', name: 'Teacher Four' },
    { username: 'teacher5', password: '123', email: 'teacher5@quizclass.com', name: 'Teacher Five' },
  ];

  for (const teacher of teachers) {
    await createTeacherWithPassword(
      teacher.username,
      teacher.password,
      teacher.email,
      teacher.name
    );
  }
  
  console.log('Successfully seeded 5 teachers');
}

// Session operations
export async function createSession(
  teacherId: number,
  title: string,
  code: string
): Promise<Session> {
  const result = await sql<Session>`
    INSERT INTO sessions (teacher_id, title, code, status)
    VALUES (${teacherId}, ${title}, ${code}, 'active')
    RETURNING *
  `;
  return result.rows[0];
}

export async function getSessionById(id: number): Promise<Session | null> {
  const result = await sql<Session>`
    SELECT * FROM sessions WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function getSessionByCode(code: string): Promise<Session | null> {
  const result = await sql<Session>`
    SELECT * FROM sessions WHERE code = ${code}
  `;
  return result.rows[0] || null;
}

export async function getSessionsByTeacher(teacherId: number): Promise<Session[]> {
  const result = await sql<Session>`
    SELECT * FROM sessions 
    WHERE teacher_id = ${teacherId}
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function updateSessionStatus(
  id: number,
  status: 'active' | 'ended'
): Promise<Session | null> {
  let result;
  if (status === 'active') {
    result = await sql<Session>`
      UPDATE sessions 
      SET status = ${status}, started_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
  } else {
    result = await sql<Session>`
      UPDATE sessions 
      SET status = ${status}, ended_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
  }
  return result.rows[0] || null;
}

// Question operations
export async function createQuestion(
  sessionId: number,
  questionText: string,
  options: string[],
  correctAnswer: number,
  topic: string,
  difficulty: string,
  points: number,
  orderIndex: number
): Promise<Question> {
  const result = await sql<Question>`
    INSERT INTO questions (
      session_id, question_text, options, correct_answer, 
      topic, difficulty, points, order_index
    )
    VALUES (
      ${sessionId}, ${questionText}, ${JSON.stringify(options)}, ${correctAnswer},
      ${topic}, ${difficulty}, ${points}, ${orderIndex}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getQuestionsBySession(sessionId: number): Promise<Question[]> {
  const result = await sql<Question>`
    SELECT * FROM questions 
    WHERE session_id = ${sessionId}
    ORDER BY order_index ASC
  `;
  return result.rows;
}

export async function getQuestionById(id: number): Promise<Question | null> {
  const result = await sql<Question>`
    SELECT * FROM questions WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

// Student operations
export async function createStudent(
  sessionId: number,
  name: string,
  interests?: string[]
): Promise<Student> {
  const result = await sql<Student>`
    INSERT INTO students (session_id, name, interests)
    VALUES (${sessionId}, ${name}, ${JSON.stringify(interests || [])})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getStudentsBySession(sessionId: number): Promise<Student[]> {
  const result = await sql<Student>`
    SELECT * FROM students 
    WHERE session_id = ${sessionId}
    ORDER BY joined_at ASC
  `;
  return result.rows;
}

export async function getStudentById(id: number): Promise<Student | null> {
  const result = await sql<Student>`
    SELECT * FROM students WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

// Response operations
export async function createResponse(
  studentId: number,
  questionId: number,
  sessionId: number,
  answer: number,
  isCorrect: boolean,
  timeTaken?: number,
  pointsEarned?: number
): Promise<Response> {
  const result = await sql<Response>`
    INSERT INTO responses (
      student_id, question_id, session_id, answer, 
      is_correct, time_taken, points_earned
    )
    VALUES (
      ${studentId}, ${questionId}, ${sessionId}, ${answer},
      ${isCorrect}, ${timeTaken || null}, ${pointsEarned || 0}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getResponsesBySession(sessionId: number): Promise<Response[]> {
  const result = await sql<Response>`
    SELECT * FROM responses 
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;
  return result.rows;
}

export async function getResponsesByStudent(studentId: number): Promise<Response[]> {
  const result = await sql<Response>`
    SELECT * FROM responses 
    WHERE student_id = ${studentId}
    ORDER BY created_at ASC
  `;
  return result.rows;
}

export async function getResponsesByQuestion(questionId: number): Promise<Response[]> {
  const result = await sql<Response>`
    SELECT * FROM responses 
    WHERE question_id = ${questionId}
  `;
  return result.rows;
}

// Utility functions
export function generateUniqueCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function isCodeUnique(code: string): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*) as count FROM sessions 
    WHERE code = ${code} AND status = 'active'
  `;
  return result.rows[0].count === 0;
}

export async function generateSessionCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  do {
    code = generateUniqueCode();
    isUnique = await isCodeUnique(code);
  } while (!isUnique);

  return code;
}

// Analytics functions
export async function getSessionStats(sessionId: number) {
  try {
    const students = await getStudentsBySession(sessionId);
    const questions = await getQuestionsBySession(sessionId);
    const responses = await getResponsesBySession(sessionId);

    const totalStudents = students.length;
    const correctResponses = responses.filter(r => r.is_correct).length;
    const averageScore = responses.length > 0
      ? (correctResponses / responses.length) * 100
      : 0;

    const questionStats = questions.map(q => {
      const questionResponses = responses.filter(r => r.question_id === q.id);
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
  } catch (error) {
    console.error('Error getting session stats:', error);
    throw error;
  }
}

export async function getLeaderboard(sessionId: number) {
  try {
    const students = await getStudentsBySession(sessionId);
    const questions = await getQuestionsBySession(sessionId);

    const leaderboard = await Promise.all(
      students.map(async (student) => {
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
          totalQuestions: questions.length,
        };
      })
    );

    return leaderboard.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}
