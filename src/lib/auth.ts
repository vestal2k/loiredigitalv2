import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { AstroCookies } from 'astro'

// Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface JWTPayload {
  userId: string
  email: string
}

// Configuration
const JWT_SECRET = import.meta.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRES_IN = '7d' // Le token expire après 7 jours
const COOKIE_NAME = 'auth_token'

/**
 * Hash un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Crée un JWT token
 */
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Vérifie et décode un JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Définit le cookie d'authentification
 */
export function setAuthCookie(cookies: AstroCookies, token: string): void {
  cookies.set(COOKIE_NAME, token, {
    httpOnly: true, // Protège contre les attaques XSS
    secure: import.meta.env.PROD, // HTTPS uniquement en production
    sameSite: 'lax', // Protection CSRF
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })
}

/**
 * Supprime le cookie d'authentification
 */
export function clearAuthCookie(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, {
    path: '/',
  })
}

/**
 * Récupère l'utilisateur depuis le cookie
 */
export function getUserFromCookie(cookies: AstroCookies): JWTPayload | null {
  const token = cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * Middleware pour protéger les routes
 * À utiliser dans les pages de l'espace client
 */
export function requireAuth(cookies: AstroCookies): JWTPayload | Response {
  const user = getUserFromCookie(cookies)

  if (!user) {
    // Rediriger vers la page de login
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/espace-client/connexion',
      },
    })
  }

  return user
}

/**
 * Génère un mot de passe temporaire aléatoire
 */
export function generateTemporaryPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return password
}
