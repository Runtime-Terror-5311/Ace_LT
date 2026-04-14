import { Match } from '../models/Models';

export const getMatches = async (req: any, res: any) => {
  try {
    const matches = await Match.find().sort({ scheduledAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching matches' });
  }
};

export const createMatch = async (req: any, res: any) => {
  // Any authenticated user can record a match

  try {
    const newMatch = await Match.create(req.body);
    res.status(201).json(newMatch);
  } catch (err) {
    res.status(400).json({ message: 'Error creating match' });
  }
};
