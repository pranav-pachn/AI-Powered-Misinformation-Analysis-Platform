import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDb } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function applySchema() {
  const db = await getDb();

  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('users').createIndex({ username: 1 }, { unique: true }),
    db.collection('news').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('claims').createIndex({ newsId: 1, createdAt: 1 }),
    db.collection('sentence_analysis').createIndex({ newsId: 1, createdAt: 1 }),
  ]);

  console.log('MongoDB indexes ensured successfully.');
}

applySchema().catch((error) => {
  console.error('Failed to apply schema:', error.message);
  process.exitCode = 1;
});
