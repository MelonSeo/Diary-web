"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/NewDiaryForm.module.css";
import { createDiary, getS3PresignedUrl } from "@/lib/client-api";
import ImageUploader from "@/components/ui/image-uploader";
import FormActions from "@/components/ui/form-actions";

export default function NewDiaryForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (file: File | null) => {
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImage(null);
        setImagePreview(null);
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
            let uploadedImageKey: string | undefined;

            if (image) {
                // 1. Get pre-signed URL for the image
                const { url, key, contentType } = await getS3PresignedUrl(image.name, image.type);
                console.log("S3 pre-signed URL:", url);

                // 2. Upload image to S3
                const uploadResponse = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': contentType },
                    body: image,
                });
                console.log("Uploaded image to S3");

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    throw new Error(`S3 Upload failed: ${uploadResponse.status}. ${errorText}`);
                }
                console.log(uploadResponse);
                uploadedImageKey = key;
            }

            // 3. Create diary with the image key
            console.log("Creating diary with data:", { title, content, diaryDate, imageKey: uploadedImageKey });
            const newDiary = await createDiary({ title, content, diaryDate, imageKey: uploadedImageKey });
            console.log("Response from createDiary:", newDiary);
            
            // 4. Clean up object URL and redirect
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            router.push(`/my-diaries/${newDiary.id}`);

        } catch (err) {
            setError("일기 저장에 실패했습니다. 이미지 업로드 또는 서버 통신에 문제가 발생했을 수 있습니다.");
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
                    <label htmlFor="diaryDate" className={styles.label}>날짜</label>
                    <input
                        type="date"
                        id="diaryDate"
                        value={diaryDate}
                        onChange={(e) => setDiaryDate(e.target.value)}
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
                        imagePreview={imagePreview}
                        onImageChange={handleImageChange}
                        onRemoveImage={handleRemoveImage}
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <FormActions isSubmitting={isSubmitting} onCancel={() => router.back()} />
            </form>
        </div>
    );
}
