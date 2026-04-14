import crypto from 'crypto';
import { Router } from 'express';

const router = Router();

// Generate signed Cloudinary upload signature
export const generateUploadSignature = (folder: string): { signature: string; timestamp: number; api_key: string } => {
  const timestamp = Math.floor(Date.now() / 1000);
  const string_to_sign = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(string_to_sign).digest('hex');

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY || ''
  };
};

// Endpoint to get upload signature
router.post('/get-signature', (req: any, res: any) => {
  const { folder } = req.body;

  if (!folder) {
    return res.status(400).json({ message: 'Folder is required' });
  }

  // Validate folder to prevent abuse
  const allowedFolders = ['achievements', 'alumni', 'avatars'];
  if (!allowedFolders.includes(folder)) {
    return res.status(400).json({ message: 'Invalid folder' });
  }

  try {
    const signatureData = generateUploadSignature(folder);
    res.json(signatureData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate signature' });
  }
});

export default router;
