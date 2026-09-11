const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Worker } = require('bullmq');
const { redisConfig } = require('../config/redis');
const connectDB = require('../config/db');
const Email = require('../models/Email');
const { sendEmail } = require('../services/emailService');

// Connect to MongoDB
connectDB();

console.log('[Worker] Starting BullMQ Email Worker (Concurrency: 5)...');

const worker = new Worker(
  'emailQueue',
  async (job) => {
    const { emailId } = job.data;
    console.log(`[Worker] Processing job ${job.id} for Email ID: ${emailId} (Attempt ${job.attemptsMade + 1})`);

    const email = await Email.findById(emailId);

    if (!email) {
      console.warn(`[Worker Warning] Email ${emailId} not found in MongoDB. Skipping job.`);
      return;
    }

    if (email.status !== 'scheduled') {
      console.warn(`[Worker Warning] Email ${emailId} status is '${email.status}', not 'scheduled'. Skipping send.`);
      return;
    }

    // Step 1: Update status to processing
    email.status = 'processing';
    await email.save();
    console.log(`[Worker] Email ${emailId} marked as 'processing'`);

    try {
      // Step 2: Send email via Nodemailer
      const result = await sendEmail({
        to: email.to,
        subject: email.subject,
        body: email.body,
      });

      // Step 3: Update status to sent
      email.status = 'sent';
      email.sentAt = new Date();
      email.error = null;
      await email.save();

      console.log(`[Worker Success] Email ${emailId} successfully sent to ${email.to}`);
      if (result.previewUrl) {
        console.log(`[Worker Ethereal URL] ${result.previewUrl}`);
      }

      return { status: 'sent', sentAt: email.sentAt };
    } catch (err) {
      console.error(`[Worker Error] Failed to send Email ${emailId}: ${err.message}`);
      
      // If this is the last attempt or job fails
      email.status = 'failed';
      email.error = err.message;
      await email.save();

      throw err; // Rethrow to let BullMQ track failed job / retries
    }
  },
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker Event] Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker Event] Job ${job.id} failed with error: ${err.message}`);
});

let lastLoggedRefused = 0;

worker.on('error', (err) => {
  const isRefused = err.message && (err.message.includes('ECONNREFUSED') || err.message.includes('enableOfflineQueue') || err.message.includes('closed'));
  if (isRefused) {
    const now = Date.now();
    if (now - lastLoggedRefused > 60000) {
      lastLoggedRefused = now;
      console.warn(`[Worker Notice] Waiting for Redis on ${redisConfig.host || 'Redis server'}... (Emails will still be scheduled & sent via MongoDB fallback!)`);
    }
  } else {
    console.error(`[Worker Event Error] ${err.message}`);
  }
});
