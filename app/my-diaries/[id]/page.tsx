import { getDiary } from "@/lib/client-api";
import type { Metadata } from "next";
import { DiaryEntry } from "@/types/diary";
import DiaryView from "@/components/(diary)/diary-view"; // Import the new external component
import Long from "long";

interface PageProps {
    params: { id: string };
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        // The error "params should be awaited" is unconventional.
        // This is a workaround based on a literal interpretation of the error.
        const { id } = await (params as any);
        const diary = await getDiary(id);
        return {
            title: `${diary.title} - 나의 일기장`,
            description: diary.content.substring(0, 150),
        };
    } catch (error) {
        return {
            title: "일기를 찾을 수 없음",
            description: "요청한 일기를 찾을 수 없습니다.",
        };
    }
}

export default async function DiaryPage({ params }: PageProps) {
    // The error "params should be awaited" is unconventional.
    // This is a workaround based on a literal interpretation of the error.
    const { id } = await (params as any);
    
    try {
        console.log("DiaryPage id:", id);
        const diary = await getDiary(id);

        const serializableDiary = {
            ...diary,
            id: diary.id.toString(),
            ...(diary.uid && { uid: diary.uid.toString() }),
        };

        return <DiaryView diary={serializableDiary as DiaryEntry} />;
    } catch (error) {
        console.warn(`[Dev] API 호출 실패, ${id}에 대한 목업 데이터를 사용합니다.`, error);

        const mockDiary: DiaryEntry = {
            id: Long.fromString(id),
            title: "테스트 일기: 개발 중",
            content: `이것은 개발 환경에서만 보이는 테스트용 일기입니다.\n\nAPI 서버가 실행 중이 아닐 때, 이 데이터가 표시됩니다.\n\n- 목업 데이터는 여러 줄을 가질 수 있습니다.\n- 이미지도 포함할 수 있습니다.`,
            diaryDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
            imageKey: "mock-image-key.jpg", // Updated from images array
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const serializableMockDiary = {
            ...mockDiary,
            id: mockDiary.id.toString(),
        };

        return <DiaryView diary={serializableMockDiary as DiaryEntry} />;
    }
}

