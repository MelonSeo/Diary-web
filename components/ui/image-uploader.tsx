"use client";

import React, { useRef } from 'react';
import styles from '@/styles/ImageUploader.module.css';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  imagePreviews: string[];
  onImagesChange: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreviews,
  onImagesChange,
  onRemoveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        이미지 추가
      </label>
      <div className={styles.dropzone} onClick={handleDropzoneClick}>
        <input
          type="file"
          id="images"
          name="images"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={(e) => onImagesChange(e.target.files)}
          className="hidden"
        />
        <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-2">클릭 또는 드래그하여 이미지를 업로드하세요</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
      </div>

      {imagePreviews.length > 0 && (
        <div className={styles.previewContainer}>
          {imagePreviews.map((preview, index) => (
            <div key={index} className={styles.previewItem}>
              <img src={preview} alt={`미리보기 ${index + 1}`} className={styles.previewImage} />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className={styles.removeButton}
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
