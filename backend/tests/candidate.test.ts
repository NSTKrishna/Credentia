import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Candidate API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('Password123', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Test Recruiter',
        email: 'recruiter@example.com',
        passwordHash,
      },
    });
    userId = user.id;

    token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'test_secret_for_jest',
      { expiresIn: '1h' }
    );
  });

  const validCandidate = {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '9876543210',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    dob: '1990-05-15',
    address: '456 Elm St, City, Country',
  };

  describe('POST /api/candidates', () => {
    it('should create candidate successfully when authenticated', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send(validCandidate);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.fullName).toBe(validCandidate.fullName);
    });

    it('should return 401 unauthenticated if token is missing', async () => {
      const res = await request(app).post('/api/candidates').send(validCandidate);
      expect(res.status).toBe(401);
    });

    it('should fail with invalid Aadhaar', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validCandidate, aadhaarNumber: '1234' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('aadhaarNumber');
    });

    it('should fail with invalid PAN', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validCandidate, panNumber: '12345ABCDE' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveProperty('panNumber');
    });
  });

  describe('GET /api/candidates', () => {
    beforeEach(async () => {
      await prisma.candidate.create({
        data: {
          ...validCandidate,
          dob: new Date(validCandidate.dob),
          createdById: userId,
        },
      });
      await prisma.candidate.create({
        data: {
          ...validCandidate,
          fullName: 'John Smith',
          email: 'john.smith@example.com',
          dob: new Date('1985-10-20'),
          status: 'VERIFIED',
          createdById: userId,
        },
      });
    });

    it('should return paginated list of candidates', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('candidates');
      expect(res.body.candidates.length).toBe(2);
      expect(res.body).toHaveProperty('total');
      expect(res.body.total).toBe(2);
    });

    it('should filter candidates by search query', async () => {
      const res = await request(app)
        .get('/api/candidates?search=Jane')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.candidates.length).toBe(1);
      expect(res.body.candidates[0].fullName).toBe('Jane Doe');
    });

    it('should filter candidates by status', async () => {
      const res = await request(app)
        .get('/api/candidates?status=VERIFIED')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.candidates.length).toBe(1);
      expect(res.body.candidates[0].fullName).toBe('John Smith');
    });
  });
});
