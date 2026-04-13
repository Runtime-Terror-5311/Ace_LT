import { User } from '../models/User';
import { InductedMember } from '../models/InductedMember';

export const seedDatabase = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Database is empty, seeding fresh data...');
    await InductedMember.deleteMany({});
    
    const freshData = [
      { regNo: '2023UGEE018', phone: '987654321', designation: 'Captain ', gender: 'Girls' },
      { regNo: '2023UGEE026', phone: '9678345216', designation: 'Member', gender: 'Girls' },
      { regNo: '2024UGCS019', phone: '8353725382', designation: 'Vice Captain', gender: 'Girls' },
      { regNo: '2025UGEE080', phone: '7363537252', designation: 'Member', gender: 'Girls' },
      { regNo: '2023UGME018', phone: '987654221', designation: 'Captain ', gender: 'Boys' },
      { regNo: '2023UGEC026', phone: '9648345216', designation: 'Member', gender: 'Boys' },
      { regNo: '2024UGCS018', phone: '8353925382', designation: 'Vice Captain', gender: 'Boys' },
      { regNo: '2025UGEE090', phone: '7063537252', designation: 'Member', gender: 'Boys' },
      { regNo: '2024UGCS102', phone: '9205120803', designation: 'Admin', gender: 'Boys', email: '2024ugcs102@nitjsr.ac.in' },
    ];

    for (const d of freshData) {
      const yearJoined = parseInt(d.regNo.substring(0, 4));
      let collegeYear = 0;
      if (yearJoined === 2025) collegeYear = 1;
      else if (yearJoined === 2024) collegeYear = 2;
      else if (yearJoined === 2023) collegeYear = 3;

      let role = 'member';
      const des = d.designation.trim().toLowerCase();
      if (des === 'admin') role = 'admin';
      else if (des === 'captain') role = 'captain';
      else if (des === 'vice captain') role = 'viceCaptain';

      const email = (d as any).email || `${d.regNo.toLowerCase()}@nitjsr.ac.in`;

      await InductedMember.create({
        email: email,
        name: d.regNo,
        regNo: d.regNo,
        phone: d.phone
      });

      await User.create({
        name: d.regNo, 
        email: email,
        password: d.phone,
        regNo: d.regNo,
        phone: d.phone,
        designation: d.designation.trim(),
        gender: d.gender,
        currentYear: collegeYear,
        year: collegeYear,
        role: role,
        isInducted: true
      });
    }
    console.log('Seeded fresh data into MongoDB');
  } else {
    console.log(`Database already has ${userCount} users, skipping seeding.`);
  }
};
