import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../backend/models/User';
import { InductedMember } from '../backend/models/InductedMember';

dotenv.config();

async function fixNameSimply() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const regNo = '2024UGCS102';
  const name = 'Aditya Prakash';

  console.log('Updating names...');

  // Update User with this regNo
  await User.updateMany({ regNo }, { name });
  
  // Update InductedMember with this regNo
  await InductedMember.updateMany({ regNo }, { name });
  
  // Also update any InductedMember with the email
  await InductedMember.updateMany({ email: '2024ugcs102@nitjsr.ac.in' }, { name });

  console.log('Update complete.');
  await mongoose.disconnect();
}

fixNameSimply();
