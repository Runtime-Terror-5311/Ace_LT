import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Force Node.js to prioritize IPv4 over IPv6. 
// This fixes "ENETUNREACH" errors on platforms like Render.
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Extra reliability settings
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});