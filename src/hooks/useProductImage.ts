import { useState } from 'react';
import { uploadProductImage, deleteProductImage } from '../utils/storage';
import { supabase } from '../lib/supabase';

export const useProductImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File, productId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('يجب أن يكون الملف صورة');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      }

      // Delete old image if exists
      const { data: product } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', productId)
        .single();

      if (product?.image_url) {
        await deleteProductImage(product.image_url);
      }

      // Upload new image
      const imageUrl = await uploadProductImage(file, productId);

      // Update product with new image URL
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      return imageUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء رفع الصورة';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = async (productId: string, imageUrl: string | null): Promise<void> => {
    try {
      setError(null);

      if (imageUrl) {
        await deleteProductImage(imageUrl);
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الصورة';
      setError(message);
    }
  };

  return {
    handleImageUpload,
    handleImageDelete,
    isUploading,
    error,
  };
};