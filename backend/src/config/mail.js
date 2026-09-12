const nodemailer = require('nodemailer');

let transporter = null;
let etherealCredentials = null;

// Static fallback credentials so cloud servers (Render) never hang on createTestAccount() HTTP API
const FALLBACK_USER = 'cxmqnuedzloiq2lj@ethereal.email';
const FALLBACK_PASS = 'pj154DaHMzTFcBJQjy';

const createTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  let user = process.env.SMTP_USER || FALLBACK_USER;
  let pass = process.env.SMTP_PASS || FALLBACK_PASS;

  etherealCredentials = { user, pass };

  console.log('---------------------------------------------------------');
  console.log('[Mail] Configured Mail Transporter:');
  console.log(`[Mail] Host: ${host}:${port}`);
  console.log(`[Mail] User: ${user}`);
  console.log('---------------------------------------------------------');

  transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });

  return transporter;
};

const getEtherealPreviewUrl = (info) => {
  return nodemailer.getTestMessageUrl(info);
};

module.exports = {
  createTransporter,
  getEtherealPreviewUrl,
  getEtherealCredentials: () => etherealCredentials,
};
