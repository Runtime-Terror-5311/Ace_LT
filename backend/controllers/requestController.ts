import { EquipmentRequest } from '../models/Models';

export const getRequests = async (req: any, res: any) => {
  try {
    const requests = await EquipmentRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

export const createRequest = async (req: any, res: any) => {
  try {
    const newRequest = await EquipmentRequest.create({
      ...req.body,
      userId: (req as any).user.id
    });
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(400).json({ message: 'Error creating request' });
  }
};

export const updateRequest = async (req: any, res: any) => {
  const userRole = (req as any).user.role;
  if (userRole !== 'captain' && userRole !== 'admin' && userRole !== 'viceCaptain') {
    return res.status(403).json({ message: 'Unauthorized to manage requests' });
  }
  try {
    const updatedRequest = await EquipmentRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: 'Error updating request' });
  }
};
