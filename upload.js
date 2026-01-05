// UploadThing client configuration
// Docs: https://docs.uploadthing.com/getting-started/appdir

// Make uploadedImageUrl globally accessible
window.uploadedImageUrl = null;

async function initUploadThing() {
  // This is a client-side implementation
  // For production, you'll need to set up a backend endpoint
  // that uses your UPLOADTHING_TOKEN securely
  
  const fileInput = document.getElementById('image-upload');
  const uploadBtn = document.getElementById('upload-trigger');
  const preview = document.getElementById('upload-preview');
  const status = document.getElementById('upload-status');
  
  if (!fileInput || !uploadBtn) return;
  
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      status.textContent = 'Please select an image file';
      status.style.color = 'var(--accent)';
      return;
    }
    
    if (file.size > 4 * 1024 * 1024) {
      status.textContent = 'Image must be under 4MB';
      status.style.color = 'var(--accent)';
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.style.backgroundImage = `url("${e.target.result}")`;
      preview.classList.remove('placeholder');
      preview.textContent = '';
    };
    reader.readAsDataURL(file);
    
    // Upload to UploadThing
    status.textContent = 'Uploading...';
    status.style.color = 'var(--accent-2)';
    
    try {
      // TODO: Replace this with your actual UploadThing endpoint
      // For now, we'll use a mock that stores the image as base64
      // In production, call your backend endpoint that uses UPLOADTHING_TOKEN
      
      const formData = new FormData();
      formData.append('file', file);
      
      // MOCK IMPLEMENTATION - Replace with real API call:
      // const response = await fetch('/api/uploadthing', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      // uploadedImageUrl = data.url;
      
      // For now, store as base64 (NOT for production)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      window.uploadedImageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      status.textContent = 'Upload complete! ✓';
      status.style.color = 'var(--accent-2)';
      
    } catch (error) {
      console.error('Upload error:', error);
      status.textContent = 'Upload failed. Please try again.';
      status.style.color = 'var(--accent)';
      window.uploadedImageUrl = null;
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUploadThing);
} else {
  initUploadThing();
}
