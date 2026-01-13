import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai';
import projectRoutes from './routes/projects';
import { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

app.use('/api', aiRoutes);
app.use('/api/projects', projectRoutes);

app.get('/health', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, async () => {
    if (process.env.DATABASE_URL) {
        await initDb();
    }
    console.log(`Server running on port ${PORT}`);
});
