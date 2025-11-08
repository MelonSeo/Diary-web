import type { Metadata } from "next";
import CalendarView from "@/components/(calendar)/calendar-view";

export const metadata: Metadata = {
  title: "캘린더 - 나의 일기장",
  description: "월별 일기 기록을 캘린더로 확인하세요.",
};

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth()는 0부터 시작하므로 +1

  const year = Number(resolvedSearchParams.year) || currentYear;
  const month = Number(resolvedSearchParams.month) || currentMonth;

  return <CalendarView initialYear={year} initialMonth={month} />;
}
