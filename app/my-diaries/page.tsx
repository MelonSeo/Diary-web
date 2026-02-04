import DiaryList from "@/components/(diary)/diary-list" // 일기 목록 클라이언트 컴포넌트
import { getClientDiaries } from "@/lib/client-api" // 타입 안전한 API 클라이언트
import type { Metadata } from "next" // Next.js 메타데이터 타입
import styles from "@/styles/DiaryDashboard.module.css" // CSS Modules 임포트 (기존 대시보드 스타일 재활용)
import Link from "next/link" // Next.js 링크 컴포넌트 임포트
import { Plus } from "lucide-react" // Plus 아이콘 임포트
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
    searchParams: Promise<{ page?: string }> // URL 쿼리 파라미터 (페이지 번호)
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

    const resolvedSearchParams = await searchParams;
    const currentPage = Number(resolvedSearchParams.page) || 0;

    // 일기 데이터 가져오기
    const diariesData = await getClientDiaries(currentPage, 10);

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
            diaryId: diary.diaryId.toString(),
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