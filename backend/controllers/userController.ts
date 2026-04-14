import { User } from '../models/User';
import { InductedMember } from '../models/InductedMember';

export const getUsers = async (req: any, res: any) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const registerUser = async (req: any, res: any) => {
  try {
    // Only leadership (admin, captain, viceCaptain) can register
    const allowedRoles = ['admin', 'captain', 'viceCaptain'];
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Only leadership can register new members.' });
    }

    const { name, email, regNo, phone, designation, gender, currentYear, role, avatar } = req.body;

    if (!name || !email || !regNo || !phone || !gender) {
      return res.status(400).json({ message: 'Name, email, regNo, phone, and gender are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { regNo }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or regNo already exists.' });
    }

    // Determine year from regNo
    const yearJoined = parseInt(regNo.substring(0, 4));
    let collegeYear = currentYear || 0;
    if (!currentYear) {
      const currentCalendarYear = new Date().getFullYear();
      collegeYear = currentCalendarYear - yearJoined + 1;
      if (collegeYear < 1) collegeYear = 1;
      if (collegeYear > 4) collegeYear = 4;
    }

    // Determine role
    let userRole = role || 'member';
    if (designation) {
      const des = designation.trim().toLowerCase();
      if (des === 'captain') userRole = 'captain';
      else if (des === 'vice captain') userRole = 'viceCaptain';
    }

    // Create InductedMember entry
    await InductedMember.create({
      email: email.toLowerCase(),
      name,
      regNo,
      phone
    });

    // Create User entry (password = phone number)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: phone,
      regNo,
      phone,
      designation: designation || userRole,
      gender,
      currentYear: collegeYear,
      year: collegeYear,
      role: userRole,
      isInducted: true,
      avatar: avatar
    });

    const userResponse = newUser.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).otp;
    delete (userResponse as any).otpExpiry;

    res.status(201).json({ message: 'Member registered successfully.', user: userResponse });
  } catch (err: any) {
    console.error('Register user error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate entry. User with this email, regNo, or phone already exists.' });
    }
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const deleteUser = async (req: any, res: any) => {
  try {
    const allowedLeadership = ['admin', 'captain', 'viceCaptain'];
    if (!allowedLeadership.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Only leadership can delete members.' });
    }

    const { id } = req.params;
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Don't allow deleting self
    if (userToDelete._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(id);
    await InductedMember.findOneAndDelete({ regNo: userToDelete.regNo });

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const togglePaymentStatus = async (req: any, res: any) => {
  try {
    const allowedLeadership = ['admin', 'captain', 'viceCaptain'];
    if (!allowedLeadership.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Only leadership can update payment status.' });
    }

    const { id } = req.params;
    const { isPaid } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isPaid = isPaid;
    await user.save();

    res.json({ message: `Payment status updated for ${user.name}.`, user });
  } catch (err) {
    console.error('Update payment status error:', err);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};

export const updateUserProfile = async (req: any, res: any) => {
  try {
    const { avatar } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
