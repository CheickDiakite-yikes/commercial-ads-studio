import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai';
import projectRoutes from './routes/projects';
import authRoutes from './routes/auth';
import assetsRoutes from './routes/assets';
import { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Routes
app.use('/api', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);

app.get('/health', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    initDb(); // Initialize SQLite database
    console.log(`Server running on port ${PORT}`);
});
