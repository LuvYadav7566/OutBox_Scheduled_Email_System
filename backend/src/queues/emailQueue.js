const { Queue } = require('bullmq');
const { redisConfig } = require('../config/redis');

const emailQueue = new Queue('emailQueue', {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

module.exports = emailQueue;
