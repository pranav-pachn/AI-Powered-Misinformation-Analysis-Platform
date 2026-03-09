import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
	throw new Error('Database configuration is missing. Check environment variables.');
}

const pool = mysql.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	// SSL for production databases (like Render MySQL)
	ssl: process.env.DB_SSL === 'true' ? {
		rejectUnauthorized: true,
	} : undefined,
});

export default pool;
