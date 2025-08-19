"use client";

import { useState, useTransition, useRef, ChangeEvent, FormEvent } from "react";
import styles from "@/styles/NewDiaryForm.module.css";
import {createDiary} from "@/lib/client-api";

type DiaryImage = {
    id?: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
};

export default function NewDiaryPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState<DiaryImage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFiles(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        // 미리보기 URL 생성 + 메타 수집
        const next: DiaryImage[] = files.map((f) => ({
            url: URL.createObjectURL(f),
            filename: f.name,
            size: f.size,
            mimeType: f.type || "application/octet-stream",
        }));

        setImages((prev) => [...prev, ...next]);
    }

    function removeImage(idx: number) {
        setImages((prev) => {
            const copy = [...prev];
            // revoke object URL
            const toRemove = copy[idx];
            if (toRemove?.url?.startsWith("blob:")) {
                URL.revokeObjectURL(toRemove.url);
            }
            copy.splice(idx, 1);
            return copy;
        });
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // 업로드 정책:
        // - 실제 이미지 파일 업로드가 필요하면, FormData로 파일 자체를 서버에 전송해야 한다.
        // - 여기서는 간단히 “본문 JSON” + “이미지 메타(추후 서버에서 업로드 URL 발급 후 업로드)” 형태를 예시로 보여준다.

        // 파일 자체가 필요하면 fileInputRef.current?.files 사용 → FormData로 전송
        const files = Array.from(fileInputRef.current?.files ?? []);

        startTransition(async () => {
            try {
                // 1) 이미지 업로드가 필요한 경우(선택): 서버에서 업로드 URL을 발급받아 실제 업로드 후 URL 수집
                // 여기서는 단순화를 위해 images의 url을 현재 프리뷰 URL 대신 빈 문자열로 대체하거나,
                // 서버가 추후 이미지 업로드 절차를 안내한다고 가정한다.
                const payload = {
                    title,
                    content,
                    images: images.map((img) => ({
                        filename: img.filename,
                        size: img.size,
                        mimeType: img.mimeType,
                        url: "", // 실제 저장된 URL은 업로드 후 채우기 (또는 사전 업로드 후 URL 기입)
                    })),
                };

                // 예: 앱의 API 라우트로 POST (실제 엔드포인트 명세에 맞게 조정)
                const res = await createDiary({
                    title, content
                });

                /*if (JSON.stringify(res)) {
                    const text = await res.text().catch(() => "");
                    throw new Error(text || `Failed to create diary (${res.status})`);
                }*/

                setSuccess("일기가 생성되었습니다.");
                setTitle("");
                setContent("");
                setImages([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch (err: any) {
                setError(err?.message || "일기 생성 중 오류가 발생했습니다.");
            }
        });
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.heading}>새 일기 작성</h1>

            <form className={styles.form} onSubmit={onSubmit}>
                {error ? (
                    <div role="alert" className={styles.error}>
                        {error}
                    </div>
                ) : null}
                {success ? (
                    <div role="status" className={styles.success}>
                        {success}
                    </div>
                ) : null}

                <div className={styles.field}>
                    <label htmlFor="title" className={styles.label}>
                        제목
                    </label>
                    <input
                        id="title"
                        name="title"
                        className={styles.input}
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={120}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="content" className={styles.label}>
                        내용
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        className={styles.textarea}
                        placeholder="오늘의 기록을 남겨보세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={8}
                        maxLength={10_000}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="images" className={styles.label}>
                        이미지
                    </label>
                    <input
                        id="images"
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        className={styles.file}
                        ref={fileInputRef}
                        onChange={handleFiles}
                    />
                    {images.length > 0 ? (
                        <ul className={styles.previewList}>
                            {images.map((img, idx) => (
                                <li key={`${img.filename}-${idx}`} className={styles.previewItem}>
                                    {/* 프리뷰 */}
                                    {img.url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={img.url} alt={img.filename} className={styles.previewImg} />
                                    ) : null}
                                    <div className={styles.previewMeta}>
                                        <span className={styles.previewName}>{img.filename}</span>
                                        <span className={styles.previewSize}>
                      {(img.size / 1024).toFixed(1)}KB
                    </span>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => removeImage(idx)}
                                        aria-label={`${img.filename} 삭제`}
                                    >
                                        삭제
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>

                <div className={styles.actions}>
                    <button className={styles.submit} type="submit" disabled={isPending}>
                        {isPending ? "작성 중…" : "작성하기"}
                    </button>
                </div>
            </form>
        </main>
    );
}
