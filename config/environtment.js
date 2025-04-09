// config.js
import { config } from 'dotenv';
import { existsSync } from 'fs';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

// Load env file based on NODE_ENV, fallback to .env
if (existsSync(envFile)) {
  config({ path: envFile });
  console.log(`✅ Loaded env config from ${process.env.NODE_ENV}`);
} else {
  config(); // fallback to .env
  console.warn(`⚠️  ${envFile} not found. Loaded default .env`);
}
