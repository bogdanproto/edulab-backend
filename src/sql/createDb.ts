import dotenv from 'dotenv';
import readline from 'readline';
import { Pool, PoolClient } from 'pg';

dotenv.config();

async function createDatabase() {
  try {
    const dbName = process.env.PGDATABASE;
    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      password: process.env.PGPASSWORD,
      port: parseInt(process.env.PGPORT ?? '5432'),
    });

    console.info('Checking if the database exists...');

    const client: PoolClient = await pool.connect();
    const results = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    client.release();

    if (results.rows.length === 0) {
      await pool.query(`CREATE DATABASE "${dbName}"`);
      console.info(`Database "${dbName}" successfully created!`);
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question(
          '\x1b[31mDatabase already exists. Do you want to delete and recreate it? (yes/no): \x1b[0m',
          resolve,
        );
      });

      if (answer.toLowerCase() === 'yes') {
        await pool.end();

        const tempPool = new Pool({
          user: process.env.PGUSER,
          host: process.env.PGHOST,
          password: process.env.PGPASSWORD,
          port: parseInt(process.env.PGPORT ?? '5432'),
          database: 'postgres',
        });

        await tempPool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${dbName}' AND pid <> pg_backend_pid();
      `);

        await tempPool.query(`DROP DATABASE "${dbName}"`);
        await tempPool.query(`CREATE DATABASE "${dbName}"`);
        tempPool.end();

        console.info(`Database "${dbName}" successfully deleted and recreated!`);
      } else {
        console.info('Exit without any changes.');
        process.exit(0);
      }

      rl.close();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createDatabase();
