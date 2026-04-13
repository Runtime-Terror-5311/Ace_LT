import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends an email using Brevo's HTTP API (V3).
 * This replaces SMTP and avoids "Connection Timeout" issues on platforms like Render.
 */
export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  const apiKey = process.env.EMAIL_PASS;
  const senderEmail = process.env.EMAIL_FROM || 'adityaprakash91111@gmail.com';

  if (!apiKey) {
    throw new Error('EMAIL_PASS (API Key) is missing in environment variables');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Ace Lawn Tennis Team', email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Brevo API Error:', errorData);
    throw new Error(`Failed to send email: ${errorData.message || response.statusText}`);
  }

  return await response.json();
};