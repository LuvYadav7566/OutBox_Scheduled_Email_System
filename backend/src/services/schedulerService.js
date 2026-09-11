const emailQueue = require('../queues/emailQueue');
const Email = require('../models/Email');

/**
 * Schedule a delayed BullMQ job for an email
 */
const scheduleEmailJob = async (emailId, scheduledAt) => {
  const jobId = emailId.toString();
  const scheduledTime = new Date(scheduledAt).getTime();
  const delay = Math.max(0, scheduledTime - Date.now());

  const job = await emailQueue.add(
    'send-email',
    { emailId: jobId },
    {
      delay,
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  console.log(`[Scheduler] Enqueued job '${jobId}' with delay ${delay}ms (scheduled for ${new Date(scheduledAt).toISOString()})`);
  return job;
};

/**
 * Remove a scheduled job from BullMQ
 */
const removeScheduledJob = async (emailId) => {
  const jobId = emailId.toString();
  try {
    const job = await emailQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[Scheduler] Removed job '${jobId}' from BullMQ queue`);
      return true;
    }
  } catch (error) {
    console.error(`[Scheduler Error] Failed to remove job '${jobId}':`, error.message);
  }
  return false;
};

/**
 * Restore pending scheduled emails from MongoDB into BullMQ on backend startup
 */
const restoreScheduledEmails = async () => {
  try {
    // Query all emails whose status is 'scheduled'
    const pendingEmails = await Email.find({
      status: 'scheduled',
    });

    let restoredCount = 0;
    let existingCount = 0;

    for (const email of pendingEmails) {
      const jobId = email._id.toString();
      const existingJob = await emailQueue.getJob(jobId);

      if (!existingJob) {
        const delay = Math.max(0, new Date(email.scheduledAt).getTime() - Date.now());
        await emailQueue.add(
          'send-email',
          { emailId: jobId },
          {
            delay,
            jobId,
            removeOnComplete: true,
            removeOnFail: false,
          }
        );
        restoredCount++;
      } else {
        existingCount++;
      }
    }

    const totalPending = pendingEmails.length;
    if (totalPending > 0) {
      console.log(`[Scheduler] ${totalPending} scheduled email(s) restored/verified (${restoredCount} re-enqueued, ${existingCount} active in queue)`);
    } else {
      console.log(`[Scheduler] 0 scheduled emails pending`);
    }

    return totalPending;
  } catch (error) {
    console.error('[Scheduler Error] Error restoring scheduled emails:', error.message);
    return 0;
  }
};

module.exports = {
  scheduleEmailJob,
  removeScheduledJob,
  restoreScheduledEmails,
};
