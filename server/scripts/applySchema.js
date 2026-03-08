import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function applySchema() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Database configuration is missing. Check environment variables.');
  }

  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf-8');

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  await connection.query(schemaSql);
  await connection.end();

  console.log('Schema applied successfully.');
}

applySchema().catch((error) => {
  console.error('Failed to apply schema:', error.message);
  process.exitCode = 1;
});
