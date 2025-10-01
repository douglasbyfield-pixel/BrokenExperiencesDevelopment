# Supabase Storage Setup for Image Uploads

## Quick Setup for Demo (5 minutes)

### ✅ Storage Bucket Already Created

You already have an `issue-images` bucket created and configured!

The app is now using: `issue-images`

### 2. Verify Bucket Policies (Public Access)

1. Click on the `issue-images` bucket
2. Go to **Policies** tab
3. Click **New policy**
4. Choose **For full customization** 
5. Create these 3 policies:

**Policy 1: Public Read**
- Name: `Public Read`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition:
```sql
true
```

**Policy 2: Authenticated Upload**
- Name: `Authenticated Upload`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
```sql
true
```

**Policy 3: Authenticated Update**
- Name: `Authenticated Update`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition:
```sql
auth.uid() = owner
```

### 3. Verify Setup

1. Go back to Storage
2. Click on `issue-images` bucket
3. Try uploading a test image manually
4. Click on the image and copy the public URL
5. Test the URL in a new browser tab - it should show the image

## What's Been Implemented

✅ **Frontend**:
- Image upload to Supabase Storage before post creation
- Multiple image support (up to 4 images shown nicely)
- Loading states with toast notifications
- Beautiful image grid layouts:
  - 1 image: Full width, max height
  - 2 images: Side by side grid
  - 3 images: One large + two small
  - 4+ images: 2x2 grid with "+N" overlay

✅ **Backend**:
- Accepts `imageUrls` array in experience creation
- Saves multiple images to `experience_image` table
- Returns images with experience data

✅ **Feed Display**:
- Images render with nice layouts
- Responsive design
- Rounded corners and borders
- Handles missing images gracefully

## Testing

1. **Create a post with images**:
   - Go to home page
   - Click on "What's broken?"
   - Type a description
   - Click camera icon and select 1-4 images
   - Select category
   - Click Post

2. **Verify**:
   - Toast shows "Uploading images..."
   - Then "Images uploaded!"
   - Post appears in feed with images
   - Images display in nice grid layout

## Troubleshooting

**Error: "Failed to upload images"**
- Check that the `issue-images` bucket exists
- Verify bucket is public
- Check that policies are set correctly

**Images don't show in feed**
- Check browser console for errors
- Verify image URLs are accessible (try opening in new tab)
- Check that backend returned `experienceImages` in response

**CORS errors**
- Supabase Storage should handle CORS automatically for public buckets
- If issues persist, check Supabase dashboard for CORS settings

## Production Considerations (Later)

For production, you may want to:
1. Add file size limits (currently unlimited)
2. Add file type validation (currently allows all images)
3. Implement image optimization/compression
4. Add delete functionality for uploaded images
5. Consider using Supabase's image transformation CDN
6. Set up proper RLS policies for user-specific access

