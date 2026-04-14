import { Attendance } from '../models/Models';

export const getAttendance = async (req: any, res: any) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
};

export const submitAttendance = async (req: any, res: any) => {
  const { date, statuses, presentCount, totalCount, supervisors, submittedBy } = req.body;
  const user = req.user;

  // Only leadership can submit/edit
  const allowedRoles = ['admin', 'captain', 'viceCaptain'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ message: 'Unauthorized to mark attendance' });
  }

  try {
    // Check if record exists for this date
    let record = await Attendance.findOne({ date });

    if (record) {
      // Update existing record
      record.statuses = statuses;
      record.presentCount = presentCount;
      record.totalCount = totalCount;
      record.supervisors = supervisors;
      record.lastEditedBy = user.name;
      await record.save();
      res.json(record);
    } else {
      // Create new record
      record = await Attendance.create({
        date,
        statuses,
        presentCount,
        totalCount,
        supervisors,
        submittedBy: user.name, // The person who first submitted it
        lastEditedBy: user.name
      });
      res.status(201).json(record);
    }
  } catch (err) {
    console.error('Attendance error:', err);
    res.status(400).json({ message: 'Error saving attendance' });
  }
};
