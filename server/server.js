import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import { verifyAuth } from './middleware/authMiddleware.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

// CORS configuration for production and local development
const corsOptions = {
	origin(origin, callback) {
		if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
});

app.use(limiter);

// Root route for quick service verification
app.get('/', (req, res) => {
	res.send('Fake News Detection API is running');
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', verifyAuth, newsRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
	console.log(`Server running on port ${port}`);
});
