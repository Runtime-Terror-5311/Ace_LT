import { useState } from 'react';

interface UseImageUploadReturn {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  isUploading: boolean;
  error: string | null;
  resetImage: () => void;
}

export const useImageUpload = (initialUrl: string = ''): UseImageUploadReturn => {
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetImage = () => {
    setImageUrl('');
    setError(null);
  };

  return {
    imageUrl,
    setImageUrl,
    isUploading,
    error,
    resetImage
  };
};
