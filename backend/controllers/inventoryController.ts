import { Inventory } from '../models/Models';

export const getInventory = async (req: any, res: any) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inventory' });
  }
};

export const updateInventory = async (req: any, res: any) => {
  const userRole = (req as any).user.role;
  if (userRole !== 'captain' && userRole !== 'admin' && userRole !== 'viceCaptain') {
    return res.status(403).json({ message: 'Unauthorized to update inventory' });
  }
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: 'Error updating inventory' });
  }
};
