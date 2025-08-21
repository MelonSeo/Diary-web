"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "@/styles/LoginForm.module.css" // 로딩 UI를 위해 기존 로그인 폼 스타일 재활용

/**
 * @file app/auth/kakao-login-handler/page.tsx
 * @description 카카오 OAuth 인증 후 리다이렉트되는 클라이언트 사이드 핸들러 페이지.
 *              URL에서 인가 코드를 추출하여 Next.js 서버의 `/api/auth/kakao-process` API Route로 전송합니다.
 *              이 API Route는 카카오 인증 서버와 직접 통신하여 토큰을 교환하고 사용자 정보를 가져온 후,
 *              이를 Spring Boot 백엔드로 전송하여 최종 인증을 완료하고 JWT 토큰을 쿠키에 설정합니다.
 */
export default function KakaoLoginHandlerPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleKakaoAuth = async () => {
            const code = searchParams.get("code")
            const authError = searchParams.get("error")
            const errorDescription = searchParams.get("error_description")

            if (authError) {
                console.error("Kakao OAuth error:", authError, errorDescription)
                setError(`카카오 로그인 실패: ${errorDescription || authError}`)
                setLoading(false)
                // 에러 발생 시 로그인 페이지로 리다이렉트
                router.replace(`/login?error=kakao_oauth_failed&message=${encodeURIComponent(errorDescription || authError)}`)
                return
            }

            if (code) {
                try {
                    // Next.js 서버의 API Route로 인가 코드 전송
                    const response = await fetch("/api/auth/kakao-process", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ code }),
                    })

                    if (!response.ok) {
                        const errorData = await response.json()
                        console.error("Failed to process Kakao login on server:", response.status, errorData)
                        setError(errorData.error || "카카오 로그인 처리 중 오류가 발생했습니다.")
                        setLoading(false)
                        router.replace(
                            `/login?error=kakao_process_failed&message=${encodeURIComponent(errorData.error || "알 수 없는 오류")}`,
                        )
                        return
                    }

                    // 성공적으로 처리되면 콜백 페이지로 리다이렉트
                    console.log("Kakao login successful, redirecting to callback page.")
                    router.replace("/auth/callback")
                } catch (err) {
                    console.error("Network or unexpected error during Kakao login process:", err)
                    setError("네트워크 오류 또는 예상치 못한 오류가 발생했습니다.")
                    setLoading(false)
                    router.replace(`/login?error=network_error&message=${encodeURIComponent("네트워크 오류")}`)
                }
            } else {
                setError("카카오 인가 코드를 찾을 수 없습니다.")
                setLoading(false)
                router.replace(`/login?error=no_kakao_code`)
            }
        }

        handleKakaoAuth()
    }, [searchParams, router])

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h1 className={styles.cardTitle}>카카오 로그인 처리 중...</h1>
                        <p className={styles.cardDescription}>잠시만 기다려 주세요.</p>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.loadingSpinner}></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h1 className={styles.cardTitle}>로그인 처리 결과</h1>
                </div>
                <div className={styles.cardContent}>
                    {error ? (
                        <div className={styles.errorMessage}>
                            <p>{error}</p>
                            <button onClick={() => router.replace("/login")} className={styles.loginButton}>
                                로그인 페이지로 돌아가기
                            </button>
                        </div>
                    ) : (
                        <div className={styles.successMessage}>
                            <p>로그인 성공! 메인 페이지로 이동합니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
