import { getDiary } from "@/lib/client-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UpdateDiaryForm from "@/components/(diary)/update-diary-form";
import { DiaryEntry } from "@/types/diary";
import Long from "long";

interface PageProps {
    params: { id: string };
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { id } = await (params as any);
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
    const { id } = await (params as any);

    let diary: DiaryEntry | null = null;
    try {
        diary = await getDiary(id);
    } catch (error) {
        console.warn(`[Dev] API 호출 실패, ${id}에 대한 목업 데이터를 사용합니다.`, error);
        // 개발 모드에서 API 호출 실패 시 목업 데이터 사용
        diary = {
            id: Long.fromString(id),
            title: "테스트 일기 (수정용): 개발 중",
            content: `이것은 개발 환경에서만 보이는 테스트용 일기입니다.\n\nAPI 서버가 실행 중이 아닐 때, 이 데이터가 표시됩니다.\n\n- 목업 데이터는 여러 줄을 가질 수 있습니다.\n- 이미지도 포함할 수 있습니다.`,
            diaryDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
            imageKey: "mock-image-key.jpg", // Updated from images array
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    if (!diary) {
        notFound(); // 데이터가 없으면 404 페이지로 리다이렉트
    }

    const serializableDiary = {
        ...diary,
        id: diary.id.toString(),
        ...(diary.uid && { uid: diary.uid.toString() }),
    };

    return <UpdateDiaryForm initialDiary={serializableDiary as DiaryEntry} />;
}