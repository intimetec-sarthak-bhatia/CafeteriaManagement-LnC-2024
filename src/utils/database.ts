import { createPool, Pool } from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const pool: Pool = createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
