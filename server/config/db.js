import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const DB_CONNECT_RETRIES = Number(process.env.DB_CONNECT_RETRIES || 5);
const DB_CONNECT_RETRY_DELAY_MS = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 2000);

if (!DB_HOST || !DB_USER || !DB_NAME) {
	throw new Error('Database configuration is missing. Check environment variables.');
}

const pool = mysql.createPool({
	host: DB_HOST,
	port: DB_PORT ? Number(DB_PORT) : 3306,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
	// SSL for production databases (like Render MySQL)
	ssl: process.env.DB_SSL === 'true' ? {
		rejectUnauthorized: true,
	} : undefined,
});

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test connectivity with retry/backoff so transient DB startup delays don't fail the app.
async function testConnectionWithRetry() {
	for (let attempt = 1; attempt <= DB_CONNECT_RETRIES; attempt++) {
		try {
			const connection = await pool.getConnection();
			connection.release();
			console.log('MySQL Connected');
			return;
		} catch (err) {
			const isLastAttempt = attempt === DB_CONNECT_RETRIES;
			console.error(
				`Database connection failed (attempt ${attempt}/${DB_CONNECT_RETRIES}):`,
				err.message,
			);

			if (isLastAttempt) {
				console.error('Database remains unreachable after retries. Server will keep running.');
				return;
			}

			await wait(DB_CONNECT_RETRY_DELAY_MS * attempt);
		}
	}
}

void testConnectionWithRetry();

export default pool;
