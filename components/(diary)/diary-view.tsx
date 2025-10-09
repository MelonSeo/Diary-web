"use client";

import React, { useState, useEffect } from 'react';
import styles from '@/styles/DiaryView.module.css';
import DiaryActions from '@/components/(diary)/diary-actions';
import { DiaryEntry } from '@/types/diary';
import { getS3DownloadUrl } from '@/lib/client-api';

interface DiaryViewProps {
  diary: DiaryEntry;
}

export default function DiaryView({ diary }: DiaryViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (diary.imageKey) {
        try {
          setIsLoading(true);
          const { url } = await getS3DownloadUrl(diary.imageKey);
          console.log("S3 download URL:", url);
          setImageUrl(url);
        } catch (err) {
          console.error("Failed to fetch image URL:", err);
          setError("이미지를 불러오는 데 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [diary.imageKey]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{diary.title}</h1>
        <div className={styles.meta}>
          <span>
            작성일: {diary.diaryDate ? new Date(diary.diaryDate).toLocaleDateString("ko-KR") : "날짜 없음"}
          </span>
          <div className={styles.actions}>
            <DiaryActions diaryId={diary.id.toString()} />
          </div>
        </div>
      </header>

      <article className={styles.content}>
        {diary.content}
      </article>

      <section className={styles.imageGallery}>
        {isLoading && (
          <div>
            <h2 className={styles.galleryTitle}>첨부된 이미지</h2>
            <div className={styles.imageWrapper}>
               <div className={styles.image} style={{width: '100%', height: '300px', backgroundColor: '#f0f0f0'}} />
            </div>
          </div>
        )}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {!isLoading && !error && imageUrl && (
          <div>
            <h2 className={styles.galleryTitle}>첨부된 이미지</h2>
            <div className={styles.imageWrapper}>
              <img src={imageUrl} alt={'일기 이미지'} className={styles.image} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
