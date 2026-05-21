import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma/client';
import bcrypt from 'bcryptjs';

describe('Auth API', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(validUser.email);
    });

    it('should return 409 for duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('name');
      expect(res.body.errors).toHaveProperty('password');
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...validUser,
        password: 'weak',
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash(validUser.password, 12);
      await prisma.user.create({
        data: {
          name: validUser.name,
          email: validUser.email,
          passwordHash,
        },
      });
    });

    it('should login successfully and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: validUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(validUser.email);
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: 'WrongPassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('should return 401 for unknown email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'unknown@example.com',
        password: 'Password123',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });
});
