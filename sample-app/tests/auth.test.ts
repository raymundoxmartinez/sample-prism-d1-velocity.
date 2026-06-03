import request from 'supertest';
import app from '../src/index';
import { userStore, createUser } from '../src/models/user-store';
import { verifyToken } from '../src/utils/jwt';

beforeEach(async () => {
  userStore.clear();
  // Create test user
  await createUser('user@example.com', 'password123');
});

// ---------------------------------------------------------------------------
// Successful authentication
// ---------------------------------------------------------------------------
describe('POST /auth/login - Success', () => {
  it('returns 200 with token and expiresIn for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.expiresIn).toBe(3600);
  });

  it('returns a valid JWT token with correct payload', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.status).toBe(200);

    const decoded = verifyToken(res.body.token);
    expect(decoded.sub).toBeDefined();
    expect(decoded.email).toBe('user@example.com');
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp - decoded.iat).toBe(3600);
  });

  it('is case-insensitive for email addresses (login with uppercase)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'USER@EXAMPLE.COM', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('is case-insensitive for email addresses (register uppercase, login lowercase)', async () => {
    // Create a user with uppercase email
    await createUser('ADMIN@EXAMPLE.COM', 'securepass123');

    // Login with lowercase email
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'admin@example.com', password: 'securepass123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    // Verify token contains normalized email
    const decoded = verifyToken(res.body.token);
    expect(decoded.email).toBe('admin@example.com');
  });
});

// ---------------------------------------------------------------------------
// Authentication failures
// ---------------------------------------------------------------------------
describe('POST /auth/login - Failures', () => {
  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.title).toBe('Unauthorized');
    expect(res.body.detail).toBe('Invalid email or password');
    expect(res.body.status).toBe(401);
    expect(res.body.type).toBe('about:blank');
    expect(res.body.instance).toBe('/auth/login');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.detail).toBe('Invalid email or password');
  });

  it('does not differentiate between wrong password and non-existent user', async () => {
    const wrongPassword = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    const nonExistent = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(wrongPassword.body).toEqual(nonExistent.body);
  });
});

// ---------------------------------------------------------------------------
// Validation errors
// ---------------------------------------------------------------------------
describe('POST /auth/login - Validation', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.title).toBe('Bad Request');
    expect(res.body.detail).toMatch(/email/);
    expect(res.body.status).toBe(400);
    expect(res.body.type).toBe('about:blank');
    expect(res.body.instance).toBe('/auth/login');
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.title).toBe('Bad Request');
    expect(res.body.detail).toMatch(/password/);
  });

  it('returns 400 when both email and password are missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/email/);
    expect(res.body.detail).toMatch(/password/);
  });

  it('returns 400 when email is empty string', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: '', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/email/);
  });

  it('returns 400 when password is empty string', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'user@example.com', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/password/);
  });
});

// ---------------------------------------------------------------------------
// Content-Type validation
// ---------------------------------------------------------------------------
describe('POST /auth/login - Content-Type', () => {
  it('returns 415 when Content-Type is not application/json', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'text/plain')
      .send('email=user@example.com&password=password123');

    expect(res.status).toBe(415);
    expect(res.body.title).toBe('Unsupported Media Type');
    expect(res.body.detail).toBe('Content-Type must be application/json');
    expect(res.body.status).toBe(415);
    expect(res.body.type).toBe('about:blank');
    expect(res.body.instance).toBe('/auth/login');
  });

  it('accepts application/json with charset', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.status).toBe(200);
  });
});
