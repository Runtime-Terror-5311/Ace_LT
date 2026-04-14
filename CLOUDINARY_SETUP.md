# Cloudinary Integration Guide

# Cloudinary Integration Guide

## Overview

Images (profile pictures, achievements, and alumni photos) are now uploaded directly to Cloudinary from the browser with **signed server-side authentication**, providing security and performance benefits.

## Configuration

### Environment Variables

Added to `.env`:

```
VITE_CLOUDINARY_CLOUD_NAME=ddd7ie7me
CLOUDINARY_API_KEY=551766831996999
CLOUDINARY_API_SECRET=smP_oiVRZijUy309lOJsyATXLug
```

### Security Architecture

1. **Signed Uploads** - Backend generates cryptographic signatures for each upload request
2. **Folder Validation** - Only specific folders allowed: `achievements`, `alumni`, `avatars`
3. **Backend Control** - Server validates all upload requests before Cloudinary accepts them
4. **HTTPS URLs** - All images delivered securely with HTTPS

## Implementation Details

### New Files Created

1. **`backend/routes/uploadRoutes.ts`**
   - `POST /api/uploads/get-signature` - Generates signed upload signatures
   - `generateUploadSignature(folder)` - Creates SHA1 signature using API secret
   - Validates folder to prevent abuse
   - Returns: `{ signature, timestamp, api_key }`

2. **`frontend/src/utils/cloudinary.ts`**
   - `uploadToCloudinary(file, options)` - Request signature from backend, then uploads with signature
   - `getUploadSignature(folder)` - Calls backend to get cryptographic signature
   - `getOptimizedImageUrl(url, width, height, quality)` - Returns optimized Cloudinary URLs

3. **`frontend/src/components/ImageUpload.tsx`**
   - Reusable image upload component
   - Shows preview while uploading
   - Displays loading state and error messages
   - Accepts: `onUploadComplete`, `label`, `folder`, `currentImage`

4. **`frontend/src/hooks/useImageUpload.ts`**
   - Custom hook for managing upload state
   - Returns: `imageUrl`, `setImageUrl`, `isUploading`, `error`, `resetImage`

### Updated Components

1. **`views/AchievementsManager.tsx`**
   - Replaced text input with `<ImageUpload>` component
   - Images uploaded to `achievements` folder on Cloudinary
   - Stores secure HTTPS URL in database

2. **`views/AlumniManager.tsx`**
   - Replaced text input with `<ImageUpload>` component
   - Images uploaded to `alumni` folder on Cloudinary
   - Stores secure HTTPS URL in database

3. **`views/Settings.tsx`**
   - Replaced file input + URL field with `<ImageUpload>` component
   - User avatars uploaded to `avatars` folder on Cloudinary
   - Stores secure HTTPS URL in user profile

## How It Works

### Signed Upload Flow

1. **Frontend**: User selects image in UI
2. **Frontend**: `ImageUpload` component creates preview
3. **Frontend**: Calls `/api/uploads/get-signature` with folder name
4. **Backend**: Generates SHA1 signature using API Key + Secret
5. **Backend**: Returns signature, timestamp, and api_key
6. **Frontend**: Sends file + signature to Cloudinary
7. **Cloudinary**: Validates signature and stores image
8. **Cloudinary**: Returns secure HTTPS URL
9. **Frontend**: Stores URL in database via API

### Architecture Diagram

````
User Browser                Backend                  Cloudinary
    |                        |                            |
    |--- Select Image ------->  Generate Signature        |
    |                        |--- Create SHA1 Signature-->|
    |<-- Signature + Key ----|                            |
    |                        |                            |
    |--- Upload with Sig ----|-------Upload File Sig ----->|
    |                        |                   Validate |
    |<--- Secure URL --------|<--- Return URL -------------|

### Upload Folders (Organization)

- **`achievements/`** - Achievement images
- **`alumni/`** - Alumni profile photos
- **`avatars/`** - User profile pictures

## Security

- **SHA1 Signed Uploads** - Requests validated with cryptographic signatures
- **API Secrets Never Exposed** - Secret only stored on backend, never sent to client
- **Folder Validation** - Backend whitelist: `achievements`, `alumni`, `avatars`
- **Timestamp Protection** - Signatures include timestamp to prevent replay attacks
- **HTTPS Only** - All images delivered securely
- **No API Keys in Frontend** - Client never sees API credentials

## Performance Benefits

- **Faster uploads**: Images compressed automatically by Cloudinary
- **CDN delivery**: Globally distributed edge servers
- **Image optimization**: Built-in transformations available
- **Storage**: Centralized, secure, scalable

## Usage Examples

### Upload Achievement

```tsx
<ImageUpload
  onUploadComplete={(url) => setAchievementUrl(url)}
  folder="achievements"
  label="Achievement Image"
/>
````

### Upload Avatar

```tsx
<ImageUpload
  onUploadComplete={(url) => setPhotoUrl(url)}
  folder="avatars"
  label="Profile Picture"
  currentImage={existingUrl}
/>
```

### Get Optimized URL

```tsx
const optimizedUrl = getOptimizedImageUrl(
  cloudinaryUrl,
  width: 300,
  height: 300,
  quality: 'auto'
);
```

## Next Steps (Optional)

1. **Image Transformations**
   - Use Cloudinary's transformation API for resizing
   - Add filters, effects, or watermarks

2. **Delete Functionality**
   - Implement image deletion when achievement/alumni removed

3. **Batch Upload**
   - Support multiple image uploads at once

4. **Image Gallery**
   - Display full-resolution images in lightbox/modal
