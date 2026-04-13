import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../backend/models/User';
import { InductedMember } from '../backend/models/InductedMember';

dotenv.config();

async function findDuplicate() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const email = '2024ugcs102@nitjsr.ac.in';
  
  const inducted = await InductedMember.findOne({ email });
  console.log('Inducted Member with this email:', JSON.stringify(inducted, null, 2));
  
  const user = await User.findOne({ email });
  console.log('User with this email:', JSON.stringify(user, null, 2));
  
  await mongoose.disconnect();
}

findDuplicate();
