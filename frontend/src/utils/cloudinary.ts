// Cloudinary configuration and utilities
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';

interface UploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  crop?: string;
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  api_key: string;
}

// Get signed upload signature from backend
const getUploadSignature = async (folder: string): Promise<SignatureResponse> => {
  try {
    const response = await fetch('/api/uploads/get-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder })
    });

    if (!response.ok) {
      throw new Error('Failed to get upload signature');
    }

    return await response.json();
  } catch (error) {
    console.error('Signature generation error:', error);
    throw error;
  }
};

export const uploadToCloudinary = async (file: File, options: UploadOptions = {}): Promise<string> => {
  const folder = options.folder || 'acelawn';

  // Get signed signature from backend
  const { signature, timestamp, api_key } = await getUploadSignature(folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', api_key);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Generate optimized Cloudinary URL
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: string = 'auto'
): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url; // Return original URL if not from Cloudinary
  }

  // Transform URL to include optimization
  const params = [];
  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  params.push(`q_${quality}`);

  const optimization = params.join(',');
  return url.replace('/upload/', `/upload/${optimization}/`);
};
