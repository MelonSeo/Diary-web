"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/NewDiaryForm.module.css"; // Reusing styles from NewDiaryForm
import { updateDiary } from "@/lib/client-api";
import ImageUploader from "@/components/ui/image-uploader";
import FormActions from "@/components/ui/form-actions";
import { DiaryEntry } from "@/types/diary";

interface UpdateDiaryFormProps {
  initialDiary: DiaryEntry;
}

export default function UpdateDiaryForm({ initialDiary }: UpdateDiaryFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialDiary.title);
    const [content, setContent] = useState(initialDiary.content);
    // For simplicity, image update is not fully implemented here.
    // In a real app, you'd handle existing images and new uploads more robustly.
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(initialDiary.images.map(img => img.url));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Note: For a full implementation, you'd need to handle existing images
    // (e.g., display them, allow deletion, and send updates to the API).
    // This example focuses on text content update.

    const handleImageChange = (files: FileList | null) => {
        if (files) {
            const newFiles = Array.from(files);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index: number) => {
        // This currently only removes newly added images from preview/state.
        // For existing images, you'd need to send a delete request to the API.
        URL.revokeObjectURL(imagePreviews[index]); // Clean up memory for new images
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!title.trim() || !content.trim()) {
            setError("제목과 내용은 필수입니다.");
            setIsSubmitting(false);
            return;
        }

        try {
            const updated =await updateDiary(initialDiary.id as string, { title, content });
            alert("일기가 성공적으로 수정되었습니다.");
            router.push(`/my-diaries/${updated.id.toString()}`);
            router.refresh();
        } catch (err) {
            setError("일기 수정에 실패했습니다. 다시 시도해주세요.");
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.formTitle}>일기 수정</h1>
            <p className={styles.formDescription}>일기 내용을 수정하고 저장하세요.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>제목</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="content" className={styles.label}>내용</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.textarea}
                        required
                    />
                </div>

                {/* ImageUploader is included but full image update logic is simplified for this example */}
                <div className={styles.formGroup}>
                    <ImageUploader
                        imagePreviews={imagePreviews}
                        onImagesChange={handleImageChange}
                        onRemoveImage={handleRemoveImage}
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <FormActions isSubmitting={isSubmitting} onCancel={() => router.back()} />
            </form>
        </div>
    );
}
