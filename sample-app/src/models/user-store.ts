import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '../types';

const SALT_ROUNDS = 10;

/** In-memory user store — keyed by lowercase email */
export const userStore = new Map<string, User>();

/**
 * Initialize the user store with a default test user
 */
export async function seedUsers(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

  const defaultUser: User = {
    id: uuidv4(),
    email: 'user@example.com',
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  userStore.set(defaultUser.email.toLowerCase(), defaultUser);
}

/**
 * Find a user by email (case-insensitive)
 * @param email - User email address
 * @returns User object if found, undefined otherwise
 */
export function findUserByEmail(email: string): User | undefined {
  return userStore.get(email.toLowerCase());
}

/**
 * Verify a password against a user's stored hash
 * @param password - Plain text password
 * @param passwordHash - Stored bcrypt hash
 * @returns Promise resolving to true if password matches
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Create a new user with a hashed password
 * @param email - User email address
 * @param password - Plain text password
 * @returns The created user object
 */
export async function createUser(email: string, password: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  userStore.set(user.email, user);
  return user;
}
