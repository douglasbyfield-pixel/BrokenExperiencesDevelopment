'use client';

import { useState } from 'react';
import { Button } from '@web/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { uploadExperienceImage } from '@web/lib/supabase/storage';

export default function UploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      console.log('🚀 Starting upload test...');
      const imageUrl = await uploadExperienceImage(selectedFile);
      console.log('✅ Upload successful:', imageUrl);
      setUploadResult(imageUrl);
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <a href="/dev" className="text-blue-400 hover:underline mb-6 block">
          &larr; Back to Dev Tools
        </a>
        
        <h1 className="text-4xl font-bold mb-8 text-center">🧪 Image Upload Test</h1>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Test Image Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select an image file:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {selectedFile && (
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm">
                  <strong>Selected file:</strong> {selectedFile.name}
                </p>
                <p className="text-sm">
                  <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm">
                  <strong>Type:</strong> {selectedFile.type}
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>

            {error && (
              <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
                <p className="text-red-200 font-medium">Error:</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {uploadResult && (
              <div className="p-4 bg-green-900 border border-green-700 rounded-lg">
                <p className="text-green-200 font-medium">Success!</p>
                <p className="text-green-300 text-sm mb-3">Image uploaded successfully</p>
                <div className="space-y-2">
                  <p className="text-green-300 text-sm">
                    <strong>URL:</strong> {uploadResult}
                  </p>
                  <div className="mt-3">
                    <img
                      src={uploadResult}
                      alt="Uploaded image"
                      className="max-w-full h-auto rounded-lg border border-gray-600"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
          <p className="text-sm text-blue-200">
            Check the browser console for detailed upload logs. This test will help us identify
            if the issue is with file upload, Supabase configuration, or image rendering.
          </p>
        </div>
      </div>
    </div>
  );
}
