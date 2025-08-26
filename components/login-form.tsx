"use client"

import {useEffect, useTransition} from "react";
import styles from "@/styles/LoginForm.module.css";
import {signIn} from "next-auth/react";

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
                        onClick={handleKakaoLogin}
                        disabled={isPending}
                        className={`${styles.loginButton} ${styles.kakaoButton}`}
                    >
                        {isPending ? "연결 중..." : <img src="/images/kakao_login_button.png" alt="카카오 로그인" className={styles.socialImage} />}
                    </button>

                    {/* 구글 로그인 버튼 */}
                    <button 
                        className={styles.googleButton}
                        onClick={() => signIn("google")} 
                        type="button"
                        disabled={isPending}
                    >
                        <svg version="1.1" viewBox="0 0 48 48" className={styles.googleIcon} role="img" aria-hidden="true" focusable="false">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        <span className={styles.buttonText}>Sign in with Google</span>
                    </button>
                </div>
            </div>
        </div>
    )
}