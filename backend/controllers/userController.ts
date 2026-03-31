import { User } from '../models/User';

export const getUsers = async (req: any, res: any) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};
