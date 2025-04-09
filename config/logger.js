// config/logger.cjs
module.exports = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      levelFirst: true,
      ignore: 'pid,hostname'
    }
  },
  level: process.env.LOG_LEVEL || 'debug'
};
