# UploadThing Integration Setup

## Environment Configuration

1. **Get your UploadThing token:**
   - Sign up at https://uploadthing.com
   - Create a new app in the dashboard
   - Copy your secret token

2. **Configure `.env` file:**
   ```
   UPLOADTHING_TOKEN=your_actual_token_here
   ```

## Current Implementation

Right now, the app uses **base64 encoding** as a temporary solution. Images are stored directly in localStorage.

### ⚠️ This is NOT suitable for production because:
- Large images bloat localStorage (5-10MB limit)
- Images aren't optimized or compressed
- No CDN delivery
- Poor performance

## Production Setup Required

### Option 1: UploadThing with Backend (Recommended)

Create a backend endpoint (Node.js/Next.js API route):

```javascript
// api/uploadthing.js or pages/api/uploadthing.js
import { createUploadthing } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Auth check here if needed
      return { userId: "user123" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { url: file.url };
    }),
};
```

Then update `upload.js` line 48-52 to call your endpoint:

```javascript
const response = await fetch('/api/uploadthing', {
  method: 'POST',
  body: formData,
});
const data = await response.json();
window.uploadedImageUrl = data.url;
```

### Option 2: Direct Client Upload

Use UploadThing's client SDK (simpler but less secure):

```bash
npm install uploadthing
```

```javascript
import { UploadButton } from "@uploadthing/react";

// Replace the custom upload UI with:
<UploadButton
  endpoint="imageUploader"
  onClientUploadComplete={(res) => {
    window.uploadedImageUrl = res[0].url;
  }}
/>
```

## Files Changed

- [.env](.env) - Environment variables (add your token)
- [.gitignore](.gitignore) - Excludes .env from git
- [upload.js](upload.js) - Upload handler (currently using base64 mock)
- [submit.html](submit.html) - File upload UI
- [main.js](main.js) - Updated to use uploaded images
- [style.css](style.css) - Upload button styles

## Next Steps

1. Add your `UPLOADTHING_TOKEN` to `.env`
2. Set up a backend endpoint or use the client SDK
3. Replace the mock implementation in [upload.js](upload.js#L48-58)
4. Test with real uploads
