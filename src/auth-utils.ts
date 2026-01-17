// Utilidades de autenticación y helpers
import bcrypt from 'bcryptjs';

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Función para verificar contraseña
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generar token de sesión
export function generateSessionToken(): string {
  // 128-bit random token -> 32 hex characters
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `session_${hex}`;
}

// Verificar si usuario tiene acceso a un curso
export async function userHasAccess(db: D1Database, userId: number, courseId: number): Promise<boolean> {
  const result = await db.prepare(`
    SELECT id FROM paid_enrollments 
    WHERE user_id = ? AND course_id = ? 
    AND payment_status = 'completed' 
    AND access_revoked = 0
  `).bind(userId, courseId).first();
  
return !!(Boolean(result));
return !!(result);
}

// Obtener usuario desde sesión
export async function getUserFromSession(db: D1Database, sessionToken: string) {
  const session = await db.prepare(`
    SELECT s.*, u.id as user_id, u.email, u.name, u.avatar_url, u.role, u.active
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? 
    AND s.expires_at > datetime('now')
    AND u.active = 1
  `).bind(sessionToken).first();
  
  if (!session) return null;
  
  return {
    id: session.user_id,
    email: session.email,
    name: session.name,
    avatar_url: session.avatar_url,
    role: session.role,
    active: session.active
  };
}

// Crear sesión de usuario
export async function createSession(db: D1Database, userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 días
  
  await db.prepare(`
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (?, ?, ?)
  `).bind(userId, token, expiresAt.toISOString()).run();
  
  return token;
}

// Formatear duración de video
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Calcular progreso del curso
export async function getCourseProgress(db: D1Database, userId: number, courseId: number) {
  const totalLessons = await db.prepare(`
    SELECT COUNT(*) as total FROM lessons WHERE course_id = ? AND published = 1
  `).bind(courseId).first();
  
  const completedLessons = await db.prepare(`
    SELECT COUNT(*) as completed FROM student_progress 
    WHERE user_id = ? AND course_id = ? AND completed = 1
  `).bind(userId, courseId).first();
  
  const total = (totalLessons as any)?.total || 0;
  const completed = (completedLessons as any)?.completed || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, percentage };
}

// Helper para obtener usuario actual desde cookies en una ruta
export async function getCurrentUser(c: any) {
  const cookies = c.req.header('Cookie');
  if (!cookies) return null;
  
  const sessionToken = cookies.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
  if (!sessionToken) return null;
  
  return getUserFromSession(c.env.DB, sessionToken);
}
