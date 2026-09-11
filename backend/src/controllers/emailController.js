const Email = require('../models/Email');
const { scheduleEmailJob, removeScheduledJob } = require('../services/schedulerService');

// @desc    Schedule a new email
// @route   POST /api/emails/schedule
// @access  Private
const scheduleEmail = async (req, res, next) => {
  try {
    const { to, subject, body, scheduledAt } = req.body;

    if (!to || !subject || !body || !scheduledAt) {
      return res.status(400).json({
        message: 'Please provide all required fields: to, subject, body, scheduledAt',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ message: 'Please provide a valid recipient email address' });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format for scheduledAt' });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }

    // Create Email record in MongoDB
    const email = await Email.create({
      user: req.user.id,
      to,
      subject,
      body,
      scheduledAt: scheduledDate,
      status: 'scheduled',
    });

    // Schedule delayed job in BullMQ
    await scheduleEmailJob(email._id, scheduledDate);

    return res.status(201).json(email);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all scheduled emails for logged-in user
// @route   GET /api/emails/scheduled
// @access  Private
const getScheduledEmails = async (req, res, next) => {
  try {
    const emails = await Email.find({
      user: req.user.id,
      status: 'scheduled',
    }).sort({ scheduledAt: 1 });

    return res.status(200).json(emails);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent and completed emails for logged-in user
// @route   GET /api/emails/sent
// @access  Private
const getSentEmails = async (req, res, next) => {
  try {
    const emails = await Email.find({
      user: req.user.id,
      status: { $in: ['sent', 'failed', 'processing', 'cancelled'] },
    }).sort({ updatedAt: -1 });

    return res.status(200).json(emails);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a scheduled email
// @route   DELETE /api/emails/:id
// @access  Private
const cancelEmail = async (req, res, next) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Scheduled email not found' });
    }

    // Ownership check
    if (email.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access or modify this email' });
    }

    if (email.status !== 'scheduled') {
      return res.status(400).json({
        message: `Cannot cancel email in '${email.status}' state`,
      });
    }

    // Remove BullMQ job
    await removeScheduledJob(email._id);

    // Update MongoDB status
    email.status = 'cancelled';
    await email.save();

    return res.status(200).json({
      message: 'Scheduled email cancelled successfully',
      email,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleEmail,
  getScheduledEmails,
  getSentEmails,
  cancelEmail,
};
