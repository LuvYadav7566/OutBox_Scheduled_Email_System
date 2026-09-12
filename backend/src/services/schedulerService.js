const emailQueue = require('../queues/emailQueue');
const Email = require('../models/Email');
const { sendEmail } = require('./emailService');

// Helper to run an async function with timeout
const withTimeout = (promise, ms = 2000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

/**
 * Schedule a delayed BullMQ job for an email
 */
const scheduleEmailJob = async (emailId, scheduledAt) => {
  const jobId = emailId.toString();
  const scheduledTime = new Date(scheduledAt).getTime();
  const delay = Math.max(0, scheduledTime - Date.now());

  try {
    const job = await withTimeout(
      emailQueue.add(
        'send-email',
        { emailId: jobId },
        {
          delay,
          jobId,
          removeOnComplete: true,
          removeOnFail: false,
        }
      ),
      2500
    );

    console.log(`[Scheduler] Enqueued job '${jobId}' in BullMQ with delay ${delay}ms`);
    return job;
  } catch (error) {
    console.warn(`[Scheduler Notice] Redis Queue unavailable (${error.message}). Email stored safely in MongoDB & queued for fallback timer.`);
    return null;
  }
};

/**
 * Remove a scheduled job from BullMQ
 */
const removeScheduledJob = async (emailId) => {
  const jobId = emailId.toString();
  try {
    const job = await withTimeout(emailQueue.getJob(jobId), 1500);
    if (job) {
      await job.remove();
      console.log(`[Scheduler] Removed job '${jobId}' from BullMQ queue`);
      return true;
    }
  } catch (error) {
    // Non-fatal if Redis is down
  }
  return false;
};

/**
 * Restore pending scheduled emails from MongoDB into BullMQ on backend startup
 */
const restoreScheduledEmails = async () => {
  try {
    const pendingEmails = await Email.find({
      status: 'scheduled',
    });

    let restoredCount = 0;

    for (const email of pendingEmails) {
      const jobId = email._id.toString();
      try {
        const existingJob = await withTimeout(emailQueue.getJob(jobId), 1000);

        if (!existingJob) {
          const delay = Math.max(0, new Date(email.scheduledAt).getTime() - Date.now());
          await withTimeout(
            emailQueue.add(
              'send-email',
              { emailId: jobId },
              {
                delay,
                jobId,
                removeOnComplete: true,
                removeOnFail: false,
              }
            ),
            1000
          );
          restoredCount++;
        }
      } catch (err) {
        // Skip individual Redis job restoration if Redis is offline
      }
    }

    const totalPending = pendingEmails.length;
    console.log(`[Scheduler] ${totalPending} scheduled email(s) found in MongoDB (${restoredCount} synced to BullMQ)`);

    return totalPending;
  } catch (error) {
    console.error('[Scheduler Error] Error checking scheduled emails:', error.message);
    return 0;
  }
};

/**
 * Fallback Poller: Periodically check MongoDB for due scheduled emails
 * Ensures emails are sent on time even when local Redis is not running!
 */
const processDueEmails = async () => {
  try {
    const now = new Date();
    const dueEmails = await Email.find({
      status: 'scheduled',
      scheduledAt: { $lte: now },
    }).limit(10);

    for (const email of dueEmails) {
      const updatedEmail = await Email.findOneAndUpdate(
        { _id: email._id, status: 'scheduled' },
        { status: 'processing' },
        { new: true }
      );

      if (!updatedEmail) continue;

      console.log(`[Scheduler Poller] Processing due email ${email._id} to ${email.to}`);
      try {
        const result = await sendEmail({
          to: email.to,
          subject: email.subject,
          body: email.body,
        });

        updatedEmail.status = 'sent';
        updatedEmail.sentAt = new Date();
        updatedEmail.error = null;
        await updatedEmail.save();

        console.log(`[Scheduler Poller Success] Sent email ${email._id} to ${email.to}`);
        if (result.previewUrl) {
          console.log(`[Scheduler Poller Ethereal] ${result.previewUrl}`);
        }
      } catch (err) {
        console.error(`[Scheduler Poller Error] Failed to send email ${email._id}: ${err.message}`);
        updatedEmail.status = 'failed';
        updatedEmail.error = err.message;
        await updatedEmail.save();
      }
    }
  } catch (err) {
    // Ignore errors during fallback check
  }
};

// Start fallback poller interval (runs every 10 seconds)
setInterval(processDueEmails, 10000);

module.exports = {
  scheduleEmailJob,
  removeScheduledJob,
  restoreScheduledEmails,
  processDueEmails,
};
