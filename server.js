import './config/environtment.js';
import Fastify from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

dotenv.config();
const host = '0.0.0.0';
const port = process.env.PORT || 3000;

const fastify = Fastify({ logger: true });

await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '15 minutes'
});

fastify.get('/', (req, res) => {
    res.send(JSON.stringify(
        {
            status: 200,
            message: 'Backend Nusa Blockchain is running'
        }
    ))
});

const start = async () => {
    try {
      await fastify.listen({ port: port || 3000, host: host });
      console.log('🚀 Server is running');
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
};

start();