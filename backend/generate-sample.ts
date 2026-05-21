import puppeteer from 'puppeteer';
import { generateReportHTML } from './src/templates/report.template';

async function generateSample() {
  const candidate = {
    id: 'cl-mock-123456789',
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    dob: '1990-01-01',
    phone: '9876543210',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    status: 'VERIFIED',
    verificationLogs: [
      {
        verificationType: 'AADHAAR',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2026-05-21T10:00:00Z'),
        responseData: {
          client_id: 'sample_id',
          full_name: 'Jane Doe',
          dob: '1990-01-01',
          address: '123 Tech Street, Bangaluru'
        }
      },
      {
        verificationType: 'PAN',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2026-05-21T10:01:00Z'),
        responseData: {
          client_id: 'sample_id_pan',
          full_name: 'Jane Doe',
          pan_number: 'ABCDE1234F'
        }
      }
    ]
  };

  const html = generateReportHTML(
    candidate as any, 
    candidate.verificationLogs as any, 
    { name: 'Admin User', email: 'admin@example.com' }
  );
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' as any });
  await page.pdf({
    path: '../SAMPLE_REPORTS/Jane_Doe_Report.pdf',
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
  console.log('Sample PDF generated at ../SAMPLE_REPORTS/Jane_Doe_Report.pdf');
}

generateSample().catch(console.error);
