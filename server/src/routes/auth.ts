import { Router } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'adstudio-dev-secret-key';

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, password, company, role, source } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user exists
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const stmt = db.prepare(`
            INSERT INTO users (id, email, password_hash, company, role, source)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(userId, email, hashedPassword, company || '', role || '', source || '');

        const token = jwt.sign({ id: userId, email }, JWT_SECRET);

        res.json({ token, user: { id: userId, email, company, role } });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                company: user.company,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
