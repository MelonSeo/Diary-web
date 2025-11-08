import DiaryList from "@/components/(diary)/diary-list" // 일기 목록 클라이언트 컴포넌트
import { getClientDiaries } from "@/lib/client-api" // 타입 안전한 API 클라이언트
import type { Metadata } from "next" // Next.js 메타데이터 타입
import styles from "@/styles/DiaryDashboard.module.css" // CSS Modules 임포트 (기존 대시보드 스타일 재활용)
import Link from "next/link" // Next.js 링크 컴포넌트 임포트
import { Plus } from "lucide-react" // Plus 아이콘 임포트
import Long from "long";
import {PaginatedResponse, DiaryEntry} from "@/types/diary";

/**
 * @file app/my-diaries/page.tsx
 * @description 사용자 일기 목록 페이지의 Next.js Server Component.
 *              일기 데이터를 미리 가져와 렌더링합니다.
 *              이 페이지는 로그인된 사용자만 접근할 수 있습니다.
 */

// 페이지의 메타데이터 정의
export const metadata: Metadata = {
    title: "내 일기장 목록 - 나의 일기장",
    description: "나의 소중한 일기들을 확인하고 관리하세요.",
}

interface PageProps {
    searchParams: { page?: string } // URL 쿼리 파라미터 (페이지 번호)
}

/**
 * @function getDiaries
 * @description 서버에서 일기 데이터를 가져오는 비동기 함수.
 *              API 서버 연결 실패 시 목업 데이터를 반환하여 개발 편의성을 높입니다.
 * @param {number} page - 현재 페이지 번호 (1부터 시작).
 * @returns {Promise<PaginatedResponse<DiaryEntry>>} - 페이지네이션된 일기 데이터.
 */
async function getDiaries(page: number): Promise<PaginatedResponse<DiaryEntry>> {
    try {
        return await getClientDiaries(page, 10)
    } catch (error) {
        console.warn("API 서버 연결 실패, 목업 데이터 사용:", error)

        // API 서버 연결 실패 시 목업 데이터 반환
        return {
            content: Array.from({ length: 8 }, (_, i) => ({
                id: Long.fromNumber(i + 1),
                title: `샘플 일기 ${i + 1}`,
                content: `이것은 ${i + 1}번째 샘플 일기입니다. CSS Modules로 스타일링되었습니다.`,
                images:
                    i % 3 === 0
                        ? [
                            {
                                id: Long.fromNumber(i),
                                url: "/placeholder.svg?height=200&width=300&text=Sample Image", // 플레이스홀더 이미지
                                filename: "sample.jpg",
                                size: 1024,
                                mimeType: "image/jpeg",
                            },
                        ]
                        : [],
                createdAt: new Date(Date.now() - i * 86400000).toISOString(), // 생성 날짜 (과거로 갈수록 오래된 일기)
                updatedAt: new Date(Date.now() - i * 86400000).toISOString(), // 업데이트 날짜
                diaryDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], // 일기 날짜 (YYYY-MM-DD)
            })),
            page: page,
            size: 10,
            hasNext: page < 1, // 목업 데이터는 2페이지까지만 있다고 가정 (0-indexed이므로 page < 1은 0페이지만 존재)
        }
    }
}

/**
 * @function MyDiariesPage
 * @description 내 일기장 목록 페이지의 Server Component.
 *              일기 데이터 로딩 및 UI 컴포넌트 렌더링을 담당합니다.
 * @param {PageProps} { searchParams } - URL 쿼리 파라미터
 */
export default async function MyDiariesPage({ searchParams }: PageProps) {
    // 이 페이지는 이미 로그인된 상태에서 접근한다고 가정합니다.
    // 만약 직접 접근 시 로그인 체크가 필요하다면, app/page.tsx와 유사한 로직을 추가할 수 있습니다.

    const currentPage = Number(searchParams.page) || 0;

    // 일기 데이터 가져오기
    const diariesData = await getDiaries(currentPage);

    // 데이터가 유효하지 않은 경우 에러 메시지 표시
    if (!diariesData || !diariesData.content) {
        return (
            <div className={styles.container}>
                <main className={styles.mainContent}>
                    <div className={styles.headerSection}>
                        <div>
                            <h1 className={styles.titleSectionH1}>내 일기장</h1>
                            <p className={styles.titleSectionP}>나의 소중한 순간들을 기록해보세요</p>
                        </div>
                        <Link href="/my-diaries/new" className={styles.newDiaryButton}>
                            <Plus className={styles.newDiaryButtonIcon} />새 일기 작성
                        </Link>
                    </div>
                    <div className={styles.emptyCard}> {/* Reusing empty card style for error */}
                        <h3 className={styles.emptyTitle}>일기를 불러오는 데 실패했습니다.</h3>
                        <p className={styles.emptyDescription}>잠시 후 다시 시도해주세요.</p>
                    </div>
                </main>
            </div>
        );
    }

    // 클라이언트 컴포넌트로 전달하기 전, Long 타입을 string으로 변환
    const serializableDiariesData = {
        ...diariesData,
        content: diariesData.content.map(diary => ({
            ...diary,
            id: diary.id.toString(),
            images: (diary.images || []).map(img => ({
                ...img,
                id: img.id.toString(),
            })),
            // uid가 있다면 변환
            ...(diary.uid && { uid: diary.uid.toString() }),
        })),
    };

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.headerSection}>
                    <div>
                        <h1 className={styles.titleSectionH1}>내 일기장</h1>
                        <p className={styles.titleSectionP}>나의 소중한 순간들을 기록해보세요</p>
                    </div>
                    {/* 일기 작성 버튼 */}
                    <Link href="/my-diaries/new" className={styles.newDiaryButton}>
                        <Plus className={styles.newDiaryButtonIcon} />새 일기 작성
                    </Link>
                </div>

                {/* 일기 목록 컴포넌트 (클라이언트 컴포넌트) */}
                <DiaryList diariesData={serializableDiariesData} currentPage={currentPage} />
            </main>
        </div>
    );
}