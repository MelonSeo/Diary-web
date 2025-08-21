"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/NewDiaryForm.module.css";
import { createDiary } from "@/lib/client-api";
import ImageUploader from "@/components/ui/image-uploader";
import FormActions from "@/components/ui/form-actions";

export default function NewDiaryForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (files: FileList | null) => {
        if (files) {
            const newFiles = Array.from(files);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]); // Clean up memory
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
            const newDiary = await createDiary({ title, content,
                /*images*/ });
            router.push(`/my-diaries/${newDiary.id}`);
        } catch (err) {
            setError("일기 저장에 실패했습니다. 다시 시도해주세요.");
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.formTitle}>새 일기 작성</h1>
            <p className={styles.formDescription}>오늘 하루는 어땠나요? 소중한 순간을 기록해보세요.</p>

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
