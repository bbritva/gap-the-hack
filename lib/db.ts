// In-memory database for MVP
// In production, this would be replaced with a real database (PostgreSQL, MongoDB, etc.)

import { Session, Question, Student, Response, Teacher } from './types';

class InMemoryDB {
  private sessions: Map<string, Session> = new Map();
  private questions: Map<string, Question> = new Map();
  private students: Map<string, Student> = new Map();
  private responses: Map<string, Response> = new Map();
  private teachers: Map<string, Teacher> = new Map();
  private sessionCodes: Map<string, string> = new Map(); // code -> sessionId

  // Sessions
  createSession(session: Session): Session {
    this.sessions.set(session.id, session);
    this.sessionCodes.set(session.code, session.id);
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getSessionByCode(code: string): Session | undefined {
    const sessionId = this.sessionCodes.get(code);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  getSessionsByTeacher(teacherId: string): Session[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.teacherId === teacherId
    );
  }

  updateSession(id: string, updates: Partial<Session>): Session | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }

  // Questions
  createQuestion(question: Question): Question {
    this.questions.set(question.id, question);
    return question;
  }

  getQuestion(id: string): Question | undefined {
    return this.questions.get(id);
  }

  getQuestionsBySession(sessionId: string): Question[] {
    return Array.from(this.questions.values()).filter(
      (q) => q.sessionId === sessionId
    );
  }

  deleteQuestion(id: string): boolean {
    return this.questions.delete(id);
  }

  // Students
  createStudent(student: Student): Student {
    this.students.set(student.id, student);
    return student;
  }

  getStudent(id: string): Student | undefined {
    return this.students.get(id);
  }

  getStudentsBySession(sessionId: string): Student[] {
    return Array.from(this.students.values()).filter(
      (s) => s.sessionId === sessionId
    );
  }

  // Responses
  createResponse(response: Response): Response {
    this.responses.set(response.id, response);
    return response;
  }

  getResponse(id: string): Response | undefined {
    return this.responses.get(id);
  }

  getResponsesByStudent(studentId: string): Response[] {
    return Array.from(this.responses.values()).filter(
      (r) => r.studentId === studentId
    );
  }

  getResponsesBySession(sessionId: string): Response[] {
    return Array.from(this.responses.values()).filter(
      (r) => r.sessionId === sessionId
    );
  }

  getResponsesByQuestion(questionId: string): Response[] {
    return Array.from(this.responses.values()).filter(
      (r) => r.questionId === questionId
    );
  }

  // Teachers
  createTeacher(teacher: Teacher): Teacher {
    this.teachers.set(teacher.id, teacher);
    return teacher;
  }

  getTeacher(id: string): Teacher | undefined {
    return this.teachers.get(id);
  }

  getTeacherByEmail(email: string): Teacher | undefined {
    return Array.from(this.teachers.values()).find((t) => t.email === email);
  }

  // Utility
  generateUniqueCode(): string {
    let code: string;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.sessionCodes.has(code));
    return code;
  }

  clear(): void {
    this.sessions.clear();
    this.questions.clear();
    this.students.clear();
    this.responses.clear();
    this.teachers.clear();
    this.sessionCodes.clear();
  }
}

// Singleton instance
export const db = new InMemoryDB();
