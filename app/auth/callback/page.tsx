"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/LoginForm.module.css";

/**
 * @file app/auth/callback/page.tsx
 * @description 소셜 로그인 성공 후 최종 처리를 위한 클라이언트 페이지.
 *              로그인 성공 이벤트를 발생시켜 Header 등 다른 컴포넌트에 알리고,
 *              사용자를 최종 목적지로 리디렉션합니다.
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // 로그인 성공 이벤트를 발생시킵니다.
        console.log("[callback]Dispatching loginSuccess event.");
        window.dispatchEvent(new CustomEvent("loginSuccess"));

        // 최종 목적지로 리디렉션합니다.
        const next = searchParams.get("next") || "/";
        router.replace(next);
    }, [router, searchParams]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h1 className={styles.cardTitle}>로그인 완료</h1>
                    <p className={styles.cardDescription}>메인 페이지로 이동합니다!</p>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.loadingSpinner}></div>
                </div>
            </div>
        </div>
    );
}
