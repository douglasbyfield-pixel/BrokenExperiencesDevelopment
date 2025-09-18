import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

export class ImageService {
  static async uploadImage(imageUri: string, userId: string): Promise<string> {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `issue_${userId}_${timestamp}.jpg`;
      const filePath = `issue-images/${filename}`;

      // Read the image as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Convert base64 to Uint8Array directly (React Native compatible)
      const binaryString = atob(base64);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('issue-images')
        .upload(filePath, uint8Array, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('issue-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filePath = `issue-images/${filename}`;

      const { error } = await supabase.storage
        .from('issue-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteImage:', error);
      throw error;
    }
  }

  static getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Otherwise, get the public URL from Supabase
    const { data } = supabase.storage
      .from('issue-images')
      .getPublicUrl(imagePath);

    return data.publicUrl;
  }
}