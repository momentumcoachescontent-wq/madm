// Utilidades de autenticación y helpers
import bcrypt from 'bcryptjs';
import {
  createSession as modelCreateSession,
  getUserFromSession as modelGetUserFromSession,
  generateSessionToken as modelGenerateSessionToken
} from './models/users';
import {
  userHasAccess as modelUserHasAccess,
  getCourseProgress as modelGetCourseProgress
} from './models/enrollments';
import { Context } from 'hono';
import { CloudflareBindings } from './types';

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
  return modelGenerateSessionToken();
}

// Verificar si usuario tiene acceso a un curso
export async function userHasAccess(db: D1Database, userId: number, courseId: number): Promise<boolean> {
  return await modelUserHasAccess(db, userId, courseId);
}

// Obtener usuario desde sesión
export async function getUserFromSession(db: D1Database, sessionToken: string) {
  return await modelGetUserFromSession(db, sessionToken);
}

// Crear sesión de usuario
export async function createSession(db: D1Database, userId: number): Promise<string> {
  return await modelCreateSession(db, userId);
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
  return await modelGetCourseProgress(db, userId, courseId);
}

// Helper para obtener usuario actual desde cookies en una ruta
export async function getCurrentUser(c: Context<{ Bindings: CloudflareBindings }>) {
  const cookies = c.req.header('Cookie');
  if (!cookies) return null;
  
  const sessionToken = cookies.split(';').find((cookie: string) => cookie.trim().startsWith('session='))?.split('=')[1];
  if (!sessionToken) return null;
  
  return getUserFromSession(c.env.DB, sessionToken);
}
