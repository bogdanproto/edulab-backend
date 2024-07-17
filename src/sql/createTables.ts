import Koa from 'koa';
import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = new Koa();
const port = process.env.PORT ?? 3000;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT ?? '5432'),
});


const createTables = async () => {
  const client = await pool.connect();

  try {
    const sqlQueries = fs.readFileSync('src/sql/edulab.sql', 'utf8');

    const queries = sqlQueries.split(/;\s*$/m);

    for (const query of queries) {
      if (query.trim().length > 0) {
        await client.query(query);
      }
    }

    console.log('\x1b[32mTables created successfully\x1b[0m');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  } finally {
    client.release();
  }
};

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    await createTables();
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
});
