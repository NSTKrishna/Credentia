import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import candidateRouter from './routes/candidate.routes';
import mockRouter from './routes/mock.routes';
import verificationRouter from './routes/verification.routes';
import { verifyToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/candidates', verifyToken, candidateRouter);
app.use('/api/verifications', verifyToken, verificationRouter);
app.use('/mock-api', mockRouter);

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;