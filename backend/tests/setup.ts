import prisma from '../src/prisma/client';

beforeEach(async () => {
  // Clean up database tables in order of dependencies (child records first)
  await prisma.report.deleteMany();
  await prisma.verificationLog.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
