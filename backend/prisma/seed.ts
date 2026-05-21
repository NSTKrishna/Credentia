import { PrismaClient, Role, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const seedReset = process.env.SEED_RESET === 'true';

  if (seedReset) {
    await prisma.report.deleteMany();
    await prisma.verificationLog.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.user.deleteMany();
  }

  const adminEmail = 'admin@credentia.dev';
  const recruiterEmail = 'recruiter@credentia.dev';

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const recruiterPasswordHash = await bcrypt.hash('Recruiter@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      name: 'Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: recruiterEmail },
    update: {
      name: 'Recruiter',
      passwordHash: recruiterPasswordHash,
      role: Role.RECRUITER,
    },
    create: {
      name: 'Recruiter',
      email: recruiterEmail,
      passwordHash: recruiterPasswordHash,
      role: Role.RECRUITER,
    },
  });

  const candidatesSeed = [
    {
      fullName: 'Riya Sharma',
      email: 'riya.sharma@example.com',
      phone: '+91-90000-00001',
      aadhaarNumber: '1234-5678-9012',
      panNumber: 'ABCDE1234F',
      dob: new Date('1997-03-14'),
      address: 'Bengaluru, Karnataka',
      status: VerificationStatus.PENDING,
    },
    {
      fullName: 'Arjun Singh',
      email: 'arjun.singh@example.com',
      phone: '+91-90000-00002',
      aadhaarNumber: '2345-6789-0123',
      panNumber: 'PQRSX6789K',
      dob: new Date('1994-11-02'),
      address: 'Pune, Maharashtra',
      status: VerificationStatus.VERIFIED,
    },
    {
      fullName: 'Meera Iyer',
      email: 'meera.iyer@example.com',
      phone: '+91-90000-00003',
      aadhaarNumber: '3456-7890-1234',
      panNumber: 'LMNOP4321Z',
      dob: new Date('1999-08-21'),
      address: 'Chennai, Tamil Nadu',
      status: VerificationStatus.PARTIAL,
    },
  ];

  for (const candidateSeed of candidatesSeed) {
    const existing = await prisma.candidate.findFirst({
      where: { email: candidateSeed.email },
      select: { id: true },
    });

    if (existing) continue;

    const created = await prisma.candidate.create({
      data: {
        ...candidateSeed,
        createdById: recruiter.id,
        verificationLogs: {
          create: [
            {
              verificationType: 'AADHAAR',
              requestPayload: { aadhaarNumber: candidateSeed.aadhaarNumber },
              responsePayload: { ok: true, match: true },
              verificationStatus:
                candidateSeed.status === VerificationStatus.FAILED ? 'FAILED' : 'VERIFIED',
            },
            {
              verificationType: 'PAN',
              requestPayload: { panNumber: candidateSeed.panNumber },
              responsePayload: { ok: true, match: true },
              verificationStatus:
                candidateSeed.status === VerificationStatus.PENDING ? 'PENDING' : 'VERIFIED',
            },
          ],
        },
        report:
          candidateSeed.status === VerificationStatus.VERIFIED
            ? {
                create: {
                  pdfUrl: 'https://example.com/reports/sample.pdf',
                },
              }
            : undefined,
      },
      select: { id: true },
    });

    // Touch admin to avoid "unused" seed vars in some linters
    await prisma.user.update({ where: { id: admin.id }, data: { name: admin.name } });

    console.log(`Seeded candidate ${candidateSeed.email} (${created.id})`);
  }

  console.log('Seeding complete');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
