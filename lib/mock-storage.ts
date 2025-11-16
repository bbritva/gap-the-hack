// Simple in-memory storage for testing without database
// This is a fallback when POSTGRES_URL is not configured

import { Session, Question, Student, Response, Teacher } from './types';

// In-memory storage
const storage = {
  teachers: new Map<number, Teacher>(),
  sessions: new Map<number, Session>(),
  questions: new Map<number, Question>(),
  students: new Map<number, Student>(),
  responses: new Map<number, Response>(),
  sessionsByCode: new Map<string, number>(),
  nextId: {
    teacher: 1,
    session: 1,
    question: 1,
    student: 1,
    response: 1,
  }
};

// Initialize with demo teacher
storage.teachers.set(1, {
  id: 1,
  email: 'demo@teacher.com',
  name: 'Demo Teacher',
  created_at: new Date()
});
storage.nextId.teacher = 2;

// Helper to generate unique code
function generateUniqueCode(): string {
  let code: string;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (storage.sessionsByCode.has(code));
  return code;
}

export const mockStorage = {
  // Teacher functions
  async createTeacher(email: string, name: string): Promise<Teacher> {
    const id = storage.nextId.teacher++;
    const teacher: Teacher = {
      id,
      email,
      name,
      created_at: new Date()
    };
    storage.teachers.set(id, teacher);
    return teacher;
  },

  async getTeacherByEmail(email: string): Promise<Teacher | null> {
    for (const teacher of storage.teachers.values()) {
      if (teacher.email === email) return teacher;
    }
    return null;
  },

  // Session functions
  async createSession(teacherId: number, title: string, code: string): Promise<Session> {
    const id = storage.nextId.session++;
    const session: Session = {
      id,
      teacher_id: teacherId,
      title,
      code,
      status: 'active',
      created_at: new Date()
    };
    storage.sessions.set(id, session);
    storage.sessionsByCode.set(code, id);
    return session;
  },

  async getSessionByCode(code: string): Promise<Session | null> {
    const sessionId = storage.sessionsByCode.get(code);
    if (!sessionId) return null;
    return storage.sessions.get(sessionId) || null;
  },

  async getSessionById(id: number): Promise<Session | null> {
    return storage.sessions.get(id) || null;
  },

  async generateSessionCode(): Promise<string> {
    return generateUniqueCode();
  },

  // Question functions
  async createQuestion(
    sessionId: number,
    questionText: string,
    options: string[],
    correctAnswer: number,
    topic: string,
    difficulty: 'foundation' | 'application' | 'analysis',
    points: number,
    orderIndex: number
  ): Promise<Question> {
    const id = storage.nextId.question++;
    const question: Question = {
      id,
      session_id: sessionId,
      question_text: questionText,
      options,
      correct_answer: correctAnswer,
      topic,
      difficulty,
      points,
      order_index: orderIndex,
      created_at: new Date()
    };
    storage.questions.set(id, question);
    return question;
  },

  async getQuestionsBySession(sessionId: number): Promise<Question[]> {
    const questions: Question[] = [];
    for (const question of storage.questions.values()) {
      if (question.session_id === sessionId) {
        questions.push(question);
      }
    }
    return questions.sort((a, b) => a.order_index - b.order_index);
  },

  // Student functions
  async createStudent(sessionId: number, name: string, interests: string[]): Promise<Student> {
    const id = storage.nextId.student++;
    const student: Student = {
      id,
      session_id: sessionId,
      name,
      interests,
      joined_at: new Date()
    };
    storage.students.set(id, student);
    return student;
  },

  async getStudentsBySession(sessionId: number): Promise<Student[]> {
    const students: Student[] = [];
    for (const student of storage.students.values()) {
      if (student.session_id === sessionId) {
        students.push(student);
      }
    }
    return students;
  },

  // Response functions
  async createResponse(
    studentId: number,
    questionId: number,
    sessionId: number,
    answer: string,
    isCorrect: boolean,
    timeTaken?: number,
    pointsEarned?: number
  ): Promise<Response> {
    const id = storage.nextId.response++;
    const response: Response = {
      id,
      student_id: studentId,
      question_id: questionId,
      answer,
      is_correct: isCorrect,
      time_taken: timeTaken,
      created_at: new Date()
    };
    storage.responses.set(id, response);
    return response;
  },

  async getResponsesBySession(sessionId: number): Promise<Response[]> {
    // Get all students in this session
    const students = await this.getStudentsBySession(sessionId);
    const studentIds = new Set(students.map(s => s.id));
    
    // Get responses from those students
    const responses: Response[] = [];
    for (const response of storage.responses.values()) {
      if (studentIds.has(response.student_id)) {
        responses.push(response);
      }
    }
    return responses;
  },

  async getResponsesByStudent(studentId: number): Promise<Response[]> {
    const responses: Response[] = [];
    for (const response of storage.responses.values()) {
      if (response.student_id === studentId) {
        responses.push(response);
      }
    }
    return responses;
  },

  // Initialize (no-op for mock)
  async initializeDatabase(): Promise<void> {
    // Already initialized
  },

  // Clear all data (for testing)
  clearAll() {
    storage.sessions.clear();
    storage.questions.clear();
    storage.students.clear();
    storage.responses.clear();
    storage.sessionsByCode.clear();
    storage.nextId.session = 1;
    storage.nextId.question = 1;
    storage.nextId.student = 1;
    storage.nextId.response = 1;
  }
};
