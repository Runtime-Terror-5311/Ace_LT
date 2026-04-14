import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendEmail } from '../config/email';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req: any, res: any) => {
  const { email, password, regNo } = req.body;
  try {
    if (!email || !regNo || !password) {
      return res.status(400).json({ message: 'Email, registration number, and password are required.' });
    }

const user = await User.findOne({
  email: email.toLowerCase(),
  regNo: String(regNo).toUpperCase()
});    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your OTP for Ace Lawn Tennis Login',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Ace Lawn Tennis Team Login</h2>
          <p>Your OTP for login is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await sendEmail({
      to: email,
      subject: (mailOptions as any).subject,
      html: (mailOptions as any).html
    });

    res.json({ message: 'OTP sent to your email. Please verify to complete login.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTP = async (req: any, res: any) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(401).json({ message: 'Invalid OTP request' });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(401).json({ message: 'OTP expired' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).otp;
    delete (userResponse as any).otpExpiry;

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: any, res: any) => {
  return res.status(403).json({ message: 'Registration is currently disabled.' });
};

export const forgotPassword = async (req: any, res: any) => {
  const { email, regNo } = req.body;
  try {
    if (!email || !regNo) {
      return res.status(400).json({ message: 'Email and registration number are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), regNo });
    if (!user) {
  return res.json({ message: 'If details are correct, OTP sent.' });
}

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset OTP for Ace Lawn Tennis',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Your OTP for resetting your password is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    };

    await sendEmail({
      to: email,
      subject: (mailOptions as any).subject,
      html: (mailOptions as any).html
    });
    res.json({ message: 'OTP sent to your email. Please verify to reset password.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: any, res: any) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(401).json({ message: 'Invalid request or OTP expired.' });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(401).json({ message: 'OTP expired.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset. You can now login.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
