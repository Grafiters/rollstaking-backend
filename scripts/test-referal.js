const solanaWeb3 = require('@solana/web3.js');
const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;

if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    console.log(`Loaded environment from ${envFile}`);
} else {
    console.error(`Environment file ${envFile} not found.`);
    process.exit(1);
}

const MAX_RETRY = 5;

const generateWAllet = () => {
    const keyPair = solanaWeb3.Keypair.generate();

    return keyPair
}

const updateToDatabase = async () => {
    let parent_id = null;

    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
    })

    await client.connect()

    const now = new Date()

    const data = [];
    
    for (let index = 0; index < 10; index++) {
        const wallet = generateWAllet()
        
        let success = false;

        while (!success) {
            const query = `
                INSERT INTO users (address, uid, parent_id, claim_reff_reward, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;

            const uid = generateUID();

            const value = [
                wallet.publicKey.toBase58(),
                uid.toLowerCase(),
                null,
                0,
                now,
                now
            ]

            const res = await client.query(query, value);

            
            data.push({
                id: res.rows[0].id,
                address: wallet.publicKey.toBase58(),
                parent_id: parent_id,
            })

            parent_id = res.rows[0].id;
            success = true;
        }
    }

    console.log(`success add user with data`);
    console.log(data);
}

function generateUID(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let uid = '';
    for (let i = 0; i < length; i++) {
      uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
}
  

updateToDatabase()