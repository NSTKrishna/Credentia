import dotenv from 'dotenv';
import path from 'path';

// Load .env.test so process.env has the test DB URL before anything else imports Prisma
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
