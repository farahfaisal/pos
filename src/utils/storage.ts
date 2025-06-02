import { supabase } from '../lib/supabase';

/**
 * Upload a product image to Supabase Storage
 */
export const uploadProductImage = async (file: File, productId: string): Promise<string> => {
  try {
    // Generate unique filename with timestamp to avoid conflicts
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${productId}_${timestamp}.${fileExt}`;

    // Upload new image
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('حدث خطأ أثناء رفع الصورة');
  }
};

/**
 * Delete a product image from Supabase Storage
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (!fileName) return;

    const { error } = await supabase.storage
      .from('products')
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('حدث خطأ أثناء حذف الصورة');
  }
};