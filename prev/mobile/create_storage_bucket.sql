-- Create the storage bucket for issue images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'issue-images', 
  'issue-images', 
  true, 
  5242880, -- 5MB limit
  '{"image/*"}'
);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Users can upload issue images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'issue-images' 
    AND auth.role() = 'authenticated'
  );

-- Create policy to allow public read access to images
CREATE POLICY "Anyone can view issue images" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-images');

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their own issue images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'issue-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own issue images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'issue-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );