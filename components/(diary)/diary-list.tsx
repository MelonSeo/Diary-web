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
    const { content: diaries, size, hasNext } = diariesData

    if (diaries.length === 0) {
        return (
            <Card className={styles.emptyCard}>
                <CardContent>
                    <h3 className={styles.emptyTitle}>아직 작성된 일기가 없습니다</h3>
                    <p className={styles.emptyDescription}>첫 번째 일기를 작성해보세요!</p>
                    <Button asChild>
                        <Link href="/my-diaries/new">일기 작성하기</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className={styles.grid}>
                {diaries.map((diary) => (
                    <Link href={`/my-diaries/${diary.id}`} key={diary.id as React.Key} className={styles.diaryLink}>
                        <Card className={styles.diaryCard}>
                            <CardHeader>
                                <CardTitle className={styles.diaryTitle}>{diary.title}</CardTitle>
                                <div className={styles.diaryMeta}>
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(diary.diaryDate).toLocaleDateString("ko-KR")}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className={styles.diaryContent}>
                                    {diary.content.length > 100 ? `${diary.content.substring(0, 100)}...` : diary.content}
                                </p>
                                <div className={styles.imagePreview}>
                                    {diary.imageKey ? (
                                        <div className={styles.noImageContainer}>
                                            <span className={styles.noImageText}>Image</span>
                                        </div>
                                    ) : (
                                        <div className={styles.noImageContainer}>
                                            <span className={styles.noImageText}>No Image</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* 페이지네이션 */}
            <div className={styles.pagination}>
                <Button variant="outline" disabled={currentPage <= 0} asChild={currentPage > 0}>
                    {currentPage > 0 ? (
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
            {currentPage + 1}
          </span>

                <Button
                    variant="outline"
                    disabled={!hasNext}
                    asChild={hasNext}
                >
                    {hasNext ? (
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
        </>
    )
}
