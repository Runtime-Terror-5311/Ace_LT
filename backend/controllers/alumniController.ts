import { Alumni } from '../models/Models';

export const getAlumni = async (req: any, res: any) => {
  try {
    const alumni = await Alumni.find().sort({ batch: -1 });
    res.json(alumni);
  } catch (err) {
    console.error('Error fetching alumni:', err);
    res.status(500).json({ message: 'Failed to fetch alumni' });
  }
};

export const createAlumni = async (req: any, res: any) => {
  try {
    const { name, regNo, contact, imageUrl, batch } = req.body;

    if (!name || !regNo || !contact || !imageUrl || !batch) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newAlumni = await Alumni.create({
      name,
      regNo,
      contact,
      imageUrl,
      batch
    });

    res.status(201).json(newAlumni);
  } catch (err) {
    console.error('Error creating alumni:', err);
    res.status(500).json({ message: 'Failed to create alumni' });
  }
};

export const updateAlumni = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, regNo, contact, imageUrl, batch } = req.body;

    const updatedAlumni = await Alumni.findByIdAndUpdate(
      id,
      { name, regNo, contact, imageUrl, batch },
      { new: true }
    );

    if (!updatedAlumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json(updatedAlumni);
  } catch (err) {
    console.error('Error updating alumni:', err);
    res.status(500).json({ message: 'Failed to update alumni' });
  }
};

export const deleteAlumni = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deletedAlumni = await Alumni.findByIdAndDelete(id);

    if (!deletedAlumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json({ message: 'Alumni deleted successfully' });
  } catch (err) {
    console.error('Error deleting alumni:', err);
    res.status(500).json({ message: 'Failed to delete alumni' });
  }
};
