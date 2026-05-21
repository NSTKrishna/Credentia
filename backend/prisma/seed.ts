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

  const names = [
    'Riya Sharma',
    'Arjun Singh',
    'Meera Iyer',
    'Karan Mehta',
    'Ananya Rao',
    'Vikram Patel',
    'Sneha Nair',
    'Rahul Verma',
    'Priya Kapoor',
    'Aditya Joshi',
  ];

  const cities = [
    'Bengaluru, Karnataka',
    'Pune, Maharashtra',
    'Chennai, Tamil Nadu',
    'Hyderabad, Telangana',
    'Mumbai, Maharashtra',
    'Delhi, Delhi',
    'Kochi, Kerala',
    'Jaipur, Rajasthan',
    'Ahmedabad, Gujarat',
    'Kolkata, West Bengal',
  ];

  const statusCycle: VerificationStatus[] = [
    VerificationStatus.PENDING,
    VerificationStatus.VERIFIED,
    VerificationStatus.PARTIAL,
    VerificationStatus.FAILED,
  ];

  const pad4 = (num: number) => String(num).padStart(4, '0');
  const makeAadhaar = (index: number) =>
    `${pad4(1000 + index)}-${pad4(2000 + index)}-${pad4(3000 + index)}`;
  const makePan = (index: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const a = letters[(index + 1) % 26];
    const b = letters[(index + 7) % 26];
    const c = letters[(index + 13) % 26];
    const d = letters[(index + 19) % 26];
    const e = letters[(index + 23) % 26];
    const num = String(1000 + index);
    const suffix = letters[(index + 5) % 26];
    return `${a}${b}${c}${d}${e}${num}${suffix}`;
  };

  const getAadhaarLogStatus = (status: VerificationStatus) => {
    if (status === VerificationStatus.FAILED) return 'FAILED';
    return 'VERIFIED';
  };
  const getPanLogStatus = (status: VerificationStatus) => {
    if (status === VerificationStatus.PENDING) return 'PENDING';
    if (status === VerificationStatus.PARTIAL) return 'PENDING';
    if (status === VerificationStatus.FAILED) return 'FAILED';
    return 'VERIFIED';
  };

  const candidatesSeed = Array.from({ length: 10 }, (_, idx) => {
    const safeIdx = idx + 1;
    const email = `candidate${safeIdx}@credentia.dev`;
    return {
      fullName: names[idx] ?? `Candidate ${safeIdx}`,
      email,
      phone: `+91-90000-${String(safeIdx).padStart(5, '0')}`,
      aadhaarNumber: makeAadhaar(safeIdx),
      panNumber: makePan(safeIdx),
      dob: new Date(1994 + (idx % 6), (idx * 2) % 12, 1 + ((idx * 3) % 28)),
      address: cities[idx] ?? 'India',
      status: statusCycle[idx % statusCycle.length],
    };
  });

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
              verificationStatus: getAadhaarLogStatus(candidateSeed.status),
            },
            {
              verificationType: 'PAN',
              requestPayload: { panNumber: candidateSeed.panNumber },
              responsePayload: { ok: true, match: true },
              verificationStatus: getPanLogStatus(candidateSeed.status),
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

    console.log(`Seeded candidate ${candidateSeed.email} (${created.id})`);
  }

  console.log(`Seeded users: ${admin.email}, ${recruiter.email}`);
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
