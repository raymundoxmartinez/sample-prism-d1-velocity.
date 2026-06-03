import request from 'supertest';
import app from '../src/index';

describe('GET /health', () => {
  it('returns 200 status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('returns status "ok"', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
  });

  it('includes uptime in seconds', async () => {
    const res = await request(app).get('/health');
    expect(res.body.uptime).toBeDefined();
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('includes timestamp in ISO 8601 format', async () => {
    const res = await request(app).get('/health');
    expect(res.body.timestamp).toBeDefined();
    expect(typeof res.body.timestamp).toBe('string');

    // Verify it's a valid ISO 8601 timestamp
    const timestamp = new Date(res.body.timestamp);
    expect(timestamp.toISOString()).toBe(res.body.timestamp);
  });

  it('includes all required fields', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('responds quickly (< 50ms)', async () => {
    const startTime = Date.now();
    await request(app).get('/health');
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(50);
  });
});
