import { Router, Request, Response } from 'express';

const router = Router();

// Helper to simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

router.post('/aadhaar/verify', async (req: Request, res: Response): Promise<any> => {
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    return res.status(400).json({ error: 'Invalid Aadhaar number format' });
  }

  await sleep(300);

  if (aadhaarNumber.startsWith('000000')) {
    return res.status(200).json({
      status: 'failed',
      nameMatch: false,
      dobMatch: false,
      message: 'Aadhaar not found in records',
    });
  }

  return res.status(200).json({
    status: 'verified',
    nameMatch: true,
    dobMatch: true,
    message: 'Aadhaar verified successfully',
  });
});

router.post('/pan/verify', async (req: Request, res: Response): Promise<any> => {
  const { panNumber } = req.body;

  if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    return res.status(400).json({ error: 'Invalid PAN number format' });
  }

  await sleep(300);

  if (panNumber.startsWith('AAAAA')) {
    return res.status(200).json({
      status: 'failed',
      panStatus: 'inactive',
      message: 'PAN not found or inactive',
    });
  }

  return res.status(200).json({
    status: 'verified',
    panStatus: 'active',
    message: 'PAN verified successfully',
  });
});

export default router;
