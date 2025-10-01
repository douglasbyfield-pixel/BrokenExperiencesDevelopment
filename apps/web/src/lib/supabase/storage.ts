import { createClient } from "./client";

export async function uploadExperienceImage(file: File): Promise<string> {
  const supabase = createClient();
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `issue_${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `issue-images/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('issue-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('issue-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadExperienceImage(file));
  return Promise.all(uploadPromises);
}

