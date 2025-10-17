import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  bucket?: string;
  required?: boolean;
  customTrigger?: React.ReactNode;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  bucket = 'restaurant-images',
  required = false,
  customTrigger,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes('not found')) {
          const { error: bucketError } = await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 5242880,
          });

          if (bucketError && !bucketError.message.includes('already exists')) {
            throw bucketError;
          }

          const { error: retryError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      onChange(urlData.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await uploadFile(file);
      } else {
        setError('Please upload an image file');
      }
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        await uploadFile(file);
      } else {
        setError('Please upload an image file');
      }
    }
  };

  const clearImage = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (customTrigger) {
    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        <div onClick={() => inputRef.current?.click()}>
          {customTrigger}
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && '*'}
        </label>
      )}

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
            dragActive
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            {uploading ? (
              <>
                <Loader className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-orange-600">Click to browse</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
