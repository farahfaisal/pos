import React, { useRef } from 'react';
import { Upload, ImageIcon, X } from 'lucide-react';

interface ProductImageUploadProps {
  imageUrl: string | null;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  isUploading?: boolean;
  error?: string | null;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  imageUrl,
  onImageUpload,
  onImageRemove,
  isUploading = false,
  error = null
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }

      onImageUpload(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        صورة المنتج
      </label>
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="صورة المنتج"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = ''; // Clear the broken image
                target.classList.add('bg-gray-100');
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isUploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Upload size={16} className="ml-2" />
            {isUploading ? 'جاري الرفع...' : 'رفع صورة'}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={onImageRemove}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
            >
              <X size={16} className="ml-2" />
              حذف الصورة
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default ProductImageUpload;