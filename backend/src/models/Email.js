const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: String,
      required: [true, 'Recipient email is required'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    sentAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'processing', 'sent', 'failed', 'cancelled'],
      default: 'scheduled',
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Email', emailSchema);
