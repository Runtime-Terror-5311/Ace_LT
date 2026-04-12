import { CalendarEvent } from '../models/Models';

export const getEvents = async (req: any, res: any) => {
  try {
    const events = await CalendarEvent.find().sort({ year: 1, month: 1, dayOfMonth: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

export const createEvent = async (req: any, res: any) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create events.' });
    }

    const { event, dateString, time, court, dayOfMonth, month, year } = req.body;

    if (!event || !dateString || !time || !court || !dayOfMonth || month == null || !year) {
      return res.status(400).json({ message: 'All Event fields are required.' });
    }

    const newEvent = await CalendarEvent.create({
      event,
      dateString,
      time,
      court,
      dayOfMonth,
      month,
      year
    });

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
};

export const deleteEvent = async (req: any, res: any) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete events.' });
    }
    
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event' });
  }
};
