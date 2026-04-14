import { Achievement } from '../models/Models';


export const getAchievements = async (req: any, res: any) => {
  try {
    const items = await Achievement.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
};

export const createAchievement = async (req: any, res: any) => {
  try {
    if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
}
    const { role } = req.user;
    if (role !== 'admin' && role !== 'captain' && role !== 'viceCaptain') {
      return res.status(403).json({ message: 'Not authorized to add achievements' });
    }
const { title, description, date } = req.body;

if (!title || !date) {
  return res.status(400).json({ message: 'Missing required fields' });
}

const achievement = new Achievement({
  title,
  description,
  date
});    const saved = await achievement.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create achievement' });
  }
};

export const deleteAchievement = async (req: any, res: any) => {
  try {
    if (!req.user) {
  return res.status(401).json({ message: 'Unauthorized' });
}
    const { role } = req.user;
    if (role !== 'admin' && role !== 'captain' && role !== 'viceCaptain') {
      return res.status(403).json({ message: 'Not authorized to delete achievements' });
    }
    const deleted = await Achievement.findByIdAndDelete(req.params.id);

if (!deleted) {
  return res.status(404).json({ message: 'Achievement not found' });
}

res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete achievement' });
  }
};