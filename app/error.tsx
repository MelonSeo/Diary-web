"use client" // 이 파일은 클라이언트 컴포넌트임을 명시

import { useEffect } from "react"
import { Button } from "@/components/ui/button" // shadcn/ui 버튼 컴포넌트
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // shadcn/ui 카드 컴포넌트
// import { useToast } from "@/hooks/use-toast" // useToast 훅 임포트 제거

/**
 * @file app/error.tsx
 * @description Next.js App Router의 에러 바운더리 컴포넌트.
 *              하위 컴포넌트에서 발생한 클라이언트 사이드 런타임 에러를 포착하고,
 *              사용자에게 친화적인 에러 메시지를 표시하며 복구 옵션을 제공합니다.
 */

interface ErrorProps {
    error: Error & { digest?: string } // 발생한 에러 객체 (Next.js에서 제공)
    reset: () => void // 에러 바운더리를 재설정하여 앱을 다시 렌더링하는 함수
}

/**
 * @function Error
 * @description 전역 에러를 처리하고 사용자에게 피드백을 제공하는 클라이언트 컴포넌트.
 * @param {ErrorProps} { error, reset } - 에러 객체와 재설정 함수
 */
export default function Error({ error, reset }: ErrorProps) {
    // const { toast } = useToast() // useToast 훅 호출 제거

    // 1. 에러 로깅: 개발자가 에러를 추적하고 디버깅할 수 있도록 콘솔에 에러를 기록
    useEffect(() => {
        console.error("Application error:", error)
        // 토스트 알림 표시 로직 제거
        // const displayMessage = error.message.includes("API_SERVER_UNAVAILABLE")
        //   ? "API 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
        //   : "예상치 못한 오류가 발생했습니다."

        // toast({
        //   title: "오류 발생",
        //   description: displayMessage,
        //   variant: "destructive",
        // })
    }, [error]) // toast 의존성 제거

    // 2. 사용자에게 표시될 에러 메시지 결정
    const displayMessage = error.message.includes("API_SERVER_UNAVAILABLE")
        ? "API 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
        : "예상치 못한 오류가 발생했습니다."

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-red-600">오류가 발생했습니다</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">{displayMessage}</p>
                    <div className="flex gap-2">
                        {/* 다시 시도 버튼: reset 함수를 호출하여 에러 바운더리 재설정 */}
                        <Button onClick={reset} className="flex-1">
                            다시 시도
                        </Button>
                        {/* 홈으로 이동 버튼: 페이지를 새로고침하여 홈으로 이동 */}
                        <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
                            홈으로
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
