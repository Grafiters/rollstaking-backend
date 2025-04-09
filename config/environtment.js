const { config } = require('dotenv');
const { existsSync } = require('fs');

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;

// Load env file based on NODE_ENV, fallback to .env
if (existsSync(envFile)) {
  config({ path: envFile });
  console.log(`✅ Loaded env config from .env.${env}`);
} else {
  config(); // fallback to .env
  console.warn(`⚠️  ${envFile} not found. Loaded default .env`);
}
