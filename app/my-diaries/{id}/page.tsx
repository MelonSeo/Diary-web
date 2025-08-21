import { getDiary } from "@/lib/client-api";
import type { Metadata } from "next";
import { DiaryEntry } from "@/types/diary";
import DiaryView from "@/components/(diary)/diary-view"; // Import the new external component

interface PageProps {
    params: { id: string };
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const diary = await getDiary(params.id);
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
    const { id } = params;
    
    try {
        const diary = await getDiary(id);
        return <DiaryView diary={diary} />;
    } catch (error) {
        console.warn(`[Dev] API 호출 실패, ${id}에 대한 목업 데이터를 사용합니다.`, error);

        const mockDiary: DiaryEntry = {
            id: id,
            title: "테스트 일기: 개발 중",
            content: `이것은 개발 환경에서만 보이는 테스트용 일기입니다.\n\nAPI 서버가 실행 중이 아닐 때, 이 데이터가 표시됩니다.\n\n- 목업 데이터는 여러 줄을 가질 수 있습니다.\n- 이미지도 포함할 수 있습니다.`, 
            images: [
                { id: 'img-1', url: '/placeholder.svg?height=400&width=600&text=Sample+Image+1', filename: 'sample1.jpg', size: 1024, mimeType: 'image/jpeg' },
                { id: 'img-2', url: '/placeholder.svg?height=400&width=600&text=Sample+Image+2', filename: 'sample2.jpg', size: 1024, mimeType: 'image/jpeg' },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return <DiaryView diary={mockDiary} />;
    }
}