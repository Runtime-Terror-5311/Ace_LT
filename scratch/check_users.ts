import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../backend/models/User';

dotenv.config();

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const users = await User.find({}, 'email role regNo name');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

checkUsers();
