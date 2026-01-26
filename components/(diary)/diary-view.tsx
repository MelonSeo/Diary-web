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

000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000// Define a mapping for emotions to Korean names, emojis, and descriptions
const EMOTION_MAP: {
  [key in keyof typeof Emotion]: {
    name: string;
    emoji: string;
    description: string;
  };
} = {
  JOY: { name: "기쁨", emoji: "😊", description: "매우 긍정적인 감정이 지배적인 하루였네요." },
  SADNESS: { name: "슬픔", emoji: "😥", description: "오늘은 슬픔이 마음을 지배했던 하루였군요." },
  SURPRISE: { name: "놀람", emoji: "😮", description: "예상치 못한 놀라움이 가득했던 하루였습니다." },
  ANGER: { name: "분노", emoji: "😡", description: "화나는 일이 많아 감정적으로 힘든 하루였습니다." },
  FEAR: { name: "두려움", emoji: "😨", description: "불안감이나 두려움이 크게 느껴진 하루였어요." },
  DISGUST: { name: "불쾌함", emoji: "🤢", description: "불쾌하거나 역겨운 감정이 들었던 하루였군요." },
  NEUTRAL: { name: "중립", emoji: "😐", description: "특별한 감정의 기복 없이 평온한 하루를 보냈습니다." },
};

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
        if (diary.emotion && EMOTION_MAP[diary.emotion]) {
          const emotionInfo = EMOTION_MAP[diary.emotion];
          const colorCode = Emotion[diary.emotion] || '#ccc';
          resultContent = (
            <div className={styles.emotionResultCard} style={{ borderColor: colorCode }}>
              <span className={styles.emotionEmoji}>{emotionInfo.emoji}</span>
              <div className={styles.emotionTextContent}>
                <p className={styles.emotionMainText}>
                  <span className={styles.emotionLabel}>{emotionInfo.name}</span>
                </p>
                <p className={styles.emotionDescription}>{emotionInfo.description}</p>
              </div>
            </div>
          );
        } else {
          resultContent = (
            <div className={styles.analysisMessage}>
              <span className={styles.analysisEmoji}>🤔</span>
              <p>분석은 완료되었으나, 감정 데이터를 표시할 수 없습니다.</p>
            </div>
          );
        }
        break;
      case AnalysisStatus.PENDING:
        resultContent = (
          <div className={styles.analysisMessage}>
            <span className={styles.analysisEmoji}>⏳</span>
            <p>일기 분석이 진행 중입니다. 잠시 후 다시 확인해주세요!</p>
          </div>
        );
        break;
      case AnalysisStatus.FAILED:
        resultContent = (
          <div className={styles.analysisMessage}>
            <span className={styles.analysisEmoji}>❌</span>
            <p>감정 분석에 실패했습니다. 다시 시도하거나 관리자에게 문의해주세요.</p>
          </div>
        );
        break;
      default:
        resultContent = (
          <div className={styles.analysisMessage}>
            <span className={styles.analysisEmoji}>❓</span>
            <p>알 수 없는 분석 상태입니다.</p>
          </div>
        );
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
