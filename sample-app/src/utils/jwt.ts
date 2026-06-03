import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'default-secret-for-development';
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY ?? '3600', 10);

/**
 * Generate a JWT token for a user
 * @param userId - User ID
 * @param email - User email address
 * @returns Object containing the token and expiry time in seconds
 */
export function generateToken(userId: string, email: string): { token: string; expiresIn: number } {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    sub: userId,
    email,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });

  return {
    token,
    expiresIn: JWT_EXPIRY,
  };
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
