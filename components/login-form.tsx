"use client"

import {useEffect, useTransition} from "react";
import styles from "@/styles/LoginForm.module.css";

declare global {
    interface Window {
        Kakao: any;
    }
}

interface LoginFormProps {
    errorMessage?: string | null;
}

export default function LoginForm({errorMessage}: LoginFormProps) {

    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        console.log('window.Kakao: ', window.Kakao);
        if (window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
                console.log('Kakao Init: ', window.Kakao.isInitialized());
            }
        }
    }, []);

    useEffect(() => {
        if (window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
                console.log('Kakao Init: ', window.Kakao.isInitialized());
            }
        }
    }, [window.Kakao]);

    const handleKakaoLogin = () => {
        startTransition(() => {
            if (typeof window !== "undefined" && window.Kakao?.isInitialized()) {
                const redirectUri = process.env.NEXT_PUBLIC_KAKAO_LOGIN_REDIRECT_URI
                if (!redirectUri) {
                    console.error("NEXT_PUBLIC_KAKAO_REDIRECT_URI is not set.")
                    return;
                }

                window.Kakao.Auth.authorize({
                    redirectUri: redirectUri,
                })
            } else {
                console.error("Kakao SDK is not init.");
            }
        })
    }

    return (
        // CSS Modules를 사용하여 최상위 컨테이너 스타일 적용
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h1 className={styles.cardTitle}>나의 일기장</h1>
                    <p className={styles.cardDescription}>소셜 로그인으로 간편하게 시작하세요</p>
                </div>

                <div className={styles.cardContent}>
                    {/* 에러 메시지 표시: errorMessage prop이 있을 경우에만 렌더링 */}
                    {errorMessage && (
                        <div className={styles.errorMessage}>
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {/* 카카오 로그인 버튼 */}
                    <button
                        onClick={handleKakaoLogin} // 클릭 이벤트 핸들러
                        disabled={isPending} // 전환(transition)이 보류 중일 때 버튼 비활성화
                        // CSS Modules 클래스 적용: 기본 버튼 스타일, 카카오 버튼 스타일, 로딩 상태 스타일
                        className={`${styles.loginButton} ${styles.kakaoButton} ${isPending ? styles.loading : ""}`}
                    >
                        {isPending ? "연결 중..." : "카카오톡으로 로그인"} {/* 로딩 상태에 따라 텍스트 변경 */}
                    </button>

                    {/* 구글 로그인 버튼 */}
                    {/*<button
                        onClick={handleGoogleLogin} // 클릭 이벤트 핸들러
                        disabled={isPending} // 전환(transition)이 보류 중일 때 버튼 비활성화
                        // CSS Modules 클래스 적용: 기본 버튼 스타일, 구글 버튼 스타일, 로딩 상태 스타일
                        className={`${styles.loginButton} ${styles.googleButton} ${isPending ? styles.loading : ""}`}
                    >
                        {isPending ? "연결 중..." : "구글로 로그인"}  로딩 상태에 따라 텍스트 변경
                    </button>*/}
                </div>
            </div>
        </div>
    )
}