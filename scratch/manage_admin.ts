import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../backend/models/User';
import { InductedMember } from '../backend/models/InductedMember';

dotenv.config();

async function manageAdmin() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const regNo = '2024UGCS102';
  const email = '2024ugcs102@nitjsr.ac.in';
  const phone = '9205120803';
  const name = 'Admin Student';

  console.log(`Checking for user ${regNo}...`);
  
  let user = await User.findOne({ regNo });
  
  if (user) {
    console.log('User found, updating to Admin...');
    user.role = 'admin';
    user.email = email;
    user.phone = phone;
    await user.save();
  } else {
    console.log('User not found, creating new Admin user...');
    await User.create({
      name,
      email,
      password: phone, // Default password as phone
      regNo,
      phone,
      designation: 'Admin',
      gender: 'Boys',
      currentYear: 2,
      year: 2,
      role: 'admin',
      isInducted: true
    });
  }

  // Also ensure they are in InductedMember
  let inducted = await InductedMember.findOne({ regNo });
  if (!inducted) {
    await InductedMember.create({
      email,
      name,
      regNo,
      phone
    });
  } else {
    inducted.email = email;
    await inducted.save();
  }

  console.log('Admin user access granted successfully.');
  await mongoose.disconnect();
}

manageAdmin();
