// Utility to upload any file (image/video) to Cloudinary directly from the client
// Usage: uploadToCloudinary(file, uploadPreset, cloudName)
export async function uploadToCloudinary(file, uploadPreset, cloudName) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    // Log the error for debugging
    console.error('Cloudinary upload error:', data);
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }
  return data; // returns { secure_url, ... }
}
