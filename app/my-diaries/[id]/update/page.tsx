import { getDiary } from "@/lib/client-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UpdateDiaryForm from "@/components/(diary)/update-diary-form";
import { DiaryEntry } from "@/types/diary";

interface PageProps {
    params: Promise<{ id: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const diary = await getDiary(id);
        return {
            title: `일기 수정: ${diary.title} - 나의 일기장`,
            description: `일기 '${diary.title}'을(를) 수정합니다.`,
        };
    } catch (error) {
        return {
            title: "일기를 찾을 수 없음",
            description: "수정할 일기를 찾을 수 없습니다.",
        };
    }
}

export default async function UpdateDiaryPage({ params }: PageProps) {
    const { id } = await params;

    const diary = await getDiary(id);

    if (!diary) {
        notFound(); // 데이터가 없으면 404 페이지로 리다이렉트
    }

    const serializableDiary = {
        ...diary,
        diaryId: diary.diaryId.toString(),
    };

    return <UpdateDiaryForm initialDiary={serializableDiary as DiaryEntry} />;
}