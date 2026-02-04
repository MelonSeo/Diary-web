import { getDiary } from "@/lib/client-api";
import type { Metadata } from "next";
import { DiaryEntry } from "@/types/diary";
import DiaryView from "@/components/(diary)/diary-view"; // Import the new external component

interface PageProps {
    params: Promise<{ id:string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const { id } = await params;
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
    const { id } = await params;
    
    console.log("DiaryPage id:", id);
    const diary = await getDiary(id);

    const serializableDiary = {
        ...diary,
        diaryId: diary.diaryId.toString(),
    };

    return <DiaryView diary={serializableDiary as DiaryEntry} />;
}

