import React, { useState } from 'react';
import { Upload, Loader, AlertCircle } from 'lucide-react';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  label?: string;
  folder?: string;
  currentImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  label = 'Upload Image',
  folder = 'acelawn',
  currentImage
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(currentImage || '');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file, { folder });
      onUploadComplete(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      
      {/* Preview */}
      {preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-emerald-200 bg-slate-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>
      )}

      {/* File Input */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer bg-emerald-50 hover:bg-emerald-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isLoading ? (
            <>
              <Loader className="animate-spin text-emerald-600 mb-2" size={32} />
              <p className="text-sm text-slate-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="text-emerald-600 mb-2" size={32} />
              <p className="text-sm text-slate-700 font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />
      </label>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
