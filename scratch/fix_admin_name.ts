import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../backend/models/User';
import { InductedMember } from '../backend/models/InductedMember';

dotenv.config();

async function fixAdminName() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const regNo = '2024UGCS102';
  const correctName = 'Aditya Prakash';

  console.log(`Fixing name for ${regNo} to ${correctName}...`);
  
  // Update User
  const user = await User.findOne({ regNo });
  if (user) {
    user.name = correctName;
    await user.save();
    console.log('User model updated.');
  }

  // Update InductedMember
  // First, check if there's a duplicate InductedMember with CS127 but Aditya's email
  const conflictingInductee = await InductedMember.findOne({ email: '2024ugcs102@nitjsr.ac.in' });
  if (conflictingInductee) {
      console.log(`Found conflicting inductee with regNo ${conflictingInductee.regNo}. Updating it to ${regNo}...`);
      conflictingInductee.regNo = regNo;
      conflictingInductee.name = correctName;
      await conflictingInductee.save();
  } else {
      let inducted = await InductedMember.findOne({ regNo });
      if (inducted) {
        inducted.name = correctName;
        await inducted.save();
      } else {
        await InductedMember.create({
          regNo,
          name: correctName,
          email: '2024ugcs102@nitjsr.ac.in',
          phone: '9205120803'
        });
      }
  }

  console.log('Name fixed successfully.');
  await mongoose.disconnect();
}

fixAdminName();
