const Redis = require('ioredis');

const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    const url = process.env.REDIS_URL.trim().replace(/^["']|["']$/g, '');
    return {
      path: url,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      connectTimeout: 3000,
      ...(url.includes('upstash.io') || process.env.REDIS_TLS === 'true' ? { tls: {} } : {}),
      retryStrategy(times) {
        return Math.min(times * 1000, 10000);
      },
    };
  }

  const rawPassword = process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD.trim().replace(/^["']|["']$/g, '') : undefined;
  const rawHost = process.env.REDIS_HOST ? process.env.REDIS_HOST.trim().replace(/^["']|["']$/g, '') : '127.0.0.1';

  return {
    host: rawHost,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ...(rawPassword && { password: rawPassword }),
    ...(rawHost.includes('upstash.io') || process.env.REDIS_TLS === 'true' ? { tls: {} } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    enableOfflineQueue: false,
    connectTimeout: 3000,
    retryStrategy(times) {
      return Math.min(times * 1000, 10000);
    },
  };
};

const redisConfig = getRedisConfig();

const getRedisConnection = () => {
  return new Redis(redisConfig);
};

module.exports = {
  redisConfig,
  getRedisConnection,
};
