import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Mock axios completely
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Verification API', () => {
  let token: string;
  let userId: string;
  let candidateId: string;

  beforeEach(async () => {
    jest.clearAllMocks();

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

    const candidate = await prisma.candidate.create({
      data: {
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '9876543210',
        aadhaarNumber: '123456789012',
        panNumber: 'ABCDE1234F',
        dob: new Date('1990-05-15'),
        address: '456 Elm St, City, Country',
        createdById: userId,
      },
    });
    candidateId = candidate.id;
  });

  describe('POST /api/verifications/:id/start', () => {
    it('should result in VERIFIED if both checks pass', async () => {
      mockedAxios.post.mockImplementation((url) => {
        if (url.includes('aadhaar')) {
          return Promise.resolve({ data: { status: 'verified', nameMatch: true, dobMatch: true } });
        }
        if (url.includes('pan')) {
          return Promise.resolve({ data: { status: 'verified', panStatus: 'active' } });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const res = await request(app)
        .post(`/api/verifications/${candidateId}/start`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.overallStatus).toBe('VERIFIED');
      expect(res.body.aadhaarResult.status).toBe('VERIFIED');
      expect(res.body.panResult.status).toBe('VERIFIED');
    });

    it('should result in PARTIAL if one check fails', async () => {
      mockedAxios.post.mockImplementation((url) => {
        if (url.includes('aadhaar')) {
          return Promise.resolve({ data: { status: 'verified', nameMatch: true, dobMatch: true } });
        }
        if (url.includes('pan')) {
          return Promise.resolve({ data: { status: 'failed', message: 'Not found' } });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const res = await request(app)
        .post(`/api/verifications/${candidateId}/start`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.overallStatus).toBe('PARTIAL');
      expect(res.body.aadhaarResult.status).toBe('VERIFIED');
      expect(res.body.panResult.status).toBe('FAILED');
    });

    it('should result in FAILED if both checks fail', async () => {
      mockedAxios.post.mockImplementation((url) => {
        if (url.includes('aadhaar')) {
          return Promise.resolve({ data: { status: 'failed', message: 'Not found' } });
        }
        if (url.includes('pan')) {
          return Promise.resolve({ data: { status: 'failed', message: 'Not found' } });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const res = await request(app)
        .post(`/api/verifications/${candidateId}/start`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.overallStatus).toBe('FAILED');
      expect(res.body.aadhaarResult.status).toBe('FAILED');
      expect(res.body.panResult.status).toBe('FAILED');
    });
  });
});
