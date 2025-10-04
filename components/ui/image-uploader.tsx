"use client";

import React, { useRef } from 'react';
import styles from '@/styles/ImageUploader.module.css';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onRemoveImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreview,
  onImageChange,
  onRemoveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropzoneClick = () => {
    // Do not open file dialog if an image is already present
    if (imagePreview) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    onImageChange(file);
    // Reset file input to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        이미지 추가 (1개만 가능)
      </label>
      
      {imagePreview ? (
        <div className={styles.previewContainer}>
          <div className={styles.previewItem}>
            <img src={imagePreview} alt="미리보기" className={styles.previewImage} />
            <button
              type="button"
              onClick={onRemoveImage}
              className={styles.removeButton}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.dropzone} onClick={handleDropzoneClick}>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2">클릭 또는 드래그하여 이미지를 업로드하세요</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
