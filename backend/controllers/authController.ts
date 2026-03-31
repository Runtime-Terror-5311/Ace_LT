import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req: any, res: any) => {
  const { email, password, regNo } = req.body;
  try {
    const query = email ? { email: email.toLowerCase() } : { regNo: regNo };
    const user = await User.findOne(query);
    
    if (!user) {
      console.log(`Login failed: User not found for ${email || regNo}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: any, res: any) => {
  return res.status(403).json({ message: 'Registration is currently disabled.' });
};
