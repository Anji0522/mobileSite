import request from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';

describe('Authentication & Authorization Endpoints', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.FORCE_MEMORY_DB = 'true';
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_1234567890';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_1234567890';
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const validUserData = {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    password: 'Password@123',
    phone: '9876543210',
    role: 'customer'
  };

  it('should register a new user successfully with 201 status', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUserData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(validUserData.email);
    expect(res.body.data.accessToken).toBeDefined();

    // Verify password is not exposed
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should reject registration if Indian phone number is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...validUserData,
        phone: '12345' // Invalid Indian mobile number
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration if password lacks complexity', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...validUserData,
        password: 'weak'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user and return tokens', async () => {
    // First register
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUserData);

    // Now login
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUserData.email,
        password: validUserData.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(validUserData.email);
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUserData);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUserData.email,
        password: 'WrongPassword@999'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should access /api/v1/auth/me with valid Bearer token', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send(validUserData);

    const token = regRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUserData.email);
  });

  it('should reject access to /api/v1/auth/me without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
