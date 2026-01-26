"use client";

import React, { useState, useEffect } from 'react';
import styles from '@/styles/DiaryView.module.css';
import DiaryActions from '@/components/(diary)/diary-actions';
import { DiaryEntry } from '@/types/diary';
import { getS3DownloadUrl } from '@/lib/client-api';
import {AnalysisStatus, Emotion} from '../../types/enums/diary';

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

  const renderAnalysisResult = () => {
    if (!diary.analysisStatus) {
      return null;
    }

    let resultContent;
    switch (diary.analysisStatus) {
      case AnalysisStatus.DONE:
        if (diary.emotion) {
          const colorCode = Emotion[diary.emotion] || '#ccc';
          resultContent = (
            <div className={styles.emotionDisplay}>
              <div className={styles.colorSwatch} style={{ backgroundColor: colorCode }}>
                <span className={styles.emotionName}>{diary.emotion}</span>
              </div>
            </div>
          );
        } else {
          resultContent = <p>분석은 완료되었으나, 감정 데이터를 표시할 수 없습니다. ✅</p>;
        }
        break;
      case AnalysisStatus.PENDING:
        resultContent = <p>감정 분석이 진행 중입니다... 🤔</p>;
        break;
      case AnalysisStatus.FAILED:
        resultContent = <p>감정 분석에 실패했습니다. 😥</p>;
        break;
      default:
        resultContent = <p>알 수 없는 분석 상태입니다.</p>;
    }

    return (
      <section className={styles.analysisSection}>
        <h2 className={styles.analysisTitle}>감정 분석 결과</h2>
        <div className={styles.analysisContent}>
          {resultContent}
        </div>
      </section>
    );
  };


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

      {renderAnalysisResult()}

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
