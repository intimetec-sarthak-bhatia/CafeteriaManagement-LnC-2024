import { createPool, Pool } from 'mysql2/promise';

const pool: Pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'CMS_LnC_2024',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
