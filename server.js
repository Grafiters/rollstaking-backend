require('./config/environtment.js');
const Fastify = require('fastify');
const dotenv = require('dotenv');
const cors = require('@fastify/cors');
const { Sequelize } = require('sequelize');
const logger = require('./config/logger.js');
const router = require('./routes/index.js')

dotenv.config();

const host = '0.0.0.0';
const port = process.env.PORT || 3000;

const fastify = Fastify({ logger });

fastify.get('/', (req, res) => {
    res.send(JSON.stringify(
        {
            status: 200,
            message: 'Backend Nusa Blockchain is running'
        }
    ));
});

fastify.register(router);

const {
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_DIALECT
  } = process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT
});

const start = async () => {
    try {
      await fastify.register(cors, {
        origin: '*', // Allow all origins (for dev)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      });
      
      console.log('✅ Enabling Cors');

      console.log('📡 Connecting to database...');
      await sequelize.authenticate();
      console.log('✅ Database connected');
  
      await fastify.listen({ port, host }, (err, address) => {
        if (err) {
          fastify.log.error(err);
          process.exit(1);
        }
        fastify.log.info(`Server listening at ${address}`);
      });
      console.log(`🚀 Server running at http://${host}:${port}`);
    } catch (err) {
      console.error('❌ Failed to start:', err.message);
      process.exit(1);
    }
};
  

start();
