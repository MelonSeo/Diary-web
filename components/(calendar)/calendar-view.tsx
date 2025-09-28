"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from '@/styles/CalendarView.module.css'; // CSS Module은 나중에 생성

interface CalendarViewProps {
  initialYear: number;
  initialMonth: number; // 1-indexed month
}

export default function CalendarView({ initialYear, initialMonth }: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth - 1, 1));

  useEffect(() => {
    // URL이 변경될 때마다 currentYear, currentMonth를 업데이트
    setCurrentDate(new Date(initialYear, initialMonth - 1, 1));
  }, [initialYear, initialMonth]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(year, month - 1, 1);
    router.push(`/calendar?year=${prevMonthDate.getFullYear()}&month=${prevMonthDate.getMonth() + 1}`);
  };

  const handleNextMonth = () => {
    const nextMonthDate = new Date(year, month + 1, 1);
    router.push(`/calendar?year=${nextMonthDate.getFullYear()}&month=${nextMonthDate.getMonth() + 1}`);
  };

  // 현재 월의 첫 날과 마지막 날 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const numDaysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const days = [];
  // 이전 달의 빈 칸 채우기
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(<div key={`empty-prev-${i}`} className={styles.emptyDay}></div>);
  }

  // 현재 달의 날짜 채우기
  for (let i = 1; i <= numDaysInMonth; i++) {
    const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    // TODO: 여기에 일기 데이터 (색상, 존재 여부)를 기반으로 스타일링 추가
    days.push(
      <div key={dateString} className={styles.day}>
        {i}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={handlePrevMonth}>
          <ChevronLeft />
        </Button>
        <h2 className={styles.monthYear}>{year}년 {month + 1}월</h2>
        <Button variant="ghost" onClick={handleNextMonth}>
          <ChevronRight />
        </Button>
      </header>
      <div className={styles.calendarGrid}>
        <div className={styles.weekdays}>
          <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
        </div>
        <div className={styles.daysGrid}>
          {days}
        </div>
      </div>
    </div>
  );
}
