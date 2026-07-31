import { createTransport } from 'nodemailer';

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  };
}

export async function sendVerificationEmail(to: string, code: string) {
  const from = process.env.SMTP_FROM ?? 'MamaTrack <no-reply@mamatrack.local>';
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[dev] OTP for ${to}: ${code}`);
      return;
    }
    throw new Error('SMTP is not configured');
  }

  const transporter = createTransport(smtpConfig);

  await transporter.sendMail({
    from,
    to,
    subject: 'Your MamaTrack verification code',
    text: `Your verification code is ${code}. It expires in 15 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`,
  });
}

export async function sendCheckInReminderEmail(
  to: string,
  patientName: string,
  period: 'morning' | 'evening',
) {
  const from = process.env.SMTP_FROM ?? 'MamaTrack <no-reply@mamatrack.local>';
  const smtpConfig = getSmtpConfig();
  const periodLabel = period === 'morning' ? 'morning' : 'evening';
  const subject = `Reminder: record your ${periodLabel} check-in`;
  const text = `Hi ${patientName}, please open MamaTrack and record how you are feeling this ${periodLabel}. Your care team uses this to support you during pregnancy.`;
  const html = `<p>Hi ${patientName},</p><p>Please open MamaTrack and record how you are feeling this <strong>${periodLabel}</strong>.</p><p>Your care team uses this to support you during pregnancy.</p>`;

  if (!smtpConfig) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[dev] Check-in reminder (${periodLabel}) for ${to}`);
      return;
    }
    throw new Error('SMTP is not configured');
  }

  const transporter = createTransport(smtpConfig);
  await transporter.sendMail({ from, to, subject, text, html });
}
