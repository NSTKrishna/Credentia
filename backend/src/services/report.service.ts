import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { uploadBufferToCloudinary } from './cloudinary.service';
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
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-zygote',
      ],
      headless: true,
    });
  } catch (launchError: any) {
    console.error('Puppeteer browser launch failed:', launchError.message || launchError);
    throw new Error(`PDF engine launch failed: ${launchError.message || launchError}`);
  }

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
    if (browser) {
      await browser.close();
    }
  }

  // Step 4: Upload PDF buffer to Cloudinary
  let cloudUrl: string | null = null;
  try {
    const uploadResult = await uploadBufferToCloudinary(pdfBuffer, 'reports', candidateId);
    cloudUrl = uploadResult.secure_url || uploadResult.url || null;
  } catch (err) {
    // If Cloudinary upload fails, continue to save locally and throw after persisting local path
    cloudUrl = null;
  }

  // Still save a local copy in /tmp/reports/ (useful for local debugging/fallback)
  const reportsDir = path.join('/tmp', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfPath = path.join(reportsDir, `${candidateId}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);

  // Step 5: Upsert Report record in DB (store Cloudinary URL if available, else local path)
  const pdfUrlToStore = cloudUrl ?? pdfPath;

  const report = await prisma.report.upsert({
    where: { candidateId },
    create: {
      candidateId,
      pdfUrl: pdfUrlToStore,
    },
    update: {
      pdfUrl: pdfUrlToStore,
      generatedAt: new Date(),
    },
  });

  return { report, pdfPath, cloudUrl };
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

  const pdfUrl = report.pdfUrl;

  // If pdfUrl is a remote URL (Cloudinary), return it directly
  if (typeof pdfUrl === 'string' && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'))) {
    return pdfUrl;
  }

  // Otherwise treat as local path
  if (!fs.existsSync(pdfUrl)) {
    const err = new Error('Report file missing on disk. Please re-generate.');
    (err as any).status = 404;
    throw err;
  }

  return pdfUrl;
};
