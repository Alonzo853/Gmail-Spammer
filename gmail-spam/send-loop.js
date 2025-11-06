// send-loop.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const APP_PASSWORD = process.env.APP_PASSWORD;
const TO_ADDRESS = process.env.TO_ADDRESS;

const DELAY_MS = parseInt(process.env.DELAY_MS || '60000', 10); // default 60s
const MAX_COUNT = parseInt(process.env.MAX_COUNT || '0', 10); // 0 = infinite
const SUBJECT_PREFIX = process.env.SUBJECT_PREFIX || 'NodeJS Test';
const BODY_TEXT = process.env.BODY_TEXT || `Hello — this is a test message sent by NodeJS at ${new Date().toISOString()}.`;

if (!GMAIL_USER || !APP_PASSWORD || !TO_ADDRESS) {
  console.error('Missing environment variables. Please set GMAIL_USER, APP_PASSWORD, TO_ADDRESS in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: GMAIL_USER, pass: APP_PASSWORD },
});

let sentCount = 0;
let running = true;
let consecutiveErrors = 0;

/**
 * Graceful shutdown
 */
function stopRunning() {
  if (!running) return;
  running = false;
  console.log('\nReceived stop signal — will finish current send (if any) and exit.');
}
process.on('SIGINT', stopRunning);
process.on('SIGTERM', stopRunning);

/**
 * sendOne: attempts to send one email. returns true on success, false on error.
 * implements simple exponential backoff via consecutiveErrors variable (handled in loop).
 */
async function sendOne() {
  const subject = `${SUBJECT_PREFIX} #${sentCount + 1} ${new Date().toISOString()}`;
  const mailOptions = {
    from: `"NodeJS Loop Test" <${GMAIL_USER}>`,
    to: TO_ADDRESS,
    subject,
    text: `${BODY_TEXT}\n\nSent at ${new Date().toISOString()}`,
    html: `<p>${BODY_TEXT}</p><p>Sent at <b>${new Date().toISOString()}</b></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    sentCount += 1;
    consecutiveErrors = 0;
    console.log(`✅ [${new Date().toISOString()}] Sent #${sentCount} — id: ${info.messageId}`);
    return true;
  } catch (err) {
    consecutiveErrors += 1;
    const errMsg = (err && err.message) ? err.message : String(err);
    console.error(`❌ [${new Date().toISOString()}] Send failed (attempt ${consecutiveErrors}): ${errMsg}`);
    return false;
  }
}

/**
 * mainLoop: sends until MAX_COUNT reached or stopped by user.
 * Adds backoff: after each error it waits DELAY_MS * 2^errors (capped).
 */
async function mainLoop() {
  console.log('Starting send loop with settings:');
  console.log(`  From: ${GMAIL_USER}`);
  console.log(`  To:   ${TO_ADDRESS}`);
  console.log(`  Delay between attempts: ${DELAY_MS} ms`);
  console.log(`  Max count (0=infinite): ${MAX_COUNT}`);
  console.log('Press Ctrl+C to stop gracefully.\n');

  // Verify SMTP once before starting
  try {
    await transporter.verify();
    console.log('SMTP verified: ready to send\n');
  } catch (err) {
    console.error('SMTP verify failed:', err && err.message ? err.message : err);
    process.exit(1);
  }

  while (running) {
    // If MAX_COUNT > 0 and we've reached it, stop.
    if (MAX_COUNT > 0 && sentCount >= MAX_COUNT) {
      console.log(`Reached MAX_COUNT (${MAX_COUNT}). Exiting.`);
      break;
    }

    const ok = await sendOne();

    // If user requested stop during send, break
    if (!running) break;

    // calculate wait time
    // baseDelay = DELAY_MS; backoff multiplier = 2^(consecutiveErrors-1), capped
    let wait = DELAY_MS;
    if (!ok && consecutiveErrors > 0) {
      const multiplier = Math.min(2 ** (consecutiveErrors - 1), 16); // cap multiplier at 16
      wait = DELAY_MS * multiplier;
      console.log(`Waiting ${wait} ms before next attempt (backoff multiplier ${multiplier}).`);
    } else {
      // on success reset consecutiveErrors was already set to 0
      // small random jitter to avoid perfect periodicity
      const jitter = Math.floor(Math.random() * Math.min(1000, Math.floor(DELAY_MS / 5)));
      wait = DELAY_MS + jitter;
    }

    // Wait loop with ability to exit quickly if SIGINT occurs
    const step = 500; // check stop flag every 500ms
    let waited = 0;
    while (waited < wait && running) {
      await new Promise(res => setTimeout(res, Math.min(step, wait - waited)));
      waited += step;
    }
  }

  console.log(`\nStopped. Sent ${sentCount} messages total. Goodbye.`);
  process.exit(0);
}

// Start
mainLoop().catch(err => {
  console.error('Fatal error in main loop:', err && err.message ? err.message : err);
  process.exit(1);
});
