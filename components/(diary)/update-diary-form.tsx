"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/NewDiaryForm.module.css"; // Reusing styles from NewDiaryForm
import {getS3DownloadUrl, getS3PresignedUrl, updateDiary} from "@/lib/client-api";
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

    // For new image uploads
    const [newImage, setNewImage] = useState<File | null>(null);
    // For display (can be existing URL or new object URL)
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    // To track if the user explicitly removed the existing image
    const [isImageRemoved, setIsImageRemoved] = useState(false);

    useEffect(() => {
        // Fetch the initial image URL if it exists and a new image hasn't been staged
        if (initialDiary.imageKey && !newImage) {
            getS3DownloadUrl(initialDiary.imageKey)
                .then(data => setImagePreview(data.url))
                .catch(err => {
                    console.error("Failed to fetch initial image for update form:", err);
                });
        }
    }, [initialDiary.imageKey, newImage]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (file: File | null) => {
        if (file) {
            // Clean up previous object URL if it exists
            if (newImage && imagePreview) {
                URL.revokeObjectURL(imagePreview!);
            }
            setNewImage(file);
            setImagePreview(URL.createObjectURL(file));
            setIsImageRemoved(false); // A new image is selected, so it's not "removed"
        }
    };

    const handleRemoveImage = () => {
        // Clean up object URL if the preview was from a new file
        if (newImage && imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setNewImage(null);
        setImagePreview(null);
        setIsImageRemoved(true); // Mark that the image has been removed
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
            const dataToUpdate: { title: string; content: string; imageKeys?: string[] } = {
                title,
                content,
            };

            let newImageKey: string | null = null;

            // Scenario 1: A new image was uploaded
            if (newImage) {
                const { url, key, contentType } = await getS3PresignedUrl(newImage.name, newImage.type);
                const uploadResponse = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': contentType },
                    body: newImage,
                });

                if (!uploadResponse.ok) {
                    throw new Error("S3 이미지 업로드에 실패했습니다.");
                }
                newImageKey = key;
                dataToUpdate.imageKeys = [newImageKey];
            } 
            // Scenario 2: Existing image was removed, and no new one was added
            else if (isImageRemoved) {
                dataToUpdate.imageKeys = []; // Send empty array to signify removal
            }
            // Scenario 3: No change to image, do not send imageKeys property

            const updated = await updateDiary(initialDiary.id as string, dataToUpdate);
            
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
