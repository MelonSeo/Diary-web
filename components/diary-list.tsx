"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { DiaryEntry, PaginatedResponse } from "@/types/diary"
import styles from "@/styles/DiaryDashboard.module.css"

interface DiaryListProps {
    diariesData: PaginatedResponse<DiaryEntry>
    currentPage: number
}

export default function DiaryList({ diariesData, currentPage }: DiaryListProps) {
    const { data: diaries, pagination } = diariesData

    if (diaries.length === 0) {
        return (
            <Card className={styles.emptyCard}>
                <CardContent>
                    <h3 className={styles.emptyTitle}>아직 작성된 일기가 없습니다</h3>
                    <p className={styles.emptyDescription}>첫 번째 일기를 작성해보세요!</p>
                    <Button asChild>
                        <Link href="/diary/new">일기 작성하기</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className={styles.grid}>
                {diaries.map((diary) => (
                    <Card key={diary.id} className={styles.diaryCard}>
                        <CardHeader>
                            <CardTitle className={styles.diaryTitle}>
                                <Link href={`/my-diaries/${diary.id}`}>{diary.title}</Link>
                            </CardTitle>
                            <div className={styles.diaryMeta}>
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(diary.createdAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className={styles.diaryContent}>
                                {diary.content.length > 100 ? `${diary.content.substring(0, 100)}...` : diary.content}
                            </p>
                            {diary.images.length > 0 && (
                                <div className={styles.imagePreview}>
                                    <img
                                        src={diary.images[0].url || "/placeholder.svg"}
                                        alt="일기 이미지"
                                        className={styles.previewImage}
                                    />
                                    {diary.images.length > 1 && <span className={styles.imageCount}>+{diary.images.length - 1}</span>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <Button variant="outline" disabled={currentPage <= 1} asChild={currentPage > 1}>
                        {currentPage > 1 ? (
                            <Link href={`/my-diaries?page=${currentPage - 1}`}>
                                <ChevronLeft className="w-4 h-4" />
                                이전
                            </Link>
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4" />
                                이전
                            </>
                        )}
                    </Button>

                    <span className={styles.pageInfo}>
            {currentPage} / {pagination.totalPages}
          </span>

                    <Button
                        variant="outline"
                        disabled={currentPage >= pagination.totalPages}
                        asChild={currentPage < pagination.totalPages}
                    >
                        {currentPage < pagination.totalPages ? (
                            <Link href={`/my-diaries?page=${currentPage + 1}`}>
                                다음
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                다음
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </>
    )
}
