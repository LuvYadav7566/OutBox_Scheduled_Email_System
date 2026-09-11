const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { restoreScheduledEmails } = require('./services/schedulerService');
const { createTransporter } = require('./config/mail');

const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import BullMQ Worker so it runs concurrently in single-service deployment
require('./worker/emailWorker');

const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Scheduled Email Backend', version: 'v1.0.5_noratelimit', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Initialize Mail Transporter (will output Ethereal account if no custom SMTP set)
    await createTransporter();

    // 3. Start HTTP Server first so port 5000 is ready immediately
    app.listen(PORT, async () => {
      console.log(`==================================================`);
      console.log(`[Server] Express server running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`==================================================`);

      // 4. CRITICAL REQUIREMENT: Restore pending scheduled emails from MongoDB into BullMQ
      await restoreScheduledEmails();
    });
  } catch (err) {
    console.error('[Server Startup Error]', err);
    process.exit(1);
  }
};

startServer();
