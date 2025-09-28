"use client";

import React from 'react';
import styles from '@/styles/DiaryView.module.css';
import DiaryActions from '@/components/(diary)/diary-actions';
import { DiaryEntry } from '@/types/diary';

interface DiaryViewProps {
  diary: DiaryEntry;
}

export default function DiaryView({ diary }: DiaryViewProps) {
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

      {diary.images && diary.images.length > 0 && (
        <section className={styles.imageGallery}>
          <h2 className={styles.galleryTitle}>첨부된 이미지</h2>
          <div className={styles.imageList}>
            {diary.images.map(image => (
              <div key={image.id.toString()} className={styles.imageWrapper}>
                <img src={image.url} alt={image.filename || '일기 이미지'} className={styles.image} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
