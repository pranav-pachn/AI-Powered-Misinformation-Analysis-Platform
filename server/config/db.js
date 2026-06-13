import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'fake_news_detection';
const MONGO_CONNECT_RETRIES = Number(process.env.MONGO_CONNECT_RETRIES || 5);
const MONGO_CONNECT_RETRY_DELAY_MS = Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS || 2000);

let mongoClient = null;
let database = null;
let connectPromise = null;

async function ensureIndexes(db) {
	await Promise.all([
		db.collection('users').createIndex({ email: 1 }, { unique: true }),
		db.collection('users').createIndex({ username: 1 }, { unique: true }),
		db.collection('news').createIndex({ userId: 1, createdAt: -1 }),
		db.collection('claims').createIndex({ newsId: 1, createdAt: 1 }),
		db.collection('sentence_analysis').createIndex({ newsId: 1, createdAt: 1 }),
	]);
}

async function connectWithRetry() {
	if (!MONGO_URI) {
		console.warn('MONGO_URI not set; skipping MongoDB connection.');
		return null;
	}

	for (let attempt = 1; attempt <= MONGO_CONNECT_RETRIES; attempt++) {
		try {
			mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
			await mongoClient.connect();
			database = mongoClient.db(MONGO_DB_NAME);
			await ensureIndexes(database);
			console.log('MongoDB connected to', MONGO_DB_NAME);
			return database;
		} catch (error) {
			console.error(
				`MongoDB connection failed (attempt ${attempt}/${MONGO_CONNECT_RETRIES}):`,
				error.message,
			);

			if (attempt === MONGO_CONNECT_RETRIES) {
				console.error('MongoDB remains unreachable after retries.');
				return null;
			}

			await new Promise((resolve) => setTimeout(resolve, MONGO_CONNECT_RETRY_DELAY_MS * attempt));
		}
	}

	return null;
}

function getConnectPromise() {
	if (!connectPromise) {
		connectPromise = connectWithRetry();
	}

	return connectPromise;
}

export async function getDb() {
	if (database) {
		return database;
	}

	const connectedDb = await getConnectPromise();
	if (connectedDb) {
		return connectedDb;
	}

	const error = new Error('MongoDB is not configured or unavailable. Check server/.env.');
	error.statusCode = 503;
	throw error;
}

export async function getCollection(name) {
	const db = await getDb();
	return db.collection(name);
}

export async function waitForConnection() {
	const db = await getConnectPromise();
	if (!db) {
		console.warn('MongoDB is not available; server will continue but database operations may fail.');
	}
}

export async function getMongoHealth() {
	if (!MONGO_URI) {
		return {
			configured: false,
			connected: false,
			database: MONGO_DB_NAME,
		};
	}

	try {
		const db = await getDb();
		await db.command({ ping: 1 });
		return {
			configured: true,
			connected: true,
			database: MONGO_DB_NAME,
		};
	} catch (error) {
		return {
			configured: true,
			connected: false,
			database: MONGO_DB_NAME,
			error: error.message,
		};
	}
}

void getConnectPromise();

export { ObjectId, mongoClient };
