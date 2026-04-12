import { connectDB } from './config/db';
import { User } from './models/User';
import { InductedMember } from './models/InductedMember';

async function clearDatabase() {
  try {
    await connectDB();
    console.log('Connected to database. Clearing all data...');

    await User.deleteMany({});
    await InductedMember.deleteMany({});
    // Add other models if needed
    console.log('Database cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();