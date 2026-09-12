const express = require('express');
const {
  scheduleEmail,
  getScheduledEmails,
  getSentEmails,
  cancelEmail,
} = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply JWT protection middleware to all email routes
router.use(protect);

router.post('/schedule', scheduleEmail);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.delete('/:id', cancelEmail);

module.exports = router;
