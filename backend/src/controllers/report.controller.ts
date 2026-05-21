import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as reportService from '../services/report.service';
import prisma from '../prisma/client';
import { maskAadhaar } from '../utils/masks';

export const listReports = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const reports = await prisma.report.findMany({
      where: { candidate: { createdById: userId } },
      include: {
        candidate: {
          include: { verificationLogs: { orderBy: { verifiedAt: 'desc' } } },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    const masked = reports.map((report) => ({
      ...report,
      candidate: {
        ...report.candidate,
        aadhaarNumber: maskAadhaar(report.candidate.aadhaarNumber),
      },
    }));

    return res.status(200).json(masked);
  } catch (error: any) {
    console.error('Error listing reports:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateReport = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { candidateId } = req.params;
    const userId = req.user!.userId;

    const { report } = await reportService.generateReport(candidateId, userId);

    return res.status(200).json({
      message: 'Report generated successfully',
      reportId: report.id,
      generatedAt: report.generatedAt,
    });
  } catch (error: any) {
    if (error.status === 404) return res.status(404).json({ error: error.message });
    if (error.status === 403) return res.status(403).json({ error: error.message });
    console.error('Error generating report:', error.message);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const downloadReport = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { candidateId } = req.params;
    const userId = req.user!.userId;

    const pdfPath = await reportService.getReportPath(candidateId, userId);

    return res.download(pdfPath, `bgv-report-${candidateId.slice(0, 8)}.pdf`);
  } catch (error: any) {
    if (error.status === 404) return res.status(404).json({ error: error.message });
    if (error.status === 403) return res.status(403).json({ error: error.message });
    console.error('Error downloading report:', error.message);
    return res.status(500).json({ error: 'Failed to download report' });
  }
};
