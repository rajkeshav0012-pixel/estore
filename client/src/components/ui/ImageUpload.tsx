import { useState, useRef } from 'react';
import { adminApi } from '../../services/adminApi';
import Loading from './Loading';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export default function ImageUpload({ 
  onUpload, 
  multiple = false, 
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      if (multiple) {
        Array.from(files).forEach(file => {
          formData.append('images', file);
        });
        
        const response = await adminApi.uploadMultipleImages(formData);
        if (response.success && response.data) {
          // Server returns { urls: string[], successful, failed, errors }
          onUpload(response.data.urls);
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } else {
        formData.append('image', files[0]);
        
        const response = await adminApi.uploadImage(formData);
        if (response.success && response.data) {
          // MongoDB storage returns { id, url }
          onUpload([response.data.url]);
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer" onClick={openFileDialog}>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        {uploading ? (
          <Loading size="sm" />
        ) : (
          <div>
            <p>Click to upload images</p>
          </div>
        )}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
