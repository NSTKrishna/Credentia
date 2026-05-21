import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import prisma from '../prisma/client';
import { generateReportHTML } from '../templates/report.template';

export const generateReport = async (candidateId: string, userId: string) => {
  // Step 1: Fetch candidate with logs and creator info
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      verificationLogs: { orderBy: { verifiedAt: 'desc' } },
      createdBy: true,
    },
  });

  if (!candidate) {
    const err = new Error('Candidate not found');
    (err as any).status = 404;
    throw err;
  }

  if (candidate.createdById !== userId) {
    const err = new Error('You do not have permission to generate this report');
    (err as any).status = 403;
    throw err;
  }

  // Step 2: Generate the HTML via template
  const html = generateReportHTML(
    candidate,
    candidate.verificationLogs,
    { name: candidate.createdBy.name, email: candidate.createdBy.email }
  );

  // Step 3: Launch Puppeteer and render to PDF
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  let pdfBuffer: Buffer;

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    pdfBuffer = Buffer.from(await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', bottom: '1cm', left: '1.5cm', right: '1.5cm' },
    }));
  } finally {
    await browser.close();
  }

  // Step 4: Save PDF to /tmp/reports/
  const reportsDir = path.join('/tmp', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfPath = path.join(reportsDir, `${candidateId}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);

  // Step 5: Upsert Report record in DB
  const report = await prisma.report.upsert({
    where: { candidateId },
    create: {
      candidateId,
      pdfUrl: pdfPath,
    },
    update: {
      pdfUrl: pdfPath,
      generatedAt: new Date(),
    },
  });

  return { report, pdfPath };
};

export const getReportPath = async (candidateId: string, userId: string): Promise<string> => {
  // Ownership check
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });

  if (!candidate) {
    const err = new Error('Candidate not found');
    (err as any).status = 404;
    throw err;
  }

  if (candidate.createdById !== userId) {
    const err = new Error('Forbidden');
    (err as any).status = 403;
    throw err;
  }

  const report = await prisma.report.findUnique({ where: { candidateId } });

  if (!report || !report.pdfUrl) {
    const err = new Error('Report not found. Please generate the report first.');
    (err as any).status = 404;
    throw err;
  }

  if (!fs.existsSync(report.pdfUrl)) {
    const err = new Error('Report file missing on disk. Please re-generate.');
    (err as any).status = 404;
    throw err;
  }

  return report.pdfUrl;
};
