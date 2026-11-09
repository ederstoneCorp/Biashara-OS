import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.SQL_HOST || '',
    user: process.env.SQL_USER || '',
    password: process.env.SQL_PASSWORD || '',
    database: process.env.SQL_DB_NAME || '',
    port: Number(process.env.SQL_PORT || 5432),
    ssl: process.env.SQL_SSL === 'true' ? 'require' : false,
  },
});
