import { Router, Request, Response } from 'express';
import { LoginRequest, LoginResponse, ProblemDetails } from '../types';
import { findUserByEmail, verifyPassword } from '../models/user-store';
import { generateToken } from '../utils/jwt';
import { validateContentType } from '../middleware/content-type';

const router = Router();

/**
 * Validate login request body
 * @param body - Request body
 * @returns Array of missing fields, empty if valid
 */
function validateLoginRequest(body: unknown): string[] {
  const missing: string[] = [];

  if (!body || typeof body !== 'object') {
    return ['email', 'password'];
  }

  const req = body as Record<string, unknown>;

  if (!req.email || typeof req.email !== 'string' || req.email.trim() === '') {
    missing.push('email');
  }

  if (!req.password || typeof req.password !== 'string' || req.password.trim() === '') {
    missing.push('password');
  }

  return missing;
}

/**
 * @route POST /auth/login
 * @description Authenticates a user and returns a JWT token
 * @param {LoginRequest} body - User credentials (email and password)
 * @returns {LoginResponse} 200 - JWT token and expiry time
 * @returns {ProblemDetails} 400 - Validation error
 * @returns {ProblemDetails} 401 - Invalid credentials
 * @returns {ProblemDetails} 415 - Unsupported media type
 */
router.post('/auth/login', validateContentType, async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const missingFields = validateLoginRequest(req.body);

  if (missingFields.length > 0) {
    const problem: ProblemDetails = {
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: `Missing required fields: ${missingFields.join(', ')}`,
      instance: req.path,
    };
    res.status(400).json(problem);
    return;
  }

  const { email, password } = req.body as LoginRequest;

  // Find user by email
  const user = findUserByEmail(email);

  // Use constant-time comparison by always calling bcrypt.compare
  // even if user doesn't exist (prevents timing attacks)
  let isValidPassword = false;

  if (user) {
    isValidPassword = await verifyPassword(password, user.passwordHash);
  } else {
    // Perform a dummy hash comparison to maintain constant time
    await verifyPassword(password, '$2b$10$dummyhashtopreventtimingattack');
  }

  // Return same error for both "user not found" and "wrong password"
  if (!user || !isValidPassword) {
    console.log(`Authentication failed for email: ${email}`);

    const problem: ProblemDetails = {
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid email or password',
      instance: req.path,
    };
    res.status(401).json(problem);
    return;
  }

  // Generate JWT token
  const { token, expiresIn } = generateToken(user.id, user.email);

  console.log(`Authentication successful for email: ${email}, userId: ${user.id}`);

  const response: LoginResponse = {
    token,
    expiresIn,
  };

  res.status(200).json(response);
});

export default router;
