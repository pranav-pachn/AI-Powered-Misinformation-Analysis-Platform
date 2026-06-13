import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import { verifyAuth } from './middleware/authMiddleware.js';
import errorHandler from './middleware/errorHandler.js';
import { getMongoHealth, waitForConnection } from './config/db.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);
const isDevelopment = process.env.NODE_ENV !== 'production';
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// CORS configuration for production and local development
const corsOptions = {
	origin(origin, callback) {
		if (!origin) {
			callback(null, true);
			return;
		}

		if (allowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		if (isDevelopment && localhostOriginPattern.test(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error(`Not allowed by CORS: ${origin}`));
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
app.get('/health', async (req, res) => {
	const mongo = await getMongoHealth();
	const openRouterConfigured = Boolean(
		process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY
	);
	const groqConfigured = Boolean(process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY);
	const geminiConfigured = Boolean(
		process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
	);

	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		services: {
			mongo,
			ai: {
				configured: openRouterConfigured || groqConfigured || geminiConfigured,
				primary: openRouterConfigured ? 'openrouter' : groqConfigured ? 'groq' : geminiConfigured ? 'gemini' : null,
				providers: {
					openrouter: openRouterConfigured,
					groq: groqConfigured,
					gemini: geminiConfigured,
				},
			},
		},
	});
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', verifyAuth, newsRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

const basePort = Number(process.env.PORT || 5000);
const maxPortAttempts = Number(process.env.PORT_ATTEMPTS || 100);

async function startServer(port, attempt = 1) {
	const server = app.listen(port, '0.0.0.0', () => {
		console.log(`Server running on port ${port}`);
	});

	server.on('error', (error) => {
		if (error.code === 'EADDRINUSE' && isDevelopment && attempt < maxPortAttempts) {
			const nextPort = port + 1;
			console.warn(`Port ${port} is in use, trying ${nextPort}...`);
			server.close(() => startServer(nextPort, attempt + 1));
			return;
		}

		console.error(`Failed to start server on port ${port}:`, error.message);
		process.exit(1);
	});

	return server;
}

(async () => {
	await waitForConnection();
	startServer(basePort);
})();
