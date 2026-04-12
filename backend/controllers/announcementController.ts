import { Announcement } from '../models/Models';

export const getAnnouncements = async (req: any, res: any) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
};

export const createAnnouncement = async (req: any, res: any) => {
  try {
    // Only admin can create
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create announcements.' });
    }

    const { title, content, urgent, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      author: author || 'Admin',
      date: new Date(),
      urgent: urgent || false
    });

    res.status(201).json(announcement);
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ message: 'Error creating announcement' });
  }
};
