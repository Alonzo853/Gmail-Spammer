// send-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const { GMAIL_USER, APP_PASSWORD, TO_ADDRESS } = process.env;

  if (!GMAIL_USER || !APP_PASSWORD || !TO_ADDRESS) {
    console.error("❌ חסר מידע ב-.env (צריך GMAIL_USER, APP_PASSWORD, TO_ADDRESS)");
    process.exit(1);
  }

  // יצירת חיבור לשרת ה-SMTP של Gmail
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: GMAIL_USER,
      pass: APP_PASSWORD
    }
  });

  // תוכן המייל
  const mailOptions = {
    from: `"NodeJS Test" <${GMAIL_USER}>`,
    to: TO_ADDRESS,
    subject: "מייל מבחן מ-Node.js",
    text: "שלום! זהו מייל מבחן פשוט שנשלח בעזרת Nodemailer 🚀",
    html: "<h2>שלום!</h2><p>זהו <b>מייל מבחן</b> שנשלח בעזרת Nodemailer 🚀</p>"
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ המייל נשלח בהצלחה!");
    console.log("Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ שגיאה בשליחת המייל:", err.message || err);
  }
}

sendTestEmail();
