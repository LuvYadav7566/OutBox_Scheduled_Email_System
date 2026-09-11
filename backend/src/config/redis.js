const Redis = require('ioredis');

const rawPassword = process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD.trim().replace(/^["']|["']$/g, '') : undefined;
const rawHost = process.env.REDIS_HOST ? process.env.REDIS_HOST.trim().replace(/^["']|["']$/g, '') : '127.0.0.1';

const redisConfig = {
  host: rawHost,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ...(rawPassword && { password: rawPassword }),
  ...(rawHost.includes('upstash.io') || process.env.REDIS_TLS === 'true' ? { tls: {} } : {}),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  },
};

const getRedisConnection = () => {
  return new Redis(redisConfig);
};

module.exports = {
  redisConfig,
  getRedisConnection,
};
