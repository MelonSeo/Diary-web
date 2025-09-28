'use client';

import { useState, FormEvent } from 'react';
import { getS3PresignedUrl, getS3DownloadUrl } from '@/lib/client-api';

export default function TestImageUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setUploadedFileKey(null); // Clear previous key on new file selection
      setImageUrl(null); // Clear previous image on new file selection
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    setMessage('Requesting pre-signed URL for upload...');
    setUploadedFileKey(null);
    setImageUrl(null);

    try {
      const { url, key, contentType } = await getS3PresignedUrl(file.name, file.type);
      setMessage('Got upload URL. Now uploading to S3...');

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      });

      if (uploadResponse.ok) {
        setMessage(`Upload successful! File key: ${key}`);
        setUploadedFileKey(key);
      } else {
        const errorText = await uploadResponse.text();
        throw new Error(`S3 Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}. ${errorText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`An error occurred during upload: ${error.message}`);
      } else {
        setMessage('An unknown error occurred during upload.');
      }
    }
  };

  const handleViewImage = async () => {
    if (!uploadedFileKey) {
      setMessage('Please upload a file first.');
      return;
    }

    setMessage('Requesting download URL...');
    try {
      const { url } = await getS3DownloadUrl(uploadedFileKey);
      setImageUrl(url);
      setMessage('Image URL fetched successfully.');
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`An error occurred while fetching URL: ${error.message}`);
      } else {
        setMessage('An unknown error occurred while fetching URL.');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Image Upload & View</h1>
      <form onSubmit={handleUpload} style={{ marginBottom: '20px' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">1. Upload to S3</button>
      </form>
      
      <button onClick={handleViewImage} disabled={!uploadedFileKey}>
        2. View Uploaded Image
      </button>

      {message && <p style={{ marginTop: '20px', fontFamily: 'monospace' }}>{message}</p>}

      {imageUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Image Preview:</h3>
          <img src={imageUrl} alt="Uploaded content" style={{ maxWidth: '500px', border: '1px solid #ccc' }} />
        </div>
      )}
    </div>
  );
}
